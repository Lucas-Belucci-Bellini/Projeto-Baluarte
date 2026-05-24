/**
 * Página /calc-numerica — Calculadora Numérica (Fase 4)
 *
 * Layout:
 *   ┌─ display em 4 bases (DEC/BIN/HEX/OCT) ────┐
 *   │  DEC  42                                  │
 *   │  BIN  00101010                            │
 *   │  HEX  2A                                  │
 *   │  OCT  52                                  │
 *   ├─ bit grid (32 bits clicáveis) ────────────┤
 *   ├─ tabs: [Aritmética] [Bit Ops] [IEEE 754] ─┤
 *   └────────────────────────────────────────────┘
 */

import { h, cx, mount, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { toBase, fromBase, bitOps, ieee754, formatResult } from '../utils/calc-engine.js';
import { setStatus } from '../utils/baluarte-status.js';

const STORAGE_KEY = 'calc:numerica';

let state = null;
let displayDecEl, displayBinEl, displayHexEl, displayOctEl;
let bitGridEl;
let activePanelEl;
let opStatusEl;
let kbHandler = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    value: 0,
    bits: 32,
    activePanel: 'arith',
    pendingOp: null,
    operand: null
  };
}

function persist() {
  storage.set(STORAGE_KEY, state);
}

/* ===== Display update ===== */

function refreshDisplays() {
  setStatus('calcNumerica', { valor: state.value, bits: state.bits });
  if (displayDecEl) displayDecEl.textContent = state.value.toString();
  if (displayBinEl) displayBinEl.textContent = toBase(state.value, 2, state.bits);
  if (displayHexEl) displayHexEl.textContent = '0x' + toBase(state.value, 16, state.bits);
  if (displayOctEl) displayOctEl.textContent = '0o' + toBase(state.value, 8, state.bits);
  refreshBitGrid();
  refreshIeeePanel();
  if (opStatusEl) opStatusEl.textContent = state.pendingOp
    ? `${state.operand} ${state.pendingOp} ?`
    : '';
}

function refreshBitGrid() {
  if (!bitGridEl) return;
  empty(bitGridEl);
  const binary = toBase(state.value, 2, state.bits).padStart(state.bits, '0');
  for (let i = 0; i < state.bits; i++) {
    const bitVal = binary[i];
    const bitPos = state.bits - 1 - i;
    bitGridEl.appendChild(
      h(
        'button',
        {
          className: cx('bit-cell', bitVal === '1' && 'is-on'),
          'data-pos': bitPos,
          title: `bit ${bitPos}`,
          onclick: () => {
            const mask = 1 << bitPos;
            state.value = (state.value ^ mask) >>> 0;
            persist();
            refreshDisplays();
          }
        },
        h('span', { className: 'bit-cell__val' }, bitVal),
        h('span', { className: 'bit-cell__pos' }, bitPos)
      )
    );
    /* Separador a cada 4 bits */
    if (i < state.bits - 1 && (i + 1) % 4 === 0) {
      bitGridEl.appendChild(h('span', { className: 'bit-sep' }));
    }
  }
}

/* ===== Input nas bases ===== */

function setFromInput(base, str) {
  const n = fromBase(str, base);
  state.value = n;
  persist();
  refreshDisplays();
}

/* ===== Aritmética ===== */

function applyOp(b, op) {
  switch (op) {
    case '+': return state.operand + b;
    case '-': return state.operand - b;
    case '*': return state.operand * b;
    case '/': return Math.trunc(state.operand / b) || 0;
    case '%': return state.operand % b;
    case '&': return bitOps.and(state.operand, b);
    case '|': return bitOps.or(state.operand, b);
    case '^': return bitOps.xor(state.operand, b);
    case '<<': return bitOps.shl(state.operand, b);
    case '>>': return bitOps.shr(state.operand, b);
    default: return b;
  }
}

function doOp(op) {
  if (state.pendingOp) {
    state.value = applyOp(state.value, state.pendingOp);
  }
  state.operand = state.value;
  state.pendingOp = op;
  state.value = 0;
  persist();
  refreshDisplays();
}

function equalsAction() {
  if (state.pendingOp) {
    state.value = applyOp(state.value, state.pendingOp);
    state.pendingOp = null;
    state.operand = null;
  }
  persist();
  refreshDisplays();
}

function pressDigit(d) {
  /* Concatena digit ao final do display em DEC */
  const cur = state.value.toString() + d;
  const n = parseInt(cur, 10);
  state.value = isNaN(n) ? 0 : n;
  persist();
  refreshDisplays();
}

function clearAll() {
  state.value = 0;
  state.operand = null;
  state.pendingOp = null;
  persist();
  refreshDisplays();
}

function notValue() {
  state.value = bitOps.not(state.value, state.bits);
  persist();
  refreshDisplays();
}

function negateValue() {
  state.value = -state.value;
  persist();
  refreshDisplays();
}

/* ===== Painéis ===== */

function btn(label, handler, opts = {}) {
  return h('button', {
    className: cx('calc-key', opts.cls),
    title: opts.title || label,
    onclick: handler
  }, label);
}

function renderArithPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--num' });
  /* Linha 1 */
  wrap.appendChild(btn('AC', clearAll, { cls: 'calc-key--danger' }));
  wrap.appendChild(btn('±', negateValue, { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('NOT', notValue, { cls: 'calc-key--soft', title: 'Bitwise NOT' }));
  wrap.appendChild(btn('÷', () => doOp('/'), { cls: 'calc-key--op' }));
  /* Linha 2 */
  wrap.appendChild(btn('7', () => pressDigit('7')));
  wrap.appendChild(btn('8', () => pressDigit('8')));
  wrap.appendChild(btn('9', () => pressDigit('9')));
  wrap.appendChild(btn('×', () => doOp('*'), { cls: 'calc-key--op' }));
  /* Linha 3 */
  wrap.appendChild(btn('4', () => pressDigit('4')));
  wrap.appendChild(btn('5', () => pressDigit('5')));
  wrap.appendChild(btn('6', () => pressDigit('6')));
  wrap.appendChild(btn('-', () => doOp('-'), { cls: 'calc-key--op' }));
  /* Linha 4 */
  wrap.appendChild(btn('1', () => pressDigit('1')));
  wrap.appendChild(btn('2', () => pressDigit('2')));
  wrap.appendChild(btn('3', () => pressDigit('3')));
  wrap.appendChild(btn('+', () => doOp('+'), { cls: 'calc-key--op' }));
  /* Linha 5 */
  wrap.appendChild(btn('mod', () => doOp('%'), { cls: 'calc-key--soft', title: 'Módulo' }));
  wrap.appendChild(btn('0', () => pressDigit('0')));
  wrap.appendChild(btn('=', equalsAction, { cls: 'calc-key--primary' }));
  wrap.appendChild(btn('⌫', () => {
    state.value = Math.trunc(state.value / 10);
    persist();
    refreshDisplays();
  }, { cls: 'calc-key--soft', title: 'Backspace' }));
  return wrap;
}

function renderBitPanel() {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--num' });
  wrap.appendChild(btn('AND', () => doOp('&'), { cls: 'calc-key--bit', title: 'a AND b' }));
  wrap.appendChild(btn('OR', () => doOp('|'), { cls: 'calc-key--bit' }));
  wrap.appendChild(btn('XOR', () => doOp('^'), { cls: 'calc-key--bit' }));
  wrap.appendChild(btn('NOT', notValue, { cls: 'calc-key--bit' }));

  wrap.appendChild(btn('NAND', () => {
    if (state.pendingOp) state.value = applyOp(state.value, state.pendingOp);
    if (state.operand !== null) {
      state.value = bitOps.nand(state.operand, state.value);
      state.operand = null;
      state.pendingOp = null;
      persist();
      refreshDisplays();
    } else {
      state.operand = state.value;
      state.pendingOp = '&';
      state.value = 0;
      toast('NAND aplica = NOT(a AND b). Inserindo b…', { type: 'info' });
      persist();
      refreshDisplays();
    }
  }, { cls: 'calc-key--bit' }));

  wrap.appendChild(btn('NOR', () => {
    if (state.operand !== null) {
      state.value = bitOps.nor(state.operand, state.value);
      state.operand = null;
      state.pendingOp = null;
    } else {
      state.operand = state.value;
      state.pendingOp = '|';
      state.value = 0;
    }
    persist();
    refreshDisplays();
  }, { cls: 'calc-key--bit' }));

  wrap.appendChild(btn('XNOR', () => {
    if (state.operand !== null) {
      state.value = bitOps.xnor(state.operand, state.value);
      state.operand = null;
      state.pendingOp = null;
    } else {
      state.operand = state.value;
      state.pendingOp = '^';
      state.value = 0;
    }
    persist();
    refreshDisplays();
  }, { cls: 'calc-key--bit' }));

  wrap.appendChild(btn('<<', () => doOp('<<'), { cls: 'calc-key--bit', title: 'shift left' }));
  wrap.appendChild(btn('>>', () => doOp('>>'), { cls: 'calc-key--bit', title: 'shift right (logical)' }));

  /* Tamanhos */
  [8, 16, 32].forEach((b) =>
    wrap.appendChild(btn(`${b}-bit`, () => {
      state.bits = b;
      state.value = state.value & ((1 << b) - 1);
      persist();
      refreshDisplays();
    }, {
      cls: cx('calc-key--mem', state.bits === b && 'is-active'),
      title: `Tamanho ${b} bits`
    }))
  );
  return wrap;
}

function renderIeeePanel() {
  const wrap = h('div', { className: 'calc-ieee' });
  return wrap;
}

function refreshIeeePanel() {
  if (state.activePanel !== 'ieee' || !activePanelEl) return;
  empty(activePanelEl);
  const panel = h('div', { className: 'calc-ieee' });

  panel.appendChild(
    h('div', { className: 'calc-ieee__intro' },
      'Visualização IEEE 754 do valor decimal atual: ',
      h('strong', null, state.value.toString())
    )
  );

  /* Single (32-bit) */
  const single = ieee754(state.value, 'single');
  panel.appendChild(renderIeeeBlock('Single (32 bits)', single, 1, 8, 23));

  /* Double (64-bit) */
  const double = ieee754(state.value, 'double');
  panel.appendChild(renderIeeeBlock('Double (64 bits)', double, 1, 11, 52));

  /* Input float */
  const input = h('input', {
    className: 'input',
    type: 'number',
    step: 'any',
    placeholder: 'Digite um float (ex: 3.14159)',
    onchange: (e) => {
      const f = parseFloat(e.target.value);
      if (!isNaN(f)) {
        state.value = f;
        persist();
        refreshDisplays();
      }
    }
  });
  panel.appendChild(
    h('div', { className: 'calc-ieee__input' },
      h('label', { className: 'u-text-secondary u-mono', style: { fontSize: '12px' } }, 'Inserir float diretamente:'),
      input
    )
  );

  activePanelEl.appendChild(panel);
}

function renderIeeeBlock(title, parts, signBits, expBits, mantBits) {
  return h(
    'div',
    { className: 'ieee-block' },
    h('div', { className: 'ieee-block__title' }, title),
    h(
      'div',
      { className: 'ieee-block__bits' },
      h('span', { className: 'ieee-bit ieee-bit--sign', title: 'sinal (1 bit)' }, parts.sign),
      h('span', { className: 'ieee-bit ieee-bit--exp', title: `expoente (${expBits} bits)` }, parts.exponent),
      h('span', { className: 'ieee-bit ieee-bit--mant', title: `mantissa (${mantBits} bits)` }, parts.mantissa)
    ),
    h(
      'div',
      { className: 'ieee-block__legend' },
      h('span', { className: 'ieee-legend ieee-legend--sign' }, `sinal (${signBits})`),
      h('span', { className: 'ieee-legend ieee-legend--exp' }, `expoente (${expBits})`),
      h('span', { className: 'ieee-legend ieee-legend--mant' }, `mantissa (${mantBits})`)
    ),
    h(
      'div',
      { className: 'ieee-block__hex u-mono' },
      'HEX: ',
      h('span', { className: 'u-text-cyan' }, '0x' + parts.hex)
    )
  );
}

function renderActivePanel() {
  if (!activePanelEl) return;
  empty(activePanelEl);
  switch (state.activePanel) {
    case 'arith': activePanelEl.appendChild(renderArithPanel()); break;
    case 'bit': activePanelEl.appendChild(renderBitPanel()); break;
    case 'ieee': refreshIeeePanel(); break;
  }
}

function renderTabs() {
  const tabs = [
    { id: 'arith', label: 'Aritmética' },
    { id: 'bit', label: 'Bit Ops' },
    { id: 'ieee', label: 'IEEE 754' }
  ];
  return h(
    'div',
    { className: 'calc-tabs' },
    ...tabs.map((t) =>
      h('button', {
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
      }, t.label)
    )
  );
}

/* ===== Keyboard ===== */

function setupKeyboard() {
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  kbHandler = (e) => {
    if (!location.hash.startsWith('#/calc-numerica')) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) pressDigit(k);
    else if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%') doOp(k);
    else if (k === 'Enter' || k === '=') { e.preventDefault(); equalsAction(); }
    else if (k === 'Escape') clearAll();
  };
  window.addEventListener('keydown', kbHandler);
}

/* ===== Build da página ===== */

export function calcNumericaPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-calc page-calc--num' });

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
        h('span', null, 'CALCULADORA NUMÉRICA')
      ),
      h('h1', { className: 'page-header__title' }, '01 Calculadora Numérica'),
      h(
        'p',
        { className: 'page-header__description' },
        'Conversão simultânea entre ',
        h('span', { className: 'u-text-cyan' }, 'Dec, Bin, Hex e Oct'),
        '. Operações bit-a-bit (AND, OR, XOR, NOT, shift). Visualização IEEE 754 (single + double). ',
        h('span', { className: 'u-text-magenta' }, 'Click nos bits para alternar.')
      )
    )
  );

  /* Display 4 bases */
  function baseRow(label, suffix, base, refSetter) {
    const input = h('input', {
      className: 'calc-base__input',
      type: 'text',
      spellcheck: 'false',
      autocomplete: 'off',
      onchange: (e) => setFromInput(base, e.target.value)
    });
    refSetter(input);
    return h(
      'div',
      { className: 'calc-base' },
      h('span', { className: 'calc-base__label' }, label),
      h('span', { className: 'calc-base__suffix u-text-muted' }, suffix),
      input
    );
  }

  const display = h(
    'div',
    { className: 'calc-display calc-display--num' },
    baseRow('DEC', '₁₀', 10, (el) => { displayDecEl = el; }),
    baseRow('BIN', '₂', 2, (el) => { displayBinEl = el; }),
    baseRow('HEX', '₁₆', 16, (el) => { displayHexEl = el; }),
    baseRow('OCT', '₈', 8, (el) => { displayOctEl = el; })
  );

  opStatusEl = h('div', { className: 'calc-op-status u-text-muted u-mono' }, '');

  /* Bit grid */
  bitGridEl = h('div', { className: 'bit-grid' });

  /* Active panel */
  activePanelEl = h('div', { className: 'calc-panel' });

  fullPage.appendChild(
    h(
      'div',
      { className: 'calc-num-wrap' },
      display,
      opStatusEl,
      h(
        'div',
        { className: 'bit-grid-wrap' },
        h('div', { className: 'bit-grid-label u-text-muted u-mono' }, 'Bits (click pra alternar) · MSB → LSB'),
        bitGridEl
      ),
      renderTabs(),
      activePanelEl
    )
  );

  refreshDisplays();
  renderActivePanel();
  setupKeyboard();

  return fullPage;
}
