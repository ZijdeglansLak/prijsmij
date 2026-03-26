import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplierAccountsTable = pgTable("supplier_accounts", {
  id: serial("id").primaryKey(),
  storeName: text("store_name").notNull(),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditPurchasesTable = pgTable("credit_purchases", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => supplierAccountsTable.id).notNull(),
  bundleName: text("bundle_name").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  amountPaidCents: integer("amount_paid_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const connectionsTable = pgTable("connections", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => supplierAccountsTable.id).notNull(),
  requestId: integer("request_id").notNull(),
  bidId: integer("bid_id").notNull(),
  consumerName: text("consumer_name").notNull(),
  consumerEmail: text("consumer_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierSchema = createInsertSchema(supplierAccountsTable).omit({
  id: true,
  credits: true,
  createdAt: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type SupplierAccount = typeof supplierAccountsTable.$inferSelect;
export type Connection = typeof connectionsTable.$inferSelect;
export type CreditPurchase = typeof creditPurchasesTable.$inferSelect;

export const registerSupplierSchema = z.object({
  storeName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

export const loginSupplierSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const CREDIT_BUNDLES = [
  { id: "starter", name: "Starter", credits: 10, priceCents: 3500, originalPriceCents: 3500, label: "€3,50 per connectie" },
  { id: "popular", name: "Popular", credits: 50, priceCents: 12000, originalPriceCents: 15000, label: "€2,40 per connectie", badge: "Populair" },
  { id: "pro", name: "Pro", credits: 100, priceCents: 25000, originalPriceCents: 30000, label: "€2,50 per connectie", badge: "Beste waarde" },
  { id: "enterprise", name: "Enterprise", credits: 250, priceCents: 55000, originalPriceCents: 75000, label: "€2,20 per connectie" },
] as const;
