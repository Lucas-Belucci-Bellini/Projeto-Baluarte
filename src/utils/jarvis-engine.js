/**
 * JARVIS Engine (Fase 19) — chat assistente do Baluarte.
 *
 * 2 modos nesta fase (4 modos completos na Fase 20):
 *   - local:  assistente de regras, conhece o Baluarte, navega e informa
 *   - claude: chamada direta à Claude API (requer API key do usuário)
 *
 * Memória de conversa em localStorage. Histórico por sessão.
 */

import { storage } from '../core/storage.js';
import { ARSENAL, TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS } from '../data/universos.js';

const HISTORY_KEY = 'jarvis:history';
const CONFIG_KEY = 'jarvis:config';
const MAX_HISTORY = 100;

/* ===== Config ===== */

export function loadConfig() {
  return storage.get(CONFIG_KEY) || {
    mode: 'local',
    apiKey: '',
    model: 'claude-sonnet-4-6',
    systemPrompt: 'Você é o J.A.R.V.I.S., assistente de IA do Projeto Baluarte Mark XIII. Responda em português, de forma concisa e tática. O operador é Lucas Belucci Bellini.'
  };
}

export function saveConfig(config) {
  storage.set(CONFIG_KEY, config);
}

/* ===== Histórico ===== */

export function loadHistory() {
  const h = storage.get(HISTORY_KEY);
  return Array.isArray(h) ? h : [];
}

export function saveHistory(history) {
  storage.set(HISTORY_KEY, history.slice(-MAX_HISTORY));
}

export function clearHistory() {
  storage.remove(HISTORY_KEY);
}

/* ===== Modo LOCAL — assistente de regras ===== */

const ROUTES_INDEX = {
  'ponte de comando': '/home', 'home': '/home', 'início': '/home',
  'ferramentas': '/ferramentas', 'hub': '/ferramentas',
  'editor': '/editor', 'código': '/editor',
  'terminal': '/terminal', 'console': '/terminal',
  'calculadora científica': '/calc-cientifica', 'científica': '/calc-cientifica',
  'calculadora numérica': '/calc-numerica', 'numérica': '/calc-numerica', 'binário': '/calc-numerica',
  'calculadoras': '/calculadoras',
  'tabela verdade': '/tabela-verdade', 'lógica': '/tabela-verdade', 'karnaugh': '/tabela-verdade',
  'criptografia': '/cripto', 'cripto': '/cripto', 'cifra': '/cripto',
  'gráficos': '/graficos', 'chart': '/graficos',
  'símbolos': '/simbolos', 'unicode': '/simbolos',
  'regex': '/regex', 'expressão regular': '/regex',
  'arsenal': '/arsenal', 'armas': '/arsenal',
  'biblioteca': '/biblioteca', 'crônicas': '/biblioteca', 'arcos': '/biblioteca',
  'elites': '/elites', 'equipes': '/elites',
  'ciberseg': '/ciberseg', 'segurança': '/ciberseg',
  'academia': '/academia', 'linguagens': '/academia',
  'fft': '/fft', 'áudio': '/fft', 'espectro': '/fft',
  'media': '/media', 'mídia': '/media',
  'vídeos': '/videos', 'videos': '/videos',
  'universo': '/universo', 'universos': '/universo',
  'tabela periódica': '/tabela-periodica', 'elementos': '/tabela-periodica',
  'modpack': '/modpack', 'minecraft': '/modpack', 'mods': '/modpack',
  'guia pc': '/guia-pc', 'montar pc': '/guia-pc',
  'simulador': '/logic-sim', 'logic sim': '/logic-sim',
  'perfil': '/perfil',
  'shadow': '/shadow', 'shadow bridge': '/shadow',
  'economia': '/economia', 'cotações': '/economia'
};

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Processa uma mensagem no modo local.
 * @returns {{ text: string, action?: {type, payload} }}
 */
export function processLocal(message) {
  const msg = normalize(message);

  /* Saudações */
  if (/\b(oi|ola|opa|eai|e ai|bom dia|boa tarde|boa noite)\b/.test(msg)) {
    return { text: 'Operador. J.A.R.V.I.S. online em modo local. Posso navegar pelo Baluarte, consultar o Arsenal, equipes, arcos e universos, ou abrir qualquer ferramenta. Como posso ajudar?' };
  }

  /* Ajuda */
  if (/\b(ajuda|help|o que voce faz|comandos|pode fazer)\b/.test(msg)) {
    return { text: [
      'Modo local — posso:',
      '• Navegar: "abra o editor", "vai pro arsenal"',
      '• Consultar: "quantas equipes tem?", "fale do arco ALFA"',
      '• Buscar armas: "procure rifles", "arma AK-47"',
      '• Status: "status do sistema", "que fase estamos"',
      '• Para conversas livres com IA real, configure a Claude API nas configurações.'
    ].join('\n') };
  }

  /* Status */
  if (/\b(status|situacao|fase|versao|estado)\b/.test(msg)) {
    return { text: [
      '⬡ STATUS — Baluarte Mark XIII',
      `Fase: 19/21 · v0.19.0`,
      `Arsenal: ${TOTAL} itens catalogados`,
      `Elites: ${TOTAL_EQUIPES} equipes`,
      `Crônicas: ${ARCS_TOTAL} arcos`,
      `Universos: ${UNIVERSOS.length}`,
      'Núcleo: ONLINE · J.A.R.V.I.S.: modo local ativo'
    ].join('\n') };
  }

  /* Navegação */
  if (/\b(abra|abrir|abre|navega|navegar|vai|va|ir para|leva|leve|mostra|mostrar)\b/.test(msg)) {
    for (const [key, route] of Object.entries(ROUTES_INDEX)) {
      if (msg.includes(normalize(key))) {
        return {
          text: `Navegando para ${key}…`,
          action: { type: 'navigate', payload: route }
        };
      }
    }
    return { text: 'Não identifiquei o destino. Tente: "abra o editor", "vai pro arsenal", "mostra as equipes".' };
  }

  /* Consultas — equipes */
  if (/\b(equipe|equipes|elite)\b/.test(msg)) {
    /* Equipe específica? */
    for (const eq of EQUIPES) {
      if (msg.includes(normalize(eq.code)) || msg.includes(normalize(eq.name))) {
        return { text: [
          `◆ ${eq.code} — ${eq.name}`,
          `Especialidade: ${eq.specialty}`,
          `Líder: ${eq.leader} · ${eq.members} membros`,
          `Lema: "${eq.motto}"`,
          eq.description
        ].join('\n') };
      }
    }
    return { text: `Há ${TOTAL_EQUIPES} equipes catalogadas (ALFA→ZULU). Pergunte por uma específica ("fale da equipe DELTA") ou diga "abra as elites".` };
  }

  /* Consultas — arsenal */
  if (/\b(arma|armas|rifle|pistola|sniper|tanque|veiculo)\b/.test(msg)) {
    /* Arma específica? */
    const found = ARSENAL.filter((w) => msg.includes(normalize(w.name)));
    if (found.length) {
      const w = found[0];
      return { text: [
        `⌖ ${w.name}`,
        `Categoria: ${w.category} · Origem: ${w.origin || '—'}`,
        `Calibre: ${w.caliber || '—'} · Alcance: ${w.rangeM ? w.rangeM + 'm' : '—'}`,
        `Tier: ${w.tier} · Equipe: ${w.equipe || '—'}`,
        w.notes || ''
      ].join('\n') };
    }
    return { text: `Arsenal tem ${TOTAL} itens. Diga "abra o arsenal" pra explorar ou pergunte por uma arma específica.` };
  }

  /* Consultas — arcos */
  if (/\b(arco|arcos|cronica|cronicas|historia|biblioteca)\b/.test(msg)) {
    for (const arc of ARCS) {
      if (msg.includes(normalize(arc.code)) || msg.includes(normalize(arc.title))) {
        return { text: [
          `◫ ${arc.code} — ${arc.title}`,
          `Universo: ${arc.universe}`,
          arc.synopsis,
          `${arc.chapters.length} capítulos. Diga "abra a biblioteca" pra ler.`
        ].join('\n') };
      }
    }
    return { text: `${ARCS_TOTAL} arcos nas Crônicas da Baluarte. Pergunte por um ("fale do arco ZULU") ou diga "abra a biblioteca".` };
  }

  /* Quem é Lucas */
  if (/\b(lucas|quem e voce|quem te criou|operador)\b/.test(msg)) {
    return { text: 'Lucas Belucci Bellini é o operador-líder e arquiteto do Núcleo Infinity Dreadnought. Construiu o Mark XIII após 12 iterações anteriores. Eu sou o J.A.R.V.I.S., assistente dele.' };
  }

  /* Agradecimento */
  if (/\b(obrigad|valeu|thanks|tmj)\b/.test(msg)) {
    return { text: 'Sempre à disposição, operador.' };
  }

  /* Fallback */
  return { text: [
    'Não processei isso no modo local. Posso:',
    '• Navegar ("abra X") · Consultar equipes/armas/arcos · Status',
    'Para conversa livre, configure a Claude API real nas configurações (⚙).'
  ].join('\n') };
}

/* ===== Modo CLAUDE — API direta ===== */

/**
 * Chama a Claude API diretamente do browser.
 * Requer header anthropic-dangerous-direct-browser-access.
 * @returns {Promise<string>}
 */
export async function processClaude(messages, config) {
  if (!config.apiKey) {
    throw new Error('API key não configurada. Defina nas configurações (⚙).');
  }

  const body = {
    model: config.model || 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: config.systemPrompt,
    messages: messages.map((m) => ({
      role: m.role === 'jarvis' ? 'assistant' : 'user',
      content: m.text
    }))
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.error?.message || detail;
    } catch {}
    throw new Error(detail);
  }

  const data = await res.json();
  const textBlock = (data.content || []).find((b) => b.type === 'text');
  return textBlock ? textBlock.text : '(resposta vazia)';
}
