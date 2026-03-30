import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { userAccountsTable, paymentOrdersTable, creditPurchasesTable, CREDIT_BUNDLES } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireSeller } from "./auth";
import { createPaynlTransaction } from "../services/paynl";

const router: IRouter = Router();

// POST /payments/checkout — start Pay.nl transaction, returns paymentUrl
router.post("/payments/checkout", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const { bundleId } = req.body;

    const bundle = CREDIT_BUNDLES.find((b) => b.id === bundleId);
    if (!bundle) { res.status(400).json({ error: "Onbekende bundel" }); return; }

    const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";

    // Create a pending payment order
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

    // Save Pay.nl order ID
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
  try {
    const orderId = parseInt(req.query.orderId as string);
    const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";

    if (isNaN(orderId)) {
      res.redirect(`${appUrl}/supplier/credits?payment=error`);
      return;
    }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, orderId));
    if (!order) {
      res.redirect(`${appUrl}/supplier/credits?payment=error`);
      return;
    }

    if (order.status === "paid") {
      res.redirect(`${appUrl}/supplier/credits?payment=success&credits=${order.creditsAmount}`);
      return;
    }

    // Payment might still be processing — redirect to pending page
    res.redirect(`${appUrl}/supplier/credits?payment=pending&orderId=${orderId}`);
  } catch (err) {
    const appUrl = process.env.APP_URL ?? "https://prijsmij.nl";
    res.redirect(`${appUrl}/supplier/credits?payment=error`);
  }
});

// POST /payments/exchange — Pay.nl server-to-server notification (webhook)
router.post("/payments/exchange", async (req, res) => {
  try {
    const { action, extra1, orderId: paynlOrderId } = req.body;
    req.log.info({ action, extra1, paynlOrderId }, "Pay.nl exchange received");

    const internalOrderId = parseInt(extra1);
    if (isNaN(internalOrderId)) {
      res.send("FALSE");
      return;
    }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, internalOrderId));
    if (!order) {
      res.send("FALSE");
      return;
    }

    if (action === "PAID" || action === "AUTHORIZE") {
      if (order.status !== "paid") {
        // Mark order as paid
        await db.update(paymentOrdersTable)
          .set({ status: "paid", paidAt: new Date(), paynlOrderId: paynlOrderId ?? order.paynlOrderId })
          .where(eq(paymentOrdersTable.id, order.id));

        // Add credits to user
        await db.update(userAccountsTable)
          .set({ credits: sql`${userAccountsTable.credits} + ${order.creditsAmount}` })
          .where(eq(userAccountsTable.id, order.userId));

        // Log credit purchase
        await db.insert(creditPurchasesTable).values({
          userId: order.userId,
          bundleName: order.bundleName,
          creditsAmount: order.creditsAmount,
          amountPaidCents: order.amountCents,
        });

        req.log.info({ orderId: order.id, credits: order.creditsAmount, userId: order.userId }, "Credits added after payment");
      }
    } else if (action === "CANCEL" || action === "REFUND") {
      await db.update(paymentOrdersTable)
        .set({ status: action === "CANCEL" ? "cancelled" : "failed" })
        .where(eq(paymentOrdersTable.id, order.id));
    }

    res.send("TRUE");
  } catch (err) {
    req.log.error({ err }, "Pay.nl exchange error");
    res.send("FALSE");
  }
});

// GET /payments/exchange — Pay.nl GET exchange (some versions use GET)
router.get("/payments/exchange", async (req, res) => {
  try {
    const action = req.query.action as string;
    const extra1 = req.query.extra1 as string;
    const paynlOrderId = req.query.orderId as string;

    req.log.info({ action, extra1, paynlOrderId }, "Pay.nl GET exchange received");

    const internalOrderId = parseInt(extra1);
    if (isNaN(internalOrderId)) { res.send("FALSE"); return; }

    const [order] = await db.select().from(paymentOrdersTable).where(eq(paymentOrdersTable.id, internalOrderId));
    if (!order) { res.send("FALSE"); return; }

    if ((action === "PAID" || action === "AUTHORIZE") && order.status !== "paid") {
      await db.update(paymentOrdersTable)
        .set({ status: "paid", paidAt: new Date(), paynlOrderId: paynlOrderId ?? order.paynlOrderId })
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
    } else if (action === "CANCEL") {
      await db.update(paymentOrdersTable).set({ status: "cancelled" }).where(eq(paymentOrdersTable.id, order.id));
    }

    res.send("TRUE");
  } catch (err) {
    req.log.error({ err }, "Pay.nl GET exchange error");
    res.send("FALSE");
  }
});

// GET /payments/status/:orderId — poll payment status (sellers only)
router.get("/payments/status/:orderId", requireSeller, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const orderId = parseInt(req.params.orderId);
    if (isNaN(orderId)) { res.status(400).json({ error: "Ongeldig order ID" }); return; }

    const [order] = await db.select().from(paymentOrdersTable)
      .where(eq(paymentOrdersTable.id, orderId));

    if (!order || order.userId !== userId) { res.status(404).json({ error: "Order niet gevonden" }); return; }

    res.json({ status: order.status, credits: order.creditsAmount });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
