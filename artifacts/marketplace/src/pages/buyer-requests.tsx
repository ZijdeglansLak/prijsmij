import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useUserAuth } from "@/contexts/user-auth";
import { Bell, RefreshCw, Loader2, Tag, ShoppingBag, ArrowRight, Euro, CheckCircle2, Clock, Mail, Package } from "lucide-react";
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

interface MyBid {
  bidId: number;
  requestId: number;
  requestTitle: string;
  requestBrand: string;
  supplierStore: string;
  supplierName: string;
  supplierEmail: string | null;
  price: number;
  modelName: string;
  interestAt: string;
  isPurchased: boolean;
  isExpired: boolean;
}

export default function BuyerRequests() {
  const [, setLocation] = useLocation();
  const { user, token, isBuyer, isLoggedIn } = useUserAuth();
  const [requests, setRequests] = useState<ConsumerRequest[]>([]);
  const [myBids, setMyBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { setLocation("/auth/login"); return; }
    if (!isBuyer) { setLocation("/"); return; }
    fetchAll();
  }, [isLoggedIn, isBuyer]);

  async function fetchAll() {
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [rRes, bRes] = await Promise.all([
        fetch(`/api/consumer/requests?email=${encodeURIComponent(user!.email)}`),
        fetch(`/api/consumer/my-bids`, { headers }),
      ]);
      if (rRes.ok) setRequests(await rRes.json());
      if (bRes.ok) setMyBids(await bRes.json());
    } finally {
      setLoading(false);
    }
  }

  const withBids = requests.filter(r => r.bidCount > 0);
  const totalBids = requests.reduce((sum, r) => sum + r.bidCount, 0);

  const accepted = myBids.filter(b => b.isPurchased);
  const pending = myBids.filter(b => !b.isPurchased);
  const sortedMyBids = [...accepted, ...pending];

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Section 1: Bids I expressed interest in */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-secondary">Mijn biedingen</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {sortedMyBids.length > 0
                    ? `${sortedMyBids.length} bieding${sortedMyBids.length !== 1 ? "en" : ""} waarbij je interesse hebt getoond`
                    : "Zodra je interesse toont in een bieding, zie je dat hier"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Vernieuwen
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedMyBids.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-secondary">Nog geen biedingen</p>
              <p className="text-sm text-muted-foreground mt-1">Bekijk uitvragen en toon interesse in een bieding.</p>
              <Link href="/requests">
                <Button className="mt-4" size="sm" variant="outline">Bekijk uitvragen</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedMyBids.map((b) => (
                <div
                  key={b.bidId}
                  className={`bg-white rounded-2xl border shadow-sm p-5 ${b.isPurchased ? "border-green-300 ring-1 ring-green-100" : "border-border"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {b.isPurchased ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" /> Geaccepteerd
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> Wacht op leverancier
                          </span>
                        )}
                        {b.isExpired && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">Verlopen</span>
                        )}
                      </div>

                      <Link href={`/requests/${b.requestId}`}>
                        <h3 className="font-bold text-secondary text-base hover:text-primary transition-colors">
                          {b.requestTitle}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">{b.modelName}</p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5 font-bold text-secondary">
                          <Euro className="w-3.5 h-3.5 text-primary" />
                          € {b.price.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Tag className="w-3.5 h-3.5" />
                          {b.supplierStore}
                        </span>
                      </div>

                      {b.isPurchased && b.supplierEmail ? (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 space-y-1.5">
                          <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">Contactgegevens leverancier</p>
                          <p className="font-semibold text-secondary">{b.supplierName} · {b.supplierStore}</p>
                          <a href={`mailto:${b.supplierEmail}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                            <Mail className="w-3.5 h-3.5 shrink-0" /> {b.supplierEmail}
                          </a>
                        </div>
                      ) : !b.isPurchased ? (
                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                          <Clock className="w-4 h-4 shrink-0" />
                          De leverancier wordt op de hoogte gesteld en neemt snel contact op.
                        </div>
                      ) : null}
                    </div>

                    <Link href={`/requests/${b.requestId}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: All my requests */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-secondary">Mijn uitvragen</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalBids > 0
                  ? `${totalBids} bieding${totalBids !== 1 ? "en" : ""} ontvangen op ${withBids.length} uitvra${withBids.length !== 1 ? "gen" : "ag"}`
                  : "Zodra winkels op jouw uitvraag bieden, zie je dat hier"}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
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
        </section>
      </div>
    </Layout>
  );
}
