/**
 * Página /logic-sim — Simulador de Lógica (Fase 17).
 *
 * Modo simplificado: o usuário escolhe uma porta, define as 2 entradas
 * e vê a saída em tempo real. Mostra também a tabela verdade da porta.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { LOGIC_GATES } from '../data/modpack.js';

const STORAGE_KEY = 'logic-sim:state';
let state = null;
let outputEl = null;
let gateLabelEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { gate: 'AND', a: false, b: false };
}
function persist() { storage.set(STORAGE_KEY, state); }

function currentGate() {
  return LOGIC_GATES.find((g) => g.id === state.gate) || LOGIC_GATES[0];
}

function compute() {
  const g = currentGate();
  if (g.id === 'NOT') return g.fn(state.a);
  return g.fn(state.a, state.b);
}

function updateOutput() {
  if (!outputEl) return;
  const out = compute();
  outputEl.textContent = out ? '1' : '0';
  outputEl.classList.toggle('is-on', !!out);
  if (gateLabelEl) {
    const g = currentGate();
    gateLabelEl.textContent = g.id === 'NOT'
      ? `¬A = ${out ? 1 : 0}`
      : `A ${g.symbol} B = ${out ? 1 : 0}`;
  }
}

function renderTruthTable() {
  const g = currentGate();
  const rows = [];
  if (g.id === 'NOT') {
    for (const a of [0, 1]) {
      rows.push({ inputs: [a], out: g.fn(!!a) ? 1 : 0 });
    }
  } else {
    for (const a of [0, 1]) {
      for (const b of [0, 1]) {
        rows.push({ inputs: [a, b], out: g.fn(!!a, !!b) ? 1 : 0 });
      }
    }
  }
  return rows;
}

export function logicSimPage() {
  state = loadState();
  const fullPage = h('div', { className: 'page-logic' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'LOGIC SIM')),
      h('h1', { className: 'page-header__title' }, '◐ Simulador de Lógica'),
      h('p', { className: 'page-header__description' },
        '7 portas lógicas básicas com simulação interativa. Para análise completa de expressões compostas, ',
        h('a', { href: '#/tabela-verdade', style: 'color: var(--color-cyan)' }, 'use /tabela-verdade'),
        '.'
      )
    )
  );

  /* Gate selector */
  const gateBar = h('div', { className: 'logic-gates' });
  LOGIC_GATES.forEach((g) => {
    gateBar.appendChild(
      h('button', {
        className: cx('logic-gate-btn', state.gate === g.id && 'is-active'),
        'data-g': g.id,
        onclick: () => {
          state.gate = g.id;
          persist();
          document.querySelectorAll('.logic-gate-btn').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.g === g.id)
          );
          /* Re-render circuit */
          renderCircuit();
        }
      },
        h('span', { className: 'logic-gate-btn__sym' }, g.symbol),
        h('span', { className: 'logic-gate-btn__name' }, g.id)
      )
    );
  });
  fullPage.appendChild(gateBar);

  const circuitEl = h('div', { className: 'logic-circuit' });
  fullPage.appendChild(circuitEl);

  function renderCircuit() {
    empty(circuitEl);
    const g = currentGate();
    const isNot = g.id === 'NOT';

    /* Description */
    circuitEl.appendChild(
      h('div', { className: 'logic-desc' },
        h('strong', null, g.id + ' — ' + g.symbol + ' '),
        h('span', { className: 'u-text-muted' }, g.desc)
      )
    );

    /* Circuit visual */
    const wires = h('div', { className: 'logic-wires' });
    const inputA = h('button', {
      className: cx('logic-input', state.a && 'is-on'),
      onclick: () => { state.a = !state.a; persist(); inputA.classList.toggle('is-on', state.a); inputA.textContent = state.a ? '1' : '0'; updateOutput(); }
    }, state.a ? '1' : '0');
    const inputB = !isNot ? h('button', {
      className: cx('logic-input', state.b && 'is-on'),
      onclick: () => { state.b = !state.b; persist(); inputB.classList.toggle('is-on', state.b); inputB.textContent = state.b ? '1' : '0'; updateOutput(); }
    }, state.b ? '1' : '0') : null;

    const gateBox = h('div', { className: 'logic-gate' },
      h('div', { className: 'logic-gate__name' }, g.id),
      h('div', { className: 'logic-gate__sym' }, g.symbol)
    );

    outputEl = h('div', { className: 'logic-output' }, '0');
    gateLabelEl = h('div', { className: 'logic-label u-mono u-text-muted' }, '');

    wires.appendChild(
      h('div', { className: 'logic-inputs' },
        h('div', { className: 'logic-port' }, h('span', { className: 'logic-port__label u-text-muted' }, 'A'), inputA),
        !isNot && h('div', { className: 'logic-port' }, h('span', { className: 'logic-port__label u-text-muted' }, 'B'), inputB)
      )
    );
    wires.appendChild(h('div', { className: 'logic-arrow' }, '→'));
    wires.appendChild(gateBox);
    wires.appendChild(h('div', { className: 'logic-arrow' }, '→'));
    wires.appendChild(
      h('div', { className: 'logic-port' },
        h('span', { className: 'logic-port__label u-text-muted' }, 'OUT'),
        outputEl
      )
    );
    circuitEl.appendChild(wires);
    circuitEl.appendChild(gateLabelEl);

    /* Truth table */
    const rows = renderTruthTable();
    const tbl = h('table', { className: 'logic-truth' });
    const thead = h('thead');
    const trH = h('tr');
    trH.appendChild(h('th', null, 'A'));
    if (!isNot) trH.appendChild(h('th', null, 'B'));
    trH.appendChild(h('th', null, 'OUT'));
    thead.appendChild(trH);
    tbl.appendChild(thead);
    const tbody = h('tbody');
    rows.forEach((r) => {
      const tr = h('tr');
      r.inputs.forEach((v) => tr.appendChild(h('td', null, v)));
      tr.appendChild(h('td', { className: cx('logic-truth__out', r.out && 'is-on') }, r.out));
      tbody.appendChild(tr);
    });
    tbl.appendChild(tbody);
    circuitEl.appendChild(
      h('div', { className: 'logic-truth-wrap' },
        h('div', { className: 'logic-truth-title' }, '◫ Tabela verdade'),
        tbl
      )
    );

    updateOutput();
  }

  renderCircuit();

  /* Botão pra tabela-verdade completa */
  fullPage.appendChild(
    h('button', {
      className: 'btn btn--primary btn--sm',
      style: 'margin-top: var(--space-md)',
      onclick: () => router.navigate('/tabela-verdade')
    }, '⊨ Expressões compostas → /tabela-verdade')
  );

  return fullPage;
}
