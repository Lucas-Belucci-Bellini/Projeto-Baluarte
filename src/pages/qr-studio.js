/**
 * Página /qr-studio — QR Code Studio (v2.0.0).
 *
 * Gera QR Codes a partir de texto/URL usando codificador próprio
 * (src/utils/qr-encoder.js). Renderiza em Canvas e exporta PNG.
 */

import { h, debounce } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { encodeQR } from '../utils/qr-encoder.js';

const STORAGE_KEY = 'qr-studio:text';
const QUIET = 4; /* zona de silêncio, em módulos */

export function qrStudioPage() {
  const fullPage = h('div', { className: 'page-qr' });
  let text = storage.get(STORAGE_KEY);
  if (typeof text !== 'string') {
    text = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte';
  }
  let scale = 8;

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'QR CODE STUDIO')),
      h('h1', { className: 'page-header__title' }, '▦ QR Code Studio'),
      h('p', { className: 'page-header__description' },
        'Gera ', h('span', { className: 'u-text-cyan' }, 'QR Codes'),
        ' a partir de texto ou link, com codificador próprio (Reed-Solomon, ',
        'nível L). Renderiza em Canvas e exporta PNG.')
    )
  );

  const canvas = h('canvas', { className: 'qr-canvas' });
  const ctx = canvas.getContext('2d');
  const statusEl = h('div', { className: 'qr-status' });

  const textInput = h('textarea', {
    className: 'qr-input u-mono',
    rows: 3,
    spellcheck: false,
    placeholder: 'Texto ou URL…',
    value: text,
    oninput: debounce(() => {
      text = textInput.value;
      storage.set(STORAGE_KEY, text);
      render();
    }, 200)
  });

  const scaleLabel = h('span', { className: 'u-mono u-text-cyan qr-scale__val' }, `${scale}px`);
  const scaleSlider = h('input', {
    type: 'range', min: '4', max: '16', step: '1', value: String(scale),
    oninput: (e) => { scale = parseInt(e.target.value, 10); scaleLabel.textContent = `${scale}px`; render(); }
  });

  const downloadBtn = h('button', {
    className: 'btn btn--primary btn--sm',
    onclick: () => {
      if (!canvas.width) { toast('Nada para baixar', { type: 'warning' }); return; }
      const link = document.createElement('a');
      link.download = 'qrcode-baluarte.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('PNG exportado', { type: 'success' });
    }
  }, '⤓ Baixar PNG');

  function setStatus(kind, msg) {
    statusEl.className = `qr-status qr-status--${kind}`;
    statusEl.textContent = msg;
  }

  function render() {
    const value = textInput.value.trim();
    if (!value) {
      canvas.width = canvas.height = 0;
      setStatus('idle', 'Digite um texto ou URL para gerar o QR Code.');
      return;
    }
    let qr;
    try {
      qr = encodeQR(value);
    } catch (err) {
      canvas.width = canvas.height = 0;
      setStatus('err', '▲ ' + err.message);
      return;
    }
    const dim = qr.size + QUIET * 2;
    canvas.width = dim * scale;
    canvas.height = dim * scale;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a0a0a';
    for (let r = 0; r < qr.size; r++) {
      for (let c = 0; c < qr.size; c++) {
        if (qr.modules[r][c]) {
          ctx.fillRect((c + QUIET) * scale, (r + QUIET) * scale, scale, scale);
        }
      }
    }
    const bytes = new TextEncoder().encode(value).length;
    setStatus('ok',
      `● QR válido · versão ${qr.version} · ${qr.size}×${qr.size} módulos · ${bytes} bytes`);
  }

  fullPage.appendChild(
    h('div', { className: 'qr-layout' },
      h('div', { className: 'qr-controls card' },
        h('div', { className: 'qr-controls__label' }, 'CONTEÚDO'),
        textInput,
        h('div', { className: 'qr-ctl' },
          h('label', null, 'Tamanho'), scaleSlider, scaleLabel),
        downloadBtn,
        statusEl
      ),
      h('div', { className: 'qr-preview' }, canvas)
    )
  );

  render();
  return fullPage;
}
