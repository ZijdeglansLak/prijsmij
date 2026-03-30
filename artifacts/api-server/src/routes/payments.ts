import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, paymentOrdersTable, creditPurchasesTable, CREDIT_BUNDLES } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireSeller } from "./auth";
import { createPaynlTransaction, getPaynlTransactionStatus } from "../services/paynl";

const router: IRouter = Router();

// Shared helper: marks order as paid and adds credits — idempotent
async function processPayment(orderId: number, paynlOrderId?: string | null): Promise<boolean> {
  const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
  if (!order || order.status === "paid") return order?.status === "paid";

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

  return true;
}

// POST /payments/checkout — start Pay.nl transaction, returns paymentUrl
router.post("/payments/checkout", requireSeller, async (req, res) => {
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

    res.json({ paymentUrl: transaction.paymentUrl, orderId: order.id });
  } catch (err: any) {
    req.log.error({ err }, "Failed to start payment");
    res.status(500).json({ error: err.message ?? "Betaling starten mislukt" });
  }
});

// GET /payments/return — user returns from Pay.nl after payment
router.get("/payments/return", async (req, res) => {
  const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";
  try {
    const orderId = parseInt(req.query.orderId as string);
    if (isNaN(orderId)) { res.redirect(`${appUrl}/supplier/credits?payment=error`); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order) { res.redirect(`${appUrl}/supplier/credits?payment=error`); return; }

    if (order.status === "paid") {
      res.redirect(`${appUrl}/supplier/credits?payment=success&credits=${order.creditsAmount}`);
      return;
    }

    // Webhook may not have arrived yet — query Pay.nl directly
    if (order.paynlOrderId) {
      try {
        const { isPaid, action } = await getPaynlTransactionStatus(order.paynlOrderId);
        req.log.info({ orderId, paynlOrderId: order.paynlOrderId, isPaid, action }, "Pay.nl status check on return");

        if (isPaid) {
          await processPayment(order.id, order.paynlOrderId);
          res.redirect(`${appUrl}/supplier/credits?payment=success&credits=${order.creditsAmount}`);
          return;
        }
      } catch (err) {
        req.log.error({ err }, "Failed to check Pay.nl status on return");
      }
    }

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
  const paynlOrderId = params.orderId ?? params.paymentSessionId ?? "";

  log.info({ action, extra1, paynlOrderId, allParams: params }, "Pay.nl exchange received");

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
    return "TRUE";
  }

  // new_ppt = Pay.nl's action for a (possibly) successful payment attempt — verify via API
  if (action === "new_ppt" || action === "paid" || action === "authorize" || action === "capture") {
    let shouldCredit = action === "paid" || action === "authorize" || action === "capture";

    if (action === "new_ppt" && order.paynlOrderId) {
      try {
        const { isPaid } = await getPaynlTransactionStatus(order.paynlOrderId);
        shouldCredit = isPaid;
        log.info({ orderId: order.id, paynlOrderId: order.paynlOrderId, isPaid }, "Pay.nl status verified for new_ppt");
      } catch (err) {
        log.error({ err }, "Failed to verify Pay.nl status for new_ppt — crediting based on exchange alone");
        shouldCredit = true;
      }
    }

    if (shouldCredit) {
      await processPayment(order.id, paynlOrderId || order.paynlOrderId);
      log.info({ orderId: order.id, action }, "Credits processed via exchange webhook");
    }
  } else if (action === "cancel") {
    if (order.status === "pending") {
      await db.update(paymentOrdersTable).set({ status: "cancelled" }).where(eq(paymentOrdersTable.id, order.id));
    }
  } else if (action === "refund") {
    await db.update(paymentOrdersTable).set({ status: "failed" }).where(eq(paymentOrdersTable.id, order.id));
  }

  return "TRUE";
}

// POST /payments/exchange — Pay.nl webhook (server-to-server)
router.post("/payments/exchange", async (req, res) => {
  try {
    const result = await handleExchange(req.body ?? {}, req.log);
    res.send(result);
  } catch (err) {
    req.log.error({ err }, "Pay.nl exchange error");
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
  } catch (err) {
    req.log.error({ err }, "Pay.nl GET exchange error");
    res.send("FALSE");
  }
});

// GET /payments/status/:orderId — poll payment status (sellers only)
// Also actively checks Pay.nl if order is still pending
router.get("/payments/status/:orderId", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) { res.status(400).json({ error: "Ongeldig order ID" }); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order || order.userId !== userId) { res.status(404).json({ error: "Order niet gevonden" }); return; }

    // If still pending, check Pay.nl directly so the user doesn't have to wait for the webhook
    if (order.status === "pending" && order.paynlOrderId) {
      try {
        const { isPaid } = await getPaynlTransactionStatus(order.paynlOrderId);
        if (isPaid) {
          await processPayment(order.id, order.paynlOrderId);
          res.json({ status: "paid", credits: order.creditsAmount });
          return;
        }
      } catch {
        // Ignore — return DB status
      }
    }

    res.json({ status: order.status, credits: order.creditsAmount });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
