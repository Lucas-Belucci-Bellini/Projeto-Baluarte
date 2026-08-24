/**
 * /apis — Central de APIs.
 *
 * Detecta, testa e gerencia integrações de IA sem enviar chaves para o
 * repositório: o servidor responde somente capacidades, e o cofre fica local.
 */

import '../styles/apis.css';
import { h, empty, uid } from '../utils/helpers.js';
import { toast } from '../utils/toast';
import { storage } from '../core/storage.js';
import { loadConfig, saveConfig, resolveServerBase } from '../utils/jarvis-engine.js';

const VAULT_KEY = 'apis:vault';

interface VaultItem {
  readonly id: string;
  readonly nome: string;
  readonly valor: string;
}

interface TimedSuccess<T> {
  readonly ok: true;
  readonly ms: number;
  readonly info: T;
}

interface TimedFailure {
  readonly ok: false;
  readonly ms: number;
  readonly info: string;
}

type TimedResult<T> = TimedSuccess<T> | TimedFailure;

interface StatusBadge {
  readonly el: HTMLSpanElement;
  set(state: string, text: string): void;
}

interface ProviderCardOptions {
  readonly icon: string;
  readonly name: string;
  readonly where: string;
  readonly desc: string;
  readonly test?: () => Promise<string>;
  readonly extra?: Node | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isVaultItem(value: unknown): value is VaultItem {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.nome === 'string'
    && typeof value.valor === 'string';
}

function loadVault(): VaultItem[] {
  const stored: unknown = storage.get<unknown>(VAULT_KEY, []);
  return Array.isArray(stored) ? stored.filter(isVaultItem) : [];
}

function saveVault(vault: readonly VaultItem[]): void {
  storage.set(VAULT_KEY, vault);
}

/** Mascara uma chave: mostra só os quatro últimos caracteres. */
function mask(value: string): string {
  if (!value) return '';
  return `••••••••••••${value.slice(-4)}`;
}

async function timed<T>(operation: () => Promise<T>): Promise<TimedResult<T>> {
  const start = performance.now();
  try {
    const info = await operation();
    return { ok: true, ms: Math.round(performance.now() - start), info };
  } catch (error: unknown) {
    return {
      ok: false,
      ms: Math.round(performance.now() - start),
      info: errorMessage(error),
    };
  }
}

async function fetchJson(
  url: string,
  options: RequestInit = {},
  timeoutMs = 12000,
): Promise<unknown> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const data: unknown = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('timeout');
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

async function testClaudeNavegador(): Promise<string> {
  const config = loadConfig();
  if (!config.apiKey) throw new Error('sem chave — cole uma abaixo ou use o cofre');
  const data = await fetchJson('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: config.model || 'claude-sonnet-4-6',
      max_tokens: 1,
      messages: [{ role: 'user', content: 'ping' }],
    }),
  });
  const record = isRecord(data) ? data : {};
  return typeof record.model === 'string' ? record.model : 'ok';
}

async function testClaudeServidor(): Promise<string> {
  const base = resolveServerBase(loadConfig().serverUrl);
  const data = await fetchJson(`${base}/claude`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Responda apenas: pong' }],
      max_tokens: 8,
    }),
  });
  const record = isRecord(data) ? data : {};
  const response = typeof record.resposta === 'string' ? record.resposta : '';
  if (response.startsWith('[')) throw new Error(response.slice(0, 120));
  return typeof record.model === 'string' ? record.model : response.slice(0, 40);
}

async function testOllama(): Promise<string> {
  const config = loadConfig();
  const base = (config.ollamaUrl || 'http://localhost:11434').replace(/\/$/, '');
  const data = await fetchJson(`${base}/api/tags`, {}, 6000);
  const record = isRecord(data) ? data : {};
  const models = Array.isArray(record.models) ? record.models : [];
  return `${models.length} modelo(s)`;
}

function statusBadge(): StatusBadge {
  const element = h('span', { className: 'apis-status' }, 'não testado');
  return {
    el: element,
    set(state: string, text: string): void {
      element.className = `apis-status${state ? ` apis-status--${state}` : ''}`;
      element.textContent = text;
    },
  };
}

function providerCard(options: ProviderCardOptions): HTMLDivElement {
  const badge = statusBadge();
  const button = options.test
    ? h('button', {
      className: 'btn btn--sm',
      onclick: async () => {
        badge.set('wait', 'testando…');
        const result = await timed(options.test as () => Promise<string>);
        if (result.ok) {
          badge.set('ok', `✓ ok · ${result.ms}ms${result.info ? ` · ${result.info}` : ''}`);
        } else {
          badge.set('fail', `✗ ${result.info}`);
        }
      },
    }, '⚡ Testar')
    : null;

  return h('div', { className: 'apis-card' },
    h('div', { className: 'apis-card__head' },
      h('span', { className: 'apis-card__icon' }, options.icon),
      h('div', null,
        h('div', { className: 'apis-card__name' }, options.name),
        h('div', { className: 'apis-card__where' }, options.where),
      ),
    ),
    h('p', { className: 'apis-card__desc' }, options.desc),
    options.extra ?? null,
    h('div', { className: 'apis-card__foot' }, button, badge.el),
  );
}

function buildServerCard(): HTMLDivElement {
  const rowsElement = h('div', { className: 'apis-server__rows' },
    h('p', { className: 'u-text-muted' },
      'Clique em detectar para perguntar ao backend quais chaves existem — só volta existe/não-existe, nunca o valor.'),
  );

  function row(ok: boolean, label: string, hint: string): HTMLDivElement {
    return h('div', { className: 'apis-server__row' },
      h('span', {
        className: `apis-status ${ok ? 'apis-status--ok' : 'apis-status--fail'}`,
      }, ok ? '✓' : '✗'),
      h('span', { className: 'apis-server__label' }, label),
      h('span', { className: 'apis-server__hint u-mono' }, hint),
    );
  }

  async function detect(): Promise<void> {
    empty(rowsElement);
    rowsElement.appendChild(h('p', { className: 'u-text-muted' }, '⏳ consultando o servidor…'));
    const base = resolveServerBase(loadConfig().serverUrl);
    const result = await timed(() => fetchJson(`${base}/health`, {}, 8000));
    empty(rowsElement);
    if (!result.ok) {
      rowsElement.appendChild(h('p', { className: 'apis-status apis-status--fail' },
        `✗ servidor indisponível (${result.info}). No site publicado (Vercel) isso funciona; rodando local, suba o backend (backend/server.py).`));
      return;
    }
    const info = isRecord(result.info) ? result.info : null;
    const keys = info && isRecord(info.keys) ? info.keys : null;
    if (!keys) {
      rowsElement.appendChild(h('p', { className: 'apis-status apis-status--fail' },
        '✗ o backend respondeu, mas ainda é a versão antiga do /api/health (sem detecção) — faça o deploy desta atualização.'));
      return;
    }
    const models = info && isRecord(info.models) ? info.models : {};
    const hasKey = (value: unknown): boolean => value === true;
    const modelName = (value: unknown): string => typeof value === 'string' ? value : '';
    rowsElement.appendChild(row(
      hasKey(keys.gemini),
      'Gemini (chat + busca web)',
      hasKey(keys.gemini) ? modelName(models.gemini) : 'defina GEMINI_API_KEY',
    ));
    rowsElement.appendChild(row(
      hasKey(keys.hermes),
      'Hermes (OpenRouter)',
      hasKey(keys.hermes) ? modelName(models.hermes) : 'defina OPENROUTER_API_KEY',
    ));
    rowsElement.appendChild(row(
      hasKey(keys.claude),
      'Claude (Anthropic)',
      hasKey(keys.claude)
        ? `env: ${typeof keys.claudeEnv === 'string' ? keys.claudeEnv : ''} · ${modelName(models.claude)}`
        : 'defina ANTHROPIC_API_KEY',
    ));
    rowsElement.appendChild(h('p', { className: 'apis-server__note u-text-muted' },
      'A chave Claude é detectada mesmo com nome personalizado (valor começando com sk-ant- ou nome contendo claude/anthropic). ',
      'Latência do /health: ',
      String(result.ms),
      'ms.',
    ));
  }

  return h('div', { className: 'apis-server' },
    h('div', { className: 'apis-server__head' },
      h('h2', null, '🛰 Chaves no servidor (Vercel)'),
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: detect,
      }, '📡 Detectar chaves do servidor'),
    ),
    rowsElement,
  );
}

function buildVaultCard(): HTMLDivElement {
  const wrap = h('div', { className: 'apis-vault' });

  function render(): void {
    empty(wrap);
    wrap.appendChild(h('h2', null, '🔐 Cofre local de chaves'));
    wrap.appendChild(h('p', { className: 'u-text-muted' },
      'Guardadas só neste navegador (localStorage) — nunca vão para o repositório nem para o servidor. ',
      '"Usar no JARVIS" coloca a chave no modo Claude do assistente (⚙).'));

    const vault = loadVault();
    if (!vault.length) {
      wrap.appendChild(h('p', { className: 'apis-vault__empty u-text-muted' },
        'Cofre vazio — adicione uma chave abaixo.'));
    }

    vault.forEach((item) => {
      let shown = false;
      const valueElement = h('span', {
        className: 'apis-vault__value u-mono',
      }, mask(item.valor));
      const rowElement = h('div', { className: 'apis-vault__row' },
        h('span', { className: 'apis-vault__name' }, item.nome),
        valueElement,
        h('div', { className: 'apis-vault__actions' },
          h('button', {
            className: 'btn btn--ghost btn--sm',
            title: 'Mostrar/ocultar',
            onclick: () => {
              shown = !shown;
              valueElement.textContent = shown ? item.valor : mask(item.valor);
            },
          }, '👁'),
          h('button', {
            className: 'btn btn--ghost btn--sm',
            title: 'Copiar',
            onclick: async () => {
              try {
                await navigator.clipboard.writeText(item.valor);
                toast('Copiada', { type: 'success', duration: 1200 });
              } catch {
                toast('Não consegui copiar', { type: 'danger' });
              }
            },
          }, '⎘'),
          h('button', {
            className: 'btn btn--sm',
            title: 'Usar como apiKey do modo Claude do JARVIS',
            onclick: () => {
              const config = loadConfig();
              config.apiKey = item.valor;
              saveConfig(config);
              toast(`"${item.nome}" agora é a chave do JARVIS (modo Claude)`, { type: 'success' });
            },
          }, '◉ Usar no JARVIS'),
          h('button', {
            className: 'btn btn--ghost btn--sm',
            title: 'Excluir',
            onclick: () => {
              if (!confirm(`Excluir a chave "${item.nome}" do cofre?`)) return;
              saveVault(loadVault().filter((candidate) => candidate.id !== item.id));
              render();
            },
          }, '🗑'),
        ),
      );
      wrap.appendChild(rowElement);
    });

    const nameInput = h('input', {
      className: 'input',
      placeholder: 'Nome (ex: Claude_Fable)',
      maxlength: '60',
    });
    const valueInput = h('input', {
      className: 'input',
      type: 'password',
      placeholder: 'Valor da chave (ex: sk-ant-…)',
      autocomplete: 'off',
    });
    wrap.appendChild(h('div', { className: 'apis-vault__form' },
      nameInput,
      valueInput,
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => {
          const name = nameInput.value.trim();
          const value = valueInput.value.trim();
          if (!name || !value) {
            toast('Preencha nome e valor', { type: 'warning' });
            return;
          }
          saveVault([...loadVault(), { id: uid('key'), nome: name, valor: value }]);
          toast(`Chave "${name}" guardada no cofre local`, { type: 'success' });
          render();
        },
      }, '+ Adicionar ao cofre'),
    ));
  }

  render();
  return wrap;
}

export function apisPage(): HTMLDivElement {
  const page = h('div', { className: 'page-apis' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'IA & JARVIS'),
        h('span', null, '›'),
        h('span', null, 'CENTRAL DE APIS'),
      ),
      h('h1', { className: 'page-header__title' }, '🔑 Central de APIs'),
      h('p', { className: 'page-header__description' },
        'Detecta, testa e gerencia as IAs do Baluarte (issue #200). As chaves do ',
        h('span', { className: 'u-text-cyan' }, 'servidor'),
        ' ficam na Vercel (o site só vê existe/não-existe); as do ',
        h('span', { className: 'u-text-cyan' }, 'navegador'),
        ' ficam no cofre local abaixo — nada vai para o repositório.',
      ),
    ),
  );

  page.appendChild(buildServerCard());
  const config = loadConfig();
  const keyInput = h('input', {
    className: 'input',
    type: 'password',
    autocomplete: 'off',
    placeholder: 'sk-ant-… (chave do navegador p/ modo Claude)',
    value: config.apiKey || '',
    oninput: (event: Event) => {
      const input = event.currentTarget;
      if (!(input instanceof HTMLInputElement)) return;
      const nextConfig = loadConfig();
      nextConfig.apiKey = input.value.trim();
      saveConfig(nextConfig);
    },
  });

  page.appendChild(h('div', { className: 'apis-grid' },
    providerCard({
      icon: '◉',
      name: 'JARVIS Local',
      where: 'navegador · sem chave',
      desc: 'Assistente de regras embutido: navega no site e consulta equipes/armas/arcos. Sempre disponível.',
      test: async () => 'sempre on',
    }),
    providerCard({
      icon: '🤖',
      name: 'Claude (navegador)',
      where: 'chave no navegador',
      desc: 'Chamada direta à API da Anthropic com a chave colada aqui (a mesma do ⚙ do JARVIS). Teste custa 1 token.',
      test: testClaudeNavegador,
      extra: h('div', { className: 'apis-card__extra' }, keyInput),
    }),
    providerCard({
      icon: '🛰',
      name: 'Claude (servidor)',
      where: 'chave na Vercel',
      desc: 'O /api/claude usa a chave das Environment Variables (detecta até nome personalizado, ex: Claude_Fable). É modo do JARVIS e membro do Conselho de IAs.',
      test: testClaudeServidor,
    }),
    providerCard({
      icon: '🌐',
      name: 'Gemini (servidor)',
      where: 'chave na Vercel',
      desc: 'O /api/chat de sempre (modo Servidor do JARVIS), com busca no Google. Use a detecção acima para ver a chave.',
      test: async () => {
        const base = resolveServerBase(loadConfig().serverUrl);
        const data = await fetchJson(`${base}/health`, {}, 8000);
        const record = isRecord(data) ? data : {};
        if (record.hasKey !== true) throw new Error('GEMINI_API_KEY ausente no servidor');
        return typeof record.model === 'string' ? record.model : 'ok';
      },
    }),
    providerCard({
      icon: '⚖',
      name: 'Hermes (servidor)',
      where: 'chave na Vercel',
      desc: 'OpenRouter (/api/hermes), membro do Conselho de IAs. Teste de verdade consome tokens — aqui só detectamos a chave.',
      test: async () => {
        const base = resolveServerBase(loadConfig().serverUrl);
        const data = await fetchJson(`${base}/health`, {}, 8000);
        const record = isRecord(data) ? data : {};
        const keys = isRecord(record.keys) ? record.keys : null;
        if (!keys) throw new Error('backend antigo — faça o deploy');
        if (keys.hermes !== true) throw new Error('OPENROUTER_API_KEY ausente no servidor');
        const models = isRecord(record.models) ? record.models : {};
        return typeof models.hermes === 'string' ? models.hermes : 'ok';
      },
    }),
    providerCard({
      icon: '🦙',
      name: 'Ollama (local)',
      where: 'sua máquina · sem chave',
      desc: 'Modelos locais via Ollama (http://localhost:11434). O teste lista os modelos instalados.',
      test: testOllama,
    }),
  ));
  page.appendChild(buildVaultCard());
  return page;
}
