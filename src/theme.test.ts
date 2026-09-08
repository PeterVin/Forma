import { describe, expect, it } from "vitest";

import { colorVariables, defaultTheme } from "./theme";

describe("theme foundation", () => {
  it("defines matching semantic keys for both modes", () => {
    expect(Object.keys(defaultTheme.colors.light)).toEqual(
      Object.keys(defaultTheme.colors.dark),
    );
  });

  it("maps semantic colors to CSS variables", () => {
    expect(colorVariables(defaultTheme.colors.light)["--primary"]).toBe(
      "#6D5DFB",
    );
  });
});
