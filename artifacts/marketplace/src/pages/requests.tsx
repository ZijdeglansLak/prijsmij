import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { RequestCard } from "@/components/request-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useListRequests, useListCategories } from "@workspace/api-client-react";
import type { ListRequestsOfferType } from "@workspace/api-client-react";

export default function RequestsPage() {
  const searchParams = new URLSearchParams(window.location.search);
  
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("categoryId") ? Number(searchParams.get("categoryId")) : undefined
  );
  const [offerType, setOfferType] = useState<ListRequestsOfferType | undefined>(undefined);

  const { data: requests, isLoading } = useListRequests({ 
    search: search || undefined, 
    categoryId, 
    offerType 
  });
  
  const { data: categories } = useListCategories();

  return (
    <Layout>
      <div className="bg-secondary text-secondary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold mb-4 text-white">Actieve Uitvragen</h1>
          <p className="text-secondary-foreground/70 text-lg max-w-2xl">
            Ontdek wat consumenten zoeken en plaats direct een scherp bod als leverancier.
          </p>
        </div>
      </div>

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
                <label className="block text-sm font-semibold mb-2">Zoeken</label>
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
                <div className="space-y-2">
                  <button 
                    onClick={() => setCategoryId(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${categoryId === undefined ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}
                  >
                    Alle categorieën
                  </button>
                  {categories?.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${categoryId === cat.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-secondary'}`}
                    >
                      <span className="flex items-center gap-2">{cat.icon} {cat.name}</span>
                      <span className="bg-white/50 text-xs py-0.5 px-2 rounded-md">{cat.activeRequestCount}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Offer Types */}
              <div>
                <label className="block text-sm font-semibold mb-3">Staat</label>
                <div className="space-y-2">
                  {(['any', 'new', 'refurbished', 'occasion'] as const).map((type) => (
                    <button 
                      key={type}
                      onClick={() => setOfferType(type === 'any' ? undefined : type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        (type === 'any' && offerType === undefined) || offerType === type 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted text-secondary'
                      }`}
                    >
                      {type === 'any' ? 'Alles' : type}
                    </button>
                  ))}
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
                <img src={`${import.meta.env.BASE_URL}images/empty-state.png`} alt="No results" className="w-48 h-48 mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl font-bold text-secondary mb-2">Geen uitvragen gevonden</h3>
                <p className="text-muted-foreground mb-6">Probeer je filters aan te passen of zoek op een ander woord.</p>
                <Button onClick={() => { setSearch(""); setCategoryId(undefined); setOfferType(undefined); }} variant="outline">
                  Wis alle filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
