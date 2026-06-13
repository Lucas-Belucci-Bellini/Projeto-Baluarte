/**
 * /git-nexus — Git Nexus: núcleo unificado de código (issues #204/#194).
 *
 * Funde as quatro ferramentas que antes viviam separadas, num só lugar e
 * ligadas entre si:
 *   🔬 Raio-X do Código  → o grafo de conhecimento de código (interativo)
 *   🧠 Memória do JARVIS → memórias ligadas a cada arquivo
 *   🕸️ Segundo Cérebro   → conceitos ligados ao código
 *   🧠 Mini-LLM / ML     → comunidades = "assuntos do código" descobertos
 *
 * Reimplementa os conceitos do GitNexus em JS puro (sem o servidor 4747), então
 * roda no navegador e na Vercel: COMUNIDADES (clusters não-supervisionados),
 * IMPACTO (quem depende de quem) e CENTRALIDADE (PageRank). É a base que se liga
 * ao painel de Machine Learning (/aprendizado).
 */

import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { analyze, impactOf, dependenciesOf, search } from '../utils/git-nexus-engine.js';
import { createGraphView } from '../utils/git-nexus-graph.js';
import { memoryStats, codeMemoryCounts, getMemories } from '../utils/jarvis-brain.js';
import codemap from '../data/codemap.json';

const PALETTE = ['#00f0ff', '#ff00aa', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];

export function gitNexusPage() {
  /* cleanups LOCAL por invocação — global faria uma 2ª chamada da página
     destruir o grafo da 1ª (a que fica montada), deixando o canvas em branco. */
  const cleanups = [];

  const { graph, communities, comIdx, pr, metrics } = analyze(codemap);
  const codeMem = codeMemoryCounts();
  const memTotal = memoryStats().total;

  const page = h('div', { className: 'page-gitnexus' });

  /* ---- header ---- */
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA & JARVIS'), h('span', null, '›'),
        h('span', null, 'GIT NEXUS')),
      h('h1', { className: 'page-header__title' }, '🔗 Git Nexus'),
      h('p', { className: 'page-header__description' },
        'Núcleo unificado de código — funde ',
        h('span', { className: 'u-text-cyan' }, 'Raio-X + Memória + Segundo Cérebro + Mini-LLM'),
        ' num grafo de conhecimento interativo, com comunidades, análise de impacto e centralidade. ',
        'Roda no navegador (sem servidor) e se liga ao ',
        h('a', { className: 'u-text-cyan', href: '#/aprendizado' }, 'Machine Learning'), '.'))
  );

  /* ---- métricas ---- */
  const mrow = h('div', { className: 'gn-metrics' },
    metric(metrics.files, 'arquivos', true),
    metric(metrics.imports, 'imports'),
    metric(metrics.communities, 'comunidades'),
    metric(metrics.totalLoc.toLocaleString('pt-BR'), 'linhas'),
    metric(memTotal, 'memórias ligadas'));
  page.appendChild(mrow);

  /* ---- corpo: grafo (esquerda) + painel (direita) ---- */
  const canvas = h('canvas', { className: 'gn-canvas' });
  const sideEl = h('div', { className: 'gn-side' });

  const searchInput = h('input', {
    className: 'gn-search input', type: 'search', placeholder: '🔎 buscar arquivo (ex: jarvis, helpers, radar)…',
    oninput: () => renderSearch(searchInput.value)
  });
  const searchResults = h('div', { className: 'gn-search__results' });

  const layout = h('div', { className: 'gn-layout' },
    h('div', { className: 'gn-graph' },
      canvas,
      h('div', { className: 'gn-graph__hint u-text-muted' }, 'arraste o mouse para explorar · clique num nó para ver impacto e dependências')),
    h('div', { className: 'gn-side-wrap' },
      h('div', { className: 'gn-searchbox' }, searchInput, searchResults),
      sideEl));
  page.appendChild(layout);

  /* visão padrão do painel: comunidades (assuntos do código) */
  renderCommunities();

  /* grafo interativo */
  const view = createGraphView(canvas, {
    nodes: graph.nodes, edges: graph.edges, comIdx, pr,
    onSelect: (id) => { if (id) renderNodeDetail(id); else renderCommunities(); }
  });
  view.start();
  cleanups.push(() => view.destroy());

  /* ---- rodapé: as 4 ferramentas unificadas ---- */
  page.appendChild(renderUnifiedFooter());

  /* limpa quando a página sai do DOM */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ===== helpers de render ===== */

  function metric(v, l, accent) {
    return h('div', { className: 'gn-metric' + (accent ? ' gn-metric--accent' : '') },
      h('div', { className: 'gn-metric__v u-mono' }, String(v)),
      h('div', { className: 'gn-metric__l' }, l));
  }

  function renderCommunities() {
    empty(sideEl);
    sideEl.append(
      h('h3', { className: 'gn-side__title' }, '🧩 Comunidades do código'),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 10px' } },
        'Clusters de arquivos que se importam entre si — descobertos sozinho (não-supervisionado), como os assuntos do ',
        h('a', { className: 'u-text-cyan', href: '#/aprendizado' }, 'ML da Memória'), '.'));
    communities.forEach((c, i) => {
      sideEl.appendChild(h('div', { className: 'gn-com' },
        h('span', { className: 'gn-com__dot', style: { background: PALETTE[i % PALETTE.length] } }),
        h('div', null,
          h('div', { className: 'gn-com__head' }, `${c.size} arquivos · ${c.domDir}`),
          h('div', { className: 'gn-com__top u-text-muted' }, c.top.join(' · ')))));
    });
    sideEl.appendChild(h('div', { className: 'gn-side__metricbox' },
      h('div', { className: 'gn-mini' }, h('b', null, 'Mais central: '), metrics.central[0] ? metrics.central[0].label : '—'),
      h('div', { className: 'gn-mini' }, h('b', null, 'Mais importado: '), metrics.mostDepended[0] ? `${metrics.mostDepended[0].label} (${metrics.mostDepended[0].importedBy}×)` : '—')));
  }

  function renderNodeDetail(id) {
    const n = graph.index.get(id);
    if (!n) return renderCommunities();
    const imp = impactOf(graph, id);
    const deps = dependenciesOf(graph, id);
    const mem = codeMem[id] || 0;

    empty(sideEl);
    sideEl.append(
      h('button', { className: 'gn-back', onclick: () => { view.select(null); renderCommunities(); } }, '← comunidades'),
      h('h3', { className: 'gn-side__title' }, n.label),
      h('div', { className: 'gn-file__path u-mono u-text-muted' }, n.id),
      h('div', { className: 'gn-file__stats' },
        stat(n.loc, 'linhas'), stat(n.importedBy, 'importado por'), stat(n.imports, 'importa'),
        stat(PALETTE[(comIdx.get(id) || 0) % PALETTE.length] ? '#' + ((comIdx.get(id) || 0) + 1) : '—', 'comunidade')));

    /* impacto */
    sideEl.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, '💥 Impacto — quem é afetado se mudar'),
      imp.affected.length
        ? h('p', { className: 'gn-impact' },
            h('b', { className: 'u-text-magenta' }, String(imp.affected.length)), ` arquivo(s) afetados `,
            h('span', { className: 'u-text-muted' }, `(${imp.direct.length} diretos)`))
        : h('p', { className: 'u-text-muted' }, 'Nenhum arquivo importa este — folha do grafo.'),
      ...imp.direct.slice(0, 8).map((d) => fileChip(d))));

    /* dependências */
    sideEl.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, '📦 Dependências — o que importa'),
      deps.length ? h('div', null, ...deps.slice(0, 10).map((d) => fileChip(d)))
        : h('p', { className: 'u-text-muted' }, 'Não importa nenhum módulo interno.')));

    /* memória ligada */
    sideEl.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, '🧠 Memória ligada'),
      mem ? h('p', null, h('b', { className: 'u-text-cyan' }, String(mem)), ' memória(s) do JARVIS citam este arquivo. ',
        h('a', { className: 'u-text-cyan', href: '#/memoria' }, 'ver memórias →'))
        : h('p', { className: 'u-text-muted' }, 'Nenhuma conversa citou este arquivo ainda.')));
  }

  function fileChip(id) {
    const n = graph.index.get(id);
    return h('span', { className: 'gn-chip', onclick: () => { view.select(id); renderNodeDetail(id); } },
      n ? n.label : id);
  }

  function stat(v, l) {
    return h('div', { className: 'gn-stat' },
      h('div', { className: 'gn-stat__v u-mono' }, String(v)),
      h('div', { className: 'gn-stat__l' }, l));
  }

  function renderSearch(q) {
    empty(searchResults);
    const res = search(graph, q);
    if (!q.trim() || !res.length) { searchResults.style.display = 'none'; return; }
    searchResults.style.display = 'block';
    res.slice(0, 10).forEach((n) => {
      searchResults.appendChild(h('div', { className: 'gn-search__row', onclick: () => {
        searchInput.value = ''; searchResults.style.display = 'none';
        view.select(n.id); renderNodeDetail(n.id);
      } }, h('span', null, n.label), h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } }, n.dir)));
    });
  }

  function renderUnifiedFooter() {
    const concepts = Object.keys(memoryStats().byConcept).length;
    const linkedFiles = Object.keys(codeMem).length;
    const card = (icon, title, desc, path, stat) => h('div', { className: 'gn-tool', onclick: () => router.navigate(path) },
      h('div', { className: 'gn-tool__icon' }, icon),
      h('div', { className: 'gn-tool__name' }, title),
      h('div', { className: 'gn-tool__desc u-text-muted' }, desc),
      stat && h('div', { className: 'gn-tool__stat u-text-cyan' }, stat));
    return h('div', { className: 'gn-unified' },
      h('h2', { className: 'gn-unified__title' }, 'As 4 ferramentas, unificadas aqui'),
      h('p', { className: 'u-text-muted', style: { fontSize: '13px', margin: '0 0 12px' } },
        'O Git Nexus reúne as funções das quatro — cada uma segue acessível, mas agora elas conversam entre si pelo grafo de código acima.'),
      h('div', { className: 'gn-tools' },
        card('🔬', 'Raio-X do Código', 'O grafo 3D original — auto-análise do site.', '/codigo', `${metrics.files} arquivos`),
        card('🧠', 'Memória do JARVIS', 'Banco de conversas, ligado aos arquivos.', '/memoria', `${memTotal} memórias`),
        card('🕸️', 'Segundo Cérebro', 'Grafo de conhecimento dos domínios.', '/cerebro', `${concepts} conceitos`),
        card('📈', 'ML da Memória', 'Aprendizado sobre o que o site sabe.', '/aprendizado', `${linkedFiles} arquivos citados`)));
  }

  return page;
}
