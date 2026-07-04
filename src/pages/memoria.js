/**
 * /memoria — Memória do JARVIS (durável, estilo supermemory).
 *
 * Mostra e gerencia os fatos que o JARVIS guardou ("lembre que ..."), ligados
 * aos conceitos do Segundo Cérebro. Lê/escreve via src/utils/jarvis-brain.js.
 */

import '../styles/memoria.css';
import { h, empty, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  getMemories, addMemory, deleteMemory, clearMemories,
  searchMemories, memoryStats, conceptLabel, conceptRoute,
  syncRepoMemories, syncUserMemories
} from '../utils/jarvis-brain.js';
import { isLoggedIn } from '../core/supabase-auth.js';

function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export function memoriaPage() {
  const page = h('div', { className: 'page-memoria' });
  let query = '';

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MEMÓRIA')),
      h('h1', { className: 'page-header__title' }, '🧠 Memória do JARVIS'),
      h('p', { className: 'page-header__description' },
        'O que o JARVIS guardou para lembrar entre conversas — cada fato ligado aos conceitos do ',
        h('span', { className: 'u-text-cyan' }, 'Segundo Cérebro'),
        '. No chat: ', h('span', { className: 'u-mono' }, '"lembre que ..."'), '.'))
  );

  const statsEl = h('div', { className: 'mem-stats' });
  page.appendChild(statsEl);

  /* Banco de Dados versionado no repositório (issue #190) */
  const REPO_BASE = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte';
  const dbEl = h('div', { className: 'mem-db', style: { background: 'var(--color-bg-elevated)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' } });
  page.appendChild(dbEl);

  /* Adicionar memória */
  const input = h('input', {
    className: 'mem-input', type: 'text',
    placeholder: 'Ex.: o operador prefere ícones de linha e o universo Warhammer40k'
  });
  const addBtn = h('button', { className: 'btn btn--primary', onclick: add }, '+ Lembrar');
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  page.appendChild(h('div', { className: 'mem-add' }, input, addBtn));

  /* Busca + limpar */
  const searchEl = h('input', {
    className: 'mem-input', type: 'search', placeholder: '🔎 Buscar nas memórias…',
    oninput: debounce((e) => { query = e.target.value.trim(); refresh(); }, 150)
  });
  const clearBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!getMemories().length) return;
      if (confirm('Apagar TODAS as memórias do JARVIS?')) { clearMemories(); refresh(); toast('Memória limpa', { type: 'warning' }); }
    }
  }, '🗑 Apagar tudo');
  const syncBtn = h('button', {
    className: 'btn btn--ghost btn--sm', title: 'Puxar a memória versionada do repositório (branch jarvis-memory)',
    onclick: async () => {
      syncBtn.disabled = true; syncBtn.textContent = '⏳…';
      const n = await syncRepoMemories();
      refresh();
      syncBtn.disabled = false; syncBtn.textContent = '☁️ Repo';
      toast(`Repositório: ${n} memória(s)`, { type: 'success' });
    }
  }, '☁️ Repo');
  /* Sincroniza a Memória com a CONTA do usuário (Supabase, cross-device). */
  const accountBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    title: isLoggedIn() ? 'Sincronizar a Memória com a sua conta' : 'Entre no /perfil pra salvar na conta (cross-device)',
    onclick: async () => {
      if (!isLoggedIn()) {
        toast('Entre com sua conta no /perfil pra salvar a Memória na nuvem', { type: 'info' });
        router.navigate('/perfil');
        return;
      }
      accountBtn.disabled = true; accountBtn.textContent = '⏳…';
      const n = await syncUserMemories();
      refresh();
      accountBtn.disabled = false; accountBtn.textContent = '☁️ Conta';
      toast(`Conta: ${n} memória(s) na nuvem`, { type: 'success' });
    }
  }, '☁️ Conta');
  page.appendChild(h('div', { className: 'mem-tools' }, searchEl, accountBtn, syncBtn, clearBtn));

  const listEl = h('div', { className: 'mem-list' });
  page.appendChild(listEl);

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🕸️ As memórias aparecem como nós no ',
      h('a', { href: '#/cerebro', className: 'u-text-cyan' }, 'Segundo Cérebro'),
      ' e dão contexto ao JARVIS junto com o ',
      h('a', { href: '#/codigo', className: 'u-text-cyan' }, 'Raio-X do Código'), '.')
  );

  function statBox(v, l) {
    return h('div', { className: 'mem-stat' },
      h('div', { className: 'mem-stat__v' }, String(v)),
      h('div', { className: 'mem-stat__l' }, l));
  }

  function chip(id) {
    const route = conceptRoute(id);
    return h('span', {
      className: 'mem-chip',
      title: route ? `Abrir ${route}` : 'Ver no Segundo Cérebro',
      onclick: () => router.navigate(route || '/cerebro')
    }, conceptLabel(id));
  }

  function card(m) {
    return h('div', { className: 'mem-card' },
      h('div', { className: 'mem-card__text' }, m.text),
      h('div', { className: 'mem-card__meta' },
        h('div', { className: 'mem-card__chips' }, ...(m.conceptIds || []).map(chip)),
        h('span', { className: 'mem-card__src' }, m.source || 'jarvis'),
        h('span', { className: 'mem-card__date u-mono u-text-muted' }, fmtDate(m.ts)),
        h('button', {
          className: 'mem-card__del', title: 'Apagar memória',
          onclick: () => { deleteMemory(m.id); refresh(); toast('Memória apagada'); }
        }, '✕')));
  }

  function add() {
    const t = input.value.trim();
    if (t.length < 3) { toast('Escreva o que devo lembrar', { type: 'warning' }); return; }
    const item = addMemory({ text: t, source: 'manual' });
    input.value = '';
    refresh();
    if (item) toast('Memorizado 🧠', { type: 'success' });
  }

  /* Visão "Banco de Dados": detalha por origem + links pro repo (issue #190). */
  function renderDB() {
    empty(dbEl);
    const bySource = {};
    for (const m of getMemories()) { const s = m.source || 'jarvis'; bySource[s] = (bySource[s] || 0) + 1; }
    dbEl.append(
      h('div', { style: { fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' } }, '🗄️ Banco de Dados (repo · branch jarvis-memory)'),
      h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } },
        ...Object.entries(bySource).sort((a, b) => b[1] - a[1]).map(([s, n]) =>
          h('span', { style: { fontSize: '11px', padding: '2px 8px', borderRadius: 'var(--radius-pill)', background: 'var(--color-cyan-soft)', color: 'var(--color-cyan)' } }, `${s}: ${n}`))),
      h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '6px 0' } },
        'Cada pergunta/resposta vira ', h('b', null, '1 commit'), ' aqui — o banco compartilhado que ',
        h('b', null, 'retroalimenta'), ' as IAs, o Segundo Cérebro e o Raio-X (issue #190).'),
      h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h('a', { className: 'btn btn--ghost btn--sm', href: REPO_BASE + '/blob/jarvis-memory/memoria/banco.json', target: '_blank', rel: 'noopener' }, '📄 banco.json'),
        h('a', { className: 'btn btn--ghost btn--sm', href: REPO_BASE + '/commits/jarvis-memory', target: '_blank', rel: 'noopener' }, '📜 commits (1/pergunta)')));
  }

  function refresh() {
    const st = memoryStats();
    empty(statsEl);
    statsEl.append(
      statBox(st.total, 'memórias'),
      statBox(Object.keys(st.byConcept).length, 'conceitos ligados'),
      statBox(getMemories().filter((m) => m.source === 'manual').length, 'manuais'));
    renderDB();

    const items = query ? searchMemories(query, 50) : getMemories();
    empty(listEl);
    if (!items.length) {
      listEl.appendChild(h('div', { className: 'mem-empty u-text-muted' },
        query ? 'Nenhuma memória encontrada.' : 'Ainda não há memórias. Diga ao JARVIS "lembre que ..." ou adicione acima.'));
      return;
    }
    items.forEach((m) => listEl.appendChild(card(m)));
  }

  refresh();
  /* Abre já puxando a memória versionada do repositório (best-effort). */
  syncRepoMemories().then(() => refresh()).catch(() => {});
  /* E sincroniza com a CONTA do usuário, se logado (Supabase, cross-device). */
  if (isLoggedIn()) syncUserMemories().then(() => refresh()).catch(() => {});
  return page;
}
