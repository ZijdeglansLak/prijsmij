import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { useToast } from "@/hooks/use-toast";
import { Coins, Link2, ShoppingCart, LogOut, RefreshCw, Bell, CheckCircle2, Phone, Mail, FileText, Download, Loader2, Building2, Camera } from "lucide-react";
import { AvatarUpload } from "@/components/user-avatar";
import { motion } from "framer-motion";

interface Connection {
  id: number;
  requestId: number;
  bidId: number;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string | null;
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  type: string;
  description: string;
  amountCents: number;
  vatPercent: number;
  vatCents: number;
  totalCents: number;
  sentAt: string | null;
  createdAt: string;
}

interface BillingProfile {
  companyName: string | null;
  vatNumber: string | null;
  billingAddress: string | null;
  billingPostcode: string | null;
  billingCity: string | null;
}

type DashTab = "overview" | "billing" | "invoices";

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { user, token, logout, updateCredits, isSeller } = useUserAuth();
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [watchedIds, setWatchedIds] = useState<number[]>([]);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashTab>("overview");

  useEffect(() => {
    if (!token || !isSeller) {
      setLocation("/auth/login");
      return;
    }
    fetchData();
  }, [token]);

  async function fetchData() {
    setLoading(true);
    try {
      const [meRes, connRes, catRes, notifRes] = await Promise.all([
        fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/supplier/me/connections", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/categories"),
        fetch("/api/supplier/notification-preferences", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        updateCredits(me.credits);
      }
      if (connRes.ok) {
        setConnections(await connRes.json());
      }
      if (catRes.ok) {
        setCategories(await catRes.json());
      }
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setWatchedIds(notifData.categoryIds ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(id: number) {
    setWatchedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setNotifSaved(false);
  }

  async function saveNotifications() {
    setSavingNotifs(true);
    try {
      await fetch("/api/supplier/notification-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ categoryIds: watchedIds }),
      });
      setNotifSaved(true);
      setTimeout(() => setNotifSaved(false), 3000);
    } finally {
      setSavingNotifs(false);
    }
  }

  if (!user || !isSeller) return null;

  const tabClass = (tab: DashTab) =>
    `flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition-colors -mb-px ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-secondary"}`;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">{user.storeName ?? user.contactName}</h1>
              <p className="text-muted-foreground">{user.contactName} · {user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="w-4 h-4 mr-2" />
              {t.nav.logout}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Coins className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.credits}</p>
                  <p className="text-3xl font-bold text-primary">{user.credits}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.connections}</p>
                  <p className="text-3xl font-bold">{connections.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center">
              <CardContent className="p-6 w-full">
                <Link href="/supplier/credits">
                  <Button className="w-full" variant="default">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {t.dashboard.buyCredits}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-border">
            <button className={tabClass("overview")} onClick={() => setActiveTab("overview")}>
              <Bell className="w-4 h-4" /> Overzicht
            </button>
            <button className={tabClass("billing")} onClick={() => setActiveTab("billing")}>
              <Building2 className="w-4 h-4" /> Factuurgegevens
            </button>
            <button className={tabClass("invoices")} onClick={() => setActiveTab("invoices")}>
              <FileText className="w-4 h-4" /> Mijn facturen
            </button>
          </div>

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Avatar */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-primary" />
                    Profielfoto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AvatarUpload />
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t.notifications.categoryTitle}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{t.notifications.categoryDesc}</p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground text-sm">{t.general.loading}</p>
                  ) : categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Geen categorieën beschikbaar.</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {categories.map(cat => (
                          <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                            <Checkbox
                              id={`cat-${cat.id}`}
                              checked={watchedIds.includes(cat.id)}
                              onCheckedChange={() => toggleCategory(cat.id)}
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {cat.icon} {(cat as any).nameI18n?.[lang] || cat.name}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={saveNotifications} disabled={savingNotifs} size="sm">
                          {savingNotifs ? t.general.loading : t.notifications.save}
                        </Button>
                        {notifSaved && (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {t.notifications.saved}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Connections list */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{t.dashboard.myConnections}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <p className="text-muted-foreground text-sm">{t.general.loading}</p>
                  ) : connections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Link2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                      <p>{t.dashboard.noConnections}</p>
                      <p className="text-sm mt-1">{t.dashboard.noConnectionsDesc}</p>
                      <Link href="/requests">
                        <Button className="mt-4" variant="outline" size="sm">{t.dashboard.viewRequests}</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {connections.map((c) => (
                        <div key={c.id} className="py-4 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-secondary">{c.consumerName}</p>
                            <div className="mt-1.5 space-y-1">
                              <a href={`mailto:${c.consumerEmail}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                                <Mail className="w-3.5 h-3.5 shrink-0" /> {c.consumerEmail}
                              </a>
                              {c.consumerPhone ? (
                                <a href={`tel:${c.consumerPhone}`} className="flex items-center gap-1.5 text-sm text-green-700 font-medium hover:underline">
                                  <Phone className="w-3.5 h-3.5 shrink-0" /> {c.consumerPhone}
                                </a>
                              ) : (
                                <span className="flex items-center gap-1.5 text-sm text-muted-foreground italic">
                                  <Phone className="w-3.5 h-3.5 shrink-0" /> Geen telefoonnummer opgegeven
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              Aangekocht op {new Date(c.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          <Link href={`/requests/${c.requestId}`}>
                            <Button variant="outline" size="sm">{t.dashboard.viewRequest}</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "billing" && <BillingTab token={token!} toast={toast} />}
          {activeTab === "invoices" && <InvoicesTab token={token!} toast={toast} />}
        </motion.div>
      </div>
    </Layout>
  );
}

function BillingTab({ token, toast }: { token: string; toast: ReturnType<typeof useToast>["toast"] }) {
  const [billing, setBilling] = useState<BillingProfile>({ companyName: null, vatNumber: null, billingAddress: null, billingPostcode: null, billingCity: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/supplier/billing", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setBilling(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/supplier/billing", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(billing),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Factuurgegevens opgeslagen" });
    } catch {
      toast({ title: "Fout bij opslaan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Factuurgegevens
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Deze gegevens worden gebruikt op jouw facturen en voor BTW-doeleinden.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium block mb-1">Bedrijfsnaam</label>
            <Input
              value={billing.companyName ?? ""}
              onChange={e => setBilling(b => ({ ...b, companyName: e.target.value }))}
              placeholder="Jouw bedrijfsnaam"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">BTW-nummer</label>
            <Input
              value={billing.vatNumber ?? ""}
              onChange={e => setBilling(b => ({ ...b, vatNumber: e.target.value }))}
              placeholder="bijv. NL123456789B01"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Factuuradres</label>
            <Input
              value={billing.billingAddress ?? ""}
              onChange={e => setBilling(b => ({ ...b, billingAddress: e.target.value }))}
              placeholder="Straat + huisnummer"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Postcode</label>
              <Input
                value={billing.billingPostcode ?? ""}
                onChange={e => setBilling(b => ({ ...b, billingPostcode: e.target.value }))}
                placeholder="1234 AB"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Plaats</label>
              <Input
                value={billing.billingCity ?? ""}
                onChange={e => setBilling(b => ({ ...b, billingCity: e.target.value }))}
                placeholder="Amsterdam"
              />
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Opslaan..." : "Factuurgegevens opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function InvoicesTab({ token, toast }: { token: string; toast: ReturnType<typeof useToast>["toast"] }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/invoices", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setInvoices(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  async function downloadPdf(inv: Invoice) {
    setDownloading(inv.id);
    try {
      const res = await fetch(`/api/invoices/${inv.id}/pdf`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Download mislukt");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${inv.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "PDF kon niet worden gedownload", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  }

  const fmtEuro = (cents: number) =>
    new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(cents / 100);
  const fmtDate = (s: string) =>
    new Date(s).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Mijn facturen
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">Overzicht van alle facturen voor jouw aankopen op PrijsMij.</p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
            <p>Nog geen facturen beschikbaar</p>
            <p className="text-sm mt-1">Facturen worden aangemaakt na elke aankoop van credits of leads.</p>
          </div>
        ) : (
          <div className="divide-y">
            {invoices.map(inv => (
              <div key={inv.id} className="py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-semibold text-primary">{inv.invoiceNumber}</span>
                    {inv.sentAt
                      ? <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">Verzonden</span>
                      : <span className="text-xs bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full">In verwerking</span>
                    }
                  </div>
                  <p className="text-sm text-secondary font-medium">{inv.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{fmtDate(inv.createdAt)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold">{fmtEuro(inv.totalCents)}</p>
                  <p className="text-xs text-muted-foreground">incl. {inv.vatPercent}% BTW</p>
                  <button
                    onClick={() => downloadPdf(inv)}
                    disabled={downloading === inv.id || !inv.sentAt}
                    className="mt-2 flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-40 ml-auto"
                  >
                    {downloading === inv.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
