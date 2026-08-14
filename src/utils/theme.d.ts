export interface ThemeDefinition {
  id: string;
  primary: string;
  secondary: string;
}

export const THEMES: readonly ThemeDefinition[];
export function getThemeId(): string;
export function setTheme(id: string): void;
