/**
 * Grade REAL dos terrenos do Arma 3 — a do config de cada mundo.
 *
 * ## Por que este módulo existe, se já há `gridref.js`
 *
 * O `gridref.js` implementa a grade **MGRS local**: origem no canto sudoeste,
 * northing crescendo para o norte. É a convenção certa para MGRS — e é a
 * convenção **errada** para os mapas do Arma 3.
 *
 * Medido no `CfgWorlds` do Altis: `offsetY = 30720`, `passoY = -100`. O engine
 * calcula o rótulo como `(pos - offset) / passo`, então:
 *
 *   | borda do mapa   | rótulo pelo config | rótulo pelo gridref.js |
 *   |-----------------|--------------------|------------------------|
 *   | sul  (y = 0)    | **307**            | 000                    |
 *   | norte (y=30720) | **000**            | 307                    |
 *
 * Estão invertidos. Uma grade lida do mapa do jogo e digitada no computador de
 * tiro cairia na posição espelhada — em Altis, até 30 km fora. Não é
 * arredondamento: é o eixo N-S trocado, e o azimute sai 180° errado.
 *
 * **30 dos 31 mundos** medidos contam o northing de cima para baixo; **1**
 * conta para cima (o `ChernobylZone`, com `offsetY = 0`). Por isso a conversão
 * NÃO pode assumir convenção nenhuma: ela lê `offset` e o **sinal** do passo do
 * mundo em questão, que vem em `src/data/arma3-terrenos.js`.
 *
 * `gridref.js` continua válido para o que ele descreve — grade local genérica
 * e o mundo real em MGRS. Este módulo é para quando o operador lê a grade
 * **na carta do Arma 3**.
 *
 * ## Regra do diretório
 *
 * Zero dependências e zero DOM, como todo o `src/engine/`. A única importação é
 * de dado puro (`arma3-terrenos.js`), que é gerado do dump e não traz código.
 */

import { A3TER } from '../../data/arma3-terrenos.js';
import { vetorLocal } from './gridref.js';
import { degToMil } from './angles.js';

const porId = new Map(A3TER.map((t) => [t.id, t]));
const porClasse = new Map(A3TER.map((t) => [t.classe.toLowerCase(), t]));

/** Terrenos que dá para usar no computador de tiro (têm grade declarada). */
export function terrenosComGrade() {
  return A3TER.filter((t) => t.grade);
}

/** Acha por id (`altis`) ou por classe do config (`Altis`). Devolve null. */
export function acharTerreno(chave) {
  if (!chave) return null;
  const k = String(chave).toLowerCase();
  return porId.get(k) || porClasse.get(k) || null;
}

/**
 * "034056" | "0340 0560" | "03-40-05-60" → `{ e, n, casas }`, ou null.
 *
 * Exige quantidade PAR de dígitos (4 a 10): metade easting, metade northing.
 * Ímpar é ambíguo — 5 dígitos poderiam ser 2+3 ou 3+2, e adivinhar poria o
 * ponto a quilômetros de distância. Melhor recusar.
 */
export function parseGrade(texto) {
  const dig = String(texto || '').replace(/[^0-9]/g, '');
  if (dig.length < 4 || dig.length > 10 || dig.length % 2) return null;
  const casas = dig.length / 2;
  return { e: Number(dig.slice(0, casas)), n: Number(dig.slice(casas)), casas };
}

/**
 * Grade do mapa do jogo → metros do mundo `{ x, y }`, ou null.
 *
 * O ponto devolvido é o CENTRO da célula, não o canto. Grade nomeia uma célula
 * (`034056` é um quadrado de 100 m no Altis); usar o canto faria a ida-e-volta
 * grade→metros→grade cair na célula vizinha em toda borda.
 *
 * `casas` além dos dígitos do mundo refina a célula: 8 dígitos num mundo de
 * grade 100 m dão célula de 10 m.
 */
export function gradeParaMetros(texto, terreno) {
  const t = typeof terreno === 'string' ? acharTerreno(terreno) : terreno;
  if (!t || !t.grade) return null;
  const p = parseGrade(texto);
  if (!p) return null;
  const g = t.grade;
  const escala = 10 ** (g.digitos - p.casas);
  return {
    x: g.offsetX + (p.e + 0.5) * (g.passoX * escala),
    y: g.offsetY + (p.n + 0.5) * (g.passoY * escala),
  };
}

/** Metros do mundo → grade textual com `casas` dígitos por eixo, ou null. */
export function metrosParaGrade(x, y, terreno, casas) {
  const t = typeof terreno === 'string' ? acharTerreno(terreno) : terreno;
  if (!t || !t.grade) return null;
  const g = t.grade;
  const c = casas || g.digitos;
  const escala = 10 ** (g.digitos - c);
  const e = Math.floor((x - g.offsetX) / (g.passoX * escala));
  const n = Math.floor((y - g.offsetY) / (g.passoY * escala));
  if (e < 0 || n < 0) return null;
  return String(e).padStart(c, '0') + String(n).padStart(c, '0');
}

/**
 * Vetor de tiro entre duas posições EM METROS DO MUNDO.
 *
 * Devolve distância e azimute de GRADE em graus, mil NATO e MRAD. O sinal do
 * passo já foi consumido na conversão, então aqui o norte é `+y` e o azimute é
 * o `atan2` clássico — sem caso especial por mundo.
 *
 * A geometria NÃO é recalculada aqui: quem faz é o `vetorLocal()` do
 * `gridref.js`, que já é o caminho da missão de tiro. Duas implementações do
 * mesmo azimute divergem em silêncio — e a que diverge é sempre a que ninguém
 * está testando. Este módulo só acrescenta as unidades e o retro-azimute.
 */
export function vetorArma3(peca, alvo) {
  const v = vetorLocal(peca, alvo);
  const azimuteDeg = v.azimuteGradeDeg;
  return {
    distanciaM: v.distanciaHorizontalM,
    azimuteDeg,
    azimuteMilNato: degToMil(azimuteDeg, 'nato'),
    azimuteMrad: degToMil(azimuteDeg, 'mrad'),
    retroAzimuteDeg: (azimuteDeg + 180) % 360,
  };
}

/**
 * O ponto cabe dentro do mundo? Só responde quando o tamanho é conhecido —
 * 4 dos 31 mundos não declaram `mapSize`, e para esses a resposta honesta é
 * `null` ("não dá para saber"), não `false`.
 */
export function dentroDoMundo(p, terreno) {
  const t = typeof terreno === 'string' ? acharTerreno(terreno) : terreno;
  if (!t || t.tamanhoM == null) return null;
  return p.x >= 0 && p.y >= 0 && p.x <= t.tamanhoM && p.y <= t.tamanhoM;
}

/** Como o mundo conta o northing — o dado que impede o erro de 180°. */
export function sentidoNorthing(terreno) {
  const t = typeof terreno === 'string' ? acharTerreno(terreno) : terreno;
  if (!t || !t.grade) return null;
  return t.grade.passoY < 0 ? 'norte-para-sul' : 'sul-para-norte';
}
