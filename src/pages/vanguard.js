/**
 * /vanguard — Project Vanguard dentro do Baluarte.
 *
 * O Vanguard é o repo irmão: GPS topográfico tático + computador de tiro
 * (estética Arma 3). Esta página é a porta dele aqui — e não é um cartão de
 * visita: o computador de tiro e o conversor de coordenadas abaixo RODAM, com
 * o motor de verdade vendorizado em `src/utils/vanguard/`.
 *
 * Por que o motor roda no cliente e não numa API: ele é JS puro, zero
 * dependência, zero DOM (~12 kB gzip). Pela regra #238 (web = leve, app =
 * completo), cálculo puro é leve — vai pra web. O que fica app-only é o que
 * pesa: DEM para perfil de elevação, máscara de crista, tiles offline.
 *
 * ⚠️ Não confundir os dois modelos balísticos do repo:
 *   src/utils/arma3-balistica.js  tiro TENSO  — "dado o ângulo, onde cai?"
 *   src/utils/vanguard/           tiro CURVO  — "dado o alvo, qual o ângulo?"
 * São problemas inversos. Os dois usam a mesma formulação de arrasto, o que é
 * deliberado: um coeficiente calibrado num vale no outro.
 */

import '../styles/vanguard.css';
import { h } from '../utils/helpers.js';
import {
  resolverMissao, listarSistemas, latLonParaMGRS, mgrsParaLatLon,
  latLonParaUTM, VERSAO_MOTOR,
} from '../utils/vanguard/index.js';

/* Alvo de treino padrão: Altis, a ilha do Arma 3. Abre com uma missão
 * resolvida em vez de formulário vazio — dá pra ver o que a tela faz antes
 * de digitar qualquer coisa. */
const PADRAO = {
  peca: { lat: 39.8000, lon: 25.0000, alt: 20 },
  alvo: { lat: 39.8100, lon: 25.0150, alt: 65 },
};

const nUm = (v, casas = 0) => (Number.isFinite(v) ? v.toFixed(casas) : '—');

export function vanguardPage() {
  const page = h('div', { className: 'page-vanguard' });

  page.appendChild(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
      h('span', null, 'PROJECT VANGUARD')),
    h('h1', { className: 'page-header__title' }, '⌖ Project Vanguard'),
    h('p', { className: 'page-header__description' },
      'GPS topográfico tático + ',
      h('span', { className: 'u-text-cyan' }, 'computador de tiro'),
      ' — o repo irmão do Baluarte. O motor é ',
      h('span', { className: 'u-text-cyan' }, 'JS puro, zero dependência'),
      ', então roda aqui igual roda no app: mesma física, uma implementação só.')));

  page.appendChild(h('div', { className: 'card vg-aviso' },
    h('p', null,
      h('b', null, '⚠️ Ferramenta de treino e simulação. '),
      'Os dados de armamento são referência de modelo, ',
      h('b', null, 'não tabela de tiro oficial'),
      '. Serve para o Arma 3 e para estudo — não para emprego real.')));

  page.append(cardComputador(), cardCoordenadas(), cardArquitetura());
  return page;
}

/* ═══════════ computador de tiro ═══════════ */
function cardComputador() {
  const sistemas = listarSistemas();
  let sistemaId = sistemas[0].id;
  const campos = {
    pecaLat: PADRAO.peca.lat, pecaLon: PADRAO.peca.lon, pecaAlt: PADRAO.peca.alt,
    alvoLat: PADRAO.alvo.lat, alvoLon: PADRAO.alvo.lon, alvoAlt: PADRAO.alvo.alt,
    ventoVel: 0, ventoDir: 0,
  };

  const saida = h('div', { className: 'vg-saida' });

  function calcular() {
    let r;
    try {
      r = resolverMissao({
        schema: 'vanguard.fire-mission/1',
        peca: {
          pos: { tipo: 'latlon', lat: campos.pecaLat, lon: campos.pecaLon, alt: campos.pecaAlt },
          sistema: sistemaId,
        },
        alvo: { pos: { tipo: 'latlon', lat: campos.alvoLat, lon: campos.alvoLon, alt: campos.alvoAlt } },
        ambiente: { ventoVelocidadeMs: campos.ventoVel, ventoDirecaoDeg: campos.ventoDir },
      });
    } catch (err) {
      saida.replaceChildren(h('p', { className: 'vg-erro' }, `Erro no motor: ${err.message}`));
      return;
    }

    if (!r.ok) {
      saida.replaceChildren(h('div', { className: 'vg-erro' },
        h('b', null, 'Sem solução: '),
        h('ul', null, ...r.erros.map((e) => h('li', null, e)))));
      return;
    }

    const g = r.geometria, az = r.azimute;
    const preferida = r.solucoes.find((s) => s.preferida) || r.solucoes[0];

    saida.replaceChildren(
      h('div', { className: 'vg-grid' },
        leitura('Distância', `${nUm(g.distanciaHorizontalM)} m`, 'horizontal, na grade'),
        leitura('Azimute de grade', `${nUm(az.gradeMil)} mil`, `${nUm(az.gradeDeg, 1)}° · NATO 6400`),
        leitura('Desnível', `${g.deltaAltM >= 0 ? '+' : '−'}${nUm(Math.abs(g.deltaAltM))} m`,
          'alvo em relação à peça'),
        leitura('Convergência', `${nUm(az.convergenciaDeg, 2)}°`, 'grade → norte verdadeiro')),

      r.solucoes.length
        ? h('div', { className: 'vg-tabela-wrap' },
          h('table', { className: 'vg-tabela' },
            h('thead', null, h('tr', null,
              h('th', null, 'Carga'), h('th', null, 'v₀'), h('th', null, 'Elevação'),
              h('th', null, 'Tempo de voo'), h('th', null, 'Ápice'),
              h('th', null, 'Vel. impacto'), h('th', null, 'Raio de segurança'))),
            h('tbody', null, ...r.solucoes.map((s) => h('tr', {
              className: 'vg-tr' + (s.preferida ? ' is-preferida' : '')
            },
              h('td', null, String(s.carga), s.preferida
                ? h('span', { className: 'vg-tag' }, 'preferida') : null),
              h('td', null, `${nUm(s.v0)} m/s`),
              h('td', { className: 'vg-num' }, `${nUm(s.elevacaoMil)} mil`,
                h('span', { className: 'vg-u' }, ` ${nUm(s.elevacaoDeg, 1)}°`)),
              h('td', { className: 'vg-num' }, `${nUm(s.tempoVooS, 1)} s`),
              h('td', { className: 'vg-num' }, `${nUm(s.apiceM)} m`),
              h('td', { className: 'vg-num' }, `${nUm(s.velocidadeImpactoMs)} m/s`),
              h('td', { className: 'vg-num' }, `${nUm(s.zonaBatida.raioSegurancaM)} m`))))))
        : h('p', { className: 'vg-erro' },
          'Nenhuma carga alcança o alvo — distância fora do envelope deste sistema.'),

      preferida ? h('p', { className: 'vg-nota u-text-muted' },
        h('b', null, '⌖ Solução preferida: '),
        `carga ${preferida.carga}, elevação ${nUm(preferida.elevacaoMil)} mil, `,
        `azimute de GRADE ${nUm(az.gradeMil)} mil. `,
        h('b', null, 'Azimute de grade, não verdadeiro'),
        ' — é o que a bússola sobre a carta usa; a diferença aqui é ',
        `${nUm(az.convergenciaDeg, 2)}°.`) : null,

      r.avisos && r.avisos.length
        ? h('ul', { className: 'vg-avisos' }, ...r.avisos.map((a) => h('li', null, `⚠ ${a}`)))
        : null);
  }

  const num = (chave, min, max, passo) => h('input', {
    className: 'input vg-num-in', type: 'number', value: String(campos[chave]),
    min: String(min), max: String(max), step: String(passo),
    oninput: (e) => {
      const v = parseFloat(e.target.value);
      if (Number.isFinite(v)) { campos[chave] = v; calcular(); }
    },
  });

  const selSis = h('select', {
    className: 'input', onchange: (e) => { sistemaId = e.target.value; calcular(); }
  }, ...sistemas.map((s) => h('option', { value: s.id }, `${s.nome} — ${s.origem}`)));

  const box = h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' },
      h('b', null, '◎ Computador de tiro (morteiro)'),
      h('span', { className: 'vg-motor' }, `motor v${VERSAO_MOTOR}`)),
    h('p', { className: 'vg-oque' },
      'Resolve o problema INVERSO da balística: dado o alvo, qual a elevação. '
      + 'Integra arrasto e devolve o tempo de voo, o ápice e a zona batida — '
      + 'com a dispersão do sistema, não um ponto sem incerteza.'),
    h('div', { className: 'vg-campos' },
      h('label', null, h('span', null, 'Sistema'), selSis)),
    h('div', { className: 'vg-campos' },
      h('label', null, h('span', null, 'Peça — lat'), num('pecaLat', -90, 90, 0.0001)),
      h('label', null, h('span', null, 'lon'), num('pecaLon', -180, 180, 0.0001)),
      h('label', null, h('span', null, 'alt (m)'), num('pecaAlt', -500, 9000, 1)),
      h('label', null, h('span', null, 'Alvo — lat'), num('alvoLat', -90, 90, 0.0001)),
      h('label', null, h('span', null, 'lon'), num('alvoLon', -180, 180, 0.0001)),
      h('label', null, h('span', null, 'alt (m)'), num('alvoAlt', -500, 9000, 1))),
    h('div', { className: 'vg-campos' },
      h('label', null, h('span', null, 'Vento (m/s)'), num('ventoVel', 0, 60, 1)),
      h('label', null, h('span', null, 'Vento vem de (°)'), num('ventoDir', 0, 360, 5))),
    h('p', { className: 'vg-nota u-text-muted' },
      h('b', null, 'Convenção METAR: '),
      'a direção do vento é de ', h('b', null, 'ONDE ELE VEM'),
      ' — 270° é vento de oeste. É o erro clássico de quem integra vento.'),
    saida);

  calcular();
  return box;
}

function leitura(rot, valor, sub) {
  return h('div', { className: 'vg-leitura' },
    h('span', { className: 'vg-leitura__rot' }, rot),
    h('b', { className: 'vg-leitura__val' }, valor),
    h('span', { className: 'vg-leitura__sub u-text-muted' }, sub));
}

/* ═══════════ conversor de coordenadas ═══════════ */
function cardCoordenadas() {
  const saida = h('div', { className: 'vg-conv__saida' });
  const entrada = h('input', {
    className: 'input', type: 'text', value: '39.8000, 25.0000',
    placeholder: 'lat, lon  ou  MGRS (ex.: 35SKA1234567890)',
    oninput: (e) => converter(e.target.value),
  });

  function converter(texto) {
    const t = (texto || '').trim();
    if (!t) { saida.replaceChildren(); return; }
    let lat, lon;

    const par = t.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
    if (par) {
      lat = parseFloat(par[1]); lon = parseFloat(par[2]);
    } else {
      try {
        const p = mgrsParaLatLon(t);
        lat = p.lat; lon = p.lon;
      } catch (err) {
        saida.replaceChildren(h('p', { className: 'vg-erro' },
          `Não reconheci "${t}" — use "lat, lon" ou uma referência MGRS. (${err.message})`));
        return;
      }
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      saida.replaceChildren(h('p', { className: 'vg-erro' }, 'Coordenada fora do intervalo válido.'));
      return;
    }

    const utm = latLonParaUTM(lat, lon);
    saida.replaceChildren(h('div', { className: 'vg-grid' },
      leitura('MGRS (1 m)', latLonParaMGRS(lat, lon, 5, true), 'precisão de 1 metro'),
      leitura('MGRS (10 m)', latLonParaMGRS(lat, lon, 4, true), 'o que se passa no rádio'),
      leitura('UTM', `${utm.zona}${utm.banda || ''} ${Math.round(utm.easting)}E ${Math.round(utm.northing)}N`,
        `fuso ${utm.zona}`),
      leitura('Geográfica', `${lat.toFixed(5)}, ${lon.toFixed(5)}`, 'WGS-84 decimal')));
  }

  const box = h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' }, h('b', null, '⊞ Conversor de coordenadas')),
    h('p', { className: 'vg-oque' },
      'MGRS ⇄ UTM ⇄ geográfica, com a mesma implementação que o app usa. '
      + 'Aceita "lat, lon" ou a referência MGRS colada do jogo.'),
    h('div', { className: 'vg-campos' },
      h('label', { className: 'vg-campo--largo' }, h('span', null, 'Coordenada'), entrada)),
    saida);

  converter(entrada.value);
  return box;
}

/* ═══════════ o que é e onde mora ═══════════ */
function cardArquitetura() {
  const item = (t, d) => h('li', null, h('b', null, t), ' — ', d);
  return h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' }, h('b', null, '⧉ Como o Vanguard acopla aqui')),
    h('p', { className: 'vg-oque' },
      'O motor (coordenadas, balística, contrato JSON) é copiado para ',
      h('code', null, 'src/utils/vanguard/'),
      '. Não tem dependência nem DOM, então "instalar" é copiar — e a mesma '
      + 'física roda no navegador, no Node e numa função serverless sem ninguém '
      + 'reimplementar nada.'),
    h('div', { className: 'vg-cols' },
      h('div', null,
        h('span', { className: 'vg-label' }, 'NA WEB (leve)'),
        h('ul', { className: 'vg-lista' },
          item('Motor inteiro', 'matemática pura, ~12 kB gzip'),
          item('Computador de tiro', 'formulário e números — é esta página'),
          item('Conversor MGRS/UTM', 'mesma implementação, testada'),
          item('Mapa com grade', 'o MapLibre já roda no /mapa'))),
      h('div', null,
        h('span', { className: 'vg-label' }, 'SÓ NO APP (pesado, #238)'),
        h('ul', { className: 'vg-lista' },
          item('Perfil de elevação', 'exige DEM — dado grande'),
          item('Máscara de crista', 'idem, e cálculo por tile'),
          item('Tiles offline por área', 'armazenamento grande'),
          item('Rastreio em segundo plano', 'exige plugin nativo')))),
    h('p', { className: 'vg-nota u-text-muted' },
      h('b', null, 'Camadas de mapa compartilhadas: '),
      'as fontes de tile do ', h('a', { href: '#/mapa' }, '/mapa'),
      ' vivem em ', h('code', null, 'src/data/camadas-mapa.js'),
      ' — arquivo de API idêntica nos dois repositórios, como o ',
      h('code', null, 'helpers.js'), '. Camada nova entra nos dois de uma vez.'),
    h('div', { className: 'vg-acoes' },
      h('a', {
        className: 'btn btn--primary', target: '_blank', rel: 'noopener noreferrer',
        href: 'https://github.com/Lucas-Belucci-Bellini/Project-Vanguard',
      }, '⧉ Repositório do Project Vanguard'),
      h('a', { className: 'btn', href: '#/mapa' }, '🗺 Mapa Tático Mundial')));
}
