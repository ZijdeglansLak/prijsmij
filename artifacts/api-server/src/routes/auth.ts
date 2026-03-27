import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, registerSchema, loginSchema } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "prijsmij-secret-change-in-prod";

type Lang = "nl" | "en" | "de" | "fr";

const FREE_EMAIL_DOMAINS = [
  "gmail.com", "googlemail.com", "hotmail.com", "hotmail.nl", "outlook.com",
  "outlook.nl", "yahoo.com", "yahoo.nl", "live.com", "live.nl", "icloud.com",
  "me.com", "mac.com", "msn.com", "protonmail.com", "proton.me",
  "gmx.com", "gmx.net", "gmx.nl", "web.de", "kpnmail.nl", "xs4all.nl",
  "ziggo.nl", "planet.nl", "hetnet.nl", "upcmail.nl",
];

interface JwtPayload { userId: number; email: string; role: string; isAdmin: boolean; }

export function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Niet ingelogd" }); return; }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    req.userIsAdmin = payload.isAdmin ?? false;
    next();
  } catch { res.status(401).json({ error: "Sessie verlopen, log opnieuw in" }); }
}

export function requireSeller(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (req.userRole !== "seller") { res.status(403).json({ error: "Alleen verkopers hebben toegang" }); return; }
    next();
  });
}

export function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (!req.userIsAdmin) { res.status(403).json({ error: "Alleen beheerders hebben toegang" }); return; }
    next();
  });
}

function makeToken(user: { id: number; email: string; role: string; isAdmin: boolean }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "30d" });
}

function userResponse(u: typeof userAccountsTable.$inferSelect) {
  return {
    id: u.id,
    role: u.role,
    storeName: u.storeName,
    contactName: u.contactName,
    email: u.email,
    credits: u.credits,
    isAdmin: u.isAdmin,
    emailVerified: u.emailVerified,
  };
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const { role, storeName, contactName, email, password, lang = "nl" } = parsed.data;

    if (role === "seller" && !storeName) { res.status(400).json({ error: "Winkelnaam is verplicht voor verkopers" }); return; }

    const existing = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.email, email));
    if (existing.length > 0) { res.status(400).json({ error: "Dit e-mailadres is al in gebruik" }); return; }

    const emailDomain = email.split("@")[1]?.toLowerCase();
    const domainWarning = role === "seller" && emailDomain && FREE_EMAIL_DOMAINS.includes(emailDomain)
      ? `Let op: je hebt een privé e-mailadres gebruikt (${emailDomain}). Voor verkopers raden we een zakelijk e-mailadres aan dat overeenkomt met je winkeldomein.`
      : null;

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const [user] = await db.insert(userAccountsTable).values({
      role,
      storeName: storeName ?? null,
      contactName,
      email,
      passwordHash,
      credits: 0,
      emailVerificationToken: verificationToken,
      emailVerified: false,
    }).returning();

    const verificationLink = await sendVerificationEmail(email, contactName, verificationToken, lang as Lang);

    res.status(201).json({
      token: makeToken(user),
      user: userResponse(user),
      domainWarning,
      verificationLink: process.env.SMTP_HOST ? undefined : verificationLink,
    });
  } catch (err) { req.log.error({ err }, "Register failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /auth/login — accepts email OR username
router.post("/auth/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: "Vul je e-mailadres en wachtwoord in" }); return; }
    const { email: emailOrUsername, password } = parsed.data;

    let user = await db.select().from(userAccountsTable)
      .where(or(eq(userAccountsTable.email, emailOrUsername), eq(userAccountsTable.username, emailOrUsername)))
      .then(rows => rows[0]);

    if (!user) { res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" }); return; }

    res.json({ token: makeToken(user), user: userResponse(user) });
  } catch (err) { req.log.error({ err }, "Login failed"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }
    res.json(userResponse(user));
  } catch (err) { req.log.error({ err }, "Get me failed"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /auth/verify-email?token=xxx
router.get("/auth/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== "string") { res.status(400).json({ error: "Ongeldige verificatielink" }); return; }

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.emailVerificationToken, token));
    if (!user) { res.status(400).json({ error: "Ongeldige of verlopen verificatielink" }); return; }

    await db.update(userAccountsTable)
      .set({ emailVerified: true, emailVerificationToken: null })
      .where(eq(userAccountsTable.id, user.id));

    res.json({ success: true, message: "E-mailadres bevestigd" });
  } catch (err) { req.log.error({ err }, "Verify email failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /auth/resend-verification
router.post("/auth/resend-verification", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }
    if (user.emailVerified) { res.json({ message: "E-mail is al bevestigd" }); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const lang = (req.body.lang as Lang) ?? "nl";
    await db.update(userAccountsTable).set({ emailVerificationToken: token }).where(eq(userAccountsTable.id, userId));
    const link = await sendVerificationEmail(user.email, user.contactName, token, lang);
    res.json({ message: "Verificatie-e-mail opnieuw verstuurd", verificationLink: process.env.SMTP_HOST ? undefined : link });
  } catch (err) { req.log.error({ err }, "Resend verification failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /auth/forgot-password
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email, lang = "nl" } = req.body;
    if (!email) { res.status(400).json({ error: "Vul je e-mailadres in" }); return; }

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.email, email));

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await db.update(userAccountsTable)
        .set({ passwordResetToken: token, passwordResetExpires: expires })
        .where(eq(userAccountsTable.id, user.id));
      await sendPasswordResetEmail(user.email, user.contactName, token, lang as Lang);
    }

    res.json({ message: "Als dat e-mailadres bekend is, ontvang je een e-mail met instructies." });
  } catch (err) { req.log.error({ err }, "Forgot password failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /auth/reset-password
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      res.status(400).json({ error: "Ongeldig verzoek of wachtwoord te kort (minimaal 6 tekens)" }); return;
    }

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.passwordResetToken, token));
    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      res.status(400).json({ error: "Ongeldige of verlopen wachtwoord-resetlink" }); return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.update(userAccountsTable)
      .set({ passwordHash, passwordResetToken: null, passwordResetExpires: null })
      .where(eq(userAccountsTable.id, user.id));

    res.json({ success: true, message: "Wachtwoord succesvol gewijzigd" });
  } catch (err) { req.log.error({ err }, "Reset password failed"); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /auth/profile — update own name and/or password
router.put("/auth/profile", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { contactName, currentPassword, newPassword } = req.body;

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }

    const updates: Partial<typeof userAccountsTable.$inferInsert> = {};

    if (contactName && typeof contactName === "string" && contactName.trim()) {
      updates.contactName = contactName.trim();
    }

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: "Huidig wachtwoord is verplicht" }); return; }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) { res.status(400).json({ error: "Huidig wachtwoord is onjuist" }); return; }
      if (newPassword.length < 6) { res.status(400).json({ error: "Nieuw wachtwoord moet minimaal 6 tekens zijn" }); return; }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Geen wijzigingen opgegeven" }); return; }

    const [updated] = await db.update(userAccountsTable).set(updates).where(eq(userAccountsTable.id, userId)).returning();
    res.json(userResponse(updated));
  } catch (err) { req.log.error({ err }, "Update profile failed"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /auth/seller-count — active seller accounts (public)
router.get("/auth/seller-count", async (_req, res) => {
  try {
    const rows = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.role, "seller"));
    res.json({ count: rows.length });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
