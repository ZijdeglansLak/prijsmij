import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
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
  const { t } = useI18n();
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
      const authHeader: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [rRes, bRes] = await Promise.all([
        fetch(`/api/consumer/requests?email=${encodeURIComponent(user!.email)}`),
        fetch(`/api/consumer/my-bids`, { headers: authHeader }),
      ]);
      if (rRes.ok) setRequests(await rRes.json());
      if (bRes.ok) setMyBids(await bRes.json());
    } finally {
      setLoading(false);
    }
  }

  const accepted = myBids.filter((b) => b.isPurchased);
  const pending = myBids.filter((b) => !b.isPurchased);
  const sortedMyBids = [...accepted, ...pending];

  const withBids = requests.filter((r) => r.bidCount > 0);
  const totalBids = requests.reduce((s, r) => s + r.bidCount, 0);

  const tr = t.buyerRequests;

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
                <h1 className="text-2xl font-extrabold text-secondary">{tr.myBids}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {sortedMyBids.length > 0
                    ? `${sortedMyBids.length} ${sortedMyBids.length !== 1 ? tr.bidPlural : tr.bidSingular} ${tr.interestShown}`
                    : tr.myBidsEmpty}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={fetchAll} className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> {tr.refresh}
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedMyBids.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-secondary">{tr.noBids}</p>
              <p className="text-sm text-muted-foreground mt-1">{tr.noBidsDesc}</p>
              <Link href="/requests">
                <Button className="mt-4" size="sm" variant="outline">{tr.viewRequests}</Button>
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
                            <CheckCircle2 className="w-3 h-3" /> {tr.accepted}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
                            <Clock className="w-3 h-3" /> {tr.waitingSupplier}
                          </span>
                        )}
                        {b.isExpired && (
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{t.common.expired}</span>
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
                          <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-2">{tr.supplierContact}</p>
                          <p className="font-semibold text-secondary">{b.supplierName} · {b.supplierStore}</p>
                          <a href={`mailto:${b.supplierEmail}`} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                            <Mail className="w-3.5 h-3.5 shrink-0" /> {b.supplierEmail}
                          </a>
                        </div>
                      ) : !b.isPurchased ? (
                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
                          <Clock className="w-4 h-4 shrink-0" />
                          {tr.supplierNotification}
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
              <h2 className="text-2xl font-extrabold text-secondary">{tr.myRequests}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {totalBids > 0
                  ? `${totalBids} ${totalBids !== 1 ? tr.bidPlural : tr.bidSingular} ${tr.bidsReceived} ${withBids.length} ${withBids.length !== 1 ? tr.requestPlural : tr.requestSingular}`
                  : tr.myRequestsEmpty}
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
              <p className="font-semibold text-lg">{tr.noRequests}</p>
              <p className="text-sm mt-2">{tr.noRequestsDesc}</p>
              <Link href="/request/new">
                <Button className="mt-5">{t.nav.postRequest}</Button>
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
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">{t.common.expired}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-secondary text-base">{req.title}</h3>

                        {req.bidCount > 0 && (
                          <div className="mt-2 flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-1.5 font-semibold text-primary">
                              <Tag className="w-3.5 h-3.5" />
                              {req.bidCount} {req.bidCount !== 1 ? tr.bidPlural : tr.bidSingular}
                            </span>
                            {req.lowestBidPrice !== null && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Euro className="w-3.5 h-3.5" />
                                {tr.lowest} <strong className="text-secondary">€ {Number(req.lowestBidPrice).toFixed(2)}</strong>
                                {req.lowestBidStore && <span>{tr.from} {req.lowestBidStore}</span>}
                              </span>
                            )}
                          </div>
                        )}

                        {req.bidCount === 0 && (
                          <p className="mt-1 text-sm text-muted-foreground italic">{tr.noBidsReceived}</p>
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
