import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { categoriesTable, createCategoryBodySchema } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";
import { requestsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/categories", async (req, res) => {
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

    const result = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      activeRequestCount: countMap.get(cat.id) ?? 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list categories");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(requestsTable)
      .where(
        sql`${requestsTable.categoryId} = ${id} AND ${requestsTable.expiresAt} > now()`
      );

    res.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      fields: cat.fields,
      activeRequestCount: countRow?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
