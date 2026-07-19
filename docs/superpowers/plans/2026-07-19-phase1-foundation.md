# Phase 1 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the design-token + theming + component-kit + intl foundation for the Tezsell web international upgrade, and prove it by rebuilding the app shell (navbar, footer, home) on it.

**Architecture:** CSS-variable design tokens (light + dark) mapped into the Tailwind theme; a `ThemeProvider` owning the `dark` class; a pure-function intl layer replacing hardcoded currency/phone/date logic; a `src/components/ui/` kit consumed first by the rebuilt shell. Legacy pages keep their CSS untouched until later phases.

**Tech Stack:** React 18 + TypeScript 5.6, Vite 6, Tailwind 3.4, i18next, Redux Toolkit (existing). New dev-deps only: Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-07-19-web-international-upgrade-design.md`

## Global Constraints

- **NEVER run `git add -A`, `git add .`, or `git commit -a`.** The working tree carries unrelated in-flight work (`.env`, `src/pages/Authentication/Login/Login.tsx`, `src/pages/Messages/*`, `src/pages/Product/*`, `src/pages/Service/ServiceDetail.tsx`, `src/store/constants.ts`, `src/store/slices/socialAuthSlice.ts`). Stage only the exact files listed in each commit step.
- **Do not modify** any of the in-flight files listed above, in any task.
- **Locale JSONs** (`src/utils/locales/{en,rus,uz}.json`) may only gain keys — never edit or remove existing keys. These files also hold in-flight changes; committing them is allowed (the in-flight keys are additive and harmless), but confirm your diff to them only adds keys.
- **No new runtime dependencies.** Dev-dependencies for testing (Task 1) are the only additions to `package.json`.
- **New UI code uses semantic token classes only** (`bg-surface`, `text-foreground`, `border-border`, `bg-primary`, …) — never raw palette classes (`bg-blue-600`, `text-gray-700`) or hex values. Every component must look correct in light AND dark.
- **Legacy CSS files** (`src/components/*.css`, page CSS for unmigrated pages) stay untouched except the three deleted in Tasks 8–10 (`Navbar.css`, `Footer.css`, `Home.css`). The legacy primitives `src/components/{Button,Card,Modal,Pagination,Text}.tsx` stay — 5 unmigrated pages import them; they are removed in Phase 2.
- Build gate for every task: `npm run build` (runs `tsc -b && vite build`) must pass before committing.
- All user-facing strings go through `t("…")` with keys added to **all three** locale files (English, Russian, Uzbek). The locale-parity test (Task 5) enforces this.
- Commit messages: conventional commits, ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

---

### Task 1: Test infrastructure (Vitest + Testing Library)

**Files:**
- Modify: `package.json` (scripts + devDependencies via npm install)
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Test: `src/test/sanity.test.ts`

**Interfaces:**
- Produces: `npm test` (vitest run) and `npm run test:watch`; jsdom environment with jest-dom matchers available in all `*.test.ts(x)` files under `src/`.

- [ ] **Step 1: Install dev dependencies**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Create vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 3: Create test setup**

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 4: Add npm scripts**

In `package.json` `"scripts"`, add (keep existing scripts unchanged):

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write sanity test**

Create `src/test/sanity.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test infrastructure", () => {
  it("runs with jsdom", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    expect(el).toHaveTextContent("ok");
  });
});
```

- [ ] **Step 6: Run tests and build**

Run: `npm test`
Expected: 1 passed.

Note: `globals: true` requires TypeScript to know vitest globals. If `tsc -b` complains about `describe`/`it`, add `"types": ["vitest/globals"]` to `tsconfig.app.json` `compilerOptions`. Keep explicit imports in test files anyway (they work regardless).

Run: `npm run build`
Expected: exits 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/test/setup.ts src/test/sanity.test.ts tsconfig.app.json
git commit -m "test: add vitest + testing-library infrastructure

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Drop `tsconfig.app.json` from the `git add` if you didn't need to change it.)

---

### Task 2: Design tokens + Tailwind theme

**Files:**
- Modify: `src/index.css` (full rewrite below)
- Modify: `tailwind.config.ts` (full rewrite below)
- Modify: `index.html` (add Inter font link only — nothing else in this task)

**Interfaces:**
- Produces: semantic Tailwind classes used by every later task: `bg-background`, `bg-surface`, `text-foreground`, `text-muted`, `border-border`, `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground`, `bg-accent`, `text-accent-foreground`, `text-success`, `text-warning`, `bg-danger`, plus `font-sans` = Inter. Dark values activate under the `.dark` class on `<html>`.

- [ ] **Step 1: Rewrite `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        background: "rgb(var(--tz-background) / <alpha-value>)",
        surface: "rgb(var(--tz-surface) / <alpha-value>)",
        foreground: "rgb(var(--tz-foreground) / <alpha-value>)",
        muted: "rgb(var(--tz-muted) / <alpha-value>)",
        border: "rgb(var(--tz-border) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--tz-primary) / <alpha-value>)",
          hover: "rgb(var(--tz-primary-hover) / <alpha-value>)",
          foreground: "rgb(var(--tz-primary-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--tz-accent) / <alpha-value>)",
          foreground: "rgb(var(--tz-accent-foreground) / <alpha-value>)",
        },
        success: "rgb(var(--tz-success) / <alpha-value>)",
        warning: "rgb(var(--tz-warning) / <alpha-value>)",
        danger: "rgb(var(--tz-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 2: Rewrite `src/index.css`**

The `--tz-` prefix namespaces our variables away from any legacy CSS. `.page-container`/`.content` are kept — `App.tsx` uses them.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --tz-background: 248 250 252;
    --tz-surface: 255 255 255;
    --tz-foreground: 15 23 42;
    --tz-muted: 100 116 139;
    --tz-border: 226 232 240;
    --tz-primary: 37 99 235;
    --tz-primary-hover: 29 78 216;
    --tz-primary-foreground: 255 255 255;
    --tz-accent: 245 158 11;
    --tz-accent-foreground: 15 23 42;
    --tz-success: 22 163 74;
    --tz-warning: 217 119 6;
    --tz-danger: 220 38 38;
  }

  .dark {
    --tz-background: 15 23 42;
    --tz-surface: 30 41 59;
    --tz-foreground: 241 245 249;
    --tz-muted: 148 163 184;
    --tz-border: 51 65 85;
    --tz-primary: 59 130 246;
    --tz-primary-hover: 96 165 250;
    --tz-primary-foreground: 255 255 255;
    --tz-accent: 251 191 36;
    --tz-accent-foreground: 15 23 42;
    --tz-success: 34 197 94;
    --tz-warning: 245 158 11;
    --tz-danger: 248 113 113;
  }

  html,
  body {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    @apply bg-background font-sans text-foreground antialiased;
  }
}

/* Legacy layout hooks used by App.tsx — do not remove until App migrates */
.page-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
}
```

Note what changed for legacy pages: `body` background goes from `#fff` to `#f8fafc`, and the `h1,h2,h3 { Poppins }` rule is gone (falls back to Inter). Both are intentional per spec (Poppins dropped) and low-risk, but verify in Step 4.

- [ ] **Step 3: Add Inter font to `index.html`**

After the existing `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />` line, add:

```html
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
```

- [ ] **Step 4: Verify build + visual spot-check**

Run: `npm run build`
Expected: exits 0.

Run: `npm run dev`, open the app. Check: home page, products page (`/products`), and login page still render acceptably (near-white page background instead of pure white is the only expected change; headings now Inter). In DevTools, add class `dark` to `<html>` manually: token-driven elements are minimal so far — just confirm the body background flips to dark slate.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/index.css index.html
git commit -m "feat: design tokens (light+dark) mapped into Tailwind theme

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Theme system (ThemeProvider + no-flash script)

**Files:**
- Create: `src/theme/ThemeProvider.tsx`
- Test: `src/theme/ThemeProvider.test.tsx`
- Modify: `index.html` (inline no-flash script)
- Modify: `src/App.tsx` (wrap app in ThemeProvider)

**Interfaces:**
- Consumes: `.dark` token variables from Task 2.
- Produces: `ThemeProvider` component; `useTheme(): { theme: "light" | "dark"; toggleTheme(): void; setTheme(t): void }`; localStorage key `"tz-theme"`. Task 8's ThemeToggle uses `useTheme`.

- [ ] **Step 1: Write the failing test**

Create `src/theme/ThemeProvider.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function Probe() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} data-testid="probe">
      {theme}
    </button>
  );
}

function mockMatchMedia(prefersDark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("dark") ? prefersDark : false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });
  afterEach(() => vi.unstubAllGlobals());

  it("uses stored theme when valid", () => {
    mockMatchMedia(false);
    localStorage.setItem("tz-theme", "dark");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
  });

  it("falls back to system preference when storage is empty or invalid", () => {
    mockMatchMedia(true);
    localStorage.setItem("tz-theme", "banana");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("dark");
  });

  it("toggles theme, updates html class and persists", () => {
    mockMatchMedia(false);
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("light");
    act(() => screen.getByTestId("probe").click());
    expect(screen.getByTestId("probe")).toHaveTextContent("dark");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("tz-theme")).toBe("dark");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/theme`
Expected: FAIL — cannot resolve `./ThemeProvider`.

- [ ] **Step 3: Implement ThemeProvider**

Create `src/theme/ThemeProvider.tsx`:

```tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "tz-theme";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable (private mode, etc.)
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // storage unavailable
    }
  }, [theme]);

  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === "dark" ? "light" : "dark")),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/theme`
Expected: 3 passed.

- [ ] **Step 5: Add no-flash script to `index.html`**

Immediately after the opening `<body>` tag and BEFORE the `#root` div, this must run before React:

Actually place it in `<head>`, as the last element before `</head>` (runs before first paint):

```html
  <script>
    (function () {
      try {
        var t = localStorage.getItem("tz-theme");
        if (t !== "light" && t !== "dark") {
          t = window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
        }
        document.documentElement.classList.toggle("dark", t === "dark");
      } catch (e) {}
    })();
  </script>
```

- [ ] **Step 6: Wrap the app**

In `src/App.tsx`: add `import { ThemeProvider } from "./theme/ThemeProvider";` and wrap the existing JSX so `ThemeProvider` sits directly inside `ErrorBoundary`:

```tsx
    <ErrorBoundary>
      <ThemeProvider>
        <I18nextProvider i18n={i18n}>
          {/* …existing content unchanged… */}
        </I18nextProvider>
      </ThemeProvider>
    </ErrorBoundary>
```

- [ ] **Step 7: Verify build**

Run: `npm test && npm run build`
Expected: all tests pass, build exits 0. In `npm run dev`, toggling `localStorage.setItem("tz-theme","dark")` + reload shows dark body with no white flash.

- [ ] **Step 8: Commit**

```bash
git add src/theme/ThemeProvider.tsx src/theme/ThemeProvider.test.tsx index.html src/App.tsx
git commit -m "feat: theme provider with dark mode and no-flash boot script

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Intl utilities (currency, date, phone)

**Files:**
- Create: `src/utils/intl/locale.ts`, `src/utils/intl/currency.ts`, `src/utils/intl/datetime.ts`, `src/utils/intl/phone.ts`, `src/utils/intl/useFormat.ts`, `src/utils/intl/index.ts`
- Test: `src/utils/intl/intl.test.ts`

**Interfaces:**
- Produces (used by Tasks 8–10 and all later phases):
  - `toLocaleTag(lang?: string): string` — `"uz" → "uz-UZ"`, `"ru" → "ru-RU"`, `"en" → "en-US"`, unknown passthrough, default `"en-US"`.
  - `formatCurrency(amount: number | string, currencyCode: string, lang?: string): string` — Intl-formatted; UZS gets 0 fraction digits; unknown code falls back to `"<number> CODE"`; non-numeric input returns `""`.
  - `formatDate(date: Date | string | number, lang?: string, options?: Intl.DateTimeFormatOptions): string` — default `{ dateStyle: "medium" }`; invalid date returns `""`.
  - `formatRelative(date: Date | string | number, lang?: string, now?: Date): string` — "3 days ago" style via `Intl.RelativeTimeFormat`.
  - `formatPhone(raw: string): string` — normalizes to `+` + digits, groups for display; empty input returns `""`. No country assumptions.
  - `useFormat(): { currency, date, relative }` — hook binding the current i18next language.

- [ ] **Step 1: Write the failing tests**

Create `src/utils/intl/intl.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/utils/intl`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the modules**

Create `src/utils/intl/locale.ts`:

```ts
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
```

Create `src/utils/intl/currency.ts`:

```ts
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
```

Create `src/utils/intl/datetime.ts`:

```ts
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
```

Create `src/utils/intl/phone.ts`:

```ts
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
```

Create `src/utils/intl/useFormat.ts`:

```ts
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
```

Create `src/utils/intl/index.ts`:

```ts
export { formatCurrency } from "./currency";
export { formatDate, formatRelative } from "./datetime";
export { toLocaleTag } from "./locale";
export { formatPhone } from "./phone";
export { useFormat } from "./useFormat";
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/utils/intl`
Expected: all pass. If a `formatCurrency`/`formatDate` assertion fails on exact output, check the Node ICU output (`node -e "console.log(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(1250))"`) and adjust the assertion to the actual full-ICU output — do not weaken to `toContain` for the USD/en cases.

- [ ] **Step 5: Build and commit**

Run: `npm run build` — exits 0.

```bash
git add src/utils/intl
git commit -m "feat: intl utilities for currency, date and phone formatting

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: English default locale + locale key-parity test

**Files:**
- Modify: `src/utils/i18n.ts`
- Modify: `index.html` (`lang` attribute)
- Test: `src/utils/localeParity.test.ts`
- Possibly modify: `src/utils/locales/{en,rus,uz}.json` (additive reconciliation only)

**Interfaces:**
- Consumes: locale JSONs.
- Produces: i18next with `fallbackLng: "en"`, detector-driven language; a permanent parity test all later tasks must keep green when adding keys.

- [ ] **Step 1: Write the parity test**

Create `src/utils/localeParity.test.ts`:

```ts
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
```

- [ ] **Step 2: Run it — it may legitimately fail**

Run: `npm test -- localeParity`

If it fails, the diff lists exactly which keys are missing/extra per file. Reconcile **additively**: add each missing key to the file that lacks it, translating the English value into Russian/Uzbek (match the tone of neighboring keys in that file; these are short marketplace strings). For `extra` keys (present in rus/uz but not en): add the key to `en.json` with an English translation — never delete. Re-run until green.

- [ ] **Step 3: Flip default language to English**

In `src/utils/i18n.ts`, replace the `init` options: delete the `lng: 'uz',` line entirely (the browser-language detector chooses; stored user choice wins) and change `fallbackLng: 'uz'` to `fallbackLng: 'en'`. Result:

```ts
i18n.use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uz: { translation: uz },
  },
  fallbackLng: 'en',
  supportedLngs: ['en', 'ru', 'uz'],
  interpolation: {
    escapeValue: false,
  },
});
```

(`supportedLngs` stops the detector from picking e.g. `de` and landing on fallback with a confusing detected value.)

- [ ] **Step 4: Update `index.html` lang attribute**

Change `<html lang="uz" dir="ltr">` to `<html lang="en" dir="ltr">`.

- [ ] **Step 5: Verify**

Run: `npm test && npm run build` — all green.
In `npm run dev` with an English browser and cleared localStorage (`i18nextLng` key), the UI comes up in English; existing users with a stored `i18nextLng=uz` still get Uzbek.

- [ ] **Step 6: Commit**

```bash
git add src/utils/i18n.ts src/utils/localeParity.test.ts index.html src/utils/locales/en.json src/utils/locales/rus.json src/utils/locales/uz.json
git commit -m "feat: default language to English with locale key-parity test

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(Heads-up: the locale JSONs also contain in-flight additive keys from the chat/social-auth work; they ride along in this commit intentionally — see Global Constraints.)

---

### Task 6: `cn` helper + ui kit part 1 (Button, Badge, Spinner, Skeleton, Avatar, Input, Textarea, Select, EmptyState)

**Files:**
- Create: `src/utils/cn.ts`
- Create: `src/components/ui/Button.tsx`, `Badge.tsx`, `Spinner.tsx`, `Skeleton.tsx`, `Avatar.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `EmptyState.tsx`, `index.ts`
- Test: `src/components/ui/Button.test.tsx`

**Interfaces:**
- Produces (exact props used by Tasks 7–10):
  - `cn(...classes: Array<string | number | null | false | undefined>): string`
  - `<Button variant?: "primary"|"secondary"|"outline"|"ghost"|"danger" size?: "sm"|"md"|"lg" loading?: boolean {...button attrs}>` (forwardRef)
  - `<Badge variant?: "default"|"primary"|"success"|"warning"|"danger">`
  - `<Spinner className?>` , `<Skeleton className?>`
  - `<Avatar src?: string|null name: string size?: "sm"|"md"|"lg">` — image or initials fallback
  - `<Input>`, `<Textarea>`, `<Select>` — forwardRef, native attrs + `error?: boolean`
  - `<EmptyState icon?: React.ReactNode title: string description?: string action?: React.ReactNode>`
- The legacy `src/components/Button.tsx` etc. are NOT touched.

- [ ] **Step 1: Create `src/utils/cn.ts`**

```ts
type ClassValue = string | number | null | false | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
```

- [ ] **Step 2: Write the failing Button test**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Button from "./Button";

describe("Button", () => {
  it("renders primary variant with token classes", () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole("button", { name: "Save" });
    expect(btn.className).toContain("bg-primary");
  });

  it("is disabled while loading and shows a spinner", () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="outline" size="lg">
        Go
      </Button>
    );
    const btn = screen.getByRole("button", { name: "Go" });
    expect(btn.className).toContain("border-border");
    expect(btn.className).toContain("h-12");
  });
});
```

Run: `npm test -- src/components/ui`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement Spinner then Button**

Create `src/components/ui/Spinner.tsx`:

```tsx
import { cn } from "@utils/cn";

export default function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-5 w-5 animate-spin text-current", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
```

Create `src/components/ui/Button.tsx`:

```tsx
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";
import Spinner from "./Spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
  secondary: "bg-accent text-accent-foreground hover:bg-accent/90",
  outline: "border border-border bg-transparent text-foreground hover:bg-foreground/5",
  ghost: "bg-transparent text-foreground hover:bg-foreground/5",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export default Button;
```

- [ ] **Step 4: Run Button test**

Run: `npm test -- src/components/ui`
Expected: 3 passed.

- [ ] **Step 5: Implement the remaining part-1 components**

Create `src/components/ui/Badge.tsx`:

```tsx
import { HTMLAttributes } from "react";
import { cn } from "@utils/cn";

type Variant = "default" | "primary" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  default: "bg-foreground/10 text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export default function Badge({
  variant = "default",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
```

Create `src/components/ui/Skeleton.tsx`:

```tsx
import { cn } from "@utils/cn";

export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-foreground/10", className)}
      aria-hidden="true"
    />
  );
}
```

Create `src/components/ui/Avatar.tsx`:

```tsx
import { useState } from "react";
import { cn } from "@utils/cn";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
};

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: Size;
  className?: string;
}

export default function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-semibold text-primary",
        sizeClasses[size],
        className
      )}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initials || "?"
      )}
    </span>
  );
}
```

Create `src/components/ui/Input.tsx`:

```tsx
import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
        "placeholder:text-muted",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export default Input;
```

Create `src/components/ui/Textarea.tsx`:

```tsx
import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-lg border bg-surface px-3 py-2 text-sm text-foreground",
        "placeholder:text-muted",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export default Textarea;
```

Create `src/components/ui/Select.tsx`:

```tsx
import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg border bg-surface px-3 text-sm text-foreground",
        "focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        error ? "border-danger" : "border-border",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export default Select;
```

Create `src/components/ui/EmptyState.tsx`:

```tsx
import { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center",
        className
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
```

Create `src/components/ui/index.ts` (partial — Task 7 extends it):

```ts
export { default as Avatar } from "./Avatar";
export { default as Badge } from "./Badge";
export { default as Button } from "./Button";
export { default as EmptyState } from "./EmptyState";
export { default as Input } from "./Input";
export { default as Select } from "./Select";
export { default as Skeleton } from "./Skeleton";
export { default as Spinner } from "./Spinner";
export { default as Textarea } from "./Textarea";
```

- [ ] **Step 6: Verify and commit**

Run: `npm test && npm run build`
Expected: all pass, build exits 0.

```bash
git add src/utils/cn.ts src/components/ui
git commit -m "feat: ui kit part 1 - button, inputs, badge, avatar, skeleton, empty state

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: ui kit part 2 (Card, Tabs, Dropdown, Modal, themed toasts)

**Files:**
- Create: `src/components/ui/Card.tsx`, `Tabs.tsx`, `Dropdown.tsx`, `Modal.tsx`, `ThemedToastContainer.tsx`
- Create: `src/hooks/useClickOutside.ts`
- Modify: `src/components/ui/index.ts` (add exports)
- Modify: `src/App.tsx` (swap ToastContainer)

**Interfaces:**
- Consumes: `cn`, `useTheme` (Task 3).
- Produces:
  - `<Card className?>` plus `<CardBody className?>` (named exports from Card.tsx)
  - `<Tabs items: {value: string; label: ReactNode}[] value: string onValueChange(v: string): void>`
  - `<Dropdown trigger: ReactNode align?: "left"|"right" children>` + `<DropdownItem onClick?|to?>` — click-outside + Escape close; `to` renders a react-router `Link`
  - `<Modal open: boolean onClose(): void title?: string children size?: "sm"|"md"|"lg">`
  - `<ThemedToastContainer />` — react-toastify container following the active theme
  - `useClickOutside(ref, handler)` hook

- [ ] **Step 1: Create `src/hooks/useClickOutside.ts`**

```ts
import { RefObject, useEffect } from "react";

export function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const el = ref.current;
      if (el && !el.contains(event.target as Node)) handler();
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [ref, handler]);
}
```

- [ ] **Step 2: Create `src/components/ui/Card.tsx`**

```tsx
import { HTMLAttributes } from "react";
import { cn } from "@utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4", className)} {...props} />;
}
```

- [ ] **Step 3: Create `src/components/ui/Tabs.tsx`**

```tsx
import { ReactNode } from "react";
import { cn } from "@utils/cn";

export interface TabItem {
  value: string;
  label: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export default function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-1 rounded-lg bg-foreground/5 p-1", className)}
    >
      {items.map((item) => (
        <button
          key={item.value}
          role="tab"
          aria-selected={item.value === value}
          onClick={() => onValueChange(item.value)}
          className={cn(
            "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            item.value === value
              ? "bg-surface text-foreground shadow-sm"
              : "text-muted hover:text-foreground"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create `src/components/ui/Dropdown.tsx`**

```tsx
import { ReactNode, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "@utils/cn";
import { useClickOutside } from "@hooks/useClickOutside";

export interface DropdownProps {
  trigger: ReactNode;
  align?: "left" | "right";
  children: ReactNode;
  className?: string;
}

export default function Dropdown({
  trigger,
  align = "left",
  children,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="flex items-center"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute z-50 mt-2 min-w-48 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  to?: string;
  className?: string;
}

export function DropdownItem({ children, onClick, to, className }: DropdownItemProps) {
  const classes = cn(
    "flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-foreground/5",
    className
  );
  if (to) {
    return (
      <Link to={to} className={classes} role="menuitem">
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={classes} role="menuitem">
      {children}
    </button>
  );
}
```

- [ ] **Step 5: Create `src/components/ui/Modal.tsx`**

```tsx
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@utils/cn";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, size = "md", children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "w-full rounded-xl border border-border bg-surface shadow-xl",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted hover:bg-foreground/5 hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 6: Create `src/components/ui/ThemedToastContainer.tsx` and wire into App**

```tsx
import { ToastContainer } from "react-toastify";
import { useTheme } from "../../theme/ThemeProvider";

export default function ThemedToastContainer() {
  const { theme } = useTheme();
  return (
    <ToastContainer
      position="top-right"
      theme={theme}
      toastClassName="!rounded-xl !font-sans"
    />
  );
}
```

In `src/App.tsx`: replace `<ToastContainer />` with `<ThemedToastContainer />` (import from `@components/ui/ThemedToastContainer`; keep the existing `react-toastify/dist/ReactToastify.css` import). `ThemedToastContainer` must be INSIDE `ThemeProvider` — it already is, since ThemeProvider wraps everything under ErrorBoundary.

- [ ] **Step 7: Extend `src/components/ui/index.ts`**

Add:

```ts
export { Card, CardBody } from "./Card";
export { default as Dropdown, DropdownItem } from "./Dropdown";
export { default as Modal } from "./Modal";
export { default as Tabs } from "./Tabs";
export { default as ThemedToastContainer } from "./ThemedToastContainer";
```

- [ ] **Step 8: Verify and commit**

Run: `npm test && npm run build` — green.

```bash
git add src/components/ui src/hooks/useClickOutside.ts src/App.tsx
git commit -m "feat: ui kit part 2 - card, tabs, dropdown, modal, themed toasts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Navbar rebuild

**Files:**
- Modify: `src/pages/Navbar/Navbar.tsx` (full rewrite, ~200 lines)
- Create: `src/pages/Navbar/components/LanguageSwitcher.tsx`, `ThemeToggle.tsx`, `RoleBadge.tsx`, `UserMenu.tsx`, `RealEstateMenu.tsx`, `AdminMenu.tsx`, `AgentMenu.tsx`, `MobileDrawer.tsx`
- Delete: `src/pages/Navbar/Navbar.css`
- Modify: `src/utils/locales/{en,rus,uz}.json` (add `theme_toggle_light`, `theme_toggle_dark` keys only if not present)

**Interfaces:**
- Consumes: `Dropdown`/`DropdownItem`, `Badge`, `Avatar`, `Button` (ui kit); `useTheme`; auth selectors from `@store/slices/authSlice` (same ones the current file imports: `selectRawUserInfo`, `selectUser`, `selectIsAuthenticated`, `selectUserRole`, `selectCanAccessAdmin`, `selectIsSuperAdmin`, `selectIsVerifiedAgent`, `selectIsAgent`, `selectCanCreateProperties`, `useLogoutUserMutation`, plus the logged-user query and `useAutoLogout` hook — copy the exact import block from the current file).
- Produces: `<Navbar />` with the same external contract as today (`chats?: Chat[]`, `liveUnreadCount?: number`, both optional). All routes preserved (see table).

**Route/visibility contract (from current `Navbar.tsx` — verify each against `git show HEAD:src/pages/Navbar/Navbar.tsx` before finishing):**

| Item | Route | Visible when |
|---|---|---|
| Products | `/products` | always |
| Services | `/service` | always |
| Real estate ▾: Properties / Map view / Agents | `/properties`, `/properties-map-view`, `/agents` | always |
| Real estate ▾: Become agent | `/become-agent` | authenticated, not agent, not pending agent |
| Real estate ▾: Application status | `/agent/status` | `userRole === "pending_agent"` |
| Real estate ▾: Saved properties | `/saved-properties` | authenticated |
| Admin ▾: Users / Pending agents / Verified agents | `/admin/users`, `/admin/pending-agents`, `/admin/verified-agents` | `canAccessAdmin` (Users additionally `isSuperAdmin` if the original gates it) |
| Agent ▾: Dashboard / Create property / My properties / Inquiries / Agent profile | `/agent/dashboard`, `/agent/create-property`, `/agent/properties`, `/agent/inquiries`, `/agent/profile` | `isVerifiedAgent` (Create property additionally `canCreateProperties`) |
| About | `/about` | always |
| Chat icon + unread badge | `/chat` | authenticated |
| User menu: My profile / My services / My products / Logout | `/myprofile`, `/my-services`, `/my-products` | authenticated with profile |
| Login button | `/login` | not authenticated |
| Logo | `/` | always |

- [ ] **Step 1: Create the leaf components**

`src/pages/Navbar/components/ThemeToggle.tsx`:

```tsx
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const label =
    theme === "dark" ? t("theme_toggle_light") : t("theme_toggle_dark");
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
```

`src/pages/Navbar/components/LanguageSwitcher.tsx`:

```tsx
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Dropdown, DropdownItem } from "@components/ui";
import { cn } from "@utils/cn";

const LANGUAGES = [
  { code: "uz", labelKey: "language_uz" },
  { code: "ru", labelKey: "language_ru" },
  { code: "en", labelKey: "language_en" },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  return (
    <Dropdown
      align="right"
      trigger={
        <span className="flex items-center gap-1 rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
          <Globe className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase">{i18n.language}</span>
        </span>
      }
    >
      {LANGUAGES.map((lang) => (
        <DropdownItem
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={cn(i18n.language === lang.code && "font-semibold text-primary")}
        >
          {t(lang.labelKey)}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
```

`src/pages/Navbar/components/RoleBadge.tsx` — port `getRoleBadge()` from the current Navbar (lines ~299–348): same role→label/icon mapping (`super_admin`, `staff`, `verified_agent`, `pending_agent`, `regular_user` translation keys), rendered as `<Badge variant="primary">…</Badge>` (use `variant="warning"` for pending). Copy the exact mapping — do not invent roles.

- [ ] **Step 2: Create the menu components**

Each of `RealEstateMenu.tsx`, `AdminMenu.tsx`, `AgentMenu.tsx` follows this pattern (RealEstateMenu shown; the others swap items/conditions per the route table):

```tsx
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Dropdown, DropdownItem } from "@components/ui";

// import the exact selectors used by the current Navbar for these conditions
import {
  selectIsAgent,
  selectIsAuthenticated,
  selectUserRole,
} from "@store/slices/authSlice";

export default function RealEstateMenu() {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAgent = useSelector(selectIsAgent);
  const userRole = useSelector(selectUserRole);
  const isPendingAgent = userRole === "pending_agent";

  return (
    <Dropdown
      trigger={
        <span className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground">
          {t("real_estate")}
          <ChevronDown className="h-4 w-4" />
        </span>
      }
    >
      <DropdownItem to="/properties">{t("properties")}</DropdownItem>
      <DropdownItem to="/properties-map-view">{t("map_view")}</DropdownItem>
      <DropdownItem to="/agents">{t("agents")}</DropdownItem>
      {isAuthenticated && !isAgent && !isPendingAgent && (
        <DropdownItem to="/become-agent">{t("become_agent")}</DropdownItem>
      )}
      {isPendingAgent && (
        <DropdownItem to="/agent/status">{t("application_status")}</DropdownItem>
      )}
      {isAuthenticated && (
        <DropdownItem to="/saved-properties">{t("saved_properties")}</DropdownItem>
      )}
    </Dropdown>
  );
}
```

**Translation keys:** reuse the exact keys the current Navbar uses for each item (find them at the line numbers in the route table via `git show HEAD:src/pages/Navbar/Navbar.tsx | sed -n '440,800p'`). Do NOT invent new keys for existing labels.

`UserMenu.tsx`: `Dropdown` (align right) triggered by `<Avatar>` + username; contains RoleBadge header row, then DropdownItems for `/myprofile`, `/my-services`, `/my-products`, and a logout item that ports `logoutHandler` from the current Navbar verbatim (logout mutation → `clearAllStorage()` → dispatch logout → navigate `/login` → toast, including the catch branch).

`MobileDrawer.tsx`: fixed inset overlay (`md:hidden`), slide-in panel `bg-surface` listing ALL nav items (flat list with section headings for real-estate/admin/agent groups, same visibility conditions), plus language + theme rows at the bottom. Props: `{ open: boolean; onClose(): void }`. Every link calls `onClose` on click (wrap `DropdownItem`-style Links or plain `<Link>` with the same classes).

- [ ] **Step 3: Rewrite `src/pages/Navbar/Navbar.tsx`**

Structure (complete the details from the pieces above; keep the existing data hooks — logged-user query, permissions query, unread computation — copied from the current file):

```tsx
// imports: React hooks, Link/useLocation, useTranslation, useSelector,
// ui kit, leaf components, existing selectors + queries (copy import block
// from current file), Logo component, MessageCircle/Menu/X icons from lucide-react

const Navbar: React.FC<NavbarProps> = ({ chats = [], liveUnreadCount }) => {
  // 1. keep: all useSelector calls, permissions query, logged-user query,
  //    unread computation (totalUnread / formattedCount), PermissionErrorNotification
  // 2. drop: all manual dropdown open/close state for desktop menus
  //    (ui Dropdown owns it) — keep only `mobileOpen` state
  // 3. render:
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between gap-4">
        {/* left: mobile hamburger (md:hidden) + Logo linking to / */}
        {/* center (hidden md:flex): Products, Services links styled like
            RealEstateMenu trigger with active state via useLocation;
            RealEstateMenu; AdminMenu (if canAccessAdmin); AgentMenu (if
            isVerifiedAgent); About */}
        {/* right: chat Link with MessageCircle icon + unread Badge
            (authenticated only); LanguageSwitcher; ThemeToggle;
            UserMenu (if showUserMenu) else Login Button (variant primary,
            size sm, to /login via useNavigate onClick) */}
      </nav>
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};
```

Active-link styling: `text-primary` when `location.pathname.startsWith(path)`, else `text-muted hover:text-foreground`.

Unread badge: absolute-positioned `<Badge variant="danger">` over the chat icon showing `formattedCount`, hidden when `totalUnread === 0` — same logic as current lines 156–162.

- [ ] **Step 4: Add theme-toggle locale keys**

Add to all three locale JSONs (skip any that already exist; check first with `grep -n "theme_toggle" src/utils/locales/*.json`):

- `en.json`: `"theme_toggle_dark": "Switch to dark mode"`, `"theme_toggle_light": "Switch to light mode"`
- `rus.json`: `"theme_toggle_dark": "Тёмная тема"`, `"theme_toggle_light": "Светлая тема"`
- `uz.json`: `"theme_toggle_dark": "Tungi rejimga o'tish"`, `"theme_toggle_light": "Kunduzgi rejimga o'tish"`

- [ ] **Step 5: Delete `Navbar.css`**

```bash
git rm src/pages/Navbar/Navbar.css
```

Remove its import from `Navbar.tsx` (gone in the rewrite anyway). Grep to confirm nothing else imports it: `grep -rn "Navbar.css" src` → no results.

- [ ] **Step 6: Verify against the original**

Run `git show HEAD:src/pages/Navbar/Navbar.tsx > /tmp/navbar-original.tsx` and diff your visibility conditions against the original's (lines per the route table). Fix any condition mismatches. Then:

Run: `npm test && npm run build` — green.
Run: `npm run dev` — verify desktop nav, every dropdown, mobile drawer, language switch (all 3), theme toggle (both directions), login state and logged-in state (log in with a test account), chat badge position, in BOTH themes.

- [ ] **Step 7: Commit**

```bash
git add src/pages/Navbar src/utils/locales/en.json src/utils/locales/rus.json src/utils/locales/uz.json
git commit -m "feat: rebuild navbar on design system with theme toggle and mobile drawer

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

(`git add src/pages/Navbar` picks up the `git rm` of Navbar.css too. Locale files ride along only if Step 4 changed them.)

---

### Task 9: Footer rebuild

**Files:**
- Modify: `src/pages/Footer/Footer.tsx` (full rewrite)
- Delete: `src/pages/Footer/Footer.css`
- Modify: `src/utils/locales/{en,rus,uz}.json` (add `footer.tagline`)

**Interfaces:**
- Consumes: token classes; existing translation keys `products_title`, `services_title`, `real_estate`, `about`, `support`, `download_mobile_app`.
- Produces: `<Footer />`, same default export.

- [ ] **Step 1: Add locale keys**

- `en.json`: `"footer": { "tagline": "Buy and sell anything, anywhere near you." }`
- `rus.json`: `"footer": { "tagline": "Покупайте и продавайте что угодно рядом с вами." }`
- `uz.json`: `"footer": { "tagline": "Yaqin atrofingizda istalgan narsani sotib oling va soting." }`

(If a top-level `footer` object already exists in a file, add the `tagline` key inside it.)

- [ ] **Step 2: Rewrite `Footer.tsx`**

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import QRCode from "react-qr-code";
import { Link } from "react-router-dom";

const NAV_LINKS = [
  { to: "/products", key: "products_title" },
  { to: "/service", key: "services_title" },
  { to: "/properties", key: "real_estate" },
  { to: "/about", key: "about" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://facebook.com", Icon: FaFacebookF, label: "Facebook" },
  { href: "https://twitter.com", Icon: FaTwitter, label: "Twitter" },
  { href: "https://instagram.com", Icon: FaInstagram, label: "Instagram" },
  { href: "https://linkedin.com", Icon: FaLinkedinIn, label: "LinkedIn" },
] as const;

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="container grid gap-10 py-12 md:grid-cols-3">
        <div className="space-y-4">
          <p className="text-lg font-bold text-foreground">Tezsell</p>
          <p className="max-w-xs text-sm text-muted">{t("footer.tagline")}</p>
          <div className="flex gap-3">
            {SOCIAL_LINKS.map(({ href, Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <nav className="grid grid-cols-2 content-start gap-3 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-muted transition-colors hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
          <a
            href="https://t.me/tezsell_menejer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-foreground"
          >
            {t("support")}
          </a>
        </nav>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="rounded-xl border border-border bg-white p-2">
            <QRCode value="https://www.webtezsell.com/download" size={96} />
          </div>
          <p className="text-sm font-medium text-foreground">
            {t("download_mobile_app")}
          </p>
          <div className="flex gap-3">
            <a
              href="https://apps.apple.com/kr/app/tezsell/id6755512731?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="App Store"
              className="text-muted transition-colors hover:text-foreground"
            >
              <FaApple className="h-7 w-7" />
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=uz.tezsell.app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Play"
              className="text-muted transition-colors hover:text-foreground"
            >
              <FaGooglePlay className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4">
        <p className="container text-xs text-muted">
          © {new Date().getFullYear()} Tezsell. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
```

(QR sits on a white card in both themes — QR codes need light backgrounds to scan.)

- [ ] **Step 3: Delete Footer.css and verify no importers**

```bash
git rm src/pages/Footer/Footer.css
grep -rn "Footer.css" src
```

Expected: no grep results.

- [ ] **Step 4: Verify**

Run: `npm test && npm run build` — green (parity test guards the new keys).
`npm run dev`: footer correct in both themes, responsive at 375px and 1280px.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Footer src/utils/locales/en.json src/utils/locales/rus.json src/utils/locales/uz.json
git commit -m "feat: rebuild footer on design system

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Home redesign (hero, category tiles, fresh listings)

**Files:**
- Modify: `src/pages/Home/Home.tsx` (full rewrite)
- Delete: `src/pages/Home/Home.css`
- Modify: `src/utils/locales/{en,rus,uz}.json` (add `home.*` keys)

**Interfaces:**
- Consumes: `useGetCategoryListQuery()`, `useGetProductsQuery({ currentPage, page_size })` from `@store/slices/productsApiSlice`; `Category` (`name_uz/name_ru/name_en`, `icon`) and `Product`/`ProductResponse` types from `@store/type`; `useFormat` (Task 4); `Card`, `Skeleton`, `Button`, `EmptyState` (ui kit).
- Produces: `<Home />` default export; route `/` unchanged.

- [ ] **Step 1: Add locale keys**

Add a top-level `home` object to each locale file:

`en.json`:

```json
"home": {
  "heroTitle": "Buy and sell anything near you",
  "heroSubtitle": "Tezsell is your local marketplace for products, services and real estate — fast, simple and free.",
  "startSelling": "Start selling",
  "browseAll": "Browse listings",
  "categoriesTitle": "Explore categories",
  "freshTitle": "Fresh listings",
  "viewAll": "View all",
  "emptyListings": "No listings yet — be the first to post!"
}
```

`rus.json`:

```json
"home": {
  "heroTitle": "Покупайте и продавайте рядом с вами",
  "heroSubtitle": "Tezsell — ваш местный маркетплейс товаров, услуг и недвижимости. Быстро, просто и бесплатно.",
  "startSelling": "Начать продавать",
  "browseAll": "Смотреть объявления",
  "categoriesTitle": "Категории",
  "freshTitle": "Свежие объявления",
  "viewAll": "Смотреть все",
  "emptyListings": "Объявлений пока нет — станьте первым!"
}
```

`uz.json`:

```json
"home": {
  "heroTitle": "Yaqin atrofda oling va soting",
  "heroSubtitle": "Tezsell — mahsulotlar, xizmatlar va ko'chmas mulk uchun mahalliy bozoringiz. Tez, oson va bepul.",
  "startSelling": "Sotishni boshlash",
  "browseAll": "E'lonlarni ko'rish",
  "categoriesTitle": "Kategoriyalar",
  "freshTitle": "Yangi e'lonlar",
  "viewAll": "Barchasini ko'rish",
  "emptyListings": "Hozircha e'lonlar yo'q — birinchi bo'ling!"
}
```

- [ ] **Step 2: Rewrite `Home.tsx`**

```tsx
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button, Card, EmptyState, Skeleton } from "@components/ui";
import { useFormat } from "@utils/intl";
import {
  useGetCategoryListQuery,
  useGetProductsQuery,
} from "@store/slices/productsApiSlice";
import type { Category, Product, ProductResponse } from "@store/type";

function categoryName(category: Category, lang: string): string {
  if (lang.startsWith("ru")) return category.name_ru;
  if (lang.startsWith("uz")) return category.name_uz;
  return category.name_en;
}

const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const format = useFormat();

  const { data: categories, isLoading: categoriesLoading } =
    useGetCategoryListQuery({});
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery({ currentPage: 1, page_size: 8 });

  const products: Product[] = (productsData as ProductResponse)?.results ?? [];
  const categoryList: Category[] = Array.isArray(categories)
    ? (categories as Category[]).slice(0, 12)
    : [];

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container flex flex-col items-center gap-6 py-16 text-center md:py-24">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground md:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="max-w-2xl text-lg text-muted">{t("home.heroSubtitle")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate("/new-product")}>
              {t("home.startSelling")}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/products")}>
              {t("home.browseAll")}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-12">
        <h2 className="mb-6 text-2xl font-bold text-foreground">
          {t("home.categoriesTitle")}
        </h2>
        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {categoryList.map((category) => (
              <Link
                key={category.id}
                to="/products"
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-4 text-center transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="text-2xl" aria-hidden="true">
                  {category.icon}
                </span>
                <span className="text-xs font-medium text-foreground">
                  {categoryName(category, i18n.language)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Fresh listings */}
      <section className="container pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            {t("home.freshTitle")}
          </h2>
          <Link
            to="/products"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("home.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title={t("home.emptyListings")}
            action={
              <Button onClick={() => navigate("/new-product")}>
                {t("home.startSelling")}
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                  <div className="aspect-square bg-foreground/5">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0].image}
                        alt={product.images[0].alt_text ?? product.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-1 p-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {product.title}
                    </p>
                    <p className="text-base font-bold text-foreground">
                      {format.currency(product.price, product.currency || "UZS")}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {product.location?.district?.district ??
                        product.location?.region?.region ??
                        ""}{" "}
                      · {format.relative(product.created_at)}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
```

Before finishing, check the actual `UserLocation` shape in `src/store/type.ts` and fix the location line to use its real fields (the `district`/`region` property names above are a guess — verify).

- [ ] **Step 3: Delete `Home.css`, check importers**

```bash
git rm src/pages/Home/Home.css
grep -rn "Home.css" src
```

Expected: no grep results (if `Home.tsx` imported it, the rewrite already dropped the import).

- [ ] **Step 4: Verify**

Run: `npm test && npm run build` — green.
`npm run dev`: home shows hero, real categories with icons, real products with Intl-formatted prices; both themes; 375px and 1280px widths; skeletons appear on slow network (DevTools throttling).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Home/Home.tsx src/utils/locales/en.json src/utils/locales/rus.json src/utils/locales/uz.json
git add -u src/pages/Home
git commit -m "feat: redesign home with hero, category tiles and fresh listings

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 11: index.html internationalization

**Files:**
- Modify: `index.html`

**Interfaces:** none (static document metadata).

- [ ] **Step 1: Replace the Uzbek-only metadata**

In `index.html` (lang attr already `en` from Task 5):

1. `<title>` → `Tezsell — Buy & Sell Locally | Marketplace for Products, Services & Real Estate`
2. `meta name="title"` → same as title.
3. `meta name="description"` → `Tezsell is a local marketplace to buy and sell products, services and real estate. Post a listing in seconds, chat with buyers and sellers, and find deals near you.`
4. `meta name="keywords"` → `marketplace, buy and sell, classifieds, products, services, real estate, Tezsell`
5. `meta name="language"` → `English`
6. Delete these region-lock lines entirely: `geo.region`, `geo.country`, `geo.placename`, `geo.position`, `ICBM`, `distribution`, `coverage`.
7. Open Graph: `og:title` / `og:description` → English equivalents of 1/3; `og:locale` → `en_US`; `og:locale:alternate` → `uz_UZ` and `ru_RU`.
8. Twitter card title/description → same English strings.
9. Structured data JSON-LD: `description` → `Local marketplace for products, services and real estate`; remove the `address` block.
10. Keep hreflang alternates, favicons, preconnects, manifest, noscript block (it's already trilingual) unchanged.

- [ ] **Step 2: Verify and commit**

Run: `npm run build` — exits 0. View source in `npm run dev` — no Uzbek-only or geo-locked meta remains.

```bash
git add index.html
git commit -m "feat: internationalize document metadata

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 12: Final verification pass

**Files:** none created; fixes only if regressions found.

- [ ] **Step 1: Full test + build**

Run: `npm test` → all suites pass. Run: `npm run build` → exits 0.

- [ ] **Step 2: Manual sweep (use the verify/run skill if executing interactively)**

With `npm run dev`, in BOTH themes and at 375px + 1280px:

1. Home: hero, categories, listings render; prices Intl-formatted.
2. Navbar: all dropdowns, language switch en/ru/uz (whole shell re-translates), theme toggle persists across reload without flash.
3. Footer renders, QR scannable (white card).
4. Legacy spot-check — these pages must be functionally unchanged: `/products`, `/product/:id` (pick one), `/login`, `/properties`, `/myprofile` (logged in). Cosmetic differences limited to: page background `#f8fafc`, Inter headings.
5. Logged-out and logged-in navbar states.

- [ ] **Step 3: Fix anything found, re-run, commit fixes individually**

Each fix: smallest change, staged file-by-file, conventional commit message.

- [ ] **Step 4: Report**

Summarize: tests passing count, build status, pages verified, any deviations from this plan (there should be none without a note explaining why).

---

## Self-review notes (already applied)

- Spec coverage: tokens ✔ (T2), theming ✔ (T3), component kit ✔ (T6–7), intl utils ✔ (T4), English default ✔ (T5), key-parity ✔ (T5), navbar/footer/home ✔ (T8–10), international copy/meta ✔ (T10–11), coexistence rules ✔ (global constraints + T12 spot-checks), Vitest infra ✔ (T1).
- Spec deviation (intentional): the spec says legacy primitives are "replaced" in Phase 1; five unmigrated pages still import them, so deletion moves to Phase 2 per the spec's own coexistence rule. The new kit fully supersedes them for all new code.
- Phone formatting is display-only grouping (no libphonenumber) — YAGNI until a real input mask is needed in Phase 2 forms.
