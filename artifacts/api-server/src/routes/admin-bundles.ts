import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { creditBundlesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

// GET /admin/bundles — alle bundels
router.get("/admin/bundles", requireAdmin, async (_req, res) => {
  try {
    const bundles = await db
      .select()
      .from(creditBundlesTable)
      .orderBy(asc(creditBundlesTable.sortOrder));
    res.json(bundles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/bundles — nieuwe bundel aanmaken
router.post("/admin/bundles", requireAdmin, async (req, res) => {
  try {
    const { bundleKey, name, credits, priceCents, originalPriceCents, badge, sortOrder } = req.body;

    if (!bundleKey || !name || !credits || !priceCents) {
      res.status(400).json({ error: "bundleKey, name, credits en priceCents zijn verplicht" });
      return;
    }

    const [bundle] = await db
      .insert(creditBundlesTable)
      .values({
        bundleKey: String(bundleKey).toLowerCase().replace(/[^a-z0-9_-]/g, ""),
        name: String(name),
        credits: parseInt(credits),
        priceCents: Math.round(parseFloat(priceCents) * 100),
        originalPriceCents: originalPriceCents ? Math.round(parseFloat(originalPriceCents) * 100) : null,
        badge: badge || null,
        sortOrder: parseInt(sortOrder ?? 0),
        isActive: true,
      })
      .returning();

    res.status(201).json(bundle);
  } catch (err: any) {
    if (err.message?.includes("unique")) {
      res.status(409).json({ error: "Bundle key bestaat al" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// PUT /admin/bundles/:id — bundel bijwerken
router.put("/admin/bundles/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Ongeldig ID" }); return; }

    const { name, credits, priceCents, originalPriceCents, badge, sortOrder, isActive } = req.body;

    const updates: Record<string, any> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = String(name);
    if (credits !== undefined) updates.credits = parseInt(credits);
    if (priceCents !== undefined) updates.priceCents = Math.round(parseFloat(priceCents) * 100);
    if (originalPriceCents !== undefined) updates.originalPriceCents = originalPriceCents ? Math.round(parseFloat(originalPriceCents) * 100) : null;
    if (badge !== undefined) updates.badge = badge || null;
    if (sortOrder !== undefined) updates.sortOrder = parseInt(sortOrder);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const [bundle] = await db
      .update(creditBundlesTable)
      .set(updates)
      .where(eq(creditBundlesTable.id, id))
      .returning();

    if (!bundle) { res.status(404).json({ error: "Bundel niet gevonden" }); return; }
    res.json(bundle);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /admin/bundles/:id — bundel verwijderen
router.delete("/admin/bundles/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Ongeldig ID" }); return; }

    await db.delete(creditBundlesTable).where(eq(creditBundlesTable.id, id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
