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
import { analyze, symbolSubmap, fileSymbolGraph, impactOf, dependenciesOf, search,
  nexusContext, nexusImpact, nexusPath, nexusRename, fromEngineGraph } from '../utils/git-nexus-engine.js';
import { createGraphView3D } from '../utils/git-nexus-graph3d.js';
import { memoryStats, codeMemoryCounts } from '../utils/jarvis-brain.js';
import codemap from '../data/codemap.json';
import symbolmap from '../data/codemap-symbols.json';

const PALETTE = ['#d4a24e', '#e8c07a', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];
const FN_CAP = 240;

/**
 * M3a — no Baluarte Launcher (app desktop), revela se o MOTOR REAL do GitNexus
 * está no ar (servidor na 4747). Na web (sem `window.baluarte`) fica oculto e a
 * página segue usando o mapa de build. O grafo ao vivo entra numa fatia futura.
 */
async function detectNativeEngine(el) {
  const bridge = typeof window !== 'undefined' ? window.baluarte : null;
  if (!bridge || !bridge.native || typeof bridge.invoke !== 'function') return;
  let st = null;
  try {
    st = await bridge.invoke('nexus:status');
  } catch {
    return; // ponte indisponível — mantém oculto
  }
  el.style.display = '';
  if (st && st.available) {
    el.className = 'gn-engine is-live';
    el.append(
      h('span', { className: 'gn-engine__dot' }),
      h('span', null, 'Motor real do GitNexus conectado'),
      h('span', { className: 'gn-engine__v u-mono' }, st.version ? `v${st.version}` : 'ao vivo')
    );
  } else {
    el.className = 'gn-engine is-off';
    el.append(
      h('span', { className: 'gn-engine__dot' }),
      h('span', null, 'Motor local indisponível — usando o mapa de build.'),
      h('span', { className: 'gn-engine__hint u-mono' }, 'gitnexus serve')
    );
  }
}

export function gitNexusPage() {
  const cleanups = [];
  const codeMem = codeMemoryCounts();
  const memTotal = memoryStats().total;

  /* análise ativa (recalculada ao trocar de modo) */
  let cur = null;        // { mode, graph, communities, comIdx, pr, metrics, rawById }
  let view = null;
  let liveGraph = null;  // M3b — grafo REAL do motor (só no Baluarte Launcher)

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

  /* ---- motor nativo (M3a — só aparece dentro do Baluarte Launcher) ---- */
  const engineBadge = h('div', { className: 'gn-engine', style: { display: 'none' } });
  page.appendChild(engineBadge);
  detectNativeEngine(engineBadge);

  /* nº de funções por arquivo (para o botão de drill-down) */
  const fnByFile = {};
  for (const n of symbolmap.nodes) fnByFile[n.file] = (fnByFile[n.file] || 0) + 1;

  /* ---- toggle de modo ---- */
  const tabFiles = h('button', { className: 'gn-mode is-active', onclick: () => switchMode('files') }, '📁 Arquivos');
  const tabFns = h('button', { className: 'gn-mode', onclick: () => switchMode('functions') }, 'ƒ Funções');
  const focusCrumb = h('span', { className: 'gn-focus', style: { display: 'none' } });
  page.appendChild(h('div', { className: 'gn-modes' }, tabFiles, tabFns, focusCrumb,
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

  page.appendChild(renderConsole());
  page.appendChild(renderUnifiedFooter());

  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { cleanups.splice(0).forEach((fn) => { try { fn(); } catch {} }); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  /* ===== modos ===== */

  function switchMode(mode, opts = {}) {
    const focusFile = opts.fileId || null;
    if (cur && cur.mode === mode && cur.focusFile === focusFile) return;
    tabFiles.classList.toggle('is-active', mode === 'files');
    tabFns.classList.toggle('is-active', mode === 'functions');
    if (view) { view.destroy(); view = null; }

    let submap;
    if (mode === 'file-functions') submap = fileSymbolGraph(symbolmap, focusFile);
    else if (mode === 'functions') submap = symbolSubmap(symbolmap, FN_CAP);
    else submap = liveGraph || codemap;   // M3b: grafo real do motor, se houver
    const a = analyze(submap);
    cur = { mode, focusFile, focusIds: submap.focusIds || null, ...a, rawById: new Map((submap.nodes || []).map((n) => [n.id, n])) };

    /* migalha de foco (drill-down) */
    if (mode === 'file-functions') {
      focusCrumb.style.display = '';
      empty(focusCrumb);
      focusCrumb.append(
        h('span', null, `ƒ ${focusFile}`),
        h('button', { className: 'gn-focus__back', onclick: () => switchMode('files') }, '← arquivos'));
    } else {
      focusCrumb.style.display = 'none';
    }

    renderMetrics();
    hintEl.textContent = mode === 'file-functions'
      ? `🌐 funções de ${focusFile.split('/').pop()} + conexões · gira sozinho · arraste · clique p/ detalhes`
      : mode === 'functions'
        ? `🌐 grafo 3D · ${a.graph.nodes.length} principais funções · gira sozinho · arraste · clique p/ ver chamadas e impacto`
        : liveGraph
          ? '🌐 grafo REAL do motor · gira sozinho · arraste · clique num nó p/ ver impacto e dependências'
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
    if (cur.mode === 'file-functions') {
      const own = cur.focusIds ? cur.focusIds.size : 0;
      mrow.append(
        metric(own, 'funções no arquivo', true),
        metric(cur.graph.nodes.length - own, 'conectadas'),
        metric(cur.graph.edges.length, 'chamadas'),
        metric(cur.communities.length, 'clusters'),
        metric(fnByFile[cur.focusFile] || own, 'definidas'));
    } else if (cur.mode === 'functions') {
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
    const isFn = cur.mode !== 'files';
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
    const isFn = cur.mode !== 'files';

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
      /* drill-down: ver as funções deste arquivo no grafo (#204) */
      const fnCount = fnByFile[id] || 0;
      if (fnCount > 0) {
        sideEl.appendChild(h('div', { className: 'gn-block' },
          h('button', { className: 'gn-drill', onclick: () => switchMode('file-functions', { fileId: id }) },
            `ƒ ver as ${fnCount} funções deste arquivo →`)));
      }
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
      } }, h('span', null, n.label), h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } }, cur.mode !== 'files' ? (raw.file || '') : n.dir)));
    });
  }

  /* ===== Console do Nexus — ferramentas de consulta do GitNexus ===== */

  function resolve(name) {
    const q = (name || '').trim();
    if (!q) return null;
    if (cur.graph.index.has(q)) return q;
    const exact = cur.graph.nodes.find((n) => n.label.toLowerCase() === q.toLowerCase());
    if (exact) return exact.id;
    const r = search(cur.graph, q);
    return r.length ? r[0].id : null;
  }
  const labelOf = (id) => { const n = cur.graph.index.get(id); return n ? n.label : id; };

  function renderConsole() {
    const out = h('div', { className: 'gn-console__out' });
    const input = h('input', {
      className: 'gn-console__in u-mono', type: 'text', spellcheck: 'false',
      placeholder: 'context helpers · impact router · impact h down · path A B · rename toast · buscar…',
      onkeydown: (e) => { if (e.key === 'Enter') run(input.value); }
    });

    const chip = (id) => h('span', { className: 'gn-chip', onclick: () => { view.select(id); renderNodeDetail(id); } }, labelOf(id));
    const line = (...kids) => h('div', { className: 'gn-console__line' }, ...kids);

    function run(raw) {
      const s = (raw || '').trim();
      if (!s) return;
      const parts = s.split(/\s+/);
      const cmd = parts[0].toLowerCase();
      const block = h('div', { className: 'gn-console__block' });
      block.appendChild(h('div', { className: 'gn-console__cmd u-mono' }, '› ' + s));

      const need = (name, label) => {
        const id = resolve(name);
        if (!id) block.appendChild(line(h('span', { className: 'u-text-muted' }, `${label || 'símbolo'} "${name}" não encontrado no grafo atual.`)));
        return id;
      };

      if (cmd === 'context' || cmd === 'ctx') {
        const id = need(parts[1]); if (id) {
          const c = nexusContext(cur.graph, id); const raw2 = cur.rawById.get(id) || {};
          block.appendChild(line(h('b', null, labelOf(id)), ' — ', h('span', { className: 'u-text-muted' }, cur.mode !== 'files' ? `${raw2.kind || 'function'} · ${raw2.file || ''}` : id)));
          block.appendChild(line(h('span', { className: 'u-text-muted' }, `${cur.mode !== 'files' ? 'chamada por' : 'importado por'} (${c.callers.length}): `), ...c.callers.slice(0, 12).map(chip)));
          block.appendChild(line(h('span', { className: 'u-text-muted' }, `${cur.mode !== 'files' ? 'chama' : 'importa'} (${c.callees.length}): `), ...c.callees.slice(0, 12).map(chip)));
        }
      } else if (cmd === 'impact') {
        const dir = /down|baixo|usa/.test(parts[2] || '') ? 'down' : 'up';
        const id = need(parts[1]); if (id) {
          const im = nexusImpact(cur.graph, id, dir);
          block.appendChild(line(
            h('span', { className: `gn-risk gn-risk--${im.risk.cls}` }, 'risco ' + im.risk.label),
            ' ', h('b', { className: 'u-text-magenta' }, String(im.affected.length)),
            dir === 'up' ? ' afetados se mudar ' : ' usados (downstream) ',
            h('span', { className: 'u-text-muted' }, `· ${im.direct.length} diretos`)));
          if (im.direct.length) block.appendChild(line(...im.direct.slice(0, 14).map(chip)));
        }
      } else if (cmd === 'path' || cmd === 'caminho') {
        const a = need(parts[1], 'origem'), b = need(parts[2], 'destino');
        if (a && b) {
          const path = nexusPath(cur.graph, a, b);
          if (!path) block.appendChild(line(h('span', { className: 'u-text-muted' }, 'sem caminho dirigido de chamadas entre os dois.')));
          else { const els = []; path.forEach((id, i) => { if (i) els.push(h('span', { className: 'u-text-muted' }, ' → ')); els.push(chip(id)); }); block.appendChild(line(...els)); }
        }
      } else if (cmd === 'rename') {
        const id = need(parts[1]); if (id) {
          const uses = nexusRename(cur.graph, id);
          block.appendChild(line('renomear ', h('b', null, labelOf(id)), ' tocaria ', h('b', { className: 'u-text-cyan' }, String(uses.length)), ' uso(s):'));
          if (uses.length) block.appendChild(line(...uses.slice(0, 16).map(chip)));
        }
      } else {
        const term = cmd === 'query' || cmd === 'q' ? parts.slice(1).join(' ') : s;
        const res = search(cur.graph, term);
        if (!res.length) block.appendChild(line(h('span', { className: 'u-text-muted' }, `nada encontrado para "${term}".`)));
        else block.appendChild(line(h('span', { className: 'u-text-muted' }, `${res.length} resultado(s): `), ...res.slice(0, 14).map((n) => chip(n.id))));
      }
      out.insertBefore(block, out.firstChild);
      input.value = '';
    }

    return h('div', { className: 'gn-console' },
      h('div', { className: 'gn-console__head' },
        h('h2', { className: 'gn-unified__title' }, '🖥 Console do Nexus'),
        h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'ferramentas do GitNexus sobre o grafo: context · impact · path · rename · query')),
      input, out);
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

  /* M3b — no launcher, troca o codemap pelo grafo REAL do motor (degrada p/ codemap) */
  async function maybeLoadLiveGraph() {
    const bridge = typeof window !== 'undefined' ? window.baluarte : null;
    if (!bridge || !bridge.native || typeof bridge.invoke !== 'function') return;
    try {
      const g = await bridge.invoke('nexus:graph');
      if (!g || !Array.isArray(g.nodes) || g.nodes.length === 0) return;
      liveGraph = fromEngineGraph(g);
      if (cur && cur.mode === 'files') { cur = null; switchMode('files'); }
    } catch {
      /* sem motor / sem repo analisado — segue no codemap */
    }
  }

  /* arranca no modo Arquivos */
  switchMode('files');
  maybeLoadLiveGraph();
  cleanups.push(() => { if (view) view.destroy(); });

  return page;
}
