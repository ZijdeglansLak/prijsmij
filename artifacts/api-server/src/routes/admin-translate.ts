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
  // Check multiple env var names so dev and prod both work
  const envKey = process.env.OPENAI_API_KEY2 || process.env.OPENAI_API_KEY;
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


// POST /admin/translate-all-categories — translates ALL categories at once
router.post("/admin/translate-all-categories", requireAdmin, async (req, res) => {
  const { categories } = req.body as { categories: Array<CategoryFieldInput & {
    id: number;
    name: string;
    nameI18n?: Partial<Record<string, string>>;
    description: string;
    descriptionI18n?: Partial<Record<string, string>>;
    fields: CategoryFieldInput[];
  }> };

  if (!Array.isArray(categories) || categories.length === 0) {
    res.status(400).json({ error: "Geen categorieën meegegeven" });
    return;
  }

  const openai = await getOpenAIClient();
  if (!openai) {
    res.status(503).json({ error: "OpenAI niet geconfigureerd. Stel een API-sleutel in via Beheer → Instellingen." });
    return;
  }

  type TransItem = { id: string; nl: string };
  const items: TransItem[] = [];

  for (const cat of categories) {
    const catKey = `cat_${cat.id}`;

    // Category name
    for (const lang of TARGET_LANGS) {
      if (!cat.nameI18n?.[lang]?.trim()) {
        items.push({ id: `catname__${catKey}__${lang}`, nl: cat.name });
      }
    }

    // Category description
    for (const lang of TARGET_LANGS) {
      if (!cat.descriptionI18n?.[lang]?.trim()) {
        items.push({ id: `catdesc__${catKey}__${lang}`, nl: cat.description });
      }
    }

    // Fields
    for (const field of (cat.fields ?? [])) {
      for (const lang of TARGET_LANGS) {
        if (!field.labelI18n?.[lang]?.trim()) {
          items.push({ id: `label__${catKey}__${field.key}__${lang}`, nl: field.label });
        }
      }
      if (field.placeholder?.trim()) {
        for (const lang of TARGET_LANGS) {
          if (!field.placeholderI18n?.[lang]?.trim()) {
            items.push({ id: `placeholder__${catKey}__${field.key}__${lang}`, nl: field.placeholder });
          }
        }
      }
      if (field.type === "select" && Array.isArray(field.options)) {
        for (let oi = 0; oi < field.options.length; oi++) {
          const nlOpt = field.options[oi];
          if (!nlOpt?.trim()) continue;
          for (const lang of TARGET_LANGS) {
            if (!field.optionsI18n?.[lang]?.[oi]?.trim()) {
              items.push({ id: `option__${catKey}__${field.key}__${oi}__${lang}`, nl: nlOpt });
            }
          }
        }
      }
    }
  }

  if (items.length === 0) {
    res.json({ categories, message: "Alle vertalingen zijn al ingevuld", translated: 0 });
    return;
  }

  const textsBlock = items.map(it => `${it.id}: ${it.nl}`).join("\n");
  const prompt = `Je bent een professionele vertaler voor een Nederlandse marktplaats-website. Vertaal de onderstaande teksten van Nederlands naar Engels (en), Duits (de) en Frans (fr).

Stuur het resultaat als JSON object. Sleutel = de originele ID (exact overnemen), waarde = de vertaling (één string, niet een object per taal — de taal staat al in de ID).

Teksten:
${textsBlock}

Antwoord ALLEEN met geldige JSON, geen extra tekst.`;

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
  } catch {
    res.status(500).json({ error: "Fout bij vertalen via OpenAI" });
    return;
  }

  // Apply translations back
  const updatedCategories = categories.map(cat => {
    const catKey = `cat_${cat.id}`;
    const c = { ...cat };
    const newNameI18n = { ...(c.nameI18n ?? {}) };
    const newDescI18n = { ...(c.descriptionI18n ?? {}) };

    for (const lang of TARGET_LANGS) {
      if (parsed[`catname__${catKey}__${lang}`] && !newNameI18n[lang]?.trim()) {
        newNameI18n[lang] = parsed[`catname__${catKey}__${lang}`];
      }
      if (parsed[`catdesc__${catKey}__${lang}`] && !newDescI18n[lang]?.trim()) {
        newDescI18n[lang] = parsed[`catdesc__${catKey}__${lang}`];
      }
    }
    c.nameI18n = newNameI18n;
    c.descriptionI18n = newDescI18n;

    c.fields = (c.fields ?? []).map(field => {
      const f = { ...field };
      const newLabelI18n = { ...(f.labelI18n ?? {}) };
      const newPlaceholderI18n = { ...(f.placeholderI18n ?? {}) };
      const newOptionsI18n = { ...(f.optionsI18n ?? {}) } as Record<string, string[]>;

      for (const lang of TARGET_LANGS) {
        const lk = `label__${catKey}__${f.key}__${lang}`;
        if (parsed[lk] && !newLabelI18n[lang]?.trim()) newLabelI18n[lang] = parsed[lk];
        if (f.placeholder?.trim()) {
          const pk = `placeholder__${catKey}__${f.key}__${lang}`;
          if (parsed[pk] && !newPlaceholderI18n[lang]?.trim()) newPlaceholderI18n[lang] = parsed[pk];
        }
        if (f.type === "select" && Array.isArray(f.options)) {
          const arr = [...(newOptionsI18n[lang] ?? [])];
          let changed = false;
          for (let oi = 0; oi < f.options.length; oi++) {
            const ok = `option__${catKey}__${f.key}__${oi}__${lang}`;
            if (parsed[ok] && !arr[oi]?.trim()) {
              while (arr.length <= oi) arr.push("");
              arr[oi] = parsed[ok];
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

    return c;
  });

  res.json({
    categories: updatedCategories,
    translated: items.length,
    details: {
      names: items.filter(i => i.id.startsWith("catname__")).length,
      descriptions: items.filter(i => i.id.startsWith("catdesc__")).length,
      labels: items.filter(i => i.id.startsWith("label__")).length,
      placeholders: items.filter(i => i.id.startsWith("placeholder__")).length,
      options: items.filter(i => i.id.startsWith("option__")).length,
    },
  });
});

export default router;
