import { toLocaleTag } from "./locale";

export function formatDate(
  date: Date | string | number,
  lang = "en",
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(toLocaleTag(lang), options).format(d);
}

const DIVISIONS: Array<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

export function formatRelative(
  date: Date | string | number,
  lang = "en",
  now: Date = new Date()
): string {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  let duration = (d.getTime() - now.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat(toLocaleTag(lang), {
    numeric: "always",
  });
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}
