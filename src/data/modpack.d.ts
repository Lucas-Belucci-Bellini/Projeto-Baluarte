export type ModpackTier = 'S' | 'A' | 'B' | 'C';
export interface ModCategory { readonly id: string; readonly label: string; readonly color: string; readonly icon?: string; }
export interface ModEntry { readonly name: string; readonly cat: string; readonly tier: ModpackTier; readonly author: string; readonly desc: string; }
export const MOD_CATEGORIES: readonly ModCategory[];
export const MODS: readonly ModEntry[];
export const TOTAL_MODS: number;
export interface PcPart { readonly type: string; readonly value: string; }
export interface PcPreset { readonly id: string; readonly name: string; readonly icon: string; readonly color: string; readonly purpose: string; readonly parts: readonly PcPart[]; readonly tip: string; }
export const PC_PRESETS: readonly PcPreset[];
export function modsByCategory(catId: string): readonly ModEntry[];
