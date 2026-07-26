/**
 * UTM ⇄ MGRS ⇄ lat/lon (WGS84) — o sistema de coordenadas do Vanguard.
 *
 * MGRS é o que o militar realmente lê no mapa: `31N EA 12345 67890`.
 *  - `31`  fuso UTM (1–60, 6° de largura)
 *  - `N`   banda de latitude (C–X, 8° cada; I e O não existem)
 *  - `EA`  quadrado de 100 km (coluna, linha)
 *  - resto pares de dígitos: 2=10 km, 4=1 km, 6=100 m, 8=10 m, 10=1 m
 *
 * O "grid de 6–8 dígitos" do Arma 3 é o MESMO conceito, só que sobre uma
 * grade local do mapa em vez da grade do planeta — ver `gridref.js`.
 *
 * Implementação: séries de Snyder/USGS (Professional Paper 1395) para a
 * projeção Transversa de Mercator. Precisão < 1 mm dentro do fuso, que é
 * ~5 ordens de grandeza melhor que o GPS do celular. Zero dependências.
 */

import { degToRad, radToDeg } from './angles.js';
import { WGS84 } from './geo.js';

const K0 = 0.9996; // fator de escala no meridiano central do UTM
const FALSE_EASTING = 500000;
const FALSE_NORTHING = 10000000; // aplicado no hemisfério sul

/* Bandas de latitude: 8° cada, de −80° a 84°. Sem I e sem O (viram 1 e 0).
 * A banda X é dupla (72°→84°) — por isso 20 letras cobrem 164°. */
const BANDAS = 'CDEFGHJKLMNPQRSTUVWX';

/* Letras de coluna do quadrado de 100 km: o alfabeto se repete a cada 3
 * fusos (conjuntos AA/AB/AC do esquema padrão WGS84). */
const COLUNAS = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'];
/* Letras de linha: ciclo de 20 letras × 100 km = 2 000 km. Fusos PARES
 * começam deslocados em 5 letras — é o que evita ambiguidade entre fusos
 * vizinhos. */
const LINHAS = 'ABCDEFGHJKLMNPQRSTUV';

/* Northing mínimo (m) de cada banda. Usado na volta (MGRS → UTM) para saber
 * quantos ciclos de 2 000 km somar ao valor derivado da letra de linha. */
const MIN_NORTHING = {
  C: 1100000, D: 2000000, E: 2800000, F: 3700000, G: 4600000, H: 5500000,
  J: 6400000, K: 7300000, L: 8200000, M: 9100000, N: 0, P: 800000,
  Q: 1700000, R: 2600000, S: 3500000, T: 4400000, U: 5300000, V: 6200000,
  W: 7000000, X: 7900000
};

/** Fuso UTM de uma coordenada, com as exceções da Noruega e de Svalbard. */
export function fusoDe(lat, lon) {
  let zona = Math.floor((((lon + 180) % 360 + 360) % 360) / 6) + 1;
  /* Exceção Noruega: o fuso 32 é alargado para oeste sobre Bergen. */
  if (lat >= 56 && lat < 64 && lon >= 3 && lon < 12) zona = 32;
  /* Exceção Svalbard: fusos 31/33/35/37 alargados, 32/34/36 suprimidos. */
  if (lat >= 72 && lat < 84) {
    if (lon >= 0 && lon < 9) zona = 31;
    else if (lon >= 9 && lon < 21) zona = 33;
    else if (lon >= 21 && lon < 33) zona = 35;
    else if (lon >= 33 && lon < 42) zona = 37;
  }
  return zona;
}

/** Letra da banda de latitude (C–X). `null` fora da cobertura UTM. */
export function bandaDe(lat) {
  if (lat < -80 || lat > 84) return null;
  /* 84° cai fora do índice 19 por 0,5 banda: a X é dupla, então travamos. */
  const i = Math.min(Math.floor((lat + 80) / 8), BANDAS.length - 1);
  return BANDAS[i];
}

/** Meridiano central (graus) de um fuso. */
export const meridianoCentral = (zona) => (zona - 1) * 6 - 180 + 3;

/**
 * lat/lon → UTM.
 * @returns {{zona:number, banda:string, hemisferio:'N'|'S', easting:number, northing:number}}
 */
export function latLonParaUTM(lat, lon, zonaForcada = null) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new RangeError('latLonParaUTM: lat/lon precisam ser números');
  }
  if (lat < -80 || lat > 84) {
    throw new RangeError(`latLonParaUTM: ${lat}° fora da cobertura UTM (−80°..84°)`);
  }
  const zona = zonaForcada ?? fusoDe(lat, lon);
  const { a, e2, ep2 } = WGS84;
  const phi = degToRad(lat);
  const lambda = degToRad(lon);
  const lambda0 = degToRad(meridianoCentral(zona));

  const sinPhi = Math.sin(phi), cosPhi = Math.cos(phi), tanPhi = Math.tan(phi);
  const N = a / Math.sqrt(1 - e2 * sinPhi * sinPhi);
  const T = tanPhi * tanPhi;
  const C = ep2 * cosPhi * cosPhi;
  /* dLambda normalizado para (−π, π]: evita estourar a série perto do
   * antimeridiano quando o fuso é forçado. */
  let dl = lambda - lambda0;
  while (dl > Math.PI) dl -= 2 * Math.PI;
  while (dl < -Math.PI) dl += 2 * Math.PI;
  const A = dl * cosPhi;

  /* Distância meridional do equador até phi (arco meridiano). */
  const M = a * (
    (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 ** 3) / 256) * phi -
    ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 ** 3) / 1024) * Math.sin(2 * phi) +
    ((15 * e2 * e2) / 256 + (45 * e2 ** 3) / 1024) * Math.sin(4 * phi) -
    ((35 * e2 ** 3) / 3072) * Math.sin(6 * phi)
  );

  const easting = K0 * N * (
    A + ((1 - T + C) * A ** 3) / 6 +
    ((5 - 18 * T + T * T + 72 * C - 58 * ep2) * A ** 5) / 120
  ) + FALSE_EASTING;

  let northing = K0 * (
    M + N * tanPhi * (
      (A * A) / 2 + ((5 - T + 9 * C + 4 * C * C) * A ** 4) / 24 +
      ((61 - 58 * T + T * T + 600 * C - 330 * ep2) * A ** 6) / 720
    )
  );
  if (lat < 0) northing += FALSE_NORTHING;

  return {
    zona,
    banda: bandaDe(lat),
    hemisferio: lat < 0 ? 'S' : 'N',
    easting,
    northing
  };
}

/** UTM → lat/lon. `hemisferio` é 'N' ou 'S' (ou passe a banda em `banda`). */
export function utmParaLatLon({ zona, easting, northing, hemisferio, banda }) {
  const sul = hemisferio ? hemisferio === 'S' : (banda && banda < 'N');
  const { a, e2, ep2 } = WGS84;
  const x = easting - FALSE_EASTING;
  const y = (sul ? northing - FALSE_NORTHING : northing) / K0;

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const mu = y / (a * (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 ** 3) / 256));

  /* Latitude do pé da perpendicular (footpoint latitude). */
  const phi1 =
    mu +
    ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
    ((21 * e1 * e1) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
    ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
    ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1), cosPhi1 = Math.cos(phi1), tanPhi1 = Math.tan(phi1);
  const C1 = ep2 * cosPhi1 * cosPhi1;
  const T1 = tanPhi1 * tanPhi1;
  const N1 = a / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
  const R1 = (a * (1 - e2)) / (1 - e2 * sinPhi1 * sinPhi1) ** 1.5;
  const D = x / (N1 * K0);

  const lat = phi1 - ((N1 * tanPhi1) / R1) * (
    (D * D) / 2 -
    ((5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * ep2) * D ** 4) / 24 +
    ((61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * ep2 - 3 * C1 * C1) * D ** 6) / 720
  );

  const lon = (
    D -
    ((1 + 2 * T1 + C1) * D ** 3) / 6 +
    ((5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * ep2 + 24 * T1 * T1) * D ** 5) / 120
  ) / cosPhi1;

  return {
    lat: radToDeg(lat),
    lon: meridianoCentral(zona) + radToDeg(lon)
  };
}

/* ────────────────────────── MGRS ────────────────────────── */

/** Letras do quadrado de 100 km a partir de easting/northing UTM. */
function letras100k(zona, easting, northing) {
  const col = Math.floor(easting / 100000);          // 1..8 dentro do fuso
  const conjunto = (zona - 1) % 3;
  const letraCol = COLUNAS[conjunto][col - 1];

  let linhaIdx = Math.floor(northing / 100000) % 20;
  /* Fusos pares deslocam a origem das linhas em 5 letras. */
  if (zona % 2 === 0) linhaIdx = (linhaIdx + 5) % 20;
  const letraLinha = LINHAS[linhaIdx];

  if (!letraCol || !letraLinha) {
    throw new RangeError(`MGRS: easting/northing fora do fuso ${zona}`);
  }
  return letraCol + letraLinha;
}

/**
 * lat/lon → string MGRS.
 * @param {number} precisao dígitos POR EIXO: 1=10 km … 5=1 m (padrão 5).
 * @param {boolean} espacado insere espaços (`31N EA 12345 67890`).
 */
export function latLonParaMGRS(lat, lon, precisao = 5, espacado = false) {
  if (precisao < 1 || precisao > 5 || !Number.isInteger(precisao)) {
    throw new RangeError('MGRS: precisão precisa ser inteiro de 1 a 5');
  }
  const utm = latLonParaUTM(lat, lon);
  const quadrado = letras100k(utm.zona, utm.easting, utm.northing);

  /* Sobra dentro do quadrado de 100 km, truncada (NÃO arredondada: MGRS
   * nomeia a CÉLULA em que o ponto cai, e arredondar mudaria de célula). */
  const divisor = 10 ** (5 - precisao);
  const e = Math.floor((utm.easting % 100000) / divisor);
  const n = Math.floor((((utm.northing % 100000) + 100000) % 100000) / divisor);
  const pad = (v) => String(v).padStart(precisao, '0');

  const zb = `${utm.zona}${utm.banda}`;
  return espacado
    ? `${zb} ${quadrado} ${pad(e)} ${pad(n)}`
    : `${zb}${quadrado}${pad(e)}${pad(n)}`;
}

/**
 * Faz o parse de uma string MGRS e devolve UTM + a precisão detectada.
 * Aceita espaços, minúsculas e precisão de 0 (só o quadrado) a 5 dígitos.
 * @returns {{zona:number, banda:string, easting:number, northing:number,
 *            hemisferio:'N'|'S', precisao:number, tamanhoCelulaM:number}}
 */
export function parseMGRS(texto) {
  const s = String(texto).toUpperCase().replace(/\s+/g, '');
  const m = /^(\d{1,2})([C-HJ-NP-X])([A-HJ-NP-Z])([A-HJ-NP-V])(\d*)$/.exec(s);
  if (!m) throw new SyntaxError(`MGRS inválido: "${texto}"`);

  const zona = Number(m[1]);
  const banda = m[2];
  const letraCol = m[3];
  const letraLinha = m[4];
  const digitos = m[5];

  if (zona < 1 || zona > 60) throw new RangeError(`MGRS: fuso ${zona} fora de 1..60`);
  if (digitos.length % 2 !== 0) {
    throw new SyntaxError(`MGRS: número ímpar de dígitos (${digitos.length}) em "${texto}"`);
  }
  const precisao = digitos.length / 2;
  if (precisao > 5) throw new RangeError('MGRS: precisão máxima é 10 dígitos (1 m)');

  /* Coluna → easting do quadrado de 100 km */
  const conjunto = (zona - 1) % 3;
  const col = COLUNAS[conjunto].indexOf(letraCol);
  if (col < 0) {
    throw new RangeError(`MGRS: coluna "${letraCol}" não pertence ao fuso ${zona}`);
  }
  const easting100k = (col + 1) * 100000;

  /* Linha → northing do quadrado, desfazendo o deslocamento dos fusos pares */
  let linhaIdx = LINHAS.indexOf(letraLinha);
  if (linhaIdx < 0) throw new RangeError(`MGRS: linha "${letraLinha}" inválida`);
  if (zona % 2 === 0) linhaIdx = (linhaIdx + 15) % 20; // −5 mod 20
  let northing100k = linhaIdx * 100000;

  /* Sobe em ciclos de 2 000 km até entrar na faixa da banda de latitude.
   * É isso que resolve a ambiguidade: a letra de linha se repete a cada
   * 2 000 km, e só a banda diz em qual repetição estamos. */
  const minN = MIN_NORTHING[banda];
  if (minN === undefined) throw new RangeError(`MGRS: banda "${banda}" inválida`);
  while (northing100k < minN) northing100k += 2000000;

  /* Sobra numérica. O ponto devolvido é o CANTO SUDOESTE da célula. */
  const divisor = 10 ** (5 - precisao);
  const meio = digitos.length / 2;
  const e = precisao ? Number(digitos.slice(0, meio)) * divisor : 0;
  const n = precisao ? Number(digitos.slice(meio)) * divisor : 0;

  return {
    zona,
    banda,
    hemisferio: banda < 'N' ? 'S' : 'N',
    easting: easting100k + e,
    northing: northing100k + n,
    precisao,
    tamanhoCelulaM: divisor * 10 // 1 dígito=10 km … 5 dígitos=1 m
  };
}

/**
 * MGRS → lat/lon. Por padrão devolve o CENTRO da célula (é o palpite certo
 * quando alguém digita "grid 123456": o alvo está em algum lugar daquele
 * quadrado de 100 m, e o centro minimiza o erro máximo).
 * Passe `canto: true` para obter o canto sudoeste.
 */
export function mgrsParaLatLon(texto, { canto = false } = {}) {
  const u = parseMGRS(texto);
  const meia = canto ? 0 : u.tamanhoCelulaM / 2;
  return utmParaLatLon({
    zona: u.zona,
    banda: u.banda,
    hemisferio: u.hemisferio,
    easting: u.easting + meia,
    northing: u.northing + meia
  });
}

/* ───────────────────── vetor de tiro na grade ───────────────────── */

/**
 * Vetor peça → alvo NO PLANO DA GRADE UTM. É o cálculo que a artilharia
 * realmente usa: azimute de grade e distância de grade.
 *
 * Dois cuidados que este código toma e que quase toda implementação amadora
 * erra:
 *
 *  1. **Fuso comum.** Se peça e alvo caem em fusos diferentes, os eastings
 *     não são comparáveis. Reprojetamos o alvo no fuso da PEÇA (é a peça que
 *     define a grade de trabalho). Sem isso, um alvo do outro lado da linha
 *     de fuso daria centenas de km de erro.
 *  2. **Fator de escala.** O UTM encolhe distâncias no meridiano central
 *     (k₀ = 0,9996) e as estica na borda. Sobre 5 km isso é até ~2 m —
 *     pequeno, mas grátis de corrigir, então corrigimos.
 *
 * @param {{lat:number,lon:number,alt?:number}} peca
 * @param {{lat:number,lon:number,alt?:number}} alvo
 */
export function gridVector(peca, alvo) {
  const uPeca = latLonParaUTM(peca.lat, peca.lon);
  /* alvo forçado no MESMO fuso da peça (ponto 1 acima) */
  const uAlvo = latLonParaUTM(alvo.lat, alvo.lon, uPeca.zona);

  const dE = uAlvo.easting - uPeca.easting;
  const dN = uAlvo.northing - uPeca.northing;
  const distGrade = Math.hypot(dE, dN);

  /* Fator de escala médio entre os dois pontos (ponto 2 acima).
   * k ≈ k₀·(1 + x²/(2R²)), x = afastamento do meridiano central. */
  const R = WGS84.a;
  const kEm = (x) => K0 * (1 + (x * x) / (2 * R * R * K0 * K0));
  const xP = uPeca.easting - FALSE_EASTING;
  const xA = uAlvo.easting - FALSE_EASTING;
  const kMedio = (kEm(xP) + kEm(xA) + 4 * kEm((xP + xA) / 2)) / 6; // Simpson

  const distTerreno = distGrade / kMedio;
  const azimuteGrade = (radToDeg(Math.atan2(dE, dN)) + 360) % 360;
  const deltaAlt = (alvo.alt ?? 0) - (peca.alt ?? 0);

  return {
    zona: uPeca.zona,
    dE,
    dN,
    /** distância no plano da grade (o que sai do mapa) */
    distanciaGradeM: distGrade,
    /** distância no terreno, já corrigida do fator de escala — use ESTA no tiro */
    distanciaHorizontalM: distTerreno,
    deltaAltM: deltaAlt,
    distanciaInclinadaM: Math.hypot(distTerreno, deltaAlt),
    /** azimute DE GRADE em graus [0,360) — é o que vai para a peça */
    azimuteGradeDeg: azimuteGrade,
    fatorEscala: kMedio
  };
}

/**
 * Convergência de meridianos: quanto o norte de GRADE difere do norte
 * VERDADEIRO, em graus, na posição dada. Positivo = norte de grade a leste
 * do verdadeiro. Serve para converter entre os dois nortes e para montar o
 * diagrama de declinação da carta.
 *
 *   azimute_verdadeiro = azimute_grade + convergência
 */
export function convergenciaMeridianos(lat, lon) {
  const zona = fusoDe(lat, lon);
  const dl = degToRad(lon - meridianoCentral(zona));
  const phi = degToRad(lat);
  /* Série de 2ª ordem: suficiente (erro < 0,001° dentro do fuso). */
  const t = Math.tan(phi), c = Math.cos(phi);
  const ep2 = WGS84.ep2;
  const gamma = dl * Math.sin(phi) *
    (1 + (dl * dl * c * c) / 3 * (1 + 3 * ep2 * c * c));
  return radToDeg(gamma);
}
