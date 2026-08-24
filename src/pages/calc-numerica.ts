/**
 * Página /calc-numerica — Calculadora Numérica.
 *
 * Mantém conversão simultânea entre bases, grade de bits clicáveis, operações
 * bitwise, visualização IEEE 754 e teclado global da versão V1.
 */

import '../styles/calc.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { toBase, fromBase, bitOps, ieee754 } from '../utils/calc-engine.js';
import type { Ieee754Result } from '../utils/calc-engine.js';
import { setStatus } from '../utils/baluarte-status';

const STORAGE_KEY = 'calc:numerica';

type NumericPanel = 'arith' | 'bit' | 'ieee';
type NumericOperation = '+' | '-' | '*' | '/' | '%' | '&' | '|' | '^' | '<<' | '>>';
type BitWidth = 8 | 16 | 32;

interface NumericState {
  value: number;
  bits: BitWidth;
  activePanel: NumericPanel;
  pendingOp: NumericOperation | null;
  operand: number | null;
}

interface NumericButtonOptions {
  cls?: string;
  title?: string;
}

const DEFAULT_STATE: NumericState = {
  value: 0,
  bits: 32,
  activePanel: 'arith',
  pendingOp: null,
  operand: null,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isPanel(value: unknown): value is NumericPanel {
  return value === 'arith' || value === 'bit' || value === 'ieee';
}

function isBitWidth(value: unknown): value is BitWidth {
  return value === 8 || value === 16 || value === 32;
}

function isOperation(value: unknown): value is NumericOperation {
  return value === '+' || value === '-' || value === '*' || value === '/' || value === '%'
    || value === '&' || value === '|' || value === '^' || value === '<<' || value === '>>';
}

function loadState(): NumericState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  if (!isRecord(saved)) return { ...DEFAULT_STATE };
  return {
    value: typeof saved.value === 'number' ? saved.value : DEFAULT_STATE.value,
    bits: isBitWidth(saved.bits) ? saved.bits : DEFAULT_STATE.bits,
    activePanel: isPanel(saved.activePanel) ? saved.activePanel : DEFAULT_STATE.activePanel,
    pendingOp: isOperation(saved.pendingOp) ? saved.pendingOp : null,
    operand: typeof saved.operand === 'number' ? saved.operand : null,
  };
}

let state: NumericState = { ...DEFAULT_STATE };
let displayDecEl: HTMLInputElement | null = null;
let displayBinEl: HTMLInputElement | null = null;
let displayHexEl: HTMLInputElement | null = null;
let displayOctEl: HTMLInputElement | null = null;
let bitGridEl: HTMLDivElement | null = null;
let activePanelEl: HTMLDivElement | null = null;
let opStatusEl: HTMLDivElement | null = null;
let kbHandler: ((event: KeyboardEvent) => void) | null = null;

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function refreshDisplays(): void {
  setStatus('calcNumerica', { valor: state.value, bits: state.bits });
  if (displayDecEl) displayDecEl.value = state.value.toString();
  if (displayBinEl) displayBinEl.value = toBase(state.value, 2, state.bits);
  if (displayHexEl) displayHexEl.value = `0x${toBase(state.value, 16, state.bits)}`;
  if (displayOctEl) displayOctEl.value = `0o${toBase(state.value, 8, state.bits)}`;
  refreshBitGrid();
  refreshIeeePanel();
  if (opStatusEl) {
    opStatusEl.textContent = state.pendingOp && state.operand !== null
      ? `${state.operand} ${state.pendingOp} ?`
      : '';
  }
}

function refreshBitGrid(): void {
  const grid = bitGridEl;
  if (!grid) return;
  empty(grid);
  const binary = toBase(state.value, 2, state.bits).padStart(state.bits, '0');
  for (let index = 0; index < state.bits; index += 1) {
    const bitValue = binary[index];
    const bitPosition = state.bits - 1 - index;
    grid.appendChild(h('button', {
      className: cx('bit-cell', bitValue === '1' && 'is-on'),
      'data-pos': bitPosition,
      title: `bit ${bitPosition}`,
      onclick: () => {
        const mask = 1 << bitPosition;
        state.value = (state.value ^ mask) >>> 0;
        persist();
        refreshDisplays();
      },
    },
    h('span', { className: 'bit-cell__val' }, bitValue),
    h('span', { className: 'bit-cell__pos' }, bitPosition),
    ));
    if (index < state.bits - 1 && (index + 1) % 4 === 0) {
      grid.appendChild(h('span', { className: 'bit-sep' }));
    }
  }
}

function setFromInput(base: number, value: string): void {
  state.value = fromBase(value, base);
  persist();
  refreshDisplays();
}

function applyOp(value: number, operation: NumericOperation): number {
  const operand = state.operand ?? 0;
  switch (operation) {
    case '+': return operand + value;
    case '-': return operand - value;
    case '*': return operand * value;
    case '/': return Math.trunc(operand / value) || 0;
    case '%': return operand % value;
    case '&': return bitOps.and(operand, value);
    case '|': return bitOps.or(operand, value);
    case '^': return bitOps.xor(operand, value);
    case '<<': return bitOps.shl(operand, value);
    case '>>': return bitOps.shr(operand, value);
  }
}

function doOp(operation: NumericOperation): void {
  if (state.pendingOp) state.value = applyOp(state.value, state.pendingOp);
  state.operand = state.value;
  state.pendingOp = operation;
  state.value = 0;
  persist();
  refreshDisplays();
}

function equalsAction(): void {
  if (state.pendingOp) {
    state.value = applyOp(state.value, state.pendingOp);
    state.pendingOp = null;
    state.operand = null;
  }
  persist();
  refreshDisplays();
}

function pressDigit(digit: string): void {
  const current = `${state.value}${digit}`;
  const number = Number.parseInt(current, 10);
  state.value = Number.isNaN(number) ? 0 : number;
  persist();
  refreshDisplays();
}

function clearAll(): void {
  state.value = 0;
  state.operand = null;
  state.pendingOp = null;
  persist();
  refreshDisplays();
}

function notValue(): void {
  state.value = bitOps.not(state.value, state.bits);
  persist();
  refreshDisplays();
}

function negateValue(): void {
  state.value = -state.value;
  persist();
  refreshDisplays();
}

function btn(label: string, handler: () => void, options: NumericButtonOptions = {}): HTMLButtonElement {
  return h('button', {
    className: cx('calc-key', options.cls),
    title: options.title || label,
    onclick: handler,
  }, label);
}

function renderArithPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--num' });
  wrap.appendChild(btn('AC', clearAll, { cls: 'calc-key--danger' }));
  wrap.appendChild(btn('±', negateValue, { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('NOT', notValue, { cls: 'calc-key--soft', title: 'Bitwise NOT' }));
  wrap.appendChild(btn('÷', () => doOp('/'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('7', () => pressDigit('7')));
  wrap.appendChild(btn('8', () => pressDigit('8')));
  wrap.appendChild(btn('9', () => pressDigit('9')));
  wrap.appendChild(btn('×', () => doOp('*'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('4', () => pressDigit('4')));
  wrap.appendChild(btn('5', () => pressDigit('5')));
  wrap.appendChild(btn('6', () => pressDigit('6')));
  wrap.appendChild(btn('-', () => doOp('-'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('1', () => pressDigit('1')));
  wrap.appendChild(btn('2', () => pressDigit('2')));
  wrap.appendChild(btn('3', () => pressDigit('3')));
  wrap.appendChild(btn('+', () => doOp('+'), { cls: 'calc-key--op' }));
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

function renderBitPanel(): HTMLDivElement {
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
  const widths: readonly BitWidth[] = [8, 16, 32];
  widths.forEach((bits) => wrap.appendChild(btn(`${bits}-bit`, () => {
    state.bits = bits;
    state.value = state.value & ((1 << bits) - 1);
    persist();
    refreshDisplays();
  }, {
    cls: cx('calc-key--mem', state.bits === bits && 'is-active'),
    title: `Tamanho ${bits} bits`,
  })));
  return wrap;
}

function renderIeeeBlock(title: string, parts: Ieee754Result, signBits: number, exponentBits: number, mantissaBits: number): HTMLDivElement {
  return h('div', { className: 'ieee-block' },
    h('div', { className: 'ieee-block__title' }, title),
    h('div', { className: 'ieee-block__bits' },
      h('span', { className: 'ieee-bit ieee-bit--sign', title: 'sinal (1 bit)' }, parts.sign),
      h('span', { className: 'ieee-bit ieee-bit--exp', title: `expoente (${exponentBits} bits)` }, parts.exponent),
      h('span', { className: 'ieee-bit ieee-bit--mant', title: `mantissa (${mantissaBits} bits)` }, parts.mantissa),
    ),
    h('div', { className: 'ieee-block__legend' },
      h('span', { className: 'ieee-legend ieee-legend--sign' }, `sinal (${signBits})`),
      h('span', { className: 'ieee-legend ieee-legend--exp' }, `expoente (${exponentBits})`),
      h('span', { className: 'ieee-legend ieee-legend--mant' }, `mantissa (${mantissaBits})`),
    ),
    h('div', { className: 'ieee-block__hex u-mono' },
      'HEX: ', h('span', { className: 'u-text-cyan' }, `0x${parts.hex}`),
    ),
  );
}

function refreshIeeePanel(): void {
  const panelHost = activePanelEl;
  if (state.activePanel !== 'ieee' || !panelHost) return;
  empty(panelHost);
  const panel = h('div', { className: 'calc-ieee' });
  panel.appendChild(h('div', { className: 'calc-ieee__intro' },
    'Visualização IEEE 754 do valor decimal atual: ', h('strong', null, state.value.toString()),
  ));
  panel.appendChild(renderIeeeBlock('Single (32 bits)', ieee754(state.value, 'single'), 1, 8, 23));
  panel.appendChild(renderIeeeBlock('Double (64 bits)', ieee754(state.value, 'double'), 1, 11, 52));
  const input = h('input', {
    className: 'input', type: 'number', step: 'any', placeholder: 'Digite um float (ex: 3.14159)',
    onchange: (event: Event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      const value = Number.parseFloat(event.target.value);
      if (!Number.isNaN(value)) {
        state.value = value;
        persist();
        refreshDisplays();
      }
    },
  });
  panel.appendChild(h('div', { className: 'calc-ieee__input' },
    h('label', { className: 'u-text-secondary u-mono', style: { fontSize: '12px' } }, 'Inserir float diretamente:'),
    input,
  ));
  panelHost.appendChild(panel);
}

function renderActivePanel(): void {
  const panelHost = activePanelEl;
  if (!panelHost) return;
  empty(panelHost);
  switch (state.activePanel) {
    case 'arith': panelHost.appendChild(renderArithPanel()); break;
    case 'bit': panelHost.appendChild(renderBitPanel()); break;
    case 'ieee': refreshIeeePanel(); break;
  }
}

function renderTabs(): HTMLDivElement {
  const tabs: readonly { id: NumericPanel; label: string }[] = [
    { id: 'arith', label: 'Aritmética' },
    { id: 'bit', label: 'Bit Ops' },
    { id: 'ieee', label: 'IEEE 754' },
  ];
  return h('div', { className: 'calc-tabs' },
    ...tabs.map((tab) => h('button', {
      className: cx('calc-tab', state.activePanel === tab.id && 'is-active'),
      'data-tab': tab.id,
      onclick: () => {
        state.activePanel = tab.id;
        persist();
        document.querySelectorAll('.calc-tab').forEach((button) => {
          if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.tab === tab.id);
        });
        renderActivePanel();
      },
    }, tab.label)),
  );
}

function setupKeyboard(): void {
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  kbHandler = (event: KeyboardEvent): void => {
    if (!location.hash.startsWith('#/calc-numerica')) return;
    const key = event.key;
    if (/^[0-9]$/.test(key)) pressDigit(key);
    else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%') doOp(key);
    else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      equalsAction();
    } else if (key === 'Escape') clearAll();
  };
  window.addEventListener('keydown', kbHandler);
}

export function calcNumericaPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-calc page-calc--num' });
  fullPage.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'),
    h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'CALCULADORA NUMÉRICA'),
  ),
  h('h1', { className: 'page-header__title' }, '01 Calculadora Numérica'),
  h('p', { className: 'page-header__description' },
    'Conversão simultânea entre ', h('span', { className: 'u-text-cyan' }, 'Dec, Bin, Hex e Oct'),
    '. Operações bit-a-bit (AND, OR, XOR, NOT, shift). Visualização IEEE 754 (single + double). ',
    h('span', { className: 'u-text-magenta' }, 'Click nos bits para alternar.'),
  ),
  ));

  function baseRow(
    label: string,
    suffix: string,
    base: number,
    setReference: (input: HTMLInputElement) => void,
  ): HTMLDivElement {
    const input = h('input', {
      className: 'calc-base__input',
      type: 'text',
      spellcheck: false,
      autocomplete: 'off',
      'aria-label': `Valor em ${label}`,
      onchange: (event: Event) => {
        if (event.target instanceof HTMLInputElement) setFromInput(base, event.target.value);
      },
    });
    setReference(input);
    return h('div', { className: 'calc-base' },
      h('span', { className: 'calc-base__label' }, label),
      h('span', { className: 'calc-base__suffix u-text-muted' }, suffix),
      input,
    );
  }

  const display = h('div', { className: 'calc-display calc-display--num' },
    baseRow('DEC', '₁₀', 10, (input) => { displayDecEl = input; }),
    baseRow('BIN', '₂', 2, (input) => { displayBinEl = input; }),
    baseRow('HEX', '₁₆', 16, (input) => { displayHexEl = input; }),
    baseRow('OCT', '₈', 8, (input) => { displayOctEl = input; }),
  );
  opStatusEl = h('div', { className: 'calc-op-status u-text-muted u-mono' }, '');
  bitGridEl = h('div', { className: 'bit-grid' });
  activePanelEl = h('div', { className: 'calc-panel' });
  fullPage.appendChild(h('div', { className: 'calc-num-wrap' },
    display, opStatusEl,
    h('div', { className: 'bit-grid-wrap' },
      h('div', { className: 'bit-grid-label u-text-muted u-mono' }, 'Bits (click pra alternar) · MSB → LSB'),
      bitGridEl,
    ),
    renderTabs(), activePanelEl,
  ));
  refreshDisplays();
  renderActivePanel();
  setupKeyboard();
  return fullPage;
}
