import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

router.get("/category-groups", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, icon, sort_order, is_active FROM category_groups WHERE is_active = TRUE ORDER BY sort_order, name`
    );
    res.json(rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, sortOrder: r.sort_order, isActive: r.is_active })));
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/admin/category-groups", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT g.id, g.name, g.slug, g.icon, g.sort_order, g.is_active,
              COUNT(c.id)::int as category_count
       FROM category_groups g
       LEFT JOIN categories c ON c.group_id = g.id
       GROUP BY g.id ORDER BY g.sort_order, g.name`
    );
    res.json(rows.map(r => ({
      id: r.id, name: r.name, slug: r.slug, icon: r.icon,
      sortOrder: r.sort_order, isActive: r.is_active, categoryCount: r.category_count,
    })));
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/admin/category-groups", requireAdmin, async (req, res) => {
  const { name, slug, icon, sortOrder } = req.body as { name?: string; slug?: string; icon?: string; sortOrder?: number };
  if (!name || !slug) return res.status(400).json({ error: "Naam en slug zijn verplicht" });
  try {
    const { rows } = await pool.query(
      `INSERT INTO category_groups (name, slug, icon, sort_order) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name.trim(), slug.trim(), icon?.trim() || "📦", sortOrder ?? 0]
    );
    const r = rows[0];
    res.status(201).json({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, sortOrder: r.sort_order, isActive: r.is_active });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug al in gebruik" });
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/admin/category-groups/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Ongeldig id" });
  const { name, slug, icon, sortOrder, isActive } = req.body as { name?: string; slug?: string; icon?: string; sortOrder?: number; isActive?: boolean };
  const sets: string[] = [];
  const vals: any[] = [];
  if (name !== undefined) { sets.push(`name = $${vals.length + 1}`); vals.push(name.trim()); }
  if (slug !== undefined) { sets.push(`slug = $${vals.length + 1}`); vals.push(slug.trim()); }
  if (icon !== undefined) { sets.push(`icon = $${vals.length + 1}`); vals.push(icon.trim()); }
  if (sortOrder !== undefined) { sets.push(`sort_order = $${vals.length + 1}`); vals.push(sortOrder); }
  if (isActive !== undefined) { sets.push(`is_active = $${vals.length + 1}`); vals.push(isActive); }
  if (sets.length === 0) return res.status(400).json({ error: "Niets om bij te werken" });
  vals.push(id);
  try {
    const { rows } = await pool.query(
      `UPDATE category_groups SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (rows.length === 0) return res.status(404).json({ error: "Groep niet gevonden" });
    const r = rows[0];
    res.json({ id: r.id, name: r.name, slug: r.slug, icon: r.icon, sortOrder: r.sort_order, isActive: r.is_active });
  } catch (err: any) {
    if (err.code === "23505") return res.status(409).json({ error: "Slug al in gebruik" });
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/admin/category-groups/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Ongeldig id" });
  try {
    await pool.query(`UPDATE categories SET group_id = NULL WHERE group_id = $1`, [id]);
    const { rowCount } = await pool.query(`DELETE FROM category_groups WHERE id = $1`, [id]);
    if (rowCount === 0) return res.status(404).json({ error: "Groep niet gevonden" });
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
