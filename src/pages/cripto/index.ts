import '../../styles/cripto.css';
import { h, cx, empty } from '../../utils/helpers.js';
import { storage } from '../../core/storage.js';
import { setStatus } from '../../utils/baluarte-status';
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
type TabId = 'caesar' | 'atbash' | 'vigenere' | 'base' | 'hash' | 'aes' | 'otp' | 'morse';
type TabGroup = 'Clássicas' | 'Encoding' | 'Hash' | 'Moderna' | 'Comunicação';
interface CriptoTab { readonly id: TabId; readonly label: string; readonly icon: string; readonly build: () => HTMLDivElement; readonly group: TabGroup; }
const TABS: readonly CriptoTab[] = [
  { id: 'caesar', label: 'César', icon: 'C', build: caesarPanel, group: 'Clássicas' },
  { id: 'atbash', label: 'Atbash', icon: 'A', build: atbashPanel, group: 'Clássicas' },
  { id: 'vigenere', label: 'Vigenère', icon: 'V', build: vigenerePanel, group: 'Clássicas' },
  { id: 'base', label: 'Base/Hex', icon: '⬢', build: basePanel, group: 'Encoding' },
  { id: 'hash', label: 'SHA', icon: '#', build: hashPanel, group: 'Hash' },
  { id: 'aes', label: 'AES-GCM', icon: '⚿', build: aesPanel, group: 'Moderna' },
  { id: 'otp', label: 'OTP', icon: '⊕', build: otpPanel, group: 'Moderna' },
  { id: 'morse', label: 'Morse', icon: '· ─', build: morsePanel, group: 'Comunicação' },
];
let activeId: TabId = 'caesar';
let panelEl: HTMLDivElement | null = null;
let tabsEl: HTMLDivElement | null = null;
function isTabId(value: unknown): value is TabId { return typeof value === 'string' && TABS.some((tab) => tab.id === value); }
function loadActive(): TabId { const stored = storage.get(STORAGE_KEY); return isTabId(stored) ? stored : 'caesar'; }
function setActive(id: TabId): void { stopMorse(); activeId = id; setStatus('cripto', { cifra: id }); storage.set(STORAGE_KEY, id); renderTabs(); renderPanel(); }
function renderTabs(): void { if (!tabsEl) return; empty(tabsEl); TABS.forEach((tab) => tabsEl?.appendChild(h('button', { className: cx('cripto-tab', activeId === tab.id && 'is-active'), onclick: (): void => setActive(tab.id), title: tab.group }, h('span', { className: 'cripto-tab__icon' }, tab.icon), h('span', null, tab.label)))); }
function renderPanel(): void { if (!panelEl) return; const tab = TABS.find((candidate) => candidate.id === activeId) ?? TABS[0]; if (!tab) return; empty(panelEl); panelEl.appendChild(tab.build()); }
export function criptoPage(): HTMLDivElement {
  activeId = loadActive();
  const fullPage = h('div', { className: 'page-cripto' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'LAB CRIPTOGRAFIA')), h('h1', { className: 'page-header__title' }, '⚿ Lab de Criptografia'), h('p', { className: 'page-header__description' }, '8 cifras e ferramentas: ', h('span', { className: 'u-text-cyan' }, 'César · Atbash · Vigenère'), ' (clássicas), ', h('span', { className: 'u-text-cyan' }, 'Base64/32/Hex'), ' (encoding), ', h('span', { className: 'u-text-cyan' }, 'SHA family'), ' (hash), ', h('span', { className: 'u-text-cyan' }, 'AES-GCM · OTP'), ' (moderna), ', h('span', { className: 'u-text-cyan' }, 'Morse'), ' (comunicação com áudio).')));
  tabsEl = h('div', { className: 'cripto-tabs' }); panelEl = h('div', { className: 'cripto-panel' }); fullPage.append(tabsEl, panelEl); renderTabs(); renderPanel(); return fullPage;
}
