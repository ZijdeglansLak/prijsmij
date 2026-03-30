import express, { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, paymentOrdersTable, creditPurchasesTable, paymentLogsTable, CREDIT_BUNDLES } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";
import { requireSellerOrAdmin, requireAdmin } from "./auth";
import { createPaynlTransaction, getPaynlTransactionStatus, getPaynlCredentials } from "../services/paynl";

const router: IRouter = Router();

// Parse Pay.nl txt(post) bodies — Pay.nl may send Content-Type: text/plain with &-separated key=value pairs
// We add express.text() so the raw body is readable, then normalise to a plain object
function paynlBodyParser(req: any, res: any, next: any) {
  const ct = (req.headers["content-type"] ?? "").toLowerCase();
  if (ct.includes("text/plain")) {
    // Read raw text body
    express.text({ type: "*/*" })(req, res, () => {
      if (typeof req.body === "string") {
        const parsed: Record<string, string> = {};
        try { new URLSearchParams(req.body).forEach((v, k) => { parsed[k] = v; }); } catch {}
        req.body = parsed;
      }
      next();
    });
  } else {
    next();
  }
}

// Persist a payment log entry (best-effort, never throws)
async function logPayment(entry: {
  source: string;
  action?: string;
  extra1?: string;
  paynlOrderId?: string;
  internalOrderId?: number;
  rawBody?: string;
  result?: string;
  errorMessage?: string;
  creditsAdded?: number;
}): Promise<void> {
  try {
    await db.insert(paymentLogsTable).values({
      source: entry.source,
      action: entry.action ?? null,
      extra1: entry.extra1 ?? null,
      paynlOrderId: entry.paynlOrderId ?? null,
      internalOrderId: entry.internalOrderId ?? null,
      rawBody: entry.rawBody ? entry.rawBody.slice(0, 2000) : null,
      result: entry.result ?? null,
      errorMessage: entry.errorMessage ?? null,
      creditsAdded: entry.creditsAdded ?? null,
    });
  } catch { /* ignore logging errors */ }
}

// Shared helper: marks order as paid and adds credits — idempotent
async function processPayment(orderId: number, paynlOrderId?: string | null): Promise<{ done: boolean; credits: number }> {
  const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
  if (!order) return { done: false, credits: 0 };
  if (order.status === "paid") return { done: true, credits: order.creditsAmount };

  await db.update(paymentOrdersTable)
    .set({ status: "paid", paidAt: new Date(), ...(paynlOrderId ? { paynlOrderId } : {}) })
    .where(eq(paymentOrdersTable.id, order.id));

  await db.update(userAccountsTable)
    .set({ credits: sql`${userAccountsTable.credits} + ${order.creditsAmount}` })
    .where(eq(userAccountsTable.id, order.userId));

  await db.insert(creditPurchasesTable).values({
    userId: order.userId,
    bundleName: order.bundleName,
    creditsAmount: order.creditsAmount,
    amountPaidCents: order.amountCents,
  });

  return { done: true, credits: order.creditsAmount };
}

// POST /payments/checkout — start Pay.nl transaction, returns paymentUrl
router.post("/payments/checkout", requireSellerOrAdmin, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { bundleId } = req.body;

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) { res.status(400).json({ error: "Onbekende bundel" }); return; }

    const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";

    const [order] = await db.insert(paymentOrdersTable).values({
      userId,
      bundleId: bundle.id,
      bundleName: bundle.name,
      creditsAmount: bundle.credits,
      amountCents: bundle.priceCents,
      status: "pending",
    }).returning();

    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.socket.remoteAddress ?? "127.0.0.1";

    const transaction = await createPaynlTransaction({
      amountCents: bundle.priceCents,
      description: `PrijsMij - ${bundle.credits} connecties (${bundle.name})`,
      returnUrl: `${appUrl}/api/payments/return?orderId=${order.id}`,
      exchangeUrl: `${appUrl}/api/payments/exchange`,
      ipAddress: ip,
      extra1: String(order.id),
    });

    await db.update(paymentOrdersTable)
      .set({ paynlOrderId: transaction.orderId })
      .where(eq(paymentOrdersTable.id, order.id));

    await logPayment({
      source: "checkout",
      paynlOrderId: transaction.orderId,
      internalOrderId: order.id,
      result: "created",
    });

    res.json({ paymentUrl: transaction.paymentUrl, orderId: order.id });
  } catch (err: any) {
    req.log.error({ err }, "Failed to start payment");
    res.status(500).json({ error: err.message ?? "Betaling starten mislukt" });
  }
});

// Paid action strings Pay.nl sends in the return URL
const PAID_ACTIONS = new Set(["new_ppt", "paid", "authorize", "capture", "authorized", "complete", "completed"]);

// GET /payments/return — user returns from Pay.nl after payment
router.get("/payments/return", async (req, res) => {
  const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";
  try {
    const orderId = parseInt(req.query.orderId as string);
    if (isNaN(orderId)) { res.redirect(`${appUrl}/supplier/credits?payment=error`); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order) { res.redirect(`${appUrl}/supplier/credits?payment=error`); return; }

    // Log all query params Pay.nl sent so we can inspect them in the logboek
    const allParams = Object.fromEntries(Object.entries(req.query).map(([k, v]) => [k, String(v)]));
    const paynlActionRaw = (req.query.action as string ?? req.query.paymentStatus as string ?? "").toLowerCase();
    const paynlOrderIdFromQuery = req.query.paymentSessionId as string ?? req.query.transactionId as string ?? order.paynlOrderId ?? undefined;

    req.log.info({ orderId, allParams, paynlActionRaw }, "Payment return URL called");

    if (order.status === "paid") {
      await logPayment({ source: "return_url", action: paynlActionRaw || undefined, internalOrderId: order.id, paynlOrderId: paynlOrderIdFromQuery, rawBody: JSON.stringify(allParams), result: "already_paid" });
      res.redirect(`${appUrl}/supplier/credits?payment=success&credits=${order.creditsAmount}`);
      return;
    }

    // If Pay.nl sends a paid action in the return URL, process immediately — no API call needed
    if (paynlActionRaw && PAID_ACTIONS.has(paynlActionRaw)) {
      const { credits } = await processPayment(order.id, paynlOrderIdFromQuery || order.paynlOrderId);
      await logPayment({ source: "return_url", action: paynlActionRaw, internalOrderId: order.id, paynlOrderId: paynlOrderIdFromQuery, rawBody: JSON.stringify(allParams), result: "paid_via_return_action", creditsAdded: credits });
      res.redirect(`${appUrl}/supplier/credits?payment=success&credits=${order.creditsAmount}`);
      return;
    }

    // No paid action in return URL — log all params and wait for exchange webhook
    await logPayment({ source: "return_url", action: paynlActionRaw || undefined, internalOrderId: order.id, paynlOrderId: paynlOrderIdFromQuery, rawBody: JSON.stringify(allParams), result: paynlActionRaw ? `action:${paynlActionRaw}` : "no_action_in_return" });
    res.redirect(`${appUrl}/supplier/credits?payment=pending&orderId=${orderId}`);
  } catch (err) {
    req.log.error({ err }, "Payment return error");
    res.redirect(`${appUrl}/supplier/credits?payment=error`);
  }
});

// Shared exchange processor: handles both POST and GET Pay.nl webhooks
async function handleExchange(params: Record<string, string>, log: any): Promise<"TRUE" | "FALSE"> {
  const action = (params.action ?? "").toLowerCase();
  const extra1 = params.extra1 ?? "";
  const paynlOrderId = params.orderId ?? params.paymentSessionId ?? params.transactionId ?? "";
  const rawBody = JSON.stringify(params);

  log.info({ action, extra1, paynlOrderId, allParams: params }, "Pay.nl exchange received");

  // Log receipt immediately so admin can see Pay.nl is reaching the server
  await logPayment({ source: "exchange_received", action, extra1, paynlOrderId, rawBody });

  // Determine which order we're dealing with
  let order: typeof paymentOrdersTable.$inferSelect | undefined;

  const internalOrderId = parseInt(extra1);
  if (!isNaN(internalOrderId) && internalOrderId > 0) {
    const rows = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, internalOrderId));
    order = rows[0];
  }

  // Fallback: look up by Pay.nl order ID if extra1 was missing or order not found
  if (!order && paynlOrderId) {
    const rows = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.paynlOrderId, paynlOrderId));
    order = rows[0];
  }

  if (!order) {
    log.warn({ action, extra1, paynlOrderId }, "Pay.nl exchange: order not found — returning TRUE to stop retries");
    await logPayment({ source: "exchange", action, extra1, paynlOrderId, rawBody, result: "order_not_found" });
    return "TRUE";
  }

  if (action === "new_ppt" || action === "paid" || action === "authorize" || action === "capture") {
    let shouldCredit = action === "paid" || action === "authorize" || action === "capture";

    if (action === "new_ppt") {
      // Pay.nl sends new_ppt when a payment is received — trust the exchange directly.
      // The exchange itself is authoritative; we don't need a separate status check here.
      shouldCredit = true;
      log.info({ orderId: order.id, paynlOrderId }, "new_ppt exchange received — crediting directly");
    }

    if (shouldCredit) {
      const { done, credits } = await processPayment(order.id, paynlOrderId || order.paynlOrderId);
      log.info({ orderId: order.id, action, done }, "Credits processed via exchange webhook");
      await logPayment({ source: "exchange", action, extra1, paynlOrderId, internalOrderId: order.id, rawBody, result: done ? "paid_credits_added" : "already_paid", creditsAdded: credits });
    } else {
      await logPayment({ source: "exchange", action, extra1, paynlOrderId, internalOrderId: order.id, rawBody, result: "payment_not_confirmed" });
    }
  } else if (action === "cancel") {
    if (order.status === "pending") {
      await db.update(paymentOrdersTable).set({ status: "cancelled" }).where(eq(paymentOrdersTable.id, order.id));
    }
    await logPayment({ source: "exchange", action, extra1, paynlOrderId, internalOrderId: order.id, rawBody, result: "cancelled" });
  } else if (action === "refund") {
    await db.update(paymentOrdersTable).set({ status: "failed" }).where(eq(paymentOrdersTable.id, order.id));
    await logPayment({ source: "exchange", action, extra1, paynlOrderId, internalOrderId: order.id, rawBody, result: "refunded" });
  } else {
    await logPayment({ source: "exchange", action, extra1, paynlOrderId, internalOrderId: order.id, rawBody, result: `unknown_action:${action}` });
  }

  return "TRUE";
}

// POST /payments/exchange — Pay.nl webhook (server-to-server)
// paynlBodyParser handles text/plain (Pay.nl txt(post) format with & separator)
router.post("/payments/exchange", paynlBodyParser, async (req, res) => {
  try {
    const result = await handleExchange(req.body ?? {}, req.log);
    res.send(result);
  } catch (err: any) {
    req.log.error({ err }, "Pay.nl exchange error");
    await logPayment({ source: "exchange", rawBody: JSON.stringify(req.body ?? {}), result: "error", errorMessage: err.message });
    res.send("FALSE");
  }
});

// GET /payments/exchange — Pay.nl GET webhook (some configurations)
router.get("/payments/exchange", async (req, res) => {
  try {
    const params: Record<string, string> = {};
    for (const [k, v] of Object.entries(req.query)) { params[k] = String(v); }
    const result = await handleExchange(params, req.log);
    res.send(result);
  } catch (err: any) {
    req.log.error({ err }, "Pay.nl GET exchange error");
    await logPayment({ source: "exchange_get", rawBody: JSON.stringify(req.query), result: "error", errorMessage: err.message });
    res.send("FALSE");
  }
});

// GET /payments/status/:orderId — poll payment status (sellers and admins)
router.get("/payments/status/:orderId", requireSellerOrAdmin, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) { res.status(400).json({ error: "Ongeldig order ID" }); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order || order.userId !== userId) { res.status(404).json({ error: "Order niet gevonden" }); return; }

    // Return current DB status — exchange webhook updates this when Pay.nl confirms payment.
    // We do NOT call Pay.nl API here because service tokens don't have read permissions (403).
    res.json({ status: order.status, credits: order.creditsAmount });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Admin endpoints ────────────────────────────────────────────────────────

// GET /payments/admin/orders — all payment orders with user info
router.get("/payments/admin/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await db
      .select({
        id: paymentOrdersTable.id,
        userId: paymentOrdersTable.userId,
        bundleName: paymentOrdersTable.bundleName,
        creditsAmount: paymentOrdersTable.creditsAmount,
        amountCents: paymentOrdersTable.amountCents,
        paynlOrderId: paymentOrdersTable.paynlOrderId,
        status: paymentOrdersTable.status,
        createdAt: paymentOrdersTable.createdAt,
        paidAt: paymentOrdersTable.paidAt,
        userEmail: userAccountsTable.email,
        userContactName: userAccountsTable.contactName,
        userStoreName: userAccountsTable.storeName,
      })
      .from(paymentOrdersTable)
      .leftJoin(userAccountsTable, eq(paymentOrdersTable.userId, userAccountsTable.id))
      .orderBy(desc(paymentOrdersTable.createdAt))
      .limit(200);

    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/admin/logs — all exchange/webhook logs
router.get("/payments/admin/logs", requireAdmin, async (req, res) => {
  try {
    const logs = await db
      .select()
      .from(paymentLogsTable)
      .orderBy(desc(paymentLogsTable.createdAt))
      .limit(500);

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /payments/admin/test-paynl/:paynlOrderId — raw Pay.nl status check for diagnostics (tries both auth orders)
router.get("/payments/admin/test-paynl/:paynlOrderId", requireAdmin, async (req, res) => {
  const { paynlOrderId } = req.params;
  try {
    const { serviceId, token } = await getPaynlCredentials();
    const url = `https://rest.pay.nl/v2/transactions/${paynlOrderId}`;

    const tryFormat = async (label: string, creds: string) => {
      const r = await fetch(url, { headers: { "Authorization": `Basic ${creds}`, "Accept": "application/json" } });
      const txt = await r.text();
      let body: any;
      try { body = JSON.parse(txt); } catch { body = txt.slice(0, 400); }
      return { format: label, httpStatus: r.status, httpOk: r.ok, body };
    };

    const [fmt1, fmt2] = await Promise.all([
      tryFormat("token:serviceId", Buffer.from(`${token}:${serviceId}`).toString("base64")),
      tryFormat("serviceId:token", Buffer.from(`${serviceId}:${token}`).toString("base64")),
    ]);

    res.json({
      url,
      credentialsPresent: !!(serviceId && token),
      serviceIdPrefix: serviceId?.slice(0, 8) + "...",
      attempts: [fmt1, fmt2],
    });
  } catch (err: any) {
    res.json({ error: err.message });
  }
});

// POST /payments/admin/orders/:id/process — manually process a pending order
router.post("/payments/admin/orders/:id/process", requireAdmin, async (req, res) => {
  try {
    const orderId = parseInt(req.params.id);
    if (isNaN(orderId)) { res.status(400).json({ error: "Ongeldig ID" }); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order) { res.status(404).json({ error: "Order niet gevonden" }); return; }

    if (order.status === "paid") {
      res.json({ ok: true, message: "Order was al betaald", credits: order.creditsAmount });
      return;
    }

    // First try to verify via Pay.nl API
    let paynlVerified = false;
    if (order.paynlOrderId) {
      try {
        const { isPaid, action, rawData } = await getPaynlTransactionStatus(order.paynlOrderId);
        await logPayment({ source: "admin_manual_check", action, internalOrderId: order.id, paynlOrderId: order.paynlOrderId, rawBody: rawData ? JSON.stringify(rawData).slice(0, 2000) : undefined, result: isPaid ? "pay_verified" : `not_paid:${action}` });
        paynlVerified = isPaid;
      } catch { /* fall through to forced process */ }
    }

    const { done, credits } = await processPayment(order.id, order.paynlOrderId);
    await logPayment({ source: "admin_manual", internalOrderId: order.id, paynlOrderId: order.paynlOrderId ?? undefined, result: paynlVerified ? "manual_paid_verified" : "manual_paid_forced", creditsAdded: credits });

    res.json({ ok: done, message: `${credits} credits bijgeschreven${paynlVerified ? " (Pay.nl bevestigd)" : " (handmatig)"}`, credits });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
