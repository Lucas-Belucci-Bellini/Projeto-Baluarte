import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast';
import { randomBytes, otpEncode, bytesToBase64, base64ToBytes, textToBytes, bytesToText } from '../../utils/cripto-engine.js';

function errorMessage(error: unknown): string { return error instanceof Error ? error.message : 'erro desconhecido'; }

export function otpPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const encText = h('textarea', { className: 'input', rows: 3, placeholder: 'Texto plano…', value: 'mensagem secreta', oninput: debounce(render, 80) });
  const encKey = h('textarea', { className: 'input', rows: 2, placeholder: 'Chave em base64 (clique "gerar" pra criar uma aleatória)', oninput: debounce(render, 80) });
  const encOut = h('div', { className: 'cripto-out u-mono' });
  const sizeInfo = h('div', { className: 'u-text-muted', style: { fontSize: '11px' } });
  const genKeyBtn = h('button', { className: 'btn btn--ghost btn--sm', title: 'Gera chave aleatória do tamanho exato do texto', onclick: (): void => { const bytes = textToBytes(encText.value); if (!bytes.length) { toast('Insira o texto primeiro', { type: 'warning' }); return; } const key = randomBytes(bytes.length); encKey.value = bytesToBase64(key); render(); toast(`Chave gerada (${bytes.length} bytes)`, { type: 'success' }); } }, '🎲 gerar chave');
  function render(): void {
    const textBytes = textToBytes(encText.value); sizeInfo.textContent = `Mensagem: ${textBytes.length} bytes`;
    if (!encKey.value.trim()) { encOut.textContent = '(insira ou gere uma chave)'; encOut.classList.add('is-error'); return; }
    const keyBytes = base64ToBytes(encKey.value);
    if (!keyBytes) { encOut.textContent = '(chave inválida — não é base64)'; encOut.classList.add('is-error'); return; }
    sizeInfo.textContent = `Mensagem: ${textBytes.length} bytes · Chave: ${keyBytes.length} bytes`;
    if (keyBytes.length < textBytes.length) { encOut.textContent = `(chave muito curta: ${keyBytes.length}B < ${textBytes.length}B)`; encOut.classList.add('is-error'); return; }
    try { encOut.textContent = bytesToBase64(otpEncode(textBytes, keyBytes)); encOut.classList.remove('is-error'); } catch (error: unknown) { encOut.textContent = `Erro: ${errorMessage(error)}`; encOut.classList.add('is-error'); }
  }
  const decCipher = h('textarea', { className: 'input', rows: 3, placeholder: 'Cifrado base64…', oninput: debounce(renderDec, 80) });
  const decKey = h('textarea', { className: 'input', rows: 2, placeholder: 'Chave base64…', oninput: debounce(renderDec, 80) });
  const decOut = h('div', { className: 'cripto-out u-mono' });
  function renderDec(): void {
    const cipher = base64ToBytes(decCipher.value); const key = base64ToBytes(decKey.value);
    if (!cipher || !key) { decOut.textContent = decCipher.value || decKey.value ? '(formato inválido)' : ''; decOut.classList.toggle('is-error', Boolean(decCipher.value || decKey.value)); return; }
    if (key.length < cipher.length) { decOut.textContent = `(chave curta: ${key.length}B < ${cipher.length}B)`; decOut.classList.add('is-error'); return; }
    try { decOut.textContent = bytesToText(otpEncode(cipher, key)); decOut.classList.remove('is-error'); } catch (error: unknown) { decOut.textContent = `Erro: ${errorMessage(error)}`; decOut.classList.add('is-error'); }
  }
  const cycleBtn = h('button', { className: 'btn btn--ghost btn--sm', title: 'Copia saída e chave para o decoder', onclick: (): void => { decCipher.value = encOut.textContent ?? ''; decKey.value = encKey.value; renderDec(); toast('Copiado para o decoder', { type: 'info' }); } }, '↓ usar no decrypt');
  wrap.append(h('h3', { className: 'cripto-tile__title' }, '⊕  One-Time Pad (XOR)'), h('p', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'Provadamente seguro (Shannon) ', h('strong', null, 'se'), ': (1) chave verdadeiramente aleatória, (2) chave ≥ mensagem, (3) chave usada apenas uma vez.'), h('div', { className: 'cripto-tile__title-sub' }, '🔒 Encriptar'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto', encText), h('label', null, 'Chave (base64)', encKey)), h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } }, genKeyBtn, cycleBtn), sizeInfo, h('span', { className: 'cripto-out__label' }, 'Cifrado (base64)'), encOut, h('div', { className: 'cripto-tile__title-sub' }, '🔓 Decriptar'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Cifrado (base64)', decCipher), h('label', null, 'Chave (base64)', decKey)), h('span', { className: 'cripto-out__label' }, 'Texto plano'), decOut);
  setTimeout(render, 0);
  return wrap;
}
