import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth";
import { CheckCircle, Coins, ArrowRight } from "lucide-react";

export default function BetalingGeslaagd() {
  const [location, setLocation] = useLocation();
  const { updateCredits, user } = useUserAuth();

  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const credits = parseInt(params.get("credits") ?? "0") || 0;
  const bundleName = params.get("bundel") ?? "";

  useEffect(() => {
    if (credits > 0 && user) {
      updateCredits((user.credits ?? 0) + credits);
    }
    // Clean up URL without triggering re-render
    if (window.history && window.location.search) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-secondary mb-3">
          Betaling gelukt!
        </h1>

        {credits > 0 ? (
          <>
            <p className="text-muted-foreground mb-2 text-lg">
              Je hebt{bundleName ? ` het pakket <strong>${bundleName}</strong>` : ""} succesvol aangekocht.
            </p>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary font-bold text-xl px-6 py-3 rounded-full mb-6">
              <Coins className="w-6 h-6" />
              +{credits} connecties toegevoegd
            </div>
          </>
        ) : (
          <p className="text-muted-foreground mb-6 text-lg">
            Je aankoop is succesvol verwerkt.
          </p>
        )}

        <p className="text-sm text-muted-foreground mb-8">
          Je ontvangt een factuur per e-mail. Je kunt je facturen ook terugvinden in je dashboard onder "Mijn facturen".
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/requests">
            <Button size="lg" className="gap-2">
              Bekijk uitvragen <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/supplier/dashboard">
            <Button size="lg" variant="outline">
              Naar mijn dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
