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
/** @typedef {{appendCatalog: (input: import('../../data/catalog-evidence.ts').CatalogEvidenceInput) => import('../../data/evidence.ts').EvidenceRecord, get?: (id:string) => import('../../data/evidence.ts').EvidenceRecord|null}} BriefingEvidence */
/** @typedef {{storage:BriefingStorage, log:BriefingLog, metricas?:{contar:(name:string, fields?:Record<string, unknown>) => void}, bus?:{emit:(event:string, payload?:unknown) => void}, talvez?:(alvo:string, exigencia?:{versao?:number}) => BriefingEvidence|null}} BriefingContext */
/** @typedef {{ctx:BriefingContext, items:import('./data.js').BriefingItem[], evidence:BriefingEvidence|null, evidenceLinked:number, evidenceErrors:number}} BriefingState */

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
  references: { modules: ['evidence'] },
  nav: { section: 'nucleo', order: 80 },
  permissions: ['NETWORK'],
  storage: [{ key: 'briefing:items', version: 1, class: 'local' }],
  events: { emits: ['briefing:atualizado'], consumes: [] },
  api: {
    health: () => ({
      ok: true,
      status: state ? 'ready' : 'stopped',
      items: state?.items.length ?? 0,
      evidence: state?.evidence ? 'linked' : 'not-configured',
      evidenceLinked: state?.evidenceLinked ?? 0,
      evidenceErrors: state?.evidenceErrors ?? 0,
    }),
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
      const evidence = ctx.talvez?.('evidence', { versao: 1 }) ?? null;
      state = { ctx, items, evidence, evidenceLinked: 0, evidenceErrors: 0 };
      ctx.log.info('briefing preparado', { items: items.length, modo: 'read-only', evidence: evidence ? 'linked' : 'not-configured' });
    },
    dispose() {
      state = null;
    }
  }
};

/** @param {import('./data.js').BriefingItem} item @returns {import('../../data/catalog-evidence.ts').CatalogEvidenceInput} */
function evidenceInput(item) {
  return {
    moduleId: 'briefing',
    entityId: item.id,
    field: 'article',
    value: {
      title: item.title,
      source: item.source,
      url: item.url,
      publishedAt: item.publishedAt,
      status: item.status,
    },
    source: { uri: item.url, title: item.title, publisher: item.source, revision: item.capturedAt },
    retrievedAt: item.capturedAt,
    confidence: item.confidence,
    collector: 'briefing-ingest',
    evidenceId: `briefing:${item.id}`,
  };
}

/** @param {readonly import('./data.js').BriefingItem[]} items @returns {{linked:number, errors:number}} */
function linkEvidence(items) {
  if (!state?.evidence) return { linked: 0, errors: 0 };
  let linked = 0;
  let errors = 0;
  for (const item of items) {
    const id = `briefing:${item.id}`;
    if (state.evidence.get?.(id)) {
      linked += 1;
      continue;
    }
    try {
      state.evidence.appendCatalog(evidenceInput(item));
      linked += 1;
    } catch {
      errors += 1;
    }
  }
  return { linked, errors };
}

/** @param {unknown} rawItems @returns {{ok:boolean, total:number, items:import('./data.js').BriefingItem[], evidenceLinked:number, evidenceErrors:number, error?:string}} */
function ingest(rawItems) {
  if (!state) return { ok: false, total: 0, items: [], evidenceLinked: 0, evidenceErrors: 0, error: 'briefing não está ativo' };
  if (!Array.isArray(rawItems)) return { ok: false, total: 0, items: [], evidenceLinked: 0, evidenceErrors: 0, error: 'items deve ser array' };
  const candidates = rawItems.map((item) => normalizeItem(item)).filter((item) => item !== null);
  const knownIds = new Set(state.items.map((item) => item.id));
  const nextItems = deduplicate([...state.items, ...candidates]);
  const newItems = nextItems.filter((item) => !knownIds.has(item.id));
  const evidence = linkEvidence(newItems);
  state.items = nextItems;
  state.evidenceLinked += evidence.linked;
  state.evidenceErrors += evidence.errors;
  state.ctx.storage.set('briefing:items', state.items);
  state.ctx.metricas?.contar('briefing_ingestao', { recebidos: rawItems.length, aceitos: candidates.length, evidenceLinked: evidence.linked, evidenceErrors: evidence.errors });
  state.ctx.bus?.emit('briefing:atualizado', { total: state.items.length, evidenceLinked: evidence.linked, evidenceErrors: evidence.errors });
  return { ok: true, total: state.items.length, items: [...state.items], evidenceLinked: evidence.linked, evidenceErrors: evidence.errors };
}

export default moduleManifest;
