import { describe, expect, it } from "vitest";
import { formatCurrency } from "./currency";
import { formatDate, formatRelative } from "./datetime";
import { toLocaleTag } from "./locale";
import { formatPhone } from "./phone";

describe("toLocaleTag", () => {
  it("maps app languages to BCP-47 tags", () => {
    expect(toLocaleTag("uz")).toBe("uz-UZ");
    expect(toLocaleTag("ru")).toBe("ru-RU");
    expect(toLocaleTag("en")).toBe("en-US");
  });
  it("defaults to en-US and passes through unknown tags", () => {
    expect(toLocaleTag(undefined)).toBe("en-US");
    expect(toLocaleTag("de-DE")).toBe("de-DE");
  });
});

describe("formatCurrency", () => {
  it("formats USD in English", () => {
    expect(formatCurrency(1250, "USD", "en")).toBe("$1,250.00");
  });
  it("formats UZS without fraction digits", () => {
    const result = formatCurrency(1500000, "UZS", "en");
    expect(result).toContain("1,500,000");
    expect(result).not.toContain(".00");
  });
  it("accepts numeric strings (API sends price as string)", () => {
    expect(formatCurrency("99.5", "USD", "en")).toBe("$99.50");
  });
  it("falls back to '<number> CODE' for unknown currency codes", () => {
    expect(formatCurrency(100, "NOPE", "en")).toBe("100 NOPE");
  });
  it("returns empty string for non-numeric input", () => {
    expect(formatCurrency("abc", "USD", "en")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a date in the requested language", () => {
    expect(formatDate("2026-07-19T12:00:00Z", "en")).toMatch(/Jul 19, 2026/);
  });
  it("returns empty string for invalid dates", () => {
    expect(formatDate("not-a-date", "en")).toBe("");
  });
});

describe("formatRelative", () => {
  const now = new Date("2026-07-19T12:00:00Z");
  it("formats past times", () => {
    expect(formatRelative("2026-07-16T12:00:00Z", "en", now)).toBe("3 days ago");
  });
  it("formats near-now naturally", () => {
    expect(formatRelative("2026-07-19T11:59:30Z", "en", now)).toBe("30 seconds ago");
  });
});

describe("formatPhone", () => {
  it("normalizes and groups digits", () => {
    expect(formatPhone("998901234567")).toBe("+998 901 234 567");
  });
  it("keeps an existing plus and strips punctuation", () => {
    expect(formatPhone("+1 (415) 555-0132")).toBe("+141 555 501 32");
  });
  it("returns empty string for empty input", () => {
    expect(formatPhone("")).toBe("");
  });
});
