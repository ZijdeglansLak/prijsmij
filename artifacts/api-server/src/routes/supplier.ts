import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { db } from "@workspace/db";
import {
  supplierAccountsTable,
  creditPurchasesTable,
  connectionsTable,
  requestsTable,
  bidsTable,
  registerSupplierSchema,
  loginSupplierSchema,
  CREDIT_BUNDLES,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || "bestbod-secret-change-in-prod";

interface JwtPayload {
  supplierId: number;
  email: string;
}

export function requireSupplierAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Niet ingelogd" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).supplierId = payload.supplierId;
    (req as any).supplierEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ error: "Sessie verlopen, log opnieuw in" });
  }
}

// POST /supplier/register
router.post("/supplier/register", async (req, res) => {
  try {
    const parsed = registerSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { storeName, contactName, email, password } = parsed.data;

    const existing = await db
      .select({ id: supplierAccountsTable.id })
      .from(supplierAccountsTable)
      .where(eq(supplierAccountsTable.email, email));

    if (existing.length > 0) {
      res.status(400).json({ error: "Dit e-mailadres is al in gebruik" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [supplier] = await db
      .insert(supplierAccountsTable)
      .values({ storeName, contactName, email, passwordHash, credits: 0 })
      .returning();

    const token = jwt.sign({ supplierId: supplier.id, email: supplier.email }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      token,
      supplier: {
        id: supplier.id,
        storeName: supplier.storeName,
        contactName: supplier.contactName,
        email: supplier.email,
        credits: supplier.credits,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to register supplier");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /supplier/login
router.post("/supplier/login", async (req, res) => {
  try {
    const parsed = loginSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { email, password } = parsed.data;

    const [supplier] = await db
      .select()
      .from(supplierAccountsTable)
      .where(eq(supplierAccountsTable.email, email));

    if (!supplier) {
      res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" });
      return;
    }

    const valid = await bcrypt.compare(password, supplier.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" });
      return;
    }

    const token = jwt.sign({ supplierId: supplier.id, email: supplier.email }, JWT_SECRET, { expiresIn: "30d" });

    res.json({
      token,
      supplier: {
        id: supplier.id,
        storeName: supplier.storeName,
        contactName: supplier.contactName,
        email: supplier.email,
        credits: supplier.credits,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Failed to login supplier");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /supplier/me
router.get("/supplier/me", requireSupplierAuth, async (req, res) => {
  try {
    const supplierId = (req as any).supplierId as number;
    const [supplier] = await db
      .select()
      .from(supplierAccountsTable)
      .where(eq(supplierAccountsTable.id, supplierId));

    if (!supplier) {
      res.status(404).json({ error: "Account niet gevonden" });
      return;
    }

    res.json({
      id: supplier.id,
      storeName: supplier.storeName,
      contactName: supplier.contactName,
      email: supplier.email,
      credits: supplier.credits,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get supplier");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /supplier/bundles
router.get("/supplier/bundles", (_req, res) => {
  res.json(CREDIT_BUNDLES);
});

// POST /supplier/credits/purchase
router.post("/supplier/credits/purchase", requireSupplierAuth, async (req, res) => {
  try {
    const supplierId = (req as any).supplierId as number;
    const { bundleId } = req.body;

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) {
      res.status(400).json({ error: "Onbekende bundel" });
      return;
    }

    await db.insert(creditPurchasesTable).values({
      supplierId,
      bundleName: bundle.name,
      creditsAmount: bundle.credits,
      amountPaidCents: bundle.priceCents,
    });

    const [fresh] = await db
      .update(supplierAccountsTable)
      .set({ credits: sql`${supplierAccountsTable.credits} + ${bundle.credits}` })
      .where(eq(supplierAccountsTable.id, supplierId))
      .returning({ credits: supplierAccountsTable.credits });

    res.json({
      success: true,
      creditsAdded: bundle.credits,
      newBalance: fresh.credits,
      bundleName: bundle.name,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to purchase credits");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /supplier/me/connections
router.get("/supplier/me/connections", requireSupplierAuth, async (req, res) => {
  try {
    const supplierId = (req as any).supplierId as number;
    const connections = await db
      .select()
      .from(connectionsTable)
      .where(eq(connectionsTable.supplierId, supplierId))
      .orderBy(connectionsTable.createdAt);

    res.json(connections.map((c) => ({
      id: c.id,
      requestId: c.requestId,
      bidId: c.bidId,
      consumerName: c.consumerName,
      consumerEmail: c.consumerEmail,
      createdAt: c.createdAt,
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get connections");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /bids/:bidId/connect  — use 1 credit to reveal consumer contact
router.post("/bids/:bidId/connect", requireSupplierAuth, async (req, res) => {
  try {
    const supplierId = (req as any).supplierId as number;
    const bidId = parseInt(req.params.bidId);

    if (isNaN(bidId)) {
      res.status(400).json({ error: "Ongeldige bieding" });
      return;
    }

    // Check if already connected
    const existing = await db
      .select()
      .from(connectionsTable)
      .where(and(eq(connectionsTable.supplierId, supplierId), eq(connectionsTable.bidId, bidId)));

    if (existing.length > 0) {
      res.json({
        success: true,
        alreadyConnected: true,
        consumerName: existing[0].consumerName,
        consumerEmail: existing[0].consumerEmail,
        creditsUsed: 0,
        remainingCredits: null,
      });
      return;
    }

    const [supplier] = await db
      .select()
      .from(supplierAccountsTable)
      .where(eq(supplierAccountsTable.id, supplierId));

    if (!supplier || supplier.credits < 1) {
      res.status(402).json({ error: "Onvoldoende credits. Koop een connectiebundel om verder te gaan." });
      return;
    }

    const [bid] = await db.select().from(bidsTable).where(eq(bidsTable.id, bidId));
    if (!bid) {
      res.status(404).json({ error: "Bieding niet gevonden" });
      return;
    }

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, bid.requestId));
    if (!request) {
      res.status(404).json({ error: "Uitvraag niet gevonden" });
      return;
    }

    await db.insert(connectionsTable).values({
      supplierId,
      requestId: request.id,
      bidId,
      consumerName: request.consumerName,
      consumerEmail: request.consumerEmail,
    });

    const [fresh] = await db
      .update(supplierAccountsTable)
      .set({ credits: sql`${supplierAccountsTable.credits} - 1` })
      .where(eq(supplierAccountsTable.id, supplierId))
      .returning({ credits: supplierAccountsTable.credits });

    res.json({
      success: true,
      alreadyConnected: false,
      consumerName: request.consumerName,
      consumerEmail: request.consumerEmail,
      creditsUsed: 1,
      remainingCredits: fresh.credits,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create connection");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
