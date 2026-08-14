export interface SymbolCategory {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly items: readonly string[];
}

export interface SymbolEntry {
  readonly char: string;
  readonly catId: string;
}

export const SYMBOL_CATEGORIES: readonly SymbolCategory[];
export function describe(char: string): string;
export function getAllSymbols(): SymbolEntry[];
export function countTotal(): number;
