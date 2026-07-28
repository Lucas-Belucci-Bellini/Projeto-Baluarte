/**
 * Grade LOCAL estilo Arma 3 — o "grid de 6 a 8 dígitos" do jogo.
 *
 * A sacada: o grid do Arma **é** um MGRS sobre um quadro local. As regras de
 * leitura são idênticas (leia a coluna, depois a linha; dígitos aos pares;
 * mais dígitos = mais precisão), só que a origem é o canto sudoeste do mapa
 * em vez do quadrado de 100 km do planeta.
 *
 *   3+3 dígitos (`123456`) → célula de 100 m
 *   4+4 dígitos (`12345678`) → célula de 10 m
 *   5+5 dígitos → célula de 1 m
 *
 * Por que isso importa no Vanguard: quem treinou no jogo já sabe ler grid.
 * A mesma tela serve para (a) treinar num terreno do Arma e (b) operar no
 * mundo real em MGRS — a matemática de tiro é a mesma, muda só o quadro.
 *
 * Este módulo funciona **sem** âncora geográfica (matemática local pura).
 * A âncora é opcional e só serve para amarrar a grade local ao mundo real.
 */

import { latLonParaUTM, utmParaLatLon } from './mgrs.js';

/**
 * Terrenos conhecidos. `tamanhoM` é dado de jogo (exato e verificável).
 *
 * ⚠️ `ancora` é **aproximada e opcional** — os mapas do Arma são inspirados
 * em lugares reais (Altis↔Lemnos, Livonia↔Polônia…), não são levantamentos
 * topográficos deles. Serve para posicionar o terreno num mapa-múndi de
 * referência, **nunca** para navegação real. Todo o cálculo de tiro local
 * funciona sem âncora nenhuma.
 */
export const TERRENOS = {
  altis:      { nome: 'Altis',      tamanhoM: 30720, ancora: { lat: 39.90, lon: 25.15 }, refReal: 'Lemnos (GR)' },
  stratis:    { nome: 'Stratis',    tamanhoM: 8192,  ancora: { lat: 39.50, lon: 24.98 }, refReal: 'Agios Efstratios (GR)' },
  malden:     { nome: 'Malden 2035',tamanhoM: 12800, ancora: { lat: 42.60, lon: 9.10 },  refReal: 'ilha fictícia (Mediterrâneo)' },
  tanoa:      { nome: 'Tanoa',      tamanhoM: 15360, ancora: { lat: -17.60, lon: 178.40 }, refReal: 'Fiji (fictício)' },
  livonia:    { nome: 'Livonia',    tamanhoM: 12800, ancora: { lat: 50.50, lon: 22.10 }, refReal: 'Polônia oriental' },
  chernarus:  { nome: 'Chernarus',  tamanhoM: 15360, ancora: { lat: 50.30, lon: 14.60 }, refReal: 'Chéquia (CUP/A2)' },
  takistan:   { nome: 'Takistan',   tamanhoM: 12800, ancora: { lat: 34.50, lon: 69.20 }, refReal: 'Afeganistão (CUP/A2)' },
  sahrani:    { nome: 'Sahrani',    tamanhoM: 20480, ancora: { lat: 18.20, lon: -66.50 }, refReal: 'Caribe (CUP/A1)' }
};

/** Metros por unidade do último dígito, para N dígitos por eixo. */
export const metrosPorDigito = (digitos) => 10 ** (5 - digitos);

/**
 * Posição local (metros a partir do canto SO) → string de grid.
 * Trunca (não arredonda): o grid nomeia a CÉLULA onde o ponto está.
 *
 * @param {number} x metros para leste
 * @param {number} y metros para norte
 * @param {number} digitos por eixo (2..5). 3 = 100 m, 4 = 10 m.
 * @param {boolean} espacado separa os eixos com espaço
 */
export function localParaGrid(x, y, digitos = 3, espacado = false) {
  if (!Number.isInteger(digitos) || digitos < 2 || digitos > 5) {
    throw new RangeError('grid local: dígitos por eixo precisa ser 2..5');
  }
  if (x < 0 || y < 0) throw new RangeError('grid local: posição fora do mapa (negativa)');
  const passo = metrosPorDigito(digitos);
  const pad = (v) => String(Math.floor(v / passo)).padStart(digitos, '0');
  return espacado ? `${pad(x)} ${pad(y)}` : `${pad(x)}${pad(y)}`;
}

/**
 * String de grid → posição local em metros.
 * Devolve o CENTRO da célula por padrão (menor erro máximo quando alguém
 * passa "grid 123456" pelo rádio); `canto: true` dá o canto sudoeste.
 */
export function gridParaLocal(texto, { canto = false } = {}) {
  const s = String(texto).replace(/\s+/g, '');
  if (!/^\d+$/.test(s)) throw new SyntaxError(`grid local inválido: "${texto}"`);
  if (s.length % 2 !== 0) {
    throw new SyntaxError(`grid local: número ímpar de dígitos (${s.length}) em "${texto}"`);
  }
  const digitos = s.length / 2;
  if (digitos < 2 || digitos > 5) {
    throw new RangeError('grid local: use de 4 a 10 dígitos no total');
  }
  const passo = metrosPorDigito(digitos);
  const meia = canto ? 0 : passo / 2;
  return {
    x: Number(s.slice(0, digitos)) * passo + meia,
    y: Number(s.slice(digitos)) * passo + meia,
    digitos,
    tamanhoCelulaM: passo
  };
}

/**
 * Vetor de tiro DENTRO da grade local — plano, sem projeção nenhuma.
 * Num mapa de 30 km a Terra é plana o bastante: o erro de desprezar a
 * curvatura em 30 km é ~7 cm de flecha. Irrelevante.
 *
 * O azimute local é medido do norte da grade, sentido horário — igual ao
 * jogo e igual à carta.
 */
export function vetorLocal(peca, alvo) {
  const dE = alvo.x - peca.x;
  const dN = alvo.y - peca.y;
  const horizontal = Math.hypot(dE, dN);
  const deltaAlt = (alvo.alt ?? 0) - (peca.alt ?? 0);
  return {
    dE,
    dN,
    distanciaHorizontalM: horizontal,
    deltaAltM: deltaAlt,
    distanciaInclinadaM: Math.hypot(horizontal, deltaAlt),
    azimuteGradeDeg: (Math.atan2(dE, dN) * 180 / Math.PI + 360) % 360
  };
}

/* ─────────── ponte opcional grade local ⇄ mundo real ─────────── */

/**
 * Cria um quadro local amarrado ao mundo real. O canto SO do mapa é fixado
 * numa lat/lon; a partir daí, x/y locais viram easting/northing UTM.
 *
 * Uso real (não-jogo): montar uma grade de operação própria sobre uma área,
 * com origem numa referência combinada — é o que faz um grid de exercício.
 */
export function criarQuadro({ ancoraLat, ancoraLon, tamanhoM = 100000, nome = 'LOCAL' }) {
  const origem = latLonParaUTM(ancoraLat, ancoraLon);
  return {
    nome,
    tamanhoM,
    zona: origem.zona,
    banda: origem.banda,
    hemisferio: origem.hemisferio,
    origemE: origem.easting,
    origemN: origem.northing,

    /** local (m) → geográfico */
    paraLatLon(x, y) {
      return utmParaLatLon({
        zona: this.zona,
        hemisferio: this.hemisferio,
        easting: this.origemE + x,
        northing: this.origemN + y
      });
    },

    /** geográfico → local (m). Pode cair fora do mapa: confira com `dentro()`. */
    paraLocal(lat, lon) {
      const u = latLonParaUTM(lat, lon, this.zona);
      return { x: u.easting - this.origemE, y: u.northing - this.origemN };
    },

    dentro(x, y) {
      return x >= 0 && y >= 0 && x <= this.tamanhoM && y <= this.tamanhoM;
    }
  };
}

/** Quadro pronto para um terreno conhecido do Arma 3. */
export function quadroDeTerreno(id) {
  const t = TERRENOS[id];
  if (!t) throw new RangeError(`terreno desconhecido: ${id}`);
  return criarQuadro({
    ancoraLat: t.ancora.lat,
    ancoraLon: t.ancora.lon,
    tamanhoM: t.tamanhoM,
    nome: t.nome
  });
}
