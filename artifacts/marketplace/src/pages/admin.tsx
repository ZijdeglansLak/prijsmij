import { useState, useEffect, useCallback, useMemo } from "react";
import { marked } from "marked";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Trash2, Users, ShieldCheck, Store, ShoppingBag, ChevronDown, ChevronUp, Key, User2, WifiOff, Wifi, Pencil, X, Check, Download, Search, Eye, EyeOff, Coins, CreditCard, RefreshCw, CheckCircle, Clock, XCircle, AlertCircle, ChevronRight, Loader2, FileText, BookOpen, ScrollText, ChevronsUpDown } from "lucide-react";
import { useI18n, type Language } from "@/contexts/i18n";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { Badge } from "@/components/ui/badge";
import { IconPicker, IconDisplay } from "@/components/icon-picker";

type Tab = "categories" | "users" | "settings" | "payments" | "bundles" | "pages" | "kennisbank" | "logs";

interface UserRecord {
  id: number;
  role: "buyer" | "seller";
  contactName: string;
  storeName?: string | null;
  email: string;
  credits: number;
  isAdmin: boolean;
  emailVerified: boolean;
  username?: string | null;
  isSuspended: boolean;
  createdAt: string;
}

export default function Admin() {
  const { isLoggedIn, isAdmin } = useUserAuth();
  const [, setLocation] = useLocation();

  if (!isLoggedIn) {
    setLocation("/auth/login");
    return null;
  }
  if (!isAdmin) {
    setLocation("/");
    return null;
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("categories");

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-extrabold">Beheer</h1>
          </div>
          <Link href="/supplier/credits">
            <Button variant="outline" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Credits kopen
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setTab("categories")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "categories" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <Settings className="w-4 h-4" /> Categorieën
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "users" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <Users className="w-4 h-4" /> Gebruikers
          </button>
          <button
            onClick={() => setTab("settings")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "settings" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <WifiOff className="w-4 h-4" /> Instellingen
          </button>
          <button
            onClick={() => setTab("payments")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "payments" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <CreditCard className="w-4 h-4" /> Betalingen
          </button>
          <button
            onClick={() => setTab("bundles")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "bundles" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <Coins className="w-4 h-4" /> Bundels
          </button>
          <button
            onClick={() => setTab("kennisbank")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "kennisbank" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <BookOpen className="w-4 h-4" /> Kennisbank
          </button>
          <button
            onClick={() => setTab("pages")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "pages" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <FileText className="w-4 h-4" /> Pagina's
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors -mb-px ${tab === "logs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`}
          >
            <ScrollText className="w-4 h-4" /> Logboek
          </button>
        </div>

        {tab === "categories" && <CategoriesTab />}
        {tab === "users" && <UsersTab />}
        {tab === "settings" && <SettingsTab />}
        {tab === "payments" && <PaymentsTab />}
        {tab === "bundles" && <BundelsTab />}
        {tab === "kennisbank" && <KennisbankTab />}
        {tab === "pages" && <PaginasTab />}
        {tab === "logs" && <LogboekTab />}
      </div>
    </Layout>
  );
}

type CategoryFieldType = "text" | "number" | "select" | "textarea" | "boolean";

interface CategoryField {
  key: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

interface CategoryGroup {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
  activeRequestCount: number;
  groupId?: number | null;
  fields: CategoryField[];
}

function CategoriesTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryRecord[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [showGroupManager, setShowGroupManager] = useState(false);

  // New category form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  function loadGroups() {
    fetch("/api/category-groups")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setGroups(d); })
      .catch(() => {});
  }

  useEffect(() => {
    fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setCategories(d))
      .catch(() => toast({ title: "Fout bij laden categorieën", variant: "destructive" }));
    loadGroups();
  }, [token]);

  async function handleUpdate(id: number, updates: Partial<CategoryRecord>) {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) { toast({ title: "Fout bij opslaan", variant: "destructive" }); return; }
      const updated = await res.json();
      setCategories(prev => prev?.map(c => c.id === id ? { ...c, ...updated } : c) ?? null);
      toast({ title: "Categorie bijgewerkt" });
      setEditingId(null);
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    } finally { setSaving(null); }
  }

  async function handleCreate() {
    if (!name || !slug || !icon || !description) {
      toast({ title: "Vul alle velden in", variant: "destructive" }); return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, slug, icon, description, fields: [] }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout bij aanmaken", variant: "destructive" }); return; }
      setCategories(prev => [...(prev ?? []), { ...data, activeRequestCount: 0 }]);
      toast({ title: "Categorie aangemaakt" });
      setIsAdding(false); setName(""); setSlug(""); setIcon(""); setDescription("");
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    } finally { setAdding(false); }
  }

  if (!categories) return <p className="text-muted-foreground py-8 text-center">Laden...</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Categorieën ({categories.length})</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" /> Nieuwe categorie
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card p-6 rounded-2xl border border-primary/30 shadow-lg mb-8">
          <h3 className="text-lg font-bold mb-4">Nieuwe categorie toevoegen</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs font-bold mb-1 block">Naam</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="text-xs font-bold mb-1 block">Slug</label><Input value={slug} onChange={e => setSlug(e.target.value)} placeholder="bijv. elektronica" /></div>
            <div><IconPicker value={icon} onChange={setIcon} label="Icoon" /></div>
            <div><label className="text-xs font-bold mb-1 block">Beschrijving</label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={adding}>{adding ? "Aanmaken..." : "Aanmaken"}</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Annuleren</Button>
          </div>
        </div>
      )}

      {/* Category Groups Manager */}
      <div className="mb-8 border border-border rounded-2xl overflow-hidden">
        <button
          onClick={() => setShowGroupManager(!showGroupManager)}
          className="w-full flex justify-between items-center px-5 py-4 bg-muted/40 hover:bg-muted/70 transition-colors text-left"
        >
          <span className="font-semibold text-sm flex items-center gap-2">
            <span>📁</span> Categorie-groepen beheren ({groups.length} groepen)
          </span>
          <span className="text-muted-foreground text-xs">{showGroupManager ? "▲" : "▼"}</span>
        </button>
        {showGroupManager && (
          <CategoryGroupManager token={token} groups={groups} onGroupsChange={(g) => { setGroups(g); loadGroups(); }} />
        )}
      </div>

      <div className={`grid gap-4 ${editingId !== null ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"}`}>
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            groups={groups}
            isEditing={editingId === cat.id}
            isSaving={saving === cat.id}
            onEdit={() => setEditingId(editingId === cat.id ? null : cat.id)}
            onSave={(updates) => handleUpdate(cat.id, updates)}
            onCancel={() => setEditingId(null)}
            onToggleActive={() => handleUpdate(cat.id, { isActive: !cat.isActive })}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryGroupManager({ token, groups, onGroupsChange }: {
  token: string | null;
  groups: CategoryGroup[];
  onGroupsChange: (g: CategoryGroup[]) => void;
}) {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newIcon, setNewIcon] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("0");
  const [editData, setEditData] = useState<Partial<CategoryGroup>>({});

  async function handleCreate() {
    if (!newName || !newSlug) { toast({ title: "Naam en slug zijn verplicht", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/category-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName, slug: newSlug, icon: newIcon, sortOrder: parseInt(newSortOrder) || 0, isActive: true }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout", variant: "destructive" }); return; }
      onGroupsChange([...groups, data]);
      toast({ title: "Groep aangemaakt" });
      setIsAdding(false); setNewName(""); setNewSlug(""); setNewIcon(""); setNewSortOrder("0");
    } catch { toast({ title: "Fout", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  async function handleUpdate(id: number) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/category-groups/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout", variant: "destructive" }); return; }
      onGroupsChange(groups.map(g => g.id === id ? data : g));
      toast({ title: "Groep bijgewerkt" });
      setEditingId(null);
    } catch { toast({ title: "Fout", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Groep verwijderen? Categorieën worden niet verwijderd, alleen losgekoppeld.")) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/category-groups/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast({ title: "Fout", variant: "destructive" }); return; }
      onGroupsChange(groups.filter(g => g.id !== id));
      toast({ title: "Groep verwijderd" });
    } catch { toast({ title: "Fout", variant: "destructive" }); }
    finally { setSaving(false); }
  }

  return (
    <div className="p-5 space-y-3">
      {groups.length === 0 && !isAdding && (
        <p className="text-sm text-muted-foreground">Nog geen groepen aangemaakt.</p>
      )}
      {groups.map(g => (
        <div key={g.id} className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3">
          {editingId === g.id ? (
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <Input className="flex-1" value={editData.name ?? ""} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder="Naam" />
                <Input className="w-28" value={editData.slug ?? ""} onChange={e => setEditData(p => ({ ...p, slug: e.target.value }))} placeholder="slug" />
                <Input className="w-16" type="number" value={editData.sortOrder ?? 0} onChange={e => setEditData(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} placeholder="0" />
              </div>
              <IconPicker value={editData.icon ?? ""} onChange={v => setEditData(p => ({ ...p, icon: v }))} label="Icoon" />
              <div className="flex gap-2">
                <Button size="sm" disabled={saving} onClick={() => handleUpdate(g.id)}>
                  <Check className="w-3 h-3 mr-1" /> Opslaan
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-3 h-3 mr-1" /> Annuleren</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 flex-shrink-0"><IconDisplay value={g.icon} size="sm" /></div>
              <span className="font-semibold text-sm flex-1">{g.name}</span>
              <span className="text-xs text-muted-foreground">{g.slug}</span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded">#{g.sortOrder}</span>
              <button onClick={() => { setEditingId(g.id); setEditData({ name: g.name, slug: g.slug, icon: g.icon, sortOrder: g.sortOrder }); }}
                className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => handleDelete(g.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      ))}
      {isAdding && (
        <div className="bg-primary/5 rounded-xl px-4 py-4 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input className="flex-1 min-w-[120px]" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Naam groep" />
            <Input className="w-32" value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="slug" />
            <Input className="w-16" type="number" value={newSortOrder} onChange={e => setNewSortOrder(e.target.value)} placeholder="0" />
          </div>
          <IconPicker value={newIcon} onChange={setNewIcon} label="Icoon" />
          <div className="flex gap-2">
            <Button size="sm" disabled={saving} onClick={handleCreate}>{saving ? "Aanmaken..." : "Aanmaken"}</Button>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>Annuleren</Button>
          </div>
        </div>
      )}
      <Button size="sm" variant="outline" onClick={() => setIsAdding(true)}>
        <Plus className="w-3 h-3 mr-1" /> Nieuwe groep
      </Button>
    </div>
  );
}

function CategoryCard({ cat, groups, isEditing, isSaving, onEdit, onSave, onCancel, onToggleActive }: {
  cat: CategoryRecord;
  groups: CategoryGroup[];
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onSave: (u: Partial<CategoryRecord>) => void;
  onCancel: () => void;
  onToggleActive: () => void;
}) {
  const [name, setName] = useState(cat.name);
  const [icon, setIcon] = useState(cat.icon);
  const [description, setDescription] = useState(cat.description);
  const [groupId, setGroupId] = useState<number | null>(cat.groupId ?? null);
  const [fields, setFields] = useState<CategoryField[]>(cat.fields ?? []);

  useEffect(() => {
    setName(cat.name); setIcon(cat.icon); setDescription(cat.description);
    setGroupId(cat.groupId ?? null);
    setFields(cat.fields ?? []);
  }, [cat]);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-colors ${cat.isActive ? "border-border bg-card" : "border-dashed border-muted-foreground/30 bg-muted/30"}`}>
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-5">
            {/* Basisgegevens */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Basisgegevens</p>
              <Input value={name} onChange={e => setName(e.target.value)} className="font-bold" placeholder="Naam categorie" />
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschrijving..." />
              <IconPicker value={icon} onChange={setIcon} label="Icoon" />
              {groups.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Groep</p>
                  <select
                    className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                    value={groupId ?? ""}
                    onChange={e => setGroupId(e.target.value === "" ? null : parseInt(e.target.value))}
                  >
                    <option value="">— Geen groep —</option>
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Formuliervelden */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Formuliervelden</p>
              <CategoryFieldEditor fields={fields} onChange={setFields} />
            </div>

            <div className="flex gap-2 pt-1 border-t border-border">
              <Button size="sm" disabled={isSaving} onClick={() => onSave({ name, icon, description, groupId, fields })}>
                <Check className="w-3 h-3 mr-1" /> {isSaving ? "Opslaan..." : "Opslaan"}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Annuleren</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12"><IconDisplay value={cat.icon} size="lg" /></div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleActive}
                  disabled={isSaving}
                  title={cat.isActive ? "Zet inactief" : "Zet actief"}
                  className={`p-1.5 rounded-lg transition-colors ${cat.isActive ? "text-green-600 hover:bg-green-50" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {cat.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={onEdit} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-base mb-1">{cat.name}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {cat.activeRequestCount} uitvragen
              </span>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                {(cat.fields ?? []).length} velden
              </span>
              {cat.groupId && groups.find(g => g.id === cat.groupId) && (
                <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                  {groups.find(g => g.id === cat.groupId)!.icon} {groups.find(g => g.id === cat.groupId)!.name}
                </span>
              )}
              {!cat.isActive && (
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">Inactief</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryFieldEditor({ fields, onChange }: { fields: CategoryField[]; onChange: (f: CategoryField[]) => void }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [newOptionText, setNewOptionText] = useState<Record<number, string>>({});

  const typeLabel: Record<CategoryFieldType, string> = { text: "Tekst", number: "Getal", select: "Keuzelijst", textarea: "Tekstvak", boolean: "Ja/Nee" };
  const typeColor: Record<CategoryFieldType, string> = {
    text: "bg-blue-50 text-blue-700",
    number: "bg-purple-50 text-purple-700",
    select: "bg-green-50 text-green-700",
    textarea: "bg-orange-50 text-orange-700",
    boolean: "bg-pink-50 text-pink-700",
  };

  function genKey(label: string) {
    return label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "").slice(0, 30) || `veld_${Date.now()}`;
  }

  function addField(type: CategoryFieldType) {
    const f: CategoryField = {
      key: `veld_${Date.now()}`, label: "Nieuw veld", type, required: false,
      placeholder: type === "boolean" ? undefined : "",
      options: type === "select" ? [] : undefined,
    };
    onChange([...fields, f]);
    setExpandedIdx(fields.length);
  }

  function updateField(idx: number, updates: Partial<CategoryField>) {
    onChange(fields.map((f, i) => i === idx ? { ...f, ...updates } : f));
  }

  function removeField(idx: number) {
    onChange(fields.filter((_, i) => i !== idx));
    setExpandedIdx(null);
  }

  function addOption(idx: number) {
    const val = (newOptionText[idx] ?? "").trim();
    if (!val) return;
    updateField(idx, { options: [...(fields[idx].options ?? []), val] });
    setNewOptionText(p => ({ ...p, [idx]: "" }));
  }

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground py-2 text-center italic">Nog geen formuliervelden</p>
      )}

      {fields.map((field, idx) => (
        <div key={idx} className="border border-border rounded-xl overflow-hidden">
          <div
            className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors select-none"
            onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          >
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${typeColor[field.type]}`}>
              {typeLabel[field.type]}
            </span>
            <span className="flex-1 text-sm font-medium truncate">{field.label || <span className="italic text-muted-foreground">naamloos</span>}</span>
            {field.required && <span className="text-xs text-destructive font-bold shrink-0">vereist</span>}
            <button
              onClick={e => { e.stopPropagation(); removeField(idx); }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
              title="Verwijder veld"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {expandedIdx === idx ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          </div>

          {expandedIdx === idx && (
            <div className="p-4 border-t border-border bg-muted/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold mb-1 block">Label *</label>
                  <Input
                    value={field.label}
                    onChange={e => updateField(idx, { label: e.target.value, key: genKey(e.target.value) })}
                    className="h-8 text-sm"
                    placeholder="Bijv. Schermgrootte"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1 block">Sleutel (auto)</label>
                  <Input value={field.key} readOnly className="h-8 text-sm bg-muted/60 text-muted-foreground font-mono" />
                </div>
                {field.type !== "boolean" && (
                  <div>
                    <label className="text-xs font-bold mb-1 block">Placeholder</label>
                    <Input
                      value={field.placeholder ?? ""}
                      onChange={e => updateField(idx, { placeholder: e.target.value })}
                      className="h-8 text-sm"
                      placeholder="Bijv. typ hier..."
                    />
                  </div>
                )}
                <div className="flex items-end pb-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={e => updateField(idx, { required: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">Verplicht veld</span>
                  </label>
                </div>
              </div>

              {field.type === "select" && (
                <div>
                  <label className="text-xs font-bold mb-2 block">Keuze-opties</label>
                  {(field.options ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground mb-2 italic">Nog geen opties toegevoegd</p>
                  )}
                  <div className="space-y-1 mb-2">
                    {(field.options ?? []).map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <span className="flex-1 text-sm bg-white border border-border rounded-lg px-3 py-1.5">{opt}</span>
                        <button
                          onClick={() => updateField(idx, { options: (field.options ?? []).filter((_, i) => i !== oi) })}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newOptionText[idx] ?? ""}
                      onChange={e => setNewOptionText(p => ({ ...p, [idx]: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOption(idx); } }}
                      placeholder="Optie toevoegen + Enter"
                      className="h-8 text-sm flex-1"
                    />
                    <Button size="sm" variant="outline" onClick={() => addOption(idx)} className="h-8 px-3">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={() => addField("text")} className="text-xs h-8 gap-1">
          <Plus className="w-3 h-3" /> Tekst
        </Button>
        <Button size="sm" variant="outline" onClick={() => addField("number")} className="text-xs h-8 gap-1">
          <Plus className="w-3 h-3" /> Getal
        </Button>
        <Button size="sm" variant="outline" onClick={() => addField("select")} className="text-xs h-8 gap-1">
          <Plus className="w-3 h-3" /> Keuzelijst
        </Button>
        <Button size="sm" variant="outline" onClick={() => addField("textarea")} className="text-xs h-8 gap-1">
          <Plus className="w-3 h-3" /> Tekstvak
        </Button>
        <Button size="sm" variant="outline" onClick={() => addField("boolean")} className="text-xs h-8 gap-1">
          <Plus className="w-3 h-3" /> Ja/Nee
        </Button>
      </div>
    </div>
  );
}

function UsersTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Filter + pagination state
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  // New admin form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const loadUsers = useCallback(async (search: string, pg: number, lim: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: search, page: String(pg), limit: String(lim) });
      const res = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast({ title: "Fout bij laden", variant: "destructive" }); return; }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      toast({ title: "Fout bij laden", variant: "destructive" });
    } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    loadUsers(q, page, limit);
  }, []);

  function handleSearch(newQ: string) {
    setQ(newQ); setPage(1);
    loadUsers(newQ, 1, limit);
  }

  function handleLimitChange(newLimit: number) {
    setLimit(newLimit); setPage(1);
    loadUsers(q, 1, newLimit);
  }

  function handlePage(pg: number) {
    setPage(pg);
    loadUsers(q, pg, limit);
  }

  async function handleUpdate(id: number, updates: object) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout bij opslaan", variant: "destructive" }); return; }
      setUsers(prev => prev.map(u => u.id === id ? data : u));
      toast({ title: "Opgeslagen" });
      setEditingId(null);
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    }
  }

  async function handleCreateAdmin() {
    if (!newName || !newEmail || !newPassword) {
      toast({ title: "Vul alle velden in", variant: "destructive" }); return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contactName: newName, email: newEmail, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout", variant: "destructive" }); return; }
      toast({ title: "Beheerder aangemaakt" });
      setShowCreateAdmin(false); setNewName(""); setNewEmail(""); setNewPassword("");
      loadUsers(q, page, limit);
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    } finally { setCreating(false); }
  }

  async function handleSuspend(id: number, suspended: boolean) {
    try {
      const res = await fetch(`/api/admin/users/${id}/suspend`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ suspended }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.error ?? "Fout", variant: "destructive" }); return; }
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isSuspended: suspended } : u));
      toast({ title: suspended ? "Gebruiker geblokkeerd" : "Gebruiker gedeblokkeerd" });
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ q });
      const res = await fetch(`/api/admin/users/export?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast({ title: "Exportfout", variant: "destructive" }); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gebruikers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Export gedownload (max. 200 rijen)" });
    } catch {
      toast({ title: "Exportfout", variant: "destructive" });
    } finally { setExporting(false); }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <h2 className="text-xl font-bold">Gebruikers <span className="text-muted-foreground font-normal text-base">({total.toLocaleString("nl-NL")})</span></h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} disabled={exporting} size="sm">
            <Download className="w-4 h-4 mr-1.5" /> {exporting ? "Exporteren..." : "CSV export"}
          </Button>
          <Button size="sm" onClick={() => setShowCreateAdmin(!showCreateAdmin)}>
            <Plus className="w-4 h-4 mr-1.5" /> Nieuwe beheerder
          </Button>
        </div>
      </div>

      {/* Search + per-page */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Zoek op naam, e-mail of bedrijfsnaam..."
            className="pl-9"
          />
        </div>
        <select
          value={limit}
          onChange={e => handleLimitChange(Number(e.target.value))}
          className="border border-input rounded-md px-3 h-10 bg-white text-sm"
        >
          <option value={25}>25 per pagina</option>
          <option value={50}>50 per pagina</option>
          <option value={100}>100 per pagina</option>
          <option value={250}>250 per pagina</option>
        </select>
      </div>

      {/* Create admin form */}
      {showCreateAdmin && (
        <div className="bg-card p-6 rounded-2xl border border-primary/30 mb-5">
          <h3 className="font-bold mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Nieuwe beheerder aanmaken</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div><label className="text-sm font-bold mb-1 block">Naam</label><Input value={newName} onChange={e => setNewName(e.target.value)} /></div>
            <div><label className="text-sm font-bold mb-1 block">E-mail</label><Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} /></div>
            <div><label className="text-sm font-bold mb-1 block">Wachtwoord</label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreateAdmin} disabled={creating}>{creating ? "Aanmaken..." : "Aanmaken"}</Button>
            <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>Annuleren</Button>
          </div>
        </div>
      )}

      {/* User list */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Laden...</div>
      ) : users.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">Geen gebruikers gevonden</div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <UserRow key={u.id} user={u} isEditing={editingId === u.id} onToggleEdit={() => setEditingId(editingId === u.id ? null : u.id)} onSave={updates => handleUpdate(u.id, updates)} onSuspend={(suspended) => handleSuspend(u.id, suspended)} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Pagina {page} van {pages} &mdash; {total.toLocaleString("nl-NL")} gebruikers
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => handlePage(page - 1)}>‹</Button>
            {Array.from({ length: Math.min(7, pages) }, (_, i) => {
              const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i;
              return (
                <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => handlePage(p)}>{p}</Button>
              );
            })}
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => handlePage(page + 1)}>›</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  const [paynlServiceId, setPaynlServiceId] = useState("");
  const [paynlToken, setPaynlToken] = useState("");
  const [paynlConfigured, setPaynlConfigured] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [savingPaynl, setSavingPaynl] = useState(false);
  const [initialSellerCredits, setInitialSellerCredits] = useState(10);
  const [savingCredits, setSavingCredits] = useState(false);

  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [savingOpenai, setSavingOpenai] = useState(false);
  const [openaiConfigured, setOpenaiConfigured] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setOfflineMode(d.offlineMode ?? false);
        setPaynlServiceId(d.paynlServiceId ?? "");
        setPaynlToken(d.paynlTokenMasked ?? "");
        setPaynlConfigured(d.paynlConfigured ?? false);
        setInitialSellerCredits(d.initialSellerCredits ?? 10);
        setOpenaiApiKey(d.openaiApiKeyMasked ?? "");
        setOpenaiConfigured(d.openaiConfigured ?? false);
      })
      .catch(() => setOfflineMode(false));
  }, [token]);

  async function saveSellerCredits(e: React.FormEvent) {
    e.preventDefault();
    setSavingCredits(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ initialSellerCredits }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Startcredits opgeslagen" });
    } catch {
      toast({ title: "Fout bij opslaan", variant: "destructive" });
    } finally {
      setSavingCredits(false);
    }
  }

  async function toggleOffline() {
    setSaving(true);
    const next = !offlineMode;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offlineMode: next }),
      });
      if (!res.ok) throw new Error();
      setOfflineMode(next);
      toast({ title: next ? "Site is nu offline" : "Site is weer online" });
    } catch {
      toast({ title: "Fout bij opslaan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function savePaynl(e: React.FormEvent) {
    e.preventDefault();
    setSavingPaynl(true);
    try {
      const body: Record<string, string> = { paynlServiceId };
      // Always send token: empty string = explicitly clear (use env var), masked = skip
      if (!paynlToken.startsWith("****")) body.paynlToken = paynlToken;
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPaynlConfigured(d.paynlConfigured);
      setPaynlToken(d.paynlTokenMasked ?? "");
      toast({ title: "Pay.nl instellingen opgeslagen" });
    } catch (err: any) {
      toast({ title: "Fout bij opslaan", description: err.message, variant: "destructive" });
    } finally {
      setSavingPaynl(false);
    }
  }

  async function clearPaynlToken() {
    setSavingPaynl(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paynlToken: "" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setPaynlConfigured(d.paynlConfigured);
      setPaynlToken("");
      toast({ title: "Token gewist — omgevingsvariabele wordt gebruikt" });
    } catch (err: any) {
      toast({ title: "Fout bij wissen", description: err.message, variant: "destructive" });
    } finally {
      setSavingPaynl(false);
    }
  }

  async function saveOpenaiKey(e: React.FormEvent) {
    e.preventDefault();
    setSavingOpenai(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ openaiApiKey }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setOpenaiConfigured(d.openaiConfigured);
      setOpenaiApiKey(d.openaiApiKeyMasked ?? "");
      toast({ title: "OpenAI API-sleutel opgeslagen" });
    } catch (err: any) {
      toast({ title: "Fout bij opslaan", description: err.message, variant: "destructive" });
    } finally {
      setSavingOpenai(false);
    }
  }

  async function clearOpenaiKey() {
    setSavingOpenai(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ openaiApiKey: "" }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setOpenaiConfigured(d.openaiConfigured);
      setOpenaiApiKey("");
      toast({ title: "OpenAI API-sleutel gewist — omgevingsvariabele wordt gebruikt" });
    } catch (err: any) {
      toast({ title: "Fout bij wissen", description: err.message, variant: "destructive" });
    } finally {
      setSavingOpenai(false);
    }
  }

  if (offlineMode === null) return <p className="text-muted-foreground">Laden...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Site-instellingen</h2>

      {/* Online/offline */}
      <div className={`rounded-2xl border-2 p-6 transition-colors ${offlineMode ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${offlineMode ? "bg-destructive/15" : "bg-green-50"}`}>
              {offlineMode
                ? <WifiOff className="w-6 h-6 text-destructive" />
                : <Wifi className="w-6 h-6 text-green-600" />
              }
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">
                {offlineMode ? "Site is offline" : "Site is online"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {offlineMode
                  ? "Bezoekers zien alleen een vergrendelscherm. Alleen beheerders kunnen inloggen."
                  : "De site is normaal toegankelijk voor alle bezoekers."
                }
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <button
              onClick={toggleOffline}
              disabled={saving}
              className={`relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${offlineMode ? "bg-destructive focus:ring-destructive" : "bg-green-500 focus:ring-green-500"}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 absolute top-1 ${offlineMode ? "translate-x-1" : "translate-x-8"}`} />
            </button>
          </div>
        </div>
        {offlineMode && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Let op: Als je jezelf uitlogt terwijl de site offline is, kun je alleen opnieuw inloggen via het vergrendelscherm. Zorg dat je beheerdersgegevens bij de hand hebt.
            </p>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-border">
          <Button onClick={toggleOffline} disabled={saving} variant={offlineMode ? "default" : "destructive"} className={offlineMode ? "bg-green-600 hover:bg-green-700 text-white" : ""}>
            {saving ? "Opslaan..." : offlineMode ? "Site online zetten" : "Site offline zetten"}
          </Button>
        </div>
      </div>

      {/* Initial seller credits */}
      <div className="rounded-2xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Startcredits nieuwe winkeliers</h3>
            <p className="text-sm text-muted-foreground">Aantal gratis credits dat nieuwe winkeliers bij registratie ontvangen</p>
          </div>
        </div>
        <form onSubmit={saveSellerCredits} className="flex items-center gap-4">
          <input
            type="number"
            min={0}
            max={1000}
            value={initialSellerCredits}
            onChange={e => setInitialSellerCredits(parseInt(e.target.value) || 0)}
            className="w-32 h-10 rounded-lg border border-border px-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button type="submit" disabled={savingCredits}>
            {savingCredits ? "Opslaan..." : "Opslaan"}
          </Button>
        </form>
      </div>

      {/* Pay.nl */}
      <div className="rounded-2xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Pay.nl betaalkoppeling</h3>
            <p className="text-sm text-muted-foreground">Vul je Pay.nl Service ID en Token in</p>
          </div>
          {paynlConfigured && (
            <span className="ml-auto text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Actief</span>
          )}
          {!paynlConfigured && (
            <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Niet geconfigureerd</span>
          )}
        </div>
        <form onSubmit={savePaynl} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Service ID</label>
            <Input
              placeholder="bijv. SL-1810-4555"
              value={paynlServiceId}
              onChange={e => setPaynlServiceId(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Token / Secret</label>
            <div className="relative">
              <Input
                type={showToken ? "text" : "password"}
                placeholder={paynlConfigured ? "Laat leeg om huidige waarde te bewaren" : "Jouw Pay.nl token"}
                value={paynlToken}
                onChange={e => setPaynlToken(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Vind dit in je <a href="https://admin.pay.nl" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Pay.nl dashboard</a> onder Services → API tokens.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingPaynl}>
              {savingPaynl ? "Opslaan..." : "Pay.nl opslaan"}
            </Button>
            {paynlToken.startsWith("****") && (
              <button
                type="button"
                onClick={clearPaynlToken}
                disabled={savingPaynl}
                className="text-xs text-destructive underline hover:no-underline disabled:opacity-50"
              >
                Wis token (gebruik omgevingsvariabele)
              </button>
            )}
          </div>
        </form>
      </div>

      {/* OpenAI chatbot */}
      <div className="rounded-2xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
            <Key className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">Quootje chatbot — OpenAI sleutel</h3>
            <p className="text-sm text-muted-foreground">Stel de OpenAI API-sleutel in voor de chatbot (valt terug op omgevingsvariabele OPENAI_API_KEY2 als leeg)</p>
          </div>
          {openaiConfigured
            ? <span className="ml-auto text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Actief</span>
            : <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Niet geconfigureerd</span>
          }
        </div>
        <form onSubmit={saveOpenaiKey} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">API-sleutel</label>
            <div className="relative">
              <Input
                type={showOpenaiKey ? "text" : "password"}
                placeholder={openaiConfigured ? "Laat leeg om huidige waarde te bewaren" : "sk-..."}
                value={openaiApiKey}
                onChange={e => setOpenaiApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showOpenaiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={savingOpenai}>
              {savingOpenai ? "Opslaan..." : "OpenAI sleutel opslaan"}
            </Button>
            {openaiApiKey.startsWith("****") && (
              <button
                type="button"
                onClick={clearOpenaiKey}
                disabled={savingOpenai}
                className="text-xs text-destructive underline hover:no-underline disabled:opacity-50"
              >
                Wis sleutel (gebruik omgevingsvariabele)
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="p-4 bg-muted rounded-xl">
        <p className="text-xs text-muted-foreground">
          <strong>Hoe werkt het?</strong> Wanneer de site offline is, zien bezoekers een vergrendeld scherm met een inlogformulier. Alleen accounts met beheerdersrechten kunnen dan nog inloggen en de site beheren.
        </p>
      </div>
    </div>
  );
}

function UserRow({ user, isEditing, onToggleEdit, onSave, onSuspend }: { user: UserRecord; isEditing: boolean; onToggleEdit: () => void; onSave: (u: object) => void; onSuspend: (suspended: boolean) => void }) {
  const [contactName, setContactName] = useState(user.contactName);
  const [email, setEmail] = useState(user.email);
  const [storeName, setStoreName] = useState(user.storeName ?? "");
  const [role, setRole] = useState(user.role);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [newPassword, setNewPassword] = useState("");
  const [credits, setCredits] = useState(user.credits ?? 0);

  const roleIcon = user.isAdmin ? <ShieldCheck className="w-4 h-4 text-primary" /> : user.role === "seller" ? <Store className="w-4 h-4 text-blue-500" /> : <ShoppingBag className="w-4 h-4 text-green-500" />;
  const roleLabel = user.isAdmin ? "Beheerder" : user.role === "seller" ? "Verkoper" : "Koper";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggleEdit}>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{user.contactName}</span>
            {roleIcon}
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
            {user.isSuspended && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Geblokkeerd</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {user.role === "seller" && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{user.credits} credits</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full ${user.emailVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
            {user.emailVerified ? "Geverifieerd" : "Niet geverifieerd"}
          </span>
          {isEditing ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {isEditing && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold mb-1 block">Naam</label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">E-mailadres</label>
              <Input value={email} onChange={e => setEmail(e.target.value)} className="h-8 text-sm" type="email" />
            </div>
            {user.role === "seller" && (
              <div>
                <label className="text-xs font-bold mb-1 block">Bedrijfsnaam</label>
                <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="h-8 text-sm" placeholder="Winkelnaam" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold mb-1 flex items-center gap-1"><Coins className="w-3 h-3 text-primary" /> Credits</label>
              <Input
                type="number"
                min={0}
                value={credits}
                onChange={e => setCredits(parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
            {!user.isAdmin && (
              <div>
                <label className="text-xs font-bold mb-1 block">Rol</label>
                <select className="w-full border border-input rounded-md px-2 h-8 bg-white text-sm" value={role} onChange={e => setRole(e.target.value as "buyer" | "seller")}>
                  <option value="buyer">Koper</option>
                  <option value="seller">Verkoper</option>
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-bold mb-1 flex items-center gap-1"><Key className="w-3 h-3" /> Nieuw wachtwoord</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="h-8 text-sm" placeholder="Leeg = niet wijzigen" />
            </div>
            {!user.isAdmin && (
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} className="rounded" />
                  Beheerder
                </label>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Button size="sm" onClick={() => onSave({ contactName, email, storeName: storeName || undefined, role, isAdmin, credits, newPassword: newPassword || undefined })}>Opslaan</Button>
            <Button size="sm" variant="outline" onClick={onToggleEdit}>Annuleren</Button>
            {!user.isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className={user.isSuspended ? "text-green-700 border-green-300 hover:bg-green-50" : "text-red-600 border-red-300 hover:bg-red-50"}
                onClick={() => onSuspend(!user.isSuspended)}
              >
                {user.isSuspended ? "Deblokkeren" : "Blokkeren"}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Betalingen Tab ─────────────────────────────────────────────────────────

interface PaymentOrder {
  id: number;
  userId: number;
  bundleName: string;
  creditsAmount: number;
  amountCents: number;
  paynlOrderId: string | null;
  status: "pending" | "paid" | "failed" | "cancelled";
  createdAt: string;
  paidAt: string | null;
  userEmail: string | null;
  userContactName: string | null;
  userStoreName: string | null;
}

interface PaymentLog {
  id: number;
  createdAt: string;
  source: string;
  action: string | null;
  extra1: string | null;
  paynlOrderId: string | null;
  internalOrderId: number | null;
  rawBody: string | null;
  result: string | null;
  errorMessage: string | null;
  creditsAdded: number | null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge className="bg-green-100 text-green-800 border-green-300 gap-1"><CheckCircle className="w-3 h-3" />{status}</Badge>;
  if (status === "pending") return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 gap-1"><Clock className="w-3 h-3" />{status}</Badge>;
  if (status === "cancelled") return <Badge className="bg-gray-100 text-gray-700 border-gray-300 gap-1"><XCircle className="w-3 h-3" />{status}</Badge>;
  if (status === "failed") return <Badge className="bg-red-100 text-red-800 border-red-300 gap-1"><XCircle className="w-3 h-3" />{status}</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

function ResultBadge({ result }: { result: string | null }) {
  if (!result) return <span className="text-muted-foreground text-xs">—</span>;
  const color =
    result.includes("paid") || result === "already_paid" ? "text-green-700 bg-green-50 border border-green-200" :
    result.includes("error") ? "text-red-700 bg-red-50 border border-red-200" :
    result.includes("cancel") || result.includes("refund") ? "text-gray-600 bg-gray-50 border border-gray-200" :
    result.includes("pending") || result === "created" || result === "still_pending" ? "text-yellow-700 bg-yellow-50 border border-yellow-200" :
    "text-blue-700 bg-blue-50 border border-blue-200";
  return <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${color}`}>{result}</span>;
}

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("nl-NL", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function PaymentsTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [logs, setLogs] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [expandedLog, setExpandedLog] = useState<number | null>(null);
  const [view, setView] = useState<"orders" | "logs">("orders");
  const [testPaynlId, setTestPaynlId] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [simulating, setSimulating] = useState<number | null>(null);
  const [exchangeStats, setExchangeStats] = useState<any>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [oRes, lRes, sRes] = await Promise.all([
        fetch("/api/payments/admin/orders", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/payments/admin/logs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/payments/admin/exchange-stats", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (oRes.ok) setOrders(await oRes.json());
      if (lRes.ok) setLogs(await lRes.json());
      if (sRes.ok) setExchangeStats(await sRes.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  async function handleProcess(orderId: number) {
    if (!token) return;
    setProcessing(orderId);
    try {
      const res = await fetch(`/api/payments/admin/orders/${orderId}/process`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Verwerkt", description: data.message });
        await load();
      } else {
        toast({ title: "Fout", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Fout", description: "Probeer opnieuw", variant: "destructive" });
    } finally {
      setProcessing(null);
    }
  }

  async function handleSimulateExchange(orderId: number) {
    if (!token) return;
    setSimulating(orderId);
    try {
      const res = await fetch(`/api/payments/admin/orders/${orderId}/simulate-exchange`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: data.ok ? "Simulatie geslaagd" : "Simulatie mislukt", description: `Status: ${data.orderStatus} · ${data.credits ?? 0} credits` });
        await load();
      } else {
        toast({ title: "Fout", description: data.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Fout", description: "Probeer opnieuw", variant: "destructive" });
    } finally {
      setSimulating(null);
    }
  }

  async function handleTestPaynl() {
    if (!token || !testPaynlId.trim()) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/payments/admin/test-paynl/${encodeURIComponent(testPaynlId.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTestResult(await res.json());
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setTestLoading(false);
    }
  }

  const paidCount = orders.filter(o => o.status === "paid").length;
  const pendingCount = orders.filter(o => o.status === "pending").length;
  const totalCredits = orders.filter(o => o.status === "paid").reduce((s, o) => s + o.creditsAmount, 0);
  const totalRevenue = orders.filter(o => o.status === "paid").reduce((s, o) => s + o.amountCents, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Betaald", value: paidCount, color: "text-green-700" },
          { label: "In behandeling", value: pendingCount, color: "text-yellow-700" },
          { label: "Credits verkocht", value: totalCredits, color: "text-primary" },
          { label: "Omzet", value: `€${(totalRevenue / 100).toFixed(2)}`, color: "text-foreground" },
        ].map(c => (
          <div key={c.label} className="bg-muted rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Exchange webhook stats */}
      {exchangeStats && (
        <div className={`rounded-xl p-4 border text-sm ${exchangeStats.exchangeReceived > 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          <p className={`font-semibold mb-1 ${exchangeStats.exchangeReceived > 0 ? "text-green-800" : "text-amber-800"}`}>
            {exchangeStats.exchangeReceived > 0 ? "✓ Pay.nl exchange-webhook actief" : "⚠ Nog geen exchange-webhooks ontvangen"}
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
            <span>Exchanges ontvangen: <strong>{exchangeStats.exchangeReceived}</strong></span>
            <span>Verwerkt: <strong>{exchangeStats.exchangeProcessed}</strong></span>
            <span>Return URL hits: <strong>{exchangeStats.returnUrlHits}</strong></span>
          </div>
          {exchangeStats.exchangeReceived === 0 && (
            <p className="text-xs text-amber-700 mt-2">
              Controleer of Pay.nl exchange URL is ingesteld op: <code className="bg-white px-1 rounded">{window.location.origin.replace(/:\d+$/, '')}/api/payments/exchange</code>
            </p>
          )}
        </div>
      )}

      {/* Pay.nl API Diagnostiek */}
      <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">Pay.nl API diagnostiek</p>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            placeholder="Pay.nl order ID (bijv. 3349008045Xa605c)"
            value={testPaynlId}
            onChange={e => setTestPaynlId(e.target.value)}
            className="border border-blue-300 rounded px-3 py-1 text-sm flex-1 min-w-[240px] bg-white"
            onKeyDown={e => e.key === "Enter" && handleTestPaynl()}
          />
          <Button size="sm" variant="outline" className="border-blue-400 text-blue-800" onClick={handleTestPaynl} disabled={testLoading || !testPaynlId.trim()}>
            {testLoading ? <RefreshCw className="w-3 h-3 animate-spin mr-1" /> : null}
            Test status API
          </Button>
        </div>
        {testResult && (
          <pre className="mt-3 text-xs bg-white border border-blue-200 rounded p-3 overflow-x-auto max-h-48">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => setView("orders")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === "orders" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            Bestellingen ({orders.length})
          </button>
          <button onClick={() => setView("logs")} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${view === "logs" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
            Pay.nl logboek ({logs.length})
          </button>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Vernieuwen
        </Button>
      </div>

      {view === "orders" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["#", "Datum", "Gebruiker", "Bundel", "Credits", "Bedrag", "Pay.nl ID", "Status", "Actie"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Laden...</td></tr>}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Geen bestellingen</td></tr>
              )}
              {orders.map(o => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{o.id}</td>
                  <td className="px-3 py-2 text-xs whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                  <td className="px-3 py-2">
                    <div className="text-xs font-medium">{o.userContactName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.userEmail ?? "—"}</div>
                  </td>
                  <td className="px-3 py-2 text-xs">{o.bundleName}</td>
                  <td className="px-3 py-2 text-xs font-bold text-primary">{o.creditsAmount}</td>
                  <td className="px-3 py-2 text-xs font-mono">€{(o.amountCents / 100).toFixed(2)}</td>
                  <td className="px-3 py-2 text-xs font-mono text-muted-foreground max-w-[120px] truncate">{o.paynlOrderId ?? "—"}</td>
                  <td className="px-3 py-2"><StatusBadge status={o.status} /></td>
                  <td className="px-3 py-2">
                    {o.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" className="h-7 text-xs px-2" disabled={processing === o.id || simulating === o.id} onClick={() => handleProcess(o.id)}>
                          {processing === o.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Verwerk"}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-purple-700 hover:text-purple-900 hover:bg-purple-50" disabled={processing === o.id || simulating === o.id} onClick={() => handleSimulateExchange(o.id)} title="Simuleer Pay.nl exchange webhook">
                          {simulating === o.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : "Test"}
                        </Button>
                      </div>
                    )}
                    {o.status === "paid" && <span className="text-xs text-muted-foreground">{fmtDate(o.paidAt)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "logs" && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Datum", "Bron", "Actie", "Extra1", "Pay.nl ID", "Intern #", "Resultaat", "+Credits", "Details"].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Laden...</td></tr>}
              {!loading && logs.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">Geen logregels — log wordt gevuld bij de volgende Pay.nl terugmelding</td></tr>
              )}
              {logs.map(l => (
                <>
                  <tr key={l.id} className="border-t border-border hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setExpandedLog(expandedLog === l.id ? null : l.id)}>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                    <td className="px-3 py-2 text-xs font-mono">{l.source}</td>
                    <td className="px-3 py-2 text-xs font-mono font-bold">{l.action ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground">{l.extra1 ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono text-muted-foreground max-w-[100px] truncate">{l.paynlOrderId ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono">{l.internalOrderId ?? "—"}</td>
                    <td className="px-3 py-2"><ResultBadge result={l.result} /></td>
                    <td className="px-3 py-2 text-xs font-bold text-green-700">{l.creditsAdded != null ? `+${l.creditsAdded}` : "—"}</td>
                    <td className="px-3 py-2"><ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedLog === l.id ? "rotate-90" : ""}`} /></td>
                  </tr>
                  {expandedLog === l.id && (
                    <tr key={`${l.id}-detail`}>
                      <td colSpan={9} className="px-4 py-3 bg-muted/30">
                        {l.errorMessage && <p className="text-red-600 text-xs mb-2 font-semibold">Fout: {l.errorMessage}</p>}
                        {l.rawBody ? (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Ontvangen data van Pay.nl:</p>
                            <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto border border-border max-h-40 whitespace-pre-wrap">{(() => { try { return JSON.stringify(JSON.parse(l.rawBody), null, 2); } catch { return l.rawBody; } })()}</pre>
                          </div>
                        ) : <p className="text-xs text-muted-foreground">Geen raw body beschikbaar</p>}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface BundleRecord {
  id: number;
  bundleKey: string;
  name: string;
  credits: number;
  priceCents: number;
  originalPriceCents: number | null;
  badge: string | null;
  sortOrder: number;
  isActive: boolean;
}

const BADGE_OPTIONS = ["", "Populair", "Beste waarde", "Beste prijs"];

function centsToEuro(cents: number): string {
  return (cents / 100).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function BundelsTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [bundles, setBundles] = useState<BundleRecord[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const emptyForm = { bundleKey: "", name: "", credits: "", priceCents: "", originalPriceCents: "", badge: "", sortOrder: "" };
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState<Record<number, typeof emptyForm>>({});

  useEffect(() => { loadBundles(); }, []);

  async function loadBundles() {
    try {
      const res = await fetch("/api/admin/bundles", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setBundles(data);
    } catch {
      toast({ title: "Fout", description: "Kon bundels niet laden", variant: "destructive" });
    }
  }

  function startEdit(b: BundleRecord) {
    setEditingId(b.id);
    setEditForm(prev => ({
      ...prev,
      [b.id]: {
        bundleKey: b.bundleKey,
        name: b.name,
        credits: String(b.credits),
        priceCents: String((b.priceCents / 100).toFixed(2)),
        originalPriceCents: b.originalPriceCents ? String((b.originalPriceCents / 100).toFixed(2)) : "",
        badge: b.badge ?? "",
        sortOrder: String(b.sortOrder),
      }
    }));
  }

  async function saveEdit(id: number) {
    const f = editForm[id];
    if (!f) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: f.name,
          credits: parseInt(f.credits),
          priceCents: f.priceCents,
          originalPriceCents: f.originalPriceCents || null,
          badge: f.badge || null,
          sortOrder: parseInt(f.sortOrder || "0"),
        }),
      });
      if (!res.ok) { const d = await res.json(); toast({ title: "Fout", description: d.error, variant: "destructive" }); return; }
      toast({ title: "Opgeslagen" });
      setEditingId(null);
      await loadBundles();
    } catch {
      toast({ title: "Fout", description: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(b: BundleRecord) {
    try {
      await fetch(`/api/admin/bundles/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      await loadBundles();
    } catch {
      toast({ title: "Fout", description: "Status wijzigen mislukt", variant: "destructive" });
    }
  }

  async function deleteBundle(id: number) {
    if (!confirm("Bundel verwijderen? Dit kan niet ongedaan worden gemaakt.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/bundles/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      toast({ title: "Verwijderd" });
      await loadBundles();
    } catch {
      toast({ title: "Fout", description: "Verwijderen mislukt", variant: "destructive" });
    } finally {
      setDeleting(null);
    }
  }

  async function addBundle() {
    if (!form.bundleKey || !form.name || !form.credits || !form.priceCents) {
      toast({ title: "Vul alle verplichte velden in", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bundleKey: form.bundleKey,
          name: form.name,
          credits: parseInt(form.credits),
          priceCents: form.priceCents,
          originalPriceCents: form.originalPriceCents || null,
          badge: form.badge || null,
          sortOrder: parseInt(form.sortOrder || "99"),
        }),
      });
      if (!res.ok) { const d = await res.json(); toast({ title: "Fout", description: d.error, variant: "destructive" }); return; }
      toast({ title: "Bundel aangemaakt" });
      setForm(emptyForm);
      setIsAdding(false);
      await loadBundles();
    } catch {
      toast({ title: "Fout", description: "Aanmaken mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40";
  const labelCls = "block text-xs font-semibold text-muted-foreground mb-1";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Creditbundels</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Prijzen invoeren in euro's (bijv. 35,00 = €35). Beheerders betalen automatisch 1/100e voor tests.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Bundel toevoegen
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6 p-5 border border-border rounded-xl bg-muted/30">
          <h3 className="font-semibold mb-4">Nieuwe bundel</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            <div>
              <label className={labelCls}>Sleutel *</label>
              <input className={inputCls} placeholder="bijv. premium" value={form.bundleKey}
                onChange={e => setForm(f => ({ ...f, bundleKey: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }))} />
            </div>
            <div>
              <label className={labelCls}>Naam *</label>
              <input className={inputCls} placeholder="bijv. Premium" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Credits *</label>
              <input className={inputCls} type="number" min="1" placeholder="200" value={form.credits}
                onChange={e => setForm(f => ({ ...f, credits: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Prijs (€) *</label>
              <input className={inputCls} type="number" min="0.01" step="0.01" placeholder="49.00" value={form.priceCents}
                onChange={e => setForm(f => ({ ...f, priceCents: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Doorgestr. prijs (€)</label>
              <input className={inputCls} type="number" min="0.01" step="0.01" placeholder="optioneel" value={form.originalPriceCents}
                onChange={e => setForm(f => ({ ...f, originalPriceCents: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Label</label>
              <select className={inputCls} value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}>
                {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || "— geen —"}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Volgorde</label>
              <input className={inputCls} type="number" placeholder="99" value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={addBundle} disabled={saving} size="sm">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Check className="w-4 h-4 mr-1" />}
              Opslaan
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { setIsAdding(false); setForm(emptyForm); }}>
              <X className="w-4 h-4 mr-1" /> Annuleren
            </Button>
          </div>
        </div>
      )}

      {bundles === null ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : bundles.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">Geen bundels — voeg er een toe.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Sleutel", "Naam", "Credits", "Prijs", "Doorgestr.", "Label", "Volgorde", "Status", ""].map(h => (
                  <th key={h} className="px-3 py-2 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bundles.map(b => (
                <tr key={b.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${!b.isActive ? "opacity-50" : ""}`}>
                  {editingId === b.id ? (
                    <>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{b.bundleKey}</td>
                      <td className="px-3 py-2 min-w-[120px]"><input className={inputCls} value={editForm[b.id]?.name ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], name: e.target.value } }))} /></td>
                      <td className="px-3 py-2 min-w-[80px]"><input className={inputCls} type="number" value={editForm[b.id]?.credits ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], credits: e.target.value } }))} /></td>
                      <td className="px-3 py-2 min-w-[110px]">
                        <div className="flex items-center gap-1"><span className="text-muted-foreground text-xs">€</span>
                          <input className={inputCls} type="number" step="0.01" value={editForm[b.id]?.priceCents ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], priceCents: e.target.value } }))} /></div>
                      </td>
                      <td className="px-3 py-2 min-w-[110px]">
                        <div className="flex items-center gap-1"><span className="text-muted-foreground text-xs">€</span>
                          <input className={inputCls} type="number" step="0.01" value={editForm[b.id]?.originalPriceCents ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], originalPriceCents: e.target.value } }))} /></div>
                      </td>
                      <td className="px-3 py-2 min-w-[140px]">
                        <select className={inputCls} value={editForm[b.id]?.badge ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], badge: e.target.value } }))}>
                          {BADGE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || "— geen —"}</option>)}
                        </select>
                      </td>
                      <td className="px-3 py-2 min-w-[70px]"><input className={inputCls} type="number" value={editForm[b.id]?.sortOrder ?? ""} onChange={e => setEditForm(f => ({ ...f, [b.id]: { ...f[b.id], sortOrder: e.target.value } }))} /></td>
                      <td className="px-3 py-2"><Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Actief" : "Inactief"}</Badge></td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" className="h-7 px-2 text-xs" disabled={saving} onClick={() => saveEdit(b.id)}>
                            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditingId(null)}><X className="w-3 h-3" /></Button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{b.bundleKey}</td>
                      <td className="px-3 py-2 font-semibold">{b.name}</td>
                      <td className="px-3 py-2">{b.credits}</td>
                      <td className="px-3 py-2 font-semibold">€{centsToEuro(b.priceCents)}</td>
                      <td className="px-3 py-2 text-muted-foreground">{b.originalPriceCents ? <span className="line-through">€{centsToEuro(b.originalPriceCents)}</span> : "—"}</td>
                      <td className="px-3 py-2">{b.badge ? <Badge variant="secondary">{b.badge}</Badge> : <span className="text-muted-foreground text-xs">—</span>}</td>
                      <td className="px-3 py-2">{b.sortOrder}</td>
                      <td className="px-3 py-2">
                        <button onClick={() => toggleActive(b)}
                          className={`text-xs font-semibold px-2 py-1 rounded-full transition-colors ${b.isActive ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                          {b.isActive ? "Actief" : "Inactief"}
                        </button>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => startEdit(b)}><Pencil className="w-3 h-3" /></Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" disabled={deleting === b.id} onClick={() => deleteBundle(b.id)}>
                            {deleting === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </Button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <p className="font-semibold mb-1">Prijzen uitgelegd</p>
        <p>Voer prijzen in <strong>euro's</strong> in (bijv. 35,00 voor €35). Beheerders betalen automatisch 1/100e (= €0,35) om betalingen te testen. Verkopers betalen de volledige ingestelde prijs.</p>
      </div>
    </div>
  );
}

interface PageEditorProps {
  title: string;
  content: string;
  saving: boolean;
  selectedSlug: string;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
}

function PageEditor({ title, content, saving, selectedSlug, onTitleChange, onContentChange, onSave }: PageEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const preview = useMemo(() => {
    if (!content) return "";
    if (content.trimStart().startsWith("<")) return content;
    return marked.parse(content) as string;
  }, [content]);

  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-secondary mb-1">Paginatitel</label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="Titel van de pagina"
        />
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-semibold text-secondary">Inhoud</label>
          <div className="flex rounded-lg border border-border overflow-hidden text-xs">
            <button
              onClick={() => setMode("edit")}
              className={`px-3 py-1.5 font-medium transition-colors ${mode === "edit" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
            >
              Bewerken
            </button>
            <button
              onClick={() => setMode("preview")}
              className={`px-3 py-1.5 font-medium transition-colors ${mode === "preview" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:bg-muted"}`}
            >
              Voorbeeld
            </button>
          </div>
        </div>

        {mode === "edit" ? (
          <textarea
            value={content}
            onChange={e => onContentChange(e.target.value)}
            rows={16}
            className="w-full px-3 py-2 rounded-lg border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
            placeholder={`## Koptekst\n\nSchrijf hier de inhoud. Gebruik Markdown voor opmaak:\n- **vet**, _cursief_\n- # Koptekst 1, ## Koptekst 2\n- - lijstitem`}
          />
        ) : (
          <div className="min-h-[300px] border border-border rounded-lg p-4 bg-white">
            {preview ? (
              <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: preview }} />
            ) : (
              <p className="text-muted-foreground italic text-sm">Nog geen inhoud om te bekijken.</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Opslaan
        </Button>
        <a
          href={`/pages/${selectedSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          Bekijk pagina →
        </a>
      </div>
    </>
  );
}

const PAGE_SLUGS = [
  { slug: "algemene-voorwaarden", label: "Algemene voorwaarden" },
  { slug: "privacy", label: "Privacy" },
  { slug: "cookies", label: "Cookies" },
  { slug: "contact", label: "Contact" },
  { slug: "veelgestelde-vragen", label: "Veelgestelde vragen" },
] as const;

const PAGE_LANGS: Language[] = ["nl", "en", "de", "fr"];
const LANG_LABELS: Record<Language, string> = { nl: "🇳🇱 NL", en: "🇬🇧 EN", de: "🇩🇪 DE", fr: "🇫🇷 FR" };

interface PageRecord { slug: string; lang: string; title: string; content: string; }

interface KennisbankEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

function KennisbankTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<KennisbankEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => { loadEntries(); }, []);

  async function loadEntries() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/kennisbank", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setEntries(data);
    } catch {
      toast({ title: "Fout", description: "Kon kennisbank niet laden", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function addEntry() {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({ title: "Vul titel en inhoud in", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/kennisbank", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: newTitle, content: newContent }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Toegevoegd" });
      setNewTitle("");
      setNewContent("");
      setIsAdding(false);
      await loadEntries();
    } catch {
      toast({ title: "Fout", description: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id: number) {
    if (!editTitle.trim() || !editContent.trim()) {
      toast({ title: "Vul titel en inhoud in", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/kennisbank/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Opgeslagen" });
      setEditingId(null);
      await loadEntries();
    } catch {
      toast({ title: "Fout", description: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(id: number) {
    if (!confirm("Weet je zeker dat je dit item wilt verwijderen?")) return;
    try {
      const res = await fetch(`/api/admin/kennisbank/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast({ title: "Verwijderd" });
      await loadEntries();
    } catch {
      toast({ title: "Fout", description: "Verwijderen mislukt", variant: "destructive" });
    }
  }

  function startEdit(entry: KennisbankEntry) {
    setEditingId(entry.id);
    setEditTitle(entry.title);
    setEditContent(entry.content);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary">Kennisbank</h2>
          <p className="text-sm text-muted-foreground mt-1">Beheer de kennisbank die door Quootje (de chatbot) wordt gebruikt om vragen te beantwoorden.</p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nieuw item
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white border border-border rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-secondary mb-4">Nieuw kennisbank-item</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Titel</label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Bijv. Veelgestelde vragen over betalingen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Inhoud</label>
              <textarea
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Schrijf hier de kennisbank-tekst. Gebruik Markdown voor opmaak."
                rows={8}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Opslaan
              </Button>
              <Button variant="outline" onClick={() => { setIsAdding(false); setNewTitle(""); setNewContent(""); }}>
                <X className="w-4 h-4" /> Annuleren
              </Button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Nog geen kennisbank-items</p>
          <p className="text-sm mt-1">Voeg je eerste item toe met de knop hierboven.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white border border-border rounded-xl overflow-hidden">
              {editingId === entry.id ? (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Titel</label>
                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-1">Inhoud</label>
                    <textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => saveEdit(entry.id)} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Opslaan
                    </Button>
                    <Button variant="outline" onClick={() => setEditingId(null)}>
                      <X className="w-4 h-4" /> Annuleren
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-secondary">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3 whitespace-pre-line">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Bijgewerkt: {new Date(entry.updated_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(entry)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteEntry(entry.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800">
        <strong>Tip:</strong> De inhoud van de kennisbank wordt gebruikt door Quootje om vragen van gebruikers te beantwoorden. Gebruik duidelijke en volledige teksten voor de beste resultaten.
      </div>
    </div>
  );
}

function PaginasTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [pages, setPages] = useState<PageRecord[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(PAGE_SLUGS[0].slug);
  const [selectedLang, setSelectedLang] = useState<Language>("nl");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPages(); }, []);

  async function loadPages() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pages", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (Array.isArray(data)) setPages(data);
    } catch {
      toast({ title: "Fout", description: "Kon pagina's niet laden", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const found = pages.find(p => p.slug === selectedSlug && p.lang === selectedLang);
    setTitle(found?.title ?? "");
    setContent(found?.content ?? "");
  }, [selectedSlug, selectedLang, pages]);

  async function savePage() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${selectedSlug}/${selectedLang}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) { const d = await res.json(); toast({ title: "Fout", description: d.error, variant: "destructive" }); return; }
      toast({ title: "Opgeslagen" });
      await loadPages();
    } catch {
      toast({ title: "Fout", description: "Opslaan mislukt", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary">Paginabeheer</h2>
          <p className="text-sm text-muted-foreground mt-1">Beheer de inhoud van de footerpagina's per taal. Je kunt HTML gebruiken voor opmaak.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-xl overflow-hidden">
            {PAGE_SLUGS.map(({ slug, label }) => (
              <button
                key={slug}
                onClick={() => setSelectedSlug(slug)}
                className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-border last:border-b-0 transition-colors flex items-center gap-2 ${selectedSlug === slug ? "bg-primary/10 text-primary" : "hover:bg-muted text-secondary"}`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              {PAGE_LANGS.map(l => (
                <button
                  key={l}
                  onClick={() => setSelectedLang(l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${selectedLang === l ? "bg-primary text-white" : "bg-muted text-secondary hover:bg-muted/80"}`}
                >
                  {LANG_LABELS[l]}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <PageEditor
                title={title}
                content={content}
                saving={saving}
                selectedSlug={selectedSlug}
                onTitleChange={setTitle}
                onContentChange={setContent}
                onSave={savePage}
              />
            )}
          </div>
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <strong>Tip:</strong> Gebruik <strong>Markdown</strong> voor opmaak: <code>**vet**</code> → <strong>vet</strong>, <code>_cursief_</code> → <em>cursief</em>, <code># Koptekst</code>, <code>- lijstitem</code>. Klik op "Voorbeeld" om het resultaat te bekijken.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Logboek Tab ────────────────────────────────────────────────────────────

interface LogEntry {
  id: number;
  category: "LOGIN" | "LOGOUT" | "ERROR";
  message: string;
  user_id: number | null;
  user_email: string | null;
  error_code: string | null;
  log_date: string;
  log_time: string;
  created_at: string;
}

type LogSort = "created_at" | "user_email" | "message" | "category";
type LogDir  = "asc" | "desc";

const CAT_COLORS: Record<string, string> = {
  LOGIN:  "bg-green-100 text-green-800 border-green-200",
  LOGOUT: "bg-blue-100 text-blue-800 border-blue-200",
  ERROR:  "bg-red-100 text-red-800 border-red-200",
};

function LogboekTab() {
  const { token } = useUserAuth();
  const [logs, setLogs]         = useState<LogEntry[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [category, setCategory] = useState<string>("");
  const [sort, setSort]         = useState<LogSort>("created_at");
  const [dir, setDir]           = useState<LogDir>("desc");
  const [page, setPage]         = useState(1);
  const limit = 50;

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sort,
        dir,
      });
      if (category) params.set("category", category);
      const r = await fetch(`/api/admin/logs?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("Fout bij ophalen logboek");
      const data = await r.json();
      setLogs(data.logs);
      setTotal(data.total);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [token, category, sort, dir, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  function toggleSort(col: LogSort) {
    if (sort === col) {
      setDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSort(col);
      setDir(col === "created_at" ? "desc" : "asc");
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: LogSort }) {
    if (sort !== col) return <ChevronsUpDown className="w-3 h-3 ml-1 opacity-40" />;
    return dir === "asc"
      ? <ChevronUp className="w-3 h-3 ml-1 text-primary" />
      : <ChevronDown className="w-3 h-3 ml-1 text-primary" />;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-primary" /> Logboek
          <span className="text-sm font-normal text-muted-foreground ml-2">{total} regel{total !== 1 ? "s" : ""} (max 60 dagen bewaard)</span>
        </h2>
        <Button variant="outline" size="sm" onClick={fetchLogs} className="flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
        </Button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["", "LOGIN", "LOGOUT", "ERROR"] as const).map(cat => (
          <button
            key={cat || "all"}
            onClick={() => { setCategory(cat); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              category === cat
                ? cat === "LOGIN"  ? "bg-green-600 text-white border-green-600"
                : cat === "LOGOUT" ? "bg-blue-600 text-white border-blue-600"
                : cat === "ERROR"  ? "bg-red-600 text-white border-red-600"
                : "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
            }`}
          >
            {cat || "Alle categorieën"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              <th
                className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-secondary whitespace-nowrap"
                onClick={() => toggleSort("created_at")}
              >
                <span className="flex items-center">Datum <SortIcon col="created_at" /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Tijd</th>
              <th
                className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-secondary whitespace-nowrap"
                onClick={() => toggleSort("category")}
              >
                <span className="flex items-center">Categorie <SortIcon col="category" /></span>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-secondary whitespace-nowrap"
                onClick={() => toggleSort("user_email")}
              >
                <span className="flex items-center">Gebruiker <SortIcon col="user_email" /></span>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-secondary"
                onClick={() => toggleSort("message")}
              >
                <span className="flex items-center">Melding <SortIcon col="message" /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">Foutnummer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  Geen logregels gevonden
                </td>
              </tr>
            ) : (
              logs.map((log, i) => (
                <tr key={log.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}>
                  <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{log.log_date}</td>
                  <td className="px-4 py-2.5 font-mono text-xs whitespace-nowrap">{log.log_time}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${CAT_COLORS[log.category] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                      {log.category}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[180px] truncate" title={log.user_email ?? ""}>
                    {log.user_email ?? <span className="italic text-muted-foreground/50">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-xs max-w-[320px]">{log.message}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {log.error_code ?? <span className="italic opacity-40">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">Pagina {page} van {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Vorige</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Volgende</Button>
          </div>
        </div>
      )}
    </div>
  );
}
