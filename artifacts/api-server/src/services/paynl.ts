export interface PaynlTransactionResult {
  orderId: string;
  paymentUrl: string;
}

export async function createPaynlTransaction(opts: {
  amountCents: number;
  description: string;
  returnUrl: string;
  exchangeUrl: string;
  ipAddress: string;
  extra1?: string;
}): Promise<PaynlTransactionResult> {
  const token = process.env.PAYNL_TOKEN;
  const serviceId = process.env.PAYNL_SERVICE_ID;

  if (!token || !serviceId) {
    throw new Error("PAYNL_TOKEN en PAYNL_SERVICE_ID moeten worden ingesteld als omgevingsvariabelen.");
  }

  const isTestMode = process.env.PAYNL_TEST_MODE === "1";

  // Pay.nl v2 REST API — uses Basic auth: token as username, empty password
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

  const credentials = Buffer.from(`${token}:`).toString("base64");

  const res = await fetch("https://rest.pay.nl/v2/orders", {
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
