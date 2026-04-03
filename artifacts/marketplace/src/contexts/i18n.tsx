import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Language, type Translations } from "@/i18n/translations";

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LANG_KEY = "prijsmij_lang";

// Flag emojis stored as Unicode escape sequences to prevent corruption during file edits.
// 🇳🇱 = NL, 🇬🇧 = GB, 🇩🇪 = DE, 🇫🇷 = FR — DO NOT remove or replace with emoji literals.
const FLAG: Record<Language, string> = {
  nl: "\uD83C\uDDF3\uD83C\uDDF1", // 🇳🇱
  en: "\uD83C\uDDEC\uD83C\uDDE7", // 🇬🇧
  de: "\uD83C\uDDE9\uD83C\uDDEA", // 🇩🇪
  fr: "\uD83C\uDDEB\uD83C\uDDF7", // 🇫🇷
};
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
