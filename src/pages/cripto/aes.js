/**
 * AES-GCM via Web Crypto API.
 * Senha → PBKDF2-SHA256 (100k iter) → chave 256-bit → encrypt/decrypt.
 */

import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast.js';
import { aesEncrypt, aesDecrypt, randomBytes, bytesToBase64 } from '../../utils/cripto-engine.js';

export function aesPanel() {
  const wrap = h('div', { className: 'cripto-tile' });

  /* Encrypt */
  const encText = h('textarea', {
    className: 'input', rows: 3,
    placeholder: 'Texto plano…',
    value: 'Mensagem secreta do operador OMEGA.'
  });
  const encPass = h('input', {
    className: 'input', type: 'password',
    placeholder: 'Senha forte (use ≥ 12 chars)',
    value: 'baluarte-omega-2026'
  });
  const encOut = h('div', { className: 'cripto-out u-mono' });
  const encBtn = h('button', {
    className: 'btn btn--primary',
    onclick: async () => {
      try {
        encOut.textContent = 'Encriptando…';
        const result = await aesEncrypt(encText.value, encPass.value);
        encOut.textContent = result;
        encOut.classList.remove('is-error');
      } catch (e) {
        encOut.textContent = 'Erro: ' + e.message;
        encOut.classList.add('is-error');
      }
    }
  }, '🔒 Encriptar');

  /* Decrypt */
  const decText = h('textarea', {
    className: 'input', rows: 3,
    placeholder: 'Texto cifrado (base64)…'
  });
  const decPass = h('input', {
    className: 'input', type: 'password',
    placeholder: 'Senha usada para encriptar'
  });
  const decOut = h('div', { className: 'cripto-out u-mono' });
  const decBtn = h('button', {
    className: 'btn btn--magenta',
    onclick: async () => {
      try {
        decOut.textContent = 'Decriptando…';
        const result = await aesDecrypt(decText.value, decPass.value);
        decOut.textContent = result;
        decOut.classList.remove('is-error');
        toast('Decriptado com sucesso', { type: 'success' });
      } catch (e) {
        decOut.textContent = 'Erro: senha incorreta ou texto corrompido';
        decOut.classList.add('is-error');
      }
    }
  }, '🔓 Decriptar');

  /* Botão "encrypt e enviar pra decrypt" */
  const cycleBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: 'Pega a saída do encrypt e cola na entrada do decrypt',
    onclick: () => {
      decText.value = encOut.textContent;
      decPass.value = encPass.value;
      toast('Copiado para o decoder', { type: 'info' });
    }
  }, '↓ usar no decrypt');

  /* Gerar senha forte */
  const genPassBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: 'Gerar senha aleatória forte (32 chars)',
    onclick: () => {
      const bytes = randomBytes(24);
      const pass = bytesToBase64(bytes).replace(/[+/=]/g, '').slice(0, 32);
      encPass.value = pass;
      navigator.clipboard.writeText(pass);
      toast('Senha gerada e copiada!', { type: 'success' });
    }
  }, '🎲 gerar senha');

  wrap.append(
    h('h3', { className: 'cripto-tile__title' }, '⚿  AES-GCM (Web Crypto)'),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px' } },
      'Encriptação simétrica autenticada. Chave 256-bit derivada via PBKDF2-SHA256 (100k iter). ',
      'Salt 16B + IV 12B aleatórios em cada operação. Output: ',
      h('code', null, 'base64(salt | iv | ciphertext+tag)'),
      '.'
    ),

    h('div', { className: 'cripto-tile__title-sub' }, '🔒 Encriptar'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Texto', encText),
      h('label', null, 'Senha', encPass)
    ),
    h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
      encBtn, genPassBtn, cycleBtn
    ),
    h('span', { className: 'cripto-out__label' }, 'Saída cifrada (base64)'),
    encOut,

    h('div', { className: 'cripto-tile__title-sub' }, '🔓 Decriptar'),
    h('div', { className: 'cripto-tile__grid' },
      h('label', null, 'Cifrado (base64)', decText),
      h('label', null, 'Senha', decPass)
    ),
    decBtn,
    h('span', { className: 'cripto-out__label' }, 'Texto plano'),
    decOut
  );

  return wrap;
}
