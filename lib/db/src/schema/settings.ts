import { pgTable, serial, boolean, timestamp, text, integer } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  offlineMode: boolean("offline_mode").notNull().default(false),
  paynlServiceId: text("paynl_service_id"),
  paynlToken: text("paynl_token"),
  initialSellerCredits: integer("initial_seller_credits").notNull().default(10),
  openaiApiKey: text("openai_api_key"),
  invoiceNumberPrefix: text("invoice_number_prefix").notNull().default("F"),
  invoiceNextNumber: integer("invoice_next_number").notNull().default(1001),
  invoiceTemplate: text("invoice_template"),
  googleAdsConversionId: text("google_ads_conversion_id"),
  googleAdsConversionLabel: text("google_ads_conversion_label"),
  googleAnalyticsId: text("google_analytics_id"),
  promoBannerEnabled: boolean("promo_banner_enabled").notNull().default(false),
  promoBannerIcon: text("promo_banner_icon").notNull().default("🎁"),
  promoBannerText: text("promo_banner_text").notNull().default(""),
  promoBannerCtaLabel: text("promo_banner_cta_label").notNull().default(""),
  promoBannerCtaUrl: text("promo_banner_cta_url").notNull().default(""),
  updatedAt: timestamp("updated_at").defaultNow(),
});
