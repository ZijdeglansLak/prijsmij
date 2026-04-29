import { Router } from "express";
import { db } from "@workspace/db";
import { requestsTable, categoriesTable } from "@workspace/db";
import { sql, and } from "drizzle-orm";

const router = Router();

const STATIC_URLS = [
  { loc: "https://prijsmij.nl/", changefreq: "daily", priority: "1.0" },
  { loc: "https://prijsmij.nl/requests", changefreq: "hourly", priority: "0.9" },
  { loc: "https://prijsmij.nl/request/new", changefreq: "monthly", priority: "0.7" },
  { loc: "https://prijsmij.nl/auth/register", changefreq: "monthly", priority: "0.8" },
  { loc: "https://prijsmij.nl/auth/login", changefreq: "monthly", priority: "0.6" },
  { loc: "https://prijsmij.nl/supplier/register", changefreq: "monthly", priority: "0.8" },
];

function urlEntry(u: { loc: string; changefreq: string; priority: string; lastmod?: string }): string {
  return [
    "  <url>",
    `    <loc>${u.loc}</loc>`,
    u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>` : "",
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

router.get("/sitemap.xml", async (_req, res) => {
  try {
    const [requests, categories] = await Promise.all([
      db
        .select({ id: requestsTable.id, createdAt: requestsTable.createdAt })
        .from(requestsTable)
        .where(
          and(
            sql`${requestsTable.expiresAt} > now()`,
            sql`${requestsTable.isClosed} = FALSE`
          )
        )
        .limit(5000),
      db.select({ id: categoriesTable.id }).from(categoriesTable).limit(500),
    ]);

    const requestUrls = requests.map((r) => ({
      loc: `https://prijsmij.nl/requests/${r.id}`,
      lastmod: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : undefined,
      changefreq: "weekly",
      priority: "0.6",
    }));

    const categoryUrls = categories.map((c) => ({
      loc: `https://prijsmij.nl/requests?categoryId=${c.id}`,
      changefreq: "daily",
      priority: "0.5",
    }));

    const allUrls = [...STATIC_URLS, ...requestUrls, ...categoryUrls];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(urlEntry).join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    res.send(xml);
  } catch (err) {
    res.status(500).send("<?xml version=\"1.0\"?><error>Sitemap generation failed</error>");
  }
});

export default router;
