import { useEffect } from "react";

const BASE = "PrijsMij";
const DEFAULT_TITLE = "PrijsMij – Kopers plaatsen een uitvraag, winkeliers bieden";
const DEFAULT_DESC =
  "Op PrijsMij zet jij de spelregels. Plaats je uitvraag gratis, ontvang biedingen van lokale winkeliers en kies het beste aanbod. Altijd de scherpste prijs.";
const BASE_URL = "https://prijsmij.nl";

interface SeoOptions {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: object;
}

function setMeta(attr: "name" | "property", value: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLd(id: string, data: object) {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

export function useSeo({
  title,
  description,
  canonical,
  ogImage,
  noIndex = false,
  jsonLd,
}: SeoOptions = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${BASE}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESC;
    const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL + "/";

    document.title = fullTitle;

    setMeta("name", "description", desc);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonicalUrl);
    if (ogImage) setMeta("property", "og:image", ogImage);

    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);

    setCanonical(canonicalUrl);

    if (jsonLd) {
      setJsonLd("page-json-ld", jsonLd);
    }

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESC);
      setMeta("name", "robots", "index, follow");
      setMeta("property", "og:title", DEFAULT_TITLE);
      setMeta("property", "og:description", DEFAULT_DESC);
      setMeta("property", "og:url", `${BASE_URL}/`);
      setMeta("name", "twitter:title", DEFAULT_TITLE);
      setMeta("name", "twitter:description", DEFAULT_DESC);
      setCanonical(`${BASE_URL}/`);
      removeJsonLd("page-json-ld");
    };
  }, [title, description, canonical, ogImage, noIndex, jsonLd]);
}
