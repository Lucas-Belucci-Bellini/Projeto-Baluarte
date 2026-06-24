/**
 * Página genérica para rotas ainda não implementadas.
 * Mostra um "Em Desenvolvimento — Fase X" elegante.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';

/* Mark XIII v1.0.0 — toda rota tem página real; nenhum placeholder ativo. */
const ROUTE_INFO = {};

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

/**
 * Página de FALHA DE CARREGAMENTO (não é 404). A rota existe, mas o chunk dela
 * não carregou — quase sempre versão nova do site (deploy trocou os hashes) ou
 * conexão. Recarregar resolve (pega os arquivos frescos). Distinta do 404 pra
 * não confundir o operador (nem o JARVIS) com "rota não existe".
 */
export function loadErrorPage(path) {
  return h(
    'section',
    { className: 'empty-state anim-fade-in' },
    h('div', { className: 'empty-state__icon' }, '⟳'),
    h('h1', { className: 'empty-state__title' }, 'Falha ao carregar'),
    h('p', { className: 'empty-state__subtitle' },
      `Não consegui carregar "${path}" agora — provavelmente uma versão nova do site ou a conexão. A página existe; foi o carregamento que falhou.`),
    h('div', { className: 'empty-state__phase' }, 'ERRO DE CARREGAMENTO'),
    h(
      'div',
      { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
      h('button', { className: 'btn btn--primary', onclick: () => location.reload() }, '⟳ Recarregar'),
      h('button', { className: 'btn', onclick: () => router.navigate('/home') }, '⬅ Início')
    )
  );
}
