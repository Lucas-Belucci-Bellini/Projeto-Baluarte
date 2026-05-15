/**
 * Shadow Bridge — auth engine (Fase 18).
 *
 * Esquema: SHA-256 iterado 100 vezes sobre senha + salt do usuário.
 * Não substitui auth real (server-side, JWT, etc.) — é uma camada
 * client-side para proteger áreas sensíveis do Baluarte localmente.
 *
 * Modelo:
 *   1. Setup: usuário define senha → derivação SHA-256×100 + salt → guarda hash
 *   2. Login: senha digitada passa pelo mesmo processo → compara com hash
 *   3. Sessão: token aleatório guardado com TTL (default 4h)
 *   4. Logout: limpa token
 */

import { storage } from '../core/storage.js';

const AUTH_KEY = 'shadow:auth';
const SESSION_KEY = 'shadow:session';
const ITERATIONS = 100;
const SESSION_TTL_MS = 4 * 60 * 60 * 1000; /* 4 horas */

/* ===== Helpers crypto ===== */

function toHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex) {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return arr;
}

function randomBytes(n) {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

async function sha256(buffer) {
  return crypto.subtle.digest('SHA-256', buffer);
}

/**
 * Deriva hash de senha + salt iterando SHA-256 N vezes.
 * @returns {Promise<string>} hash em hex
 */
export async function deriveHash(password, salt, iterations = ITERATIONS) {
  const enc = new TextEncoder();
  let buf = enc.encode(password + '|' + salt);
  for (let i = 0; i < iterations; i++) {
    buf = new Uint8Array(await sha256(buf));
  }
  return toHex(buf);
}

/* ===== Setup / Login ===== */

export function isSetup() {
  const auth = storage.get(AUTH_KEY);
  return !!(auth && auth.hash && auth.salt);
}

export async function setupPassword(password) {
  if (!password || password.length < 4) {
    throw new Error('senha precisa ter ao menos 4 caracteres');
  }
  const salt = toHex(randomBytes(16));
  const hash = await deriveHash(password, salt);
  storage.set(AUTH_KEY, {
    hash,
    salt,
    iterations: ITERATIONS,
    createdAt: Date.now()
  });
  return true;
}

export async function login(password) {
  const auth = storage.get(AUTH_KEY);
  if (!auth) throw new Error('Shadow Bridge não configurado. Defina uma senha primeiro.');
  const computed = await deriveHash(password, auth.salt, auth.iterations || ITERATIONS);

  /* Comparação constant-time pra evitar timing attack (pseudo) */
  if (computed.length !== auth.hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ auth.hash.charCodeAt(i);
  }
  if (mismatch !== 0) return false;

  /* Cria sessão */
  const session = {
    token: toHex(randomBytes(32)),
    startedAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  };
  storage.set(SESSION_KEY, session);
  return session;
}

export function logout() {
  storage.remove(SESSION_KEY);
}

export function isAuthenticated() {
  const s = storage.get(SESSION_KEY);
  if (!s) return false;
  if (Date.now() > s.expiresAt) {
    logout();
    return false;
  }
  return true;
}

export function getSession() {
  return storage.get(SESSION_KEY) || null;
}

export function timeRemaining() {
  const s = getSession();
  if (!s) return 0;
  return Math.max(0, s.expiresAt - Date.now());
}

export function resetAuth() {
  storage.remove(AUTH_KEY);
  storage.remove(SESSION_KEY);
}
