/**
 * Hub /calculadoras — 5 calculadoras em tabs (Fase 5).
 *
 * - Financeira (juros, VPL, TIR, Price, conversão de taxa)
 * - Conversores (10 categorias, 80+ unidades)
 * - Estatística (descritiva + regressão linear)
 * - Engenharia (Ohm, divisor, resistor color, frequência, Stevin)
 * - Saúde (IMC, TMB, macros, FC, hidratação)
 */

import { h, cx, mount, empty } from '../../utils/helpers.js';
import { storage } from '../../core/storage.js';
import { financeiraPanel } from './financeira.js';
import { conversoresPanel } from './conversores.js';
import { estatisticaPanel } from './estatistica.js';
import { engenhariaPanel } from './engenharia.js';
import { saudePanel } from './saude.js';

const STORAGE_KEY = 'calculadoras:active';

const TABS = [
  { id: 'financeira', label: 'Financeira', icon: '$', build: financeiraPanel },
  { id: 'conversores', label: 'Conversores', icon: '⇄', build: conversoresPanel },
  { id: 'estatistica', label: 'Estatística', icon: 'σ', build: estatisticaPanel },
  { id: 'engenharia', label: 'Engenharia', icon: '⚡', build: engenhariaPanel },
  { id: 'saude', label: 'Saúde', icon: '♥', build: saudePanel }
];

let activeId = null;
let panelEl = null;
let tabsEl = null;

function loadActive() {
  return storage.get(STORAGE_KEY) || 'financeira';
}

function setActive(id) {
  activeId = id;
  storage.set(STORAGE_KEY, id);
  renderPanel();
  renderTabs();
}

function renderTabs() {
  if (!tabsEl) return;
  empty(tabsEl);
  TABS.forEach((t) => {
    tabsEl.appendChild(
      h('button', {
        className: cx('calc-hub-tab', activeId === t.id && 'is-active'),
        onclick: () => setActive(t.id)
      },
        h('span', { className: 'calc-hub-tab__icon' }, t.icon),
        h('span', { className: 'calc-hub-tab__label' }, t.label)
      )
    );
  });
}

function renderPanel() {
  if (!panelEl) return;
  const tab = TABS.find((t) => t.id === activeId) || TABS[0];
  empty(panelEl);
  panelEl.appendChild(tab.build());
}

export function calculadorasPage() {
  activeId = loadActive();

  const fullPage = h('div', { className: 'page-calculadoras' });

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
        h('span', null, 'CALCULADORAS')
      ),
      h('h1', { className: 'page-header__title' }, '∑ Hub de Calculadoras'),
      h(
        'p',
        { className: 'page-header__description' },
        '5 calculadoras especializadas: ',
        h('span', { className: 'u-text-cyan' }, 'Financeira'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'Conversores'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'Estatística'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'Engenharia'),
        ' e ',
        h('span', { className: 'u-text-cyan' }, 'Saúde'),
        '. Para Científica e Numérica use a sidebar dedicada.'
      )
    )
  );

  tabsEl = h('div', { className: 'calc-hub-tabs' });
  panelEl = h('div', { className: 'calc-hub-panel' });

  fullPage.appendChild(tabsEl);
  fullPage.appendChild(panelEl);

  renderTabs();
  renderPanel();

  return fullPage;
}
