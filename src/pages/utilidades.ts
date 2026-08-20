/**
 * Página /utilidades — Caixa de Ferramentas.
 *
 * Mini-ferramentas técnicas, JS puro, sem dependências externas e executadas
 * localmente no navegador.
 */

import '../styles/utilidades.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast';
import { mdToHtml } from '../utils/markdown';

function copy(text: string): void {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => toast('Copiado.', { type: 'success' }))
    .catch(() => toast('Não consegui copiar.', { type: 'warning' }));
}

function section(title: string, icon: string, body: Node): HTMLDivElement {
  return h('div', { className: 'card util-card' },
    h('h2', { className: 'util-card__title' }, `${icon} ${title}`),
    body,
  );
}

function toolSenha(): HTMLDivElement {
  const output = h('input', {
    className: 'input util-out u-mono',
    readonly: true,
    placeholder: 'Sua senha aparece aqui',
  });
  const lengthLabel = h('span', { className: 'u-text-cyan u-mono' }, '16');
  const lengthInput = h('input', {
    type: 'range',
    min: '6',
    max: '48',
    value: '16',
    'aria-label': 'Tamanho da senha em caracteres',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (input instanceof HTMLInputElement) lengthLabel.textContent = input.value;
    },
  });
  const options = {
    lower: h('input', { type: 'checkbox', checked: true }),
    upper: h('input', { type: 'checkbox', checked: true }),
    num: h('input', { type: 'checkbox', checked: true }),
    sym: h('input', { type: 'checkbox', checked: true }),
  };
  const strength = h('div', { className: 'util-strength u-text-muted' }, '');

  function generate(): void {
    let pool = '';
    if (options.lower.checked) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (options.upper.checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.num.checked) pool += '0123456789';
    if (options.sym.checked) pool += '!@#$%^&*()-_=+[]{};:,.<>?';
    if (!pool) {
      toast('Selecione ao menos um tipo de caractere.', { type: 'warning' });
      return;
    }
    const length = Number.parseInt(lengthInput.value, 10);
    const randomValues = new Uint32Array(length);
    crypto.getRandomValues(randomValues);
    let password = '';
    for (let index = 0; index < length; index += 1) {
      password += pool[randomValues[index] % pool.length];
    }
    output.value = password;
    const variety = [options.lower, options.upper, options.num, options.sym]
      .filter((option) => option.checked).length;
    const score = Math.min(100, Math.round((length / 24) * 50 + variety * 12.5));
    strength.textContent = `Força: ${score >= 80 ? 'forte' : score >= 50 ? 'média' : 'fraca'} (${score}/100)`;
    strength.className = `util-strength ${score >= 80 ? 'u-text-success' : score >= 50 ? 'u-text-warning' : 'u-text-danger'}`;
  }

  const checks = h('div', { className: 'util-checks' },
    h('label', null, options.lower, ' a-z'),
    h('label', null, options.upper, ' A-Z'),
    h('label', null, options.num, ' 0-9'),
    h('label', null, options.sym, ' !@#'),
  );
  generate();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Tamanho'), lengthInput, lengthLabel),
    checks,
    h('div', { className: 'util-row' }, output,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(output.value) }, '⧉')),
    strength,
    h('button', { className: 'btn btn--primary btn--sm', onclick: generate }, '↻ Gerar senha'),
  );
}

function toolUuid(): HTMLDivElement {
  const output = h('textarea', {
    className: 'input util-out u-mono',
    rows: 4,
    readonly: true,
    'aria-label': 'UUIDs gerados',
  });
  const quantity = h('input', {
    className: 'input util-qty',
    type: 'number',
    min: '1',
    max: '100',
    value: '5',
    'aria-label': 'Quantidade de UUIDs',
  });
  function generate(): void {
    const count = Math.max(1, Math.min(100, Number.parseInt(quantity.value, 10) || 1));
    const ids: string[] = [];
    for (let index = 0; index < count; index += 1) {
      ids.push(crypto.randomUUID
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
          const random = (Math.random() * 16) | 0;
          return (character === 'x' ? random : (random & 0x3) | 0x8).toString(16);
        }));
    }
    output.value = ids.join('\n');
  }
  generate();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Quantidade'), quantity,
      h('button', { className: 'btn btn--primary btn--sm', onclick: generate }, '↻ Gerar'),
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(output.value) }, '⧉ Copiar')),
    output,
  );
}

function toolContador(): HTMLDivElement {
  const stats = h('div', { className: 'util-stats' });
  const textarea = h('textarea', {
    className: 'input util-textarea',
    rows: 5,
    placeholder: 'Cole ou digite o texto...',
    oninput: update,
  });
  function update(): void {
    const text = textarea.value;
    const chars = text.length;
    const noSpace = text.replace(/\s/g, '').length;
    const words = (text.trim().match(/\S+/g) || []).length;
    const lines = text ? text.split(/\n/).length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    empty(stats);
    const values: readonly [string, string | number][] = [
      ['Caracteres', chars],
      ['Sem espaços', noSpace],
      ['Palavras', words],
      ['Linhas', lines],
      ['Leitura', `~${minutes} min`],
    ];
    values.forEach(([label, value]) => stats.appendChild(
      h('div', { className: 'util-stat' },
        h('div', { className: 'util-stat__v u-text-cyan' }, String(value)),
        h('div', { className: 'util-stat__k u-text-muted' }, label),
      ),
    ));
  }
  update();
  return h('div', { className: 'util-body' }, textarea, stats);
}

function toolTimestamp(): HTMLDivElement {
  const timestampInput = h('input', {
    className: 'input u-mono',
    type: 'text',
    placeholder: 'Unix (s ou ms), ex: 1716661200',
  });
  const timestampOutput = h('div', { className: 'util-result u-mono' }, '—');
  const dateInput = h('input', {
    className: 'input',
    type: 'datetime-local',
    'aria-label': 'Data e hora para converter em Unix',
  });
  const dateOutput = h('div', { className: 'util-result u-mono' }, '—');
  const updateTimestamp = (): void => {
    const raw = timestampInput.value.trim();
    if (!/^\d+$/.test(raw)) {
      timestampOutput.textContent = '—';
      return;
    }
    let milliseconds = Number.parseInt(raw, 10);
    if (raw.length <= 10) milliseconds *= 1000;
    const date = new Date(milliseconds);
    timestampOutput.textContent = Number.isNaN(date.getTime())
      ? 'inválido'
      : `${date.toLocaleString('pt-BR')} · ${date.toISOString()}`;
  };
  timestampInput.oninput = updateTimestamp;
  dateInput.oninput = () => {
    if (!dateInput.value) {
      dateOutput.textContent = '—';
      return;
    }
    const milliseconds = new Date(dateInput.value).getTime();
    dateOutput.textContent = `${Math.floor(milliseconds / 1000)} s · ${milliseconds} ms`;
  };
  const nowButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      timestampInput.value = String(Math.floor(Date.now() / 1000));
      updateTimestamp();
    },
  }, 'Agora');
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Unix → Data'),
      h('div', { className: 'util-row' }, timestampInput, nowButton), timestampOutput),
    h('div', { className: 'util-field' }, h('span', null, 'Data → Unix'), dateInput, dateOutput),
  );
}

function toolPorcentagem(): HTMLDivElement {
  const numberInput = (placeholder: string): HTMLInputElement => h('input', {
    className: 'input util-qty', type: 'number', placeholder,
  });
  const first = numberInput('X');
  const firstBase = numberInput('Y');
  const firstResult = h('span', { className: 'util-result u-text-cyan' }, '—');
  const second = numberInput('X');
  const secondBase = numberInput('Y');
  const secondResult = h('span', { className: 'util-result u-text-cyan' }, '—');
  const from = numberInput('de');
  const to = numberInput('para');
  const changeResult = h('span', { className: 'util-result u-text-cyan' }, '—');
  const format = (value: number): number | string => (
    Number.isFinite(value) ? Math.round(value * 100) / 100 : '—'
  );
  const updateFirst = (): void => {
    firstResult.textContent = String(format((Number(first.value) / 100) * Number(firstBase.value)));
  };
  const updateSecond = (): void => {
    secondResult.textContent = `${format((Number(second.value) / Number(secondBase.value)) * 100)} %`;
  };
  const updateChange = (): void => {
    changeResult.textContent = `${format(((Number(to.value) - Number(from.value)) / Math.abs(Number(from.value))) * 100)} %`;
  };
  first.oninput = updateFirst;
  firstBase.oninput = updateFirst;
  second.oninput = updateSecond;
  secondBase.oninput = updateSecond;
  from.oninput = updateChange;
  to.oninput = updateChange;
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-pct' }, first, h('span', null, '% de'), firstBase, h('span', null, '='), firstResult),
    h('div', { className: 'util-pct' }, second, h('span', null, 'é quantos % de'), secondBase, h('span', null, '='), secondResult),
    h('div', { className: 'util-pct' }, h('span', null, 'variação de'), from, h('span', null, 'para'), to, h('span', null, '='), changeResult),
  );
}

function toolDiff(): HTMLDivElement {
  const first = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Texto A' });
  const second = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Texto B' });
  const output = h('div', { className: 'util-diff' });
  function run(): void {
    const firstLines = first.value.split('\n');
    const secondLines = second.value.split('\n');
    const rows = firstLines.length;
    const columns = secondLines.length;
    const dp: number[][] = Array.from({ length: rows + 1 }, () => new Array<number>(columns + 1).fill(0));
    for (let row = rows - 1; row >= 0; row -= 1) {
      for (let column = columns - 1; column >= 0; column -= 1) {
        dp[row][column] = firstLines[row] === secondLines[column]
          ? dp[row + 1][column + 1] + 1
          : Math.max(dp[row + 1][column], dp[row][column + 1]);
      }
    }
    empty(output);
    const add = (className: string, text: string): void => {
      output.appendChild(h('div', { className: `util-diff__line ${className}` }, text || ' '));
    };
    let row = 0;
    let column = 0;
    while (row < rows && column < columns) {
      if (firstLines[row] === secondLines[column]) {
        add('eq', `  ${firstLines[row]}`);
        row += 1;
        column += 1;
      } else if (dp[row + 1][column] >= dp[row][column + 1]) {
        add('del', `- ${firstLines[row]}`);
        row += 1;
      } else {
        add('ins', `+ ${secondLines[column]}`);
        column += 1;
      }
    }
    while (row < rows) {
      add('del', `- ${firstLines[row]}`);
      row += 1;
    }
    while (column < columns) {
      add('ins', `+ ${secondLines[column]}`);
      column += 1;
    }
    if (!output.children.length) add('eq', '(idêntico ou vazio)');
  }
  first.oninput = run;
  second.oninput = run;
  run();
  return h('div', { className: 'util-body' }, h('div', { className: 'util-diff-inputs' }, first, second), output);
}

function toolLorem(): HTMLDivElement {
  const words = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et '
    + 'dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo '
    + 'consequat duis aute irure voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat '
    + 'non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');
  const output = h('textarea', {
    className: 'input util-out', rows: 6, readonly: true, 'aria-label': 'Texto Lorem Ipsum gerado',
  });
  const quantity = h('input', {
    className: 'input util-qty', type: 'number', min: '1', max: '20', value: '3',
    'aria-label': 'Quantidade de parágrafos',
  });
  const sentence = (): string => {
    const length = 6 + Math.floor(Math.random() * 10);
    const selected: string[] = [];
    for (let index = 0; index < length; index += 1) {
      selected.push(words[Math.floor(Math.random() * words.length)]);
    }
    const text = selected.join(' ');
    return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  };
  function generate(): void {
    const paragraphs = Math.max(1, Math.min(20, Number.parseInt(quantity.value, 10) || 1));
    const outputParagraphs: string[] = [];
    for (let index = 0; index < paragraphs; index += 1) {
      const sentences = 3 + Math.floor(Math.random() * 4);
      const paragraph: string[] = [];
      for (let sentenceIndex = 0; sentenceIndex < sentences; sentenceIndex += 1) paragraph.push(sentence());
      outputParagraphs.push(paragraph.join(' '));
    }
    output.value = outputParagraphs.join('\n\n');
  }
  generate();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Parágrafos'), quantity,
      h('button', { className: 'btn btn--primary btn--sm', onclick: generate }, '↻ Gerar'),
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(output.value) }, '⧉')),
    output,
  );
}

function porExtenso(input: number): string {
  if (!Number.isFinite(input)) return '—';
  let number = Math.trunc(input);
  if (number === 0) return 'zero';
  const negative = number < 0;
  number = Math.abs(number);
  if (number > 999999999999) return 'número muito grande';
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez',
    'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const threeDigits = (value: number): string => {
    if (value === 0) return '';
    if (value === 100) return 'cem';
    const parts: string[] = [];
    const hundredsPart = Math.floor(value / 100);
    const remainder = value % 100;
    if (hundredsPart) parts.push(hundreds[hundredsPart]);
    if (remainder < 20 && remainder > 0) parts.push(units[remainder]);
    else if (remainder >= 20) {
      const tensPart = Math.floor(remainder / 10);
      const unitsPart = remainder % 10;
      parts.push(unitsPart ? `${tens[tensPart]} e ${units[unitsPart]}` : tens[tensPart]);
    }
    return parts.join(' e ');
  };
  const groups: number[] = [];
  let remaining = number;
  while (remaining > 0) {
    groups.push(remaining % 1000);
    remaining = Math.floor(remaining / 1000);
  }
  const groupNames: readonly [string, string][] = [
    ['', ''],
    ['mil', 'mil'],
    ['milhão', 'milhões'],
    ['bilhão', 'bilhões'],
  ];
  const parts: string[] = [];
  for (let group = groups.length - 1; group >= 0; group -= 1) {
    const value = groups[group];
    if (!value) continue;
    if (group === 1) parts.push(value === 1 ? 'mil' : `${threeDigits(value)} mil`);
    else if (group === 0) parts.push(threeDigits(value));
    else parts.push(`${threeDigits(value)} ${value === 1 ? groupNames[group][0] : groupNames[group][1]}`);
  }
  return `${negative ? 'menos ' : ''}${parts.join(' e ')}`.replace(/\s+/g, ' ').trim();
}

function toolExtenso(): HTMLDivElement {
  const input = h('input', { className: 'input', type: 'number', placeholder: 'Digite um número inteiro' });
  const output = h('div', { className: 'util-result' }, '—');
  input.oninput = () => {
    output.textContent = input.value.trim() === '' ? '—' : porExtenso(Number.parseInt(input.value, 10));
  };
  return h('div', { className: 'util-body' }, input, output);
}

function toolImgBase64(): HTMLDivElement {
  const output = h('textarea', {
    className: 'input util-out u-mono', rows: 4, readonly: true,
    placeholder: 'data:image/...;base64,...',
  });
  const preview = h('div', { className: 'util-imgprev' });
  const fileInput = h('input', {
    className: 'input', type: 'file', accept: 'image/*',
    'aria-label': 'Escolher imagem para converter em data URI',
    onchange: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? '');
        output.value = result;
        empty(preview);
        preview.appendChild(h('img', { src: result, alt: 'preview' }));
      };
      reader.readAsDataURL(file);
    },
  });
  return h('div', { className: 'util-body' }, fileInput, preview,
    h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(output.value) }, '⧉ Copiar data URI'),
    output,
  );
}

function toolSorteador(): HTMLDivElement {
  const textarea = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Um item por linha...' });
  const result = h('div', { className: 'util-result u-text-cyan' }, '—');
  const items = (): string[] => textarea.value.split('\n').map((item) => item.trim()).filter(Boolean);
  return h('div', { className: 'util-body' }, textarea,
    h('div', { className: 'util-row' },
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => {
          const values = items();
          result.textContent = values.length ? `🎲 ${values[Math.floor(Math.random() * values.length)]}` : 'Adicione itens.';
        },
      }, '🎲 Sortear 1'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => {
          const values = items();
          for (let index = values.length - 1; index > 0; index -= 1) {
            const target = Math.floor(Math.random() * (index + 1));
            [values[index], values[target]] = [values[target], values[index]];
          }
          textarea.value = values.join('\n');
        },
      }, '🔀 Embaralhar'),
    ),
    result,
  );
}

function toolCaso(): HTMLDivElement {
  const input = h('textarea', { className: 'input util-textarea', rows: 2, placeholder: 'Digite um texto...' });
  const output = h('div', { className: 'util-body' });
  function row(label: string, value: string): HTMLDivElement {
    const valueInput = h('input', {
      className: 'input util-out u-mono', readonly: true, value, 'aria-label': label,
    });
    return h('div', { className: 'util-row' }, h('span', null, label), valueInput,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(value) }, '⧉'));
  }
  const titleCase = (value: string): string => value.toLowerCase().replace(/\b\p{L}/gu, (character) => character.toUpperCase());
  const camel = (value: string): string => {
    const words = value.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zA-Z0-9]+/g) || [];
    return words.map((word, index) => index === 0
      ? word.toLowerCase()
      : `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`).join('');
  };
  const joinCase = (value: string, separator: string): string => {
    const words = value.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zA-Z0-9]+/g) || [];
    return words.map((word) => word.toLowerCase()).join(separator);
  };
  function update(): void {
    const text = input.value;
    empty(output);
    output.append(
      row('MAIÚSCULAS', text.toUpperCase()),
      row('minúsculas', text.toLowerCase()),
      row('Título', titleCase(text)),
      row('camelCase', camel(text)),
      row('snake_case', joinCase(text, '_')),
      row('kebab-case', joinCase(text, '-')),
    );
  }
  input.oninput = update;
  update();
  return h('div', { className: 'util-body' }, input, output);
}

function toolSlug(): HTMLDivElement {
  const input = h('input', { className: 'input', type: 'text', placeholder: 'Título do artigo: Olá, Mundo!' });
  const output = h('input', { className: 'input util-out u-mono', readonly: true, 'aria-label': 'Slug gerado' });
  const slugify = (value: string): string => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  input.oninput = () => { output.value = slugify(input.value); };
  return h('div', { className: 'util-body' }, input,
    h('div', { className: 'util-row' }, output,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(output.value) }, '⧉')));
}

function toolAscii(): HTMLDivElement {
  const lookup = h('input', { className: 'input', type: 'text', maxlength: '1', placeholder: 'Digite 1 caractere' });
  const lookupOutput = h('div', { className: 'util-result u-mono' }, '—');
  lookup.oninput = () => {
    const character = lookup.value;
    if (!character) {
      lookupOutput.textContent = '—';
      return;
    }
    const codePoint = character.codePointAt(0) ?? 0;
    lookupOutput.textContent = `'${character}' → dec ${codePoint} · hex 0x${codePoint.toString(16)} · &#${codePoint};`;
  };
  const grid = h('div', { className: 'util-ascii' });
  for (let code = 32; code <= 126; code += 1) {
    grid.appendChild(h('button', {
      className: 'util-ascii__cell',
      title: `dec ${code} · hex ${code.toString(16)}`,
      onclick: () => copy(String.fromCharCode(code)),
    },
      h('span', { className: 'util-ascii__ch' }, String.fromCharCode(code)),
      h('span', { className: 'util-ascii__code u-text-muted' }, String(code)),
    ));
  }
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Caractere'), lookup, lookupOutput), grid);
}

function toolRomanos(): HTMLDivElement {
  const romanMap: readonly [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  const toRoman = (input: number): string => {
    let number = input;
    let result = '';
    for (const [value, symbol] of romanMap) {
      while (number >= value) {
        result += symbol;
        number -= value;
      }
    }
    return result;
  };
  const fromRoman = (input: string): number => {
    const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    const source = input.toUpperCase();
    let result = 0;
    for (let index = 0; index < source.length; index += 1) {
      const current = values[source[index]];
      if (current === undefined) return Number.NaN;
      const next = values[source[index + 1]] ?? 0;
      result += next > current ? -current : current;
    }
    return result;
  };
  const arabic = h('input', { className: 'input', type: 'number', min: '1', max: '3999', placeholder: 'Arábico (1–3999)' });
  const arabicOutput = h('div', { className: 'util-result u-mono' }, '—');
  arabic.oninput = () => {
    const number = Number.parseInt(arabic.value, 10);
    arabicOutput.textContent = number >= 1 && number <= 3999 ? toRoman(number) : '—';
  };
  const roman = h('input', { className: 'input u-mono', type: 'text', placeholder: 'Romano (ex: MMXXIV)' });
  const romanOutput = h('div', { className: 'util-result u-mono' }, '—');
  roman.oninput = () => {
    const source = roman.value.trim();
    const number = fromRoman(source);
    romanOutput.textContent = source && !Number.isNaN(number) ? String(number) : '—';
  };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Arábico → Romano'), arabic, arabicOutput),
    h('div', { className: 'util-field' }, h('span', null, 'Romano → Arábico'), roman, romanOutput));
}

function toolDatas(): HTMLDivElement {
  const firstDate = h('input', { className: 'input', type: 'date', 'aria-label': 'Data inicial' });
  const secondDate = h('input', { className: 'input', type: 'date', 'aria-label': 'Data final' });
  const difference = h('div', { className: 'util-result u-text-cyan' }, '—');
  const calculateDifference = (): void => {
    if (!firstDate.value || !secondDate.value) {
      difference.textContent = '—';
      return;
    }
    const milliseconds = new Date(secondDate.value).getTime() - new Date(firstDate.value).getTime();
    const days = Math.round(milliseconds / 86400000);
    difference.textContent = `${Math.abs(days)} dia(s)${days < 0 ? ' (d2 antes de d1)' : ''}`;
  };
  firstDate.oninput = calculateDifference;
  secondDate.oninput = calculateDifference;
  const baseDate = h('input', { className: 'input', type: 'date', 'aria-label': 'Data de partida' });
  const daysInput = h('input', { className: 'input util-qty', type: 'number', value: '30', placeholder: 'dias' });
  const addedDate = h('div', { className: 'util-result u-text-cyan' }, '—');
  const calculateAdded = (): void => {
    if (!baseDate.value) {
      addedDate.textContent = '—';
      return;
    }
    const date = new Date(baseDate.value);
    date.setDate(date.getDate() + (Number.parseInt(daysInput.value, 10) || 0));
    addedDate.textContent = date.toLocaleDateString('pt-BR');
  };
  baseDate.oninput = calculateAdded;
  daysInput.oninput = calculateAdded;
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Diferença entre datas'),
      h('div', { className: 'util-row' }, firstDate, h('span', null, '→'), secondDate), difference),
    h('div', { className: 'util-field' }, h('span', null, 'Somar/subtrair dias'),
      h('div', { className: 'util-row' }, baseDate, h('span', null, '+'), daysInput, h('span', null, 'dias')), addedDate));
}

function toolPxRem(): HTMLDivElement {
  const base = h('input', { className: 'input util-qty', type: 'number', value: '16', 'aria-label': 'Tamanho base em pixels' });
  const pixels = h('input', { className: 'input util-qty', type: 'number', placeholder: 'px' });
  const rem = h('input', { className: 'input util-qty', type: 'number', placeholder: 'rem' });
  const baseValue = (): number => Number.parseFloat(base.value) || 16;
  const updatePixels = (): void => {
    pixels.value = rem.value === '' ? '' : (Number.parseFloat(rem.value) * baseValue()).toString();
  };
  const updateRem = (): void => {
    rem.value = pixels.value === '' ? '' : (Number.parseFloat(pixels.value) / baseValue()).toString();
  };
  pixels.oninput = updateRem;
  rem.oninput = updatePixels;
  base.oninput = updateRem;
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Base (px)'), base),
    h('div', { className: 'util-row' }, pixels, h('span', null, 'px ='), rem, h('span', null, 'rem')));
}

function toolFusos(): HTMLDivElement {
  const zones: readonly [string, string][] = [
    ['São Paulo', 'America/Sao_Paulo'], ['Nova York', 'America/New_York'],
    ['Los Angeles', 'America/Los_Angeles'], ['Londres', 'Europe/London'],
    ['Lisboa', 'Europe/Lisbon'], ['Paris', 'Europe/Paris'],
    ['Tóquio', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney'],
  ];
  const list = h('div', { className: 'util-stats' });
  function update(): void {
    const now = new Date();
    empty(list);
    zones.forEach(([label, timezone]) => {
      const time = new Intl.DateTimeFormat('pt-BR', {
        timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false,
      }).format(now);
      list.appendChild(h('div', { className: 'util-stat' },
        h('div', { className: 'util-stat__v u-text-cyan' }, time),
        h('div', { className: 'util-stat__k u-text-muted' }, label)));
    });
  }
  update();
  return h('div', { className: 'util-body' },
    h('button', { className: 'btn btn--ghost btn--sm', onclick: update }, '↻ Atualizar'), list);
}

function toolMarkdown(): HTMLDivElement {
  const textarea = h('textarea', {
    className: 'input util-textarea', rows: 6,
    placeholder: '# Título\n\nTexto **negrito**, *itálico*, `código` e [link](https://...)\n\n- item 1\n- item 2',
  });
  const preview = h('div', { className: 'util-mdprev' });
  const source = h('textarea', { className: 'input util-out u-mono', rows: 4, readonly: true, 'aria-label': 'HTML gerado' });
  function update(): void {
    const html = mdToHtml(textarea.value);
    preview.innerHTML = html;
    source.value = html;
  }
  textarea.oninput = update;
  update();
  return h('div', { className: 'util-body' }, textarea,
    h('div', { className: 'util-field' }, h('span', null, 'Preview'), preview),
    h('div', { className: 'util-field' }, h('span', null, 'HTML'),
      h('div', { className: 'util-row' }, source,
        h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(source.value) }, '⧉'))));
}

function toolBinario(): HTMLDivElement {
  const text = h('input', { className: 'input', type: 'text', placeholder: 'Texto' });
  const binary = h('input', { className: 'input u-mono', type: 'text', placeholder: 'Binário (8 bits por byte)' });
  text.oninput = () => {
    binary.value = [...new TextEncoder().encode(text.value)]
      .map((value) => value.toString(2).padStart(8, '0')).join(' ');
  };
  binary.oninput = () => {
    try {
      const bytes = binary.value.trim().split(/\s+/).filter(Boolean).map((value) => Number.parseInt(value, 2));
      text.value = new TextDecoder().decode(new Uint8Array(bytes));
    } catch {
      text.value = '—';
    }
  };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Texto → Binário'), text),
    h('div', { className: 'util-field' }, h('span', null, 'Binário → Texto'), binary));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toolJsonCsv(): HTMLDivElement {
  const json = h('textarea', { className: 'input util-textarea u-mono', rows: 5, placeholder: '[{"nome":"Ana","idade":30}]' });
  const csv = h('textarea', { className: 'input util-textarea u-mono', rows: 5, placeholder: 'nome,idade' });
  json.oninput = () => {
    try {
      const parsed: unknown = JSON.parse(json.value);
      if (!Array.isArray(parsed) || !parsed.length || !parsed.every(isRecord)) {
        csv.value = '';
        return;
      }
      const records = parsed;
      const keys = [...new Set(records.flatMap((record) => Object.keys(record)))];
      const escape = (value: unknown): string => {
        const text = value == null ? '' : String(value);
        return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
      };
      csv.value = [keys.join(','), ...records.map((record) => keys.map((key) => escape(record[key])).join(','))].join('\n');
    } catch {
      csv.value = '(JSON inválido — use um array de objetos)';
    }
  };
  csv.oninput = () => {
    try {
      const lines = csv.value.trim().split('\n');
      if (lines.length < 1 || !lines[0]) {
        json.value = '';
        return;
      }
      const keys = lines[0].split(',').map((value) => value.trim());
      const rows: Record<string, string>[] = lines.slice(1).map((line) => {
        const values = line.split(',');
        const record: Record<string, string> = {};
        keys.forEach((key, index) => { record[key] = (values[index] || '').trim(); });
        return record;
      });
      json.value = JSON.stringify(rows, null, 2);
    } catch {
      json.value = '(CSV inválido)';
    }
  };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'JSON → CSV'), json),
    h('div', { className: 'util-field' }, h('span', null, 'CSV → JSON'), csv));
}

function toolRegraTres(): HTMLDivElement {
  const numberInput = (placeholder: string): HTMLInputElement => h('input', {
    className: 'input util-qty', type: 'number', placeholder,
  });
  const first = numberInput('A');
  const second = numberInput('B');
  const third = numberInput('C');
  const result = h('span', { className: 'util-result u-text-cyan' }, '—');
  const calculate = (): void => {
    const firstValue = Number(first.value);
    const secondValue = Number(second.value);
    const thirdValue = Number(third.value);
    result.textContent = firstValue
      ? String(Math.round((secondValue * thirdValue / firstValue) * 1e6) / 1e6)
      : '—';
  };
  first.oninput = calculate;
  second.oninput = calculate;
  third.oninput = calculate;
  return h('div', { className: 'util-body' },
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } }, 'A está para B, assim como C está para X'),
    h('div', { className: 'util-pct' }, first, h('span', null, '↔'), second, h('span', null, ' · '), third, h('span', null, '↔'), result));
}

function toolBytes(): HTMLDivElement {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const value = h('input', { className: 'input util-qty', type: 'number', value: '1024', 'aria-label': 'Quantidade a converter' });
  const unit = h('select', { className: 'input util-qty', 'aria-label': 'Unidade de origem' },
    ...units.map((label, index) => h('option', { value: String(1024 ** index) }, label)));
  const output = h('div', { className: 'util-stats' });
  const update = (): void => {
    const bytes = (Number.parseFloat(value.value) || 0) * Number(unit.value);
    empty(output);
    units.forEach((label, index) => {
      const converted = bytes / (1024 ** index);
      output.appendChild(h('div', { className: 'util-stat' },
        h('div', { className: 'util-stat__v u-text-cyan' }, String(Math.round(converted * 1000) / 1000)),
        h('div', { className: 'util-stat__k u-text-muted' }, label)));
    });
  };
  value.oninput = update;
  unit.onchange = update;
  update();
  return h('div', { className: 'util-body' }, h('div', { className: 'util-row' }, value, unit), output);
}

function toolFreq(): HTMLDivElement {
  const textarea = h('textarea', { className: 'input util-textarea', rows: 4, placeholder: 'Cole um texto...' });
  const output = h('div', { className: 'util-freq' });
  textarea.oninput = () => {
    const words = textarea.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || [];
    const frequency: Record<string, number> = {};
    words.forEach((word) => { frequency[word] = (frequency[word] || 0) + 1; });
    const top = Object.entries(frequency).sort((first, second) => second[1] - first[1]).slice(0, 15);
    empty(output);
    if (!top.length) {
      output.appendChild(h('div', { className: 'u-text-muted' }, '—'));
      return;
    }
    top.forEach(([word, count]) => output.appendChild(h('div', { className: 'util-freq__row' },
      h('span', null, word), h('span', { className: 'u-text-cyan u-mono' }, String(count)))));
  };
  return h('div', { className: 'util-body' }, textarea, output);
}

export function utilidadesPage(): HTMLDivElement {
  const page = h('div', { className: 'page-utilidades' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'UTILIDADES'),
      ),
      h('h1', { className: 'page-header__title' }, '🧰 Caixa de Ferramentas'),
      h('p', { className: 'page-header__description' },
        'Utilidades rápidas do dia a dia — ',
        h('span', { className: 'u-text-cyan' }, '25 ferramentas técnicas'),
        ' (senhas, UUID, texto, datas, fusos, Markdown, binário, JSON↔CSV, bytes…). Tudo no navegador.',
      ),
    ),
  );
  page.appendChild(
    h('div', { className: 'util-grid' },
      section('Gerador de Senhas', '🔑', toolSenha()),
      section('Gerador de UUID', '🆔', toolUuid()),
      section('Contador de Texto', '🔢', toolContador()),
      section('Timestamp ↔ Data', '🕔', toolTimestamp()),
      section('Calculadora de Porcentagem', '％', toolPorcentagem()),
      section('Diff de Texto', '🔀', toolDiff()),
      section('Lorem Ipsum', '📝', toolLorem()),
      section('Número por Extenso', '🔡', toolExtenso()),
      section('Base64 de Imagem', '🖼', toolImgBase64()),
      section('Sorteador / Roleta', '🎲', toolSorteador()),
      section('Conversor de Caso', '🔤', toolCaso()),
      section('Gerador de Slug', '🔗', toolSlug()),
      section('Tabela ASCII', '🔠', toolAscii()),
      section('Números Romanos', 'Ⅻ', toolRomanos()),
      section('Calculadora de Datas', '📅', toolDatas()),
      section('px ↔ rem', '📐', toolPxRem()),
      section('Relógio Mundial', '🌐', toolFusos()),
      section('Markdown → HTML', '📄', toolMarkdown()),
      section('Texto ↔ Binário', '🔟', toolBinario()),
      section('JSON ↔ CSV', '📊', toolJsonCsv()),
      section('Regra de Três', '➗', toolRegraTres()),
      section('Conversor de Bytes', '💾', toolBytes()),
      section('Frequência de Palavras', '📈', toolFreq()),
    ),
  );
  return page;
}
