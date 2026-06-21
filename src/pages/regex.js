/**
 * Página /regex — Lab de Regex (Fase 10).
 *
 * - Input: padrão + flags + texto + replace
 * - Output: matches destacados, count, grupos (numerados e nomeados)
 * - Cheatsheet completa
 * - Exemplos prontos
 */

import '../styles/regex.css';
import { h, cx, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';

const STORAGE_KEY = 'regex:state';

const EXAMPLES = [
  { label: 'Email', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g', text: 'envie para alice@baluarte.io ou bob+work@example.com' },
  { label: 'URL', pattern: 'https?://[\\w./?=&-]+', flags: 'gi', text: 'site oficial https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte e http://baluarte.test' },
  { label: 'CPF', pattern: '\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}', flags: 'g', text: '123.456.789-01 e 987.654.321-99' },
  { label: 'Telefone BR', pattern: '\\(?\\d{2}\\)?[\\s-]?9?\\d{4}-?\\d{4}', flags: 'g', text: '(11) 99999-1234, 11 9 99991234, 4321-1234' },
  { label: 'Data DD/MM/AAAA', pattern: '(\\d{2})/(\\d{2})/(\\d{4})', flags: 'g', text: 'nascimento: 25/12/2026 · agendado para 01/01/2027' },
  { label: 'Hex color', pattern: '#([0-9a-f]{3}){1,2}\\b', flags: 'gi', text: 'cores: #00f0ff #FF0 #ff00aa #abcdef' },
  { label: 'Palavra repetida', pattern: '\\b(\\w+)\\b.*?\\b\\1\\b', flags: 'gi', text: 'o cão correu o cão correu rápido' },
  { label: 'Nomeado: ano/mês', pattern: '(?<ano>\\d{4})-(?<mes>\\d{2})-(?<dia>\\d{2})', flags: 'g', text: 'data ISO: 2026-05-15 e 2027-01-01' },
  { label: 'Lookahead', pattern: '\\d+(?= reais)', flags: 'g', text: 'paguei 50 reais por 3 livros e 25 reais por 1 caderno' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g', text: 'servidor 192.168.0.1 ou 10.0.0.255 ou 8.8.8.8' }
];

const CHEATSHEET = [
  { group: 'Âncoras', items: [
    ['^', 'início da linha/string'],
    ['$', 'fim'],
    ['\\b', 'fronteira de palavra'],
    ['\\B', 'não-fronteira']
  ]},
  { group: 'Classes', items: [
    ['\\d', 'dígito [0-9]'],
    ['\\D', 'não-dígito'],
    ['\\w', 'word char [A-Za-z0-9_]'],
    ['\\W', 'não-word'],
    ['\\s', 'whitespace'],
    ['\\S', 'não-whitespace'],
    ['.', 'qualquer (exceto \\n)']
  ]},
  { group: 'Quantificadores', items: [
    ['*', '0 ou +'],
    ['+', '1 ou +'],
    ['?', '0 ou 1'],
    ['{n}', 'exatamente n'],
    ['{n,}', 'n ou +'],
    ['{n,m}', 'entre n e m'],
    ['*?', 'lazy (mín. possível)']
  ]},
  { group: 'Grupos', items: [
    ['(abc)', 'grupo de captura'],
    ['(?:abc)', 'sem captura'],
    ['(?<n>abc)', 'nomeado'],
    ['\\1', 'backreference (1º grupo)'],
    ['(a|b)', 'alternativa']
  ]},
  { group: 'Lookahead/behind', items: [
    ['(?=abc)', 'lookahead positivo'],
    ['(?!abc)', 'lookahead negativo'],
    ['(?<=abc)', 'lookbehind positivo'],
    ['(?<!abc)', 'lookbehind negativo']
  ]},
  { group: 'Flags', items: [
    ['g', 'global (todas matches)'],
    ['i', 'case-insensitive'],
    ['m', 'multiline'],
    ['s', 'dotall (. inclui \\n)'],
    ['u', 'unicode'],
    ['y', 'sticky']
  ]}
];

let state = null;
let patternInput, flagsInput, textInput, replaceInput;
let resultArea;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+',
    flags: 'g',
    text: 'envie para alice@baluarte.io ou bob+work@example.com',
    replace: '[$&]'
  };
}
function persist() { storage.set(STORAGE_KEY, state); }

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function render() {
  if (!resultArea) return;
  setStatus('regex', { padrao: state.pattern, flags: state.flags });
  empty(resultArea);

  if (!state.pattern) {
    resultArea.appendChild(h('div', { className: 'u-text-muted' }, 'Insira um padrão regex.'));
    return;
  }

  let re;
  try {
    re = new RegExp(state.pattern, state.flags);
  } catch (e) {
    resultArea.appendChild(h('div', { className: 'regex-error' }, '⚠ ' + e.message));
    return;
  }

  /* Highlight do texto */
  const text = state.text;
  let matches = [];
  if (state.flags.includes('g')) {
    matches = [...text.matchAll(re)];
  } else {
    const m = text.match(re);
    if (m) matches = [m];
  }

  let highlighted = '';
  let lastIdx = 0;
  matches.forEach((m, i) => {
    const start = m.index;
    const end = start + m[0].length;
    highlighted += escapeHtml(text.slice(lastIdx, start));
    highlighted += `<mark class="regex-match" data-i="${i}" title="match #${i + 1}">${escapeHtml(m[0])}</mark>`;
    lastIdx = end;
  });
  highlighted += escapeHtml(text.slice(lastIdx));

  /* Replace preview */
  let replaceResult = '';
  try {
    replaceResult = text.replace(re, state.replace || '');
  } catch (e) {
    replaceResult = '(erro: ' + e.message + ')';
  }

  /* Render */
  resultArea.appendChild(
    h('div', { className: 'regex-meta' },
      h('span', { className: 'badge badge--cyan' }, `${matches.length} matches`),
      h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } },
        `/${state.pattern}/${state.flags}`)
    )
  );

  const highlightDiv = h('div', { className: 'regex-highlight u-mono', html: highlighted || '(sem matches)' });
  resultArea.appendChild(
    h('div', { className: 'regex-block' },
      h('div', { className: 'regex-block__label' }, '◉ Texto com matches'),
      highlightDiv
    )
  );

  if (matches.length) {
    const list = h('div', { className: 'regex-matches' });
    matches.forEach((m, i) => {
      const card = h('div', { className: 'regex-match-card' },
        h('div', { className: 'regex-match-card__head' },
          h('strong', null, `#${i + 1}`),
          h('span', { className: 'u-text-muted u-mono' }, ` @${m.index}`)
        ),
        h('div', { className: 'regex-match-card__value u-mono' }, m[0])
      );
      /* Grupos numerados */
      for (let g = 1; g < m.length; g++) {
        if (m[g] !== undefined) {
          card.appendChild(
            h('div', { className: 'regex-group' },
              h('span', { className: 'regex-group__key' }, `[${g}]`),
              h('code', null, m[g])
            )
          );
        }
      }
      /* Grupos nomeados */
      if (m.groups) {
        Object.entries(m.groups).forEach(([name, val]) => {
          if (val !== undefined) {
            card.appendChild(
              h('div', { className: 'regex-group regex-group--named' },
                h('span', { className: 'regex-group__key' }, name),
                h('code', null, val)
              )
            );
          }
        });
      }
      list.appendChild(card);
    });
    resultArea.appendChild(
      h('div', { className: 'regex-block' },
        h('div', { className: 'regex-block__label' }, `⌖ Matches & grupos (${matches.length})`),
        list
      )
    );
  }

  resultArea.appendChild(
    h('div', { className: 'regex-block' },
      h('div', { className: 'regex-block__label' }, '⇄ Replace preview'),
      h('div', { className: 'regex-replace u-mono' }, replaceResult)
    )
  );
}

function renderCheatsheet() {
  const wrap = h('div', { className: 'regex-cheat' });
  wrap.appendChild(h('h3', { className: 'regex-cheat__title' }, '📖 Cheatsheet'));
  CHEATSHEET.forEach((sec) => {
    const block = h('div', { className: 'regex-cheat__sec' },
      h('div', { className: 'regex-cheat__sec-title' }, sec.group)
    );
    sec.items.forEach(([sym, desc]) => {
      block.appendChild(
        h('div', { className: 'regex-cheat__row' },
          h('code', null, sym),
          h('span', null, desc)
        )
      );
    });
    wrap.appendChild(block);
  });
  return wrap;
}

export function regexPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-regex' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'LAB DE REGEX')
      ),
      h('h1', { className: 'page-header__title' }, '✱ Lab de Regex'),
      h('p', { className: 'page-header__description' },
        'Tester de expressões regulares JavaScript com ',
        h('span', { className: 'u-text-cyan' }, 'highlight'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'grupos nomeados'),
        ', ',
        h('span', { className: 'u-text-cyan' }, 'replace preview'),
        ' e cheatsheet completa.'
      )
    )
  );

  patternInput = h('input', {
    className: 'input', type: 'text', value: state.pattern,
    placeholder: 'padrão regex…',
    spellcheck: 'false',
    oninput: debounce((e) => { state.pattern = e.target.value; persist(); render(); }, 120)
  });
  flagsInput = h('input', {
    className: 'input', type: 'text', value: state.flags, maxlength: '6',
    placeholder: 'g i m s u y',
    spellcheck: 'false',
    oninput: debounce((e) => { state.flags = e.target.value; persist(); render(); }, 120)
  });
  textInput = h('textarea', {
    className: 'input', rows: 5, value: state.text,
    placeholder: 'texto pra buscar…',
    spellcheck: 'false',
    oninput: debounce((e) => { state.text = e.target.value; persist(); render(); }, 120)
  });
  replaceInput = h('input', {
    className: 'input', type: 'text', value: state.replace,
    placeholder: 'replacement (use $1, $2, $& …)',
    spellcheck: 'false',
    oninput: debounce((e) => { state.replace = e.target.value; persist(); render(); }, 120)
  });

  const examplesBar = h('div', { className: 'regex-examples' },
    h('span', { className: 'u-text-muted', style: { fontSize: '11px', marginRight: '6px' } }, 'Exemplos:'),
    ...EXAMPLES.map((ex) =>
      h('button', {
        className: 'chip',
        onclick: () => {
          state.pattern = ex.pattern;
          state.flags = ex.flags;
          state.text = ex.text;
          patternInput.value = ex.pattern;
          flagsInput.value = ex.flags;
          textInput.value = ex.text;
          persist();
          render();
        }
      }, ex.label)
    )
  );

  const inputCard = h('div', { className: 'regex-input-card' },
    h('div', { className: 'regex-pattern-row' },
      h('label', null,
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'PADRÃO'),
        patternInput
      ),
      h('label', { style: { width: '90px', flex: '0 0 auto' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'FLAGS'),
        flagsInput
      )
    ),
    h('label', null,
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'TEXTO'),
      textInput
    ),
    h('label', null,
      h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'SUBSTITUIÇÃO (replace)'),
      replaceInput
    ),
    examplesBar
  );

  resultArea = h('div', { className: 'regex-result' });

  const main = h('div', { className: 'regex-main' },
    h('div', { className: 'regex-left' }, inputCard, resultArea),
    renderCheatsheet()
  );

  fullPage.appendChild(main);
  render();

  return fullPage;
}
