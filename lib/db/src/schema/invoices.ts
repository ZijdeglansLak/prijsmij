import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { userAccountsTable } from "./users";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  userId: integer("user_id").references(() => userAccountsTable.id).notNull(),
  type: text("type", { enum: ["lead_purchase", "credit_purchase"] }).notNull(),
  description: text("description").notNull(),
  amountCents: integer("amount_cents").notNull(),
  vatPercent: integer("vat_percent").notNull().default(21),
  vatCents: integer("vat_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  pdfBase64: text("pdf_base64"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Invoice = typeof invoicesTable.$inferSelect;
