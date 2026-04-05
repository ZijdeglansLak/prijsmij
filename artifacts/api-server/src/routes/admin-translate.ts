import { Router } from "express";
import { pool } from "@workspace/db";
import OpenAI from "openai";
import { requireAdmin } from "./auth";

const router = Router();

async function getOpenAIClient(): Promise<OpenAI | null> {
  try {
    const { rows } = await pool.query(`SELECT openai_api_key FROM site_settings LIMIT 1`);
    const dbKey = rows[0]?.openai_api_key as string | null | undefined;
    if (dbKey?.trim()) return new OpenAI({ apiKey: dbKey.trim() });
  } catch {}
  const envKey = process.env.OPENAI_API_KEY2;
  if (envKey?.trim()) return new OpenAI({ apiKey: envKey.trim() });
  return null;
}

interface FieldLangPartial {
  en?: string;
  de?: string;
  fr?: string;
}

interface CategoryFieldInput {
  key: string;
  label: string;
  labelI18n?: Partial<Record<string, string>>;
  type: string;
  required: boolean;
  placeholder?: string;
  placeholderI18n?: Partial<Record<string, string>>;
  options?: string[];
  optionsI18n?: Partial<Record<string, string[]>>;
  unit?: string;
}

const TARGET_LANGS = ["en", "de", "fr"] as const;

router.post("/admin/translate-fields", requireAdmin, async (req, res) => {
  const { fields } = req.body as { fields: CategoryFieldInput[] };

  if (!Array.isArray(fields) || fields.length === 0) {
    res.status(400).json({ error: "Geen velden meegegeven" });
    return;
  }

  const openai = await getOpenAIClient();
  if (!openai) {
    res.status(503).json({ error: "OpenAI niet geconfigureerd. Stel een API-sleutel in via Beheer → Instellingen." });
    return;
  }

  // Collect all texts that need translation: build a flat list of { id, nl }
  type TransItem = { id: string; nl: string };
  const items: TransItem[] = [];

  for (const field of fields) {
    // Field label
    for (const lang of TARGET_LANGS) {
      if (!field.labelI18n?.[lang]?.trim()) {
        items.push({ id: `label__${field.key}__${lang}`, nl: field.label });
      }
    }

    // Placeholder
    if (field.placeholder?.trim()) {
      for (const lang of TARGET_LANGS) {
        if (!field.placeholderI18n?.[lang]?.trim()) {
          items.push({ id: `placeholder__${field.key}__${lang}`, nl: field.placeholder });
        }
      }
    }

    // Options
    if (field.type === "select" && Array.isArray(field.options)) {
      for (let oi = 0; oi < field.options.length; oi++) {
        const nlOpt = field.options[oi];
        if (!nlOpt?.trim()) continue;
        for (const lang of TARGET_LANGS) {
          const existing = field.optionsI18n?.[lang]?.[oi];
          if (!existing?.trim()) {
            items.push({ id: `option__${field.key}__${oi}__${lang}`, nl: nlOpt });
          }
        }
      }
    }
  }

  if (items.length === 0) {
    res.json({ fields, message: "Alle vertalingen zijn al ingevuld" });
    return;
  }

  // Build prompt
  const textsBlock = items.map(it => `${it.id}: ${it.nl}`).join("\n");
  const prompt = `Je bent een vertaler. Vertaal de onderstaande teksten vanuit het Nederlands naar Engels (en), Duits (de) en Frans (fr).
Stuur het resultaat terug als JSON object waarbij de sleutel de originele ID is en de waarde een object is met de talen als sleutels.

Teksten om te vertalen:
${textsBlock}

Antwoord ALLEEN met geldige JSON, niets anders. Voorbeeld:
{
  "label__merk__en": "Brand",
  "label__merk__de": "Marke",
  "label__merk__fr": "Marque"
}`;

  let parsed: Record<string, string>;
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    const raw = completion.choices[0]?.message?.content ?? "{}";
    parsed = JSON.parse(raw);
  } catch (err) {
    res.status(500).json({ error: "Fout bij vertalen via OpenAI" });
    return;
  }

  // Apply translations back to fields (only fill empty slots)
  const updatedFields = fields.map(field => {
    const f = { ...field };
    const newLabelI18n = { ...(f.labelI18n ?? {}) };
    const newPlaceholderI18n = { ...(f.placeholderI18n ?? {}) };
    const newOptionsI18n = { ...(f.optionsI18n ?? {}) } as Record<string, string[]>;

    for (const lang of TARGET_LANGS) {
      // Label
      const labelKey = `label__${f.key}__${lang}`;
      if (parsed[labelKey] && !newLabelI18n[lang]?.trim()) {
        newLabelI18n[lang] = parsed[labelKey];
      }

      // Placeholder
      if (f.placeholder?.trim()) {
        const phKey = `placeholder__${f.key}__${lang}`;
        if (parsed[phKey] && !newPlaceholderI18n[lang]?.trim()) {
          newPlaceholderI18n[lang] = parsed[phKey];
        }
      }

      // Options
      if (f.type === "select" && Array.isArray(f.options)) {
        const arr = [...(newOptionsI18n[lang] ?? [])];
        let changed = false;
        for (let oi = 0; oi < f.options.length; oi++) {
          const optKey = `option__${f.key}__${oi}__${lang}`;
          if (parsed[optKey] && !arr[oi]?.trim()) {
            while (arr.length <= oi) arr.push("");
            arr[oi] = parsed[optKey];
            changed = true;
          }
        }
        if (changed) newOptionsI18n[lang] = arr;
      }
    }

    f.labelI18n = newLabelI18n;
    f.placeholderI18n = newPlaceholderI18n;
    f.optionsI18n = newOptionsI18n;
    return f;
  });

  res.json({ fields: updatedFields, translated: items.length });
});

export default router;
