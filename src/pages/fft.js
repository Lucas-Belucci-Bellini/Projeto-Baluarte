/**
 * Página /fft — Visualizador FFT (Fase 15).
 *
 * 6 modos de visualização via Web Audio API.
 * Fontes: microfone, áudio do sistema (som do PC), arquivo, tom de teste.
 */

import { h, cx, debounce, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  RENDER_MODES,
  connectMicrophone,
  connectSystemAudio,
  connectMediaElement,
  connectTestTone,
  setTestFrequency,
  disconnect as fftDisconnect,
  setMode,
  setFftSize,
  setSmoothing,
  setGain,
  startRender,
  stopRender,
  getSourceType
} from '../utils/fft-engine.js';

let canvasEl = null;
let audioEl = null;
let activeMode = 'bars';
let kbHandler = null;

function unmount() {
  stopRender();
  fftDisconnect();
  if (audioEl) { try { audioEl.pause(); } catch {} }
}

/* Detecta quando o usuário sai da rota para fechar o áudio */
function attachUnmountWatcher() {
  if (kbHandler) window.removeEventListener('hashchange', kbHandler);
  kbHandler = () => {
    if (!location.hash.startsWith('#/fft')) {
      unmount();
      window.removeEventListener('hashchange', kbHandler);
      kbHandler = null;
    }
  };
  window.addEventListener('hashchange', kbHandler);
}

export function fftPage() {
  const fullPage = h('div', { className: 'page-fft' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'VISUALIZADOR FFT')
      ),
      h('h1', { className: 'page-header__title' }, '~ Visualizador FFT'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, '16 modos'),
        ' de visualização em Canvas 2D via Web Audio API: barras, curva, onda, radial, spectrogram, partículas, espelho, blob, VU, Lissajous, anéis, waterfall, dual, pontos, terreno 3D e bloom. ',
        'Captura microfone, áudio do sistema (o som do PC), arquivo de áudio ou oscilador de teste. Reativa automaticamente quando o navegador suspende o áudio.'
      )
    )
  );

  /* ===== Source controls ===== */
  const statusBadge = h('span', { className: 'badge badge--muted' }, 'PARADO');

  function setStatus(label, color = 'muted') {
    statusBadge.textContent = label;
    statusBadge.className = `badge badge--${color}`;
  }

  /* Botões de fonte */
  const micBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        setStatus('Solicitando microfone…', 'warning');
        await connectMicrophone();
        setStatus('● MICROFONE', 'danger');
        startRender(canvasEl);
        toast('Microfone capturando (não há saída de áudio)', { type: 'info' });
      } catch (e) {
        setStatus('Erro mic', 'danger');
        toast('Erro: ' + e.message, { type: 'danger' });
      }
    }
  }, '🎙 Microfone');

  const systemBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        setStatus('Solicitando áudio do sistema…', 'warning');
        await connectSystemAudio();
        setStatus('● ÁUDIO DO PC', 'danger');
        startRender(canvasEl);
        toast('Capturando o som do PC. Escolha a aba/tela e marque "compartilhar áudio".', { type: 'info' });
      } catch (e) {
        setStatus('PARADO', 'muted');
        toast('Erro: ' + e.message, { type: 'danger' });
      }
    }
  }, '🖥 Áudio do PC');

  const fileInput = h('input', {
    type: 'file',
    accept: 'audio/*,video/*',
    style: { display: 'none' },
    onchange: (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      audioEl.src = url;
      audioEl.load();
      audioEl.play().then(() => {
        connectMediaElement(audioEl);
        setStatus('▶ ' + (file.name.length > 30 ? file.name.slice(0, 27) + '…' : file.name), 'success');
        startRender(canvasEl);
        toast('Reproduzindo ' + file.name, { type: 'success' });
      }).catch((err) => toast('Erro: ' + err.message, { type: 'danger' }));
    }
  });

  const fileBtn = h('button', {
    className: 'btn',
    onclick: () => fileInput.click()
  }, '📂 Carregar arquivo');

  const testFreqInput = h('input', {
    type: 'range', min: '50', max: '5000', step: '10', value: '440',
    oninput: (e) => {
      const f = parseInt(e.target.value, 10);
      setTestFrequency(f);
      testFreqLabel.textContent = `${f} Hz`;
    }
  });
  const testFreqLabel = h('span', { className: 'u-mono u-text-cyan', style: { fontSize: '12px', minWidth: '60px' } }, '440 Hz');

  const testBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        await connectTestTone(parseInt(testFreqInput.value, 10) || 440);
        setStatus('♪ TOM TESTE', 'cyan');
        startRender(canvasEl);
        toast('Oscilador a ' + testFreqInput.value + ' Hz', { type: 'info' });
      } catch (e) {
        toast('Erro: ' + e.message, { type: 'danger' });
      }
    }
  }, '♪ Tom de teste');

  const stopBtn = h('button', {
    className: 'btn btn--ghost',
    onclick: () => {
      unmount();
      setStatus('PARADO', 'muted');
      toast('Parado', { type: 'info' });
    }
  }, '■ Parar');

  /* ===== Controles avançados ===== */
  const fftSizeSel = h('select', {
    className: 'input',
    onchange: (e) => setFftSize(parseInt(e.target.value, 10))
  },
    h('option', { value: '512' }, 'FFT 512'),
    h('option', { value: '1024' }, 'FFT 1024'),
    h('option', { value: '2048', selected: true }, 'FFT 2048'),
    h('option', { value: '4096' }, 'FFT 4096'),
    h('option', { value: '8192' }, 'FFT 8192')
  );

  const smoothSlider = h('input', {
    type: 'range', min: '0', max: '0.99', step: '0.01', value: '0.8',
    oninput: (e) => {
      setSmoothing(parseFloat(e.target.value));
      smoothLabel.textContent = e.target.value;
    }
  });
  const smoothLabel = h('span', { className: 'u-mono u-text-muted', style: { fontSize: '11px' } }, '0.8');

  const gainSlider = h('input', {
    type: 'range', min: '0', max: '2', step: '0.05', value: '0.5',
    oninput: (e) => {
      setGain(parseFloat(e.target.value));
      gainLabel.textContent = e.target.value;
    }
  });
  const gainLabel = h('span', { className: 'u-mono u-text-muted', style: { fontSize: '11px' } }, '0.5');

  /* ===== Mode selector ===== */
  const modeBar = h('div', { className: 'fft-modes' });
  RENDER_MODES.forEach((m) => {
    modeBar.appendChild(
      h('button', {
        className: cx('fft-mode', activeMode === m.id && 'is-active'),
        'data-m': m.id,
        onclick: () => {
          activeMode = m.id;
          setMode(m.id);
          document.querySelectorAll('.fft-mode').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.m === m.id)
          );
        }
      },
        h('span', { className: 'fft-mode__icon' }, m.icon),
        h('span', { className: 'fft-mode__label' }, m.label)
      )
    );
  });
  setMode(activeMode);

  /* ===== Layout final ===== */
  audioEl = h('audio', {
    controls: true,
    crossorigin: 'anonymous',
    style: { width: '100%', marginTop: '8px' }
  });

  canvasEl = h('canvas', { className: 'fft-canvas' });

  fullPage.appendChild(
    h('div', { className: 'fft-toolbar' },
      h('div', { className: 'fft-toolbar__group' },
        micBtn, systemBtn, fileBtn, testBtn, stopBtn,
        fileInput
      ),
      statusBadge
    )
  );

  fullPage.appendChild(modeBar);

  fullPage.appendChild(
    h('div', { className: 'fft-canvas-wrap' }, canvasEl)
  );

  fullPage.appendChild(audioEl);

  fullPage.appendChild(
    h('div', { className: 'fft-advanced' },
      h('label', null, h('span', null, 'FFT size'), fftSizeSel),
      h('label', null,
        h('span', null, 'Smoothing'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, smoothSlider, smoothLabel)
      ),
      h('label', null,
        h('span', null, 'Gain'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, gainSlider, gainLabel)
      ),
      h('label', null,
        h('span', null, 'Tom teste'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, testFreqInput, testFreqLabel)
      )
    )
  );

  attachUnmountWatcher();

  return fullPage;
}
