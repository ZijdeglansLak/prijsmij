import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserAuth } from "@/contexts/user-auth";
import { Upload, X, Trash2, Check, ImagePlus } from "lucide-react";

interface LibraryIcon {
  id: number;
  name: string;
  type: "emoji" | "image";
  value: string | null;
  url: string | null;
}

export function IconDisplay({ value, size = "md" }: { value: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xl" : size === "lg" ? "w-14 h-14 text-4xl" : "w-10 h-10 text-2xl";
  if (!value) return <div className={`${sizeClass} rounded bg-muted flex items-center justify-center text-muted-foreground text-sm`}>?</div>;
  const isImage = value.startsWith("/") || value.startsWith("http");
  if (isImage) {
    const src = value.startsWith("/api/storage") ? value : `/api/storage${value}`;
    const imgSize = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-14 h-14" : "w-10 h-10";
    return <img src={src} alt="" className={`${imgSize} object-contain rounded`} />;
  }
  return <span className={`${sizeClass} flex items-center justify-center leading-none`}>{value}</span>;
}

interface IconPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function IconPicker({ value, onChange, label = "Icoon" }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [library, setLibrary] = useState<LibraryIcon[]>([]);
  const [emojiInput, setEmojiInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const { token } = useUserAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) loadLibrary();
  }, [open]);

  async function loadLibrary() {
    try {
      const res = await fetch("/api/admin/icon-library", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLibrary(await res.json());
    } catch {}
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setUploadName(f.name.replace(/\.[^.]+$/, ""));
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const urlRes = await fetch("/api/admin/icon-library/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: uploadName || selectedFile.name, contentType: selectedFile.type, size: selectedFile.size }),
      });
      if (!urlRes.ok) { alert("Kon upload URL niet aanmaken"); return; }
      const { uploadURL } = await urlRes.json();

      const putRes = await fetch(uploadURL, { method: "PUT", body: selectedFile, headers: { "Content-Type": selectedFile.type } });
      if (!putRes.ok) { alert("Upload mislukt"); return; }

      const saveRes = await fetch("/api/admin/icon-library", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: uploadName || selectedFile.name, objectPath: uploadURL, type: "image" }),
      });
      if (saveRes.ok) {
        const saved = await saveRes.json();
        setLibrary(prev => [saved, ...prev]);
        setSelectedFile(null); setPreviewUrl(null); setUploadName("");
        if (fileRef.current) fileRef.current.value = "";
      }
    } catch { alert("Upload fout"); }
    finally { setUploading(false); }
  }

  async function addEmoji() {
    const em = emojiInput.trim();
    if (!em) return;
    try {
      const res = await fetch("/api/admin/icon-library", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: em, type: "emoji", emoji: em }),
      });
      if (res.ok) {
        const saved = await res.json();
        setLibrary(prev => [...prev, saved]);
      }
    } catch {}
    onChange(em);
    setEmojiInput("");
    setOpen(false);
  }

  async function handleDelete(id: number) {
    setDeleting(id);
    try {
      await fetch(`/api/admin/icon-library/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      setLibrary(prev => prev.filter(i => i.id !== id));
    } finally { setDeleting(null); }
  }

  function selectIcon(icon: LibraryIcon) {
    onChange(icon.type === "emoji" ? (icon.value ?? "") : (icon.value ?? ""));
    setOpen(false);
  }

  const emojiIcons = library.filter(i => i.type === "emoji");
  const imageIcons = library.filter(i => i.type === "image");

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
          <IconDisplay value={value} size="md" />
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
          <ImagePlus className="w-3.5 h-3.5 mr-1" /> Kies icoon
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")} className="text-muted-foreground px-2">
            <X className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-lg">Icoon kiezen</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* Emoji library */}
              {emojiIcons.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-3">Emoji iconen ({emojiIcons.length})</p>
                  <div className="grid grid-cols-8 gap-2">
                    {emojiIcons.map(icon => (
                      <div key={icon.id} className="group relative">
                        <button
                          onClick={() => selectIcon(icon)}
                          className={`w-full aspect-square border-2 rounded-xl flex items-center justify-center text-2xl hover:border-primary transition-colors bg-muted/10 ${value === icon.value ? "border-primary bg-primary/10" : "border-transparent"}`}
                          title={icon.name}
                        >
                          {icon.value}
                        </button>
                        <p className="text-[9px] text-center text-muted-foreground mt-0.5 truncate">{icon.name}</p>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(icon.id); }}
                          disabled={deleting === icon.id}
                          className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 flex items-center justify-center"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add custom emoji */}
              <div className={emojiIcons.length > 0 ? "border-t pt-5" : ""}>
                <p className="text-sm font-semibold mb-2">Andere emoji gebruiken</p>
                <div className="flex gap-2">
                  <Input
                    value={emojiInput}
                    onChange={e => setEmojiInput(e.target.value)}
                    placeholder="🛒"
                    className="w-20 text-2xl text-center"
                    maxLength={4}
                  />
                  <Button size="sm" onClick={addEmoji} disabled={!emojiInput.trim()}>
                    <Check className="w-3.5 h-3.5 mr-1" /> Gebruik & bewaar
                  </Button>
                </div>
              </div>

              {/* Image upload */}
              <div className="border-t pt-5">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Afbeelding uploaden
                </p>
                <div className="flex flex-wrap gap-3 items-end">
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="icon-upload" />
                    <label htmlFor="icon-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-muted transition-colors">
                      <Upload className="w-4 h-4" /> Bestand kiezen
                    </label>
                  </div>
                  {previewUrl && (
                    <div className="flex items-center gap-3">
                      <img src={previewUrl} alt="" className="w-12 h-12 object-contain border rounded-lg" />
                      <Input value={uploadName} onChange={e => setUploadName(e.target.value)} placeholder="Naam" className="w-36" />
                      <Button size="sm" onClick={handleUpload} disabled={uploading}>
                        {uploading ? "Uploaden..." : "Uploaden"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Image library */}
              {imageIcons.length > 0 && (
                <div className="border-t pt-5">
                  <p className="text-sm font-semibold mb-3">Afbeeldingen bibliotheek ({imageIcons.length})</p>
                  <div className="grid grid-cols-5 gap-3">
                    {imageIcons.map(icon => (
                      <div key={icon.id} className="group relative">
                        <button
                          onClick={() => selectIcon(icon)}
                          className={`w-full aspect-square border-2 rounded-xl overflow-hidden flex items-center justify-center p-1 transition-colors bg-muted/20 ${value === icon.value ? "border-primary" : "border-transparent hover:border-primary/50"}`}
                          title={icon.name}
                        >
                          <img src={icon.url!} alt={icon.name} className="max-w-full max-h-full object-contain" />
                        </button>
                        <p className="text-[10px] text-center text-muted-foreground mt-1 truncate">{icon.name}</p>
                        <button
                          onClick={e => { e.stopPropagation(); handleDelete(icon.id); }}
                          disabled={deleting === icon.id}
                          className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
