/* Grade dos terrenos do Arma 3 → metros → azimute/distância.
 *
 * Regra do módulo (a mesma do motor do Vanguard): PURO. Zero DOM, zero
 * dependência — roda no navegador, no Node do verificador e num Worker.
 *
 * ## A armadilha que este módulo existe pra respeitar
 *
 * A grade de cada mundo vem do config DELE (src/data/arma3-terrenos.js →
 * `grade`): `offsetX/offsetY/passoX/passoY/digitos`. No vanilla o passoY é
 * NEGATIVO (Altis: offsetY=30720, passoY=-100 — o rótulo de northing conta do
 * norte pra baixo), mas há mundo com northing pra cima (ChernobylZone:
 * offsetY=0). Quem assume uma convenção única erra o eixo N-S — e azimute
 * errado em terreno de jogo é exatamente o tipo de erro que ninguém percebe
 * até comparar com o mapa.
 *
 * A conversão devolve METROS DO MUNDO (x leste, y norte, como o jogo usa).
 * Nessa base o azimute de grade é o atan2 clássico; o sinal do passo já foi
 * consumido na conversão.
 *
 * ## Convenção de célula
 *
 * "034056" designa uma CÉLULA, não um ponto. Convertê-la pro CENTRO
 * (offset + (n + 0,5)·unidade) faz a volta grade→metros→grade devolver a
 * mesma grade, e distância entre grades vizinhas dar o passo — as duas
 * propriedades que o verificador cobra.
 */

import { MIL_NATO_POR_VOLTA, MRAD_POR_VOLTA } from './arma3-balistica.js';

const GRAUS_POR_VOLTA = 360;

export const grauParaMilNato = (g) => g * (MIL_NATO_POR_VOLTA / GRAUS_POR_VOLTA);
export const grauParaMrad = (g) => g * (MRAD_POR_VOLTA / GRAUS_POR_VOLTA);

/* "034056" | "0340 0560" | "03-40-05-60" → { e, n, casas } ou null.
 * Exige dígitos em quantidade PAR (4–10): metade easting, metade northing. */
export function parseGrade(texto) {
  const dig = String(texto || '').replace(/[^0-9]/g, '');
  if (dig.length < 4 || dig.length > 10 || dig.length % 2) return null;
  const casas = dig.length / 2;
  return { e: Number(dig.slice(0, casas)), n: Number(dig.slice(casas)), casas };
}

/* Grade textual → metros do mundo, ou null (grade ilegível / terreno sem
 * grade). `casas` além de `digitos` refinam a célula (8 dígitos = 10 m no
 * vanilla); o centro da célula é o ponto devolvido. */
export function gradeParaMetros(texto, grade) {
  if (!grade) return null;
  const p = parseGrade(texto);
  if (!p) return null;
  const escala = 10 ** (grade.digitos - p.casas);
  const uniX = grade.passoX * escala;
  const uniY = grade.passoY * escala;
  return {
    x: grade.offsetX + (p.e + 0.5) * uniX,
    y: grade.offsetY + (p.n + 0.5) * uniY,
  };
}

/* Metros do mundo → grade textual com `casas` dígitos por eixo. */
export function metrosParaGrade(x, y, grade, casas) {
  if (!grade) return null;
  const c = casas || grade.digitos;
  const escala = 10 ** (grade.digitos - c);
  const uniX = grade.passoX * escala;
  const uniY = grade.passoY * escala;
  const e = Math.floor((x - grade.offsetX) / uniX);
  const n = Math.floor((y - grade.offsetY) / uniY);
  if (e < 0 || n < 0) return null;
  return String(e).padStart(c, '0') + String(n).padStart(c, '0');
}

export function distanciaM(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/* Azimute de GRADE (norte do mapa = +y em metros), em graus [0, 360). */
export function azimuteGrau(a, b) {
  const g = (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
  return (g + 360) % 360;
}

/* O ponto cabe no mundo? Só responde quando o tamanho é conhecido —
 * 4 mundos não declaram mapSize, e aí a resposta honesta é null. */
export function dentroDoMundo(p, tamanhoM) {
  if (tamanhoM == null) return null;
  return p.x >= 0 && p.y >= 0 && p.x <= tamanhoM && p.y <= tamanhoM;
}
