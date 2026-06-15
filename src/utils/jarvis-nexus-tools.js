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
import { analyze, search, nexusContext, nexusImpact, nexusPath, nexusRename } from './git-nexus-engine.js';
import codemap from '../data/codemap.json';

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
