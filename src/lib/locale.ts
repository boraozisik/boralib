import "server-only";
import { cookies, headers } from "next/headers";
import { dictionaries, isLocale, LOCALE_COOKIE, type Locale } from "./i18n";

/**
 * The visitor's language: the "lang" cookie set by the language switcher,
 * otherwise Turkish if the browser's first language is Turkish, else English.
 */
export async function getLocale(): Promise<Locale> {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  const first = ((await headers()).get("accept-language") ?? "").split(",")[0].trim().toLowerCase();
  return first.startsWith("tr") ? "tr" : "en";
}

export async function getDict() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
