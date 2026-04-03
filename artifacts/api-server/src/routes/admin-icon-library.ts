import { Router } from "express";
import { requireAdmin } from "./auth";
import { pool } from "@workspace/db";
import { ObjectStorageService } from "../lib/objectStorage";

const router = Router();
const storage = new ObjectStorageService();

function toDto(r: { id: number; name: string; type: string; emoji: string | null; object_path: string | null; created_at: Date }) {
  if (r.type === 'emoji') {
    return { id: r.id, name: r.name, type: 'emoji', value: r.emoji, url: null, createdAt: r.created_at };
  }
  return { id: r.id, name: r.name, type: 'image', value: r.object_path, url: `/api/storage${r.object_path}`, createdAt: r.created_at };
}

router.get("/admin/icon-library", requireAdmin, async (_req, res) => {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      "SELECT id, name, type, emoji, object_path, created_at FROM icon_library ORDER BY type, name, created_at DESC"
    );
    res.json(rows.map(toDto));
  } finally { client.release(); }
});

router.post("/admin/icon-library/upload-url", requireAdmin, async (req, res) => {
  const { name, contentType, size } = req.body;
  if (!name || !contentType) { res.status(400).json({ error: "name en contentType zijn verplicht" }); return; }
  if (!contentType.startsWith("image/")) { res.status(400).json({ error: "Alleen afbeeldingen toegestaan" }); return; }
  if (size && size > 5 * 1024 * 1024) { res.status(400).json({ error: "Max 5 MB" }); return; }
  try {
    const uploadURL = await storage.getObjectEntityUploadURL();
    res.json({ uploadURL });
  } catch {
    res.status(500).json({ error: "Kon upload URL niet aanmaken" });
  }
});

router.post("/admin/icon-library", requireAdmin, async (req, res) => {
  const { name, objectPath, emoji, type = 'image' } = req.body;
  const client = await pool.connect();
  try {
    if (type === 'emoji') {
      if (!emoji) { res.status(400).json({ error: "emoji vereist" }); return; }
      const { rows } = await client.query(
        "INSERT INTO icon_library (name, type, emoji, object_path) VALUES ($1, 'emoji', $2, NULL) RETURNING id, name, type, emoji, object_path, created_at",
        [name || emoji, emoji]
      );
      res.json(toDto(rows[0]));
    } else {
      if (!objectPath) { res.status(400).json({ error: "objectPath vereist" }); return; }
      const normalizedPath = storage.normalizeObjectEntityPath(objectPath);
      const { rows } = await client.query(
        "INSERT INTO icon_library (name, type, emoji, object_path) VALUES ($1, 'image', NULL, $2) RETURNING id, name, type, emoji, object_path, created_at",
        [name, normalizedPath]
      );
      res.json(toDto(rows[0]));
    }
  } finally { client.release(); }
});

router.delete("/admin/icon-library/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const client = await pool.connect();
  try {
    await client.query("DELETE FROM icon_library WHERE id = $1", [id]);
    res.json({ ok: true });
  } finally { client.release(); }
});

export default router;
