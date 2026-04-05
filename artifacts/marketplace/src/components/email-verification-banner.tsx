import { useState } from "react";
import { MailWarning, RefreshCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth";

export function EmailVerificationBanner() {
  const { token } = useUserAuth();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  async function resend() {
    setResending(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setSent(true);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-16 px-4">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailWarning className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-secondary mb-2">E-mailadres niet bevestigd</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Voordat je uitvragen kunt plaatsen of biedingen kunt doen, moet je eerst je e-mailadres bevestigen.
          Controleer je inbox voor de bevestigingsmail.
        </p>
        {sent ? (
          <div className="flex items-center justify-center gap-2 text-green-700 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Bevestigingsmail opnieuw verstuurd!
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={resend}
            disabled={resending}
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            {resending ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Bevestigingsmail opnieuw sturen
          </Button>
        )}
      </div>
    </div>
  );
}
