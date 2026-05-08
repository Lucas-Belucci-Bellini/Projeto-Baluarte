/**
 * Página genérica para rotas ainda não implementadas.
 * Mostra um "Em Desenvolvimento — Fase X" elegante.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';

const ROUTE_INFO = {
  '/biblioteca': {
    title: 'Biblioteca',
    icon: '◫',
    phase: 3,
    blurb:
      'Arquivo das Crônicas da Baluarte: 24+ arcos narrativos, viewer com capítulos e retomada de leitura.'
  },
  '/elites': {
    title: 'Elites',
    icon: '◆',
    phase: 3,
    blurb: '18-20 equipes ALFA → ZETA, fichas de operadores, hierarquia tática completa.'
  },
  '/lab': {
    title: 'Lab Científico',
    icon: '⚛',
    phase: 2,
    blurb: 'Ferramentas científicas, simuladores, calculadoras avançadas e ambiente de experimentação.'
  },
  '/economia': {
    title: 'Economia',
    icon: '◈',
    phase: 5,
    blurb: 'Cotações live (câmbio + crypto), dashboards financeiros e indicadores macro.'
  },
  '/academia': {
    title: 'Academia',
    icon: '◬',
    phase: 3,
    blurb: '10 linguagens com tutoriais offline, trilhas de aprendizado e desafios.'
  },
  '/arsenal': {
    title: 'Arsenal',
    icon: '⌖',
    phase: 3,
    blurb: '159 armas catalogadas + veículos + doutrina de combate.'
  },
  '/ciberseg': {
    title: 'CiberSeg',
    icon: '⚿',
    phase: 3,
    blurb: 'Enciclopédia de ataque e defesa cibernética, ferramentas, OPSEC.'
  },
  '/universo': {
    title: 'Universo',
    icon: '✦',
    phase: 4,
    blurb: 'Hub de universos: Halo, DOOM, Horror, Endfield e crossovers.'
  },
  '/perfil': {
    title: 'Perfil',
    icon: '◔',
    phase: 5,
    blurb: 'Perfil do operador Lucas Belucci Bellini, links e estatísticas pessoais.'
  },
  '/jarvis': {
    title: 'J.A.R.V.I.S.',
    icon: '◉',
    phase: 5,
    blurb: 'Assistente IA com 4 modos (Claude API + Ollama local), memória em IndexedDB e chamada de ferramentas.'
  },
  '/shadow': {
    title: 'Shadow Bridge',
    icon: '◐',
    phase: 5,
    blurb: 'Camada de autenticação SHA-256×100, proteção de áreas sensíveis.'
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
