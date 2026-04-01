import { pgTable, serial, text, timestamp, integer, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { requestsTable } from "./requests";

export const bidsTable = pgTable("bids", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").references(() => requestsTable.id).notNull(),
  supplierName: text("supplier_name").notNull(),
  supplierStore: text("supplier_store").notNull(),
  supplierEmail: text("supplier_email").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  offerType: text("offer_type").notNull(),
  modelName: text("model_name").notNull(),
  description: text("description").notNull(),
  warrantyMonths: integer("warranty_months").notNull().default(12),
  deliveryDays: integer("delivery_days").notNull().default(3),
  imageUrl: text("image_url"),
  isSimilarModel: boolean("is_similar_model").notNull().default(false),
  visibility: text("visibility").notNull().default("public"),
  buyerInterestEmail: text("buyer_interest_email"),
  buyerInterestName: text("buyer_interest_name"),
  buyerInterestAt: timestamp("buyer_interest_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBidSchema = createInsertSchema(bidsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertBid = z.infer<typeof insertBidSchema>;
export type Bid = typeof bidsTable.$inferSelect;

export const createBidBodySchema = z.object({
  supplierName: z.string().min(1),
  supplierStore: z.string().min(1),
  supplierEmail: z.email(),
  price: z.number().positive(),
  offerType: z.enum(["new", "refurbished", "occasion", "similar"]),
  modelName: z.string().min(1),
  description: z.string().default(""),
  warrantyMonths: z.number().int().min(0).default(12),
  deliveryDays: z.number().int().min(0).default(3),
  imageUrl: z.string().nullable().optional(),
  isSimilarModel: z.boolean(),
  visibility: z.enum(["public", "private"]).default("public"),
});
