// Cliente do motor REAL do GitNexus, via a ponte nativa do launcher
// (`window.baluarte.invoke('nexus:*')`). Só funciona DENTRO do app desktop
// (`window.baluarte.native`); na web devolve `null`/lança `NOT_NATIVE` pra UI
// cair no engine JS puro (codemap) ou mostrar o teaser "baixe o app".
//
// Cobre o subset REST do `gitnexus serve` (4747):
//   • repos      → GET  /api/repos
//   • search     → POST /api/search   (busca híbrida BM25 + semântica)
//   • cypher     → POST /api/query    (Cypher cru no grafo)
//   • processes  → GET  /api/processes (fluxos de execução)
//   • clusters   → GET  /api/clusters  (comunidades)
// As tools "profundas" (context/impact/detect_changes/rename com confiança)
// vivem na ponte MCP-over-HTTP (POST /api/mcp) — fatia seguinte (M3d-MCP).

/** A ponte nativa, ou null se rodando na web (sem launcher). */
function bridge() {
  const b = typeof window !== 'undefined' ? window.baluarte : null;
  return b && b.native && typeof b.invoke === 'function' ? b : null;
}

/** True se há ponte nativa (estamos dentro do launcher). */
export function isNative() {
  return !!bridge();
}

/** Invoca um canal `nexus:*`; lança NOT_NATIVE na web, ou o erro do motor. */
async function call(channel, payload) {
  const b = bridge();
  if (!b) {
    const e = new Error('Motor real só no app (abra o Baluarte Launcher).');
    e.code = 'NOT_NATIVE';
    throw e;
  }
  return b.invoke(channel, payload || {});
}

export const nexusLive = {
  isNative,
  repos: () => call('nexus:repos'),
  search: (query, opts = {}) => call('nexus:search', { query, ...opts }),
  cypher: (query, repo) => call('nexus:cypher', { query, repo }),
  processes: (repo) => call('nexus:processes', { repo }),
  clusters: (repo) => call('nexus:clusters', { repo })
};
