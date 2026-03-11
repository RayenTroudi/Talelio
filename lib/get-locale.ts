import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, type Locale } from "./i18n";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (localeCookie && SUPPORTED_LOCALES.includes(localeCookie as Locale)) {
    return localeCookie as Locale;
  }
  return DEFAULT_LOCALE;
}
