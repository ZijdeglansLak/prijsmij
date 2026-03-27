import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/contexts/i18n";
import { TrendingUp, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast({ title: t.general.error, description: t.auth.passwordMismatch, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: t.general.error, description: data.error, variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      toast({ title: t.general.error, description: "Er is iets misgegaan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
          <div className="w-full max-w-md text-center">
            <p className="text-destructive font-semibold mb-4">{t.auth.invalidResetLink}</p>
            <Link href="/auth/forgot-password"><Button variant="outline">{t.auth.requestNewLink}</Button></Link>
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
              <span className="font-display font-bold text-3xl text-secondary">Best<span className="text-primary">Bod</span></span>
            </div>
            <h1 className="text-2xl font-bold text-secondary">{t.auth.resetPasswordTitle}</h1>
          </div>

          {done ? (
            <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-secondary font-medium mb-6">{t.auth.resetPasswordDone}</p>
              <Button onClick={() => setLocation("/auth/login")} className="w-full">{t.auth.loginButton}</Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold mb-1">{t.auth.newPassword}</label>
                <Input
                  type="password"
                  placeholder="Minimaal 6 tekens"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">{t.auth.confirmPassword}</label>
                <Input
                  type="password"
                  placeholder="Herhaal nieuw wachtwoord"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full h-12 font-bold" disabled={loading}>
                {loading ? "Opslaan..." : t.auth.saveNewPassword}
              </Button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
