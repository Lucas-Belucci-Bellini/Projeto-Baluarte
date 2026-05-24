/**
 * Hub /cripto — Lab de Criptografia (Fase 7 P1 + Fase 8 P2).
 *
 * Fase 7 (P1): César, Base64/32/Hex, SHA, Morse
 * Fase 8 (P2): AES-GCM, Vigenère, Atbash, OTP
 */

import { h, cx, empty } from '../../utils/helpers.js';
import { storage } from '../../core/storage.js';
import { setStatus } from '../../utils/baluarte-status.js';
import { caesarPanel } from './caesar.js';
import { basePanel } from './base.js';
import { hashPanel } from './hash.js';
import { morsePanel } from './morse.js';
import { aesPanel } from './aes.js';
import { vigenerePanel } from './vigenere.js';
import { atbashPanel } from './atbash.js';
import { otpPanel } from './otp.js';
import { stopMorse } from '../../utils/cripto-engine.js';

const STORAGE_KEY = 'cripto:active';

const TABS = [
  /* P1 */
  { id: 'caesar', label: 'César', icon: 'C', build: caesarPanel, group: 'Clássicas' },
  { id: 'atbash', label: 'Atbash', icon: 'A', build: atbashPanel, group: 'Clássicas' },
  { id: 'vigenere', label: 'Vigenère', icon: 'V', build: vigenerePanel, group: 'Clássicas' },
  /* Encoding */
  { id: 'base', label: 'Base/Hex', icon: '⬢', build: basePanel, group: 'Encoding' },
  /* Hash */
  { id: 'hash', label: 'SHA', icon: '#', build: hashPanel, group: 'Hash' },
  /* Moderna */
  { id: 'aes', label: 'AES-GCM', icon: '⚿', build: aesPanel, group: 'Moderna' },
  { id: 'otp', label: 'OTP', icon: '⊕', build: otpPanel, group: 'Moderna' },
  /* Comunicação */
  { id: 'morse', label: 'Morse', icon: '· ─', build: morsePanel, group: 'Comunicação' }
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
  setStatus('cripto', { cifra: id });
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
      onclick: () => setActive(t.id),
      title: t.group
    },
      h('span', { className: 'cripto-tab__icon' }, t.icon),
      h('span', null, t.label)
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
        '8 cifras e ferramentas: ',
        h('span', { className: 'u-text-cyan' }, 'César · Atbash · Vigenère'),
        ' (clássicas), ',
        h('span', { className: 'u-text-cyan' }, 'Base64/32/Hex'),
        ' (encoding), ',
        h('span', { className: 'u-text-cyan' }, 'SHA family'),
        ' (hash), ',
        h('span', { className: 'u-text-cyan' }, 'AES-GCM · OTP'),
        ' (moderna), ',
        h('span', { className: 'u-text-cyan' }, 'Morse'),
        ' (comunicação com áudio).'
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

