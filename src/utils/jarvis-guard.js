/**
 * JARVIS Guard — segurança do modo Agente (inspirado no Sponsio).
 *
 * Toda chamada de ferramenta do agente passa por uma avaliação de política
 * ANTES de executar: classifica o risco (safe / caution / block), bloqueia
 * ações perigosas e registra cada decisão. Defesa em profundidade — mesmo as
 * skills já rodam num sandbox, o guard é uma segunda barreira independente.
 *
 * 100% local. Ligado por padrão; pode ser desligado em /seguranca.
 */

import { storage } from '../core/storage.js';

const ENABLED_KEY = 'jarvis:guard';
const LOG_KEY = 'jarvis:guardlog';
const MAX_LOG = 80;

/* Padrões perigosos procurados em QUALQUER argumento de ferramenta. */
const DANGER = [
  { re: /\b(eval|new\s+Function|Function\s*\()/i, why: 'execução dinâmica de código' },
  { re: /\b(fetch|XMLHttpRequest|sendBeacon|WebSocket)\b/i, why: 'acesso à rede' },
  { re: /\b(document|window|localStorage|sessionStorage|indexedDB)\b/i, why: 'acesso ao DOM/armazenamento' },
  { re: /while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/i, why: 'laço potencialmente infinito' },
  { re: /\b(process|child_process|require)\b|fs\.|exec\s*\(/i, why: 'acesso ao sistema' },
  { re: /(api[_-]?key|secret|senha|password|token)\s*[:=]/i, why: 'possível credencial em texto claro' }
];

/* Nível-base de risco por ferramenta built-in. */
export const TOOL_LEVEL = {
  navigate: 'safe', search_arsenal: 'safe', get_equipe: 'safe', get_arco: 'safe',
  calculate: 'safe', system_status: 'safe', read_site_state: 'safe', recall_memory: 'safe',
  list_skills: 'safe', set_color: 'safe',
  open_editor: 'caution', create_skill: 'caution', delete_skill: 'caution'
};

export function guardEnabled() { return storage.get(ENABLED_KEY, true); }
export function setGuardEnabled(v) { storage.set(ENABLED_KEY, !!v); }

function scan(input) {
  const text = JSON.stringify(input || {});
  for (const d of DANGER) if (d.re.test(text)) return d.why;
  return null;
}

/**
 * Avalia uma chamada de ferramenta.
 * @returns {{level:'safe'|'caution'|'block', reason:string, tool:string}}
 */
export function evaluateToolCall(name, input) {
  /* navegação só para rotas internas */
  if (name === 'navigate') {
    const r = String((input && input.route) || '');
    if (!r.startsWith('/') || r.startsWith('//')) {
      return { level: 'block', reason: 'rota externa/inválida não permitida', tool: name };
    }
  }

  let level = TOOL_LEVEL[name] || 'caution'; /* desconhecidas/skills → caution */
  const danger = scan(input);
  if (danger) {
    /* criar código ou abrir editor com padrão perigoso → bloqueia */
    if (name === 'create_skill' || name === 'open_editor') {
      return { level: 'block', reason: danger, tool: name };
    }
    level = 'caution';
    return { level, reason: danger, tool: name };
  }
  return { level, reason: level === 'safe' ? 'leitura/ação benigna' : 'ação sensível — permitida e registrada', tool: name };
}

export function logDecision(entry) {
  const log = storage.get(LOG_KEY, []);
  log.unshift({ tool: entry.tool, level: entry.level, reason: entry.reason, ts: Date.now() });
  storage.set(LOG_KEY, log.slice(0, MAX_LOG));
}
export function getGuardLog() { return storage.get(LOG_KEY, []); }
export function clearGuardLog() { storage.set(LOG_KEY, []); }

/** Estatísticas do log (para a página). */
export function guardStats() {
  const log = getGuardLog();
  const by = { safe: 0, caution: 0, block: 0 };
  for (const e of log) by[e.level] = (by[e.level] || 0) + 1;
  return { total: log.length, ...by };
}
