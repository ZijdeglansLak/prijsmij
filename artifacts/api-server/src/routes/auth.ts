import { Router, type IRouter, type RequestHandler } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, registerSchema, loginSchema } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "bestbod-secret-change-in-prod";

interface JwtPayload { userId: number; email: string; role: string; }

export function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) { res.status(401).json({ error: "Niet ingelogd" }); return; }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.userId = payload.userId;
    req.userEmail = payload.email;
    req.userRole = payload.role;
    next();
  } catch { res.status(401).json({ error: "Sessie verlopen, log opnieuw in" }); }
}

export function requireSeller(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    if (req.userRole !== "seller") { res.status(403).json({ error: "Alleen verkopers hebben toegang" }); return; }
    next();
  });
}

function makeToken(user: { id: number; email: string; role: string }) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
}

function userResponse(u: typeof userAccountsTable.$inferSelect) {
  return { id: u.id, role: u.role, storeName: u.storeName, contactName: u.contactName, email: u.email, credits: u.credits };
}

// POST /auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const { role, storeName, contactName, email, password } = parsed.data;

    if (role === "seller" && !storeName) { res.status(400).json({ error: "Winkelnaam is verplicht voor verkopers" }); return; }

    const existing = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.email, email));
    if (existing.length > 0) { res.status(400).json({ error: "Dit e-mailadres is al in gebruik" }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(userAccountsTable).values({ role, storeName: storeName ?? null, contactName, email, passwordHash, credits: 0 }).returning();

    res.status(201).json({ token: makeToken(user), user: userResponse(user) });
  } catch (err) { req.log.error({ err }, "Register failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const { email, password } = parsed.data;

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.email, email));
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

// GET /auth/seller-count — active seller accounts (public)
router.get("/auth/seller-count", async (_req, res) => {
  try {
    const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(userAccountsTable).where(eq(userAccountsTable.role, "seller"));
    res.json({ count: row?.count ?? 0 });
  } catch (err) { res.status(500).json({ error: "Internal server error" }); }
});

export default router;
