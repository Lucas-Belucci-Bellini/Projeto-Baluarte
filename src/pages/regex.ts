/**
 * Página /regex — Lab de Regex.
 *
 * Mantém o comportamento da página V1 com estado local persistido, preview de
 * matches e replace, grupos numerados/nomeados, cheatsheet e exemplos prontos.
 */

import '../styles/regex.css';
import { h, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { setStatus } from '../utils/baluarte-status';

const STORAGE_KEY = 'regex:state';

interface RegexState {
  pattern: string;
  flags: string;
  text: string;
  replace: string;
}

interface RegexExample {
  label: string;
  pattern: string;
  flags: string;
  text: string;
}

interface CheatSection {
  group: string;
  items: ReadonlyArray<readonly [string, string]>;
}

const DEFAULT_STATE: RegexState = {
  pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+',
  flags: 'g',
  text: 'envie para alice@baluarte.io ou bob+work@example.com',
  replace: '[$&]',
};

const EXAMPLES: readonly RegexExample[] = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g', text: 'envie para alice@baluarte.io ou bob+work@example.com' },
  { label: 'URL', pattern: 'https?://[\\w./?=&-]+', flags: 'gi', text: 'site oficial https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte e http://baluarte.test' },
  { label: 'CPF', pattern: '\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}', flags: 'g', text: '123.456.789-01 e 987.654.321-99' },
  { label: 'Telefone BR', pattern: '\\(?\\d{2}\\)?[\\s-]?9?\\d{4}-?\\d{4}', flags: 'g', text: '(11) 99999-1234, 11 9 99991234, 4321-1234' },
  { label: 'Data DD/MM/AAAA', pattern: '(\\d{2})/(\\d{2})/(\\d{4})', flags: 'g', text: 'nascimento: 25/12/2026 · agendado para 01/01/2027' },
  { label: 'Hex color', pattern: '#([0-9a-f]{3}){1,2}\\b', flags: 'gi', text: 'cores: #d4a24e #FF0 #e8c07a #abcdef' },
  { label: 'Palavra repetida', pattern: '\\b(\\w+)\\b.*?\\b\\1\\b', flags: 'gi', text: 'o cão correu o cão correu rápido' },
  { label: 'Nomeado: ano/mês', pattern: '(?<ano>\\d{4})-(?<mes>\\d{2})-(?<dia>\\d{2})', flags: 'g', text: 'data ISO: 2026-05-15 e 2027-01-01' },
  { label: 'Lookahead', pattern: '\\d+(?= reais)', flags: 'g', text: 'paguei 50 reais por 3 livros e 25 reais por 1 caderno' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', text: 'servidor 192.168.0.1 ou 10.0.0.255 ou 8.8.8.8' },
];

const CHEATSHEET: readonly CheatSection[] = [
  { group: 'Âncoras', items: [['^', 'início da linha/string'], ['$', 'fim'], ['\\b', 'fronteira de palavra'], ['\\B', 'não-fronteira']] },
  { group: 'Classes', items: [['\\d', 'dígito [0-9]'], ['\\D', 'não-dígito'], ['\\w', 'word char [A-Za-z0-9_]'], ['\\W', 'não-word'], ['\\s', 'whitespace'], ['\\S', 'não-whitespace'], ['.', 'qualquer (exceto \\n)']] },
  { group: 'Quantificadores', items: [['*', '0 ou +'], ['+', '1 ou +'], ['?', '0 ou 1'], ['{n}', 'exatamente n'], ['{n,}', 'n ou +'], ['{n,m}', 'entre n e m'], ['*?', 'lazy (mín. possível)']] },
  { group: 'Grupos', items: [['(abc)', 'grupo de captura'], ['(?:abc)', 'sem captura'], ['(?<n>abc)', 'nomeado'], ['\\1', 'backreference (1º grupo)'], ['(a|b)', 'alternativa']] },
  { group: 'Lookahead/behind', items: [['(?=abc)', 'lookahead positivo'], ['(?!abc)', 'lookahead negativo'], ['(?<=abc)', 'lookbehind positivo'], ['(?<!abc)', 'lookbehind negativo']] },
  { group: 'Flags', items: [['g', 'global (todas matches)'], ['i', 'case-insensitive'], ['m', 'multiline'], ['s', 'dotall (. inclui \\n)'], ['u', 'unicode'], ['y', 'sticky']] },
];

let state: RegexState = { ...DEFAULT_STATE };
let patternInput: HTMLInputElement | null = null;
let flagsInput: HTMLInputElement | null = null;
let textInput: HTMLTextAreaElement | null = null;
let replaceInput: HTMLInputElement | null = null;
let resultArea: HTMLDivElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function loadState(): RegexState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  if (!isRecord(saved)) return { ...DEFAULT_STATE };
  return {
    pattern: isString(saved.pattern) ? saved.pattern : DEFAULT_STATE.pattern,
    flags: isString(saved.flags) ? saved.flags : DEFAULT_STATE.flags,
    text: isString(saved.text) ? saved.text : DEFAULT_STATE.text,
    replace: isString(saved.replace) ? saved.replace : DEFAULT_STATE.replace,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function render(): void {
  if (!resultArea) return;
  setStatus('regex', { padrao: state.pattern, flags: state.flags });
  empty(resultArea);

  if (!state.pattern) {
    resultArea.appendChild(h('div', { className: 'u-text-muted' }, 'Insira um padrão regex.'));
    return;
  }

  let regex: RegExp;
  try {
    regex = new RegExp(state.pattern, state.flags);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    resultArea.appendChild(h('div', { className: 'regex-error' }, `⚠ ${message}`));
    return;
  }

  const text = state.text;
  const matches: RegExpMatchArray[] = state.flags.includes('g')
    ? Array.from(text.matchAll(regex))
    : (() => {
      const match = text.match(regex);
      return match ? [match] : [];
    })();

  let highlighted = '';
  let lastIndex = 0;
  matches.forEach((match, index) => {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    highlighted += escapeHtml(text.slice(lastIndex, start));
    highlighted += `<mark class="regex-match" data-i="${index}" title="match #${index + 1}">${escapeHtml(match[0])}</mark>`;
    lastIndex = end;
  });
  highlighted += escapeHtml(text.slice(lastIndex));

  let replaceResult = '';
  try {
    replaceResult = text.replace(regex, state.replace || '');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    replaceResult = `(erro: ${message})`;
  }

  resultArea.appendChild(
    h('div', { className: 'regex-meta' },
      h('span', { className: 'badge badge--cyan' }, `${matches.length} matches`),
      h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } },
        `/${state.pattern}/${state.flags}`),
    ),
  );

  resultArea.appendChild(
    h('div', { className: 'regex-block' },
      h('div', { className: 'regex-block__label' }, '◉ Texto com matches'),
      h('div', { className: 'regex-highlight u-mono', html: highlighted || '(sem matches)' }),
    ),
  );

  if (matches.length) {
    const list = h('div', { className: 'regex-matches' });
    matches.forEach((match, index) => {
      const card = h('div', { className: 'regex-match-card' },
        h('div', { className: 'regex-match-card__head' },
          h('strong', null, `#${index + 1}`),
          h('span', { className: 'u-text-muted u-mono' }, ` @${match.index ?? 0}`),
        ),
        h('div', { className: 'regex-match-card__value u-mono' }, match[0]),
      );
      for (let groupIndex = 1; groupIndex < match.length; groupIndex += 1) {
        const group = match[groupIndex];
        if (group !== undefined) {
          card.appendChild(
            h('div', { className: 'regex-group' },
              h('span', { className: 'regex-group__key' }, `[${groupIndex}]`),
              h('code', null, group),
            ),
          );
        }
      }
      if (match.groups) {
        Object.entries(match.groups).forEach(([name, value]) => {
          if (value !== undefined) {
            card.appendChild(
              h('div', { className: 'regex-group regex-group--named' },
                h('span', { className: 'regex-group__key' }, name),
                h('code', null, value),
              ),
            );
          }
        });
      }
      list.appendChild(card);
    });
    resultArea.appendChild(
      h('div', { className: 'regex-block' },
        h('div', { className: 'regex-block__label' }, `⌖ Matches & grupos (${matches.length})`),
        list,
      ),
    );
  }

  resultArea.appendChild(
    h('div', { className: 'regex-block' },
      h('div', { className: 'regex-block__label' }, '⇄ Replace preview'),
      h('div', { className: 'regex-replace u-mono' }, replaceResult),
    ),
  );
}

function renderCheatsheet(): HTMLDivElement {
  const wrap = h('div', { className: 'regex-cheat' });
  wrap.appendChild(h('h3', { className: 'regex-cheat__title' }, '📖 Cheatsheet'));
  CHEATSHEET.forEach((section) => {
    const block = h('div', { className: 'regex-cheat__sec' },
      h('div', { className: 'regex-cheat__sec-title' }, section.group),
    );
    section.items.forEach(([symbol, description]) => {
      block.appendChild(
        h('div', { className: 'regex-cheat__row' },
          h('code', null, symbol),
          h('span', null, description),
        ),
      );
    });
    wrap.appendChild(block);
  });
  return wrap;
}

function textControlValue(event: Event): string | null {
  const target = event.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value;
  }
  return null;
}

export function regexPage(): HTMLDivElement {
  state = loadState();

  const fullPage = h('div', { className: 'page-regex' });
  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'LAB DE REGEX'),
      ),
      h('h1', { className: 'page-header__title' }, '✱ Lab de Regex'),
      h('p', { className: 'page-header__description' },
        'Tester de expressões regulares JavaScript com ',
        h('span', { className: 'u-text-cyan' }, 'highlight'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'grupos nomeados'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'replace preview'),
        ' e cheatsheet completa.',
      ),
    ),
  );

  patternInput = h('input', {
    className: 'input',
    type: 'text',
    value: state.pattern,
    placeholder: 'padrão regex…',
    spellcheck: false,
    oninput: debounce((event: Event) => {
      const value = textControlValue(event);
      if (value === null) return;
      state.pattern = value;
      persist();
      render();
    }, 120),
  });
  flagsInput = h('input', {
    className: 'input',
    type: 'text',
    value: state.flags,
    maxlength: '6',
    placeholder: 'g i m s u y',
    spellcheck: false,
    oninput: debounce((event: Event) => {
      const value = textControlValue(event);
      if (value === null) return;
      state.flags = value;
      persist();
      render();
    }, 120),
  });
  textInput = h('textarea', {
    className: 'input',
    rows: 5,
    value: state.text,
    placeholder: 'texto pra buscar…',
    spellcheck: false,
    oninput: debounce((event: Event) => {
      const value = textControlValue(event);
      if (value === null) return;
      state.text = value;
      persist();
      render();
    }, 120),
  });
  replaceInput = h('input', {
    className: 'input',
    type: 'text',
    value: state.replace,
    placeholder: 'replacement (use $1, $2, $& …)',
    spellcheck: false,
    oninput: debounce((event: Event) => {
      const value = textControlValue(event);
      if (value === null) return;
      state.replace = value;
      persist();
      render();
    }, 120),
  });

  const examplesBar = h('div', { className: 'regex-examples' },
    h('span', { className: 'u-text-muted', style: { fontSize: '11px', marginRight: '6px' } }, 'Exemplos:'),
    ...EXAMPLES.map((example) => h('button', {
      className: 'chip',
      onclick: () => {
        state.pattern = example.pattern;
        state.flags = example.flags;
        state.text = example.text;
        if (patternInput) patternInput.value = example.pattern;
        if (flagsInput) flagsInput.value = example.flags;
        if (textInput) textInput.value = example.text;
        persist();
        render();
      },
    }, example.label)),
  );

  const inputCard = h('div', { className: 'regex-input-card' },
    h('div', { className: 'regex-pattern-row' },
      h('label', null,
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'PADRÃO'),
        patternInput,
      ),
      h('label', { style: { width: '90px', flex: '0 0 auto' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'FLAGS'),
        flagsInput,
      ),
    ),
    h('label', null,
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'TEXTO'),
      textInput,
    ),
    h('label', null,
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'SUBSTITUIÇÃO (replace)'),
      replaceInput,
    ),
    examplesBar,
  );

  resultArea = h('div', { className: 'regex-result' });
  const main = h('div', { className: 'regex-main' },
    h('div', { className: 'regex-left' }, inputCard, resultArea),
    renderCheatsheet(),
  );

  fullPage.appendChild(main);
  render();
  return fullPage;
}
