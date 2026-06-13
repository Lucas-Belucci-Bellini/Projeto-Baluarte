/**
 * Memory ML — machine learning de verdade, no navegador, sobre o banco de
 * memórias do JARVIS (issues #193/#194: "ver o machine learning do site").
 *
 * Tudo aqui é SOMENTE LEITURA sobre o corpus (a página nunca altera a memória,
 * como pede o #193). Sem dependências externas, sem servidor:
 *
 *   - buildCorpus()   — normaliza as memórias em documentos tokenizados.
 *   - vocabGrowth()   — curva de aprendizado: vocabulário acumulado x nº de
 *                       memórias (lei de Heaps). É o "quanto o site já aprendeu".
 *   - topTerms()      — ranking TF-IDF global (os termos que o site aprendeu).
 *   - kmeans()        — agrupa as memórias em ASSUNTOS sozinho (não-supervisionado),
 *                       cosseno sobre vetores TF-IDF, init k-means++ determinístico.
 *   - timelineByDay() — acúmulo de conhecimento ao longo do tempo.
 *
 * O treino com curva de loss ao vivo usa o NeuralBigram de llm-mini.js; a página
 * (pages/aprendizado.js) costura este motor com os gráficos e o modelo.
 */

import { tokenize } from './jarvis-recall.js';

/* RNG determinístico (mulberry32) — k-means reproduzível para teste/captura. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Normaliza memórias em documentos tokenizados (descarta as quase vazias).
 * @param {Array<{text,source,ts,conceptIds,codeIds}>} memories
 * @returns {Array<{text,source,ts,tokens,conceptIds,codeIds}>}
 */
export function buildCorpus(memories) {
  const out = [];
  for (const m of memories || []) {
    const tokens = tokenize(m.text || '');
    if (tokens.length < 2) continue;
    out.push({
      text: m.text || '',
      source: m.source || 'jarvis',
      ts: m.ts || 0,
      tokens,
      conceptIds: m.conceptIds || [],
      codeIds: m.codeIds || []
    });
  }
  return out;
}

/** Document frequency de cada termo no corpus. */
function docFreq(corpus) {
  const df = new Map();
  for (const d of corpus) {
    for (const w of new Set(d.tokens)) df.set(w, (df.get(w) || 0) + 1);
  }
  return df;
}

/**
 * Curva de aprendizado do vocabulário (lei de Heaps): à medida que as memórias
 * chegam (em ordem cronológica), conta o vocabulário ÚNICO acumulado.
 * @returns {{x:number[], y:number[], vocab:number}} x = nº de memórias, y = vocabulário
 */
export function vocabGrowth(corpus) {
  const ordered = corpus.slice().sort((a, b) => (a.ts || 0) - (b.ts || 0));
  const seen = new Set();
  const x = [], y = [];
  ordered.forEach((d, i) => {
    for (const w of d.tokens) seen.add(w);
    x.push(i + 1);
    y.push(seen.size);
  });
  return { x, y, vocab: seen.size };
}

/**
 * Ranking TF-IDF global: termos mais característicos do corpus inteiro.
 * score(termo) = (frequência total) × idf, idf = log(1 + N / (df + 1)).
 * @returns {Array<{term:string, score:number, df:number, tf:number}>}
 */
export function topTerms(corpus, k = 12) {
  const df = docFreq(corpus);
  const tf = new Map();
  for (const d of corpus) for (const w of d.tokens) tf.set(w, (tf.get(w) || 0) + 1);
  const N = corpus.length || 1;
  const scored = [];
  for (const [term, f] of tf) {
    const idf = Math.log(1 + N / ((df.get(term) || 0) + 1));
    scored.push({ term, score: f * idf, df: df.get(term) || 0, tf: f });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

/** Contagem de memórias por origem (conversa/resposta/conselho/…). */
export function sourceCounts(corpus) {
  const c = {};
  for (const d of corpus) c[d.source] = (c[d.source] || 0) + 1;
  return c;
}

/** Acúmulo de memórias por dia (para o gráfico de área da linha do tempo). */
export function timelineByDay(corpus) {
  const byDay = new Map();
  for (const d of corpus) {
    if (!d.ts) continue;
    const key = new Date(d.ts).toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) || 0) + 1);
  }
  const days = [...byDay.keys()].sort();
  let acc = 0;
  return days.map((day) => { acc += byDay.get(day); return { day, count: byDay.get(day), acc }; });
}

/* ===== Vetorização TF-IDF esparsa (para o k-means) ===== */

function buildVectorSpace(corpus, vocabCap) {
  const df = docFreq(corpus);
  const N = corpus.length || 1;
  /* Limita o vocabulário aos termos mais frequentes (df), descartando
     hapax legomena (df=1, ruído) — mantém o k-means rápido e estável. */
  const terms = [...df.entries()]
    .filter(([, f]) => f >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, vocabCap)
    .map(([t]) => t);
  const termIdx = new Map(terms.map((t, i) => [t, i]));
  const idf = terms.map((t) => Math.log(1 + N / ((df.get(t) || 0) + 1)));

  const vectors = corpus.map((d) => {
    const v = new Map();
    for (const w of d.tokens) {
      const j = termIdx.get(w);
      if (j != null) v.set(j, (v.get(j) || 0) + 1);
    }
    let norm = 0;
    for (const [j, f] of v) { const x = f * idf[j]; v.set(j, x); norm += x * x; }
    norm = Math.sqrt(norm) || 1;
    for (const [j, x] of v) v.set(j, x / norm);
    return v;
  });
  return { terms, idf, vectors };
}

function cosineSparse(a, b) {
  /* vetores já normalizados → cosseno = produto escalar */
  let dot = 0;
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  for (const [j, x] of small) { const y = large.get(j); if (y) dot += x * y; }
  return dot;
}

/**
 * K-means não-supervisionado: descobre os ASSUNTOS das memórias sozinho.
 * Cosseno sobre TF-IDF, init k-means++ com RNG determinístico (seed).
 *
 * @param {Array} corpus  saída de buildCorpus()
 * @param {number} k      nº de assuntos
 * @param {object} opts   { iters=12, vocabCap=300, seed=42 }
 * @returns {{clusters:Array<{terms:string[], size:number, members:number[], share:number}>, vocabSize:number, iterations:number, used:boolean}}
 */
export function kmeans(corpus, k = 4, { iters = 12, vocabCap = 300, seed = 42 } = {}) {
  const docs = corpus.filter((d) => d.tokens.length >= 2);
  if (docs.length < k * 2) {
    return { clusters: [], vocabSize: 0, iterations: 0, used: false };
  }
  const { terms, vectors } = buildVectorSpace(docs, vocabCap);
  if (!terms.length) return { clusters: [], vocabSize: 0, iterations: 0, used: false };

  const rand = mulberry32(seed);
  const n = vectors.length;

  /* ---- init k-means++ (em distância cosseno = 1 - similaridade) ---- */
  const centroIdx = [Math.floor(rand() * n)];
  while (centroIdx.length < k) {
    const dist = vectors.map((v) => {
      let best = 0;
      for (const ci of centroIdx) best = Math.max(best, cosineSparse(v, vectors[ci]));
      return Math.max(0, 1 - best); // distância ao centróide mais próximo
    });
    const sum = dist.reduce((s, d) => s + d * d, 0);
    if (sum <= 0) { // degenerado: escolhe qualquer um ainda não usado
      let j = 0; while (centroIdx.includes(j) && j < n) j++;
      centroIdx.push(Math.min(j, n - 1));
      continue;
    }
    let r = rand() * sum, pick = 0;
    for (let i = 0; i < n; i++) { r -= dist[i] * dist[i]; if (r <= 0) { pick = i; break; } }
    centroIdx.push(pick);
  }

  /* centróides como mapas densos-esparsos (cópia dos docs iniciais) */
  let centroids = centroIdx.map((ci) => new Map(vectors[ci]));
  let assign = new Array(n).fill(0);
  let realIters = 0;

  for (let it = 0; it < iters; it++) {
    realIters++;
    let moved = false;
    /* atribui cada doc ao centróide mais similar */
    for (let i = 0; i < n; i++) {
      let best = -1, bestC = 0;
      for (let c = 0; c < k; c++) {
        const sim = cosineSparse(vectors[i], centroids[c]);
        if (sim > best) { best = sim; bestC = c; }
      }
      if (assign[i] !== bestC) { assign[i] = bestC; moved = true; }
    }
    /* recomputa centróides = média dos vetores do cluster, renormalizada */
    const sums = Array.from({ length: k }, () => new Map());
    const counts = new Array(k).fill(0);
    for (let i = 0; i < n; i++) {
      const c = assign[i]; counts[c]++;
      for (const [j, x] of vectors[i]) sums[c].set(j, (sums[c].get(j) || 0) + x);
    }
    centroids = sums.map((s, c) => {
      const m = new Map(); let norm = 0;
      const cnt = counts[c] || 1;
      for (const [j, x] of s) { const v = x / cnt; m.set(j, v); norm += v * v; }
      norm = Math.sqrt(norm) || 1;
      for (const [j, v] of m) m.set(j, v / norm);
      return m;
    });
    if (!moved && it > 0) break;
  }

  /* rótulo de cada cluster = termos de maior peso no centróide */
  const clusters = centroids.map((cen, c) => {
    const members = [];
    for (let i = 0; i < n; i++) if (assign[i] === c) members.push(i);
    const top = [...cen.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([j]) => terms[j]);
    return { terms: top, size: members.length, members, share: members.length / n };
  }).filter((cl) => cl.size > 0)
    .sort((a, b) => b.size - a.size);

  return { clusters, vocabSize: terms.length, iterations: realIters, used: true };
}

/**
 * Corpus de demonstração — usado quando ainda não há memórias suficientes
 * (navegador novo, sem sync do repo), para o painel nunca ficar vazio.
 * Estilo das conversas do Baluarte (operador ↔ JARVIS ↔ conselho).
 */
export function demoCorpus() {
  const now = Date.now();
  const day = 86400000;
  const seed = [
    ['conversa', 'como faço o machine learning funcionar junto com o segundo cerebro e o git nexus'],
    ['resposta', 'integre o raio-x do codigo ao knowledge graph e treine um modelo sobre as memorias'],
    ['conselho', 'o conselho recomenda indexar o codigo no git nexus antes de treinar o modelo de aprendizado'],
    ['conversa', 'quero ver o aprendizado de maquina do site acontecendo no painel'],
    ['resposta', 'o painel mostra a curva de vocabulario os assuntos descobertos e a loss do modelo caindo'],
    ['conversa', 'o jarvis precisa lembrar das conversas anteriores entre sessoes'],
    ['resposta', 'a memoria duravel guarda cada pergunta e resposta no banco versionado do repositorio'],
    ['conselho', 'consenso salvar pergunta resposta e deliberacoes do conselho na branch jarvis memory'],
    ['conversa', 'fale das equipes de elite alfa bravo charlie e do arsenal tatico'],
    ['resposta', 'as equipes seguem o alfabeto otan e o arsenal reune armas reais por categoria'],
    ['conversa', 'quero melhorar o design do site com a interface estilo rockstar e steam'],
    ['resposta', 'o motor de universos troca a skin e o redesign foca em home arsenal e biblioteca'],
    ['conselho', 'o conselho aprova um redesign cinematografico com navegacao eficiente estilo steam'],
    ['conversa', 'conecte a api do claude no servidor da vercel sem expor a chave no navegador'],
    ['resposta', 'a central de apis detecta a chave claude fable e fala com a anthropic pelo servidor'],
    ['conselho', 'consenso usar o claude no servidor como membro do conselho de inteligencias artificiais'],
    ['conversa', 'o editor de codigo precisa de atalhos rapidos e realce de sintaxe correto'],
    ['resposta', 'o editor ganhou autocomplete com snippets psvm sout e o highlight de numeros consertado'],
    ['conversa', 'mostre o radar de cambio com dolar euro e bitcoin com historico'],
    ['resposta', 'o radar do cambio acompanha dolar euro e bitcoin e guarda o historico de cotacoes']
  ];
  return buildCorpus(seed.map(([source, text], i) => ({
    text, source, ts: now - (seed.length - i) * day * 0.7,
    conceptIds: [], codeIds: []
  })));
}
