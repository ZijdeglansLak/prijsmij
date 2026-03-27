import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserAuth } from "@/contexts/user-auth";
import { useI18n } from "@/contexts/i18n";
import { User, Lock, CheckCircle, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user, token, updateUser, isLoggedIn } = useUserAuth();
  const { t } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [contactName, setContactName] = useState(user?.contactName ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  if (!isLoggedIn || !user) {
    setLocation("/auth/login");
    return null;
  }

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contactName }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: t.general.error, description: data.error, variant: "destructive" }); return; }
      updateUser({ contactName: data.contactName });
      toast({ title: t.profile.nameSaved });
    } catch {
      toast({ title: t.general.error, description: "Er is iets misgegaan", variant: "destructive" });
    } finally { setSavingName(false); }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: t.general.error, description: t.auth.passwordMismatch, variant: "destructive" }); return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: t.general.error, description: data.error, variant: "destructive" }); return; }
      toast({ title: t.profile.passwordSaved });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast({ title: t.general.error, description: "Er is iets misgegaan", variant: "destructive" });
    } finally { setSavingPassword(false); }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t.profile.title}</h1>
            {user.isAdmin && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Beheerder
              </span>
            )}
          </div>
        </div>

        {/* Account info (read-only) */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">{t.profile.accountInfo}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.auth.email}</span>
              <span className="font-medium">{user.email}</span>
            </div>
            {user.storeName && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t.auth.storeName}</span>
                <span className="font-medium">{user.storeName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t.profile.emailVerified}</span>
              <span className={`font-medium flex items-center gap-1 ${user.emailVerified ? "text-green-600" : "text-amber-600"}`}>
                {user.emailVerified ? <><CheckCircle className="w-3.5 h-3.5" /> {t.profile.verified}</> : t.profile.notVerified}
              </span>
            </div>
          </div>
        </div>

        {/* Change name */}
        <form onSubmit={handleSaveName} className="bg-card rounded-2xl border border-border p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t.profile.changeName}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.contactName}</label>
              <Input value={contactName} onChange={e => setContactName(e.target.value)} required />
            </div>
            <Button type="submit" disabled={savingName || !contactName.trim() || contactName === user.contactName}>
              {savingName ? "Opslaan..." : t.profile.save}
            </Button>
          </div>
        </form>

        {/* Change password */}
        <form onSubmit={handleSavePassword} className="bg-card rounded-2xl border border-border p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {t.profile.changePassword}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">{t.profile.currentPassword}</label>
              <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.newPassword}</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" placeholder="Minimaal 6 tekens" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">{t.auth.confirmPassword}</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}>
              {savingPassword ? "Opslaan..." : t.profile.save}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
