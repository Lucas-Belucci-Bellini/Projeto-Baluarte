export interface Arma3Mod { readonly nome: string; readonly url: string; }
export interface Arma3Dlc { readonly nome: string; readonly tipo: string; readonly ano: number | string; }
export interface Arma3Preset { readonly nome: string; readonly arquivo: string; readonly mods: readonly Arma3Mod[]; readonly dlcs: readonly Arma3Dlc[]; }
export const ARMA3_PRESETS: readonly Arma3Preset[];
export const ARMA3_TOTAL_MODS: number;
