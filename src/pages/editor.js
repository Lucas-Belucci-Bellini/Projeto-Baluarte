/**
 * Página /editor — Editor de Código (Fase 2).
 *
 * Layout (desktop):
 *   ┌─ tabs bar ─────────────────────────────────────────┐
 *   │ [tab1][tab2][+]  ← lang select  [run] [save]        │
 *   ├──── editor (textarea + highlight overlay) ─────────┤
 *   │                                                     │
 *   │                                                     │
 *   ├──── preview / output ───────────────────────────────┤
 *   │  iframe sandbox ou markdown render ou logs          │
 *   └─────────────────────────────────────────────────────┘
 */

import { h, cx, debounce, mount, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { highlight } from '../utils/syntax-highlight.js';
import {
  LANGS,
  loadState,
  saveState,
  addTab,
  closeTab,
  getActiveTab,
  updateTabContent,
  changeTabLang,
  runTab,
  renameTab
} from '../utils/editor-engine.js';
import { getLang } from '../data/editor-langs.js';

let state = null;
let editorEl = null;
let highlightEl = null;
let lineNumbersEl = null;
let previewEl = null;
let tabsBarEl = null;
let toolbarLangEl = null;
let kbHandler = null;

const persist = debounce(() => saveState(state), 400);

/* ============================================================
 *  Render: Tabs
 * ============================================================ */

function renderTabsBar() {
  const tabsList = h('div', { className: 'editor-tabs__list' });

  state.tabs.forEach((tab) => {
    const isActive = tab.id === state.activeId;
    const tabEl = h(
      'div',
      {
        className: cx('editor-tab', isActive && 'is-active'),
        title: 'Click para abrir · duplo click para renomear',
        onclick: () => {
          state.activeId = tab.id;
          persist();
          render();
        },
        ondblclick: () => {
          const newName = prompt('Renomear arquivo:', tab.name);
          if (newName && newName.trim()) {
            renameTab(state, tab.id, newName);
            persist();
            render();
          }
        }
      },
      h('span', { className: 'editor-tab__icon' }, getLang(tab.lang).icon),
      h('span', { className: 'editor-tab__name' }, tab.name),
      h(
        'button',
        {
          className: 'editor-tab__close',
          'aria-label': `Fechar ${tab.name}`,
          title: 'Fechar (Ctrl+W)',
          onclick: (e) => {
            e.stopPropagation();
            closeTab(state, tab.id);
            persist();
            render();
          }
        },
        '×'
      )
    );
    tabsList.appendChild(tabEl);
  });

  /* Botão "+" nova tab */
  const addBtn = h(
    'button',
    {
      className: 'editor-tab editor-tab--add',
      title: 'Nova aba (Ctrl+T)',
      onclick: () => {
        addTab(state, 'javascript');
        persist();
        render();
      }
    },
    '+'
  );
  tabsList.appendChild(addBtn);

  return tabsList;
}

/* ============================================================
 *  Render: Toolbar (lang switcher + run + save + meta)
 * ============================================================ */

function renderToolbar() {
  const activeTab = getActiveTab(state);

  toolbarLangEl = h(
    'select',
    {
      className: 'editor-toolbar__lang input',
      title: 'Linguagem',
      onchange: (e) => {
        changeTabLang(state, activeTab.id, e.target.value);
        persist();
        render();
      }
    },
    ...LANGS.map((l) =>
      h(
        'option',
        { value: l.id, selected: l.id === activeTab.lang },
        `${l.icon}  ${l.name}`
      )
    )
  );

  const lang = getLang(activeTab.lang);
  const canRun = !!lang.runner;

  return h(
    'div',
    { className: 'editor-toolbar' },
    h('div', { className: 'editor-toolbar__group' }, toolbarLangEl),
    h(
      'div',
      { className: 'editor-toolbar__group' },
      h(
        'button',
        {
          className: 'btn btn--primary btn--sm',
          disabled: !canRun,
          title: canRun
            ? `Executar ${lang.name} (Ctrl+Enter)`
            : `${lang.name} sem runner nesta fase`,
          onclick: handleRun
        },
        '▶ Run'
      ),
      h(
        'button',
        {
          className: 'btn btn--sm',
          title: 'Salvar (Ctrl+S)',
          onclick: handleSave
        },
        '💾 Save'
      ),
      h(
        'button',
        {
          className: 'btn btn--ghost btn--sm',
          title: 'Limpar conteúdo da tab atual',
          onclick: () => {
            if (confirm('Limpar todo conteúdo desta aba?')) {
              updateTabContent(state, activeTab.id, '');
              persist();
              render();
            }
          }
        },
        '✕ Clear'
      )
    ),
    h(
      'div',
      { className: 'editor-toolbar__meta' },
      h('span', { className: 'badge badge--cyan' }, lang.name),
      h('span', { className: 'u-text-muted u-mono' }, `${activeTab.content.length} chars`)
    )
  );
}

/* ============================================================
 *  Render: Editor area (textarea + highlight overlay + line nums)
 * ============================================================ */

function renderEditorArea() {
  const activeTab = getActiveTab(state);
  const lang = getLang(activeTab.lang);

  lineNumbersEl = h('div', { className: 'editor-lines' });
  highlightEl = h('pre', { className: 'editor-highlight' }, h('code', null, ''));
  editorEl = h('textarea', {
    className: 'editor-textarea',
    spellcheck: 'false',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    value: activeTab.content,
    placeholder: '// comece a digitar…',
    oninput: (e) => {
      updateTabContent(state, activeTab.id, e.target.value);
      updateHighlight();
      updateLineNumbers();
      persist();
      /* atualiza char count na toolbar sem rebuildar */
      const meta = document.querySelector('.editor-toolbar__meta .u-mono');
      if (meta) meta.textContent = `${e.target.value.length} chars`;
    },
    onkeydown: handleEditorKeydown,
    onscroll: syncScroll
  });

  /* Sync scroll do highlight com textarea */
  function syncScroll() {
    if (!highlightEl || !editorEl) return;
    highlightEl.scrollTop = editorEl.scrollTop;
    highlightEl.scrollLeft = editorEl.scrollLeft;
    if (lineNumbersEl) lineNumbersEl.scrollTop = editorEl.scrollTop;
  }

  function updateHighlight() {
    if (!highlightEl) return;
    const code = highlightEl.querySelector('code');
    if (code) code.innerHTML = highlight(editorEl.value, lang) + '\n';
  }

  function updateLineNumbers() {
    if (!lineNumbersEl) return;
    const lines = editorEl.value.split('\n').length;
    let html = '';
    for (let i = 1; i <= Math.max(lines, 1); i++) html += i + '\n';
    lineNumbersEl.textContent = html;
  }

  /* Inicial */
  setTimeout(() => {
    updateHighlight();
    updateLineNumbers();
  }, 0);

  return h(
    'div',
    { className: 'editor-area' },
    lineNumbersEl,
    h(
      'div',
      { className: 'editor-area__main' },
      highlightEl,
      editorEl
    )
  );
}

function handleEditorKeydown(e) {
  /* Tab inserts dois espaços; Shift+Tab outdenta */
  if (e.key === 'Tab') {
    e.preventDefault();
    const ta = e.target;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const val = ta.value;

    if (e.shiftKey) {
      /* outdent: remove até 2 espaços antes do cursor */
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const before = val.slice(0, lineStart);
      const line = val.slice(lineStart, start);
      const trimmed = line.replace(/^ {1,2}/, '');
      const removed = line.length - trimmed.length;
      ta.value = before + trimmed + val.slice(start);
      ta.selectionStart = ta.selectionEnd = start - removed;
    } else {
      ta.value = val.slice(0, start) + '  ' + val.slice(end);
      ta.selectionStart = ta.selectionEnd = start + 2;
    }
    /* dispara input pra atualizar highlight */
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/* ============================================================
 *  Render: Preview / Output
 * ============================================================ */

function renderPreview() {
  previewEl = h('div', { className: 'editor-preview' });

  const placeholder = h(
    'div',
    { className: 'editor-preview__empty' },
    h('div', { style: { fontSize: '32px', opacity: 0.5 } }, '▶'),
    h('div', null, 'Pressione Run ou Ctrl+Enter para executar.'),
    h(
      'div',
      { className: 'u-text-muted u-mono', style: { fontSize: '12px', marginTop: '8px' } },
      'Suporte: JavaScript · HTML · CSS · Markdown'
    )
  );
  previewEl.appendChild(placeholder);

  return previewEl;
}

/* ============================================================
 *  Handlers globais
 * ============================================================ */

function handleRun() {
  const tab = getActiveTab(state);
  const result = runTab(tab);

  if (!previewEl) return;
  empty(previewEl);

  if (result.type === 'iframe') {
    const iframe = h('iframe', {
      className: 'editor-preview__iframe',
      sandbox: 'allow-scripts',
      srcdoc: result.payload,
      title: 'Preview'
    });
    previewEl.appendChild(iframe);
    toast(`▶ Executando ${getLang(tab.lang).name}…`, { type: 'success', duration: 1400 });
    return;
  }
  if (result.type === 'html') {
    const wrap = h('div', { className: 'editor-preview__html', html: result.payload });
    previewEl.appendChild(wrap);
    toast('▶ Markdown renderizado', { type: 'success', duration: 1400 });
    return;
  }
  /* logs */
  previewEl.appendChild(
    h('div', { className: 'editor-preview__logs' }, result.payload)
  );
  toast(result.payload, { type: 'warning', duration: 3200 });
}

function handleSave() {
  saveState(state);
  toast('Salvo localmente', { type: 'success', duration: 1400 });
}

function attachKeyboard() {
  kbHandler = (e) => {
    /* Só dentro da página /editor */
    const onPage = location.hash.startsWith('#/editor');
    if (!onPage) return;

    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleSave();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 't') {
      e.preventDefault();
      addTab(state, 'javascript');
      persist();
      render();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'w') {
      e.preventDefault();
      const active = getActiveTab(state);
      closeTab(state, active.id);
      persist();
      render();
    }
  };
  window.addEventListener('keydown', kbHandler);
}

/* ============================================================
 *  Render principal
 * ============================================================ */

let pageRoot = null;

function render() {
  if (!pageRoot) return;
  empty(pageRoot);

  tabsBarEl = h('div', { className: 'editor-tabs' }, renderTabsBar());
  pageRoot.appendChild(tabsBarEl);
  pageRoot.appendChild(renderToolbar());
  pageRoot.appendChild(renderEditorArea());
  pageRoot.appendChild(renderPreview());
}

export function editorPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-editor' });

  /* Header da página */
  fullPage.appendChild(
    h(
      'div',
      { className: 'page-header anim-fade-in', style: { marginBottom: '16px' } },
      h(
        'div',
        { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'EDITOR DE CÓDIGO')
      ),
      h('h1', { className: 'page-header__title' }, '⌨ Editor de Código'),
      h(
        'p',
        { className: 'page-header__description' },
        'Multi-tabs com syntax highlight para 26 linguagens. ',
        'Runners para ',
        h('span', { className: 'u-text-cyan' }, 'JavaScript'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'HTML/CSS'),
        ' e ',
        h('span', { className: 'u-text-cyan' }, 'Markdown'),
        '. Atalhos: ',
        h('kbd', null, 'Ctrl+Enter'),
        ' (run), ',
        h('kbd', null, 'Ctrl+S'),
        ' (save), ',
        h('kbd', null, 'Ctrl+T'),
        ' (nova tab), ',
        h('kbd', null, 'Ctrl+W'),
        ' (fechar).'
      )
    )
  );

  /* Wrap interno onde tabs/toolbar/editor/preview são renderizados.
     pageRoot aponta para esse wrap — render() reconstrói só o interior. */
  const editorWrap = h('div', { className: 'editor-wrap' });
  fullPage.appendChild(editorWrap);
  pageRoot = editorWrap;

  render();

  /* Atalhos globais */
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  attachKeyboard();

  return fullPage;
}
