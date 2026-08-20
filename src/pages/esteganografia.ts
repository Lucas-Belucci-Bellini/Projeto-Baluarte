/**
 * Esteganografia — esconde/revela texto dentro de imagens via LSB.
 *
 * A saída é PNG sem perdas; opcionalmente o payload é cifrado com AES-GCM
 * antes de ser embutido.
 */

import '../styles/esteganografia.css';
import { h, mount } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { setStatus } from '../utils/baluarte-status';
import {
  textToBytes,
  bytesToText,
  aesEncrypt,
  aesDecrypt,
} from '../utils/cripto-engine.js';

const MAGIC: readonly [number, number] = [0x42, 0x53];
const HEADER_BYTES = 7;

interface ExtractedPayload {
  readonly encrypted: boolean;
  readonly messageBytes: Uint8Array;
}

function buildPacket(messageBytes: Uint8Array, encrypted: boolean): Uint8Array {
  const length = messageBytes.length;
  const output = new Uint8Array(HEADER_BYTES + length);
  output[0] = MAGIC[0];
  output[1] = MAGIC[1];
  output[2] = encrypted ? 1 : 0;
  output[3] = (length >>> 24) & 0xff;
  output[4] = (length >>> 16) & 0xff;
  output[5] = (length >>> 8) & 0xff;
  output[6] = length & 0xff;
  output.set(messageBytes, HEADER_BYTES);
  return output;
}

function capacityBits(imageData: ImageData): number {
  return (imageData.data.length / 4) * 3;
}

function embed(imageData: ImageData, packet: Uint8Array): void {
  const data = imageData.data;
  const totalBits = packet.length * 8;
  if (totalBits > capacityBits(imageData)) throw new RangeError('imagem pequena demais');
  let bit = 0;
  for (let pixel = 0; pixel < data.length && bit < totalBits; pixel += 4) {
    for (let channel = 0; channel < 3 && bit < totalBits; channel += 1) {
      const byte = packet[bit >> 3];
      const bitValue = (byte >> (7 - (bit & 7))) & 1;
      data[pixel + channel] = (data[pixel + channel] & 0xfe) | bitValue;
      bit += 1;
    }
  }
}

function readBytes(data: Uint8ClampedArray, byteCount: number, startBit: number): Uint8Array {
  const output = new Uint8Array(byteCount);
  let bit = startBit;
  for (let index = 0; index < byteCount; index += 1) {
    let byte = 0;
    for (let position = 0; position < 8; position += 1) {
      const pixel = Math.floor(bit / 3);
      const channel = bit % 3;
      const dataIndex = pixel * 4 + channel;
      if (dataIndex >= data.length) throw new RangeError('dados insuficientes');
      byte = (byte << 1) | (data[dataIndex] & 1);
      bit += 1;
    }
    output[index] = byte;
  }
  return output;
}

function extract(imageData: ImageData): ExtractedPayload | null {
  const header = readBytes(imageData.data, HEADER_BYTES, 0);
  if (header[0] !== MAGIC[0] || header[1] !== MAGIC[1]) return null;
  const encrypted = (header[2] & 1) === 1;
  const length = (
    (header[3] << 24)
    | (header[4] << 16)
    | (header[5] << 8)
    | header[6]
  ) >>> 0;
  const maxLength = Math.floor(capacityBits(imageData) / 8) - HEADER_BYTES;
  if (length <= 0 || length > maxLength) return null;
  return {
    encrypted,
    messageBytes: readBytes(imageData.data, length, HEADER_BYTES * 8),
  };
}

function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D não disponível'));
        return;
      }
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);
      try {
        resolve(context.getImageData(0, 0, canvas.width, canvas.height));
      } catch (error: unknown) {
        reject(error);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('falha ao carregar imagem'));
    };
    image.src = url;
  });
}

function imageDataToPngUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D não disponível');
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

function cloneImageData(source: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(source.data), source.width, source.height);
}

function field(label: string, control: Node, hint?: string): HTMLLabelElement {
  return h('label', { className: 'steg-field' },
    h('span', { className: 'steg-field__label' }, label),
    control,
    hint && h('span', { className: 'steg-field__hint' }, hint),
  );
}

function hidePanel(): HTMLDivElement {
  let carrier: ImageData | null = null;
  const capacityElement = h('span', { className: 'steg-cap u-text-muted' }, 'Nenhuma imagem carregada.');
  const preview = h('div', { className: 'steg-preview' });
  const fileInput = h('input', {
    className: 'input',
    type: 'file',
    accept: 'image/png,image/bmp,image/webp,image/*',
    onchange: async (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const file = input.files?.[0];
      if (!file) return;
      try {
        carrier = await fileToImageData(file);
        setStatus('esteganografia', { portadora: `${carrier.width}x${carrier.height}` });
        const maxChars = Math.floor(capacityBits(carrier) / 8) - HEADER_BYTES;
        capacityElement.innerHTML = `Portadora <b>${carrier.width}×${carrier.height}</b> — cabe até <b class="u-text-cyan">${maxChars.toLocaleString('pt-BR')}</b> bytes de mensagem.`;
        capacityElement.classList.remove('u-text-muted');
        mount(preview, h('img', {
          src: imageDataToPngUrl(carrier),
          alt: 'Portadora',
        }));
      } catch {
        carrier = null;
        toast('Não consegui ler essa imagem.', { type: 'danger' });
      }
    },
  });
  const messageInput = h('textarea', {
    className: 'input steg-textarea',
    rows: 5,
    placeholder: 'Mensagem secreta a esconder na imagem...',
  });
  const passwordInput = h('input', {
    className: 'input',
    type: 'password',
    placeholder: 'Senha (opcional)',
    autocomplete: 'new-password',
  });
  const resultBox = h('div', { className: 'steg-result' });
  const hideButton = h('button', {
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
        const password = passwordInput.value;
        const encrypted = password.length > 0;
        const payloadText = encrypted ? await aesEncrypt(message, password) : message;
        const packet = buildPacket(textToBytes(payloadText), encrypted);
        const maxBytes = Math.floor(capacityBits(carrier) / 8) - HEADER_BYTES;
        if (packet.length - HEADER_BYTES > maxBytes) {
          toast(
            `Mensagem grande demais: precisa de imagem maior (faltam ~${packet.length - HEADER_BYTES - maxBytes} bytes).`,
            { type: 'danger', duration: 4200 },
          );
          return;
        }
        const output = cloneImageData(carrier);
        embed(output, packet);
        const resultUrl = imageDataToPngUrl(output);
        const downloadButton = h('a', {
          className: 'btn btn--primary btn--sm',
          download: 'baluarte-stego.png',
          href: resultUrl,
        }, '⤓ Baixar PNG');
        mount(resultBox,
          h('div', { className: 'steg-result__inner' },
            h('img', { className: 'steg-result__img', src: resultUrl, alt: 'Resultado' }),
            h('div', { className: 'steg-result__meta' },
              h('span', { className: 'badge badge--success' }, 'MENSAGEM EMBUTIDA'),
              encrypted && h('span', { className: 'badge badge--cyan' }, 'AES'),
              h('p', { className: 'u-text-secondary' },
                'Salve em PNG. Não reenvie por redes sociais — elas recomprimem e apagam a mensagem.'),
              downloadButton,
            ),
          ),
        );
        toast('Mensagem escondida na imagem.', { type: 'success' });
      } catch (error: unknown) {
        console.error('[esteganografia] esconder:', error);
        toast('Falha ao esconder a mensagem.', { type: 'danger' });
      }
    },
  }, '◳ Esconder e gerar PNG');

  return h('div', { className: 'card steg-panel' },
    h('h2', { className: 'steg-panel__title' }, '◳ Esconder'),
    field('Imagem portadora', fileInput, 'PNG ou BMP. Quanto maior a imagem, mais texto cabe.'),
    preview,
    capacityElement,
    field('Mensagem', messageInput),
    field('Senha', passwordInput, 'Se preenchida, a mensagem é cifrada com AES-256 antes de ser escondida.'),
    hideButton,
    resultBox,
  );
}

function revealPanel(): HTMLDivElement {
  let stego: ImageData | null = null;
  const preview = h('div', { className: 'steg-preview' });
  const fileInput = h('input', {
    className: 'input',
    type: 'file',
    accept: 'image/png,image/bmp,image/webp,image/*',
    onchange: async (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const file = input.files?.[0];
      if (!file) return;
      try {
        stego = await fileToImageData(file);
        mount(preview, h('img', { src: imageDataToPngUrl(stego), alt: 'Imagem' }));
      } catch {
        stego = null;
        toast('Não consegui ler essa imagem.', { type: 'danger' });
      }
    },
  });
  const passwordInput = h('input', {
    className: 'input',
    type: 'password',
    placeholder: 'Senha (se a mensagem estiver cifrada)',
    autocomplete: 'new-password',
  });
  const output = h('textarea', {
    className: 'input steg-textarea',
    rows: 5,
    readonly: true,
    placeholder: 'A mensagem revelada aparece aqui...',
  });
  const copyButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: async () => {
      if (!output.value) return;
      try {
        await navigator.clipboard.writeText(output.value);
        toast('Copiado.', { type: 'success' });
      } catch {
        toast('Não consegui copiar.', { type: 'warning' });
      }
    },
  }, '⧉ Copiar');
  const revealButton = h('button', {
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
      const password = passwordInput.value;
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
        toast('Senha incorreta ou dados corrompidos.', { type: 'danger' });
      }
    },
  }, '◰ Revelar mensagem');

  return h('div', { className: 'card steg-panel' },
    h('h2', { className: 'steg-panel__title' }, '◰ Revelar'),
    field('Imagem', fileInput, 'A imagem PNG que recebeu a mensagem.'),
    preview,
    field('Senha', passwordInput),
    revealButton,
    field('Mensagem revelada', output),
    h('div', { className: 'steg-reveal__actions' }, copyButton),
  );
}

export function esteganografiaPage(): HTMLDivElement {
  const page = h('div', { className: 'page-esteganografia' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'CRIPTOGRAFIA'),
        h('span', null, '›'),
        h('span', null, 'ESTEGANOGRAFIA'),
      ),
      h('h1', { className: 'page-header__title' }, 'Esteganografia'),
      h('p', { className: 'page-header__description' },
        'Esconda texto ',
        h('span', { className: 'u-text-cyan' }, 'dentro de uma imagem'),
        ' alterando o bit menos significativo (LSB) de cada pixel — invisível ao olho, ',
        'legível por software. Tudo roda ',
        h('span', { className: 'u-text-cyan' }, 'no navegador'),
        '; nenhuma imagem sai do seu dispositivo.',
      ),
    ),
  );
  page.appendChild(h('div', { className: 'steg-grid anim-fade-in-up' }, hidePanel(), revealPanel()));
  page.appendChild(
    h('div', { className: 'card steg-note' },
      h('h3', null, 'Como funciona'),
      h('ul', null,
        h('li', null, 'Cada pixel tem 3 canais (R, G, B). Trocamos só o último bit de cada um pelos bits da sua mensagem.'),
        h('li', null, h('b', null, 'Use PNG ou BMP.'), ' JPEG comprime com perdas e destrói a mensagem.'),
        h('li', null, h('b', null, 'Redes sociais recomprimem'), ' as imagens (WhatsApp, Instagram, Facebook) e apagam o conteúdo oculto. Compartilhe o arquivo original.'),
        h('li', null, 'Com senha, a mensagem é cifrada com AES-256 antes de ser escondida — dupla camada de proteção.'),
      ),
    ),
  );
  return page;
}
