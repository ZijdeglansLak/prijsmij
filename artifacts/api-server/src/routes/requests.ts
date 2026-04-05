import { Router, type IRouter } from "express";
import { requireVerifiedEmail, requireSeller } from "./auth";
import { db } from "@workspace/db";
import {
  requestsTable,
  bidsTable,
  categoriesTable,
  userAccountsTable,
  connectionsTable,
  createRequestBodySchema,
  createBidBodySchema,
} from "@workspace/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { z } from "zod/v4";
import { sendNewRequestNotification, sendNewBidNotification, sendBuyerInterestNotification } from "../services/email";
import { writeLog } from "../lib/db-log";

const router: IRouter = Router();

// --- Working-days helpers for interest expiry ---
function addBusinessDays(start: Date, days: number): Date {
  const result = new Date(start);
  let added = 0;
  while (added < days) {
    result.setDate(result.getDate() + 1);
    const day = result.getDay(); // 0=Sun, 6=Sat
    if (day !== 0 && day !== 6) added++;
  }
  return result;
}

function isInterestExpired(interestAt: Date | null | undefined): boolean {
  if (!interestAt) return true;
  return new Date() > addBusinessDays(new Date(interestAt), 3);
}

router.get("/requests", async (req, res) => {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;
    const offerType = req.query.offerType as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions = [sql`${requestsTable.expiresAt} > now()`, sql`${requestsTable.isClosed} = FALSE`];

    if (categoryId && !isNaN(categoryId)) {
      conditions.push(eq(requestsTable.categoryId, categoryId));
    }

    if (search) {
      conditions.push(
        sql`(${requestsTable.title} ILIKE ${"%" + search + "%"} OR ${requestsTable.brand} ILIKE ${"%" + search + "%"})`
      );
    }

    const requests = await db
      .select()
      .from(requestsTable)
      .where(and(...conditions))
      .orderBy(desc(requestsTable.createdAt));

    const requestIds = requests.map((r) => r.id);

    if (requestIds.length === 0) {
      res.json([]);
      return;
    }

    const bids = await db
      .select()
      .from(bidsTable)
      .where(
        and(
          sql`${bidsTable.requestId} = ANY(ARRAY[${sql.raw(requestIds.join(","))}])`,
          eq(bidsTable.visibility, "public")
        )
      );

    const categories = await db.select().from(categoriesTable);
    const catMap = new Map(categories.map((c) => [c.id, c]));

    const bidsByRequest = new Map<number, typeof bids>();
    for (const bid of bids) {
      if (!bidsByRequest.has(bid.requestId)) {
        bidsByRequest.set(bid.requestId, []);
      }
      bidsByRequest.get(bid.requestId)!.push(bid);
    }

    let result = requests.map((req) => {
      const reqBids = bidsByRequest.get(req.id) ?? [];
      const cat = catMap.get(req.categoryId);
      const prices = reqBids.map((b) => parseFloat(String(b.price)));
      const lowestBidPrice = prices.length > 0 ? Math.min(...prices) : null;

      return {
        id: req.id,
        title: req.title,
        brand: req.brand,
        categoryId: req.categoryId,
        categoryName: cat?.name ?? "",
        categoryIcon: cat?.icon ?? "",
        lowestBidPrice,
        bidCount: reqBids.length,
        allowedOfferTypes: req.allowedOfferTypes as string[],
        expiresAt: req.expiresAt,
        createdAt: req.createdAt,
        consumerName: req.consumerName,
        consumerEmail: req.consumerEmail,
      };
    });

    if (offerType && offerType !== "any") {
      result = result.filter((r) =>
        r.allowedOfferTypes.includes(offerType) || offerType === "similar"
      );
    }

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list requests");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests", requireVerifiedEmail, async (req, res) => {
  try {
    const parsed = createRequestBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const data = parsed.data;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [inserted] = await db
      .insert(requestsTable)
      .values({
        title: data.title,
        brand: data.brand,
        description: data.description,
        categoryId: data.categoryId,
        specifications: data.specifications,
        allowedOfferTypes: data.allowedOfferTypes,
        allowSimilarModels: data.allowSimilarModels,
        consumerName: data.consumerName,
        consumerEmail: data.consumerEmail,
        expiresAt,
      })
      .returning();

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, inserted.categoryId));

    res.status(201).json({
      id: inserted.id,
      title: inserted.title,
      brand: inserted.brand,
      description: inserted.description,
      categoryId: inserted.categoryId,
      categoryName: cat?.name ?? "",
      categoryIcon: cat?.icon ?? "",
      specifications: inserted.specifications,
      allowedOfferTypes: inserted.allowedOfferTypes as string[],
      allowSimilarModels: inserted.allowSimilarModels,
      lowestBidPrice: null,
      bidCount: 0,
      bids: [],
      expiresAt: inserted.expiresAt,
      createdAt: inserted.createdAt,
      consumerName: inserted.consumerName,
      consumerEmail: inserted.consumerEmail,
    });

    // Fire-and-forget: notify sellers who watch this category
    if (cat) {
      db.select({ id: userAccountsTable.id, email: userAccountsTable.email, storeName: userAccountsTable.storeName, contactName: userAccountsTable.contactName, ids: userAccountsTable.notificationCategoryIds })
        .from(userAccountsTable)
        .where(eq(userAccountsTable.role, "seller"))
        .then(sellers => {
          for (const seller of sellers) {
            try {
              const watchedIds: number[] = JSON.parse(seller.ids || "[]");
              if (watchedIds.includes(inserted.categoryId)) {
                const name = seller.storeName || seller.contactName || "Winkelier";
                sendNewRequestNotification(seller.email, name, cat.name, inserted.title, inserted.id).catch(() => {});
              }
            } catch { /* skip */ }
          }
        }).catch(() => {});
    }
  } catch (err) {
    req.log.error({ err }, "Failed to create request");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [request] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, id));

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    const viewerEmail = (req.query.viewerEmail as string | undefined)?.toLowerCase().trim() ?? "";
    const isOwner = viewerEmail && viewerEmail === request.consumerEmail.toLowerCase();

    const bidConditions = [eq(bidsTable.requestId, id)];
    if (!isOwner) {
      bidConditions.push(eq(bidsTable.visibility, "public"));
    }

    const bids = await db
      .select()
      .from(bidsTable)
      .where(and(...bidConditions))
      .orderBy(asc(bidsTable.price));

    const [cat] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, request.categoryId));

    const prices = bids.map((b) => parseFloat(String(b.price)));
    const lowestBidPrice = prices.length > 0 ? Math.min(...prices) : null;

    const formattedBids = bids.map((b) => ({
      id: b.id,
      requestId: b.requestId,
      supplierName: b.supplierName,
      supplierStore: b.supplierStore,
      price: parseFloat(String(b.price)),
      offerType: b.offerType,
      modelName: b.modelName,
      description: b.description,
      warrantyMonths: b.warrantyMonths,
      deliveryDays: b.deliveryDays,
      imageUrl: b.imageUrl,
      isSimilarModel: b.isSimilarModel,
      createdAt: b.createdAt,
    }));

    res.json({
      id: request.id,
      title: request.title,
      brand: request.brand,
      description: request.description,
      categoryId: request.categoryId,
      categoryName: cat?.name ?? "",
      categoryIcon: cat?.icon ?? "",
      categoryFields: (cat?.fields ?? []) as any[],
      specifications: request.specifications,
      allowedOfferTypes: request.allowedOfferTypes as string[],
      allowSimilarModels: request.allowSimilarModels,
      lowestBidPrice,
      bidCount: bids.length,
      bids: formattedBids,
      expiresAt: request.expiresAt,
      createdAt: request.createdAt,
      consumerName: request.consumerName,
      consumerEmail: request.consumerEmail,
      isClosed: (request as any).isClosed ?? false,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get request");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/requests/:id/bids", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const offerType = req.query.offerType as string | undefined;
    const viewerEmail = (req.query.viewerEmail as string | undefined)?.toLowerCase().trim() ?? "";

    // Fetch the request to check its consumer email
    const [parentRequest] = await db.select({ consumerEmail: requestsTable.consumerEmail })
      .from(requestsTable).where(eq(requestsTable.id, id));
    const isOwner = viewerEmail && parentRequest && viewerEmail === parentRequest.consumerEmail.toLowerCase();

    const conditions = [eq(bidsTable.requestId, id)];
    if (offerType) {
      conditions.push(eq(bidsTable.offerType, offerType));
    }
    // Non-owners only see public bids
    if (!isOwner) {
      conditions.push(eq(bidsTable.visibility, "public"));
    }

    const bids = await db
      .select()
      .from(bidsTable)
      .where(and(...conditions))
      .orderBy(asc(bidsTable.price));

    // Expire stale interests in the background
    const expiredIds = bids
      .filter((b) => b.buyerInterestEmail && isInterestExpired(b.buyerInterestAt))
      .map((b) => b.id);
    if (expiredIds.length > 0) {
      db.update(bidsTable)
        .set({ buyerInterestEmail: null, buyerInterestName: null, buyerInterestPhone: null, buyerInterestAt: null })
        .where(sql`${bidsTable.id} = ANY(ARRAY[${sql.raw(expiredIds.join(","))}])`)
        .execute()
        .catch(() => {});
    }

    // Check which bid ids have been purchased (a connection exists)
    const bidIds = bids.map((b) => b.id);
    let purchasedBidIds = new Set<number>();
    if (bidIds.length > 0) {
      const conns = await db.select({ bidId: connectionsTable.bidId })
        .from(connectionsTable)
        .where(sql`${connectionsTable.bidId} = ANY(ARRAY[${sql.raw(bidIds.join(","))}])`);
      purchasedBidIds = new Set(conns.map((c) => c.bidId));
    }

    res.json(
      bids.map((b) => {
        const expired = isInterestExpired(b.buyerInterestAt);
        const interestActive = !!b.buyerInterestEmail && !expired;
        const isMyInterest = interestActive && !!viewerEmail && b.buyerInterestEmail?.toLowerCase() === viewerEmail;
        const interestExpiresAt = interestActive && b.buyerInterestAt
          ? addBusinessDays(new Date(b.buyerInterestAt), 3).toISOString()
          : null;
        return {
          id: b.id,
          requestId: b.requestId,
          supplierName: b.supplierName,
          supplierStore: b.supplierStore,
          price: parseFloat(String(b.price)),
          offerType: b.offerType,
          modelName: b.modelName,
          description: b.description,
          warrantyMonths: b.warrantyMonths,
          deliveryDays: b.deliveryDays,
          imageUrl: b.imageUrl,
          isSimilarModel: b.isSimilarModel,
          visibility: b.visibility ?? "public",
          hasInterest: interestActive,
          isMyInterest,
          interestActive,
          interestExpiresAt,
          isPurchased: purchasedBidIds.has(b.id),
          createdAt: b.createdAt,
        };
      })
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list bids");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/bids", requireSeller, requireVerifiedEmail, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [request] = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.id, requestId));

    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }

    if (request.expiresAt < new Date()) {
      res.status(400).json({ error: "This request has expired" });
      return;
    }

    // Block new bids if any existing bid has active (non-expired) buyer interest
    const activeBids = await db.select({ id: bidsTable.id, buyerInterestAt: bidsTable.buyerInterestAt, buyerInterestEmail: bidsTable.buyerInterestEmail })
      .from(bidsTable).where(eq(bidsTable.requestId, requestId));
    const hasActiveLock = activeBids.some((b) => b.buyerInterestEmail && !isInterestExpired(b.buyerInterestAt));
    if (hasActiveLock) {
      res.status(423).json({ error: "Er is al een koper die interesse heeft getoond. Wacht op uitkomst of probeer het later opnieuw." });
      return;
    }

    const parsed = createBidBodySchema.safeParse(req.body);
    if (!parsed.success) {
      const fieldLabels: Record<string, string> = {
        supplierStore: "Winkelnaam",
        supplierName: "Naam",
        supplierEmail: "E-mailadres",
        modelName: "Modelnaam",
        price: "Prijs",
        offerType: "Staat van product",
        warrantyMonths: "Garantiemaanden",
        deliveryDays: "Levertijd",
        visibility: "Zichtbaarheid",
      };
      const firstIssue = parsed.error.issues[0];
      const fieldKey = String(firstIssue?.path?.[0] ?? "");
      const label = fieldLabels[fieldKey] ?? fieldKey;
      const humanMsg = label
        ? `Veld "${label}" is niet correct ingevuld`
        : "Niet alle verplichte velden zijn ingevuld";
      res.status(400).json({ error: humanMsg });
      return;
    }

    const data = parsed.data;

    const [bid] = await db
      .insert(bidsTable)
      .values({
        requestId,
        supplierName: data.supplierName,
        supplierStore: data.supplierStore,
        supplierEmail: data.supplierEmail,
        price: String(data.price),
        offerType: data.offerType,
        modelName: data.modelName,
        description: data.description,
        warrantyMonths: data.warrantyMonths ?? 12,
        deliveryDays: data.deliveryDays ?? 3,
        imageUrl: data.imageUrl ?? null,
        isSimilarModel: data.isSimilarModel,
        visibility: data.visibility ?? "public",
      })
      .returning();

    sendNewBidNotification(
      request.consumerEmail,
      request.consumerName,
      data.modelName,
      data.price,
      requestId
    ).catch(() => {});

    res.status(201).json({
      id: bid.id,
      requestId: bid.requestId,
      supplierName: bid.supplierName,
      supplierStore: bid.supplierStore,
      price: parseFloat(String(bid.price)),
      offerType: bid.offerType,
      modelName: bid.modelName,
      description: bid.description,
      warrantyMonths: bid.warrantyMonths,
      deliveryDays: bid.deliveryDays,
      imageUrl: bid.imageUrl,
      isSimilarModel: bid.isSimilarModel,
      visibility: bid.visibility ?? "public",
      createdAt: bid.createdAt,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to create bid");
    writeLog({ category: "ERROR", message: `Fout bij plaatsen bod op uitvraag #${req.params.id}: ${err?.message ?? "onbekend"}`, errorCode: "BID-500" }).catch(() => {});
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/interest", requireVerifiedEmail, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { bidId, consumerEmail, consumerName, consumerPhone } = req.body;
    if (!bidId || !consumerEmail) {
      res.status(400).json({ error: "bidId and consumerEmail are required" });
      return;
    }

    const [bid] = await db
      .select()
      .from(bidsTable)
      .where(and(eq(bidsTable.id, bidId), eq(bidsTable.requestId, requestId)));

    if (!bid) {
      res.status(404).json({ error: "Bid not found" });
      return;
    }

    // Block if this bid already has active (non-expired) interest
    if (bid.buyerInterestEmail && !isInterestExpired(bid.buyerInterestAt)) {
      res.status(409).json({ error: "Er is al interesse getoond voor dit bod. Wacht op reactie van de leverancier." });
      return;
    }

    const [request] = await db.select({ title: requestsTable.title }).from(requestsTable).where(eq(requestsTable.id, requestId));

    await db.update(bidsTable).set({
      buyerInterestEmail: consumerEmail.toLowerCase().trim(),
      buyerInterestName: consumerName ?? consumerEmail,
      buyerInterestPhone: consumerPhone ?? null,
      buyerInterestAt: new Date(),
    }).where(eq(bidsTable.id, bidId));

    sendBuyerInterestNotification(
      bid.supplierEmail,
      bid.supplierStore,
      consumerName ?? consumerEmail,
      consumerEmail,
      request?.title ?? "uitvraag",
      requestId
    ).catch(() => {});

    res.json({
      success: true,
      message: `Geweldig! ${bid.supplierStore} wordt op de hoogte gebracht van jouw interesse. Ze nemen snel contact met je op.`,
      contactEmail: bid.supplierEmail,
    });
  } catch (err: any) {
    req.log.error({ err }, "Failed to express interest");
    writeLog({ category: "ERROR", message: `Fout bij tonen interesse op uitvraag #${req.params.id}: ${err?.message ?? "onbekend"}`, errorCode: "INTEREST-500" }).catch(() => {});
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/consumer/requests", async (req, res) => {
  try {
    const email = (req.query.email as string | undefined)?.toLowerCase().trim();
    if (!email) {
      res.status(400).json({ error: "email query parameter required" });
      return;
    }

    const requests = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.consumerEmail, email))
      .orderBy(desc(requestsTable.createdAt));

    const requestIds = requests.map((r) => r.id);
    let publicBidsByRequest = new Map<number, { count: number; lowestPrice: number | null; bids: typeof bidsTable.$inferSelect[] }>();
    
    if (requestIds.length > 0) {
      const bids = await db.select().from(bidsTable).where(
        sql`${bidsTable.requestId} = ANY(ARRAY[${sql.raw(requestIds.join(","))}])`
      );
      for (const bid of bids) {
        const entry = publicBidsByRequest.get(bid.requestId) ?? { count: 0, lowestPrice: null, bids: [] };
        entry.count++;
        const price = parseFloat(String(bid.price));
        if (entry.lowestPrice === null || price < entry.lowestPrice) entry.lowestPrice = price;
        entry.bids.push(bid);
        publicBidsByRequest.set(bid.requestId, entry);
      }
    }

    const categories = await db.select().from(categoriesTable);
    const catMap = new Map(categories.map((c) => [c.id, c]));

    res.json(requests.map((r) => {
      const bidInfo = publicBidsByRequest.get(r.id) ?? { count: 0, lowestPrice: null, bids: [] };
      const cat = catMap.get(r.categoryId);
      const now = new Date();
      return {
        id: r.id,
        title: r.title,
        brand: r.brand,
        categoryId: r.categoryId,
        categoryName: cat?.name ?? "",
        categoryIcon: cat?.icon ?? "",
        bidCount: bidInfo.count,
        lowestBidPrice: bidInfo.lowestPrice,
        lowestBidStore: bidInfo.bids.find(b => parseFloat(String(b.price)) === bidInfo.lowestPrice)?.supplierStore ?? null,
        lowestBid: bidInfo.bids.length > 0 ? (() => {
          const b = bidInfo.bids.find(bid => parseFloat(String(bid.price)) === bidInfo.lowestPrice)!;
          return b ? { id: b.id, supplierStore: b.supplierStore, price: parseFloat(String(b.price)), modelName: b.modelName, hasInterest: !!b.buyerInterestEmail } : null;
        })() : null,
        expiresAt: r.expiresAt,
        createdAt: r.createdAt,
        isExpired: r.expiresAt < now,
      };
    }));
  } catch (err) {
    req.log.error({ err }, "Failed to get consumer requests");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /consumer/my-bids — bids where this buyer expressed interest, with connection status
router.get("/consumer/my-bids", async (req, res) => {
  try {
    const email = (req.query.email as string | undefined)?.toLowerCase().trim();
    if (!email) {
      res.status(400).json({ error: "email query parameter required" });
      return;
    }

    // All bids where this buyer showed interest
    const bids = await db.select().from(bidsTable)
      .where(eq(bidsTable.buyerInterestEmail, email))
      .orderBy(desc(bidsTable.buyerInterestAt));

    if (bids.length === 0) { res.json([]); return; }

    const requestIds = [...new Set(bids.map((b) => b.requestId))];
    const requests = await db.select().from(requestsTable).where(
      sql`${requestsTable.id} = ANY(ARRAY[${sql.raw(requestIds.join(","))}])`
    );
    const reqMap = new Map(requests.map((r) => [r.id, r]));

    // Check connections per bid (whether seller has purchased this lead)
    const bidIds = bids.map((b) => b.id);
    const connections = await db.select().from(connectionsTable).where(
      sql`${connectionsTable.bidId} = ANY(ARRAY[${sql.raw(bidIds.join(","))}])`
    );
    const connMap = new Map(connections.map((c) => [c.bidId, c]));

    res.json(bids.map((b) => {
      const r = reqMap.get(b.requestId);
      const conn = connMap.get(b.id);
      return {
        bidId: b.id,
        requestId: b.requestId,
        requestTitle: r?.title ?? "",
        requestBrand: r?.brand ?? "",
        supplierStore: b.supplierStore,
        supplierName: b.supplierName,
        supplierEmail: conn ? b.supplierEmail : null,
        price: parseFloat(String(b.price)),
        modelName: b.modelName,
        interestAt: b.buyerInterestAt,
        isPurchased: !!conn,
        isExpired: r ? r.expiresAt < new Date() : false,
      };
    }));
  } catch (err) {
    req.log.error({ err }, "Failed to get consumer bids");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const [totalRequests] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(requestsTable)
      .where(sql`${requestsTable.expiresAt} > now()`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [bidsToday] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bidsTable)
      .where(sql`${bidsTable.createdAt} >= ${today}`);

    const [activeSuppliersRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userAccountsTable)
      .where(eq(userAccountsTable.role, "seller"));

    const avgResult = await db.execute(
      sql`SELECT coalesce(avg(cnt), 0)::float as avg FROM (SELECT count(*) as cnt FROM bids GROUP BY request_id) sub`
    );
    const avgBids = { avg: parseFloat(String((avgResult.rows[0] as any)?.avg ?? 0)) };

    const categoryCounts = await db
      .select({
        categoryId: requestsTable.categoryId,
        count: sql<number>`count(*)::int`,
      })
      .from(requestsTable)
      .where(sql`${requestsTable.expiresAt} > now()`)
      .groupBy(requestsTable.categoryId);

    const categories = await db.select().from(categoriesTable);
    const catMap = new Map(categories.map((c) => [c.id, c]));

    res.json({
      totalActiveRequests: totalRequests?.count ?? 0,
      totalBidsToday: bidsToday?.count ?? 0,
      totalSuppliersActive: activeSuppliersRow?.count ?? 0,
      averageBidsPerRequest: Math.round((avgBids?.avg ?? 0) * 10) / 10,
      categoryCounts: categoryCounts.map((c) => ({
        categoryName: catMap.get(c.categoryId)?.name ?? "Onbekend",
        count: c.count,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
