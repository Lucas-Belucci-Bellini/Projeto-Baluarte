/**
 * Git Nexus — motor do grafo de conhecimento de código (issues #204/#194).
 *
 * Reimplementa NATIVAMENTE (JS puro, roda no navegador e na Vercel) os conceitos
 * do GitNexus que importam, sem o servidor Node na porta 4747 que o original
 * exige: taxonomia de nós/arestas do código, detecção de COMUNIDADES (clusters),
 * análise de IMPACTO (quem depende de quem) e CENTRALIDADE (PageRank). É a base
 * que unifica Raio-X + Segundo Cérebro + Memória + Mini-LLM e se liga ao ML.
 *
 * Entrada: o `codemap.json` do site (nós = arquivos {id,label,dir,loc,imports,
 * importedBy}; arestas = imports {source,target}). Tudo determinístico.
 */

/** Constrói o grafo tipado a partir do codemap. */
/**
 * M3b — converte o grafo REAL do motor do GitNexus (`{ nodes: GraphNode[],
 * relationships: GraphRelationship[] }`, vindo da ponte `nexus:graph`) no
 * formato codemap que o `buildGraph`/`analyze` já consomem. Assim o orbe 3D, as
 * comunidades, o PageRank e o impacto rodam no grafo real sem nenhum fork.
 */
export function fromEngineGraph(g) {
  const nodes = (g.nodes || []).map((n) => {
    const p = n.properties || {};
    const fp = p.filePath || p.path || '';
    return {
      id: n.id,
      label: p.name || (fp ? fp.split('/').pop() : '') || n.id,
      dir: fp ? fp.split('/').slice(0, -1).join('/') || '(raiz)' : n.label || '(raiz)',
      kind: n.label
    };
  });
  const links = (g.relationships || []).map((r) => ({
    source: r.sourceId,
    target: r.targetId,
    type: r.type
  }));
  return { nodes, links, meta: { live: true, count: nodes.length } };
}

export function buildGraph(codemap) {
  const nodes = (codemap.nodes || []).map((n) => ({
    id: n.id, label: n.label || n.id, dir: n.dir || '(raiz)',
    loc: n.loc || 0, imports: n.imports || 0, importedBy: n.importedBy || 0
  }));
  const index = new Map(nodes.map((n) => [n.id, n]));
  const edges = (codemap.links || codemap.edges || [])
    .filter((e) => index.has(e.source) && index.has(e.target))
    .map((e) => ({ source: e.source, target: e.target, type: 'IMPORTS' }));

  /* adjacências */
  const out = new Map(nodes.map((n) => [n.id, []]));   // source → [targets] (importa)
  const inc = new Map(nodes.map((n) => [n.id, []]));   // target → [sources] (importado por)
  for (const e of edges) { out.get(e.source).push(e.target); inc.get(e.target).push(e.source); }

  return { nodes, edges, index, out, inc };
}

/**
 * Detecção de comunidades por propagação de rótulos (Label Propagation) —
 * não-supervisionado e determinístico (ordem fixa + desempate estável). É o
 * conceito "Community" do GitNexus: agrupa arquivos que se importam entre si.
 */
export function detectCommunities(graph, { iters = 30 } = {}) {
  const { nodes, out, inc } = graph;
  const label = new Map(nodes.map((n, i) => [n.id, i]));
  /* vizinhança não-direcionada */
  const nbr = new Map(nodes.map((n) => [n.id, [...new Set([...(out.get(n.id) || []), ...(inc.get(n.id) || [])])]]));
  const order = nodes.map((n) => n.id);

  for (let it = 0; it < iters; it++) {
    let changed = false;
    for (const id of order) {
      const ns = nbr.get(id);
      if (!ns.length) continue;
      /* rótulo mais frequente entre os vizinhos (desempate: menor id de rótulo) */
      const count = new Map();
      for (const m of ns) { const l = label.get(m); count.set(l, (count.get(l) || 0) + 1); }
      let best = label.get(id), bestN = -1;
      for (const [l, c] of [...count.entries()].sort((a, b) => a[0] - b[0])) {
        if (c > bestN) { bestN = c; best = l; }
      }
      if (best !== label.get(id)) { label.set(id, best); changed = true; }
    }
    if (!changed) break;
  }

  /* compacta rótulos em comunidades numeradas e resume cada uma */
  const groups = new Map();
  for (const n of nodes) {
    const l = label.get(n.id);
    if (!groups.has(l)) groups.set(l, []);
    groups.get(l).push(n);
  }
  const communities = [...groups.values()]
    .map((members) => {
      const byDir = {};
      for (const m of members) byDir[m.dir] = (byDir[m.dir] || 0) + 1;
      const domDir = Object.entries(byDir).sort((a, b) => b[1] - a[1])[0][0];
      const top = members.slice().sort((a, b) => b.importedBy - a.importedBy).slice(0, 4).map((m) => m.label);
      return { size: members.length, members, domDir, top };
    })
    .filter((c) => c.size > 0)
    .sort((a, b) => b.size - a.size);

  /* atribui índice de comunidade a cada nó (para colorir) */
  const comIdx = new Map();
  communities.forEach((c, i) => c.members.forEach((m) => comIdx.set(m.id, i)));
  return { communities, comIdx };
}

/**
 * PageRank — centralidade: quão "importante" um arquivo é na teia de imports.
 * Itera sobre o grafo de quem-importa-quem (peso flui para os mais importados).
 */
export function pageRank(graph, { damping = 0.85, iters = 40 } = {}) {
  const { nodes, inc, out } = graph;
  const N = nodes.length || 1;
  let pr = new Map(nodes.map((n) => [n.id, 1 / N]));
  const outDeg = new Map(nodes.map((n) => [n.id, (out.get(n.id) || []).length]));
  for (let it = 0; it < iters; it++) {
    const next = new Map(nodes.map((n) => [n.id, (1 - damping) / N]));
    for (const n of nodes) {
      let sum = 0;
      for (const src of inc.get(n.id) || []) {       // quem importa n distribui rank a n
        const d = outDeg.get(src) || 1;
        sum += pr.get(src) / d;
      }
      next.set(n.id, (1 - damping) / N + damping * sum);
    }
    pr = next;
  }
  return pr;
}

/**
 * Impacto: dado um arquivo, quem é afetado se ele mudar — todos os que o
 * importam, direta e transitivamente (alcançabilidade reversa). Conceito
 * "impact" do GitNexus.
 */
export function impactOf(graph, id, { maxDepth = 12 } = {}) {
  const { inc } = graph;
  const seen = new Set();
  const direct = new Set(inc.get(id) || []);
  const queue = [[id, 0]];
  while (queue.length) {
    const [cur, d] = queue.shift();
    if (d >= maxDepth) continue;
    for (const src of inc.get(cur) || []) {
      if (!seen.has(src)) { seen.add(src); queue.push([src, d + 1]); }
    }
  }
  return { affected: [...seen], direct: [...direct] };
}

/** Dependências: o que este arquivo importa (direto). */
export function dependenciesOf(graph, id) {
  return [...(graph.out.get(id) || [])];
}

/** Busca arquivos por nome (substring, case-insensitive). */
export function search(graph, query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  return graph.nodes
    .filter((n) => n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q))
    .slice(0, 30);
}

/** Métricas globais do grafo (para o painel de resumo). */
export function graphMetrics(graph, pr, communities) {
  const { nodes, edges } = graph;
  const central = [...pr.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
    .map(([id, v]) => ({ id, label: graph.index.get(id).label, score: v }));
  const mostDepended = nodes.slice().sort((a, b) => b.importedBy - a.importedBy).slice(0, 6);
  const orphans = nodes.filter((n) => n.imports === 0 && n.importedBy === 0).length;
  const totalLoc = nodes.reduce((s, n) => s + n.loc, 0);
  return {
    files: nodes.length, imports: edges.length, communities: communities.length,
    totalLoc, orphans, central, mostDepended
  };
}

/* ===== Ferramentas estilo GitNexus (Console do Nexus) ===== */

/** context(X): definição + quem chama (callers) + o que chama (callees). */
export function nexusContext(graph, id) {
  const node = graph.index.get(id);
  if (!node) return null;
  return {
    node,
    callers: [...(graph.inc.get(id) || [])],   // quem importa/chama X
    callees: [...(graph.out.get(id) || [])]    // o que X importa/chama
  };
}

/** Alcançabilidade genérica: dir 'up' usa inc (quem depende), 'down' usa out. */
function reach(graph, id, dir, maxDepth = 14) {
  const adj = dir === 'down' ? graph.out : graph.inc;
  const direct = new Set(adj.get(id) || []);
  const seen = new Set();
  const queue = [[id, 0]];
  while (queue.length) {
    const [cur, d] = queue.shift();
    if (d >= maxDepth) continue;
    for (const nx of adj.get(cur) || []) {
      if (!seen.has(nx) && nx !== id) { seen.add(nx); queue.push([nx, d + 1]); }
    }
  }
  return { affected: [...seen], direct: [...direct] };
}

/** Classifica o risco pelo raio de explosão (estilo GitNexus: ALTO/CRÍTICO). */
export function riskLevel(n) {
  if (n <= 0) return { label: 'NENHUM', cls: 'safe' };
  if (n <= 3) return { label: 'BAIXO', cls: 'low' };
  if (n <= 10) return { label: 'MÉDIO', cls: 'mid' };
  if (n <= 30) return { label: 'ALTO', cls: 'high' };
  return { label: 'CRÍTICO', cls: 'crit' };
}

/** impact(X, dir): raio de explosão + nível de risco. up=quem quebra, down=o que usa. */
export function nexusImpact(graph, id, dir = 'up') {
  const r = reach(graph, id, dir === 'down' ? 'down' : 'up');
  return { ...r, risk: riskLevel(r.affected.length) };
}

/** path(A, B): menor caminho de chamadas/imports de A até B (BFS dirigido). */
export function nexusPath(graph, a, b) {
  if (a === b) return [a];
  const prev = new Map([[a, null]]);
  const queue = [a];
  while (queue.length) {
    const cur = queue.shift();
    for (const nx of graph.out.get(cur) || []) {
      if (!prev.has(nx)) {
        prev.set(nx, cur);
        if (nx === b) {
          const path = [b]; let p = cur;
          while (p != null) { path.unshift(p); p = prev.get(p); }
          return path;
        }
        queue.push(nx);
      }
    }
  }
  return null; // sem caminho dirigido
}

/** rename(X): usos que um rename seguro tocaria (quem referencia X). */
export function nexusRename(graph, id) {
  return [...(graph.inc.get(id) || [])];
}


/** Análise completa de uma vez (conveniência para a página). */
export function analyze(codemap) {
  const graph = buildGraph(codemap);
  const { communities, comIdx } = detectCommunities(graph);
  const pr = pageRank(graph);
  const metrics = graphMetrics(graph, pr, communities);
  return { graph, communities, comIdx, pr, metrics };
}

/**
 * Sub-grafo dos top-`cap` símbolos por grau (chamadas + chamado-por), para o
 * grafo de FUNÇÕES caber e renderizar bem em 3D. Devolve no formato do codemap
 * (nodes + links), então passa direto pelo mesmo `analyze()`. Mantém os campos
 * extras dos símbolos (kind, file) para a página exibir.
 */
export function symbolSubmap(symbolJson, cap = 240) {
  const all = symbolJson.nodes || [];
  const ranked = [...all]
    .sort((a, b) => (b.imports + b.importedBy) - (a.imports + a.importedBy))
    .slice(0, cap);
  const keep = new Set(ranked.map((n) => n.id));
  const links = (symbolJson.links || []).filter((e) => keep.has(e.source) && keep.has(e.target));
  return { nodes: ranked, links, meta: symbolJson.meta };
}

/**
 * Drill-down: grafo das funções de UM arquivo + seus vizinhos de 1 salto (quem
 * elas chamam / quem as chama em outros arquivos), para ver como o arquivo se
 * conecta. `focusIds` marca as funções do próprio arquivo (para destaque).
 */
export function fileSymbolGraph(symbolJson, fileId, cap = 160) {
  const inFile = (symbolJson.nodes || []).filter((n) => n.file === fileId);
  const focusIds = new Set(inFile.map((n) => n.id));
  const neigh = new Set();
  for (const e of symbolJson.links || []) {
    if (focusIds.has(e.source)) neigh.add(e.target);
    if (focusIds.has(e.target)) neigh.add(e.source);
  }
  const keep = new Set([...focusIds, ...neigh]);
  let nodes = (symbolJson.nodes || []).filter((n) => keep.has(n.id));
  /* se passar do teto, mantém as do arquivo + vizinhos mais conectados */
  if (nodes.length > cap) {
    const extra = nodes.filter((n) => !focusIds.has(n.id))
      .sort((a, b) => (b.imports + b.importedBy) - (a.imports + a.importedBy))
      .slice(0, Math.max(0, cap - focusIds.size));
    const keep2 = new Set([...focusIds, ...extra.map((n) => n.id)]);
    nodes = nodes.filter((n) => keep2.has(n.id));
  }
  const ids = new Set(nodes.map((n) => n.id));
  const links = (symbolJson.links || []).filter((e) => ids.has(e.source) && ids.has(e.target));
  return { nodes, links, focusFile: fileId, focusIds, meta: symbolJson.meta };
}
