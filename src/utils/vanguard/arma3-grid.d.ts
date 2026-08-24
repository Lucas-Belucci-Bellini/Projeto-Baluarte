/**
 * Grade REAL dos terrenos do Arma 3 — a do config de cada mundo.
 *
 * ── Por que este módulo existe, se já há `gridref.js` ───────────────────────
 * `gridref.js` implementa a grade MGRS local (northing para cima). É a
 * convenção certa para MGRS e a **errada** para os mapas do Arma 3: medido no
 * `CfgWorlds` do Altis, `offsetY = 30720` e `passoY = -100`, então a borda sul
 * é rotulada `307` e a norte `000` — o inverso do que o `gridref.js` diria.
 * Uma grade lida na carta e digitada no computador de tiro cairia espelhada:
 * até 30 km fora, com o azimute 180° errado.
 *
 * **30 dos 31 mundos** contam o northing de cima para baixo; **1** conta para
 * cima. Por isso nada aqui assume convenção: tudo lê o `offset` e o **sinal**
 * do passo do mundo em questão.
 *
 * O `| null` de todo retorno é a mesma política: terreno desconhecido, mundo
 * sem grade declarada e grade ilegível são casos NORMAIS, e a resposta honesta
 * é "não sei" — não um número plausível.
 */

import type { A3Terreno } from '../../data/arma3-terrenos.js';
import type { PontoLocal } from './gridref.js';

/** Uma grade lida do texto, já separada nos dois eixos. */
export interface GradeLida {
  readonly e: number;
  readonly n: number;
  /** Dígitos por eixo (metade do total). */
  readonly casas: number;
}

/** Metros do mundo: `x` para leste, `y` para norte — como o jogo usa. */
export interface PontoMundo {
  readonly x: number;
  readonly y: number;
}

/** Vetor de tiro entre duas posições em metros do mundo, já nas três unidades. */
export interface VetorArma3 {
  readonly distanciaM: number;
  readonly azimuteDeg: number;
  readonly azimuteMilNato: number;
  readonly azimuteMrad: number;
  readonly retroAzimuteDeg: number;
}

/** Como o mundo conta o northing — o dado que impede o erro de 180°. */
export type SentidoNorthing = 'norte-para-sul' | 'sul-para-norte';

/** Terreno por id (`altis`), por classe do config (`Altis`), ou já resolvido. */
export type ChaveTerreno = string | A3Terreno;

/** Terrenos que dá para usar no computador de tiro (têm grade declarada). */
export function terrenosComGrade(): A3Terreno[];

/** Acha por id ou por classe do config. `null` quando não existe. */
export function acharTerreno(chave: string | null | undefined): A3Terreno | null;

/**
 * `"034056"` | `"0340 0560"` | `"03-40-05-60"` → `{ e, n, casas }`, ou `null`.
 *
 * Exige quantidade PAR de dígitos (4 a 10). Ímpar é ambíguo — 5 dígitos
 * poderiam ser 2+3 ou 3+2, e adivinhar poria o ponto a quilômetros.
 */
export function parseGrade(texto: string | null | undefined): GradeLida | null;

/**
 * Grade do mapa do jogo → metros do mundo. O ponto devolvido é o **centro** da
 * célula: usar o canto faria a ida-e-volta cair na célula vizinha em toda borda.
 */
export function gradeParaMetros(
  texto: string | null | undefined,
  terreno: ChaveTerreno | null | undefined,
): PontoMundo | null;

/** Metros do mundo → grade textual com `casas` dígitos por eixo. */
export function metrosParaGrade(
  x: number,
  y: number,
  terreno: ChaveTerreno | null | undefined,
  casas?: number,
): string | null;

/**
 * Vetor de tiro entre duas posições em metros do mundo.
 *
 * A geometria **não** é recalculada aqui: quem faz é `vetorLocal()`. Duas
 * implementações do mesmo azimute divergem em silêncio, e a que diverge é
 * sempre a que ninguém está testando.
 */
export function vetorArma3(peca: PontoLocal, alvo: PontoLocal): VetorArma3;

/**
 * O ponto cabe dentro do mundo?
 *
 * `null` quando o tamanho é desconhecido — 4 dos 31 mundos não declaram
 * `mapSize`, e para esses a resposta honesta não é `false`.
 */
export function dentroDoMundo(
  p: PontoMundo,
  terreno: ChaveTerreno | null | undefined,
): boolean | null;

/** Como o mundo conta o northing. `null` se o terreno não declara grade. */
export function sentidoNorthing(
  terreno: ChaveTerreno | null | undefined,
): SentidoNorthing | null;
