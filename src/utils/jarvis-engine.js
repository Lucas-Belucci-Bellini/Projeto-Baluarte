/**
 * JARVIS Engine — chat assistente do Baluarte.
 *
 * 4 modos (Fase 20 completa):
 *   - local:  assistente de regras, conhece o Baluarte, navega e informa
 *   - claude: chamada direta à Claude API (requer API key do usuário)
 *   - ollama: modelo local via Ollama (http://localhost:11434)
 *   - agente: Claude API + tool-use (executa ações no Baluarte)
 *
 * Memória de conversa em IndexedDB (jarvis-memory.js).
 */

import { storage } from '../core/storage.js';
import { VERSION } from '../data/version.js';
import { ARSENAL, TOTAL } from '../data/arsenal.js';
import { EQUIPES, TOTAL_EQUIPES } from '../data/elites.js';
import { ARCS, ARCS_TOTAL } from '../data/cronicas.js';
import { UNIVERSOS } from '../data/universos.js';
import { getToolSchemas, runTool } from './jarvis-tools.js';
import './jarvis-nexus-tools.js'; // registra o Git Nexus como skills do JARVIS (#231)
import { findCapability } from '../data/site-capabilities.js';
import { addMemory, searchMemories, conceptLabel } from './jarvis-brain.js';
import { getBaluarteBriefing } from './jarvis-context.ts';
import { buildNewsBriefingPrompt } from './news-briefing.ts';

const HISTORY_KEY = 'jarvis:history';
const CONFIG_KEY = 'jarvis:config';
const MAX_HISTORY = 100;

/* ===== Rede com timeout (robustez) ===== */

/** fetch com timeout via AbortController. Lança Error('timeout') ao estourar. */
async function fetchWithTimeout(url, options = {}, ms = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve a base do backend do modo Servidor.
 * No site publicado (HTTPS), se a URL salva estiver vazia ou apontar para um
 * backend local (que o navegador bloquearia), usa as funções serverless do
 * próprio site (/api) — mesmo domínio, sem mixed-content nem URL separada. */
export function resolveServerBase(serverUrl) {
  const base = (serverUrl || '').replace(/\/$/, '');
  if (typeof location !== 'undefined' && location.protocol === 'https:' &&
      (!base || /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(base))) {
    return '/api';
  }
  return base || 'http://127.0.0.1:8000';
}

/** Testa o backend do modo Servidor. Retorna o JSON de /health. */
export async function healthCheckServer(serverUrl) {
  const url = resolveServerBase(serverUrl);
  const res = await fetchWithTimeout(`${url}/health`, {}, 8000);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ===== Config ===== */

export function loadConfig() {
  /* v0.5.0 (#340): o Hermes AGENTE local é o motor PADRÃO do J.A.R.V.I.S. —
   * IA de verdade sem API/chave (WebLLM no site; motor embutido no app, com a
   * blindagem #310 caindo pro WebLLM se o nativo falhar). Config já salva pelo
   * usuário não é sobrescrita — isto é só o default de quem nunca escolheu. */
  return storage.get(CONFIG_KEY) || {
    mode: 'hermes-agente',
    apiKey: '',
    model: 'claude-sonnet-4-6',
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'llama3.2',
    hermesLocalUrl: 'http://localhost:1234/v1',
    hermesLocalModel: '',
    webllmModel: 'Llama-3.2-1B-Instruct-q4f16_1-MLC',
    serverUrl: '',
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

/* ===== Briefing do Baluarte (contexto p/ os modos de IA) ===== */

/**
 * Resumo conciso do universo Baluarte para injetar como contexto da IA — dá ao
 * J.A.R.V.I.S. conhecimento do projeto (identidade, operador, contagens,
 * universos e equipes) sem depender de busca externa. Usado nos modos de IA.
 */
export { getBaluarteBriefing };

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
  'dossiê': '/dossie', 'dossie': '/dossie', 'forças': '/dossie', 'dreadnought': '/dossie',
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
  'economia': '/economia', 'cotações': '/economia',
  'dólar': '/dolar', 'dolar': '/dolar', 'câmbio': '/dolar', 'cambio': '/dolar', 'bitcoin': '/dolar'
};

function normalize(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Reconhece um pedido de gráfico no modo local e extrai tipo + dados.
 * Ex.: "gráfico de barras: jan 10, fev 20, mar 30" · "gráfico de 5, 8, 13".
 * @returns {{type:string,title:string,data:{labels:string[],values:number[]}}|null}
 */
function parseChartRequest(message) {
  const m = normalize(message);
  if (!/\b(grafico|chart|plota|plote|plotar|diagrama)\b/.test(m)) return null;
  let type = 'bar';
  if (/\b(linha|line|tendencia)\b/.test(m)) type = 'line';
  else if (/\b(pizza|torta|pie)\b/.test(m)) type = 'pie';
  else if (/\b(rosca|donut|doughnut)\b/.test(m)) type = 'donut';
  else if (/\barea\b/.test(m)) type = 'area';
  else if (/\bradar\b/.test(m)) type = 'radar';
  else if (/\b(horizontal|hbar)\b/.test(m)) type = 'hbar';

  let body = message.replace(/^[\s\S]*?\b(gr[áa]ficos?|charts?|diagramas?|plot\w*|plote|plota)\b/i, '');
  body = body.replace(/\b(de|da|do|com|os|as|um|uma|por favor|favor|me|faz|faça|faca|gera|gere|cria|crie)\b/gi, ' ');
  body = body.replace(/\b(barras?|colunas?|linhas?|pizza|torta|area|setores?|rosca|donut|radar|horizontal)\b/gi, ' ');
  body = body.replace(/^[\s:,;.\-]+/, '');

  const labels = [], values = [];
  for (const tok of body.split(/[,;\n]+/)) {
    const t = tok.trim();
    if (!t) continue;
    const pair = t.match(/^(.*?[a-zà-úA-ZÀ-Ú].*?)[\s:=]+(-?\d+(?:[.,]\d+)?)\s*%?$/);
    if (pair && pair[1].trim()) {
      values.push(parseFloat(pair[2].replace(',', '.')));
      labels.push(pair[1].replace(/[:=]+/g, ' ').trim());
    } else {
      const nums = t.match(/-?\d+(?:[.,]\d+)?/g);
      if (nums) for (const n of nums) { values.push(parseFloat(n.replace(',', '.'))); labels.push('#' + values.length); }
    }
  }
  if (values.length < 2) return null;
  const hasLabels = labels.some((l) => !/^#\d+$/.test(l));
  return { type, title: 'Gráfico', data: { labels: hasLabels ? labels : values.map((_, i) => '#' + (i + 1)), values } };
}

/**
 * Processa uma mensagem no modo local.
 * @returns {{ text: string, action?: {type, payload} }}
 */
export function processLocal(message) {
  const msg = normalize(message);

  /* Geração de gráfico (issue #175): JARVIS desenha e mostra a imagem. */
  const chart = parseChartRequest(message);
  if (chart) {
    return {
      text: `Gerando o gráfico com ${chart.data.values.length} pontos…`,
      action: { type: 'chart', payload: chart }
    };
  }

  /* Memória durável (supermemory): gravar um fato. */
  const cap = message.match(/^\s*(?:lembre|lembra-se|anote|anota|memorize|memoriza|guarde|guarda|n[ãa]o\s+esque[çc]a)\b\s*(?:-se\s*)?(?:que|de|do|da)?\s*[:,-]?\s*(.+)$/i);
  if (cap && cap[1].trim().length > 2) {
    const item = addMemory({ text: cap[1].trim(), source: 'local' });
    if (item) {
      const cs = (item.conceptIds || []).map(conceptLabel);
      return { text: `Memorizado. 🧠${cs.length ? ' Liguei ao Segundo Cérebro: ' + cs.join(', ') + '.' : ''} Veja tudo em /memoria.` };
    }
  }

  /* Memória durável: recuperar fatos. */
  if (/\b(o que (voce|vc) sabe sobre|o que sabe sobre|memorias? sobre|memorias? de|lembra (de|do|da)|voce lembra|o que voce lembra)\b/.test(msg)) {
    const q = message.replace(/^.*?\b(sobre|de|do|da)\b/i, '').trim() || message;
    const hits = searchMemories(q, 6);
    if (hits.length) {
      return { text: 'Do que eu lembro:\n' + hits.map((m) => `• ${m.text}`).join('\n') };
    }
    return { text: 'Ainda não guardei memórias sobre isso. Diga "lembre que ..." para eu memorizar (veja em /memoria).' };
  }

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
      `Versão: v${VERSION}`,
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
    /* Fallback: reconhece QUALQUER página do site (auto-atualizado pelo menu). */
    const cap = findCapability(message);
    if (cap) {
      return {
        text: `Navegando para ${cap.label}…`,
        action: { type: 'navigate', payload: cap.path }
      };
    }
    return { text: 'Não identifiquei o destino. Tente: "abra o editor", "vai pro arsenal", "mostra a enciclopédia militar".' };
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

/* ===== Modo OLLAMA — modelo local ===== */

/**
 * Chama um modelo local via Ollama.
 * Requer Ollama rodando (ollama serve) em config.ollamaUrl.
 * @returns {Promise<string>}
 */
export async function processOllama(messages, config) {
  const url = (config.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
  const body = {
    model: config.ollamaModel || 'llama3.2',
    stream: false,
    messages: [
      { role: 'system', content: config.systemPrompt },
      /* aceita o formato do /jarvis ({role:'jarvis', text}) e o do Núcleo
       * ({role:'assistant', content}) — antes o 2º virava content vazio. */
      ...messages.map((m) => ({
        role: (m.role === 'jarvis' || m.role === 'assistant') ? 'assistant' : 'user',
        content: m.text != null ? m.text : (m.content || '')
      }))
    ]
  };

  let res;
  try {
    res = await fetchWithTimeout(`${url}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    if (e.message === 'timeout') throw new Error('Ollama demorou demais a responder (timeout). O modelo pode estar carregando — tente de novo.');
    throw new Error('Ollama inacessível. Rode "ollama serve" e verifique a URL nas configurações.');
  }

  if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
  const data = await res.json();
  return data.message?.content || '(resposta vazia)';
}

/* ===== Modo SERVIDOR — backend Python + Gemini (busca web) ===== */

/**
 * Gera um briefing somente leitura pelo backend existente com busca web.
 * A resposta deve preservar fontes e não autoriza envio/publicação externos.
 * @returns {Promise<string>}
 */
export async function processNewsBriefing(question, config = {}) {
  const url = resolveServerBase(config.serverUrl);
  const system = [
    config.systemPrompt || 'Você é o J.A.R.V.I.S. do Projeto Baluarte.',
    buildNewsBriefingPrompt({ topic: question, limit: 6 }),
  ].join('\n\n');
  const body = {
    system,
    messages: [{ role: 'user', content: question }],
  };
  let res;
  try {
    res = await fetchWithTimeout(`${url}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }, 60000);
  } catch (error) {
    if (error.message === 'timeout') throw new Error('O briefing de notícias demorou demais para responder.');
    throw new Error('Backend de notícias inacessível. Configure o modo Servidor ou deixe a URL vazia para usar /api.');
  }
  if (!res.ok) throw new Error(`Notícias HTTP ${res.status}`);
  const data = await res.json();
  return data.resposta || '(briefing vazio)';
}

export async function processServer(messages, config) {
  const url = resolveServerBase(config.serverUrl);

  /* Mixed content: se ainda assim a URL for um http:// externo num site HTTPS,
   * o navegador bloqueia. (URLs locais já caem em /api via resolveServerBase.) */
  if (typeof location !== 'undefined' && location.protocol === 'https:' && /^http:\/\//i.test(url)) {
    throw new Error(`Servidor inacessível: a URL "${url}" é http:// e o site é HTTPS — o navegador bloqueia. Use uma URL https://, ou deixe o campo vazio para usar o backend embutido do site (/api).`);
  }

  const body = {
    system: config.systemPrompt,
    messages: messages.map((m) => ({
      role: m.role === 'jarvis' ? 'assistant' : 'user',
      content: m.text
    }))
  };

  let res;
  try {
    res = await fetchWithTimeout(`${url}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (e) {
    if (e.message === 'timeout') throw new Error('O servidor da IA demorou demais a responder (timeout). Tente de novo.');
    throw new Error('Servidor da IA inacessível. Rode backend/server.py e confira a URL nas configurações.');
  }

  if (!res.ok) throw new Error(`Servidor HTTP ${res.status}`);
  const data = await res.json();
  return data.resposta || '(resposta vazia)';
}

/* ===== Modo HERMES (servidor) — Nous Hermes via /api/hermes (Vercel → OpenRouter) =====
 * Mesmo formato do processServer, mas no endpoint /hermes. Roda em qualquer
 * device (sem WebGPU): a Vercel intermedia o provedor que hospeda o Hermes. */
export async function processHermes(messages, config) {
  const url = resolveServerBase(config && config.serverUrl);
  if (typeof location !== 'undefined' && location.protocol === 'https:' && /^http:\/\//i.test(url)) {
    throw new Error(`URL "${url}" é http:// num site HTTPS — bloqueada pelo navegador.`);
  }
  const body = {
    system: config && config.systemPrompt,
    model: (config && config.hermesModel) || undefined,
    messages: messages.map((m) => ({ role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text }))
  };
  let res;
  try {
    res = await fetchWithTimeout(`${url}/hermes`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }, 60000);
  } catch (e) {
    if (e.message === 'timeout') throw new Error('O Hermes (servidor) demorou demais a responder. Tente de novo.');
    throw new Error('Servidor Hermes inacessível.');
  }
  if (!res.ok) throw new Error(`Servidor HTTP ${res.status}`);
  const data = await res.json();
  return data.resposta || '(resposta vazia)';
}

/* ===== Modo CLAUDE (servidor) — Anthropic via /api/claude (issue #200) =====
 * Mesmo formato do processHermes, mas no endpoint /claude: a chave fica nas
 * Environment Variables da Vercel (nunca no navegador) e é detectada até com
 * nome personalizado (ex: Claude_Fable). Status das chaves: página /apis. */
export async function processClaudeServer(messages, config) {
  const url = resolveServerBase(config && config.serverUrl);
  if (typeof location !== 'undefined' && location.protocol === 'https:' && /^http:\/\//i.test(url)) {
    throw new Error(`URL "${url}" é http:// num site HTTPS — bloqueada pelo navegador.`);
  }
  const body = {
    system: config && config.systemPrompt,
    messages: messages.map((m) => ({ role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text }))
  };
  let res;
  try {
    res = await fetchWithTimeout(`${url}/claude`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }, 60000);
  } catch (e) {
    if (e.message === 'timeout') throw new Error('O Claude (servidor) demorou demais a responder. Tente de novo.');
    throw new Error('Servidor do Claude inacessível.');
  }
  if (!res.ok) throw new Error(`Servidor HTTP ${res.status}`);
  const data = await res.json();
  return data.resposta || '(resposta vazia)';
}

/* ===== Modo OPENCLAW — assistente self-hosted (gateway local) =====
 * OpenClaw é self-hosted (como o Ollama). O gateway nativo é RPC; esta conexão
 * espera um endpoint de chat compatível com OpenAI (nativo ou via bridge).
 * Parsing tolerante a vários formatos de resposta. URL configurável. */
export async function processOpenClaw(messages, config) {
  const url = ((config && config.openclawUrl) || 'http://localhost:18789').replace(/\/$/, '');
  const path = (config && config.openclawPath) || '/v1/chat/completions';
  if (typeof location !== 'undefined' && location.protocol === 'https:' &&
      /^http:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url)) {
    throw new Error(`A URL do OpenClaw ("${url}") é http:// num site HTTPS — o navegador bloqueia. Use https:// (ex.: um túnel) ou rode o site localmente.`);
  }
  const body = {
    model: (config && config.openclawModel) || 'openclaw',
    stream: false,
    messages: [
      { role: 'system', content: (config && config.systemPrompt) || '' },
      ...messages.map((m) => ({ role: m.role === 'jarvis' ? 'assistant' : 'user', content: m.text }))
    ]
  };
  let res;
  try {
    res = await fetchWithTimeout(`${url}${path}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body)
    }, 60000);
  } catch (e) {
    if (e.message === 'timeout') throw new Error('OpenClaw demorou demais a responder (timeout).');
    throw new Error('OpenClaw inacessível. Rode o gateway ("openclaw gateway --port 18789") e confira a URL/endpoint.');
  }
  if (!res.ok) throw new Error(`OpenClaw HTTP ${res.status}`);
  const data = await res.json();
  return (
    (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) ||
    (data && data.message && data.message.content) ||
    (data && (data.reply || data.response || data.content || data.text || data.resposta)) ||
    '(resposta vazia)'
  );
}

/* ===== Modo AGENTE — Claude API + tool use ===== */

/**
 * Modo agente: Claude com ferramentas. Executa um loop de tool-use
 * até o modelo dar a resposta final.
 *
 * @param {Array} messages - histórico de conversa
 * @param {object} config
 * @param {function} onToolCall - callback(toolName, input, result) para UI
 * @returns {Promise<string>} resposta final em texto
 */
export async function processAgent(messages, config, onToolCall) {
  if (!config.apiKey) {
    throw new Error('Modo agente requer Claude API key. Configure nas opções (⚙).');
  }

  /* Constrói histórico no formato da API */
  const apiMessages = messages.map((m) => ({
    role: m.role === 'jarvis' ? 'assistant' : 'user',
    content: m.text
  }));

  const MAX_TURNS = 8;
  let finalText = '';

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const body = {
      model: config.model || 'claude-sonnet-4-6',
      max_tokens: 1536,
      system: config.systemPrompt +
        ' Você tem ferramentas para navegar e consultar o Baluarte. Use-as quando fizer sentido.' +
        ' Você também pode APRENDER habilidades novas: se precisar de uma capacidade repetível que ainda não existe, crie-a com create_skill (JS puro, fica salva e disponível nas próximas conversas) e então use-a. Confira o que já aprendeu com list_skills.',
      tools: getToolSchemas({ query: config.toolFocus }),
      messages: apiMessages
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
      try { detail = (await res.json()).error?.message || detail; } catch {}
      throw new Error(detail);
    }

    const data = await res.json();
    const content = data.content || [];

    /* Acumula texto */
    const textBlocks = content.filter((b) => b.type === 'text');
    if (textBlocks.length) {
      finalText = textBlocks.map((b) => b.text).join('\n');
    }

    /* Tem tool_use? */
    const toolUses = content.filter((b) => b.type === 'tool_use');
    if (toolUses.length === 0 || data.stop_reason !== 'tool_use') {
      return finalText || '(sem resposta)';
    }

    /* Adiciona resposta do assistant ao histórico */
    apiMessages.push({ role: 'assistant', content });

    /* Executa cada ferramenta */
    const toolResults = [];
    for (const tu of toolUses) {
      const result = runTool(tu.name, tu.input);
      if (onToolCall) {
        try { onToolCall(tu.name, tu.input, result); } catch {}
      }
      toolResults.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: JSON.stringify(result)
      });
    }

    apiMessages.push({ role: 'user', content: toolResults });
  }

  return finalText || '(limite de turnos do agente atingido)';
}
