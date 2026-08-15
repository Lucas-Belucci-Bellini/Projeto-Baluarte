/**
 * Página /memoria — Memória durável do JARVIS.
 *
 * A superfície continua local-first, com sincronização best-effort do branch
 * jarvis-memory e da conta Supabase quando o operador está autenticado.
 */

import '../styles/memoria.css';
import { h, empty, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  getMemories,
  addMemory,
  deleteMemory,
  clearMemories,
  searchMemories,
  memoryStats,
  conceptLabel,
  conceptRoute,
  syncRepoMemories,
  syncUserMemories,
} from '../utils/jarvis-brain.js';
import type { JarvisMemory } from '../utils/jarvis-brain.js';
import { isLoggedIn } from '../core/supabase-auth.js';

function formatDate(timestamp: number): string {
  try {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export function memoriaPage(): HTMLDivElement {
  const page = h('div', { className: 'page-memoria' });
  let query = '';
  const repositoryBase = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte';

  page.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '12px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MEMÓRIA'),
  ),
  h('h1', { className: 'page-header__title' }, '🧠 Memória do JARVIS'),
  h('p', { className: 'page-header__description' },
    'O que o JARVIS guardou para lembrar entre conversas — cada fato ligado aos conceitos do ',
    h('span', { className: 'u-text-cyan' }, 'Segundo Cérebro'),
    '. No chat: ', h('span', { className: 'u-mono' }, '"lembre que ..."'), '.',
  ),
  ));

  const stats = h('div', { className: 'mem-stats' });
  page.appendChild(stats);
  const database = h('div', {
    className: 'mem-db',
    style: {
      background: 'var(--color-bg-elevated)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      marginBottom: 'var(--space-md)',
    },
  });
  page.appendChild(database);

  const input = h('input', {
    className: 'mem-input', type: 'text',
    placeholder: 'Ex.: o operador prefere ícones de linha e o universo Warhammer40k',
  });
  const addButton = h('button', { className: 'btn btn--primary', onclick: add }, '+ Lembrar');
  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') add();
  });
  page.appendChild(h('div', { className: 'mem-add' }, input, addButton));

  const searchInput = h('input', {
    className: 'mem-input', type: 'search', placeholder: '🔎 Buscar nas memórias…',
    oninput: debounce((event: Event) => {
      if (event.target instanceof HTMLInputElement) {
        query = event.target.value.trim();
        refresh();
      }
    }, 150),
  });
  const clearButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!getMemories().length) return;
      if (confirm('Apagar TODAS as memórias do JARVIS?')) {
        clearMemories();
        refresh();
        toast('Memória limpa', { type: 'warning' });
      }
    },
  }, '🗑 Apagar tudo');
  const repositoryButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: 'Puxar a memória versionada do repositório (branch jarvis-memory)',
    onclick: async () => {
      repositoryButton.disabled = true;
      repositoryButton.textContent = '⏳…';
      const count = await syncRepoMemories();
      refresh();
      repositoryButton.disabled = false;
      repositoryButton.textContent = '☁️ Repo';
      toast(`Repositório: ${count} memória(s)`, { type: 'success' });
    },
  }, '☁️ Repo');
  const accountButton = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: isLoggedIn() ? 'Sincronizar a Memória com a sua conta' : 'Entre no /perfil pra salvar na conta (cross-device)',
    onclick: async () => {
      if (!isLoggedIn()) {
        toast('Entre com sua conta no /perfil pra salvar a Memória na nuvem', { type: 'info' });
        router.navigate('/perfil');
        return;
      }
      accountButton.disabled = true;
      accountButton.textContent = '⏳…';
      const count = await syncUserMemories();
      refresh();
      accountButton.disabled = false;
      accountButton.textContent = '☁️ Conta';
      toast(`Conta: ${count} memória(s) na nuvem`, { type: 'success' });
    },
  }, '☁️ Conta');
  page.appendChild(h('div', { className: 'mem-tools' }, searchInput, accountButton, repositoryButton, clearButton));

  const list = h('div', { className: 'mem-list' });
  page.appendChild(list);
  page.appendChild(h('p', {
    className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' },
  },
  '🕸️ As memórias aparecem como nós no ', h('a', { href: '#/cerebro', className: 'u-text-cyan' }, 'Segundo Cérebro'),
  ' e dão contexto ao JARVIS junto com o ', h('a', { href: '#/codigo', className: 'u-text-cyan' }, 'Raio-X do Código'), '.',
  ));

  function statBox(value: number, label: string): HTMLDivElement {
    return h('div', { className: 'mem-stat' },
      h('div', { className: 'mem-stat__v' }, String(value)),
      h('div', { className: 'mem-stat__l' }, label),
    );
  }

  function conceptChip(id: string): HTMLSpanElement {
    const route = conceptRoute(id);
    return h('span', {
      className: 'mem-chip',
      title: route ? `Abrir ${route}` : 'Ver no Segundo Cérebro',
      onclick: () => router.navigate(route || '/cerebro'),
    }, conceptLabel(id));
  }

  function memoryCard(memory: JarvisMemory): HTMLDivElement {
    return h('div', { className: 'mem-card' },
      h('div', { className: 'mem-card__text' }, memory.text),
      h('div', { className: 'mem-card__meta' },
        h('div', { className: 'mem-card__chips' }, ...(memory.conceptIds ?? []).map(conceptChip)),
        h('span', { className: 'mem-card__src' }, memory.source || 'jarvis'),
        h('span', { className: 'mem-card__date u-mono u-text-muted' }, formatDate(memory.ts)),
        h('button', {
          className: 'mem-card__del', title: 'Apagar memória',
          onclick: () => {
            deleteMemory(memory.id);
            refresh();
            toast('Memória apagada');
          },
        }, '✕'),
      ),
    );
  }

  function add(): void {
    const text = input.value.trim();
    if (text.length < 3) {
      toast('Escreva o que devo lembrar', { type: 'warning' });
      return;
    }
    const item = addMemory({ text, source: 'manual' });
    input.value = '';
    refresh();
    if (item) toast('Memorizado 🧠', { type: 'success' });
  }

  function renderDatabase(): void {
    empty(database);
    const bySource: Record<string, number> = {};
    getMemories().forEach((memory) => {
      const source = memory.source || 'jarvis';
      bySource[source] = (bySource[source] ?? 0) + 1;
    });
    database.append(
      h('div', { style: { fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' } }, '🗄️ Banco de Dados (repo · branch jarvis-memory)'),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } },
        ...Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([source, count]) => h('span', {
          style: { fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--color-cyan-soft)', color: 'var(--color-cyan)' },
        }, `${source}: ${count}`)),
      ),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '6px 0' } },
        'Cada pergunta/resposta vira ', h('b', null, '1 commit'), ' aqui — o banco compartilhado que ',
        h('b', null, 'retroalimenta'), ' as IAs, o Segundo Cérebro e o Raio-X (issue #190).',
      ),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('a', { className: 'btn btn--ghost btn--sm', href: `${repositoryBase}/blob/jarvis-memory/memoria/banco.json`, target: '_blank', rel: 'noopener' }, '📄 banco.json'),
        h('a', { className: 'btn btn--ghost btn--sm', href: `${repositoryBase}/commits/jarvis-memory`, target: '_blank', rel: 'noopener' }, '📜 commits (1/pergunta)'),
      ),
    );
  }

  function refresh(): void {
    const memoryStatsValue = memoryStats();
    empty(stats);
    stats.append(
      statBox(memoryStatsValue.total, 'memórias'),
      statBox(Object.keys(memoryStatsValue.byConcept).length, 'conceitos ligados'),
      statBox(getMemories().filter((memory) => memory.source === 'manual').length, 'manuais'),
    );
    renderDatabase();
    const items = query ? searchMemories(query, 50) : getMemories();
    empty(list);
    if (!items.length) {
      list.appendChild(h('div', { className: 'mem-empty u-text-muted' }, query
        ? 'Nenhuma memória encontrada.'
        : 'Ainda não há memórias. Diga ao JARVIS "lembre que ..." ou adicione acima.'));
      return;
    }
    items.forEach((memory) => list.appendChild(memoryCard(memory)));
  }

  refresh();
  syncRepoMemories().then(() => refresh()).catch(() => undefined);
  if (isLoggedIn()) syncUserMemories().then(() => refresh()).catch(() => undefined);
  return page;
}
