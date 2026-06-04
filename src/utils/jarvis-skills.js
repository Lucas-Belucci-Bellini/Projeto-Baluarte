/**
 * JARVIS Skills — habilidades auto-criadas (inspirado no hermes-agent).
 *
 * O conceito-assinatura do hermes (Nous Research): o agente cria as PRÓPRIAS
 * ferramentas em runtime, guarda e reusa nas próximas sessões. Aqui o JARVIS
 * (modo Agente) chama a ferramenta `create_skill`, passa a ter uma habilidade
 * nova — persistida no localStorage e recarregada no boot do site.
 *
 * SEGURANÇA (operador único, mas defensivo). O corpo da skill é JavaScript,
 * executado numa sandbox de 3 camadas:
 *   1. Denylist estática — rejeita tokens perigosos (fetch, document, eval,
 *      constructor, localStorage…) ANTES de salvar, e recusa código que não
 *      compila.
 *   2. Shadowing de globais — os identificadores perigosos viram parâmetros
 *      `undefined` da função; assim `fetch`/`window`/`globalThis`/… ficam mortos
 *      DENTRO do corpo, mesmo que escapem da denylist. Sem nenhuma referência ao
 *      objeto global, não há como transformar uma string em acesso global.
 *   3. Strict mode, sem segredos — roda em "use strict" (this === undefined) e
 *      só recebe `input` (argumentos) e `sdk` (capacidades seguras). A API key
 *      do operador nunca é exposta à skill.
 *
 * Skills são PURAS: computam/consultam dados do Baluarte e devolvem um valor
 * serializável. Não tocam no DOM nem na rede. (Ações no site continuam com as
 * ferramentas built-in.) Evolução futura: isolar em Web Worker.
 */

import { storage } from '../core/storage.js';
import { evaluate } from './calc-engine.js';
import { search as searchArsenal } from '../data/arsenal.js';
import { EQUIPES, findEquipe } from '../data/elites.js';
import { ARCS } from '../data/cronicas.js';

const STORE_KEY = 'jarvis:skills';
const MAX_CODE = 4000;
const MAX_SKILLS = 64;
const MAX_DESC = 280;

/** Nome da skill: snake_case, começa com letra, 3–40 chars. */
const NAME_RE = /^[a-z][a-z0-9_]{2,39}$/;

/* Tokens proibidos no corpo da skill (camada 1). Cobrem rede, storage/segredos,
 * DOM/escopo global e metaprogramação (vetores de escape de sandbox). */
const BLOCKED = [
  // rede / exfiltração
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon', 'navigator',
  'importScripts', 'require', 'process', 'module', 'exports', 'import',
  // storage / credenciais
  'localStorage', 'sessionStorage', 'indexedDB', 'cookie', 'caches', 'crypto',
  // DOM / objeto global
  'window', 'document', 'globalThis', 'self', 'top', 'parent', 'frames',
  'location', 'history', 'alert', 'postMessage',
  // metaprogramação / escape
  'eval', 'Function', 'constructor', 'prototype', '__proto__',
  '__defineGetter__', '__defineSetter__', '__lookupGetter__',
  'Reflect', 'Proxy', 'Atomics', 'WebAssembly', 'SharedArrayBuffer',
  // assíncrono / timers (mantém skills síncronas e previsíveis)
  'setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask', 'async', 'await'
];
const BLOCKED_RE = new RegExp('\\b(' + BLOCKED.join('|') + ')\\b');

/* Globais sombreados como parâmetros `undefined` (camada 2). Subconjunto do
 * BLOCKED que é um identificador válido como nome de binding (exclui reservadas
 * como `import`/`eval`/`async`/`await` e tokens de propriedade como
 * `constructor`/`prototype`/`cookie`, já barrados pela camada 1). */
const SHADOW = [
  'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'navigator',
  'importScripts', 'require', 'process', 'module', 'exports',
  'localStorage', 'sessionStorage', 'indexedDB', 'caches', 'crypto',
  'window', 'document', 'globalThis', 'self', 'top', 'parent', 'frames',
  'location', 'history', 'alert', 'postMessage',
  'Reflect', 'Proxy', 'Atomics', 'WebAssembly', 'SharedArrayBuffer',
  'setTimeout', 'setInterval', 'setImmediate', 'queueMicrotask'
];
const SHADOW_UNDEF = SHADOW.map(() => undefined);

/* ===== Compilação (com cache por código) ===== */

const runnerCache = new Map();

/**
 * Compila o corpo da skill numa função sandbox `(input, sdk) => result`.
 * Lança SyntaxError se o código for inválido. Cacheia por string de código.
 */
export function buildRunner(code) {
  if (runnerCache.has(code)) return runnerCache.get(code);
  /* Os globais perigosos entram como parâmetros (= undefined ao chamar),
   * sombreando os reais dentro do corpo. */
  const fn = new Function(...SHADOW, 'input', 'sdk', '"use strict";\n' + code);
  const runner = (input, sdk) => fn(...SHADOW_UNDEF, input, sdk);
  runnerCache.set(code, runner);
  return runner;
}

/* ===== SDK seguro exposto às skills ===== */

/** Constrói o `sdk` da skill + um array `logs` que coleta sdk.log(...). */
function makeSdk() {
  const logs = [];
  const sdk = {
    /** Avalia expressão matemática. Ex: sdk.calc('2 + 3 * sqrt(16)') → 14. */
    calc(expr) {
      const r = evaluate(String(expr ?? ''));
      if (r.error) throw new Error('calc: ' + r.error);
      return r.value;
    },
    /** Busca no Arsenal. Retorna até 10 itens resumidos. */
    arsenal(query) {
      return searchArsenal(String(query ?? '')).slice(0, 10).map((w) => ({
        name: w.name, category: w.category, origin: w.origin,
        caliber: w.caliber, rangeM: w.rangeM, tier: w.tier, equipe: w.equipe
      }));
    },
    /** Ficha resumida de uma equipe de elite pelo código (ALFA…ZULU). */
    equipe(code) {
      const e = findEquipe(String(code ?? '').toUpperCase());
      return e ? { code: e.code, name: e.name, specialty: e.specialty, leader: e.leader, members: e.members } : null;
    },
    /** Lista resumida de todas as equipes. */
    equipes() {
      return EQUIPES.map((e) => ({ code: e.code, name: e.name, specialty: e.specialty, members: e.members }));
    },
    /** Resumo de um arco das Crônicas pelo código. */
    arco(code) {
      const a = ARCS.find((x) => x.code === String(code ?? '').toUpperCase());
      return a ? { code: a.code, title: a.title, universe: a.universe, chapters: a.chapters.length } : null;
    },
    /** Lista resumida de todos os arcos. */
    arcos() {
      return ARCS.map((a) => ({ code: a.code, title: a.title, universe: a.universe }));
    },
    /** Registra uma linha de depuração, devolvida junto do resultado. */
    log(...args) {
      logs.push(args.map((a) => (typeof a === 'object' ? safeJson(a) : String(a))).join(' '));
    },
    /** Timestamp atual (ms). */
    now() { return Date.now(); }
  };
  return { sdk, logs };
}

function safeJson(v) {
  try { return JSON.stringify(v); } catch { return String(v); }
}

/** Garante que o resultado é serializável (sem funções/ciclos). */
function serializable(v) {
  if (v === undefined) return null;
  try { return JSON.parse(JSON.stringify(v)); } catch { return String(v); }
}

/* ===== Execução ===== */

/**
 * Executa uma skill com os argumentos `input`.
 * @returns {{ok:boolean, result?:*, logs:string[], error?:string}}
 */
export function runSkill(skill, input) {
  let runner;
  try {
    runner = buildRunner(skill.code);
  } catch (e) {
    return { ok: false, error: 'skill não compila: ' + e.message, logs: [] };
  }
  const { sdk, logs } = makeSdk();
  let result;
  try {
    result = runner(input || {}, sdk);
  } catch (e) {
    return { ok: false, error: 'skill falhou: ' + e.message, logs };
  }
  bumpRuns(skill.name);
  return { ok: true, result: serializable(result), logs };
}

/* ===== Persistência ===== */

/** Carrega o array de skills do storage. */
export function loadSkills() {
  const arr = storage.get(STORE_KEY, []);
  return Array.isArray(arr) ? arr : [];
}

function persist(skills) {
  storage.set(STORE_KEY, skills);
}

/** Resumos para UI / ferramenta list_skills (sem expor o código completo). */
export function listSkillSummaries() {
  return loadSkills().map((s) => ({
    name: s.name, description: s.description, runs: s.runs || 0, createdAt: s.createdAt
  }));
}

function bumpRuns(name) {
  const skills = loadSkills();
  const s = skills.find((x) => x.name === name);
  if (!s) return;
  s.runs = (s.runs || 0) + 1;
  s.updatedAt = Date.now();
  persist(skills);
}

/* ===== Validação + criação ===== */

/**
 * Valida e normaliza uma especificação de skill.
 * @param {object} spec  { name, description, input_schema, code }
 * @param {string[]} reserved  nomes proibidos (ferramentas built-in)
 * @returns {{ok:boolean, error?:string, skill?:object}}
 */
export function validateSkill(spec, reserved = []) {
  const name = String(spec?.name ?? '').trim();
  if (!NAME_RE.test(name)) {
    return { ok: false, error: 'name inválido: use snake_case, 3–40 chars, começando por letra (ex: converter_moeda).' };
  }
  if (reserved.includes(name)) {
    return { ok: false, error: `name "${name}" colide com uma ferramenta existente. Escolha outro.` };
  }

  const description = String(spec?.description ?? '').trim();
  if (!description || description.length > MAX_DESC) {
    return { ok: false, error: `description obrigatória (1–${MAX_DESC} chars) — explique o que a skill faz.` };
  }

  /* input_schema: normaliza para um schema de objeto válido. */
  let schema = spec?.input_schema;
  if (schema == null) schema = { type: 'object', properties: {} };
  if (typeof schema !== 'object' || Array.isArray(schema)) {
    return { ok: false, error: 'input_schema deve ser um objeto (JSON Schema de objeto).' };
  }
  schema = { type: 'object', properties: schema.properties || {}, ...(schema.required ? { required: schema.required } : {}) };
  if (typeof schema.properties !== 'object' || Array.isArray(schema.properties)) {
    return { ok: false, error: 'input_schema.properties deve ser um objeto.' };
  }

  const code = String(spec?.code ?? '');
  if (!code.trim()) return { ok: false, error: 'code obrigatório (corpo JS da skill).' };
  if (code.length > MAX_CODE) return { ok: false, error: `code longo demais (máx ${MAX_CODE} chars).` };
  const bad = BLOCKED_RE.exec(code);
  if (bad) {
    return { ok: false, error: `code usa "${bad[1]}", proibido na sandbox. Skills são puras: só use input, sdk e JS básico (Math, JSON, String, Array, Date…). Sem rede, DOM, storage, eval, timers ou async.` };
  }
  try {
    buildRunner(code); /* compila → pega SyntaxError cedo */
  } catch (e) {
    return { ok: false, error: 'code não compila: ' + e.message };
  }

  return { ok: true, skill: { name, description, input_schema: schema, code } };
}

/**
 * Cria (ou atualiza) e persiste uma skill.
 * @returns {{ok:boolean, error?:string, skill?:object, updated?:boolean}}
 */
export function createSkill(spec, { reserved = [] } = {}) {
  const v = validateSkill(spec, reserved);
  if (!v.ok) return v;

  const skills = loadSkills();
  const idx = skills.findIndex((s) => s.name === v.skill.name);
  const now = Date.now();

  if (idx >= 0) {
    const prev = skills[idx];
    const updated = { ...prev, ...v.skill, updatedAt: now };
    skills[idx] = updated;
    persist(skills);
    runnerCache.delete(prev.code); /* invalida runner antigo se o código mudou */
    return { ok: true, skill: updated, updated: true };
  }

  if (skills.length >= MAX_SKILLS) {
    return { ok: false, error: `limite de ${MAX_SKILLS} skills atingido. Apague alguma com delete_skill.` };
  }
  const skill = {
    id: 'skill_' + now.toString(36) + Math.random().toString(36).slice(2, 6),
    ...v.skill,
    origin: 'jarvis',
    runs: 0,
    createdAt: now,
    updatedAt: now
  };
  skills.push(skill);
  persist(skills);
  return { ok: true, skill, updated: false };
}

/** Remove uma skill pelo nome. @returns {boolean} */
export function deleteSkill(name) {
  const skills = loadSkills();
  const next = skills.filter((s) => s.name !== name);
  if (next.length === skills.length) return false;
  persist(next);
  return true;
}
