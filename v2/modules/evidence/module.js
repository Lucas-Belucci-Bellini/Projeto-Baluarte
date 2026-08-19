/**
 * Evidence — módulo V2 de proveniência e validação de conhecimento.
 *
 * O módulo não coleta rede, não escreve banco e não decide confiança sozinho.
 * Ele fornece uma API local para que coletores futuros anexem fatos com fonte,
 * data, versão e confidence explícitos.
 */

import { EvidenceStore } from '../../data/evidence.js';

/** @typedef {import('../../data/evidence.ts').EvidenceInput} EvidenceInput */
/** @typedef {import('../../data/evidence.ts').EvidenceRecord} EvidenceRecord */
/** @typedef {{log: {debug: (message: string) => void}}} EvidenceContext */

/** @type {EvidenceStore|null} */
let store = null;

/** @param {EvidenceInput} input @returns {EvidenceRecord} */
function append(input) {
  if (!store) throw new Error('evidence ainda não foi inicializado');
  return store.append(input);
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
    /** @param {string} id */
    get: (id) => store?.get(id) ?? null,
    list: () => store?.list() ?? [],
    /** @param {string} claimKey */
    listByClaim: (claimKey) => store?.listByClaim(claimKey) ?? [],
    /** @param {string} moduleId */
    listByModule: (moduleId) => store?.listByModule(moduleId) ?? [],
    /** @param {string} id @param {import('../../data/evidence.ts').EvidenceStatus} status @param {string} [supersededBy] */
    markStatus: (id, status, supersededBy) => {
      if (!store) throw new Error('evidence ainda não foi inicializado');
      return store.markStatus(id, status, supersededBy);
    },
  },
  apiVersion: 1,
  routes: [],
  lifecycle: {
    /** @param {EvidenceContext} ctx */
    init(ctx) {
      store = new EvidenceStore();
      ctx.log.debug('evidence no ar');
    },
    dispose() {
      store = null;
    },
  },
};
