import { pgTable, serial, boolean, timestamp } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  offlineMode: boolean("offline_mode").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});
