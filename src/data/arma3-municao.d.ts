/**
 * Munição e carregadores do Arma 3, medidos no config.
 *
 * ⚠️ ARQUIVO GERADO (`scripts/arma3/`). Declaração e não conversão: converter
 * obrigaria o gerador a emitir TypeScript, para dado que é catálogo puro.
 *
 * Duas bases num arquivo só porque saem do mesmo dump: `A3MAG` são os
 * **carregadores** (o que entra na arma) e `A3MUN` são os **projéteis** (o que
 * sai dela). O elo é `A3MAG.municao`, que casa com `A3MUN.classe`.
 */

/** Um carregador. `origem` é a DLC/mod, `null` quando o config não declara. */
export interface A3Carregador {
  readonly id: string;
  readonly classe: string;
  readonly nome: string;
  /** Classe do projétil — casa com `A3Municao.classe`. */
  readonly municao: string;
  readonly capacidade: number;
  /** Velocidade de saída (m/s). */
  readonly v0: number;
  readonly massa: number;
  readonly origem: string | null;
  readonly tracante: boolean;
}

/**
 * Um projétil.
 *
 * `airFriction` aqui segue a convenção do engine: **negativo é arrasto**.
 * `visibleFire`/`audibleFire` são a assinatura do disparo — o quanto a IA vê e
 * ouve —, e é por isso que munição subsônica tem número próprio em vez de ser
 * deduzida da velocidade.
 */
export interface A3Municao {
  readonly id: string;
  readonly classe: string;
  readonly dano: number;
  readonly danoIndireto: number;
  readonly raioIndireto: number;
  readonly penetracao: number;
  readonly airFriction: number;
  readonly velTipica: number;
  readonly explosivo: boolean;
  readonly ricochete: boolean;
  readonly visibleFire: number;
  readonly audibleFire: number;
  readonly subsonico: boolean;
}

export const A3MAG: readonly A3Carregador[];
export const A3MAG_TOTAL: number;
export const A3MUN: readonly A3Municao[];

/** Indexado pelo `classe` do projétil — chave desconhecida devolve `undefined`. */
export const A3MUN_POR_CLASSE: Readonly<Record<string, A3Municao | undefined>>;

export const A3MUN_TOTAL: number;
