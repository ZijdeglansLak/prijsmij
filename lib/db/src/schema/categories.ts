import { pgTable, serial, text, jsonb, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryGroupsTable = pgTable("category_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default("📦"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CategoryGroup = typeof categoryGroupsTable.$inferSelect;

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  description: text("description").notNull(),
  fields: jsonb("fields").notNull().default([]),
  nameI18n: jsonb("name_i18n").default({}),
  descriptionI18n: jsonb("description_i18n").default({}),
  isActive: boolean("is_active").notNull().default(true),
  groupId: integer("group_id").references(() => categoryGroupsTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCategorySchema = createInsertSchema(categoriesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categoriesTable.$inferSelect;

export const templateFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(["text", "number", "select", "textarea", "boolean"]),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
});

export type TemplateField = z.infer<typeof templateFieldSchema>;

export const createCategoryBodySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  icon: z.string().min(1),
  description: z.string().min(1),
  fields: z.array(templateFieldSchema),
});
