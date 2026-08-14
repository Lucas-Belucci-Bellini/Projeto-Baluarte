export type RunnerKind = 'js' | 'html' | 'css' | 'markdown' | null;

export interface LanguageDefinition {
  readonly id: string;
  readonly name: string;
  readonly ext: string;
  readonly icon: string;
  readonly runner: RunnerKind;
  readonly keywords?: string;
  readonly lineComment?: string;
  readonly blockComment?: readonly [string, string];
  readonly stringDelimiters?: readonly string[];
  readonly isMarkup?: boolean;
  readonly isCss?: boolean;
  readonly isMarkdown?: boolean;
  readonly caseInsensitive?: boolean;
}

export const LANGS: readonly LanguageDefinition[];
export function getLang(id: string): LanguageDefinition;
export function langForExt(ext: string): LanguageDefinition;
