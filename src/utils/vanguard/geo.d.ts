/**
 * Geodésia WGS84 — distâncias e azimutes sobre o elipsoide.
 *
 * Três níveis de precisão, e o tipo não esconde qual é qual: `haversine()` é
 * esfera (~0,3 % de erro), `vincentyInverse()` é elipsoide (precisão
 * milimétrica) e o plano da grade UTM (`mgrs.js`) é o que a ARTILHARIA usa.
 *
 * O `| null` de `vincentyInverse()` é o caso de não convergência (pontos quase
 * antipodais). Raro em uso tático, mas declarado — quem consome escolhe o que
 * fazer, em vez de receber `NaN` disfarçado de medida.
 */

/** Um ponto geográfico em graus. `alt` em metros, quando importa. */
export interface PontoGeo {
  readonly lat: number;
  readonly lon: number;
  readonly alt?: number;
}

/** Parâmetros do elipsoide WGS84. `b`, `e2` e `ep2` são derivados de `a` e `f`. */
export interface ElipsoideWGS84 {
  /** Semieixo maior (m). */
  readonly a: number;
  /** Achatamento. */
  readonly f: number;
  /** Semieixo menor (m). */
  readonly b: number;
  /** 1ª excentricidade². */
  readonly e2: number;
  /** 2ª excentricidade². */
  readonly ep2: number;
}

export interface ResultadoVincentyInverso {
  readonly distancia: number;
  readonly azimuteInicial: number;
  readonly azimuteFinal: number;
}

export interface ResultadoVincentyDireto {
  readonly lat: number;
  readonly lon: number;
  readonly azimuteFinal: number;
}

export const WGS84: ElipsoideWGS84;

/** Raio médio da Terra no modelo esférico (IUGG). */
export const R_TERRA: number;

/** Distância esférica (m). Barata; para trilha/odômetro, não para tiro. */
export function haversine(a: PontoGeo, b: PontoGeo): number;

/**
 * Azimute INICIAL de grande círculo `a → b`, em graus [0, 360).
 *
 * Em rota longa o azimute muda ao longo do caminho — por isso "inicial". Para
 * tiro, use o azimute de grade (`gridVector`).
 */
export function bearingTo(a: PontoGeo, b: PontoGeo): number;

/**
 * Vincenty inverso no elipsoide WGS84. Precisão ~0,5 mm.
 *
 * `null` quando não converge (pontos quase antipodais).
 */
export function vincentyInverse(p1: PontoGeo, p2: PontoGeo): ResultadoVincentyInverso | null;

/** Vincenty direto: ponto + azimute + distância → ponto de chegada. */
export function vincentyDirect(
  p: PontoGeo,
  azimuteDeg: number,
  distanciaM: number,
): ResultadoVincentyDireto;

/**
 * Distância INCLINADA (slant range) — a que o telêmetro mede.
 *
 * A artilharia usa a HORIZONTAL; o atirador de precisão usa a inclinada com
 * correção de cosseno. Não confunda os dois.
 */
export function distanciaInclinada(horizontalM: number, deltaAltM: number): number;

/** Ângulo de sítio em graus. Positivo = alvo acima. */
export function anguloDeSitio(horizontalM: number, deltaAltM: number): number;
