import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";

export interface PaynlTransactionResult {
  orderId: string;
  paymentUrl: string;
}

async function getPaynlCredentials(): Promise<{ serviceId: string; token: string }> {
  try {
    const rows = await db.select({
      paynlServiceId: siteSettingsTable.paynlServiceId,
      paynlToken: siteSettingsTable.paynlToken,
    }).from(siteSettingsTable).limit(1);

    const dbServiceId = rows[0]?.paynlServiceId?.trim();
    const dbToken = rows[0]?.paynlToken?.trim();

    const serviceId = dbServiceId || process.env.PAYNL_SERVICE_ID || "";
    const token = dbToken || process.env.PAYNL_TOKEN || "";

    if (!serviceId || !token) {
      throw new Error("Pay.nl is niet geconfigureerd. Stel de Service ID en Token in via het beheermenu onder Instellingen → Betaling.");
    }

    return { serviceId, token };
  } catch (err: any) {
    if (err.message.includes("Pay.nl is niet geconfigureerd")) throw err;
    const serviceId = process.env.PAYNL_SERVICE_ID || "";
    const token = process.env.PAYNL_TOKEN || "";
    if (!serviceId || !token) {
      throw new Error("Pay.nl is niet geconfigureerd. Stel de Service ID en Token in via het beheermenu onder Instellingen → Betaling.");
    }
    return { serviceId, token };
  }
}

export async function createPaynlTransaction(opts: {
  amountCents: number;
  description: string;
  returnUrl: string;
  exchangeUrl: string;
  ipAddress: string;
  extra1?: string;
}): Promise<PaynlTransactionResult> {
  const { serviceId, token } = await getPaynlCredentials();

  const isTestMode = process.env.PAYNL_TEST_MODE === "1";

  const body: Record<string, any> = {
    serviceId,
    amount: {
      value: opts.amountCents,
      currency: "EUR",
    },
    description: opts.description,
    returnUrl: opts.returnUrl,
    exchangeUrl: opts.exchangeUrl,
    ipAddress: opts.ipAddress,
    testMode: isTestMode,
  };

  if (opts.extra1) {
    body.extra1 = opts.extra1;
  }

  const credentials = Buffer.from(`${serviceId}:${token}`).toString("base64");

  const res = await fetch("https://rest.pay.nl/v2/transactions", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Pay.nl ongeldig antwoord (HTTP ${res.status}): ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.detail ?? data?.title ?? data?.code ?? JSON.stringify(data);
    throw new Error(`Pay.nl fout (${res.status}): ${msg}`);
  }

  const paymentUrl = data.links?.find((l: any) => l.rel === "redirect")?.href
    ?? data.checkoutUrl
    ?? data.paymentUrl;

  if (!paymentUrl) {
    throw new Error(`Pay.nl: geen betaallink ontvangen. Response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  return {
    orderId: data.orderId ?? data.id ?? String(data.transactionId ?? ""),
    paymentUrl,
  };
}
