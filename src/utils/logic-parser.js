/**
 * Parser e avaliador de expressões lógicas booleanas (Fase 6).
 *
 * Operadores aceitos (case-insensitive):
 *   NOT      !  ~  ¬   (postfix:  ' )
 *   AND      &&  &  *  ∧  AND
 *   XOR      ^  ⊕  XOR
 *   OR       ||  |  +  ∨  OR
 *   NAND     ⊼  NAND        (negação do AND)
 *   NOR      ⊽  NOR         (negação do OR)
 *   XNOR     ⊙  XNOR        (negação do XOR — igualdade)
 *   IMPLIES  ->  →  =>  IMPLIES
 *   IFF      <->  ↔  <=>  IFF
 *
 * Constantes:  0 / 1 / FALSE / TRUE
 *
 * Variáveis: qualquer letra A-Z (case-insensitive, normalizada uppercase).
 * Suporta variáveis multi-letra apenas se forem AND/OR/NOT/XOR/IMPLIES/IFF/TRUE/FALSE,
 * caso contrário identificadores são tratados como uma letra de cada vez (ex: AB = A AND B).
 */

/* NAND/NOR/XNOR entram aqui porque a página /portas ensina que NAND e NOR são
 * as portas UNIVERSAIS, e quem sai de lá e escreve "A NAND B" na tabela-verdade
 * levava um "tokens extras após expressão" — o tokenizador quebrava a palavra
 * em N·A·N·D e o erro não dizia nada sobre o que faltava. */
const KEYWORDS = new Set(['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR', 'XNOR', 'IMPLIES', 'IFF', 'TRUE', 'FALSE']);

const PRECEDENCE = {
  iff: 1,
  implies: 2,
  or: 3,
  nor: 3,        // a negada tem a mesma força da positiva que ela nega
  xor: 4,
  xnor: 4,
  and: 5,
  nand: 5,
  not: 6
};

/* ========== Tokenizer ========== */

function tokenize(input) {
  const tokens = [];
  let i = 0;
  const src = input;

  while (i < src.length) {
    const c = src[i];

    if (/\s/.test(c)) { i++; continue; }

    /* Multi-char ops */
    if (src.startsWith('<->', i) || src.startsWith('<=>', i)) { tokens.push({ type: 'op', value: 'iff' }); i += 3; continue; }
    if (src.startsWith('->', i) || src.startsWith('=>', i)) { tokens.push({ type: 'op', value: 'implies' }); i += 2; continue; }
    if (src.startsWith('&&', i)) { tokens.push({ type: 'op', value: 'and' }); i += 2; continue; }
    if (src.startsWith('||', i)) { tokens.push({ type: 'op', value: 'or' }); i += 2; continue; }

    /* Símbolos unicode */
    if (c === '↔') { tokens.push({ type: 'op', value: 'iff' }); i++; continue; }
    if (c === '→') { tokens.push({ type: 'op', value: 'implies' }); i++; continue; }
    if (c === '∧' || c === '·' || c === '•' || c === '×' || c === '⋅') { tokens.push({ type: 'op', value: 'and' }); i++; continue; }
    if (c === '∨') { tokens.push({ type: 'op', value: 'or' }); i++; continue; }
    if (c === '¬') { tokens.push({ type: 'op', value: 'not' }); i++; continue; }
    if (c === '⊕') { tokens.push({ type: 'op', value: 'xor' }); i++; continue; }
    if (c === '⊼') { tokens.push({ type: 'op', value: 'nand' }); i++; continue; }
    if (c === '⊽') { tokens.push({ type: 'op', value: 'nor' }); i++; continue; }
    if (c === '⊙') { tokens.push({ type: 'op', value: 'xnor' }); i++; continue; }

    /* Single-char ops */
    if (c === '&' || c === '*') { tokens.push({ type: 'op', value: 'and' }); i++; continue; }
    if (c === '|' || c === '+') { tokens.push({ type: 'op', value: 'or' }); i++; continue; }
    if (c === '!' || c === '~') { tokens.push({ type: 'op', value: 'not' }); i++; continue; }
    if (c === '^') { tokens.push({ type: 'op', value: 'xor' }); i++; continue; }
    if (c === "'") { tokens.push({ type: 'op', value: 'not_post' }); i++; continue; }
    if (c === '(' || c === ')') { tokens.push({ type: c }); i++; continue; }

    /* Constantes 0/1 */
    if (c === '0') { tokens.push({ type: 'const', value: false }); i++; continue; }
    if (c === '1') { tokens.push({ type: 'const', value: true }); i++; continue; }

    /* Identifier ou keyword */
    if (/[A-Za-z_]/.test(c)) {
      let id = '';
      while (i < src.length && /[A-Za-z_0-9]/.test(src[i])) { id += src[i]; i++; }
      const upper = id.toUpperCase();
      if (KEYWORDS.has(upper)) {
        if (upper === 'TRUE') tokens.push({ type: 'const', value: true });
        else if (upper === 'FALSE') tokens.push({ type: 'const', value: false });
        else tokens.push({ type: 'op', value: upper.toLowerCase() });
      } else {
        /* Trata cada letra como variável separada (ex: ABC → A, AND-implícito, B, AND-implícito, C)
         * Para simplificar: separa em letras individuais */
        for (let k = 0; k < id.length; k++) {
          if (k > 0) tokens.push({ type: 'op', value: 'and' }); /* concatenação implícita */
          tokens.push({ type: 'var', value: id[k].toUpperCase() });
        }
      }
      continue;
    }

    throw new Error(`Caractere inesperado: '${c}' na posição ${i}`);
  }

  return tokens;
}

/* ========== Parser (precedence climbing) ========== */

function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = () => tokens[pos++];

  function parseExpression(minPrec = 0) {
    let left = parseUnary();
    while (true) {
      const t = peek();
      if (!t) break;
      if (t.type === 'op' && t.value === 'not_post') {
        eat();
        left = { type: 'not', child: left };
        continue;
      }
      if (t.type !== 'op' || !PRECEDENCE[t.value] || PRECEDENCE[t.value] < minPrec) break;
      const op = eat().value;
      const prec = PRECEDENCE[op];
      const right = parseExpression(prec + 1);
      left = { type: op, left, right };
    }
    return left;
  }

  function parseUnary() {
    const t = peek();
    if (t && t.type === 'op' && t.value === 'not') {
      eat();
      const child = parseUnary();
      return { type: 'not', child };
    }
    return parsePrimary();
  }

  function parsePrimary() {
    const t = eat();
    if (!t) throw new Error('expressão inesperadamente terminada');
    if (t.type === '(') {
      const expr = parseExpression();
      const close = eat();
      if (!close || close.type !== ')') throw new Error('esperado )');
      return expr;
    }
    if (t.type === 'var') return { type: 'var', name: t.value };
    if (t.type === 'const') return { type: 'const', value: t.value };
    throw new Error(`token inesperado: ${JSON.stringify(t)}`);
  }

  const ast = parseExpression();
  if (pos < tokens.length) throw new Error('tokens extras após expressão');
  return ast;
}

/* ========== Avaliação ========== */

function evalAst(node, env) {
  switch (node.type) {
    case 'const': return node.value;
    case 'var': return !!env[node.name];
    case 'not': return !evalAst(node.child, env);
    case 'and': return evalAst(node.left, env) && evalAst(node.right, env);
    case 'or': return evalAst(node.left, env) || evalAst(node.right, env);
    case 'xor': return evalAst(node.left, env) !== evalAst(node.right, env);
    case 'implies': {
      const a = evalAst(node.left, env);
      const b = evalAst(node.right, env);
      return !a || b;
    }
    case 'iff': return evalAst(node.left, env) === evalAst(node.right, env);
    /* Definidas COMO a negação da positiva: é o que garante que De Morgan
     * feche por construção, em vez de depender de eu ter escrito a tabela
     * certa de cabeça. */
    case 'nand': return !(evalAst(node.left, env) && evalAst(node.right, env));
    case 'nor': return !(evalAst(node.left, env) || evalAst(node.right, env));
    case 'xnor': return evalAst(node.left, env) === evalAst(node.right, env);
    default: throw new Error('nó desconhecido: ' + node.type);
  }
}

/* ========== Coleta de variáveis ========== */

function collectVars(node, set = new Set()) {
  if (!node) return set;
  if (node.type === 'var') set.add(node.name);
  if (node.type === 'not') collectVars(node.child, set);
  if (node.left) collectVars(node.left, set);
  if (node.right) collectVars(node.right, set);
  return set;
}

/* ========== API pública ========== */

/**
 * Compila uma expressão em um descritor pronto para uso.
 * @returns {{ ast, vars: string[], evaluate(env): boolean, error? }}
 */
export function compile(expr) {
  try {
    const tokens = tokenize(expr || '');
    if (tokens.length === 0) return { ast: null, vars: [], evaluate: () => false, empty: true };
    const ast = parse(tokens);
    const vars = [...collectVars(ast)].sort();
    return {
      ast, vars,
      evaluate: (env) => evalAst(ast, env)
    };
  } catch (e) {
    return { ast: null, vars: [], evaluate: () => false, error: e.message };
  }
}

/**
 * Gera todas as combinações binárias de N bits.
 * Retorna array de objetos { A: 0|1, B: 0|1, ..., result: 0|1 }
 */
export function buildTruthTable(compiled, vars) {
  const rows = [];
  const total = 1 << vars.length;
  for (let i = 0; i < total; i++) {
    const env = {};
    /* MSB primeiro: variável da posição 0 é o bit mais significativo */
    vars.forEach((v, idx) => {
      const bit = (i >> (vars.length - 1 - idx)) & 1;
      env[v] = bit === 1;
    });
    const result = compiled.evaluate(env);
    rows.push({ env, result });
  }
  return rows;
}

/**
 * Converte AST em string canônica para exibição.
 */
export function astToString(node) {
  if (!node) return '';
  if (node.type === 'const') return node.value ? '1' : '0';
  if (node.type === 'var') return node.name;
  if (node.type === 'not') return '¬' + astToString(node.child);
  if (node.type === 'and') return `(${astToString(node.left)} ∧ ${astToString(node.right)})`;
  if (node.type === 'or') return `(${astToString(node.left)} ∨ ${astToString(node.right)})`;
  if (node.type === 'xor') return `(${astToString(node.left)} ⊕ ${astToString(node.right)})`;
  if (node.type === 'implies') return `(${astToString(node.left)} → ${astToString(node.right)})`;
  if (node.type === 'iff') return `(${astToString(node.left)} ↔ ${astToString(node.right)})`;
  if (node.type === 'nand') return `(${astToString(node.left)} ⊼ ${astToString(node.right)})`;
  if (node.type === 'nor') return `(${astToString(node.left)} ⊽ ${astToString(node.right)})`;
  if (node.type === 'xnor') return `(${astToString(node.left)} ⊙ ${astToString(node.right)})`;
  return '?';
}

/**
 * Sum of Products (SOP) canônica a partir dos minterms.
 */
export function toSOP(rows, vars) {
  const minterms = rows.filter((r) => r.result);
  if (minterms.length === 0) return '0';
  if (minterms.length === rows.length) return '1';
  return minterms.map((m) =>
    vars.map((v) => m.env[v] ? v : '¬' + v).join('·')
  ).join(' + ');
}

/**
 * Product of Sums (POS) canônica a partir dos maxterms.
 */
export function toPOS(rows, vars) {
  const maxterms = rows.filter((r) => !r.result);
  if (maxterms.length === 0) return '1';
  if (maxterms.length === rows.length) return '0';
  return maxterms.map((m) =>
    '(' + vars.map((v) => m.env[v] ? '¬' + v : v).join('+') + ')'
  ).join('·');
}

/* ========== Quine-McCluskey simplificado ========== */

/**
 * Simplificação SOP por Quine-McCluskey.
 * Devolve string mínima.
 *
 * @param {Array<{env, result}>} rows
 * @param {string[]} vars
 */
export function simplifySOP(rows, vars) {
  const minterms = [];
  rows.forEach((r, i) => { if (r.result) minterms.push(i); });
  if (minterms.length === 0) return '0';
  if (minterms.length === rows.length) return '1';

  const numVars = vars.length;
  const total = 1 << numVars;

  /* Cada termo: { mask, bits, covers: [m1, m2,...], used } */
  function toBits(n) {
    return n.toString(2).padStart(numVars, '0');
  }

  let groups = minterms.map((m) => ({
    bits: toBits(m),
    covers: [m],
    used: false
  }));

  const primes = [];
  while (true) {
    const next = [];
    const usedThisRound = new Set();
    for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i].bits;
        const b = groups[j].bits;
        let diff = 0, diffPos = -1;
        for (let k = 0; k < numVars; k++) {
          if (a[k] !== b[k]) { diff++; diffPos = k; if (diff > 1) break; }
        }
        if (diff === 1) {
          const merged = a.slice(0, diffPos) + '-' + a.slice(diffPos + 1);
          const covers = [...groups[i].covers, ...groups[j].covers];
          /* Evita duplicatas */
          if (!next.some((t) => t.bits === merged)) {
            next.push({ bits: merged, covers, used: false });
          }
          usedThisRound.add(i);
          usedThisRound.add(j);
        }
      }
    }
    /* Termos não combinados são prime implicants */
    groups.forEach((t, i) => { if (!usedThisRound.has(i)) primes.push(t); });
    if (next.length === 0) break;
    groups = next;
  }

  /* Cobertura: escolhe primes essenciais primeiro, depois greedy */
  const covered = new Set();
  const selected = [];
  /* essential prime implicants */
  for (const m of minterms) {
    const containing = primes.filter((p) => p.covers.includes(m));
    if (containing.length === 1) {
      const p = containing[0];
      if (!selected.includes(p)) {
        selected.push(p);
        p.covers.forEach((c) => covered.add(c));
      }
    }
  }
  /* greedy para resto */
  while (covered.size < minterms.length) {
    let best = null, bestCount = 0;
    for (const p of primes) {
      if (selected.includes(p)) continue;
      const newCount = p.covers.filter((c) => minterms.includes(c) && !covered.has(c)).length;
      if (newCount > bestCount) { best = p; bestCount = newCount; }
    }
    if (!best) break;
    selected.push(best);
    best.covers.forEach((c) => covered.add(c));
  }

  /* Converte cada implicante para string */
  const terms = selected.map((p) => {
    const parts = [];
    for (let k = 0; k < numVars; k++) {
      const ch = p.bits[k];
      if (ch === '1') parts.push(vars[k]);
      else if (ch === '0') parts.push('¬' + vars[k]);
    }
    return parts.length ? parts.join('·') : '1';
  });
  return terms.join(' + ');
}

/* ========== K-map ordering ========== */

/**
 * Retorna ordenação Gray code para N bits.
 */
export function grayCodeOrder(n) {
  const order = [];
  for (let i = 0; i < (1 << n); i++) {
    order.push(i ^ (i >> 1));
  }
  return order;
}
