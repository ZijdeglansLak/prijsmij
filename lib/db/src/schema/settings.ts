import { pgTable, serial, boolean, timestamp, text } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  offlineMode: boolean("offline_mode").notNull().default(false),
  paynlServiceId: text("paynl_service_id"),
  paynlToken: text("paynl_token"),
  updatedAt: timestamp("updated_at").defaultNow(),
});
