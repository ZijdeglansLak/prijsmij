import { pgTable, serial, boolean, timestamp, text, integer } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  offlineMode: boolean("offline_mode").notNull().default(false),
  paynlServiceId: text("paynl_service_id"),
  paynlToken: text("paynl_token"),
  initialSellerCredits: integer("initial_seller_credits").notNull().default(10),
  openaiApiKey: text("openai_api_key"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
