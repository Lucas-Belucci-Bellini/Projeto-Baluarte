/**
 * Hub /cripto — Lab de Criptografia (Fase 7 P1 + Fase 8 P2).
 *
 * Atualmente implementadas (Fase 7):
 *   - César (encode/decode/brute force)
 *   - Base64/Base32/Hex
 *   - Hash (SHA-1/256/384/512)
 *   - Morse (encode/decode/áudio)
 *
 * Próximas (Fase 8): AES-GCM, Vigenère, Atbash, OTP.
 */

import { h, cx, empty } from '../../utils/helpers.js';
import { storage } from '../../core/storage.js';
import { caesarPanel } from './caesar.js';
import { basePanel } from './base.js';
import { hashPanel } from './hash.js';
import { morsePanel } from './morse.js';
import { stopMorse } from '../../utils/cripto-engine.js';

const STORAGE_KEY = 'cripto:active';

const TABS = [
  { id: 'caesar', label: 'César', icon: 'C', build: caesarPanel },
  { id: 'base', label: 'Base/Hex', icon: '⬢', build: basePanel },
  { id: 'hash', label: 'Hash', icon: '#', build: hashPanel },
  { id: 'morse', label: 'Morse', icon: '· ─', build: morsePanel }
];

const FUTURE_TABS = [
  { id: 'aes', label: 'AES-GCM', icon: '⚿', phase: 8 },
  { id: 'vigenere', label: 'Vigenère', icon: 'V', phase: 8 },
  { id: 'atbash', label: 'Atbash', icon: 'A', phase: 8 },
  { id: 'otp', label: 'OTP', icon: '⊕', phase: 8 }
];

let activeId;
let panelEl;
let tabsEl;

function loadActive() {
  return storage.get(STORAGE_KEY) || 'caesar';
}

function setActive(id) {
  stopMorse(); /* sempre para áudio ao trocar tab */
  activeId = id;
  storage.set(STORAGE_KEY, id);
  renderTabs();
  renderPanel();
}

function renderTabs() {
  if (!tabsEl) return;
  empty(tabsEl);

  TABS.forEach((t) => {
    tabsEl.appendChild(h('button', {
      className: cx('cripto-tab', activeId === t.id && 'is-active'),
      onclick: () => setActive(t.id)
    },
      h('span', { className: 'cripto-tab__icon' }, t.icon),
      h('span', null, t.label)
    ));
  });

  /* tabs futuras (locked) */
  FUTURE_TABS.forEach((t) => {
    tabsEl.appendChild(h('button', {
      className: 'cripto-tab cripto-tab--locked',
      title: `Disponível na Fase ${t.phase}`,
      disabled: true
    },
      h('span', { className: 'cripto-tab__icon' }, t.icon),
      h('span', null, t.label),
      h('span', { className: 'badge badge--magenta', style: { fontSize: '9px', marginLeft: '4px' } }, `F${t.phase}`)
    ));
  });
}

function renderPanel() {
  if (!panelEl) return;
  const tab = TABS.find((t) => t.id === activeId) || TABS[0];
  empty(panelEl);
  panelEl.appendChild(tab.build());
}

export function criptoPage() {
  activeId = loadActive();

  const fullPage = h('div', { className: 'page-cripto' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'LAB CRIPTOGRAFIA')
      ),
      h('h1', { className: 'page-header__title' }, '⚿ Lab de Criptografia'),
      h('p', { className: 'page-header__description' },
        'Cifras clássicas e modernas. ',
        h('span', { className: 'u-text-cyan' }, 'Fase 7 (P1)'),
        ': César, Base64/32/Hex, SHA family, Morse com áudio. ',
        h('span', { className: 'u-text-magenta' }, 'Fase 8 (P2)'),
        ': AES-GCM, Vigenère, Atbash, OTP.'
      )
    )
  );

  tabsEl = h('div', { className: 'cripto-tabs' });
  panelEl = h('div', { className: 'cripto-panel' });

  fullPage.appendChild(tabsEl);
  fullPage.appendChild(panelEl);

  renderTabs();
  renderPanel();

  return fullPage;
}
