import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { Store, ShoppingBag, TrendingUp } from "lucide-react";

type Role = "buyer" | "seller";

export default function AuthRegister() {
  const [, setLocation] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [role, setRole] = useState<Role>("buyer");
  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, storeName: role === "seller" ? storeName : undefined, contactName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.general.error, description: data.error, variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      toast({ title: t.auth.welcome });
      setLocation(role === "seller" ? "/supplier/dashboard" : "/");
    } catch {
      toast({ title: t.general.error, description: "Er is iets misgegaan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-3xl text-secondary">Best<span className="text-primary">Bod</span></span>
            </div>
            <h1 className="text-2xl font-bold text-secondary">{t.auth.registerTitle}</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">
            {/* Role selector */}
            <div>
              <p className="text-sm font-bold mb-3">{t.auth.roleQuestion}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("buyer")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === "buyer" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  <span className="font-bold text-sm">{t.auth.buyer}</span>
                  <span className="text-xs opacity-70">{t.auth.buyerDesc}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("seller")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    role === "seller" ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <Store className="w-6 h-6" />
                  <span className="font-bold text-sm">{t.auth.seller}</span>
                  <span className="text-xs opacity-70">{t.auth.sellerDesc}</span>
                </button>
              </div>
            </div>

            {/* Store name (sellers only) */}
            {role === "seller" && (
              <div>
                <label className="block text-sm font-bold mb-1">{t.auth.storeName} *</label>
                <Input
                  required
                  placeholder={t.auth.storeNamePlaceholder}
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.contactName} *</label>
              <Input
                required
                placeholder={t.auth.contactNamePlaceholder}
                value={contactName}
                onChange={e => setContactName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.email} *</label>
              <Input
                required
                type="email"
                placeholder={t.auth.emailPlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.password} *</label>
              <Input
                required
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
              {loading ? t.auth.registeringSeller : t.auth.registerButton}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t.auth.hasAccount}{" "}
              <Link href="/auth/login" className="text-primary font-bold hover:underline">
                {t.auth.loginLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
