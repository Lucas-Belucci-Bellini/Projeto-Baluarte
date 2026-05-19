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
import { getLang, langForExt } from '../data/editor-langs.js';
import * as vfs from '../utils/vfs.js';

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
      ),
      h(
        'button',
        {
          className: 'btn btn--ghost btn--sm',
          title: 'Abrir arquivo do filesystem virtual (compartilhado com o Terminal)',
          onclick: handleOpenVfs
        },
        '◫ Abrir VFS'
      ),
      h(
        'button',
        {
          className: 'btn btn--ghost btn--sm',
          title: 'Salvar a aba atual no filesystem virtual',
          onclick: handleSaveVfs
        },
        '⤓ Salvar VFS'
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
    ),
    buildFindPanel()
  );
}

/* Pares para auto-fechamento estilo VS Code. */
const EDITOR_PAIRS = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const EDITOR_CLOSERS = new Set([')', ']', '}']);

/**
 * Teclado do editor — recursos estilo VS Code:
 *  Tab/Shift+Tab (indenta bloco) · auto-fechamento de pares · pula o
 *  fechamento · backspace apaga par vazio · Enter com auto-indentação ·
 *  Ctrl+/ comenta · Alt+↑↓ move linha · Shift+Alt+↑↓ duplica linha.
 */
function handleEditorKeydown(e) {
  const ta = e.target;
  const val = ta.value;
  const start = ta.selectionStart;
  const end = ta.selectionEnd;

  /* Aplica novo conteúdo + seleção e atualiza o highlight. */
  const apply = (next, selStart, selEnd) => {
    ta.value = next;
    ta.selectionStart = selStart;
    ta.selectionEnd = selEnd == null ? selStart : selEnd;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  };

  /* Limites das linhas que a seleção toca. */
  const blockStart = val.lastIndexOf('\n', start - 1) + 1;
  let blockEnd = val.indexOf('\n', end);
  if (blockEnd === -1) blockEnd = val.length;

  /* ---- Tab / Shift+Tab ---- */
  if (e.key === 'Tab') {
    e.preventDefault();
    const multiLine = val.slice(start, end).includes('\n');
    if (e.shiftKey || multiLine) {
      const lines = val.slice(blockStart, blockEnd).split('\n');
      let firstDelta = 0;
      let totalDelta = 0;
      const out = lines.map((l, i) => {
        if (e.shiftKey) {
          const rem = (l.match(/^ {1,2}/) || [''])[0].length;
          if (i === 0) firstDelta = -rem;
          totalDelta -= rem;
          return l.slice(rem);
        }
        if (i === 0) firstDelta = 2;
        totalDelta += 2;
        return '  ' + l;
      });
      const block = out.join('\n');
      apply(
        val.slice(0, blockStart) + block + val.slice(blockEnd),
        Math.max(blockStart, start + firstDelta),
        end + totalDelta
      );
    } else {
      apply(val.slice(0, start) + '  ' + val.slice(end), start + 2);
    }
    return;
  }

  /* ---- Ctrl+/ — comenta / descomenta o bloco ---- */
  if ((e.ctrlKey || e.metaKey) && e.key === '/') {
    e.preventDefault();
    const lang = getLang(getActiveTab(state).lang);
    const token = lang && lang.lineComment;
    if (!token) return;
    const lines = val.slice(blockStart, blockEnd).split('\n');
    const real = lines.filter((l) => l.trim());
    const commented = real.length > 0 && real.every((l) => l.trimStart().startsWith(token));
    let out;
    if (commented) {
      out = lines.map((l) => {
        const i = l.indexOf(token);
        return i === -1 ? l : l.slice(0, i) + l.slice(i + token.length).replace(/^ /, '');
      });
    } else {
      const indent = Math.min(...real.map((l) => l.match(/^ */)[0].length));
      out = lines.map((l) =>
        l.trim() ? l.slice(0, indent) + token + ' ' + l.slice(indent) : l
      );
    }
    const block = out.join('\n');
    apply(val.slice(0, blockStart) + block + val.slice(blockEnd), blockStart, blockStart + block.length);
    return;
  }

  /* ---- Alt+↑↓ move linha · Shift+Alt+↑↓ duplica ---- */
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    e.preventDefault();
    const block = val.slice(blockStart, blockEnd);
    if (e.shiftKey) {
      const dup = val.slice(0, blockEnd) + '\n' + block + val.slice(blockEnd);
      if (e.key === 'ArrowDown') {
        const d = block.length + 1;
        apply(dup, start + d, end + d);
      } else {
        apply(dup, start, end);
      }
    } else if (e.key === 'ArrowUp') {
      if (blockStart === 0) return;
      const prevStart = val.lastIndexOf('\n', blockStart - 2) + 1;
      const prevLine = val.slice(prevStart, blockStart - 1);
      const d = blockStart - prevStart;
      apply(
        val.slice(0, prevStart) + block + '\n' + prevLine + val.slice(blockEnd),
        start - d, end - d
      );
    } else {
      if (blockEnd >= val.length) return;
      let nextEnd = val.indexOf('\n', blockEnd + 1);
      if (nextEnd === -1) nextEnd = val.length;
      const nextLine = val.slice(blockEnd + 1, nextEnd);
      const d = nextLine.length + 1;
      apply(
        val.slice(0, blockStart) + nextLine + '\n' + block + val.slice(nextEnd),
        start + d, end + d
      );
    }
    return;
  }

  /* ---- Enter — mantém indentação, abre bloco entre chaves ---- */
  if (e.key === 'Enter' && start === end) {
    const indent = (val.slice(blockStart, start).match(/^ */) || [''])[0];
    const before = val[start - 1];
    const after = val[start];
    if (before && '{[('.includes(before)) {
      e.preventDefault();
      const inner = indent + '  ';
      if (after && '}])'.includes(after)) {
        apply(val.slice(0, start) + '\n' + inner + '\n' + indent + val.slice(start), start + 1 + inner.length);
      } else {
        apply(val.slice(0, start) + '\n' + inner + val.slice(start), start + 1 + inner.length);
      }
      return;
    }
    if (indent) {
      e.preventDefault();
      apply(val.slice(0, start) + '\n' + indent + val.slice(start), start + 1 + indent.length);
      return;
    }
  }

  /* ---- Auto-fechamento de pares (e wrap da seleção) ---- */
  if (EDITOR_PAIRS[e.key]) {
    const open = e.key;
    const close = EDITOR_PAIRS[open];
    if (open === close && start === end && val[start] === open) {
      e.preventDefault();
      apply(val, start + 1);
      return;
    }
    e.preventDefault();
    if (start !== end) {
      apply(val.slice(0, start) + open + val.slice(start, end) + close + val.slice(end), start + 1, end + 1);
    } else {
      apply(val.slice(0, start) + open + close + val.slice(start), start + 1);
    }
    return;
  }

  /* ---- Pula sobre o fechamento já presente ---- */
  if (EDITOR_CLOSERS.has(e.key) && start === end && val[start] === e.key) {
    e.preventDefault();
    apply(val, start + 1);
    return;
  }

  /* ---- Backspace apaga par vazio () [] {} "" '' `` ---- */
  if (e.key === 'Backspace' && start === end && start > 0) {
    const b = val[start - 1];
    if (EDITOR_PAIRS[b] && EDITOR_PAIRS[b] === val[start]) {
      e.preventDefault();
      apply(val.slice(0, start - 1) + val.slice(start + 1), start - 1);
    }
  }
}

/* ============================================================
 *  Find & Replace — painel de busca/substituição
 * ============================================================ */

const findState = {
  open: false,
  mode: 'find',          /* 'find' | 'replace' */
  query: '',
  replace: '',
  caseSensitive: false,
  matches: [],           /* posições de início de cada ocorrência */
  current: -1
};

let findPanelEl = null;
let findInputEl = null;
let findReplaceInputEl = null;
let findReplaceRowEl = null;
let findCountEl = null;

/* Recalcula as ocorrências de findState.query no conteúdo do editor. */
function computeMatches() {
  const text = editorEl ? editorEl.value : '';
  const q = findState.query;
  findState.matches = [];
  if (q) {
    const hay = findState.caseSensitive ? text : text.toLowerCase();
    const needle = findState.caseSensitive ? q : q.toLowerCase();
    let i = hay.indexOf(needle);
    while (i !== -1) {
      findState.matches.push(i);
      i = hay.indexOf(needle, i + needle.length);
    }
  }
  if (!findState.matches.length) findState.current = -1;
  else if (findState.current < 0 || findState.current >= findState.matches.length) {
    findState.current = 0;
  }
  updateFindCount();
}

function updateFindCount() {
  if (!findCountEl) return;
  const n = findState.matches.length;
  if (!findState.query) findCountEl.textContent = '';
  else if (n === 0) findCountEl.textContent = 'nada';
  else findCountEl.textContent = `${findState.current + 1} / ${n}`;
}

/* Seleciona a ocorrência atual no textarea e rola até ela. */
function revealMatch() {
  if (findState.current < 0 || !editorEl) return;
  const pos = findState.matches[findState.current];
  editorEl.setSelectionRange(pos, pos + findState.query.length);
  const line = editorEl.value.slice(0, pos).split('\n').length - 1;
  const lh = parseFloat(getComputedStyle(editorEl).lineHeight) || 21;
  const target = line * lh;
  const view = editorEl.clientHeight;
  if (target < editorEl.scrollTop || target > editorEl.scrollTop + view - lh * 2) {
    editorEl.scrollTop = Math.max(0, target - view / 2);
  }
}

function stepMatch(dir) {
  if (!findState.matches.length) return;
  const n = findState.matches.length;
  findState.current = (findState.current + dir + n) % n;
  revealMatch();
  updateFindCount();
}

/* Aplica novo conteúdo ao textarea disparando o fluxo de input normal. */
function applyEditorValue(next) {
  editorEl.value = next;
  editorEl.dispatchEvent(new Event('input', { bubbles: true }));
}

function replaceCurrentMatch() {
  if (findState.current < 0 || !findState.matches.length) return;
  const pos = findState.matches[findState.current];
  const idx = findState.current;
  applyEditorValue(
    editorEl.value.slice(0, pos) +
    findState.replace +
    editorEl.value.slice(pos + findState.query.length)
  );
  computeMatches();
  if (findState.matches.length) {
    findState.current = idx % findState.matches.length;
    revealMatch();
    updateFindCount();
  }
}

function replaceAllMatches() {
  if (!findState.matches.length) return;
  const text = editorEl.value;
  const q = findState.query;
  let out;
  if (findState.caseSensitive) {
    out = text.split(q).join(findState.replace);
  } else {
    const hay = text.toLowerCase();
    const needle = q.toLowerCase();
    out = '';
    let i = 0;
    let idx;
    while ((idx = hay.indexOf(needle, i)) !== -1) {
      out += text.slice(i, idx) + findState.replace;
      i = idx + needle.length;
    }
    out += text.slice(i);
  }
  const count = findState.matches.length;
  applyEditorValue(out);
  computeMatches();
  toast(`${count} ocorrência(s) substituída(s)`, { type: 'success', duration: 1800 });
}

function openFind(mode) {
  findState.open = true;
  findState.mode = mode;
  if (!findPanelEl) return;
  findPanelEl.classList.add('is-open');
  findReplaceRowEl.style.display = mode === 'replace' ? '' : 'none';
  /* pré-preenche a busca com a seleção atual (se for de uma linha) */
  if (editorEl) {
    const sel = editorEl.value.slice(editorEl.selectionStart, editorEl.selectionEnd);
    if (sel && !sel.includes('\n')) findState.query = sel;
  }
  findInputEl.value = findState.query;
  findReplaceInputEl.value = findState.replace;
  computeMatches();
  revealMatch();
  findInputEl.focus();
  findInputEl.select();
}

function closeFind() {
  findState.open = false;
  if (findPanelEl) findPanelEl.classList.remove('is-open');
  if (editorEl) editorEl.focus();
}

function buildFindPanel() {
  findInputEl = h('input', {
    className: 'editor-find__input u-mono',
    type: 'text',
    spellcheck: 'false',
    placeholder: 'Localizar',
    oninput: () => {
      findState.query = findInputEl.value;
      computeMatches();
      revealMatch();
    },
    onkeydown: (e) => {
      if (e.key === 'Enter') { e.preventDefault(); stepMatch(e.shiftKey ? -1 : 1); }
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    }
  });

  findReplaceInputEl = h('input', {
    className: 'editor-find__input u-mono',
    type: 'text',
    spellcheck: 'false',
    placeholder: 'Substituir por',
    oninput: () => { findState.replace = findReplaceInputEl.value; },
    onkeydown: (e) => {
      if (e.key === 'Enter') { e.preventDefault(); replaceCurrentMatch(); }
      else if (e.key === 'Escape') { e.preventDefault(); closeFind(); }
    }
  });

  findCountEl = h('span', { className: 'editor-find__count u-mono' }, '');

  const caseBtn = h('button', {
    className: 'editor-find__toggle',
    title: 'Diferenciar maiúsculas de minúsculas',
    onclick: () => {
      findState.caseSensitive = !findState.caseSensitive;
      caseBtn.classList.toggle('is-on', findState.caseSensitive);
      computeMatches();
      revealMatch();
    }
  }, 'Aa');

  findReplaceRowEl = h('div', { className: 'editor-find__row' },
    findReplaceInputEl,
    h('button', { className: 'editor-find__btn editor-find__btn--text',
      title: 'Substituir a ocorrência atual (Enter)', onclick: replaceCurrentMatch }, 'Subst.'),
    h('button', { className: 'editor-find__btn editor-find__btn--text',
      title: 'Substituir todas', onclick: replaceAllMatches }, 'Tudo')
  );

  findPanelEl = h('div', { className: 'editor-find' },
    h('div', { className: 'editor-find__row' },
      findInputEl,
      caseBtn,
      findCountEl,
      h('button', { className: 'editor-find__btn',
        title: 'Anterior (Shift+Enter)', onclick: () => stepMatch(-1) }, '↑'),
      h('button', { className: 'editor-find__btn',
        title: 'Próximo (Enter)', onclick: () => stepMatch(1) }, '↓'),
      h('button', { className: 'editor-find__btn',
        title: 'Fechar (Esc)', onclick: closeFind }, '×')
    ),
    findReplaceRowEl
  );

  /* Restaura o painel se ele estava aberto antes de um render(). */
  if (findState.open) {
    findPanelEl.classList.add('is-open');
    findInputEl.value = findState.query;
    findReplaceInputEl.value = findState.replace;
    caseBtn.classList.toggle('is-on', findState.caseSensitive);
    findReplaceRowEl.style.display = findState.mode === 'replace' ? '' : 'none';
    computeMatches();
  } else {
    findReplaceRowEl.style.display = 'none';
  }

  return findPanelEl;
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

/* ============================================================
 *  Integração VFS (Editor ↔ Terminal — filesystem compartilhado)
 * ============================================================ */

function handleOpenVfs() {
  const path = prompt(
    'Caminho do arquivo no filesystem virtual:\n(ex: /home/lucas/README.md)',
    '/home/lucas/README.md'
  );
  if (!path) return;
  try {
    const content = vfs.readFile(path, '/');
    const name = vfs.basename(path);
    const ext = name.includes('.') ? name.split('.').pop() : '';
    const langDef = langForExt(ext);
    const tab = addTab(state, langDef ? langDef.id : 'javascript');
    tab.name = name;
    updateTabContent(state, tab.id, content);
    persist();
    render();
    toast(`Aberto: ${name}`, { type: 'success' });
  } catch (e) {
    toast('Erro: ' + e.message, { type: 'danger' });
  }
}

function handleSaveVfs() {
  const activeTab = getActiveTab(state);
  const suggested = '/home/lucas/' + activeTab.name;
  const path = prompt(
    'Salvar a aba atual em qual caminho do VFS?',
    suggested
  );
  if (!path) return;
  try {
    vfs.writeFile(path, activeTab.content, '/');
    toast(`Salvo no VFS: ${path}`, { type: 'success' });
  } catch (e) {
    toast('Erro: ' + e.message, { type: 'danger' });
  }
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
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      openFind('find');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      openFind('replace');
    } else if (e.key === 'Escape' && findState.open) {
      closeFind();
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

  /* Find & Replace começa fechado a cada visita à página. */
  findState.open = false;
  findState.matches = [];
  findState.current = -1;

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
      h('h1', { className: 'page-header__title' }, '⌨ Editor de Código · IDE'),
      h(
        'p',
        { className: 'page-header__description' },
        'Multi-tabs · 26 linguagens · runners JS/HTML/CSS/Markdown. ',
        h('span', { className: 'u-text-cyan' }, 'Edição estilo VS Code'),
        ': auto-fechamento de pares, auto-indentação, ',
        h('kbd', null, 'Ctrl+/'),
        ' comenta · ',
        h('kbd', null, 'Alt+↑↓'),
        ' move linha · ',
        h('kbd', null, 'Shift+Alt+↑↓'),
        ' duplica · ',
        h('kbd', null, 'Tab'),
        ' indenta o bloco. ',
        h('kbd', null, 'Ctrl+Enter'),
        ' run · ',
        h('kbd', null, 'Ctrl+S'),
        ' save · ',
        h('kbd', null, 'Ctrl+T'),
        ' nova tab · ',
        h('kbd', null, 'Ctrl+W'),
        ' fechar · ',
        h('kbd', null, 'Ctrl+F'),
        ' localizar · ',
        h('kbd', null, 'Ctrl+H'),
        ' substituir. VFS compartilhado com o Terminal.'
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
