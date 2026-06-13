/**
 * /aprendizado — Machine Learning da Memória (issues #193/#194).
 *
 * Painel onde dá pra VER o aprendizado de máquina do site acontecer sobre o
 * banco de memórias do JARVIS (conversas + respostas + deliberações do conselho).
 * Tudo roda no navegador e é SOMENTE LEITURA sobre a memória (#193: ninguém
 * altera o banco por aqui).
 *
 * Seções:
 *   1. Resumo (memórias, vocabulário, assuntos, conceitos).
 *   2. Curva de aprendizado — vocabulário acumulado (lei de Heaps).
 *   3. Assuntos descobertos sozinho — k-means não-supervisionado.
 *   4. Termos mais característicos — ranking TF-IDF.
 *   5. Origem dos dados — donut por fonte.
 *   6. Treinar modelo ao vivo — NeuralBigram, curva de loss caindo + geração.
 *   7. Conexões — Segundo Cérebro (/cerebro) e Git Nexus / Raio-X (/codigo).
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { drawChart } from '../utils/chart-engine.js';
import {
  getMemories, syncRepoMemories, memoryStats, codeMemoryCounts,
  conceptLabel, conceptRoute
} from '../utils/jarvis-brain.js';
import {
  buildCorpus, vocabGrowth, topTerms, sourceCounts, timelineByDay,
  kmeans, demoCorpus
} from '../utils/memory-ml.js';
import { buildVocab, NeuralBigram } from '../utils/llm-mini.js';
import codemap from '../data/codemap.json';

/* rótulo amigável de um arquivo do código (id do codemap → label). */
const CODE_LABEL = new Map((codemap.nodes || []).map((n) => [n.id, n.label || n.id]));

/* Desenha um gráfico só depois que o canvas entrou no layout (precisa de tamanho). */
function deferDraw(canvas, type, data, opts) {
  requestAnimationFrame(() => {
    if (canvas.isConnected) drawChart(canvas, type, data, opts);
  });
}

function chartCanvas(height = 220) {
  return h('canvas', { className: 'apr-canvas', style: { width: '100%', height: height + 'px', display: 'block' } });
}

function section(title, sub, ...children) {
  return h('div', { className: 'apr-section' },
    h('div', { className: 'apr-section__head' },
      h('h2', { className: 'apr-section__title' }, title),
      sub && h('p', { className: 'apr-section__sub u-text-muted' }, sub)),
    ...children);
}

function statBox(v, l, accent) {
  return h('div', { className: 'apr-stat' + (accent ? ' apr-stat--accent' : '') },
    h('div', { className: 'apr-stat__v' }, String(v)),
    h('div', { className: 'apr-stat__l' }, l));
}

export function aprendizadoPage() {
  const page = h('div', { className: 'page-aprendizado' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA & JARVIS'), h('span', null, '›'),
        h('span', null, 'APRENDIZADO')),
      h('h1', { className: 'page-header__title' }, '🧠 Machine Learning da Memória'),
      h('p', { className: 'page-header__description' },
        'Veja o ', h('span', { className: 'u-text-cyan' }, 'aprendizado de máquina'),
        ' do site acontecer sobre o banco de memórias (conversas + respostas + conselho). ',
        'Tudo roda no navegador e é ', h('span', { className: 'u-text-cyan' }, '🔒 somente leitura'),
        ' — este painel nunca altera a memória (issue #193).'))
  );

  const bannerEl = h('div', { className: 'apr-banner', style: { display: 'none' } });
  page.appendChild(bannerEl);

  const statsEl = h('div', { className: 'apr-stats' });
  page.appendChild(statsEl);

  const body = h('div', { className: 'apr-body' });
  page.appendChild(body);

  /* Estado dos controles do k-means + treino (preservado entre re-renders). */
  const ui = { k: 4 };

  /** (Re)constroi todo o painel a partir das memórias atuais. */
  function build() {
    const memories = getMemories();
    let corpus = buildCorpus(memories);
    const isDemo = corpus.length < 8;
    if (isDemo) corpus = demoCorpus();

    /* Banner de demonstração / sync do repo. */
    empty(bannerEl);
    if (isDemo) {
      bannerEl.style.display = '';
      bannerEl.append(
        h('span', { className: 'apr-banner__icon' }, '◐'),
        h('div', null,
          h('strong', null, 'Modo demonstração'),
          h('p', { className: 'u-text-muted' },
            'Ainda há poucas memórias neste navegador, então o painel está aprendendo sobre um corpus de exemplo. ',
            'Converse com o JARVIS (cada pergunta/resposta vira memória) ou puxe o banco versionado do repositório:')),
        h('button', {
          className: 'btn btn--primary btn--sm',
          onclick: async (e) => {
            const btn = e.target; btn.disabled = true; btn.textContent = '⏳ sincronizando…';
            try { const n = await syncRepoMemories(); toast(`Repositório: ${n} memória(s)`, { type: 'success' }); }
            catch { toast('Não consegui puxar o repositório agora', { type: 'warning' }); }
            build();
          }
        }, '☁️ Sincronizar memórias do repo'));
    } else {
      bannerEl.style.display = 'none';
    }

    /* ---- 1. Resumo ---- */
    const growth = vocabGrowth(corpus);
    const st = memoryStats();
    const km0 = kmeans(corpus, ui.k);
    empty(statsEl);
    statsEl.append(
      statBox(corpus.length, 'memórias analisadas', true),
      statBox(growth.vocab, 'vocabulário aprendido'),
      statBox(km0.clusters.length || '—', 'assuntos descobertos'),
      statBox(Object.keys(st.byConcept).length, 'conceitos ligados'));

    empty(body);

    /* ---- 2. Curva de aprendizado (vocabulário) ---- */
    const growthCanvas = chartCanvas(220);
    body.appendChild(section(
      '📈 Curva de aprendizado (vocabulário)',
      'Palavras únicas que o site já aprendeu conforme as memórias chegam (lei de Heaps). Sobe rápido no começo e satura — é o conhecimento acumulando.',
      growthCanvas));
    deferDraw(growthCanvas, 'area',
      { labels: growth.x.map((n) => (n % Math.ceil(growth.x.length / 8 || 1) === 0 ? String(n) : '')), values: growth.y },
      { title: '', palette: 'neon', showLabels: true });

    /* ---- 3. Assuntos descobertos sozinho (k-means) ---- */
    const clustersEl = h('div', { className: 'apr-clusters' });
    const kSlider = h('input', {
      type: 'range', min: '2', max: '8', value: String(ui.k), className: 'apr-slider'
    });
    const kLabel = h('span', { className: 'u-mono' }, `${ui.k} assuntos`);
    kSlider.addEventListener('input', () => { kLabel.textContent = `${kSlider.value} assuntos`; });
    kSlider.addEventListener('change', () => { ui.k = Number(kSlider.value); renderClusters(); });
    function renderClusters() {
      const km = kmeans(corpus, ui.k);
      empty(clustersEl);
      if (!km.used) {
        clustersEl.appendChild(h('p', { className: 'u-text-muted' },
          'Poucas memórias para agrupar — converse mais com o JARVIS ou sincronize o repo.'));
        return;
      }
      km.clusters.forEach((cl, i) => {
        clustersEl.appendChild(h('div', { className: 'apr-cluster' },
          h('div', { className: 'apr-cluster__head' },
            h('span', { className: 'apr-cluster__badge' }, '#' + (i + 1)),
            h('span', { className: 'apr-cluster__size' }, `${cl.size} memórias · ${(cl.share * 100).toFixed(0)}%`)),
          h('div', { className: 'apr-cluster__terms' },
            ...cl.terms.map((t) => h('span', { className: 'apr-term' }, t)))));
      });
    }
    body.appendChild(section(
      '🧩 Assuntos descobertos sozinho',
      'Agrupamento não-supervisionado (k-means + TF-IDF) — o site lê as memórias e descobre os temas sem ninguém rotular. Mova o controle para mais ou menos assuntos.',
      h('div', { className: 'apr-controls' }, kSlider, kLabel),
      clustersEl));
    renderClusters();

    /* ---- 4. Termos mais característicos (TF-IDF) ---- */
    const terms = topTerms(corpus, 12);
    const termsCanvas = chartCanvas(300);
    body.appendChild(section(
      '🔤 Termos que o site aprendeu (TF-IDF)',
      'Ranking dos termos mais característicos do banco de memórias.',
      termsCanvas));
    deferDraw(termsCanvas, 'hbar',
      { labels: terms.map((t) => t.term).reverse(), values: terms.map((t) => +t.score.toFixed(2)).reverse() },
      { title: '', palette: 'neon', showValues: true });

    /* ---- 5. Origem dos dados ---- */
    const sc = sourceCounts(corpus);
    const srcEntries = Object.entries(sc).sort((a, b) => b[1] - a[1]);
    const srcCanvas = chartCanvas(260);
    body.appendChild(section(
      '🗄️ De onde o site aprende',
      'Distribuição das memórias por origem (conversa, resposta da IA, deliberação do conselho…).',
      srcCanvas));
    deferDraw(srcCanvas, 'donut',
      { labels: srcEntries.map((e) => e[0]), values: srcEntries.map((e) => e[1]) },
      { title: '', palette: 'neon', showLabels: true });

    /* ---- 6. Treinar modelo ao vivo (NeuralBigram) ---- */
    body.appendChild(renderTrainer(corpus));

    /* ---- 7. Conexões: Segundo Cérebro + Git Nexus ---- */
    body.appendChild(renderConnections());
  }

  /* ===== Seção 6: treino ao vivo com curva de loss ===== */
  function renderTrainer(corpus) {
    const lossCanvas = chartCanvas(220);
    const statusEl = h('span', { className: 'apr-train__status u-mono u-text-muted' }, 'pronto para treinar');
    const outEl = h('div', { className: 'apr-train__out u-mono', style: { display: 'none' } });
    let training = false;

    const trainBtn = h('button', { className: 'btn btn--primary btn--sm', onclick: start }, '▶ Treinar modelo');
    const genBtn = h('button', { className: 'btn btn--sm', disabled: true, onclick: generate }, '✨ Gerar no estilo do Baluarte');
    let model = null, vocab = null;

    /* Texto de treino: amostra do corpus (cap p/ um passo rápido). */
    function trainingText() {
      const joined = corpus.map((d) => d.text).join('\n').toLowerCase();
      return joined.slice(0, 4000);
    }

    function start() {
      if (training) return;
      const text = trainingText();
      if (text.length < 40) { toast('Corpus pequeno demais para treinar', { type: 'warning' }); return; }
      training = true; trainBtn.disabled = true; genBtn.disabled = true;
      vocab = buildVocab(text);
      model = new NeuralBigram(vocab);
      const pairs = model.prepare(text);
      const losses = [];
      const TOTAL = 60, lr = 28;
      let step = 0;
      statusEl.textContent = `treinando… (${pairs} pares, vocab ${vocab.size})`;

      const tick = () => {
        for (let s = 0; s < 2 && step < TOTAL; s++) { losses.push(model.trainStep(lr)); step++; }
        drawChart(lossCanvas, 'line',
          { labels: losses.map((_, i) => (i % 10 === 0 ? String(i) : '')), values: losses.map((l) => +l.toFixed(3)) },
          { title: '', palette: 'neon', showLabels: true });
        if (step < TOTAL) { requestAnimationFrame(tick); return; }
        training = false; trainBtn.disabled = false; genBtn.disabled = false;
        const first = losses[0], last = losses[losses.length - 1];
        statusEl.textContent = `treino concluído · loss ${first.toFixed(2)} → ${last.toFixed(2)} (caiu ${((1 - last / first) * 100).toFixed(0)}%)`;
        toast('Modelo treinado — a loss caiu, o site aprendeu 🧠', { type: 'success' });
      };
      requestAnimationFrame(tick);
    }

    function generate() {
      if (!model) return;
      outEl.style.display = '';
      outEl.textContent = '“' + (model.generate(180, 0.8) || '…') + '”';
    }

    return section(
      '⚙️ Treinar um modelo ao vivo',
      'Uma rede neural (bigrama, gradiente de verdade) aprende a "falar" a partir das próprias memórias do site. Veja a loss CAINDO — é o aprendizado acontecendo do zero.',
      h('div', { className: 'apr-controls' }, trainBtn, genBtn, statusEl),
      lossCanvas, outEl);
  }

  /* ===== Seção 7: conexões com Segundo Cérebro e Git Nexus ===== */
  function renderConnections() {
    const st = memoryStats();
    const concepts = Object.entries(st.byConcept).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const code = Object.entries(codeMemoryCounts()).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const cerebroCol = h('div', { className: 'apr-conn__col' },
      h('h3', null, '🕸️ Segundo Cérebro'),
      concepts.length
        ? h('div', { className: 'apr-conn__chips' },
            ...concepts.map(([id, n]) => h('span', {
              className: 'apr-conn__chip', title: 'Abrir no Segundo Cérebro',
              onclick: () => router.navigate(conceptRoute(id) || '/cerebro')
            }, `${conceptLabel(id)} · ${n}`)))
        : h('p', { className: 'u-text-muted' }, 'Nenhum conceito ligado ainda.'),
      h('a', { className: 'btn btn--ghost btn--sm', href: '#/cerebro' }, 'Abrir Segundo Cérebro →'));

    const codeCol = h('div', { className: 'apr-conn__col' },
      h('h3', null, '🗺️ Git Nexus · Raio-X do Código'),
      code.length
        ? h('div', { className: 'apr-conn__chips' },
            ...code.map(([id, n]) => h('span', {
              className: 'apr-conn__chip', title: 'Abrir o Raio-X do Código',
              onclick: () => router.navigate('/codigo')
            }, `${CODE_LABEL.get(id) || id} · ${n}`)))
        : h('p', { className: 'u-text-muted' }, 'Nenhum arquivo ligado ainda — as memórias passam a citar arquivos conforme você conversa sobre o código.'),
      h('a', { className: 'btn btn--ghost btn--sm', href: '#/codigo' }, 'Abrir Raio-X (Git Nexus) →'));

    return section(
      '🔗 Conexões do aprendizado',
      'O que o site aprendeu se liga ao grafo de conhecimento (Segundo Cérebro) e ao próprio código (Git Nexus / Raio-X) — fechando o ciclo dos issues #193/#194.',
      h('div', { className: 'apr-conn' }, cerebroCol, codeCol));
  }

  build();
  /* Abre já tentando puxar a memória versionada do repositório (best-effort). */
  syncRepoMemories().then((n) => { if (n) build(); }).catch(() => {});
  return page;
}
