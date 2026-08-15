/**
 * Página /fft — Visualizador FFT.
 *
 * Visualização em Canvas 2D via Web Audio API, com fontes de microfone,
 * áudio do sistema, arquivo e tom de teste.
 */

import '../styles/fft.css';
import { h, cx } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
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
  onStreamEnded,
} from '../utils/fft-engine.js';
import type { FftRenderMode } from '../utils/fft-engine.js';

let canvasEl: HTMLCanvasElement | null = null;
let audioEl: HTMLAudioElement | null = null;
let activeMode: FftRenderMode = 'bars';
let hashchangeHandler: (() => void) | null = null;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function startVisualRender(): void {
  if (canvasEl) startRender(canvasEl);
}

function unmount(): void {
  stopRender();
  fftDisconnect();
  if (audioEl) {
    try {
      audioEl.pause();
    } catch {
      /* áudio já finalizado */
    }
  }
}

/** Detecta quando o usuário sai da rota para fechar o áudio. */
function attachUnmountWatcher(): void {
  if (hashchangeHandler) window.removeEventListener('hashchange', hashchangeHandler);
  hashchangeHandler = () => {
    if (!location.hash.startsWith('#/fft')) {
      unmount();
      if (hashchangeHandler) window.removeEventListener('hashchange', hashchangeHandler);
      hashchangeHandler = null;
    }
  };
  window.addEventListener('hashchange', hashchangeHandler);
}

export function fftPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-fft' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'VISUALIZADOR FFT'),
      ),
      h('h1', { className: 'page-header__title' }, '~ Visualizador FFT'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, '16 modos'),
        ' de visualização em Canvas 2D via Web Audio API: barras, curva, onda, radial, spectrogram, partículas, espelho, blob, VU, Lissajous, anéis, waterfall, dual, pontos, terreno 3D e bloom. ',
        'Captura microfone, áudio do sistema (o som do PC), arquivo de áudio ou oscilador de teste. Reativa automaticamente quando o navegador suspende o áudio.',
      ),
    ),
  );

  const statusBadge = h('span', { className: 'badge badge--muted' }, 'PARADO');
  function updateStatus(label: string, color = 'muted'): void {
    statusBadge.textContent = label;
    statusBadge.className = `badge badge--${color}`;
  }

  const micBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        updateStatus('Solicitando microfone…', 'warning');
        await connectMicrophone();
        updateStatus('● MICROFONE', 'danger');
        startVisualRender();
        toast('Microfone capturando (não há saída de áudio)', { type: 'info' });
      } catch (error: unknown) {
        updateStatus('Erro mic', 'danger');
        toast(`Erro: ${errorMessage(error)}`, { type: 'danger' });
      }
    },
  }, '🎙 Microfone');

  const systemBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        toast(
          '📌 No diálogo: selecione "Aba" (não Tela/Janela), escolha a aba com o YouTube e marque ✓ "Compartilhar áudio da aba".',
          { type: 'info', duration: 12000 },
        );
        updateStatus('Aguardando seleção de aba…', 'warning');
        await connectSystemAudio();
        updateStatus('● ÁUDIO DO PC', 'danger');
        startVisualRender();
        toast('Capturando. Visualizador ativo.', { type: 'success' });
      } catch (error: unknown) {
        updateStatus('PARADO', 'muted');
        const message = errorMessage(error);
        if (message.includes('áudio')) {
          toast(
            'Nenhum áudio capturado — abra o diálogo de novo, selecione uma ABA e marque "Compartilhar áudio da aba".',
            { type: 'danger', duration: 8000 },
          );
        } else {
          toast(`Erro: ${message}`, { type: 'danger' });
        }
      }
    },
  }, '🖥 Áudio do PC (YouTube/Spotify…)');

  const systemHint = h('p', { className: 'fft-source-hint' },
    '💡 Para capturar YouTube: clique no botão acima → selecione ',
    h('b', null, 'Aba'),
    ' no diálogo → escolha a aba com o vídeo → marque ',
    h('b', null, '✓ Compartilhar áudio da aba'),
    '.',
  );

  const fileInput = h('input', {
    type: 'file',
    accept: 'audio/*,video/*',
    style: { display: 'none' },
    onchange: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const file = input.files?.[0];
      if (!file || !audioEl) return;
      const url = URL.createObjectURL(file);
      audioEl.src = url;
      audioEl.load();
      audioEl.play().then(() => {
        if (!audioEl) return;
        connectMediaElement(audioEl);
        const label = file.name.length > 30 ? `${file.name.slice(0, 27)}…` : file.name;
        updateStatus(`▶ ${label}`, 'success');
        startVisualRender();
        toast(`Reproduzindo ${file.name}`, { type: 'success' });
      }).catch((error: unknown) => {
        toast(`Erro: ${errorMessage(error)}`, { type: 'danger' });
      });
    },
  });

  const fileBtn = h('button', {
    className: 'btn',
    onclick: () => fileInput.click(),
  }, '📂 Carregar arquivo');

  const testFreqLabel = h('span', {
    className: 'u-mono u-text-cyan',
    style: { fontSize: '12px', minWidth: '60px' },
  }, '440 Hz');
  const testFreqInput = h('input', {
    type: 'range',
    min: '50',
    max: '5000',
    step: '10',
    value: '440',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const frequency = Number.parseInt(input.value, 10);
      setTestFrequency(frequency);
      testFreqLabel.textContent = `${frequency} Hz`;
    },
  });

  const testBtn = h('button', {
    className: 'btn',
    onclick: async () => {
      try {
        await connectTestTone(Number.parseInt(testFreqInput.value, 10) || 440);
        updateStatus('♪ TOM TESTE', 'cyan');
        startVisualRender();
        toast(`Oscilador a ${testFreqInput.value} Hz`, { type: 'info' });
      } catch (error: unknown) {
        toast(`Erro: ${errorMessage(error)}`, { type: 'danger' });
      }
    },
  }, '♪ Tom de teste');

  const stopBtn = h('button', {
    className: 'btn btn--ghost',
    onclick: () => {
      unmount();
      updateStatus('PARADO', 'muted');
      toast('Parado', { type: 'info' });
    },
  }, '■ Parar');

  const fftSizeSelect = h('select', {
    className: 'input',
    onchange: (event: Event) => {
      const select = event.currentTarget;
      if (select instanceof HTMLSelectElement) setFftSize(Number.parseInt(select.value, 10));
    },
  },
    h('option', { value: '512' }, 'FFT 512'),
    h('option', { value: '1024' }, 'FFT 1024'),
    h('option', { value: '2048', selected: true }, 'FFT 2048'),
    h('option', { value: '4096' }, 'FFT 4096'),
    h('option', { value: '8192' }, 'FFT 8192'),
  );

  const smoothLabel = h('span', {
    className: 'u-mono u-text-muted',
    style: { fontSize: '11px' },
  }, '0.8');
  const smoothSlider = h('input', {
    type: 'range',
    min: '0',
    max: '0.99',
    step: '0.01',
    value: '0.8',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      setSmoothing(Number.parseFloat(input.value));
      smoothLabel.textContent = input.value;
    },
  });

  const gainLabel = h('span', {
    className: 'u-mono u-text-muted',
    style: { fontSize: '11px' },
  }, '0.5');
  const gainSlider = h('input', {
    type: 'range',
    min: '0',
    max: '2',
    step: '0.05',
    value: '0.5',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      setGain(Number.parseFloat(input.value));
      gainLabel.textContent = input.value;
    },
  });

  const modeBar = h('div', { className: 'fft-modes' });
  RENDER_MODES.forEach((mode) => {
    modeBar.appendChild(
      h('button', {
        className: cx('fft-mode', activeMode === mode.id && 'is-active'),
        'data-m': mode.id,
        onclick: () => {
          activeMode = mode.id;
          setMode(mode.id);
          document.querySelectorAll<HTMLButtonElement>('.fft-mode').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.m === mode.id);
          });
        },
      },
        h('span', { className: 'fft-mode__icon' }, mode.icon),
        h('span', { className: 'fft-mode__label' }, mode.label),
      ),
    );
  });
  setMode(activeMode);

  audioEl = h('audio', {
    controls: true,
    crossorigin: 'anonymous',
    style: { width: '100%', marginTop: '8px' },
  });
  canvasEl = h('canvas', { className: 'fft-canvas' });

  fullPage.appendChild(
    h('div', { className: 'fft-toolbar' },
      h('div', { className: 'fft-toolbar__group' },
        micBtn,
        systemBtn,
        fileBtn,
        testBtn,
        stopBtn,
        fileInput,
      ),
      statusBadge,
    ),
  );
  fullPage.appendChild(systemHint);
  fullPage.appendChild(modeBar);
  fullPage.appendChild(h('div', { className: 'fft-canvas-wrap' }, canvasEl));
  fullPage.appendChild(audioEl);
  fullPage.appendChild(
    h('div', { className: 'fft-advanced' },
      h('label', null, h('span', null, 'FFT size'), fftSizeSelect),
      h('label', null,
        h('span', null, 'Smoothing'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, smoothSlider, smoothLabel),
      ),
      h('label', null,
        h('span', null, 'Gain'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, gainSlider, gainLabel),
      ),
      h('label', null,
        h('span', null, 'Tom teste'),
        h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center' } }, testFreqInput, testFreqLabel),
      ),
    ),
  );

  attachUnmountWatcher();
  onStreamEnded((type) => {
    updateStatus('PARADO — stream encerrado', 'muted');
    stopRender();
    toast(
      type === 'system'
        ? 'Compartilhamento de aba encerrado. Clique "Áudio do PC" para reconectar.'
        : 'Microfone desconectado.',
      { type: 'warning', duration: 6000 },
    );
  });

  return fullPage;
}
