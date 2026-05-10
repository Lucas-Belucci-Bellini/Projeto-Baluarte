/**
 * Engine matemática — Calculadora Científica & Numérica (Fase 4)
 *
 * Parser de expressão recursivo descendente com suporte a:
 *   - Operadores: + - * / % ^ unário-
 *   - Parênteses
 *   - Funções: sin, cos, tan, asin, acos, atan,
 *              sinh, cosh, tanh,
 *              log (base 10), ln, log2, exp,
 *              sqrt, cbrt, abs, floor, ceil, round,
 *              factorial (fact)
 *   - Constantes: pi, e, phi
 *   - Variáveis: ans (último resultado), m (memória)
 *   - Modo angular: 'deg' | 'rad' (afeta sin/cos/tan/asin/acos/atan)
 */

const PHI = (1 + Math.sqrt(5)) / 2;

const CONSTANTS = {
  pi: Math.PI,
  PI: Math.PI,
  π: Math.PI,
  e: Math.E,
  E: Math.E,
  phi: PHI,
  φ: PHI
};

const FUNCTIONS_RAD = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan
};

const FUNCTIONS_BASE = {
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  log: (x) => Math.log10(x),
  log10: (x) => Math.log10(x),
  ln: Math.log,
  log2: Math.log2,
  exp: Math.exp,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  sign: Math.sign,
  fact: factorial,
  factorial
};

function factorial(n) {
  if (!Number.isFinite(n)) return NaN;
  n = Math.floor(n);
  if (n < 0) return NaN;
  if (n > 170) return Infinity;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/* ===== Tokenizer ===== */

function tokenize(input) {
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const c = input[i];
    if (/\s/.test(c)) { i++; continue; }

    if (/[\d.]/.test(c)) {
      let num = '';
      while (i < input.length && /[\d.eE+\-]/.test(input[i])) {
        /* permite 1e10, 1e-3, 1e+3 */
        const cur = input[i];
        if ((cur === '+' || cur === '-') && !/[eE]/.test(num.slice(-1))) break;
        num += cur;
        i++;
      }
      tokens.push({ type: 'num', value: parseFloat(num) });
      continue;
    }

    if (/[a-zA-Zπφ]/.test(c)) {
      let id = '';
      while (i < input.length && /[a-zA-Z0-9_πφ]/.test(input[i])) { id += input[i]; i++; }
      if (CONSTANTS[id] !== undefined) tokens.push({ type: 'num', value: CONSTANTS[id] });
      else tokens.push({ type: 'ident', value: id });
      continue;
    }

    if ('+-*/%^()!,'.includes(c)) {
      tokens.push({ type: 'op', value: c });
      i++;
      continue;
    }

    /* Símbolos alternativos */
    if (c === '×') { tokens.push({ type: 'op', value: '*' }); i++; continue; }
    if (c === '÷') { tokens.push({ type: 'op', value: '/' }); i++; continue; }

    throw new Error(`Caractere inesperado: '${c}'`);
  }
  return tokens;
}

/* ===== Parser (recursive descent) ===== */

function makeParser(tokens, mode, scope) {
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = () => tokens[pos++];

  /* Expressão: termo + termo */
  function parseExpression() {
    let left = parseTerm();
    while (peek() && peek().type === 'op' && (peek().value === '+' || peek().value === '-')) {
      const op = eat().value;
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  /* Termo: fator * fator */
  function parseTerm() {
    let left = parseFactor();
    while (peek() && peek().type === 'op' && (peek().value === '*' || peek().value === '/' || peek().value === '%')) {
      const op = eat().value;
      const right = parseFactor();
      if (op === '*') left = left * right;
      else if (op === '/') left = left / right;
      else left = left % right;
    }
    return left;
  }

  /* Fator: potência ^ potência (right-associative) */
  function parseFactor() {
    let base = parseUnary();
    if (peek() && peek().type === 'op' && peek().value === '^') {
      eat();
      const exp = parseFactor();
      return Math.pow(base, exp);
    }
    return base;
  }

  /* Unário: -fator | +fator | fator */
  function parseUnary() {
    if (peek() && peek().type === 'op' && peek().value === '-') {
      eat();
      return -parseUnary();
    }
    if (peek() && peek().type === 'op' && peek().value === '+') {
      eat();
      return parseUnary();
    }
    return parsePostfix();
  }

  /* Postfix: fator ! (factorial) */
  function parsePostfix() {
    let val = parsePrimary();
    while (peek() && peek().type === 'op' && peek().value === '!') {
      eat();
      val = factorial(val);
    }
    return val;
  }

  /* Primário: número | ( expr ) | função(arg) | ident */
  function parsePrimary() {
    const t = peek();
    if (!t) throw new Error('Expressão incompleta');

    if (t.type === 'num') { eat(); return t.value; }

    if (t.type === 'op' && t.value === '(') {
      eat();
      const v = parseExpression();
      const close = eat();
      if (!close || close.value !== ')') throw new Error('Esperado )');
      return v;
    }

    if (t.type === 'ident') {
      eat();
      const name = t.value.toLowerCase();
      /* É função? Próximo token deve ser ( */
      if (peek() && peek().type === 'op' && peek().value === '(') {
        eat();
        const arg = parseExpression();
        const close = eat();
        if (!close || close.value !== ')') throw new Error(`Esperado ) após ${name}`);
        return applyFunction(name, arg, mode);
      }
      /* Variáveis do scope */
      if (scope && scope[name] !== undefined) return scope[name];
      throw new Error(`Identificador desconhecido: ${name}`);
    }

    throw new Error(`Token inesperado: ${t.value}`);
  }

  return { parse: parseExpression };
}

function applyFunction(name, arg, mode) {
  if (FUNCTIONS_RAD[name]) {
    /* Trig: converte arg conforme modo */
    if (['sin', 'cos', 'tan'].includes(name)) {
      const a = mode === 'deg' ? (arg * Math.PI) / 180 : arg;
      return FUNCTIONS_RAD[name](a);
    }
    if (['asin', 'acos', 'atan'].includes(name)) {
      const r = FUNCTIONS_RAD[name](arg);
      return mode === 'deg' ? (r * 180) / Math.PI : r;
    }
  }
  if (FUNCTIONS_BASE[name]) return FUNCTIONS_BASE[name](arg);
  throw new Error(`Função desconhecida: ${name}`);
}

/* ===== API pública ===== */

/**
 * Avalia uma expressão e retorna { value, error? }.
 * @param {string} expr
 * @param {{ mode?: 'deg'|'rad', scope?: object }} opts
 */
export function evaluate(expr, opts = {}) {
  const mode = opts.mode || 'rad';
  const scope = opts.scope || {};
  try {
    const tokens = tokenize(expr);
    if (!tokens.length) return { value: 0 };
    const parser = makeParser(tokens, mode, scope);
    const value = parser.parse();
    return { value };
  } catch (e) {
    return { value: NaN, error: e.message };
  }
}

/* ===== Helpers para Calc Numérica ===== */

/**
 * Converte um número entre bases (2, 8, 10, 16) com tamanho fixo de bits.
 */
export function toBase(value, base, bits = 32) {
  if (!Number.isFinite(value)) return '—';
  /* Trunca para inteiro */
  let n = Math.trunc(value);
  if (n < 0) {
    /* Two's complement */
    const max = 2 ** bits;
    n = (max + (n % max)) % max;
  }
  const s = n.toString(base).toUpperCase();
  if (base === 2) {
    return s.padStart(Math.min(bits, Math.max(s.length, 8)), '0');
  }
  return s;
}

export function fromBase(str, base) {
  if (!str || str === '0') return 0;
  /* parseInt aceita base 2-36 */
  const n = parseInt(str.replace(/[^0-9a-fA-F]/g, ''), base);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Operações bit-a-bit em inteiros (até 32 bits). Para 64 bits usaríamos BigInt.
 */
export const bitOps = {
  and: (a, b) => (a & b) >>> 0,
  or:  (a, b) => (a | b) >>> 0,
  xor: (a, b) => (a ^ b) >>> 0,
  not: (a, bits = 32) => ((~a) & ((1 << bits) - 1)) >>> 0,
  nand: (a, b) => (~(a & b) & 0xFFFFFFFF) >>> 0,
  nor:  (a, b) => (~(a | b) & 0xFFFFFFFF) >>> 0,
  xnor: (a, b) => (~(a ^ b) & 0xFFFFFFFF) >>> 0,
  shl: (a, n) => (a << n) >>> 0,
  shr: (a, n) => a >>> n,
  sar: (a, n) => a >> n
};

/**
 * Visualização IEEE 754 (32 ou 64 bits).
 */
export function ieee754(value, precision = 'single') {
  const buf = new ArrayBuffer(precision === 'single' ? 4 : 8);
  const view = new DataView(buf);
  if (precision === 'single') view.setFloat32(0, value, false);
  else view.setFloat64(0, value, false);

  let bits = '';
  for (let i = 0; i < buf.byteLength; i++) {
    bits += view.getUint8(i).toString(2).padStart(8, '0');
  }

  if (precision === 'single') {
    return {
      sign: bits[0],
      exponent: bits.slice(1, 9),
      mantissa: bits.slice(9),
      bits,
      hex: Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
    };
  }
  return {
    sign: bits[0],
    exponent: bits.slice(1, 12),
    mantissa: bits.slice(12),
    bits,
    hex: Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  };
}

/**
 * Formata um número para exibição (com separador de milhar, casas decimais).
 */
export function formatResult(n, precision = 12) {
  if (!Number.isFinite(n)) {
    if (Number.isNaN(n)) return 'NaN';
    return n > 0 ? '∞' : '-∞';
  }
  if (Number.isInteger(n) && Math.abs(n) < 1e15) return String(n);
  const abs = Math.abs(n);
  if (abs > 0 && (abs < 1e-6 || abs >= 1e16)) {
    return n.toExponential(6);
  }
  return parseFloat(n.toPrecision(precision)).toString();
}
