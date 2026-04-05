import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";

interface PromoBannerConfig {
  id: string;
  icon: string;
  text: string;
  cta?: { label: string; href: string };
  gradient: string;
  textColor: string;
}

// ─── HUIDIGE ACTIE ────────────────────────────────────────────────────────────
// Verander alleen dit object om een andere banner te tonen.
// Verhoog `id` bij elke nieuwe actie zodat eerder weggeklikte banners opnieuw verschijnen.
const ACTIVE_BANNER: PromoBannerConfig = {
  id: "promo-2025-welkom-credits-v1",
  icon: "🎁",
  text: "Nieuwe winkels ontvangen 5 gratis credits bij hun eerste aanmelding!",
  cta: { label: "Aanmelden als winkel", href: "/auth/register?role=supplier" },
  gradient: "from-primary to-accent",
  textColor: "text-white",
};
// ─────────────────────────────────────────────────────────────────────────────

export function PromoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`banner-dismissed:${ACTIVE_BANNER.id}`);
    if (!dismissed) setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(`banner-dismissed:${ACTIVE_BANNER.id}`, "1");
    setVisible(false);
  }

  if (!visible) return null;

  const b = ACTIVE_BANNER;

  return (
    <div className={`w-full bg-gradient-to-r ${b.gradient} ${b.textColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0 leading-none">{b.icon}</span>
          <p className="text-sm font-medium leading-snug">
            {b.text}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {b.cta && (
            <Link href={b.cta.href}>
              <span className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
                {b.cta.label} →
              </span>
            </Link>
          )}
          <button
            onClick={dismiss}
            aria-label="Sluit banner"
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
