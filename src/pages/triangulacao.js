/**
 * Página /triangulacao — Triangulação por rumos (bearings).
 *
 * Conceito dos repos alexflint/triangulation e vandroogenbroeck/triangulation:
 * estações em posições conhecidas medem o ÂNGULO até um alvo; o cruzamento das
 * retas dá a posição. Com ruído, resolvemos por mínimos quadrados (triangulation.js).
 *
 * Demo interativa: arraste o alvo no campo; cada estação "mede" o rumo com ruído
 * ajustável e o ponto estimado (ciano) aparece junto do alvo real (magenta).
 */

import '../styles/triangulacao.css';
import { h, empty } from '../utils/helpers.js';
import { triangulate, bearingTo, gaussianNoise, dist } from '../utils/triangulation.js';

/* Posições das estações (normalizadas 0..1) por quantidade. */
const PRESETS = {
  3: [[0.15, 0.82], [0.85, 0.82], [0.5, 0.14]],
  4: [[0.12, 0.85], [0.88, 0.85], [0.12, 0.2], [0.88, 0.2]],
  5: [[0.12, 0.85], [0.88, 0.85], [0.12, 0.2], [0.88, 0.2], [0.5, 0.12]]
};

export function triangulacaoPage() {
  const page = h('div', { className: 'page-tri' });
  page.append(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'TRIANGULAÇÃO')),
    h('h1', { className: 'page-header__title' }, '△ Triangulação'),
    h('p', { className: 'page-header__description' },
      'Localização por cruzamento de rumos. ',
      h('span', { className: 'u-text-cyan' }, 'Arraste o alvo'),
      ' — as estações medem o ângulo com ruído e o ponto é estimado por mínimos quadrados.')));

  const canvas = h('canvas', { className: 'tri-canvas', width: 640, height: 420 });
  let nStations = 4;
  let sigmaDeg = 4;
  let target = { x: 320, y: 230 };

  /* Stats refs */
  const refs = {};
  const stat = (key, label) => {
    const v = h('span', { className: 'tri-stat__val u-mono' }, '—');
    refs[key] = v;
    return h('div', { className: 'tri-stat' }, h('span', { className: 'tri-stat__lbl' }, label), v);
  };
  const statsBar = h('div', { className: 'tri-stats card' },
    stat('est', 'ESTIMADO'), stat('real', 'REAL'), stat('err', 'ERRO'), stat('res', 'RESÍDUO'));
  const setStat = (k, val) => { if (refs[k]) refs[k].textContent = val; };

  /* Controles */
  const sigmaVal = h('span', { className: 'tri-slider__val u-mono' }, `${sigmaDeg}°`);
  const sigmaSlider = h('input', {
    type: 'range', min: 0, max: 15, step: 0.5, value: sigmaDeg, className: 'tri-slider',
    oninput: (e) => { sigmaDeg = parseFloat(e.target.value); sigmaVal.textContent = `${sigmaDeg}°`; }
  });
  const stationBtns = h('div', { className: 'tri-seg' },
    ...[3, 4, 5].map((n) => h('button', {
      className: 'tri-seg__btn' + (n === nStations ? ' is-active' : ''), 'data-n': n,
      onclick: (e) => {
        nStations = n;
        stationBtns.querySelectorAll('.tri-seg__btn').forEach((b) => b.classList.toggle('is-active', Number(b.dataset.n) === n));
      }
    }, `${n} estações`)));

  const controls = h('div', { className: 'tri-controls card' },
    h('div', { className: 'tri-ctrl-row' }, h('span', { className: 'tri-ctrl__lbl' }, 'ESTAÇÕES'), stationBtns),
    h('div', { className: 'tri-ctrl-row' },
      h('span', { className: 'tri-ctrl__lbl' }, 'RUÍDO'),
      h('div', { className: 'tri-slider-wrap' }, sigmaSlider, sigmaVal)));

  page.append(statsBar, controls, h('div', { className: 'tri-scope card' },
    h('div', { className: 'tri-scope__head' }, h('span', null, '◎ CAMPO'),
      h('span', { className: 'u-text-muted u-mono' }, 'estação ▦ · alvo ● · estimado ✛')), canvas));

  /* ===== Interação: arrastar o alvo ===== */
  let dragging = false;
  const setTargetFromEvent = (ev) => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width, sy = canvas.height / rect.height;
    target = { x: (ev.clientX - rect.left) * sx, y: (ev.clientY - rect.top) * sy };
  };
  canvas.addEventListener('pointerdown', (e) => { dragging = true; setTargetFromEvent(e); canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => { if (dragging) setTargetFromEvent(e); });
  canvas.addEventListener('pointerup', () => { dragging = false; });

  /* ===== Loop de render (~15 fps; ruído muda a cada frame) ===== */
  let raf = null, last = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (t - last < 66) return;
    last = t;
    render();
  }

  function stations() {
    const W = canvas.width, H = canvas.height;
    return PRESETS[nStations].map(([fx, fy]) => ({ x: fx * W, y: fy * H }));
  }

  function render() {
    const W = canvas.width, H = canvas.height;
    const sts = stations();
    const sigmaRad = (sigmaDeg * Math.PI) / 180;

    /* mede rumos com ruído */
    const measured = sts.map((s) => ({ x: s.x, y: s.y, bearing: bearingTo(s, target) + gaussianNoise(sigmaRad) }));
    const est = triangulate(measured);

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#020409';
    ctx.fillRect(0, 0, W, H);
    /* grid */
    ctx.strokeStyle = 'rgba(150,180,255,0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { const x = (W / 8) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let i = 1; i < 6; i++) { const y = (H / 6) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    /* rumos (retas longas a partir de cada estação) */
    const L = Math.hypot(W, H);
    ctx.strokeStyle = 'rgba(212,162,78,0.35)';
    ctx.lineWidth = 1.2;
    measured.forEach((m) => {
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x + Math.cos(m.bearing) * L, m.y + Math.sin(m.bearing) * L);
      ctx.stroke();
    });

    /* estações */
    ctx.fillStyle = '#9fb4d8';
    sts.forEach((s, i) => {
      ctx.fillRect(s.x - 5, s.y - 5, 10, 10);
      ctx.fillStyle = '#9fb4d8';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText(`E${i + 1}`, s.x + 8, s.y - 8);
    });

    /* alvo real (magenta) */
    ctx.fillStyle = '#e8c07a';
    ctx.beginPath(); ctx.arc(target.x, target.y, 7, 0, Math.PI * 2); ctx.fill();

    /* estimativa (cruz ciano) + linha de erro */
    if (est.ok) {
      ctx.strokeStyle = '#d4a24e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(est.x - 10, est.y); ctx.lineTo(est.x + 10, est.y);
      ctx.moveTo(est.x, est.y - 10); ctx.lineTo(est.x, est.y + 10);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(est.x, est.y); ctx.lineTo(target.x, target.y); ctx.stroke();
      ctx.setLineDash([]);

      setStat('est', `${est.x.toFixed(0)}, ${est.y.toFixed(0)}`);
      setStat('err', `${dist(est, target).toFixed(1)} px`);
      setStat('res', est.residual.toFixed(1));
    } else {
      setStat('est', 'singular'); setStat('err', '—'); setStat('res', '∞');
    }
    setStat('real', `${target.x.toFixed(0)}, ${target.y.toFixed(0)}`);
  }

  raf = requestAnimationFrame(loop);
  window.addEventListener('hashchange', () => { if (raf) cancelAnimationFrame(raf); }, { once: true });
  return page;
}
