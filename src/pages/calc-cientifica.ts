/**
 * Página /calc-cientifica — Calculadora Científica.
 *
 * Mantém o display, histórico, memória, modos angular/logarítmico e teclado
 * global da versão V1, delegando a avaliação para calc-engine.js.
 */

import '../styles/calc.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { evaluate, formatResult } from '../utils/calc-engine.js';
import type { AngleMode } from '../utils/calc-engine.js';

const STORAGE_KEY = 'calc:cientifica';
const MAX_HISTORY = 30;

type PanelId = 'standard' | 'trig' | 'log' | 'mem';
type MemoryOperation = 'MC' | 'MR' | 'M+' | 'M-' | 'MS';

interface HistoryEntry {
  expr: string;
  result: number;
}

interface ScientificState {
  expr: string;
  result: number;
  memory: number;
  angleMode: AngleMode;
  history: HistoryEntry[];
  activePanel: PanelId;
}

interface ButtonOptions {
  cls?: string;
  title?: string;
}

interface PanelTab {
  id: PanelId;
  label: string;
}

const DEFAULT_STATE: ScientificState = {
  expr: '',
  result: 0,
  memory: 0,
  angleMode: 'deg',
  history: [],
  activePanel: 'standard',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isAngleMode(value: unknown): value is AngleMode {
  return value === 'deg' || value === 'rad';
}

function isPanelId(value: unknown): value is PanelId {
  return value === 'standard' || value === 'trig' || value === 'log' || value === 'mem';
}

function parseHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry): HistoryEntry[] => {
    if (!isRecord(entry) || !isString(entry.expr) || typeof entry.result !== 'number') return [];
    return [{ expr: entry.expr, result: entry.result }];
  }).slice(-MAX_HISTORY);
}

function loadState(): ScientificState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  if (!isRecord(saved)) return { ...DEFAULT_STATE, history: [] };
  return {
    expr: isString(saved.expr) ? saved.expr : DEFAULT_STATE.expr,
    result: typeof saved.result === 'number' ? saved.result : DEFAULT_STATE.result,
    memory: typeof saved.memory === 'number' ? saved.memory : DEFAULT_STATE.memory,
    angleMode: isAngleMode(saved.angleMode) ? saved.angleMode : DEFAULT_STATE.angleMode,
    history: parseHistory(saved.history),
    activePanel: isPanelId(saved.activePanel) ? saved.activePanel : DEFAULT_STATE.activePanel,
  };
}

let state: ScientificState = { ...DEFAULT_STATE, history: [] };
let displayExpr: HTMLDivElement | null = null;
let displayResult: HTMLDivElement | null = null;
let modeBtnEl: HTMLButtonElement | null = null;
let historyEl: HTMLDivElement | null = null;
let activePanelEl: HTMLDivElement | null = null;
let memoryBadgeEl: HTMLSpanElement | null = null;
let kbHandler: ((event: KeyboardEvent) => void) | null = null;

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function refresh(): void {
  if (displayExpr) displayExpr.textContent = state.expr || '0';
  if (displayResult) {
    const result = evaluate(state.expr, {
      mode: state.angleMode,
      scope: { ans: state.result, m: state.memory },
    });
    if (result.error) {
      displayResult.textContent = '—';
      displayResult.classList.add('is-error');
      displayResult.title = result.error;
    } else {
      displayResult.textContent = formatResult(result.value);
      displayResult.classList.remove('is-error');
      displayResult.title = '';
    }
  }
  if (modeBtnEl) modeBtnEl.textContent = state.angleMode.toUpperCase();
  if (memoryBadgeEl) memoryBadgeEl.style.opacity = state.memory !== 0 ? '1' : '0.3';
}

function refreshHistory(): void {
  const history = historyEl;
  if (!history) return;
  empty(history);
  if (!state.history.length) {
    history.appendChild(h('div', { className: 'calc-history__empty u-text-muted' }, 'Histórico vazio. Calcule algo!'));
    return;
  }
  state.history.slice().reverse().forEach((entry) => {
    history.appendChild(h('div', {
      className: 'calc-history__item',
      title: 'Click para reusar',
      onclick: () => {
        state.expr = entry.expr;
        persist();
        refresh();
      },
    },
    h('div', { className: 'calc-history__expr' }, entry.expr),
    h('div', { className: 'calc-history__result' }, `= ${formatResult(entry.result)}`),
    ));
  });
}

function press(token: string): void {
  state.expr = `${state.expr || ''}${token}`;
  persist();
  refresh();
}

function clearAll(): void {
  state.expr = '';
  state.result = 0;
  persist();
  refresh();
}

function clearEntry(): void {
  state.expr = state.expr.slice(0, -1);
  persist();
  refresh();
}

function equalsAction(): void {
  if (!state.expr) return;
  const result = evaluate(state.expr, {
    mode: state.angleMode,
    scope: { ans: state.result, m: state.memory },
  });
  if (result.error) {
    toast(`Erro: ${result.error}`, { type: 'danger' });
    return;
  }
  state.result = result.value;
  state.history.push({ expr: state.expr, result: result.value });
  if (state.history.length > MAX_HISTORY) state.history.shift();
  state.expr = formatResult(result.value);
  persist();
  refresh();
  refreshHistory();
}

function toggleAngleMode(): void {
  state.angleMode = state.angleMode === 'deg' ? 'rad' : 'deg';
  persist();
  refresh();
}

function memoryOp(operation: MemoryOperation): void {
  const result = evaluate(state.expr || '0', {
    mode: state.angleMode,
    scope: { ans: state.result, m: state.memory },
  });
  const value = result.error ? 0 : result.value;
  switch (operation) {
    case 'MC':
      state.memory = 0;
      toast('Memória limpa', { type: 'info' });
      break;
    case 'MR':
      state.expr = `${state.expr || ''}${state.memory}`;
      toast(`MR: ${formatResult(state.memory)}`, { type: 'info' });
      break;
    case 'M+':
      state.memory += value;
      toast(`Memória: ${formatResult(state.memory)}`, { type: 'success' });
      break;
    case 'M-':
      state.memory -= value;
      toast(`Memória: ${formatResult(state.memory)}`, { type: 'success' });
      break;
    case 'MS':
      state.memory = value;
      toast(`Memória ← ${formatResult(state.memory)}`, { type: 'success' });
      break;
  }
  persist();
  refresh();
}

function btn(label: string, handler: () => void, options: ButtonOptions = {}): HTMLButtonElement {
  return h('button', {
    className: cx('calc-key', options.cls),
    title: options.title || label,
    onclick: handler,
  }, label);
}

function renderStandardPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--std' });
  wrap.appendChild(btn('AC', clearAll, { cls: 'calc-key--danger', title: 'Limpar tudo' }));
  wrap.appendChild(btn('CE', clearEntry, { cls: 'calc-key--soft', title: 'Limpar último caractere' }));
  wrap.appendChild(btn('(', () => press('('), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn(')', () => press(')'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('÷', () => press('/'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('7', () => press('7')));
  wrap.appendChild(btn('8', () => press('8')));
  wrap.appendChild(btn('9', () => press('9')));
  wrap.appendChild(btn('√', () => press('sqrt('), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('×', () => press('*'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('4', () => press('4')));
  wrap.appendChild(btn('5', () => press('5')));
  wrap.appendChild(btn('6', () => press('6')));
  wrap.appendChild(btn('x²', () => press('^2'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('-', () => press('-'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('1', () => press('1')));
  wrap.appendChild(btn('2', () => press('2')));
  wrap.appendChild(btn('3', () => press('3')));
  wrap.appendChild(btn('xⁿ', () => press('^'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('+', () => press('+'), { cls: 'calc-key--op' }));
  wrap.appendChild(btn('±', () => press('-'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('0', () => press('0')));
  wrap.appendChild(btn('.', () => press('.')));
  wrap.appendChild(btn('!', () => press('!'), { cls: 'calc-key--soft' }));
  wrap.appendChild(btn('=', equalsAction, { cls: 'calc-key--primary', title: 'Calcular (Enter)' }));
  return wrap;
}

function renderFunctionPanel(className: string, items: readonly (readonly [string, string])[]): HTMLDivElement {
  const wrap = h('div', { className: `calc-keypad ${className}` });
  items.forEach(([label, value]) => {
    wrap.appendChild(btn(label, () => press(value), { cls: 'calc-key--func' }));
  });
  return wrap;
}

function renderTrigPanel(): HTMLDivElement {
  return renderFunctionPanel('calc-keypad--trig', [
    ['sin', 'sin('], ['cos', 'cos('], ['tan', 'tan('],
    ['asin', 'asin('], ['acos', 'acos('], ['atan', 'atan('],
    ['sinh', 'sinh('], ['cosh', 'cosh('], ['tanh', 'tanh('],
    ['π', 'pi'], ['e', 'e'], ['φ', 'phi'],
  ]);
}

function renderLogPanel(): HTMLDivElement {
  return renderFunctionPanel('calc-keypad--log', [
    ['log', 'log('], ['ln', 'ln('], ['log₂', 'log2('],
    ['10ˣ', '10^'], ['eˣ', 'exp('], ['2ˣ', '2^'],
    ['x!', '!'], ['|x|', 'abs('], ['mod', '%'],
    ['⌊x⌋', 'floor('], ['⌈x⌉', 'ceil('], ['round', 'round('],
  ]);
}

function renderMemoryPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'calc-keypad calc-keypad--mem' });
  const operations: readonly MemoryOperation[] = ['MC', 'MR', 'M+', 'M-', 'MS'];
  operations.forEach((operation) => {
    wrap.appendChild(btn(operation, () => memoryOp(operation), { cls: 'calc-key--mem' }));
  });
  wrap.appendChild(h('div', { className: 'calc-mem-display' },
    h('div', { className: 'calc-mem-display__label' }, 'Memória'),
    h('div', { className: 'calc-mem-display__value', id: 'mem-disp' }, formatResult(state.memory)),
  ));
  wrap.appendChild(btn('Ans', () => press('ans'), { cls: 'calc-key--mem', title: 'Último resultado' }));
  return wrap;
}

function renderActivePanel(): void {
  if (!activePanelEl) return;
  empty(activePanelEl);
  switch (state.activePanel) {
    case 'standard': activePanelEl.appendChild(renderStandardPanel()); break;
    case 'trig': activePanelEl.appendChild(renderTrigPanel()); break;
    case 'log': activePanelEl.appendChild(renderLogPanel()); break;
    case 'mem': activePanelEl.appendChild(renderMemoryPanel()); break;
  }
}

function renderTabs(): HTMLDivElement {
  const tabs: readonly PanelTab[] = [
    { id: 'standard', label: 'Padrão' },
    { id: 'trig', label: 'Trig' },
    { id: 'log', label: 'Log/Exp' },
    { id: 'mem', label: 'Memória' },
  ];
  return h('div', { className: 'calc-tabs' },
    ...tabs.map((tab) => h('button', {
      className: cx('calc-tab', state.activePanel === tab.id && 'is-active'),
      'data-tab': tab.id,
      onclick: () => {
        state.activePanel = tab.id;
        persist();
        document.querySelectorAll('.calc-tab').forEach((button) => {
          if (button instanceof HTMLElement) {
            button.classList.toggle('is-active', button.dataset.tab === tab.id);
          }
        });
        renderActivePanel();
      },
    }, tab.label)),
  );
}

function setupKeyboard(): void {
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  kbHandler = (event: KeyboardEvent): void => {
    if (!location.hash.startsWith('#/calc-cientifica')) return;
    const key = event.key;
    if (/^[0-9.]$/.test(key)) press(key);
    else if ('+-*/%^()'.includes(key)) press(key);
    else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      equalsAction();
    } else if (key === 'Backspace') {
      event.preventDefault();
      clearEntry();
    } else if (key === 'Escape') clearAll();
    else if (key === '!') press('!');
  };
  window.addEventListener('keydown', kbHandler);
}

export function calcCientificaPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-calc' });
  fullPage.appendChild(h('div', {
    className: 'page-header anim-fade-in',
    style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'),
    h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
    h('span', null, 'CALCULADORA CIENTÍFICA'),
  ),
  h('h1', { className: 'page-header__title' }, '∑ Calculadora Científica'),
  h('p', { className: 'page-header__description' },
    'Trigonometria (sin/cos/tan e inversas), hiperbólicas, logaritmos, fatoriais, parênteses e ',
    h('span', { className: 'u-text-cyan' }, 'expressões completas'), '. Memória + histórico (',
    h('kbd', null, 'Enter'), ' = · ', h('kbd', null, 'Backspace'), ' apaga · ',
    h('kbd', null, 'Esc'), ' AC).',
  ),
  ));

  displayExpr = h('div', { className: 'calc-display__expr' }, state.expr || '0');
  displayResult = h('div', { className: 'calc-display__result' }, '0');
  modeBtnEl = h('button', {
    className: 'calc-mode',
    title: 'Modo angular (DEG ↔ RAD)',
    onclick: toggleAngleMode,
  }, state.angleMode.toUpperCase());
  memoryBadgeEl = h('span', { className: 'badge badge--magenta' }, 'M');
  const display = h('div', { className: 'calc-display' },
    h('div', { className: 'calc-display__top' }, modeBtnEl, memoryBadgeEl),
    displayExpr,
    displayResult,
  );

  historyEl = h('div', { className: 'calc-history__list' });
  const historyPanel = h('div', { className: 'calc-history' },
    h('div', { className: 'calc-history__head' },
      h('span', null, '⌂ Histórico'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => {
          if (confirm('Limpar todo o histórico?')) {
            state.history = [];
            persist();
            refreshHistory();
          }
        },
      }, 'Clear'),
    ),
    historyEl,
  );

  activePanelEl = h('div', { className: 'calc-panel' });
  const main = h('div', { className: 'calc-main' },
    h('div', { className: 'calc-main__left' }, display, renderTabs(), activePanelEl),
    historyPanel,
  );
  fullPage.appendChild(main);
  refresh();
  refreshHistory();
  renderActivePanel();
  setupKeyboard();
  return fullPage;
}
