/**
 * Página genérica para rotas ainda não implementadas.
 * Mostra um "Em Desenvolvimento — Fase X" elegante.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';

const ROUTE_INFO = {
  /* ===== Páginas principais (13) ===== */
  '/lab': {
    title: 'Lab Científico',
    icon: '⚛',
    phase: 17,
    blurb: 'Ferramentas científicas, simuladores, calculadoras avançadas e ambiente de experimentação.'
  },
  '/economia': {
    title: 'Economia',
    icon: '◈',
    phase: 19,
    blurb: 'Cotações live (câmbio + crypto), dashboards financeiros e indicadores macro.'
  },
  '/jarvis': {
    title: 'J.A.R.V.I.S.',
    icon: '◉',
    phase: 20,
    blurb: 'Assistente IA com 4 modos (Claude API + Ollama local), memória em IndexedDB e chamada de ferramentas.'
  },

  /* ===== Ferramentas (acessadas via Hub) =====
   * /editor (Fase 2) e /terminal (Fase 3) estão implementados — sem placeholder */
  /* F4-F9 ativos */
  '/ia-proprietaria': {
    title: 'IA Proprietária Mark 11',
    icon: '◉',
    phase: 21,
    blurb: 'Sistema dinâmico de Skills (SKILL.md). IA embarcada no Baluarte com referências aos repos Anthropic/Gemini.'
  }
};

export function placeholderPage(path) {
  const info = ROUTE_INFO[path] || {
    title: 'Página desconhecida',
    icon: '∅',
    phase: '?',
    blurb: 'Esta rota não está mapeada no roteiro.'
  };

  return h(
    'section',
    { className: 'empty-state anim-fade-in' },
    h('div', { className: 'empty-state__icon' }, info.icon),
    h('h1', { className: 'empty-state__title' }, info.title),
    h('p', { className: 'empty-state__subtitle' }, info.blurb),
    h('div', { className: 'empty-state__phase' }, `Em desenvolvimento · Fase ${info.phase}`),
    h(
      'div',
      { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
      h(
        'button',
        {
          className: 'btn btn--primary',
          onclick: () => router.navigate('/home')
        },
        '⬅ Voltar à Ponte de Comando'
      ),
      h(
        'button',
        {
          className: 'btn',
          onclick: () => router.navigate('/ferramentas')
        },
        '⚙ Ir ao Hub de Ferramentas'
      )
    )
  );
}

export function notFoundPage(path) {
  return h(
    'section',
    { className: 'empty-state anim-fade-in' },
    h('div', { className: 'empty-state__icon' }, '⚠'),
    h('h1', { className: 'empty-state__title' }, 'Rota não encontrada'),
    h('p', { className: 'empty-state__subtitle' }, `O caminho "${path}" não existe no Baluarte.`),
    h('div', { className: 'empty-state__phase' }, '404 · NAVEGAÇÃO PERDIDA'),
    h(
      'button',
      {
        className: 'btn btn--primary',
        style: { marginTop: '24px' },
        onclick: () => router.navigate('/home')
      },
      '⬅ Voltar ao início'
    )
  );
}
