import { Router, IRouter } from "express";
import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (rows.length > 0) return rows[0];
  const inserted = await db.insert(siteSettingsTable).values({ offlineMode: false }).returning();
  return inserted[0];
}

router.get("/settings", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings);
  } catch {
    res.status(500).json({ error: "Fout bij ophalen instellingen" });
  }
});

router.put("/settings", requireAdmin, async (req, res) => {
  try {
    const { offlineMode } = req.body as { offlineMode: boolean };
    const settings = await getOrCreateSettings();
    const updated = await db
      .update(siteSettingsTable)
      .set({ offlineMode: !!offlineMode, updatedAt: new Date() })
      .where(eq(siteSettingsTable.id, settings.id))
      .returning();
    res.json(updated[0]);
  } catch {
    res.status(500).json({ error: "Fout bij opslaan instellingen" });
  }
});

export default router;
