import PDFDocument from "pdfkit";

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  sellerName: string;
  sellerCompany: string | null;
  sellerVat: string | null;
  sellerAddress: string | null;
  sellerPostcode: string | null;
  sellerCity: string | null;
  sellerEmail: string;
  description: string;
  amountCents: number;
  vatPercent: number;
  vatCents: number;
  totalCents: number;
  type: "lead_purchase" | "credit_purchase";
}

const PRIMARY = "#FF4514";
const SECONDARY = "#1a0a4d";
const GRAY = "#6b7280";
const LIGHTGRAY = "#f3f4f6";
const BORDER = "#e5e7eb";

function formatMoney(cents: number): string {
  return `€ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("nl-NL", { day: "2-digit", month: "long", year: "numeric" });
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 0, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 595.28;
    const M = 50;
    const contentW = W - M * 2;

    // === HEADER BAND ===
    doc.rect(0, 0, W, 110).fill(SECONDARY);

    // Logo text: PrijsMij
    doc.fontSize(32).fillColor(PRIMARY).font("Helvetica-Bold").text("Prijs", M, 34, { continued: true });
    doc.fillColor("white").text("Mij");

    // Tagline
    doc.fontSize(9).fillColor("white").font("Helvetica").text("Dé reverse marketplace van Nederland", M, 72);

    // Invoice label top-right
    doc.fontSize(10).fillColor("white").font("Helvetica").text("FACTUUR", 0, 34, { align: "right", width: W - M });
    doc.fontSize(22).fillColor("white").font("Helvetica-Bold").text(data.invoiceNumber, 0, 50, { align: "right", width: W - M });

    // === INVOICE META BLOCK ===
    let y = 130;

    // Date + type row
    doc.fontSize(9).fillColor(GRAY).font("Helvetica").text("Factuurdatum", M, y);
    doc.text("Type aankoop", M + 200, y);

    y += 14;
    doc.fontSize(10).fillColor(SECONDARY).font("Helvetica-Bold").text(formatDate(data.date), M, y);
    doc.text(data.type === "lead_purchase" ? "Leadaankoop" : "Credits pakket", M + 200, y);

    // Separator line
    y += 26;
    doc.moveTo(M, y).lineTo(W - M, y).lineWidth(1).strokeColor(BORDER).stroke();

    // === BILLING TO ===
    y += 20;
    doc.fontSize(9).fillColor(GRAY).font("Helvetica").text("GEFACTUREERD AAN", M, y);

    y += 16;
    doc.fontSize(11).fillColor(SECONDARY).font("Helvetica-Bold").text(data.sellerName, M, y);

    if (data.sellerCompany) {
      y += 16;
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY).text(data.sellerCompany, M, y);
    }

    if (data.sellerAddress) {
      y += 16;
      doc.fontSize(10).font("Helvetica").fillColor(SECONDARY).text(data.sellerAddress, M, y);
    }

    if (data.sellerPostcode || data.sellerCity) {
      y += 14;
      const line = [data.sellerPostcode, data.sellerCity].filter(Boolean).join("  ");
      doc.fontSize(10).fillColor(SECONDARY).text(line, M, y);
    }

    if (data.sellerVat) {
      y += 14;
      doc.fontSize(9).fillColor(GRAY).text(`BTW-nummer: ${data.sellerVat}`, M, y);
    }

    y += 10;
    doc.fontSize(9).fillColor(GRAY).text(data.sellerEmail, M, y);

    // === INVOICE LINES TABLE ===
    y += 40;
    doc.rect(M, y, contentW, 30).fill(SECONDARY);
    doc.fontSize(9).fillColor("white").font("Helvetica-Bold")
      .text("OMSCHRIJVING", M + 10, y + 10, { width: contentW - 150 })
      .text("BEDRAG", M + contentW - 130, y + 10, { width: 60, align: "right" })
      .text("BTW", M + contentW - 70, y + 10, { width: 30, align: "right" })
      .text("TOTAAL", M + contentW - 40, y + 10, { width: 40, align: "right" });

    y += 30;
    doc.rect(M, y, contentW, 36).fill(LIGHTGRAY);
    doc.fontSize(10).fillColor(SECONDARY).font("Helvetica")
      .text(data.description, M + 10, y + 12, { width: contentW - 160, ellipsis: true });
    doc.text(formatMoney(data.amountCents), M + contentW - 130, y + 12, { width: 60, align: "right" });
    doc.text(`${data.vatPercent}%`, M + contentW - 70, y + 12, { width: 30, align: "right" });
    doc.font("Helvetica-Bold").text(formatMoney(data.totalCents), M + contentW - 40, y + 12, { width: 40, align: "right" });

    // === TOTALS ===
    y += 52;
    doc.moveTo(M + contentW - 200, y).lineTo(W - M, y).lineWidth(0.5).strokeColor(BORDER).stroke();

    y += 10;
    doc.fontSize(9).fillColor(GRAY).font("Helvetica");
    doc.text("Subtotaal (excl. BTW)", M + contentW - 200, y, { width: 150, align: "right" });
    doc.text(formatMoney(data.amountCents), M + contentW - 50, y, { width: 50, align: "right" });

    y += 16;
    doc.text(`BTW ${data.vatPercent}%`, M + contentW - 200, y, { width: 150, align: "right" });
    doc.text(formatMoney(data.vatCents), M + contentW - 50, y, { width: 50, align: "right" });

    y += 16;
    doc.moveTo(M + contentW - 200, y).lineTo(W - M, y).lineWidth(1.5).strokeColor(PRIMARY).stroke();

    y += 8;
    doc.fontSize(12).fillColor(SECONDARY).font("Helvetica-Bold");
    doc.text("TOTAAL INCL. BTW", M + contentW - 200, y, { width: 150, align: "right" });
    doc.text(formatMoney(data.totalCents), M + contentW - 50, y, { width: 50, align: "right" });

    // === FOOTER ===
    const footerY = 750;
    doc.rect(0, footerY, W, 92).fill(LIGHTGRAY);
    doc.moveTo(0, footerY).lineTo(W, footerY).lineWidth(2).strokeColor(PRIMARY).stroke();

    doc.fontSize(8).fillColor(GRAY).font("Helvetica")
      .text("PrijsMij · Dé reverse marketplace van Nederland · support@prijsmij.nl · www.prijsmij.nl", M, footerY + 14, { align: "center", width: contentW });
    doc.text(`Factuur ${data.invoiceNumber} · Gegenereerd op ${formatDate(data.date)}`, M, footerY + 30, { align: "center", width: contentW });
    doc.text("Deze factuur is digitaal gegenereerd en geldig zonder handtekening.", M, footerY + 46, { align: "center", width: contentW });

    doc.end();
  });
}

export function applyTemplateFields(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replaceAll(`[${key}]`, value ?? "");
  }
  return result;
}

export const DEFAULT_INVOICE_TEMPLATE = `<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 40px; color: #1a0a4d;">
  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
    <div>
      <h1 style="color: #FF4514; font-size: 28px; margin: 0;">PrijsMij</h1>
      <p style="color: #6b7280; margin: 4px 0 0 0; font-size: 12px;">Dé reverse marketplace van Nederland</p>
    </div>
    <div style="text-align: right;">
      <h2 style="margin: 0; font-size: 18px; color: #1a0a4d;">FACTUUR</h2>
      <p style="font-size: 22px; font-weight: bold; color: #FF4514; margin: 4px 0 0 0;">[factuurnummer]</p>
    </div>
  </div>

  <table style="width: 100%; margin-bottom: 32px; font-size: 13px;">
    <tr>
      <td style="width: 50%; padding-right: 20px;">
        <strong style="color: #6b7280; font-size: 11px; text-transform: uppercase;">Gefactureerd aan</strong><br>
        <strong>[klantnaam]</strong><br>
        [klantbedrijfsnaam]<br>
        [klantadres]<br>
        [klantpostcode] [klantplaats]<br>
        <span style="color: #6b7280;">BTW: [klantBTWnummer]</span>
      </td>
      <td style="width: 50%; text-align: right;">
        <strong style="color: #6b7280; font-size: 11px; text-transform: uppercase;">Factuurdatum</strong><br>
        [datum]
      </td>
    </tr>
  </table>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
    <thead>
      <tr style="background: #1a0a4d; color: white;">
        <th style="padding: 10px 12px; text-align: left;">Omschrijving</th>
        <th style="padding: 10px 12px; text-align: right;">Bedrag</th>
        <th style="padding: 10px 12px; text-align: right;">BTW</th>
        <th style="padding: 10px 12px; text-align: right;">Totaal</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #f9fafb;">
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">[omschrijving]</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">[bedragExclBtw]</td>
        <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">[btwBedrag]</td>
        <td style="padding: 12px; text-align: right; font-weight: bold; border-bottom: 1px solid #e5e7eb;">[totaalbedrag]</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2"></td>
        <td style="padding: 8px 12px; text-align: right; color: #6b7280; font-size: 12px;">Subtotaal (excl. BTW)</td>
        <td style="padding: 8px 12px; text-align: right;">[bedragExclBtw]</td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td style="padding: 4px 12px; text-align: right; color: #6b7280; font-size: 12px;">BTW [btwPercent]%</td>
        <td style="padding: 4px 12px; text-align: right;">[btwBedrag]</td>
      </tr>
      <tr style="border-top: 2px solid #FF4514;">
        <td colspan="2"></td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold;">Totaal incl. BTW</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: bold; font-size: 16px; color: #1a0a4d;">[totaalbedrag]</td>
      </tr>
    </tfoot>
  </table>

  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center;">
    PrijsMij · Dé reverse marketplace van Nederland · support@prijsmij.nl · www.prijsmij.nl<br>
    Factuur [factuurnummer] · Gegenereerd op [datum]<br>
    Deze factuur is digitaal gegenereerd en geldig zonder handtekening.
  </div>
</div>`;
