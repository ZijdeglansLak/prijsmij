import { Router, type IRouter } from "express";
import multer from "multer";
import sharp from "sharp";
import { db } from "@workspace/db";
import { userAccountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { writeLog } from "../lib/db-log";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Ongeldig bestandstype: ${file.mimetype}`));
    }
  },
});

router.post("/auth/avatar", requireAuth, (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (err) {
      const userId = (req as any).userId as number | undefined;
      const userEmail = (req as any).userEmail as string | undefined;
      const msg = err.message ?? String(err);
      const isMimeError = msg.toLowerCase().includes("ongeldig bestandstype") || msg.toLowerCase().includes("file type");
      const isSizeError = msg.toLowerCase().includes("too large") || msg.toLowerCase().includes("limit");

      writeLog({
        category: "ERROR",
        message: `[AVATAR] Upload afgewezen — ${isMimeError ? "ongeldig bestandstype" : isSizeError ? "bestand te groot" : "multer fout"}: ${msg}`,
        userId: userId ?? null,
        userEmail: userEmail ?? null,
        errorCode: isMimeError ? "AVATAR_INVALID_TYPE" : isSizeError ? "AVATAR_TOO_LARGE" : "AVATAR_MULTER_ERROR",
      });

      if (isMimeError) {
        res.status(400).json({ error: "Alleen JPEG en PNG bestanden zijn toegestaan" });
      } else if (isSizeError) {
        res.status(400).json({ error: "Bestand is te groot (max 10 MB)" });
      } else {
        res.status(400).json({ error: `Ongeldig bestand: ${msg}` });
      }
      return;
    }
    next();
  });
}, async (req, res) => {
  const userId = (req as any).userId as number;
  const userEmail = (req as any).userEmail as string;

  try {
    if (!req.file) {
      await writeLog({ category: "ERROR", message: "[AVATAR] Upload aangeroepen zonder bestand", userId, userEmail, errorCode: "AVATAR_NO_FILE" });
      res.status(400).json({ error: "Geen afbeelding ontvangen" });
      return;
    }

    const { size, mimetype } = req.file;

    const compressed = await sharp(req.file.buffer)
      .resize(400, 400, { fit: "cover", position: "centre" })
      .jpeg({ quality: 80 })
      .toBuffer();

    const base64 = compressed.toString("base64");

    await db
      .update(userAccountsTable)
      .set({ avatarData: base64 })
      .where(eq(userAccountsTable.id, userId));

    await writeLog({
      category: "LOGIN",
      message: `[AVATAR] Avatar opgeslagen — origineel ${Math.round(size / 1024)} KB (${mimetype}), gecomprimeerd ${Math.round(compressed.length / 1024)} KB`,
      userId,
      userEmail,
    });

    res.json({ avatarUrl: `/api/users/${userId}/avatar` });
  } catch (err: any) {
    const detail = err?.message ?? String(err);
    await writeLog({
      category: "ERROR",
      message: `[AVATAR] Serverfout bij upload: ${detail}`,
      userId,
      userEmail,
      errorCode: "AVATAR_SERVER_ERROR",
    });
    res.status(500).json({ error: `Upload mislukt: ${detail}` });
  }
});

router.delete("/auth/avatar", requireAuth, async (req, res) => {
  const userId = (req as any).userId as number;
  const userEmail = (req as any).userEmail as string;
  try {
    await db
      .update(userAccountsTable)
      .set({ avatarData: null })
      .where(eq(userAccountsTable.id, userId));
    await writeLog({ category: "LOGIN", message: "[AVATAR] Avatar verwijderd", userId, userEmail });
    res.json({ ok: true });
  } catch (err: any) {
    await writeLog({ category: "ERROR", message: `[AVATAR] Verwijderen mislukt: ${err?.message}`, userId, userEmail, errorCode: "AVATAR_DELETE_ERROR" });
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
