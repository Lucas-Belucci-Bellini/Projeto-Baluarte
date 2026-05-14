/**
 * Página /academia — Trilhas de 10 linguagens (Fase 14).
 *
 * Cada linguagem: cards de módulos com código + botão "abrir no Editor".
 */

import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { LANGS_ACADEMY, TOTAL_LANGS, findLang } from '../data/academia.js';

const STORAGE_KEY = 'academia:state';

let state = null;
let panelEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { selectedLang: 'javascript' };
}
function persist() { storage.set(STORAGE_KEY, state); }

function renderLangCards() {
  const wrap = h('div', { className: 'academia-langs' });
  LANGS_ACADEMY.forEach((l) => {
    wrap.appendChild(
      h('button', {
        className: cx('academia-lang', state.selectedLang === l.id && 'is-active'),
        'data-l': l.id,
        style: `--lang-color: ${l.color};`,
        onclick: () => {
          state.selectedLang = l.id;
          persist();
          document.querySelectorAll('.academia-lang').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.l === l.id)
          );
          renderPanel();
        }
      },
        h('span', { className: 'academia-lang__icon', style: `color: ${l.color}` }, l.icon),
        h('span', { className: 'academia-lang__name' }, l.name),
        h('span', { className: 'academia-lang__year' }, l.year)
      )
    );
  });
  return wrap;
}

function renderPanel() {
  if (!panelEl) return;
  empty(panelEl);

  const lang = findLang(state.selectedLang);
  if (!lang) return;

  /* Header */
  panelEl.appendChild(
    h('div', { className: 'academia-header', style: `--lang-color: ${lang.color};` },
      h('div', { className: 'academia-header__icon', style: `color: ${lang.color}; border-color: ${lang.color}` }, lang.icon),
      h('div', null,
        h('h2', { className: 'academia-header__name' }, lang.name),
        h('div', { className: 'academia-header__meta' },
          h('span', { className: 'u-text-muted' }, lang.paradigm),
          h('span', { className: 'u-text-muted' }, ' · '),
          h('span', { className: 'u-text-muted' }, `${lang.year} · ${lang.creator}`)
        )
      )
    )
  );

  panelEl.appendChild(
    h('div', { className: 'academia-section' },
      h('div', { className: 'academia-section__title' }, '◆ Sobre'),
      h('p', null, lang.summary)
    )
  );

  panelEl.appendChild(
    h('div', { className: 'academia-section' },
      h('div', { className: 'academia-section__title' }, '? Por que aprender'),
      h('p', null, lang.why)
    )
  );

  /* Módulos */
  panelEl.appendChild(
    h('div', { className: 'academia-section' },
      h('div', { className: 'academia-section__title' },
        `◫ Módulos (${lang.modules.length})`
      )
    )
  );

  const modulesWrap = h('div', { className: 'academia-modules' });
  lang.modules.forEach((m, i) => {
    modulesWrap.appendChild(
      h('div', { className: 'academia-module' },
        h('div', { className: 'academia-module__head' },
          h('span', { className: 'academia-module__num' }, String(i + 1).padStart(2, '0')),
          h('span', { className: 'academia-module__title' }, m.title)
        ),
        h('pre', { className: 'academia-module__code' },
          h('code', null, m.code)
        ),
        h('div', { className: 'academia-module__actions' },
          h('button', {
            className: 'btn btn--ghost btn--sm',
            onclick: () => {
              navigator.clipboard.writeText(m.code);
              toast('Código copiado', { type: 'success' });
            }
          }, '⎘ copiar'),
          h('button', {
            className: 'btn btn--primary btn--sm',
            onclick: () => {
              /* Salva o código no editor e navega */
              const editorState = JSON.parse(localStorage.getItem('baluarte:editor:state') || '{}');
              if (!editorState.tabs) editorState.tabs = [];
              const newTab = {
                id: 'tab_' + Math.random().toString(36).slice(2, 8),
                name: `${lang.id}-${i + 1}.${lang.id === 'cpp' ? 'cpp' : lang.id === 'csharp' ? 'cs' : lang.id}`,
                lang: lang.id,
                content: m.code
              };
              editorState.tabs.push(newTab);
              editorState.activeId = newTab.id;
              localStorage.setItem('baluarte:editor:state', JSON.stringify(editorState));
              toast('Aberto no Editor', { type: 'success' });
              router.navigate('/editor');
            }
          }, '⌨ abrir no Editor')
        )
      )
    );
  });
  panelEl.appendChild(modulesWrap);
}

export function academiaPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-academia' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ACADEMIA')),
      h('h1', { className: 'page-header__title' }, '◬ Academia'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${TOTAL_LANGS} linguagens`),
        ' com tutoriais offline. Cada módulo abre direto no ',
        h('span', { className: 'u-text-cyan' }, 'Editor de Código'), '.'
      )
    )
  );

  fullPage.appendChild(renderLangCards());

  panelEl = h('div', { className: 'academia-panel' });
  fullPage.appendChild(panelEl);

  renderPanel();

  return fullPage;
}
