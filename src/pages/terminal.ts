/**
 * Página /terminal — Terminal Web com filesystem virtual persistente.
 */

import '../styles/terminal.css';
import { h, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { autocomplete, createContext, execute } from '../utils/terminal-engine.js';
import type { TerminalContext } from '../utils/terminal-engine.js';
import { COMMANDS } from '../data/terminal-commands.js';
import { setStatus } from '../utils/baluarte-status.js';

const ANSI_COLORS: Readonly<Record<string, string>> = {
  '30': '#000', '31': '#ff3355', '32': '#00ff88', '33': '#ffaa00',
  '34': '#66ddff', '35': '#e8c07a', '36': '#d4a24e', '37': '#e6f1ff',
  '90': '#5a6b85', '91': '#ff6680', '92': '#33ffaa', '93': '#ffcc66',
  '94': '#88ddff', '95': '#ff66cc', '96': '#66f0ff', '97': '#ffffff',
};

let outputElement: HTMLDivElement | null = null;
let inputElement: HTMLInputElement | null = null;
let promptElement: HTMLSpanElement | null = null;
let context: TerminalContext | null = null;
let historyIndex = -1;
let inputBuffer = '';
let keyboardHandler: ((event: KeyboardEvent) => void) | null = null;
let processing = false;

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function ansiToHtml(text: string): string {
  let output = escapeHtml(text);
  output = output.replace(/\x1b\[(\d+)m([\s\S]*?)\x1b\[0m/g,
    (_match: string, code: string, content: string) => {
      const color = ANSI_COLORS[code];
      return color ? `<span style="color:${color}">${content}</span>` : content;
    });
  return output;
}

function appendLine(text: string, type = 'out'): void {
  if (!outputElement) return;
  const line = h('div', { className: `term-line term-line--${type}`, html: ansiToHtml(text) });
  outputElement.appendChild(line);
  outputElement.scrollTop = outputElement.scrollHeight;
}

function renderPromptText(): string {
  if (!context) return '';
  const cwd = context.cwd === '/home/lucas' ? '~' : context.cwd.replace(/^\/home\/lucas/, '~');
  return `${context.env.USER}@${context.env.HOSTNAME}:${cwd}$ `;
}

function appendCommandEcho(line: string): void {
  if (!outputElement) return;
  const wrapper = h('div', { className: 'term-line term-line--cmd' });
  wrapper.innerHTML = `<span class="term-prompt">${escapeHtml(renderPromptText())}</span><span class="term-cmd">${escapeHtml(line)}</span>`;
  outputElement.appendChild(wrapper);
  outputElement.scrollTop = outputElement.scrollHeight;
}

function clearOutput(): void {
  if (outputElement) empty(outputElement);
}

function updatePrompt(): void {
  if (promptElement) promptElement.textContent = renderPromptText();
}

function showBanner(): void {
  appendLine('⬡ BALUARTE Terminal · Mark XIII · v0.3.0', 'banner');
  appendLine('Operador: Lucas Belucci Bellini · Clearance: OMEGA', 'banner-sub');
  appendLine(`Comandos disponíveis: ${Object.keys(COMMANDS).length} · Digite 'help' para listar.`, 'banner-sub');
  appendLine('', 'spacer');
}

async function runLine(line: string): Promise<void> {
  if (processing || !context || !inputElement) return;
  processing = true;
  appendCommandEcho(line);
  try {
    const result = await execute(line, context);
    if (result.stdout) appendLine(result.stdout, 'out');
    if (result.stderr) appendLine(result.stderr.trimEnd(), 'err');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    appendLine(`error: ${message}`, 'err');
  } finally {
    processing = false;
    updatePrompt();
    if (context) setStatus('terminal', { diretorio: context.cwd, ultimoComando: line });
    inputElement.value = '';
    historyIndex = -1;
    inputElement.focus();
  }
}

function setupKeys(): void {
  if (!inputElement || !context || !outputElement) return;
  const input = inputElement;
  const terminalContext = context;
  const output = outputElement;
  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void runLine(input.value);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (terminalContext.history.length === 0) return;
      if (historyIndex === -1) {
        inputBuffer = input.value;
        historyIndex = terminalContext.history.length - 1;
      } else if (historyIndex > 0) historyIndex -= 1;
      input.value = terminalContext.history[historyIndex] || '';
      setTimeout(() => input.setSelectionRange(input.value.length, input.value.length), 0);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < terminalContext.history.length - 1) {
        historyIndex += 1;
        input.value = terminalContext.history[historyIndex];
      } else {
        historyIndex = -1;
        input.value = inputBuffer;
        inputBuffer = '';
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      const matches = autocomplete(input.value, terminalContext);
      if (matches.length === 1) {
        const tokens = input.value.split(/\s+/);
        tokens[tokens.length - 1] = matches[0];
        input.value = tokens.join(' ');
      } else if (matches.length > 1) {
        appendCommandEcho(input.value);
        appendLine(matches.join('  '), 'out');
      }
    } else if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      clearOutput();
    } else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
      event.preventDefault();
      appendCommandEcho(`${input.value} ^C`);
      input.value = '';
      historyIndex = -1;
    }
  });
  output.parentElement?.addEventListener('click', () => input.focus());
}

function attachGlobalKeys(): void {
  if (keyboardHandler) window.removeEventListener('keydown', keyboardHandler);
  keyboardHandler = (event: KeyboardEvent) => {
    if (!location.hash.startsWith('#/terminal')) return;
    if (event.ctrlKey && event.key.toLowerCase() === 'l' && document.activeElement !== inputElement) {
      event.preventDefault();
      clearOutput();
    }
  };
  window.addEventListener('keydown', keyboardHandler);
}

export function terminalPage(): HTMLDivElement {
  context = createContext({ println: (message) => appendLine(message, 'out'), clear: clearOutput });
  const page = h('div', { className: 'page-terminal' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'TERMINAL WEB')),
      h('h1', { className: 'page-header__title' }, '▶ Terminal Web'),
      h('p', { className: 'page-header__description' },
        Object.keys(COMMANDS).length, ' comandos POSIX-like com filesystem virtual persistente, pipes ', h('kbd', null, '|'),
        ', redirects ', h('kbd', null, '>'), ' / ', h('kbd', null, '>>'), ', encadeamento ', h('kbd', null, '&&'),
        ', history (', h('kbd', null, '↑↓'), '), autocomplete (', h('kbd', null, 'Tab'), '), limpar (', h('kbd', null, 'Ctrl+L'), ').'),
    ),
  );
  outputElement = h('div', { className: 'term-output' });
  promptElement = h('span', { className: 'term-prompt-live' }, renderPromptText());
  inputElement = h('input', {
    className: 'term-input', type: 'text', spellcheck: 'false', autocomplete: 'off',
    autocorrect: 'off', autocapitalize: 'off', placeholder: 'digite um comando…', 'aria-label': 'Linha de comando',
  });
  const inputRow = h('div', { className: 'term-input-row' }, promptElement, inputElement);
  page.appendChild(h('div', { className: 'term-screen' }, outputElement, inputRow));
  page.appendChild(h('div', { className: 'term-tips' },
    h('span', { className: 'badge badge--cyan' }, 'TIP'), h('span', null, 'Tente: '), h('code', null, 'ls'), h('span', null, ', '),
    h('code', null, 'cat README.md'), h('span', null, ', '), h('code', null, 'echo $USER'), h('span', null, ', '),
    h('code', null, "find / -name '*.md'"), h('span', null, ', '), h('code', null, 'banner'), h('span', null, ', '),
    h('code', null, 'cowsay Olá'), h('span', null, ', '), h('code', null, 'open #/editor'), h('span', null, '.'),
  ));
  setupKeys();
  attachGlobalKeys();
  aoSair(page, () => {
    if (keyboardHandler) window.removeEventListener('keydown', keyboardHandler);
    keyboardHandler = null;
  });
  showBanner();
  setTimeout(() => inputElement?.focus(), 0);
  return page;
}
