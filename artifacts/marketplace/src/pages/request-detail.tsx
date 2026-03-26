import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetRequestById, useListBidsForRequest, useExpressInterest } from "@workspace/api-client-react";
import type { BidOfferType } from "@workspace/api-client-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { Tag, Clock, Package, CheckCircle2, Info, ArrowLeft, Trophy, Truck, Shield, Link2, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSupplierAuth } from "@/contexts/supplier-auth";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id!);
  
  const [filterType, setFilterType] = useState<BidOfferType | "all">("all");
  const [interestBidId, setInterestBidId] = useState<number | null>(null);
  const [consumerEmail, setConsumerEmail] = useState("");
  const [connectieBidId, setConnectieBidId] = useState<number | null>(null);
  const [connectieResult, setConnectieResult] = useState<{ consumerName: string; consumerEmail: string } | null>(null);
  const [connectieLoading, setConnectieLoading] = useState(false);

  const { data: request, isLoading } = useGetRequestById(requestId);
  const { data: bids } = useListBidsForRequest(requestId, { 
    offerType: filterType === "all" ? undefined : filterType 
  });
  
  const expressInterestMutation = useExpressInterest();
  const { toast } = useToast();
  const { supplier, token, isLoggedIn, updateCredits } = useSupplierAuth();

  const handleInterest = async () => {
    if (!interestBidId || !consumerEmail) return;
    
    try {
      const result = await expressInterestMutation.mutateAsync({
        id: requestId,
        data: { bidId: interestBidId, consumerEmail }
      });
      
      toast({
        title: "Succes!",
        description: `We hebben de verkoper gemaild via ${result.contactEmail}.`,
      });
      setInterestBidId(null);
    } catch (e) {
      toast({
        title: "Fout",
        description: "Er is iets misgegaan. Probeer het opnieuw.",
        variant: "destructive"
      });
    }
  };

  const handleConnectie = async () => {
    if (!connectieBidId || !token) return;
    setConnectieLoading(true);
    try {
      const res = await fetch(`/api/bids/${connectieBidId}/connect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          toast({ title: "Onvoldoende credits", description: data.error, variant: "destructive" });
          setConnectieBidId(null);
        } else {
          toast({ title: "Fout", description: data.error, variant: "destructive" });
        }
        return;
      }
      if (typeof data.remainingCredits === "number") {
        updateCredits(data.remainingCredits);
      }
      setConnectieResult({ consumerName: data.consumerName, consumerEmail: data.consumerEmail });
    } catch {
      toast({ title: "Verbindingsfout", variant: "destructive" });
    } finally {
      setConnectieLoading(false);
    }
  };

  if (isLoading || !request) return <Layout><div className="p-20 text-center">Laden...</div></Layout>;

  const offerTypeLabels: Record<string, string> = {
    new: "Nieuw",
    refurbished: "Refurbished",
    occasion: "Occasion",
    similar: "Vergelijkbaar model",
    all: "Alle biedingen",
  };

  const allowedFilters: Array<"all" | BidOfferType> = ["all", ...request.allowedOfferTypes as BidOfferType[]];

  return (
    <Layout>
      {/* Hero */}
      <div className="bg-gradient-to-br from-secondary via-secondary/95 to-secondary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/requests" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Alle uitvragen
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 rounded-full px-3 py-1 text-sm font-medium mb-4">
                <Tag className="w-4 h-4" /> {request.category?.name}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{request.title}</h1>
              <p className="text-white/70 text-lg mb-4">{request.description}</p>
              {request.budget && (
                <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2">
                  <span className="text-sm font-medium text-white/70">Budget koper:</span>
                  <span className="font-bold text-xl">{formatCurrency(request.budget)}</span>
                </div>
              )}
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center min-w-48">
              <Timer expiresAt={request.expiresAt} />
              <div className="mt-4 flex flex-col gap-2 text-sm text-white/60">
                <span className="flex items-center gap-1.5 justify-center"><CheckCircle2 className="w-4 h-4 text-green-400" /> {bids?.length ?? 0} biedingen</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier connectie area */}
            {isLoggedIn && supplier ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Coins className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm">Winkelaarsmodus</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Ingelogd als <strong>{supplier.storeName}</strong>. Gebruik credits om contact op te nemen met kopers.
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-bold text-primary text-lg">{supplier.credits}</span>
                </div>
                {supplier.credits === 0 && (
                  <Link href="/supplier/credits">
                    <Button size="sm" className="w-full mt-3" variant="outline">Credits kopen</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="bg-muted rounded-2xl p-5 text-center">
                <Link2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium mb-1">Ben je een winkelier?</p>
                <p className="text-xs text-muted-foreground mb-3">Log in om connecties te maken met kopers.</p>
                <Link href="/supplier/login">
                  <Button size="sm" variant="outline" className="w-full">Winkel inloggen</Button>
                </Link>
              </div>
            )}

            {/* Specs */}
            {request.specs && Object.keys(request.specs).length > 0 && (
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Specificaties
                </h3>
                <div className="space-y-2">
                  {Object.entries(request.specs as Record<string, string>).map(([key, val]) => (
                    val ? (
                      <div key={key} className="flex justify-between text-sm gap-3">
                        <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="font-medium text-right">{val}</span>
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            )}

            {/* Place bid CTA */}
            <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white text-center shadow-lg">
              <Truck className="w-10 h-10 mx-auto mb-3 opacity-90" />
              <h3 className="font-bold text-lg mb-2">Ben je een winkelier?</h3>
              <p className="text-white/80 text-sm mb-4">Plaats een scherp bod en win de opdracht.</p>
              <Link href={`/requests/${requestId}/bid`}>
                <Button variant="secondary" className="w-full font-bold shadow-sm">Bod plaatsen</Button>
              </Link>
            </div>
          </div>

          {/* Bids */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-secondary">
                Biedingen <span className="text-primary">({bids?.length ?? 0})</span>
              </h2>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap gap-2">
              {allowedFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    filterType === type
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {offerTypeLabels[type] ?? type}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {bids?.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-secondary mb-1">Nog geen biedingen</h3>
                  <p className="text-muted-foreground">Ben jij de eerste die een bod plaatst?</p>
                </div>
              ) : (
                bids?.map((bid, index) => (
                  <div key={bid.id} className={`bg-card rounded-2xl p-6 border transition-all hover:shadow-md ${index === 0 && filterType === 'all' ? 'border-primary/50 shadow-sm ring-1 ring-primary/10' : 'border-border'}`}>
                    {index === 0 && filterType === 'all' && (
                      <div className="absolute -translate-y-9 translate-x-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        <Trophy className="w-3 h-3" /> Beste Deal
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-lg text-secondary">{bid.supplierStore}</h4>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
                            {bid.offerType}
                          </span>
                          {bid.isSimilarModel && (
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 border border-purple-200">
                              Alternatief
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-secondary mb-3">{bid.modelName}</p>
                        {bid.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{bid.description}</p>}
                        
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-secondary-foreground/70">
                          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> {bid.warrantyMonths} mnd garantie</span>
                          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Levering: {bid.deliveryDays} {bid.deliveryDays === 1 ? 'dag' : 'dagen'}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {formatDateTime(bid.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-end justify-between sm:border-l sm:border-border sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 gap-3">
                        <div className="text-3xl font-display font-bold text-secondary">
                          {formatCurrency(bid.price)}
                        </div>
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <Button 
                            onClick={() => setInterestBidId(bid.id)}
                            className={`w-full sm:w-auto h-11 ${index === 0 && filterType === 'all' ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-secondary hover:bg-secondary/90 text-white'}`}
                          >
                            Toon Interesse
                          </Button>
                          {isLoggedIn && (
                            <Button
                              variant="outline"
                              className="w-full sm:w-auto h-11 border-primary text-primary hover:bg-primary/5"
                              onClick={() => { setConnectieBidId(bid.id); setConnectieResult(null); }}
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Connectie (1 credit)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interest Dialog */}
      <Dialog open={!!interestBidId} onOpenChange={(o) => !o && setInterestBidId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Interesse in dit bod?</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Geweldig! Vul je e-mailadres in zodat de winkelier contact met je op kan nemen.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <label className="block text-sm font-bold text-secondary mb-2">Jouw e-mailadres</label>
            <Input 
              type="email" 
              placeholder="naam@voorbeeld.nl" 
              value={consumerEmail}
              onChange={(e) => setConsumerEmail(e.target.value)}
              className="h-12 text-lg"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setInterestBidId(null)}>Annuleren</Button>
            <Button 
              onClick={handleInterest} 
              disabled={!consumerEmail || expressInterestMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {expressInterestMutation.isPending ? "Verwerken..." : "Contact Aanvragen (€0,99)"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Connectie Dialog */}
      <Dialog open={!!connectieBidId} onOpenChange={(o) => { if (!o) { setConnectieBidId(null); setConnectieResult(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Link2 className="w-6 h-6 text-primary" /> Connectie maken
            </DialogTitle>
            {!connectieResult ? (
              <DialogDescription className="text-base mt-2">
                Je gebruikt <strong>1 credit</strong> om de contactgegevens van de koper te ontvangen. Je hebt momenteel <strong>{supplier?.credits ?? 0} credits</strong>.
              </DialogDescription>
            ) : (
              <DialogDescription className="text-base mt-2 text-green-700">
                Connectie geslaagd! Neem contact op met de koper.
              </DialogDescription>
            )}
          </DialogHeader>

          {connectieResult ? (
            <div className="py-4 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-sm text-green-700 font-medium mb-1">Naam koper</p>
                <p className="font-bold text-lg">{connectieResult.consumerName}</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                <p className="text-sm text-green-700 font-medium mb-1">E-mailadres</p>
                <p className="font-bold text-lg font-mono">{connectieResult.consumerEmail}</p>
              </div>
              <p className="text-xs text-muted-foreground">Resterend saldo: {supplier?.credits} credits. Deze connectie is ook terug te vinden in je dashboard.</p>
              <Button onClick={() => { setConnectieBidId(null); setConnectieResult(null); }} className="w-full">Sluiten</Button>
            </div>
          ) : (
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setConnectieBidId(null)}>Annuleren</Button>
              <Button
                onClick={handleConnectie}
                disabled={connectieLoading || !supplier || supplier.credits < 1}
                className="bg-primary text-white"
              >
                {connectieLoading ? "Bezig..." : "Bevestigen (1 credit)"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

function Timer({ expiresAt }: { expiresAt: string }) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(expiresAt);

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 text-destructive font-bold bg-destructive/10 px-4 py-2 rounded-xl">
        <Clock className="w-5 h-5" /> Uitvraag Verlopen
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-2 text-primary font-bold mb-3">
        <Clock className="w-5 h-5 animate-pulse" /> Sluit over:
      </div>
      <div className="flex justify-center gap-2">
        <TimeUnit value={days} label="d" />
        <span className="text-2xl font-bold text-secondary-foreground/30 py-1">:</span>
        <TimeUnit value={hours} label="u" />
        <span className="text-2xl font-bold text-secondary-foreground/30 py-1">:</span>
        <TimeUnit value={minutes} label="m" />
        <span className="text-2xl font-bold text-secondary-foreground/30 py-1">:</span>
        <TimeUnit value={seconds} label="s" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number, label: string }) {
  return (
    <div className="bg-muted w-14 py-2 rounded-xl border border-border shadow-inner flex flex-col items-center">
      <span className="text-xl font-display font-bold text-secondary leading-none">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{label}</span>
    </div>
  );
}
