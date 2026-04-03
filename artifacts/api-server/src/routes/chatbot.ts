import { Router } from "express";
import { pool } from "@workspace/db";
import OpenAI from "openai";
import { requireAuth } from "./auth";
import nodemailer from "nodemailer";

const router = Router();

function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return null;
}

const FROM = process.env.SMTP_FROM ?? "PrijsMij <noreply@prijsmij.nl>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? process.env.SMTP_FROM ?? "admin@prijsmij.nl";

async function notifyAdminOfHack(userEmail: string, userId: number, message: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  try {
    await transporter.sendMail({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: "⚠️ Beveiligingsincident Quootje chatbot",
      text: `Er is een verdachte interactie gedetecteerd in de Quootje chatbot.\n\nGebruiker: ${userEmail} (ID: ${userId})\n\nBerichten:\n${message}\n\nHet account is geblokkeerd.`,
    });
  } catch {
    // Silently fail if email cannot be sent
  }
}

async function getOpenAIClient(): Promise<OpenAI | null> {
  // First try: key from site_settings (admin-panel configurable)
  try {
    const { rows } = await pool.query(`SELECT openai_api_key FROM site_settings LIMIT 1`);
    const dbKey = rows[0]?.openai_api_key as string | null | undefined;
    if (dbKey?.trim()) {
      return new OpenAI({ apiKey: dbKey.trim() });
    }
  } catch {
    // Column might not exist yet, continue
  }

  // Fallback: OPENAI_API_KEY2 environment variable
  const envKey = process.env.OPENAI_API_KEY2;
  if (envKey?.trim()) {
    return new OpenAI({ apiKey: envKey.trim() });
  }

  return null;
}

const HARMFUL_PATTERNS = [
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+\w+\s+set/i,
  /select\s+\*\s+from/i,
  /<script/i,
  /javascript:/i,
  /api[_\s]?key/i,
  /password/i,
  /wachtwoord/i,
  /database/i,
  /admin[_\s]?token/i,
  /bearer\s+token/i,
  /hack/i,
  /exploit/i,
  /injection/i,
  /xss/i,
  /sql\s*injection/i,
  /prompt\s*injection/i,
  /ignore\s+previous\s+instructions/i,
  /system\s+prompt/i,
  /forget\s+your\s+instructions/i,
];

function detectHarmfulContent(text: string): boolean {
  return HARMFUL_PATTERNS.some(p => p.test(text));
}

router.post("/chatbot/message", requireAuth, async (req: any, res: any) => {
  const userId = req.userId as number;
  const userEmail = req.userEmail as string;
  const userRole = req.userRole as string;
  const isAdmin = req.userIsAdmin as boolean;
  const isSeller = userRole === "seller" || isAdmin;

  const { message, history, lang } = req.body as {
    message: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    lang?: string;
  };

  if (!message?.trim()) {
    return res.status(400).json({ error: "Bericht is verplicht" });
  }

  // Check for harmful content
  if (detectHarmfulContent(message)) {
    try {
      await pool.query(`UPDATE user_accounts SET is_suspended = TRUE WHERE id = $1`, [userId]);
    } catch {
      // Column might not exist, continue
    }

    await notifyAdminOfHack(userEmail, userId, message);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ content: "Je sessie is beëindigd wegens een overtreding van de gebruiksvoorwaarden. De beheerder is op de hoogte gesteld." })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true, blocked: true })}\n\n`);
    res.end();
    return;
  }

  // Get OpenAI client
  const openai = await getOpenAIClient();
  if (!openai) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.write(`data: ${JSON.stringify({ error: "De chatbot is momenteel niet geconfigureerd. Stel een OpenAI API-sleutel in via het beheerscherm." })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  // Gather context: kennisbank entries
  let kennisbankContext = "";
  try {
    const { rows } = await pool.query(`SELECT title, content FROM kennisbank ORDER BY id`);
    if (rows.length > 0) {
      kennisbankContext = "\n\n## Kennisbank\n" + rows.map((r: any) => `### ${r.title}\n${r.content}`).join("\n\n");
    }
  } catch {
    // Continue without kennisbank if unavailable
  }

  // Gather context: categories
  let categoriesContext = "";
  try {
    const { rows } = await pool.query(`SELECT name, description FROM categories WHERE is_active = TRUE ORDER BY name`);
    if (rows.length > 0) {
      categoriesContext = "\n\n## Categorieën op de website\n" + rows.map((r: any) => `- **${r.name}**: ${r.description || ""}`).join("\n");
    }
  } catch {
    // Continue without categories if unavailable
  }

  // Gather context: uitvragen (only for sellers/admins)
  let uitvragenContext = "";
  if (isSeller) {
    try {
      const { rows } = await pool.query(
        `SELECT r.title, r.description, c.name as category FROM requests r LEFT JOIN categories c ON r.category_id = c.id ORDER BY r.created_at DESC LIMIT 20`
      );
      if (rows.length > 0) {
        uitvragenContext = "\n\n## Beschikbare uitvragen (alleen zichtbaar voor winkeliers)\n" +
          rows.map((r: any) => `- **${r.title}** (categorie: ${r.category || "onbekend"}): ${r.description || ""}`).join("\n");
      }
    } catch {
      // Continue without uitvragen
    }
  }

  const langNames: Record<string, string> = {
    nl: "Nederlands",
    en: "English",
    de: "Deutsch",
    fr: "Français",
  };
  const siteLang = lang && langNames[lang] ? langNames[lang] : "Nederlands";
  const siteLangCode = lang && langNames[lang] ? lang : "nl";

  const systemPrompt = `Je bent Quootje, de vriendelijke en behulpzame chatbot van het PrijsMij platform. PrijsMij is een online marktplaats waar kopers (particulieren en bedrijven) uitvragen kunnen plaatsen en winkeliers/leveranciers hierop kunnen bieden.

## Taalinstellingen (VERPLICHT):
- De standaardtaal van de website is momenteel: **${siteLang}** (code: ${siteLangCode})
- Antwoord ALTIJD in de taal die de gebruiker gebruikt in zijn/haar laatste bericht.
- Als de gebruiker in het Nederlands schrijft, antwoord dan in het Nederlands.
- Als de gebruiker in het Engels schrijft, antwoord dan in het Engels.
- Als de gebruiker in het Duits schrijft, antwoord dan in het Duits.
- Als de gebruiker in het Frans schrijft, antwoord dan in het Frans.
- Als je de taal van de gebruiker niet kunt bepalen, gebruik dan ${siteLang}.
- Schakel automatisch mee met de taal van de gebruiker zonder dit te benoemen.

## Jouw regels (volg deze ALTIJD zonder uitzondering):

1. **Alleen website-informatie**: Je antwoordt uitsluitend op basis van informatie van deze website en de kennisbank hieronder. Je zoekt NOOIT op internet. Je verzint NOOIT informatie.

2. **Uitvragen zichtbaarheid**: 
   - Winkeliers (sellers) mogen informatie over beschikbare uitvragen zien.
   - Kopers (buyers) mogen NOOIT informatie over specifieke uitvragen van anderen zien.
   - De huidige gebruiker is een: ${isSeller ? "winkelier/verkoper" : "koper"}

3. **Verboden onderwerpen** (weiger altijd beleefd):
   - API-sleutels, tokens, technische configuratie, database-structuur
   - Informatie over andere gebruikers
   - Programmacode, backend, architectuur
   - Beledigingen of ongepaste verzoeken
   - Alles wat niets te maken heeft met de diensten van PrijsMij

4. **Nooit wijzigen**: Je brengt NOOIT wijzigingen aan in de database, code of instellingen. Je leest alleen.

5. **Altijd vriendelijk**: Wees altijd beleefd, behulpzaam en professioneel. Als je een vraag niet kunt beantwoorden, zeg je dat vriendelijk.

6. **Geen internet**: Je haalt GEEN informatie van internet. Alles wat je weet komt uitsluitend van deze website en kennisbank.

## Website informatie:
PrijsMij is een platform waar je als koper een uitvraag kunt plaatsen en winkeliers hierop kunnen bieden. Zo krijg je de beste prijs voor je product of dienst.
${categoriesContext}
${kennisbankContext}
${uitvragenContext}

Als een vraag buiten de scope van PrijsMij valt, zeg je vriendelijk: "Dit valt buiten mijn kennisgebied als Quootje. Ik kan alleen vragen beantwoorden over het PrijsMij platform en zijn diensten."`;

  const chatMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
  ];

  if (history && Array.isArray(history)) {
    for (const h of history.slice(-10)) {
      if (h.role === "user" || h.role === "assistant") {
        chatMessages.push({ role: h.role, content: h.content });
      }
    }
  }

  chatMessages.push({ role: "user", content: message });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    req.log.error({ err, message: err?.message, status: err?.status, code: err?.code }, "Chatbot OpenAI error");
    res.write(`data: ${JSON.stringify({ error: "Er is een fout opgetreden. Probeer het opnieuw." })}\n\n`);
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  }
});

export default router;
