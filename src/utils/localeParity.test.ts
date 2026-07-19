import { describe, expect, it } from "vitest";
import en from "./locales/en.json";
import ru from "./locales/rus.json";
import uz from "./locales/uz.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) =>
    value !== null && typeof value === "object"
      ? flattenKeys(value as Record<string, unknown>, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );
}

describe("locale key parity", () => {
  const enKeys = new Set(flattenKeys(en));

  it.each([
    ["rus", ru],
    ["uz", uz],
  ] as const)("%s.json has exactly the keys of en.json", (_name, locale) => {
    const keys = new Set(flattenKeys(locale as Record<string, unknown>));
    const missing = [...enKeys].filter((k) => !keys.has(k)).sort();
    const extra = [...keys].filter((k) => !enKeys.has(k)).sort();
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });
});
