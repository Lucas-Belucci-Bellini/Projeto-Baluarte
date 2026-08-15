/**
 * Página /git-nexus — núcleo unificado de código.
 *
 * A página continua consumindo o motor e a visualização JavaScript existentes
 * por contratos explícitos: arquivos, funções, comunidades, impacto, console,
 * memória ligada e grafo nativo opcional do Launcher.
 */

import { h, empty } from '../utils/helpers.js';
import type { HChild } from '../utils/helpers.js';
import { router } from '../core/router.js';
import {
  analyze,
  symbolSubmap,
  fileSymbolGraph,
  impactOf,
  dependenciesOf,
  search,
  nexusContext,
  nexusImpact,
  nexusPath,
  nexusRename,
  fromEngineGraph,
} from '../utils/git-nexus-engine.js';
import type {
  NexusCodemap,
  NexusGraph,
  NexusNode,
  NexusAnalysis,
  NexusCommunity,
  NexusSymbolMap,
} from '../utils/git-nexus-engine.js';
import { createGraphView3D } from '../utils/git-nexus-graph3d.js';
import type { GraphView3D } from '../utils/git-nexus-graph3d.js';
import { memoryStats, codeMemoryCounts } from '../utils/jarvis-brain.js';
import codemapJson from '../data/codemap.json';
import symbolmapJson from '../data/codemap-symbols.json';

const PALETTE = ['#d4a24e', '#e8c07a', '#7ee787', '#ffaa00', '#9d7bff', '#ff6b6b', '#66ddff', '#ffd76b'];
const FUNCTION_CAP = 240;
const CODEMAP = codemapJson as unknown as NexusCodemap;
const SYMBOLMAP = symbolmapJson as unknown as NexusSymbolMap;

type NexusMode = 'files' | 'functions' | 'file-functions';

interface CurrentAnalysis extends NexusAnalysis {
  readonly mode: NexusMode;
  readonly focusFile: string | null;
  readonly focusIds: ReadonlySet<string> | null;
  readonly rawById: Map<string, NexusNode>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function detectNativeEngine(element: HTMLDivElement): Promise<void> {
  const bridge = typeof window !== 'undefined' ? window.baluarte : undefined;
  if (!bridge || bridge.native !== true || typeof bridge.invoke !== 'function') return;
  let value: unknown;
  try { value = await bridge.invoke('nexus:status'); } catch { return; }
  if (!isRecord(value)) return;
  element.style.display = '';
  if (value.available === true) {
    element.className = 'gn-engine is-live';
    element.append(
      h('span', { className: 'gn-engine__dot' }),
      h('span', null, 'Motor real do GitNexus conectado'),
      h('span', { className: 'gn-engine__v u-mono' }, typeof value.version === 'string' ? `v${value.version}` : 'ao vivo'),
    );
  } else {
    element.className = 'gn-engine is-off';
    element.append(
      h('span', { className: 'gn-engine__dot' }),
      h('span', null, 'Motor local indisponível — usando o mapa de build.'),
      h('span', { className: 'gn-engine__hint u-mono' }, 'gitnexus serve'),
    );
  }
}

export function gitNexusPage(): HTMLDivElement {
  const cleanups: Array<() => void> = [];
  const codeMemory = codeMemoryCounts();
  const memoryTotal = memoryStats().total;
  let current: CurrentAnalysis | null = null;
  let view: GraphView3D | null = null;
  let liveGraph: NexusCodemap | null = null;
  const page = h('div', { className: 'page-gitnexus' });

  page.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'IA & JARVIS'),
    h('span', null, '›'), h('span', null, 'GIT NEXUS'),
  ),
  h('h1', { className: 'page-header__title' }, '🔗 Git Nexus'),
  h('p', { className: 'page-header__description' },
    'Núcleo de código em ', h('span', { className: 'u-text-cyan' }, '3D'),
    ' — funde Raio-X + Memória + Segundo Cérebro + Mini-LLM. Comunidades, impacto e centralidade. ',
    'Alterne entre o grafo de ', h('span', { className: 'u-text-cyan' }, 'arquivos'),
    ' e o de ', h('span', { className: 'u-text-cyan' }, 'funções'), ' (chamadas).',
  ),
  ));

  const engineBadge = h('div', { className: 'gn-engine', style: { display: 'none' } });
  page.appendChild(engineBadge);
  void detectNativeEngine(engineBadge);

  const functionsByFile: Record<string, number> = {};
  SYMBOLMAP.nodes.forEach((node) => { functionsByFile[node.file ?? ''] = (functionsByFile[node.file ?? ''] ?? 0) + 1; });
  const filesTab = h('button', { className: 'gn-mode is-active', onclick: () => switchMode('files') }, '📁 Arquivos');
  const functionsTab = h('button', { className: 'gn-mode', onclick: () => switchMode('functions') }, 'ƒ Funções');
  const focusCrumb = h('span', { className: 'gn-focus', style: { display: 'none' } });
  page.appendChild(h('div', { className: 'gn-modes' }, filesTab, functionsTab, focusCrumb,
    h('span', { className: 'gn-modes__hint u-text-muted' }, `${SYMBOLMAP.meta?.symbols ?? 0} funções · ${SYMBOLMAP.meta?.calls ?? 0} chamadas no código`),
  ));

  const metrics = h('div', { className: 'gn-metrics' });
  page.appendChild(metrics);
  const canvas = h('canvas', { className: 'gn-canvas' });
  const side = h('div', { className: 'gn-side' });
  const searchInput = h('input', {
    className: 'gn-search input', type: 'search', placeholder: '🔎 buscar…',
    oninput: () => renderSearch(searchInput.value),
  });
  const searchResults = h('div', { className: 'gn-search__results' });
  const hint = h('div', { className: 'gn-graph__hint u-text-muted' }, '');
  page.appendChild(h('div', { className: 'gn-layout' },
    h('div', { className: 'gn-graph' }, canvas, hint),
    h('div', { className: 'gn-side-wrap' }, h('div', { className: 'gn-searchbox' }, searchInput, searchResults), side),
  ));
  page.appendChild(renderConsole());
  page.appendChild(renderUnifiedFooter());

  function switchMode(mode: NexusMode, options: { readonly fileId?: string } = {}): void {
    const focusFile = options.fileId ?? null;
    if (current?.mode === mode && current.focusFile === focusFile) return;
    filesTab.classList.toggle('is-active', mode === 'files');
    functionsTab.classList.toggle('is-active', mode === 'functions');
    view?.destroy();
    view = null;
    let submap: NexusCodemap;
    if (mode === 'file-functions') submap = fileSymbolGraph(SYMBOLMAP, focusFile ?? '');
    else if (mode === 'functions') submap = symbolSubmap(SYMBOLMAP, FUNCTION_CAP);
    else submap = liveGraph ?? CODEMAP;
    const analysis = analyze(submap);
    current = {
      ...analysis,
      mode,
      focusFile,
      focusIds: submap.focusIds ?? null,
      rawById: new Map(submap.nodes.map((node) => [node.id, node])),
    };
    if (mode === 'file-functions') {
      focusCrumb.style.display = '';
      empty(focusCrumb);
      focusCrumb.append(h('span', null, `ƒ ${focusFile ?? ''}`), h('button', {
        className: 'gn-focus__back', onclick: () => switchMode('files'),
      }, '← arquivos'));
    } else focusCrumb.style.display = 'none';
    renderMetrics();
    hint.textContent = mode === 'file-functions'
      ? `🌐 funções de ${(focusFile ?? '').split('/').pop()} + conexões · gira sozinho · arraste · clique p/ detalhes`
      : mode === 'functions'
        ? `🌐 grafo 3D · ${analysis.graph.nodes.length} principais funções · gira sozinho · arraste · clique p/ ver chamadas e impacto`
        : liveGraph
          ? '🌐 grafo REAL do motor · gira sozinho · arraste · clique num nó p/ ver impacto e dependências'
          : '🌐 grafo 3D · gira sozinho · arraste para girar · clique num nó p/ ver impacto e dependências';
    view = createGraphView3D(canvas, {
      nodes: analysis.graph.nodes,
      edges: analysis.graph.edges,
      comIdx: analysis.comIdx,
      pr: analysis.pr,
      onSelect: (id) => { if (id) renderNodeDetail(id); else renderCommunities(); },
    });
    view.start();
    renderCommunities();
  }

  function renderMetrics(): void {
    if (!current) return;
    empty(metrics);
    if (current.mode === 'file-functions') {
      const own = current.focusIds?.size ?? 0;
      metrics.append(
        metric(own, 'funções no arquivo', true), metric(current.graph.nodes.length - own, 'conectadas'),
        metric(current.graph.edges.length, 'chamadas'), metric(current.communities.length, 'clusters'),
        metric(functionsByFile[current.focusFile ?? ''] ?? own, 'definidas'),
      );
    } else if (current.mode === 'functions') {
      const classes = SYMBOLMAP.meta?.byKind?.class ?? 0;
      metrics.append(
        metric(current.graph.nodes.length, 'funções (top)', true), metric(current.graph.edges.length, 'chamadas'),
        metric(current.communities.length, 'clusters'), metric(classes, 'classes'), metric(SYMBOLMAP.meta?.symbols ?? 0, 'funções totais'),
      );
    } else {
      metrics.append(
        metric(current.metrics.files, 'arquivos', true), metric(current.metrics.imports, 'imports'),
        metric(current.metrics.communities, 'comunidades'), metric(current.metrics.totalLoc.toLocaleString('pt-BR'), 'linhas'),
        metric(memoryTotal, 'memórias ligadas'),
      );
    }
  }

  function metric(value: unknown, label: string, accent = false): HTMLDivElement {
    return h('div', { className: `gn-metric${accent ? ' gn-metric--accent' : ''}` },
      h('div', { className: 'gn-metric__v u-mono' }, String(value)), h('div', { className: 'gn-metric__l' }, label),
    );
  }

  function renderCommunities(): void {
    if (!current) return;
    empty(side);
    const isFunction = current.mode !== 'files';
    side.append(
      h('h3', { className: 'gn-side__title' }, isFunction ? '🧩 Clusters de funções' : '🧩 Comunidades do código'),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 10px' } },
        isFunction ? 'Grupos de funções que se chamam — descobertos sozinho (não-supervisionado).' : 'Clusters de arquivos que se importam entre si, ',
        !isFunction ? h('a', { className: 'u-text-cyan', href: '#/aprendizado' }, 'como o ML da Memória') : false,
        !isFunction ? '.' : false,
      ),
    );
    current.communities.forEach((community, index) => side.appendChild(h('div', { className: 'gn-com' },
      h('span', { className: 'gn-com__dot', style: { background: PALETTE[index % PALETTE.length] } }),
      h('div', null,
        h('div', { className: 'gn-com__head' }, `${community.size} ${isFunction ? 'funções' : 'arquivos'} · ${community.domDir}`),
        h('div', { className: 'gn-com__top u-text-muted' }, community.top.join(' · ')),
      ),
    )));
    side.appendChild(h('div', { className: 'gn-side__metricbox' },
      h('div', { className: 'gn-mini' }, h('b', null, isFunction ? 'Mais chamada: ' : 'Mais central: '), current.metrics.central[0]?.label ?? '—'),
      h('div', { className: 'gn-mini' }, h('b', null, isFunction ? 'Mais chamada (bruto): ' : 'Mais importado: '), current.metrics.mostDepended[0] ? `${current.metrics.mostDepended[0].label} (${current.metrics.mostDepended[0].importedBy}×)` : '—'),
    ));
  }

  function renderNodeDetail(id: string): void {
    if (!current) return;
    const node = current.graph.index.get(id);
    if (!node) { renderCommunities(); return; }
    const raw = current.rawById.get(id);
    const impact = impactOf(current.graph, id);
    const dependencies = dependenciesOf(current.graph, id);
    const isFunction = current.mode !== 'files';
    empty(side);
    side.append(
      h('button', { className: 'gn-back', onclick: () => { view?.select(null); renderCommunities(); } }, '← voltar'),
      h('h3', { className: 'gn-side__title' }, node.label),
      isFunction
        ? h('div', { className: 'gn-file__path u-mono u-text-muted' }, h('span', { className: 'gn-kind' }, raw?.kind ?? 'function'), ' · ', raw?.file ?? '', raw?.line ? ` :${raw.line}` : '')
        : h('div', { className: 'gn-file__path u-mono u-text-muted' }, node.id),
      h('div', { className: 'gn-file__stats' }, stat(node.loc, 'linhas'), stat(node.importedBy, isFunction ? 'chamada por' : 'importado por'), stat(node.imports, isFunction ? 'chama' : 'importa'), stat(`#${(current.comIdx.get(id) ?? 0) + 1}`, 'cluster')),
    );
    side.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, isFunction ? '💥 Impacto — quem quebra se mudar' : '💥 Impacto — quem é afetado se mudar'),
      impact.affected.length ? h('p', { className: 'gn-impact' }, h('b', { className: 'u-text-magenta' }, String(impact.affected.length)), isFunction ? ' função(ões) na cadeia de chamadas ' : ' arquivo(s) afetados ', h('span', { className: 'u-text-muted' }, `(${impact.direct.length} diretos)`)) : h('p', { className: 'u-text-muted' }, isFunction ? 'Ninguém chama esta — folha do call graph.' : 'Nenhum arquivo importa este.'),
      ...impact.direct.slice(0, 8).map(fileChip),
    ));
    side.appendChild(h('div', { className: 'gn-block' },
      h('div', { className: 'gn-block__title' }, isFunction ? '📦 Chama' : '📦 Dependências — o que importa'),
      dependencies.length ? h('div', null, ...dependencies.slice(0, 10).map(fileChip)) : h('p', { className: 'u-text-muted' }, isFunction ? 'Não chama nenhuma função catalogada.' : 'Não importa nenhum módulo interno.'),
    ));
    if (!isFunction) {
      const functionCount = functionsByFile[id] ?? 0;
      if (functionCount > 0) side.appendChild(h('div', { className: 'gn-block' }, h('button', { className: 'gn-drill', onclick: () => switchMode('file-functions', { fileId: id }) }, `ƒ ver as ${functionCount} funções deste arquivo →`)));
      const memoryCount = codeMemory[id] ?? 0;
      side.appendChild(h('div', { className: 'gn-block' },
        h('div', { className: 'gn-block__title' }, '🧠 Memória ligada'),
        memoryCount ? h('p', null, h('b', { className: 'u-text-cyan' }, String(memoryCount)), ' memória(s) citam este arquivo. ', h('a', { className: 'u-text-cyan', href: '#/memoria' }, 'ver →')) : h('p', { className: 'u-text-muted' }, 'Nenhuma conversa citou este arquivo ainda.'),
      ));
    }
  }

  function fileChip(id: string): HTMLSpanElement {
    const node = current?.graph.index.get(id);
    return h('span', { className: 'gn-chip', onclick: () => { view?.select(id); renderNodeDetail(id); } }, node?.label ?? id);
  }

  function stat(value: unknown, label: string): HTMLDivElement {
    return h('div', { className: 'gn-stat' }, h('div', { className: 'gn-stat__v u-mono' }, String(value)), h('div', { className: 'gn-stat__l' }, label));
  }

  function renderSearch(query: string): void {
    if (!current) return;
    empty(searchResults);
    const results = search(current.graph, query);
    if (!query.trim() || !results.length) { searchResults.style.display = 'none'; return; }
    searchResults.style.display = 'block';
    results.slice(0, 10).forEach((node) => {
      const raw = current?.rawById.get(node.id);
      searchResults.appendChild(h('div', { className: 'gn-search__row', onclick: () => {
        searchInput.value = ''; searchResults.style.display = 'none'; view?.select(node.id); renderNodeDetail(node.id);
      } }, h('span', null, node.label), h('span', { className: 'u-text-muted u-mono', style: { fontSize: '11px' } }, current?.mode !== 'files' ? raw?.file ?? '' : node.dir)));
    });
  }

  function resolve(name: string): string | null {
    if (!current) return null;
    const query = name.trim();
    if (!query) return null;
    if (current.graph.index.has(query)) return query;
    const exact = current.graph.nodes.find((node) => node.label.toLowerCase() === query.toLowerCase());
    return exact?.id ?? search(current.graph, query)[0]?.id ?? null;
  }

  function labelOf(id: string): string {
    return current?.graph.index.get(id)?.label ?? id;
  }

  function renderConsole(): HTMLDivElement {
    const output = h('div', { className: 'gn-console__out' });
    const input = h('input', {
      className: 'gn-console__in u-mono', type: 'text', spellcheck: false,
      placeholder: 'context helpers · impact router · impact h down · path A B · rename toast · buscar…',
      onkeydown: (event: Event) => { if (event instanceof KeyboardEvent && event.key === 'Enter') runConsole(input.value); },
    });
    const chip = (id: string): HTMLSpanElement => h('span', { className: 'gn-chip', onclick: () => { view?.select(id); renderNodeDetail(id); } }, labelOf(id));
    const line = (...children: HChild[]): HTMLDivElement => h('div', { className: 'gn-console__line' }, ...children);

    function runConsole(raw: string): void {
      if (!current) return;
      const text = raw.trim();
      if (!text) return;
      const parts = text.split(/\s+/);
      const command = parts[0].toLowerCase();
      const block = h('div', { className: 'gn-console__block' });
      block.appendChild(h('div', { className: 'gn-console__cmd u-mono' }, `› ${text}`));
      const need = (name: string | undefined, label = 'símbolo'): string | null => {
        const id = resolve(name ?? '');
        if (!id) block.appendChild(line(h('span', { className: 'u-text-muted' }, `${label} "${name ?? ''}" não encontrado no grafo atual.`)));
        return id;
      };
      if (command === 'context' || command === 'ctx') {
        const id = need(parts[1]);
        if (id) {
          const context = nexusContext(current.graph, id);
          if (context) {
            const rawNode = current.rawById.get(id);
            block.appendChild(line(h('b', null, labelOf(id)), ' — ', h('span', { className: 'u-text-muted' }, current.mode !== 'files' ? `${rawNode?.kind ?? 'function'} · ${rawNode?.file ?? ''}` : id)));
            block.appendChild(line(h('span', { className: 'u-text-muted' }, `${current.mode !== 'files' ? 'chamada por' : 'importado por'} (${context.callers.length}): `), ...context.callers.slice(0, 12).map(chip)));
            block.appendChild(line(h('span', { className: 'u-text-muted' }, `${current.mode !== 'files' ? 'chama' : 'importa'} (${context.callees.length}): `), ...context.callees.slice(0, 12).map(chip)));
          }
        }
      } else if (command === 'impact') {
        const direction = /down|baixo|usa/.test(parts[2] ?? '') ? 'down' : 'up';
        const id = need(parts[1]);
        if (id) {
          const impact = nexusImpact(current.graph, id, direction);
          block.appendChild(line(h('span', { className: `gn-risk gn-risk--${impact.risk.cls}` }, `risco ${impact.risk.label}`), ' ', h('b', { className: 'u-text-magenta' }, String(impact.affected.length)), direction === 'up' ? ' afetados se mudar ' : ' usados (downstream) ', h('span', { className: 'u-text-muted' }, `· ${impact.direct.length} diretos`)));
          if (impact.direct.length) block.appendChild(line(...impact.direct.slice(0, 14).map(chip)));
        }
      } else if (command === 'path' || command === 'caminho') {
        const from = need(parts[1], 'origem');
        const to = need(parts[2], 'destino');
        if (from && to) {
          const path = nexusPath(current.graph, from, to);
          if (!path) block.appendChild(line(h('span', { className: 'u-text-muted' }, 'sem caminho dirigido de chamadas entre os dois.')));
          else block.appendChild(line(...path.flatMap((id, index) => index ? [h('span', { className: 'u-text-muted' }, ' → '), chip(id)] : [chip(id)])));
        }
      } else if (command === 'rename') {
        const id = need(parts[1]);
        if (id) {
          const uses = nexusRename(current.graph, id);
          block.appendChild(line('renomear ', h('b', null, labelOf(id)), ' tocaria ', h('b', { className: 'u-text-cyan' }, String(uses.length)), ' uso(s):'));
          if (uses.length) block.appendChild(line(...uses.slice(0, 16).map(chip)));
        }
      } else {
        const term = command === 'query' || command === 'q' ? parts.slice(1).join(' ') : text;
        const results = search(current.graph, term);
        if (!results.length) block.appendChild(line(h('span', { className: 'u-text-muted' }, `nada encontrado para "${term}".`)));
        else block.appendChild(line(h('span', { className: 'u-text-muted' }, `${results.length} resultado(s): `), ...results.slice(0, 14).map((node) => chip(node.id))));
      }
      output.insertBefore(block, output.firstChild);
      input.value = '';
    }

    return h('div', { className: 'gn-console' },
      h('div', { className: 'gn-console__head' }, h('h2', { className: 'gn-unified__title' }, '🖥 Console do Nexus'), h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'ferramentas do GitNexus sobre o grafo: context · impact · path · rename · query')),
      input, output,
    );
  }

  function renderUnifiedFooter(): HTMLDivElement {
    const concepts = Object.keys(memoryStats().byConcept).length;
    const linkedFiles = Object.keys(codeMemory).length;
    const tool = (icon: string, title: string, description: string, path: string, statistic: string): HTMLDivElement => h('div', { className: 'gn-tool', onclick: () => router.navigate(path) },
      h('div', { className: 'gn-tool__icon' }, icon), h('div', { className: 'gn-tool__name' }, title), h('div', { className: 'gn-tool__desc u-text-muted' }, description), h('div', { className: 'gn-tool__stat u-text-cyan' }, statistic));
    return h('div', { className: 'gn-unified' },
      h('h2', { className: 'gn-unified__title' }, 'As 4 ferramentas, unificadas aqui'),
      h('div', { className: 'gn-tools' },
        tool('🔬', 'Raio-X do Código', 'O grafo 3D — auto-análise do site.', '/codigo', `${isRecord(CODEMAP.meta) && typeof CODEMAP.meta.files === 'number' ? CODEMAP.meta.files : 0} arquivos`),
        tool('🧠', 'Memória do JARVIS', 'Banco de conversas, ligado aos arquivos.', '/memoria', `${memoryTotal} memórias`),
        tool('🕸️', 'Segundo Cérebro', 'Grafo de conhecimento dos domínios.', '/cerebro', `${concepts} conceitos`),
        tool('📈', 'ML da Memória', 'Aprendizado sobre o que o site sabe.', '/aprendizado', `${linkedFiles} arquivos citados`),
      ),
    );
  }

  async function maybeLoadLiveGraph(): Promise<void> {
    const bridge = typeof window !== 'undefined' ? window.baluarte : undefined;
    if (!bridge || bridge.native !== true || typeof bridge.invoke !== 'function') return;
    try {
      const value = await bridge.invoke('nexus:graph');
      if (!isRecord(value) || !Array.isArray(value.nodes) || value.nodes.length === 0) return;
      liveGraph = fromEngineGraph(value);
      if (current?.mode === 'files') { current = null; switchMode('files'); }
    } catch { /* motor opcional */ }
  }

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!document.contains(page)) {
        cleanups.splice(0).forEach((cleanup) => { try { cleanup(); } catch { /* best-effort */ } });
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  switchMode('files');
  void maybeLoadLiveGraph();
  cleanups.push(() => { view?.destroy(); });
  return page;
}
