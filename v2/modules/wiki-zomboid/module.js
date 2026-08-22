import { PZ_IDS } from '../../../src/data/zomboid-admin.js';
import { ZOMBOID_COLLECTION } from '../../../src/data/zomboid-mods.js';
import {
  normalizeZomboidWikiEntry,
  zomboidWorkshopEntryId,
} from '../../data/wiki-zomboid.js';

/** @typedef {import('../../data/evidence.ts').EvidenceRecord} EvidenceRecord */
/** @typedef {import('../../data/catalog-evidence.ts').CatalogEvidenceInput} CatalogEvidenceInput */
/** @typedef {{appendCatalog: (input: CatalogEvidenceInput) => EvidenceRecord, listByModule: (moduleId: string) => readonly EvidenceRecord[]}} EvidenceApi */
/** @typedef {{talvez?: (alvo: string, exigencia?: {versao?: number}) => EvidenceApi|null, log: {debug: (message: string, campos?: Record<string, unknown>) => void}}} WikiContext */

const RETRIEVED_AT = '2026-08-22T00:00:00.000Z';
const DATASET_REVISION = 'local-zomboid-curated-2026-08-22';
const EVIDENCE_FIELDS = new Set(['name', 'author', 'category', 'workshopId', 'modId', 'spawnId']);

/** @type {readonly ReturnType<typeof normalizeZomboidWikiEntry>[]} */
const ENTRIES = Object.freeze(PZ_IDS.map((item) => normalizeZomboidWikiEntry({
  id: zomboidWorkshopEntryId(item.workshopId),
  name: item.name,
  author: item.author,
  category: item.cat,
  workshopId: item.workshopId,
  modId: item.modId,
  spawnId: item.spawnId,
  source: {
    uri: `https://steamcommunity.com/sharedfiles/filedetails/?id=${item.workshopId}`,
    title: `${item.name} — Steam Workshop`,
    publisher: item.author,
    revision: DATASET_REVISION,
  },
  retrievedAt: RETRIEVED_AT,
})));

/** @type {EvidenceApi|null} */
let evidenceApi = null;

/** @param {number|undefined} limit */
function boundedLimit(limit) {
  if (limit === undefined) return 25;
  if (!Number.isInteger(limit) || limit < 1) throw new TypeError('limit deve ser inteiro positivo');
  return Math.min(limit, 100);
}

/** @param {string} workshopId */
function findEntry(workshopId) {
  const normalized = workshopId.trim();
  return ENTRIES.find((entry) => entry.workshopId === normalized) ?? null;
}

/** @param {ReturnType<typeof normalizeZomboidWikiEntry>} entry @param {string} field */
function valueForField(entry, field) {
  if (!EVIDENCE_FIELDS.has(field)) throw new TypeError(`campo não permitido para Evidence: ${field}`);
  return entry[field];
}

function summary() {
  const categories = new Set(ENTRIES.map((entry) => entry.category));
  const linkedEvidence = evidenceApi?.listByModule('wiki-zomboid') ?? [];
  const evidenceByStatus = {
    pending: 0,
    verified: 0,
    rejected: 0,
    superseded: 0,
  };
  for (const record of linkedEvidence) {
    if (Object.hasOwn(evidenceByStatus, record.status)) evidenceByStatus[record.status] += 1;
  }
  return Object.freeze({
    game: ZOMBOID_COLLECTION.game,
    collection: ZOMBOID_COLLECTION.name,
    total: ENTRIES.length,
    categories: categories.size,
    sourceMode: 'local-curated',
    evidenceAvailable: evidenceApi !== null,
    evidenceLinked: linkedEvidence.length,
    evidenceByStatus: Object.freeze(evidenceByStatus),
  });
}

/** @param {string} workshopId @param {string} [field] */
function appendEvidence(workshopId, field = 'name') {
  const entry = findEntry(workshopId);
  if (!entry) return null;
  if (!evidenceApi) return null;
  return evidenceApi.appendCatalog({
    moduleId: 'wiki-zomboid',
    entityId: entry.id,
    field,
    value: valueForField(entry, field),
    source: entry.source,
    retrievedAt: entry.retrievedAt,
    confidence: 0.75,
    collector: 'wiki-zomboid-local-catalog',
  });
}

function view() {
  const page = document.createElement('main');
  page.className = 'v2-wiki-zomboid';

  const heading = document.createElement('h1');
  heading.textContent = 'Wiki Zomboid V2';
  page.appendChild(heading);

  const description = document.createElement('p');
  description.textContent = 'Piloto local de catálogo verificável para Project Zomboid.';
  page.appendChild(description);

  const status = document.createElement('p');
  const current = summary();
  status.textContent = `${current.total} entradas locais · ${current.categories} categorias · `
    + (current.evidenceAvailable
      ? `Evidence local conectada · ${current.evidenceLinked} vinculadas · ${current.evidenceByStatus.pending} pendentes`
      : 'Evidence não configurada');
  status.dataset.evidence = current.evidenceAvailable ? 'connected' : 'unavailable';
  page.appendChild(status);

  const note = document.createElement('p');
  note.textContent = 'Fonte: curadoria local com links individuais da Steam Workshop; nenhum dado é buscado automaticamente.';
  page.appendChild(note);

  return page;
}

export default {
  id: 'wiki-zomboid',
  name: 'Wiki Zomboid V2',
  version: '1.0.0',
  description: 'Piloto local de schema, catálogo e proveniência para Project Zomboid.',
  stability: 'beta',
  icon: '◇',
  ambiente: 'ambos',
  routes: [{ path: '/wiki-zomboid', view }],
  nav: { section: 'conhecimento', order: 30 },
  dependencies: [],
  references: { modules: ['evidence'] },
  permissions: [],
  storage: [],
  events: { emits: [], consumes: [] },
  api: {
    list: (limit) => ENTRIES.slice(0, boundedLimit(limit)),
    get: (workshopId) => findEntry(workshopId),
    summary,
    appendEvidence,
  },
  apiVersion: 1,
  lifecycle: {
    /** @param {WikiContext} ctx */
    init(ctx) {
      evidenceApi = typeof ctx.talvez === 'function'
        ? ctx.talvez('evidence', { versao: 1 })
        : null;
      ctx.log.debug('wiki-zomboid no ar', {
        entries: ENTRIES.length,
        evidence: evidenceApi !== null,
      });
    },
    dispose() {
      evidenceApi = null;
    },
  },
};
