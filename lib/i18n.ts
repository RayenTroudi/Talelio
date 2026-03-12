import ar from "@/locales/ar";
import en from "@/locales/en";
import fr from "@/locales/fr";

export type Locale = "ar" | "en" | "fr";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export const DEFAULT_LOCALE: Locale = "fr";
export const SUPPORTED_LOCALES: Locale[] = ["ar", "en", "fr"];

const dictionaries = { ar, en, fr } as const;

export type Translations = typeof ar;

export function getTranslations(locale: Locale): Translations {
  return (dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE]) as unknown as Translations;
}

export function isRTL(locale: Locale): boolean {
  return locale === "ar";
}

export function getDir(locale: Locale): "rtl" | "ltr" {
  return isRTL(locale) ? "rtl" : "ltr";
}
