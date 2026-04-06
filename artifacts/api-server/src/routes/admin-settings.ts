import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const inserted = await db.insert(siteSettingsTable).values({ offlineMode: false }).returning();
  return inserted[0];
}

function maskSecret(val: string | null | undefined): string {
  if (!val) return "";
  if (val.length <= 4) return "****";
  return "****" + val.slice(-4);
}

router.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      offlineMode: settings.offlineMode,
      paynlServiceId: settings.paynlServiceId ?? "",
      paynlTokenMasked: maskSecret(settings.paynlToken),
      paynlConfigured: !!(settings.paynlServiceId && settings.paynlToken),
      initialSellerCredits: settings.initialSellerCredits ?? 10,
      openaiApiKeyMasked: maskSecret(settings.openaiApiKey),
      openaiConfigured: !!(settings.openaiApiKey),
      invoiceNumberPrefix: (settings as any).invoiceNumberPrefix ?? "F",
      invoiceNextNumber: (settings as any).invoiceNextNumber ?? 1001,
      invoiceTemplate: (settings as any).invoiceTemplate ?? "",
      googleAdsConversionId: (settings as any).googleAdsConversionId ?? "",
      googleAdsConversionLabel: (settings as any).googleAdsConversionLabel ?? "",
      googleAnalyticsId: (settings as any).googleAnalyticsId ?? "",
      promoBannerEnabled: (settings as any).promoBannerEnabled ?? false,
      promoBannerIcon: (settings as any).promoBannerIcon ?? "🎁",
      promoBannerText: (settings as any).promoBannerText ?? "",
      promoBannerCtaLabel: (settings as any).promoBannerCtaLabel ?? "",
      promoBannerCtaUrl: (settings as any).promoBannerCtaUrl ?? "",
    });
  } catch {
    res.status(500).json({ error: "Fout bij ophalen instellingen" });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const { offlineMode, paynlServiceId, paynlToken, initialSellerCredits, openaiApiKey,
      invoiceNumberPrefix, invoiceNextNumber, invoiceTemplate,
      googleAdsConversionId, googleAdsConversionLabel, googleAnalyticsId,
      promoBannerEnabled, promoBannerIcon, promoBannerText, promoBannerCtaLabel, promoBannerCtaUrl } = req.body as {
      offlineMode?: boolean;
      paynlServiceId?: string;
      paynlToken?: string;
      initialSellerCredits?: number;
      openaiApiKey?: string;
      invoiceNumberPrefix?: string;
      invoiceNextNumber?: number;
      invoiceTemplate?: string;
      googleAdsConversionId?: string;
      googleAdsConversionLabel?: string;
      googleAnalyticsId?: string;
      promoBannerEnabled?: boolean;
      promoBannerIcon?: string;
      promoBannerText?: string;
      promoBannerCtaLabel?: string;
      promoBannerCtaUrl?: string;
    };

    const settings = await getOrCreateSettings();
    const updates: Partial<typeof siteSettingsTable.$inferInsert> = { updatedAt: new Date() };

    if (typeof offlineMode === "boolean") updates.offlineMode = offlineMode;
    if (typeof paynlServiceId === "string") updates.paynlServiceId = paynlServiceId.trim() || null;
    if (typeof paynlToken === "string" && !paynlToken.startsWith("****")) {
      updates.paynlToken = paynlToken.trim() || null;
    }
    if (typeof initialSellerCredits === "number" && initialSellerCredits >= 0) {
      updates.initialSellerCredits = initialSellerCredits;
    }
    if (typeof openaiApiKey === "string" && !openaiApiKey.startsWith("****")) {
      updates.openaiApiKey = openaiApiKey.trim() || null;
    }
    if (typeof invoiceNumberPrefix === "string" && invoiceNumberPrefix.trim()) {
      (updates as any).invoiceNumberPrefix = invoiceNumberPrefix.trim().toUpperCase().slice(0, 10);
    }
    if (typeof invoiceNextNumber === "number" && invoiceNextNumber >= 1) {
      (updates as any).invoiceNextNumber = Math.floor(invoiceNextNumber);
    }
    if (typeof invoiceTemplate === "string" && invoiceTemplate.trim()) {
      (updates as any).invoiceTemplate = invoiceTemplate;
    }
    if (typeof googleAdsConversionId === "string") {
      (updates as any).googleAdsConversionId = googleAdsConversionId.trim() || null;
    }
    if (typeof googleAdsConversionLabel === "string") {
      (updates as any).googleAdsConversionLabel = googleAdsConversionLabel.trim() || null;
    }
    if (typeof googleAnalyticsId === "string") {
      (updates as any).googleAnalyticsId = googleAnalyticsId.trim() || null;
    }
    if (typeof promoBannerEnabled === "boolean") (updates as any).promoBannerEnabled = promoBannerEnabled;
    if (typeof promoBannerIcon === "string") (updates as any).promoBannerIcon = promoBannerIcon.trim() || "🎁";
    if (typeof promoBannerText === "string") (updates as any).promoBannerText = promoBannerText;
    if (typeof promoBannerCtaLabel === "string") (updates as any).promoBannerCtaLabel = promoBannerCtaLabel.trim();
    if (typeof promoBannerCtaUrl === "string") (updates as any).promoBannerCtaUrl = promoBannerCtaUrl.trim();

    const updated = await db
      .update(siteSettingsTable)
      .set(updates)
      .where(eq(siteSettingsTable.id, settings.id))
      .returning();

    const s = updated[0];
    res.json({
      offlineMode: s.offlineMode,
      paynlServiceId: s.paynlServiceId ?? "",
      paynlTokenMasked: maskSecret(s.paynlToken),
      paynlConfigured: !!(s.paynlServiceId && s.paynlToken),
      initialSellerCredits: s.initialSellerCredits ?? 10,
      openaiApiKeyMasked: maskSecret(s.openaiApiKey),
      openaiConfigured: !!(s.openaiApiKey),
      invoiceNumberPrefix: (s as any).invoiceNumberPrefix ?? "F",
      invoiceNextNumber: (s as any).invoiceNextNumber ?? 1001,
      invoiceTemplate: (s as any).invoiceTemplate ?? "",
      googleAdsConversionId: (s as any).googleAdsConversionId ?? "",
      googleAdsConversionLabel: (s as any).googleAdsConversionLabel ?? "",
      googleAnalyticsId: (s as any).googleAnalyticsId ?? "",
      promoBannerEnabled: (s as any).promoBannerEnabled ?? false,
      promoBannerIcon: (s as any).promoBannerIcon ?? "🎁",
      promoBannerText: (s as any).promoBannerText ?? "",
      promoBannerCtaLabel: (s as any).promoBannerCtaLabel ?? "",
      promoBannerCtaUrl: (s as any).promoBannerCtaUrl ?? "",
    });
  } catch {
    res.status(500).json({ error: "Fout bij opslaan instellingen" });
  }
});

router.get("/promo-banner", async (_req, res) => {
  try {
    const rows = await db.select().from(siteSettingsTable).limit(1);
    const s = rows[0];
    if (!s || !(s as any).promoBannerEnabled) {
      return res.json({ enabled: false });
    }
    res.json({
      enabled: true,
      icon: (s as any).promoBannerIcon ?? "🎁",
      text: (s as any).promoBannerText ?? "",
      ctaLabel: (s as any).promoBannerCtaLabel ?? "",
      ctaUrl: (s as any).promoBannerCtaUrl ?? "",
    });
  } catch {
    res.json({ enabled: false });
  }
});

export default router;
