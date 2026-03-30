import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, creditPurchasesTable, connectionsTable, requestsTable, bidsTable, CREDIT_BUNDLES } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requireSeller } from "./auth";

const router: IRouter = Router();

// GET /supplier/bundles — public
router.get("/supplier/bundles", (_req, res) => {
  res.json(CREDIT_BUNDLES);
});

// POST /supplier/credits/purchase — sellers only
router.post("/supplier/credits/purchase", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { bundleId } = req.body;

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) { res.status(400).json({ error: "Onbekende bundel" }); return; }

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

    await db.insert(connectionsTable).values({ userId, requestId: request.id, bidId, consumerName: request.consumerName, consumerEmail: request.consumerEmail });

    const [fresh] = await db
      .update(userAccountsTable)
      .set({ credits: sql`${userAccountsTable.credits} - 1` })
      .where(eq(userAccountsTable.id, userId))
      .returning({ credits: userAccountsTable.credits });

    res.json({ success: true, alreadyConnected: false, consumerName: request.consumerName, consumerEmail: request.consumerEmail, creditsUsed: 1, remainingCredits: fresh.credits });
  } catch (err) { req.log.error({ err }, "Failed to create connection"); res.status(500).json({ error: "Internal server error" }); }
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
