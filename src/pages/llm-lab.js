/**
 * Página /llm-lab — Mini-LLM do Zero.
 *
 * Constrói e TREINA um modelo de linguagem no navegador, do zero, em JS puro:
 *   - Rede neural bigrama (treina por descida de gradiente — a loss cai ao vivo)
 *   - Modelo de n-gramas (estatístico, treino instantâneo)
 * Depois GERA texto no estilo do corpus. Educacional e 100% client-side.
 */

import '../styles/llm-lab.css';
import { h, empty, cx } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { buildVocab, NgramModel, NeuralBigram, SAMPLE_CORPORA } from '../utils/llm-mini.js';

export function llmLabPage() {
  const page = h('div', { className: 'page-llm' });
  let modelType = 'neural';
  let order = 3;
  let temp = 0.9;
  let model = null;       /* instância treinada */
  let raf = null;

  page.append(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'SISTEMA'), h('span', null, '›'), h('span', null, 'MINI-LLM')),
    h('h1', { className: 'page-header__title' }, '🧠 Mini-LLM do Zero'),
    h('p', { className: 'page-header__description' },
      'Treine um modelo de linguagem ', h('span', { className: 'u-text-cyan' }, 'de verdade, do zero'),
      ', no seu navegador — e veja a IA aprender (a loss caindo) e gerar texto.')));

  /* ===== Corpus ===== */
  const corpusSel = h('select', { className: 'input', onchange: (e) => { if (SAMPLE_CORPORA[e.target.value]) textArea.value = SAMPLE_CORPORA[e.target.value]; } },
    ...Object.keys(SAMPLE_CORPORA).map((k) => h('option', { value: k }, k)),
    h('option', { value: '__custom' }, 'Personalizado (digite abaixo)'));
  const textArea = h('textarea', { className: 'input llm-corpus', rows: 6, spellcheck: 'false' });
  textArea.value = SAMPLE_CORPORA[Object.keys(SAMPLE_CORPORA)[0]];

  /* ===== Modelo + parâmetros ===== */
  const modelBtns = h('div', { className: 'llm-seg' },
    segBtn('neural', '◆ Rede neural (treina)'),
    segBtn('ngram', '▦ N-grama (conta)'));
  function segBtn(id, label) {
    return h('button', { className: cx('llm-seg__btn', modelType === id && 'is-active'), 'data-m': id,
      onclick: () => { modelType = id; modelBtns.querySelectorAll('.llm-seg__btn').forEach((b) => b.classList.toggle('is-active', b.dataset.m === id)); renderParams(); } }, label);
  }
  const paramsEl = h('div', { className: 'llm-params' });
  function renderParams() {
    empty(paramsEl);
    if (modelType === 'ngram') {
      const sel = h('select', { className: 'input', onchange: (e) => { order = parseInt(e.target.value, 10); } },
        ...[1, 2, 3, 4].map((n) => h('option', { value: n, selected: n === order }, `ordem ${n}`)));
      paramsEl.append(h('label', { className: 'llm-lbl' }, h('span', null, 'CONTEXTO (n)'), sel));
    } else {
      paramsEl.append(h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } },
        'Rede de 1 camada (matriz V×V) treinada por gradiente: 150 passos, softmax + cross-entropy.'));
    }
  }

  /* ===== Treino ===== */
  const statusEl = h('div', { className: 'llm-status u-mono u-text-muted' }, 'sem treino ainda');
  const lossCanvas = h('canvas', { className: 'llm-loss', width: 480, height: 120 });
  const trainBtn = h('button', { className: 'btn btn--primary', onclick: train }, '⚙ Treinar');

  function train() {
    const text = (textArea.value || '').trim();
    if (text.length < 20) { toast('Cole um texto maior (≥ 20 caracteres).', { type: 'warning' }); return; }
    if (raf) cancelAnimationFrame(raf);
    genBtn.disabled = true;
    const vocab = buildVocab(text);

    if (modelType === 'ngram') {
      const m = new NgramModel(order);
      const info = m.train(text);
      model = m;
      statusEl.textContent = `n-grama (ordem ${order}) treinado · ${info.contexts} contextos · vocab ${vocab.size}`;
      clearCanvas();
      genBtn.disabled = false;
      toast('Modelo treinado! Agora gere texto.', { type: 'success' });
      return;
    }

    /* Rede neural: treino animado com a loss caindo. */
    const nb = new NeuralBigram(vocab);
    const nPairs = nb.prepare(text);
    const losses = [];
    const maxSteps = 150;
    let step = 0;
    statusEl.textContent = `treinando rede neural… vocab ${vocab.size}, ${nPairs} pares`;
    function tick() {
      for (let k = 0; k < 8 && step < maxSteps; k++) { losses.push(nb.trainStep(30)); step++; }
      drawLoss(losses);
      statusEl.textContent = `passo ${step}/${maxSteps} · loss ${losses[losses.length - 1].toFixed(3)}`;
      if (step < maxSteps) { raf = requestAnimationFrame(tick); }
      else { model = nb; genBtn.disabled = false; statusEl.textContent = `rede treinada · loss final ${losses[losses.length - 1].toFixed(3)} (começou em ${losses[0].toFixed(3)})`; toast('Rede treinada! A loss caiu — ela aprendeu.', { type: 'success' }); }
    }
    raf = requestAnimationFrame(tick);
  }

  function clearCanvas() {
    const ctx = lossCanvas.getContext('2d');
    ctx.fillStyle = '#020409'; ctx.fillRect(0, 0, lossCanvas.width, lossCanvas.height);
    ctx.fillStyle = '#93a4bf'; ctx.font = '12px "JetBrains Mono", monospace';
    ctx.fillText('(n-grama não usa gradiente — sem curva de loss)', 14, 64);
  }
  function drawLoss(losses) {
    const ctx = lossCanvas.getContext('2d'); const W = lossCanvas.width, H = lossCanvas.height;
    ctx.fillStyle = '#020409'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(150,180,255,0.1)'; ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { const y = (H / 4) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    if (losses.length < 2) return;
    let mn = Infinity, mx = -Infinity;
    for (const l of losses) { if (l < mn) mn = l; if (l > mx) mx = l; }
    const pad = 8, span = (mx - mn) || 1;
    ctx.strokeStyle = '#d4a24e'; ctx.lineWidth = 2; ctx.beginPath();
    losses.forEach((l, i) => {
      const x = pad + (i / (losses.length - 1)) * (W - 2 * pad);
      const y = pad + (1 - (l - mn) / span) * (H - 2 * pad);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = '#e8c07a'; ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillText(`loss ${losses[losses.length - 1].toFixed(2)}`, W - 86, 16);
  }

  /* ===== Geração ===== */
  const tempVal = h('span', { className: 'llm-slider__val u-mono' }, temp.toFixed(1));
  const tempSlider = h('input', { type: 'range', min: 0.3, max: 1.4, step: 0.1, value: temp, className: 'llm-slider',
    oninput: (e) => { temp = parseFloat(e.target.value); tempVal.textContent = temp.toFixed(1); } });
  const outEl = h('pre', { className: 'llm-out u-mono' }, '—');
  const genBtn = h('button', { className: 'btn btn--primary', disabled: true, onclick: () => {
    if (!model) return;
    const t = model.generate(modelType === 'ngram' ? 200 : 80, temp);
    outEl.textContent = t || '(vazio — treine com mais texto)';
  } }, '✦ Gerar texto');

  page.append(
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '1. Corpus (texto de treino)'),
      h('label', { className: 'llm-lbl' }, h('span', null, 'EXEMPLO'), corpusSel),
      textArea),
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '2. Modelo'),
      modelBtns, paramsEl,
      h('div', { className: 'llm-row' }, trainBtn, statusEl),
      lossCanvas),
    h('div', { className: 'llm-card card' },
      h('h2', { className: 'llm-h2' }, '3. Gerar'),
      h('div', { className: 'llm-row' },
        h('label', { className: 'llm-lbl llm-lbl--inline' }, h('span', null, 'TEMPERATURA'),
          h('div', { className: 'llm-slider-wrap' }, tempSlider, tempVal)),
        genBtn),
      outEl),
    h('div', { className: 'llm-card card llm-explain' },
      h('h2', { className: 'llm-h2' }, 'Como funciona'),
      h('p', null, 'Cada caractere vira um número (vocabulário). A ', h('b', null, 'rede neural'),
        ' aprende, por tentativa e erro (gradiente), a prever o próximo caractere — a ',
        h('span', { className: 'u-text-cyan' }, 'loss caindo'), ' mostra o aprendizado. O ',
        h('b', null, 'n-grama'), ' apenas conta quais caracteres seguem quais. Na geração, o modelo dá uma probabilidade para cada próximo caractere e a ',
        h('b', null, 'temperatura'), ' controla a ousadia da escolha. É o mesmo princípio dos LLMs grandes — só que minúsculo e do zero.')));

  renderParams();
  clearCanvas();
  window.addEventListener('hashchange', () => { if (raf) cancelAnimationFrame(raf); }, { once: true });
  return page;
}
