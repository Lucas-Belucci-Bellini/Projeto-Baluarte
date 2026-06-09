/**
 * Página /jarvis — J.A.R.V.I.S. completo (Fase 20).
 *
 * 6 modos: local, webllm (navegador), claude, ollama, servidor (gemini), agente.
 * Sessões múltiplas em IndexedDB. Tool calls visíveis no modo agente.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  loadConfig, saveConfig,
  processLocal, processClaude, processOllama, processServer, processHermes, processOpenClaw, processAgent,
  healthCheckServer, getBaluarteBriefing
} from '../utils/jarvis-engine.js';
import {
  processWebLLM, isWebGPUAvailable, WEBLLM_MODELS, preloadWebLLM, getLoadedModel
} from '../utils/jarvis-webllm.js';
import { highlight } from '../utils/syntax-highlight.js';
import { drawChart } from '../utils/chart-engine.js';
import { memoryContext, captureConversation, captureReply } from '../utils/jarvis-brain.js';
import { LANGS, langForExt } from '../data/editor-langs.js';
import { getStatusText } from '../utils/baluarte-status.js';
import { humanize } from '../utils/jarvis-style.js';
import {
  createSession, listSessions, updateSession, deleteSession,
  addMessage, getMessages, getAllMessages, isUsingFallback
} from '../utils/jarvis-memory.js';
import { recall, summarizeSession, setMemoryCache } from '../utils/jarvis-recall.js';
import { initSkills, removeSkill } from '../utils/jarvis-tools.js';
import { listSkillSummaries } from '../utils/jarvis-skills.js';

const MODES = [
  { id: 'local',  label: 'Local',  icon: '◆', badge: 'cyan',    desc: 'Assistente de regras. Offline, sem custo. Navega e consulta o Baluarte.' },
  { id: 'webllm', label: 'Navegador', icon: '⬡', badge: 'cyan', desc: 'IA real 100% no navegador via WebLLM (WebGPU). Sem servidor, sem API key. 1º uso baixa o modelo; depois roda offline.' },
  { id: 'claude', label: 'Claude', icon: '◉', badge: 'magenta', desc: 'Conversa livre via Claude API. Requer API key da Anthropic.' },
  { id: 'ollama', label: 'Ollama', icon: '⬢', badge: 'success', desc: 'Modelo local via Ollama (ollama serve). 100% privado.' },
  { id: 'servidor', label: 'Servidor', icon: '⊛', badge: 'success', desc: 'Backend Python + Gemini com busca web real (Google). Habilita a camada 2 do raciocínio. Requer rodar backend/server.py.' },
  { id: 'hermes', label: 'Hermes (servidor)', icon: '⬢', badge: 'success', desc: 'Nous Hermes via servidor (Vercel → OpenRouter): roda em qualquer device, sem WebGPU. Requer OPENROUTER_API_KEY nas envs da Vercel.' },
  { id: 'openclaw', label: 'OpenClaw', icon: '🐾', badge: 'cyan', desc: 'Assistente self-hosted OpenClaw (gateway local). Espera um endpoint de chat compatível (OpenAI); configure a URL. O gateway nativo é RPC — pode precisar de bridge.' },
  { id: 'agente', label: 'Agente', icon: '⚛', badge: 'warning', desc: 'Claude com ferramentas: navega, consulta e executa ações reais.' }
];

let config = null;
let sessions = [];
let activeSession = null;
let messages = [];
let busy = false;

let messagesEl, inputEl, sessionsEl, modeBadgeEl;

/* ===== Sessões ===== */

async function refreshSessions() {
  sessions = await listSessions();
  renderSessions();
}

function renderSessions() {
  if (!sessionsEl) return;
  empty(sessionsEl);
  if (!sessions.length) {
    sessionsEl.appendChild(h('div', { className: 'jv-sessions__empty u-text-muted' }, 'Sem conversas'));
    return;
  }
  sessions.forEach((s) => {
    const mode = MODES.find((m) => m.id === s.mode);
    sessionsEl.appendChild(
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
          onclick: async (e) => {
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

async function selectSession(id) {
  activeSession = sessions.find((s) => s.id === id);
  if (!activeSession) return;
  messages = await getMessages(id);
  renderSessions();
  renderMessages();
}

async function newSession() {
  activeSession = await createSession('Conversa ' + (sessions.length + 1), config.mode);
  messages = [];
  await refreshSessions();
  renderMessages();
  inputEl?.focus();
}

/* ===== Mensagens ===== */

function renderMessages() {
  if (!messagesEl) return;
  empty(messagesEl);

  if (!activeSession) {
    messagesEl.appendChild(
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
    const m = MODES.find((x) => x.id === activeSession.mode);
    messagesEl.appendChild(
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
const SYSTEM_PROMPTS = {
  tatico: 'Você é o J.A.R.V.I.S., assistente de IA do Projeto Baluarte Mark XIII. Responda em português, de forma concisa e tática. O operador é Lucas Belucci Bellini.',
  engenheiro: 'Você é o J.A.R.V.I.S. em modo engenheiro de software sênior do Projeto Baluarte. Responda em português com código limpo, otimizado e comentários quando ajudarem. Sempre coloque código em blocos markdown com a linguagem (```js, ```python…). Prefira o estilo do Baluarte: JavaScript puro (ES2022), sem framework e sem TypeScript.',
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

/* ===== Render de respostas com blocos de código realçados (doc 05) ===== */

const LANG_ALIASES = {
  js: 'javascript', mjs: 'javascript', ts: 'typescript', py: 'python',
  sh: 'shell', bash: 'shell', zsh: 'shell', shell: 'shell', console: 'shell',
  html: 'html', htm: 'html', xml: 'html', md: 'markdown', markdown: 'markdown',
  'c++': 'cpp', cpp: 'cpp', 'c#': 'csharp', cs: 'csharp', yml: 'yaml'
};

function resolveLang(tag) {
  if (!tag) return LANGS[0];
  const t = String(tag).toLowerCase();
  const id = LANG_ALIASES[t] || t;
  return LANGS.find((l) => l.id === id) || langForExt(t) || LANGS[0];
}

function codeBlock(code, langTag) {
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
function renderRich(text) {
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

function renderBubble(role, text) {
  if (role === 'tool') {
    messagesEl.appendChild(
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
  messagesEl.appendChild(
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

/* Desenha um gráfico como "imagem" dentro de uma bolha do JARVIS (issue #175). */
function renderChartBubble(payload) {
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

/* Extrai blocos ```chart``` (JSON) do texto da IA → desenha imagem; devolve o texto limpo. */
function extractCharts(text) {
  const charts = [];
  const clean = String(text || '').replace(/```chart\s*([\s\S]*?)```/gi, (whole, body) => {
    try {
      const spec = JSON.parse(body.trim());
      const values = (spec.values || []).map(Number).filter((n) => !Number.isNaN(n));
      if (values.length) {
        charts.push({
          type: spec.type || 'bar', title: spec.title || '',
          data: { labels: spec.labels && spec.labels.length ? spec.labels : values.map((_, i) => '#' + (i + 1)), values }
        });
        return '';
      }
    } catch { /* não é JSON válido — mantém o bloco no texto */ }
    return whole;
  }).trim();
  return { clean, charts };
}

/* Renderiza uma resposta do JARVIS: texto (limpo) + eventuais gráficos. */
function emitJarvis(text) {
  const { clean, charts } = extractCharts(text);
  if (clean) renderBubble('jarvis', clean);
  else if (!charts.length) renderBubble('jarvis', text);
  charts.forEach(renderChartBubble);
}

/* Tool-call expansível (padrão do hermes-web-ui): resumo + input/result. */
function renderToolCall(toolName, input, result) {
  const ok = !!(result && result.ok);
  messagesEl.appendChild(
    h('details', { className: 'jv-tool-call', style: { cursor: 'default' } },
      h('summary', { className: 'jv-tool-call__sum', style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' } },
        h('span', { className: 'jv-tool-call__icon' }, '⚙'),
        h('span', { className: 'jv-tool-call__text u-mono' }, `${toolName} ${ok ? '✓' : '✗'}`)),
      h('pre', { className: 'u-mono', style: { margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: '11px', opacity: '0.85', maxHeight: '160px', overflow: 'auto' } },
        `input: ${JSON.stringify(input)}\nresult: ${JSON.stringify(result)}`.slice(0, 1200)))
  );
}

function renderTyping() {
  messagesEl.appendChild(
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
function removeTyping() { document.getElementById('jv-typing')?.remove(); }
function scrollDown() { if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight; }

/* ===== Envio ===== */

/** Corpus de memória: um resumo por sessão anterior (estilo claude-mem). */
async function buildMemoryCorpus(excludeSessionId) {
  const all = await getAllMessages();
  const bySession = new Map();
  for (const m of all) {
    if (m.sessionId === excludeSessionId) continue;
    if (m.role !== 'user' && m.role !== 'jarvis') continue;
    if (!bySession.has(m.sessionId)) bySession.set(m.sessionId, []);
    bySession.get(m.sessionId).push(m);
  }
  const docs = [];
  for (const [sid, msgs] of bySession) {
    msgs.sort((a, b) => a.ts - b.ts);
    const summary = summarizeSession(msgs);
    if (summary) docs.push({ text: summary, sessionId: sid });
  }
  return docs;
}

async function handleSend() {
  if (busy) return;
  const text = inputEl.value.trim();
  if (!text) return;

  if (!activeSession) {
    activeSession = await createSession(text.slice(0, 40), config.mode);
    await refreshSessions();
  }

  inputEl.value = '';
  const userMsg = await addMessage(activeSession.id, 'user', text);
  messages.push(userMsg);
  renderBubble('user', text);
  captureConversation(text); /* auto-memória: tudo que o operador escreve vira memória durável */
  scrollDown();

  if (messages.filter((m) => m.role === 'user').length === 1) {
    await updateSession(activeSession.id, { title: text.slice(0, 40) });
    await refreshSessions();
  }

  busy = true;
  renderTyping();

  try {
    const convo = messages.filter((m) => m.role === 'user' || m.role === 'jarvis');

    /* doc 07: injeta o estado vivo do site como contexto oculto (somente
     * leitura). Cópia por chamada — não persiste no systemPrompt salvo. */
    const callConfig = config.mode === 'local'
      ? config
      : { ...config, systemPrompt: `${config.systemPrompt}\n\n${getBaluarteBriefing()}\n\n## ESTADO ATUAL DO SITE (somente leitura)\n${getStatusText()}` };

    /* Memória entre conversas (claude-mem): injeta resumos relevantes de
     * sessões anteriores. Best-effort, só nos modos de IA. */
    if (config.mode !== 'local' && config.memoryOn) {
      try {
        const fullCorpus = await buildMemoryCorpus(null);
        setMemoryCache(fullCorpus); /* memória disponível p/ a ferramenta do agente */
        const recalled = recall(text, fullCorpus.filter((d) => d.sessionId !== activeSession.id), 3);
        if (recalled.length) {
          callConfig.systemPrompt += '\n\n## MEMÓRIA (resumos de conversas anteriores, relevantes à pergunta)\n'
            + recalled.map((r) => `- ${r.text}`).join('\n');
          renderBubble('tool', `🧠 lembrei de ${recalled.length} conversa(s) anterior(es)`);
          scrollDown();
        }
      } catch { /* memória é best-effort */ }
    }

    /* Memória durável (supermemory): fatos curados ligados ao Segundo Cérebro. */
    if (config.mode !== 'local') {
      try {
        const durable = memoryContext(text, 5);
        if (durable) callConfig.systemPrompt += '\n\n' + durable;
      } catch { /* best-effort */ }
    }

    if (config.mode === 'local') {
      await new Promise((r) => setTimeout(r, 220));
      const result = processLocal(text);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', result.text);
      messages.push(jMsg);
      renderBubble('jarvis', result.text);
      if (result.action?.type === 'navigate') {
        setTimeout(() => router.navigate(result.action.payload), 600);
      } else if (result.action?.type === 'chart') {
        renderChartBubble(result.action.payload);
        scrollDown();
      }
    } else if (config.mode === 'claude') {
      const reply = await processClaude(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (config.mode === 'ollama') {
      const reply = await processOllama(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (config.mode === 'servidor') {
      const reply = await processServer(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (config.mode === 'hermes') {
      const reply = await processHermes(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (config.mode === 'openclaw') {
      const reply = await processOpenClaw(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      emitJarvis(reply);
      captureReply(reply);
    } else if (config.mode === 'webllm') {
      /* Streaming: bolha que cresce a cada token; durante o download do
       * modelo, a bolha de "digitando" mostra o progresso. */
      let liveText = null;
      const ensureBubble = () => {
        if (liveText) return;
        removeTyping();
        liveText = h('div', { className: 'jarvis-msg__text' }, '');
        messagesEl.appendChild(
          h('div', { className: 'jarvis-msg jarvis-msg--ai' },
            h('div', { className: 'jarvis-msg__avatar' }, '◉'),
            h('div', { className: 'jarvis-msg__body' },
              h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
              liveText
            )
          )
        );
      };
      const reply = await processWebLLM(convo, callConfig, {
        onProgress: (text) => {
          const tx = document.getElementById('jv-typing')?.querySelector('.jarvis-msg__text');
          if (tx) { tx.classList.remove('jarvis-typing'); tx.textContent = '⬇ Carregando modelo… ' + text; }
          scrollDown();
        },
        onToken: (partial) => { ensureBubble(); liveText.textContent = partial; scrollDown(); }
      });
      removeTyping();
      if (liveText) { empty(liveText); liveText.appendChild(renderRich(reply)); }
      else renderBubble('jarvis', reply);
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
    } else if (config.mode === 'agente') {
      const reply = await processAgent(convo, callConfig, async (toolName, input, result) => {
        removeTyping();
        renderToolCall(toolName, input, result);
        const summary = `${toolName} → ${result && result.ok ? 'ok' : 'erro'}`;
        await addMessage(activeSession.id, 'tool', summary);
        renderTyping();
        scrollDown();
      });
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
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
    const isSetup = config.mode !== 'local';
    const prefix = isSetup ? '⚙ ' : '⚠ ';
    const msgText = prefix + e.message;

    const textEl = h('div', { className: 'jarvis-msg__text' }, h('div', null, msgText));
    if (isSetup) {
      const actions = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' } });
      /* Caminho sem instalar/rodar nada: a IA roda no próprio navegador. */
      if (config.mode !== 'webllm') {
        actions.appendChild(h('button', {
          className: 'btn btn--primary btn--sm',
          onclick: () => {
            config.mode = 'webllm';
            saveConfig(config);
            updateModeBadge();
            inputEl.value = text;
            inputEl.focus();
            toast('Modo Navegador ativado (IA no navegador, sem servidor). Enter para enviar.', { type: 'info', duration: 4500 });
          }
        }, '⬡ Usar modo Navegador (sem servidor)'));
      }
      actions.appendChild(h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: async () => {
          const r = processLocal(text);
          const jm = await addMessage(activeSession.id, 'jarvis', r.text);
          messages.push(jm);
          renderBubble('jarvis', r.text);
          if (r.action?.type === 'navigate') setTimeout(() => router.navigate(r.action.payload), 600);
          scrollDown();
        }
      }, '↩ Responder no modo Local'));
      textEl.appendChild(actions);
    }
    messagesEl.appendChild(
      h('div', { className: 'jarvis-msg jarvis-msg--ai' },
        h('div', { className: 'jarvis-msg__avatar' }, '◉'),
        h('div', { className: 'jarvis-msg__body' },
          h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
          textEl))
    );
    await addMessage(activeSession.id, 'jarvis', msgText);
    toast(e.message, { type: isSetup ? 'warning' : 'danger' });
  } finally {
    busy = false;
    scrollDown();
    inputEl?.focus();
  }
}

/* ===== Config ===== */

function updateModeBadge() {
  const m = MODES.find((x) => x.id === config.mode);
  if (modeBadgeEl && m) {
    modeBadgeEl.textContent = `${m.icon} ${m.label.toUpperCase()}`;
    modeBadgeEl.className = `badge badge--${m.badge}`;
  }
}

function renderConfigPanel() {
  const panel = h('div', { className: 'jarvis-config' });

  const modeBar = h('div', { className: 'jv-mode-grid' });
  const bodyEl = h('div', { className: 'jarvis-config__body' });

  function renderModes() {
    empty(modeBar);
    MODES.forEach((m) => {
      modeBar.appendChild(
        h('button', {
          className: cx('jv-mode', config.mode === m.id && 'is-active'),
          onclick: () => {
            config.mode = m.id;
            saveConfig(config);
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

  function renderBody() {
    empty(bodyEl);
    if (config.mode === 'claude' || config.mode === 'agente') {
      const keyInput = h('input', {
        className: 'input', type: 'password', placeholder: 'sk-ant-...',
        value: config.apiKey || '',
        oninput: (e) => { config.apiKey = e.target.value.trim(); saveConfig(config); }
      });
      const modelSel = h('select', { className: 'input',
        onchange: (e) => { config.model = e.target.value; saveConfig(config); } },
        h('option', { value: 'claude-sonnet-4-6', selected: config.model === 'claude-sonnet-4-6' }, 'Claude Sonnet 4.6'),
        h('option', { value: 'claude-opus-4-7', selected: config.model === 'claude-opus-4-7' }, 'Claude Opus 4.7'),
        h('option', { value: 'claude-haiku-4-5-20251001', selected: config.model === 'claude-haiku-4-5-20251001' }, 'Claude Haiku 4.5')
      );
      bodyEl.append(
        h('label', null, h('span', null, 'CLAUDE API KEY'), keyInput),
        h('label', null, h('span', null, 'MODELO'), modelSel)
      );
      if (config.mode === 'agente') {
        bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚛ Modo agente: o Claude usa ferramentas pra navegar, abrir o editor, consultar Arsenal/Elites/Crônicas e calcular. Cada chamada aparece no chat.'));
      }
      bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
        '⚠ A key fica no localStorage e vai direto pra api.anthropic.com.'));
    } else if (config.mode === 'ollama') {
      const urlInput = h('input', {
        className: 'input', type: 'text', value: config.ollamaUrl || 'http://localhost:11434',
        oninput: (e) => { config.ollamaUrl = e.target.value.trim(); saveConfig(config); }
      });
      const modelInput = h('input', {
        className: 'input', type: 'text', value: config.ollamaModel || 'llama3.2',
        placeholder: 'llama3.2, mistral, phi3…',
        oninput: (e) => { config.ollamaModel = e.target.value.trim(); saveConfig(config); }
      });
      bodyEl.append(
        h('label', null, h('span', null, 'OLLAMA URL'), urlInput),
        h('label', null, h('span', null, 'MODELO LOCAL'), modelInput),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⬢ Requer Ollama rodando ("ollama serve"). 100% local. ' +
          'Pode precisar de OLLAMA_ORIGINS=* para aceitar requests do browser.')
      );
    } else if (config.mode === 'openclaw') {
      const ocUrl = h('input', {
        className: 'input', type: 'text', value: config.openclawUrl || 'http://localhost:18789',
        oninput: (e) => { config.openclawUrl = e.target.value.trim(); saveConfig(config); }
      });
      const ocPath = h('input', {
        className: 'input', type: 'text', value: config.openclawPath || '/v1/chat/completions',
        oninput: (e) => { config.openclawPath = e.target.value.trim(); saveConfig(config); }
      });
      bodyEl.append(
        h('label', null, h('span', null, 'OPENCLAW URL'), ocUrl),
        h('label', null, h('span', null, 'ENDPOINT (chat)'), ocPath),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '🐾 OpenClaw é self-hosted (gateway na porta 18789). Espera um endpoint de chat compatível com OpenAI; o gateway nativo é RPC, então pode precisar de um bridge (ver docs/OPENCLAW.md). Definir a URL aqui também faz o OpenClaw entrar no Conselho.')
      );
    } else if (config.mode === 'servidor') {
      const urlInput = h('input', {
        className: 'input', type: 'text', value: config.serverUrl || '',
        placeholder: 'vazio = backend embutido (/api)',
        oninput: (e) => { config.serverUrl = e.target.value.trim(); saveConfig(config); }
      });
      const testStatus = h('span', { className: 'u-text-muted', style: { fontSize: '12px' } }, '');
      const testBtn = h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: async () => {
          testStatus.textContent = 'testando…';
          testStatus.className = 'u-text-muted';
          try {
            const info = await healthCheckServer(config.serverUrl);
            testStatus.textContent = info.hasKey ? '✓ online · chave Gemini OK' : '✓ online · falta GEMINI_API_KEY';
            testStatus.className = info.hasKey ? 'u-text-cyan' : 'u-text-warning';
          } catch {
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
    } else if (config.mode === 'webllm') {
      const modelSel = h('select', { className: 'input',
        onchange: (e) => { config.webllmModel = e.target.value; saveConfig(config); } },
        ...WEBLLM_MODELS.map((m) =>
          h('option', { value: m.id, selected: (config.webllmModel || WEBLLM_MODELS[0].id) === m.id }, m.label))
      );
      const tCur = typeof config.webllmTemp === 'number' ? config.webllmTemp : 0.7;
      const tOut = h('span', { className: 'u-mono u-text-cyan', style: { minWidth: '30px', textAlign: 'right' } }, tCur.toFixed(1));
      const tSlider = h('input', {
        type: 'range', min: 0.1, max: 1.2, step: 0.1, value: tCur, style: { flex: '1', accentColor: 'var(--color-cyan)' },
        oninput: (e) => { config.webllmTemp = parseFloat(e.target.value); tOut.textContent = config.webllmTemp.toFixed(1); saveConfig(config); }
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
            await preloadWebLLM(config.webllmModel || WEBLLM_MODELS[0].id, (txt, frac) => {
              dlBar.style.width = Math.round((frac || 0) * 100) + '%';
              if (txt) dlStatus.textContent = txt;
            });
            dlBar.style.width = '100%'; dlStatus.textContent = '✓ modelo carregado — pronto pra conversar';
            toast('Modelo carregado no navegador.', { type: 'success' });
          } catch (e) { dlStatus.textContent = '✗ ' + (e.message || 'falhou'); toast(e.message || 'Falha ao carregar.', { type: 'warning' }); }
          finally { dlBtn.disabled = false; }
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

  function profileRow() {
    const current = config.profile || 'tatico';
    return h('label', { className: 'jv-profile' },
      h('span', null, 'PERFIL DA IA'),
      h('select', { className: 'input',
        onchange: (e) => {
          config.profile = e.target.value;
          config.systemPrompt = SYSTEM_PROMPTS[e.target.value] || SYSTEM_PROMPTS.tatico;
          saveConfig(config);
        } },
        h('option', { value: 'tatico', selected: current === 'tatico' }, 'Tático — conversa concisa'),
        h('option', { value: 'engenheiro', selected: current === 'engenheiro' }, 'Engenheiro de código'),
        h('option', { value: 'nucleo', selected: current === 'nucleo' }, 'Núcleo — raciocínio em 3 camadas')
      )
    );
  }

  function humanizeRow() {
    const cb = h('input', {
      type: 'checkbox', checked: !!config.humanizeOn,
      onchange: (e) => { config.humanizeOn = e.target.checked; saveConfig(config); renderMessages(); }
    });
    return h('label', { className: 'jv-profile', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      h('span', null, 'HUMANIZAR RESPOSTAS'),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'remove clichês de IA'),
        cb));
  }

  function memoryRow() {
    const cb = h('input', {
      type: 'checkbox', checked: !!config.memoryOn,
      onchange: (e) => { config.memoryOn = e.target.checked; saveConfig(config); }
    });
    return h('label', { className: 'jv-profile', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' } },
      h('span', null, 'MEMÓRIA ENTRE CONVERSAS'),
      h('span', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'lembra de conversas anteriores'),
        cb));
  }

  /* Skills auto-criadas (hermes): lista o que o JARVIS aprendeu + apagar. */
  function skillsRow() {
    const wrap = h('div', { className: 'jv-profile', style: { display: 'block' } });
    function render() {
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

export function jarvisPage() {
  config = loadConfig();
  if (config.humanizeOn === undefined) config.humanizeOn = true;
  if (config.memoryOn === undefined) config.memoryOn = true;
  activeSession = null;
  messages = [];
  initSkills(); /* registra as skills aprendidas como ferramentas do agente */
  /* Preenche o cache de memória p/ a ferramenta recall_memory do agente. */
  buildMemoryCorpus(null).then(setMemoryCache).catch(() => {});

  const fullPage = h('div', { className: 'page-jarvis' });

  modeBadgeEl = h('span', { className: 'badge badge--cyan' }, '');

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'J.A.R.V.I.S.')),
      h('h1', { className: 'page-header__title' }, '◉ J.A.R.V.I.S.'),
      h('p', { className: 'page-header__description' },
        'Assistente de IA do Baluarte — ',
        h('span', { className: 'u-text-cyan' }, '6 modos'),
        ': Local, Navegador (WebLLM), Claude API, Ollama, Servidor (Gemini + web) e Agente. Sessões em IndexedDB.')
    )
  );

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

  sessionsEl = h('div', { className: 'jv-sessions__list' });
  const sessionsPanel = h('div', { className: 'jv-sessions' },
    h('button', { className: 'btn btn--primary btn--sm', onclick: newSession }, '+ Nova conversa'),
    sessionsEl
  );

  messagesEl = h('div', { className: 'jarvis-messages' });
  inputEl = h('textarea', {
    className: 'jarvis-input', rows: 1,
    placeholder: 'Mensagem…  (Enter envia · Shift+Enter quebra linha)',
    onkeydown: (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    }
  });
  const chatPanel = h('div', { className: 'jarvis-chat' },
    messagesEl,
    h('div', { className: 'jarvis-input-row' },
      inputEl,
      h('button', { className: 'btn btn--primary', onclick: handleSend }, '➤')
    )
  );

  fullPage.appendChild(
    h('div', { className: 'jv-layout' }, sessionsPanel, chatPanel)
  );

  updateModeBadge();
  renderMessages();
  refreshSessions();
  setTimeout(() => inputEl.focus(), 50);

  return fullPage;
}
