import { Router } from "express";
import { pool } from "@workspace/db";

const router = Router();

const LANGS = ["nl", "en", "de", "fr"] as const;
const SLUGS = [
  "algemene-voorwaarden",
  "privacy",
  "cookies",
  "contact",
  "veelgestelde-vragen",
] as const;

router.get("/admin/pages", async (req, res) => {
  if (!req.userIsAdmin) return res.status(403).json({ error: "Forbidden" });
  try {
    const { rows } = await pool.query(
      `SELECT slug, lang, title, content, updated_at FROM static_pages ORDER BY slug, lang`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/admin/pages/:slug/:lang", async (req, res) => {
  if (!req.userIsAdmin) return res.status(403).json({ error: "Forbidden" });
  const { slug, lang } = req.params;
  if (!SLUGS.includes(slug as any)) return res.status(400).json({ error: "Invalid slug" });
  if (!LANGS.includes(lang as any)) return res.status(400).json({ error: "Invalid lang" });
  const { title, content } = req.body as { title?: string; content?: string };
  try {
    await pool.query(
      `INSERT INTO static_pages (slug, lang, title, content, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (slug, lang) DO UPDATE
         SET title = EXCLUDED.title,
             content = EXCLUDED.content,
             updated_at = NOW()`,
      [slug, lang, title ?? "", content ?? ""]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/pages/:slug", async (req, res) => {
  const { slug } = req.params;
  const lang = (req.query.lang as string) || "nl";
  if (!SLUGS.includes(slug as any)) return res.status(404).json({ error: "Not found" });
  if (!LANGS.includes(lang as any)) return res.status(400).json({ error: "Invalid lang" });
  try {
    const { rows } = await pool.query(
      `SELECT slug, lang, title, content FROM static_pages WHERE slug = $1 AND lang = $2`,
      [slug, lang]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
