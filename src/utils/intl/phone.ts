/**
 * Display-formats a phone number without assuming any country:
 * strips punctuation, ensures a leading +, and groups digits in threes
 * (trailing remainder kept as-is). Not a validator.
 */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const groups = digits.match(/.{1,3}/g) ?? [];
  return `+${groups.join(" ")}`;
}
