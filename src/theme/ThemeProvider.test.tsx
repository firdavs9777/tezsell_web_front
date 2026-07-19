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
