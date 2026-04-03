import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const kennisbankTable = pgTable("kennisbank", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type KennisbankEntry = typeof kennisbankTable.$inferSelect;
export type InsertKennisbankEntry = typeof kennisbankTable.$inferInsert;
