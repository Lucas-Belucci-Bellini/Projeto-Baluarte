/**
 * Calculadora de Estatística (Fase 5)
 *
 * Entrada: array de números (delimitado por vírgula, espaço ou nova linha).
 * Saídas:
 *   - Soma, média, mediana, moda
 *   - Desvio padrão (populacional e amostral)
 *   - Variância
 *   - Mínimo, máximo, amplitude
 *   - Quartis Q1, Q2 (mediana), Q3 e IQR
 *   - Coeficiente de variação
 *
 * Plus: regressão linear simples para pares (x,y).
 */

import { h } from '../../utils/helpers.js';

const NUM = (v) => parseFloat(String(v).replace(',', '.'));
const fmt = (n, dec = 4) => {
  if (!isFinite(n)) return '—';
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return new Intl.NumberFormat('pt-BR').format(n);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: dec }).format(n);
};

function parseList(s) {
  return s.split(/[\s,;]+/).map(NUM).filter((n) => !isNaN(n));
}

function describe(arr) {
  const n = arr.length;
  if (!n) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const sum = arr.reduce((s, v) => s + v, 0);
  const mean = sum / n;
  const min = sorted[0];
  const max = sorted[n - 1];

  const variance = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
  const variancep = arr.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(n - 1, 1);
  const std = Math.sqrt(variance);
  const stdp = Math.sqrt(variancep);

  function quantile(p) {
    const idx = (n - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  }

  const median = quantile(0.5);
  const q1 = quantile(0.25);
  const q3 = quantile(0.75);

  /* Moda: valor mais frequente (pode ter múltiplas) */
  const counts = new Map();
  for (const v of arr) counts.set(v, (counts.get(v) || 0) + 1);
  let maxFreq = 0;
  for (const c of counts.values()) if (c > maxFreq) maxFreq = c;
  const modes = maxFreq > 1
    ? [...counts.entries()].filter(([_, c]) => c === maxFreq).map(([v]) => v)
    : [];

  return {
    n, sum, mean, min, max, range: max - min,
    median, q1, q3, iqr: q3 - q1,
    std, stdp, variance, variancep,
    cv: mean !== 0 ? (std / Math.abs(mean)) * 100 : NaN,
    modes
  };
}

function statsPanel() {
  const card = h('div', { className: 'calc-tile' });
  const input = h('textarea', {
    className: 'input',
    rows: 4,
    placeholder: '5, 8, 12, 15, 18, 22, 25, 30, 35, 42',
    value: '5, 8, 12, 15, 18, 22, 25, 30, 35, 42',
    oninput: render
  });
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const arr = parseList(input.value);
    if (arr.length === 0) {
      out.innerHTML = '<div class="u-text-muted">Insira ao menos um número.</div>';
      return;
    }
    const d = describe(arr);
    out.innerHTML = `
      <div class="stats-grid">
        <div class="stat-cell"><span>n</span><strong>${fmt(d.n)}</strong></div>
        <div class="stat-cell"><span>Σ soma</span><strong>${fmt(d.sum)}</strong></div>
        <div class="stat-cell"><span>μ média</span><strong>${fmt(d.mean)}</strong></div>
        <div class="stat-cell"><span>md mediana</span><strong>${fmt(d.median)}</strong></div>
        <div class="stat-cell"><span>min</span><strong>${fmt(d.min)}</strong></div>
        <div class="stat-cell"><span>max</span><strong>${fmt(d.max)}</strong></div>
        <div class="stat-cell"><span>amplitude</span><strong>${fmt(d.range)}</strong></div>
        <div class="stat-cell"><span>σ desvio (pop)</span><strong>${fmt(d.std)}</strong></div>
        <div class="stat-cell"><span>s desvio (amostral)</span><strong>${fmt(d.stdp)}</strong></div>
        <div class="stat-cell"><span>σ² variância</span><strong>${fmt(d.variance)}</strong></div>
        <div class="stat-cell"><span>Q1</span><strong>${fmt(d.q1)}</strong></div>
        <div class="stat-cell"><span>Q3</span><strong>${fmt(d.q3)}</strong></div>
        <div class="stat-cell"><span>IQR</span><strong>${fmt(d.iqr)}</strong></div>
        <div class="stat-cell"><span>CV %</span><strong>${fmt(d.cv, 2)}</strong></div>
        <div class="stat-cell stat-cell--wide"><span>moda</span><strong>${d.modes.length ? d.modes.map((m) => fmt(m)).join(', ') : '— sem moda'}</strong></div>
      </div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, 'σ Estatística Descritiva'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Dados (vírgula, espaço ou nova linha)', input)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

function regressionPanel() {
  const card = h('div', { className: 'calc-tile' });
  const xs = h('textarea', {
    className: 'input', rows: 3,
    placeholder: '1, 2, 3, 4, 5',
    value: '1, 2, 3, 4, 5',
    oninput: render
  });
  const ys = h('textarea', {
    className: 'input', rows: 3,
    placeholder: '2.1, 4.3, 6.0, 8.2, 10.1',
    value: '2.1, 4.3, 6.0, 8.2, 10.1',
    oninput: render
  });
  const xQuery = h('input', {
    className: 'input', type: 'number', value: '6', oninput: render
  });
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const x = parseList(xs.value);
    const y = parseList(ys.value);
    const n = Math.min(x.length, y.length);
    if (n < 2) {
      out.innerHTML = '<div class="u-text-muted">Pelo menos 2 pares (x, y).</div>';
      return;
    }
    const sx = x.slice(0, n).reduce((s, v) => s + v, 0);
    const sy = y.slice(0, n).reduce((s, v) => s + v, 0);
    const sxy = x.slice(0, n).reduce((s, v, i) => s + v * y[i], 0);
    const sxx = x.slice(0, n).reduce((s, v) => s + v * v, 0);
    const syy = y.slice(0, n).reduce((s, v) => s + v * v, 0);

    const a = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const b = (sy - a * sx) / n;
    const num = n * sxy - sx * sy;
    const denom = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
    const r = denom === 0 ? 0 : num / denom;
    const r2 = r * r;
    const xq = NUM(xQuery.value);
    const yPred = a * xq + b;

    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Equação:</span> <strong>y = ${fmt(a)} · x ${b >= 0 ? '+' : '-'} ${fmt(Math.abs(b))}</strong></div>
        <div><span>Coef. Pearson (r):</span> <strong>${fmt(r)}</strong></div>
        <div><span>R² (determinação):</span> <strong>${fmt(r2)}</strong></div>
        <div><span>Ajuste:</span> <strong>${r2 > 0.9 ? '🟢 Forte' : r2 > 0.5 ? '🟡 Moderado' : '🔴 Fraco'}</strong></div>
        <div><span>Predição f(${fmt(xq)}):</span> <strong>${fmt(yPred)}</strong></div>
      </div>
      <div class="calc-tile__formula">a = (n·Σxy - Σx·Σy) / (n·Σx² - (Σx)²) · b = (Σy - a·Σx) / n</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '∝ Regressão Linear'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'X (independente)', xs),
      h('label', null, 'Y (dependente)', ys),
      h('label', null, 'Predizer y para x =', xQuery)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

export function estatisticaPanel() {
  return h('div', { className: 'calc-grid' },
    statsPanel(),
    regressionPanel()
  );
}
