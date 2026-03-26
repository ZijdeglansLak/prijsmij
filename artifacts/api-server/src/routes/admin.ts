import { Router, type IRouter, type RequestHandler } from "express";
import { db } from "@workspace/db";
import { categoriesTable, createCategoryBodySchema } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const requireAdmin: RequestHandler = (req, res, next) => {
  const auth = req.headers["x-admin-password"] || req.query.adminPassword;
  if (auth !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

router.post("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const parsed = createCategoryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;

    const [cat] = await db
      .insert(categoriesTable)
      .values({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        description: data.description,
        fields: data.fields,
      })
      .returning();

    res.status(201).json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      fields: cat.fields,
      activeRequestCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create category");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = createCategoryBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;

    const [cat] = await db
      .update(categoriesTable)
      .set({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        description: data.description,
        fields: data.fields,
        updatedAt: new Date(),
      })
      .where(eq(categoriesTable.id, id))
      .returning();

    if (!cat) {
      res.status(404).json({ error: "Category not found" });
      return;
    }

    res.json({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      description: cat.description,
      fields: cat.fields,
      activeRequestCount: 0,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update category");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
