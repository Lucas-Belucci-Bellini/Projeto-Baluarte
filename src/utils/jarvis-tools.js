/**
 * JARVIS Tools (Fase 20) — ferramentas do modo Agente.
 *
 * Define o schema das ferramentas (formato Claude tool-use) e a
 * implementação local de cada uma. O agente chama estas funções
 * para executar ações reais dentro do Baluarte.
 */

import { router } from '../core/router.js';
import { ARSENAL, search as searchArsenal, TOTAL } from '../data/arsenal.js';
import { EQUIPES, findEquipe, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, findArc, ARCS_TOTAL } from '../data/cronicas.js';
import { storage } from '../core/storage.js';
import { randHex } from './helpers.js';
import { evaluate } from './calc-engine.js';
import { getStatusSnapshot } from './baluarte-status.ts';
import { VERSION } from '../data/version.js';
import { recall, getMemoryCache } from './jarvis-recall.js';
import {
  createSkill, deleteSkill, listSkillSummaries, loadSkills, runSkill
} from './jarvis-skills.js';
import { guardEnabled, evaluateToolCall, logDecision } from './jarvis-guard.js';
import { exigir, PermissionError } from '../core/permissions.js';
/* O mapa tool→permissão mora à parte para poder ser testado sem navegador
 * (este arquivo importa JSON via bundler e não abre em Node puro). */
import { permissaoDe } from './jarvis-permissoes.ts';

/* ===== Schema das ferramentas (formato Claude API) ===== */

export const TOOL_SCHEMAS = [
  {
    name: 'navigate',
    description: 'Navega para uma página do Baluarte. Use quando o operador pedir para abrir/ir a alguma seção.',
    input_schema: {
      type: 'object',
      properties: {
        route: {
          type: 'string',
          description: 'Rota destino. Opções: /home, /ferramentas, /editor, /terminal, /calc-cientifica, /calc-numerica, /calculadoras, /tabela-verdade, /cripto, /esteganografia, /graficos, /simbolos, /color-studio, /regex, /qr-studio, /json-studio, /git-helper, /arsenal, /biblioteca, /elites, /dossie, /ciberseg, /academia, /robotica, /fft, /radio, /musicas, /media, /videos, /tv, /jogos, /universo, /tabela-periodica, /modpack, /guia-pc, /logic-sim, /portas, /morse, /memes, /filmes, /perfil, /economia, /dolar, /jarvis, /radar, /geo, /find, /triangulacao, /sobre'
        }
      },
      required: ['route']
    }
  },
  {
    name: 'search_arsenal',
    description: 'Busca armas/veículos no Arsenal do Baluarte por nome, categoria ou calibre.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termo de busca' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_equipe',
    description: 'Retorna a ficha de uma equipe de elite do Baluarte pelo código (ALFA, BRAVO, ..., ZULU).',
    input_schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Código da equipe (ex: ALFA)' }
      },
      required: ['code']
    }
  },
  {
    name: 'get_arco',
    description: 'Retorna informações de um arco das Crônicas da Baluarte pelo código.',
    input_schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Código do arco (ex: ALFA, ZULU)' }
      },
      required: ['code']
    }
  },
  {
    name: 'calculate',
    description: 'Avalia uma expressão matemática (suporta funções: sin, cos, sqrt, log, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        expression: { type: 'string', description: 'Expressão a calcular, ex: 2 + 3 * sqrt(16)' }
      },
      required: ['expression']
    }
  },
  {
    name: 'open_editor',
    description: 'Abre o Editor de Código com um snippet pré-carregado numa nova aba.',
    input_schema: {
      type: 'object',
      properties: {
        code: { type: 'string', description: 'Código a inserir' },
        lang: { type: 'string', description: 'Linguagem (javascript, python, rust, etc.)' }
      },
      required: ['code', 'lang']
    }
  },
  {
    name: 'system_status',
    description: 'Retorna o status atual do sistema Baluarte (fase, contagens, módulos).',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'read_site_state',
    description: 'Lê um snapshot (somente leitura) do estado vivo do site: página ativa e resumos publicados pelas ferramentas abertas (editor, color studio, logic sim…). Use para diagnosticar sem o operador precisar descrever o que está na tela.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'set_color',
    description: 'Define a cor ativa do Color Studio e abre a ferramenta. Use quando o operador pedir para ver, usar ou analisar uma cor específica (hex).',
    input_schema: {
      type: 'object',
      properties: {
        hex: { type: 'string', description: 'Cor em hexadecimal, ex: #d4a24e' }
      },
      required: ['hex']
    }
  },
  {
    name: 'recall_memory',
    description: 'Busca na memória de conversas ANTERIORES do operador (resumos por sessão). Use quando ele se referir a algo já discutido ("aquilo que falamos", "o que decidimos sobre X") para recuperar o contexto.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'O assunto a relembrar' }
      },
      required: ['query']
    }
  },
  {
    name: 'create_skill',
    description: 'Cria uma NOVA habilidade (skill) reutilizável e a salva permanentemente — fica disponível como ferramenta nesta e nas próximas conversas. Use quando precisar de uma capacidade repetível que ainda não existe (ex: conversão, fórmula do universo Baluarte, relatório). A skill é JS PURO: recebe `input` (os argumentos) e `sdk` (capacidades seguras) e usa `return` para devolver o resultado. sdk disponível: sdk.calc(expr), sdk.arsenal(query), sdk.equipe(code), sdk.equipes(), sdk.arco(code), sdk.arcos(), sdk.log(...), sdk.now(). PROIBIDO (não compila): rede (fetch), DOM (document/window), storage, eval/Function, timers, async/await. Depois de criar, CHAME a skill para usá-la.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Identificador snake_case, 3–40 chars, começa com letra. Ex: converter_moeda' },
        description: { type: 'string', description: 'O que a skill faz e quando usá-la (vira a descrição da ferramenta).' },
        input_schema: { type: 'object', description: 'JSON Schema de objeto com as properties (argumentos) da skill. Ex: { "type":"object", "properties": { "valor": {"type":"number"} }, "required": ["valor"] }' },
        code: { type: 'string', description: 'Corpo JS da função (input, sdk) => resultado. Ex: const taxa = 5.1; return { reais: input.valor * taxa };' }
      },
      required: ['name', 'description', 'code']
    }
  },
  {
    name: 'list_skills',
    description: 'Lista as habilidades (skills) que o JARVIS já aprendeu, com nome, descrição e quantas vezes foram usadas.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'delete_skill',
    description: 'Apaga permanentemente uma skill aprendida, pelo nome.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome da skill a apagar' }
      },
      required: ['name']
    }
  }
];

/** Nomes reservados (ferramentas built-in): não podem virar nome de skill. */
const BUILTIN_NAMES = TOOL_SCHEMAS.map((t) => t.name);

/* ===== Implementação ===== */

const IMPLEMENTATIONS = {
  navigate({ route }) {
    const valid = String(route || '').startsWith('/');
    if (!valid) return { ok: false, error: 'rota inválida' };
    setTimeout(() => router.navigate(route), 400);
    return { ok: true, navigated: route };
  },

  search_arsenal({ query }) {
    const results = searchArsenal(query).slice(0, 8);
    return {
      ok: true,
      total: results.length,
      results: results.map((w) => ({
        name: w.name, category: w.category, origin: w.origin,
        caliber: w.caliber, tier: w.tier, equipe: w.equipe
      }))
    };
  },

  get_equipe({ code }) {
    const eq = findEquipe(String(code || '').toUpperCase());
    if (!eq) return { ok: false, error: `equipe ${code} não encontrada` };
    return {
      ok: true,
      equipe: {
        code: eq.code, name: eq.name, specialty: eq.specialty,
        leader: eq.leader, members: eq.members, motto: eq.motto,
        status: eq.status, description: eq.description
      }
    };
  },

  get_arco({ code }) {
    const arc = ARCS.find((a) => a.code === String(code || '').toUpperCase());
    if (!arc) return { ok: false, error: `arco ${code} não encontrado` };
    return {
      ok: true,
      arco: {
        code: arc.code, title: arc.title, universe: arc.universe,
        synopsis: arc.synopsis, chapters: arc.chapters.length
      }
    };
  },

  calculate({ expression }) {
    const r = evaluate(expression);
    if (r.error) return { ok: false, error: r.error };
    return { ok: true, expression, result: r.value };
  },

  open_editor({ code, lang }) {
    const editorState = storage.get('editor:state') || { tabs: [], activeId: null };
    if (!Array.isArray(editorState.tabs)) editorState.tabs = [];
    const tab = {
      id: 'tab_' + randHex(4),
      name: `jarvis.${lang === 'python' ? 'py' : lang === 'rust' ? 'rs' : 'js'}`,
      lang: lang || 'javascript',
      content: code || ''
    };
    editorState.tabs.push(tab);
    editorState.activeId = tab.id;
    storage.set('editor:state', editorState);
    setTimeout(() => router.navigate('/editor'), 400);
    return { ok: true, opened: tab.name };
  },

  system_status() {
    return {
      ok: true,
      status: {
        version: `v${VERSION}`,
        arsenal: TOTAL,
        equipes: TOTAL_EQUIPES,
        arcos: ARCS_TOTAL,
        nucleo: 'ONLINE'
      }
    };
  },

  read_site_state() {
    return { ok: true, state: getStatusSnapshot() };
  },

  set_color({ hex }) {
    const m = /^#?([0-9a-fA-F]{6})$/.exec(String(hex || '').trim());
    if (!m) return { ok: false, error: 'hex inválido (use #rrggbb)' };
    const norm = '#' + m[1].toLowerCase();
    storage.set('color-studio:color', norm);
    setTimeout(() => router.navigate('/color-studio'), 400);
    return { ok: true, color: norm };
  },

  recall_memory({ query }) {
    const hits = recall(query || '', getMemoryCache(), 4);
    if (!hits.length) return { ok: true, total: 0, memories: [], note: 'nenhuma conversa anterior relevante' };
    return { ok: true, total: hits.length, memories: hits.map((h) => h.text) };
  },

  create_skill({ name, description, input_schema, code }) {
    const res = createSkill({ name, description, input_schema, code }, { reserved: BUILTIN_NAMES });
    if (!res.ok) return { ok: false, error: res.error };
    registerSkillAsTool(res.skill);
    return {
      ok: true,
      [res.updated ? 'updated' : 'created']: res.skill.name,
      note: 'Skill salva e registrada. Já pode chamá-la como ferramenta agora.'
    };
  },

  list_skills() {
    const skills = listSkillSummaries();
    return { ok: true, total: skills.length, skills };
  },

  delete_skill({ name }) {
    const removed = removeSkill(String(name || ''));
    return removed
      ? { ok: true, deleted: name }
      : { ok: false, error: `skill "${name}" não encontrada` };
  }
};

/* ===== Catálogo central extensível (doc 06) =====
 * Os built-ins acima formam o catálogo base. Outras partes do site podem
 * registrar novas ferramentas em runtime via registerTool() — elas passam a
 * ficar automaticamente disponíveis para o agente, sem editar este arquivo. */

const dynamicTools = new Map();

/**
 * Registra uma ferramenta nova no catálogo do agente.
 *
 * `permissao` é opcional mas recomendada: sem ela a ferramenta cai no padrão
 * fechado `jarvis.skills.executar` (ver `permissaoDe`). Declare uma permissão do
 * catálogo de `src/core/politica.js` que descreva o que a tool realmente faz.
 *
 * @param {{name:string, description:string, input_schema:object, run:Function, permissao?:string}} tool
 */
export function registerTool(tool) {
  if (!tool || !tool.name || typeof tool.run !== 'function') return false;
  dynamicTools.set(tool.name, tool);
  return true;
}

/** Schemas (formato Claude) de TODAS as ferramentas: built-ins + registradas. */
export function getToolSchemas() {
  initSkills();
  const extra = [...dynamicTools.values()].map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema || { type: 'object', properties: {} }
  }));
  return [...TOOL_SCHEMAS, ...extra];
}

/**
 * Executa uma ferramenta pelo nome (built-in ou registrada).
 * @returns {object} resultado serializável
 */
export function runTool(name, input) {
  const dinamica = dynamicTools.get(name);
  const impl = IMPLEMENTATIONS[name] || dinamica?.run;
  if (!impl) return { ok: false, error: `ferramenta desconhecida: ${name}` };

  /* Fronteira de permissão (#420) — ANTES de tudo, inclusive do guard.
   * O guard (Sponsio) julga o CONTEÚDO da chamada; a permissão julga se essa
   * chamada podia sequer ser tentada. Perguntar "esse comando é perigoso?"
   * sobre uma ação que nem devia estar disponível é responder tarde. */
  const permissao = permissaoDe(name, dinamica);
  try {
    exigir(permissao, { alvo: name });
  } catch (err) {
    if (!(err instanceof PermissionError)) throw err;
    /* Erro acionável: sem dizer QUAL permissão falta e ONDE liberar, o operador
     * só vê a ferramenta parar de funcionar sem explicação. */
    return {
      ok: false,
      negado: true,
      permissao,
      error: err.code === 'desconhecida'
        ? `🔒 A ferramenta "${name}" exige a permissão "${permissao}", que não está declarada em src/core/politica.js.`
        : `🔒 Permissão "${permissao}" não concedida. Libere em /diagnostico para usar "${name}".`
    };
  }

  /* Segurança do agente (Sponsio): avalia e registra antes de executar. */
  if (guardEnabled()) {
    const verdict = evaluateToolCall(name, input);
    logDecision(verdict);
    if (verdict.level === 'block') {
      return { ok: false, blocked: true, error: `🛡️ Bloqueado pela segurança do agente: ${verdict.reason}` };
    }
  }
  try {
    return impl(input || {});
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/* ===== Skills auto-criadas (jarvis-skills.js) =====
 * As skills que o agente cria viram ferramentas dinâmicas: persistidas no
 * storage e re-registradas no boot, ficam disponíveis nas próximas conversas. */

/** Remove uma ferramenta dinâmica do catálogo (usado ao apagar skills). */
export function unregisterTool(name) {
  return dynamicTools.delete(name);
}

/** Registra uma skill persistida como ferramenta dinâmica do agente. */
export function registerSkillAsTool(skill) {
  return registerTool({
    name: skill.name,
    description: skill.description + ' · [skill aprendida]',
    input_schema: skill.input_schema || { type: 'object', properties: {} },
    run: (input) => runSkill(skill, input)
  });
}

let skillsInited = false;
/** Carrega e registra as skills salvas. Idempotente — seguro chamar várias vezes. */
export function initSkills() {
  if (skillsInited) return;
  skillsInited = true;
  for (const skill of loadSkills()) registerSkillAsTool(skill);
}

/** Apaga uma skill do storage e desregistra a ferramenta. @returns {boolean} */
export function removeSkill(name) {
  const ok = deleteSkill(name);
  if (ok) unregisterTool(name);
  return ok;
}
