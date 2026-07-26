/**
 * Geodésia WGS84 — distâncias e azimutes sobre o elipsoide.
 *
 * Três níveis de precisão, e o motor usa cada um onde faz sentido:
 *
 *  1. `haversine()` — esfera. Rápido, ~0,3 % de erro (3 m/km no pior caso).
 *     Serve para "quanto andei" na trilha, onde 3 m não muda nada.
 *  2. `vincentyInverse()` — elipsoide, precisão milimétrica. É o que a tela
 *     de navegação mostra como DISTÂNCIA e AZIMUTE reais.
 *  3. **Plano da grade UTM** (`mgrs.js` → `gridVector()`). É o que a
 *     ARTILHARIA usa. Não por preguiça: a doutrina de tiro trabalha em
 *     coordenadas de grade, então o azimute que vai para a peça tem de ser
 *     o *grid azimuth*, não o azimute verdadeiro — os dois diferem pela
 *     convergência de meridianos (até ~3° na borda do fuso). Mandar azimute
 *     verdadeiro para uma peça alinhada pela grade erra o alvo.
 *
 * Sem dependências. Tudo em metros, graus na borda, radianos por dentro.
 */

import { degToRad, radToDeg, normDeg } from './angles.js';

/* Elipsoide WGS84 */
export const WGS84 = {
  a: 6378137.0,                    // semieixo maior (m)
  f: 1 / 298.257223563,            // achatamento
  get b() { return this.a * (1 - this.f); },
  get e2() { return this.f * (2 - this.f); },       // 1ª excentricidade²
  get ep2() { return this.e2 / (1 - this.e2); }     // 2ª excentricidade²
};

/** Raio médio da Terra usado no modelo esférico (IUGG). */
export const R_TERRA = 6371008.8;

/**
 * Distância esférica em metros entre {lat, lon} (graus).
 * Barata; use para trilha/odômetro, não para tiro.
 */
export function haversine(a, b) {
  const la1 = degToRad(a.lat), la2 = degToRad(b.lat);
  const dLat = la2 - la1;
  const dLon = degToRad(b.lon - a.lon);
  const s = Math.sin(dLat / 2) ** 2 +
            Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R_TERRA * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * Azimute INICIAL de grande círculo `a → b`, em graus [0, 360).
 * Atenção: em rota longa o azimute muda ao longo do caminho (por isso
 * "inicial"). Para tiro, use o azimute de grade.
 */
export function bearingTo(a, b) {
  const la1 = degToRad(a.lat), la2 = degToRad(b.lat);
  const dLon = degToRad(b.lon - a.lon);
  const y = Math.sin(dLon) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLon);
  return normDeg(radToDeg(Math.atan2(y, x)));
}

/**
 * Vincenty inverso: distância geodésica e azimutes direto/reverso no
 * elipsoide WGS84. Precisão ~0,5 mm. Retorna `null` se não convergir
 * (pontos quase antipodais — irrelevante em uso tático, mas tratado).
 *
 * @returns {{distancia:number, azimuteInicial:number, azimuteFinal:number}|null}
 */
export function vincentyInverse(p1, p2) {
  const { a, f } = WGS84;
  const b = a * (1 - f);
  const L = degToRad(p2.lon - p1.lon);
  const U1 = Math.atan((1 - f) * Math.tan(degToRad(p1.lat)));
  const U2 = Math.atan((1 - f) * Math.tan(degToRad(p2.lat)));
  const sinU1 = Math.sin(U1), cosU1 = Math.cos(U1);
  const sinU2 = Math.sin(U2), cosU2 = Math.cos(U2);

  let lambda = L, lambdaP, iter = 0;
  let sinLambda, cosLambda, sinSigma, cosSigma, sigma, sinAlpha,
      cos2Alpha, cos2SigmaM, C;

  do {
    sinLambda = Math.sin(lambda); cosLambda = Math.cos(lambda);
    sinSigma = Math.sqrt(
      (cosU2 * sinLambda) ** 2 +
      (cosU1 * sinU2 - sinU1 * cosU2 * cosLambda) ** 2
    );
    if (sinSigma === 0) {
      return { distancia: 0, azimuteInicial: 0, azimuteFinal: 0 }; // pontos coincidentes
    }
    cosSigma = sinU1 * sinU2 + cosU1 * cosU2 * cosLambda;
    sigma = Math.atan2(sinSigma, cosSigma);
    sinAlpha = (cosU1 * cosU2 * sinLambda) / sinSigma;
    cos2Alpha = 1 - sinAlpha * sinAlpha;
    /* cos2Alpha = 0 na linha do equador → cos2SigmaM indefinido; 0 é o limite correto */
    cos2SigmaM = cos2Alpha !== 0 ? cosSigma - (2 * sinU1 * sinU2) / cos2Alpha : 0;
    C = (f / 16) * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
    lambdaP = lambda;
    lambda = L + (1 - C) * f * sinAlpha *
      (sigma + C * sinSigma *
        (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM)));
  } while (Math.abs(lambda - lambdaP) > 1e-12 && ++iter < 200);

  if (iter >= 200) return null; // quase antipodal: não convergiu

  const u2 = cos2Alpha * WGS84.ep2;
  const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));
  const deltaSigma = B * sinSigma * (cos2SigmaM + (B / 4) * (
    cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
    (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) *
      (-3 + 4 * cos2SigmaM * cos2SigmaM)
  ));

  return {
    distancia: b * A * (sigma - deltaSigma),
    azimuteInicial: normDeg(radToDeg(Math.atan2(
      cosU2 * sinLambda, cosU1 * sinU2 - sinU1 * cosU2 * cosLambda))),
    azimuteFinal: normDeg(radToDeg(Math.atan2(
      cosU1 * sinLambda, -sinU1 * cosU2 + cosU1 * sinU2 * cosLambda)))
  };
}

/**
 * Vincenty direto: dado um ponto, azimute (graus) e distância (m), devolve
 * o ponto de chegada. É o "andar 400 m no rumo 2400 mils" do waypoint.
 */
export function vincentyDirect(p, azimuteDeg, distanciaM) {
  const { a, f } = WGS84;
  const b = a * (1 - f);
  const alpha1 = degToRad(azimuteDeg);
  const sinAlpha1 = Math.sin(alpha1), cosAlpha1 = Math.cos(alpha1);
  const tanU1 = (1 - f) * Math.tan(degToRad(p.lat));
  const cosU1 = 1 / Math.sqrt(1 + tanU1 * tanU1);
  const sinU1 = tanU1 * cosU1;
  const sigma1 = Math.atan2(tanU1, cosAlpha1);
  const sinAlpha = cosU1 * sinAlpha1;
  const cos2Alpha = 1 - sinAlpha * sinAlpha;
  const u2 = cos2Alpha * WGS84.ep2;
  const A = 1 + (u2 / 16384) * (4096 + u2 * (-768 + u2 * (320 - 175 * u2)));
  const B = (u2 / 1024) * (256 + u2 * (-128 + u2 * (74 - 47 * u2)));

  let sigma = distanciaM / (b * A), sigmaP, iter = 0;
  let sinSigma, cosSigma, cos2SigmaM, deltaSigma;
  do {
    cos2SigmaM = Math.cos(2 * sigma1 + sigma);
    sinSigma = Math.sin(sigma); cosSigma = Math.cos(sigma);
    deltaSigma = B * sinSigma * (cos2SigmaM + (B / 4) * (
      cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM) -
      (B / 6) * cos2SigmaM * (-3 + 4 * sinSigma * sinSigma) *
        (-3 + 4 * cos2SigmaM * cos2SigmaM)
    ));
    sigmaP = sigma;
    sigma = distanciaM / (b * A) + deltaSigma;
  } while (Math.abs(sigma - sigmaP) > 1e-12 && ++iter < 200);

  const tmp = sinU1 * sinSigma - cosU1 * cosSigma * cosAlpha1;
  const lat2 = Math.atan2(
    sinU1 * cosSigma + cosU1 * sinSigma * cosAlpha1,
    (1 - f) * Math.sqrt(sinAlpha * sinAlpha + tmp * tmp)
  );
  const lambda = Math.atan2(
    sinSigma * sinAlpha1,
    cosU1 * cosSigma - sinU1 * sinSigma * cosAlpha1
  );
  const C = (f / 16) * cos2Alpha * (4 + f * (4 - 3 * cos2Alpha));
  const L = lambda - (1 - C) * f * sinAlpha * (
    sigma + C * sinSigma *
      (cos2SigmaM + C * cosSigma * (-1 + 2 * cos2SigmaM * cos2SigmaM))
  );

  return {
    lat: radToDeg(lat2),
    lon: ((radToDeg(degToRad(p.lon) + L) + 540) % 360) - 180,
    azimuteFinal: normDeg(radToDeg(Math.atan2(sinAlpha, -tmp)))
  };
}

/**
 * Distância INCLINADA (slant range) a partir da horizontal + diferença de
 * altitude. É a distância "linha de visada" — a que o telêmetro mede.
 * A artilharia usa a HORIZONTAL; o atirador de precisão usa a inclinada
 * com correção de cosseno. Não confunda os dois.
 */
export const distanciaInclinada = (horizontalM, deltaAltM) =>
  Math.hypot(horizontalM, deltaAltM);

/**
 * Ângulo de sítio (angle of site): elevação da linha peça→alvo em relação
 * à horizontal, em graus. Positivo = alvo acima.
 */
export const anguloDeSitio = (horizontalM, deltaAltM) =>
  radToDeg(Math.atan2(deltaAltM, horizontalM));
