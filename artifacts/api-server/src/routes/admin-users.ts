import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { requireAdmin } from "./auth";

const router: IRouter = Router();

function safeUser(u: typeof userAccountsTable.$inferSelect) {
  return {
    id: u.id,
    role: u.role,
    storeName: u.storeName,
    contactName: u.contactName,
    email: u.email,
    credits: u.credits,
    isAdmin: u.isAdmin,
    emailVerified: u.emailVerified,
    username: u.username,
    createdAt: u.createdAt,
  };
}

// GET /admin/users — list all users
router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const users = await db.select().from(userAccountsTable).orderBy(userAccountsTable.createdAt);
    res.json(users.map(safeUser));
  } catch (err) { req.log.error({ err }, "Get users failed"); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /admin/users/:id — update user (name, email, storeName, role, isAdmin, password)
router.put("/admin/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) { res.status(400).json({ error: "Ongeldig gebruikers-id" }); return; }

    const { contactName, email, storeName, role, isAdmin, newPassword } = req.body;
    const updates: Partial<typeof userAccountsTable.$inferInsert> = {};

    if (contactName && typeof contactName === "string") updates.contactName = contactName.trim();
    if (email && typeof email === "string" && email.includes("@")) {
      const conflict = await db.select({ id: userAccountsTable.id }).from(userAccountsTable)
        .where(eq(userAccountsTable.email, email.toLowerCase().trim()));
      if (conflict.length > 0 && conflict[0].id !== id) {
        res.status(400).json({ error: "Dit e-mailadres is al in gebruik" }); return;
      }
      updates.email = email.toLowerCase().trim();
    }
    if (typeof storeName === "string") updates.storeName = storeName.trim() || null;
    if (role && (role === "buyer" || role === "seller")) updates.role = role;
    if (typeof isAdmin === "boolean") updates.isAdmin = isAdmin;
    if (newPassword && typeof newPassword === "string" && newPassword.length >= 6) {
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Geen wijzigingen" }); return; }

    const [updated] = await db.update(userAccountsTable).set(updates).where(eq(userAccountsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }
    res.json(safeUser(updated));
  } catch (err) { req.log.error({ err }, "Update user failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /admin/users — create a new admin account
router.post("/admin/users", requireAdmin, async (req, res) => {
  try {
    const { contactName, email, password } = req.body;
    if (!contactName || !email || !password || password.length < 6) {
      res.status(400).json({ error: "Naam, e-mailadres en wachtwoord (min. 6 tekens) zijn verplicht" }); return;
    }

    const existing = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.email, email));
    if (existing.length > 0) { res.status(400).json({ error: "Dit e-mailadres is al in gebruik" }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(userAccountsTable).values({
      role: "buyer",
      contactName,
      email,
      passwordHash,
      credits: 0,
      isAdmin: true,
      emailVerified: true,
    }).returning();

    res.status(201).json(safeUser(user));
  } catch (err) { req.log.error({ err }, "Create admin failed"); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
