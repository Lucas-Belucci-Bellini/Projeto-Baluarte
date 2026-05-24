/**
 * Página /jarvis — J.A.R.V.I.S. completo (Fase 20).
 *
 * 5 modos: local, webllm (navegador), claude, ollama, agente.
 * Sessões múltiplas em IndexedDB. Tool calls visíveis no modo agente.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  loadConfig, saveConfig,
  processLocal, processClaude, processOllama, processAgent
} from '../utils/jarvis-engine.js';
import {
  processWebLLM, isWebGPUAvailable, WEBLLM_MODELS
} from '../utils/jarvis-webllm.js';
import { highlight } from '../utils/syntax-highlight.js';
import { LANGS, langForExt } from '../data/editor-langs.js';
import { getStatusText } from '../utils/baluarte-status.js';
import {
  createSession, listSessions, updateSession, deleteSession,
  addMessage, getMessages, isUsingFallback
} from '../utils/jarvis-memory.js';

const MODES = [
  { id: 'local',  label: 'Local',  icon: '◆', badge: 'cyan',    desc: 'Assistente de regras. Offline, sem custo. Navega e consulta o Baluarte.' },
  { id: 'webllm', label: 'Navegador', icon: '⬡', badge: 'cyan', desc: 'IA real 100% no navegador via WebLLM (WebGPU). Sem servidor, sem API key. 1º uso baixa o modelo; depois roda offline.' },
  { id: 'claude', label: 'Claude', icon: '◉', badge: 'magenta', desc: 'Conversa livre via Claude API. Requer API key da Anthropic.' },
  { id: 'ollama', label: 'Ollama', icon: '⬢', badge: 'success', desc: 'Modelo local via Ollama (ollama serve). 100% privado.' },
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
          'Crie uma conversa ou digite abaixo. 5 modos: Local, Navegador, Claude, Ollama e Agente.')
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
  messages.forEach((m) => renderBubble(m.role, m.text));
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
      const clean = part.replace(/^\n+|\n+$/g, '');
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
  messagesEl.appendChild(
    h('div', { className: cx('jarvis-msg', isJarvis ? 'jarvis-msg--ai' : 'jarvis-msg--user') },
      h('div', { className: 'jarvis-msg__avatar' }, isJarvis ? '◉' : '◔'),
      h('div', { className: 'jarvis-msg__body' },
        h('div', { className: 'jarvis-msg__role' }, isJarvis ? 'J.A.R.V.I.S.' : 'Operador'),
        textEl
      )
    )
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
      : { ...config, systemPrompt: `${config.systemPrompt}\n\n## ESTADO ATUAL DO SITE (somente leitura)\n${getStatusText()}` };

    if (config.mode === 'local') {
      await new Promise((r) => setTimeout(r, 220));
      const result = processLocal(text);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', result.text);
      messages.push(jMsg);
      renderBubble('jarvis', result.text);
      if (result.action?.type === 'navigate') {
        setTimeout(() => router.navigate(result.action.payload), 600);
      }
    } else if (config.mode === 'claude') {
      const reply = await processClaude(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
    } else if (config.mode === 'ollama') {
      const reply = await processOllama(convo, callConfig);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
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
        const summary = `${toolName}(${JSON.stringify(input).slice(0, 50)}) → ${result.ok ? 'ok' : 'erro'}`;
        renderBubble('tool', summary);
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
    const errText = '⚠ Erro: ' + e.message;
    renderBubble('jarvis', errText);
    await addMessage(activeSession.id, 'jarvis', errText);
    toast(e.message, { type: 'danger' });
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
    } else if (config.mode === 'webllm') {
      const modelSel = h('select', { className: 'input',
        onchange: (e) => { config.webllmModel = e.target.value; saveConfig(config); } },
        ...WEBLLM_MODELS.map((m) =>
          h('option', { value: m.id, selected: (config.webllmModel || WEBLLM_MODELS[0].id) === m.id }, m.label))
      );
      bodyEl.append(
        h('label', null, h('span', null, 'MODELO (roda no navegador)'), modelSel)
      );
      if (!isWebGPUAvailable()) {
        bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚠ Este navegador não tem WebGPU. Use Chrome ou Edge atualizados para o modo Navegador.'));
      }
      bodyEl.appendChild(h('p', { className: 'jarvis-config__warn u-text-muted' },
        '⬡ A IA roda na sua máquina via WebGPU. O 1º uso baixa o modelo (~2–4 GB) e guarda em cache; depois funciona offline. Nada é enviado a servidores.'));
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

  renderModes();
  renderBody();
  panel.append(modeBar, profileRow(), bodyEl);
  return panel;
}

/* ===== Page builder ===== */

export function jarvisPage() {
  config = loadConfig();
  activeSession = null;
  messages = [];

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
        h('span', { className: 'u-text-cyan' }, '5 modos'),
        ': Local, Navegador (WebLLM), Claude API, Ollama e Agente (com ferramentas). Sessões em IndexedDB.')
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

  fullPage.appendChild(
    h('div', { className: 'jarvis-toolbar' },
      modeBadgeEl,
      isUsingFallback() && h('span', { className: 'badge badge--warning' }, 'MEMÓRIA VOLÁTIL'),
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
