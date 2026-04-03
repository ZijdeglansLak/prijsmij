import { Layout } from "@/components/layout";
import { AnimatedCounter } from "@/components/animated-counter";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Store, Zap, ShieldCheck, Clock, TrendingDown, Bell, Star } from "lucide-react";
import { useGetStats, useListCategories, useListRequests } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18n";
import { useUserAuth } from "@/contexts/user-auth";
import { useSupplierAuth } from "@/contexts/supplier-auth";
import { useEffect, useState } from "react";
import { useCategoryGroups } from "@/hooks/use-category-groups";
import { IconDisplay } from "@/components/icon-picker";
const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/marketplace", "/api");

interface ConsumerRequest {
  id: number;
  title: string;
  brand: string;
  categoryName: string;
  categoryIcon: string;
  bidCount: number;
  lowestBidPrice: number | null;
  lowestBidStore: string | null;
  lowestBid: { id: number; supplierStore: string; price: number; modelName: string; hasInterest: boolean } | null;
  expiresAt: string;
  createdAt: string;
  isExpired: boolean;
}

interface SupplierRequest {
  id: number;
  title: string;
  brand: string;
  categoryName: string;
  categoryIcon: string;
  bidCount: number;
  lowestBidPrice: number | null;
  expiresAt: string;
}

interface InterestedBid {
  bidId: number;
  requestId: number;
  requestTitle: string;
  supplierStore: string;
  price: number;
  modelName: string;
  buyerName: string;
  buyerEmail: string;
  interestAt: string;
  alreadyConnected: boolean;
}

function timeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Verlopen";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}u`;
  return `${hours}u`;
}

function ConsumerDashboard({ email }: { email: string }) {
  const [requests, setRequests] = useState<ConsumerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/consumer/requests?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => { setRequests(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading) return null;
  if (requests.length === 0) return (
    <div className="text-center py-10 text-muted-foreground">
      Je hebt nog geen uitvragen geplaatst.{" "}
      <Link href="/request/new" className="text-primary font-semibold underline">Maak je eerste uitvraag</Link>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((r) => (
        <Link key={r.id} href={`/requests/${r.id}`}>
          <div className="bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{r.categoryIcon}</span>
              <span className="text-xs text-muted-foreground font-medium">{r.categoryName}</span>
              {r.isExpired && <span className="ml-auto text-xs bg-red-100 text-red-600 rounded-full px-2 py-0.5 font-semibold">Verlopen</span>}
            </div>
            <h3 className="font-bold text-secondary mb-1 line-clamp-2">{r.title}</h3>
            {r.brand && <p className="text-xs text-muted-foreground mb-3">{r.brand}</p>}
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">{r.bidCount} bod{r.bidCount === 1 ? "" : "den"}</span>
              {r.lowestBidPrice !== null && (
                <span className="flex items-center gap-1 text-green-600 font-bold">
                  <TrendingDown className="w-3 h-3" />€{r.lowestBidPrice.toFixed(2)}
                </span>
              )}
              {!r.isExpired && (
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="w-3 h-3" />{timeLeft(r.expiresAt)}
                </span>
              )}
            </div>
            {r.lowestBid && !r.lowestBid.hasInterest && !r.isExpired && (
              <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                Laagste bod: <span className="font-semibold text-secondary">{r.lowestBid.supplierStore}</span>
              </div>
            )}
            {r.lowestBid?.hasInterest && (
              <div className="mt-3 pt-3 border-t border-green-100">
                <span className="text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">✓ Interesse bevestigd</span>
              </div>
            )}
          </div>
        </Link>
      ))}
      <Link href="/request/new">
        <div className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-all cursor-pointer h-full min-h-[160px]">
          <ShoppingBag className="w-8 h-8 text-primary/60" />
          <span className="text-sm font-semibold text-primary">Nieuwe uitvraag plaatsen</span>
        </div>
      </Link>
    </div>
  );
}

function SellerDashboard({ token }: { token: string }) {
  const [categoryReqs, setCategoryReqs] = useState<SupplierRequest[]>([]);
  const [interestedBids, setInterestedBids] = useState<InterestedBid[]>([]);
  const [watchedCategoryCount, setWatchedCategoryCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API}/supplier/category-requests`, { headers }).then((r) => r.json()),
      fetch(`${API}/supplier/interested-bids`, { headers }).then((r) => r.json()),
      fetch(`${API}/supplier/notification-preferences`, { headers }).then((r) => r.json()),
    ]).then(([reqs, bids, notifData]) => {
      setCategoryReqs(Array.isArray(reqs) ? reqs : []);
      setInterestedBids(Array.isArray(bids) ? bids : []);
      setWatchedCategoryCount((notifData?.categoryIds ?? []).length);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  if (loading) return null;

  return (
    <div className="space-y-8">
      {interestedBids.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-xl text-secondary">Geïnteresseerde kopers</h3>
            <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{interestedBids.length}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interestedBids.slice(0, 4).map((b) => (
              <Link key={b.bidId} href={`/requests/${b.requestId}`}>
                <div className="bg-white rounded-2xl border border-amber-200 p-5 hover:border-amber-400 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-secondary line-clamp-2">{b.requestTitle}</h4>
                    {b.alreadyConnected && <span className="ml-2 text-xs bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold shrink-0">Verbonden</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{b.modelName} — <span className="font-semibold text-primary">€{b.price.toFixed(2)}</span></p>
                  <div className="text-xs text-muted-foreground">
                    Koper: <span className="font-semibold text-secondary">{b.buyerName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-xl text-secondary">Uitvragen in jouw categorieën</h3>
        </div>
        {categoryReqs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {watchedCategoryCount === 0 ? (
              <>
                Je hebt nog geen categorieën ingesteld.{" "}
                <Link href="/supplier/dashboard" className="text-primary font-semibold underline">Stel je categorieën in</Link>
              </>
            ) : (
              <>
                Geen actieve uitvragen op dit moment in jouw {watchedCategoryCount} categorie{watchedCategoryCount === 1 ? "" : "ën"}.{" "}
                <Link href="/requests" className="text-primary font-semibold underline">Bekijk alle uitvragen</Link>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryReqs.map((r) => (
              <Link key={r.id} href={`/requests/${r.id}`}>
                <div className="bg-white rounded-2xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{r.categoryIcon}</span>
                    <span className="text-xs text-muted-foreground font-medium">{r.categoryName}</span>
                  </div>
                  <h4 className="font-bold text-secondary mb-1 line-clamp-2">{r.title}</h4>
                  {r.brand && <p className="text-xs text-muted-foreground mb-3">{r.brand}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-primary">{r.bidCount} bod{r.bidCount === 1 ? "" : "den"}</span>
                    {r.lowestBidPrice !== null && (
                      <span className="flex items-center gap-1 text-green-600 font-bold text-xs">
                        <TrendingDown className="w-3 h-3" />€{r.lowestBidPrice.toFixed(2)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-muted-foreground text-xs">
                      <Clock className="w-3 h-3" />{timeLeft(r.expiresAt)}
                    </span>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-3 py-1 font-semibold">Bod plaatsen</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: categories } = useListCategories();
  const { groups: categoryGroups } = useCategoryGroups();
  const { data: recentRequests } = useListRequests();
  const { t } = useI18n();
  const { user, isBuyer, isSeller, isLoggedIn } = useUserAuth();
  const { token } = useSupplierAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
          <img
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
            alt="Marketplace background"
            className="w-full h-full object-cover opacity-[0.15] mix-blend-multiply"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-md border border-primary/20 text-primary font-semibold text-sm mb-8"
            >
              <Zap className="w-4 h-4" />
              <span>{t.home.badge}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-secondary leading-tight mb-6"
            >
              {t.home.heading1} <br/>
              <span className="text-gradient">{t.home.heading2}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
            >
              {t.home.subheading}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {!isSeller && !token && (
                <Link
                  href="/request/new"
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {t.home.ctaPost} <ArrowRight className="w-5 h-5" />
                </Link>
              )}
              {!(isLoggedIn && isBuyer) && (
                <Link
                  href="/requests"
                  className="px-8 py-4 rounded-xl font-bold text-lg bg-white text-secondary border-2 border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center"
                >
                  {t.home.ctaView}
                </Link>
              )}
            </motion.div>
          </div>

          {/* Stats Bar */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
            >
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-4xl font-display font-extrabold text-primary mb-2">
                  <AnimatedCounter value={stats.totalActiveRequests} />
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.stats.activeRequests}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-4xl font-display font-extrabold text-accent mb-2">
                  <AnimatedCounter value={stats.totalBidsToday} />
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.stats.bidsToday}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center">
                <div className="text-4xl font-display font-extrabold text-secondary mb-2">
                  <AnimatedCounter value={stats.totalSuppliersActive} />
                </div>
                <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t.stats.activeStores}</div>
              </div>
              <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-primary to-accent text-white border-none">
                <div className="text-4xl font-display font-extrabold mb-2">
                  <AnimatedCounter value={Math.round(stats.averageBidsPerRequest * 10) / 10} formatter={(v) => v.toString()} />
                </div>
                <div className="text-sm font-semibold opacity-90 uppercase tracking-wider">{t.stats.avgBids}</div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Consumer Dashboard — logged-in buyers */}
      {isBuyer && user && (
        <section className="py-16 bg-gradient-to-b from-primary/5 to-white border-t border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-secondary">Welkom terug, {user.contactName.split(" ")[0]}!</h2>
                <p className="text-muted-foreground mt-1">Jouw actieve uitvragen en binnengekomen biedingen</p>
              </div>
              <Link href="/request/new">
                <Button className="gap-2">
                  <ShoppingBag className="w-4 h-4" />Nieuwe uitvraag
                </Button>
              </Link>
            </div>
            <ConsumerDashboard email={user.email} />
          </div>
        </section>
      )}

      {/* Seller Dashboard — logged-in sellers */}
      {isSeller && token && (
        <section className="py-16 bg-gradient-to-b from-primary/5 to-white border-t border-primary/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-secondary">Dashboard — {user?.storeName ?? user?.contactName}</h2>
                <p className="text-muted-foreground mt-1">Overzicht van uitvragen en geïnteresseerde kopers</p>
              </div>
              <Link href="/requests">
                <Button variant="outline" className="gap-2">
                  <Store className="w-4 h-4" />Alle uitvragen
                </Button>
              </Link>
            </div>
            <SellerDashboard token={token} />
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t.home.what}</h2>
              <p className="text-muted-foreground">{t.home.whatSub}</p>
            </div>
          </div>

          {(() => {
            if (!categories) return null;
            const grouped = categoryGroups.map(g => ({
              group: g,
              cats: categories.filter(c => c.groupId === g.id),
            })).filter(g => g.cats.length > 0);
            const ungrouped = categories.filter(c => !c.groupId || !categoryGroups.find(g => g.id === c.groupId));

            const CategoryCard = ({ cat, i }: { cat: typeof categories[0]; i: number }) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={cat.id}
              >
                <Link href={`/requests?categoryId=${cat.id}`} className="group block h-full">
                  <div className="bg-muted/30 rounded-2xl p-6 h-full border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center p-2 mb-4 group-hover:scale-110 group-hover:shadow-md transition-all overflow-hidden">
                      <IconDisplay value={cat.icon} size="lg" />
                    </div>
                    <h3 className="font-bold text-lg text-secondary mb-1">{cat.name}</h3>
                    <p className="text-xs font-semibold text-primary">{cat.activeRequestCount} {t.home.active}</p>
                  </div>
                </Link>
              </motion.div>
            );

            if (grouped.length === 0) {
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {categories.map((cat, i) => <CategoryCard key={cat.id} cat={cat} i={i} />)}
                </div>
              );
            }

            return (
              <div className="space-y-10">
                {grouped.map(({ group, cats }) => (
                  <div key={group.id}>
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 flex-shrink-0"><IconDisplay value={group.icon} size="sm" /></div>
                      <h3 className="text-xl font-bold text-secondary">{group.name}</h3>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {cats.map((cat, i) => <CategoryCard key={cat.id} cat={cat} i={i} />)}
                    </div>
                  </div>
                ))}
                {ungrouped.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-5">
                      <h3 className="text-xl font-bold text-secondary">Overig</h3>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                      {ungrouped.map((cat, i) => <CategoryCard key={cat.id} cat={cat} i={i} />)}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* Recent Requests Section — hidden for logged-in sellers (they see their own dashboard) */}
      {!isSeller && (
        <section className="py-24 bg-muted/30 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">{t.home.popularTitle}</h2>
                <p className="text-muted-foreground">{t.home.popularSub}</p>
              </div>
              <Link href="/requests" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
                {t.home.viewAll} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRequests?.slice(0, 3).map((req, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={req.id}
                >
                  <RequestCard request={req} featured={i === 0} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">{t.home.howTitle}</h2>
            <p className="text-secondary-foreground/70 max-w-2xl mx-auto">{t.home.howSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0 opacity-30"></div>

            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-secondary-foreground/10 flex items-center justify-center mb-6 border border-white/10 backdrop-blur-sm">
                <ShoppingBag className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">1. {t.home.step1Title}</h3>
              <p className="text-secondary-foreground/70">{t.home.step1Text}</p>
            </div>

            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-secondary-foreground/10 flex items-center justify-center mb-6 border border-white/10 backdrop-blur-sm">
                <Store className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">2. {t.home.step2Title}</h3>
              <p className="text-secondary-foreground/70">{t.home.step2Text}</p>
            </div>

            <div className="relative text-center z-10">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">3. {t.home.step3Title}</h3>
              <p className="text-secondary-foreground/70">{t.home.step3Text}</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
