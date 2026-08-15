import '../../styles/calculadoras.css';
import { h, cx, empty } from '../../utils/helpers.js';
import { storage } from '../../core/storage.js';
import { financeiraPanel } from './financeira.js';
import { conversoresPanel } from './conversores.js';
import { estatisticaPanel } from './estatistica.js';
import { engenhariaPanel } from './engenharia.js';
import { saudePanel } from './saude.js';

const STORAGE_KEY = 'calculadoras:active';
type CalculatorId = 'financeira' | 'conversores' | 'estatistica' | 'engenharia' | 'saude';
interface CalculatorTab { readonly id: CalculatorId; readonly label: string; readonly icon: string; readonly build: () => HTMLDivElement; }
const TABS: readonly CalculatorTab[] = [
  { id: 'financeira', label: 'Financeira', icon: '$', build: financeiraPanel },
  { id: 'conversores', label: 'Conversores', icon: '⇄', build: conversoresPanel },
  { id: 'estatistica', label: 'Estatística', icon: 'σ', build: estatisticaPanel },
  { id: 'engenharia', label: 'Engenharia', icon: '⚡', build: engenhariaPanel },
  { id: 'saude', label: 'Saúde', icon: '♥', build: saudePanel },
];
let activeId: CalculatorId = 'financeira';
let panelEl: HTMLDivElement | null = null;
let tabsEl: HTMLDivElement | null = null;
function isCalculatorId(value: unknown): value is CalculatorId { return typeof value === 'string' && TABS.some((tab) => tab.id === value); }
function loadActive(): CalculatorId { const stored = storage.get(STORAGE_KEY); return isCalculatorId(stored) ? stored : 'financeira'; }
function setActive(id: CalculatorId): void { activeId = id; storage.set(STORAGE_KEY, id); renderPanel(); renderTabs(); }
function renderTabs(): void { if (!tabsEl) return; empty(tabsEl); TABS.forEach((tab) => tabsEl?.appendChild(h('button', { className: cx('calc-hub-tab', activeId === tab.id && 'is-active'), onclick: (): void => setActive(tab.id) }, h('span', { className: 'calc-hub-tab__icon' }, tab.icon), h('span', { className: 'calc-hub-tab__label' }, tab.label)))); }
function renderPanel(): void { if (!panelEl) return; const tab = TABS.find((candidate) => candidate.id === activeId) ?? TABS[0]; if (!tab) return; empty(panelEl); panelEl.appendChild(tab.build()); }
export function calculadorasPage(): HTMLDivElement { activeId = loadActive(); const fullPage = h('div', { className: 'page-calculadoras' }); fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'CALCULADORAS')), h('h1', { className: 'page-header__title' }, '∑ Hub de Calculadoras'), h('p', { className: 'page-header__description' }, '5 calculadoras especializadas: ', h('span', { className: 'u-text-cyan' }, 'Financeira'), ', ', h('span', { className: 'u-text-cyan' }, 'Conversores'), ', ', h('span', { className: 'u-text-cyan' }, 'Estatística'), ', ', h('span', { className: 'u-text-cyan' }, 'Engenharia'), ' e ', h('span', { className: 'u-text-cyan' }, 'Saúde'), '. Para Científica e Numérica use a sidebar dedicada.'))); tabsEl = h('div', { className: 'calc-hub-tabs' }); panelEl = h('div', { className: 'calc-hub-panel' }); fullPage.append(tabsEl, panelEl); renderTabs(); renderPanel(); return fullPage; }
