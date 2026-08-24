/**
 * Equipamento do Arma 3 — uniformes, coletes, capacetes, mochilas, óculos.
 *
 * ⚠️ ARQUIVO GERADO. `A3EQP` é o **núcleo** embutido (241); o catálogo completo
 * (987) vem de `carregarEquipamento()`, sob demanda.
 *
 * ── `protecao.passagem` é o campo que muda a leitura ────────────────────────
 * É o `passThrough`: a fração do dano que atravessa a placa MESMO no ponto
 * coberto. Publicar só "proteção 25" sugeriria imunidade; o par (proteção,
 * passagem) é o que descreve a peça. Nulo quando o config não declara.
 */

/** Proteção por parte do corpo. `maior` é a absoluta; `cobertas` de `partes`. */
export interface A3EqpProtecao {
  readonly partes: number;
  readonly cobertas: number;
  readonly maior: number | null;
  readonly maiorParte: string | null;
  /** `passThrough`: fração do dano que atravessa a placa. */
  readonly passagem: number | null;
}

export interface A3Equipamento {
  readonly id: string;
  readonly classe: string;
  readonly nome: string;
  /** `uniforme`, `colete`, `capacete`, `cabeca`, `mochila`, `oculos`. */
  readonly tipo: string;
  readonly tipoFonte: string;
  readonly dlc: string;
  readonly dlcFonte: string;
  readonly massa: number;
  readonly capacidade: number | null;
  readonly containerClass: string | null;
  /** De qual soldado o uniforme é, quando é uniforme. */
  readonly uniformeDe: string | null;
  readonly protecao: A3EqpProtecao | null;
  readonly imagem: string;
  /** Quantas classes do config têm os mesmos números. */
  readonly variantes: number;
  readonly nomes: readonly string[];
  readonly classes: readonly string[];
}

export interface A3EqpCategoria {
  readonly id: string;
  readonly icon: string;
  readonly nome: string;
  readonly desc: string;
}

export interface A3EqpMeta {
  readonly porTipo: Readonly<Record<string, number | undefined>>;
  readonly comProtecao: number;
  readonly dbUrl: string;
}

/** A base remota, como o JSON a entrega — o envelope, não o array. */
export interface A3EqpBase {
  readonly equipamento: readonly A3Equipamento[];
}

export const A3EQP: readonly A3Equipamento[];
export const A3EQP_CATEGORIAS: readonly A3EqpCategoria[];
export const A3EQP_META: A3EqpMeta;
export const A3EQP_NUCLEO: number;
export const A3EQP_TOTAL: number;

/** Catálogo completo sob demanda. Devolve o envelope; ver `A3EqpBase`. */
export function carregarEquipamento(): Promise<A3EqpBase>;
