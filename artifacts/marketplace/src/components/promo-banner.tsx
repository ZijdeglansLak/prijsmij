import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";
import { useI18n } from "@/contexts/i18n";
import { useUserAuth } from "@/contexts/user-auth";
import type { Language } from "@/i18n/translations";

interface BannerData {
  enabled: boolean;
  icon?: string;
  texts?: Record<Language, string>;
  ctaLabels?: Record<Language, string>;
  ctaUrl?: string;
  onlyLoggedOut?: boolean;
}

export function PromoBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const { lang } = useI18n();
  const { user } = useUserAuth();

  useEffect(() => {
    fetch("/api/admin/promo-banner")
      .then(r => r.json())
      .then((d: BannerData) => {
        if (!d.enabled) return;
        const nlText = d.texts?.nl ?? "";
        if (!nlText.trim()) return;
        const key = `promo-dismissed:${nlText}`;
        if (localStorage.getItem(key)) return;
        setBanner(d);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    if (!banner?.texts?.nl) return;
    localStorage.setItem(`promo-dismissed:${banner.texts.nl}`, "1");
    setDismissed(true);
  }

  if (!banner || dismissed) return null;
  if (banner.onlyLoggedOut && user) return null;

  const text = banner.texts?.[lang] || banner.texts?.nl || "";
  const ctaLabel = banner.ctaLabels?.[lang] || banner.ctaLabels?.nl || "";

  if (!text.trim()) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary to-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {banner.icon && (
            <span className="text-xl shrink-0 leading-none">{banner.icon}</span>
          )}
          <p className="text-sm font-medium leading-snug">{text}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ctaLabel && banner.ctaUrl && (
            <Link href={banner.ctaUrl}>
              <span className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
                {ctaLabel} →
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
