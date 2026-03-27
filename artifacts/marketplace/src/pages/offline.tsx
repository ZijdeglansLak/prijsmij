import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, WifiOff, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";

export default function OfflinePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useUserAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Inloggen mislukt", description: "Ongeldige gegevens of geen beheerdersaccount.", variant: "destructive" });
        return;
      }
      if (!data.user?.isAdmin) {
        toast({ title: "Geen toegang", description: "De site is offline. Alleen beheerders kunnen inloggen.", variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      toast({ title: "Welkom, beheerder" });
      setLocation("/admin");
    } catch {
      toast({ title: "Verbindingsfout", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border border-white/20">
            <WifiOff className="w-10 h-10 text-white/60" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            Prijs<span className="text-orange-400">Mij</span>
          </h1>
          <p className="text-slate-400 text-sm text-center">
            De website is tijdelijk offline voor onderhoud.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-slate-300">Beheerderstoegang</span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">E-mailadres of gebruikersnaam</label>
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@prijsmij.nl"
                autoFocus
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Wachtwoord</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-orange-400 focus:ring-orange-400/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3"
            >
              {loading ? "Inloggen..." : "Inloggen als beheerder"}
            </Button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Neem contact op met de beheerder als je geen toegang hebt.
        </p>
      </div>
    </div>
  );
}
