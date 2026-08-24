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
  sha?: string;
  message: string;
  date: string;
}

interface DashboardActivity {
  date: string;
  count: number;
}

interface DashboardCommitsResponse {
  head?: string;
  commits: DashboardCommit[];
  activity: DashboardActivity[];
  activityTruncated: boolean;
}

interface DashboardMonitorData {
  status: DashboardStatus;
  sessions: DashboardSession[];
  events: DashboardEvent[];
  memories: MemoryMap;
}

interface DashboardSnapshot extends DashboardMonitorData {
  commits: DashboardCommit[];
  activity: DashboardActivity[];
  activityTruncated: boolean;
  head: string | null;
}

type MemoryFacts = Record<string, unknown>;
type MemoryMap = Record<string, MemoryFacts>;

interface DashboardDemoData {
  status: DashboardStatus;
  sessions: DashboardSession[];
  events: DashboardEvent[];
  memories: MemoryMap;
  commits: DashboardCommit[];
  activity: DashboardActivity[];
}

let monitorTimer: number | null = null;
let graphTimer: number | null = null;
let rootElement: HTMLDivElement | null = null;
let monitorInFlight = false;
let graphInFlight = false;
let snapshot: DashboardSnapshot | null = null;

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

function parseCommits(value: unknown): DashboardCommitsResponse {
  if (!isRecord(value) || !Array.isArray(value.commits)) {
    return { commits: [], activity: [], activityTruncated: false };
  }
  const commits = value.commits.filter(isRecord).map((commit) => ({
    hash: stringValue(commit.hash) ?? '—',
    sha: stringValue(commit.sha),
    message: stringValue(commit.message) ?? '—',
    date: stringValue(commit.date) ?? '—',
  }));
  const activity = Array.isArray(value.activity)
    ? value.activity.filter(isRecord).map((item) => ({
      date: stringValue(item.date) ?? '—',
      count: numberValue(item.count) ?? 0,
    }))
    : [];
  return {
    head: stringValue(value.head),
    commits,
    activity,
    activityTruncated: value.activityTruncated === true,
  };
}

function mergeCommits(current: readonly DashboardCommit[], incoming: readonly DashboardCommit[]): DashboardCommit[] {
  const merged = [...incoming, ...current];
  const seen = new Set<string>();
  return merged.filter((commit) => {
    const key = commit.sha ?? commit.hash;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 20);
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
    activity: Array.from({ length: 14 }, (_, index) => ({
      date: new Date(now - (13 - index) * 86400000).toISOString().slice(0, 10),
      count: [3, 7, 2, 11, 5, 9, 4, 6, 8, 12, 5, 10, 7, 14][index],
    })),
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
  return card('Últimos commits', '⎇', [
    h('p', { className: 'jd-card__hint' }, `Janela visual: ${commits.length} commits; o restante fica agregado no gráfico.`),
    ...rows,
  ]);
}

function renderActivity(activity: readonly DashboardActivity[], truncated: boolean): HTMLDivElement {
  if (!activity.length) return card('Cadência de commits', '▥', [h('p', { className: 'u-text-muted' }, 'Sem atividade agregada.')]);
  const max = Math.max(...activity.map((item) => item.count), 1);
  const total = activity.reduce((sum, item) => sum + item.count, 0);
  const bars = activity.map((item) => {
    const parts = item.date.split('-');
    const label = parts.length >= 3 ? `${parts[2]}/${parts[1]}` : item.date;
    const height = Math.max(4, Math.round((item.count / max) * 100));
    return h('div', { className: 'jd-activity__item', title: `${item.date}: ${item.count} commits` },
      h('span', { className: 'jd-activity__count' }, String(item.count)),
      h('span', { className: 'jd-activity__bar-wrap' }, h('span', { className: 'jd-activity__bar', style: { height: `${height}%` } })),
      h('span', { className: 'jd-activity__label' }, label),
    );
  });
  return card('Cadência de commits', '▥', [
    h('div', { className: 'jd-activity__summary' }, `${total} commits nos últimos ${activity.length} dias`),
    h('div', { className: 'jd-activity' }, ...bars),
    ...(truncated ? [h('p', { className: 'jd-card__hint' }, 'A série atingiu o teto de amostragem; os valores podem estar subestimados.')] : []),
  ]);
}

function panelTarget(root: HTMLDivElement, id: string): HTMLDivElement | null {
  const target = root.querySelector(`#${id}`);
  return target instanceof HTMLDivElement ? target : null;
}

function clearPanelState(target: HTMLDivElement): void {
  target.querySelector('.jd-panel-state')?.remove();
}

function appendPanelState(target: HTMLDivElement, message: string, kind: 'warning' | 'error'): void {
  clearPanelState(target);
  target.appendChild(h('div', { className: `jd-panel-state jd-panel-state--${kind}` }, message));
}

function demoSnapshot(): DashboardSnapshot {
  const demo = demoData();
  return {
    status: demo.status,
    sessions: demo.sessions,
    events: demo.events,
    memories: demo.memories,
    commits: demo.commits,
    activity: demo.activity,
    activityTruncated: false,
    head: null,
  };
}

function renderHeaderStatus(root: HTMLDivElement, status: DashboardStatus): void {
  const badge = root.querySelector('#jd-header-status');
  if (!(badge instanceof HTMLSpanElement)) return;
  badge.className = `jd-badge ${status.demo ? 'jd-badge--demo' : 'jd-badge--online'}`;
  badge.textContent = status.demo ? '◐ demonstração' : '● online';
}

function renderDashboardShell(root: HTMLDivElement): void {
  empty(root);
  root.appendChild(h('div', { className: 'jd-header' },
    h('h1', null, '◉ Jarvis Dashboard'),
    h('div', { className: 'jd-header__meta' },
      h('span', { id: 'jd-header-status', className: 'jd-badge jd-badge--demo' }, '◐ conectando'),
      h('span', { className: 'u-text-muted' }, `Atualiza em ${POLL_INTERVAL / 1000}s`),
    ),
  ));
  const grid = h('div', { className: 'jd-grid jd-dashboard-grid' });
  grid.append(
    h('div', { id: 'jd-monitor-panel', className: 'jd-dashboard-panel' }),
    h('div', { id: 'jd-graph-panel', className: 'jd-dashboard-panel' }),
  );
  root.appendChild(grid);
}

function renderMonitorPanels(root: HTMLDivElement, data: DashboardMonitorData, stateMessage = ''): void {
  const target = panelTarget(root, 'jd-monitor-panel');
  if (!target) return;
  empty(target);
  if (data.status.demo) target.appendChild(offlineBanner());
  target.append(
    renderStatus(data.status),
    renderSessions(data.sessions),
    renderMemory(data.status.users ?? [], data.memories),
    renderEvents(data.events),
  );
  if (stateMessage) appendPanelState(target, stateMessage, 'warning');
  else clearPanelState(target);
}

function renderGraphPanels(root: HTMLDivElement, commits: readonly DashboardCommit[], activity: readonly DashboardActivity[], activityTruncated: boolean, stateMessage = ''): void {
  const target = panelTarget(root, 'jd-graph-panel');
  if (!target) return;
  empty(target);
  target.append(renderActivity(activity, activityTruncated), renderCommits(commits));
  if (stateMessage) appendPanelState(target, stateMessage, 'warning');
  else clearPanelState(target);
}

function renderGraphError(root: HTMLDivElement, message: string): void {
  const target = panelTarget(root, 'jd-graph-panel');
  if (!target) return;
  empty(target);
  target.appendChild(card('Cadência de commits', '▥', [h('p', { className: 'u-text-muted' }, message)]));
  appendPanelState(target, 'O monitor continua independente e seguirá atualizando.', 'error');
}

async function fetchCommits(after: string | null): Promise<DashboardCommitsResponse> {
  const query = after ? `&after=${encodeURIComponent(after)}` : '';
  try {
    return parseCommits(await api(`/jarvis-db/commits?limit=20${query}`));
  } catch (error) {
    if (!after) throw error;
    return parseCommits(await api('/jarvis-db/commits?limit=20'));
  }
}

async function refreshMonitor(root: HTMLDivElement): Promise<void> {
  if (monitorInFlight || rootElement !== root) return;
  monitorInFlight = true;
  try {
    const status = parseStatus(await api('/jarvis-db/status'));
    if (!status.online) {
      const demo = demoSnapshot();
      snapshot = { ...(snapshot ?? demo), ...demo };
      renderHeaderStatus(root, demo.status);
      renderMonitorPanels(root, demo);
      return;
    }

    const previous = snapshot;
    const [sessionsResult, eventsResult] = await Promise.allSettled([
      api('/jarvis-db/sessions?limit=15'),
      api('/jarvis-db/events?limit=50'),
    ]);
    const sessions = sessionsResult.status === 'fulfilled' ? parseSessions(sessionsResult.value) : previous?.sessions ?? [];
    const events = eventsResult.status === 'fulfilled' ? parseEvents(eventsResult.value) : previous?.events ?? [];
    const memories: MemoryMap = {};
    await Promise.all((status.users ?? []).map(async (user) => {
      try {
        const value = await api(`/jarvis-db/memory/${encodeURIComponent(user)}`);
        memories[user] = isRecord(value) ? parseMemoryFacts(value.facts) : {};
      } catch {
        memories[user] = previous?.memories[user] ?? {};
      }
    }));
    const monitorData: DashboardMonitorData = { status, sessions, events, memories };
    snapshot = { ...(previous ?? demoSnapshot()), ...monitorData };
    renderHeaderStatus(root, status);
    renderMonitorPanels(root, monitorData);
  } catch {
    const previous = snapshot ?? demoSnapshot();
    snapshot = previous;
    renderHeaderStatus(root, previous.status);
    renderMonitorPanels(root, previous, 'Monitor temporariamente indisponível; último estado mantido.');
  } finally {
    monitorInFlight = false;
  }
}

async function refreshGraph(root: HTMLDivElement): Promise<void> {
  if (graphInFlight || rootElement !== root) return;
  graphInFlight = true;
  try {
    const previous = snapshot ?? demoSnapshot();
    const commitData = await fetchCommits(previous.head);
    const commits = mergeCommits(previous.commits, commitData.commits);
    const activity = commitData.activity.length ? commitData.activity : previous.activity;
    const activityTruncated = commitData.activity.length ? commitData.activityTruncated : previous.activityTruncated;
    snapshot = {
      ...previous,
      commits,
      activity,
      activityTruncated,
      head: commitData.head ?? previous.head,
    };
    renderGraphPanels(root, commits, activity, activityTruncated);
  } catch {
    if (snapshot?.commits.length || snapshot?.activity.length) {
      renderGraphPanels(root, snapshot.commits, snapshot.activity, snapshot.activityTruncated, 'Gráfico temporariamente indisponível; último estado mantido.');
    } else {
      renderGraphError(root, 'Não foi possível carregar a cadência de commits agora.');
    }
  } finally {
    graphInFlight = false;
  }
}

function scheduleMonitorPoll(root: HTMLDivElement): void {
  if (rootElement !== root) return;
  monitorTimer = window.setTimeout(async () => {
    await refreshMonitor(root);
    scheduleMonitorPoll(root);
  }, POLL_INTERVAL);
}

function scheduleGraphPoll(root: HTMLDivElement): void {
  if (rootElement !== root) return;
  graphTimer = window.setTimeout(async () => {
    await refreshGraph(root);
    scheduleGraphPoll(root);
  }, POLL_INTERVAL);
}

function startPolling(root: HTMLDivElement): void {
  stopPolling();
  scheduleMonitorPoll(root);
  scheduleGraphPoll(root);
}

function stopPolling(): void {
  if (monitorTimer !== null) {
    window.clearTimeout(monitorTimer);
    monitorTimer = null;
  }
  if (graphTimer !== null) {
    window.clearTimeout(graphTimer);
    graphTimer = null;
  }
}

export function jarvisDashboardPage(): HTMLDivElement {
  stopPolling();
  snapshot = null;
  monitorInFlight = false;
  graphInFlight = false;
  const root = h('div', { className: 'jarvis-dashboard-page page-wrap' });
  rootElement = root;
  renderDashboardShell(root);
  void refreshMonitor(root);
  void refreshGraph(root);
  startPolling(root);
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
