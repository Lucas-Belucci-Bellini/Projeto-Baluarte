/**
 * Briefing de Notícias — primeiro vertical slice V2 orientado a leitura.
 *
 * O módulo não envia mensagens nem publica conteúdo. A rede é declarada para
 * uma futura ingestão controlada; a superfície inicial recebe candidatos por
 * contrato e mantém a proveniência visível.
 */

import { buildPrompt, deduplicate, normalizeItem } from './data.js';

/** @typedef {{get: (key:string, fallback?:unknown) => unknown, set: (key:string, value:unknown) => void}} BriefingStorage */
/** @typedef {{info: (message:string, fields?:Record<string, unknown>) => void, aviso: (message:string, fields?:Record<string, unknown>) => void, erro: (message:string, error?:unknown, fields?:Record<string, unknown>) => void}} BriefingLog */
/** @typedef {{storage:BriefingStorage, log:BriefingLog, metricas?:{contar:(name:string, fields?:Record<string, unknown>) => void}, bus?:{emit:(event:string, payload?:unknown) => void}}} BriefingContext */
/** @typedef {{ctx:BriefingContext, items:import('./data.js').BriefingItem[]}} BriefingState */

/** @type {BriefingState|null} */
let state = null;

/** @param {unknown} args */
const loadView = (args) => import('./view.js').then((module) => module.criarView(state, args));

const moduleManifest = {
  id: 'briefing',
  name: 'Briefing de Notícias',
  version: '1.0.0',
  description: 'Leitura e organização de notícias com fonte, URL e estado de revisão.',
  stability: 'experimental',
  icon: '◈',
  ambiente: 'ambos',
  nav: { section: 'nucleo', order: 80 },
  permissions: ['NETWORK'],
  storage: [{ key: 'briefing:items', version: 1, class: 'local' }],
  events: { emits: ['briefing:atualizado'], consumes: [] },
  api: {
    health: () => ({ ok: true, status: state ? 'ready' : 'stopped', items: state?.items.length ?? 0 }),
    /** @param {string} topic @param {number} [limit] */
    prompt: (topic, limit) => buildPrompt(topic, limit),
    /** @param {unknown} rawItems */
    ingest: (rawItems) => ingest(rawItems),
    list: () => state ? [...state.items] : [],
  },
  apiVersion: 1,
  routes: [
    { path: '/briefing', view: loadView }
  ],
  lifecycle: {
    /** @param {BriefingContext} ctx */
    init(ctx) {
      const stored = ctx.storage.get('briefing:items', []);
      const items = Array.isArray(stored)
        ? stored.map((item) => normalizeItem(item)).filter((item) => item !== null)
        : [];
      state = { ctx, items };
      ctx.log.info('briefing preparado', { items: items.length, modo: 'read-only' });
    },
    dispose() {
      state = null;
    }
  }
};

/** @param {unknown} rawItems @returns {{ok:boolean, total:number, items:import('./data.js').BriefingItem[], error?:string}} */
function ingest(rawItems) {
  if (!state) return { ok: false, total: 0, items: [], error: 'briefing não está ativo' };
  if (!Array.isArray(rawItems)) return { ok: false, total: 0, items: [], error: 'items deve ser array' };
  const candidates = rawItems.map((item) => normalizeItem(item)).filter((item) => item !== null);
  state.items = deduplicate([...state.items, ...candidates]);
  state.ctx.storage.set('briefing:items', state.items);
  state.ctx.metricas?.contar('briefing_ingestao', { recebidos: rawItems.length, aceitos: candidates.length });
  state.ctx.bus?.emit('briefing:atualizado', { total: state.items.length });
  return { ok: true, total: state.items.length, items: [...state.items] };
}

export default moduleManifest;
