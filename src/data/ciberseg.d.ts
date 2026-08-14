export type CyberSeverity = 'crítico' | 'alto' | 'médio' | 'baixo' | 'info';

export interface CyberCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly color: string;
}

export interface CyberEntry {
  readonly id: string;
  readonly cat: string;
  readonly title: string;
  readonly severity: CyberSeverity;
  readonly summary: string;
  readonly tools?: readonly string[];
  readonly counter?: string;
}

export const CATEGORIES_CS: readonly CyberCategory[];
export const ENTRIES_CS: readonly CyberEntry[];
export const TOTAL_CS: number;
