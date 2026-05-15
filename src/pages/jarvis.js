/**
 * Página /jarvis — J.A.R.V.I.S. completo (Fase 20).
 *
 * 4 modos: local, claude, ollama, agente.
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
  createSession, listSessions, updateSession, deleteSession,
  addMessage, getMessages, isUsingFallback
} from '../utils/jarvis-memory.js';

const MODES = [
  { id: 'local',  label: 'Local',  icon: '◆', badge: 'cyan',    desc: 'Assistente de regras. Offline, sem custo. Navega e consulta o Baluarte.' },
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
          'Crie uma conversa ou digite abaixo. 4 modos: Local, Claude, Ollama e Agente.')
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
  messagesEl.appendChild(
    h('div', { className: cx('jarvis-msg', isJarvis ? 'jarvis-msg--ai' : 'jarvis-msg--user') },
      h('div', { className: 'jarvis-msg__avatar' }, isJarvis ? '◉' : '◔'),
      h('div', { className: 'jarvis-msg__body' },
        h('div', { className: 'jarvis-msg__role' }, isJarvis ? 'J.A.R.V.I.S.' : 'Operador'),
        h('div', { className: 'jarvis-msg__text' }, text)
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
      const reply = await processClaude(convo, config);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
    } else if (config.mode === 'ollama') {
      const reply = await processOllama(convo, config);
      removeTyping();
      const jMsg = await addMessage(activeSession.id, 'jarvis', reply);
      messages.push(jMsg);
      renderBubble('jarvis', reply);
    } else if (config.mode === 'agente') {
      const reply = await processAgent(convo, config, async (toolName, input, result) => {
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
    } else {
      bodyEl.appendChild(
        h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } },
          'Modo local: assistente de regras. Sem custo, offline. Navega e consulta dados do Baluarte.')
      );
    }
  }

  renderModes();
  renderBody();
  panel.append(modeBar, bodyEl);
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
        h('span', { className: 'u-text-cyan' }, '4 modos'),
        ': Local, Claude API, Ollama e Agente (com ferramentas). Sessões em IndexedDB.')
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
