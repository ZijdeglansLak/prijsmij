import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Language, type Translations } from "@/i18n/translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANG_KEY = "prijsmij_lang";

// FLAG_URL: image-based flags via flagcdn.com — works on all platforms including Windows
// (Windows does not render flag emoji, so we use actual flag images instead)
export const FLAG_URL: Record<Language, string> = {
  nl: "https://flagcdn.com/nl.svg",
  en: "https://flagcdn.com/gb.svg",
  de: "https://flagcdn.com/de.svg",
  fr: "https://flagcdn.com/fr.svg",
};
const FLAG: Record<Language, string> = FLAG_URL as unknown as Record<Language, string>;
const LABEL: Record<Language, string> = { nl: "NL", en: "EN", de: "DE", fr: "FR" };

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem(LANG_KEY) as Language | null;
    return stored && stored in translations ? stored : "nl";
  });

  function setLang(newLang: Language) {
    localStorage.setItem(LANG_KEY, newLang);
    setLangState(newLang);
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { FLAG, LABEL };
export type { Language };
