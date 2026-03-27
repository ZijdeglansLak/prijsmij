import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/i18n";
import { useUserAuth } from "@/contexts/user-auth";

export default function VerifyEmail() {
  const { t } = useI18n();
  const { updateUser } = useUserAuth();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          updateUser({ emailVerified: true });
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">{t.auth.verifying}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t.auth.verifiedTitle}</h2>
              <p className="text-muted-foreground mb-6">{t.auth.verifiedDesc}</p>
              <Link href="/"><Button className="w-full">{t.general.backHome}</Button></Link>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-3">{t.auth.verifyErrorTitle}</h2>
              <p className="text-muted-foreground mb-6">{t.auth.verifyErrorDesc}</p>
              <Link href="/"><Button variant="outline" className="w-full">{t.general.backHome}</Button></Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
