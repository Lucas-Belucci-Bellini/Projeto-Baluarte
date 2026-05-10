/**
 * Calculadora Financeira (Fase 5)
 *
 * - Juros simples e compostos
 * - Valor Presente Líquido (VPL/NPV)
 * - Taxa Interna de Retorno (TIR/IRR) - Newton-Raphson
 * - Parcelamento Price (PMT)
 * - Conversão de taxa: nominal ↔ efetiva
 */

import { h } from '../../utils/helpers.js';

function num(v, d = 0) {
  const n = parseFloat(String(v).replace(',', '.'));
  return isNaN(n) ? d : n;
}

function fmt(n, dec = 2) {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec
  }).format(n);
}

function brl(n) {
  if (!isFinite(n)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(n);
}

/* ===== Juros Simples ===== */
function jurosSimples() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    vp: h('input', { className: 'input', type: 'number', placeholder: '1000', value: '1000', oninput: calc }),
    i: h('input', { className: 'input', type: 'number', placeholder: '2', value: '2', step: '0.01', oninput: calc }),
    n: h('input', { className: 'input', type: 'number', placeholder: '12', value: '12', oninput: calc })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function calc() {
    const vp = num(inputs.vp.value);
    const i = num(inputs.i.value) / 100;
    const n = num(inputs.n.value);
    const j = vp * i * n;
    const vf = vp + j;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Juros (J):</span> <strong>${brl(j)}</strong></div>
        <div><span>Valor Futuro (VF):</span> <strong>${brl(vf)}</strong></div>
      </div>
      <div class="calc-tile__formula">VF = VP × (1 + i × n) = ${fmt(vp)} × (1 + ${fmt(i, 4)} × ${n}) = ${brl(vf)}</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◈ Juros Simples'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Valor Presente (VP) R$', inputs.vp),
      h('label', null, 'Taxa (i %) — por período', inputs.i),
      h('label', null, 'Períodos (n)', inputs.n)
    ),
    out
  );
  setTimeout(calc, 0);
  return card;
}

/* ===== Juros Compostos ===== */
function jurosCompostos() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    vp: h('input', { className: 'input', type: 'number', placeholder: '1000', value: '1000', oninput: calc }),
    i: h('input', { className: 'input', type: 'number', placeholder: '2', value: '2', step: '0.01', oninput: calc }),
    n: h('input', { className: 'input', type: 'number', placeholder: '12', value: '12', oninput: calc }),
    pmt: h('input', { className: 'input', type: 'number', placeholder: '0', value: '0', oninput: calc })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function calc() {
    const vp = num(inputs.vp.value);
    const i = num(inputs.i.value) / 100;
    const n = num(inputs.n.value);
    const pmt = num(inputs.pmt.value);
    const vf = vp * Math.pow(1 + i, n) + (i === 0 ? pmt * n : pmt * (Math.pow(1 + i, n) - 1) / i);
    const j = vf - vp - pmt * n;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Valor Futuro (VF):</span> <strong>${brl(vf)}</strong></div>
        <div><span>Total de Juros:</span> <strong>${brl(j)}</strong></div>
        <div><span>Total Investido:</span> <strong>${brl(vp + pmt * n)}</strong></div>
      </div>
      <div class="calc-tile__formula">VF = VP × (1 + i)ⁿ + PMT × ((1+i)ⁿ - 1) / i</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◇ Juros Compostos'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Valor Presente (VP) R$', inputs.vp),
      h('label', null, 'Taxa (i %) — por período', inputs.i),
      h('label', null, 'Períodos (n)', inputs.n),
      h('label', null, 'Aporte mensal (PMT) R$', inputs.pmt)
    ),
    out
  );
  setTimeout(calc, 0);
  return card;
}

/* ===== Parcelamento Price ===== */
function pricePmt() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    vp: h('input', { className: 'input', type: 'number', value: '10000', oninput: calc }),
    i: h('input', { className: 'input', type: 'number', value: '1.5', step: '0.01', oninput: calc }),
    n: h('input', { className: 'input', type: 'number', value: '24', oninput: calc })
  };
  const out = h('div', { className: 'calc-tile__out' });

  function calc() {
    const vp = num(inputs.vp.value);
    const i = num(inputs.i.value) / 100;
    const n = num(inputs.n.value);
    const pmt = i === 0 ? vp / n : vp * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = pmt * n;
    const j = total - vp;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Parcela (PMT):</span> <strong>${brl(pmt)}</strong></div>
        <div><span>Total Pago:</span> <strong>${brl(total)}</strong></div>
        <div><span>Juros Totais:</span> <strong>${brl(j)}</strong></div>
      </div>
      <div class="calc-tile__formula">PMT = VP × (i × (1+i)ⁿ) / ((1+i)ⁿ - 1)</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◆ Parcelamento Price'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Valor financiado (VP) R$', inputs.vp),
      h('label', null, 'Taxa (i %) — mensal', inputs.i),
      h('label', null, 'Nº de parcelas (n)', inputs.n)
    ),
    out
  );
  setTimeout(calc, 0);
  return card;
}

/* ===== VPL (NPV) e TIR (IRR) ===== */
function vplTir() {
  const card = h('div', { className: 'calc-tile' });
  const flowsInput = h('textarea', {
    className: 'input',
    rows: 4,
    placeholder: '-1000, 200, 300, 400, 500',
    value: '-1000, 200, 300, 400, 500',
    oninput: calc
  });
  const taxa = h('input', { className: 'input', type: 'number', value: '10', step: '0.01', oninput: calc });
  const out = h('div', { className: 'calc-tile__out' });

  function npv(rate, flows) {
    return flows.reduce((sum, f, t) => sum + f / Math.pow(1 + rate, t), 0);
  }

  function irr(flows, guess = 0.1) {
    let r = guess;
    for (let it = 0; it < 200; it++) {
      let f = 0, df = 0;
      for (let t = 0; t < flows.length; t++) {
        const denom = Math.pow(1 + r, t);
        f += flows[t] / denom;
        df -= t * flows[t] / (denom * (1 + r));
      }
      if (Math.abs(df) < 1e-10) break;
      const next = r - f / df;
      if (Math.abs(next - r) < 1e-7) return next;
      r = next;
      if (!isFinite(r)) return NaN;
    }
    return r;
  }

  function calc() {
    const flows = flowsInput.value.split(/[,\n;]/).map((s) => num(s.trim())).filter((n) => !isNaN(n));
    const rate = num(taxa.value) / 100;
    const v = npv(rate, flows);
    const t = irr(flows);
    const tirOk = isFinite(t) && Math.abs(t) < 100;
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Fluxos (${flows.length}):</span> <code>${flows.map(f => fmt(f)).join(', ')}</code></div>
        <div><span>VPL @ ${fmt(rate * 100, 2)}%:</span> <strong>${brl(v)}</strong></div>
        <div><span>TIR:</span> <strong>${tirOk ? fmt(t * 100, 4) + ' %' : 'sem solução'}</strong></div>
      </div>
      <div class="calc-tile__formula">VPL > 0 → projeto viável · TIR > taxa de desconto → vale</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '◊ VPL & TIR'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Fluxos de caixa (vírgula ou nova linha)', flowsInput),
      h('label', null, 'Taxa de desconto (%)', taxa)
    ),
    out
  );
  setTimeout(calc, 0);
  return card;
}

/* ===== Conversão de taxa ===== */
function conversaoTaxa() {
  const card = h('div', { className: 'calc-tile' });
  const inputs = {
    rate: h('input', { className: 'input', type: 'number', value: '12', step: '0.01', oninput: calc }),
    from: h('select', { className: 'input', onchange: calc },
      h('option', { value: 'a' }, 'ao ano'),
      h('option', { value: 'm', selected: true }, 'ao mês'),
      h('option', { value: 'd' }, 'ao dia')
    )
  };
  const out = h('div', { className: 'calc-tile__out' });

  function calc() {
    const r = num(inputs.rate.value) / 100;
    const from = inputs.from.value;
    let mensal, anual, diaria;
    if (from === 'a') {
      anual = r;
      mensal = Math.pow(1 + r, 1 / 12) - 1;
      diaria = Math.pow(1 + r, 1 / 365) - 1;
    } else if (from === 'm') {
      mensal = r;
      anual = Math.pow(1 + r, 12) - 1;
      diaria = Math.pow(1 + r, 12 / 365) - 1;
    } else {
      diaria = r;
      anual = Math.pow(1 + r, 365) - 1;
      mensal = Math.pow(1 + r, 365 / 12) - 1;
    }
    out.innerHTML = `
      <div class="calc-tile__result">
        <div><span>Anual:</span> <strong>${fmt(anual * 100, 4)} %</strong></div>
        <div><span>Mensal:</span> <strong>${fmt(mensal * 100, 4)} %</strong></div>
        <div><span>Diária:</span> <strong>${fmt(diaria * 100, 6)} %</strong></div>
      </div>
      <div class="calc-tile__formula">Equivalência: (1 + i_a) = (1 + i_m)¹²</div>
    `;
  }

  card.append(
    h('h3', { className: 'calc-tile__title' }, '⇄ Conversão de Taxa'),
    h('div', { className: 'calc-tile__grid' },
      h('label', null, 'Taxa (%)', inputs.rate),
      h('label', null, 'Período', inputs.from)
    ),
    out
  );
  setTimeout(calc, 0);
  return card;
}

export function financeiraPanel() {
  return h('div', { className: 'calc-grid' },
    jurosSimples(),
    jurosCompostos(),
    pricePmt(),
    vplTir(),
    conversaoTaxa()
  );
}
