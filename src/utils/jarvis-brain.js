/**
 * JARVIS Brain — memória durável (estilo supermemory), ligada ao Segundo Cérebro
 * e ao Raio-X do Código.
 *
 * Complementa o `jarvis-recall.js` (que resume conversas anteriores): aqui ficam
 * FATOS curados que o operador pediu para lembrar ("lembre que ..."). Cada
 * memória é ligada automaticamente aos conceitos do Segundo Cérebro
 * (`cerebro.json`) e pode ser injetada no contexto da IA. Também expõe um
 * resumo do código (Raio-X) para o JARVIS raciocinar mais rápido sobre o site.
 *
 * 100% local (localStorage, namespace baluarte:). Sem servidor, sem custo.
 * Projetado para ser reusado pelo futuro Terminal-IA.
 */

import { storage } from '../core/storage.js';
import { recall, tokenize } from './jarvis-recall.js';
import cerebro from '../data/cerebro.json';
import codemap from '../data/codemap.json';

const KEY = 'jarvis:memories';

/* Conceitos do Segundo Cérebro indexados por tokens do rótulo. */
const CONCEPTS = cerebro.nodes.map((n) => ({
  id: n.id, label: n.label, tipo: n.tipo, rota: n.rota || null,
  toks: new Set(tokenize(n.label))
}));

function load() { return storage.get(KEY, []); }
function persist(list) { storage.set(KEY, list); }

/** Liga um texto aos conceitos do Segundo Cérebro (ids de cerebro.json). */
export function linkConcepts(text) {
  const low = String(text || '').toLowerCase();
  const toks = new Set(tokenize(text));
  const ids = [];
  for (const c of CONCEPTS) {
    let hit = low.includes(c.label.toLowerCase());
    if (!hit) for (const t of c.toks) { if (t.length > 3 && toks.has(t)) { hit = true; break; } }
    if (hit) ids.push(c.id);
  }
  return ids;
}

export function getMemories() { return load().slice().sort((a, b) => b.ts - a.ts); }

/** Grava uma memória durável (dedup por texto), ligando aos conceitos. */
export function addMemory({ text, source = 'jarvis', tags = [] }) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (clean.length < 3) return null;
  const list = load();
  const dup = list.find((m) => m.text.toLowerCase() === clean.toLowerCase());
  if (dup) return dup;
  const item = {
    id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: clean, tags, source, ts: Date.now(),
    conceptIds: linkConcepts(clean)
  };
  list.push(item);
  persist(list);
  return item;
}

export function deleteMemory(id) { persist(load().filter((m) => m.id !== id)); }
export function clearMemories() { persist([]); }

/** Busca memórias relevantes por TF-IDF (reaproveita o motor do recall). */
export function searchMemories(query, k = 5) {
  const list = load();
  if (!list.length) return [];
  const docs = list.map((m) => ({ text: m.text, sessionId: m.id }));
  const byId = new Map(list.map((m) => [m.id, m]));
  return recall(query, docs, k).map((h) => ({ ...byId.get(h.sessionId), score: h.score })).filter(Boolean);
}

/** Bloco de memória durável para injetar no contexto da IA. */
export function memoryContext(query, k = 5) {
  const hits = searchMemories(query, k);
  if (!hits.length) return '';
  return '## MEMÓRIA DURÁVEL (fatos que o operador pediu para lembrar)\n'
    + hits.map((m) => `- ${m.text}`).join('\n');
}

/** Estatísticas (total + memórias por conceito) — usado pela página e pelo grafo. */
export function memoryStats() {
  const list = load();
  const byConcept = {};
  for (const m of list) for (const id of (m.conceptIds || [])) byConcept[id] = (byConcept[id] || 0) + 1;
  return { total: list.length, byConcept };
}

export function conceptLabel(id) {
  const c = CONCEPTS.find((x) => x.id === id);
  return c ? c.label : id;
}
export function conceptRoute(id) {
  const c = CONCEPTS.find((x) => x.id === id);
  return c ? c.rota : null;
}

/**
 * Resumo do código (liga a memória ao Raio-X): dá ao JARVIS a forma do site
 * para responder mais rápido sobre o próprio código.
 */
export function codeContext() {
  const m = codemap.meta || {};
  const top = (codemap.topImported || []).slice(0, 6).map((x) => `${x.label} (${x.importedBy}×)`).join(', ');
  const dirs = Object.keys(codemap.byDir || {}).slice(0, 8).join(', ');
  return [
    '## ESTRUTURA DO CÓDIGO (Raio-X — para falar do próprio site)',
    `${m.files} arquivos · ${m.loc} linhas · ${m.links} imports. Pastas: ${dirs}.`,
    `Módulos mais reutilizados: ${top}.`,
    'O grafo 3D completo fica em /codigo.'
  ].join('\n');
}
