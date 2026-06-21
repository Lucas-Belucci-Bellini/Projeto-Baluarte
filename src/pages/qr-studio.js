/**
 * Página /qr-studio — QR Code Studio (v2.1.0).
 *
 * Dois modos:
 *  • Gerar — cria QR Codes a partir de texto livre ou de modelos
 *    (Wi-Fi, vCard, e-mail), com codificador próprio (qr-encoder.js).
 *    Renderiza em Canvas e exporta PNG.
 *  • Ler — lê QR Codes pela câmera via API BarcodeDetector.
 */

import '../styles/qr-studio.css';
import { h, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { encodeQR } from '../utils/qr-encoder.js';
import { setStatus } from '../utils/baluarte-status.js';

const STORAGE_KEY = 'qr-studio:text';
const MODE_KEY = 'qr-studio:mode';
const QUIET = 4; /* zona de silêncio, em módulos */

let routeWatcher = null;
let current = null; /* { el, stop } da view ativa */

/* ===== Geradores de string dos modelos ===== */

/* Escapa os caracteres especiais do formato WIFI/MeCard. */
function escapeWifi(s) {
  return String(s).replace(/([\\;,:"])/g, '\\$1');
}

function wifiString(ssid, senha, seguranca, oculta) {
  if (!ssid.trim()) return '';
  let s = `WIFI:S:${escapeWifi(ssid)};T:${seguranca};`;
  if (seguranca !== 'nopass') s += `P:${escapeWifi(senha)};`;
  if (oculta) s += 'H:true;';
  return s + ';';
}

function vcardString(nome, tel, email, org) {
  if (!nome.trim() && !tel.trim() && !email.trim()) return '';
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (nome.trim()) lines.push('FN:' + nome.trim());
  if (tel.trim()) lines.push('TEL:' + tel.trim());
  if (email.trim()) lines.push('EMAIL:' + email.trim());
  if (org.trim()) lines.push('ORG:' + org.trim());
  lines.push('END:VCARD');
  return lines.join('\n');
}

function emailString(destino, assunto, corpo) {
  if (!destino.trim()) return '';
  let s = 'mailto:' + destino.trim();
  const params = [];
  if (assunto.trim()) params.push('subject=' + encodeURIComponent(assunto.trim()));
  if (corpo.trim()) params.push('body=' + encodeURIComponent(corpo.trim()));
  if (params.length) s += '?' + params.join('&');
  return s;
}

/* Campo rotulado para os formulários de modelo. */
function field(label, inputEl) {
  return h('label', { className: 'qr-field' }, h('span', null, label), inputEl);
}

export function qrStudioPage() {
  const fullPage = h('div', { className: 'page-qr' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'QR CODE STUDIO')),
      h('h1', { className: 'page-header__title' }, '▦ QR Code Studio'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, 'Gera'),
        ' QR Codes de texto livre ou de modelos (Wi-Fi, vCard, e-mail) com ',
        'codificador próprio e exporta PNG; ou ',
        h('span', { className: 'u-text-cyan' }, 'lê'),
        ' QR Codes pela câmera.')
    )
  );

  /* ===== Alternador de modo ===== */
  const modeBtns = {};
  const modeBar = h('div', { className: 'qr-mode' });
  [
    { id: 'gerar', label: '▦ Gerar' },
    { id: 'ler', label: '⛶ Ler' }
  ].forEach((mo) => {
    const btn = h('button', { className: 'qr-mode__btn', onclick: () => setMode(mo.id) }, mo.label);
    modeBtns[mo.id] = btn;
    modeBar.appendChild(btn);
  });
  fullPage.appendChild(modeBar);

  const contentEl = h('div', { className: 'qr-content' });
  fullPage.appendChild(contentEl);

  function setMode(mode) {
    if (current && current.stop) current.stop();
    storage.set(MODE_KEY, mode);
    setStatus('qrStudio', { modo: mode });
    Object.entries(modeBtns).forEach(([id, btn]) =>
      btn.classList.toggle('is-active', id === mode));
    current = mode === 'ler' ? buildReadView() : buildGenerateView();
    empty(contentEl);
    contentEl.appendChild(current.el);
  }

  /* Encerra a câmera ao sair da rota */
  if (routeWatcher) window.removeEventListener('hashchange', routeWatcher);
  routeWatcher = () => {
    if (!location.hash.startsWith('#/qr-studio')) {
      if (current && current.stop) current.stop();
      current = null;
      window.removeEventListener('hashchange', routeWatcher);
      routeWatcher = null;
    }
  };
  window.addEventListener('hashchange', routeWatcher);

  const saved = storage.get(MODE_KEY);
  setMode(saved === 'ler' ? 'ler' : 'gerar');
  return fullPage;
}

/* ============================================================
 * Modo Gerar
 * ============================================================ */

function buildGenerateView() {
  const view = h('div', { className: 'qr-generate' });

  let content = storage.get(STORAGE_KEY);
  if (typeof content !== 'string') {
    content = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte';
  }
  let scale = 8;

  const canvas = h('canvas', { className: 'qr-canvas' });
  const ctx = canvas.getContext('2d');
  const statusEl = h('div', { className: 'qr-status' });
  const inputArea = h('div', { className: 'qr-input-area' });

  function setStatus(kind, msg) {
    statusEl.className = `qr-status qr-status--${kind}`;
    statusEl.textContent = msg;
  }

  function render() {
    const value = (content || '').trim();
    if (!value) {
      canvas.width = canvas.height = 0;
      setStatus('idle', 'Preencha o conteúdo para gerar o QR Code.');
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

  /* Define o conteúdo a codificar e re-renderiza. */
  function setContent(str, persist) {
    content = str || '';
    if (persist) storage.set(STORAGE_KEY, content);
    render();
  }

  /* ===== Modelos ===== */
  const TEMPLATES = [
    { id: 'texto', label: 'Texto livre' },
    { id: 'wifi', label: 'Wi-Fi' },
    { id: 'vcard', label: 'vCard' },
    { id: 'email', label: 'E-mail' }
  ];
  const chips = {};
  const chipRow = h('div', { className: 'qr-templates' });
  TEMPLATES.forEach((t) => {
    const chip = h('button', { className: 'chip', onclick: () => selectTemplate(t.id) }, t.label);
    chips[t.id] = chip;
    chipRow.appendChild(chip);
  });

  function selectTemplate(id) {
    Object.entries(chips).forEach(([cid, chip]) =>
      chip.classList.toggle('chip--active', cid === id));
    empty(inputArea);
    inputArea.appendChild(BUILDERS[id]());
  }

  function buildTexto() {
    const saved = storage.get(STORAGE_KEY);
    const ta = h('textarea', {
      className: 'qr-input u-mono',
      rows: 4,
      spellcheck: false,
      placeholder: 'Texto ou URL…',
      value: typeof saved === 'string' ? saved : content,
      oninput: debounce(() => setContent(ta.value, true), 200)
    });
    setContent(ta.value, false);
    return ta;
  }

  function buildWifi() {
    const ssid = h('input', { className: 'input', type: 'text', placeholder: 'Nome da rede' });
    const senha = h('input', { className: 'input', type: 'text', placeholder: 'Senha' });
    const seg = h('select', { className: 'input' },
      h('option', { value: 'WPA' }, 'WPA/WPA2'),
      h('option', { value: 'WEP' }, 'WEP'),
      h('option', { value: 'nopass' }, 'Sem senha (aberta)'));
    const oculta = h('input', { type: 'checkbox' });
    const rebuild = debounce(() => {
      senha.disabled = seg.value === 'nopass';
      setContent(wifiString(ssid.value, senha.value, seg.value, oculta.checked), false);
    }, 150);
    [ssid, senha].forEach((i) => (i.oninput = rebuild));
    seg.onchange = rebuild;
    oculta.onchange = rebuild;
    const el = h('div', { className: 'qr-fields' },
      field('Rede (SSID)', ssid),
      field('Senha', senha),
      field('Segurança', seg),
      h('label', { className: 'qr-field qr-field--inline' }, oculta, h('span', null, 'Rede oculta')));
    rebuild();
    return el;
  }

  function buildVcard() {
    const nome = h('input', { className: 'input', type: 'text', placeholder: 'Nome completo' });
    const tel = h('input', { className: 'input', type: 'tel', placeholder: '+55 11 99999-9999' });
    const email = h('input', { className: 'input', type: 'email', placeholder: 'email@exemplo.com' });
    const org = h('input', { className: 'input', type: 'text', placeholder: 'Empresa / organização' });
    const rebuild = debounce(() =>
      setContent(vcardString(nome.value, tel.value, email.value, org.value), false), 150);
    [nome, tel, email, org].forEach((i) => (i.oninput = rebuild));
    const el = h('div', { className: 'qr-fields' },
      field('Nome', nome),
      field('Telefone', tel),
      field('E-mail', email),
      field('Organização', org));
    rebuild();
    return el;
  }

  function buildEmail() {
    const destino = h('input', { className: 'input', type: 'email', placeholder: 'destinatario@exemplo.com' });
    const assunto = h('input', { className: 'input', type: 'text', placeholder: 'Assunto' });
    const corpo = h('textarea', { className: 'qr-input', rows: 3, placeholder: 'Mensagem' });
    const rebuild = debounce(() =>
      setContent(emailString(destino.value, assunto.value, corpo.value), false), 150);
    [destino, assunto, corpo].forEach((i) => (i.oninput = rebuild));
    const el = h('div', { className: 'qr-fields' },
      field('Destinatário', destino),
      field('Assunto', assunto),
      field('Mensagem', corpo));
    rebuild();
    return el;
  }

  const BUILDERS = { texto: buildTexto, wifi: buildWifi, vcard: buildVcard, email: buildEmail };

  /* ===== Controles compartilhados ===== */
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

  view.appendChild(
    h('div', { className: 'qr-layout' },
      h('div', { className: 'qr-controls card' },
        h('div', { className: 'qr-controls__label' }, 'MODELO'),
        chipRow,
        inputArea,
        h('div', { className: 'qr-ctl' },
          h('label', null, 'Tamanho'), scaleSlider, scaleLabel),
        downloadBtn,
        statusEl
      ),
      h('div', { className: 'qr-preview' }, canvas)
    )
  );

  selectTemplate('texto');
  return { el: view, stop() {} };
}

/* ============================================================
 * Modo Ler — câmera via BarcodeDetector
 * ============================================================ */

function buildReadView() {
  const view = h('div', { className: 'qr-read' });

  if (!('BarcodeDetector' in window)) {
    view.appendChild(
      h('div', { className: 'qr-read__warn card' },
        h('div', { className: 'qr-read__warn-icon' }, '⚠'),
        h('div', null,
          h('strong', null, 'Leitura por câmera indisponível'),
          h('p', { style: { marginTop: '4px' } },
            'Este navegador não tem a API ', h('code', null, 'BarcodeDetector'),
            '. Use o Chrome ou o Edge (no computador ou no Android) para ler ',
            'QR Codes pela câmera. O modo Gerar funciona normalmente.'))
      )
    );
    return { el: view, stop() {} };
  }

  let detector;
  try {
    detector = new window.BarcodeDetector({ formats: ['qr_code'] });
  } catch {
    view.appendChild(h('div', { className: 'qr-read__warn card' },
      h('div', { className: 'qr-read__warn-icon' }, '⚠'),
      h('div', null, h('strong', null, 'BarcodeDetector não pôde iniciar neste navegador.'))));
    return { el: view, stop() {} };
  }

  const videoEl = h('video', { className: 'qr-video', muted: true, playsinline: true });
  const startBtn = h('button', { className: 'btn btn--primary' }, '▦ Ativar câmera');
  const statusEl = h('div', { className: 'qr-status qr-status--idle' }, 'Câmera desligada.');
  const resultEl = h('div', { className: 'qr-result' });

  let stream = null;
  let scanning = false;
  let scanTimer = 0;

  function setStatus(kind, msg) {
    statusEl.className = `qr-status qr-status--${kind}`;
    statusEl.textContent = msg;
  }

  function renderPlaceholder() {
    empty(resultEl);
    resultEl.appendChild(
      h('div', { className: 'qr-result__empty u-text-muted' },
        'Nenhum QR Code lido ainda. Ative a câmera e aponte para um código.'));
  }

  function renderResult(value) {
    empty(resultEl);
    const isUrl = /^https?:\/\//i.test(value);
    resultEl.appendChild(h('div', { className: 'qr-result__label' }, 'CONTEÚDO LIDO'));
    resultEl.appendChild(h('div', { className: 'qr-result__value u-mono' }, value));
    resultEl.appendChild(
      h('div', { className: 'qr-result__actions' },
        h('button', {
          className: 'btn btn--sm',
          onclick: () => {
            if (navigator.clipboard) {
              navigator.clipboard.writeText(value).then(
                () => toast('Copiado', { type: 'success' }),
                () => toast('Não foi possível copiar', { type: 'danger' }));
            }
          }
        }, '⧉ Copiar'),
        isUrl && h('a', {
          className: 'btn btn--sm', href: value, target: '_blank', rel: 'noopener noreferrer'
        }, '↗ Abrir link'))
    );
  }

  async function tick() {
    if (!scanning) return;
    if (videoEl.readyState >= 2) {
      try {
        const codes = await detector.detect(videoEl);
        if (codes && codes.length && codes[0].rawValue) {
          onResult(codes[0].rawValue);
          return;
        }
      } catch {
        /* detect pode falhar em frames intermediários — ignora e tenta de novo */
      }
    }
    scanTimer = setTimeout(tick, 160);
  }

  function onResult(value) {
    stopCamera();
    setStatus('ok', '● QR Code lido com sucesso.');
    renderResult(value);
    toast('QR Code lido', { type: 'success' });
  }

  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('err', 'Câmera indisponível — requer HTTPS e suporte do navegador.');
      return;
    }
    setStatus('idle', 'Pedindo acesso à câmera…');
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
    } catch {
      setStatus('err', 'Acesso à câmera negado ou nenhuma câmera encontrada.');
      return;
    }
    videoEl.srcObject = stream;
    try { await videoEl.play(); } catch { /* play pode rejeitar; o stream segue */ }
    scanning = true;
    startBtn.textContent = '■ Parar câmera';
    setStatus('idle', 'Aponte a câmera para um QR Code…');
    tick();
  }

  function stopCamera() {
    scanning = false;
    if (scanTimer) { clearTimeout(scanTimer); scanTimer = 0; }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    videoEl.srcObject = null;
    startBtn.textContent = '▦ Ativar câmera';
  }

  startBtn.onclick = () => {
    if (scanning) {
      stopCamera();
      setStatus('idle', 'Câmera desligada.');
    } else {
      startCamera();
    }
  };

  renderPlaceholder();
  view.appendChild(
    h('div', { className: 'qr-read__layout' },
      h('div', { className: 'qr-read__cam card' },
        h('div', { className: 'qr-video-wrap' }, videoEl),
        h('div', { className: 'qr-read__controls' }, startBtn, statusEl)),
      h('div', { className: 'qr-read__panel card' }, resultEl)
    )
  );

  return { el: view, stop: stopCamera };
}
