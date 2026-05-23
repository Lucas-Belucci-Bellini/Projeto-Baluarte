// Shared content for /home redesign variants — pulled straight from
// src/pages/home.js + src/layout/sidebar.js so all three mockups show the
// exact same information and only the visual treatment differs.

const NAV_GROUPS = [
  {
    label: 'Operações',
    items: [
      { path: '/home', label: 'Ponte de Comando', icon: '⬡' },
      { path: '/ferramentas', label: 'Hub de Ferramentas', icon: '⚙' },
    ],
  },
  {
    label: 'Ferramentas',
    items: [
      { path: '/editor', label: 'Editor de Código', icon: '⌨' },
      { path: '/terminal', label: 'Terminal', icon: '▸' },
      { path: '/calculadoras', label: 'Calculadoras', icon: '∑' },
      { path: '/tabela-verdade', label: 'Tabela Verdade', icon: '⊨' },
      { path: '/cripto', label: 'Lab de Cripto', icon: '⚿' },
      { path: '/regex', label: 'Lab de Regex', icon: '✱' },
      { path: '/graficos', label: 'Gráficos', icon: '◢' },
      { path: '/logic-sim', label: 'Logic Sim', icon: '⊻' },
    ],
  },
  {
    label: 'Conhecimento',
    items: [
      { path: '/biblioteca', label: 'Biblioteca', icon: '◫' },
      { path: '/academia', label: 'Academia', icon: '◬' },
      { path: '/universo', label: 'Universo', icon: '✦' },
    ],
  },
  {
    label: 'Mídia',
    items: [
      { path: '/fft', label: 'Visualizador FFT', icon: '∿' },
      { path: '/media', label: 'Media Hub', icon: '▦' },
    ],
  },
  {
    label: 'Tático',
    items: [
      { path: '/arsenal', label: 'Arsenal', icon: '⌖' },
      { path: '/elites', label: 'Elites', icon: '◆' },
      { path: '/ciberseg', label: 'CiberSeg', icon: '⚿' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { path: '/jarvis', label: 'J.A.R.V.I.S.', icon: '◉' },
      { path: '/perfil', label: 'Perfil', icon: '◔' },
      { path: '/sobre', label: 'Sobre o Projeto', icon: '◇' },
    ],
  },
];

const METRICS = [
  { label: 'Versão',        value: 'v1.0.0', trend: '21 / 21 fases entregues', highlight: true },
  { label: 'Rotas ativas',  value: '41',     trend: 'todas operacionais' },
  { label: 'Ferramentas',   value: '35',     trend: 'em 7 categorias' },
  { label: 'Uptime núcleo', value: '∞',      trend: 'sessão ativa' },
];

const QUICK_LINKS = [
  { label: 'Hub de Ferramentas', path: '/ferramentas', icon: '⚙', desc: '35+ ferramentas técnicas' },
  { label: 'Biblioteca',         path: '/biblioteca',  icon: '◫', desc: 'Crônicas da Baluarte' },
  { label: 'Arsenal',            path: '/arsenal',     icon: '⌖', desc: '251 itens em 15 categorias' },
  { label: 'Elites',             path: '/elites',      icon: '◆', desc: 'Equipes ALFA → ZULU' },
  { label: 'J.A.R.V.I.S.',       path: '/jarvis',      icon: '◉', desc: 'Assistente de IA · 4 modos' },
  { label: 'Sobre o Projeto',    path: '/sobre',       icon: '◇', desc: 'História e mapa do site' },
];

const VIGILANCIA = [
  { time: 'v1.0.0', tag: 'NÚCLEO',   msg: 'Mark XIII estável — 21 fases entregues.',                kind: 'info' },
  { time: 'rotas',  tag: 'ROUTER',   msg: 'SPA hash router com 41 rotas ativas.',                  kind: 'ok'   },
  { time: 'IA',     tag: 'JARVIS',   msg: 'J.A.R.V.I.S. online — 4 modos operacionais.',           kind: 'ok'   },
  { time: 'IA',     tag: 'MARK 11',  msg: 'IA Proprietária — sistema de Skills carregado.',        kind: 'ok'   },
  { time: 'PWA',    tag: 'OFFLINE',  msg: 'Service Worker ativo — site funciona offline.',         kind: 'ok'   },
  { time: 'lore',   tag: 'CRÔNICAS', msg: 'Onde os Deuses Sangram — saga em 4 partes.',            kind: 'info' },
];

const INFRA = [
  { label: 'Frontend',            value: 'JS ES2022 puro + Vite 5',  status: 'OK',     kind: 'ok' },
  { label: 'Roteamento',          value: 'SPA hash router · 41 rotas', status: 'OK',   kind: 'ok' },
  { label: 'Persistência',        value: 'localStorage + IndexedDB',  status: 'OK',     kind: 'ok' },
  { label: 'PWA / Service Worker',value: 'Offline-first ativo',       status: 'OK',     kind: 'ok' },
  { label: 'Inteligência',        value: 'J.A.R.V.I.S. + IA Mark 11', status: 'ONLINE', kind: 'info' },
];

window.HOME_DATA = { NAV_GROUPS, METRICS, QUICK_LINKS, VIGILANCIA, INFRA };
