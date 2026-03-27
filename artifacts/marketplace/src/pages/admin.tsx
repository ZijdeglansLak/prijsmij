import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useListCategories, useCreateCategory } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Settings, Trash2, Users, ShieldCheck, Store, ShoppingBag, ChevronDown, ChevronUp, Key, User2, WifiOff, Wifi } from "lucide-react";
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

function CategoriesTab() {
  const { data: categories, refetch } = useListCategories();
  const createMutation = useCreateCategory();
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<any[]>([]);

  const handleAddField = () => {
    setFields([...fields, { key: `field_${Date.now()}`, label: "Nieuw Veld", type: "text", required: false }]);
  };

  const updateField = (index: number, key: string, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({ data: { name, slug, icon, description, fields } });
      toast({ title: "Categorie toegevoegd!" });
      setIsAdding(false);
      setName(""); setSlug(""); setIcon(""); setDescription(""); setFields([]);
      refetch();
    } catch (e) {
      toast({ title: "Fout bij opslaan", variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Categorieën</h2>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-secondary text-white">
          <Plus className="w-4 h-4 mr-2" /> Nieuwe Categorie
        </Button>
      </div>

      {isAdding && (
        <div className="bg-card p-6 rounded-2xl border border-primary/30 shadow-lg mb-8">
          <h3 className="text-xl font-bold mb-4">Nieuwe categorie toevoegen</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div><label className="text-sm font-bold">Naam</label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div><label className="text-sm font-bold">Slug</label><Input value={slug} onChange={e => setSlug(e.target.value)} /></div>
            <div><label className="text-sm font-bold">Icoon (emoji)</label><Input value={icon} onChange={e => setIcon(e.target.value)} /></div>
            <div><label className="text-sm font-bold">Beschrijving</label><Input value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold">Template Velden</h4>
              <Button variant="outline" size="sm" onClick={handleAddField}><Plus className="w-3 h-3 mr-1"/> Veld toevoegen</Button>
            </div>
            <div className="space-y-3">
              {fields.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-muted p-3 rounded-lg">
                  <Input placeholder="Veld Label" value={f.label} onChange={e => updateField(i, 'label', e.target.value)} className="w-1/3 bg-white" />
                  <Input placeholder="Tech Key" value={f.key} onChange={e => updateField(i, 'key', e.target.value)} className="w-1/4 bg-white" />
                  <select className="border border-input rounded-md px-2 h-10 bg-white" value={f.type} onChange={e => updateField(i, 'type', e.target.value)}>
                    <option value="text">Text</option>
                    <option value="number">Nummer</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.required} onChange={e => updateField(i, 'required', e.target.checked)} /> Verplicht</label>
                  <button onClick={() => removeField(i)} className="p-2 text-destructive hover:bg-destructive/10 rounded-md ml-auto"><Trash2 className="w-4 h-4"/></button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button variant="outline" onClick={() => setIsAdding(false)}>Annuleren</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending} className="bg-primary text-white">Opslaan</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories?.map(cat => (
          <div key={cat.id} className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="text-4xl mb-4">{cat.icon}</div>
            <h3 className="text-xl font-bold text-secondary mb-2">{cat.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">{cat.description}</p>
            <div className="text-xs font-semibold bg-primary/10 text-primary inline-block px-3 py-1 rounded-full">
              {cat.activeRequestCount} actieve uitvragen
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);

  // New admin form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { toast({ title: "Fout bij laden", variant: "destructive" }); return; }
      setUsers(await res.json());
      setLoaded(true);
    } catch {
      toast({ title: "Fout bij laden", variant: "destructive" });
    } finally { setLoading(false); }
  }

  async function handleUpdate(id: number, updates: object) {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });
      if (!res.ok) { toast({ title: "Fout bij opslaan", variant: "destructive" }); return; }
      const updated = await res.json();
      setUsers(prev => prev?.map(u => u.id === id ? updated : u) ?? null);
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
      if (!res.ok) { toast({ title: "Fout", description: data.error, variant: "destructive" }); return; }
      setUsers(prev => prev ? [...prev, data] : [data]);
      toast({ title: "Beheerder aangemaakt" });
      setShowCreateAdmin(false); setNewName(""); setNewEmail(""); setNewPassword("");
    } catch {
      toast({ title: "Fout", variant: "destructive" });
    } finally { setCreating(false); }
  }

  if (!loaded) {
    return (
      <div className="text-center py-12">
        <Button onClick={loadUsers} disabled={loading}>
          {loading ? "Laden..." : "Gebruikers laden"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Gebruikers ({users?.length ?? 0})</h2>
        <Button onClick={() => setShowCreateAdmin(!showCreateAdmin)}>
          <Plus className="w-4 h-4 mr-2" /> Nieuwe beheerder
        </Button>
      </div>

      {showCreateAdmin && (
        <div className="bg-card p-6 rounded-2xl border border-primary/30 mb-6">
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

      <div className="space-y-3">
        {users?.map(u => (
          <UserRow key={u.id} user={u} isEditing={editingId === u.id} onToggleEdit={() => setEditingId(editingId === u.id ? null : u.id)} onSave={updates => handleUpdate(u.id, updates)} />
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { token } = useUserAuth();
  const { toast } = useToast();
  const [offlineMode, setOfflineMode] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setOfflineMode(d.offlineMode ?? false))
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

  if (offlineMode === null) return <p className="text-muted-foreground">Laden...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-bold mb-6">Site-instellingen</h2>

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
              <span
                className={`block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 absolute top-1 ${offlineMode ? "translate-x-1" : "translate-x-8"}`}
              />
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
          <Button
            onClick={toggleOffline}
            disabled={saving}
            variant={offlineMode ? "default" : "destructive"}
            className={offlineMode ? "bg-green-600 hover:bg-green-700 text-white" : ""}
          >
            {saving ? "Opslaan..." : offlineMode ? "Site online zetten" : "Site offline zetten"}
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-xl">
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
