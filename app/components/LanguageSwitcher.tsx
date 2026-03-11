"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "./LocaleProvider";
import type { Locale } from "@/lib/i18n";

const LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "en", label: "English",  flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center p-2 rounded-xl text-sm font-light text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200 select-none"
      >
        {/* Globe icon */}
        <svg
          className="w-6 h-6 text-gray-900 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 mt-2 w-44 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 overflow-hidden z-50 py-1.5">
          {LOCALES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={locale === lang.code}
              onClick={() => {
                setLocale(lang.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150 ${
                locale === lang.code
                  ? "bg-amber-50 text-amber-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="font-light flex-1 text-left">{lang.label}</span>
              {locale === lang.code && (
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
