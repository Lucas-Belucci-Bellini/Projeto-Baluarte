/**
 * Página /jarvis-dashboard — Dashboard vivo do JARVIS.
 *
 * As respostas do backend local entram como unknown e são estreitadas antes da
 * renderização. O modo demonstração continua disponível quando a API está offline.
 */

import '../styles/jarvis-dashboard.css';
import { h, empty } from '../utils/helpers.js';

const API = 'http://127.0.0.1:8000';
const POLL_INTERVAL = 30_000;

interface DashboardStatus {
  online: boolean;
  demo?: boolean;
  sessions?: number;
  users?: string[];
  events_today?: number;
  last_commit?: string;
}

interface DashboardSession {
  user: string;
  messages: number;
  started?: string;
  summary?: string;
}

interface DashboardEvent {
  type?: string;
  ts?: string;
  user?: string;
  input?: string;
}

interface DashboardCommit {
  hash: string;
  message: string;
  date: string;
}

type MemoryFacts = Record<string, unknown>;
type MemoryMap = Record<string, MemoryFacts>;

interface DashboardDemoData {
  status: DashboardStatus;
  sessions: DashboardSession[];
  events: DashboardEvent[];
  memories: MemoryMap;
  commits: DashboardCommit[];
}

let pollTimer: number | null = null;
let rootElement: HTMLDivElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

async function api(path: string): Promise<unknown> {
  const response = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<unknown>;
}

function parseStatus(value: unknown): DashboardStatus {
  if (!isRecord(value) || typeof value.online !== 'boolean') throw new Error('Resposta de status inválida');
  return {
    online: value.online,
    demo: value.demo === true,
    sessions: numberValue(value.sessions),
    users: Array.isArray(value.users) ? value.users.filter((user): user is string => typeof user === 'string') : [],
    events_today: numberValue(value.events_today),
    last_commit: stringValue(value.last_commit),
  };
}

function parseSessions(value: unknown): DashboardSession[] {
  if (!isRecord(value) || !Array.isArray(value.sessions)) return [];
  return value.sessions.filter(isRecord).map((session) => ({
    user: stringValue(session.user) ?? '—',
    messages: numberValue(session.messages) ?? 0,
    started: stringValue(session.started),
    summary: stringValue(session.summary),
  }));
}

function parseEvents(value: unknown): DashboardEvent[] {
  if (!isRecord(value) || !Array.isArray(value.events)) return [];
  return value.events.filter(isRecord).map((event) => ({
    type: stringValue(event.type), ts: stringValue(event.ts), user: stringValue(event.user), input: stringValue(event.input),
  }));
}

function parseCommits(value: unknown): DashboardCommit[] {
  if (!isRecord(value) || !Array.isArray(value.commits)) return [];
  return value.commits.filter(isRecord).map((commit) => ({
    hash: stringValue(commit.hash) ?? '—', message: stringValue(commit.message) ?? '—', date: stringValue(commit.date) ?? '—',
  }));
}

function parseMemoryFacts(value: unknown): MemoryFacts {
  return isRecord(value) ? value : {};
}

function card(title: string, icon: string, children: readonly HTMLElement[]): HTMLDivElement {
  return h('div', { className: 'jd-card' },
    h('div', { className: 'jd-card__head' },
      h('span', { className: 'jd-card__icon' }, icon), h('span', { className: 'jd-card__title' }, title),
    ),
    h('div', { className: 'jd-card__body' }, ...children),
  );
}

function statBox(label: string, value: unknown, sub = ''): HTMLDivElement {
  return h('div', { className: 'jd-stat' },
    h('div', { className: 'jd-stat__val' }, String(value ?? 0)),
    h('div', { className: 'jd-stat__label' }, label),
    sub ? h('div', { className: 'jd-stat__sub' }, sub) : false,
  );
}

function offlineBanner(): HTMLDivElement {
  return h('div', { className: 'jd-offline' },
    h('span', null, '◐'),
    h('div', null,
      h('strong', null, 'Modo demonstração'),
      h('p', null, 'Mostrando dados de exemplo. Para o dashboard vivo conectado ao Git DB, inicie o backend local: ', h('code', null, 'cd backend && python server.py')),
    ),
  );
}

function demoData(): DashboardDemoData {
  const now = Date.now();
  const timestamp = (minutes: number): string => new Date(now - minutes * 60000).toISOString();
  return {
    status: { online: true, demo: true, sessions: 7, users: ['lucas'], events_today: 14, last_commit: 'feat: jarvis N4 — dashboard vivo' },
    sessions: [
      { user: 'lucas', messages: 23, started: timestamp(35), summary: 'Planejamento da seção militar e mapa tático.' },
      { user: 'lucas', messages: 11, started: timestamp(180), summary: 'Ajustes no visualizador FFT e rádio.' },
      { user: 'lucas', messages: 6, started: timestamp(600), summary: 'Revisão do roadmap e níveis do Jarvis.' },
    ],
    events: [
      { type: 'voz', ts: timestamp(2), user: 'lucas', input: 'Jarvis, status do sistema' },
      { type: 'rosto', ts: timestamp(5), user: 'lucas', input: 'reconhecimento facial confirmado' },
      { type: 'movimento', ts: timestamp(8), input: 'presença detectada pela câmera' },
      { type: 'comando', ts: timestamp(20), user: 'lucas', input: 'abrir mapa tático mundial' },
    ],
    memories: {
      lucas: { nome: 'Lucas', projeto: 'Projeto Baluarte', preferencia: 'tema neon escuro', meta: 'Jarvis nível 5 — autonomia total' },
    },
    commits: [
      { hash: '91aaadb', message: 'feat: mapa tático MapLibre 3D', date: 'hoje' },
      { hash: '7469130', message: 'feat: seção militar 12/12', date: 'ontem' },
      { hash: 'd515d25', message: 'feat: tecnologia, táticas, história', date: 'há 2 dias' },
    ],
  };
}

function renderStatus(status: DashboardStatus): HTMLDivElement {
  return card('Status do Jarvis DB', '⬡', [
    h('div', { className: 'jd-stats-row' },
      statBox('Sessões', status.sessions),
      statBox('Usuários', status.users?.length ?? 0, status.users?.join(', ') || '—'),
      statBox('Eventos hoje', status.events_today),
    ),
    h('div', { className: 'jd-last-commit' }, h('span', { className: 'u-text-muted' }, 'Último commit: '), h('code', null, status.last_commit || '—')),
  ]);
}

function renderSessions(sessions: readonly DashboardSession[]): HTMLDivElement {
  if (!sessions.length) return card('Sessões Recentes', '◫', [h('p', { className: 'u-text-muted' }, 'Nenhuma sessão registrada.')]);
  const rows = sessions.map((session) => h('div', { className: 'jd-session-row' },
    h('span', { className: 'jd-session-row__user' }, session.user),
    h('span', { className: 'jd-session-row__msgs' }, `${session.messages} msgs`),
    h('span', { className: 'jd-session-row__date u-text-muted' }, session.started
      ? new Date(session.started).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'),
    session.summary ? h('p', { className: 'jd-session-row__summary u-text-muted' }, session.summary) : false,
  ));
  return card('Sessões Recentes', '◫', rows);
}

function renderMemory(users: readonly string[], memories: MemoryMap): HTMLDivElement {
  if (!users.length) return card('Memória', '🧠', [h('p', { className: 'u-text-muted' }, 'Nenhum fato registrado.')]);
  const blocks = users.map((user) => {
    const facts = memories[user] ?? {};
    const entries = Object.entries(facts);
    return h('div', { className: 'jd-mem-user' },
      h('div', { className: 'jd-mem-user__name' }, user),
      entries.length ? h('dl', { className: 'jd-mem-facts' }, ...entries.flatMap(([key, value]) => [
        h('dt', null, key), h('dd', null, isRecord(value) && 'value' in value ? String(value.value) : String(value)),
      ])) : h('p', { className: 'u-text-muted' }, 'Sem fatos.'),
    );
  });
  return card('Memória Persistente', '🧠', blocks);
}

function renderEvents(events: readonly DashboardEvent[]): HTMLDivElement {
  if (!events.length) return card('Eventos de Hoje', '◈', [h('p', { className: 'u-text-muted' }, 'Sem eventos registrados hoje.')]);
  const rows = events.slice().reverse().slice(0, 30).map((event) => h('div', { className: 'jd-event-row' },
    h('span', { className: 'jd-event-row__type' }, event.type || '—'),
    h('span', { className: 'jd-event-row__time u-text-muted' }, event.ts ? new Date(event.ts).toLocaleTimeString('pt-BR') : ''),
    event.user ? h('span', { className: 'jd-event-row__user' }, event.user) : false,
    event.input ? h('span', { className: 'jd-event-row__preview u-text-muted' }, event.input.slice(0, 60)) : false,
  ));
  return card('Eventos de Hoje', '◈', rows);
}

function renderCommits(commits: readonly DashboardCommit[]): HTMLDivElement {
  if (!commits.length) return card('Histórico Git', '⎇', [h('p', { className: 'u-text-muted' }, 'Sem commits.')]);
  const rows = commits.map((commit) => h('div', { className: 'jd-commit-row' },
    h('code', { className: 'jd-commit-row__hash' }, commit.hash),
    h('span', { className: 'jd-commit-row__msg' }, commit.message),
    h('span', { className: 'jd-commit-row__date u-text-muted' }, commit.date),
  ));
  return card('Histórico Git', '⎇', rows);
}

function renderDashboard(root: HTMLDivElement, status: DashboardStatus, sessions: readonly DashboardSession[], events: readonly DashboardEvent[], memories: MemoryMap, commits: readonly DashboardCommit[]): void {
  empty(root);
  if (status.demo) root.appendChild(offlineBanner());
  root.appendChild(h('div', { className: 'jd-header' },
    h('h1', null, '◉ Jarvis Dashboard'),
    h('div', { className: 'jd-header__meta' },
      h('span', { className: `jd-badge ${status.demo ? 'jd-badge--demo' : 'jd-badge--online'}` }, status.demo ? '◐ demonstração' : '● online'),
      h('span', { className: 'u-text-muted' }, `Atualiza em ${POLL_INTERVAL / 1000}s`),
    ),
  ));
  const grid = h('div', { className: 'jd-grid' });
  grid.append(renderStatus(status), renderSessions(sessions), renderMemory(status.users ?? [], memories), renderEvents(events), renderCommits(commits));
  root.appendChild(grid);
}

async function loadDashboard(root: HTMLDivElement): Promise<void> {
  empty(root);
  root.appendChild(h('div', { className: 'jd-loader' }, 'Conectando ao Jarvis DB…'));
  let status: DashboardStatus;
  try {
    status = parseStatus(await api('/jarvis-db/status'));
  } catch {
    const demo = demoData();
    renderDashboard(root, demo.status, demo.sessions, demo.events, demo.memories, demo.commits);
    return;
  }
  if (!status.online) {
    const demo = demoData();
    renderDashboard(root, demo.status, demo.sessions, demo.events, demo.memories, demo.commits);
    return;
  }
  const [sessionsResult, eventsResult, commitsResult] = await Promise.allSettled([
    api('/jarvis-db/sessions?limit=15'), api('/jarvis-db/events'), api('/jarvis-db/commits?limit=20'),
  ]);
  const sessions = sessionsResult.status === 'fulfilled' ? parseSessions(sessionsResult.value) : [];
  const events = eventsResult.status === 'fulfilled' ? parseEvents(eventsResult.value) : [];
  const commits = commitsResult.status === 'fulfilled' ? parseCommits(commitsResult.value) : [];
  const memories: MemoryMap = {};
  await Promise.all((status.users ?? []).map(async (user) => {
    try {
      const value = await api(`/jarvis-db/memory/${encodeURIComponent(user)}`);
      memories[user] = isRecord(value) ? parseMemoryFacts(value.facts) : {};
    } catch {
      memories[user] = {};
    }
  }));
  renderDashboard(root, status, sessions, events, memories, commits);
}

function startPolling(root: HTMLDivElement): void {
  stopPolling();
  pollTimer = window.setInterval(() => { void loadDashboard(root); }, POLL_INTERVAL);
}

function stopPolling(): void {
  if (pollTimer !== null) {
    window.clearInterval(pollTimer);
    pollTimer = null;
  }
}

export function jarvisDashboardPage(): HTMLDivElement {
  stopPolling();
  const root = h('div', { className: 'jarvis-dashboard-page page-wrap' });
  rootElement = root;
  void loadDashboard(root).then(() => startPolling(root));
  const observer = new MutationObserver(() => {
    if (!document.contains(root)) {
      stopPolling();
      if (rootElement === root) rootElement = null;
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  return root;
}
