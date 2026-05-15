/**
 * Página /economia — Cotações live (Fase 19).
 *
 * Câmbio (AwesomeAPI) + Cripto (CoinGecko). Atualização manual.
 * Inclui conversor rápido.
 */

import { h, cx, empty, debounce } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import {
  fetchCurrencies, fetchCrypto,
  fmtBRL, fmtUSD, fmtPct,
  CURRENCY_PAIRS
} from '../utils/economia-api.js';

const STORAGE_KEY = 'economia:cache';

let currencyGridEl = null;
let cryptoGridEl = null;
let statusEl = null;
let converterEl = null;
let lastCurrencies = [];

function trendClass(pct) {
  if (pct == null) return 'u-text-muted';
  return pct >= 0 ? 'u-text-success' : 'u-text-danger';
}
function trendArrow(pct) {
  if (pct == null) return '·';
  return pct >= 0 ? '▲' : '▼';
}

/* ===== Render câmbio ===== */

function renderCurrencies(list) {
  empty(currencyGridEl);
  list.forEach((c) => {
    const card = h('div', { className: 'eco-card' },
      h('div', { className: 'eco-card__head' },
        h('span', { className: 'eco-card__icon' }, c.icon),
        h('span', { className: 'eco-card__code u-mono' }, c.code)
      ),
      h('div', { className: 'eco-card__label' }, c.label),
      h('div', { className: 'eco-card__value' }, c.error ? '— erro —' : fmtBRL(c.bid)),
      h('div', { className: cx('eco-card__pct', trendClass(c.pct)) },
        trendArrow(c.pct), ' ', fmtPct(c.pct)
      ),
      !c.error && c.high != null && h('div', { className: 'eco-card__range u-text-muted u-mono' },
        `H ${fmtBRL(c.high)} · L ${fmtBRL(c.low)}`)
    );
    currencyGridEl.appendChild(card);
  });
}

function renderCrypto(list) {
  empty(cryptoGridEl);
  list.forEach((c) => {
    const card = h('div', { className: 'eco-card eco-card--crypto' },
      h('div', { className: 'eco-card__head' },
        h('span', { className: 'eco-card__icon' }, '◈'),
        h('span', { className: 'eco-card__code u-mono' }, c.symbol)
      ),
      h('div', { className: 'eco-card__label' }, c.label),
      h('div', { className: 'eco-card__value' }, c.error ? '— erro —' : fmtBRL(c.brl)),
      h('div', { className: 'eco-card__usd u-text-muted u-mono' },
        c.error ? '' : fmtUSD(c.usd)),
      h('div', { className: cx('eco-card__pct', trendClass(c.pct24h)) },
        trendArrow(c.pct24h), ' ', fmtPct(c.pct24h), ' (24h)'
      )
    );
    cryptoGridEl.appendChild(card);
  });
}

/* ===== Conversor ===== */

function renderConverter() {
  empty(converterEl);
  if (!lastCurrencies.length) {
    converterEl.appendChild(h('div', { className: 'u-text-muted', style: { fontSize: '12px' } },
      'Atualize as cotações para usar o conversor.'));
    return;
  }

  const amountInput = h('input', {
    className: 'input', type: 'number', value: '100', step: 'any',
    oninput: debounce(calc, 120)
  });
  const fromSel = h('select', { className: 'input', onchange: calc },
    h('option', { value: 'BRL' }, 'Real (BRL)'),
    ...lastCurrencies.filter((c) => !c.error).map((c) =>
      h('option', { value: c.code }, c.label))
  );
  const toSel = h('select', { className: 'input', onchange: calc },
    h('option', { value: 'BRL', selected: true }, 'Real (BRL)'),
    ...lastCurrencies.filter((c) => !c.error).map((c) =>
      h('option', { value: c.code }, c.label))
  );
  const resultEl = h('div', { className: 'eco-conv__result u-mono' }, '—');

  function rateToBRL(code) {
    if (code === 'BRL') return 1;
    const c = lastCurrencies.find((x) => x.code === code);
    return c ? c.bid : null;
  }

  function calc() {
    const amount = parseFloat(amountInput.value) || 0;
    const fromRate = rateToBRL(fromSel.value);
    const toRate = rateToBRL(toSel.value);
    if (fromRate == null || toRate == null) { resultEl.textContent = '—'; return; }
    const inBRL = amount * fromRate;
    const result = inBRL / toRate;
    resultEl.textContent = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(result);
  }

  converterEl.appendChild(
    h('div', { className: 'eco-conv' },
      h('label', null, h('span', null, 'VALOR'), amountInput),
      h('label', null, h('span', null, 'DE'), fromSel),
      h('label', null, h('span', null, 'PARA'), toSel),
      h('div', { className: 'eco-conv__out' },
        h('span', { className: 'u-text-muted', style: { fontSize: '10px' } }, 'RESULTADO'),
        resultEl
      )
    )
  );
  calc();
}

/* ===== Refresh ===== */

async function refresh() {
  if (statusEl) {
    statusEl.textContent = 'Atualizando…';
    statusEl.className = 'badge badge--warning';
  }
  try {
    const [currencies, crypto] = await Promise.allSettled([
      fetchCurrencies(),
      fetchCrypto()
    ]);

    if (currencies.status === 'fulfilled') {
      lastCurrencies = currencies.value;
      renderCurrencies(currencies.value);
    } else {
      currencyGridEl.innerHTML = '';
      currencyGridEl.appendChild(h('div', { className: 'eco-error u-text-danger' },
        '⚠ Falha ao carregar câmbio: ' + currencies.reason.message));
    }

    if (crypto.status === 'fulfilled') {
      renderCrypto(crypto.value);
    } else {
      cryptoGridEl.innerHTML = '';
      cryptoGridEl.appendChild(h('div', { className: 'eco-error u-text-danger' },
        '⚠ Falha ao carregar cripto: ' + crypto.reason.message));
    }

    renderConverter();

    const ok = currencies.status === 'fulfilled' || crypto.status === 'fulfilled';
    if (statusEl) {
      statusEl.textContent = ok
        ? '● ' + new Date().toLocaleTimeString('pt-BR')
        : 'OFFLINE';
      statusEl.className = ok ? 'badge badge--success' : 'badge badge--danger';
    }
    if (ok) {
      storage.set(STORAGE_KEY, { currencies: lastCurrencies, ts: Date.now() });
      toast('Cotações atualizadas', { type: 'success', duration: 1500 });
    }
  } catch (e) {
    if (statusEl) {
      statusEl.textContent = 'ERRO';
      statusEl.className = 'badge badge--danger';
    }
    toast('Erro: ' + e.message, { type: 'danger' });
  }
}

export function economiaPage() {
  const fullPage = h('div', { className: 'page-economia' });

  statusEl = h('span', { className: 'badge badge--muted' }, 'NÃO CARREGADO');

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'ECONOMIA')),
      h('h1', { className: 'page-header__title' }, '◈ Economia'),
      h('p', { className: 'page-header__description' },
        'Cotações live de ',
        h('span', { className: 'u-text-cyan' }, 'câmbio'),
        ' (AwesomeAPI) e ',
        h('span', { className: 'u-text-cyan' }, 'criptomoedas'),
        ' (CoinGecko). Requer conexão. Inclui conversor rápido.')
    )
  );

  fullPage.appendChild(
    h('div', { className: 'eco-toolbar' },
      h('button', { className: 'btn btn--primary', onclick: refresh }, '↻ Atualizar cotações'),
      statusEl
    )
  );

  /* Câmbio */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Câmbio'),
      h('span', { className: 'section-header__count' }, `${CURRENCY_PAIRS.length} pares`))
  );
  currencyGridEl = h('div', { className: 'eco-grid' });
  fullPage.appendChild(currencyGridEl);

  /* Conversor */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Conversor'))
  );
  converterEl = h('div', { className: 'eco-converter-wrap' });
  fullPage.appendChild(converterEl);

  /* Cripto */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Criptomoedas'))
  );
  cryptoGridEl = h('div', { className: 'eco-grid' });
  fullPage.appendChild(cryptoGridEl);

  /* Placeholder inicial */
  [currencyGridEl, cryptoGridEl].forEach((grid) => {
    grid.appendChild(h('div', { className: 'u-text-muted', style: { padding: '16px' } },
      'Clique em "Atualizar cotações" para carregar.'));
  });
  renderConverter();

  /* Auto-load primeira vez */
  setTimeout(refresh, 100);

  return fullPage;
}
