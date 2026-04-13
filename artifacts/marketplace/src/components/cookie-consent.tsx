import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "prijsmij_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-border rounded-2xl shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Cookie className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-secondary">Cookies op PrijsMij</p>
          </div>
          <button onClick={decline} className="text-muted-foreground hover:text-secondary transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Wij gebruiken cookies om de website goed te laten werken en je ervaring te verbeteren.{" "}
          <a href="/pages/privacy" className="text-primary underline underline-offset-2 hover:opacity-80">
            Meer informatie
          </a>
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} className="flex-1 h-8 text-xs">
            Accepteren
          </Button>
          <Button size="sm" variant="outline" onClick={decline} className="flex-1 h-8 text-xs">
            Weigeren
          </Button>
        </div>
      </div>
    </div>
  );
}
