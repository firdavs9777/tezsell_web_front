# Tezsell Web — Modern International Upgrade

**Date:** 2026-07-19
**Status:** Approved design (Phase 1 spec; Phases 2–5 roadmap)
**Approach:** A — token-first incremental refactor on the existing React + Vite stack

## Goal

Upgrade the Tezsell web frontend to a modern, international-ready product: a clean
international-marketplace design (light + dark), English as the default language, no
hardcoded Uzbekistan assumptions in code, and adoption of the backend capabilities the
web currently doesn't consume. The platform still operates in one market for now; the
code becomes country-agnostic ("international-ready", not multi-country operation).

## Context (current state)

- React 18 + TypeScript + Vite 6, Redux Toolkit + RTK Query, react-router v7,
  i18next (en/ru/uz, default **uz**), socket.io, leaflet.
- Tailwind 3.4 installed but **empty theme** — no design tokens. ~16 ad-hoc
  per-component CSS files coexist with utility classes. No dark mode. Partial
  responsiveness.
- Uzbekistan hardcoding is pervasive: `so'm`/UZS ternaries, `+998` placeholders,
  Tashkent-centered map defaults, hardcoded region lists, "everything in Uzbekistan"
  marketing copy.
- Very large page files (Navbar 1,153 lines; PropertyDetail 1,340; MainProfile 935).
- Uncommitted in-flight work: Google sign-in, Telegram-style chat overhaul
  (MessageBubble/ReplyPreview/TypingIndicator/DateSeparator), product currency/share
  polish, +54 locale keys. **Decision: folded into the upgrade** (absorbed and
  committed with the phases that touch those files), not committed separately first.
- Backend (Django) has moved far ahead: community app (feed/posts/comments/likes),
  chat translation/pin/forward/quick-replies/mute-archive/reserve-sold/presence,
  phase-1 maps (verified neighborhoods, place fields, geo-radius filters), plus
  `favorites`, `notifications`, `reviews`, `moderation` apps the web never wired up.

## Decisions (from brainstorm)

| Question | Decision |
|---|---|
| Meaning of "international" | Modern + international-ready design; one market operationally |
| Coverage | Core marketplace first; real-estate/agent/admin restyle deferred |
| Visual direction | Clean international marketplace (light, airy, content-first, one accent) |
| Default language | English default + fallback; uz/ru fully kept; browser detection stays |
| Dark mode | Yes — light + dark from day one, system preference + manual toggle |
| Backend adoption | All four: chat parity, community feed, favorites + notifications, geo search |
| In-flight uncommitted work | Folded into the upgrade, absorbed per phase |
| Build approach | A: token-first incremental refactor (no parallel rebuild, no reskin) |

## Program roadmap

This upgrade is a program of five sequenced sub-projects. **This document is the full
spec for Phase 1 only**; each later phase gets its own brainstorm → spec → plan cycle.

1. **Phase 1 — Foundation** (this spec): design tokens, light/dark theming, `ui/`
   component kit, intl utilities, English default, rebuilt navbar/footer/home.
2. **Phase 2 — Core marketplace:** products/services listing + detail + create/edit,
   auth pages, profile migrated to the new system (legacy CSS deleted per page).
   Wires in favorites on listings and geo-radius search using backend phase-1 place
   fields. Absorbs in-flight Google sign-in and product-polish changes.
3. **Phase 3 — Chat parity:** absorbs the in-flight chat overhaul; adds per-message
   translation, pin/forward, quick replies, room mute/archive/pin, reserve/sold
   transaction actions, start-chat-from-listing.
4. **Phase 4 — Community feed:** new page group — neighborhood posts, comments, likes.
5. **Phase 5 — Notifications:** in-app notifications bell + list.

**Explicitly out of scope:** real-estate/agent/admin restyle (keeps working as-is),
Apple sign-in UI, reviews and moderation apps, true multi-country operation.

## Phase 1 — Foundation design

### Design tokens

- `src/index.css` defines CSS variables for both themes; `tailwind.config.ts` maps
  them into the Tailwind theme (no more empty `extend`).
- Semantic color tokens only: `background`, `surface`, `foreground`, `muted`,
  `primary`, `accent`, `success`, `warning`, `danger`, `border`. Components never use
  raw hex.
- Type scale on Inter (Poppins dropped); spacing, radius, and shadow scales defined.
- Variables are namespaced to avoid collisions with legacy CSS class names.

### Theming

- `darkMode: "class"` in Tailwind. A `ThemeProvider` sets the `dark` class on
  `<html>` from localStorage, defaulting to `prefers-color-scheme`; manual toggle in
  the navbar.
- No flash-of-wrong-theme: a tiny inline script in `index.html` applies the class
  before React mounts. Invalid/absent stored value falls back to system preference.

### Component kit — `src/components/ui/`

Button, Input, Select, Textarea, Card, Badge, Modal/Sheet, Avatar, Skeleton, Tabs,
Dropdown, Toast (restyled react-toastify), EmptyState, Spinner. Tailwind + CVA-style
variants. Replaces the existing primitives in `src/components/` (their paired CSS
files are deleted). No new UI dependency unless a hard case appears — then a headless
library (Radix), never a styled kit.

### Intl utilities — `src/utils/intl/`

- `formatCurrency(amount, code)` via `Intl.NumberFormat`; falls back to `amount CODE`
  for unknown currencies rather than throwing. Replaces every `so'm`/UZS ternary.
- `formatDate` / `formatRelative`: locale-aware via `Intl.DateTimeFormat`.
- `formatPhone` + country-code-aware phone input: no `+998` literals in components.
- i18n default and fallback flip from `uz` to `en`; browser-language detection stays;
  `uz` and `ru` remain complete (enforced by key-parity test).

### App shell

- **Navbar:** the 1,153-line component is rebuilt as composed components on the new
  system — logo, search, language switcher, theme toggle, auth menu — responsive with
  a proper mobile drawer.
- **Footer:** restyled on tokens.
- **Home:** restyled to the clean-marketplace direction — hero, category tiles,
  fresh-listings grid. "Your marketplace for everything in Uzbekistan" copy replaced
  with international messaging (new keys in all three locales).

### Coexistence rules (safety during incremental migration)

- Legacy `.css` files are deleted only in the phase that migrates their page.
- The global reset in `index.css` must not reflow unmigrated pages; key legacy pages
  are visually checked after the foundation lands.
- Phase 1 does not touch component files carrying in-flight work (chat, Login,
  product pages). Exception: the locale JSONs also hold in-flight keys — Phase 1 only
  **adds** keys there (never edits or removes existing ones), so both change sets
  coexist and land together when each phase commits.

### Error handling

- Unknown currency → raw-code fallback, never a crash.
- Missing translation key → English fallback (i18next `fallbackLng`).
- Theme storage corrupt/absent → system preference.

### Testing & verification

- Repo has no test infra today; Phase 1 adds **Vitest + Testing Library**, scoped to
  logic: intl utilities across en/ru/uz, ThemeProvider behavior, and a locale
  key-parity test (en/ru/uz key sets must match).
- Hard gate: `tsc -b && vite build` passes.
- Manual verification: app run in light and dark, mobile and desktop widths; key
  unmigrated legacy pages spot-checked for regressions.

## Phase 1 component boundaries

| Unit | Purpose | Consumers depend on |
|---|---|---|
| Token layer (`index.css` + Tailwind theme) | Single source of visual truth | Semantic class names only |
| `ThemeProvider` | Owns theme state + persistence | `useTheme()` hook |
| `ui/` kit | Reusable styled primitives | Props API; no page imports raw tokens |
| `utils/intl/` | All locale-sensitive formatting | Pure functions; no component state |
| App shell (Navbar/Footer/Home) | First consumer proving the system | Routes unchanged |
