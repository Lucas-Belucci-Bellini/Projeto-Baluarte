/**
 * Página /tabela-verdade — Tabela Verdade + Mapa de Karnaugh (Fase 6).
 *
 * Recursos:
 *   - Input de expressão com sintaxe flexível (and/or/not/xor/implies/iff)
 *   - Detecção automática de variáveis (até 8; K-map só até 4)
 *   - Tabela verdade completa
 *   - Mapa de Karnaugh (2, 3 ou 4 vars) com Gray code
 *   - SOP canônica + POS canônica + SOP simplificada (Quine-McCluskey)
 *   - Botões de exemplos rápidos
 */

import '../styles/tabela-verdade.css';
import { h, cx, debounce, mount, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { setStatus } from '../utils/baluarte-status.js';
import { toast } from '../utils/toast.js';
import {
  compile,
  buildTruthTable,
  astToString,
  toSOP,
  toPOS,
  simplifySOP,
  grayCodeOrder
} from '../utils/logic-parser.js';

const STORAGE_KEY = 'tabela-verdade:state';

const EXAMPLES = [
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
  { label: 'Distributiva', expr: 'A·(B+C)' }
];

let state = null;
let exprInput;
let outputArea;
let kbHandler = null;

function loadState() {
  return storage.get(STORAGE_KEY) || { expr: 'A AND B', showSubExprs: false };
}

function persist() {
  storage.set(STORAGE_KEY, state);
}

/* ===== Render: tabela verdade ===== */

function renderTable(compiled, vars, rows) {
  if (!vars.length) {
    return h('div', { className: 'logic-card' },
      h('div', { className: 'logic-card__title' }, 'Tabela Verdade'),
      h('div', { className: 'u-text-muted', style: { padding: 'var(--space-md)' } },
        'Insira uma expressão com pelo menos uma variável.')
    );
  }

  const table = h('table', { className: 'logic-table' });
  /* Header */
  const thead = h('thead');
  const trH = h('tr');
  vars.forEach((v) => trH.appendChild(h('th', null, v)));
  trH.appendChild(h('th', { className: 'logic-table__result' }, 'F'));
  thead.appendChild(trH);
  table.appendChild(thead);

  /* Body */
  const tbody = h('tbody');
  rows.forEach((row, idx) => {
    const tr = h('tr', {
      className: cx(row.result && 'is-true'),
      title: `Linha ${idx} (${idx.toString(2).padStart(vars.length, '0')})`
    });
    vars.forEach((v) => {
      const val = row.env[v] ? '1' : '0';
      tr.appendChild(h('td', { className: cx(row.env[v] && 'is-on') }, val));
    });
    tr.appendChild(h('td', {
      className: cx('logic-table__result-cell', row.result && 'is-on')
    }, row.result ? '1' : '0'));
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  const trueCount = rows.filter((r) => r.result).length;
  const falseCount = rows.length - trueCount;

  return h('div', { className: 'logic-card' },
    h('div', { className: 'logic-card__title' },
      'Tabela Verdade ',
      h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } },
        `· ${rows.length} linhas · ${trueCount} verdadeiras · ${falseCount} falsas`)
    ),
    h('div', { className: 'logic-table-wrap' }, table)
  );
}

/* ===== Render: K-map ===== */

function renderKmap(compiled, vars, rows) {
  const card = h('div', { className: 'logic-card' });
  card.appendChild(h('div', { className: 'logic-card__title' }, 'Mapa de Karnaugh'));

  if (vars.length < 2 || vars.length > 4) {
    card.appendChild(h('div', {
      className: 'u-text-muted',
      style: { padding: 'var(--space-md)' }
    },
      vars.length < 2
        ? 'K-map disponível para 2 a 4 variáveis. Adicione mais variáveis.'
        : `K-map até 4 variáveis (você tem ${vars.length}). Use a tabela verdade.`
    ));
    return card;
  }

  /* Layouts:
   * 2 vars (A, B): 2x2  rows=A, cols=B (Gray order)
   * 3 vars (A,B,C): 2x4 rows=A, cols=BC
   * 4 vars (A,B,C,D): 4x4 rows=AB, cols=CD
   */
  let rowVars, colVars, rowOrder, colOrder;
  if (vars.length === 2) {
    rowVars = [vars[0]]; colVars = [vars[1]];
    rowOrder = grayCodeOrder(1); colOrder = grayCodeOrder(1);
  } else if (vars.length === 3) {
    rowVars = [vars[0]]; colVars = [vars[1], vars[2]];
    rowOrder = grayCodeOrder(1); colOrder = grayCodeOrder(2);
  } else {
    rowVars = [vars[0], vars[1]]; colVars = [vars[2], vars[3]];
    rowOrder = grayCodeOrder(2); colOrder = grayCodeOrder(2);
  }

  /* Função para extrair valor de F(env) dada combinação dos bits */
  function valueAt(rIdx, cIdx) {
    const env = {};
    /* rowOrder[rIdx] e colOrder[cIdx] são números no padrão Gray reorder */
    const rowBits = rowOrder[rIdx].toString(2).padStart(rowVars.length, '0');
    const colBits = colOrder[cIdx].toString(2).padStart(colVars.length, '0');
    rowVars.forEach((v, i) => { env[v] = rowBits[i] === '1'; });
    colVars.forEach((v, i) => { env[v] = colBits[i] === '1'; });
    return compiled.evaluate(env);
  }

  function bitsLabel(order, varNames) {
    return order.map((n) => n.toString(2).padStart(varNames.length, '0'));
  }

  const colLabels = bitsLabel(colOrder, colVars);
  const rowLabels = bitsLabel(rowOrder, rowVars);

  const table = h('table', { className: 'kmap' });

  /* Header: vars de coluna (acima) + bits */
  const trVarLabel = h('tr');
  trVarLabel.appendChild(h('th', { className: 'kmap__corner' },
    h('span', { className: 'kmap__corner-row' }, rowVars.join('')),
    h('span', { className: 'kmap__corner-slash' }, '/'),
    h('span', { className: 'kmap__corner-col' }, colVars.join(''))
  ));
  colLabels.forEach((lab) => {
    trVarLabel.appendChild(h('th', { className: 'kmap__col-label' }, lab));
  });
  table.appendChild(trVarLabel);

  /* Body */
  rowLabels.forEach((rLab, rIdx) => {
    const tr = h('tr');
    tr.appendChild(h('th', { className: 'kmap__row-label' }, rLab));
    colLabels.forEach((_, cIdx) => {
      const v = valueAt(rIdx, cIdx);
      tr.appendChild(h('td', {
        className: cx('kmap__cell', v && 'is-true'),
        title: `${rowVars.join('')}=${rLab}, ${colVars.join('')}=${colLabels[cIdx]}`
      }, v ? '1' : '0'));
    });
    table.appendChild(tr);
  });

  card.appendChild(h('div', { className: 'kmap-wrap' }, table));

  /* Legenda */
  card.appendChild(
    h('div', { className: 'kmap-legend u-text-muted' },
      'Linhas: ', h('strong', null, rowVars.join('')),
      ' · Colunas: ', h('strong', null, colVars.join('')),
      ' · Ordem Gray (linhas/colunas adjacentes diferem em 1 bit)'
    )
  );

  return card;
}

/* ===== Render: formas canônicas + simplificação ===== */

function renderForms(compiled, vars, rows) {
  if (!vars.length) return h('div');
  const sop = toSOP(rows, vars);
  const pos = toPOS(rows, vars);
  let simplified;
  try { simplified = simplifySOP(rows, vars); } catch (e) { simplified = '(erro: ' + e.message + ')'; }

  return h('div', { className: 'logic-card' },
    h('div', { className: 'logic-card__title' }, 'Formas canônicas + simplificação'),
    h('div', { className: 'logic-forms' },
      h('div', { className: 'logic-form' },
        h('span', { className: 'logic-form__label' }, 'SOP canônica'),
        h('code', { className: 'logic-form__expr' }, sop)
      ),
      h('div', { className: 'logic-form' },
        h('span', { className: 'logic-form__label' }, 'POS canônica'),
        h('code', { className: 'logic-form__expr' }, pos)
      ),
      h('div', { className: 'logic-form logic-form--simple' },
        h('span', { className: 'logic-form__label' }, 'SOP minimizada (Quine-McCluskey)'),
        h('code', { className: 'logic-form__expr' }, simplified)
      )
    )
  );
}

/* ===== Render: ajuda ===== */

function renderHelp() {
  return h('div', { className: 'logic-card logic-help' },
    h('div', { className: 'logic-card__title' }, 'Sintaxe'),
    h('table', { className: 'logic-help__table' },
      h('thead', null,
        h('tr', null,
          h('th', null, 'Operação'),
          h('th', null, 'Símbolos aceitos'),
          h('th', null, 'Exemplo')
        )
      ),
      h('tbody', null,
        helpRow('NOT', "!  ~  ¬  NOT  X'", '!A  ~A  A\''),
        helpRow('AND', '&&  &  *  ∧  AND', 'A·B  A AND B'),
        helpRow('OR', '||  |  +  ∨  OR', 'A+B  A OR B'),
        helpRow('XOR', '^  ⊕  XOR', 'A^B'),
        helpRow('IMPLIES', '->  =>  →  IMPLIES', 'A -> B'),
        helpRow('IFF', '<->  <=>  ↔  IFF', 'A <-> B'),
        helpRow('Constantes', '0  1  TRUE  FALSE', 'A AND 1'),
        helpRow('Variáveis', 'A-Z (case-insensitive)', 'AB = A AND B (implícito)')
      )
    )
  );
}

function helpRow(op, syms, ex) {
  return h('tr', null,
    h('td', null, op),
    h('td', null, h('code', null, syms)),
    h('td', null, h('code', null, ex))
  );
}

/* ===== Render principal ===== */

function refresh() {
  if (!outputArea) return;
  setStatus('tabelaVerdade', { expressao: state.expr });
  empty(outputArea);

  const compiled = compile(state.expr);
  if (compiled.error) {
    outputArea.appendChild(
      h('div', { className: 'logic-card logic-card--error' },
        h('div', { className: 'logic-card__title' }, '⚠ Erro de sintaxe'),
        h('div', { style: { padding: 'var(--space-md)', color: 'var(--color-danger)' } },
          compiled.error)
      )
    );
    return;
  }
  if (compiled.empty) {
    outputArea.appendChild(
      h('div', { className: 'u-text-muted', style: { padding: 'var(--space-md)', textAlign: 'center' } },
        'Insira uma expressão para começar.')
    );
    return;
  }

  const { vars } = compiled;
  if (vars.length > 8) {
    outputArea.appendChild(
      h('div', { className: 'logic-card logic-card--error' },
        h('div', { className: 'logic-card__title' }, '⚠ Muitas variáveis'),
        h('div', { style: { padding: 'var(--space-md)' } },
          `Você tem ${vars.length} variáveis (${1 << vars.length} linhas). Limite: 8.`)
      )
    );
    return;
  }

  const rows = buildTruthTable(compiled, vars);

  /* Status bar com expressão canônica */
  outputArea.appendChild(
    h('div', { className: 'logic-canonical' },
      h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } },
        'AST canônica: '),
      h('code', { className: 'u-text-cyan' }, astToString(compiled.ast))
    )
  );

  outputArea.appendChild(renderForms(compiled, vars, rows));
  outputArea.appendChild(
    h('div', { className: 'logic-grid' },
      renderTable(compiled, vars, rows),
      renderKmap(compiled, vars, rows)
    )
  );
}

/* ===== Page builder ===== */

export function tabelaVerdadePage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-tabela-verdade' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'TABELA VERDADE')
      ),
      h('h1', { className: 'page-header__title' }, '⊨ Tabela Verdade & Mapa de Karnaugh'),
      h('p', { className: 'page-header__description' },
        'Avaliador completo de expressões lógicas: tabela verdade, K-map (até 4 vars), formas SOP/POS canônicas e simplificação ',
        h('span', { className: 'u-text-cyan' }, 'Quine-McCluskey'), '.'
      )
    )
  );

  /* Input + exemplos */
  exprInput = h('input', {
    className: 'input logic-input',
    type: 'text',
    value: state.expr,
    placeholder: 'A AND (B OR NOT C)',
    spellcheck: 'false',
    autocomplete: 'off',
    oninput: debounce((e) => {
      state.expr = e.target.value;
      persist();
      refresh();
    }, 200)
  });

  const examplesBar = h('div', { className: 'logic-examples' },
    h('span', { className: 'u-text-muted', style: { fontSize: '11px', marginRight: '8px' } },
      'Exemplos:'),
    ...EXAMPLES.map((ex) =>
      h('button', {
        className: 'chip',
        onclick: () => {
          state.expr = ex.expr;
          exprInput.value = ex.expr;
          persist();
          refresh();
        }
      }, ex.label)
    )
  );

  const inputCard = h('div', { className: 'logic-input-card' },
    h('label', { className: 'u-text-muted', style: { fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' } },
      'Expressão lógica'),
    exprInput,
    examplesBar
  );

  fullPage.appendChild(inputCard);

  outputArea = h('div', { className: 'logic-output' });
  fullPage.appendChild(outputArea);
  fullPage.appendChild(renderHelp());

  refresh();

  return fullPage;
}
