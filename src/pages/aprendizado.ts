/**
 * /aprendizado — Machine Learning da Memória.
 *
 * Painel somente leitura sobre as memórias do JARVIS, com corpus demonstrativo
 * quando o navegador ainda possui poucos registros.
 */

import '../styles/aprendizado.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { drawChart } from '../utils/chart-engine.js';
import type { ChartData, ChartOptions } from '../utils/chart-engine.js';
import {
  codeMemoryCounts,
  conceptLabel,
  conceptRoute,
  getMemories,
  memoryStats,
  syncRepoMemories,
} from '../utils/jarvis-brain.js';
import {
  buildCorpus,
  demoCorpus,
  kmeans,
  sourceCounts,
  topTerms,
  vocabGrowth,
} from '../utils/memory-ml.js';
import type { MemoryCorpusDocument } from '../utils/memory-ml.js';
import { buildVocab, NeuralBigram } from '../utils/llm-mini.js';
import type { CharVocabulary } from '../utils/llm-mini.js';
import codemap from '../data/codemap.json';

interface CodeMapNode {
  readonly id: string;
  readonly label?: string;
}

interface CodeMapData {
  readonly nodes?: readonly CodeMapNode[];
}

const codeMapData = codemap as unknown as CodeMapData;
const codeLabels = new Map((codeMapData.nodes ?? []).map((node) => [node.id, node.label || node.id]));

function deferDraw(canvas: HTMLCanvasElement, type: string, data: ChartData, options: ChartOptions): void {
  requestAnimationFrame(() => {
    if (canvas.isConnected) drawChart(canvas, type, data, options);
  });
}

function chartCanvas(height = 220): HTMLCanvasElement {
  return h('canvas', {
    className: 'apr-canvas',
    style: { width: '100%', height: `${height}px`, display: 'block' },
  });
}

function section(title: string, subtitle: string, ...children: Node[]): HTMLDivElement {
  return h('div', { className: 'apr-section' },
    h('div', { className: 'apr-section__head' },
      h('h2', { className: 'apr-section__title' }, title),
      subtitle && h('p', { className: 'apr-section__sub u-text-muted' }, subtitle)),
    ...children,
  );
}

function statBox(value: string | number, label: string, accent = false): HTMLDivElement {
  return h('div', { className: `apr-stat${accent ? ' apr-stat--accent' : ''}` },
    h('div', { className: 'apr-stat__v' }, String(value)),
    h('div', { className: 'apr-stat__l' }, label));
}

export function aprendizadoPage(): HTMLDivElement {
  const page = h('div', { className: 'page-aprendizado' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA & JARVIS'), h('span', null, '›'), h('span', null, 'APRENDIZADO')),
      h('h1', { className: 'page-header__title' }, '🧠 Machine Learning da Memória'),
      h('p', { className: 'page-header__description' },
        'Veja o ', h('span', { className: 'u-text-cyan' }, 'aprendizado de máquina'),
        ' do site acontecer sobre o banco de memórias (conversas + respostas + conselho). ',
        'Tudo roda no navegador e é ', h('span', { className: 'u-text-cyan' }, '🔒 somente leitura'),
        ' — este painel nunca altera a memória (issue #193).'),
    ),
  );
  const banner = h('div', { className: 'apr-banner', style: { display: 'none' } });
  page.appendChild(banner);
  const stats = h('div', { className: 'apr-stats' });
  page.appendChild(stats);
  const body = h('div', { className: 'apr-body' });
  page.appendChild(body);
  const ui = { k: 4 };

  function build(): void {
    const memories = getMemories();
    let corpus = buildCorpus(memories);
    const isDemo = corpus.length < 8;
    if (isDemo) corpus = demoCorpus();
    empty(banner);
    if (isDemo) {
      banner.style.display = '';
      const syncButton = h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: async (event: Event) => {
          const target = event.currentTarget;
          if (!(target instanceof HTMLButtonElement)) return;
          target.disabled = true;
          target.textContent = '⏳ sincronizando…';
          try {
            const count = await syncRepoMemories();
            toast(`Repositório: ${count} memória(s)`, { type: 'success' });
          } catch {
            toast('Não consegui puxar o repositório agora', { type: 'warning' });
          }
          build();
        },
      }, '☁️ Sincronizar memórias do repo');
      banner.append(
        h('span', { className: 'apr-banner__icon' }, '◐'),
        h('div', null,
          h('strong', null, 'Modo demonstração'),
          h('p', { className: 'u-text-muted' },
            'Ainda há poucas memórias neste navegador, então o painel está aprendendo sobre um corpus de exemplo. ',
            'Converse com o JARVIS (cada pergunta/resposta vira memória) ou puxe o banco versionado do repositório:')),
        syncButton,
      );
    } else {
      banner.style.display = 'none';
    }

    const growth = vocabGrowth(corpus);
    const memoryStatistics = memoryStats();
    const initialClusters = kmeans(corpus, ui.k);
    empty(stats);
    stats.append(
      statBox(corpus.length, 'memórias analisadas', true),
      statBox(growth.vocab, 'vocabulário aprendido'),
      statBox(initialClusters.clusters.length || '—', 'assuntos descobertos'),
      statBox(Object.keys(memoryStatistics.byConcept).length, 'conceitos ligados'),
    );
    empty(body);

    const growthCanvas = chartCanvas(220);
    body.appendChild(section(
      '📈 Curva de aprendizado (vocabulário)',
      'Palavras únicas que o site já aprendeu conforme as memórias chegam (lei de Heaps). Sobe rápido no começo e satura — é o conhecimento acumulando.',
      growthCanvas,
    ));
    deferDraw(growthCanvas, 'area', {
      labels: growth.x.map((value) => (value % Math.ceil(growth.x.length / 8 || 1) === 0 ? String(value) : '')),
      values: growth.y,
    }, { title: '', palette: 'neon', showLabels: true });

    const clustersElement = h('div', { className: 'apr-clusters' });
    const kSlider = h('input', { type: 'range', min: '2', max: '8', value: String(ui.k), className: 'apr-slider' });
    const kLabel = h('span', { className: 'u-mono' }, `${ui.k} assuntos`);
    kSlider.addEventListener('input', () => { kLabel.textContent = `${kSlider.value} assuntos`; });
    kSlider.addEventListener('change', () => { ui.k = Number(kSlider.value); renderClusters(); });
    const renderClusters = (): void => {
      const result = kmeans(corpus, ui.k);
      empty(clustersElement);
      if (!result.used) {
        clustersElement.appendChild(h('p', { className: 'u-text-muted' },
          'Poucas memórias para agrupar — converse mais com o JARVIS ou sincronize o repo.'));
        return;
      }
      result.clusters.forEach((cluster, index) => {
        clustersElement.appendChild(h('div', { className: 'apr-cluster' },
          h('div', { className: 'apr-cluster__head' },
            h('span', { className: 'apr-cluster__badge' }, `#${index + 1}`),
            h('span', { className: 'apr-cluster__size' }, `${cluster.size} memórias · ${(cluster.share * 100).toFixed(0)}%`)),
          h('div', { className: 'apr-cluster__terms' },
            ...cluster.terms.map((term) => h('span', { className: 'apr-term' }, term))),
        ));
      });
    };
    body.appendChild(section(
      '🧩 Assuntos descobertos sozinho',
      'Agrupamento não-supervisionado (k-means + TF-IDF) — o site lê as memórias e descobre os temas sem ninguém rotular. Mova o controle para mais ou menos assuntos.',
      h('div', { className: 'apr-controls' }, kSlider, kLabel), clustersElement,
    ));
    renderClusters();

    const terms = topTerms(corpus, 12);
    const termsCanvas = chartCanvas(300);
    body.appendChild(section('🔤 Termos que o site aprendeu (TF-IDF)', 'Ranking dos termos mais característicos do banco de memórias.', termsCanvas));
    deferDraw(termsCanvas, 'hbar', {
      labels: terms.map((term) => term.term).reverse(),
      values: terms.map((term) => Number(term.score.toFixed(2))).reverse(),
    }, { title: '', palette: 'neon', showValues: true });

    const sourceEntries = Object.entries(sourceCounts(corpus)).sort((first, second) => second[1] - first[1]);
    const sourceCanvas = chartCanvas(260);
    body.appendChild(section('🗄️ De onde o site aprende', 'Distribuição das memórias por origem (conversa, resposta da IA, deliberação do conselho…).', sourceCanvas));
    deferDraw(sourceCanvas, 'donut', {
      labels: sourceEntries.map(([source]) => source),
      values: sourceEntries.map(([, count]) => count),
    }, { title: '', palette: 'neon', showLabels: true });

    body.appendChild(renderTrainer(corpus));
    body.appendChild(renderConnections());
  }

  function renderTrainer(corpus: readonly MemoryCorpusDocument[]): HTMLDivElement {
    const lossCanvas = chartCanvas(220);
    const status = h('span', { className: 'apr-train__status u-mono u-text-muted' }, 'pronto para treinar');
    const output = h('div', { className: 'apr-train__out u-mono', style: { display: 'none' } });
    let training = false;
    let model: NeuralBigram | null = null;
    const trainButton = h('button', { className: 'btn btn--primary btn--sm', onclick: start }, '▶ Treinar modelo');
    const generateButton = h('button', { className: 'btn btn--sm', disabled: true, onclick: generate }, '✨ Gerar no estilo do Baluarte');
    const trainingText = (): string => corpus.map((document) => document.text).join('\n').toLowerCase().slice(0, 4000);
    function start(): void {
      if (training) return;
      const text = trainingText();
      if (text.length < 40) {
        toast('Corpus pequeno demais para treinar', { type: 'warning' });
        return;
      }
      training = true;
      trainButton.disabled = true;
      generateButton.disabled = true;
      const vocabulary: CharVocabulary = buildVocab(text);
      const trainingModel = new NeuralBigram(vocabulary);
      model = trainingModel;
      const pairs = trainingModel.prepare(text);
      const losses: number[] = [];
      const totalSteps = 60;
      const learningRate = 28;
      let step = 0;
      status.textContent = `treinando… (${pairs} pares, vocab ${vocabulary.size})`;
      const tick = (): void => {
        for (let count = 0; count < 2 && step < totalSteps; count += 1) {
          losses.push(trainingModel.trainStep(learningRate));
          step += 1;
        }
        drawChart(lossCanvas, 'line', {
          labels: losses.map((_, index) => (index % 10 === 0 ? String(index) : '')),
          values: losses.map((loss) => Number(loss.toFixed(3))),
        }, { title: '', palette: 'neon', showLabels: true });
        if (step < totalSteps) {
          requestAnimationFrame(tick);
          return;
        }
        training = false;
        trainButton.disabled = false;
        generateButton.disabled = false;
        const first = losses[0] ?? 0;
        const last = losses[losses.length - 1] ?? 0;
        status.textContent = `treino concluído · loss ${first.toFixed(2)} → ${last.toFixed(2)} (caiu ${((1 - last / first) * 100).toFixed(0)}%)`;
        toast('Modelo treinado — a loss caiu, o site aprendeu 🧠', { type: 'success' });
      };
      requestAnimationFrame(tick);
    }
    function generate(): void {
      if (!model) return;
      output.style.display = '';
      output.textContent = `“${model.generate(180, 0.8) || '…'}”`;
    }
    return section(
      '⚙️ Treinar um modelo ao vivo',
      'Uma rede neural (bigrama, gradiente de verdade) aprende a "falar" a partir das próprias memórias do site. Veja a loss CAINDO — é o aprendizado acontecendo do zero.',
      h('div', { className: 'apr-controls' }, trainButton, generateButton, status), lossCanvas, output,
    );
  }

  function renderConnections(): HTMLDivElement {
    const statistics = memoryStats();
    const concepts = Object.entries(statistics.byConcept).sort((first, second) => second[1] - first[1]).slice(0, 8);
    const code = Object.entries(codeMemoryCounts()).sort((first, second) => second[1] - first[1]).slice(0, 8);
    const cerebroColumn = h('div', { className: 'apr-conn__col' },
      h('h3', null, '🕸️ Segundo Cérebro'),
      concepts.length
        ? h('div', { className: 'apr-conn__chips' },
          ...concepts.map(([id, count]) => h('span', {
            className: 'apr-conn__chip', title: 'Abrir no Segundo Cérebro',
            onclick: () => router.navigate(conceptRoute(id) || '/cerebro'),
          }, `${conceptLabel(id)} · ${count}`)))
        : h('p', { className: 'u-text-muted' }, 'Nenhum conceito ligado ainda.'),
      h('a', { className: 'btn btn--ghost btn--sm', href: '#/cerebro' }, 'Abrir Segundo Cérebro →'),
    );
    const codeColumn = h('div', { className: 'apr-conn__col' },
      h('h3', null, '🗺️ Git Nexus · Raio-X do Código'),
      code.length
        ? h('div', { className: 'apr-conn__chips' },
          ...code.map(([id, count]) => h('span', {
            className: 'apr-conn__chip', title: 'Abrir o Raio-X do Código', onclick: () => router.navigate('/codigo'),
          }, `${codeLabels.get(id) || id} · ${count}`)))
        : h('p', { className: 'u-text-muted' }, 'Nenhum arquivo ligado ainda — as memórias passam a citar arquivos conforme você conversa sobre o código.'),
      h('a', { className: 'btn btn--ghost btn--sm', href: '#/codigo' }, 'Abrir Raio-X (Git Nexus) →'),
    );
    return section(
      '🔗 Conexões do aprendizado',
      'O que o site aprendeu se liga ao grafo de conhecimento (Segundo Cérebro) e ao próprio código (Git Nexus / Raio-X) — fechando o ciclo dos issues #193/#194.',
      h('div', { className: 'apr-conn' }, cerebroColumn, codeColumn),
    );
  }

  build();
  void syncRepoMemories().then((count) => { if (count) build(); }).catch(() => undefined);
  return page;
}
