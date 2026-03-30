import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const userAccountsTable = pgTable("user_accounts", {
  id: serial("id").primaryKey(),
  role: text("role", { enum: ["buyer", "seller"] }).notNull(),
  storeName: text("store_name"),
  contactName: text("contact_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  credits: integer("credits").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  username: text("username").unique(),
  notificationCategoryIds: text("notification_category_ids").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const creditPurchasesTable = pgTable("credit_purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => userAccountsTable.id).notNull(),
  bundleName: text("bundle_name").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  amountPaidCents: integer("amount_paid_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const connectionsTable = pgTable("connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => userAccountsTable.id).notNull(),
  requestId: integer("request_id").notNull(),
  bidId: integer("bid_id").notNull(),
  consumerName: text("consumer_name").notNull(),
  consumerEmail: text("consumer_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const paymentOrdersTable = pgTable("payment_orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => userAccountsTable.id).notNull(),
  bundleId: text("bundle_id").notNull(),
  bundleName: text("bundle_name").notNull(),
  creditsAmount: integer("credits_amount").notNull(),
  amountCents: integer("amount_cents").notNull(),
  paynlOrderId: text("paynl_order_id"),
  status: text("status", { enum: ["pending", "paid", "failed", "cancelled"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidAt: timestamp("paid_at"),
});

export const paymentLogsTable = pgTable("payment_logs", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  source: text("source").notNull(),
  action: text("action"),
  extra1: text("extra1"),
  paynlOrderId: text("paynl_order_id"),
  internalOrderId: integer("internal_order_id"),
  rawBody: text("raw_body"),
  result: text("result"),
  errorMessage: text("error_message"),
  creditsAdded: integer("credits_added"),
});

export type UserAccount = typeof userAccountsTable.$inferSelect;
export type UserRole = "buyer" | "seller";
export type PaymentOrder = typeof paymentOrdersTable.$inferSelect;

export const CREDIT_BUNDLES = [
  { id: "starter", name: "Starter", credits: 10, priceCents: 35, originalPriceCents: 35, label: "€0,035 per connectie", badge: null },
  { id: "popular", name: "Popular", credits: 50, priceCents: 120, originalPriceCents: 150, label: "€0,024 per connectie", badge: "Populair" },
  { id: "pro", name: "Pro", credits: 100, priceCents: 250, originalPriceCents: 300, label: "€0,025 per connectie", badge: "Beste waarde" },
  { id: "enterprise", name: "Enterprise", credits: 250, priceCents: 550, originalPriceCents: 750, label: "€0,022 per connectie", badge: null },
] as const;

export const registerSchema = z.object({
  role: z.enum(["buyer", "seller"]),
  storeName: z.string().optional(),
  contactName: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
  lang: z.enum(["nl", "en", "de", "fr"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});
