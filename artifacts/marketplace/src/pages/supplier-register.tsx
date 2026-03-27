import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSupplierAuth } from "@/contexts/supplier-auth";
import { Store, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";


export default function SupplierRegister() {
  const [, setLocation] = useLocation();
  const { login } = useSupplierAuth();
  const { toast } = useToast();

  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !contactName || !email || !password) {
      toast({ title: "Vul alle velden in", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/supplier/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, contactName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Fout bij registreren", description: data.error, variant: "destructive" });
        return;
      }
      login(data.token, data.supplier);
      toast({ title: "Welkom bij PrijsMij!", description: `Account aangemaakt voor ${data.supplier.storeName}` });
      setLocation("/supplier/dashboard");
    } catch {
      toast({ title: "Verbindingsfout", description: "Probeer het opnieuw.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Winkel account aanmaken</h1>
            <p className="text-muted-foreground mt-2">Bied op uitvragen en maak connecties met kopers</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registreren</CardTitle>
              <CardDescription>Maak een gratis account aan om te beginnen</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Winkelnaam</Label>
                  <Input id="storeName" placeholder="bijv. MediaMarkt Amsterdam" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contactpersoon</Label>
                  <Input id="contactName" placeholder="Voornaam Achternaam" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input id="email" type="email" placeholder="info@winkel.nl" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input id="password" type="password" placeholder="Minimaal 6 tekens" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Aanmaken..." : "Account aanmaken"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Al een account?{" "}
                <Link href="/supplier/login" className="text-primary hover:underline font-medium">
                  Inloggen
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
