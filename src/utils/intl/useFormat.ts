import { useTranslation } from "react-i18next";
import { formatCurrency } from "./currency";
import { formatDate, formatRelative } from "./datetime";

export function useFormat() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return {
    currency: (amount: number | string, code: string) =>
      formatCurrency(amount, code, lang),
    date: (date: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
      formatDate(date, lang, options),
    relative: (date: Date | string | number) => formatRelative(date, lang),
  };
}
