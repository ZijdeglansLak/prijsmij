import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRequestById, useCreateBid, getGetRequestByIdQueryKey, getListBidsForRequestQueryKey, getListRequestsQueryKey } from "@workspace/api-client-react";
import type { CreateBidBodyOfferType } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Gavel, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSupplierAuth } from "@/contexts/supplier-auth";

export default function PlaceBid() {
  const { id } = useParams<{ id: string }>();
  const requestId = parseInt(id!);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { supplier, isLoggedIn } = useSupplierAuth();

  const queryClient = useQueryClient();
  const { data: request, isLoading } = useGetRequestById(requestId);
  const createBidMutation = useCreateBid();

  // Pre-fill from supplier account if logged in
  const [supplierStore, setSupplierStore] = useState(supplier?.storeName ?? "");
  const [supplierName, setSupplierName] = useState(supplier?.contactName ?? "");
  const [supplierEmail, setSupplierEmail] = useState(supplier?.email ?? "");
  const [price, setPrice] = useState("");
  const [offerType, setOfferType] = useState<CreateBidBodyOfferType>("new");
  const [modelName, setModelName] = useState("");
  const [description, setDescription] = useState("");
  const [warrantyMonths, setWarrantyMonths] = useState("24");
  const [deliveryDays, setDeliveryDays] = useState("1");
  const [isSimilarModel, setIsSimilarModel] = useState(false);
  const visibility = "private" as const;
  const [priceError, setPriceError] = useState("");

  // Once request loads: pre-fill modelName and clamp offerType to allowed values
  useEffect(() => {
    if (!request) return;
    if (!request.allowSimilarModels) {
      setModelName(request.brand ? `${request.brand} – ${request.title}` : request.title);
    }
    const allowed = request.allowedOfferTypes as string[];
    if (allowed.length > 0 && !allowed.includes(offerType)) {
      setOfferType(allowed[0] as CreateBidBodyOfferType);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      setPriceError("Voer een geldige prijs in");
      return;
    }
    setPriceError("");

    try {
      await createBidMutation.mutateAsync({
        id: requestId,
        data: {
          supplierStore,
          supplierName,
          supplierEmail,
          price: parsedPrice,
          offerType,
          modelName,
          description,
          warrantyMonths: parseInt(warrantyMonths),
          deliveryDays: parseInt(deliveryDays),
          isSimilarModel,
          visibility,
        }
      });
      await queryClient.invalidateQueries({ queryKey: getGetRequestByIdQueryKey(requestId) });
      await queryClient.invalidateQueries({ queryKey: getListBidsForRequestQueryKey(requestId) });
      await queryClient.invalidateQueries({ queryKey: getListRequestsQueryKey() });
      toast({ title: "Bod geplaatst!", description: "Je bod is succesvol toegevoegd aan de uitvraag." });
      setLocation(`/requests/${requestId}`);
    } catch (e: any) {
      const msg: string =
        (e?.data as any)?.error ??
        (e?.message as string | undefined)?.replace(/^HTTP \d+ \w+:\s*/i, "") ??
        "Controleer of alle velden correct zijn ingevuld.";
      toast({ title: "Bod kon niet worden geplaatst", description: msg, variant: "destructive" });
    }
  };

  if (isLoading || !request) return <Layout><div className="p-20 text-center">Laden...</div></Layout>;

  return (
    <Layout>
      <div className="bg-muted/30 border-b border-border py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href={`/requests/${requestId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Terug naar uitvraag
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Gavel className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-secondary">Plaats een Bod</h1>
              <p className="text-muted-foreground text-lg">voor uitvraag: <span className="font-bold text-secondary">{request.title}</span></p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="space-y-8 bg-card p-8 rounded-2xl border border-border shadow-sm">
            
            {/* Store details — hidden when logged in as supplier */}
            {isLoggedIn && supplier ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-bold text-green-800">{supplier.storeName}</p>
                  <p className="text-sm text-green-700">{supplier.contactName} · {supplier.email}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Jouw Gegevens</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Winkelnaam *</label>
                    <Input required value={supplierStore} onChange={e => setSupplierStore(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Jouw Naam *</label>
                    <Input required value={supplierName} onChange={e => setSupplierName(e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-bold mb-1">E-mailadres *</label>
                    <Input required type="email" value={supplierEmail} onChange={e => setSupplierEmail(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Offer details */}
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-border pb-2">Jouw Aanbod</h3>
              
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>De koper accepteert: <span className="font-bold">{(request.allowedOfferTypes as string[]).map(t => t === "new" ? "Nieuw" : t === "refurbished" ? "Refurbished" : "Occasion").join(', ')}</span>. Alternatieve modellen zijn {request.allowSimilarModels ? 'toegestaan' : 'NIET toegestaan'}.</div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">
                    {request.allowSimilarModels ? "Exacte Modelnaam *" : "Product"}
                  </label>
                  {request.allowSimilarModels ? (
                    <Input
                      required
                      placeholder="Bv: Samsung QE65S95C (2023)"
                      value={modelName}
                      onChange={e => setModelName(e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground select-none">
                      {modelName || request.title}
                    </div>
                  )}
                  {request.allowSimilarModels && (
                    <p className="text-xs text-muted-foreground mt-1">Vul de exacte model- of typenaam in die je aanbiedt.</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-1">Jouw Prijs (€) *</label>
                  <Input
                    type="text"
                    inputMode="decimal"
                    className={`text-xl font-bold text-primary ${priceError ? "border-destructive" : ""}`}
                    placeholder="999.00"
                    value={price}
                    onChange={e => {
                      setPrice(e.target.value);
                      if (priceError) setPriceError("");
                    }}
                  />
                  {priceError && <p className="text-destructive text-xs mt-1">{priceError}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Staat van product *</label>
                  {(request.allowedOfferTypes as string[]).length === 1 ? (
                    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-input bg-muted text-sm text-muted-foreground select-none capitalize">
                      {(request.allowedOfferTypes as string[])[0] === "new" ? "Nieuw"
                        : (request.allowedOfferTypes as string[])[0] === "refurbished" ? "Refurbished"
                        : "Occasion"}
                    </div>
                  ) : (
                    <select
                      className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                      value={offerType}
                      onChange={e => setOfferType(e.target.value as CreateBidBodyOfferType)}
                    >
                      {(request.allowedOfferTypes as string[]).includes("new") && <option value="new">Nieuw</option>}
                      {(request.allowedOfferTypes as string[]).includes("refurbished") && <option value="refurbished">Refurbished</option>}
                      {(request.allowedOfferTypes as string[]).includes("occasion") && <option value="occasion">Occasion</option>}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Garantie (maanden) *</label>
                  <Input required type="number" min="0" value={warrantyMonths} onChange={e => setWarrantyMonths(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Levertijd (dagen) *</label>
                  <Input required type="number" min="0" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold mb-1">Beschrijving / Extra info</label>
                  <textarea 
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring min-h-[100px]"
                    placeholder="Waarom is dit een goede deal? Bijvoorbeeld inclusief installatie of muurbeugel..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>

                {request.allowSimilarModels && (
                  <div className="col-span-2 flex items-center gap-3 bg-muted p-4 rounded-xl">
                    <input type="checkbox" id="similar" checked={isSimilarModel} onChange={e => setIsSimilarModel(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-primary" />
                    <label htmlFor="similar" className="font-bold cursor-pointer">Dit is een vergelijkbaar alternatief (niet exact het gevraagde merk/model)</label>
                  </div>
                )}

              </div>
            </div>

            <Button type="submit" disabled={createBidMutation.isPending} className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white">
              {createBidMutation.isPending ? "Bieding plaatsen..." : "Bevestig Bod"}
            </Button>
          </form>
        </div>

        {/* Sidebar */}
        <div>
          <div className="bg-secondary text-white rounded-2xl p-6 shadow-lg sticky top-28">
            <h3 className="font-bold text-lg mb-4 text-white/90">Competitie Info</h3>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl">
                <div className="text-sm font-semibold text-white/60 mb-1">Laagste bod momenteel</div>
                <div className="text-3xl font-display font-bold text-primary">
                  {formatCurrency(request.lowestBidPrice)}
                </div>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Aantal bieders</span>
                <span className="font-bold">{request.bidCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-white/70">Resterende tijd</span>
                <span className="font-bold text-right text-sm">{new Date(request.expiresAt).toLocaleDateString('nl-NL')}</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-primary/20 rounded-xl text-sm border border-primary/30 text-white/90 leading-relaxed">
              <span className="font-bold block mb-1">Tip:</span> 
              Zorg dat je bod scherp is. De koper ziet de biedingen gesorteerd op prijs, dus de laagste prijs staat bovenaan!
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
