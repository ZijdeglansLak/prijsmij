import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "wouter";

interface BannerData {
  enabled: boolean;
  icon?: string;
  text?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export function PromoBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/admin/promo-banner")
      .then(r => r.json())
      .then((d: BannerData) => {
        if (!d.enabled || !d.text?.trim()) return;
        const key = `promo-dismissed:${d.text}`;
        if (localStorage.getItem(key)) return;
        setBanner(d);
      })
      .catch(() => {});
  }, []);

  function dismiss() {
    if (!banner?.text) return;
    localStorage.setItem(`promo-dismissed:${banner.text}`, "1");
    setDismissed(true);
  }

  if (!banner || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-primary to-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {banner.icon && (
            <span className="text-xl shrink-0 leading-none">{banner.icon}</span>
          )}
          <p className="text-sm font-medium leading-snug">{banner.text}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {banner.ctaLabel && banner.ctaUrl && (
            <Link href={banner.ctaUrl}>
              <span className="text-xs font-bold bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap">
                {banner.ctaLabel} →
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
