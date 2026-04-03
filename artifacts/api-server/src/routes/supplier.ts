import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, creditPurchasesTable, connectionsTable, requestsTable, bidsTable, categoriesTable, creditBundlesTable, siteSettingsTable } from "@workspace/db";
import { eq, and, sql, desc, asc } from "drizzle-orm";
import { requireAuth, requireSeller } from "./auth";
import { writeLog } from "../lib/db-log";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "prijsmij-secret-change-in-prod";

function makeSupplierToken(user: typeof userAccountsTable.$inferSelect) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "30d" });
}

function toSupplierResponse(user: typeof userAccountsTable.$inferSelect) {
  return { id: user.id, storeName: user.storeName ?? user.contactName, contactName: user.contactName, email: user.email, credits: user.credits };
}

// POST /supplier/login — public
router.post("/supplier/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ error: "E-mail en wachtwoord zijn verplicht" }); return; }

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.email, email.toLowerCase().trim()));
    if (!user || user.role !== "seller") { res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" }); return; }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Onbekend e-mailadres of onjuist wachtwoord" }); return; }

    res.json({ token: makeSupplierToken(user), supplier: toSupplierResponse(user) });
  } catch (err) { req.log.error({ err }, "Supplier login failed"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /supplier/register — public
router.post("/supplier/register", async (req, res) => {
  try {
    const { storeName, contactName, email, password } = req.body;
    if (!storeName || !contactName || !email || !password) { res.status(400).json({ error: "Alle velden zijn verplicht" }); return; }
    if (password.length < 8) { res.status(400).json({ error: "Wachtwoord moet minimaal 8 tekens zijn" }); return; }

    const existing = await db.select({ id: userAccountsTable.id }).from(userAccountsTable).where(eq(userAccountsTable.email, email.toLowerCase().trim()));
    if (existing.length > 0) { res.status(409).json({ error: "Dit e-mailadres is al in gebruik" }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const settings = await db.select({ initialSellerCredits: siteSettingsTable.initialSellerCredits }).from(siteSettingsTable).limit(1);
    const initialCredits = settings[0]?.initialSellerCredits ?? 10;
    const [user] = await db.insert(userAccountsTable).values({
      role: "seller", storeName, contactName, email: email.toLowerCase().trim(), passwordHash, emailVerified: false, credits: initialCredits
    }).returning();

    res.status(201).json({ token: makeSupplierToken(user), supplier: toSupplierResponse(user) });
  } catch (err) { req.log.error({ err }, "Supplier register failed"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supplier/bundles — public, reads from DB
router.get("/supplier/bundles", async (_req, res) => {
  try {
    const bundles = await db
      .select()
      .from(creditBundlesTable)
      .where(eq(creditBundlesTable.isActive, true))
      .orderBy(asc(creditBundlesTable.sortOrder));
    res.json(bundles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /supplier/credits/purchase — sellers only
router.post("/supplier/credits/purchase", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { bundleId } = req.body;

    const [bundle] = await db.select().from(creditBundlesTable).where(eq(creditBundlesTable.bundleKey, String(bundleId))).limit(1);
    if (!bundle || !bundle.isActive) { res.status(400).json({ error: "Onbekende bundel" }); return; }

    await db.insert(creditPurchasesTable).values({ userId, bundleName: bundle.name, creditsAmount: bundle.credits, amountPaidCents: bundle.priceCents });

    const [fresh] = await db
      .update(userAccountsTable)
      .set({ credits: sql`${userAccountsTable.credits} + ${bundle.credits}` })
      .where(eq(userAccountsTable.id, userId))
      .returning({ credits: userAccountsTable.credits });

    res.json({ success: true, creditsAdded: bundle.credits, newBalance: fresh.credits, bundleName: bundle.name });
  } catch (err) { req.log.error({ err }, "Failed to purchase credits"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supplier/me/connections — sellers only
router.get("/supplier/me/connections", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const connections = await db
      .select()
      .from(connectionsTable)
      .where(eq(connectionsTable.userId, userId))
      .orderBy(connectionsTable.createdAt);

    res.json(connections.map((c) => ({ id: c.id, requestId: c.requestId, bidId: c.bidId, consumerName: c.consumerName, consumerEmail: c.consumerEmail, createdAt: c.createdAt })));
  } catch (err) { req.log.error({ err }, "Failed to get connections"); res.status(500).json({ error: "Internal server error" }); }
});

// POST /bids/:bidId/connect — use 1 credit to reveal consumer contact (sellers only)
router.post("/bids/:bidId/connect", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const bidId = parseInt(req.params.bidId);
    if (isNaN(bidId)) { res.status(400).json({ error: "Ongeldige bieding" }); return; }

    // Already connected?
    const existing = await db.select().from(connectionsTable).where(and(eq(connectionsTable.userId, userId), eq(connectionsTable.bidId, bidId)));
    if (existing.length > 0) {
      res.json({ success: true, alreadyConnected: true, consumerName: existing[0].consumerName, consumerEmail: existing[0].consumerEmail, creditsUsed: 0, remainingCredits: null });
      return;
    }

    const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user || user.credits < 1) { res.status(402).json({ error: "Onvoldoende credits. Koop een connectiebundel om verder te gaan." }); return; }

    const [bid] = await db.select().from(bidsTable).where(eq(bidsTable.id, bidId));
    if (!bid) { res.status(404).json({ error: "Bieding niet gevonden" }); return; }

    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, bid.requestId));
    if (!request) { res.status(404).json({ error: "Uitvraag niet gevonden" }); return; }

    // Reject if another seller already bought this lead
    if ((request as any).isClosed) {
      res.status(409).json({ error: "Deze lead is al door een andere winkel gekocht." });
      return;
    }

    await db.insert(connectionsTable).values({ userId, requestId: request.id, bidId, consumerName: request.consumerName, consumerEmail: request.consumerEmail });

    // Close the request so no other seller can buy it
    await db.update(requestsTable).set({ isClosed: true } as any).where(eq(requestsTable.id, request.id));

    const [fresh] = await db
      .update(userAccountsTable)
      .set({ credits: sql`${userAccountsTable.credits} - 1` })
      .where(eq(userAccountsTable.id, userId))
      .returning({ credits: userAccountsTable.credits });

    res.json({ success: true, alreadyConnected: false, consumerName: request.consumerName, consumerEmail: request.consumerEmail, creditsUsed: 1, remainingCredits: fresh.credits });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create connection");
    const uid = (req as any).userId as number | undefined;
    writeLog({ category: "ERROR", message: `Fout bij aanmaken connectie voor bod #${req.params.bidId}: ${err?.message ?? "onbekend"}`, userId: uid, errorCode: "CONNECT-500" }).catch(() => {});
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /supplier/category-requests — active requests in seller's notification categories
router.get("/supplier/category-requests", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db.select({ ids: userAccountsTable.notificationCategoryIds }).from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }
    const categoryIds: number[] = JSON.parse(user.ids || "[]");
    if (categoryIds.length === 0) { res.json([]); return; }

    const requests = await db.select()
      .from(requestsTable)
      .where(
        and(
          sql`${requestsTable.categoryId} = ANY(ARRAY[${sql.raw(categoryIds.join(","))}])`,
          sql`${requestsTable.expiresAt} > NOW()`
        )
      )
      .orderBy(desc(requestsTable.createdAt))
      .limit(10);

    if (requests.length === 0) { res.json([]); return; }

    const reqIds = requests.map((r) => r.id);
    const bids = await db.select().from(bidsTable).where(
      and(
        sql`${bidsTable.requestId} = ANY(ARRAY[${sql.raw(reqIds.join(","))}])`,
        eq(bidsTable.visibility, "public")
      )
    );

    const bidsByReq = new Map<number, typeof bids[0][]>();
    for (const b of bids) {
      if (!bidsByReq.has(b.requestId)) bidsByReq.set(b.requestId, []);
      bidsByReq.get(b.requestId)!.push(b);
    }

    const cats = await db.select().from(categoriesTable);
    const catMap = new Map(cats.map((c) => [c.id, c]));

    res.json(requests.map((r) => {
      const reqBids = bidsByReq.get(r.id) ?? [];
      const prices = reqBids.map((b) => parseFloat(String(b.price)));
      const cat = catMap.get(r.categoryId);
      return {
        id: r.id,
        title: r.title,
        brand: r.brand,
        categoryName: cat?.name ?? "",
        categoryIcon: cat?.icon ?? "",
        bidCount: reqBids.length,
        lowestBidPrice: prices.length > 0 ? Math.min(...prices) : null,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
      };
    }));
  } catch (err) { req.log.error({ err }, "Failed to get category requests"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supplier/interested-bids — bids this seller placed where buyer showed interest
router.get("/supplier/interested-bids", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db.select({ email: userAccountsTable.email }).from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }

    const interestedBids = await db.select()
      .from(bidsTable)
      .where(and(
        eq(bidsTable.supplierEmail, user.email),
        sql`${bidsTable.buyerInterestEmail} IS NOT NULL`
      ))
      .orderBy(desc(bidsTable.buyerInterestAt));

    if (interestedBids.length === 0) { res.json([]); return; }

    const reqIds = [...new Set(interestedBids.map((b) => b.requestId))];
    const requests = await db.select().from(requestsTable).where(
      sql`${requestsTable.id} = ANY(ARRAY[${sql.raw(reqIds.join(","))}])`
    );
    const reqMap = new Map(requests.map((r) => [r.id, r]));

    const alreadyConnected = await db.select({ bidId: connectionsTable.bidId })
      .from(connectionsTable)
      .where(eq(connectionsTable.userId, userId));
    const connectedBidIds = new Set(alreadyConnected.map((c) => c.bidId));

    res.json(interestedBids.map((b) => {
      const r = reqMap.get(b.requestId);
      return {
        bidId: b.id,
        requestId: b.requestId,
        requestTitle: r?.title ?? "",
        supplierStore: b.supplierStore,
        price: parseFloat(String(b.price)),
        modelName: b.modelName,
        buyerName: b.buyerInterestName ?? b.buyerInterestEmail ?? "",
        buyerEmail: b.buyerInterestEmail ?? "",
        interestAt: b.buyerInterestAt,
        alreadyConnected: connectedBidIds.has(b.id),
      };
    }));
  } catch (err) { req.log.error({ err }, "Failed to get interested bids"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /supplier/notification-preferences — sellers only
router.get("/supplier/notification-preferences", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const [user] = await db.select({ ids: userAccountsTable.notificationCategoryIds }).from(userAccountsTable).where(eq(userAccountsTable.id, userId));
    if (!user) { res.status(404).json({ error: "Gebruiker niet gevonden" }); return; }
    const ids: number[] = JSON.parse(user.ids || "[]");
    res.json({ categoryIds: ids });
  } catch (err) { req.log.error({ err }, "Failed to get notification preferences"); res.status(500).json({ error: "Internal server error" }); }
});

// PUT /supplier/notification-preferences — sellers only
router.put("/supplier/notification-preferences", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { categoryIds } = req.body;
    if (!Array.isArray(categoryIds)) { res.status(400).json({ error: "categoryIds moet een array zijn" }); return; }
    const ids = categoryIds.filter((id: unknown) => typeof id === "number" && Number.isInteger(id));
    await db.update(userAccountsTable).set({ notificationCategoryIds: JSON.stringify(ids) }).where(eq(userAccountsTable.id, userId));
    res.json({ success: true, categoryIds: ids });
  } catch (err) { req.log.error({ err }, "Failed to update notification preferences"); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
