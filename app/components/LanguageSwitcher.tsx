"use client";

import { useTranslation } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

const LOCALE_LABELS: Record<Locale, string> = {
  ar: "ع",
  en: "EN",
  fr: "FR",
};

const LOCALE_FULL: Record<Locale, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {(["ar", "en", "fr"] as Locale[]).map((lang) => (
        <button
          key={lang}
          onClick={() => setLocale(lang)}
          title={LOCALE_FULL[lang]}
          aria-label={LOCALE_FULL[lang]}
          className={`px-2 py-1 text-xs font-medium rounded-lg transition-all duration-200 ${
            locale === lang
              ? "bg-amber-500 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          {LOCALE_LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
