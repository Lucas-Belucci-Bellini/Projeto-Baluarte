/**
 * Página /jarvis-dashboard — Dashboard vivo do Jarvis.
 * Lê o Git DB em tempo real via backend local e exibe:
 * sessões, memória, eventos do dia e histórico de commits.
 * Auto-atualiza a cada 30s enquanto o backend estiver online.
 */

import '../styles/jarvis-dashboard.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

const API = 'http://127.0.0.1:8000';
const POLL_INTERVAL = 30_000;

let _pollTimer = null;
let _root = null;

// ──────────────── Fetch helpers ────────────────

async function api(path) {
  const r = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(5000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// ──────────────── Render helpers ────────────────

function card(title, icon, children) {
  return h('div', { className: 'jd-card' },
    h('div', { className: 'jd-card__head' },
      h('span', { className: 'jd-card__icon' }, icon),
      h('span', { className: 'jd-card__title' }, title)
    ),
    h('div', { className: 'jd-card__body' }, ...children)
  );
}

function statBox(label, value, sub = '') {
  return h('div', { className: 'jd-stat' },
    h('div', { className: 'jd-stat__val' }, String(value)),
    h('div', { className: 'jd-stat__label' }, label),
    sub && h('div', { className: 'jd-stat__sub' }, sub)
  );
}

function offlineBanner() {
  return h('div', { className: 'jd-offline' },
    h('span', null, '◐'),
    h('div', null,
      h('strong', null, 'Modo demonstração'),
      h('p', null,
        'Mostrando dados de exemplo. Para o dashboard vivo conectado ao Git DB, inicie o backend local: ',
        h('code', null, 'cd backend && python server.py')
      )
    )
  );
}

/* Dados de exemplo — usados quando o backend local não está rodando
 * (ex.: no site publicado), para o dashboard ficar vivo mesmo offline. */
function demoData() {
  const now = Date.now();
  const t = (m) => new Date(now - m * 60000).toISOString();
  return {
    status: {
      online: true,
      demo: true,
      sessions: 7,
      users: ['lucas'],
      events_today: 14,
      last_commit: 'feat: jarvis N4 — dashboard vivo'
    },
    sessions: [
      { user: 'lucas', messages: 23, started: t(35), summary: 'Planejamento da seção militar e mapa tático.' },
      { user: 'lucas', messages: 11, started: t(180), summary: 'Ajustes no visualizador FFT e rádio.' },
      { user: 'lucas', messages: 6, started: t(600), summary: 'Revisão do roadmap e níveis do Jarvis.' }
    ],
    events: [
      { type: 'voz', ts: t(2), user: 'lucas', input: 'Jarvis, status do sistema' },
      { type: 'rosto', ts: t(5), user: 'lucas', input: 'reconhecimento facial confirmado' },
      { type: 'movimento', ts: t(8), input: 'presença detectada pela câmera' },
      { type: 'comando', ts: t(20), user: 'lucas', input: 'abrir mapa tático mundial' }
    ],
    memories: {
      lucas: {
        nome: 'Lucas',
        projeto: 'Projeto Baluarte',
        preferencia: 'tema neon escuro',
        meta: 'Jarvis nível 5 — autonomia total'
      }
    },
    commits: [
      { hash: '91aaadb', message: 'feat: mapa tático MapLibre 3D', date: 'hoje' },
      { hash: '7469130', message: 'feat: seção militar 12/12', date: 'ontem' },
      { hash: 'd515d25', message: 'feat: tecnologia, táticas, história', date: 'há 2 dias' }
    ]
  };
}

function renderDashboard(root, status, sessions, events, memoriesMap, commits) {
  empty(root);
  if (status.demo) root.appendChild(offlineBanner());
  root.appendChild(h('div', { className: 'jd-header' },
    h('h1', null, '◉ Jarvis Dashboard'),
    h('div', { className: 'jd-header__meta' },
      h('span', { className: `jd-badge ${status.demo ? 'jd-badge--demo' : 'jd-badge--online'}` },
        status.demo ? '◐ demonstração' : '● online'),
      h('span', { className: 'u-text-muted' }, `Atualiza em ${POLL_INTERVAL / 1000}s`)
    )
  ));
  const grid = h('div', { className: 'jd-grid' });
  grid.appendChild(renderStatus(status));
  grid.appendChild(renderSessions(sessions));
  grid.appendChild(renderMemory(status.users || [], memoriesMap));
  grid.appendChild(renderEvents(events));
  grid.appendChild(renderCommits(commits));
  root.appendChild(grid);
}

// ──────────────── Seções ────────────────

function renderStatus(status) {
  return card('Status do Jarvis DB', '⬡', [
    h('div', { className: 'jd-stats-row' },
      statBox('Sessões', status.sessions),
      statBox('Usuários', status.users?.length || 0, status.users?.join(', ') || '—'),
      statBox('Eventos hoje', status.events_today),
    ),
    h('div', { className: 'jd-last-commit' },
      h('span', { className: 'u-text-muted' }, 'Último commit: '),
      h('code', null, status.last_commit || '—')
    )
  ]);
}

function renderSessions(sessions) {
  if (!sessions.length) {
    return card('Sessões Recentes', '◫', [h('p', { className: 'u-text-muted' }, 'Nenhuma sessão registrada.')]);
  }

  const rows = sessions.map(s =>
    h('div', { className: 'jd-session-row' },
      h('span', { className: 'jd-session-row__user' }, s.user),
      h('span', { className: 'jd-session-row__msgs' }, `${s.messages} msgs`),
      h('span', { className: 'jd-session-row__date u-text-muted' },
        s.started ? new Date(s.started).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : '—'
      ),
      s.summary && h('p', { className: 'jd-session-row__summary u-text-muted' }, s.summary)
    )
  );

  return card('Sessões Recentes', '◫', rows);
}

function renderMemory(users, memoriesMap) {
  if (!users.length) {
    return card('Memória', '🧠', [h('p', { className: 'u-text-muted' }, 'Nenhum fato registrado.')]);
  }

  const blocks = users.map(user => {
    const facts = memoriesMap[user] || {};
    const entries = Object.entries(facts);
    return h('div', { className: 'jd-mem-user' },
      h('div', { className: 'jd-mem-user__name' }, user),
      entries.length
        ? h('dl', { className: 'jd-mem-facts' },
            ...entries.map(([k, v]) => [
              h('dt', null, k),
              h('dd', null, typeof v === 'object' ? v.value : v)
            ]).flat()
          )
        : h('p', { className: 'u-text-muted' }, 'Sem fatos.')
    );
  });

  return card('Memória Persistente', '🧠', blocks);
}

function renderEvents(events) {
  if (!events.length) {
    return card('Eventos de Hoje', '◈', [h('p', { className: 'u-text-muted' }, 'Sem eventos registrados hoje.')]);
  }

  const rows = events.slice().reverse().slice(0, 30).map(ev =>
    h('div', { className: 'jd-event-row' },
      h('span', { className: 'jd-event-row__type' }, ev.type || '—'),
      h('span', { className: 'jd-event-row__time u-text-muted' },
        ev.ts ? new Date(ev.ts).toLocaleTimeString('pt-BR') : ''
      ),
      ev.user && h('span', { className: 'jd-event-row__user' }, ev.user),
      ev.input && h('span', { className: 'jd-event-row__preview u-text-muted' }, ev.input.slice(0, 60))
    )
  );

  return card('Eventos de Hoje', '◈', rows);
}

function renderCommits(commits) {
  if (!commits.length) {
    return card('Histórico Git', '⎇', [h('p', { className: 'u-text-muted' }, 'Sem commits.')]);
  }

  const rows = commits.map(c =>
    h('div', { className: 'jd-commit-row' },
      h('code', { className: 'jd-commit-row__hash' }, c.hash),
      h('span', { className: 'jd-commit-row__msg' }, c.message),
      h('span', { className: 'jd-commit-row__date u-text-muted' }, c.date)
    )
  );

  return card('Histórico Git', '⎇', rows);
}

// ──────────────── Loader principal ────────────────

async function loadDashboard(root) {
  empty(root);

  const loader = h('div', { className: 'jd-loader' }, 'Conectando ao Jarvis DB…');
  root.appendChild(loader);

  let status;
  try {
    status = await api('/jarvis-db/status');
  } catch {
    /* Backend offline → modo demonstração com dados de exemplo. */
    const d = demoData();
    renderDashboard(root, d.status, d.sessions, d.events, d.memories, d.commits);
    return;
  }

  if (!status.online) {
    const d = demoData();
    renderDashboard(root, d.status, d.sessions, d.events, d.memories, d.commits);
    return;
  }

  // carrega tudo em paralelo
  const [sessionsRes, eventsRes, commitsRes] = await Promise.allSettled([
    api('/jarvis-db/sessions?limit=15'),
    api('/jarvis-db/events'),
    api('/jarvis-db/commits?limit=20'),
  ]);

  const sessions = sessionsRes.status === 'fulfilled' ? sessionsRes.value.sessions : [];
  const events   = eventsRes.status   === 'fulfilled' ? eventsRes.value.events   : [];
  const commits  = commitsRes.status  === 'fulfilled' ? commitsRes.value.commits  : [];

  // memória de cada usuário
  const memoriesMap = {};
  await Promise.all((status.users || []).map(async user => {
    try {
      const m = await api(`/jarvis-db/memory/${user}`);
      memoriesMap[user] = m.facts;
    } catch { memoriesMap[user] = {}; }
  }));

  renderDashboard(root, status, sessions, events, memoriesMap, commits);
}

// ──────────────── Ciclo de atualização ────────────────

function startPolling(root) {
  stopPolling();
  _pollTimer = setInterval(() => loadDashboard(root), POLL_INTERVAL);
}

function stopPolling() {
  if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
}

// ──────────────── Exportação ────────────────

export function jarvisDashboardPage() {
  stopPolling();

  const root = h('div', { className: 'jarvis-dashboard-page page-wrap' });
  _root = root;

  loadDashboard(root).then(() => startPolling(root));

  // para o polling ao sair da página
  const observer = new MutationObserver(() => {
    if (!document.contains(root)) {
      stopPolling();
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  return root;
}
