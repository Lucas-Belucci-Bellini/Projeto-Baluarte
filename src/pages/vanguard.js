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
  latLonParaUTM, gridVector, VERSAO_MOTOR,
} from '../utils/vanguard/index.js';
/* O mapa tático usa as MESMAS peças do /mapa: loader único do MapLibre e o
 * catálogo de camadas compartilhado com o repo do Vanguard. */
import { loadMapLibre } from '../utils/maplibre-loader.js';
import { estiloMapLibre } from '../data/camadas-mapa.js';
/* A ponte entre os dois projetos: dado medido do Baluarte + modelo de tiro
 * tenso, no formato de cartão que o Vanguard usa. */
import { A3ARM } from '../data/arma3-armas.js';
import { dadosBalisticos, tabelaQueda, milRadParaMilNato } from '../utils/arma3-balistica.js';
/* Terrenos REAIS do dump (grade de cada mundo, literal do config) + o
 * conversor que respeita o sinal do passo — ver arma3-grade.js. */
import { A3TER } from '../data/arma3-terrenos.js';
import {
  azimuteGrau, distanciaM, dentroDoMundo, gradeParaMetros, grauParaMilNato,
  grauParaMrad, metrosParaGrade,
} from '../utils/arma3-grade.js';

/* Alvo de treino padrão: Altis, a ilha do Arma 3. Abre com uma missão
 * resolvida em vez de formulário vazio — dá pra ver o que a tela faz antes
 * de digitar qualquer coisa. */
const PADRAO = {
  peca: { lat: 39.8000, lon: 25.0000, alt: 20 },
  alvo: { lat: 39.8100, lon: 25.0150, alt: 65 },
};

const nUm = (v, casas = 0) => (Number.isFinite(v) ? v.toFixed(casas) : '—');

/* Ponte mapa → computador de tiro. Os dois cards vivem neste módulo; o
 * cardComputador registra `aplicar` e o mapa chama quando o operador pede
 * "levar para o computador". Sem evento global, sem estado fora da página. */
const ponteComputador = {};

export function vanguardPage(args = {}) {
  const page = h('div', { className: 'page-vanguard' });
  const terrenoPedido = (args.query || {}).terreno;

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

  page.append(cardMapaTatico(), cardTerreno(terrenoPedido), cardComputador(),
    cardMrad(), cardCoordenadas(), cardArquitetura());
  return page;
}

/* ═══════════ mapa tático — a tela #/mapa do Vanguard, dentro do Baluarte ═══════════
 *
 * Mesmo fluxo do app irmão (project-vanguard-cyan.vercel.app/#/mapa): marcar
 * PEÇA e ALVO no mapa, ler MGRS de cada um e o VETOR DE TIRO (azimute de
 * grade + distância), e despejar tudo no computador de tiro logo abaixo.
 *
 * Nada aqui é reimplementação: o vetor vem do `gridVector()` vendorado — o
 * mesmo que reprojeta o alvo no fuso UTM da peça quando os dois caem em
 * fusos diferentes — e as camadas vêm do catálogo compartilhado entre os
 * dois repos. A ALTITUDE é manual: a web não tem DEM (regra #238 — o perfil
 * de elevação é do app); o campo existe e diz de onde o número veio: de você.
 */
function cardMapaTatico() {
  let modo = null;          // 'peca' | 'alvo' | null
  let peca = null;          // { lat, lon }
  let alvo = null;
  let altPeca = 0, altAlvo = 0;
  let mapa = null;
  let mkPeca = null, mkAlvo = null;

  const elMapa = h('div', { className: 'vg-mapa' });
  const roPeca = h('div', { className: 'vg-leitura' });
  const roAlvo = h('div', { className: 'vg-leitura' });
  const roVetor = h('div', null);

  const fmt = (p) => `${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}`;

  function leituraPonto(el, rotulo, p, alt) {
    el.replaceChildren(
      h('span', { className: 'vg-leitura__rot' }, rotulo),
      p ? h('b', { className: 'vg-leitura__val' }, latLonParaMGRS(p.lat, p.lon, 5, true))
        : h('b', { className: 'vg-leitura__val u-text-muted' }, '— clique no mapa —'),
      h('span', { className: 'vg-leitura__sub u-text-muted' },
        p ? `${fmt(p)} · alt ${alt} m (manual)` : ''));
  }

  function recalcVetor() {
    leituraPonto(roPeca, '◆ Peça', peca, altPeca);
    leituraPonto(roAlvo, '✳ Alvo', alvo, altAlvo);
    if (!peca || !alvo) {
      roVetor.replaceChildren(h('p', { className: 'vg-nota u-text-muted' },
        'Marque a peça e o alvo para o vetor de tiro aparecer.'));
      return;
    }
    const v = gridVector({ ...peca, alt: altPeca }, { ...alvo, alt: altAlvo });
    roVetor.replaceChildren(
      h('div', { className: 'vg-grid' },
        leitura('Azimute de grade', `${nUm(grauParaMilNato(v.azimuteGradeDeg))} mil`,
          `${nUm(v.azimuteGradeDeg, 2)}° · NATO 6400 · fuso ${v.zona}`),
        leitura('Distância', v.distanciaHorizontalM >= 10000
          ? `${(v.distanciaHorizontalM / 1000).toFixed(2)} km`
          : `${nUm(v.distanciaHorizontalM)} m`,
        `no terreno · inclinada ${v.distanciaInclinadaM >= 10000
          ? (v.distanciaInclinadaM / 1000).toFixed(2) + ' km'
          : nUm(v.distanciaInclinadaM) + ' m'}`),
        leitura('Desnível', `${v.deltaAltM >= 0 ? '+' : '−'}${Math.abs(v.deltaAltM)} m`,
          'das altitudes manuais')),
      h('button', {
        className: 'btn btn--primary vg-mapa__levar',
        onclick: () => {
          if (ponteComputador.aplicar) {
            ponteComputador.aplicar(
              { lat: peca.lat, lon: peca.lon, alt: altPeca },
              { lat: alvo.lat, lon: alvo.lon, alt: altAlvo });
          }
        },
      }, '▶ Levar para o computador de tiro'));
  }

  function marcar(ml, lngLat) {
    const p = { lat: lngLat.lat, lon: lngLat.lng };
    if (modo === 'peca') {
      peca = p;
      if (!mkPeca) {
        mkPeca = new ml.Marker({ color: '#00e5ff' }).setLngLat(lngLat).addTo(mapa);
      } else mkPeca.setLngLat(lngLat);
    } else if (modo === 'alvo') {
      alvo = p;
      if (!mkAlvo) {
        mkAlvo = new ml.Marker({ color: '#ff9f1a' }).setLngLat(lngLat).addTo(mapa);
      } else mkAlvo.setLngLat(lngLat);
    }
    recalcVetor();
  }

  const btnModo = (id, rotulo) => {
    const b = h('button', {
      className: 'btn vg-mapa__modo', dataset: { modo: id },
      onclick: () => {
        modo = modo === id ? null : id;
        barra.querySelectorAll('.vg-mapa__modo').forEach((x) =>
          x.classList.toggle('btn--primary', x.dataset.modo === modo));
      },
    }, rotulo);
    return b;
  };

  const altIn = (valor, set) => h('input', {
    className: 'input vg-num-in vg-mapa__alt', type: 'number',
    value: String(valor), step: '1', min: '-500', max: '9000',
    oninput: (e) => {
      const x = parseFloat(e.target.value);
      if (Number.isFinite(x)) { set(x); recalcVetor(); }
    },
  });

  const barra = h('div', { className: 'vg-campos vg-mapa__barra' },
    btnModo('peca', '◆ Marcar peça'),
    btnModo('alvo', '✳ Marcar alvo'),
    h('label', null, h('span', null, 'Alt. peça (m)'), altIn(altPeca, (v) => { altPeca = v; })),
    h('label', null, h('span', null, 'Alt. alvo (m)'), altIn(altAlvo, (v) => { altAlvo = v; })));

  const box = h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' },
      h('b', null, '🗺️ Mapa tático — peça e alvo no mundo real'),
      h('a', {
        className: 'vg-motor', href: 'https://project-vanguard-cyan.vercel.app/#/mapa',
        target: '_blank', rel: 'noopener noreferrer',
      }, 'abrir o Vanguard completo ↗')),
    h('p', { className: 'vg-oque' },
      'A tela de mapa do Vanguard, rodando aqui com o mesmo motor: clique para '
      + 'marcar ', h('b', null, 'peça'), ' e ', h('b', null, 'alvo'),
      ', leia o MGRS de cada um e o vetor de tiro — azimute de ',
      h('b', null, 'GRADE'), ' (reprojetado no fuso da peça quando os dois caem '
      + 'em fusos diferentes) e distância corrigida do fator de escala. '
      + 'Depois é um clique para despejar tudo no computador de tiro abaixo.'),
    barra, elMapa,
    h('div', { className: 'vg-grid vg-mapa__ro' }, roPeca, roAlvo),
    roVetor,
    h('p', { className: 'vg-nota u-text-muted' },
      'Altitude é manual porque a web não tem o modelo de elevação (DEM) — '
      + 'ele é do app, junto com o perfil de crista. Camadas de tile do mesmo '
      + 'catálogo compartilhado dos dois repos.'));

  recalcVetor();

  loadMapLibre().then((ml) => {
    if (!ml) {
      elMapa.replaceChildren(h('p', { className: 'vg-erro' },
        'Não deu para baixar o MapLibre (rede/CDN). Os campos manuais do '
        + 'computador de tiro abaixo continuam funcionando.'));
      return;
    }
    mapa = new ml.Map({
      container: elMapa,
      style: estiloMapLibre({ base: 'terreno', overlays: [] }),
      center: [-43.19, -22.95],
      zoom: 11,
      attributionControl: { compact: true },
    });
    mapa.addControl(new ml.NavigationControl({ showCompass: true }), 'bottom-right');
    mapa.on('click', (e) => marcar(ml, e.lngLat));
  });

  return box;
}

/* ═══════════ azimute de grade nos terrenos do Arma 3 ═══════════
 *
 * A pergunta que motivou o card: "com o Vanguard ligado no Baluarte, dá pra
 * calcular ângulo nos mapas do dump?" Dá — porque o dump traz a grade REAL
 * de cada mundo (offset e passo por eixo, literal do config), e o passo tem
 * SINAL: 30 dos 31 mundos contam o northing de cima pra baixo, 1 conta pra
 * cima. O conversor consome o sinal; aqui só se digita grade como no jogo.
 *
 * O que o card NÃO faz, e diz que não faz: elevação. O dump não traz o DEM
 * dos terrenos, então não há diferença de altitude nem crista — azimute e
 * distância são planos, como a bússola do jogo.
 */
function cardTerreno(terrenoPedido) {
  const terrenos = [...A3TER].filter((t) => t.grade)
    .sort((a, b) => (a.ehMod - b.ehMod)
      || a.nome.localeCompare(b.nome, 'pt-BR')
      || a.classe.localeCompare(b.classe));
  if (!terrenos.length) return h('div', null);

  const armas = A3ARM.filter((a) => dadosBalisticos(a))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  let terrenoId = (terrenos.find((t) => t.id === terrenoPedido)
    || terrenos.find((t) => t.classe === 'Altis') || terrenos[0]).id;
  let armaId = '';
  let zero = 300;

  /* Abre resolvido, no estilo da página: duas grades geradas DO PRÓPRIO
   * terreno (centro e ~1,5 km a nordeste), não digitadas de memória. */
  function gradesIniciais(t) {
    const g = t.grade;
    const meioM = (t.tamanhoM || Math.abs(g.passoX) * 10 ** g.digitos) / 2;
    const a = metrosParaGrade(meioM, meioM, g);
    const b = metrosParaGrade(meioM + 1200, meioM + 900, g);
    return { a: a || '', b: b || '' };
  }

  const ini = gradesIniciais(terrenos.find((t) => t.id === terrenoId));
  let gradePeca = ini.a;
  let gradeAlvo = ini.b;

  const saida = h('div', null);

  function recalc() {
    const t = terrenos.find((x) => x.id === terrenoId) || terrenos[0];
    const g = t.grade;
    const peca = gradeParaMetros(gradePeca, g);
    const alvo = gradeParaMetros(gradeAlvo, g);

    if (!peca || !alvo) {
      saida.replaceChildren(h('p', { className: 'vg-nota u-text-muted' },
        'Digite as duas grades como no mapa do jogo: número PAR de dígitos '
        + '(4 a 10), metade easting, metade northing — ex.: ',
        h('code', null, '034056'), ' ou ', h('code', null, '03450560'), '.'));
      return;
    }

    const dist = distanciaM(peca, alvo);
    const az = azimuteGrau(peca, alvo);
    const retro = (az + 180) % 360;
    const dentroP = dentroDoMundo(peca, t.tamanhoM);
    const dentroA = dentroDoMundo(alvo, t.tamanhoM);

    const linhaAz = (rotulo, grau) => h('tr', { className: 'vg-tr' },
      h('td', null, rotulo),
      h('td', { className: 'vg-num' }, h('b', null, grau.toFixed(1)), h('span', { className: 'vg-u' }, '°')),
      h('td', { className: 'vg-num' }, h('b', null, grauParaMilNato(grau).toFixed(0)), h('span', { className: 'vg-u' }, ' mil')),
      h('td', { className: 'vg-num' }, grauParaMrad(grau).toFixed(0), h('span', { className: 'vg-u' }, ' mrad')));

    const filhos = [
      h('p', { className: 'vg-nota' },
        h('b', null, t.nome), ` (${t.classe})`,
        t.tamanhoM ? ` · ${(t.tamanhoM / 1000).toFixed(1)} km de lado` : ' · tamanho não declarado no config',
        ` · célula de ${Math.abs(g.passoX)} m`,
        g.passoY < 0 ? ' · northing conta do norte pra baixo (vanilla)' : ' · northing conta pra cima'),

      h('div', { className: 'vg-tabela-wrap' },
        h('table', { className: 'vg-tabela' },
          h('thead', null, h('tr', null,
            h('th', null, ''), h('th', null, 'Graus'),
            h('th', null, 'mil NATO (6400)'), h('th', null, 'MRAD (6283)'))),
          h('tbody', null,
            linhaAz('Azimute peça → alvo', az),
            linhaAz('Retro-azimute', retro)))),

      h('p', { className: 'vg-nota' },
        h('b', null, 'Distância: '), h('b', null, `${dist.toFixed(0)} m`),
        dist >= 1000 ? ` (${(dist / 1000).toFixed(2)} km)` : ''),
    ];

    if (dentroP === false || dentroA === false) {
      filhos.push(h('p', { className: 'vg-nota' },
        '⚠️ ', dentroP === false ? 'A grade da peça cai fora do mundo. ' : '',
        dentroA === false ? 'A grade do alvo cai fora do mundo.' : ''));
    }

    if (armaId) {
      const a = armas.find((x) => x.id === armaId);
      const bal = a && dadosBalisticos(a);
      if (bal) {
        const [linha] = tabelaQueda({ ...bal, zero, vento: 0 }, [dist]);
        const corr = -linha.mils;
        filhos.push(h('p', { className: 'vg-nota' },
          h('b', null, `🎯 ${a.nome}`), ` zerada a ${zero} m, nesta distância: `,
          h('b', null, `${corr >= 0 ? '+' : '−'}${Math.abs(corr).toFixed(2)} mrad`),
          ` (${corr >= 0 ? '+' : '−'}${Math.abs(milRadParaMilNato(corr)).toFixed(2)} mil NATO)`,
          ` · tempo de voo ${linha.t.toFixed(2)} s · chega a ${linha.v.toFixed(0)} m/s`));
      }
    }

    filhos.push(h('p', { className: 'vg-nota u-text-muted' },
      'Azimute de GRADE do mapa do jogo, plano — o dump não traz o relevo '
      + '(DEM), então diferença de altitude e crista não entram. Grade e '
      + 'convenção de northing vêm do config de cada mundo, medidas, não '
      + 'assumidas.'));

    saida.replaceChildren(...filhos);
  }

  const selTerreno = h('select', {
    className: 'input', onchange: (e) => {
      terrenoId = e.target.value;
      const novo = gradesIniciais(terrenos.find((t) => t.id === terrenoId));
      gradePeca = novo.a; gradeAlvo = novo.b;
      inPeca.value = gradePeca; inAlvo.value = gradeAlvo;
      recalc();
    },
  }, ...terrenos.map((t) => h('option', { value: t.id, selected: t.id === terrenoId },
    `${t.nome}${t.nome !== t.classe ? ` (${t.classe})` : ''} — `
    + `${t.ehMod ? t.dlc : t.dlc}${t.tamanhoM ? ` · ${(t.tamanhoM / 1000).toFixed(0)} km` : ''}`)));

  const inGrade = (valor, set) => h('input', {
    className: 'input vg-num-in', type: 'text', value: valor,
    placeholder: '034056', spellcheck: 'false',
    oninput: (e) => { set(e.target.value); recalc(); },
  });
  const inPeca = inGrade(gradePeca, (v) => { gradePeca = v; });
  const inAlvo = inGrade(gradeAlvo, (v) => { gradeAlvo = v; });

  const selArma = h('select', {
    className: 'input', onchange: (e) => { armaId = e.target.value; recalc(); },
  }, h('option', { value: '' }, '— sem arma (só azimute) —'),
  ...armas.map((a) => h('option', { value: a.id },
    `${a.nome}${a.calibre ? ' — ' + a.calibre : ''}`)));

  const inZero = h('input', {
    className: 'input vg-num-in', type: 'number', value: String(zero),
    min: '25', max: '2000', step: '25',
    oninput: (e) => {
      const x = parseFloat(e.target.value);
      if (Number.isFinite(x)) { zero = Math.max(25, Math.min(2000, x)); recalc(); }
    },
  });

  const box = h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' },
      h('b', null, '🧭 Azimute de grade — terrenos do Arma 3'),
      h('span', { className: 'vg-motor' },
        `${terrenos.length} terrenos com grade medida`)),
    h('p', { className: 'vg-oque' },
      'Duas grades do mapa do jogo → azimute em ',
      h('b', null, 'mil NATO e MRAD'),
      ', distância e retro-azimute. A grade de cada mundo (offset, passo e '
      + 'DIREÇÃO do northing) vem medida do config — é o que faz o eixo N-S '
      + 'sair certo em mundo vanilla e em mod.'),
    h('div', { className: 'vg-campos' },
      h('label', { className: 'vg-campo--largo' }, h('span', null, 'Terreno'), selTerreno),
      h('label', null, h('span', null, 'Grade da peça'), inPeca),
      h('label', null, h('span', null, 'Grade do alvo'), inAlvo),
      h('label', { className: 'vg-campo--largo' }, h('span', null, 'Arma (opcional)'), selArma),
      h('label', null, h('span', null, 'Zeragem (m)'), inZero)),
    saida);

  recalc();
  return box;
}

/* ═══════════ cartão de tiro MRAD (tiro tenso) ═══════════
 *
 * É aqui que os dois projetos se encostam de verdade: os NÚMEROS vêm da
 * extração do Baluarte (`arma3-armas.js`, medidos no config do jogo) e o
 * MODELO vem do `arma3-balistica.js`; o Vanguard entra com o formato de
 * cartão de tiro, que é como se usa isso em campo.
 *
 * ⚠️ MRAD ≠ mil NATO. O retículo das miras do Arma é em MILIRRADIANO
 * (2π·1000 ≈ 6283 por volta, 1 mrad = 1 m a 1000 m). O mil NATO divide a
 * volta em 6400, então 1 mrad ≈ 1,019 mil NATO. Parece arredondamento e não
 * é: a 1000 m a diferença passa de 1,8 m. As duas colunas aparecem lado a
 * lado justamente pra ninguém usar uma achando que é a outra.
 */
const DISTANCIAS_CARTAO = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1200, 1500];

function cardMrad() {
  const armas = A3ARM.filter((a) => dadosBalisticos(a))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  if (!armas.length) return h('div', null);

  let armaId = (armas.find((a) => a.classe === 'srifle_LRR_F')
    || armas.find((a) => a.tipo === 'sniper') || armas[0]).id;
  let zero = 300;
  let vento = 0;

  const saida = h('div', null);

  function recalc() {
    const a = armas.find((x) => x.id === armaId) || armas[0];
    const bal = dadosBalisticos(a);
    /* Não adianta pedir cartão até 1500 m de uma pistola: corta no zeroing
     * que o config declara pra arma, que é o alcance que o jogo assume. */
    const limite = a.zeroing || 1000;
    const dists = DISTANCIAS_CARTAO.filter((d) => d <= Math.max(limite, zero));
    const linhas = tabelaQueda({ ...bal, zero, vento }, dists);

    saida.replaceChildren(
      h('p', { className: 'vg-nota u-text-muted' },
        h('b', null, a.nome), ' · v₀ ', h('b', null, `${bal.initSpeed} m/s`),
        ' · airFriction ', h('code', null, String(bal.airFriction)),
        bal.fonte === 'config' ? ' (medido no config)' : ' (arrasto estimado pela família do calibre)',
        a.dispersaoCm100 ? ` · dispersão ${a.dispersaoCm100} cm a 100 m` : '',
        ` · zeragem máx. do config ${limite} m`),

      a.miras && a.miras.length
        ? h('p', { className: 'vg-nota' },
          h('b', null, '🔭 Miras que aparecem montadas nesta arma: '),
          a.miras.join(' · '),
          a.acessorios && a.acessorios.length ? ` — e ${a.acessorios.join(', ')}` : '',
          h('span', { className: 'u-text-muted' },
            ' (do config: são as variantes pré-montadas. A AMPLIAÇÃO de cada mira '
            + 'ainda não está aqui — depende do dump do catálogo.)'))
        : h('p', { className: 'vg-nota u-text-muted' },
          '🔭 Esta arma não tem variante com mira pré-montada no config — o que '
          + 'não quer dizer que não aceite mira.'),

      h('div', { className: 'vg-tabela-wrap' },
        h('table', { className: 'vg-tabela' },
          h('thead', null, h('tr', null,
            h('th', null, 'Distância'),
            h('th', null, 'Queda'),
            h('th', null, 'Correção MRAD'),
            h('th', null, 'mil NATO'),
            h('th', null, 'Vento 1 m/s'),
            h('th', null, 'Tempo'),
            h('th', null, 'Vel.'))),
          h('tbody', null, ...linhas.map((r) => {
            const alvo = Math.abs(r.d - zero) < 1;
            /* A correção é o OPOSTO da queda: se a bala cai 2 mrad, sobe-se
             * 2 mrad no retículo. Mostrar a queda com o sinal dela e chamar
             * de "correção" seria o erro clássico. */
            const corr = -r.mils;
            return h('tr', { className: 'vg-tr' + (alvo ? ' is-preferida' : '') },
              h('td', null, `${r.d} m`, alvo ? h('span', { className: 'vg-tag' }, 'zerada') : null),
              h('td', { className: 'vg-num' }, `${r.quedaCm >= 0 ? '+' : '−'}${Math.abs(r.quedaCm).toFixed(0)} cm`),
              h('td', { className: 'vg-num' },
                h('b', null, `${corr >= 0 ? '+' : '−'}${Math.abs(corr).toFixed(2)}`),
                h('span', { className: 'vg-u' }, ' mrad')),
              h('td', { className: 'vg-num' },
                `${corr >= 0 ? '+' : '−'}${Math.abs(milRadParaMilNato(corr)).toFixed(2)}`),
              h('td', { className: 'vg-num' }, vento
                ? `${r.derivaCm >= 0 ? '→' : '←'} ${Math.abs(r.derivaCm / (vento || 1)).toFixed(0)} cm`
                : h('span', { className: 'vg-u' }, '—')),
              h('td', { className: 'vg-num' }, `${r.t.toFixed(2)} s`),
              h('td', { className: 'vg-num' }, `${r.v.toFixed(0)} m/s`));
          })))),

      h('p', { className: 'vg-nota u-text-muted' },
        h('b', null, 'Como usar: '),
        'a coluna MRAD é o quanto SUBIR no retículo (ou o mil-dot em que segurar). '
        + 'Positivo = mirar acima do alvo. A coluna de vento é por 1 m/s de vento '
        + 'travessal — multiplique pela velocidade real.'));
  }

  const sel = h('select', {
    className: 'input', onchange: (e) => { armaId = e.target.value; recalc(); }
  }, ...armas.map((a) => h('option', { value: a.id, selected: a.id === armaId },
    `${a.nome}${a.calibre ? ' — ' + a.calibre : ''}`)));

  const numIn = (v, min, max, passo, set) => h('input', {
    className: 'input vg-num-in', type: 'number', value: String(v),
    min: String(min), max: String(max), step: String(passo),
    oninput: (e) => {
      const x = parseFloat(e.target.value);
      if (Number.isFinite(x)) { set(Math.max(min, Math.min(max, x))); recalc(); }
    },
  });

  const box = h('div', { className: 'card vg-card' },
    h('div', { className: 'vg-card__head' },
      h('b', null, '🎯 Cartão de tiro MRAD (tiro tenso)'),
      h('span', { className: 'vg-motor' }, `${armas.length} armas com balística`)),
    h('p', { className: 'vg-oque' },
      'O outro problema, o inverso do computador acima: aqui o ângulo é dado '
      + '(a arma está zerada) e a pergunta é onde a bala cai. Os números vêm da '
      + 'extração do Arma 3 — v₀ e arrasto MEDIDOS no config, arma por arma.'),
    h('div', { className: 'vg-campos' },
      h('label', { className: 'vg-campo--largo' }, h('span', null, 'Arma'), sel),
      h('label', null, h('span', null, 'Zeragem (m)'), numIn(zero, 25, 2000, 25, (v) => { zero = v; })),
      h('label', null, h('span', null, 'Vento travessal (m/s)'), numIn(vento, -20, 20, 1, (v) => { vento = v; }))),
    saida);

  recalc();
  return box;
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

  /* Guardados por chave pra que o mapa tático consiga reescrever os campos —
   * ver ponteComputador.aplicar abaixo. */
  const entradas = {};
  const num = (chave, min, max, passo) => {
    const el = h('input', {
      className: 'input vg-num-in', type: 'number', value: String(campos[chave]),
      min: String(min), max: String(max), step: String(passo),
      oninput: (e) => {
        const v = parseFloat(e.target.value);
        if (Number.isFinite(v)) { campos[chave] = v; calcular(); }
      },
    });
    entradas[chave] = el;
    return el;
  };

  const selSis = h('select', {
    className: 'input', onchange: (e) => { sistemaId = e.target.value; calcular(); }
  }, ...sistemas.map((s) => h('option', { value: s.id }, `${s.nome} — ${s.origem}`)));

  /* Ponte com o mapa tático: ele marca peça e alvo, aqui recebe. Os campos
   * são escritos NOS INPUTS também, não só no estado — senão a tela mostraria
   * a coordenada antiga com o resultado novo, que é pior que não ligar nada. */
  ponteComputador.aplicar = (p, a) => {
    campos.pecaLat = p.lat; campos.pecaLon = p.lon; campos.pecaAlt = p.alt;
    campos.alvoLat = a.lat; campos.alvoLon = a.lon; campos.alvoAlt = a.alt;
    Object.entries(entradas).forEach(([k, el]) => { el.value = String(campos[k]); });
    calcular();
    box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

    /* Separa por vírgula/ponto-e-vírgula/espaço com UMA classe de caractere.
     *
     * A versão anterior usava `/^\s*(num)\s*[,;\s]\s*(num)\s*$/` e era um
     * ReDoS polinomial de verdade (CodeQL pegou, e dá pra medir): num run de
     * espaços, cada espaço pode casar com `\s*`, com `[,;\s]` ou com o `\s*`
     * seguinte, então uma entrada que falha no fim faz o motor tentar as
     * O(n²) divisões — 16 mil espaços colados no campo travavam a aba por
     * ~240 ms, e o texto vem direto de um <input>.
     *
     * `split` numa classe única não tem essa ambiguidade (é varredura linear,
     * não backtracking): os mesmos 16 mil espaços passaram a levar 0,02 ms.
     *
     * Quem valida número agora é o `Number()`, que é um pouco MAIS permissivo
     * que o regex era — aceita "1e5" e "0x10". Não é problema: o que decide se
     * a coordenada presta é a checagem de intervalo logo abaixo (|lat| ≤ 90,
     * |lon| ≤ 180), e ela pega qualquer um desses. */
    const campos = t.split(/[\s,;]+/).filter(Boolean);
    if (campos.length === 2 && campos.every((c) => c !== '' && Number.isFinite(Number(c)))) {
      lat = Number(campos[0]); lon = Number(campos[1]);
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
