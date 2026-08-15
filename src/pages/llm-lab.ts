/**
 * Página /llm-lab — Mini-LLM do Zero.
 *
 * A UI continua treinando N-grama ou NeuralBigram no navegador, mostrando a
 * loss em Canvas e permitindo gerar texto com temperatura configurável.
 */

import '../styles/llm-lab.css';
import { h, empty, cx } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { buildVocab, NgramModel, NeuralBigram, SAMPLE_CORPORA } from '../utils/llm-mini.js';
import type { CharVocabulary } from '../utils/llm-mini.js';

type ModelType = 'neural' | 'ngram';
type TrainableModel = NgramModel | NeuralBigram;

export function llmLabPage(): HTMLDivElement {
  const page = h('div', { className: 'page-llm' });
  let modelType: ModelType = 'neural';
  let order = 3;
  let temperature = 0.9;
  let model: TrainableModel | null = null;
  let animationFrame: number | null = null;

  page.append(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SISTEMA'),
      h('span', null, '›'), h('span', null, 'MINI-LLM'),
    ),
    h('h1', { className: 'page-header__title' }, '🧠 Mini-LLM do Zero'),
    h('p', { className: 'page-header__description' },
      'Treine um modelo de linguagem ', h('span', { className: 'u-text-cyan' }, 'de verdade, do zero'),
      ', no seu navegador — e veja a IA aprender (a loss caindo) e gerar texto.',
    ),
  ));

  const textArea = h('textarea', { className: 'input llm-corpus', rows: 6, spellcheck: false });
  const corpusKeys = Object.keys(SAMPLE_CORPORA);
  textArea.value = SAMPLE_CORPORA[corpusKeys[0]] ?? '';
  const corpusSelect = h('select', {
    className: 'input',
    onchange: (event: Event) => {
      if (!(event.target instanceof HTMLSelectElement)) return;
      const corpus = SAMPLE_CORPORA[event.target.value];
      if (corpus !== undefined) textArea.value = corpus;
    },
  },
  ...corpusKeys.map((key) => h('option', { value: key }, key)),
  h('option', { value: '__custom' }, 'Personalizado (digite abaixo)'),
  );

  const modelButtons = h('div', { className: 'llm-seg' },
    segmentButton('neural', '◆ Rede neural (treina)'),
    segmentButton('ngram', '▦ N-grama (conta)'),
  );
  const params = h('div', { className: 'llm-params' });

  function segmentButton(id: ModelType, label: string): HTMLButtonElement {
    return h('button', {
      className: cx('llm-seg__btn', modelType === id && 'is-active'),
      'data-m': id,
      onclick: () => {
        modelType = id;
        modelButtons.querySelectorAll('.llm-seg__btn').forEach((button) => {
          if (button instanceof HTMLElement) button.classList.toggle('is-active', button.dataset.m === id);
        });
        renderParams();
      },
    }, label);
  }

  function renderParams(): void {
    empty(params);
    if (modelType === 'ngram') {
      const select = h('select', {
        className: 'input',
        onchange: (event: Event) => {
          if (event.target instanceof HTMLSelectElement) order = Number.parseInt(event.target.value, 10);
        },
      }, ...[1, 2, 3, 4].map((value) => h('option', {
        value,
        selected: value === order,
      }, `ordem ${value}`)));
      params.append(h('label', { className: 'llm-lbl' }, h('span', null, 'CONTEXTO (n)'), select));
    } else {
      params.append(h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } },
        'Rede de 1 camada (matriz V×V) treinada por gradiente: 150 passos, softmax + cross-entropy.',
      ));
    }
  }

  const status = h('div', { className: 'llm-status u-mono u-text-muted' }, 'sem treino ainda');
  const lossCanvas = h('canvas', { className: 'llm-loss', width: 480, height: 120 });
  const trainButton = h('button', { className: 'btn btn--primary', onclick: train }, '⚙ Treinar');

  function train(): void {
    const text = textArea.value.trim();
    if (text.length < 20) {
      toast('Cole um texto maior (≥ 20 caracteres).', { type: 'warning' });
      return;
    }
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    generateButton.disabled = true;
    const vocabulary: CharVocabulary = buildVocab(text);

    if (modelType === 'ngram') {
      const nextModel = new NgramModel(order);
      const info = nextModel.train(text);
      model = nextModel;
      status.textContent = `n-grama (ordem ${order}) treinado · ${info.contexts} contextos · vocab ${vocabulary.size}`;
      clearCanvas();
      generateButton.disabled = false;
      toast('Modelo treinado! Agora gere texto.', { type: 'success' });
      return;
    }

    const neural = new NeuralBigram(vocabulary);
    const pairs = neural.prepare(text);
    const losses: number[] = [];
    const maximumSteps = 150;
    let step = 0;
    status.textContent = `treinando rede neural… vocab ${vocabulary.size}, ${pairs} pares`;

    function tick(): void {
      for (let count = 0; count < 8 && step < maximumSteps; count += 1) {
        losses.push(neural.trainStep(30));
        step += 1;
      }
      drawLoss(losses);
      const currentLoss = losses[losses.length - 1] ?? 0;
      status.textContent = `passo ${step}/${maximumSteps} · loss ${currentLoss.toFixed(3)}`;
      if (step < maximumSteps) {
        animationFrame = requestAnimationFrame(tick);
      } else {
        model = neural;
        generateButton.disabled = false;
        status.textContent = `rede treinada · loss final ${currentLoss.toFixed(3)} (começou em ${(losses[0] ?? 0).toFixed(3)})`;
        toast('Rede treinada! A loss caiu — ela aprendeu.', { type: 'success' });
      }
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function clearCanvas(): void {
    const context = lossCanvas.getContext('2d');
    if (!context) return;
    context.fillStyle = '#020409';
    context.fillRect(0, 0, lossCanvas.width, lossCanvas.height);
    context.fillStyle = '#93a4bf';
    context.font = '12px "JetBrains Mono", monospace';
    context.fillText('(n-grama não usa gradiente — sem curva de loss)', 14, 64);
  }

  function drawLoss(losses: readonly number[]): void {
    const context = lossCanvas.getContext('2d');
    if (!context) return;
    const width = lossCanvas.width;
    const height = lossCanvas.height;
    context.fillStyle = '#020409';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = 'rgba(150,180,255,0.1)';
    context.lineWidth = 1;
    for (let index = 1; index < 4; index += 1) {
      const y = (height / 4) * index;
      context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
    }
    if (losses.length < 2) return;
    let minimum = Infinity;
    let maximum = -Infinity;
    losses.forEach((loss) => {
      minimum = Math.min(minimum, loss);
      maximum = Math.max(maximum, loss);
    });
    const padding = 8;
    const span = maximum - minimum || 1;
    context.strokeStyle = '#d4a24e';
    context.lineWidth = 2;
    context.beginPath();
    losses.forEach((loss, index) => {
      const x = padding + (index / (losses.length - 1)) * (width - 2 * padding);
      const y = padding + (1 - (loss - minimum) / span) * (height - 2 * padding);
      if (index === 0) context.moveTo(x, y); else context.lineTo(x, y);
    });
    context.stroke();
    context.fillStyle = '#e8c07a';
    context.font = '11px "JetBrains Mono", monospace';
    context.fillText(`loss ${(losses[losses.length - 1] ?? 0).toFixed(2)}`, width - 86, 16);
  }

  const temperatureValue = h('span', { className: 'llm-slider__val u-mono' }, temperature.toFixed(1));
  const temperatureSlider = h('input', {
    type: 'range', min: 0.3, max: 1.4, step: 0.1, value: temperature, className: 'llm-slider',
    oninput: (event: Event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      temperature = Number.parseFloat(event.target.value);
      temperatureValue.textContent = temperature.toFixed(1);
    },
  });
  const output = h('pre', { className: 'llm-out u-mono' }, '—');
  const generateButton = h('button', {
    className: 'btn btn--primary',
    disabled: true,
    onclick: () => {
      if (!model) return;
      const generated = model.generate(modelType === 'ngram' ? 200 : 80, temperature);
      output.textContent = generated || '(vazio — treine com mais texto)';
    },
  }, '✦ Gerar texto');

  page.append(
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '1. Corpus (texto de treino)'),
      h('label', { className: 'llm-lbl' }, h('span', null, 'EXEMPLO'), corpusSelect), textArea,
    ),
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '2. Modelo'), modelButtons, params,
      h('div', { className: 'llm-row' }, trainButton, status), lossCanvas,
    ),
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '3. Gerar'),
      h('div', { className: 'llm-row' },
        h('label', { className: 'llm-lbl llm-lbl--inline' }, h('span', null, 'TEMPERATURA'),
          h('div', { className: 'llm-slider-wrap' }, temperatureSlider, temperatureValue)),
        generateButton,
      ), output,
    ),
    h('div', { className: 'llm-card card llm-explain' },
      h('h2', { className: 'llm-h2' }, 'Como funciona'),
      h('p', null,
        'Cada caractere vira um número (vocabulário). A ', h('b', null, 'rede neural'),
        ' aprende, por tentativa e erro (gradiente), a prever o próximo caractere — a ',
        h('span', { className: 'u-text-cyan' }, 'loss caindo'),
        ' mostra o aprendizado. O ', h('b', null, 'n-grama'),
        ' apenas conta quais caracteres seguem quais. Na geração, o modelo dá uma probabilidade para cada próximo caractere e a ',
        h('b', null, 'temperatura'),
        ' controla a ousadia da escolha. É o mesmo princípio dos LLMs grandes — só que minúsculo e do zero.',
      ),
    ),
  );

  renderParams();
  clearCanvas();
  window.addEventListener('hashchange', () => {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  }, { once: true });
  return page;
}
