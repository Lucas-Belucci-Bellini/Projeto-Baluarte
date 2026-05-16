/**
 * Home — Ponte de Comando.
 * Cards de status do sistema, métricas, vigilância e acesso rápido.
 */

import { h, formatNumber } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { appState } from '../core/state.js';

const QUICK_LINKS = [
  { label: 'Hub de Ferramentas', path: '/ferramentas', icon: '⚙', desc: '35+ ferramentas técnicas' },
  { label: 'Biblioteca', path: '/biblioteca', icon: '◫', desc: 'Crônicas da Baluarte' },
  { label: 'Arsenal', path: '/arsenal', icon: '⌖', desc: '159 armas + veículos' },
  { label: 'Elites', path: '/elites', icon: '◆', desc: 'Equipes ALFA → ZULU' },
  { label: 'J.A.R.V.I.S.', path: '/jarvis', icon: '◉', desc: 'Assistente de IA' },
  { label: 'Sobre o Projeto', path: '/sobre', icon: '◇', desc: 'História e mapa do site' }
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
  return h(
    'div',
    {
      className: 'card card--interactive tool-card anim-fade-in-up',
      'data-status': 'ready',
      onclick: () => router.navigate(link.path)
    },
    h(
      'div',
      { className: 'tool-card__head' },
      h('div', { className: 'tool-card__icon' }, link.icon),
      h('span', { className: 'badge badge--success' }, 'PRONTO')
    ),
    h('h3', { className: 'tool-card__title' }, link.label),
    h('p', { className: 'tool-card__desc' }, link.desc),
    h('div', { className: 'tool-card__meta' }, 'Disponível agora')
  );
}

function buildBanner() {
  return h(
    'div',
    { className: 'card card--magenta home-build anim-fade-in' },
    h('div', { className: 'home-build__badge' }, '⚠ v1.0.0 · EM CONSTRUÇÃO'),
    h(
      'div',
      { className: 'home-build__body' },
      h('p', { className: 'home-build__text' },
        'O Baluarte chegou à v1.0.0 — sua primeira versão completa, entregue em ' +
        '21 fases. Ainda assim, o projeto segue em construção: novas versões ' +
        'trarão mais conteúdo. As fases são snapshots do caminho percorrido.'),
      h('button', {
        className: 'btn btn--primary btn--sm',
        onclick: () => router.navigate('/sobre')
      }, '◇ Conhecer a história do projeto')
    )
  );
}

function vigilanciaPanel() {
  const events = [
    { time: 'v1.0.0', tag: 'NÚCLEO', msg: 'Mark XIII estável — 21 fases entregues.', cls: 'u-text-cyan' },
    { time: 'rotas', tag: 'ROUTER', msg: 'SPA hash router com 31 rotas ativas.', cls: 'u-text-success' },
    { time: 'IA', tag: 'JARVIS', msg: 'J.A.R.V.I.S. online — 4 modos operacionais.', cls: 'u-text-success' },
    { time: 'IA', tag: 'MARK 11', msg: 'IA Proprietária — sistema de Skills carregado.', cls: 'u-text-success' },
    { time: 'PWA', tag: 'OFFLINE', msg: 'Service Worker ativo — site funciona offline.', cls: 'u-text-success' },
    { time: 'lore', tag: 'CRÔNICAS', msg: 'Onde os Deuses Sangram — saga em 4 partes na Biblioteca.', cls: 'u-text-cyan' }
  ];

  const list = h(
    'ul',
    { style: { display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px' } },
    ...events.map((ev) =>
      h(
        'li',
        { style: { display: 'flex', gap: '12px', alignItems: 'baseline' } },
        h('span', { className: 'u-text-muted', style: { minWidth: '46px' } }, ev.time),
        h('span', { className: `badge ${ev.cls === 'u-text-cyan' ? 'badge--cyan' : 'badge--success'}` }, ev.tag),
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
    { label: 'Frontend', value: 'JS ES2022 puro + Vite 5', status: 'OK', cls: 'badge--success' },
    { label: 'Roteamento', value: 'SPA hash router · 31 rotas', status: 'OK', cls: 'badge--success' },
    { label: 'Persistência', value: 'localStorage + IndexedDB', status: 'OK', cls: 'badge--success' },
    { label: 'PWA / Service Worker', value: 'Offline-first ativo', status: 'OK', cls: 'badge--success' },
    { label: 'Inteligência', value: 'J.A.R.V.I.S. + IA Mark 11', status: 'ONLINE', cls: 'badge--cyan' }
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
  const user = appState.get('user') || { name: 'Operador' };

  return h(
    'div',
    { className: 'page-home' },
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
        'Bem-vindo, operador ',
        h('strong', { className: 'u-text-cyan' }, user.name),
        '. Status do Mark XIII em tempo real. Use o menu lateral ou os cards abaixo para navegar.'
      )
    ),

    buildBanner(),

    /* Métricas */
    h(
      'div',
      { className: 'status-grid' },
      metricCard('VERSÃO', 'v1.0.0', '21 / 21 fases entregues', 'u-text-cyan', 'card--magenta'),
      metricCard('ROTAS ATIVAS', formatNumber(31), 'todas operacionais'),
      metricCard('FERRAMENTAS', formatNumber(35), 'em 7 categorias'),
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

    /* Vigilância + Infra */
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
