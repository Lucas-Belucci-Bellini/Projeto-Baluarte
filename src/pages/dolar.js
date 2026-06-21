/**
 * Página /dolar — Radar do Câmbio (Dólar, Euro, Bitcoin).
 *
 * Lê a série histórica de src/data/cambio-historico.json (banco coletado
 * a cada 12h por scripts/fetch-cambio.mjs + workflow cambio.yml) e mostra
 * gráfico, valor atual e variações diária/semanal/mensal. Relatórios
 * completos em markdown ficam em reports/cambio/.
 */

import '../styles/dolar.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import cambioUrl from '../data/cambio-historico.json?url';

const STORAGE_KEY = 'dolar:state';
const REPORTS_URL = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/main/reports/cambio';

const COINS = [
  { key: 'USD', icon: '💵', label: 'Dólar', color: '#00f0ff', dec: 4 },
  { key: 'EUR', icon: '💶', label: 'Euro', color: '#ff00aa', dec: 4 },
  { key: 'BTC', icon: '₿', label: 'Bitcoin', color: '#ffaa00', dec: 0 }
];
const RANGES = [
  { id: 7, label: '7 dias' }, { id: 30, label: '30 dias' },
  { id: 90, label: '90 dias' }, { id: 0, label: 'Tudo' }
];

let state = null;
let data = null;
let status = 'loading'; /* loading | ok | error */
let rootEl = null;

function loadState() { return storage.get(STORAGE_KEY) || { coin: 'USD', range: 30 }; }
function persist() { storage.set(STORAGE_KEY, state); }
function coinMeta(k) { return COINS.find((c) => c.key === k) || COINS[0]; }

async function loadCambio() {
  try {
    const r = await fetch(cambioUrl);
    if (!r.ok) throw new Error('http');
    data = await r.json();
    status = 'ok';
  } catch { status = 'error'; }
}

function seriesFor(key, days) {
  const s = (data && data.series && data.series[key]) || [];
  if (!days || !s.length) return s;
  const now = s[s.length - 1].t;
  return s.filter((p) => p.t >= now - days * 864e5);
}

function fmtMoney(v, dec) {
  if (v == null) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtPct(p) {
  if (p == null) return '—';
  return (p >= 0 ? '▲ +' : '▼ ') + p.toFixed(2) + '%';
}
function trendCls(p) { return p == null ? 'u-text-muted' : (p >= 0 ? 'u-text-success' : 'u-text-danger'); }

function calcStats(pts) {
  if (!pts || !pts.length) return null;
  const vals = pts.map((p) => p.v);
  const cur = vals[vals.length - 1], first = vals[0];
  return {
    cur, first,
    min: Math.min(...vals), max: Math.max(...vals),
    avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    pct: first ? (cur / first - 1) * 100 : 0
  };
}
function variation(key, days) {
  const s = calcStats(seriesFor(key, days));
  return s ? s.pct : null;
}

/* ===== Gráfico SVG (linha + área) ===== */
function chartSVG(points, color) {
  if (!points || points.length < 2) return '<div class="dolar-chart__empty u-text-muted">Sem dados suficientes nesta janela.</div>';
  const W = 820, H = 260, pX = 6, pY = 20;
  const ts = points.map((p) => p.t), vals = points.map((p) => p.v);
  const minT = ts[0], maxT = ts[ts.length - 1];
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const sT = (maxT - minT) || 1, sV = (maxV - minV) || 1;
  const X = (t) => pX + ((t - minT) / sT) * (W - 2 * pX);
  const Y = (v) => pY + (1 - (v - minV) / sV) * (H - 2 * pY);
  const line = points.map((p, i) => (i ? 'L' : 'M') + X(p.t).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ');
  const area = `M${X(minT).toFixed(1)},${H - pY} ` +
    points.map((p) => `L${X(p.t).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ') +
    ` L${X(maxT).toFixed(1)},${H - pY} Z`;
  const lx = X(maxT).toFixed(1), ly = Y(vals[vals.length - 1]).toFixed(1);
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="dolar-chart__svg" role="img" aria-label="gráfico de preço">
    <defs><linearGradient id="dolarFill" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#dolarFill)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    <circle cx="${lx}" cy="${ly}" r="3.5" fill="${color}"/>
  </svg>`;
}

/* ===== Render ===== */
function fmtDay(t) { return new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }

function render() {
  if (!rootEl) return;
  empty(rootEl);

  rootEl.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CÂMBIO')),
      h('h1', { className: 'page-header__title' }, '💹 Radar do Câmbio'),
      h('p', { className: 'page-header__description' },
        'Histórico de ',
        h('span', { className: 'u-text-cyan' }, 'Dólar, Euro e Bitcoin'),
        ' (em R$). Coletado automaticamente a cada 12h. ',
        data && data.meta ? `Atualizado: ${new Date(data.meta.updatedAt).toLocaleString('pt-BR')}.` : '')
    )
  );

  if (status === 'loading') { rootEl.appendChild(h('div', { className: 'dolar-note u-text-muted' }, '⏳ Carregando o histórico…')); return; }
  if (status === 'error') { rootEl.appendChild(h('div', { className: 'dolar-note u-text-danger' }, '⚠ Não consegui carregar o histórico. Recarregue a página.')); return; }

  const m = coinMeta(state.coin);

  /* Abas de moeda */
  rootEl.appendChild(
    h('div', { className: 'dolar-coins' },
      ...COINS.map((c) => h('button', {
        className: cx('dolar-coin', state.coin === c.key && 'is-active'),
        style: state.coin === c.key ? `--coin: ${c.color}; border-color:${c.color};` : `--coin:${c.color};`,
        onclick: () => { state.coin = c.key; persist(); render(); }
      },
        h('span', { className: 'dolar-coin__icon' }, c.icon),
        h('span', null, `${c.label} (${c.key})`)))
    )
  );

  const pts = seriesFor(state.coin, state.range);
  const st = calcStats(pts);

  /* Card de valor atual + variações rápidas */
  rootEl.appendChild(
    h('div', { className: 'dolar-hero', style: `--coin: ${m.color};` },
      h('div', { className: 'dolar-hero__main' },
        h('div', { className: 'dolar-hero__label u-text-muted' }, `${m.icon} ${m.label} · 1 ${m.key} =`),
        h('div', { className: 'dolar-hero__value' }, st ? fmtMoney(st.cur, m.dec) : '—'),
        h('div', { className: cx('dolar-hero__pct', trendCls(st && st.pct)) },
          st ? `${fmtPct(st.pct)} no período` : '')),
      h('div', { className: 'dolar-hero__quick' },
        ...[{ d: 1, l: 'Dia' }, { d: 7, l: 'Semana' }, { d: 30, l: 'Mês' }].map(({ d, l }) => {
          const p = variation(state.coin, d);
          return h('div', { className: 'dolar-quick' },
            h('div', { className: 'dolar-quick__label u-text-muted' }, l),
            h('div', { className: cx('dolar-quick__val', trendCls(p)) }, fmtPct(p)));
        }))
    )
  );

  /* Abas de período */
  rootEl.appendChild(
    h('div', { className: 'dolar-ranges' },
      ...RANGES.map((r) => h('button', {
        className: cx('dolar-range', state.range === r.id && 'is-active'),
        onclick: () => { state.range = r.id; persist(); render(); }
      }, r.label))
    )
  );

  /* Gráfico */
  const chart = h('div', { className: 'dolar-chart' });
  chart.innerHTML = chartSVG(pts, m.color);
  rootEl.appendChild(
    h('div', { className: 'dolar-chart-wrap' },
      h('div', { className: 'dolar-chart__axis dolar-chart__axis--max u-mono u-text-muted' }, st ? fmtMoney(st.max, m.dec) : ''),
      chart,
      h('div', { className: 'dolar-chart__axis dolar-chart__axis--min u-mono u-text-muted' }, st ? fmtMoney(st.min, m.dec) : ''),
      pts.length >= 2 && h('div', { className: 'dolar-chart__dates u-text-muted u-mono' },
        h('span', null, fmtDay(pts[0].t)), h('span', null, fmtDay(pts[pts.length - 1].t)))
    )
  );

  /* Stats do período */
  if (st) {
    rootEl.appendChild(
      h('div', { className: 'dolar-stats' },
        statCard('Mínima', fmtMoney(st.min, m.dec)),
        statCard('Máxima', fmtMoney(st.max, m.dec)),
        statCard('Média', fmtMoney(st.avg, m.dec)),
        statCard('Pontos', String(pts.length))
      )
    );
  }

  /* Relatórios */
  rootEl.appendChild(
    h('div', { className: 'dolar-reports' },
      h('div', { className: 'dolar-reports__title' }, '📑 Relatórios automáticos'),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 8px' } },
        'Diário, semanal e mensal — gerados a cada 12h e versionados no GitHub.'),
      h('a', { className: 'btn btn--ghost btn--sm', href: REPORTS_URL, target: '_blank', rel: 'noopener' },
        '↗ Ver relatórios no GitHub')
    )
  );
}

function statCard(label, value) {
  return h('div', { className: 'dolar-stat' },
    h('div', { className: 'dolar-stat__label u-text-muted' }, label),
    h('div', { className: 'dolar-stat__value u-mono' }, value));
}

export function dolarPage() {
  state = loadState();
  data = null;
  status = 'loading';
  rootEl = h('div', { className: 'page-dolar' });
  render();
  loadCambio().then(render);
  return rootEl;
}
