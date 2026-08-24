/**
 * Grade LOCAL estilo Arma 3 — o "grid de 6 a 8 dígitos".
 *
 * O grid do Arma **é** um MGRS sobre um quadro local: mesmas regras de leitura,
 * origem no canto sudoeste do mapa em vez do quadrado de 100 km do planeta.
 *
 * ⚠️ Esta é a convenção **MGRS** (northing para cima). Para ler a grade na
 * carta do Arma 3, o módulo certo é `arma3-grid.js`, que respeita o sinal do
 * passo de cada mundo — 30 dos 31 contam o northing de cima para baixo.
 */

import type { LatLon } from './mgrs.js';

/** Um ponto na grade local, em metros a partir do canto sudoeste. */
export interface PontoLocal {
  readonly x: number;
  readonly y: number;
  readonly alt?: number;
}

/**
 * Um terreno conhecido do catálogo local.
 *
 * ⚠️ `ancora` é **aproximada e opcional** — os mapas do Arma são inspirados em
 * lugares reais, não são levantamentos deles. Serve para posicionar o terreno
 * num mapa-múndi de referência, **nunca** para navegação real.
 */
export interface TerrenoLocal {
  readonly nome: string;
  readonly tamanhoM: number;
  readonly ancora: LatLon;
  readonly refReal: string;
}

/** Uma grade local já lida, com a célula que ela nomeia. */
export interface GridLocalLido {
  readonly x: number;
  readonly y: number;
  readonly digitos: number;
  readonly tamanhoCelulaM: number;
}

/** Vetor de tiro dentro da grade local — plano, sem projeção nenhuma. */
export interface VetorLocal {
  readonly dE: number;
  readonly dN: number;
  readonly distanciaHorizontalM: number;
  readonly deltaAltM: number;
  readonly distanciaInclinadaM: number;
  /** Medido do norte da grade, sentido horário — igual ao jogo e à carta. */
  readonly azimuteGradeDeg: number;
}

/** Um quadro local amarrado ao mundo real por uma âncora. */
export interface QuadroLocal {
  readonly nome: string;
  readonly tamanhoM: number;
  readonly zona: number;
  readonly banda: string | null;
  readonly hemisferio: 'N' | 'S';
  readonly origemE: number;
  readonly origemN: number;
  /** local (m) → geográfico. */
  paraLatLon(x: number, y: number): LatLon;
  /** geográfico → local (m). Pode cair fora do mapa: confira com `dentro()`. */
  paraLocal(lat: number, lon: number): { x: number; y: number };
  dentro(x: number, y: number): boolean;
}

export interface OpcoesQuadro {
  readonly ancoraLat: number;
  readonly ancoraLon: number;
  readonly tamanhoM?: number;
  readonly nome?: string;
}

/** Terrenos conhecidos, indexados por id (`altis`, `stratis`…). */
export const TERRENOS: Readonly<Record<string, TerrenoLocal | undefined>>;

/** Metros por unidade do último dígito, para N dígitos por eixo. */
export function metrosPorDigito(digitos: number): number;

/**
 * Posição local → string de grid. Trunca (não arredonda): o grid nomeia a
 * CÉLULA onde o ponto está.
 *
 * @throws {RangeError} se `digitos` não for inteiro de 2 a 5, ou se x/y forem negativos.
 */
export function localParaGrid(
  x: number,
  y: number,
  digitos?: number,
  espacado?: boolean,
): string;

/**
 * String de grid → posição local. Devolve o **centro** da célula por padrão;
 * `canto: true` dá o sudoeste.
 *
 * @throws {SyntaxError} texto não numérico ou com número ímpar de dígitos.
 * @throws {RangeError} fora de 4 a 10 dígitos no total.
 */
export function gridParaLocal(texto: string, opcoes?: { canto?: boolean }): GridLocalLido;

/**
 * Vetor de tiro dentro da grade local.
 *
 * Num mapa de 30 km a Terra é plana o bastante: desprezar a curvatura custa
 * ~7 cm de flecha.
 */
export function vetorLocal(peca: PontoLocal, alvo: PontoLocal): VetorLocal;

/** Cria um quadro local amarrado ao mundo real pelo canto sudoeste. */
export function criarQuadro(opcoes: OpcoesQuadro): QuadroLocal;

/**
 * Quadro pronto para um terreno conhecido.
 * @throws {RangeError} se o id não estiver em `TERRENOS`.
 */
export function quadroDeTerreno(id: string): QuadroLocal;
