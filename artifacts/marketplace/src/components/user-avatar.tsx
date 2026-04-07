import { useState, useRef } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useUserAuth } from "@/contexts/user-auth";
import { useToast } from "@/hooks/use-toast";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm:  { outer: "w-8 h-8",   text: "text-xs" },
  md:  { outer: "w-10 h-10", text: "text-sm" },
  lg:  { outer: "w-14 h-14", text: "text-lg" },
  xl:  { outer: "w-20 h-20", text: "text-2xl" },
};

export function UserAvatar({ avatarUrl, name, size = "md", className = "" }: UserAvatarProps) {
  const s = sizes[size];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  return (
    <div className={`${s.outer} rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span className={`${s.text} font-bold text-primary select-none`}>{initials || "?"}</span>
      )}
    </div>
  );
}

interface AvatarUploadProps {
  onUploaded?: (avatarUrl: string | null) => void;
}

export function AvatarUpload({ onUploaded }: AvatarUploadProps) {
  const { user, token, updateUser } = useUserAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  async function handleFile(file: File) {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Ongeldig bestandstype", description: "Alleen JPEG en PNG zijn toegestaan.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("avatar", file);
      const res = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Upload mislukt", description: data.error ?? "Probeer het opnieuw.", variant: "destructive" });
        return;
      }
      updateUser({ avatarUrl: data.avatarUrl });
      onUploaded?.(data.avatarUrl);
      toast({ title: "Avatar opgeslagen" });
    } catch {
      toast({ title: "Upload mislukt", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch("/api/auth/avatar", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { toast({ title: "Verwijderen mislukt", variant: "destructive" }); return; }
      updateUser({ avatarUrl: null });
      onUploaded?.(null);
      toast({ title: "Avatar verwijderd" });
    } catch {
      toast({ title: "Verwijderen mislukt", variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="flex items-center gap-5">
      <div className="relative">
        <UserAvatar avatarUrl={user.avatarUrl} name={user.contactName} size="xl" />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
          title="Avatar wijzigen"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="text-sm font-medium text-primary hover:underline disabled:opacity-50 text-left"
        >
          {uploading ? "Uploaden..." : "Foto uploaden"}
        </button>
        <p className="text-xs text-muted-foreground">JPEG of PNG, wordt bijgesneden naar 400×400 px</p>
        {user.avatarUrl && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50 text-left"
          >
            <Trash2 className="w-3 h-3" />
            {removing ? "Verwijderen..." : "Avatar verwijderen"}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
    </div>
  );
}
