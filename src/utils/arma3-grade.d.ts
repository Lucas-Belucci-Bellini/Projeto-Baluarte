/**
 * Grade dos terrenos do Arma 3 → metros → azimute/distância.
 *
 * ── Por que declaração, e não conversão ─────────────────────────────────────
 * O módulo é PURO (zero DOM, zero dependência) e é cobrado por verificador em
 * Node. Declarar a fronteira dá o tipo a quem consome sem mexer no caminho de
 * execução do que já está medido e verde.
 *
 * ── A armadilha que os tipos aqui preservam ─────────────────────────────────
 * `passoY` é **negativo** no vanilla (o rótulo de northing conta do norte para
 * baixo), mas há mundo com northing para cima. Por isso `GradeMundo` não marca
 * sinal em lugar nenhum: quem assume uma convenção única erra o eixo N-S, e o
 * tipo não deve sugerir uma convenção que o config não tem.
 *
 * O `| null` de quase todo retorno também é regra, não descuido: grade ilegível,
 * terreno sem grade e ponto fora do mundo são casos NORMAIS, e o módulo prefere
 * devolver "não sei" a devolver um número inventado.
 */

/**
 * A grade de um mundo, literal do config dele.
 *
 * É a mesma forma de `A3Terreno['grade']` — este módulo é o dono do tipo porque
 * é ele que faz a conversão; `arma3-terrenos.d.ts` importa daqui.
 */
export interface GradeMundo {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly passoX: number;
  /** Negativo na maioria dos mundos (northing do norte para baixo). */
  readonly passoY: number;
  readonly digitos: number;
}

/** Metros do mundo: `x` para leste, `y` para norte — como o jogo usa. */
export interface PontoMundo {
  readonly x: number;
  readonly y: number;
}

/** Uma grade lida do texto, já separada nos dois eixos. */
export interface GradeLida {
  readonly e: number;
  readonly n: number;
  /** Dígitos por eixo (metade do total): 3 = 100 m, 4 = 10 m no vanilla. */
  readonly casas: number;
}

export function grauParaMilNato(g: number): number;
export function grauParaMrad(g: number): number;

/**
 * `"034056"` | `"0340 0560"` | `"03-40-05-60"` → `{ e, n, casas }`, ou `null`.
 *
 * Exige dígitos em quantidade **par** (4–10): metade easting, metade northing.
 * Texto ilegível devolve `null` em vez de lançar — é entrada de usuário.
 */
export function parseGrade(texto: string | null | undefined): GradeLida | null;

/**
 * Grade textual → metros do mundo. `null` quando a grade é ilegível ou o
 * terreno não declara grade.
 *
 * O ponto devolvido é o **centro da célula**: "034056" designa uma célula, não
 * um ponto, e o centro é o que faz a volta grade→metros→grade fechar.
 */
export function gradeParaMetros(
  texto: string | null | undefined,
  grade: GradeMundo | null | undefined,
): PontoMundo | null;

/** Metros do mundo → grade textual com `casas` dígitos por eixo. */
export function metrosParaGrade(
  x: number,
  y: number,
  grade: GradeMundo | null | undefined,
  casas?: number,
): string | null;

export function distanciaM(a: PontoMundo, b: PontoMundo): number;

/** Azimute de GRADE (norte do mapa = +y em metros), em graus [0, 360). */
export function azimuteGrau(a: PontoMundo, b: PontoMundo): number;

/**
 * O ponto cabe no mundo?
 *
 * `null` quando o tamanho é desconhecido — 4 mundos não declaram `mapSize`, e
 * aí a resposta honesta não é `false`.
 */
export function dentroDoMundo(
  p: PontoMundo,
  tamanhoM: number | null | undefined,
): boolean | null;
