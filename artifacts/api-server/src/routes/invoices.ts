import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { invoicesTable, userAccountsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";

const router: IRouter = Router();

// GET /invoices — seller's own invoices
router.get("/invoices", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const invoices = await db
      .select({
        id: invoicesTable.id,
        invoiceNumber: invoicesTable.invoiceNumber,
        type: invoicesTable.type,
        description: invoicesTable.description,
        amountCents: invoicesTable.amountCents,
        vatPercent: invoicesTable.vatPercent,
        vatCents: invoicesTable.vatCents,
        totalCents: invoicesTable.totalCents,
        sentAt: invoicesTable.sentAt,
        createdAt: invoicesTable.createdAt,
      })
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, userId))
      .orderBy(desc(invoicesTable.createdAt));
    res.json(invoices);
  } catch (err) { req.log.error({ err }, "Failed to get invoices"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /invoices/:id/pdf — download PDF (owner or admin)
router.get("/invoices/:id/pdf", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as number;
    const isAdmin = (req as any).userIsAdmin as boolean;
    const invoiceId = parseInt(req.params.id);
    if (isNaN(invoiceId)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [inv] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, invoiceId));
    if (!inv) { res.status(404).json({ error: "Factuur niet gevonden" }); return; }
    if (!isAdmin && inv.userId !== userId) { res.status(403).json({ error: "Geen toegang" }); return; }
    if (!inv.pdfBase64) { res.status(404).json({ error: "PDF niet beschikbaar" }); return; }

    const buf = Buffer.from(inv.pdfBase64, "base64");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${inv.invoiceNumber}.pdf"`);
    res.setHeader("Content-Length", buf.length);
    res.end(buf);
  } catch (err) { req.log.error({ err }, "Failed to get invoice PDF"); res.status(500).json({ error: "Internal server error" }); }
});

// GET /admin/invoices — all invoices (admin)
router.get("/admin/invoices", requireAdmin, async (req, res) => {
  try {
    const rows = await db
      .select({
        id: invoicesTable.id,
        invoiceNumber: invoicesTable.invoiceNumber,
        userId: invoicesTable.userId,
        type: invoicesTable.type,
        description: invoicesTable.description,
        amountCents: invoicesTable.amountCents,
        vatPercent: invoicesTable.vatPercent,
        vatCents: invoicesTable.vatCents,
        totalCents: invoicesTable.totalCents,
        sentAt: invoicesTable.sentAt,
        createdAt: invoicesTable.createdAt,
        userName: userAccountsTable.contactName,
        userEmail: userAccountsTable.email,
        userStore: userAccountsTable.storeName,
      })
      .from(invoicesTable)
      .leftJoin(userAccountsTable, eq(invoicesTable.userId, userAccountsTable.id))
      .orderBy(desc(invoicesTable.createdAt));
    res.json(rows);
  } catch (err) { req.log.error({ err }, "Failed to get admin invoices"); res.status(500).json({ error: "Internal server error" }); }
});

export default router;
