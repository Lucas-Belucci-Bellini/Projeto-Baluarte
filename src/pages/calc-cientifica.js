/**
 * Página /calc-cientifica — Calculadora Científica (Fase 4)
 *
 * Layout:
 *   ┌─ display ────────────────────────────────────┐
 *   │  expressão (small)                            │
 *   │  resultado (big)                              │
 *   ├─ tabs: [Padrão] [Trig] [Log/Exp] [Memória] ──┤
 *   ├─ keypad ─────────────────────────────────────┤
 *   │  [7][8][9][÷][√][π]                           │
 *   │  [4][5][6][×][^][e]                           │
 *   │  [1][2][3][-][!][(]                           │
 *   │  [0][.][=][+][AC][)]                          │
 *   └────────────────────────────────────────────────┘
 *
 * Histórico: lateral, persiste em localStorage.
 */

import { h, cx, mount, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { evaluate, formatResult } from '../utils/calc-engine.js';

const STORAGE_KEY = 'calc:cientifica';
const MAX_HISTORY = 30;

let state = null;
let displayExpr = null;
let displayResult = null;
let modeBtnEl = null;
let historyEl = null;
let activePanelEl = null;
let memoryBadgeEl = null;
let kbHandler = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    expr: '',
    result: 0,
    memory: 0,
    angleMode: 'deg',
    history: [],
    activePanel: 'standard'
  };
}

function persist() {
  storage.set(STORAGE_KEY, state);
}

/* ===== Atualizadores de display ===== */

function refresh() {
  if (displayExpr) displayExpr.textContent = state.expr || '0';
  if (displayResult) {
    const r = evaluate(state.expr, { mode: state.angleMode, scope: { ans: state.result, m: state.memory } });
    if (r.error) {
      displayResult.textContent = '—';
      displayResult.classList.add('is-error');
      displayResult.title = r.error;
    } else {
      displayResult.textContent = formatResult(r.value);
      displayResult.classList.remove('is-error');
      displayResult.title = '';
    }
  }
  if (modeBtnEl) modeBtnEl.textContent = state.angleMode.toUpperCase();
  if (memoryBadgeEl) memoryBadgeEl.style.opacity = state.memory !== 0 ? '1' : '0.3';
}

function refreshHistory() {
  if (!historyEl) return;
  empty(historyEl);
  if (!state.history.length) {
    historyEl.appendChild(
      h('div', { className: 'calc-history__empty u-text-muted' }, 'Histórico vazio. Calcule algo!')
    );
    return;
  }
  state.history.slice().reverse().forEach((entry) => {
    historyEl.appendChild(
      h(
        'div',
        {
          className: 'calc-history__item',
          title: 'Click para reusar',
          onclick: () => {
            state.expr = entry.expr;
            persist();
            refresh();
          }
        },
        h('div', { className: 'calc-history__expr' }, entry.expr),
        h('div', { className: 'calc-history__result' }, '= ' + formatResult(entry.result))
      )
    );
  });
}

/* ===== Ações ===== */

function press(token) {
  state.expr = (state.expr || '') + token;
  persist();
  refresh();
}

function clearAll() {
  state.expr = '';
  state.result = 0;
  persist();
  refresh();
}

function clearEntry() {
  state.expr = state.expr.slice(0, -1);
  persist();
  refresh();
}

function equalsAction() {
  if (!state.expr) return;
  const r = evaluate(state.expr, { mode: state.angleMode, scope: { ans: state.result, m: state.memory } });
  if (r.error) {
    toast('Erro: ' + r.error, { type: 'danger' });
    return;
  }
  state.result = r.value;
  state.history.push({ expr: state.expr, result: r.value });
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.expr = formatResult(r.value);
  persist();
  refresh();
  refreshHistory();
}

function toggleAngleMode() {
  state.angleMode = state.angleMode === 'deg' ? 'rad' : 'deg';
  persist();
  refresh();
}

function memoryOp(op) {
  /* Avalia o expr atual antes de aplicar memória */
  const r = evaluate(state.expr || '0', { mode: state.angleMode, scope: { ans: state.result, m: state.memory } });
  const v = r.error ? 0 : r.value;
  switch (op) {
    case 'MC': state.memory = 0; toast('Memória limpa', { type: 'info' }); break;
    case 'MR': state.expr = (state.expr || '') + state.memory; toast(`MR: ${formatResult(state.memory)}`, { type: 'info' }); break;
    case 'M+': state.memory += v; toast(`Memória: ${formatResult(state.memory)}`, { type: 'success' }); break;
    case 'M-': state.memory -= v; toast(`Memória: ${formatResult(state.memory)}`, { type: 'success' }); break;
    case 'MS': state.memory = v; toast(`Memória ← ${formatResult(state.memory)}`, { type: 'success' }); break;
  }
  persist();
  refresh();
}

/* ===== Render: keypad por painel ===== */

function btn(label, handler, opts = {}) {
  return h(
    'button',
    {
      className: cx('calc-key', opts.cls),
      title: opts.title || label,
      onclick: handler
    },
    label
  );
}

function renderStandardPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--std' });
  /* Linha 1 */
  wrap.appendChild(btn('AC', clearAll, { cls: 'calc-key--danger', title: 'Limpar tudo' }));
  wrap.appendChild(btn('CE', clearEntry, { cls: 'calc-key--soft', title: 'Limpar último caractere' }));
  wrap.appendChild(btn('(', () => press('('), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn(')', () => press(')'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('÷', () => press('/'), { cls: 'calc-key--op' }));

  /* Linha 2 */
  wrap.appendChild(btn('7', () => press('7')));
  wrap.appendChild(btn('8', () => press('8')));
  wrap.appendChild(btn('9', () => press('9')));
  wrap.appendChild(btn('√', () => press('sqrt('), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('×', () => press('*'), { cls: 'calc-key--op' }));

  /* Linha 3 */
  wrap.appendChild(btn('4', () => press('4')));
  wrap.appendChild(btn('5', () => press('5')));
  wrap.appendChild(btn('6', () => press('6')));
  wrap.appendChild(btn('x²', () => press('^2'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('-', () => press('-'), { cls: 'calc-key--op' }));

  /* Linha 4 */
  wrap.appendChild(btn('1', () => press('1')));
  wrap.appendChild(btn('2', () => press('2')));
  wrap.appendChild(btn('3', () => press('3')));
  wrap.appendChild(btn('xⁿ', () => press('^'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('+', () => press('+'), { cls: 'calc-key--op' }));

  /* Linha 5 */
  wrap.appendChild(btn('±', () => press('-'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('0', () => press('0')));
  wrap.appendChild(btn('.', () => press('.')));
  wrap.appendChild(btn('!', () => press('!'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('=', equalsAction, { cls: 'calc-key--primary', title: 'Calcular (Enter)' }));

  return wrap;
}

function renderTrigPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--trig' });
  const items = [
    ['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('],
    ['asin', 'asin('], ['acos', 'acos('], ['atan', 'atan('],
    ['sinh', 'sinh('], ['cosh', 'cosh('], ['tanh', 'tanh('],
    ['π', 'pi'], ['e', 'e'], ['φ', 'phi']
  ];
  items.forEach(([label, val]) =>
    wrap.appendChild(btn(label, () => press(val), { cls: 'calc-key--func' }))
  );
  return wrap;
}

function renderLogPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--log' });
  const items = [
    ['log', 'log('], ['ln', 'ln('], ['log₂', 'log2('],
    ['10ˣ', '10^'], ['eˣ', 'exp('], ['2ˣ', '2^'],
    ['x!', '!'], ['|x|', 'abs('], ['mod', '%'],
    ['⌊x⌋', 'floor('], ['⌈x⌉', 'ceil('], ['round', 'round(']
  ];
  items.forEach(([label, val]) =>
    wrap.appendChild(btn(label, () => press(val), { cls: 'calc-key--func' }))
  );
  return wrap;
}

function renderMemoryPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--mem' });
  ['MC', 'MR', 'M+', 'M-', 'MS'].forEach((op) =>
    wrap.appendChild(btn(op, () => memoryOp(op), { cls: 'calc-key--mem' }))
  );
  wrap.appendChild(
    h('div', { className: 'calc-mem-display' },
      h('div', { className: 'calc-mem-display__label' }, 'Memória'),
      h('div', { className: 'calc-mem-display__value', id: 'mem-disp' },
        formatResult(state.memory))
    )
  );
  /* ans */
  wrap.appendChild(btn('Ans', () => press('ans'), { cls: 'calc-key--mem', title: 'Último resultado' }));
  return wrap;
}

function renderActivePanel() {
  if (!activePanelEl) return;
  empty(activePanelEl);
  switch (state.activePanel) {
    case 'standard': activePanelEl.appendChild(renderStandardPanel()); break;
    case 'trig': activePanelEl.appendChild(renderTrigPanel()); break;
    case 'log': activePanelEl.appendChild(renderLogPanel()); break;
    case 'mem': activePanelEl.appendChild(renderMemoryPanel()); break;
  }
}

/* ===== Tabs ===== */

function renderTabs() {
  const tabs = [
    { id: 'standard', label: 'Padrão' },
    { id: 'trig', label: 'Trig' },
    { id: 'log', label: 'Log/Exp' },
    { id: 'mem', label: 'Memória' }
  ];
  return h(
    'div',
    { className: 'calc-tabs' },
    ...tabs.map((t) =>
      h(
        'button',
        {
          className: cx('calc-tab', state.activePanel === t.id && 'is-active'),
          'data-tab': t.id,
          onclick: () => {
            state.activePanel = t.id;
            persist();
            document.querySelectorAll('.calc-tab').forEach((b) =>
              b.classList.toggle('is-active', b.dataset.tab === t.id)
            );
            renderActivePanel();
          }
        },
        t.label
      )
    )
  );
}

/* ===== Keyboard global ===== */

function setupKeyboard() {
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  kbHandler = (e) => {
    if (!location.hash.startsWith('#/calc-cientifica')) return;
    const k = e.key;
    if (/^[0-9.]$/.test(k)) { press(k); }
    else if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%' || k === '^' || k === '(' || k === ')') { press(k); }
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equalsAction(); }
    else if (k === 'Backspace') { e.preventDefault(); clearEntry(); }
    else if (k === 'Escape') { clearAll(); }
    else if (k === '!') { press('!'); }
  };
  window.addEventListener('keydown', kbHandler);
}

/* ===== Page builder ===== */

export function calcCientificaPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-calc' });

  /* Header */
  fullPage.appendChild(
    h(
      'div',
      { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h(
        'div',
        { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'CALCULADORA CIENTÍFICA')
      ),
      h('h1', { className: 'page-header__title' }, '∑ Calculadora Científica'),
      h(
        'p',
        { className: 'page-header__description' },
        'Trigonometria (sin/cos/tan e inversas), hiperbólicas, logaritmos, fatoriais, parênteses e ',
        h('span', { className: 'u-text-cyan' }, 'expressões completas'),
        '. Memória + histórico (',
        h('kbd', null, 'Enter'),
        ' = · ',
        h('kbd', null, 'Backspace'),
        ' apaga · ',
        h('kbd', null, 'Esc'),
        ' AC).'
      )
    )
  );

  /* Display */
  displayExpr = h('div', { className: 'calc-display__expr' }, state.expr || '0');
  displayResult = h('div', { className: 'calc-display__result' }, '0');
  modeBtnEl = h(
    'button',
    {
      className: 'calc-mode',
      title: 'Modo angular (DEG ↔ RAD)',
      onclick: toggleAngleMode
    },
    state.angleMode.toUpperCase()
  );
  memoryBadgeEl = h('span', { className: 'badge badge--magenta' }, 'M');

  const display = h(
    'div',
    { className: 'calc-display' },
    h(
      'div',
      { className: 'calc-display__top' },
      modeBtnEl,
      memoryBadgeEl
    ),
    displayExpr,
    displayResult
  );

  /* Histórico */
  historyEl = h('div', { className: 'calc-history__list' });
  const historyPanel = h(
    'div',
    { className: 'calc-history' },
    h(
      'div',
      { className: 'calc-history__head' },
      h('span', null, '⌂ Histórico'),
      h(
        'button',
        {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            if (confirm('Limpar todo o histórico?')) {
              state.history = [];
              persist();
              refreshHistory();
            }
          }
        },
        'Clear'
      )
    ),
    historyEl
  );

  /* Painel ativo (keypad) */
  activePanelEl = h('div', { className: 'calc-panel' });

  /* Layout */
  const main = h(
    'div',
    { className: 'calc-main' },
    h(
      'div',
      { className: 'calc-main__left' },
      display,
      renderTabs(),
      activePanelEl
    ),
    historyPanel
  );

  fullPage.appendChild(main);

  refresh();
  refreshHistory();
  renderActivePanel();
  setupKeyboard();

  return fullPage;
}
