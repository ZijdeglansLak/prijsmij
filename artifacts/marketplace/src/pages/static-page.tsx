import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { marked } from "marked";
import { Layout } from "@/components/layout";
import { useI18n } from "@/contexts/i18n";
import { useSeo } from "@/hooks/use-seo";

interface StaticPageData {
  slug: string;
  lang: string;
  title: string;
  content: string;
}

function renderContent(raw: string): string {
  if (!raw) return "";
  if (raw.trimStart().startsWith("<")) {
    return raw;
  }
  return marked.parse(raw) as string;
}

export default function StaticPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { lang } = useI18n();
  const [page, setPage] = useState<StaticPageData | null>(null);

  useSeo({
    title: page?.title,
    canonical: slug ? `/pages/${slug}` : undefined,
  });
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/pages/${slug}?lang=${lang}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) setPage(data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug, lang]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        {!loading && notFound && (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">Pagina niet gevonden.</p>
          </div>
        )}
        {!loading && page && (
          <>
            <h1 className="text-3xl font-bold text-secondary mb-8 pb-4 border-b border-border">
              {page.title}
            </h1>
            {page.content ? (
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: renderContent(page.content) }}
              />
            ) : (
              <p className="text-muted-foreground italic">
                De inhoud van deze pagina is nog niet ingesteld.
              </p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
