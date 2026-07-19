import { toLocaleTag } from "./locale";

export function formatCurrency(
  amount: number | string,
  currencyCode: string,
  lang = "en"
): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(value)) return "";
  const locale = toLocaleTag(lang);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: currencyCode === "UZS" ? 0 : 2,
    }).format(value);
  } catch {
    return `${new Intl.NumberFormat(locale).format(value)} ${currencyCode}`;
  }
}
