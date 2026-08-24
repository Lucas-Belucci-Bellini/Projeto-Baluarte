/**
 * Página /qr-studio — QR Code Studio.
 *
 * Gera QR Codes em Canvas com o encoder próprio e lê códigos pela câmera
 * usando BarcodeDetector quando o navegador oferece a API.
 */

import '../styles/qr-studio.css';
import { h, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import { encodeQR } from '../utils/qr-encoder.js';
import { setStatus as setPageStatus } from '../utils/baluarte-status';

const STORAGE_KEY = 'qr-studio:text';
const MODE_KEY = 'qr-studio:mode';
const QUIET = 4;

type QrMode = 'gerar' | 'ler';
type TemplateId = 'texto' | 'wifi' | 'vcard' | 'email';
type StatusKind = 'idle' | 'ok' | 'err';

interface ActiveView {
  el: HTMLDivElement;
  stop: () => void;
}

interface TemplateDefinition {
  id: TemplateId;
  label: string;
}

let routeWatcher: (() => void) | null = null;
let current: ActiveView | null = null;

function escapeWifi(value: string): string {
  return value.replace(/([\\;,:\"])/g, '\\$1');
}

function wifiString(ssid: string, password: string, security: string, hidden: boolean): string {
  if (!ssid.trim()) return '';
  let result = `WIFI:S:${escapeWifi(ssid)};T:${security};`;
  if (security !== 'nopass') result += `P:${escapeWifi(password)};`;
  if (hidden) result += 'H:true;';
  return `${result};`;
}

function vcardString(name: string, phone: string, email: string, organization: string): string {
  if (!name.trim() && !phone.trim() && !email.trim()) return '';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (name.trim()) lines.push(`FN:${name.trim()}`);
  if (phone.trim()) lines.push(`TEL:${phone.trim()}`);
  if (email.trim()) lines.push(`EMAIL:${email.trim()}`);
  if (organization.trim()) lines.push(`ORG:${organization.trim()}`);
  lines.push('END:VCARD');
  return lines.join('\n');
}

function emailString(destination: string, subject: string, body: string): string {
  if (!destination.trim()) return '';
  let result = `mailto:${destination.trim()}`;
  const params: string[] = [];
  if (subject.trim()) params.push(`subject=${encodeURIComponent(subject.trim())}`);
  if (body.trim()) params.push(`body=${encodeURIComponent(body.trim())}`);
  if (params.length) result += `?${params.join('&')}`;
  return result;
}

function field(label: string, input: HTMLElement): HTMLLabelElement {
  return h('label', { className: 'qr-field' }, h('span', null, label), input);
}

export function qrStudioPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-qr' });
  fullPage.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'),
    h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'QR CODE STUDIO'),
  ),
  h('h1', { className: 'page-header__title' }, '▦ QR Code Studio'),
  h('p', { className: 'page-header__description' },
    h('span', { className: 'u-text-cyan' }, 'Gera'),
    ' QR Codes de texto livre ou de modelos (Wi-Fi, vCard, e-mail) com codificador próprio e exporta PNG; ou ',
    h('span', { className: 'u-text-cyan' }, 'lê'), ' QR Codes pela câmera.',
  ),
  ));

  const modeButtons: Record<QrMode, HTMLButtonElement> = {} as Record<QrMode, HTMLButtonElement>;
  const modeBar = h('div', { className: 'qr-mode' });
  const modes: readonly { id: QrMode; label: string }[] = [
    { id: 'gerar', label: '▦ Gerar' },
    { id: 'ler', label: '⛶ Ler' },
  ];
  modes.forEach((mode) => {
    const button = h('button', {
      className: 'qr-mode__btn', onclick: () => setMode(mode.id),
    }, mode.label);
    modeButtons[mode.id] = button;
    modeBar.appendChild(button);
  });
  fullPage.appendChild(modeBar);

  const content = h('div', { className: 'qr-content' });
  fullPage.appendChild(content);

  function setMode(mode: QrMode): void {
    current?.stop();
    storage.set(MODE_KEY, mode);
    setPageStatus('qrStudio', { modo: mode });
    modes.forEach(({ id }) => modeButtons[id].classList.toggle('is-active', id === mode));
    current = mode === 'ler' ? buildReadView() : buildGenerateView();
    empty(content);
    content.appendChild(current.el);
  }

  if (routeWatcher) window.removeEventListener('hashchange', routeWatcher);
  routeWatcher = (): void => {
    if (!location.hash.startsWith('#/qr-studio')) {
      current?.stop();
      current = null;
      if (routeWatcher) window.removeEventListener('hashchange', routeWatcher);
      routeWatcher = null;
    }
  };
  window.addEventListener('hashchange', routeWatcher);

  const savedMode: unknown = storage.get<unknown>(MODE_KEY);
  setMode(savedMode === 'ler' ? 'ler' : 'gerar');
  return fullPage;
}

function buildGenerateView(): ActiveView {
  const view = h('div', { className: 'qr-generate' });
  const savedContent: unknown = storage.get<unknown>(STORAGE_KEY);
  let content = typeof savedContent === 'string'
    ? savedContent
    : 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte';
  let scale = 8;

  const canvas = h('canvas', { className: 'qr-canvas' });
  const context = canvas.getContext('2d');
  const statusElement = h('div', { className: 'qr-status' });
  const inputArea = h('div', { className: 'qr-input-area' });

  function updateStatus(kind: StatusKind, message: string): void {
    statusElement.className = `qr-status qr-status--${kind}`;
    statusElement.textContent = message;
  }

  function render(): void {
    const value = content.trim();
    if (!value) {
      canvas.width = 0;
      canvas.height = 0;
      updateStatus('idle', 'Preencha o conteúdo para gerar o QR Code.');
      return;
    }
    if (!context) {
      updateStatus('err', '▲ Canvas 2D indisponível neste navegador.');
      return;
    }
    try {
      const qr = encodeQR(value);
      const dimension = qr.size + QUIET * 2;
      canvas.width = dimension * scale;
      canvas.height = dimension * scale;
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#0a0a0a';
      for (let row = 0; row < qr.size; row += 1) {
        for (let column = 0; column < qr.size; column += 1) {
          if (qr.modules[row][column]) {
            context.fillRect((column + QUIET) * scale, (row + QUIET) * scale, scale, scale);
          }
        }
      }
      const bytes = new TextEncoder().encode(value).length;
      updateStatus('ok', `● QR válido · versão ${qr.version} · ${qr.size}×${qr.size} módulos · ${bytes} bytes`);
    } catch (error) {
      canvas.width = 0;
      canvas.height = 0;
      const message = error instanceof Error ? error.message : String(error);
      updateStatus('err', `▲ ${message}`);
    }
  }

  function setContent(value: string, shouldPersist: boolean): void {
    content = value || '';
    if (shouldPersist) storage.set(STORAGE_KEY, content);
    render();
  }

  const templates: readonly TemplateDefinition[] = [
    { id: 'texto', label: 'Texto livre' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'vcard', label: 'vCard' },
    { id: 'email', label: 'E-mail' },
  ];
  const chips: Partial<Record<TemplateId, HTMLButtonElement>> = {};
  const chipRow = h('div', { className: 'qr-templates' });
  templates.forEach((template) => {
    const chip = h('button', {
      className: 'chip', onclick: () => selectTemplate(template.id),
    }, template.label);
    chips[template.id] = chip;
    chipRow.appendChild(chip);
  });

  function selectTemplate(id: TemplateId): void {
    templates.forEach(({ id: templateId }) => chips[templateId]?.classList.toggle('chip--active', templateId === id));
    empty(inputArea);
    inputArea.appendChild(builders[id]());
  }

  function buildTexto(): HTMLTextAreaElement {
    const saved: unknown = storage.get<unknown>(STORAGE_KEY);
    const textarea = h('textarea', {
      className: 'qr-input u-mono',
      rows: 4,
      spellcheck: false,
      placeholder: 'Texto ou URL…',
      value: typeof saved === 'string' ? saved : content,
      oninput: debounce(() => setContent(textarea.value, true), 200),
    });
    setContent(textarea.value, false);
    return textarea;
  }

  function buildWifi(): HTMLDivElement {
    const ssid = h('input', { className: 'input', type: 'text', placeholder: 'Nome da rede' });
    const password = h('input', { className: 'input', type: 'text', placeholder: 'Senha' });
    const security = h('select', { className: 'input' },
      h('option', { value: 'WPA' }, 'WPA/WPA2'),
      h('option', { value: 'WEP' }, 'WEP'),
      h('option', { value: 'nopass' }, 'Sem senha (aberta)'),
    );
    const hidden = h('input', { type: 'checkbox' });
    const rebuild = debounce(() => {
      password.disabled = security.value === 'nopass';
      setContent(wifiString(ssid.value, password.value, security.value, hidden.checked), false);
    }, 150);
    ssid.oninput = rebuild;
    password.oninput = rebuild;
    security.onchange = rebuild;
    hidden.onchange = rebuild;
    const element = h('div', { className: 'qr-fields' },
      field('Rede (SSID)', ssid), field('Senha', password), field('Segurança', security),
      h('label', { className: 'qr-field qr-field--inline' }, hidden, h('span', null, 'Rede oculta')),
    );
    rebuild();
    return element;
  }

  function buildVcard(): HTMLDivElement {
    const name = h('input', { className: 'input', type: 'text', placeholder: 'Nome completo' });
    const phone = h('input', { className: 'input', type: 'tel', placeholder: '+55 11 99999-9999' });
    const email = h('input', { className: 'input', type: 'email', placeholder: 'email@exemplo.com' });
    const organization = h('input', { className: 'input', type: 'text', placeholder: 'Empresa / organização' });
    const rebuild = debounce(() => setContent(
      vcardString(name.value, phone.value, email.value, organization.value), false,
    ), 150);
    name.oninput = rebuild;
    phone.oninput = rebuild;
    email.oninput = rebuild;
    organization.oninput = rebuild;
    const element = h('div', { className: 'qr-fields' },
      field('Nome', name), field('Telefone', phone), field('E-mail', email), field('Organização', organization),
    );
    rebuild();
    return element;
  }

  function buildEmail(): HTMLDivElement {
    const destination = h('input', { className: 'input', type: 'email', placeholder: 'destinatario@exemplo.com' });
    const subject = h('input', { className: 'input', type: 'text', placeholder: 'Assunto' });
    const body = h('textarea', { className: 'qr-input', rows: 3, placeholder: 'Mensagem' });
    const rebuild = debounce(() => setContent(
      emailString(destination.value, subject.value, body.value), false,
    ), 150);
    destination.oninput = rebuild;
    subject.oninput = rebuild;
    body.oninput = rebuild;
    const element = h('div', { className: 'qr-fields' },
      field('Destinatário', destination), field('Assunto', subject), field('Mensagem', body),
    );
    rebuild();
    return element;
  }

  const builders: Record<TemplateId, () => HTMLElement> = {
    texto: buildTexto,
    wifi: buildWifi,
    vcard: buildVcard,
    email: buildEmail,
  };

  const scaleLabel = h('span', { className: 'u-mono u-text-cyan qr-scale__val' }, `${scale}px`);
  const scaleSlider = h('input', {
    type: 'range', min: '4', max: '16', step: '1', value: String(scale),
    'aria-label': 'Tamanho do módulo do QR, em pixels',
    oninput: (event: Event) => {
      if (!(event.target instanceof HTMLInputElement)) return;
      scale = Number.parseInt(event.target.value, 10);
      scaleLabel.textContent = `${scale}px`;
      render();
    },
  });

  const downloadButton = h('button', {
    className: 'btn btn--primary btn--sm',
    onclick: () => {
      if (!canvas.width) {
        toast('Nada para baixar', { type: 'warning' });
        return;
      }
      const link = document.createElement('a');
      link.download = 'qrcode-baluarte.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast('PNG exportado', { type: 'success' });
    },
  }, '⤓ Baixar PNG');

  view.appendChild(h('div', { className: 'qr-layout' },
    h('div', { className: 'qr-controls card' },
      h('div', { className: 'qr-controls__label' }, 'MODELO'), chipRow, inputArea,
      h('div', { className: 'qr-ctl' }, h('label', null, 'Tamanho'), scaleSlider, scaleLabel),
      downloadButton, statusElement,
    ),
    h('div', { className: 'qr-preview' }, canvas),
  ));

  selectTemplate('texto');
  return { el: view, stop: () => undefined };
}

function buildReadView(): ActiveView {
  const view = h('div', { className: 'qr-read' });
  if (typeof BarcodeDetector === 'undefined') {
    view.appendChild(h('div', { className: 'qr-read__warn card' },
      h('div', { className: 'qr-read__warn-icon' }, '⚠'),
      h('div', null,
        h('strong', null, 'Leitura por câmera indisponível'),
        h('p', { style: { marginTop: '4px' } },
          'Este navegador não tem a API ', h('code', null, 'BarcodeDetector'),
          '. Use o Chrome ou o Edge (no computador ou no Android) para ler QR Codes pela câmera. O modo Gerar funciona normalmente.',
        ),
      ),
    ));
    return { el: view, stop: () => undefined };
  }

  let detector: BarcodeDetector;
  try {
    detector = new BarcodeDetector({ formats: ['qr_code'] });
  } catch {
    view.appendChild(h('div', { className: 'qr-read__warn card' },
      h('div', { className: 'qr-read__warn-icon' }, '⚠'),
      h('div', null, h('strong', null, 'BarcodeDetector não pôde iniciar neste navegador.')),
    ));
    return { el: view, stop: () => undefined };
  }

  const video = h('video', { className: 'qr-video', muted: true, playsinline: true });
  const startButton = h('button', { className: 'btn btn--primary' }, '▦ Ativar câmera');
  const statusElement = h('div', { className: 'qr-status qr-status--idle' }, 'Câmera desligada.');
  const resultElement = h('div', { className: 'qr-result' });
  let stream: MediaStream | null = null;
  let scanning = false;
  let scanTimer: ReturnType<typeof setTimeout> | null = null;

  function updateStatus(kind: StatusKind, message: string): void {
    statusElement.className = `qr-status qr-status--${kind}`;
    statusElement.textContent = message;
  }

  function renderPlaceholder(): void {
    empty(resultElement);
    resultElement.appendChild(h('div', { className: 'qr-result__empty u-text-muted' },
      'Nenhum QR Code lido ainda. Ative a câmera e aponte para um código.',
    ));
  }

  function renderResult(value: string): void {
    empty(resultElement);
    const isUrl = /^https?:\/\//i.test(value);
    resultElement.appendChild(h('div', { className: 'qr-result__label' }, 'CONTEÚDO LIDO'));
    resultElement.appendChild(h('div', { className: 'qr-result__value u-mono' }, value));
    resultElement.appendChild(h('div', { className: 'qr-result__actions' },
      h('button', {
        className: 'btn btn--sm',
        onclick: () => {
          if (navigator.clipboard) {
            navigator.clipboard.writeText(value).then(
              () => toast('Copiado', { type: 'success' }),
              () => toast('Não foi possível copiar', { type: 'danger' }),
            );
          }
        },
      }, '⧉ Copiar'),
      isUrl ? h('a', {
        className: 'btn btn--sm', href: value, target: '_blank', rel: 'noopener noreferrer',
      }, '↗ Abrir link') : false,
    ));
  }

  async function tick(): Promise<void> {
    if (!scanning) return;
    if (video.readyState >= 2) {
      try {
        const codes = await detector.detect(video);
        const rawValue = codes[0]?.rawValue;
        if (rawValue) {
          onResult(rawValue);
          return;
        }
      } catch {
        // Frames intermediários podem falhar; a próxima tentativa continua o scan.
      }
    }
    scanTimer = setTimeout(() => { void tick(); }, 160);
  }

  function onResult(value: string): void {
    stopCamera();
    updateStatus('ok', '● QR Code lido com sucesso.');
    renderResult(value);
    toast('QR Code lido', { type: 'success' });
  }

  async function startCamera(): Promise<void> {
    if (!navigator.mediaDevices?.getUserMedia) {
      updateStatus('err', 'Câmera indisponível — requer HTTPS e suporte do navegador.');
      return;
    }
    updateStatus('idle', 'Pedindo acesso à câmera…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    } catch {
      updateStatus('err', 'Acesso à câmera negado ou nenhuma câmera encontrada.');
      return;
    }
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      // Alguns navegadores exigem uma interação adicional para iniciar a reprodução.
    }
    scanning = true;
    startButton.textContent = '■ Parar câmera';
    updateStatus('idle', 'Aponte a câmera para um QR Code…');
    void tick();
  }

  function stopCamera(): void {
    scanning = false;
    if (scanTimer) {
      clearTimeout(scanTimer);
      scanTimer = null;
    }
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    video.srcObject = null;
    startButton.textContent = '▦ Ativar câmera';
  }

  startButton.onclick = () => {
    if (scanning) {
      stopCamera();
      updateStatus('idle', 'Câmera desligada.');
    } else {
      void startCamera();
    }
  };

  renderPlaceholder();
  view.appendChild(h('div', { className: 'qr-read__layout' },
    h('div', { className: 'qr-read__cam card' },
      h('div', { className: 'qr-video-wrap' }, video),
      h('div', { className: 'qr-read__controls' }, startButton, statusElement),
    ),
    h('div', { className: 'qr-read__panel card' }, resultElement),
  ));
  return { el: view, stop: stopCamera };
}
