import { pgTable, serial, text, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { categoriesTable } from "./categories";

export const requestsTable = pgTable("requests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  description: text("description").notNull(),
  categoryId: integer("category_id").references(() => categoriesTable.id).notNull(),
  specifications: jsonb("specifications").notNull().default({}),
  allowedOfferTypes: jsonb("allowed_offer_types").notNull().default(["new"]),
  allowSimilarModels: boolean("allow_similar_models").notNull().default(false),
  consumerName: text("consumer_name").notNull(),
  consumerEmail: text("consumer_email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requestsTable.$inferSelect;

export const createRequestBodySchema = z.object({
  title: z.string().min(1),
  brand: z.string().min(1),
  description: z.string().default(""),
  categoryId: z.number().int().positive(),
  specifications: z.record(z.string(), z.unknown()),
  allowedOfferTypes: z.array(z.enum(["new", "refurbished", "occasion"])).min(1),
  allowSimilarModels: z.boolean(),
  consumerName: z.string().min(1),
  consumerEmail: z.email(),
});
