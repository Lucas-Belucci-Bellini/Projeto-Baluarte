/**
 * Soldados do Arma 3 — a carga de cada classe de unidade, medida no config.
 *
 * ⚠️ ARQUIVO GERADO. `A3SOL` é o **núcleo** embutido (940); o catálogo completo
 * (44.761) vem de `carregarSoldados()`, sob demanda.
 *
 * ── O `lado` é o campo mais mal interpretado deste arquivo ──────────────────
 * `sideCru` é o número literal do config, e **83 das 237 facções usam `7`**
 * (`sideUnknown`). Por isso `lado` existe junto de `ladoFonte`: a tela precisa
 * poder dizer "a facção não declara" em vez de chutar BLUFOR porque o soldado
 * "parece" ocidental. Os 40.430 sem lado declarado no `A3SOL_META.porLado` são
 * a medida disso, não um defeito da extração.
 */

export interface A3Soldado {
  readonly id: string;
  readonly classe: string;
  readonly nome: string;
  readonly faccao: string;
  readonly faccaoClasse: string;
  /** Rótulo legível. Vem de `sideCru`, e pode ser "não declarado". */
  readonly lado: string;
  readonly ladoFonte: string;
  /** O número literal do config. `7` é `sideUnknown`. */
  readonly sideCru: number;
  readonly dlc: string;
  readonly dlcFonte: string;
  readonly uniforme: string | null;
  readonly mochila: string | null;
  readonly armas: readonly string[] | null;
  readonly nArmas: number | null;
  readonly nGranadas: number | null;
  readonly nCarregadores: number | null;
  readonly nItens: number | null;
  readonly preview: string | null;
}

export interface A3SolMeta {
  readonly porLado: Readonly<Record<string, number | undefined>>;
  readonly comLado: number;
  readonly faccoes: number;
  readonly dbUrl: string;
}

/** A base remota, como o JSON a entrega — o envelope, não o array. */
export interface A3SolBase {
  readonly soldados: readonly A3Soldado[];
  readonly faccoes: Readonly<Record<string, unknown>>;
}

export const A3SOL: readonly A3Soldado[];
/**
 * Quantas classes do config foram agrupadas por carga idêntica.
 *
 * É um NÚMERO, não uma lista: o gerador colapsa variantes que carregam a mesma
 * coisa e guarda só a contagem.
 */
export const A3SOL_COLAPSADOS: number;
export const A3SOL_META: A3SolMeta;
export const A3SOL_NUCLEO: number;
export const A3SOL_TOTAL: number;

/** Catálogo completo sob demanda. Devolve o envelope; ver `A3SolBase`. */
export function carregarSoldados(): Promise<A3SolBase>;
