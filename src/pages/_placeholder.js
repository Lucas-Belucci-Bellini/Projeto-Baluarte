/**
 * Página genérica para rotas ainda não implementadas.
 * Mostra um "Em Desenvolvimento — Fase X" elegante.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';

const ROUTE_INFO = {
  /* ===== Páginas principais (13) ===== */
  '/biblioteca': {
    title: 'Biblioteca',
    icon: '◫',
    phase: 12,
    blurb:
      'Arquivo das Crônicas da Baluarte: 24+ arcos narrativos, viewer com capítulos e retomada de leitura.'
  },
  '/elites': {
    title: 'Elites',
    icon: '◆',
    phase: 13,
    blurb: '18-26 equipes ALFA → ZETA, fichas de operadores, hierarquia tática completa.'
  },
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
  '/academia': {
    title: 'Academia',
    icon: '◬',
    phase: 14,
    blurb: '10 linguagens com tutoriais offline, trilhas de aprendizado e desafios.'
  },
  '/arsenal': {
    title: 'Arsenal',
    icon: '⌖',
    phase: 11,
    blurb: '159 armas catalogadas + veículos + doutrina de combate.'
  },
  '/ciberseg': {
    title: 'CiberSeg',
    icon: '⚿',
    phase: 14,
    blurb: 'Enciclopédia de ataque e defesa cibernética, ferramentas, OPSEC.'
  },
  '/universo': {
    title: 'Universo',
    icon: '✦',
    phase: 16,
    blurb: 'Hub de universos: Halo, DOOM, Horror, Endfield e crossovers.'
  },
  '/perfil': {
    title: 'Perfil',
    icon: '◔',
    phase: 18,
    blurb: 'Perfil do operador Lucas Belucci Bellini, links e estatísticas pessoais.'
  },
  '/jarvis': {
    title: 'J.A.R.V.I.S.',
    icon: '◉',
    phase: 20,
    blurb: 'Assistente IA com 4 modos (Claude API + Ollama local), memória em IndexedDB e chamada de ferramentas.'
  },
  '/shadow': {
    title: 'Shadow Bridge',
    icon: '◐',
    phase: 18,
    blurb: 'Camada de autenticação SHA-256×100, proteção de áreas sensíveis.'
  },

  /* ===== Ferramentas (acessadas via Hub) =====
   * /editor (Fase 2) e /terminal (Fase 3) estão implementados — sem placeholder */
  /* F4-F7 ativos */
  '/graficos': {
    title: 'Gerador de Gráficos',
    icon: '◢',
    phase: 9,
    blurb: '12 tipos de gráficos em Canvas 2D puro: linha, barra, pizza, radar, área, scatter, candle e mais.'
  },
  '/simbolos': {
    title: 'Hub de Símbolos',
    icon: '✦',
    phase: 10,
    blurb: '1200+ símbolos Unicode categorizados, busca, copy-to-clipboard.'
  },
  '/regex': {
    title: 'Lab de Regex',
    icon: '✱',
    phase: 10,
    blurb: 'Tester de regex com explicação passo-a-passo, grupos nomeados, cheatsheet.'
  },
  '/fft': {
    title: 'Visualizador FFT',
    icon: '~',
    phase: 15,
    blurb: 'Web Audio API, 6 modos de visualização espectral em tempo real.'
  },
  '/media': {
    title: 'Media Hub',
    icon: '◫',
    phase: 15,
    blurb: 'Scanner local de mídia via File System Access API. Organização e player.'
  },
  '/videos': {
    title: 'Central de Vídeos',
    icon: '▶',
    phase: 16,
    blurb: 'YouTube embeds + arquivos locais, playlists customizadas.'
  },
  '/tabela-periodica': {
    title: 'Tabela Periódica',
    icon: '⚛',
    phase: 17,
    blurb: '118 elementos interativos com propriedades, isótopos e configuração eletrônica.'
  },
  '/modpack': {
    title: 'Modpack Minecraft',
    icon: '◧',
    phase: 17,
    blurb: '490+ mods catalogados com tier list, dependências e compatibilidades.'
  },
  '/guia-pc': {
    title: 'Guia para Montar PC',
    icon: '◨',
    phase: 17,
    blurb: 'Tutorial passo-a-passo, presets de uso, compatibilidade de peças.'
  },
  '/logic-sim': {
    title: 'Simulador de Lógica',
    icon: '◐',
    phase: 17,
    blurb: 'Portas lógicas drag-and-drop, simulação de circuitos digitais.'
  },
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
