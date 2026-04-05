import { useState, useEffect } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { Coins, Check, ArrowLeft, Zap, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface CreditBundle {
  id: number;
  bundleKey: string;
  name: string;
  credits: number;
  priceCents: number;
  originalPriceCents: number | null;
  badge: string | null;
  sortOrder: number;
}

function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function bundleColor(bundle: CreditBundle, index: number): string {
  if (bundle.badge === "Populair") return "border-primary";
  if (bundle.badge === "Beste waarde" || bundle.badge === "Beste prijs") return "border-green-500";
  if (index === 3) return "border-purple-400";
  return "border-gray-200";
}

export default function SupplierCredits() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, token, updateCredits, isSeller, isAdmin } = useUserAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "error" | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);
  const [pollingStopped, setPollingStopped] = useState(false);
  const [manualChecking, setManualChecking] = useState(false);
  const [bundles, setBundles] = useState<CreditBundle[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(true);

  const canAccess = isSeller || isAdmin;

  useEffect(() => {
    fetch("/api/supplier/bundles")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBundles(data); })
      .catch(() => {})
      .finally(() => setBundlesLoading(false));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const payment = params.get("payment");
    const credits = params.get("credits");
    const orderId = params.get("orderId");

    if (payment === "success") {
      setPaymentStatus("success");
      if (credits) updateCredits((user?.credits ?? 0) + parseInt(credits));
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "pending" && orderId) {
      setPaymentStatus("pending");
      setPendingOrderId(orderId);
      startPolling(orderId);
      window.history.replaceState({}, "", window.location.pathname);
    } else if (payment === "error") {
      setPaymentStatus("error");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [search]);

  async function checkStatus(orderId: string): Promise<"paid" | "pending" | "failed"> {
    if (!token) return "pending";
    try {
      const res = await fetch(`/api/payments/status/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return "pending";
      const data = await res.json();
      if (data.status === "paid") {
        setPendingOrderId(null);
        window.location.href = `/betaling-geslaagd?credits=${data.credits}`;
        return "paid";
      }
      if (data.status === "failed" || data.status === "cancelled") {
        setPaymentStatus("error");
        setPendingOrderId(null);
        return "failed";
      }
    } catch {}
    return "pending";
  }

  async function startPolling(orderId: string) {
    if (!token) return;
    setPolling(true);
    setPollingStopped(false);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const status = await checkStatus(orderId);
      if (status === "paid" || status === "failed") {
        clearInterval(interval);
        setPolling(false);
        return;
      }
      if (attempts >= 30) {
        clearInterval(interval);
        setPolling(false);
        setPollingStopped(true);
      }
    }, 5000);
  }

  async function handleManualCheck() {
    if (!pendingOrderId || !token) return;
    setManualChecking(true);
    await checkStatus(pendingOrderId);
    setManualChecking(false);
  }

  if (!token || !canAccess) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-16 text-center">
          <p className="text-muted-foreground">Log in als winkel of beheerder om credits te kopen.</p>
          <Link href="/auth/login">
            <Button className="mt-4">Inloggen</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  async function handlePurchase(bundleKey: string) {
    setLoading(bundleKey);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bundleId: bundleKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Betaling starten mislukt", description: data.error, variant: "destructive" });
        return;
      }
      window.location.href = data.paymentUrl;
    } catch {
      toast({ title: "Fout", description: "Probeer het opnieuw.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  const backHref = isAdmin ? "/admin" : "/supplier/dashboard";
  const backLabel = isAdmin ? "Terug naar beheer" : "Terug naar dashboard";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link href={backHref}>
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backLabel}
            </Button>
          </Link>

          {isAdmin && (
            <Alert className="mb-6 border-orange-400 bg-orange-50 text-orange-800">
              <AlertDescription className="font-medium">
                Beheerderskorting actief: jij betaalt 1/100e van de ingestelde prijs (testmodus).
              </AlertDescription>
            </Alert>
          )}

          {paymentStatus === "success" && (
            <Alert className="mb-6 border-green-500 bg-green-50 text-green-800">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <AlertDescription className="font-medium">
                Betaling geslaagd! Je credits zijn toegevoegd aan je account.
              </AlertDescription>
            </Alert>
          )}
          {paymentStatus === "pending" && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 text-yellow-800">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  {polling ? <Loader2 className="w-4 h-4 animate-spin text-yellow-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                  <AlertDescription className="font-medium">
                    {polling
                      ? "Betaling wordt verwerkt, even geduld…"
                      : pollingStopped
                        ? "Automatische controle gestopt. Klik hieronder om opnieuw te controleren of neem contact op met de beheerder."
                        : "Betaling in behandeling."}
                  </AlertDescription>
                </div>
                {pendingOrderId && (
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-yellow-600 text-yellow-800 hover:bg-yellow-100"
                      disabled={manualChecking || polling}
                      onClick={handleManualCheck}
                    >
                      {manualChecking ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                      Controleer opnieuw
                    </Button>
                    <span className="text-xs text-yellow-700">Order #{pendingOrderId}</span>
                  </div>
                )}
              </div>
            </Alert>
          )}
          {paymentStatus === "error" && (
            <Alert className="mb-6 border-red-500 bg-red-50 text-red-800">
              <XCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="font-medium">
                Betaling geannuleerd of mislukt. Probeer het opnieuw.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Coins className="w-4 h-4" />
              Huidig saldo: {user?.credits ?? 0} credits
            </div>
            <h1 className="text-3xl font-bold">Connectiebundels</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Eén connectie = toegang tot de contactgegevens van één koper die jouw bod heeft geselecteerd.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <img src="https://www.pay.nl/images/pay-logo.svg" alt="Pay.nl" className="h-5" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span>Veilig betalen via Pay.nl · iDEAL, creditcard en meer</span>
            </div>
          </div>

          {bundlesLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {bundles.map((bundle, i) => {
                const displayPrice = isAdmin
                  ? formatEuro(Math.max(1, Math.round(bundle.priceCents / 100)))
                  : formatEuro(bundle.priceCents);
                const originalDisplay = bundle.originalPriceCents
                  ? (isAdmin ? formatEuro(Math.max(1, Math.round(bundle.originalPriceCents / 100))) : formatEuro(bundle.originalPriceCents))
                  : null;
                const pricePerUnit = formatEuro(Math.round((isAdmin ? Math.max(1, Math.round(bundle.priceCents / 100)) : bundle.priceCents) / bundle.credits));
                const color = bundleColor(bundle, i);

                return (
                  <motion.div
                    key={bundle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.08 }}
                  >
                    <Card className={`relative h-full flex flex-col border-2 ${color} ${bundle.badge ? "shadow-md" : ""}`}>
                      {bundle.badge && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-primary text-primary-foreground shadow-sm">
                            {bundle.badge === "Populair" ? <Zap className="w-3 h-3 mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                            {bundle.badge}
                          </Badge>
                        </div>
                      )}
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">{bundle.name}</CardTitle>
                        <CardDescription>
                          {bundle.credits} connecties
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center flex-1">
                        <div className="text-center mb-4">
                          <p className="text-4xl font-bold text-primary">{bundle.credits}</p>
                          <p className="text-sm text-muted-foreground">connecties</p>
                        </div>
                        <div className="text-center mb-4">
                          <p className="text-2xl font-bold">€{displayPrice}</p>
                          {originalDisplay && (
                            <p className="text-sm text-muted-foreground line-through">€{originalDisplay}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">€{pricePerUnit} per connectie</p>
                        </div>
                        <div className="mt-auto w-full">
                          <Button
                            className="w-full"
                            variant={bundle.badge ? "default" : "outline"}
                            disabled={loading === bundle.bundleKey}
                            onClick={() => handlePurchase(bundle.bundleKey)}
                          >
                            {loading === bundle.bundleKey ? (
                              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Doorsturen...</>
                            ) : "Betalen via Pay.nl"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          <div className="bg-muted rounded-xl p-6 text-sm text-muted-foreground text-center">
            <p className="font-medium text-foreground mb-1">Hoe werkt het?</p>
            <p>Je koopt een bundel connecties via een veilige betaling met Pay.nl (iDEAL, creditcard, etc.). Na betaling worden je credits direct toegevoegd. Credits vervallen niet.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
