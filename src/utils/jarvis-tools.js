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
import { evaluate } from './calc-engine.js';
import { getStatusSnapshot } from './baluarte-status.js';
import { VERSION } from '../data/version.js';

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
          description: 'Rota destino. Opções: /home, /ferramentas, /editor, /terminal, /calc-cientifica, /calc-numerica, /calculadoras, /tabela-verdade, /cripto, /graficos, /simbolos, /regex, /arsenal, /biblioteca, /elites, /ciberseg, /academia, /fft, /media, /videos, /universo, /tabela-periodica, /modpack, /guia-pc, /logic-sim, /perfil, /shadow, /economia'
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
  }
];

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
      id: 'tab_' + Math.random().toString(36).slice(2, 8),
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
  }
};

/**
 * Executa uma ferramenta pelo nome.
 * @returns {object} resultado serializável
 */
export function runTool(name, input) {
  const impl = IMPLEMENTATIONS[name];
  if (!impl) return { ok: false, error: `ferramenta desconhecida: ${name}` };
  try {
    return impl(input || {});
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
