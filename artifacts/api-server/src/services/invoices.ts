import { db } from "@workspace/db";
import { invoicesTable, siteSettingsTable, userAccountsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { generateInvoicePdf, applyTemplateFields, DEFAULT_INVOICE_TEMPLATE, type InvoiceData } from "./invoice-pdf";
import { pool } from "@workspace/db";
import nodemailer from "nodemailer";

function formatMoney(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });
}

async function allocateInvoiceNumber(): Promise<{ number: string; prefix: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT invoice_number_prefix, invoice_next_number FROM site_settings LIMIT 1 FOR UPDATE"
    );
    const prefix = rows[0]?.invoice_number_prefix ?? "F";
    const nextNum = rows[0]?.invoice_next_number ?? 1001;
    await client.query(
      "UPDATE site_settings SET invoice_next_number = $1",
      [nextNum + 1]
    );
    await client.query("COMMIT");
    return { number: `${prefix}${String(nextNum).padStart(6, "0")}`, prefix };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function sendInvoiceEmail(to: string, name: string, invoiceNumber: string, pdfBuffer: Buffer, htmlBody: string) {
  const host = process.env.SMTP_HOST;
  if (!host) {
    console.log(`[EMAIL-DEV] Invoice ${invoiceNumber} would be sent to ${to}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  const from = process.env.SMTP_FROM ?? "noreply@prijsmij.nl";
  await transporter.sendMail({
    from,
    to,
    subject: `Factuur ${invoiceNumber} — PrijsMij`,
    html: htmlBody,
    attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
  });
}

export interface CreateInvoiceOptions {
  userId: number;
  type: "lead_purchase" | "credit_purchase";
  description: string;
  amountCents: number;
  vatPercent?: number;
}

export async function createInvoice(opts: CreateInvoiceOptions): Promise<number> {
  const { userId, type, description, amountCents } = opts;
  const vatPercent = opts.vatPercent ?? 21;

  const vatCents = Math.round(amountCents * vatPercent / 100);
  const totalCents = amountCents + vatCents;

  const [settings] = await db.select().from(siteSettingsTable).limit(1);
  const [user] = await db.select().from(userAccountsTable).where(eq(userAccountsTable.id, userId));
  if (!user) throw new Error("User not found");

  const { number: invoiceNumber } = await allocateInvoiceNumber();
  const now = new Date();

  const pdfData: InvoiceData = {
    invoiceNumber,
    date: now,
    sellerName: user.contactName,
    sellerCompany: (user as any).companyName ?? null,
    sellerVat: (user as any).vatNumber ?? null,
    sellerAddress: (user as any).billingAddress ?? null,
    sellerPostcode: (user as any).billingPostcode ?? null,
    sellerCity: (user as any).billingCity ?? null,
    sellerEmail: user.email,
    description,
    amountCents,
    vatPercent,
    vatCents,
    totalCents,
    type,
  };

  const pdfBuffer = await generateInvoicePdf(pdfData);
  const pdfBase64 = pdfBuffer.toString("base64");

  const templateFields: Record<string, string> = {
    klantnaam: user.contactName,
    klantbedrijfsnaam: (user as any).companyName ?? "",
    klantBTWnummer: (user as any).vatNumber ?? "",
    klantadres: (user as any).billingAddress ?? "",
    klantpostcode: (user as any).billingPostcode ?? "",
    klantplaats: (user as any).billingCity ?? "",
    factuurnummer: invoiceNumber,
    datum: formatDate(now),
    omschrijving: description,
    bedragExclBtw: formatMoney(amountCents),
    btwPercent: String(vatPercent),
    btwBedrag: formatMoney(vatCents),
    totaalbedrag: formatMoney(totalCents),
  };
  const template = settings?.invoiceTemplate || DEFAULT_INVOICE_TEMPLATE;
  const htmlBody = applyTemplateFields(template, templateFields);

  const [inv] = await db.insert(invoicesTable).values({
    invoiceNumber,
    userId,
    type,
    description,
    amountCents,
    vatPercent,
    vatCents,
    totalCents,
    pdfBase64,
    sentAt: null,
  }).returning({ id: invoicesTable.id });

  sendInvoiceEmail(user.email, user.contactName, invoiceNumber, pdfBuffer, htmlBody)
    .then(async () => {
      await db.update(invoicesTable).set({ sentAt: new Date() }).where(eq(invoicesTable.id, inv.id));
    })
    .catch((err) => console.error("[INVOICE] Failed to send email:", err));

  return inv.id;
}
