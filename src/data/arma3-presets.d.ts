export interface Arma3Mod { readonly nome: string; readonly url: string; }
export interface Arma3Dlc { readonly nome: string; readonly tipo: string; readonly ano: number | string; }
export interface Arma3Preset {
  /**
   * Identificador estável do preset (`alfa`, `projeto-baluarte-vercel-app`…).
   *
   * É por ele que a `/arma3-tutorial` acha o preset oficial. Faltava nesta
   * declaração enquanto existia no dado — para o TypeScript, `p.id` não existia.
   */
  readonly id: string;
  readonly nome: string;
  readonly arquivo: string;
  readonly mods: readonly Arma3Mod[];
  readonly dlcs: readonly Arma3Dlc[];
}
export const ARMA3_PRESETS: readonly Arma3Preset[];
export const ARMA3_TOTAL_MODS: number;
