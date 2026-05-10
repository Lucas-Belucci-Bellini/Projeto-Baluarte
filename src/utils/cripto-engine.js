/**
 * Engine criptográfica P1 — Fase 7.
 *
 * - Cifra de César (encode/decode + brute force)
 * - Base64 / Base32 / Hex (encode/decode)
 * - Hash SHA-1, SHA-256, SHA-384, SHA-512 (Web Crypto)
 * - Código Morse (encode/decode + áudio via Web Audio API)
 */

import { MORSE_TABLE, MORSE_REVERSE, wpmToDitMs } from '../data/morse-code.js';

/* ============ Cifra de César ============ */

const ALPHA_UP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function caesarEncode(text, shift = 3, preserveCase = true) {
  const s = ((shift % 26) + 26) % 26;
  return [...text].map((ch) => {
    const upper = ch.toUpperCase();
    const idx = ALPHA_UP.indexOf(upper);
    if (idx === -1) return ch;
    const enc = ALPHA_UP[(idx + s) % 26];
    return preserveCase && ch === ch.toLowerCase() ? enc.toLowerCase() : enc;
  }).join('');
}

export function caesarDecode(text, shift = 3) {
  return caesarEncode(text, -shift);
}

/** Brute force: retorna todos os 25 shifts possíveis */
export function caesarBruteforce(text) {
  const out = [];
  for (let s = 0; s < 26; s++) {
    out.push({ shift: s, text: caesarEncode(text, s) });
  }
  return out;
}

/* Score "português-ish" de um texto (heurística simples) */
export function ptScore(text) {
  const t = text.toLowerCase();
  /* Bigrames mais comuns em PT */
  const common = ['de', 'os', 'as', 'em', 'um', 'qu', 'ar', 'ad', 'er', 'es', 'do', 'da', 'co', 'on', 'an'];
  let score = 0;
  for (const bg of common) {
    const matches = t.split(bg).length - 1;
    score += matches;
  }
  /* Penaliza letras improváveis em sequência (kw, kx etc) */
  return score;
}

/* ============ Base64 / Base32 / Hex ============ */

export function toBase64(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch { return ''; }
}

export function fromBase64(b64) {
  try {
    return decodeURIComponent(escape(atob(b64.trim())));
  } catch { return null; }
}

const B32_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function toBase32(text) {
  const bytes = new TextEncoder().encode(text);
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += B32_ALPHA[parseInt(chunk, 2)];
  }
  while (out.length % 8 !== 0) out += '=';
  return out;
}

export function fromBase32(b32) {
  try {
    const clean = b32.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
    let bits = '';
    for (const c of clean) {
      const v = B32_ALPHA.indexOf(c);
      if (v === -1) return null;
      bits += v.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return null; }
}

export function toHex(text) {
  return [...new TextEncoder().encode(text)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function fromHex(hex) {
  try {
    const clean = hex.replace(/[^0-9a-fA-F]/g, '');
    if (clean.length % 2 !== 0) return null;
    const bytes = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.slice(i, i + 2), 16));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return null; }
}

/* ============ Hashes (SHA family via Web Crypto) ============ */

const HASH_ALGOS = {
  'SHA-1': 'SHA-1',
  'SHA-256': 'SHA-256',
  'SHA-384': 'SHA-384',
  'SHA-512': 'SHA-512'
};

export async function hashText(text, algo = 'SHA-256') {
  const algoName = HASH_ALGOS[algo];
  if (!algoName) throw new Error('algoritmo inválido');
  const buf = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest(algoName, buf);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function allHashes(text) {
  const results = {};
  for (const algo of Object.keys(HASH_ALGOS)) {
    results[algo] = await hashText(text, algo);
  }
  /* MD5 — informativo apenas */
  results['MD5'] = '(MD5 não está disponível em Web Crypto API por questões de segurança)';
  return results;
}

/* ============ Código Morse ============ */

export function toMorse(text) {
  return [...text.toUpperCase()].map((ch) => {
    if (ch === ' ') return '/';
    const m = MORSE_TABLE[ch];
    return m || '';
  }).filter(Boolean).join(' ');
}

export function fromMorse(morse) {
  return morse.split(/\s+/).map((tok) => {
    if (tok === '/' || tok === '|') return ' ';
    return MORSE_REVERSE[tok] || '';
  }).join('');
}

/* Áudio Morse: toca a sequência via OscillatorNode */
let audioCtx = null;
let activePlayback = null;

export function getAudioCtx() {
  if (!audioCtx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    audioCtx = new C();
  }
  return audioCtx;
}

export function playMorse(morseStr, opts = {}) {
  const ctx = getAudioCtx();
  if (!ctx) throw new Error('Web Audio não disponível');
  if (ctx.state === 'suspended') ctx.resume();

  stopMorse();

  const wpm = opts.wpm || 18;
  const freq = opts.freq || 600;
  const dit = wpmToDitMs(wpm) / 1000; /* segundos */

  let t = ctx.currentTime + 0.05;
  const events = [];

  for (const ch of morseStr) {
    if (ch === '.') {
      events.push({ start: t, dur: dit });
      t += dit + dit; /* gap intra-letra = 1 dit */
    } else if (ch === '-') {
      events.push({ start: t, dur: dit * 3 });
      t += dit * 3 + dit;
    } else if (ch === ' ') {
      t += dit * 2; /* gap entre letras = 3 dits (já tem 1 do anterior) */
    } else if (ch === '/' || ch === '|') {
      t += dit * 6; /* gap entre palavras = 7 dits */
    }
  }

  /* Cria osciladores para cada beep */
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(ctx.destination);

  const oscs = [];
  for (const ev of events) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ev.start);
    g.gain.linearRampToValueAtTime(1, ev.start + 0.005);
    g.gain.setValueAtTime(1, ev.start + ev.dur - 0.005);
    g.gain.linearRampToValueAtTime(0, ev.start + ev.dur);
    osc.connect(g).connect(masterGain);
    osc.start(ev.start);
    osc.stop(ev.start + ev.dur + 0.01);
    oscs.push(osc);
  }

  activePlayback = { oscs, masterGain, endTime: t };
  return t - ctx.currentTime; /* duração total em segundos */
}

export function stopMorse() {
  if (!activePlayback) return;
  try {
    activePlayback.oscs.forEach((o) => { try { o.stop(); } catch {} });
    activePlayback.masterGain.disconnect();
  } catch {}
  activePlayback = null;
}

/* ============ Vigenère (polialfabética) ============ */

export function vigenereEncode(text, key, decode = false) {
  const k = (key || '').toUpperCase().replace(/[^A-Z]/g, '');
  if (!k) return text;
  let ki = 0;
  return [...text].map((ch) => {
    const upper = ch.toUpperCase();
    const idx = ALPHA_UP.indexOf(upper);
    if (idx === -1) return ch;
    const shift = ALPHA_UP.indexOf(k[ki % k.length]);
    ki++;
    const newIdx = decode
      ? ((idx - shift) % 26 + 26) % 26
      : (idx + shift) % 26;
    const enc = ALPHA_UP[newIdx];
    return ch === ch.toLowerCase() ? enc.toLowerCase() : enc;
  }).join('');
}

export function vigenereDecode(text, key) {
  return vigenereEncode(text, key, true);
}

/* ============ Atbash ============ */

export function atbash(text) {
  return [...text].map((ch) => {
    const upper = ch.toUpperCase();
    const idx = ALPHA_UP.indexOf(upper);
    if (idx === -1) return ch;
    const reversed = ALPHA_UP[25 - idx];
    return ch === ch.toLowerCase() ? reversed.toLowerCase() : reversed;
  }).join('');
}

/* ============ One-Time Pad (XOR) ============ */

/** Gera bytes aleatórios via crypto.getRandomValues */
export function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function otpEncode(textBytes, keyBytes) {
  if (keyBytes.length < textBytes.length) {
    throw new Error(`Chave precisa ter pelo menos ${textBytes.length} bytes (tem ${keyBytes.length})`);
  }
  const out = new Uint8Array(textBytes.length);
  for (let i = 0; i < textBytes.length; i++) {
    out[i] = textBytes[i] ^ keyBytes[i];
  }
  return out;
}

export function bytesToBase64(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64ToBytes(b64) {
  try {
    const bin = atob(b64.trim());
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch { return null; }
}

export function textToBytes(text) {
  return new TextEncoder().encode(text);
}

export function bytesToText(bytes) {
  return new TextDecoder().decode(bytes);
}

/* ============ AES-GCM (Web Crypto) ============ */

const AES_PBKDF2_ITERATIONS = 100_000;

async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: AES_PBKDF2_ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encripta texto com AES-GCM derivando chave de senha via PBKDF2.
 * Output formato: base64( salt(16) | iv(12) | ciphertext+tag )
 */
export async function aesEncrypt(plaintext, password) {
  if (!password) throw new Error('senha vazia');
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKey(password, salt);
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );
  const out = new Uint8Array(salt.length + iv.length + ct.byteLength);
  out.set(salt, 0);
  out.set(iv, salt.length);
  out.set(new Uint8Array(ct), salt.length + iv.length);
  return bytesToBase64(out);
}

export async function aesDecrypt(b64Cipher, password) {
  if (!password) throw new Error('senha vazia');
  const all = base64ToBytes(b64Cipher);
  if (!all || all.length < 16 + 12 + 16) throw new Error('dados muito curtos');
  const salt = all.slice(0, 16);
  const iv = all.slice(16, 28);
  const ct = all.slice(28);
  const key = await deriveKey(password, salt);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return new TextDecoder().decode(pt);
}
