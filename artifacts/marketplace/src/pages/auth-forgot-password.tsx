import { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/i18n";
import { TrendingUp, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const { t, lang } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.general.error, description: data.error, variant: "destructive" });
        return;
      }
      setSent(true);
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
            <h1 className="text-2xl font-bold text-secondary">{t.auth.forgotPasswordTitle}</h1>
          </div>

          {sent ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-secondary font-medium mb-6">{t.auth.forgotPasswordSent}</p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">{t.auth.backToLogin}</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">
              <p className="text-sm text-muted-foreground">{t.auth.forgotPasswordDesc}</p>
              <div>
                <label className="block text-sm font-bold mb-1">{t.auth.email}</label>
                <Input
                  type="email"
                  placeholder={t.auth.emailPlaceholder}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? "Versturen..." : t.auth.sendResetLink}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-primary font-bold hover:underline">
                  {t.auth.backToLogin}
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
