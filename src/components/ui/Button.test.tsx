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
