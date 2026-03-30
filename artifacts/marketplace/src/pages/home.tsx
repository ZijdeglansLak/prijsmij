import { Layout } from "@/components/layout";
import { AnimatedCounter } from "@/components/animated-counter";
import { RequestCard } from "@/components/request-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBag, Store, Zap, ShieldCheck } from "lucide-react";
import { useGetStats, useListCategories, useListRequests } from "@workspace/api-client-react";
import { useI18n } from "@/contexts/i18n";

export default function Home() {
  const { data: stats } = useGetStats();
  const { data: categories } = useListCategories();
  const { data: recentRequests } = useListRequests();
  const { t } = useI18n();

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
              <Link
                href="/request/new"
                className="px-8 py-4 rounded-xl font-bold text-lg bg-primary text-primary-foreground shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t.home.ctaPost} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/requests"
                className="px-8 py-4 rounded-xl font-bold text-lg bg-white text-secondary border-2 border-border shadow-sm hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex items-center justify-center"
              >
                {t.home.ctaView}
              </Link>
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

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-4">{t.home.what}</h2>
              <p className="text-muted-foreground">{t.home.whatSub}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories?.map((cat, i) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                key={cat.id}
              >
                <Link href={`/requests?categoryId=${cat.id}`} className="group block h-full">
                  <div className="bg-muted/30 rounded-2xl p-6 h-full border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all duration-300 text-center">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
                      {cat.icon}
                    </div>
                    <h3 className="font-bold text-lg text-secondary mb-1">{cat.name}</h3>
                    <p className="text-xs font-semibold text-primary">{cat.activeRequestCount} {t.home.active}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Requests Section */}
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
