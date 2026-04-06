import { useState } from "react";
import { MailWarning, RefreshCw, CheckCircle2, ExternalLink, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth";

export function EmailVerificationBanner() {
  const { token, updateUser } = useUserAuth();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Er is iets misgegaan. Probeer het opnieuw.");
        return;
      }

      if (data.message === "E-mail is al bevestigd") {
        updateUser({ emailVerified: true });
        return;
      }

      if (data.verificationLink) {
        setDevLink(data.verificationLink);
      }
      setSent(true);
    } catch {
      setError("Geen verbinding met de server. Probeer het opnieuw.");
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
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {devLink ? "Klik op de link hieronder om je e-mail te bevestigen:" : "Bevestigingsmail opnieuw verstuurd! Controleer je inbox (en spammap)."}
            </div>
            {devLink && (
              <a
                href={devLink}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium underline underline-offset-2 hover:text-primary/80 break-all"
              >
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                Bevestig je e-mailadres
              </a>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
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
            {error && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
