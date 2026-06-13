/**
 * /git-nexus — Git Nexus: núcleo unificado de código (issues #204/#194/#195).
 *
 * Funde Raio-X + Memória + Segundo Cérebro + Mini-LLM/ML num grafo de
 * conhecimento de código em 3D (orbe que gira como o JARVIS), com COMUNIDADES,
 * IMPACTO e CENTRALIDADE — tudo em JS puro (sem o servidor 4747 do GitNexus).
 *
 * Dois níveis (toggle):
 *   📁 Arquivos  → grafo de arquivos + imports (codemap.json)
 *   ƒ Funções    → grafo das principais funções/classes + chamadas
 *                  (codemap-symbols.json) — o nível profundo do GitNexus.
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { analyze, symbolSubmap, impactOf, dependenciesOf, search } from '../utils/git-nexus-engine.js';
import { createGraphView3D } from '../utils/git-nexus-graph3d.js';
import { memoryStats, codeMemoryCounts } from '../utils/jarvis-brain.js';
import codemap from '../data/codemap.json';
import symbolmap from '../data/codemap-symbols.json';

const PALETTE = ['#00f0ff', '#ff00aa', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];
const FN_CAP = 240;

export function gitNexusPage() {
  const cleanups = [];
  const codeMem = codeMemoryCounts();
  const memTotal = memoryStats().total;

  /* análise ativa (recalculada ao trocar de modo) */
  let cur = null;        // { mode, graph, communities, comIdx, pr, metrics, rawById }
  let view = null;

  const page = h('div', { className: 'page-gitnexus' });

  /* ---- header ---- */
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA & JARVIS'), h('span', null, '›'), h('span', null, 'GIT NEXUS')),
      h('h1', { className: 'page-header__title' }, '🔗 Git Nexus'),
      h('p', { className: 'page-header__description' },
        'Núcleo de código em ', h('span', { className: 'u-text-cyan' }, '3D'),
        ' — funde Raio-X + Memória + Segundo Cérebro + Mini-LLM. Comunidades, impacto e centralidade. ',
        'Alterne entre o grafo de ', h('span', { className: 'u-text-cyan' }, 'arquivos'),
        ' e o de ', h('span', { className: 'u-text-cyan' }, 'funções'), ' (chamadas).'))
  );

  /* ---- toggle de modo ---- */
  const tabFiles = h('button', { className: 'gn-mode is-active', onclick: () => switchMode('files') }, '📁 Arquivos');
  const tabFns = h('button', { className: 'gn-mode', onclick: () => switchMode('functions') }, 'ƒ Funções');
  page.appendChild(h('div', { className: 'gn-modes' }, tabFiles, tabFns,
    h('span', { className: 'gn-modes__hint u-text-muted' }, `${symbolmap.meta.symbols} funções · ${symbolmap.meta.calls} chamadas no código`)));

  /* ---- métricas (dinâmicas) ---- */
  const mrow = h('div', { className: 'gn-metrics' });
  page.appendChild(mrow);

  /* ---- corpo: grafo + painel ---- */
  const canvas = h('canvas', { className: 'gn-canvas' });
  const sideEl = h('div', { className: 'gn-side' });
  const searchInput = h('input', {
    className: 'gn-search input', type: 'search', placeholder: '🔎 buscar…',
    oninput: () => renderSearch(searchInput.value)
  });
  const searchResults = h('div', { className: 'gn-search__results' });
  const hintEl = h('div', { className: 'gn-graph__hint u-text-muted' }, '');

  page.appendChild(h('div', { className: 'gn-layout' },
    h('div', { className: 'gn-graph' }, canvas, hintEl),
    h('div', { className: 'gn-side-wrap' },
      h('div', { className: 'gn-searchbox' }, searchInput, searchResults),
      sideEl)));

  page.appendChild(renderUnifiedFooter());

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ===== modos ===== */

  function switchMode(mode) {
    if (cur && cur.mode === mode) return;
    tabFiles.classList.toggle('is-active', mode === 'files');
    tabFns.classList.toggle('is-active', mode === 'functions');
    if (view) { view.destroy(); view = null; }

    const submap = mode === 'functions' ? symbolSubmap(symbolmap, FN_CAP) : codemap;
    const a = analyze(submap);
    cur = { mode, ...a, rawById: new Map((submap.nodes || []).map((n) => [n.id, n])) };

    renderMetrics();
    hintEl.textContent = mode === 'functions'
      ? `🌐 grafo 3D · ${a.graph.nodes.length} principais funções · gira sozinho · arraste · clique p/ ver chamadas e impacto`
      : '🌐 grafo 3D · gira sozinho · arraste para girar · clique num nó p/ ver impacto e dependências';

    view = createGraphView3D(canvas, {
      nodes: a.graph.nodes, edges: a.graph.edges, comIdx: a.comIdx, pr: a.pr,
      onSelect: (id) => { if (id) renderNodeDetail(id); else renderCommunities(); }
    });
    view.start();
    renderCommunities();
  }

  function renderMetrics() {
    empty(mrow);
    if (cur.mode === 'functions') {
      mrow.append(
        metric(cur.graph.nodes.length, 'funções (top)', true),
        metric(cur.graph.edges.length, 'chamadas'),
        metric(cur.communities.length, 'clusters'),
        metric(symbolmap.meta.byKind.class || 0, 'classes'),
        metric(symbolmap.meta.symbols, 'funções totais'));
    } else {
      mrow.append(
        metric(cur.metrics.files, 'arquivos', true),
        metric(cur.metrics.imports, 'imports'),
        metric(cur.metrics.communities, 'comunidades'),
        metric(cur.metrics.totalLoc.toLocaleString('pt-BR'), 'linhas'),
        metric(memTotal, 'memórias ligadas'));
    }
  }

  /* ===== painel ===== */

  function metric(v, l, accent) {
    return h('div', { className: 'gn-metric' + (accent ? ' gn-metric--accent' : '') },
      h('div', { className: 'gn-metric__v u-mono' }, String(v)),
      h('div', { className: 'gn-metric__l' }, l));
  }

  function renderCommunities() {
    empty(sideEl);
    const isFn = cur.mode === 'functions';
    sideEl.append(
      h('h3', { className: 'gn-side__title' }, isFn ? '🧩 Clusters de funções' : '🧩 Comunidades do código'),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 10px' } },
        isFn ? 'Grupos de funções que se chamam — descobertos sozinho (não-supervisionado).'
             : 'Clusters de arquivos que se importam entre si, ',
        !isFn && h('a', { className: 'u-text-cyan', href: '#/aprendizado' }, 'como o ML da Memória'), !isFn && '.'));
    cur.communities.forEach((c, i) => {
      sideEl.appendChild(h('div', { className: 'gn-com' },
        h('span', { className: 'gn-com__dot', style: { background: PALETTE[i % PALETTE.length] } }),
        h('div', null,
          h('div', { className: 'gn-com__head' }, `${c.size} ${isFn ? 'funções' : 'arquivos'} · ${c.domDir}`),
          h('div', { className: 'gn-com__top u-text-muted' }, c.top.join(' · ')))));
    });
    sideEl.appendChild(h('div', { className: 'gn-side__metricbox' },
      h('div', { className: 'gn-mini' }, h('b', null, isFn ? 'Mais chamada: ' : 'Mais central: '), cur.metrics.central[0] ? cur.metrics.central[0].label : '—'),
      h('div', { className: 'gn-mini' }, h('b', null, isFn ? 'Mais chamada (bruto): ' : 'Mais importado: '), cur.metrics.mostDepended[0] ? `${cur.metrics.mostDepended[0].label} (${cur.metrics.mostDepended[0].importedBy}×)` : '—')));
  }

  function renderNodeDetail(id) {
    const n = cur.graph.index.get(id);
    if (!n) return renderCommunities();
    const raw = cur.rawById.get(id) || {};
    const imp = impactOf(cur.graph, id);
    const deps = dependenciesOf(cur.graph, id);
    const isFn = cur.mode === 'functions';

    empty(sideEl);
    sideEl.append(
      h('button', { className: 'gn-back', onclick: () => { view.select(null); renderCommunities(); } }, '← voltar'),
      h('h3', { className: 'gn-side__title' }, n.label),
      isFn
        ? h('div', { className: 'gn-file__path u-mono u-text-muted' },
            h('span', { className: 'gn-kind' }, raw.kind || 'function'), ' · ', raw.file || '', raw.line ? ` :${raw.line}` : '')
        : h('div', { className: 'gn-file__path u-mono u-text-muted' }, n.id),
      h('div', { className: 'gn-file__stats' },
        stat(n.loc, 'linhas'),
        stat(n.importedBy, isFn ? 'chamada por' : 'importado por'),
        stat(n.imports, isFn ? 'chama' : 'importa'),
        stat('#' + ((cur.comIdx.get(id) || 0) + 1), 'cluster')));

    sideEl.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, isFn ? '💥 Impacto — quem quebra se mudar' : '💥 Impacto — quem é afetado se mudar'),
      imp.affected.length
        ? h('p', { className: 'gn-impact' },
            h('b', { className: 'u-text-magenta' }, String(imp.affected.length)),
            isFn ? ' função(ões) na cadeia de chamadas ' : ' arquivo(s) afetados ',
            h('span', { className: 'u-text-muted' }, `(${imp.direct.length} diretos)`))
        : h('p', { className: 'u-text-muted' }, isFn ? 'Ninguém chama esta — folha do call graph.' : 'Nenhum arquivo importa este.'),
      ...imp.direct.slice(0, 8).map((d) => fileChip(d))));

    sideEl.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, isFn ? '📦 Chama' : '📦 Dependências — o que importa'),
      deps.length ? h('div', null, ...deps.slice(0, 10).map((d) => fileChip(d)))
        : h('p', { className: 'u-text-muted' }, isFn ? 'Não chama nenhuma função catalogada.' : 'Não importa nenhum módulo interno.')));

    if (!isFn) {
      const mem = codeMem[id] || 0;
      sideEl.appendChild(h('div', { className: 'gn-block' },
        h('div', { className: 'gn-block__title' }, '🧠 Memória ligada'),
        mem ? h('p', null, h('b', { className: 'u-text-cyan' }, String(mem)), ' memória(s) citam este arquivo. ',
          h('a', { className: 'u-text-cyan', href: '#/memoria' }, 'ver →'))
          : h('p', { className: 'u-text-muted' }, 'Nenhuma conversa citou este arquivo ainda.')));
    }
  }

  function fileChip(id) {
    const n = cur.graph.index.get(id);
    return h('span', { className: 'gn-chip', onclick: () => { view.select(id); renderNodeDetail(id); } }, n ? n.label : id);
  }
  function stat(v, l) {
    return h('div', { className: 'gn-stat' },
      h('div', { className: 'gn-stat__v u-mono' }, String(v)),
      h('div', { className: 'gn-stat__l' }, l));
  }

  function renderSearch(q) {
    empty(searchResults);
    const res = search(cur.graph, q);
    if (!q.trim() || !res.length) { searchResults.style.display = 'none'; return; }
    searchResults.style.display = 'block';
    res.slice(0, 10).forEach((n) => {
      const raw = cur.rawById.get(n.id) || {};
      searchResults.appendChild(h('div', { className: 'gn-search__row', onclick: () => {
        searchInput.value = ''; searchResults.style.display = 'none';
        view.select(n.id); renderNodeDetail(n.id);
      } }, h('span', null, n.label), h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } }, cur.mode === 'functions' ? (raw.file || '') : n.dir)));
    });
  }

  function renderUnifiedFooter() {
    const concepts = Object.keys(memoryStats().byConcept).length;
    const linkedFiles = Object.keys(codeMem).length;
    const card = (icon, title, desc, path, st) => h('div', { className: 'gn-tool', onclick: () => router.navigate(path) },
      h('div', { className: 'gn-tool__icon' }, icon),
      h('div', { className: 'gn-tool__name' }, title),
      h('div', { className: 'gn-tool__desc u-text-muted' }, desc),
      st && h('div', { className: 'gn-tool__stat u-text-cyan' }, st));
    return h('div', { className: 'gn-unified' },
      h('h2', { className: 'gn-unified__title' }, 'As 4 ferramentas, unificadas aqui'),
      h('div', { className: 'gn-tools' },
        card('🔬', 'Raio-X do Código', 'O grafo 3D — auto-análise do site.', '/codigo', `${(codemap.meta || {}).files || 0} arquivos`),
        card('🧠', 'Memória do JARVIS', 'Banco de conversas, ligado aos arquivos.', '/memoria', `${memTotal} memórias`),
        card('🕸️', 'Segundo Cérebro', 'Grafo de conhecimento dos domínios.', '/cerebro', `${concepts} conceitos`),
        card('📈', 'ML da Memória', 'Aprendizado sobre o que o site sabe.', '/aprendizado', `${linkedFiles} arquivos citados`)));
  }

  /* arranca no modo Arquivos */
  switchMode('files');
  cleanups.push(() => { if (view) view.destroy(); });

  return page;
}
