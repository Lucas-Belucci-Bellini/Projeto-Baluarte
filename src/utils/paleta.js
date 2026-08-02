/**
 * Paleta de comandos — acha qualquer tela do site em dois toques (Ctrl/⌘+K).
 *
 * Por que existe: são 97 rotas hoje e o plano passa de 150. A sidebar mostra
 * 69 delas em 12 grupos, e mesmo assim **9 páginas de IA não têm entrada
 * nenhuma na web** — `/llm-lab` e `/apis` não são citadas em lugar algum, e o
 * resto só é alcançável pelo `/git-nexus`, que é gateado por app. Elas existem
 * e ninguém chega.
 *
 * Botar tudo na barra resolveria "achar" e criaria "poluir". A paleta resolve
 * os dois: indexa **todas** as rotas registradas, e ocupa zero espaço até ser
 * chamada.
 *
 * O índice sai do ROUTER, não de uma lista à mão — rota nova aparece aqui
 * sozinha, sem ninguém lembrar de cadastrar.
 */

import { h, empty, normalize } from './helpers.js';
import { router } from '../core/router.js';
import { NAV_GROUPS } from '../layout/sidebar.js';
import { storage } from '../core/storage.js';

const CHAVE_RECENTES = 'paleta:recentes';
const MAX_RECENTES = 6;
const MAX_RESULTADOS = 40;

/* Rótulo e grupo vêm da sidebar quando a rota está lá. Quando não está — os 28
 * casos de hoje — a paleta ainda acha, usando o próprio caminho como nome.
 * Assim nenhuma tela fica inalcançável só por não ter entrada no menu. */
function indice() {
  const daSidebar = new Map();
  for (const grupo of NAV_GROUPS) {
    for (const item of grupo.items ?? []) {
      daSidebar.set(item.path, { rotulo: item.label, grupo: grupo.label, icone: item.icon ?? '' });
    }
  }

  return router.list().map((path) => {
    const meta = daSidebar.get(path);
    return {
      path,
      rotulo: meta?.rotulo ?? path.replace('/', '').replace(/-/g, ' '),
      grupo: meta?.grupo ?? 'Sem menu',
      icone: meta?.icone ?? '·',
      noMenu: !!meta,
      busca: normalize(`${meta?.rotulo ?? ''} ${path} ${meta?.grupo ?? ''}`),
    };
  });
}

/** Pontua: começo do rótulo vale mais que meio, e rótulo vale mais que grupo. */
function pontuar(item, termo) {
  if (!termo) return item.noMenu ? 1 : 0.5;
  const rotulo = normalize(item.rotulo);
  const caminho = normalize(item.path);
  if (rotulo === termo || caminho === `/${termo}`) return 100;
  if (rotulo.startsWith(termo)) return 80;
  if (caminho.includes(termo)) return 60;
  if (rotulo.includes(termo)) return 50;
  if (item.busca.includes(termo)) return 20;
  /* subsequência: "clcnt" acha "calculadora científica" */
  let i = 0;
  for (const c of item.busca) if (c === termo[i]) i += 1;
  return i === termo.length ? 10 : 0;
}

const recentes = () => storage.get(CHAVE_RECENTES, []);
function lembrar(path) {
  const lista = [path, ...recentes().filter((p) => p !== path)].slice(0, MAX_RECENTES);
  storage.set(CHAVE_RECENTES, lista);
}

let aberta = null;

/** Fecha a paleta e devolve o foco pra onde estava. */
export function fecharPaleta() {
  if (!aberta) return;
  aberta.fundo.remove();
  aberta.voltarFoco?.focus?.();
  aberta = null;
}

export function abrirPaleta() {
  if (aberta) return;
  const voltarFoco = document.activeElement;
  const todos = indice();
  const ultimos = recentes();

  const campo = h('input', {
    className: 'paleta__campo', type: 'text', autocomplete: 'off', spellcheck: 'false',
    placeholder: `Buscar entre ${todos.length} telas…`, 'aria-label': 'Buscar tela',
  });
  const lista = h('div', { className: 'paleta__lista', role: 'listbox' });
  const dica = h('div', { className: 'paleta__dica' }, '↑↓ navega · Enter abre · Esc fecha');

  const caixa = h('div', { className: 'paleta', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Paleta de comandos' },
    h('div', { className: 'paleta__topo' }, h('span', { className: 'paleta__lupa' }, '⌕'), campo),
    lista, dica);
  const fundo = h('div', { className: 'paleta__fundo', onclick: (e) => { if (e.target === fundo) fecharPaleta(); } }, caixa);

  let visiveis = [];
  let ativo = 0;

  function pintar() {
    const termo = normalize(campo.value.trim());
    visiveis = todos
      .map((item) => ({ item, p: pontuar(item, termo) }))
      .filter(({ p }) => p > 0)
      .sort((a, b) => {
        if (b.p !== a.p) return b.p - a.p;
        /* sem termo, o que você abriu por último vem primeiro */
        const ra = ultimos.indexOf(a.item.path);
        const rb = ultimos.indexOf(b.item.path);
        if (ra !== rb) return (ra === -1 ? 99 : ra) - (rb === -1 ? 99 : rb);
        return a.item.rotulo.localeCompare(b.item.rotulo);
      })
      .slice(0, MAX_RESULTADOS)
      .map(({ item }) => item);

    ativo = 0;
    empty(lista);
    if (!visiveis.length) {
      lista.appendChild(h('div', { className: 'paleta__vazio' }, 'Nada com esse nome.'));
      return;
    }
    visiveis.forEach((item, i) => {
      lista.appendChild(h('button', {
        className: `paleta__item${i === 0 ? ' is-ativo' : ''}`, role: 'option', type: 'button',
        onclick: () => ir(item),
        onmousemove: () => marcar(i),
      },
        h('span', { className: 'paleta__ico' }, item.icone),
        h('span', { className: 'paleta__rotulo' }, item.rotulo),
        h('span', { className: 'paleta__grupo' }, item.grupo),
        h('span', { className: 'paleta__path' }, item.path)));
    });
  }

  function marcar(i) {
    const itens = lista.querySelectorAll('.paleta__item');
    itens[ativo]?.classList.remove('is-ativo');
    ativo = Math.max(0, Math.min(i, itens.length - 1));
    itens[ativo]?.classList.add('is-ativo');
    itens[ativo]?.scrollIntoView({ block: 'nearest' });
  }

  function ir(item) {
    lembrar(item.path);
    fecharPaleta();
    router.navigate(item.path);
  }

  campo.addEventListener('input', pintar);
  caixa.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); fecharPaleta(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); marcar(ativo + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); marcar(ativo - 1); }
    else if (e.key === 'Enter') { e.preventDefault(); if (visiveis[ativo]) ir(visiveis[ativo]); }
  });

  document.body.appendChild(fundo);
  aberta = { fundo, voltarFoco };
  pintar();
  campo.focus();
}

/**
 * Liga o atalho global. Ctrl+K no Windows/Linux, ⌘+K no Mac — e uma barra
 * solta também abre, desde que o foco não esteja num campo de texto (senão
 * digitar "/" em qualquer input abriria a paleta na cara do operador).
 */
export function initPaleta() {
  window.addEventListener('keydown', (e) => {
    const emCampo = /^(input|textarea|select)$/i.test(e.target?.tagName)
      || e.target?.isContentEditable;

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      aberta ? fecharPaleta() : abrirPaleta();
    } else if (e.key === '/' && !emCampo && !aberta) {
      e.preventDefault();
      abrirPaleta();
    }
  });
}
