"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { type Locale, type Translations, DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, getTranslations, getDir } from "@/lib/i18n";

interface LocaleContextValue {
  locale: Locale;
  t: Translations;
  dir: "rtl" | "ltr";
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  t: getTranslations(DEFAULT_LOCALE),
  dir: "rtl",
  setLocale: () => {},
});

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(new RegExp("(?:^|; )" + LOCALE_COOKIE + "=([^;]*)"));
  const value = match ? decodeURIComponent(match[1]) : "";
  return SUPPORTED_LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

interface LocaleProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

export function LocaleProvider({ children, initialLocale }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; max-age=${maxAge}; path=/`;
    setLocaleState(newLocale);
    window.location.reload();
  }, []);

  const t = getTranslations(locale);
  const dir = getDir(locale);

  return (
    <LocaleContext.Provider value={{ locale, t, dir, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LocaleContext);
}
