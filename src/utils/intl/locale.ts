const LOCALE_TAGS: Record<string, string> = {
  en: "en-US",
  ru: "ru-RU",
  uz: "uz-UZ",
};

export function toLocaleTag(lang?: string): string {
  if (!lang) return "en-US";
  const base = lang.split("-")[0];
  return LOCALE_TAGS[base] ?? lang;
}
