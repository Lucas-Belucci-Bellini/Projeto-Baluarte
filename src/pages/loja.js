/**
 * /loja — Loja do Baluarte (Shopify Storefront, print-on-demand / sem estoque).
 *
 * Lê o catálogo do Shopify (Storefront API, token público) e mostra os produtos;
 * o "Comprar" leva ao checkout seguro do Shopify. Web leve, sem SDK. Degrada pra
 * "em configuração" se a loja ainda não estiver conectada.
 */

import '../styles/loja.css';
import { h, empty } from '../utils/helpers.js';
import { shopifyConfigured, shopifyProducts } from '../core/shopify.js';

function fmtPrice(v, cur) {
  if (v == null) return '';
  try { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: cur || 'BRL' }).format(v); }
  catch { return `${cur || ''} ${v}`; }
}

function emptyState(icon, title, desc) {
  return h('div', { className: 'loja-empty' },
    h('div', { className: 'loja-empty__icon' }, icon),
    h('h3', { className: 'loja-empty__title' }, title),
    h('p', { className: 'u-text-muted' }, desc));
}

export function lojaPage() {
  const page = h('div', { className: 'page-loja' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'LOJA')),
      h('h1', { className: 'page-header__title' }, '🛒 Loja'),
      h('p', { className: 'page-header__description' },
        'Itens e acessórios do Baluarte, produzidos e enviados ',
        h('span', { className: 'u-text-cyan' }, 'sob demanda'),
        ' (print-on-demand) — sem estoque. Checkout seguro no Shopify.'))
  );

  const status = h('p', { className: 'loja-status u-text-muted', style: { fontSize: '13px' } }, 'Carregando produtos…');
  const grid = h('div', { className: 'loja-grid' });
  page.append(status, grid);

  if (!shopifyConfigured()) {
    status.remove();
    grid.appendChild(emptyState('🛍️', 'Loja em configuração',
      'Em breve: itens e acessórios do Baluarte, sob demanda. (Conectando o catálogo do Shopify.)'));
    return page;
  }

  shopifyProducts(24).then((items) => {
    status.remove();
    empty(grid);
    if (items === null) {
      grid.appendChild(emptyState('🛍️', 'Loja indisponível agora',
        'Não consegui carregar o catálogo (offline ou loja em configuração). Tente de novo em instantes.'));
      return;
    }
    if (!items.length) {
      grid.appendChild(emptyState('🛍️', 'Catálogo a caminho',
        'Os primeiros produtos estão sendo montados — volte logo.'));
      return;
    }
    items.forEach((p) => {
      grid.appendChild(
        h('a', { className: 'loja-card', href: p.url, target: '_blank', rel: 'noopener' },
          h('div', { className: 'loja-card__img' },
            p.image
              ? h('img', { src: p.image, alt: p.alt, loading: 'lazy', referrerpolicy: 'no-referrer' })
              : h('span', { className: 'loja-card__ph' }, '🛍️')),
          h('div', { className: 'loja-card__body' },
            h('div', { className: 'loja-card__title' }, p.title),
            h('div', { className: 'loja-card__foot' },
              h('span', { className: 'loja-card__price u-mono' }, fmtPrice(p.price, p.currency)),
              h('span', { className: 'loja-card__btn' }, 'Comprar →')))));
    });
  });

  return page;
}
