/**
 * Evidence — módulo V2 de proveniência e validação de conhecimento.
 *
 * O módulo não coleta rede, não escreve banco e não decide confiança sozinho.
 * Ele fornece uma API local para que coletores futuros anexem fatos com fonte,
 * data, versão e confidence explícitos.
 */

import { EvidenceStore, projectEvidenceAudit, projectEvidenceRetention, projectEvidenceReviewQueue } from '../../data/evidence.js';
import { evidenceFromCatalog } from '../../data/catalog-evidence.js';

/** @typedef {import('../../data/evidence.ts').EvidenceInput} EvidenceInput */
/** @typedef {import('../../data/evidence.ts').EvidenceRecord} EvidenceRecord */
/** @typedef {{emit: (event: string, payload?: unknown) => void}} EvidenceBus */
/** @typedef {{log: {debug: (message: string) => void}, bus?: EvidenceBus}} EvidenceContext */

/** @type {EvidenceStore|null} */
let store = null;
/** @type {EvidenceBus|null} */
let bus = null;

/** @param {EvidenceInput} input @returns {EvidenceRecord} */
function append(input) {
  if (!store) throw new Error('evidence ainda não foi inicializado');
  const record = store.append(input);
  bus?.emit('evidence:appended', { id: record.id, moduleId: record.moduleId, status: record.status });
  return record;
}

/** @param {import('../../data/catalog-evidence.ts').CatalogEvidenceInput} input */
function appendCatalog(input) {
  return append(evidenceFromCatalog(input));
}

/** @param {import('../../data/evidence.ts').EvidenceRetentionOptions} options */
function retentionPreview(options) {
  return store
    ? store.retentionPreview(options)
    : projectEvidenceRetention([], options);
}

/** @param {import('../../data/evidence.ts').EvidenceAuditOptions} [options] */
function auditPreview(options) {
  return store
    ? store.auditPreview(options)
    : projectEvidenceAudit([], options);
}

export default {
  id: 'evidence',
  name: 'Evidence Layer',
  version: '2.0.0',
  description: 'Proveniência, confiança e ciclo de verificação de fatos.',
  stability: 'experimental',
  icon: '◈',
  ambiente: 'ambos',
  nav: { section: 'sistema', order: 5 },
  dependencies: [],
  permissions: [],
  storage: [],
  events: {
    emits: ['evidence:appended', 'evidence:status-changed'],
    consumes: [],
  },
  api: {
    append,
    appendCatalog,
    /** @param {string} id */
    get: (id) => store?.get(id) ?? null,
    list: () => store?.list() ?? [],
    /** @param {string} claimKey */
    listByClaim: (claimKey) => store?.listByClaim(claimKey) ?? [],
    /** @param {string} moduleId */
    listByModule: (moduleId) => store?.listByModule(moduleId) ?? [],
    retentionPreview,
    auditPreview,
    /** @param {import('../../data/evidence.ts').EvidenceReviewOptions} [options] */
    reviewQueue: (options) => store?.reviewQueue(options) ?? projectEvidenceReviewQueue([], options),
    /** @param {string} id @param {import('../../data/evidence.ts').EvidenceStatus} status @param {string} [supersededBy] */
    markStatus: (id, status, supersededBy) => {
      if (!store) throw new Error('evidence ainda não foi inicializado');
      const record = store.markStatus(id, status, supersededBy);
      bus?.emit('evidence:status-changed', { id: record.id, moduleId: record.moduleId, status: record.status });
      return record;
    },
  },
  apiVersion: 1,
  routes: [],
  lifecycle: {
    /** @param {EvidenceContext} ctx */
    init(ctx) {
      store = new EvidenceStore();
      bus = ctx.bus ?? null;
      ctx.log.debug('evidence no ar');
    },
    dispose() {
      store = null;
      bus = null;
    },
  },
};
