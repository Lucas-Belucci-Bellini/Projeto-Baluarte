/**
 * Arcade — players engine (contas locais nome + senha).
 *
 * Camada client-side multi-usuário para a seção de Jogos do Baluarte:
 *   - cada jogador tem nome + senha (hash SHA-256×100 reaproveitando deriveHash)
 *   - guarda XP, pontos, melhores notas por jogo e blobs de "continuar"
 *   - ranking (leaderboard) local ordenado por pontos
 *
 * NÃO é auth de servidor — é persistência local (localStorage). O modelo foi
 * desenhado para depois sincronizar com um backend (mesmos campos) sem reescrever
 * a UI. Senhas nunca são guardadas em texto puro.
 */

import { storage } from '../core/storage.js';
import { deriveHash } from './auth-engine.js';

const PLAYERS_KEY = 'arcade:players'; /* { [key]: record } */
const CURRENT_KEY = 'arcade:current'; /* key do jogador logado */

/* ===== Patentes (títulos por nível) ===== */
export const PATENTES = [
  'Recruta', 'Cadete', 'Soldado', 'Cabo', 'Sargento', 'Subtenente',
  'Tenente', 'Capitão', 'Major', 'Coronel', 'General', 'Marechal'
];

/* ===== Helpers ===== */

const norm = (name) => String(name || '').trim().toLowerCase();

function loadAll() {
  return storage.get(PLAYERS_KEY, {}) || {};
}

function saveAll(obj) {
  storage.set(PLAYERS_KEY, obj);
}

/** Remove campos sensíveis antes de expor um registro para a UI. */
function sanitize(rec) {
  if (!rec) return null;
  const { salt, hash, ...safe } = rec;
  const info = rankInfo(rec.xp || 0);
  return { ...safe, ...info };
}

/**
 * Curva de XP: nível L exige 50 * L * (L+1) de XP acumulado.
 * Devolve nível, título, progresso até o próximo nível.
 */
export function rankInfo(xp) {
  xp = Math.max(0, xp | 0);
  const need = (l) => 50 * l * (l + 1); /* xp acumulado para CHEGAR ao nível l+1 */
  let level = 1;
  while (xp >= need(level)) level++;
  const prev = level === 1 ? 0 : need(level - 1);
  const next = need(level);
  const into = xp - prev;
  const span = next - prev;
  const pct = span > 0 ? Math.min(100, Math.round((into / span) * 100)) : 0;
  const patente = PATENTES[Math.min(level - 1, PATENTES.length - 1)];
  return { level, patente, xp, xpInto: into, xpSpan: span, xpPct: pct, xpNext: next };
}

/* ===== Sessão ===== */

export function currentKey() {
  return storage.get(CURRENT_KEY, null);
}

function getRaw(key) {
  const all = loadAll();
  return all[key] || null;
}

/** Jogador logado (sanitizado) ou null. */
export function current() {
  const key = currentKey();
  if (!key) return null;
  return sanitize(getRaw(key));
}

export function isLoggedIn() {
  return !!current();
}

export function logout() {
  storage.remove(CURRENT_KEY);
}

export function exists(name) {
  return !!getRaw(norm(name));
}

/* ===== Registro / Login ===== */

export async function register(name, password) {
  const display = String(name || '').trim();
  const key = norm(name);
  if (key.length < 2) throw new Error('O nome precisa ter ao menos 2 caracteres.');
  if (key.length > 24) throw new Error('Nome muito longo (máx. 24).');
  if (!password || password.length < 4) throw new Error('A senha precisa ter ao menos 4 caracteres.');
  const all = loadAll();
  if (all[key]) throw new Error('Já existe um jogador com esse nome. Faça login.');

  const salt = cryptoSalt();
  const hash = await deriveHash(password, salt);
  const rec = {
    name: display,
    key,
    salt,
    hash,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    points: 0,
    xp: 0,
    plays: 0,
    bestScores: {}, /* { [gameId]: { score, max, at } } */
    saves: {}       /* { [gameId]: blob } para "continuar" */
  };
  all[key] = rec;
  saveAll(all);
  storage.set(CURRENT_KEY, key);
  return sanitize(rec);
}

export async function login(name, password) {
  const key = norm(name);
  const rec = getRaw(key);
  if (!rec) throw new Error('Jogador não encontrado. Crie uma conta.');
  const computed = await deriveHash(password, rec.salt);
  if (computed !== rec.hash) throw new Error('Senha incorreta.');
  rec.lastSeen = Date.now();
  const all = loadAll();
  all[key] = rec;
  saveAll(all);
  storage.set(CURRENT_KEY, key);
  return sanitize(rec);
}

/* ===== Progresso e pontuação ===== */

/**
 * Credita uma partida ao jogador logado.
 * @returns {{leveledUp:boolean, level:number, patente:string, gained:number}|null}
 */
export function awardScore(gameId, score, max) {
  const key = currentKey();
  if (!key) return null;
  const all = loadAll();
  const rec = all[key];
  if (!rec) return null;

  const before = rankInfo(rec.xp || 0).level;
  const gained = Math.max(0, score | 0) * 10; /* 10 pts por acerto */
  rec.points = (rec.points || 0) + gained;
  rec.xp = (rec.xp || 0) + gained;
  rec.plays = (rec.plays || 0) + 1;

  const best = rec.bestScores[gameId];
  if (!best || score > best.score) {
    rec.bestScores[gameId] = { score, max, at: Date.now() };
  }
  rec.lastSeen = Date.now();
  all[key] = rec;
  saveAll(all);

  const after = rankInfo(rec.xp).level;
  return {
    leveledUp: after > before,
    level: after,
    patente: PATENTES[Math.min(after - 1, PATENTES.length - 1)],
    gained
  };
}

export function bestScore(gameId) {
  const rec = getRaw(currentKey());
  return rec?.bestScores?.[gameId] || null;
}

/* ===== "Continuar" (save/resume por jogo) ===== */

export function saveProgress(gameId, blob) {
  const key = currentKey();
  if (!key) return false;
  const all = loadAll();
  const rec = all[key];
  if (!rec) return false;
  rec.saves = rec.saves || {};
  rec.saves[gameId] = { ...blob, savedAt: Date.now() };
  all[key] = rec;
  saveAll(all);
  return true;
}

export function loadProgress(gameId) {
  const rec = getRaw(currentKey());
  return rec?.saves?.[gameId] || null;
}

export function clearProgress(gameId) {
  const key = currentKey();
  if (!key) return;
  const all = loadAll();
  const rec = all[key];
  if (rec?.saves) { delete rec.saves[gameId]; all[key] = rec; saveAll(all); }
}

/* ===== Ranking ===== */

/** Todos os jogadores (sanitizados) ordenados por pontos desc. */
export function leaderboard() {
  const all = loadAll();
  return Object.values(all)
    .map(sanitize)
    .sort((a, b) => (b.points - a.points) || (b.xp - a.xp) || a.name.localeCompare(b.name));
}

/* ===== util ===== */

function cryptoSalt() {
  const arr = new Uint8Array(16);
  (globalThis.crypto || {}).getRandomValues?.(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}
