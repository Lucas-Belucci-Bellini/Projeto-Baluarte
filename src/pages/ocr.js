/**
 * /ocr — Leitor OCR (dar "olhos" ao site).
 *
 * Extrai texto de imagens 100% no navegador via Tesseract.js (carregado da CDN
 * sob demanda — substitui o PaddleOCR, que é Python e não roda no browser).
 * Aceita upload, arrastar-soltar, colar (Ctrl+V) e captura pela câmera.
 */

import '../styles/ocr.css';
import { h } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';

const STATUS_PT = {
  'loading tesseract core': 'Carregando núcleo…',
  'initializing tesseract': 'Inicializando…',
  'loading language traineddata': 'Baixando idioma…',
  'initializing api': 'Preparando API…',
  'recognizing text': 'Lendo texto…'
};

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.crossOrigin = 'anonymous';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

export function ocrPage() {
  const page = h('div', { className: 'page-ocr' });
  let currentURL = null;     // object URL / dataURL da imagem-fonte
  let camStream = null;      // MediaStream ativo (se câmera aberta)
  let running = false;

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'OCR')),
      h('h1', { className: 'page-header__title' }, '👁️ Leitor OCR'),
      h('p', { className: 'page-header__description' },
        'Extrai texto de imagens — 100% no seu navegador. ',
        'Arraste uma imagem, cole (Ctrl+V), escolha um arquivo ou use a câmera.'))
  );

  /* ===== Controles ===== */
  const langSel = h('select', { className: 'ocr-select', title: 'Idioma do texto' },
    h('option', { value: 'por+eng' }, 'Português + Inglês'),
    h('option', { value: 'por' }, 'Português'),
    h('option', { value: 'eng' }, 'Inglês'),
    h('option', { value: 'spa' }, 'Espanhol'),
    h('option', { value: 'fra' }, 'Francês'),
    h('option', { value: 'deu' }, 'Alemão'));

  const fileInput = h('input', {
    type: 'file', accept: 'image/*', style: { display: 'none' },
    onchange: (e) => { const f = e.target.files[0]; if (f) setImage(URL.createObjectURL(f)); }
  });

  const btnFile = h('button', { className: 'btn btn--ghost', onclick: () => fileInput.click() }, '📂 Carregar imagem');
  const btnCam = h('button', { className: 'btn btn--ghost', onclick: () => toggleCamera() }, '📷 Câmera');
  const btnRun = h('button', { className: 'btn btn--primary', disabled: true, onclick: () => runOCR() }, '🔍 Ler texto');

  page.appendChild(h('div', { className: 'ocr-controls' }, langSel, btnFile, btnCam, btnRun, fileInput));

  /* ===== Zona da imagem ===== */
  const preview = h('img', { className: 'ocr-preview', alt: 'imagem para OCR' });
  const camVideo = h('video', { className: 'ocr-video', autoplay: true, playsinline: true, muted: true });
  const dropHint = h('div', { className: 'ocr-drop__hint' },
    h('div', { style: { fontSize: '34px' } }, '🖼️'),
    h('div', null, 'Arraste uma imagem aqui, cole (Ctrl+V) ou clique em "Carregar imagem"'));
  const drop = h('div', { className: 'ocr-drop', onclick: () => { if (!currentURL && !camStream) fileInput.click(); } },
    dropHint, preview, camVideo);

  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => {
    e.preventDefault(); drop.classList.remove('is-over');
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) setImage(URL.createObjectURL(f));
  });
  page.appendChild(drop);

  /* ===== Progresso ===== */
  const progFill = h('div', { className: 'ocr-prog__fill' });
  const progLabel = h('span', { className: 'ocr-prog__label' }, '');
  const prog = h('div', { className: 'ocr-prog', style: { display: 'none' } },
    h('div', { className: 'ocr-prog__bar' }, progFill), progLabel);
  page.appendChild(prog);

  /* ===== Resultado ===== */
  const out = h('textarea', { className: 'ocr-out', placeholder: 'O texto reconhecido aparece aqui…', spellcheck: false });
  const stat = h('span', { className: 'ocr-result__stat u-text-muted' }, '');
  const btnCopy = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!out.value) return;
      navigator.clipboard.writeText(out.value)
        .then(() => toast('Texto copiado', { type: 'success' }),
              () => toast('Não foi possível copiar', { type: 'danger' }));
    }
  }, '📋 Copiar');
  const btnTxt = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!out.value) return;
      const a = h('a', { href: URL.createObjectURL(new Blob([out.value], { type: 'text/plain' })), download: 'ocr.txt' });
      a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    }
  }, '⬇️ .txt');
  const resultCard = h('div', { className: 'ocr-result' },
    h('div', { className: 'ocr-result__head' },
      h('span', { className: 'ocr-result__title' }, 'Texto reconhecido'),
      h('div', { className: 'ocr-result__actions' }, stat, btnCopy, btnTxt)),
    out);
  page.appendChild(resultCard);

  /* ===== Lógica ===== */
  function setImage(url) {
    if (camStream) stopCamera();
    if (currentURL && currentURL.startsWith('blob:')) URL.revokeObjectURL(currentURL);
    currentURL = url;
    preview.src = url;
    drop.classList.add('has-image');
    btnRun.disabled = false;
  }

  async function toggleCamera() {
    if (camStream) { stopCamera(); return; }
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      camVideo.srcObject = camStream;
      drop.classList.add('has-cam'); drop.classList.remove('has-image');
      btnCam.textContent = '📸 Capturar';
      btnRun.disabled = true;
    } catch (err) {
      toast('Câmera indisponível', { type: 'danger' });
      camStream = null;
    }
  }
  /* Quando a câmera está aberta, o botão vira "Capturar". */
  btnCam.addEventListener('click', () => {
    if (camStream) {
      const c = document.createElement('canvas');
      c.width = camVideo.videoWidth; c.height = camVideo.videoHeight;
      c.getContext('2d').drawImage(camVideo, 0, 0);
      setImage(c.toDataURL('image/png'));
    }
  });
  function stopCamera() {
    if (camStream) camStream.getTracks().forEach((t) => t.stop());
    camStream = null; camVideo.srcObject = null;
    drop.classList.remove('has-cam');
    btnCam.textContent = '📷 Câmera';
  }

  async function runOCR() {
    if (!currentURL || running) return;
    running = true;
    btnRun.disabled = true; btnRun.textContent = '⏳ Lendo…';
    prog.style.display = 'flex'; progFill.style.width = '4%'; progLabel.textContent = 'Carregando OCR…';
    out.value = '';
    try {
      await loadScript(TESSERACT_CDN);
      if (!window.Tesseract) throw new Error('Tesseract não carregou');
      const { data } = await window.Tesseract.recognize(currentURL, langSel.value, {
        logger: (m) => {
          const label = STATUS_PT[m.status] || m.status;
          if (typeof m.progress === 'number') progFill.style.width = Math.round(m.progress * 100) + '%';
          progLabel.textContent = label;
        }
      });
      out.value = (data.text || '').trim();
      const words = out.value ? out.value.split(/\s+/).length : 0;
      stat.textContent = `${out.value.length} caracteres · ${words} palavras · ${Math.round(data.confidence)}% confiança`;
      if (!out.value) toast('Nenhum texto reconhecido', { type: 'warning' });
      else toast('Texto extraído', { type: 'success' });
    } catch (err) {
      console.error('[ocr]', err);
      toast('Falha no OCR (verifique a conexão)', { type: 'danger' });
      progLabel.textContent = 'Erro ao carregar o OCR.';
    } finally {
      running = false;
      btnRun.disabled = false; btnRun.textContent = '🔍 Ler texto';
      setTimeout(() => { prog.style.display = 'none'; }, 600);
    }
  }

  /* Colar imagem (Ctrl+V) enquanto a página está montada. */
  function onPaste(e) {
    const items = (e.clipboardData && e.clipboardData.items) || [];
    for (const it of items) {
      if (it.type.startsWith('image/')) {
        const f = it.getAsFile();
        if (f) { setImage(URL.createObjectURL(f)); toast('Imagem colada', { type: 'success' }); }
        break;
      }
    }
  }
  window.addEventListener('paste', onPaste);

  /* Limpeza ao sair do DOM. */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(page)) {
      window.removeEventListener('paste', onPaste);
      stopCamera();
      if (currentURL && currentURL.startsWith('blob:')) URL.revokeObjectURL(currentURL);
      obs.disconnect();
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return page;
}
