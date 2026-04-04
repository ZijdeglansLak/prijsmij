import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { Coins, Link2, ShoppingCart, LogOut, RefreshCw, Bell, CheckCircle2, Phone, Mail } from "lucide-react";
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

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { user, token, logout, updateCredits, isSeller } = useUserAuth();
  const { t } = useI18n();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [watchedIds, setWatchedIds] = useState<number[]>([]);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifSaved, setNotifSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

          {/* Notification Preferences */}
          <Card className="mb-8">
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
                          {cat.icon} {cat.name}
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
        </motion.div>
      </div>
    </Layout>
  );
}
