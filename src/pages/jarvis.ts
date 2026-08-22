/**
 * Página /jarvis — J.A.R.V.I.S. completo (Fase 20).
 *
 * 6 modos: local, webllm (navegador), claude, ollama, servidor (gemini), agente.
 * Sessões múltiplas em IndexedDB. Tool calls visíveis no modo agente.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { VERSION } from '../data/version.js';
import { router } from '../core/router.js';
import { bus } from '../core/events.js';
import { toast } from '../utils/toast';
import {
  loadConfig, saveConfig,
  processLocal, processClaude, processOllama, processServer, processNewsBriefing, processHermes, processClaudeServer, processOpenClaw, processAgent,
  healthCheckServer
} from '../utils/jarvis-engine.js';
import type { JarvisConfig } from '../utils/jarvis-engine.js';
import {
  processWebLLM, isWebGPUAvailable, WEBLLM_MODELS, preloadWebLLM, getLoadedModel
} from '../utils/jarvis-webllm.js';
import { processHermesAgent, HERMES_AGENT_DEFAULT } from '../utils/jarvis-hermes-agent.js';
import { processHermesLocal, HERMES_LOCAL_DEFAULT_URL, HERMES_LOCAL_PRESETS } from '../utils/hermes-local.js';
import { highlight } from '../utils/syntax-highlight.js';
import { drawChart } from '../utils/chart-engine.js';
import type { ChartData } from '../utils/chart-engine.js';
import { memoryContext, captureConversation, captureReply } from '../utils/jarvis-brain.js';
import { LANGS, langForExt } from '../data/editor-langs.js';
import type { LanguageDefinition } from '../data/editor-langs.js';
import {
  getJarvisRuntimeContext,
  selectContextMessages,
  recordJarvisContextObservation,
} from '../utils/jarvis-context';
import {
  beginSpotifyAuthorization,
  disconnectSpotify,
  getSpotifyClientId,
  isSpotifyConnected,
  rememberSpotifyClientId,
} from '../utils/jarvis-spotify-session';
import { getConfiguredSpotifyClientId, isSpotifyClientId } from '../utils/jarvis-spotify';
import type { SpotifySessionEventDetail } from '../utils/jarvis-spotify-session';
import { humanize } from '../utils/jarvis-style.js';
import {
  createSession, listSessions, updateSession, deleteSession,
  addMessage, getMessages, getAllMessages, getMemoryRevision, isUsingFallback
} from '../utils/jarvis-memory.js';
import type { JarvisMessage, JarvisRole, JarvisSession } from '../utils/jarvis-memory.js';
import {
  recall,
  summarizeSession,
  setMemoryCache,
  getMemoryCorpusCache,
  getMemoryCorpusIndex,
  setMemoryCorpusCache,
  recordMemoryCorpusObservation,
} from '../utils/jarvis-recall.js';
import type { RecallDoc } from '../utils/jarvis-recall.js';
import { initSkills, removeSkill } from '../utils/jarvis-tools.js';
import { listSkillSummaries } from '../utils/jarvis-skills.js';
import { createMarkXiiiConsole, type MarkXiiiConsole, type MarkXiiiRuntimeObservation } from '../utils/jarvis-mark-xiii';
import { createJarvisV7Visual, type JarvisV7Visual } from '../utils/jarvis-v7-visual';

/** Um modo de operação do JARVIS, como aparece na grade de seleção. */
interface ModoJarvis {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly badge: string;
  readonly desc: string;
}

const MODES: readonly ModoJarvis[] = [
  { id: 'local',  label: 'Local',  icon: '◆', badge: 'cyan',    desc: 'Assistente de regras. Offline, sem custo. Navega e consulta o Baluarte.' },
  { id: 'webllm', label: 'Navegador', icon: '⬡', badge: 'cyan', desc: 'IA real 100% no navegador via WebLLM (WebGPU). Sem servidor, sem API key. 1º uso baixa o modelo; depois roda offline.' },
  { id: 'hermes-agente', label: 'Hermes (agente local)', icon: '⬢', badge: 'warning', desc: 'Nous Hermes rodando LOCAL no navegador (WebLLM/WebGPU, sem API, sem chave) como AGENTE de verdade: navega, consulta e executa ações reais no Baluarte com as ferramentas do JARVIS. 1º uso baixa o modelo (~2,5–4,5 GB); depois roda offline. No app usa o motor embutido.' },
  { id: 'claude', label: 'Claude', icon: '◉', badge: 'magenta', desc: 'Conversa livre via Claude API. Requer API key da Anthropic.' },
  { id: 'ollama', label: 'Ollama', icon: '⬢', badge: 'success', desc: 'Modelo local via Ollama (ollama serve). 100% privado.' },
  { id: 'hermes-local', label: 'Hermes (local da máquina)', icon: '⬢', badge: 'success', desc: 'Conecta no Hermes rodando NA SUA MÁQUINA via endpoint OpenAI-compatível (/v1): LM Studio, Ollama, text-generation-webui… 100% privado, zero nuvem. Com "voz on" no Núcleo, a resposta sai falada (ElevenLabs/navegador).' },
  { id: 'servidor', label: 'Servidor', icon: '⊛', badge: 'success', desc: 'Backend Python + Gemini com busca web real (Google). Habilita a camada 2 do raciocínio. Requer rodar backend/server.py.' },
  { id: 'noticias', label: 'Briefing', icon: '◈', badge: 'success', desc: 'Briefing de notícias com busca web, fontes e links originais. Somente leitura: não envia nem publica nada.' },
  { id: 'hermes', label: 'Hermes (servidor)', icon: '⬢', badge: 'success', desc: 'Nous Hermes via servidor (Vercel → OpenRouter): roda em qualquer device, sem WebGPU. Requer OPENROUTER_API_KEY nas envs da Vercel.' },
  { id: 'claude-servidor', label: 'Claude (servidor)', icon: '🛰', badge: 'magenta', desc: 'Claude pelo servidor do site (Vercel → Anthropic): a chave fica nas envs da Vercel, nunca no navegador — detecta até nome personalizado (ex: Claude_Fable). Status das chaves em /apis.' },
  { id: 'openclaw', label: 'OpenClaw', icon: '🐾', badge: 'cyan', desc: 'Assistente self-hosted OpenClaw (gateway local). Espera um endpoint de chat compatível (OpenAI); configure a URL. O gateway nativo é RPC — pode precisar de bridge.' },
  { id: 'agente', label: 'Agente', icon: '⚛', badge: 'warning', desc: 'Claude com ferramentas: navega, consulta e executa ações reais.' }
];

let config: JarvisConfig | null = null;
let sessions: JarvisSession[] = [];
let activeSession: JarvisSession | null = null;
let messages: JarvisMessage[] = [];
let busy = false;

let messagesEl: HTMLDivElement | null = null;
let inputEl: HTMLTextAreaElement | null = null;
let sessionsEl: HTMLDivElement | null = null;
let modeBadgeEl: HTMLSpanElement | null = null;
let markXiiiConsole: MarkXiiiConsole | null = null;
let jarvisV7Visual: JarvisV7Visual | null = null;
let markXiiiRuntimeOff: (() => void) | null = null;
let markXiiiRouteOff: (() => void) | null = null;
let markXiiiSpotifyOff: (() => void) | null = null;

function applyRuntimeObservation(observation: MarkXiiiRuntimeObservation): void {
  markXiiiConsole?.setRuntimeObservation(observation);
}

function disposeMarkXiiiConsole(): void {
  jarvisV7Visual?.dispose();
  jarvisV7Visual = null;
  markXiiiRuntimeOff?.();
  markXiiiRuntimeOff = null;
  markXiiiRouteOff?.();
  markXiiiRouteOff = null;
  markXiiiSpotifyOff?.();
  markXiiiSpotifyOff = null;
  markXiiiConsole?.dispose();
  markXiiiConsole = null;
}

/**
 * Acesso às peças montadas em `jarvisPage()`.
 *
 * Elas só são `null` antes da página existir, e nesse caso a versão JavaScript
 * estourava um `TypeError` ao usá-las. O comportamento é preservado de
 * propósito: falhar alto é melhor que renderizar em silêncio no lugar nenhum —
 * um `return` mudo aqui daria exatamente o retrato verde de peça desligada.
 */
function exigir<T>(el: T | null, nome: string): T {
  if (!el) throw new Error(`jarvis: ${nome} ainda não foi montado`);
  return el;
}

/** A config depois do boot da página. Mesma regra do `exigir` acima. */
function cfg(): JarvisConfig {
  return exigir(config, 'config');
}

/** Lê o valor de um campo a partir do evento, sem supor o alvo do handler. */
function valorDoCampo(e: Event): string {
  const alvo = e.target;
  return alvo instanceof HTMLInputElement
    || alvo instanceof HTMLSelectElement
    || alvo instanceof HTMLTextAreaElement
    ? alvo.value
    : '';
}

/** Estado de um checkbox, pela mesma via. */
function marcado(e: Event): boolean {
  const alvo = e.target;
  return alvo instanceof HTMLInputElement ? alvo.checked : false;
}

/* ===== Sessões ===== */

async function refreshSessions(): Promise<void> {
  sessions = await listSessions();
  renderSessions();
}

function renderSessions(): void {
  if (!sessionsEl) return;
  const alvo = sessionsEl;
  empty(alvo);
  if (!sessions.length) {
    alvo.appendChild(h('div', { className: 'jv-sessions__empty u-text-muted' }, 'Sem conversas'));
    return;
  }
  sessions.forEach((s) => {
    const mode = MODES.find((m) => m.id === s.mode);
    alvo.appendChild(
      h('div', {
        className: cx('jv-session', activeSession?.id === s.id && 'is-active'),
        onclick: () => selectSession(s.id)
      },
        h('span', { className: 'jv-session__icon' }, mode?.icon || '◆'),
        h('div', { className: 'jv-session__body' },
          h('div', { className: 'jv-session__title' }, s.title),
          h('div', { className: 'jv-session__date u-text-muted u-mono' },
            new Date(s.updatedAt).toLocaleDateString('pt-BR'))
        ),
        h('button', {
          className: 'jv-session__del',
          title: 'Apagar',
          onclick: async (e: Event) => {
            e.stopPropagation();
            if (!confirm('Apagar esta conversa?')) return;
            await deleteSession(s.id);
            if (activeSession?.id === s.id) { activeSession = null; messages = []; }
            await refreshSessions();
            renderMessages();
          }
        }, '×')
      )
    );
  });
}

async function selectSession(id: string): Promise<void> {
  const achada = sessions.find((s) => s.id === id);
  if (!achada) return;
  activeSession = achada;
  messages = await getMessages(id);
  renderSessions();
  renderMessages();
}

async function newSession(): Promise<void> {
  activeSession = await createSession('Conversa ' + (sessions.length + 1), cfg().mode);
  messages = [];
  await refreshSessions();
  renderMessages();
  inputEl?.focus();
}

/* ===== Mensagens ===== */

function renderMessages(): void {
  if (!messagesEl) return;
  const alvo = messagesEl;
  empty(alvo);

  if (!activeSession) {
    alvo.appendChild(
      h('div', { className: 'jarvis-welcome' },
        h('div', { className: 'jarvis-welcome__icon' }, '◉'),
        h('div', { className: 'jarvis-welcome__title' }, 'J.A.R.V.I.S. ONLINE'),
        h('div', { className: 'jarvis-welcome__text u-text-muted' },
          'Crie uma conversa ou digite abaixo. 6 modos: Local, Navegador, Claude, Ollama, Servidor e Agente.')
      )
    );
    return;
  }
  if (!messages.length) {
    const m = MODES.find((x) => x.id === activeSession?.mode);
    alvo.appendChild(
      h('div', { className: 'jarvis-welcome' },
        h('div', { className: 'jarvis-welcome__icon' }, m?.icon || '◉'),
        h('div', { className: 'jarvis-welcome__title' }, 'Conversa iniciada'),
        h('div', { className: 'jarvis-welcome__text u-text-muted' },
          'Modo: ' + (m?.label || activeSession.mode) + '. Diga "ajuda" ou pergunte algo.')
      )
    );
    return;
  }
  messages.forEach((m) => (m.role === 'jarvis' ? emitJarvis(m.text) : renderBubble(m.role, m.text)));
  scrollDown();
}

/* ===== Perfis de system prompt (doc 05: conversa → engenheiro) ===== */

/** Os perfis disponíveis no seletor — o `profile` salvo na config é um destes. */
type PerfilIA = 'tatico' | 'engenheiro' | 'nucleo';

const SYSTEM_PROMPTS: Readonly<Record<PerfilIA, string>> = {
  tatico: 'Você é o J.A.R.V.I.S., assistente de IA do Projeto Baluarte Mark XIII. Responda em português, de forma concisa e tática. O operador é Lucas Belucci Bellini.',
  engenheiro: 'Você é o J.A.R.V.I.S. em modo engenheiro de software sênior do Projeto Baluarte. Responda em português com código limpo, otimizado e comentários quando ajudarem. Sempre coloque código em blocos markdown com a linguagem (```ts, ```js, ```python…). Para código novo, prefira TypeScript strict sem any, sem @ts-ignore e sem framework; preserve wrappers JavaScript somente nas fronteiras de compatibilidade e mantenha a V1 funcional.',
  nucleo: [
    'Você é o núcleo do Projeto Baluarte Mark XIII. Responda em português.',
    'Sua tomada de decisão segue ESTRITAMENTE esta ordem (raciocínio em 3 camadas):',
    '1. VERIFICAÇÃO LOCAL: tente resolver com o estado e as funções do próprio site (use o estado fornecido no contexto e as ferramentas, quando disponíveis).',
    '2. BUSCA WEB: se o site não tiver a resposta, busque documentação real na internet — só quando houver busca configurada (servidor/Gemini); caso não haja, declare que a busca web está indisponível.',
    '3. DEDUÇÃO LÓGICA: se a resposta exata não existir em lugar nenhum, é PROIBIDO inventar ("alucinar") ou dizer apenas "não sei". Junte as pistas e monte uma hipótese, estruturando assim:',
    '   - "Evidência A: [fato conhecido]"',
    '   - "Evidência B: [comportamento conhecido]"',
    '   - "Conclusão/Hipótese: com base em A e B, a causa provável é Z; tente fazer …"',
    'Regras: nunca alucine; extrapole apenas regras lógicas conhecidas; mostre o raciocínio para o operador entender de onde veio a solução.'
  ].join('\n')
};

/** `true` quando o texto é um dos três perfis — sem isso o `Record` não indexa. */
function ehPerfil(v: string): v is PerfilIA {
  return v === 'tatico' || v === 'engenheiro' || v === 'nucleo';
}

/* ===== Render de respostas com blocos de código realçados (doc 05) ===== */

const LANG_ALIASES: Readonly<Record<string, string | undefined>> = {
  js: 'javascript', mjs: 'javascript', ts: 'typescript', py: 'python',
  sh: 'shell', bash: 'shell', zsh: 'shell', shell: 'shell', console: 'shell',
  html: 'html', htm: 'html', xml: 'html', md: 'markdown', markdown: 'markdown',
  'c++': 'cpp', cpp: 'cpp', 'c#': 'csharp', cs: 'csharp', yml: 'yaml'
};

function resolveLang(tag: string): LanguageDefinition {
  if (!tag) return LANGS[0];
  const t = String(tag).toLowerCase();
  const id = LANG_ALIASES[t] || t;
  return LANGS.find((l) => l.id === id) || langForExt(t) || LANGS[0];
}

function codeBlock(code: string, langTag: string): HTMLDivElement {
  const lang = resolveLang(langTag);
  const codeEl = h('code', { className: 'jv-code__src' });
  /* highlight() escapa o HTML do código antes de colorir — seguro p/ saída da IA */
  codeEl.innerHTML = highlight(code, lang);
  const copyBtn = h('button', {
    className: 'jv-code__copy', title: 'Copiar código', type: 'button',
    onclick: async () => {
      try { await navigator.clipboard.writeText(code); toast('Código copiado.', { type: 'success' }); }
      catch { toast('Não consegui copiar.', { type: 'warning' }); }
    }
  }, '⧉ Copiar');
  return h('div', { className: 'jv-code__wrap' },
    h('div', { className: 'jv-code__bar' },
      h('span', { className: 'jv-code__lang u-mono' }, lang.name || langTag || 'texto'),
      copyBtn),
    h('pre', { className: 'jv-code' }, codeEl)
  );
}

/** Converte texto com fences markdown ``` em nós: texto + blocos de código. */
function renderRich(text: string): DocumentFragment {
  const frag = document.createDocumentFragment();
  const parts = String(text).split('```');
  parts.forEach((part, i) => {
    if (i % 2 === 0) {
      let clean = part.replace(/^\n+|\n+$/g, '');
      if (config && config.humanizeOn) clean = humanize(clean);
      if (clean) frag.appendChild(h('span', { className: 'jv-rt' }, clean));
    } else {
      const nl = part.indexOf('\n');
      let langTag = '';
      let code = part;
      if (nl >= 0) {
        const first = part.slice(0, nl).trim();
        if (/^[a-z0-9+#.\-]{0,15}$/i.test(first)) { langTag = first; code = part.slice(nl + 1); }
      }
      frag.appendChild(codeBlock(code.replace(/\n$/, ''), langTag));
    }
  });
  return frag;
}

function renderBubble(role: JarvisRole, text: string): void {
  const alvo = exigir(messagesEl, 'messagesEl');
  if (role === 'tool') {
    alvo.appendChild(
      h('div', { className: 'jv-tool-call' },
        h('span', { className: 'jv-tool-call__icon' }, '⚙'),
        h('span', { className: 'jv-tool-call__text u-mono' }, text)
      )
    );
    return;
  }
  const isJarvis = role === 'jarvis';
  const textEl = h('div', { className: 'jarvis-msg__text' });
  if (isJarvis) textEl.appendChild(renderRich(text));
  else textEl.textContent = text;
  const copyBtn = isJarvis ? h('button', {
    className: 'jv-msg-copy', title: 'Copiar resposta', type: 'button',
    style: { marginLeft: 'auto', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', opacity: '0.55', fontSize: '12px' },
    onclick: async () => {
      try { await navigator.clipboard.writeText(text); toast('Resposta copiada.', { type: 'success' }); }
      catch { toast('Não consegui copiar.', { type: 'warning' }); }
    }
  }, '⧉ copiar') : null;
  alvo.appendChild(
    h('div', { className: cx('jarvis-msg', isJarvis ? 'jarvis-msg--ai' : 'jarvis-msg--user') },
      h('div', { className: 'jarvis-msg__avatar' }, isJarvis ? '◉' : '◔'),
      h('div', { className: 'jarvis-msg__body' },
        h('div', { className: 'jarvis-msg__role', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
          h('span', null, isJarvis ? 'J.A.R.V.I.S.' : 'Operador'), copyBtn),
        textEl
      )
    )
  );
}

/** Um gráfico pedido pela IA, já normalizado para o motor de desenho. */
interface EspecGrafico {
  readonly type: string;
  readonly title: string;
  readonly data: ChartData;
}

/* Desenha um gráfico como "imagem" dentro de uma bolha do JARVIS (issue #175). */
function renderChartBubble(payload: EspecGrafico | null | undefined): void {
  if (!messagesEl || !payload || !payload.data) return;
  const canvas = h('canvas', { style: { width: '100%', height: '240px', display: 'block' } });
  messagesEl.appendChild(
    h('div', { className: 'jarvis-msg jarvis-msg--ai' },
      h('div', { className: 'jarvis-msg__avatar' }, '◉'),
      h('div', { className: 'jarvis-msg__body' },
        h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
        h('div', {
          style: { background: 'var(--color-bg)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', padding: '8px', marginTop: '4px' }
        }, canvas)))
  );
  requestAnimationFrame(() => {
    try { drawChart(canvas, payload.type || 'bar', payload.data, { title: payload.title || '' }); }
    catch (e) { console.warn('[jarvis] chart:', e); }
  });
}

/**
 * O que o bloco ```chart``` pode trazer.
 *
 * Vem de JSON escrito por um modelo, então nada é garantido: cada campo é
 * validado abaixo antes de virar gráfico. Tipar como `unknown` e estreitar é o
 * que impede tratar texto do modelo como estrutura confiável.
 */
interface EspecGraficoCrua {
  readonly type?: unknown;
  readonly title?: unknown;
  readonly labels?: unknown;
  readonly values?: unknown;
}

/* Extrai blocos ```chart``` (JSON) do texto da IA → desenha imagem; devolve o texto limpo. */
function extractCharts(text: string | null | undefined): { clean: string; charts: EspecGrafico[] } {
  const charts: EspecGrafico[] = [];
  const clean = String(text || '').replace(/```chart\s*([\s\S]*?)```/gi, (whole, body: string) => {
    try {
      const spec: EspecGraficoCrua = JSON.parse(body.trim());
      const brutos = Array.isArray(spec.values) ? spec.values : [];
      const values = brutos.map(Number).filter((n) => !Number.isNaN(n));
      if (values.length) {
        const labels = Array.isArray(spec.labels) && spec.labels.length
          ? spec.labels.map((l) => String(l))
          : values.map((_, i) => '#' + (i + 1));
        charts.push({
          type: typeof spec.type === 'string' ? spec.type : 'bar',
          title: typeof spec.title === 'string' ? spec.title : '',
          data: { labels, values }
        });
        return '';
      }
    } catch { /* não é JSON válido — mantém o bloco no texto */ }
    return whole;
  }).trim();
  return { clean, charts };
}

/* Renderiza uma resposta do JARVIS: texto (limpo) + eventuais gráficos. */
function emitJarvis(text: string): void {
  const { clean, charts } = extractCharts(text);
  if (clean) renderBubble('jarvis', clean);
  else if (!charts.length) renderBubble('jarvis', text);
  charts.forEach(renderChartBubble);
}

/* Tool-call expansível (padrão do hermes-web-ui): resumo + input/result. */
function renderToolCall(
  toolName: string, input: unknown, result: Record<string, unknown> | null,
): void {
  const alvo = exigir(messagesEl, 'messagesEl');
  const ok = !!(result && result.ok);
  alvo.appendChild(
    h('details', { className: 'jv-tool-call', style: { cursor: 'default' } },
      h('summary', { className: 'jv-tool-call__sum', style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' } },
        h('span', { className: 'jv-tool-call__icon' }, '⚙'),
        h('span', { className: 'jv-tool-call__text u-mono' }, `${toolName} ${ok ? '✓' : '✗'}`)),
      h('pre', { className: 'u-mono', style: { margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: '11px', opacity: '0.85', maxHeight: '160px', overflow: 'auto' } },
        `input: ${JSON.stringify(input)}\nresult: ${JSON.stringify(result)}`.slice(0, 1200)))
  );
}

function renderTyping(): void {
  const alvo = exigir(messagesEl, 'messagesEl');
  alvo.appendChild(
    h('div', { className: 'jarvis-msg jarvis-msg--ai', id: 'jv-typing' },
      h('div', { className: 'jarvis-msg__avatar' }, '◉'),
      h('div', { className: 'jarvis-msg__body' },
        h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
        h('div', { className: 'jarvis-msg__text jarvis-typing' },
          h('span', null, '●'), h('span', null, '●'), h('span', null, '●'))
      )
    )
  );
  scrollDown();
}
function removeTyping(): void { document.getElementById('jv-typing')?.remove(); }
function scrollDown(): void { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; }

/* ===== Envio ===== */

/** Corpus de memória: um resumo por sessão anterior (estilo claude-mem). */
async function buildMemoryCorpus(excludeSessionId: string | null): Promise<RecallDoc[]> {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const revision = getMemoryRevision();
  if (excludeSessionId === null) {
    const cached = getMemoryCorpusCache(revision);
    if (cached !== null) {
      recordMemoryCorpusObservation({
        revision,
        documents: cached.length,
        cacheHit: true,
        buildMs: 0,
      });
      return cached;
    }
  }

  const all = await getAllMessages();
  const bySession = new Map<string, JarvisMessage[]>();
  for (const m of all) {
    if (m.sessionId === excludeSessionId) continue;
    if (m.role !== 'user' && m.role !== 'jarvis') continue;
    const lista = bySession.get(m.sessionId);
    if (lista) lista.push(m);
    else bySession.set(m.sessionId, [m]);
  }
  const docs: RecallDoc[] = [];
  for (const [sid, msgs] of bySession) {
    msgs.sort((a, b) => a.ts - b.ts);
    const summary = summarizeSession(msgs);
    if (summary) docs.push({ text: summary, sessionId: sid });
  }
  const boundedDocs = docs.slice(0, 256);
  if (excludeSessionId === null) {
    setMemoryCorpusCache(revision, boundedDocs);
    recordMemoryCorpusObservation({
      revision,
      documents: boundedDocs.length,
      cacheHit: false,
      buildMs: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - startedAt,
    });
  }
  return boundedDocs;
}

async function handleSend(): Promise<void> {
  if (busy) return;
  const entrada = exigir(inputEl, 'inputEl');
  const text = entrada.value.trim();
  if (!text) return;

  const conf = cfg();

  if (!activeSession) {
    activeSession = await createSession(text.slice(0, 40), conf.mode);
    await refreshSessions();
  }
  /* a sessão entra numa const: o narrowing não sobrevive aos `await` seguintes,
   * e é o mesmo objeto que recebe todas as mensagens desta rodada */
  const sessao = activeSession;

  entrada.value = '';
  const userMsg = await addMessage(sessao.id, 'user', text);
  messages.push(userMsg);
  renderBubble('user', text);
  captureConversation(text); /* auto-memória: tudo que o operador escreve vira memória durável */
  scrollDown();

  if (messages.filter((m) => m.role === 'user').length === 1) {
    await updateSession(sessao.id, { title: text.slice(0, 40) });
    await refreshSessions();
  }

  busy = true;
  renderTyping();

  try {
    const convo = messages.filter((m) => m.role === 'user' || m.role === 'jarvis');
    const preparationStarted = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const agentMode = conf.mode === 'agente' || conf.mode === 'hermes-agente';
    const contextSelection = selectContextMessages(convo, agentMode
      ? { maxMessages: 32, maxCharacters: 18_000 }
      : { maxMessages: 24, maxCharacters: 12_000 });
    const convoForModel = contextSelection.messages;
    const preparationNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
    recordJarvisContextObservation({
      mode: conf.mode ?? 'unknown',
      ...contextSelection.metrics,
      preparationMs: preparationNow - preparationStarted,
    });

    /* doc 07: injeta o estado vivo do site como contexto oculto (somente
     * leitura). Cópia por chamada — não persiste no systemPrompt salvo. */
    const callConfig: JarvisConfig = conf.mode === 'local'
      ? conf
      : {
        ...conf,
        systemPrompt: `${conf.systemPrompt}\n\n${getJarvisRuntimeContext({ compact: !agentMode })}`,
        ...(agentMode ? { toolFocus: text } : {}),
      };

    /* Memória entre conversas (claude-mem): injeta resumos relevantes de
     * sessões anteriores. Best-effort, só nos modos de IA. */
    if (conf.mode !== 'local' && conf.memoryOn) {
      try {
        const fullCorpus = await buildMemoryCorpus(null);
        setMemoryCache(fullCorpus); /* memória disponível p/ a ferramenta do agente */
        const recallIndex = getMemoryCorpusIndex(getMemoryRevision());
        const recalled = recall(
          text,
          fullCorpus.filter((d) => d.sessionId !== sessao.id),
          3,
          recallIndex,
        );
        if (recalled.length) {
          callConfig.systemPrompt = `${callConfig.systemPrompt ?? ''}\n\n## MEMÓRIA (resumos de conversas anteriores, relevantes à pergunta)\n`
            + recalled.map((r) => `- ${r.text}`).join('\n');
          renderBubble('tool', `🧠 lembrei de ${recalled.length} conversa(s) anterior(es)`);
          scrollDown();
        }
      } catch { /* memória é best-effort */ }
    }

    /* Memória durável (supermemory): fatos curados ligados ao Segundo Cérebro. */
    if (conf.mode !== 'local') {
      try {
        const durable = memoryContext(text, 5);
        if (durable) callConfig.systemPrompt = `${callConfig.systemPrompt ?? ''}\n\n${durable}`;
      } catch { /* best-effort */ }
    }

    if (conf.mode === 'local') {
      await new Promise((r) => setTimeout(r, 220));
      const result = processLocal(text);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', result.text);
      messages.push(jMsg);
      renderBubble('jarvis', result.text);
      if (result.action?.type === 'navigate') {
        const destino = result.action.payload;
        setTimeout(() => router.navigate(destino), 600);
      } else if (result.action?.type === 'chart') {
        renderChartBubble(result.action.payload);
        scrollDown();
      }
    } else if (conf.mode === 'claude') {
      const reply = await processClaude(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'ollama') {
      const reply = await processOllama(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'hermes-local') {
      const reply = await processHermesLocal(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'noticias') {
      const reply = await processNewsBriefing(text, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'servidor') {
      const reply = await processServer(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'hermes') {
      const reply = await processHermes(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'claude-servidor') {
      const reply = await processClaudeServer(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'openclaw') {
      const reply = await processOpenClaw(convoForModel, callConfig);
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (conf.mode === 'webllm') {
      /* Streaming: bolha que cresce a cada token; durante o download do
       * modelo, a bolha de "digitando" mostra o progresso.
       *
       * A bolha mora num objeto, e não numa variável solta, porque quem a cria
       * é o callback `onToken` — o TypeScript não enxerga atribuição feita
       * dentro de closure e concluiria que ela continua `null` depois do
       * `await`, o que é justamente o contrário do que acontece. */
      const viva: { el: HTMLDivElement | null } = { el: null };
      const ensureBubble = (): HTMLDivElement => {
        if (viva.el) return viva.el;
        removeTyping();
        const bolha = h('div', { className: 'jarvis-msg__text' }, '');
        viva.el = bolha;
        exigir(messagesEl, 'messagesEl').appendChild(
          h('div', { className: 'jarvis-msg jarvis-msg--ai' },
            h('div', { className: 'jarvis-msg__avatar' }, '◉'),
            h('div', { className: 'jarvis-msg__body' },
              h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
              bolha
            )
          )
        );
        return bolha;
      };
      const reply = await processWebLLM(convoForModel, callConfig, {
        onProgress: (texto) => {
          const tx = document.getElementById('jv-typing')?.querySelector('.jarvis-msg__text');
          if (tx) { tx.classList.remove('jarvis-typing'); tx.textContent = '⬇ Carregando modelo… ' + texto; }
          scrollDown();
        },
        onToken: (partial) => { ensureBubble().textContent = partial; scrollDown(); }
      });
      removeTyping();
      const bolhaFinal = viva.el;
      if (bolhaFinal) { empty(bolhaFinal); bolhaFinal.appendChild(renderRich(reply)); }
      else renderBubble('jarvis', reply);
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
    } else if (conf.mode === 'agente') {
      const reply = await processAgent(convoForModel, callConfig, (toolName, input, result) => {
        removeTyping();
        renderToolCall(toolName, input, result);
        const summary = `${toolName} → ${result && result.ok ? 'ok' : 'erro'}`;
        void addMessage(sessao.id, 'tool', summary);
        renderTyping();
        scrollDown();
      });
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
    } else if (conf.mode === 'hermes-agente') {
      /* Agente Hermes LOCAL (WebLLM): tool-calls visíveis + progresso do
       * download do modelo na 1ª carga. Sem API, sem chave. */
      const reply = await processHermesAgent(convoForModel, callConfig,
        (toolName, input, result) => {
          removeTyping();
          renderToolCall(toolName, input, result);
          const summary = `${toolName} → ${result && result.ok ? 'ok' : 'erro'}`;
          void addMessage(sessao.id, 'tool', summary);
          renderTyping();
          scrollDown();
        },
        {
          onProgress: (texto) => {
            const tx = document.getElementById('jv-typing')?.querySelector('.jarvis-msg__text');
            if (tx) { tx.classList.remove('jarvis-typing'); tx.textContent = '⬇ Carregando Hermes local… ' + texto; }
            scrollDown();
          }
        });
      removeTyping();
      const jMsg = await addMessage(sessao.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
    }
  } catch (e) {
    removeTyping();
    /* Erros de configuração/conexão (servidor/ollama fora do ar, sem API key,
     * sem WebGPU) não são "falha" — são setup. Mostramos um aviso acionável
     * com a opção de responder agora no modo Local, que sempre funciona. */
    /* Qualquer falha num modo que não seja o Local oferece os atalhos de
     * fallback (Navegador/Local), que sempre têm como funcionar. */
    const erroMsg = e instanceof Error ? e.message : String(e);
    const isSetup = conf.mode !== 'local';
    const prefix = isSetup ? '⚙ ' : '⚠ ';
    const msgText = prefix + erroMsg;

    const textEl = h('div', { className: 'jarvis-msg__text' }, h('div', null, msgText));
    if (isSetup) {
      const actions = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' } });
      /* Caminho sem instalar/rodar nada: a IA roda no próprio navegador. */
      if (conf.mode !== 'webllm') {
        actions.appendChild(h('button', {
          className: 'btn btn--primary btn--sm',
          onclick: () => {
            conf.mode = 'webllm';
            saveConfig(conf);
            updateModeBadge();
            entrada.value = text;
            entrada.focus();
            toast('Modo Navegador ativado (IA no navegador, sem servidor). Enter para enviar.', { type: 'info', duration: 4500 });
          }
        }, '⬡ Usar modo Navegador (sem servidor)'));
      }
      actions.appendChild(h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: async () => {
          const r = processLocal(text);
          const jm = await addMessage(sessao.id, 'jarvis', r.text);
          messages.push(jm);
          renderBubble('jarvis', r.text);
          if (r.action?.type === 'navigate') {
            const destino = r.action.payload;
            setTimeout(() => router.navigate(destino), 600);
          }
          scrollDown();
        }
      }, '↩ Responder no modo Local'));
      textEl.appendChild(actions);
    }
    exigir(messagesEl, 'messagesEl').appendChild(
      h('div', { className: 'jarvis-msg jarvis-msg--ai' },
        h('div', { className: 'jarvis-msg__avatar' }, '◉'),
        h('div', { className: 'jarvis-msg__body' },
          h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
          textEl))
    );
    await addMessage(sessao.id, 'jarvis', msgText);
    toast(erroMsg, { type: isSetup ? 'warning' : 'danger' });
  } finally {
    busy = false;
    scrollDown();
    inputEl?.focus();
  }
}

/* ===== Config ===== */

function updateModeBadge(): void {
  const m = MODES.find((x) => x.id === cfg().mode);
  if (modeBadgeEl && m) {
    modeBadgeEl.textContent = `${m.icon} ${m.label.toUpperCase()}`;
    modeBadgeEl.className = `badge badge--${m.badge}`;
    markXiiiConsole?.setMode(m.label);
  }
}

function renderConfigPanel(): HTMLDivElement {
  const conf = cfg();
  const panel = h('div', { className: 'jarvis-config' });

  const modeBar = h('div', { className: 'jv-mode-grid' });
  const bodyEl = h('div', { className: 'jarvis-config__body' });

  function renderModes(): void {
    empty(modeBar);
    MODES.forEach((m) => {
      modeBar.appendChild(
        h('button', {
          className: cx('jv-mode', conf.mode === m.id && 'is-active'),
          onclick: () => {
            conf.mode = m.id;
            saveConfig(conf);
            updateModeBadge();
            renderModes();
            renderBody();
          }
        },
          h('span', { className: 'jv-mode__icon' }, m.icon),
          h('span', { className: 'jv-mode__label' }, m.label),
          h('span', { className: 'jv-mode__desc u-text-muted' }, m.desc)
        )
      );
    });
  }

  function renderBody(): void {
    empty(bodyEl);
    if (conf.mode === 'claude' || conf.mode === 'agente') {
      const keyInput = h('input', {
        className: 'input', type: 'password', placeholder: 'sk-ant-...',
        value: conf.apiKey || '',
        oninput: (e: Event) => { conf.apiKey = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const modelSel = h('select', { className: 'input',
        onchange: (e: Event) => { conf.model = valorDoCampo(e); saveConfig(conf); } },
        h('option', { value: 'claude-sonnet-4-6', selected: conf.model === 'claude-sonnet-4-6' }, 'Claude Sonnet 4.6'),
        h('option', { value: 'claude-opus-4-7', selected: conf.model === 'claude-opus-4-7' }, 'Claude Opus 4.7'),
        h('option', { value: 'claude-haiku-4-5-20251001', selected: conf.model === 'claude-haiku-4-5-20251001' }, 'Claude Haiku 4.5')
      );
      bodyEl.append(
        h('label', null, h('span', null, 'CLAUDE API KEY'), keyInput),
        h('label', null, h('span', null, 'MODELO'), modelSel)
      );
      if (conf.mode === 'agente') {
        bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚛ Modo agente: o Claude usa ferramentas pra navegar, abrir o editor, consultar Arsenal/Elites/Crônicas e calcular. Cada chamada aparece no chat.'));
      }
      bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
        '⚠ A key fica no localStorage e vai direto pra api.anthropic.com.'));
    } else if (conf.mode === 'ollama') {
      const urlInput = h('input', {
        className: 'input', type: 'text', value: conf.ollamaUrl || 'http://localhost:11434',
        oninput: (e: Event) => { conf.ollamaUrl = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const modelInput = h('input', {
        className: 'input', type: 'text', value: String(conf.ollamaModel ?? 'llama3.2'),
        placeholder: 'llama3.2, mistral, phi3…',
        oninput: (e: Event) => { conf.ollamaModel = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      bodyEl.append(
        h('label', null, h('span', null, 'OLLAMA URL'), urlInput),
        h('label', null, h('span', null, 'MODELO LOCAL'), modelInput),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⬢ Requer Ollama rodando ("ollama serve"). 100% local. ' +
          'Pode precisar de OLLAMA_ORIGINS=* para aceitar requests do browser.')
      );
    } else if (conf.mode === 'hermes-local') {
      const hlUrl = h('input', {
        className: 'input', type: 'text', value: String(conf.hermesLocalUrl ?? HERMES_LOCAL_DEFAULT_URL),
        placeholder: HERMES_LOCAL_DEFAULT_URL,
        oninput: (e: Event) => { conf.hermesLocalUrl = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const hlModel = h('input', {
        className: 'input', type: 'text', value: String(conf.hermesLocalModel ?? ''),
        placeholder: 'vazio = modelo carregado no servidor',
        oninput: (e: Event) => { conf.hermesLocalModel = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const presets = HERMES_LOCAL_PRESETS
        .map((p) => `${p.label} → ${p.url}`).join(' · ');
      bodyEl.append(
        h('label', null, h('span', null, 'ENDPOINT LOCAL (OpenAI-compatível)'), hlUrl),
        h('label', null, h('span', null, 'MODELO'), hlModel),
        h('p', { className: 'jarvis-config__warn u-text-muted' }, `⬢ Portas conhecidas: ${presets}.`),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚠ O servidor local precisa aceitar o site (CORS): LM Studio → Developer → "Enable CORS"; ' +
          'Ollama → variável de ambiente OLLAMA_ORIGINS="*" antes do "ollama serve"; ' +
          'text-generation-webui → flags --api --api-enable-cors. 100% privado: nada sai da sua máquina.')
      );
    } else if (conf.mode === 'noticias') {
      const newsUrl = h('input', {
        className: 'input', type: 'text', value: conf.serverUrl || '',
        placeholder: 'vazio = backend embutido (/api)',
        oninput: (e: Event) => { conf.serverUrl = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      bodyEl.append(
        h('label', null, h('span', null, 'URL DO BACKEND DE NOTÍCIAS'), newsUrl),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '◈ O briefing usa busca web no backend existente, preserva a URL original e produz apenas rascunho de leitura. Não envia WhatsApp nem publica conteúdo.'),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          'Deixe vazio no site publicado para usar /api. Em desenvolvimento, configure o backend local correspondente.')
      );
    } else if (conf.mode === 'openclaw') {
      const ocUrl = h('input', {
        className: 'input', type: 'text', value: String(conf.openclawUrl ?? 'http://localhost:18789'),
        oninput: (e: Event) => { conf.openclawUrl = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const ocPath = h('input', {
        className: 'input', type: 'text', value: String(conf.openclawPath ?? '/v1/chat/completions'),
        oninput: (e: Event) => { conf.openclawPath = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      bodyEl.append(
        h('label', null, h('span', null, 'OPENCLAW URL'), ocUrl),
        h('label', null, h('span', null, 'ENDPOINT (chat)'), ocPath),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '🐾 OpenClaw é self-hosted e hoje expõe /v1/chat/completions na porta do Gateway. Se sua instalação não expuser esse endpoint, use scripts/openclaw-bridge.mjs; mantenha tokens no processo local e não no navegador. Definir a URL aqui também faz o OpenClaw entrar no Conselho.')
      );
    } else if (conf.mode === 'servidor') {
      const urlInput = h('input', {
        className: 'input', type: 'text', value: conf.serverUrl || '',
        placeholder: 'vazio = backend embutido (/api)',
        oninput: (e: Event) => { conf.serverUrl = valorDoCampo(e).trim(); saveConfig(conf); }
      });
      const testStatus = h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, '');
      const testBtn = h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: async () => {
          testStatus.textContent = 'testando…';
          testStatus.className = 'u-text-muted';
          try {
            const info = await healthCheckServer(conf.serverUrl);
            const observedHealth = info.health === 'healthy' || info.health === 'degraded'
              ? info.health
              : info.hasKey ? 'healthy' : 'degraded';
            const observedSeverity = info.severity === 'none' || info.severity === 'info' || info.severity === 'warning' || info.severity === 'critical'
              ? info.severity
              : info.hasKey ? 'none' : 'warning';
            const observedFallback = info.fallback === 'available' || info.fallback === 'degraded' || info.fallback === 'blocked' || info.fallback === 'unknown'
              ? info.fallback
              : info.hasKey ? 'available' : 'degraded';
            applyRuntimeObservation({
              source: 'runtime-observed',
              connection: info.connection === 'disconnected' ? 'disconnected' : 'connected',
              authority: 'not-authorized',
              health: observedHealth,
              severity: observedSeverity,
              fallback: observedFallback,
              detail: info.detail ?? (info.hasKey ? 'health endpoint + Gemini key observados' : 'health endpoint observado; chave Gemini ausente'),
            });
            testStatus.textContent = observedHealth === 'healthy' ? '✓ online · chave Gemini OK' : '✓ online · backend degradado';
            testStatus.className = observedHealth === 'healthy' ? 'u-text-cyan' : 'u-text-warning';
          } catch {
            applyRuntimeObservation({
              source: 'runtime-observed',
              connection: 'disconnected',
              authority: 'not-authorized',
              health: 'failed',
              severity: 'critical',
              fallback: 'blocked',
              detail: 'health endpoint não respondeu',
            });
            testStatus.textContent = '✗ offline — rode backend/server.py';
            testStatus.className = 'u-text-muted';
          }
        }
      }, 'Testar conexão');
      bodyEl.append(
        h('label', null, h('span', null, 'URL DO SERVIDOR'), urlInput),
        h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' } }, testBtn, testStatus),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⊛ No site publicado: deixe a URL VAZIA — usa o backend embutido na Vercel (/api). Só defina GEMINI_API_KEY nas Environment Variables do projeto na Vercel e faça redeploy. ' +
          'Local (npm run dev): use http://127.0.0.1:8000 com backend/server.py rodando.')
      );
    } else if (conf.mode === 'webllm' || conf.mode === 'hermes-agente') {
      /* O agente local guarda o modelo em chave PRÓPRIA (hermesAgentModel) e
       * defaulta pro Nous Hermes 2 Pro — não herda o modelo do modo Navegador
       * (evita rodar o agente num modelo fraco em tool-calling como o Llama 1B). */
      const isAgent = conf.mode === 'hermes-agente';
      const modelKey = isAgent ? 'hermesAgentModel' : 'webllmModel';
      const defModel = isAgent ? HERMES_AGENT_DEFAULT : WEBLLM_MODELS[0].id;
      const modeloAtual = (): string => String(conf[modelKey] ?? defModel);
      const modelSel = h('select', { className: 'input',
        onchange: (e: Event) => { conf[modelKey] = valorDoCampo(e); saveConfig(conf); } },
        ...WEBLLM_MODELS.map((m) =>
          h('option', { value: m.id, selected: modeloAtual() === m.id }, m.label))
      );
      const tCur = typeof conf.webllmTemp === 'number' ? conf.webllmTemp : 0.7;
      const tOut = h('span', { className: 'u-mono u-text-cyan', style: { minWidth: '30px', textAlign: 'right' } }, tCur.toFixed(1));
      const tSlider = h('input', {
        type: 'range', min: 0.1, max: 1.2, step: 0.1, value: tCur, style: { flex: '1', accentColor: 'var(--color-cyan)' },
        oninput: (e: Event) => {
          const temp = parseFloat(valorDoCampo(e));
          conf.webllmTemp = temp;
          tOut.textContent = temp.toFixed(1);
          saveConfig(conf);
        }
      });
      const dlBar = h('span', { style: { display: 'block', height: '100%', width: getLoadedModel() ? '100%' : '0%', background: 'linear-gradient(90deg, var(--color-cyan), var(--color-magenta))', transition: 'width .2s' } });
      const dlWrap = h('div', { style: { height: '6px', borderRadius: '999px', background: 'var(--color-bg-elevated)', overflow: 'hidden', margin: '6px 0', display: getLoadedModel() ? 'block' : 'none' } }, dlBar);
      const dlStatus = h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, getLoadedModel() ? '✓ modelo carregado' : 'modelo não carregado');
      const dlBtn = h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: async () => {
          if (!isWebGPUAvailable()) { toast('Sem WebGPU neste navegador.', { type: 'warning' }); return; }
          dlBtn.disabled = true; dlWrap.style.display = 'block'; dlStatus.textContent = 'baixando/carregando…';
          try {
            await preloadWebLLM(modeloAtual(), (txt, frac) => {
              dlBar.style.width = Math.round((frac || 0) * 100) + '%';
              if (txt) dlStatus.textContent = txt;
            });
            dlBar.style.width = '100%'; dlStatus.textContent = '✓ modelo carregado — pronto pra conversar';
            toast('Modelo carregado no navegador.', { type: 'success' });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            dlStatus.textContent = '✗ ' + (msg || 'falhou');
            toast(msg || 'Falha ao carregar.', { type: 'warning' });
          } finally { dlBtn.disabled = false; }
        }
      }, '⬇ Baixar / carregar modelo');
      bodyEl.append(
        h('label', null, h('span', null, 'MODELO (roda no navegador)'), modelSel),
        h('label', { style: { display: 'flex', flexDirection: 'column', gap: '4px' } },
          h('span', null, 'TEMPERATURA'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, tSlider, tOut)),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } }, dlBtn, dlStatus),
        dlWrap
      );
      if (!isWebGPUAvailable()) {
        bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚠ Este navegador não tem WebGPU. Use Chrome ou Edge atualizados para o modo Navegador.'));
      }
      bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
        '⬡ A IA roda na sua máquina via WebGPU. Baixe o modelo uma vez (botão acima) — fica em cache e depois funciona offline. Nada é enviado a servidores.'));
    } else {
      bodyEl.appendChild(
        h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } },
          'Modo local: assistente de regras. Sem custo, offline. Navega e consulta dados do Baluarte.')
      );
    }
  }

  function profileRow(): HTMLLabelElement {
    const current = String(conf.profile ?? 'tatico');
    return h('label', { className: 'jv-profile' },
      h('span', null, 'PERFIL DA IA'),
      h('select', { className: 'input',
        onchange: (e: Event) => {
          const escolhido = valorDoCampo(e);
          conf.profile = escolhido;
          conf.systemPrompt = ehPerfil(escolhido) ? SYSTEM_PROMPTS[escolhido] : SYSTEM_PROMPTS.tatico;
          saveConfig(conf);
        } },
        h('option', { value: 'tatico', selected: current === 'tatico' }, 'Tático — conversa concisa'),
        h('option', { value: 'engenheiro', selected: current === 'engenheiro' }, 'Engenheiro de código'),
        h('option', { value: 'nucleo', selected: current === 'nucleo' }, 'Núcleo — raciocínio em 3 camadas')
      )
    );
  }

  function humanizeRow(): HTMLLabelElement {
    const cb = h('input', {
      type: 'checkbox', checked: !!conf.humanizeOn,
      onchange: (e: Event) => { conf.humanizeOn = marcado(e); saveConfig(conf); renderMessages(); }
    });
    return h('label', { className: 'jv-profile', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      h('span', null, 'HUMANIZAR RESPOSTAS'),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'remove clichês de IA'),
        cb));
  }

  function memoryRow(): HTMLLabelElement {
    const cb = h('input', {
      type: 'checkbox', checked: !!conf.memoryOn,
      onchange: (e: Event) => { conf.memoryOn = marcado(e); saveConfig(conf); }
    });
    return h('label', { className: 'jv-profile', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      h('span', null, 'MEMÓRIA ENTRE CONVERSAS'),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'lembra de conversas anteriores'),
        cb));
  }

  /* Skills auto-criadas (hermes): lista o que o JARVIS aprendeu + apagar. */
  function skillsRow(): HTMLDivElement {
    const wrap = h('div', { className: 'jv-profile', style: { display: 'block' } });
    function render(): void {
      empty(wrap);
      const skills = listSkillSummaries();
      wrap.appendChild(
        h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: skills.length ? '6px' : '0' } },
          h('span', null, '🧬 SKILLS APRENDIDAS'),
          h('span', { className: 'u-text-muted', style: { fontSize: '11px' } },
            skills.length ? `${skills.length} habilidade${skills.length > 1 ? 's' : ''}` : 'nenhuma ainda'))
      );
      if (!skills.length) {
        wrap.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '11px', margin: 0 } },
          'No modo Agente, peça: "crie uma skill que…". O JARVIS escreve, salva e passa a usá-la sozinho.'));
        return;
      }
      skills.forEach((s) => {
        wrap.appendChild(
          h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,.08)' } },
            h('div', { style: { flex: '1', minWidth: '0' } },
              h('div', { className: 'u-mono u-text-cyan', style: { fontSize: '12px' } }, s.name),
              h('div', { className: 'u-text-muted', style: { fontSize: '11px' } }, s.description),
              h('div', { className: 'u-text-muted', style: { fontSize: '10px', opacity: '0.7' } }, `usada ${s.runs || 0}×`)),
            h('button', {
              className: 'jv-session__del', title: 'Apagar skill',
              onclick: () => {
                if (!confirm(`Apagar a skill "${s.name}"?`)) return;
                removeSkill(s.name);
                render();
                toast(`Skill "${s.name}" apagada.`, { type: 'info' });
              }
            }, '×'))
        );
      });
    }
    render();
    return wrap;
  }

  renderModes();
  renderBody();
  panel.append(modeBar, profileRow(), humanizeRow(), memoryRow(), skillsRow(), bodyEl);
  return panel;
}

/* ===== Page builder ===== */

export function jarvisPage(): HTMLDivElement {
  disposeMarkXiiiConsole();
  const conf = loadConfig();
  config = conf;
  if (conf.humanizeOn === undefined) conf.humanizeOn = true;
  if (conf.memoryOn === undefined) conf.memoryOn = true;
  activeSession = null;
  messages = [];
  initSkills(); /* registra as skills aprendidas como ferramentas do agente */
  /* Preenche o cache de memória p/ a ferramenta recall_memory do agente. */
  buildMemoryCorpus(null).then(setMemoryCache).catch(() => {});

  const fullPage = h('div', { className: 'page-jarvis' });

  modeBadgeEl = h('span', { className: 'badge badge--cyan' }, '');
  const spotifyConnected = isSpotifyConnected();
  markXiiiConsole = createMarkXiiiConsole({
    version: `V${VERSION}`,
    musicConnected: spotifyConnected,
    onMusic: () => spotifyButton.click(),
  });
  markXiiiRuntimeOff = bus.on<{ connected?: boolean; detail?: string }>('nucleo:status', (status) => {
    applyRuntimeObservation({
      source: 'v1-nucleo-event',
      connection: status.connected === true ? 'connected' : 'disconnected',
      authority: 'not-authorized',
      health: 'unknown',
      severity: 'info',
      fallback: status.connected === true ? 'unknown' : 'blocked',
      ...(status.detail ? { detail: status.detail } : {}),
    });
  });
  markXiiiRouteOff = bus.on<{ path?: string }>('route:change', ({ path }) => {
    if (path !== '/jarvis') disposeMarkXiiiConsole();
  });
  const browserReference = h('img', {
    className: 'jv-visual-switcher__reference',
    src: '/jarvis/jarvis-nucleo-browser.webp',
    alt: 'Núcleo dourado J.A.R.V.I.S. do Projeto Baluarte',
    loading: 'eager',
    decoding: 'async',
  });
  const visualFallback = h('div', {
    className: 'jv-visual-switcher__reference-fallback',
    'aria-label': 'Referência visual do núcleo J.A.R.V.I.S.',
  }, browserReference, markXiiiConsole.root);
  jarvisV7Visual = createJarvisV7Visual({
    fallback: visualFallback,
    onState: (state) => {
      if (markXiiiConsole) markXiiiConsole.root.dataset.visualV7State = state;
    },
  });
  fullPage.appendChild(jarvisV7Visual.root);

  let configOpen = false;
  const configWrap = h('div', { className: 'jarvis-config-wrap', style: { display: 'none' } });
  const configToggle = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      configOpen = !configOpen;
      configWrap.style.display = configOpen ? 'block' : 'none';
      if (configOpen) { empty(configWrap); configWrap.appendChild(renderConfigPanel()); }
    }
  }, '⚙ Modos & Config');

  const skillCount = listSkillSummaries().length;
  const configuredSpotifyClientId = getConfiguredSpotifyClientId();
  const savedSpotifyClientId = getSpotifyClientId();
  const spotifyClientInput = h('input', {
    className: 'input input--sm',
    type: 'text',
    autocomplete: 'off',
    spellcheck: 'false',
    value: configuredSpotifyClientId || savedSpotifyClientId,
    placeholder: configuredSpotifyClientId ? 'Spotify configurado pelo app' : 'Client ID público',
    'aria-label': 'Client ID público do Spotify',
    disabled: Boolean(configuredSpotifyClientId),
    style: { width: '220px' },
    oninput: (e: Event) => {
      const value = valorDoCampo(e).trim();
      if (!value) spotifyInputStatus.textContent = 'ainda não configurado';
      else if (value.startsWith('spak_')) spotifyInputStatus.textContent = 'isso é chave Soloist, não Client ID';
      else if (!isSpotifyClientId(value)) spotifyInputStatus.textContent = 'formato não reconhecido';
      else spotifyInputStatus.textContent = 'pronto para conectar';
    },
  });
  const spotifyInputStatus = h('span', { className: 'u-text-muted', 'aria-live': 'polite', style: { fontSize: '11px' } },
    configuredSpotifyClientId ? 'configurado pelo app' : savedSpotifyClientId ? 'salvo neste dispositivo' : 'ainda não configurado');
  const spotifyStatus = h('span', { className: 'badge badge--cyan' }, spotifyConnected ? 'SPOTIFY · ONLINE' : 'SPOTIFY · OFF');
  const spotifyButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (isSpotifyConnected()) { disconnectSpotify(); spotifyStatus.textContent = 'SPOTIFY · OFF'; spotifyButton.textContent = '♫ Conectar Spotify'; markXiiiConsole?.setMusic(false); return; }
      const clientId = spotifyClientInput.value.trim();
      if (!clientId) { toast('O Spotify ainda não está configurado neste app. Peça ao administrador para concluir a configuração uma única vez.'); return; }
      if (clientId.startsWith('spak_')) { toast('Essa é uma chave do Spotify Soloist. Não cole chaves spak_ aqui; este campo aceita somente Client ID público.'); return; }
      if (!isSpotifyClientId(clientId)) { toast('Esse valor não parece um Client ID público do Spotify. Confira o campo e tente novamente.'); return; }
      rememberSpotifyClientId(clientId);
      const redirectUri = `${location.origin}${location.pathname}`;
      const returnTo = `${location.pathname}${location.search}${location.hash}`;
      void beginSpotifyAuthorization({ clientId, redirectUri, returnTo, scope: 'user-read-playback-state' }).then((url) => { location.assign(url); }).catch((error: unknown) => { toast(error instanceof Error ? error.message : 'Não foi possível iniciar o Spotify.'); });
    }
  }, spotifyConnected ? '♫ Desconectar Spotify' : '♫ Conectar Spotify');
  const onSpotifySession = (event: Event): void => {
    const detail = (event as CustomEvent<SpotifySessionEventDetail>).detail;
    if (!detail || typeof detail.connected !== 'boolean') return;
    markXiiiConsole?.setMusic(detail.connected);
    if (detail.playback === 'playing' || detail.playback === 'paused' || detail.playback === 'unknown') {
      markXiiiConsole?.setPlayback(detail.playback);
    }
    spotifyStatus.textContent = detail.connected ? 'SPOTIFY · ONLINE' : 'SPOTIFY · OFF';
    spotifyButton.textContent = detail.connected ? '♫ Desconectar Spotify' : '♫ Conectar Spotify';
  };
  globalThis.addEventListener('baluarte:spotify-session', onSpotifySession);
  markXiiiSpotifyOff = () => globalThis.removeEventListener('baluarte:spotify-session', onSpotifySession);
  const spotifyClearButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    type: 'button',
    style: { display: configuredSpotifyClientId ? 'none' : 'inline-flex' },
    onclick: () => {
      rememberSpotifyClientId('');
      spotifyClientInput.value = '';
      spotifyInputStatus.textContent = 'ainda não configurado';
      toast('Client ID removido somente deste dispositivo.', { type: 'info' });
    },
  }, 'Limpar neste dispositivo');
  const spotifyClientRow = h('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' } },
    h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'Client ID público'),
    spotifyClientInput,
    spotifyInputStatus,
    spotifyClearButton,
  );
  const spotifyControls = h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '8px' } }, spotifyStatus, spotifyClientRow, spotifyButton);
  const spotifyHint = h('div', { className: 'jarvis-config__warn u-text-muted', style: { margin: '6px 0 0' } },
    h('p', { style: { margin: '0 0 6px' } },
      `O app pode vir com a configuração pronta. Se aparecer o campo vazio, um administrador precisa cadastrar uma única vez o Client ID público. Redirect URI deste app: `,
      h('code', null, `${location.origin}${location.pathname}`),
      '. O fluxo usa PKCE/S256, não usa Client Secret e pede somente leitura.'),
    h('details', null,
      h('summary', { style: { cursor: 'pointer' } }, 'Como conectar em 3 passos'),
      h('ol', { style: { margin: '6px 0 0', paddingLeft: '20px' } },
        h('li', null, 'Clique em “Conectar Spotify”.'),
        h('li', null, 'Entre na sua conta Spotify e aceite a permissão de leitura.'),
        h('li', null, 'Volte para o JARVIS; o núcleo mostrará a presença musical quando houver playback.'),
      ),
      h('p', { style: { margin: '6px 0 0' } }, 'Nunca cole aqui senha, Client Secret, token ou uma chave que comece com spak_. Essa chave pertence ao Soloist local e não é necessária para este botão.'),
    ));
  fullPage.appendChild(
    h('div', { className: 'jarvis-toolbar' },
      modeBadgeEl,
      isUsingFallback() && h('span', { className: 'badge badge--warning' }, 'MEMÓRIA VOLÁTIL'),
      skillCount > 0 && h('span', { className: 'badge badge--cyan', title: 'Habilidades que o JARVIS aprendeu' },
        `🧬 ${skillCount} skill${skillCount > 1 ? 's' : ''}`),
      h('div', { style: { marginLeft: 'auto' } }, configToggle)
    )
  );
  fullPage.appendChild(configWrap);
  fullPage.appendChild(h('div', { className: 'card', style: { marginBottom: '10px' } },
    h('b', null, '♫ Presença musical externa'),
    h('span', { className: 'u-text-muted', style: { marginLeft: '8px' } }, 'somente metadados de playback; sem áudio e sem comandos de reprodução'),
    spotifyControls,
    spotifyHint,
  ));

  sessionsEl = h('div', { className: 'jv-sessions__list' });
  const sessionsPanel = h('div', { className: 'jv-sessions' },
    h('button', { className: 'btn btn--primary btn--sm', onclick: newSession }, '+ Nova conversa'),
    sessionsEl
  );

  messagesEl = h('div', { className: 'jarvis-messages' });
  const entrada = h('textarea', {
    className: 'jarvis-input', rows: 1,
    placeholder: 'Mensagem…  (Enter envia · Shift+Enter quebra linha)',
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend(); }
    }
  });
  inputEl = entrada;
  const chatPanel = h('div', { className: 'jarvis-chat' },
    messagesEl,
    h('div', { className: 'jarvis-input-row' },
      entrada,
      h('button', { className: 'btn btn--primary', onclick: () => { void handleSend(); } }, '➤')
    )
  );

  fullPage.appendChild(
    h('div', { className: 'jv-layout' }, sessionsPanel, chatPanel)
  );

  updateModeBadge();
  renderMessages();
  void refreshSessions();
  setTimeout(() => entrada.focus(), 50);

  return fullPage;
}
