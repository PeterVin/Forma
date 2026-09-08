export type ColorMode = "light" | "dark";

export interface SemanticColors {
  background: string;
  surface: string;
  text: string;
  mutedText: string;
  primary: string;
  primaryContrast: string;
  border: string;
}

export interface ThemeDefinition {
  schemaVersion: 1;
  name: string;
  colors: Record<ColorMode, SemanticColors>;
}

export const defaultTheme: ThemeDefinition = {
  schemaVersion: 1,
  name: "Foundation",
  colors: {
    light: {
      background: "#F4F6FB",
      surface: "#FFFFFF",
      text: "#172033",
      mutedText: "#667085",
      primary: "#6D5DFB",
      primaryContrast: "#FFFFFF",
      border: "#D8DEEA",
    },
    dark: {
      background: "#10131A",
      surface: "#191E29",
      text: "#EEF1F8",
      mutedText: "#AEB7C9",
      primary: "#9997FF",
      primaryContrast: "#17152F",
      border: "#394254",
    },
  },
};

export function colorVariables(colors: SemanticColors): Record<string, string> {
  return {
    "--background": colors.background,
    "--surface": colors.surface,
    "--text": colors.text,
    "--muted-text": colors.mutedText,
    "--primary": colors.primary,
    "--primary-contrast": colors.primaryContrast,
    "--border": colors.border,
  };
}
