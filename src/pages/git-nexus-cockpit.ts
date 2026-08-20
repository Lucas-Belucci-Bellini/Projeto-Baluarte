/**
 * /git-nexus — Núcleo de IA (cockpit).
 *
 * O cockpit mantém as abas sob demanda e apenas tipa a superfície de
 * integração: cena 3D lazy, event bus do Núcleo, storage e painéis existentes.
 */

import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { bus } from '../core/events.js';
import { initNucleoLink, getNucleoUrl, setNucleoUrl, simulateNucleoEvent } from '../utils/nucleo-socket.js';
import type { NucleoEvent, NucleoEventType, NucleoStatus } from '../utils/nucleo-socket.js';
import type { NucleoSceneController } from '../utils/nucleo-scene.js';

const LAST_TAB_KEY = 'nexus:lastTab';
const PULSE_MS: Record<NucleoEventType, number> = {
  command: 420,
  biometric: 300,
  telemetry: 200,
  system: 160,
  voice: 360,
};

type CockpitTabId =
  | 'grafo'
  | 'jarvis'
  | 'vision'
  | 'gerar'
  | 'conselho'
  | 'apis'
  | 'dashboard'
  | 'ml'
  | 'llm'
  | 'cerebro'
  | 'memoria'
  | 'terminal'
  | 'seguranca'
  | 'ia';

interface CockpitArgs {
  readonly tab?: CockpitTabId;
  readonly query?: { readonly tab?: CockpitTabId };
}

interface CockpitTab {
  readonly id: CockpitTabId;
  readonly label: string;
  readonly load: () => Promise<HTMLElement>;
}

const TABS: readonly CockpitTab[] = [
  { id: 'grafo', label: '🔗 Grafo de Código', load: () => import('./git-nexus.js').then((module) => module.gitNexusPage()) },
  { id: 'jarvis', label: '◉ J.A.R.V.I.S.', load: () => import('./jarvis').then((module) => module.jarvisPage()) },
  { id: 'vision', label: '🤖 Corpo Total', load: () => import('./jarvis-vision').then((module) => module.jarvisVisionPage()) },
  { id: 'gerar', label: '🧬 Gerar Código', load: () => import('./gerar-codigo.js').then((module) => module.gerarCodigoPage()) },
  { id: 'conselho', label: '⚖ Conselho de IAs', load: () => import('./conselho').then((module) => module.conselhoPage()) },
  { id: 'apis', label: '🔑 Central de APIs', load: () => import('./apis').then((module) => module.apisPage()) },
  { id: 'dashboard', label: '📊 Dashboard', load: () => import('./jarvis-dashboard').then((module) => module.jarvisDashboardPage()) },
  { id: 'ml', label: '📈 ML da Memória', load: () => import('./aprendizado.js').then((module) => module.aprendizadoPage()) },
  { id: 'llm', label: '⚛ Mini-LLM', load: () => import('./llm-lab').then((module) => module.llmLabPage()) },
  { id: 'cerebro', label: '🕸️ Segundo Cérebro', load: () => import('./cerebro').then((module) => module.cerebroPage()) },
  { id: 'memoria', label: '🧠 Memória', load: () => import('./memoria').then((module) => module.memoriaPage()) },
  { id: 'terminal', label: '⌨ Terminal-IA', load: () => import('./terminal-ia.js').then((module) => module.terminalIaPage()) },
  { id: 'seguranca', label: '🛡 Segurança', load: () => import('./seguranca.js').then((module) => module.segurancaPage()) },
  { id: 'ia', label: '🦾 IA Proprietária', load: () => import('./ia-proprietaria.js').then((module) => module.iaProprietariaPage()) },
];

export function gitNexusCockpit(args: CockpitArgs = {}): HTMLDivElement {
  const explicitTab = args.tab ?? args.query?.tab;
  const storedTab = storage.get<string>(LAST_TAB_KEY, 'grafo');
  const wantedTab: CockpitTabId = explicitTab ?? (storedTab as CockpitTabId) ?? 'grafo';
  const page = h('div', { className: 'page-gitnexus gn-cock' });

  const backdrop = h('div', { className: 'gn-cock__backdrop', 'aria-hidden': 'true' });
  page.appendChild(backdrop);
  let scene: NucleoSceneController | null = null;
  import('../utils/nucleo-scene.js')
    .then((module) => module.mountNucleoScene(backdrop))
    .then((mounted) => { scene = mounted; })
    .catch((error: unknown) => {
      console.warn('[nucleo] cena 3D indisponível:', error);
      backdrop.remove();
    });

  const liveDot = h('span', { className: 'gn-live__dot' });
  const liveLast = h('span', { className: 'gn-live__last u-text-muted' }, '—');
  const urlInput = h('input', {
    className: 'input gn-live__url', value: getNucleoUrl(), placeholder: 'ws://localhost:8080', spellcheck: false,
  });
  const liveBar = h('div', { className: 'gn-live' },
    liveDot,
    h('span', { className: 'gn-live__label' }, 'Núcleo ao vivo'),
    liveLast,
    h('div', { className: 'gn-live__conn' },
      urlInput,
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => setNucleoUrl(urlInput.value.trim()),
      }, 'conectar'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        title: 'Simular um evento pra ver a cena reagir',
        onclick: () => {
          const types: readonly NucleoEventType[] = ['telemetry', 'biometric', 'command'];
          simulateNucleoEvent(types[Math.floor(Math.random() * types.length)]);
        },
      }, '⚡ testar'),
    ),
  );

  const offEvent = bus.on<NucleoEvent>('nucleo:event', (event) => {
    if (scene) {
      try { scene.pulse(PULSE_MS[event.type] ?? 220); } catch { /* cena saiu */ }
    }
    liveLast.textContent = `⚡ ${event.type}${event.source ? ` · ${event.source}` : ''}`;
    liveBar.classList.add('is-hit');
    window.setTimeout(() => liveBar.classList.remove('is-hit'), 380);
  });
  const offStatus = bus.on<NucleoStatus>('nucleo:status', (status) => {
    liveDot.classList.toggle('is-on', status.connected);
    liveDot.title = status.connected ? 'conectado ao backend' : 'sem conexão (opcional)';
  });
  initNucleoLink();

  page.appendChild(h('div', {
    className: 'page-header anim-fade-in', style: { marginBottom: '10px' },
  },
  h('div', { className: 'page-header__crumbs' },
    h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'NÚCLEO DE IA'),
  ),
  h('h1', { className: 'page-header__title' }, '🔗 Núcleo de IA'),
  h('p', { className: 'page-header__description' },
    'O hub unificado de IA do Baluarte — grafo de código, JARVIS, memória, segundo cérebro, ML, APIs e mais, num cockpit só.',
  ),
  ));
  page.appendChild(liveBar);

  const tabbar = h('div', { className: 'gn-cock__tabs' });
  const panel = h('div', { className: 'gn-cock__panel' });
  const buttons: Partial<Record<CockpitTabId, HTMLButtonElement>> = {};
  let activeId: CockpitTabId | null = null;
  let token = 0;

  function activate(tab: CockpitTab): void {
    if (activeId === tab.id) return;
    activeId = tab.id;
    if (scene) {
      try { scene.pulse(220); } catch { /* cena pode ter saído */ }
    }
    Object.values(buttons).forEach((button) => button?.classList.toggle('is-active', button === buttons[tab.id]));
    storage.set(LAST_TAB_KEY, tab.id);
    try {
      const target = tab.id === 'grafo' ? '#/git-nexus' : `#/git-nexus?tab=${tab.id}`;
      if (window.location.hash !== target) window.history.replaceState(null, '', target);
    } catch { /* ambiente sem history — ignora */ }

    const currentToken = ++token;
    empty(panel);
    panel.appendChild(h('div', { className: 'gn-cock__loading' },
      h('span', { className: 'gn-loading__orb' }),
      h('p', { className: 'u-text-muted' }, `Carregando ${tab.label.replace(/^\S+\s/, '')}…`),
    ));
    Promise.resolve()
      .then(() => tab.load())
      .then((element) => {
        if (currentToken !== token) return;
        empty(panel);
        panel.appendChild(element);
      })
      .catch((error: unknown) => {
        if (currentToken !== token) return;
        console.error(`[nucleo-ia] falha ao carregar "${tab.id}":`, error);
        empty(panel);
        panel.appendChild(h('div', { className: 'gn-cock__err u-text-muted' },
          'Não deu pra carregar este módulo agora. Tente outra aba ou recarregue.',
        ));
      });
  }

  TABS.forEach((tab) => {
    const button = h('button', { className: 'gn-cock__tab', onclick: () => activate(tab) }, tab.label);
    buttons[tab.id] = button;
    tabbar.appendChild(button);
  });
  page.appendChild(tabbar);
  page.appendChild(panel);
  activate(TABS.find((tab) => tab.id === wantedTab) ?? TABS[0]);

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!document.contains(page)) {
        offEvent();
        offStatus();
        scene?.destroy();
        observer.disconnect();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  return page;
}
