/**
 * Esteganografia — esconde/revela texto dentro de imagens via LSB.
 * (Plano IA Baluarte, doc 09 — ferramenta independente do Hub.)
 *
 * Técnica: troca o bit menos significativo (LSB) dos canais R, G, B de cada
 * pixel pelos bits da mensagem. A saída é sempre PNG (sem perda); JPEG e
 * redes sociais recomprimem a imagem e destroem a mensagem.
 *
 * Opcional: cifra a mensagem com AES-GCM (mesma engine de /cripto) antes de
 * escondê-la — só quem tem a senha consegue ler o texto revelado.
 */

import '../styles/esteganografia.css';
import { h, mount, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status.js';
import {
  textToBytes,
  bytesToText,
  aesEncrypt,
  aesDecrypt
} from '../utils/cripto-engine.js';

/* Cabeçalho embutido antes da mensagem:
 *   [0..1] magic 'B','S'  → marca um payload do Baluarte
 *   [2]    flags          → bit0 = cifrado com AES
 *   [3..6] uint32 BE      → comprimento da mensagem em bytes
 * O comprimento explícito dispensa delimitador e evita falsos positivos. */
const MAGIC = [0x42, 0x53];
const HEADER_BYTES = 7;

/* ============================================================
 *  LSB core
 * ============================================================ */

function buildPacket(messageBytes, encrypted) {
  const len = messageBytes.length;
  const out = new Uint8Array(HEADER_BYTES + len);
  out[0] = MAGIC[0];
  out[1] = MAGIC[1];
  out[2] = encrypted ? 1 : 0;
  out[3] = (len >>> 24) & 0xff;
  out[4] = (len >>> 16) & 0xff;
  out[5] = (len >>> 8) & 0xff;
  out[6] = len & 0xff;
  out.set(messageBytes, HEADER_BYTES);
  return out;
}

/** Bits usáveis numa imagem: 3 canais (R,G,B) por pixel, alpha intacto. */
function capacityBits(imageData) {
  return (imageData.data.length / 4) * 3;
}

function embed(imageData, packet) {
  const data = imageData.data;
  const totalBits = packet.length * 8;
  if (totalBits > capacityBits(imageData)) {
    throw new RangeError('imagem pequena demais');
  }
  let bit = 0;
  for (let p = 0; p < data.length && bit < totalBits; p += 4) {
    for (let c = 0; c < 3 && bit < totalBits; c++) {
      const byte = packet[bit >> 3];
      const bitVal = (byte >> (7 - (bit & 7))) & 1;
      data[p + c] = (data[p + c] & 0xfe) | bitVal;
      bit++;
    }
  }
}

/** Lê os primeiros `nBytes` bytes escondidos (LSB de R,G,B em ordem). */
function readBytes(data, nBytes, startBit) {
  const out = new Uint8Array(nBytes);
  let bit = startBit;
  for (let i = 0; i < nBytes; i++) {
    let byte = 0;
    for (let b = 0; b < 8; b++) {
      const pixel = Math.floor(bit / 3);
      const channel = bit % 3;
      const idx = pixel * 4 + channel;
      if (idx >= data.length) throw new RangeError('dados insuficientes');
      byte = (byte << 1) | (data[idx] & 1);
      bit++;
    }
    out[i] = byte;
  }
  return out;
}

function extract(imageData) {
  const data = imageData.data;
  const header = readBytes(data, HEADER_BYTES, 0);
  if (header[0] !== MAGIC[0] || header[1] !== MAGIC[1]) return null;

  const encrypted = (header[2] & 1) === 1;
  const len =
    ((header[3] << 24) | (header[4] << 16) | (header[5] << 8) | header[6]) >>> 0;

  const maxLen = Math.floor(capacityBits(imageData) / 8) - HEADER_BYTES;
  if (len <= 0 || len > maxLen) return null;

  const messageBytes = readBytes(data, len, HEADER_BYTES * 8);
  return { encrypted, messageBytes };
}

/* ============================================================
 *  Imagem → ImageData
 * ============================================================ */

function fileToImageData(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const cv = document.createElement('canvas');
      cv.width = img.naturalWidth;
      cv.height = img.naturalHeight;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      try {
        resolve(ctx.getImageData(0, 0, cv.width, cv.height));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('falha ao carregar imagem'));
    };
    img.src = url;
  });
}

function imageDataToPngUrl(imageData) {
  const cv = document.createElement('canvas');
  cv.width = imageData.width;
  cv.height = imageData.height;
  cv.getContext('2d').putImageData(imageData, 0, 0);
  return cv.toDataURL('image/png');
}

function cloneImageData(src) {
  return new ImageData(new Uint8ClampedArray(src.data), src.width, src.height);
}

/* ============================================================
 *  UI helpers
 * ============================================================ */

function field(label, control, hint) {
  return h(
    'label',
    { className: 'steg-field' },
    h('span', { className: 'steg-field__label' }, label),
    control,
    hint && h('span', { className: 'steg-field__hint' }, hint)
  );
}

/* ============================================================
 *  Painel: ESCONDER
 * ============================================================ */

function hidePanel() {
  let carrier = null; // ImageData da imagem portadora
  let resultUrl = null;

  const capacityEl = h('span', { className: 'steg-cap u-text-muted' }, 'Nenhuma imagem carregada.');
  const preview = h('div', { className: 'steg-preview' });
  const fileInput = h('input', {
    className: 'input',
    type: 'file',
    accept: 'image/png,image/bmp,image/webp,image/*',
    onchange: async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        carrier = await fileToImageData(file);
        setStatus('esteganografia', { portadora: `${carrier.width}x${carrier.height}` });
        const maxChars = Math.floor(capacityBits(carrier) / 8) - HEADER_BYTES;
        capacityEl.innerHTML = `Portadora <b>${carrier.width}×${carrier.height}</b> — cabe até <b class="u-text-cyan">${maxChars.toLocaleString('pt-BR')}</b> bytes de mensagem.`;
        capacityEl.classList.remove('u-text-muted');
        mount(preview, h('img', { src: imageDataToPngUrl(carrier), alt: 'Portadora' }));
      } catch {
        carrier = null;
        toast('Não consegui ler essa imagem.', { type: 'error' });
      }
    }
  });

  const messageInput = h('textarea', {
    className: 'input steg-textarea',
    rows: 5,
    placeholder: 'Mensagem secreta a esconder na imagem...'
  });

  const passInput = h('input', {
    className: 'input',
    type: 'password',
    placeholder: 'Senha (opcional)',
    autocomplete: 'new-password'
  });

  const resultBox = h('div', { className: 'steg-result' });

  const hideBtn = h(
    'button',
    {
      className: 'btn btn--primary',
      onclick: async () => {
        if (!carrier) {
          toast('Carregue uma imagem portadora primeiro.', { type: 'warning' });
          return;
        }
        const message = messageInput.value;
        if (!message) {
          toast('Escreva a mensagem a esconder.', { type: 'warning' });
          return;
        }
        try {
          const password = passInput.value;
          const encrypted = password.length > 0;
          const payloadText = encrypted ? await aesEncrypt(message, password) : message;
          const packet = buildPacket(textToBytes(payloadText), encrypted);

          const maxBytes = Math.floor(capacityBits(carrier) / 8) - HEADER_BYTES;
          if (packet.length - HEADER_BYTES > maxBytes) {
            toast(`Mensagem grande demais: precisa de imagem maior (faltam ~${packet.length - HEADER_BYTES - maxBytes} bytes).`, { type: 'error', duration: 4200 });
            return;
          }

          const out = cloneImageData(carrier);
          embed(out, packet);
          resultUrl = imageDataToPngUrl(out);

          const dlBtn = h('a', {
            className: 'btn btn--primary btn--sm',
            download: 'baluarte-stego.png',
            href: resultUrl
          }, '⤓ Baixar PNG');

          mount(
            resultBox,
            h('div', { className: 'steg-result__inner' },
              h('img', { className: 'steg-result__img', src: resultUrl, alt: 'Resultado' }),
              h('div', { className: 'steg-result__meta' },
                h('span', { className: 'badge badge--success' }, 'MENSAGEM EMBUTIDA'),
                encrypted && h('span', { className: 'badge badge--cyan' }, 'AES'),
                h('p', { className: 'u-text-secondary' }, 'Salve em PNG. Não reenvie por redes sociais — elas recomprimem e apagam a mensagem.'),
                dlBtn
              )
            )
          );
          toast('Mensagem escondida na imagem.', { type: 'success' });
        } catch (err) {
          console.error('[esteganografia] esconder:', err);
          toast('Falha ao esconder a mensagem.', { type: 'error' });
        }
      }
    },
    '◳ Esconder e gerar PNG'
  );

  return h(
    'div',
    { className: 'card steg-panel' },
    h('h2', { className: 'steg-panel__title' }, '◳ Esconder'),
    field('Imagem portadora', fileInput, 'PNG ou BMP. Quanto maior a imagem, mais texto cabe.'),
    preview,
    capacityEl,
    field('Mensagem', messageInput),
    field('Senha', passInput, 'Se preenchida, a mensagem é cifrada com AES-256 antes de ser escondida.'),
    hideBtn,
    resultBox
  );
}

/* ============================================================
 *  Painel: REVELAR
 * ============================================================ */

function revealPanel() {
  let stego = null;

  const preview = h('div', { className: 'steg-preview' });
  const fileInput = h('input', {
    className: 'input',
    type: 'file',
    accept: 'image/png,image/bmp,image/webp,image/*',
    onchange: async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        stego = await fileToImageData(file);
        mount(preview, h('img', { src: imageDataToPngUrl(stego), alt: 'Imagem' }));
      } catch {
        stego = null;
        toast('Não consegui ler essa imagem.', { type: 'error' });
      }
    }
  });

  const passInput = h('input', {
    className: 'input',
    type: 'password',
    placeholder: 'Senha (se a mensagem estiver cifrada)',
    autocomplete: 'new-password'
  });

  const output = h('textarea', {
    className: 'input steg-textarea',
    rows: 5,
    readonly: true,
    placeholder: 'A mensagem revelada aparece aqui...'
  });

  const copyBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: async () => {
      if (!output.value) return;
      try {
        await navigator.clipboard.writeText(output.value);
        toast('Copiado.', { type: 'success' });
      } catch {
        toast('Não consegui copiar.', { type: 'warning' });
      }
    }
  }, '⧉ Copiar');

  const revealBtn = h(
    'button',
    {
      className: 'btn btn--primary',
      onclick: async () => {
        if (!stego) {
          toast('Carregue a imagem com a mensagem oculta.', { type: 'warning' });
          return;
        }
        const found = extract(stego);
        if (!found) {
          output.value = '';
          toast('Nenhuma mensagem do Baluarte encontrada nesta imagem.', { type: 'warning', duration: 3600 });
          return;
        }
        const payloadText = bytesToText(found.messageBytes);
        if (!found.encrypted) {
          output.value = payloadText;
          toast('Mensagem revelada.', { type: 'success' });
          return;
        }
        const password = passInput.value;
        if (!password) {
          output.value = '';
          toast('Esta mensagem está cifrada — informe a senha.', { type: 'warning', duration: 3600 });
          return;
        }
        try {
          output.value = await aesDecrypt(payloadText, password);
          toast('Mensagem decifrada e revelada.', { type: 'success' });
        } catch {
          output.value = '';
          toast('Senha incorreta ou dados corrompidos.', { type: 'error' });
        }
      }
    },
    '◰ Revelar mensagem'
  );

  return h(
    'div',
    { className: 'card steg-panel' },
    h('h2', { className: 'steg-panel__title' }, '◰ Revelar'),
    field('Imagem', fileInput, 'A imagem PNG que recebeu a mensagem.'),
    preview,
    field('Senha', passInput),
    revealBtn,
    field('Mensagem revelada', output),
    h('div', { className: 'steg-reveal__actions' }, copyBtn)
  );
}

/* ============================================================
 *  Página
 * ============================================================ */

export function esteganografiaPage() {
  const page = h('div', { className: 'page-esteganografia' });

  page.appendChild(
    h(
      'div',
      { className: 'page-header anim-fade-in' },
      h(
        'div',
        { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'CRIPTOGRAFIA'),
        h('span', null, '›'),
        h('span', null, 'ESTEGANOGRAFIA')
      ),
      h('h1', { className: 'page-header__title' }, 'Esteganografia'),
      h(
        'p',
        { className: 'page-header__description' },
        'Esconda texto ',
        h('span', { className: 'u-text-cyan' }, 'dentro de uma imagem'),
        ' alterando o bit menos significativo (LSB) de cada pixel — invisível ao olho, ',
        'legível por software. Tudo roda ',
        h('span', { className: 'u-text-cyan' }, 'no navegador'),
        '; nenhuma imagem sai do seu dispositivo.'
      )
    )
  );

  page.appendChild(
    h('div', { className: 'steg-grid anim-fade-in-up' }, hidePanel(), revealPanel())
  );

  page.appendChild(
    h(
      'div',
      { className: 'card steg-note' },
      h('h3', null, 'Como funciona'),
      h(
        'ul',
        null,
        h('li', null, 'Cada pixel tem 3 canais (R, G, B). Trocamos só o último bit de cada um pelos bits da sua mensagem.'),
        h('li', null, h('b', null, 'Use PNG ou BMP.'), ' JPEG comprime com perdas e destrói a mensagem.'),
        h('li', null, h('b', null, 'Redes sociais recomprimem'), ' as imagens (WhatsApp, Instagram, Facebook) e apagam o conteúdo oculto. Compartilhe o arquivo original.'),
        h('li', null, 'Com senha, a mensagem é cifrada com AES-256 antes de ser escondida — dupla camada de proteção.')
      )
    )
  );

  return page;
}
