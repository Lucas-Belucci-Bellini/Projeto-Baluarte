/**
 * Mini-LLM do Zero — modelos de linguagem em JS puro (sem dependências).
 *
 * Inspirado nos repositórios de "LLM from scratch" (vongrossi, makemore/nanoGPT,
 * FareedKhan, analyticalrohit…). Roda 100% no navegador:
 *
 *   1) NgramModel  — modelo estatístico (conta n-gramas). Treina instantâneo.
 *   2) NeuralBigram — rede neural de 1 camada (matriz V×V) treinada por
 *      descida de gradiente (softmax + cross-entropy + backprop manual). Mostra
 *      a LOSS caindo — é o "aprendizado" de verdade, do zero.
 *
 * Nível de caractere: o vocabulário são os caracteres do texto.
 */

/* ===== Vocabulário (char-level) ===== */
export function buildVocab(text) {
  const chars = [...new Set(('\n' + text).split(''))].sort();
  const stoi = new Map(chars.map((c, i) => [c, i]));
  const itos = chars;
  return { chars, stoi, itos, size: chars.length };
}

function sampleFromProbs(probs) {
  let r = Math.random(), acc = 0;
  for (let i = 0; i < probs.length; i++) { acc += probs[i]; if (r <= acc) return i; }
  return probs.length - 1;
}

function softmaxTemp(logits, temp = 1) {
  const t = Math.max(0.05, temp);
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) { const v = logits[i] / t; if (v > max) max = v; }
  const out = new Float64Array(logits.length);
  let sum = 0;
  for (let i = 0; i < logits.length; i++) { const e = Math.exp(logits[i] / t - max); out[i] = e; sum += e; }
  for (let i = 0; i < out.length; i++) out[i] /= sum;
  return out;
}

/* ===== 1) Modelo de n-gramas (estatístico) ===== */
export class NgramModel {
  constructor(order = 3) { this.order = Math.max(1, order); this.table = new Map(); this.trained = false; }

  train(text) {
    const s = '\n'.repeat(this.order) + text + '\n';
    this.table.clear();
    for (let i = this.order; i < s.length; i++) {
      const ctx = s.slice(i - this.order, i);
      const nxt = s[i];
      let m = this.table.get(ctx);
      if (!m) { m = new Map(); this.table.set(ctx, m); }
      m.set(nxt, (m.get(nxt) || 0) + 1);
    }
    this.trained = true;
    return { contexts: this.table.size };
  }

  _next(ctx, temp) {
    let m = this.table.get(ctx);
    /* backoff: encurta o contexto se não viu este exato */
    let k = this.order;
    while (!m && k > 1) { k--; ctx = ctx.slice(-k); for (const [key, val] of this.table) { if (key.slice(-k) === ctx) { m = val; break; } } }
    if (!m) return '\n';
    const keys = [...m.keys()];
    const counts = keys.map((c) => m.get(c));
    const probs = softmaxTemp(counts.map((c) => Math.log(c + 1e-9)), temp);
    return keys[sampleFromProbs(probs)];
  }

  generate(maxLen = 240, temp = 1) {
    if (!this.trained) return '';
    let ctx = '\n'.repeat(this.order), out = '';
    for (let i = 0; i < maxLen; i++) {
      const c = this._next(ctx, temp);
      if (c === '\n' && out.length > 8) break;
      out += c;
      ctx = (ctx + c).slice(-this.order);
    }
    return out.trim();
  }
}

/* ===== 2) Rede neural bigrama (treina por gradiente) ===== */
export class NeuralBigram {
  constructor(vocab) {
    this.vocab = vocab;
    const V = vocab.size;
    this.V = V;
    this.W = new Float64Array(V * V);
    for (let i = 0; i < this.W.length; i++) this.W[i] = (Math.random() * 2 - 1) * 0.01;
    this.pairs = null;
  }

  _buildPairs(text) {
    const { stoi } = this.vocab;
    const s = '\n' + text + '\n';
    const xs = [], ys = [];
    for (let i = 0; i < s.length - 1; i++) {
      const a = stoi.get(s[i]), b = stoi.get(s[i + 1]);
      if (a == null || b == null) continue;
      xs.push(a); ys.push(b);
    }
    this.pairs = { xs, ys };
  }

  /** Prepara os pares de treino (chamar antes de trainStep no treino animado). */
  prepare(text) { this._buildPairs(text); return this.pairs.xs.length; }

  /** Um passo de gradiente em todo o conjunto (full-batch). Retorna a loss média. */
  trainStep(lr = 30) {
    const V = this.V, { xs, ys } = this.pairs;
    const N = xs.length;
    const grad = new Float64Array(V * V);
    let loss = 0;
    for (let n = 0; n < N; n++) {
      const i = xs[n], y = ys[n], base = i * V;
      /* softmax das logits W[i, :] */
      let max = -Infinity;
      for (let j = 0; j < V; j++) { const v = this.W[base + j]; if (v > max) max = v; }
      let sum = 0; const p = new Float64Array(V);
      for (let j = 0; j < V; j++) { const e = Math.exp(this.W[base + j] - max); p[j] = e; sum += e; }
      for (let j = 0; j < V; j++) p[j] /= sum;
      loss += -Math.log(p[y] + 1e-9);
      /* grad: (p - onehot(y)) acumulado em W[i, :] */
      for (let j = 0; j < V; j++) grad[base + j] += p[j];
      grad[base + y] -= 1;
    }
    const scale = lr / N;
    for (let k = 0; k < grad.length; k++) this.W[k] -= scale * grad[k];
    return loss / N;
  }

  train(text, { steps = 120, lr = 30, onProgress } = {}) {
    this._buildPairs(text);
    const losses = [];
    for (let s = 0; s < steps; s++) {
      const l = this.trainStep(lr);
      losses.push(l);
      if (onProgress) onProgress(s + 1, steps, l);
    }
    return losses;
  }

  generate(maxLen = 240, temp = 1) {
    const V = this.V, { stoi, itos } = this.vocab;
    let ctx = stoi.get('\n') ?? 0, out = '';
    for (let i = 0; i < maxLen; i++) {
      const base = ctx * V;
      const logits = this.W.slice(base, base + V);
      const probs = softmaxTemp(logits, temp);
      const j = sampleFromProbs(probs);
      const c = itos[j];
      if (c === '\n' && out.length > 8) break;
      out += c; ctx = j;
    }
    return out.trim();
  }
}

/* Textos de exemplo embutidos (corpora pequenos para treinar rápido). */
export const SAMPLE_CORPORA = {
  'Nomes de operadores': [
    'alfa', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel',
    'india', 'juliett', 'kilo', 'lima', 'mike', 'november', 'oscar', 'papa',
    'quebec', 'romeo', 'sierra', 'tango', 'uniform', 'victor', 'whiskey',
    'xray', 'yankee', 'zulu', 'baluarte', 'sentinela', 'guardian', 'vanguarda',
    'falcao', 'corvo', 'lobo', 'aguia', 'pantera', 'tigre', 'dragao', 'fenix'
  ].join('\n'),
  'Frases táticas': [
    'a sentinela observa o horizonte',
    'o radar detecta um alvo em movimento',
    'a equipe alfa avanca pelo flanco norte',
    'mantenha a posicao e aguarde o sinal',
    'inimigo avistado no setor leste',
    'o baluarte resiste a todo cerco',
    'comunicacao segura estabelecida com a base',
    'a vanguarda protege o nucleo a qualquer custo'
  ].join('\n')
};
