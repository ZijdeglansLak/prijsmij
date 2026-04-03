import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useUserAuth } from "@/contexts/user-auth";
import { Bell, ShoppingCart, ArrowRight, RefreshCw, Loader2, User, Mail, Calendar, Euro, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeadBid {
  bidId: number;
  requestId: number;
  requestTitle: string;
  price: number;
  modelName: string;
  buyerName: string;
  buyerEmail: string;
  interestAt: string;
  alreadyConnected: boolean;
}

export default function SupplierLeads() {
  const [, setLocation] = useLocation();
  const { token, isSeller } = useUserAuth();
  const [leads, setLeads] = useState<LeadBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !isSeller) { setLocation("/auth/login"); return; }
    fetchLeads();
  }, [token]);

  async function fetchLeads() {
    setLoading(true);
    try {
      const r = await fetch("/api/supplier/interested-bids", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setLeads(await r.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-secondary">Geïnteresseerde kopers</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Kopers die interesse hebben getoond in jouw biedingen</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads} className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">Nog geen geïnteresseerde kopers</p>
            <p className="text-sm mt-2">Zodra een koper interesse toont in jouw bieding, verschijnt dat hier.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.bidId}
                className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-1">Uitvraag</p>
                    <h3 className="font-bold text-secondary text-base truncate">{lead.requestTitle}</h3>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Euro className="w-3.5 h-3.5" />
                        <strong className="text-secondary">€ {Number(lead.price).toFixed(2)}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-3.5 h-3.5" /> {lead.modelName}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/60 flex flex-wrap gap-3 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-medium text-secondary">{lead.buyerName}</span>
                      </span>
                      {lead.alreadyConnected ? (
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" /> {lead.buyerEmail}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-muted-foreground italic text-xs">
                          <Mail className="w-3.5 h-3.5" /> E-mailadres zichtbaar na kopen
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(lead.interestAt).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {lead.alreadyConnected ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                        ✓ Lead gekocht
                      </span>
                    ) : (
                      <Link href={`/requests/${lead.requestId}`}>
                        <Button size="sm" className="flex items-center gap-2 whitespace-nowrap">
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Lead kopen
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Link href="/supplier/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              ← Terug naar dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
