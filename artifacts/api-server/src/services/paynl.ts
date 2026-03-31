import { db } from "@workspace/db";
import { siteSettingsTable } from "@workspace/db/schema";

export interface PaynlTransactionResult {
  orderId: string;
  paymentUrl: string;
}

export async function getPaynlCredentials(): Promise<{ serviceId: string; token: string }> {
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

// Pay.nl v2 REST API status codes:
// 10 = PENDING, 20 = IN_PROGRESS, 50 = PENDING_APPROVAL
// 80 = VERIFY, 85 = PARTIAL_PAYMENT
// 90 = AUTHORIZED, 95 = PARTIAL_AUTHORIZED, 100 = PAID
// -50 = EXPIRED, -60 = DENIED, -70 = CANCEL, -80 = CHARGEBACK, -90 = REFUND
function isPaidStatus(data: any): boolean {
  const code = data?.status?.code ?? data?.statusCode ?? data?.paymentDetails?.statusCode;
  if (typeof code === "number" && code >= 90) return true;

  const action = (data?.status?.action ?? data?.paymentDetails?.state ?? data?.state ?? "").toUpperCase();
  if (["PAID", "AUTHORIZE", "CAPTURE", "AUTHORIZED", "COMPLETE", "COMPLETED"].includes(action)) return true;

  return false;
}

export async function getPaynlTransactionStatus(
  paynlOrderId: string,
): Promise<{ isPaid: boolean; action: string; rawData?: any }> {
  const { serviceId, token } = await getPaynlCredentials();

  // Pay.nl REST API v2 GET uses token:serviceId order (reversed from POST which also has serviceId in body)
  const credentialsForGet = Buffer.from(`${token}:${serviceId}`).toString("base64");

  const res = await fetch(`https://rest.pay.nl/v2/transactions/${paynlOrderId}`, {
    headers: { "Authorization": `Basic ${credentialsForGet}`, "Accept": "application/json" },
  });

  const text = await res.text();
  if (!res.ok) {
    // If token:serviceId also gives 403, try serviceId:token as fallback
    if (res.status === 403) {
      const credentialsFallback = Buffer.from(`${serviceId}:${token}`).toString("base64");
      const res2 = await fetch(`https://rest.pay.nl/v2/transactions/${paynlOrderId}`, {
        headers: { "Authorization": `Basic ${credentialsFallback}`, "Accept": "application/json" },
      });
      const text2 = await res2.text();
      if (!res2.ok) {
        return { isPaid: false, action: `HTTP_${res2.status}_both_formats_failed`, rawData: text2.slice(0, 300) };
      }
      let data2: any;
      try { data2 = JSON.parse(text2); } catch { return { isPaid: false, action: "PARSE_ERROR", rawData: text2.slice(0, 300) }; }
      const isPaid2 = isPaidStatus(data2);
      const action2 = data2?.status?.action ?? data2?.paymentDetails?.state ?? data2?.state ?? String(data2?.status?.code ?? "");
      return { isPaid: isPaid2, action: action2, rawData: data2 };
    }
    return { isPaid: false, action: `HTTP_${res.status}`, rawData: text.slice(0, 300) };
  }

  let data: any;
  try { data = JSON.parse(text); } catch { return { isPaid: false, action: "PARSE_ERROR", rawData: text.slice(0, 300) }; }

  const isPaid = isPaidStatus(data);
  const action = data?.status?.action ?? data?.paymentDetails?.state ?? data?.state ?? String(data?.status?.code ?? "");

  return { isPaid, action, rawData: data };
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
    // Pay.nl REST v2: custom data goes under "stats", not at root level
    body.stats = { extra1: opts.extra1 };
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
