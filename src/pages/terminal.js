/**
 * Página /terminal — Terminal Web (Fase 3).
 *
 * UI estilo terminal:
 *   ┌─ output area (scrollable) ────────────────────────┐
 *   │ welcome banner + saídas dos comandos              │
 *   │ ...                                                │
 *   ├─ prompt input ─────────────────────────────────────┤
 *   │ user@host:cwd$ |                                  │
 *   └────────────────────────────────────────────────────┘
 */

import { h, empty, mount } from '../utils/helpers.js';
import { execute, autocomplete, createContext } from '../utils/terminal-engine.js';
import { COMMANDS } from '../data/terminal-commands.js';
import { setStatus } from '../utils/baluarte-status.js';

const ANSI_COLORS = {
  '30': '#000', '31': '#ff3355', '32': '#00ff88', '33': '#ffaa00',
  '34': '#66ddff', '35': '#e8c07a', '36': '#d4a24e', '37': '#e6f1ff',
  '90': '#5a6b85', '91': '#ff6680', '92': '#33ffaa', '93': '#ffcc66',
  '94': '#88ddff', '95': '#ff66cc', '96': '#66f0ff', '97': '#ffffff'
};

let outputEl = null;
let inputEl = null;
let promptEl = null;
let ctx = null;
let historyIdx = -1;
let inputBuffer = '';
let kbHandler = null;
let processing = false;

/* ============================================================
 *  Render: linhas de output
 * ============================================================ */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Converte códigos ANSI \x1b[XXm em <span> coloridos. */
function ansiToHtml(text) {
  let out = escapeHtml(text);
  out = out.replace(/\x1b\[(\d+)m([\s\S]*?)\x1b\[0m/g, (_m, code, content) => {
    const color = ANSI_COLORS[code];
    return color ? `<span style="color:${color}">${content}</span>` : content;
  });
  return out;
}

function appendLine(text, type = 'out') {
  if (!outputEl) return;
  const line = h('div', {
    className: `term-line term-line--${type}`,
    html: ansiToHtml(text)
  });
  outputEl.appendChild(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function appendCommandEcho(line) {
  const prompt = renderPromptText();
  const wrap = h('div', { className: 'term-line term-line--cmd' });
  wrap.innerHTML = `<span class="term-prompt">${escapeHtml(prompt)}</span><span class="term-cmd">${escapeHtml(line)}</span>`;
  outputEl.appendChild(wrap);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function clearOutput() {
  empty(outputEl);
}

/* ============================================================
 *  Prompt
 * ============================================================ */

function renderPromptText() {
  const cwd = ctx.cwd === '/home/lucas' ? '~' : ctx.cwd.replace(/^\/home\/lucas/, '~');
  return `${ctx.env.USER}@${ctx.env.HOSTNAME}:${cwd}$ `;
}

function updatePrompt() {
  if (promptEl) promptEl.textContent = renderPromptText();
}

/* ============================================================
 *  Banner de boot
 * ============================================================ */

function showBanner() {
  appendLine('⬡ BALUARTE Terminal · Mark XIII · v0.3.0', 'banner');
  appendLine('Operador: Lucas Belucci Bellini · Clearance: OMEGA', 'banner-sub');
  appendLine(`Comandos disponíveis: ${Object.keys(COMMANDS).length} · Digite 'help' para listar.`, 'banner-sub');
  appendLine('', 'spacer');
}

/* ============================================================
 *  Execução
 * ============================================================ */

async function runLine(line) {
  if (processing) return;
  processing = true;
  appendCommandEcho(line);

  try {
    const result = await execute(line, ctx);
    if (result.stdout) appendLine(result.stdout, 'out');
    if (result.stderr) appendLine(result.stderr.trimEnd(), 'err');
  } catch (e) {
    appendLine('error: ' + e.message, 'err');
  } finally {
    processing = false;
    updatePrompt();
    setStatus('terminal', { diretorio: ctx.cwd, ultimoComando: line });
    inputEl.value = '';
    historyIdx = -1;
    inputEl.focus();
  }
}

/* ============================================================
 *  Keyboard
 * ============================================================ */

function setupKeys() {
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const line = inputEl.value;
      runLine(line);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (ctx.history.length === 0) return;
      if (historyIdx === -1) {
        inputBuffer = inputEl.value;
        historyIdx = ctx.history.length - 1;
      } else if (historyIdx > 0) historyIdx--;
      inputEl.value = ctx.history[historyIdx] || '';
      setTimeout(() => inputEl.setSelectionRange(inputEl.value.length, inputEl.value.length), 0);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx < ctx.history.length - 1) {
        historyIdx++;
        inputEl.value = ctx.history[historyIdx];
      } else {
        historyIdx = -1;
        inputEl.value = inputBuffer;
        inputBuffer = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = autocomplete(inputEl.value, ctx);
      if (matches.length === 1) {
        const tokens = inputEl.value.split(/\s+/);
        tokens[tokens.length - 1] = matches[0];
        inputEl.value = tokens.join(' ');
      } else if (matches.length > 1) {
        appendCommandEcho(inputEl.value);
        appendLine(matches.join('  '), 'out');
      }
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      clearOutput();
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      e.preventDefault();
      appendCommandEcho(inputEl.value + ' ^C');
      inputEl.value = '';
      historyIdx = -1;
    }
  });

  /* Foca o input ao clicar em qualquer lugar do terminal */
  outputEl.parentElement.addEventListener('click', () => inputEl.focus());
}

/* ============================================================
 *  Atalhos globais (apenas em /terminal)
 * ============================================================ */

function attachGlobalKeys() {
  if (kbHandler) window.removeEventListener('keydown', kbHandler);
  kbHandler = (e) => {
    if (!location.hash.startsWith('#/terminal')) return;
    /* Ctrl+L global pra limpar (já tem no input handler também) */
    if (e.ctrlKey && e.key.toLowerCase() === 'l' && document.activeElement !== inputEl) {
      e.preventDefault();
      clearOutput();
    }
  };
  window.addEventListener('keydown', kbHandler);
}

/* ============================================================
 *  Page builder
 * ============================================================ */

export function terminalPage() {
  ctx = createContext({
    println: (msg) => appendLine(msg, 'out'),
    clear: () => clearOutput()
  });

  const fullPage = h('div', { className: 'page-terminal' });

  /* Header */
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
        h('span', null, 'TERMINAL WEB')
      ),
      h('h1', { className: 'page-header__title' }, '▶ Terminal Web'),
      h(
        'p',
        { className: 'page-header__description' },
        Object.keys(COMMANDS).length,
        ' comandos POSIX-like com filesystem virtual persistente, pipes ',
        h('kbd', null, '|'),
        ', redirects ',
        h('kbd', null, '>'),
        ' / ',
        h('kbd', null, '>>'),
        ', encadeamento ',
        h('kbd', null, '&&'),
        ', history (',
        h('kbd', null, '↑↓'),
        '), autocomplete (',
        h('kbd', null, 'Tab'),
        '), limpar (',
        h('kbd', null, 'Ctrl+L'),
        ').'
      )
    )
  );

  /* Terminal screen */
  outputEl = h('div', { className: 'term-output' });
  promptEl = h('span', { className: 'term-prompt-live' }, renderPromptText());
  inputEl = h('input', {
    className: 'term-input',
    type: 'text',
    spellcheck: 'false',
    autocomplete: 'off',
    autocorrect: 'off',
    autocapitalize: 'off',
    placeholder: 'digite um comando…',
    'aria-label': 'Linha de comando'
  });

  const inputRow = h('div', { className: 'term-input-row' }, promptEl, inputEl);

  fullPage.appendChild(
    h('div', { className: 'term-screen' }, outputEl, inputRow)
  );

  /* Toolbar inferior */
  fullPage.appendChild(
    h(
      'div',
      { className: 'term-tips' },
      h('span', { className: 'badge badge--cyan' }, 'TIP'),
      h('span', null, "Tente: "),
      h('code', null, 'ls'),
      h('span', null, ', '),
      h('code', null, 'cat README.md'),
      h('span', null, ', '),
      h('code', null, 'echo $USER'),
      h('span', null, ', '),
      h('code', null, "find / -name '*.md'"),
      h('span', null, ', '),
      h('code', null, 'banner'),
      h('span', null, ', '),
      h('code', null, "cowsay Olá"),
      h('span', null, ', '),
      h('code', null, 'open #/editor'),
      h('span', null, '.')
    )
  );

  setupKeys();
  attachGlobalKeys();
  showBanner();

  setTimeout(() => inputEl.focus(), 0);

  return fullPage;
}
