/**
 * jarvis-nexus-tools — o Git Nexus como SKILLS do JARVIS (issue #231, inspirado
 * no OpenJarvis: o agente descobre e chama ferramentas de um catálogo).
 *
 * Registra 5 ferramentas que rodam sobre o grafo de código do Baluarte
 * (codemap.json), via `registerTool`. Assim o operador pergunta em linguagem
 * natural — "o que quebra se eu mexer no helpers.js?" — e o JARVIS chama
 * `nexus_impact` e responde com o nível de risco, tudo em JS puro (sem o
 * servidor 4747; no launcher o motor real é outra história).
 *
 * O grafo é montado uma vez (lazy) e reusado entre chamadas.
 */
import { registerTool } from './jarvis-tools.js';
import { analyze, buildGraph, search, nexusContext, nexusImpact, nexusPath, nexusRename } from './git-nexus-engine.js';
import codemap from '../data/codemap.json';
import codemapSymbols from '../data/codemap-symbols.json';

let _graph = null;
function graph() {
  if (!_graph) _graph = analyze(codemap).graph;
  return _graph;
}

/** Resolve um alvo textual ("helpers.js") num nó do grafo, preferindo o match mais exato. */
function resolve(target) {
  const q = String(target || '').toLowerCase().trim();
  if (!q) return null;
  const hits = search(graph(), q);
  if (!hits.length) return null;
  return (
    hits.find((n) => n.label.toLowerCase() === q) ||
    hits.find((n) => n.label.toLowerCase() === q + '.js') ||
    hits.find((n) => n.label.toLowerCase().startsWith(q)) ||
    hits[0]
  );
}

const label = (id) => graph().index.get(id)?.label || id;
const notFound = (t) => ({ ok: false, error: `não encontrei "${t}" no grafo de código do Baluarte` });

/** Registra as 5 skills do Git Nexus no catálogo do JARVIS. Idempotente. */
export function registerNexusTools() {
  registerTool({
    name: 'nexus_impact',
    description:
      'Raio de explosão de MUDAR um arquivo do código do Baluarte: quantos e quais arquivos quebram se você alterar X, com nível de risco (BAIXO→CRÍTICO). Use quando o operador perguntar "o que quebra / é afetado se eu mexer em X", "é seguro mudar X", "qual o impacto de X".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Arquivo ou módulo, ex: helpers.js' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolve(target);
      if (!node) return notFound(target);
      const { affected, direct, risk } = nexusImpact(graph(), node.id, 'up');
      return {
        ok: true,
        alvo: node.id,
        risco: risk.label,
        afetados: affected.length,
        diretos: direct.length,
        principais_afetados: affected.slice(0, 8).map(label)
      };
    }
  });

  registerTool({
    name: 'nexus_context',
    description:
      'Contexto de um arquivo no código do Baluarte: quem o importa (quem depende dele) e o que ele importa. Use pra "quem usa X", "do que X depende", "me explica o X no grafo".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Arquivo, ex: router.js' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolve(target);
      if (!node) return notFound(target);
      const ctx = nexusContext(graph(), node.id);
      return {
        ok: true,
        alvo: node.id,
        importado_por: ctx.callers.map(label).slice(0, 12),
        importa: ctx.callees.map(label).slice(0, 12),
        total_importado_por: ctx.callers.length,
        total_importa: ctx.callees.length
      };
    }
  });

  registerTool({
    name: 'nexus_path',
    description:
      'Menor caminho de imports/dependências entre dois arquivos do Baluarte (A → … → B). Use pra "como X chega em Y", "qual a ligação entre X e Y".',
    input_schema: {
      type: 'object',
      properties: { from: { type: 'string', description: 'arquivo de origem' }, to: { type: 'string', description: 'arquivo de destino' } },
      required: ['from', 'to']
    },
    run: ({ from, to } = {}) => {
      const a = resolve(from);
      if (!a) return notFound(from);
      const b = resolve(to);
      if (!b) return notFound(to);
      const path = nexusPath(graph(), a.id, b.id);
      if (!path) return { ok: true, caminho: null, msg: `não há caminho dirigido de ${label(a.id)} até ${label(b.id)}` };
      return { ok: true, caminho: path.map(label), saltos: path.length - 1 };
    }
  });

  registerTool({
    name: 'nexus_deps',
    description:
      'Dependências de um arquivo do Baluarte: tudo que ele puxa, direta e transitivamente. Use pra "do que X depende", "o que X precisa pra funcionar".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Arquivo, ex: git-nexus.js' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolve(target);
      if (!node) return notFound(target);
      const { affected, direct } = nexusImpact(graph(), node.id, 'down');
      return {
        ok: true,
        alvo: node.id,
        depende_de: affected.length,
        diretas: direct.map(label),
        principais: affected.slice(0, 8).map(label)
      };
    }
  });

  registerTool({
    name: 'nexus_rename',
    description:
      'Quantos usos um rename SEGURO de um arquivo do Baluarte tocaria — entende o grafo, não é find-and-replace. Use pra "quantos lugares mudam se eu renomear X", "é seguro renomear X".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Arquivo, ex: helpers.js' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolve(target);
      if (!node) return notFound(target);
      const uses = nexusRename(graph(), node.id);
      return { ok: true, alvo: node.id, usos_a_tocar: uses.length, arquivos: uses.map(label).slice(0, 15) };
    }
  });
}

registerNexusTools();

/* ==============================================================================
 *  NÍVEL DE FUNÇÃO (#231) — as mesmas perguntas, agora sobre o GRAFO DE CHAMADAS
 *  (codemap-symbols.json: 1137 funções / 2457 chamadas), não só entre arquivos.
 *  Reusa o mesmo motor: a forma de nó/aresta dos símbolos é a mesma do codemap,
 *  então `buildGraph` monta o grafo de chamadas direto. Cada função vira um nó
 *  com id "arquivo::nome".
 * ============================================================================ */
let _symGraph = null;
function symGraph() {
  if (!_symGraph) _symGraph = buildGraph(codemapSymbols);
  return _symGraph;
}

/** Resolve um alvo textual numa função do grafo. Aceita "nome", "arquivo::nome"
 *  ou um trecho do id; em nome ambíguo, escolhe a mais chamada. */
function resolveFn(target) {
  const q = String(target || '').trim();
  if (!q) return null;
  const G = symGraph();
  if (G.index.has(q)) return G.index.get(q);
  const ql = q.toLowerCase();
  if (q.includes('::')) {
    const hit = G.nodes.find((n) => n.id.toLowerCase() === ql)
      || G.nodes.find((n) => n.id.toLowerCase().endsWith(ql));
    if (hit) return hit;
  }
  const exact = G.nodes.filter((n) => n.label.toLowerCase() === ql);
  if (exact.length) return exact.slice().sort((a, b) => b.importedBy - a.importedBy)[0];
  const hits = search(G, q);
  return hits.length ? hits[0] : null;
}

/** Outras funções com o MESMO nome (pra avisar de ambiguidade na resposta). */
function fnAlt(target, picked) {
  const ql = String(target || '').toLowerCase();
  const same = symGraph().nodes.filter((n) => n.label.toLowerCase() === ql && n.id !== picked.id);
  return same.length ? same.slice(0, 4).map((n) => n.id) : null;
}

/** O id de uma função é "arquivo::nome" — o motor não guarda `file`, então
 *  derivamos o arquivo do próprio id. */
const fileOf = (id) => String(id).split('::')[0];
const notFoundFn = (t) => ({ ok: false, error: `não encontrei a função "${t}" no grafo de chamadas do Baluarte` });
const ambig = (target, node) => {
  const alt = fnAlt(target, node);
  return alt ? { obs: `nome ambíguo — usei ${node.id}. Outras com o mesmo nome: ${alt.join(', ')}` } : {};
};

/** Registra as skills de NÍVEL DE FUNÇÃO no catálogo do JARVIS. Idempotente. */
export function registerNexusFnTools() {
  registerTool({
    name: 'nexus_fn_impact',
    description:
      'Raio de explosão de mudar uma FUNÇÃO do Baluarte: quantas e quais funções quebram se você alterar X (chamadores diretos e transitivos), com nível de risco (BAIXO→CRÍTICO). Use pra "o que quebra se eu mexer na função X", "é seguro mudar a função X", "qual o impacto da função X". Diferente de nexus_impact, que é por ARQUIVO.',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Nome da função, ex: h, renderPage ou utils/helpers.js::h' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolveFn(target);
      if (!node) return notFoundFn(target);
      const { affected, direct, risk } = nexusImpact(symGraph(), node.id, 'up');
      return {
        ok: true,
        alvo: node.id,
        funcao: node.label,
        arquivo: fileOf(node.id),
        risco: risk.label,
        funcoes_afetadas: affected.length,
        diretas: direct.length,
        principais_afetadas: affected.slice(0, 8),
        ...ambig(target, node)
      };
    }
  });

  registerTool({
    name: 'nexus_fn_context',
    description:
      'Contexto de uma FUNÇÃO no Baluarte: quem a chama e o que ela chama. Use pra "quem chama a função X", "o que a função X usa", "me explica a função X no grafo de chamadas".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Nome da função, ex: renderPage' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolveFn(target);
      if (!node) return notFoundFn(target);
      const ctx = nexusContext(symGraph(), node.id);
      return {
        ok: true,
        alvo: node.id,
        funcao: node.label,
        arquivo: fileOf(node.id),
        chamada_por: ctx.callers.slice(0, 12),
        chama: ctx.callees.slice(0, 12),
        total_chamada_por: ctx.callers.length,
        total_chama: ctx.callees.length,
        ...ambig(target, node)
      };
    }
  });

  registerTool({
    name: 'nexus_fn_path',
    description:
      'Menor caminho de CHAMADAS entre duas funções do Baluarte (A → … → B). Use pra "como a função A chega na B", "a função A chama a B (direta ou indiretamente)?", "qual a cadeia de chamadas de A até B".',
    input_schema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'função de origem' },
        to: { type: 'string', description: 'função de destino' }
      },
      required: ['from', 'to']
    },
    run: ({ from, to } = {}) => {
      const a = resolveFn(from);
      if (!a) return notFoundFn(from);
      const b = resolveFn(to);
      if (!b) return notFoundFn(to);
      const path = nexusPath(symGraph(), a.id, b.id);
      if (!path) return { ok: true, caminho: null, msg: `${a.id} não chega em ${b.id} pela cadeia de chamadas` };
      return { ok: true, caminho: path, saltos: path.length - 1 };
    }
  });

  registerTool({
    name: 'nexus_fn_deps',
    description:
      'O que uma FUNÇÃO chama, direta e transitivamente. Use pra "o que a função X chama", "de quais funções a X depende", "o que a X precisa pra rodar".',
    input_schema: {
      type: 'object',
      properties: { target: { type: 'string', description: 'Nome da função, ex: boot' } },
      required: ['target']
    },
    run: ({ target } = {}) => {
      const node = resolveFn(target);
      if (!node) return notFoundFn(target);
      const { affected, direct } = nexusImpact(symGraph(), node.id, 'down');
      return {
        ok: true,
        alvo: node.id,
        funcao: node.label,
        chama_total: affected.length,
        diretas: direct,
        principais: affected.slice(0, 8),
        ...ambig(target, node)
      };
    }
  });

  registerTool({
    name: 'nexus_fn_hot',
    description:
      'As funções mais chamadas do Baluarte (hotspots/pontos quentes do código) — no projeto todo ou dentro de um arquivo. Use pra "quais as funções mais usadas", "os pontos quentes do código", "funções mais chamadas em X".',
    input_schema: {
      type: 'object',
      properties: {
        file: { type: 'string', description: '(opcional) filtra por arquivo, ex: utils/helpers.js' },
        limit: { type: 'number', description: '(opcional) quantas retornar (padrão 10, máx 30)' }
      }
    },
    run: ({ file, limit } = {}) => {
      const G = symGraph();
      const n = Math.max(1, Math.min(30, limit || 10));
      let nodes = G.nodes;
      if (file) {
        const f = String(file).toLowerCase();
        nodes = nodes.filter((x) => fileOf(x.id).toLowerCase().includes(f));
        if (!nodes.length) return { ok: false, error: `nenhuma função encontrada no arquivo "${file}"` };
      }
      const top = nodes.slice().sort((a, b) => b.importedBy - a.importedBy).slice(0, n);
      return {
        ok: true,
        escopo: file || 'projeto todo',
        total_funcoes: nodes.length,
        mais_chamadas: top.map((x) => ({ funcao: x.id, chamada_por: x.importedBy }))
      };
    }
  });
}

registerNexusFnTools();
