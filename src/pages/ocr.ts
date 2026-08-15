/**
 * /ocr — Leitor OCR executado no navegador via Tesseract.js sob demanda.
 */

import '../styles/ocr.css';
import { h } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { toast } from '../utils/toast.js';

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const STATUS_PT: Readonly<Record<string, string>> = {
  'loading tesseract core': 'Carregando núcleo…',
  'initializing tesseract': 'Inicializando…',
  'loading language traineddata': 'Baixando idioma…',
  'initializing api': 'Preparando API…',
  'recognizing text': 'Lendo texto…',
};

interface TesseractProgressMessage {
  readonly status: string;
  readonly progress?: number;
}

interface TesseractResult {
  readonly data: {
    readonly text?: string;
    readonly confidence: number;
  };
}

interface TesseractApi {
  recognize(
    image: string,
    language: string,
    options: { readonly logger: (message: TesseractProgressMessage) => void },
  ): Promise<TesseractResult>;
}

declare global {
  interface Window {
    Tesseract?: TesseractApi;
  }
}

function loadScript(source: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${source}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = source;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('falha ao carregar script OCR'));
    document.head.appendChild(script);
  });
}

export function ocrPage(): HTMLDivElement {
  const page = h('div', { className: 'page-ocr' });
  let currentUrl: string | null = null;
  let cameraStream: MediaStream | null = null;
  let running = false;

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'OCR')),
      h('h1', { className: 'page-header__title' }, '👁️ Leitor OCR'),
      h('p', { className: 'page-header__description' },
        'Extrai texto de imagens — 100% no seu navegador. ',
        'Arraste uma imagem, cole (Ctrl+V), escolha um arquivo ou use a câmera.'),
    ),
  );

  const languageSelect = h('select', { className: 'ocr-select', title: 'Idioma do texto' },
    h('option', { value: 'por+eng' }, 'Português + Inglês'),
    h('option', { value: 'por' }, 'Português'),
    h('option', { value: 'eng' }, 'Inglês'),
    h('option', { value: 'spa' }, 'Espanhol'),
    h('option', { value: 'fra' }, 'Francês'),
    h('option', { value: 'deu' }, 'Alemão'));
  const fileInput = h('input', {
    type: 'file', accept: 'image/*', style: { display: 'none' },
    onchange: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const file = input.files?.[0];
      if (file) setImage(URL.createObjectURL(file));
    },
  });
  const fileButton = h('button', { className: 'btn btn--ghost', onclick: () => fileInput.click() }, '📂 Carregar imagem');
  const cameraButton = h('button', { className: 'btn btn--ghost', onclick: () => { void toggleCamera(); } }, '📷 Câmera');
  const runButton = h('button', { className: 'btn btn--primary', disabled: true, onclick: () => { void runOCR(); } }, '🔍 Ler texto');
  page.appendChild(h('div', { className: 'ocr-controls' }, languageSelect, fileButton, cameraButton, runButton, fileInput));

  const preview = h('img', { className: 'ocr-preview', alt: 'imagem para OCR' });
  const cameraVideo = h('video', { className: 'ocr-video', autoplay: true, playsinline: true, muted: true });
  const dropHint = h('div', { className: 'ocr-drop__hint' },
    h('div', { style: { fontSize: '34px' } }, '🖼️'),
    h('div', null, 'Arraste uma imagem aqui, cole (Ctrl+V) ou clique em "Carregar imagem"'));
  const drop = h('div', {
    className: 'ocr-drop',
    onclick: () => { if (!currentUrl && !cameraStream) fileInput.click(); },
  }, dropHint, preview, cameraVideo);
  drop.addEventListener('dragover', (event: DragEvent) => {
    event.preventDefault();
    drop.classList.add('is-over');
  });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (event: DragEvent) => {
    event.preventDefault();
    drop.classList.remove('is-over');
    const file = event.dataTransfer?.files[0];
    if (file?.type.startsWith('image/')) setImage(URL.createObjectURL(file));
  });
  page.appendChild(drop);

  const progressFill = h('div', { className: 'ocr-prog__fill' });
  const progressLabel = h('span', { className: 'ocr-prog__label' }, '');
  const progress = h('div', { className: 'ocr-prog', style: { display: 'none' } },
    h('div', { className: 'ocr-prog__bar' }, progressFill), progressLabel);
  page.appendChild(progress);

  const output = h('textarea', {
    className: 'ocr-out', placeholder: 'O texto reconhecido aparece aqui…', spellcheck: false,
  });
  const stat = h('span', { className: 'ocr-result__stat u-text-muted' }, '');
  const copyButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!output.value) return;
      navigator.clipboard.writeText(output.value)
        .then(() => toast('Texto copiado', { type: 'success' }))
        .catch(() => toast('Não foi possível copiar', { type: 'danger' }));
    },
  }, '📋 Copiar');
  const textButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!output.value) return;
      const link = h('a', {
        href: URL.createObjectURL(new Blob([output.value], { type: 'text/plain' })),
        download: 'ocr.txt',
      });
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    },
  }, '⬇️ .txt');
  const resultCard = h('div', { className: 'ocr-result' },
    h('div', { className: 'ocr-result__head' },
      h('span', { className: 'ocr-result__title' }, 'Texto reconhecido'),
      h('div', { className: 'ocr-result__actions' }, stat, copyButton, textButton)),
    output);
  page.appendChild(resultCard);

  function setImage(url: string): void {
    if (cameraStream) stopCamera();
    if (currentUrl?.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
    currentUrl = url;
    preview.src = url;
    drop.classList.add('has-image');
    runButton.disabled = false;
  }

  async function toggleCamera(): Promise<void> {
    if (cameraStream) {
      stopCamera();
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      cameraVideo.srcObject = cameraStream;
      drop.classList.add('has-cam');
      drop.classList.remove('has-image');
      cameraButton.textContent = '📸 Capturar';
      runButton.disabled = true;
    } catch {
      toast('Câmera indisponível', { type: 'danger' });
      cameraStream = null;
    }
  }

  cameraButton.addEventListener('click', () => {
    if (!cameraStream) return;
    const canvas = document.createElement('canvas');
    canvas.width = cameraVideo.videoWidth;
    canvas.height = cameraVideo.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      toast('Canvas indisponível para capturar a câmera', { type: 'danger' });
      return;
    }
    context.drawImage(cameraVideo, 0, 0);
    setImage(canvas.toDataURL('image/png'));
  });

  function stopCamera(): void {
    cameraStream?.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    cameraVideo.srcObject = null;
    drop.classList.remove('has-cam');
    cameraButton.textContent = '📷 Câmera';
  }

  async function runOCR(): Promise<void> {
    if (!currentUrl || running) return;
    running = true;
    runButton.disabled = true;
    runButton.textContent = '⏳ Lendo…';
    progress.style.display = 'flex';
    progressFill.style.width = '4%';
    progressLabel.textContent = 'Carregando OCR…';
    output.value = '';
    try {
      await loadScript(TESSERACT_CDN);
      if (!window.Tesseract) throw new Error('Tesseract não carregou');
      const result = await window.Tesseract.recognize(currentUrl, languageSelect.value, {
        logger: (message) => {
          const label = STATUS_PT[message.status] || message.status;
          if (typeof message.progress === 'number') progressFill.style.width = `${Math.round(message.progress * 100)}%`;
          progressLabel.textContent = label;
        },
      });
      output.value = (result.data.text || '').trim();
      const words = output.value ? output.value.split(/\s+/).length : 0;
      stat.textContent = `${output.value.length} caracteres · ${words} palavras · ${Math.round(result.data.confidence)}% confiança`;
      if (!output.value) toast('Nenhum texto reconhecido', { type: 'warning' });
      else toast('Texto extraído', { type: 'success' });
    } catch (error: unknown) {
      console.error('[ocr]', error);
      toast('Falha no OCR (verifique a conexão)', { type: 'danger' });
      progressLabel.textContent = 'Erro ao carregar o OCR.';
    } finally {
      running = false;
      runButton.disabled = false;
      runButton.textContent = '🔍 Ler texto';
      setTimeout(() => { progress.style.display = 'none'; }, 600);
    }
  }

  function onPaste(event: ClipboardEvent): void {
    const items = event.clipboardData?.items ?? [];
    for (const item of items) {
      if (!item.type.startsWith('image/')) continue;
      const file = item.getAsFile();
      if (file) {
        setImage(URL.createObjectURL(file));
        toast('Imagem colada', { type: 'success' });
      }
      break;
    }
  }

  window.addEventListener('paste', onPaste);
  aoSair(page, () => {
    window.removeEventListener('paste', onPaste);
    stopCamera();
    if (currentUrl?.startsWith('blob:')) URL.revokeObjectURL(currentUrl);
  });
  return page;
}
