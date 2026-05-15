/**
 * Página /jarvis — Chat do J.A.R.V.I.S. (Fase 19).
 *
 * Modo local (assistente de regras) + modo Claude API.
 * Memória de conversa persistente. Modo completo (4 modos) na Fase 20.
 */

import { h, cx, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  loadConfig, saveConfig,
  loadHistory, saveHistory, clearHistory,
  processLocal, processClaude
} from '../utils/jarvis-engine.js';

let config = null;
let history = [];
let messagesEl = null;
let inputEl = null;
let modeBadgeEl = null;
let busy = false;

function addMessage(role, text) {
  history.push({ role, text, ts: Date.now() });
  saveHistory(history);
  renderMessage(role, text);
  scrollDown();
}

function renderMessage(role, text) {
  const isJarvis = role === 'jarvis';
  const bubble = h('div', { className: cx('jarvis-msg', isJarvis ? 'jarvis-msg--ai' : 'jarvis-msg--user') },
    h('div', { className: 'jarvis-msg__avatar' }, isJarvis ? '◉' : '◔'),
    h('div', { className: 'jarvis-msg__body' },
      h('div', { className: 'jarvis-msg__role' }, isJarvis ? 'J.A.R.V.I.S.' : 'Operador'),
      h('div', { className: 'jarvis-msg__text' }, text)
    )
  );
  messagesEl.appendChild(bubble);
}

function renderTyping() {
  const el = h('div', { className: 'jarvis-msg jarvis-msg--ai', id: 'jarvis-typing' },
    h('div', { className: 'jarvis-msg__avatar' }, '◉'),
    h('div', { className: 'jarvis-msg__body' },
      h('div', { className: 'jarvis-msg__role' }, 'J.A.R.V.I.S.'),
      h('div', { className: 'jarvis-msg__text jarvis-typing' },
        h('span', null, '●'), h('span', null, '●'), h('span', null, '●'))
    )
  );
  messagesEl.appendChild(el);
  scrollDown();
}
function removeTyping() {
  const el = document.getElementById('jarvis-typing');
  if (el) el.remove();
}

function scrollDown() {
  if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function handleSend() {
  if (busy) return;
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';
  addMessage('user', text);

  busy = true;
  renderTyping();

  try {
    if (config.mode === 'claude') {
      const reply = await processClaude(history.filter((m) => m.role !== 'system'), config);
      removeTyping();
      addMessage('jarvis', reply);
    } else {
      /* Local — pequeno delay pra UX */
      await new Promise((r) => setTimeout(r, 250));
      const result = processLocal(text);
      removeTyping();
      addMessage('jarvis', result.text);
      if (result.action?.type === 'navigate') {
        setTimeout(() => router.navigate(result.action.payload), 600);
      }
    }
  } catch (e) {
    removeTyping();
    addMessage('jarvis', '⚠ Erro: ' + e.message);
    toast('Erro JARVIS: ' + e.message, { type: 'danger' });
  } finally {
    busy = false;
    inputEl.focus();
  }
}

/* ===== Painel de config ===== */

function renderConfigPanel() {
  const panel = h('div', { className: 'jarvis-config' });

  const modeLocal = h('button', {
    className: cx('jarvis-mode', config.mode === 'local' && 'is-active'),
    onclick: () => { config.mode = 'local'; saveConfig(config); updateMode(); renderConfigBody(); }
  }, '◆ Modo Local');
  const modeClaude = h('button', {
    className: cx('jarvis-mode', config.mode === 'claude' && 'is-active'),
    onclick: () => { config.mode = 'claude'; saveConfig(config); updateMode(); renderConfigBody(); }
  }, '◉ Modo Claude API');

  const bodyEl = h('div', { className: 'jarvis-config__body' });

  function renderConfigBody() {
    empty(bodyEl);
    if (config.mode === 'claude') {
      const keyInput = h('input', {
        className: 'input', type: 'password',
        placeholder: 'sk-ant-...',
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
        h('label', null, h('span', null, 'API KEY (anthropic)'), keyInput),
        h('label', null, h('span', null, 'MODELO'), modelSel),
        h('p', { className: 'jarvis-config__warn u-text-muted' },
          '⚠ A key fica só no seu localStorage e vai direto pra api.anthropic.com. ',
          'Em produção use um backend — chave no browser é exposta a XSS.')
      );
    } else {
      bodyEl.appendChild(
        h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } },
          'Modo local: assistente de regras, sem custo e offline. Navega pelo Baluarte, consulta Arsenal/Elites/Crônicas e dá status. Para conversa livre, troque pro modo Claude API.')
      );
    }
  }

  panel.append(
    h('div', { className: 'jarvis-modes' }, modeLocal, modeClaude),
    bodyEl
  );
  renderConfigBody();
  return panel;
}

function updateMode() {
  if (modeBadgeEl) {
    modeBadgeEl.textContent = config.mode === 'claude' ? '◉ CLAUDE API' : '◆ LOCAL';
    modeBadgeEl.className = `badge badge--${config.mode === 'claude' ? 'magenta' : 'cyan'}`;
  }
}

export function jarvisPage() {
  config = loadConfig();
  history = loadHistory();

  const fullPage = h('div', { className: 'page-jarvis' });

  modeBadgeEl = h('span', { className: 'badge badge--cyan' }, '');

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'J.A.R.V.I.S.')),
      h('h1', { className: 'page-header__title' }, '◉ J.A.R.V.I.S.'),
      h('p', { className: 'page-header__description' },
        'Assistente de IA do Baluarte. ',
        h('span', { className: 'u-text-cyan' }, 'Modo local'),
        ' (regras, offline) ou ',
        h('span', { className: 'u-text-cyan' }, 'Claude API'),
        ' (conversa livre). 4 modos completos + agente chegam na Fase 20.')
    )
  );

  /* Config panel (collapsible) */
  let configOpen = false;
  const configWrap = h('div', { className: 'jarvis-config-wrap', style: { display: 'none' } });
  const configToggle = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      configOpen = !configOpen;
      configWrap.style.display = configOpen ? 'block' : 'none';
      if (configOpen && !configWrap.hasChildNodes()) {
        configWrap.appendChild(renderConfigPanel());
      }
    }
  }, '⚙ Configurações');

  fullPage.appendChild(
    h('div', { className: 'jarvis-toolbar' },
      modeBadgeEl,
      h('div', { style: { marginLeft: 'auto', display: 'flex', gap: '6px' } },
        configToggle,
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: () => {
            if (confirm('Limpar todo o histórico de conversa?')) {
              clearHistory();
              history = [];
              empty(messagesEl);
              renderWelcome();
              toast('Histórico limpo', { type: 'info' });
            }
          }
        }, '× Limpar chat')
      )
    )
  );
  fullPage.appendChild(configWrap);

  /* Chat area */
  messagesEl = h('div', { className: 'jarvis-messages' });
  inputEl = h('textarea', {
    className: 'jarvis-input',
    rows: 1,
    placeholder: 'Mensagem para o J.A.R.V.I.S.…  (Enter envia · Shift+Enter quebra linha)',
    onkeydown: (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    }
  });

  const sendBtn = h('button', { className: 'btn btn--primary', onclick: handleSend }, '➤');

  fullPage.appendChild(
    h('div', { className: 'jarvis-chat' },
      messagesEl,
      h('div', { className: 'jarvis-input-row' }, inputEl, sendBtn)
    )
  );

  /* Render histórico ou welcome */
  function renderWelcome() {
    messagesEl.appendChild(
      h('div', { className: 'jarvis-welcome' },
        h('div', { className: 'jarvis-welcome__icon' }, '◉'),
        h('div', { className: 'jarvis-welcome__title' }, 'J.A.R.V.I.S. ONLINE'),
        h('div', { className: 'jarvis-welcome__text u-text-muted' },
          'Diga "ajuda" para ver o que posso fazer, ou pergunte qualquer coisa sobre o Baluarte.')
      )
    );
  }

  if (history.length) {
    history.forEach((m) => { if (m.role !== 'system') renderMessage(m.role, m.text); });
  } else {
    renderWelcome();
  }

  updateMode();
  setTimeout(() => { inputEl.focus(); scrollDown(); }, 50);

  return fullPage;
}
