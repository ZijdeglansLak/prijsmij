import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Trash2, Users, ShieldCheck, Store, ShoppingBag, ChevronDown, ChevronUp, Key, User2, WifiOff, Wifi, Pencil, X, Check, Download, Search, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";

type Tab = "categories" | "users" | "settings";

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
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold">Beheer</h1>
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
        </div>

        {tab === "categories" && <CategoriesTab />}
        {tab === "users" && <UsersTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </Layout>
  );
}

interface CategoryRecord {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
  activeRequestCount: number;
}

function CategoriesTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryRecord[] | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  // New category form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setCategories(d))
      .catch(() => toast({ title: "Fout bij laden categorieën", variant: "destructive" }));
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
            <div><label className="text-xs font-bold mb-1 block">Icoon (emoji)</label><Input value={icon} onChange={e => setIcon(e.target.value)} placeholder="🛒" /></div>
            <div><label className="text-xs font-bold mb-1 block">Beschrijving</label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleCreate} disabled={adding}>{adding ? "Aanmaken..." : "Aanmaken"}</Button>
            <Button variant="outline" onClick={() => setIsAdding(false)}>Annuleren</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {categories.map(cat => (
          <CategoryCard
            key={cat.id}
            cat={cat}
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

function CategoryCard({ cat, isEditing, isSaving, onEdit, onSave, onCancel, onToggleActive }: {
  cat: CategoryRecord;
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

  useEffect(() => {
    setName(cat.name); setIcon(cat.icon); setDescription(cat.description);
  }, [cat]);

  return (
    <div className={`rounded-2xl border-2 overflow-hidden transition-colors ${cat.isActive ? "border-border bg-card" : "border-dashed border-muted-foreground/30 bg-muted/30"}`}>
      <div className="p-5">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={icon} onChange={e => setIcon(e.target.value)} className="w-20 text-2xl text-center" placeholder="🛒" />
              <Input value={name} onChange={e => setName(e.target.value)} className="flex-1 font-bold" />
            </div>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Beschrijving..." />
            <div className="flex gap-2 pt-1">
              <Button size="sm" disabled={isSaving} onClick={() => onSave({ name, icon, description })}>
                <Check className="w-3 h-3 mr-1" /> {isSaving ? "Opslaan..." : "Opslaan"}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3 h-3 mr-1" /> Annuleren</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="text-4xl">{cat.icon}</div>
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
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                {cat.activeRequestCount} uitvragen
              </span>
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
            <UserRow key={u.id} user={u} isEditing={editingId === u.id} onToggleEdit={() => setEditingId(editingId === u.id ? null : u.id)} onSave={updates => handleUpdate(u.id, updates)} />
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

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        setOfflineMode(d.offlineMode ?? false);
        setPaynlServiceId(d.paynlServiceId ?? "");
        setPaynlToken(d.paynlTokenMasked ?? "");
        setPaynlConfigured(d.paynlConfigured ?? false);
      })
      .catch(() => setOfflineMode(false));
  }, [token]);

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
      if (paynlToken && !paynlToken.startsWith("****")) body.paynlToken = paynlToken;
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
          <Button type="submit" disabled={savingPaynl}>
            {savingPaynl ? "Opslaan..." : "Pay.nl opslaan"}
          </Button>
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

function UserRow({ user, isEditing, onToggleEdit, onSave }: { user: UserRecord; isEditing: boolean; onToggleEdit: () => void; onSave: (u: object) => void }) {
  const [contactName, setContactName] = useState(user.contactName);
  const [email, setEmail] = useState(user.email);
  const [storeName, setStoreName] = useState(user.storeName ?? "");
  const [role, setRole] = useState(user.role);
  const [isAdmin, setIsAdmin] = useState(user.isAdmin);
  const [newPassword, setNewPassword] = useState("");

  const roleIcon = user.isAdmin ? <ShieldCheck className="w-4 h-4 text-primary" /> : user.role === "seller" ? <Store className="w-4 h-4 text-blue-500" /> : <ShoppingBag className="w-4 h-4 text-green-500" />;
  const roleLabel = user.isAdmin ? "Beheerder" : user.role === "seller" ? "Verkoper" : "Koper";

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors" onClick={onToggleEdit}>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <User2 className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{user.contactName}</span>
            {roleIcon}
            <span className="text-xs text-muted-foreground">{roleLabel}</span>
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
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onSave({ contactName, email, storeName: storeName || undefined, role, isAdmin, newPassword: newPassword || undefined })}>Opslaan</Button>
            <Button size="sm" variant="outline" onClick={onToggleEdit}>Annuleren</Button>
          </div>
        </div>
      )}
    </div>
  );
}
