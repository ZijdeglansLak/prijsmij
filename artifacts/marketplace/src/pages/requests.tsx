import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { RequestCard } from "@/components/request-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Store, LogIn } from "lucide-react";
import { useListRequests, useListCategories } from "@workspace/api-client-react";
import { useCategoryGroups } from "@/hooks/use-category-groups";
import type { ListRequestsOfferType } from "@workspace/api-client-react";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";

export default function RequestsPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const { isSeller, isLoggedIn, isAdmin } = useUserAuth();
  const { t, lang } = useI18n();
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined
  );
  const [offerType, setOfferType] = useState<ListRequestsOfferType | undefined>(undefined);

  const canSeeRequests = isLoggedIn;

  const { data: requests, isLoading } = useListRequests({
    search: search || undefined,
    categoryId,
    offerType,
    enabled: canSeeRequests,
  } as any);

  const { data: categories } = useListCategories();
  const { groups: categoryGroups } = useCategoryGroups();

  // Non-logged-in users see category overview
  if (!canSeeRequests) {
    return (
      <Layout>
        <div className="bg-secondary text-secondary-foreground py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold mb-4 text-white">{t.requests.title}</h1>
            <p className="text-secondary-foreground/70 text-lg max-w-2xl">{t.requests.subtitle}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-semibold px-4 py-2 rounded-full text-sm mb-4">
              <Store className="w-4 h-4" />
              {t.requests.sellerOnly}
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">{t.requests.sellerOnlyDesc}</p>
          </div>

          {/* Category grid as public teaser */}
          {categories && categories.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setLocation(isLoggedIn ? "/auth/register" : "/auth/login")}
                  className="group flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-primary/40 hover:shadow-md transition-all text-left"
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="text-center">
                    <p className="font-bold text-secondary text-sm">{(cat as any).nameI18n?.[lang] || cat.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="font-semibold text-primary">{cat.activeRequestCount}</span> {t.requests.activeRequests}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/login">
              <Button className="w-full sm:w-auto">
                <LogIn className="w-4 h-4 mr-2" />
                {t.requests.loginAsSeller}
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="outline" className="w-full sm:w-auto">
                <Store className="w-4 h-4 mr-2" />
                {t.auth.registerLink}
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-4 text-white">{t.requests.title}</h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl">
            {t.requests.subtitle}
          </p>
        </div>
      </div>

      <div className="bg-slate-50/80 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <div className="flex items-center gap-2 font-bold text-lg mb-6 pb-4 border-b border-border">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </div>

              {/* Search */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-2">{t.requests.search}</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Merk of titel..."
                    className="pl-9 bg-muted/50 border-transparent focus:bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">Categorie</label>
                <div className="space-y-1">
                  <button
                    onClick={() => setCategoryId(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryId === undefined ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}
                  >
                    {t.requests.allCategories}
                  </button>
                  {(() => {
                    if (!categories) return null;
                    const hasGroups = categoryGroups.length > 0;
                    if (!hasGroups) {
                      return categories.map(cat => (
                        <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${categoryId === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}>
                          <span className="flex items-center gap-2">{cat.icon} {(cat as any).nameI18n?.[lang] || cat.name}</span>
                          <span className="bg-white/50 text-xs py-0.5 px-2 rounded-md">{cat.activeRequestCount}</span>
                        </button>
                      ));
                    }
                    const grouped = categoryGroups.map(g => ({ group: g, cats: categories.filter(c => c.groupId === g.id) })).filter(g => g.cats.length > 0);
                    const ungrouped = categories.filter(c => !c.groupId || !categoryGroups.find(g => g.id === c.groupId));
                    return (
                      <>
                        {grouped.map(({ group, cats }) => (
                          <div key={group.id}>
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-3 pt-3 pb-1 flex items-center gap-1">
                              <span>{group.icon}</span> {group.name}
                            </p>
                            {cats.map(cat => (
                              <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${categoryId === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}>
                                <span className="flex items-center gap-2">{cat.icon} {(cat as any).nameI18n?.[lang] || cat.name}</span>
                                <span className="bg-white/50 text-xs py-0.5 px-2 rounded-md">{cat.activeRequestCount}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                        {ungrouped.map(cat => (
                          <button key={cat.id} onClick={() => setCategoryId(cat.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${categoryId === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}>
                            <span className="flex items-center gap-2">{cat.icon} {(cat as any).nameI18n?.[lang] || cat.name}</span>
                            <span className="bg-white/50 text-xs py-0.5 px-2 rounded-md">{cat.activeRequestCount}</span>
                          </button>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Offer Types */}
              <div>
                <label className="block text-sm font-semibold mb-3">Staat</label>
                <div className="space-y-2">
                  {(['any', 'new', 'refurbished', 'occasion'] as const).map((type) => {
                    const label = type === 'any' ? 'Alles' : type === 'new' ? t.requests.new : type === 'refurbished' ? t.requests.refurbished : t.requests.occasion;
                    return (
                      <button
                        key={type}
                        onClick={() => setOfferType(type === 'any' ? undefined : type)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          (type === 'any' && offerType === undefined) || offerType === type
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted text-secondary'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-[300px] rounded-2xl bg-muted animate-pulse"></div>
                ))}
              </div>
            ) : requests && requests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {requests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-card border border-border rounded-2xl border-dashed">
                <h3 className="text-2xl font-bold text-secondary mb-2">{t.requests.empty}</h3>
                <p className="text-muted-foreground mb-6">{t.requests.emptyDesc}</p>
                <Button onClick={() => { setSearch(""); setCategoryId(undefined); setOfferType(undefined); }} variant="outline">
                  Wis alle filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}
