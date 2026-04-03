import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, createCategoryBodySchema } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { requestsTable } from "@workspace/db";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

// GET /categories — public, only active
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable)
      .where(eq(categoriesTable.isActive, true))
      .orderBy(categoriesTable.name);

    const counts = await db
      .select({
        categoryId: requestsTable.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(requestsTable)
      .where(sql`${requestsTable.expiresAt} > now()`)
      .groupBy(requestsTable.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));

    res.json(categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      isActive: cat.isActive,
      groupId: cat.groupId ?? null,
      activeRequestCount: countMap.get(cat.id) ?? 0,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /admin/categories — admin only, includes inactive
router.get("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);

    const counts = await db
      .select({
        categoryId: requestsTable.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(requestsTable)
      .where(sql`${requestsTable.expiresAt} > now()`)
      .groupBy(requestsTable.categoryId);

    const countMap = new Map(counts.map((c) => [c.categoryId, c.count]));

    res.json(categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      isActive: cat.isActive,
      groupId: cat.groupId ?? null,
      activeRequestCount: countMap.get(cat.id) ?? 0,
      fields: cat.fields ?? [],
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to list categories (admin)");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /categories/:id
router.get("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) { res.status(404).json({ error: "Category not found" }); return; }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(requestsTable)
      .where(sql`${requestsTable.categoryId} = ${id} AND ${requestsTable.expiresAt} > now()`);

    res.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      fields: cat.fields,
      isActive: cat.isActive,
      activeRequestCount: countRow?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get category");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /categories — admin only
router.post("/categories", requireAdmin, async (req, res) => {
  try {
    const parsed = createCategoryBodySchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

    const [cat] = await db.insert(categoriesTable).values(parsed.data).returning();
    res.status(201).json(cat);
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /admin/categories/:id — update name, icon, description, isActive, fields
router.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Ongeldig id" }); return; }

    const { name, icon, description, isActive, fields, groupId } = req.body;
    const updates: Partial<typeof categoriesTable.$inferInsert> = { updatedAt: new Date() };

    if (name && typeof name === "string") updates.name = name.trim();
    if (icon && typeof icon === "string") updates.icon = icon.trim();
    if (typeof description === "string") updates.description = description.trim();
    if (typeof isActive === "boolean") updates.isActive = isActive;
    if (Array.isArray(fields)) updates.fields = fields;
    if (groupId === null || typeof groupId === "number") updates.groupId = groupId ?? null;

    const [updated] = await db.update(categoriesTable).set(updates).where(eq(categoriesTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Categorie niet gevonden" }); return; }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(requestsTable)
      .where(sql`${requestsTable.categoryId} = ${id} AND ${requestsTable.expiresAt} > now()`);

    res.json({ ...updated, activeRequestCount: countRow?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
