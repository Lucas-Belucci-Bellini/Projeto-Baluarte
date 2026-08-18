/**
 * Conversão de ângulos — a base de tudo no Vanguard.
 *
 * ⚠️ "Mil" e "MRAD" NÃO são a mesma coisa, e confundir os dois é o erro
 * clássico que joga a granada 200 m fora do alvo. `SistemaMil` existe para o
 * tipo recusar o erro antes de o `RangeError` acontecer: as funções aceitam
 * exatamente os quatro sistemas que `MIL_SYSTEMS` conhece, e nenhuma string
 * inventada passa.
 *
 * O motor guarda ângulo em **radianos** e converte só na borda.
 */

/** Os sistemas de mil que o motor conhece. Qualquer outro nome lança. */
export type SistemaMil = 'nato' | 'mrad' | 'warsaw' | 'swedish';

/** Voltas completas em cada sistema: NATO 6400, mrad 2π·1000, etc. */
export const MIL_SYSTEMS: Readonly<Record<SistemaMil, number>>;

/** π/180. */
export const DEG: number;

export function degToRad(d: number): number;
export function radToDeg(r: number): number;

/**
 * rad → mils, no sistema pedido (padrão: mil NATO 6400).
 * @throws {RangeError} se o sistema não existir.
 */
export function radToMil(rad: number, system?: SistemaMil): number;

/**
 * mils → rad, no sistema pedido (padrão: mil NATO 6400).
 * @throws {RangeError} se o sistema não existir.
 */
export function milToRad(mil: number, system?: SistemaMil): number;

export function degToMil(deg: number, system?: SistemaMil): number;
export function milToDeg(mil: number, system?: SistemaMil): number;

/** Normaliza um azimute em graus para [0, 360). */
export function normDeg(deg: number): number;

/** Normaliza um azimute em mils para [0, volta). */
export function normMil(mil: number, system?: SistemaMil): number;

/**
 * Menor diferença angular assinada entre dois azimutes, em graus.
 * Resultado em (−180, 180] — positivo = `b` está à direita de `a`.
 */
export function deltaDeg(a: number, b: number): number;

/** Quantos mils um alvo de `larguraM` ocupa a `distM`. `0` se `distM <= 0`. */
export function milsPorTamanho(larguraM: number, distM: number, system?: SistemaMil): number;

/** O inverso: distância estimada pelo tamanho aparente. `Infinity` se o ângulo for ≤ 0. */
export function distanciaPorMils(larguraM: number, mils: number, system?: SistemaMil): number;
