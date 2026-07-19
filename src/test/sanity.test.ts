import { describe, expect, it } from "vitest";

describe("test infrastructure", () => {
  it("runs with jsdom", () => {
    const el = document.createElement("div");
    el.textContent = "ok";
    expect(el).toHaveTextContent("ok");
  });
});
