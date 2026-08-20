/**
 * Página /editor — Editor de Código (IDE).
 *
 * Mantém a experiência V1 de múltiplas tabs, syntax highlight, autocomplete,
 * runners, find/replace, atalhos de teclado e integração com o VFS.
 */

import '../styles/editor.css';
import { h, cx, debounce, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { toast } from '../utils/toast.js';
import { highlight } from '../utils/syntax-highlight.js';
import { createAutocomplete } from '../utils/editor-autocomplete.js';
import type { AutocompleteController } from '../utils/editor-autocomplete.js';
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
  renameTab,
} from '../utils/editor-engine.js';
import type { EditorRunResult, EditorState, EditorTab } from '../utils/editor-engine.js';
import { getLang, langForExt } from '../data/editor-langs.js';
import * as vfs from '../utils/vfs.js';
import { setStatus } from '../utils/baluarte-status';

type FindMode = 'find' | 'replace';

interface FindState {
  open: boolean;
  mode: FindMode;
  query: string;
  replace: string;
  caseSensitive: boolean;
  matches: number[];
  current: number;
}

const EDITOR_PAIRS: Record<string, string> = {
  '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`',
};
const EDITOR_CLOSERS = new Set([')', ']', '}']);

let state: EditorState = { tabs: [], activeId: '' };
let editorEl: HTMLTextAreaElement | null = null;
let highlightEl: HTMLPreElement | null = null;
let lineNumbersEl: HTMLDivElement | null = null;
let previewEl: HTMLDivElement | null = null;
let tabsBarEl: HTMLDivElement | null = null;
let toolbarLangEl: HTMLSelectElement | null = null;
let kbHandler: ((event: KeyboardEvent) => void) | null = null;
let autocompleteCtl: AutocompleteController | null = null;
let pageRoot: HTMLDivElement | null = null;

const persist = debounce(() => saveState(state), 400);

function renderTabsBar(): HTMLDivElement {
  const tabsList = h('div', { className: 'editor-tabs__list' });
  state.tabs.forEach((tab) => {
    const isActive = tab.id === state.activeId;
    const tabElement = h('div', {
      className: cx('editor-tab', isActive && 'is-active'),
      title: 'Click para abrir · duplo click para renomear',
      onclick: () => {
        state.activeId = tab.id;
        persist();
        render();
      },
      ondblclick: () => {
        const newName = prompt('Renomear arquivo:', tab.name);
        if (newName?.trim()) {
          renameTab(state, tab.id, newName);
          persist();
          render();
        }
      },
    },
    h('span', { className: 'editor-tab__icon' }, getLang(tab.lang).icon),
    h('span', { className: 'editor-tab__name' }, tab.name),
    h('button', {
      className: 'editor-tab__close',
      'aria-label': `Fechar ${tab.name}`,
      title: 'Fechar (Ctrl+W)',
      onclick: (event: Event) => {
        event.stopPropagation();
        closeTab(state, tab.id);
        persist();
        render();
      },
    }, '×'),
    );
    tabsList.appendChild(tabElement);
  });
  tabsList.appendChild(h('button', {
    className: 'editor-tab editor-tab--add',
    title: 'Nova aba (Ctrl+T)',
    onclick: () => {
      addTab(state, 'javascript');
      persist();
      render();
    },
  }, '+'));
  return tabsList;
}

function renderToolbar(): HTMLDivElement {
  const activeTab = getActiveTab(state);
  toolbarLangEl = h('select', {
    className: 'editor-toolbar__lang input',
    title: 'Linguagem',
    onchange: (event: Event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;
      changeTabLang(state, activeTab.id, event.target.value);
      persist();
      render();
    },
  }, ...LANGS.map((language) => h('option', {
    value: language.id,
    selected: language.id === activeTab.lang,
  }, `${language.icon}  ${language.name}`)));

  const language = getLang(activeTab.lang);
  const canRun = Boolean(language.runner);
  return h('div', { className: 'editor-toolbar' },
    h('div', { className: 'editor-toolbar__group' }, toolbarLangEl),
    h('div', { className: 'editor-toolbar__group' },
      h('button', {
        className: 'btn btn--primary btn--sm',
        disabled: !canRun,
        title: canRun ? `Executar ${language.name} (Ctrl+Enter)` : `${language.name} sem runner nesta fase`,
        onclick: handleRun,
      }, '▶ Run'),
      h('button', { className: 'btn btn--sm', title: 'Salvar (Ctrl+S)', onclick: handleSave }, '💾 Save'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        title: 'Limpar conteúdo da tab atual',
        onclick: () => {
          if (confirm('Limpar todo conteúdo desta aba?')) {
            updateTabContent(state, activeTab.id, '');
            persist();
            render();
          }
        },
      }, '✕ Clear'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        title: 'Abrir arquivo do filesystem virtual (compartilhado com o Terminal)',
        onclick: handleOpenVfs,
      }, '◫ Abrir VFS'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        title: 'Salvar a aba atual no filesystem virtual',
        onclick: handleSaveVfs,
      }, '⤓ Salvar VFS'),
    ),
    h('div', { className: 'editor-toolbar__meta' },
      h('span', { className: 'badge badge--cyan' }, language.name),
      h('span', { className: 'u-text-muted u-mono' }, `${activeTab.content.length} chars`),
    ),
  );
}

function renderEditorArea(): HTMLDivElement {
  const activeTab = getActiveTab(state);
  const language = getLang(activeTab.lang);
  lineNumbersEl = h('div', { className: 'editor-lines' });
  highlightEl = h('pre', { className: 'editor-highlight' }, h('code', null, ''));
  editorEl = h('textarea', {
    className: 'editor-textarea',
    spellcheck: false,
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    value: activeTab.content,
    placeholder: '// comece a digitar…',
    oninput: (event: Event) => {
      if (!(event.target instanceof HTMLTextAreaElement)) return;
      updateTabContent(state, activeTab.id, event.target.value);
      updateHighlight();
      updateLineNumbers();
      persist();
      publishStatus();
      autocompleteCtl?.refresh();
      const meta = document.querySelector('.editor-toolbar__meta .u-mono');
      if (meta) meta.textContent = `${event.target.value.length} chars`;
    },
    onkeydown: (event: Event) => {
      if (event instanceof KeyboardEvent) handleEditorKeydown(event);
    },
    onscroll: () => syncScroll(),
  });

  const editor = editorEl;
  const highlight = highlightEl;
  const lines = lineNumbersEl;
  if (!editor || !highlight || !lines) return h('div', { className: 'editor-area' });

  function syncScroll(): void {
    highlight.scrollTop = editor.scrollTop;
    highlight.scrollLeft = editor.scrollLeft;
    lines.scrollTop = editor.scrollTop;
    autocompleteCtl?.close();
  }

  function updateHighlight(): void {
    const code = highlight.querySelector('code');
    if (code) code.innerHTML = highlightCode(editor.value, language) + '\n';
  }

  function updateLineNumbers(): void {
    const lineCount = editor.value.split('\n').length;
    let text = '';
    for (let index = 1; index <= Math.max(lineCount, 1); index += 1) text += `${index}\n`;
    lines.textContent = text;
  }

  function publishStatus(): void {
    const value = editor.value;
    setStatus('editor', {
      linguagem: language.name,
      linhas: value ? value.split('\n').length : 0,
      caracteres: value.length,
      abaAtiva: activeTab.name,
    });
  }

  setTimeout(() => {
    updateHighlight();
    updateLineNumbers();
    publishStatus();
  }, 0);

  const main = h('div', { className: 'editor-area__main' }, highlight, editor);
  autocompleteCtl = createAutocomplete({
    textarea: editor,
    anchor: main,
    getLang: () => getLang(getActiveTab(state).lang),
  });
  return h('div', { className: 'editor-area' }, lines, main, buildFindPanel());
}

function highlightCode(code: string, language: ReturnType<typeof getLang>): string {
  return highlight(code, language);
}

function handleEditorKeydown(event: KeyboardEvent): void {
  if (autocompleteCtl?.handleKey(event)) return;
  const textarea = event.target;
  if (!(textarea instanceof HTMLTextAreaElement)) return;
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const apply = (next: string, selectionStart: number, selectionEnd = selectionStart): void => {
    textarea.value = next;
    textarea.selectionStart = selectionStart;
    textarea.selectionEnd = selectionEnd;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const blockStart = value.lastIndexOf('\n', start - 1) + 1;
  let blockEnd = value.indexOf('\n', end);
  if (blockEnd === -1) blockEnd = value.length;

  if (event.key === 'Tab') {
    event.preventDefault();
    const multiLine = value.slice(start, end).includes('\n');
    if (event.shiftKey || multiLine) {
      const selectedLines = value.slice(blockStart, blockEnd).split('\n');
      let firstDelta = 0;
      let totalDelta = 0;
      const output = selectedLines.map((line, index) => {
        if (event.shiftKey) {
          const removed = (line.match(/^ {1,2}/) || [''])[0].length;
          if (index === 0) firstDelta = -removed;
          totalDelta -= removed;
          return line.slice(removed);
        }
        if (index === 0) firstDelta = 2;
        totalDelta += 2;
        return `  ${line}`;
      }).join('\n');
      apply(value.slice(0, blockStart) + output + value.slice(blockEnd), Math.max(blockStart, start + firstDelta), end + totalDelta);
    } else {
      apply(value.slice(0, start) + '  ' + value.slice(end), start + 2);
    }
    return;
  }

  if ((event.ctrlKey || event.metaKey) && event.key === '/') {
    event.preventDefault();
    const language = getLang(getActiveTab(state).lang);
    const token = language.lineComment;
    if (!token) return;
    const selectedLines = value.slice(blockStart, blockEnd).split('\n');
    const nonEmpty = selectedLines.filter((line) => line.trim());
    const commented = nonEmpty.length > 0 && nonEmpty.every((line) => line.trimStart().startsWith(token));
    const output = commented
      ? selectedLines.map((line) => {
        const index = line.indexOf(token);
        return index === -1 ? line : `${line.slice(0, index)}${line.slice(index + token.length).replace(/^ /, '')}`;
      })
      : selectedLines.map((line) => {
        if (!line.trim()) return line;
        const indent = Math.min(...nonEmpty.map((item) => (item.match(/^ */) || [''])[0].length));
        return `${line.slice(0, indent)}${token} ${line.slice(indent)}`;
      });
    const block = output.join('\n');
    apply(value.slice(0, blockStart) + block + value.slice(blockEnd), blockStart, blockStart + block.length);
    return;
  }

  if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
    event.preventDefault();
    const block = value.slice(blockStart, blockEnd);
    if (event.shiftKey) {
      const duplicated = value.slice(0, blockEnd) + '\n' + block + value.slice(blockEnd);
      if (event.key === 'ArrowDown') {
        const delta = block.length + 1;
        apply(duplicated, start + delta, end + delta);
      } else apply(duplicated, start, end);
    } else if (event.key === 'ArrowUp') {
      if (blockStart === 0) return;
      const previousStart = value.lastIndexOf('\n', blockStart - 2) + 1;
      const previousLine = value.slice(previousStart, blockStart - 1);
      const delta = blockStart - previousStart;
      apply(value.slice(0, previousStart) + block + '\n' + previousLine + value.slice(blockEnd), start - delta, end - delta);
    } else {
      if (blockEnd >= value.length) return;
      let nextEnd = value.indexOf('\n', blockEnd + 1);
      if (nextEnd === -1) nextEnd = value.length;
      const nextLine = value.slice(blockEnd + 1, nextEnd);
      const delta = nextLine.length + 1;
      apply(value.slice(0, blockStart) + nextLine + '\n' + block + value.slice(nextEnd), start + delta, end + delta);
    }
    return;
  }

  if (event.key === 'Enter' && start === end) {
    const indent = (value.slice(blockStart, start).match(/^ */) || [''])[0];
    const before = value[start - 1];
    const after = value[start];
    if (before && '{[('.includes(before)) {
      event.preventDefault();
      const inner = `${indent}  `;
      if (after && '}])'.includes(after)) {
        apply(value.slice(0, start) + '\n' + inner + '\n' + indent + value.slice(start), start + 1 + inner.length);
      } else apply(value.slice(0, start) + '\n' + inner + value.slice(start), start + 1 + inner.length);
      return;
    }
    if (indent) {
      event.preventDefault();
      apply(value.slice(0, start) + '\n' + indent + value.slice(start), start + 1 + indent.length);
      return;
    }
  }

  if (EDITOR_PAIRS[event.key]) {
    const open = event.key;
    const close = EDITOR_PAIRS[open];
    if (open === close && start === end && value[start] === open) {
      event.preventDefault();
      apply(value, start + 1);
      return;
    }
    event.preventDefault();
    if (start !== end) apply(value.slice(0, start) + open + value.slice(start, end) + close + value.slice(end), start + 1, end + 1);
    else apply(value.slice(0, start) + open + close + value.slice(start), start + 1);
    return;
  }

  if (EDITOR_CLOSERS.has(event.key) && start === end && value[start] === event.key) {
    event.preventDefault();
    apply(value, start + 1);
    return;
  }

  if (event.key === 'Backspace' && start === end && start > 0) {
    const before = value[start - 1];
    if (EDITOR_PAIRS[before] && EDITOR_PAIRS[before] === value[start]) {
      event.preventDefault();
      apply(value.slice(0, start - 1) + value.slice(start + 1), start - 1);
    }
  }
}

const findState: FindState = {
  open: false,
  mode: 'find',
  query: '',
  replace: '',
  caseSensitive: false,
  matches: [],
  current: -1,
};

let findPanelEl: HTMLDivElement | null = null;
let findInputEl: HTMLInputElement | null = null;
let findReplaceInputEl: HTMLInputElement | null = null;
let findReplaceRowEl: HTMLDivElement | null = null;
let findCountEl: HTMLSpanElement | null = null;

function computeMatches(): void {
  const text = editorEl?.value ?? '';
  const query = findState.query;
  findState.matches = [];
  if (query) {
    const haystack = findState.caseSensitive ? text : text.toLowerCase();
    const needle = findState.caseSensitive ? query : query.toLowerCase();
    let index = haystack.indexOf(needle);
    while (index !== -1) {
      findState.matches.push(index);
      index = haystack.indexOf(needle, index + needle.length);
    }
  }
  if (!findState.matches.length) findState.current = -1;
  else if (findState.current < 0 || findState.current >= findState.matches.length) findState.current = 0;
  updateFindCount();
}

function updateFindCount(): void {
  if (!findCountEl) return;
  const count = findState.matches.length;
  findCountEl.textContent = !findState.query ? '' : count === 0 ? 'nada' : `${findState.current + 1} / ${count}`;
}

function revealMatch(): void {
  const editor = editorEl;
  if (!editor || findState.current < 0) return;
  const position = findState.matches[findState.current];
  editor.setSelectionRange(position, position + findState.query.length);
  const line = editor.value.slice(0, position).split('\n').length - 1;
  const lineHeight = Number.parseFloat(getComputedStyle(editor).lineHeight) || 21;
  const target = line * lineHeight;
  const viewHeight = editor.clientHeight;
  if (target < editor.scrollTop || target > editor.scrollTop + viewHeight - lineHeight * 2) {
    editor.scrollTop = Math.max(0, target - viewHeight / 2);
  }
}

function stepMatch(direction: number): void {
  if (!findState.matches.length) return;
  const count = findState.matches.length;
  findState.current = (findState.current + direction + count) % count;
  revealMatch();
  updateFindCount();
}

function applyEditorValue(next: string): void {
  if (!editorEl) return;
  editorEl.value = next;
  editorEl.dispatchEvent(new Event('input', { bubbles: true }));
}

function replaceCurrentMatch(): void {
  const editor = editorEl;
  if (!editor || findState.current < 0 || !findState.matches.length) return;
  const position = findState.matches[findState.current];
  const current = findState.current;
  applyEditorValue(editor.value.slice(0, position) + findState.replace + editor.value.slice(position + findState.query.length));
  computeMatches();
  if (findState.matches.length) {
    findState.current = current % findState.matches.length;
    revealMatch();
    updateFindCount();
  }
}

function replaceAllMatches(): void {
  const editor = editorEl;
  if (!editor || !findState.matches.length) return;
  const text = editor.value;
  const query = findState.query;
  let output: string;
  if (findState.caseSensitive) {
    output = text.split(query).join(findState.replace);
  } else {
    const haystack = text.toLowerCase();
    const needle = query.toLowerCase();
    output = '';
    let cursor = 0;
    let index: number;
    while ((index = haystack.indexOf(needle, cursor)) !== -1) {
      output += text.slice(cursor, index) + findState.replace;
      cursor = index + needle.length;
    }
    output += text.slice(cursor);
  }
  const count = findState.matches.length;
  applyEditorValue(output);
  computeMatches();
  toast(`${count} ocorrência(s) substituída(s)`, { type: 'success', duration: 1800 });
}

function openFind(mode: FindMode): void {
  findState.open = true;
  findState.mode = mode;
  const panel = findPanelEl;
  const findInput = findInputEl;
  const replaceInput = findReplaceInputEl;
  const replaceRow = findReplaceRowEl;
  if (!panel || !findInput || !replaceInput || !replaceRow) return;
  panel.classList.add('is-open');
  replaceRow.style.display = mode === 'replace' ? '' : 'none';
  if (editorEl) {
    const selection = editorEl.value.slice(editorEl.selectionStart, editorEl.selectionEnd);
    if (selection && !selection.includes('\n')) findState.query = selection;
  }
  findInput.value = findState.query;
  replaceInput.value = findState.replace;
  computeMatches();
  revealMatch();
  findInput.focus();
  findInput.select();
}

function closeFind(): void {
  findState.open = false;
  findPanelEl?.classList.remove('is-open');
  editorEl?.focus();
}

function buildFindPanel(): HTMLDivElement {
  const findInput = h('input', {
    className: 'editor-find__input u-mono',
    type: 'text', spellcheck: false, placeholder: 'Localizar',
    oninput: () => {
      findState.query = findInput.value;
      computeMatches();
      revealMatch();
    },
    onkeydown: (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key === 'Enter') { event.preventDefault(); stepMatch(event.shiftKey ? -1 : 1); }
      else if (event.key === 'Escape') { event.preventDefault(); closeFind(); }
    },
  });
  const replaceInput = h('input', {
    className: 'editor-find__input u-mono',
    type: 'text', spellcheck: false, placeholder: 'Substituir por',
    oninput: () => { findState.replace = replaceInput.value; },
    onkeydown: (event: Event) => {
      if (!(event instanceof KeyboardEvent)) return;
      if (event.key === 'Enter') { event.preventDefault(); replaceCurrentMatch(); }
      else if (event.key === 'Escape') { event.preventDefault(); closeFind(); }
    },
  });
  const count = h('span', { className: 'editor-find__count u-mono' }, '');
  const caseButton = h('button', {
    className: 'editor-find__toggle',
    title: 'Diferenciar maiúsculas de minúsculas',
    onclick: () => {
      findState.caseSensitive = !findState.caseSensitive;
      caseButton.classList.toggle('is-on', findState.caseSensitive);
      computeMatches();
      revealMatch();
    },
  }, 'Aa');
  const replaceRow = h('div', { className: 'editor-find__row' },
    replaceInput,
    h('button', { className: 'editor-find__btn editor-find__btn--text', title: 'Substituir a ocorrência atual (Enter)', onclick: replaceCurrentMatch }, 'Subst.'),
    h('button', { className: 'editor-find__btn editor-find__btn--text', title: 'Substituir todas', onclick: replaceAllMatches }, 'Tudo'),
  );
  const panel = h('div', { className: 'editor-find' },
    h('div', { className: 'editor-find__row' },
      findInput, caseButton, count,
      h('button', { className: 'editor-find__btn', title: 'Anterior (Shift+Enter)', onclick: () => stepMatch(-1) }, '↑'),
      h('button', { className: 'editor-find__btn', title: 'Próximo (Enter)', onclick: () => stepMatch(1) }, '↓'),
      h('button', { className: 'editor-find__btn', title: 'Fechar (Esc)', onclick: closeFind }, '×'),
    ),
    replaceRow,
  );
  findInputEl = findInput;
  findReplaceInputEl = replaceInput;
  findCountEl = count;
  findReplaceRowEl = replaceRow;
  findPanelEl = panel;
  if (findState.open) {
    panel.classList.add('is-open');
    findInput.value = findState.query;
    replaceInput.value = findState.replace;
    caseButton.classList.toggle('is-on', findState.caseSensitive);
    replaceRow.style.display = findState.mode === 'replace' ? '' : 'none';
    computeMatches();
  } else replaceRow.style.display = 'none';
  return panel;
}

function renderPreview(): HTMLDivElement {
  previewEl = h('div', { className: 'editor-preview' });
  previewEl.appendChild(h('div', { className: 'editor-preview__empty' },
    h('div', { style: { fontSize: '32px', opacity: 0.5 } }, '▶'),
    h('div', null, 'Pressione Run ou Ctrl+Enter para executar.'),
    h('div', { className: 'u-text-muted u-mono', style: { fontSize: '12px', marginTop: '8px' } },
      'Suporte: JavaScript · HTML · CSS · Markdown'),
  ));
  return previewEl;
}

function renderRunResult(result: EditorRunResult, tab: EditorTab): void {
  if (!previewEl) return;
  empty(previewEl);
  if (result.type === 'iframe') {
    previewEl.appendChild(h('iframe', {
      className: 'editor-preview__iframe', sandbox: 'allow-scripts', srcdoc: result.payload, title: 'Preview',
    }));
    toast(`▶ Executando ${getLang(tab.lang).name}…`, { type: 'success', duration: 1400 });
  } else if (result.type === 'html') {
    previewEl.appendChild(h('div', { className: 'editor-preview__html', html: result.payload }));
    toast('▶ Markdown renderizado', { type: 'success', duration: 1400 });
  } else {
    previewEl.appendChild(h('div', { className: 'editor-preview__logs' }, result.payload));
    toast(result.payload, { type: 'warning', duration: 3200 });
  }
}

function handleRun(): void {
  const tab = getActiveTab(state);
  renderRunResult(runTab(tab), tab);
}

function handleSave(): void {
  saveState(state);
  toast('Salvo localmente', { type: 'success', duration: 1400 });
}

function handleOpenVfs(): void {
  const path = prompt('Caminho do arquivo no filesystem virtual:\n(ex: /home/lucas/README.md)', '/home/lucas/README.md');
  if (!path) return;
  try {
    const content = vfs.readFile(path, '/');
    const name = vfs.basename(path);
    const extension = name.includes('.') ? name.split('.').pop() ?? '' : '';
    const language = langForExt(extension);
    const tab = addTab(state, language ? language.id : 'javascript');
    tab.name = name;
    updateTabContent(state, tab.id, content);
    persist();
    render();
    toast(`Aberto: ${name}`, { type: 'success' });
  } catch (error) {
    toast(`Erro: ${error instanceof Error ? error.message : String(error)}`, { type: 'danger' });
  }
}

function handleSaveVfs(): void {
  const activeTab = getActiveTab(state);
  const suggested = `/home/lucas/${activeTab.name}`;
  const path = prompt('Salvar a aba atual em qual caminho do VFS?', suggested);
  if (!path) return;
  try {
    vfs.writeFile(path, activeTab.content, '/');
    toast(`Salvo no VFS: ${path}`, { type: 'success' });
  } catch (error) {
    toast(`Erro: ${error instanceof Error ? error.message : String(error)}`, { type: 'danger' });
  }
}

function attachKeyboard(): void {
  kbHandler = (event: KeyboardEvent): void => {
    if (!location.hash.startsWith('#/editor')) return;
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); handleRun();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault(); handleSave();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 't') {
      event.preventDefault(); addTab(state, 'javascript'); persist(); render();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'w') {
      event.preventDefault(); const active = getActiveTab(state); closeTab(state, active.id); persist(); render();
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'f') {
      event.preventDefault(); openFind('find');
    } else if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
      event.preventDefault(); openFind('replace');
    } else if (event.key === 'Escape' && findState.open) closeFind();
  };
  window.addEventListener('keydown', kbHandler);
}

function render(): void {
  const root = pageRoot;
  if (!root) return;
  empty(root);
  tabsBarEl = h('div', { className: 'editor-tabs' }, renderTabsBar());
  root.appendChild(tabsBarEl);
  root.appendChild(renderToolbar());
  root.appendChild(renderEditorArea());
  root.appendChild(renderPreview());
}

export function editorPage(): HTMLDivElement {
  state = loadState();
  findState.open = false;
  findState.matches = [];
  findState.current = -1;
  const fullPage = h('div', { className: 'page-editor' });
  fullPage.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '16px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'),
    h('span', null, '›'), h('span', null, 'EDITOR DE CÓDIGO'),
  ),
  h('h1', { className: 'page-header__title' }, '⌨ Editor de Código · IDE'),
  h('p', { className: 'page-header__description' },
    'Multi-tabs · 26 linguagens · runners JS/HTML/CSS/Markdown. ',
    h('span', { className: 'u-text-cyan' }, 'Edição estilo VS Code'),
    ': autocomplete com snippets enquanto digita (', h('span', { className: 'u-mono' }, 'psvm'), ', ',
    h('span', { className: 'u-mono' }, 'sout'), ', ', h('span', { className: 'u-mono' }, 'fori'), ', ',
    h('span', { className: 'u-mono' }, 'log'), '… — ', h('kbd', null, 'Tab'), '/', h('kbd', null, 'Enter'),
    ' aceita · ', h('kbd', null, 'Ctrl+Espaço'), ' abre), auto-fechamento de pares, auto-indentação, ',
    h('kbd', null, 'Ctrl+/'), ' comenta · ', h('kbd', null, 'Alt+↑↓'), ' move linha · ',
    h('kbd', null, 'Shift+Alt+↑↓'), ' duplica · ', h('kbd', null, 'Tab'), ' indenta o bloco. ',
    h('kbd', null, 'Ctrl+Enter'), ' run · ', h('kbd', null, 'Ctrl+S'), ' save · ',
    h('kbd', null, 'Ctrl+T'), ' nova tab · ', h('kbd', null, 'Ctrl+W'), ' fechar · ',
    h('kbd', null, 'Ctrl+F'), ' localizar · ', h('kbd', null, 'Ctrl+H'), ' substituir. VFS compartilhado com o Terminal.',
  ),
  ));

  const editorWrap = h('div', { className: 'editor-wrap' });
  fullPage.appendChild(editorWrap);
  pageRoot = editorWrap;
  render();
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  attachKeyboard();
  aoSair(fullPage, () => {
    if (kbHandler) window.removeEventListener('keydown', kbHandler);
    kbHandler = null;
    autocompleteCtl?.close();
    autocompleteCtl = null;
  });
  return fullPage;
}
