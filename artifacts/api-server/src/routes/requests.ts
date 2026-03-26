import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  requestsTable,
  bidsTable,
  categoriesTable,
  createRequestBodySchema,
  createBidBodySchema,
} from "@workspace/db";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { z } from "zod/v4";

const router: IRouter = Router();

router.get("/requests", async (req, res) => {
  try {
    const categoryId = req.query.categoryId
      ? parseInt(req.query.categoryId as string)
      : undefined;
    const offerType = req.query.offerType as string | undefined;
    const search = req.query.search as string | undefined;

    const conditions = [sql`${requestsTable.expiresAt} > now()`];

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
        sql`${bidsTable.requestId} = ANY(ARRAY[${sql.raw(requestIds.join(","))}])`
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

router.post("/requests", async (req, res) => {
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

    const bids = await db
      .select()
      .from(bidsTable)
      .where(eq(bidsTable.requestId, id))
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

    const conditions = [eq(bidsTable.requestId, id)];
    if (offerType) {
      conditions.push(eq(bidsTable.offerType, offerType));
    }

    const bids = await db
      .select()
      .from(bidsTable)
      .where(and(...conditions))
      .orderBy(asc(bidsTable.price));

    res.json(
      bids.map((b) => ({
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
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list bids");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/bids", async (req, res) => {
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

    const parsed = createBidBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
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
      })
      .returning();

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
      createdAt: bid.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create bid");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/requests/:id/interest", async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    if (isNaN(requestId)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const { bidId, consumerEmail } = req.body;
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

    res.json({
      success: true,
      message: `Geweldig! ${bid.supplierStore} wordt op de hoogte gebracht van jouw interesse. Ze nemen snel contact met je op.`,
      contactEmail: bid.supplierEmail,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to express interest");
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
      .select({ count: sql<number>`count(distinct ${bidsTable.supplierEmail})::int` })
      .from(bidsTable)
      .where(sql`${bidsTable.createdAt} >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`);

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
