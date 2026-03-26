import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout";
import { useGetRequestById, useListBidsForRequest, useExpressInterest } from "@workspace/api-client-react";
import type { BidOfferType } from "@workspace/api-client-react";
import { formatCurrency, formatExpiry, formatDateTime } from "@/lib/utils";
import { useCountdown } from "@/hooks/use-countdown";
import { Tag, Clock, Package, CheckCircle2, Info, ArrowLeft, Trophy, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id!);
  
  const [filterType, setFilterType] = useState<BidOfferType | "all">("all");
  const [interestBidId, setInterestBidId] = useState<number | null>(null);
  const [consumerEmail, setConsumerEmail] = useState("");

  const { data: request, isLoading } = useGetRequestById(requestId);
  const { data: bids } = useListBidsForRequest(requestId, { 
    offerType: filterType === "all" ? undefined : filterType 
  });
  
  const expressInterestMutation = useExpressInterest();
  const { toast } = useToast();

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

  if (isLoading || !request) return <Layout><div className="p-20 text-center">Laden...</div></Layout>;

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/requests" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Terug naar overzicht
          </Link>
          
          <div className="flex flex-col lg:flex-row gap-8 justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-sm border border-border">
                  {request.categoryIcon}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-secondary">{request.title}</h1>
                  <p className="text-lg text-muted-foreground font-medium mt-1">{request.brand} • {request.categoryName}</p>
                </div>
              </div>
              <p className="text-secondary-foreground/80 leading-relaxed max-w-3xl">
                {request.description}
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-xl shadow-primary/5 border border-primary/10 w-full lg:w-80 shrink-0 text-center">
              <Timer expiresAt={request.expiresAt} />
              <div className="mt-6 pt-6 border-t border-border">
                <div className="text-sm font-semibold text-muted-foreground mb-1">Huidig laagste bod</div>
                <div className="text-3xl font-display font-bold text-primary">
                  {formatCurrency(request.lowestBidPrice)}
                </div>
              </div>
              <Link href={`/requests/${request.id}/bid`}>
                <Button className="w-full mt-6 h-12 text-lg font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Plaats een bod
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Specs */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" /> Specificaties
              </h3>
              <dl className="space-y-4">
                {Object.entries(request.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border/50 last:border-0">
                    <dt className="text-muted-foreground font-medium capitalize">{key}</dt>
                    <dd className="font-semibold text-secondary text-right">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
            
            <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Voorkeuren Koper</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-secondary">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Geaccepteerde staat: <span className="font-semibold capitalize">{request.allowedOfferTypes.join(', ')}</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-secondary">
                  {request.allowSimilarModels ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                  )}
                  Soortgelijk model toegestaan: <span className="font-semibold">{request.allowSimilarModels ? 'Ja' : 'Nee'}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column: Bids */}
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Biedingen <span className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full">{request.bidCount}</span>
              </h2>
              
              <div className="flex bg-muted/50 p-1 rounded-xl">
                {(['all', 'new', 'refurbished', 'occasion', 'similar'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${filterType === type ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-secondary'}`}
                  >
                    {type === 'all' ? 'Alles' : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {bids?.length === 0 ? (
                <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-secondary mb-1">Nog geen biedingen in deze categorie</h3>
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
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{bid.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-xs font-medium text-secondary-foreground/70">
                          <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-primary" /> {bid.warrantyMonths} mnd garantie</span>
                          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-primary" /> Levering: {bid.deliveryDays} {bid.deliveryDays === 1 ? 'dag' : 'dagen'}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary" /> {formatDateTime(bid.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="shrink-0 flex flex-col items-end justify-between sm:border-l sm:border-border sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0">
                        <div className="text-3xl font-display font-bold text-secondary mb-4">
                          {formatCurrency(bid.price)}
                        </div>
                        <Button 
                          onClick={() => setInterestBidId(bid.id)}
                          className={`w-full sm:w-auto h-11 ${index === 0 && filterType === 'all' ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-secondary hover:bg-secondary/90 text-white'}`}
                        >
                          Toon Interesse
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!interestBidId} onOpenChange={(o) => !o && setInterestBidId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Interesse in dit bod?</DialogTitle>
            <DialogDescription className="text-base mt-2">
              Geweldig! Vul je e-mailadres in zodat de winkelier contact met je op kan nemen om de deal rond te maken.
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
              {expressInterestMutation.isPending ? "Verwerken..." : "Contact Aanvragen (€ 0,99)"}
            </Button>
          </div>
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
