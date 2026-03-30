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

const BUNDLES = [
  {
    id: "starter",
    name: "Starter",
    credits: 10,
    price: 35,
    originalPrice: null,
    pricePerUnit: "€3,50",
    description: "Probeer het platform",
    badge: null,
    color: "border-gray-200",
  },
  {
    id: "popular",
    name: "Populair",
    credits: 50,
    price: 120,
    originalPrice: 150,
    pricePerUnit: "€2,40",
    description: "Voor actieve verkopers",
    badge: "Populair",
    color: "border-primary",
  },
  {
    id: "pro",
    name: "Pro",
    credits: 100,
    price: 250,
    originalPrice: 300,
    pricePerUnit: "€2,50",
    description: "Meeste waarde voor je geld",
    badge: "Beste waarde",
    color: "border-green-500",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    credits: 250,
    price: 550,
    originalPrice: 750,
    pricePerUnit: "€2,20",
    description: "Voor grote verkooporganisaties",
    badge: null,
    color: "border-purple-400",
  },
];

export default function SupplierCredits() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { user, token, updateCredits, isSeller } = useUserAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"success" | "pending" | "error" | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  // Parse query params from Pay.nl return URL
  useEffect(() => {
    const params = new URLSearchParams(search);
    const payment = params.get("payment");
    const credits = params.get("credits");
    const orderId = params.get("orderId");

    if (payment === "success") {
      setPaymentStatus("success");
      if (credits) updateCredits((user?.credits ?? 0) + parseInt(credits));
      // Clean URL
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

  async function startPolling(orderId: string) {
    if (!token) return;
    setPolling(true);
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`/api/payments/status/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === "paid") {
            clearInterval(interval);
            setPolling(false);
            setPaymentStatus("success");
            updateCredits((user?.credits ?? 0) + data.credits);
            setPendingOrderId(null);
          } else if (data.status === "failed" || data.status === "cancelled") {
            clearInterval(interval);
            setPolling(false);
            setPaymentStatus("error");
            setPendingOrderId(null);
          }
        }
      } catch {}
      if (attempts >= 20) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 3000);
  }

  if (!token || !isSeller) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-16 text-center">
          <p className="text-muted-foreground">Log in als winkel om credits te kopen.</p>
          <Link href="/auth/login">
            <Button className="mt-4">Inloggen</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  async function handlePurchase(bundleId: string) {
    setLoading(bundleId);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bundleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Betaling starten mislukt", description: data.error, variant: "destructive" });
        return;
      }
      // Redirect to Pay.nl payment page
      window.location.href = data.paymentUrl;
    } catch {
      toast({ title: "Fout", description: "Probeer het opnieuw.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/supplier/dashboard">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar dashboard
            </Button>
          </Link>

          {/* Payment status banners */}
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
              <div className="flex items-center gap-2">
                {polling ? <Loader2 className="w-4 h-4 animate-spin text-yellow-600" /> : <Clock className="w-4 h-4 text-yellow-600" />}
                <AlertDescription className="font-medium">
                  {polling ? "Betaling wordt verwerkt, even geduld..." : "Betaling in behandeling. Ververs de pagina om de status te controleren."}
                </AlertDescription>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {BUNDLES.map((bundle, i) => (
              <motion.div
                key={bundle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <Card className={`relative h-full flex flex-col border-2 ${bundle.color} ${bundle.badge ? "shadow-md" : ""}`}>
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
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center flex-1">
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-primary">{bundle.credits}</p>
                      <p className="text-sm text-muted-foreground">connecties</p>
                    </div>
                    <div className="text-center mb-4">
                      <p className="text-2xl font-bold">€{bundle.price}</p>
                      {bundle.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">€{bundle.originalPrice}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">{bundle.pricePerUnit} per connectie</p>
                    </div>
                    <div className="mt-auto w-full">
                      <Button
                        className="w-full"
                        variant={bundle.badge ? "default" : "outline"}
                        disabled={loading === bundle.id}
                        onClick={() => handlePurchase(bundle.id)}
                      >
                        {loading === bundle.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Doorsturen...</>
                        ) : "Betalen via Pay.nl"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-muted rounded-xl p-6 text-sm text-muted-foreground text-center">
            <p className="font-medium text-foreground mb-1">Hoe werkt het?</p>
            <p>Je koopt een bundel connecties via een veilige betaling met Pay.nl (iDEAL, creditcard, etc.). Na betaling worden je credits direct toegevoegd. Credits vervallen niet.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
