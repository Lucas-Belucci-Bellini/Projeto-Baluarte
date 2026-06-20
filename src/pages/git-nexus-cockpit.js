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

/* Abas do cockpit. `load()` faz o import dinâmico → chunk só baixa quando a aba é
 * aberta (mantém o cockpit leve e cada ferramenta sob demanda). */
const TABS = [
  { id: 'grafo',     label: '🔗 Grafo de Código', load: () => import('./git-nexus.js').then((m) => m.gitNexusPage()) },
  { id: 'jarvis',    label: '◉ J.A.R.V.I.S.',     load: () => import('./jarvis.js').then((m) => m.jarvisPage()) },
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
  /* aba inicial: por arg direto (rota legada) ou ?tab= (deep-link); cai no grafo */
  const wantTab = (args && (args.tab || (args.query && args.query.tab))) || 'grafo';
  const page = h('div', { className: 'page-gitnexus gn-cock' });

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

  const tabbar = h('div', { className: 'gn-cock__tabs' });
  const panel = h('div', { className: 'gn-cock__panel' });
  const buttons = {};
  let activeId = null;
  let token = 0;   // evita corrida: só o último load pintado

  function activate(tab) {
    if (activeId === tab.id) return;
    activeId = tab.id;
    Object.values(buttons).forEach((b) => b.classList.toggle('is-active', b === buttons[tab.id]));

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
  return page;
}
