/**
 * Home — Ponte de Comando.
 * Cards de status do sistema, métricas, vigilância, acesso rápido.
 */

import { h, formatNumber } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { appState } from '../core/state.js';

const QUICK_LINKS = [
  { label: 'Hub de Ferramentas', path: '/ferramentas', icon: '⚙', desc: '35+ ferramentas técnicas' },
  { label: 'Arsenal', path: '/arsenal', icon: '⌖', desc: '159 armas + veículos', phase: 3 },
  { label: 'Biblioteca', path: '/biblioteca', icon: '◫', desc: 'Crônicas da Baluarte', phase: 3 },
  { label: 'Elites', path: '/elites', icon: '◆', desc: '18 equipes ALFA → ZETA', phase: 3 },
  { label: 'J.A.R.V.I.S.', path: '/jarvis', icon: '◉', desc: 'Assistente IA', phase: 5 },
  { label: 'CiberSeg', path: '/ciberseg', icon: '⚿', desc: 'Defesa cibernética', phase: 3 }
];

function metricCard(label, value, trend, trendClass = 'u-text-success', accent = 'card') {
  return h(
    'div',
    { className: `card ${accent} metric-card anim-fade-in-up` },
    h('div', { className: 'metric-card__label' }, label),
    h('div', { className: 'metric-card__value' }, value),
    trend &&
      h(
        'div',
        { className: `metric-card__trend ${trendClass}` },
        h('span', { className: 'status-dot status-dot--online' }),
        trend
      )
  );
}

function quickCard(link) {
  const isLocked = link.phase && link.phase > 1;
  return h(
    'div',
    {
      className: 'card card--interactive tool-card anim-fade-in-up',
      'data-status': isLocked ? 'locked' : 'ready',
      onclick: () => {
        router.navigate(link.path);
      }
    },
    h(
      'div',
      { className: 'tool-card__head' },
      h('div', { className: 'tool-card__icon' }, link.icon),
      isLocked
        ? h('span', { className: 'badge badge--magenta' }, `F${link.phase}`)
        : h('span', { className: 'badge badge--success' }, 'PRONTO')
    ),
    h('h3', { className: 'tool-card__title' }, link.label),
    h('p', { className: 'tool-card__desc' }, link.desc),
    h(
      'div',
      { className: 'tool-card__meta' },
      isLocked ? `Em desenvolvimento · Fase ${link.phase}` : 'Disponível agora'
    )
  );
}

function vigilanciaPanel() {
  const events = [
    { time: '03:14', tag: 'NÚCLEO', msg: 'Sistema operacional Mark XIII inicializado.', cls: 'u-text-cyan' },
    { time: '03:14', tag: 'ROUTER', msg: 'SPA hash router carregou 13 rotas.', cls: 'u-text-success' },
    { time: '03:13', tag: 'STORAGE', msg: 'localStorage namespace "baluarte:" verificado.', cls: 'u-text-success' },
    { time: '03:12', tag: 'PWA', msg: 'manifest.json ativo. Service Worker em modo passivo.', cls: 'u-text-warning' },
    { time: '03:11', tag: 'AUTH', msg: 'Shadow Bridge não inicializado — Fase 5.', cls: 'u-text-muted' },
    { time: '03:10', tag: 'IA', msg: 'J.A.R.V.I.S. offline — aguardando Fase 5.', cls: 'u-text-muted' }
  ];

  const list = h(
    'ul',
    { style: { display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' } },
    ...events.map((ev) =>
      h(
        'li',
        { style: { display: 'flex', gap: '12px', alignItems: 'baseline' } },
        h('span', { className: 'u-text-muted' }, ev.time),
        h('span', { className: `badge ${ev.cls === 'u-text-success' ? 'badge--success' : ev.cls === 'u-text-warning' ? 'badge--warning' : ev.cls === 'u-text-cyan' ? 'badge--cyan' : 'badge--muted'}` }, ev.tag),
        h('span', { style: { color: 'var(--color-text-secondary)' } }, ev.msg)
      )
    )
  );

  return h(
    'div',
    { className: 'card card--magenta anim-fade-in-up' },
    h(
      'div',
      { className: 'card__header' },
      h('h3', { className: 'card__title' }, '⌖ Vigilância — log de eventos'),
      h('span', { className: 'badge badge--magenta anim-pulse-magenta' }, 'AO VIVO')
    ),
    list
  );
}

function statusInfraPanel() {
  const items = [
    { label: 'Frontend', value: 'JS ES2022 + Vite 5', status: 'OK', cls: 'badge--success' },
    { label: 'Backend (J.A.R.V.I.S.)', value: 'Node 22 + Express', status: 'FASE 5', cls: 'badge--magenta' },
    { label: 'Persistência', value: 'localStorage + IndexedDB', status: 'PARCIAL', cls: 'badge--warning' },
    { label: 'PWA / Service Worker', value: 'Skeleton ativo', status: 'PASSIVO', cls: 'badge--warning' },
    { label: 'Auth (Shadow Bridge)', value: 'SHA-256×100', status: 'FASE 5', cls: 'badge--magenta' }
  ];

  const rows = items.map((item) =>
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '12px',
          padding: '8px 0',
          borderBottom: 'var(--border-thin)',
          alignItems: 'center'
        }
      },
      h(
        'div',
        null,
        h('div', { style: { fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' } }, item.label),
        h('div', { style: { fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' } }, item.value)
      ),
      h('span', { className: `badge ${item.cls}` }, item.status)
    )
  );

  return h(
    'div',
    { className: 'card anim-fade-in-up' },
    h(
      'div',
      { className: 'card__header' },
      h('h3', { className: 'card__title' }, '◈ Infraestrutura'),
      h('span', { className: 'badge badge--cyan' }, 'MARK XIII')
    ),
    ...rows
  );
}

export function homePage() {
  const user = appState.get('user');

  return h(
    'div',
    { className: 'page-home' },
    /* Header da página */
    h(
      'div',
      { className: 'page-header anim-fade-in' },
      h(
        'div',
        { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'PONTE DE COMANDO')
      ),
      h('h1', { className: 'page-header__title' }, 'Ponte de Comando'),
      h(
        'p',
        { className: 'page-header__description' },
        `Bem-vindo, operador `,
        h('strong', { className: 'u-text-cyan' }, user.name),
        '. Status do Mark XIII em tempo real. Use o menu lateral ou os cards abaixo para navegar.'
      )
    ),

    /* Métricas */
    h(
      'div',
      { className: 'status-grid' },
      metricCard('PÁGINAS ATIVAS', '2 / 13', '11 em fases futuras', 'u-text-warning', 'card--magenta'),
      metricCard('FERRAMENTAS', formatNumber(35), 'em 7 categorias'),
      metricCard('FASE ATUAL', '01 / 05', 'Foundation entregue'),
      metricCard('UPTIME NÚCLEO', '∞', 'sessão ativa', 'u-text-cyan')
    ),

    /* Acesso rápido */
    h(
      'div',
      { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Acesso rápido'),
      h('span', { className: 'section-header__count' }, `${QUICK_LINKS.length} módulos`)
    ),
    h(
      'div',
      { className: 'quick-grid', style: { marginBottom: '32px' } },
      ...QUICK_LINKS.map(quickCard)
    ),

    /* Vigilância + Infra side-by-side */
    h(
      'div',
      {
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: 'var(--space-md)'
        }
      },
      vigilanciaPanel(),
      statusInfraPanel()
    )
  );
}
