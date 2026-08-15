export type ModpackTier = 'S' | 'A' | 'B' | 'C';
export interface ModCategory { readonly id: string; readonly label: string; readonly color: string; readonly icon?: string; }
export interface ModEntry { readonly name: string; readonly cat: string; readonly tier: ModpackTier; readonly author: string; readonly desc: string; }
export const MOD_CATEGORIES: readonly ModCategory[];
export const MODS: readonly ModEntry[];
export const TOTAL_MODS: number;
export function modsByCategory(catId: string): readonly ModEntry[];
