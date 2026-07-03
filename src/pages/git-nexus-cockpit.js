/**
 * /git-nexus → Núcleo de IA (cockpit) — fusão da seção IA & JARVIS (#231/#238).
 *
 * Etapa 1 da fusão escolhida pelo operador ("cockpit com abas, reusando código",
 * incremental): o Git Nexus, dentro do app, vira um cockpit com uma BARRA DE ABAS.
 * A aba "Grafo de Código" é a experiência completa atual (`git-nexus.js`); as
 * demais abas são as ferramentas da seção IA & JARVIS, cada uma **carregada sob
 * demanda** (dynamic import) e montada como painel reusando o render que já existe
 * — sem reescrever nenhuma feature.
 *
 * Só roda no app (o gate `git-nexus-gate.js` já garante isso; na web é teaser).
 * As rotas individuais (/jarvis, /memoria, …) seguem funcionando — esta etapa é
 * aditiva; a unificação de navegação/rotas vem nas próximas etapas.
 */

import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { bus } from '../core/events.js';
import { initNucleoLink, getNucleoUrl, setNucleoUrl, simulateNucleoEvent } from '../utils/nucleo-socket.js';

const LAST_TAB_KEY = 'nexus:lastTab';   // lembra a última aba aberta no Núcleo de IA

/* Duração do "pulso de dados" (glitch) por tipo de evento do backend (Fase D). */
const PULSE_MS = { command: 420, biometric: 300, telemetry: 200, system: 160 };

/* Abas do cockpit. `load()` faz o import dinâmico → chunk só baixa quando a aba é
 * aberta (mantém o cockpit leve e cada ferramenta sob demanda). */
const TABS = [
  { id: 'grafo',     label: '🔗 Grafo de Código', load: () => import('./git-nexus.js').then((m) => m.gitNexusPage()) },
  { id: 'jarvis',    label: '◉ J.A.R.V.I.S.',     load: () => import('./jarvis.js').then((m) => m.jarvisPage()) },
  { id: 'vision',    label: '🤖 Corpo Total',      load: () => import('./jarvis-vision.js').then((m) => m.jarvisVisionPage()) },
  { id: 'gerar',     label: '🧬 Gerar Código',     load: () => import('./gerar-codigo.js').then((m) => m.gerarCodigoPage()) },
  { id: 'conselho',  label: '⚖ Conselho de IAs',  load: () => import('./conselho.js').then((m) => m.conselhoPage()) },
  { id: 'apis',      label: '🔑 Central de APIs',  load: () => import('./apis.js').then((m) => m.apisPage()) },
  { id: 'dashboard', label: '📊 Dashboard',        load: () => import('./jarvis-dashboard.js').then((m) => m.jarvisDashboardPage()) },
  { id: 'ml',        label: '📈 ML da Memória',    load: () => import('./aprendizado.js').then((m) => m.aprendizadoPage()) },
  { id: 'llm',       label: '⚛ Mini-LLM',          load: () => import('./llm-lab.js').then((m) => m.llmLabPage()) },
  { id: 'cerebro',   label: '🕸️ Segundo Cérebro',  load: () => import('./cerebro.js').then((m) => m.cerebroPage()) },
  { id: 'memoria',   label: '🧠 Memória',          load: () => import('./memoria.js').then((m) => m.memoriaPage()) },
  { id: 'terminal',  label: '⌨ Terminal-IA',       load: () => import('./terminal-ia.js').then((m) => m.terminalIaPage()) },
  { id: 'seguranca', label: '🛡 Segurança',        load: () => import('./seguranca.js').then((m) => m.segurancaPage()) },
  { id: 'ia',        label: '🦾 IA Proprietária',  load: () => import('./ia-proprietaria.js').then((m) => m.iaProprietariaPage()) }
];

export function gitNexusCockpit(args = {}) {
  /* aba inicial: arg direto (rota legada) > ?tab= (deep-link) > última aba usada > grafo */
  const explicit = args && (args.tab || (args.query && args.query.tab));
  const wantTab = explicit || storage.get(LAST_TAB_KEY, 'grafo') || 'grafo';
  const page = h('div', { className: 'page-gitnexus gn-cock' });

  /* Backdrop vivo do Núcleo (Fase A do #316): cena 3D do jarvis-nucleo por trás
   * dos painéis. Pesado e app-only (o cockpit só roda no app), Three.js lazy.
   * Best-effort: se o WebGL falhar, o cockpit segue igual (só sem a cena). */
  const backdrop = h('div', { className: 'gn-cock__backdrop', 'aria-hidden': 'true' });
  page.appendChild(backdrop);
  let nucleo = null;
  import('../utils/nucleo-scene.js')
    .then((m) => m.mountNucleoScene(backdrop))
    .then((s) => { nucleo = s; })
    .catch((err) => { console.warn('[nucleo] cena 3D indisponível:', err); backdrop.remove(); });

  /* ===== Fase D (#316): Núcleo AO VIVO — a cena reage a eventos do backend Java.
   * Cada `nucleo:event` (telemetria/voz/biometria via WebSocket) faz a cena
   * PULSAR (glitch). Barra com status + último evento + URL do backend + um
   * botão de teste (demonstra a reação sem o serviço no ar). */
  const liveDot = h('span', { className: 'gn-live__dot' });
  const liveLast = h('span', { className: 'gn-live__last u-text-muted' }, '—');
  const urlInput = h('input', { className: 'input gn-live__url', value: getNucleoUrl(), placeholder: 'ws://localhost:8080', spellcheck: 'false' });
  const liveBar = h('div', { className: 'gn-live' },
    liveDot,
    h('span', { className: 'gn-live__label' }, 'Núcleo ao vivo'),
    liveLast,
    h('div', { className: 'gn-live__conn' },
      urlInput,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { setNucleoUrl(urlInput.value.trim()); } }, 'conectar'),
      h('button', { className: 'btn btn--ghost btn--sm', title: 'Simular um evento pra ver a cena reagir',
        onclick: () => simulateNucleoEvent(['telemetry', 'biometric', 'command'][Math.random() * 3 | 0]) }, '⚡ testar')));

  const offEvent = bus.on('nucleo:event', (ev) => {
    if (nucleo) { try { nucleo.pulse(PULSE_MS[ev && ev.type] || 220); } catch { /* cena saiu */ } }
    liveLast.textContent = `⚡ ${ev && ev.type || 'evento'}${ev && ev.source ? ' · ' + ev.source : ''}`;
    liveBar.classList.add('is-hit'); setTimeout(() => liveBar.classList.remove('is-hit'), 380);
  });
  const offStatus = bus.on('nucleo:status', (s) => {
    liveDot.classList.toggle('is-on', !!(s && s.connected));
    liveDot.title = s && s.connected ? 'conectado ao backend' : 'sem conexão (opcional)';
  });
  initNucleoLink();   // conecta se houver URL salva; senão fica quieto

  /* cabeçalho compacto do Núcleo (cada ferramenta traz o próprio header no painel) */
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '10px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'NÚCLEO DE IA')),
      h('h1', { className: 'page-header__title' }, '🔗 Núcleo de IA'),
      h('p', { className: 'page-header__description' },
        'O hub unificado de IA do Baluarte — grafo de código, JARVIS, memória, ',
        'segundo cérebro, ML, APIs e mais, num cockpit só.'))
  );
  page.appendChild(liveBar);

  const tabbar = h('div', { className: 'gn-cock__tabs' });
  const panel = h('div', { className: 'gn-cock__panel' });
  const buttons = {};
  let activeId = null;
  let token = 0;   // evita corrida: só o último load pintado

  function activate(tab) {
    if (activeId === tab.id) return;
    activeId = tab.id;
    if (nucleo) { try { nucleo.pulse(220); } catch { /* cena pode ter saído */ } }  // "pulso de dados" ao trocar de aba
    Object.values(buttons).forEach((b) => b.classList.toggle('is-active', b === buttons[tab.id]));

    /* lembra a aba e sincroniza a URL (?tab=) sem disparar navegação (replaceState
     * não emite hashchange → o router não re-renderiza). Deixa a aba linkável e
     * sobrevivendo ao reload. */
    storage.set(LAST_TAB_KEY, tab.id);
    try {
      const target = tab.id === 'grafo' ? '#/git-nexus' : `#/git-nexus?tab=${tab.id}`;
      if (window.location.hash !== target) window.history.replaceState(null, '', target);
    } catch { /* ambiente sem history — ignora */ }

    const my = ++token;
    empty(panel);
    panel.appendChild(h('div', { className: 'gn-cock__loading' },
      h('span', { className: 'gn-loading__orb' }),
      h('p', { className: 'u-text-muted' }, `Carregando ${tab.label.replace(/^\S+\s/, '')}…`)));

    Promise.resolve()
      .then(() => tab.load())
      .then((el) => { if (my !== token) return; empty(panel); panel.appendChild(el); })
      .catch((err) => {
        if (my !== token) return;
        console.error(`[nucleo-ia] falha ao carregar "${tab.id}":`, err);
        empty(panel);
        panel.appendChild(h('div', { className: 'gn-cock__err u-text-muted' },
          'Não deu pra carregar este módulo agora. Tente outra aba ou recarregue.'));
      });
  }

  TABS.forEach((tab) => {
    const b = h('button', { className: 'gn-cock__tab', onclick: () => activate(tab) }, tab.label);
    buttons[tab.id] = b;
    tabbar.appendChild(b);
  });

  page.appendChild(tabbar);
  page.appendChild(panel);

  /* arranca na aba pedida (deep-link/rota legada) ou no Grafo de Código */
  activate(TABS.find((t) => t.id === wantTab) || TABS[0]);

  /* limpeza ao sair do Núcleo: desinscreve os handlers do bus (o socket é
   * singleton e segue de pé — barato — pra manter a conexão quente). */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { offEvent(); offStatus(); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
  return page;
}
