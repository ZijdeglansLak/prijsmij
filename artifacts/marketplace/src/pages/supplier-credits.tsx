import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSupplierAuth } from "@/contexts/supplier-auth";
import { Coins, Check, ArrowLeft, Zap } from "lucide-react";
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
  const { supplier, token, updateCredits } = useSupplierAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  if (!token || !supplier) {
    return (
      <Layout>
        <div className="max-w-md mx-auto py-16 text-center">
          <p className="text-muted-foreground">Log in als winkel om credits te kopen.</p>
          <Link href="/supplier/login">
            <Button className="mt-4">Inloggen</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  async function handlePurchase(bundleId: string) {
    setLoading(bundleId);
    try {
      const res = await fetch("/api/supplier/credits/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bundleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Aankoop mislukt", description: data.error, variant: "destructive" });
        return;
      }
      updateCredits(data.newBalance);
      toast({
        title: `${data.creditsAdded} credits toegevoegd!`,
        description: `Je hebt nu ${data.newBalance} credits.`,
      });
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

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Coins className="w-4 h-4" />
              Huidig saldo: {supplier.credits} credits
            </div>
            <h1 className="text-3xl font-bold">Connectiebundels</h1>
            <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
              Eén connectie = toegang tot de contactgegevens van één koper die jouw bod heeft geselecteerd.
            </p>
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
                        {loading === bundle.id ? "Kopen..." : "Kopen"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="bg-muted rounded-xl p-6 text-sm text-muted-foreground text-center">
            <p className="font-medium text-foreground mb-1">Hoe werkt het?</p>
            <p>Je koopt een bundel connecties. Wanneer je op een uitvraag biedt en de koper interesse toont, gebruik je één connectie om de contactgegevens van de koper te ontvangen. Credits vervallen niet.</p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
