/**
 * Página /tabela-verdade — Tabela Verdade + Mapa de Karnaugh.
 *
 * A página continua usando o parser lógico V1, com estado persistido, tabela
 * completa, mapa de Karnaugh, formas canônicas e simplificação SOP.
 */

import '../styles/tabela-verdade.css';
import { h, cx, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  compile,
  buildTruthTable,
  astToString,
  toSOP,
  toPOS,
  simplifySOP,
  grayCodeOrder,
} from '../utils/logic-parser.js';
import type {
  CompiledLogic,
  LogicEnvironment,
  TruthTableRow,
} from '../utils/logic-parser.js';

const STORAGE_KEY = 'tabela-verdade:state';

interface TruthTableState {
  expr: string;
  showSubExprs: boolean;
}

interface TruthExample {
  label: string;
  expr: string;
}

const DEFAULT_STATE: TruthTableState = { expr: 'A AND B', showSubExprs: false };

const EXAMPLES: readonly TruthExample[] = [
  { label: 'AND', expr: 'A AND B' },
  { label: 'OR + NOT', expr: '(A OR NOT B)' },
  { label: 'XOR', expr: 'A XOR B' },
  { label: 'Implicação', expr: 'A -> B' },
  { label: 'Bi-implicação', expr: 'A <-> B' },
  { label: 'Maioria 3', expr: '(A·B) + (B·C) + (A·C)' },
  { label: 'Mux 2:1', expr: '(NOT S · A) + (S · B)' },
  { label: 'Half adder (sum)', expr: 'A XOR B' },
  { label: 'Full adder (Cout)', expr: '(A·B) + (C·(A XOR B))' },
  { label: 'Compl. sempre verdade', expr: 'A OR NOT A' },
  { label: 'Distributiva', expr: 'A·(B+C)' },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function loadState(): TruthTableState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY);
  if (!isRecord(saved)) return { ...DEFAULT_STATE };
  return {
    expr: isString(saved.expr) ? saved.expr : DEFAULT_STATE.expr,
    showSubExprs: typeof saved.showSubExprs === 'boolean'
      ? saved.showSubExprs
      : DEFAULT_STATE.showSubExprs,
  };
}

let state: TruthTableState = { ...DEFAULT_STATE };
let exprInput: HTMLInputElement | null = null;
let outputArea: HTMLDivElement | null = null;

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function renderTable(vars: readonly string[], rows: readonly TruthTableRow[]): HTMLDivElement {
  if (!vars.length) {
    return h('div', { className: 'logic-card' },
      h('div', { className: 'logic-card__title' }, 'Tabela Verdade'),
      h('div', { className: 'u-text-muted', style: { padding: 'var(--space-md)' } },
        'Insira uma expressão com pelo menos uma variável'),
    );
  }

  const table = h('table', { className: 'logic-table' });
  const thead = h('thead');
  const headerRow = h('tr');
  vars.forEach((variable) => headerRow.appendChild(h('th', null, variable)));
  headerRow.appendChild(h('th', { className: 'logic-table__result' }, 'F'));
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = h('tbody');
  rows.forEach((row, index) => {
    const tr = h('tr', {
      className: cx(row.result && 'is-true'),
      title: `Linha ${index} (${index.toString(2).padStart(vars.length, '0')})`,
    });
    vars.forEach((variable) => {
      const value = row.env[variable] ? '1' : '0';
      tr.appendChild(h('td', { className: cx(row.env[variable] && 'is-on') }, value));
    });
    tr.appendChild(h('td', {
      className: cx('logic-table__result-cell', row.result && 'is-on'),
    }, row.result ? '1' : '0'));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const trueCount = rows.filter((row) => row.result).length;
  const falseCount = rows.length - trueCount;
  return h('div', { className: 'logic-card' },
    h('div', { className: 'logic-card__title' },
      'Tabela Verdade ',
      h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } },
        `· ${rows.length} linhas · ${trueCount} verdadeiras · ${falseCount} falsas`),
    ),
    h('div', { className: 'logic-table-wrap' }, table),
  );
}

function renderKmap(compiled: CompiledLogic, vars: readonly string[]): HTMLDivElement {
  const card = h('div', { className: 'logic-card' });
  card.appendChild(h('div', { className: 'logic-card__title' }, 'Mapa de Karnaugh'));

  if (vars.length < 2 || vars.length > 4) {
    card.appendChild(h('div', {
      className: 'u-text-muted',
      style: { padding: 'var(--space-md)' },
    }, vars.length < 2
      ? 'K-map disponível para 2 a 4 variáveis. Adicione mais variáveis.'
      : `K-map até 4 variáveis (você tem ${vars.length}). Use a tabela verdade.`,
    ));
    return card;
  }

  let rowVars: string[];
  let colVars: string[];
  let rowOrder: number[];
  let colOrder: number[];
  if (vars.length === 2) {
    rowVars = [vars[0]];
    colVars = [vars[1]];
    rowOrder = grayCodeOrder(1);
    colOrder = grayCodeOrder(1);
  } else if (vars.length === 3) {
    rowVars = [vars[0]];
    colVars = [vars[1], vars[2]];
    rowOrder = grayCodeOrder(1);
    colOrder = grayCodeOrder(2);
  } else {
    rowVars = [vars[0], vars[1]];
    colVars = [vars[2], vars[3]];
    rowOrder = grayCodeOrder(2);
    colOrder = grayCodeOrder(2);
  }

  function valueAt(rowIndex: number, columnIndex: number): boolean {
    const environment: LogicEnvironment = {};
    const rowBits = rowOrder[rowIndex].toString(2).padStart(rowVars.length, '0');
    const columnBits = colOrder[columnIndex].toString(2).padStart(colVars.length, '0');
    rowVars.forEach((variable, index) => {
      environment[variable] = rowBits[index] === '1';
    });
    colVars.forEach((variable, index) => {
      environment[variable] = columnBits[index] === '1';
    });
    return compiled.evaluate(environment);
  }

  function bitsLabel(order: readonly number[], names: readonly string[]): string[] {
    return order.map((number) => number.toString(2).padStart(names.length, '0'));
  }

  const columnLabels = bitsLabel(colOrder, colVars);
  const rowLabels = bitsLabel(rowOrder, rowVars);
  const table = h('table', { className: 'kmap' });
  const variableHeader = h('tr');
  variableHeader.appendChild(h('th', { className: 'kmap__corner' },
    h('span', { className: 'kmap__corner-row' }, rowVars.join('')),
    h('span', { className: 'kmap__corner-slash' }, '/'),
    h('span', { className: 'kmap__corner-col' }, colVars.join('')),
  ));
  columnLabels.forEach((label) => {
    variableHeader.appendChild(h('th', { className: 'kmap__col-label' }, label));
  });
  table.appendChild(variableHeader);

  rowLabels.forEach((rowLabel, rowIndex) => {
    const tr = h('tr');
    tr.appendChild(h('th', { className: 'kmap__row-label' }, rowLabel));
    columnLabels.forEach((columnLabel, columnIndex) => {
      const value = valueAt(rowIndex, columnIndex);
      tr.appendChild(h('td', {
        className: cx('kmap__cell', value && 'is-true'),
        title: `${rowVars.join('')}=${rowLabel}, ${colVars.join('')}=${columnLabel}`,
      }, value ? '1' : '0'));
    });
    table.appendChild(tr);
  });

  card.appendChild(h('div', { className: 'kmap-wrap' }, table));
  card.appendChild(h('div', { className: 'kmap-legend u-text-muted' },
    'Linhas: ', h('strong', null, rowVars.join('')),
    ' · Colunas: ', h('strong', null, colVars.join('')),
    ' · Ordem Gray (linhas/colunas adjacentes diferem em 1 bit)',
  ));
  return card;
}

function renderForms(rows: readonly TruthTableRow[], vars: readonly string[]): HTMLDivElement {
  if (!vars.length) return h('div');
  const sop = toSOP(rows, vars);
  const pos = toPOS(rows, vars);
  let simplified: string;
  try {
    simplified = simplifySOP(rows, vars);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    simplified = `(erro: ${message})`;
  }

  return h('div', { className: 'logic-card' },
    h('div', { className: 'logic-card__title' }, 'Formas canônicas + simplificação'),
    h('div', { className: 'logic-forms' },
      h('div', { className: 'logic-form' },
        h('span', { className: 'logic-form__label' }, 'SOP canônica'),
        h('code', { className: 'logic-form__expr' }, sop),
      ),
      h('div', { className: 'logic-form' },
        h('span', { className: 'logic-form__label' }, 'POS canônica'),
        h('code', { className: 'logic-form__expr' }, pos),
      ),
      h('div', { className: 'logic-form logic-form--simple' },
        h('span', { className: 'logic-form__label' }, 'SOP minimizada (Quine-McCluskey)'),
        h('code', { className: 'logic-form__expr' }, simplified),
      ),
    ),
  );
}

function helpRow(operation: string, symbols: string, example: string): HTMLTableRowElement {
  return h('tr', null,
    h('td', null, operation),
    h('td', null, h('code', null, symbols)),
    h('td', null, h('code', null, example)),
  );
}

function renderHelp(): HTMLDivElement {
  return h('div', { className: 'logic-card logic-help' },
    h('div', { className: 'logic-card__title' }, 'Sintaxe'),
    h('table', { className: 'logic-help__table' },
      h('thead', null,
        h('tr', null,
          h('th', null, 'Operação'),
          h('th', null, 'Símbolos aceitos'),
          h('th', null, 'Exemplo'),
        ),
      ),
      h('tbody', null,
        helpRow('NOT', "!  ~  ¬  NOT  X'", "!A  ~A  A'"),
        helpRow('AND', '&&  &  *  ∧  AND', 'A·B  A AND B'),
        helpRow('OR', '||  |  +  ∨  OR', 'A+B  A OR B'),
        helpRow('XOR', '^  ⊕  XOR', 'A^B'),
        helpRow('IMPLIES', '->  =>  →  IMPLIES', 'A -> B'),
        helpRow('IFF', '<->  <=>  ↔  IFF', 'A <-> B'),
        helpRow('Constantes', '0  1  TRUE  FALSE', 'A AND 1'),
        helpRow('Variáveis', 'A-Z (case-insensitive)', 'AB = A AND B (implícito)'),
      ),
    ),
  );
}

function refresh(): void {
  if (!outputArea) return;
  setStatus('tabelaVerdade', { expressao: state.expr });
  empty(outputArea);

  const compiled = compile(state.expr);
  if (compiled.error) {
    outputArea.appendChild(h('div', { className: 'logic-card logic-card--error' },
      h('div', { className: 'logic-card__title' }, '⚠ Erro de sintaxe'),
      h('div', { style: { padding: 'var(--space-md)', color: 'var(--color-danger)' } }, compiled.error),
    ));
    return;
  }
  if (compiled.empty) {
    outputArea.appendChild(h('div', {
      className: 'u-text-muted',
      style: { padding: 'var(--space-md)', textAlign: 'center' },
    }, 'Insira uma expressão para começar.'));
    return;
  }

  const { vars } = compiled;
  if (vars.length > 8) {
    outputArea.appendChild(h('div', { className: 'logic-card logic-card--error' },
      h('div', { className: 'logic-card__title' }, '⚠ Muitas variáveis'),
      h('div', { style: { padding: 'var(--space-md)' } },
        `Você tem ${vars.length} variáveis (${1 << vars.length} linhas). Limite: 8.`,
      ),
    ));
    return;
  }

  const rows = buildTruthTable(compiled, vars);
  outputArea.appendChild(h('div', { className: 'logic-canonical' },
    h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } }, 'AST canônica: '),
    h('code', { className: 'u-text-cyan' }, astToString(compiled.ast)),
  ));
  outputArea.appendChild(renderForms(rows, vars));
  outputArea.appendChild(h('div', { className: 'logic-grid' },
    renderTable(vars, rows),
    renderKmap(compiled, vars),
  ));
}

function inputValue(event: Event): string | null {
  return event.target instanceof HTMLInputElement ? event.target.value : null;
}

export function tabelaVerdadePage(): HTMLDivElement {
  state = loadState();
  const fullPage = h('div', { className: 'page-tabela-verdade' });
  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'TABELA VERDADE'),
      ),
      h('h1', { className: 'page-header__title' }, '⊨ Tabela Verdade & Mapa de Karnaugh'),
      h('p', { className: 'page-header__description' },
        'Avaliador completo de expressões lógicas: tabela verdade, K-map (até 4 vars), formas SOP/POS canônicas e simplificação ',
        h('span', { className: 'u-text-cyan' }, 'Quine-McCluskey'), '.',
      ),
    ),
  );

  exprInput = h('input', {
    className: 'input logic-input',
    type: 'text',
    value: state.expr,
    placeholder: 'A AND (B OR NOT C)',
    spellcheck: false,
    autocomplete: 'off',
    oninput: debounce((event: Event) => {
      const value = inputValue(event);
      if (value === null) return;
      state.expr = value;
      persist();
      refresh();
    }, 200),
  });

  const examplesBar = h('div', { className: 'logic-examples' },
    h('span', { className: 'u-text-muted', style: { fontSize: '11px', marginRight: '8px' } }, 'Exemplos:'),
    ...EXAMPLES.map((example) => h('button', {
      className: 'chip',
      onclick: () => {
        state.expr = example.expr;
        if (exprInput) exprInput.value = example.expr;
        persist();
        refresh();
      },
    }, example.label)),
  );

  const inputCard = h('div', { className: 'logic-input-card' },
    h('label', {
      className: 'u-text-muted',
      style: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' },
    }, 'Expressão lógica'),
    exprInput,
    examplesBar,
  );
  fullPage.appendChild(inputCard);

  outputArea = h('div', { className: 'logic-output' });
  fullPage.appendChild(outputArea);
  fullPage.appendChild(renderHelp());
  refresh();
  return fullPage;
}
