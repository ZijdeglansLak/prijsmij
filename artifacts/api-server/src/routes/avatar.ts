import { Router, type IRouter } from "express";
import multer from "multer";
import sharp from "sharp";
import { db } from "@workspace/db";
import { userAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Alleen JPEG en PNG bestanden zijn toegestaan"));
    }
  },
});

router.post("/auth/avatar", requireAuth, (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      const msg = err.message ?? "";
      if (msg.includes("Alleen") || msg.toLowerCase().includes("file type") || msg.toLowerCase().includes("unexpected field")) {
        res.status(400).json({ error: "Alleen JPEG en PNG bestanden zijn toegestaan" });
      } else if (msg.toLowerCase().includes("too large") || msg.toLowerCase().includes("limit")) {
        res.status(400).json({ error: "Bestand is te groot (max 10 MB)" });
      } else {
        console.error("[AVATAR] multer error:", err);
        res.status(400).json({ error: "Ongeldig bestand" });
      }
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Geen afbeelding ontvangen" });
      return;
    }

    const compressed = await sharp(req.file.buffer)
      .resize(400, 400, { fit: "cover", position: "centre" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = compressed.toString("base64");
    const userId = (req as any).userId as number;

    await db
      .update(userAccountsTable)
      .set({ avatarData: base64 })
      .where(eq(userAccountsTable.id, userId));

    res.json({ avatarUrl: `/api/users/${userId}/avatar` });
  } catch (err: any) {
    console.error("[AVATAR]", err);
    res.status(500).json({ error: "Upload mislukt" });
  }
});

router.delete("/auth/avatar", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    await db
      .update(userAccountsTable)
      .set({ avatarData: null })
      .where(eq(userAccountsTable.id, userId));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Verwijderen mislukt" });
  }
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).end(); return; }

    const [user] = await db
      .select({ avatarData: userAccountsTable.avatarData })
      .from(userAccountsTable)
      .where(eq(userAccountsTable.id, id));

    if (!user?.avatarData) { res.status(404).end(); return; }

    const buf = Buffer.from(user.avatarData, "base64");
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", String(buf.length));
    res.end(buf);
  } catch {
    res.status(500).end();
  }
});

export default router;
