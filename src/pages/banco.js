/**
 * /banco — Painel do Banco (Baluarte ao vivo).
 *
 * Lê números REAIS do banco oficial (Supabase) por leitura pública (RLS):
 * visitas, páginas vistas (total + distintas + top), posts no mural. Read-only,
 * sem dependências (#238 web leve). Degrada em silêncio se o banco não responder.
 */

import '../styles/banco.css';
import { h, empty } from '../utils/helpers.js';
import { supabaseConfigured, dbSelect } from '../core/supabase.js';

const fmt = (n) => Number(n || 0).toLocaleString('pt-BR');

function tile(icon, valueEl, label, mag) {
  return h('div', { className: 'banco-tile' + (mag ? ' banco-tile--mag' : '') },
    h('div', { className: 'banco-tile__icon' }, icon),
    valueEl,
    h('div', { className: 'banco-tile__label' }, label));
}

export function bancoPage() {
  const page = h('div', { className: 'page-banco' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'BANCO')),
      h('h1', { className: 'page-header__title' }, '🗄️ Painel do Banco'),
      h('p', { className: 'page-header__description' },
        'Números ', h('span', { className: 'u-text-cyan' }, 'ao vivo'),
        ' do banco oficial (Supabase). Leitura pública protegida por ',
        h('span', { className: 'u-mono' }, 'RLS'), ' — escrita anônima só por funções seguras.'))
  );

  const vVisits = h('div', { className: 'banco-tile__value' }, '…');
  const vViews = h('div', { className: 'banco-tile__value' }, '…');
  const vPages = h('div', { className: 'banco-tile__value' }, '…');
  const vMural = h('div', { className: 'banco-tile__value' }, '…');

  page.appendChild(
    h('div', { className: 'banco-grid' },
      tile('👁', vVisits, 'Visitas'),
      tile('📊', vViews, 'Páginas vistas'),
      tile('🧭', vPages, 'Páginas distintas'),
      tile('📣', vMural, 'Posts no mural', true))
  );

  page.appendChild(
    h('div', { className: 'section-header' }, h('h2', { className: 'section-header__title' }, '🔝 Top páginas'))
  );
  const topWrap = h('div', { className: 'banco-top' },
    h('p', { className: 'u-text-muted', style: { fontSize: '13px' } }, 'Carregando…'));
  page.appendChild(topWrap);

  page.appendChild(
    h('p', { className: 'u-text-muted banco-foot', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🗂️ Tabelas: ', h('span', { className: 'u-mono' }, 'mural_posts'), ', ',
      h('span', { className: 'u-mono' }, 'site_stats'), ' · RLS ligado · escrita anônima só via ',
      h('span', { className: 'u-mono' }, 'bump_visits'), ' / ', h('span', { className: 'u-mono' }, 'bump_view'),
      '. Detalhes em ', h('span', { className: 'u-mono' }, 'docs/SUPABASE.md'), '.')
  );

  function fail(msg) {
    [vVisits, vViews, vPages, vMural].forEach((el) => { el.textContent = '—'; });
    empty(topWrap);
    topWrap.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '13px' } }, msg));
  }

  if (!supabaseConfigured()) { fail('Banco não configurado neste ambiente.'); return page; }

  (async () => {
    try {
      const stats = await dbSelect('site_stats', 'select=key,count&order=count.desc');
      if (!Array.isArray(stats)) throw new Error('sem dados');
      const visits = stats.find((r) => r.key === 'visits');
      const views = stats
        .filter((r) => String(r.key).startsWith('view:'))
        .map((r) => ({ route: String(r.key).replace(/^view:/, ''), count: Number(r.count) || 0 }));
      const totalViews = views.reduce((s, r) => s + r.count, 0);

      vVisits.textContent = fmt(visits ? visits.count : 0);
      vViews.textContent = fmt(totalViews);
      vPages.textContent = fmt(views.length);

      empty(topWrap);
      if (!views.length) {
        topWrap.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '13px' } },
          'Ainda sem views registradas — navegue pelo site que elas aparecem aqui.'));
      } else {
        const max = views[0].count || 1;
        views.slice(0, 10).forEach((v) => {
          topWrap.appendChild(h('div', { className: 'banco-bar' },
            h('span', { className: 'banco-bar__route u-mono' }, v.route),
            h('span', { className: 'banco-bar__track' },
              h('span', { className: 'banco-bar__fill', style: { width: Math.max(4, (v.count / max) * 100) + '%' } })),
            h('span', { className: 'banco-bar__n u-mono' }, fmt(v.count))));
        });
      }
    } catch {
      fail('Banco indisponível agora (offline ou migrations ainda não aplicadas).');
      return;
    }

    try {
      const posts = await dbSelect('mural_posts', 'select=id');
      vMural.textContent = fmt(Array.isArray(posts) ? posts.length : 0);
    } catch {
      vMural.textContent = '—';
    }
  })();

  return page;
}
