import { Router } from "express";
import { pool } from "@workspace/db";
import { requireAdmin } from "./auth";

const router = Router();

router.get("/admin/kennisbank", requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, content, created_at, updated_at FROM kennisbank ORDER BY id DESC`
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.post("/admin/kennisbank", requireAdmin, async (req, res) => {
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "Titel en inhoud zijn verplicht" });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO kennisbank (title, content, created_at, updated_at) VALUES ($1, $2, NOW(), NOW()) RETURNING *`,
      [title.trim(), content.trim()]
    );
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/admin/kennisbank/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  const { title, content } = req.body as { title?: string; content?: string };
  if (!title?.trim() || !content?.trim()) {
    return res.status(400).json({ error: "Titel en inhoud zijn verplicht" });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE kennisbank SET title=$1, content=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [title.trim(), content.trim(), id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Niet gevonden" });
    res.json(rows[0]);
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

router.delete("/admin/kennisbank/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });
  try {
    await pool.query(`DELETE FROM kennisbank WHERE id=$1`, [id]);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
