import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { TrendingUp } from "lucide-react";

export default function AuthLogin() {
  const [, setLocation] = useLocation();
  const { login } = useUserAuth();
  const { toast } = useToast();
  const { t } = useI18n();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.general.error, description: data.error, variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      toast({ title: t.auth.welcomeBack });
      if (data.user.isAdmin) {
        setLocation("/admin");
      } else if (data.user.role === "seller") {
        setLocation("/supplier/dashboard");
      } else {
        setLocation("/");
      }
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
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="font-display font-bold text-3xl text-secondary">Prijs<span className="text-primary">Mij</span></span>
            </div>
            <h1 className="text-2xl font-bold text-secondary">{t.auth.loginTitle}</h1>
          </div>

          <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">
            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.emailOrUsername}</label>
              <Input
                type="text"
                placeholder={t.auth.emailOrUsernamePlaceholder}
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-bold">{t.auth.password}</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  {t.auth.forgotPassword}
                </Link>
              </div>
              <Input
                type="password"
                placeholder={t.auth.passwordPlaceholder}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
              {loading ? t.auth.loggingIn : t.auth.loginButton}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t.auth.noAccount}{" "}
              <Link href="/auth/register" className="text-primary font-bold hover:underline">
                {t.auth.registerLink}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}
