import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupplierAuth } from "@/contexts/supplier-auth";
import { Coins, Link2, ShoppingCart, LogOut, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface Connection {
  id: number;
  requestId: number;
  bidId: number;
  consumerName: string;
  consumerEmail: string;
  createdAt: string;
}

export default function SupplierDashboard() {
  const [, setLocation] = useLocation();
  const { supplier, token, logout, updateCredits } = useSupplierAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLocation("/supplier/login");
      return;
    }
    fetchData();
  }, [token]);

  async function fetchData() {
    setLoading(true);
    try {
      const [meRes, connRes] = await Promise.all([
        fetch("/api/supplier/me", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/supplier/me/connections", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (meRes.ok) {
        const me = await meRes.json();
        updateCredits(me.credits);
      }
      if (connRes.ok) {
        setConnections(await connRes.json());
      }
    } finally {
      setLoading(false);
    }
  }

  if (!supplier) return null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">{supplier.storeName}</h1>
              <p className="text-muted-foreground">{supplier.contactName} · {supplier.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { logout(); setLocation("/"); }}>
              <LogOut className="w-4 h-4 mr-2" />
              Uitloggen
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
                  <p className="text-sm text-muted-foreground">Credits</p>
                  <p className="text-3xl font-bold text-primary">{supplier.credits}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Link2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Connecties</p>
                  <p className="text-3xl font-bold">{connections.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-center justify-center">
              <CardContent className="p-6 w-full">
                <Link href="/supplier/credits">
                  <Button className="w-full" variant="default">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Credits kopen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Connections list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mijn connecties</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-muted-foreground text-sm">Laden...</p>
              ) : connections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="w-8 h-8 mx-auto mb-3 opacity-40" />
                  <p>Nog geen connecties</p>
                  <p className="text-sm mt-1">Ga naar een uitvraag en maak een connectie met een koper</p>
                  <Link href="/requests">
                    <Button className="mt-4" variant="outline" size="sm">Bekijk uitvragen</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y">
                  {connections.map((c) => (
                    <div key={c.id} className="py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{c.consumerName}</p>
                        <p className="text-sm text-primary font-mono">{c.consumerEmail}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(c.createdAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/requests/${c.requestId}`}>
                          <Button variant="outline" size="sm">Uitvraag bekijken</Button>
                        </Link>
                      </div>
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
