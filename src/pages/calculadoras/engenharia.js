/**
 * Calculadora de Engenharia (Fase 5)
 *
 * - Lei de Ohm (V, I, R, P) - 2 conhecidos calculam os outros
 * - Divisor de tensão
 * - Resistor color code (4 bandas)
 * - Frequência ↔ comprimento de onda (luz/som)
 * - Lei de Stevin (pressão hidrostática)
 */

import { h } from '../../utils/helpers.js';

const NUM = (v) => parseFloat(String(v).replace(',', '.'));
const fmt = (n, dec = 4) => {
  if (!isFinite(n)) return '—';
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-3 && n !== 0)) return n.toExponential(3);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: dec }).format(n);
};

/* ===== Lei de Ohm ===== */
function ohmPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    V: h('input', { className: 'input', type: 'number', placeholder: 'V (volts)', step: 'any', oninput: render }),
    I: h('input', { className: 'input', type: 'number', placeholder: 'I (ampères)', step: 'any', oninput: render }),
    R: h('input', { className: 'input', type: 'number', placeholder: 'R (ohms)', step: 'any', oninput: render }),
    P: h('input', { className: 'input', type: 'number', placeholder: 'P (watts)', step: 'any', oninput: render })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    let V = NUM(inputs.V.value);
    let I = NUM(inputs.I.value);
    let R = NUM(inputs.R.value);
    let P = NUM(inputs.P.value);
    const has = {
      V: !isNaN(V) && inputs.V.value !== '',
      I: !isNaN(I) && inputs.I.value !== '',
      R: !isNaN(R) && inputs.R.value !== '',
      P: !isNaN(P) && inputs.P.value !== ''
    };
    const filled = Object.values(has).filter(Boolean).length;
    if (filled < 2) {
      out.innerHTML = '<div class="u-text-muted">Insira ao menos 2 valores conhecidos.</div>';
      return;
    }

    /* Resolve em cascata */
    if (has.V && has.I) { R = V / I; P = V * I; }
    else if (has.V && has.R) { I = V / R; P = V * I; }
    else if (has.V && has.P) { I = P / V; R = V / I; }
    else if (has.I && has.R) { V = I * R; P = V * I; }
    else if (has.I && has.P) { V = P / I; R = V / I; }
    else if (has.R && has.P) { I = Math.sqrt(P / R); V = I * R; }

    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>V (tensão):</span> <strong>${fmt(V)} V</strong></div>
        <div><span>I (corrente):</span> <strong>${fmt(I)} A</strong></div>
        <div><span>R (resistência):</span> <strong>${fmt(R)} Ω</strong></div>
        <div><span>P (potência):</span> <strong>${fmt(P)} W</strong></div>
      </div>
      <div class="calc-tile__formula">V = I × R · P = V × I = I²R = V²/R</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '⚡ Lei de Ohm'),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px' } },
      'Insira 2 valores; os outros serão calculados.'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Tensão (V)', inputs.V),
      h('label', null, 'Corrente (A)', inputs.I),
      h('label', null, 'Resistência (Ω)', inputs.R),
      h('label', null, 'Potência (W)', inputs.P)
    ),
    out
  );
  return card;
}

/* ===== Divisor de Tensão ===== */
function divisorPanel() {
  const card = h('div', { className: 'calc-tile' });
  const Vin = h('input', { className: 'input', type: 'number', value: '12', step: 'any', oninput: render });
  const R1 = h('input', { className: 'input', type: 'number', value: '1000', step: 'any', oninput: render });
  const R2 = h('input', { className: 'input', type: 'number', value: '2200', step: 'any', oninput: render });
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const v = NUM(Vin.value);
    const r1 = NUM(R1.value);
    const r2 = NUM(R2.value);
    const vout = (v * r2) / (r1 + r2);
    const i = v / (r1 + r2);
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>V_out:</span> <strong>${fmt(vout)} V</strong></div>
        <div><span>I (mA):</span> <strong>${fmt(i * 1000)} mA</strong></div>
        <div><span>P_R1 (mW):</span> <strong>${fmt(i * i * r1 * 1000)}</strong></div>
        <div><span>P_R2 (mW):</span> <strong>${fmt(i * i * r2 * 1000)}</strong></div>
      </div>
      <div class="calc-tile__formula">V_out = V_in × R2 / (R1 + R2)</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◐ Divisor de Tensão'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'V_in (V)', Vin),
      h('label', null, 'R1 (Ω)', R1),
      h('label', null, 'R2 (Ω)', R2)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== Resistor color code (4 bandas) ===== */
const COLORS = [
  { name: 'preto', hex: '#000000', val: 0, mult: 1, tol: null },
  { name: 'marrom', hex: '#8B4513', val: 1, mult: 10, tol: 1 },
  { name: 'vermelho', hex: '#FF0000', val: 2, mult: 100, tol: 2 },
  { name: 'laranja', hex: '#FFA500', val: 3, mult: 1000, tol: null },
  { name: 'amarelo', hex: '#FFFF00', val: 4, mult: 10000, tol: null },
  { name: 'verde', hex: '#00C853', val: 5, mult: 100000, tol: 0.5 },
  { name: 'azul', hex: '#0066CC', val: 6, mult: 1000000, tol: 0.25 },
  { name: 'violeta', hex: '#7C4DFF', val: 7, mult: 10000000, tol: 0.1 },
  { name: 'cinza', hex: '#9E9E9E', val: 8, mult: null, tol: 0.05 },
  { name: 'branco', hex: '#FFFFFF', val: 9, mult: null, tol: null },
  { name: 'ouro', hex: '#FFD700', val: null, mult: 0.1, tol: 5 },
  { name: 'prata', hex: '#C0C0C0', val: null, mult: 0.01, tol: 10 }
];

function resistorPanel() {
  const card = h('div', { className: 'calc-tile' });
  let bands = [1, 0, 0, 10]; // marrom-preto-preto-ouro = 10Ω 5%
  const display = h('div', { className: 'resistor-display' });
  const out = h('div', { className: 'calc-tile__out' });

  function bandSelect(idx, filterFn, defaultVal) {
    const sel = h('select', {
      className: 'input',
      onchange: (e) => {
        bands[idx] = parseInt(e.target.value, 10);
        render();
      }
    });
    COLORS.forEach((c, i) => {
      if (filterFn(c)) {
        const opt = h('option', {
          value: i,
          selected: i === defaultVal,
          style: `background: ${c.hex}; color: ${['preto', 'azul', 'violeta', 'marrom'].includes(c.name) ? '#fff' : '#000'};`
        }, `${c.name}`);
        sel.appendChild(opt);
      }
    });
    return sel;
  }

  function render() {
    const b1 = COLORS[bands[0]];
    const b2 = COLORS[bands[1]];
    const b3 = COLORS[bands[2]];
    const b4 = COLORS[bands[3]];

    if (b1.val === null || b2.val === null) {
      out.innerHTML = '<div class="u-text-muted">Bandas 1-2: dígitos (preto-branco).</div>';
      return;
    }

    const value = (b1.val * 10 + b2.val) * b3.mult;
    const tol = b4.tol;

    let display_value, unit;
    if (value >= 1e6) { display_value = value / 1e6; unit = 'MΩ'; }
    else if (value >= 1e3) { display_value = value / 1e3; unit = 'kΩ'; }
    else { display_value = value; unit = 'Ω'; }

    /* Renderiza display visual */
    display.innerHTML = '';
    const body = h('div', { className: 'resistor-body' });
    [b1, b2, b3, b4].forEach((b, i) => {
      body.appendChild(h('div', { className: 'resistor-band', style: `background: ${b.hex}` }));
    });
    display.appendChild(body);

    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Valor:</span> <strong>${fmt(display_value, 2)} ${unit}</strong></div>
        <div><span>Tolerância:</span> <strong>±${tol}%</strong></div>
        <div><span>Valor exato:</span> <strong>${fmt(value)} Ω</strong></div>
        <div><span>Variação:</span> <strong>${fmt(value * (1 - tol/100))} – ${fmt(value * (1 + tol/100))} Ω</strong></div>
      </div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '⌖ Resistor (4 bandas)'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Banda 1 (1º dígito)', bandSelect(0, (c) => c.val !== null && c.name !== 'ouro' && c.name !== 'prata', 1)),
      h('label', null, 'Banda 2 (2º dígito)', bandSelect(1, (c) => c.val !== null && c.name !== 'ouro' && c.name !== 'prata', 0)),
      h('label', null, 'Banda 3 (multiplicador)', bandSelect(2, (c) => c.mult !== null, 0)),
      h('label', null, 'Banda 4 (tolerância)', bandSelect(3, (c) => c.tol !== null, 10))
    ),
    display,
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== Frequência ↔ comprimento de onda ===== */
function ondaPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    f: h('input', { className: 'input', type: 'number', value: '440', step: 'any', oninput: () => render('f') }),
    lambda: h('input', { className: 'input', type: 'number', step: 'any', oninput: () => render('lambda') }),
    medium: h('select', { className: 'input', onchange: () => render('f') },
      h('option', { value: '299792458' }, 'Luz no vácuo (c)'),
      h('option', { value: '343', selected: true }, 'Som no ar (343 m/s)'),
      h('option', { value: '1480' }, 'Som na água'),
      h('option', { value: '5000' }, 'Som no aço')
    )
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render(from = 'f') {
    const v = NUM(inputs.medium.value);
    const f = NUM(inputs.f.value);
    const lambda = NUM(inputs.lambda.value);
    let freq, wavelength;
    if (from === 'f') {
      freq = f;
      wavelength = v / f;
      inputs.lambda.value = wavelength.toFixed(6);
    } else {
      wavelength = lambda;
      freq = v / lambda;
      inputs.f.value = freq.toFixed(2);
    }
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Frequência:</span> <strong>${fmt(freq, 4)} Hz</strong></div>
        <div><span>Comprimento de onda (λ):</span> <strong>${fmt(wavelength, 6)} m</strong></div>
        <div><span>Período (T):</span> <strong>${fmt(1 / freq, 8)} s</strong></div>
        <div><span>Velocidade (v):</span> <strong>${fmt(v)} m/s</strong></div>
      </div>
      <div class="calc-tile__formula">v = λ × f · T = 1/f</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '~ Frequência ↔ λ'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Frequência (Hz)', inputs.f),
      h('label', null, 'Comprimento λ (m)', inputs.lambda),
      h('label', null, 'Velocidade no meio', inputs.medium)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

/* ===== Pressão hidrostática (Stevin) ===== */
function stevinPanel() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    h: h('input', { className: 'input', type: 'number', value: '10', step: 'any', oninput: render }),
    rho: h('input', { className: 'input', type: 'number', value: '1000', step: 'any', oninput: render }),
    g: h('input', { className: 'input', type: 'number', value: '9.81', step: 'any', oninput: render }),
    p0: h('input', { className: 'input', type: 'number', value: '101325', step: 'any', oninput: render })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function render() {
    const hh = NUM(inputs.h.value);
    const rho = NUM(inputs.rho.value);
    const g = NUM(inputs.g.value);
    const p0 = NUM(inputs.p0.value);
    const pHidro = rho * g * hh;
    const pTotal = p0 + pHidro;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>P hidrostática:</span> <strong>${fmt(pHidro)} Pa = ${fmt(pHidro / 1000, 3)} kPa</strong></div>
        <div><span>P total (com atm):</span> <strong>${fmt(pTotal)} Pa = ${fmt(pTotal / 101325, 4)} atm</strong></div>
        <div><span>Coluna em mca:</span> <strong>${fmt(hh)} mca</strong></div>
      </div>
      <div class="calc-tile__formula">P = P₀ + ρ·g·h</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◉ Pressão Hidrostática'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Altura coluna (m)', inputs.h),
      h('label', null, 'Densidade ρ (kg/m³)', inputs.rho),
      h('label', null, 'Gravidade g (m/s²)', inputs.g),
      h('label', null, 'P atmosférica P₀ (Pa)', inputs.p0)
    ),
    out
  );
  setTimeout(render, 0);
  return card;
}

export function engenhariaPanel() {
  return h('div', { className: 'calc-grid' },
    ohmPanel(),
    divisorPanel(),
    resistorPanel(),
    ondaPanel(),
    stevinPanel()
  );
}
