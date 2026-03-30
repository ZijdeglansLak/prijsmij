const PAYNL_API = "https://rest.pay.nl/v2/Transaction/start/json";

export interface PaynlTransactionResult {
  orderId: string;
  paymentUrl: string;
}

export async function createPaynlTransaction(opts: {
  amountCents: number;
  description: string;
  finishUrl: string;
  exchangeUrl: string;
  ipAddress: string;
  extra1?: string;
}): Promise<PaynlTransactionResult> {
  const token = process.env.PAYNL_TOKEN;
  const serviceId = process.env.PAYNL_SERVICE_ID;

  if (!token || !serviceId) {
    throw new Error("PAYNL_TOKEN en PAYNL_SERVICE_ID moeten worden ingesteld als omgevingsvariabelen.");
  }

  const params = new URLSearchParams({
    token,
    serviceId,
    amount: String(opts.amountCents),
    finishUrl: opts.finishUrl,
    exchangeUrl: opts.exchangeUrl,
    description: opts.description,
    ipAddress: opts.ipAddress,
    testMode: process.env.PAYNL_TEST_MODE === "1" ? "1" : "0",
  });

  if (opts.extra1) params.set("extra1", opts.extra1);

  const res = await fetch(`${PAYNL_API}?${params.toString()}`, { method: "GET" });
  const data = await res.json() as any;

  if (data.request?.result !== "1") {
    const msg = data.request?.errorMessage ?? JSON.stringify(data);
    throw new Error(`Pay.nl fout: ${msg}`);
  }

  return {
    orderId: data.data.transaction.orderId,
    paymentUrl: data.data.transaction.paymentURL,
  };
}

export async function getPaynlTransactionStatus(orderId: string): Promise<string> {
  const token = process.env.PAYNL_TOKEN;
  const serviceId = process.env.PAYNL_SERVICE_ID;
  if (!token || !serviceId) throw new Error("Pay.nl niet geconfigureerd");

  const params = new URLSearchParams({ token, serviceId, orderId });
  const res = await fetch(`https://rest.pay.nl/v2/Transaction/info/json?${params.toString()}`);
  const data = await res.json() as any;

  if (data.request?.result !== "1") throw new Error("Status opvragen mislukt");
  return data.data.paymentDetails?.state ?? "UNKNOWN";
}
