/**
 * Página /academia — Trilhas de linguagens + recursos de aprendizado (v2.0.0).
 *
 * Cada linguagem: cards de módulos com código + botão "abrir no Editor".
 * Seção final: links externos para tirar dúvidas, cursos grátis e prática.
 */

import { h, cx, empty, randHex } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  LANGS_ACADEMY, TOTAL_LANGS, findLang, LEARNING_RESOURCES,
  TECH_INTRO, TECH_CARREIRAS
} from '../data/academia.js';
import { getLang as getEditorLang } from '../data/editor-langs.js';

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
              /* Usa storage helper + extensão real da linguagem (do editor-langs) */
              const editorLang = getEditorLang(lang.id);
              const ext = editorLang?.ext || 'txt';
              const editorState = storage.get('editor:state') || { tabs: [], activeId: null };
              if (!Array.isArray(editorState.tabs)) editorState.tabs = [];
              const newTab = {
                id: 'tab_' + randHex(4),
                name: `${lang.id}-${i + 1}.${ext}`,
                lang: lang.id,
                content: m.code
              };
              editorState.tabs.push(newTab);
              editorState.activeId = newTab.id;
              storage.set('editor:state', editorState);
              toast(`Aberto: ${newTab.name}`, { type: 'success' });
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

  fullPage.appendChild(renderCarreiras());
  fullPage.appendChild(renderResources());

  return fullPage;
}

/* ===== Carreiras: programar não é só código ===== */
function renderCarreiras() {
  const wrap = h('div', { className: 'academia-resources' });

  wrap.appendChild(
    h('div', { className: 'section-header', style: { marginTop: '24px' } },
      h('h2', { className: 'section-header__title' }, '◆ Programar Não É Só Código'))
  );
  wrap.appendChild(
    h('p', { className: 'academia-resources__intro u-text-muted' }, TECH_INTRO)
  );

  const grid = h('div', { className: 'academia-resource-grid' });
  TECH_CARREIRAS.forEach((c) => {
    grid.appendChild(
      h('div', { className: 'academia-carreira' },
        h('div', { className: 'academia-carreira__head' },
          h('span', { className: 'academia-carreira__nome' }, c.nome),
          h('span', { className: 'academia-carreira__tag' }, c.codigo)),
        h('div', { className: 'academia-carreira__desc' }, c.desc)
      )
    );
  });
  wrap.appendChild(grid);
  return wrap;
}

/* ===== Recursos externos: onde tirar dúvidas e estudar ===== */
function renderResources() {
  const wrap = h('div', { className: 'academia-resources' });

  wrap.appendChild(
    h('div', { className: 'section-header', style: { marginTop: '24px' } },
      h('h2', { className: 'section-header__title' }, '◆ Onde Tirar Dúvidas e Estudar'))
  );
  wrap.appendChild(
    h('p', { className: 'academia-resources__intro u-text-muted' },
      'Travou num código? Quer aprender de graça? Estes são os melhores lugares ',
      'da internet para pedir ajuda, fazer cursos e treinar. Abrem em nova aba.')
  );

  LEARNING_RESOURCES.forEach((cat) => {
    const grid = h('div', { className: 'academia-resource-grid' });
    cat.links.forEach((link) => {
      grid.appendChild(
        h('a', {
          className: 'academia-resource',
          href: link.url,
          target: '_blank',
          rel: 'noopener noreferrer'
        },
          h('div', { className: 'academia-resource__head' },
            h('span', { className: 'academia-resource__name' }, link.name),
            h('span', { className: 'academia-resource__arrow' }, '↗')),
          h('div', { className: 'academia-resource__desc' }, link.desc)
        )
      );
    });
    wrap.appendChild(
      h('div', { className: 'academia-resource-cat' },
        h('div', { className: 'academia-resource-cat__title' }, cat.group),
        h('div', { className: 'academia-resource-cat__note u-text-muted' }, cat.note),
        grid
      )
    );
  });

  return wrap;
}
