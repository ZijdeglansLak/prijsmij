import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { Store, ShoppingBag, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

type Role = "buyer" | "seller";

const FREE_DOMAINS = [
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.nl", "outlook.com",
  "outlook.nl", "yahoo.com", "yahoo.nl", "live.com", "live.nl", "icloud.com",
  "me.com", "mac.com", "msn.com", "protonmail.com", "proton.me",
  "gmx.com", "gmx.net", "gmx.nl", "web.de", "kpnmail.nl",
];

export default function AuthRegister() {
  const [, setLocation] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();
  const { t, lang } = useI18n();

  const [role, setRole] = useState<Role>("buyer");
  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [devVerificationLink, setDevVerificationLink] = useState<string | null>(null);

  const emailDomain = email.split("@")[1]?.toLowerCase();
  const isFreeDomain = role === "seller" && !!emailDomain && FREE_DOMAINS.includes(emailDomain);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!contactName.trim()) {
      toast({ title: "Naam is verplicht", description: "Vul je naam in", variant: "destructive" });
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast({ title: "E-mailadres is verplicht", description: "Vul een geldig e-mailadres in", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Wachtwoord te kort", description: "Wachtwoord moet minimaal 6 tekens bevatten", variant: "destructive" });
      return;
    }
    if (role === "seller" && !storeName.trim()) {
      toast({ title: "Winkelnaam is verplicht", description: "Vul de naam van je winkel of bedrijf in", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, storeName: role === "seller" ? storeName : undefined, contactName, email, password, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.general.error, description: data.error, variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      if (data.verificationLink) setDevVerificationLink(data.verificationLink);
      setVerificationSent(true);

      toast({ title: t.auth.welcome });
      if (!data.verificationLink) {
        setLocation(role === "seller" ? "/supplier/dashboard" : "/");
      }
    } catch {
      toast({ title: t.general.error, description: "Er is iets misgegaan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (verificationSent && devVerificationLink) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t.auth.verificationSent}</h2>
            <p className="text-muted-foreground mb-6">{t.auth.verificationSentDesc}</p>
            <div className="bg-muted rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-bold text-muted-foreground mb-2">DEV: verificatielink (geen SMTP geconfigureerd)</p>
              <a href={devVerificationLink} className="text-primary text-sm break-all hover:underline">{devVerificationLink}</a>
            </div>
            <Button onClick={() => setLocation(role === "seller" ? "/supplier/dashboard" : "/")} className="w-full">
              Doorgaan naar de app
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (verificationSent) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t.auth.verificationSent}</h2>
            <p className="text-muted-foreground mb-6">{t.auth.verificationSentDesc}</p>
            <Button onClick={() => setLocation(role === "seller" ? "/supplier/dashboard" : "/")} className="w-full">
              Doorgaan naar de app
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-3xl text-secondary">Prijs<span className="text-primary">Mij</span></span>
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
              {/* Seller domain warning */}
              {isFreeDomain && (
                <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{t.auth.sellerEmailDomainWarning}</p>
                </div>
              )}
              {role === "seller" && !isFreeDomain && !!emailDomain && (
                <p className="text-xs text-muted-foreground mt-1">{t.auth.sellerEmailDomainHint}</p>
              )}
              {role === "seller" && !emailDomain && (
                <p className="text-xs text-muted-foreground mt-1">{t.auth.sellerEmailDomainHint}</p>
              )}
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
