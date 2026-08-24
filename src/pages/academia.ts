import '../styles/academia.css';
import { h, cx, empty, randHex } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast';
import { LANGS_ACADEMY, TOTAL_LANGS, findLang, LEARNING_RESOURCES, TECH_INTRO, TECH_CARREIRAS } from '../data/academia.js';
import type { AcademyLanguage, AcademyModule, LearningResourceCategory, CareerCard } from '../data/academia.js';
import { getLang as getEditorLang } from '../data/editor-langs.js';

const STORAGE_KEY = 'academia:state';

interface AcademyState { selectedLang: string; }
interface EditorTab { id: string; name: string; lang: string; content: string; }
interface EditorState { tabs: EditorTab[]; activeId: string | null; }

let state: AcademyState = { selectedLang: 'javascript' };
let panelEl: HTMLDivElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function loadState(): AcademyState {
  const saved: unknown = storage.get(STORAGE_KEY);
  return isRecord(saved) && typeof saved.selectedLang === 'string'
    ? { selectedLang: saved.selectedLang }
    : { selectedLang: 'javascript' };
}

function persist(): void { storage.set(STORAGE_KEY, state); }

function isEditorState(value: unknown): value is EditorState {
  if (!isRecord(value) || !Array.isArray(value.tabs)) return false;
  return value.tabs.every((tab) => isRecord(tab) && typeof tab.id === 'string' && typeof tab.name === 'string' && typeof tab.lang === 'string' && typeof tab.content === 'string');
}

function openModuleInEditor(language: AcademyLanguage, module: AcademyModule, index: number): void {
  const editorLanguage = getEditorLang(language.id);
  const ext = editorLanguage?.ext ?? 'txt';
  const saved: unknown = storage.get('editor:state');
  const editorState: EditorState = isEditorState(saved) ? saved : { tabs: [], activeId: null };
  const tab: EditorTab = { id: `tab_${randHex(4)}`, name: `${language.id}-${index + 1}.${ext}`, lang: language.id, content: module.code };
  editorState.tabs.push(tab);
  editorState.activeId = tab.id;
  storage.set('editor:state', editorState);
  toast(`Aberto: ${tab.name}`, { type: 'success' });
  router.navigate('/editor');
}

function renderLangCards(): HTMLDivElement {
  const wrap = h('div', { className: 'academia-langs' });
  LANGS_ACADEMY.forEach((language) => {
    wrap.appendChild(h('button', {
      className: cx('academia-lang', state.selectedLang === language.id && 'is-active'),
      'data-l': language.id,
      style: `--lang-color: ${language.color};`,
      onclick: (): void => {
        state.selectedLang = language.id;
        persist();
        document.querySelectorAll<HTMLElement>('.academia-lang').forEach((button) => button.classList.toggle('is-active', button.dataset.l === language.id));
        renderPanel();
      },
    },
      h('span', { className: 'academia-lang__icon', style: `color: ${language.color}` }, language.icon),
      h('span', { className: 'academia-lang__name' }, language.name),
      h('span', { className: 'academia-lang__year' }, language.year)));
  });
  return wrap;
}

function renderPanel(): void {
  if (!panelEl) return;
  empty(panelEl);
  const language = findLang(state.selectedLang);
  if (!language) return;
  panelEl.appendChild(h('div', { className: 'academia-header', style: `--lang-color: ${language.color};` },
    h('div', { className: 'academia-header__icon', style: `color: ${language.color}; border-color: ${language.color}` }, language.icon),
    h('div', null,
      h('h2', { className: 'academia-header__name' }, language.name),
      h('div', { className: 'academia-header__meta' },
        h('span', { className: 'u-text-muted' }, language.paradigm),
        h('span', { className: 'u-text-muted' }, ' · '),
        h('span', { className: 'u-text-muted' }, `${language.year} · ${language.creator}`)))));
  panelEl.appendChild(h('div', { className: 'academia-section' }, h('div', { className: 'academia-section__title' }, '◆ Sobre'), h('p', null, language.summary)));
  panelEl.appendChild(h('div', { className: 'academia-section' }, h('div', { className: 'academia-section__title' }, '? Por que aprender'), h('p', null, language.why)));
  panelEl.appendChild(h('div', { className: 'academia-section' }, h('div', { className: 'academia-section__title' }, `◫ Módulos (${language.modules.length})`)));
  const modulesWrap = h('div', { className: 'academia-modules' });
  language.modules.forEach((module, index) => {
    modulesWrap.appendChild(h('div', { className: 'academia-module' },
      h('div', { className: 'academia-module__head' }, h('span', { className: 'academia-module__num' }, String(index + 1).padStart(2, '0')), h('span', { className: 'academia-module__title' }, module.title)),
      h('pre', { className: 'academia-module__code' }, h('code', null, module.code)),
      h('div', { className: 'academia-module__actions' },
        h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => { void navigator.clipboard.writeText(module.code).then(() => toast('Código copiado', { type: 'success' })); } }, '⎘ copiar'),
        h('button', { className: 'btn btn--primary btn--sm', onclick: (): void => openModuleInEditor(language, module, index) }, '⌨ abrir no Editor'))));
  });
  panelEl.appendChild(modulesWrap);
}

function renderCarreiras(): HTMLDivElement {
  const wrap = h('div', { className: 'academia-resources' });
  wrap.append(h('div', { className: 'section-header', style: { marginTop: '24px' } }, h('h2', { className: 'section-header__title' }, '◆ Programar Não É Só Código')), h('p', { className: 'academia-resources__intro u-text-muted' }, TECH_INTRO));
  const grid = h('div', { className: 'academia-resource-grid' });
  TECH_CARREIRAS.forEach((career: CareerCard) => grid.appendChild(h('div', { className: 'academia-carreira' }, h('div', { className: 'academia-carreira__head' }, h('span', { className: 'academia-carreira__nome' }, career.nome), h('span', { className: 'academia-carreira__tag' }, career.codigo)), h('div', { className: 'academia-carreira__desc' }, career.desc))));
  wrap.appendChild(grid);
  return wrap;
}

function renderResources(): HTMLDivElement {
  const wrap = h('div', { className: 'academia-resources' });
  wrap.append(h('div', { className: 'section-header', style: { marginTop: '24px' } }, h('h2', { className: 'section-header__title' }, '◆ Onde Tirar Dúvidas e Estudar')), h('p', { className: 'academia-resources__intro u-text-muted' }, 'Travou num código? Quer aprender de graça? Estes são os melhores lugares da internet para pedir ajuda, fazer cursos e treinar. Abrem em nova aba.'));
  LEARNING_RESOURCES.forEach((category: LearningResourceCategory) => {
    const grid = h('div', { className: 'academia-resource-grid' });
    category.links.forEach((link) => grid.appendChild(h('a', { className: 'academia-resource', href: link.url, target: '_blank', rel: 'noopener noreferrer' }, h('div', { className: 'academia-resource__head' }, h('span', { className: 'academia-resource__name' }, link.name), h('span', { className: 'academia-resource__arrow' }, '↗')), h('div', { className: 'academia-resource__desc' }, link.desc))));
    wrap.appendChild(h('div', { className: 'academia-resource-cat' }, h('div', { className: 'academia-resource-cat__title' }, category.group), h('div', { className: 'academia-resource-cat__note u-text-muted' }, category.note), grid));
  });
  return wrap;
}

export function academiaPage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-academia' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ACADEMIA')), h('h1', { className: 'page-header__title' }, '◬ Academia'), h('p', { className: 'page-header__description' }, h('span', { className: 'u-text-cyan' }, `${TOTAL_LANGS} linguagens`), ' com tutoriais offline. Cada módulo abre direto no ', h('span', { className: 'u-text-cyan' }, 'Editor de Código'), '.')));
  fullPage.appendChild(renderLangCards());
  panelEl = h('div', { className: 'academia-panel' });
  fullPage.appendChild(panelEl);
  renderPanel();
  fullPage.append(renderCarreiras(), renderResources());
  return fullPage;
}
