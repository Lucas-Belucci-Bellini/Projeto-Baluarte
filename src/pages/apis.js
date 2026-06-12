/**
 * /apis — Central de APIs (issue #200).
 *
 * Painel único para DETECTAR, TESTAR e GERENCIAR as IAs do site:
 *   - Servidor (Vercel): mostra quais chaves o backend enxerga (/api/health —
 *     só booleanos, o valor nunca sai do servidor) e qual env a Claude usa.
 *   - Provedores: um card por IA com botão de teste real (latência + status).
 *   - Cofre local: chaves nomeadas guardadas SÓ no navegador (localStorage),
 *     mascaradas, com ação "Usar no JARVIS" (vira a apiKey do modo Claude).
 *
 * Segurança: nenhum valor de chave aparece em texto puro por padrão, nada vai
 * para o repositório, e o servidor só responde existe/não-existe.
 */

import { h, empty, uid } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { storage } from '../core/storage.js';
import { loadConfig, saveConfig, resolveServerBase } from '../utils/jarvis-engine.js';

const VAULT_KEY = 'apis:vault';

/* ===== Cofre local (navegador) ===== */

function loadVault() {
  const v = storage.get(VAULT_KEY);
  return Array.isArray(v) ? v : [];
}

function saveVault(vault) {
  storage.set(VAULT_KEY, vault);
}

/** Mascara uma chave: mostra só os 4 últimos caracteres. */
function mask(value) {
  if (!value) return '';
  const tail = value.slice(-4);
  return '••••••••••••' + tail;
}

/* ===== Testes de provedores ===== */

/** Mede um fetch: resolve { ok, ms, info } e nunca lança. */
async function timed(fn) {
  const t0 = performance.now();
  try {
    const info = await fn();
    return { ok: true, ms: Math.round(performance.now() - t0), info: info || '' };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - t0), info: e.message || String(e) };
  }
}

async function fetchJson(url, options = {}, ms = 12000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return data;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

/** Claude direto do navegador (usa a apiKey do JARVIS). 1 token = teste barato. */
async function testClaudeNavegador() {
  const config = loadConfig();
  if (!config.apiKey) throw new Error('sem chave — cole uma abaixo ou use o cofre');
  const data = await fetchJson('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-6',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }]
    })
  });
  return data.model || 'ok';
}

/** Claude pelo servidor do site (/api/claude — chave fica na Vercel). */
async function testClaudeServidor() {
  const base = resolveServerBase(loadConfig().serverUrl);
  const data = await fetchJson(`${base}/claude`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Responda apenas: pong' }],
      max_tokens: 8
    })
  });
  const resposta = data.resposta || '';
  if (resposta.startsWith('[')) throw new Error(resposta.slice(0, 120));
  return data.model ? `${data.model}` : resposta.slice(0, 40);
}

/** Ollama local (lista os modelos instalados). */
async function testOllama() {
  const config = loadConfig();
  const data = await fetchJson(`${(config.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '')}/api/tags`, {}, 6000);
  const n = (data.models || []).length;
  return `${n} modelo(s)`;
}

/* ===== UI ===== */

/** Cria o badge de status de um teste e devolve { el, set }. */
function statusBadge() {
  const el = h('span', { className: 'apis-status' }, 'não testado');
  return {
    el,
    set(state, text) {
      el.className = 'apis-status' + (state ? ` apis-status--${state}` : '');
      el.textContent = text;
    }
  };
}

/** Card de provedor com botão de teste. */
function providerCard({ icon, name, where, desc, test, extra }) {
  const badge = statusBadge();
  const btn = test
    ? h('button', {
        className: 'btn btn--sm',
        onclick: async () => {
          badge.set('wait', 'testando…');
          const r = await timed(test);
          if (r.ok) badge.set('ok', `✓ ok · ${r.ms}ms${r.info ? ' · ' + r.info : ''}`);
          else badge.set('fail', `✗ ${r.info}`);
        }
      }, '⚡ Testar')
    : null;

  return h('div', { className: 'apis-card' },
    h('div', { className: 'apis-card__head' },
      h('span', { className: 'apis-card__icon' }, icon),
      h('div', null,
        h('div', { className: 'apis-card__name' }, name),
        h('div', { className: 'apis-card__where' }, where))),
    h('p', { className: 'apis-card__desc' }, desc),
    extra || null,
    h('div', { className: 'apis-card__foot' }, btn, badge.el)
  );
}

/* ---- Detecção do servidor (Vercel) ---- */

function buildServerCard() {
  const rowsEl = h('div', { className: 'apis-server__rows' },
    h('p', { className: 'u-text-muted' },
      'Clique em detectar para perguntar ao backend quais chaves existem — só volta existe/não-existe, nunca o valor.'));

  function row(ok, label, hint) {
    return h('div', { className: 'apis-server__row' },
      h('span', { className: 'apis-status ' + (ok ? 'apis-status--ok' : 'apis-status--fail') }, ok ? '✓' : '✗'),
      h('span', { className: 'apis-server__label' }, label),
      h('span', { className: 'apis-server__hint u-mono' }, hint));
  }

  async function detect() {
    empty(rowsEl);
    rowsEl.appendChild(h('p', { className: 'u-text-muted' }, '⏳ consultando o servidor…'));
    const base = resolveServerBase(loadConfig().serverUrl);
    const r = await timed(() => fetchJson(`${base}/health`, {}, 8000));
    empty(rowsEl);
    if (!r.ok) {
      rowsEl.appendChild(h('p', { className: 'apis-status apis-status--fail' },
        `✗ servidor indisponível (${r.info}). No site publicado (Vercel) isso funciona; rodando local, suba o backend (backend/server.py).`));
      return;
    }
    const keys = r.info && typeof r.info === 'object' ? r.info.keys : null;
    if (!keys) {
      rowsEl.appendChild(h('p', { className: 'apis-status apis-status--fail' },
        '✗ o backend respondeu, mas ainda é a versão antiga do /api/health (sem detecção) — faça o deploy desta atualização.'));
      return;
    }
    const models = r.info.models || {};
    rowsEl.appendChild(row(keys.gemini, 'Gemini (chat + busca web)', keys.gemini ? models.gemini || '' : 'defina GEMINI_API_KEY'));
    rowsEl.appendChild(row(keys.hermes, 'Hermes (OpenRouter)', keys.hermes ? models.hermes || '' : 'defina OPENROUTER_API_KEY'));
    rowsEl.appendChild(row(keys.claude, 'Claude (Anthropic)', keys.claude ? `env: ${keys.claudeEnv} · ${models.claude || ''}` : 'defina ANTHROPIC_API_KEY'));
    rowsEl.appendChild(h('p', { className: 'apis-server__note u-text-muted' },
      'A chave Claude é detectada mesmo com nome personalizado (valor começando com sk-ant- ou nome contendo claude/anthropic). ',
      'Latência do /health: ', String(r.ms), 'ms.'));
  }

  return h('div', { className: 'apis-server' },
    h('div', { className: 'apis-server__head' },
      h('h2', null, '🛰 Chaves no servidor (Vercel)'),
      h('button', { className: 'btn btn--primary btn--sm', onclick: detect }, '📡 Detectar chaves do servidor')),
    rowsEl);
}

/* ---- Cofre local ---- */

function buildVaultCard() {
  const wrap = h('div', { className: 'apis-vault' });

  function render() {
    empty(wrap);
    wrap.appendChild(h('h2', null, '🔐 Cofre local de chaves'));
    wrap.appendChild(h('p', { className: 'u-text-muted' },
      'Guardadas só neste navegador (localStorage) — nunca vão para o repositório nem para o servidor. ',
      '"Usar no JARVIS" coloca a chave no modo Claude do assistente (⚙).'));

    const vault = loadVault();
    if (!vault.length) {
      wrap.appendChild(h('p', { className: 'apis-vault__empty u-text-muted' }, 'Cofre vazio — adicione uma chave abaixo.'));
    }

    vault.forEach((item) => {
      let shown = false;
      const valueEl = h('span', { className: 'apis-vault__value u-mono' }, mask(item.valor));
      const rowEl = h('div', { className: 'apis-vault__row' },
        h('span', { className: 'apis-vault__name' }, item.nome),
        valueEl,
        h('div', { className: 'apis-vault__actions' },
          h('button', {
            className: 'btn btn--ghost btn--sm', title: 'Mostrar/ocultar',
            onclick: () => { shown = !shown; valueEl.textContent = shown ? item.valor : mask(item.valor); }
          }, '👁'),
          h('button', {
            className: 'btn btn--ghost btn--sm', title: 'Copiar',
            onclick: async () => {
              try { await navigator.clipboard.writeText(item.valor); toast('Copiada', { type: 'success', duration: 1200 }); }
              catch { toast('Não consegui copiar', { type: 'danger' }); }
            }
          }, '⎘'),
          h('button', {
            className: 'btn btn--sm', title: 'Usar como apiKey do modo Claude do JARVIS',
            onclick: () => {
              const config = loadConfig();
              config.apiKey = item.valor;
              saveConfig(config);
              toast(`"${item.nome}" agora é a chave do JARVIS (modo Claude)`, { type: 'success' });
            }
          }, '◉ Usar no JARVIS'),
          h('button', {
            className: 'btn btn--ghost btn--sm', title: 'Excluir',
            onclick: () => {
              if (!confirm(`Excluir a chave "${item.nome}" do cofre?`)) return;
              saveVault(loadVault().filter((k) => k.id !== item.id));
              render();
            }
          }, '🗑')));
      wrap.appendChild(rowEl);
    });

    /* form de adicionar */
    const nomeIn = h('input', { className: 'input', placeholder: 'Nome (ex: Claude_Fable)', maxlength: '60' });
    const valorIn = h('input', { className: 'input', type: 'password', placeholder: 'Valor da chave (ex: sk-ant-…)', autocomplete: 'off' });
    wrap.appendChild(h('div', { className: 'apis-vault__form' },
      nomeIn, valorIn,
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => {
          const nome = nomeIn.value.trim();
          const valor = valorIn.value.trim();
          if (!nome || !valor) { toast('Preencha nome e valor', { type: 'warning' }); return; }
          saveVault([...loadVault(), { id: uid('key'), nome, valor }]);
          toast(`Chave "${nome}" guardada no cofre local`, { type: 'success' });
          render();
        }
      }, '+ Adicionar ao cofre')));
  }

  render();
  return wrap;
}

/* ---- Página ---- */

export function apisPage() {
  const page = h('div', { className: 'page-apis' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'IA & JARVIS'), h('span', null, '›'),
        h('span', null, 'CENTRAL DE APIS')),
      h('h1', { className: 'page-header__title' }, '🔑 Central de APIs'),
      h('p', { className: 'page-header__description' },
        'Detecta, testa e gerencia as IAs do Baluarte (issue #200). As chaves do ',
        h('span', { className: 'u-text-cyan' }, 'servidor'),
        ' ficam na Vercel (o site só vê existe/não-existe); as do ',
        h('span', { className: 'u-text-cyan' }, 'navegador'),
        ' ficam no cofre local abaixo — nada vai para o repositório.'))
  );

  /* 1. Detecção do servidor */
  page.appendChild(buildServerCard());

  /* 2. Provedores testáveis */
  const config = loadConfig();
  const keyIn = h('input', {
    className: 'input', type: 'password', autocomplete: 'off',
    placeholder: 'sk-ant-… (chave do navegador p/ modo Claude)',
    value: config.apiKey || '',
    oninput: (e) => {
      const c = loadConfig();
      c.apiKey = e.target.value.trim();
      saveConfig(c);
    }
  });

  page.appendChild(h('div', { className: 'apis-grid' },
    providerCard({
      icon: '◉', name: 'JARVIS Local', where: 'navegador · sem chave',
      desc: 'Assistente de regras embutido: navega no site e consulta equipes/armas/arcos. Sempre disponível.',
      test: async () => 'sempre on'
    }),
    providerCard({
      icon: '🤖', name: 'Claude (navegador)', where: 'chave no navegador',
      desc: 'Chamada direta à API da Anthropic com a chave colada aqui (a mesma do ⚙ do JARVIS). Teste custa 1 token.',
      test: testClaudeNavegador,
      extra: h('div', { className: 'apis-card__extra' }, keyIn)
    }),
    providerCard({
      icon: '🛰', name: 'Claude (servidor)', where: 'chave na Vercel',
      desc: 'O /api/claude usa a chave das Environment Variables (detecta até nome personalizado, ex: Claude_Fable). É modo do JARVIS e membro do Conselho de IAs.',
      test: testClaudeServidor
    }),
    providerCard({
      icon: '🌐', name: 'Gemini (servidor)', where: 'chave na Vercel',
      desc: 'O /api/chat de sempre (modo Servidor do JARVIS), com busca no Google. Use a detecção acima para ver a chave.',
      test: async () => {
        const base = resolveServerBase(loadConfig().serverUrl);
        const d = await fetchJson(`${base}/health`, {}, 8000);
        if (!d.hasKey) throw new Error('GEMINI_API_KEY ausente no servidor');
        return d.model || 'ok';
      }
    }),
    providerCard({
      icon: '⚖', name: 'Hermes (servidor)', where: 'chave na Vercel',
      desc: 'OpenRouter (/api/hermes), membro do Conselho de IAs. Teste de verdade consome tokens — aqui só detectamos a chave.',
      test: async () => {
        const base = resolveServerBase(loadConfig().serverUrl);
        const d = await fetchJson(`${base}/health`, {}, 8000);
        if (!d.keys) throw new Error('backend antigo — faça o deploy');
        if (!d.keys.hermes) throw new Error('OPENROUTER_API_KEY ausente no servidor');
        return d.models ? d.models.hermes : 'ok';
      }
    }),
    providerCard({
      icon: '🦙', name: 'Ollama (local)', where: 'sua máquina · sem chave',
      desc: 'Modelos locais via Ollama (http://localhost:11434). O teste lista os modelos instalados.',
      test: testOllama
    })
  ));

  /* 3. Cofre local */
  page.appendChild(buildVaultCard());

  return page;
}
