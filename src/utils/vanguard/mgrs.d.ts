/**
 * UTM ⇄ MGRS ⇄ lat/lon (WGS84) — o sistema de coordenadas do Vanguard.
 *
 * `31N EA 12345 67890`: fuso, banda, quadrado de 100 km e os pares de dígitos.
 *
 * ── O que os tipos aqui carregam ────────────────────────────────────────────
 * Quase toda entrada inválida **lança** em vez de devolver número errado —
 * `SyntaxError` para texto ilegível e `RangeError` para valor fora de faixa. É
 * decisão do módulo: coordenada silenciosamente errada é pior que exceção.
 * `bandaDe()` é a exceção, e devolve `null`: fora da cobertura UTM não é erro
 * de quem chamou, é território que o sistema não cobre.
 */

import type { PontoGeo } from './geo.js';

export type Hemisferio = 'N' | 'S';

/** Uma coordenada UTM. `banda` é `null` fora da cobertura de latitude. */
export interface CoordUTM {
  readonly zona: number;
  readonly banda: string | null;
  readonly hemisferio: Hemisferio;
  readonly easting: number;
  readonly northing: number;
}

/** O que `utmParaLatLon()` aceita: hemisfério explícito **ou** a banda. */
export interface EntradaUTM {
  readonly zona: number;
  readonly easting: number;
  readonly northing: number;
  readonly hemisferio?: Hemisferio;
  readonly banda?: string;
}

export interface LatLon {
  readonly lat: number;
  readonly lon: number;
}

/** MGRS já parseado, com a precisão detectada no próprio texto. */
export interface MGRSParseado {
  readonly zona: number;
  readonly banda: string;
  readonly hemisferio: Hemisferio;
  readonly easting: number;
  readonly northing: number;
  /** Dígitos por eixo: 0 (só o quadrado) a 5 (1 m). */
  readonly precisao: number;
  /** 1 dígito = 10 km … 5 dígitos = 1 m. */
  readonly tamanhoCelulaM: number;
}

/**
 * Vetor peça → alvo no plano da grade UTM — o cálculo que a artilharia usa.
 *
 * Dois cuidados embutidos: alvo reprojetado no fuso da PEÇA (eastings de fusos
 * diferentes não são comparáveis) e correção do fator de escala do UTM.
 */
export interface VetorGrade {
  readonly zona: number;
  readonly dE: number;
  readonly dN: number;
  /** Distância no plano da grade (o que sai do mapa). */
  readonly distanciaGradeM: number;
  /** Distância no terreno, já corrigida do fator de escala — **use esta no tiro**. */
  readonly distanciaHorizontalM: number;
  readonly deltaAltM: number;
  readonly distanciaInclinadaM: number;
  /** Azimute DE GRADE em graus [0, 360) — é o que vai para a peça. */
  readonly azimuteGradeDeg: number;
  readonly fatorEscala: number;
}

/** Fuso UTM de uma coordenada, com as exceções da Noruega e de Svalbard. */
export function fusoDe(lat: number, lon: number): number;

/** Letra da banda de latitude (C–X). `null` fora da cobertura UTM (−80°..84°). */
export function bandaDe(lat: number): string | null;

/** Meridiano central (graus) de um fuso. */
export function meridianoCentral(zona: number): number;

/**
 * lat/lon → UTM.
 * @throws {RangeError} se lat/lon não forem finitos, ou a latitude cair fora
 * de −80°..84°.
 */
export function latLonParaUTM(lat: number, lon: number, zonaForcada?: number | null): CoordUTM;

/** UTM → lat/lon. Passe `hemisferio` ou `banda`. */
export function utmParaLatLon(entrada: EntradaUTM): LatLon;

/**
 * lat/lon → string MGRS.
 *
 * A sobra é **truncada**, não arredondada: MGRS nomeia a CÉLULA em que o ponto
 * cai, e arredondar mudaria de célula.
 *
 * @param precisao dígitos POR EIXO: 1 = 10 km … 5 = 1 m (padrão 5).
 * @throws {RangeError} se `precisao` não for inteiro de 1 a 5.
 */
export function latLonParaMGRS(
  lat: number,
  lon: number,
  precisao?: number,
  espacado?: boolean,
): string;

/**
 * Parse de MGRS. Aceita espaços, minúsculas e 0 a 10 dígitos.
 *
 * @throws {SyntaxError} texto que não casa com o formato, ou número ímpar de dígitos.
 * @throws {RangeError} fuso fora de 1..60, banda/coluna/linha inválidas, precisão > 5.
 */
export function parseMGRS(texto: string): MGRSParseado;

/**
 * MGRS → lat/lon. Devolve o **centro** da célula por padrão (menor erro máximo
 * quando alguém passa "grid 123456" pelo rádio); `canto: true` dá o sudoeste.
 */
export function mgrsParaLatLon(texto: string, opcoes?: { canto?: boolean }): LatLon;

/** Vetor de tiro no plano da grade UTM. Ver `VetorGrade`. */
export function gridVector(peca: PontoGeo, alvo: PontoGeo): VetorGrade;

/**
 * Convergência de meridianos: quanto o norte de GRADE difere do VERDADEIRO, em
 * graus. Positivo = norte de grade a leste do verdadeiro.
 *
 *   `azimute_verdadeiro = azimute_grade + convergência`
 */
export function convergenciaMeridianos(lat: number, lon: number): number;
