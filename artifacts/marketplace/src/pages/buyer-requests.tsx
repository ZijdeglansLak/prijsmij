import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useUserAuth } from "@/contexts/user-auth";
import { Bell, RefreshCw, Loader2, Tag, ShoppingBag, ArrowRight, Euro } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConsumerRequest {
  id: number;
  title: string;
  brand: string;
  categoryName: string;
  categoryIcon: string;
  bidCount: number;
  lowestBidPrice: number | null;
  lowestBidStore: string | null;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

export default function BuyerRequests() {
  const [, setLocation] = useLocation();
  const { user, isBuyer, isLoggedIn } = useUserAuth();
  const [requests, setRequests] = useState<ConsumerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLocation("/auth/login"); return; }
    if (!isBuyer) { setLocation("/"); return; }
    fetchRequests();
  }, [isLoggedIn, isBuyer]);

  async function fetchRequests() {
    setLoading(true);
    try {
      const r = await fetch(`/api/consumer/requests?email=${encodeURIComponent(user!.email)}`);
      if (r.ok) setRequests(await r.json());
    } finally {
      setLoading(false);
    }
  }

  const withBids = requests.filter(r => r.bidCount > 0);
  const totalBids = requests.reduce((sum, r) => sum + r.bidCount, 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-secondary">Biedingen op jouw uitvragen</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalBids > 0
                  ? `${totalBids} bieding${totalBids !== 1 ? "en" : ""} ontvangen op ${withBids.length} uitvra${withBids.length !== 1 ? "gen" : "ag"}`
                  : "Zodra winkels op jouw uitvraag bieden, zie je dat hier"}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchRequests} className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">Nog geen uitvragen geplaatst</p>
            <p className="text-sm mt-2">Plaats een uitvraag zodat winkels op jou kunnen bieden.</p>
            <Link href="/request/new">
              <Button className="mt-5">Uitvraag plaatsen</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Link key={req.id} href={`/requests/${req.id}`}>
                <div
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all cursor-pointer p-5 ${
                    req.bidCount > 0 ? "border-primary/30 hover:border-primary/60" : "border-border"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {req.categoryIcon && (
                          <span className="text-lg">{req.categoryIcon}</span>
                        )}
                        <span className="text-xs text-muted-foreground font-medium">{req.categoryName}</span>
                        {req.isExpired && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Verlopen</span>
                        )}
                      </div>
                      <h3 className="font-bold text-secondary text-base">{req.title}</h3>

                      {req.bidCount > 0 && (
                        <div className="mt-2 flex flex-wrap gap-3 text-sm">
                          <span className="flex items-center gap-1.5 font-semibold text-primary">
                            <Tag className="w-3.5 h-3.5" />
                            {req.bidCount} bieding{req.bidCount !== 1 ? "en" : ""}
                          </span>
                          {req.lowestBidPrice !== null && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <Euro className="w-3.5 h-3.5" />
                              Laagste: <strong className="text-secondary">€ {Number(req.lowestBidPrice).toFixed(2)}</strong>
                              {req.lowestBidStore && <span>van {req.lowestBidStore}</span>}
                            </span>
                          )}
                        </div>
                      )}

                      {req.bidCount === 0 && (
                        <p className="mt-1 text-sm text-muted-foreground italic">Nog geen biedingen ontvangen</p>
                      )}
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-2">
                      {req.bidCount > 0 && (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-xs font-bold">
                          {req.bidCount}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
