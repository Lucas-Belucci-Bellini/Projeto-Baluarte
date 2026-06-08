/**
 * /projetos — Projetos do Baluarte (construídos com o Claude Code).
 * Lê src/data/projetos.json. Cada projeto também tem sua pasta em projetos/<nome>/.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import projetosData from '../data/projetos.json';

const STATUS = {
  ativo: { label: 'ativo', cls: 'success' },
  novo: { label: 'novo', cls: 'cyan' },
  planejado: { label: 'planejado', cls: 'warning' }
};

export function projetosPage() {
  const page = h('div', { className: 'page-projetos' });
  const itens = projetosData.projetos || [];

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'PROJETOS')),
      h('h1', { className: 'page-header__title' }, '📁 Projetos'),
      h('p', { className: 'page-header__description' },
        'Tudo que foi construído com o ', h('span', { className: 'u-text-cyan' }, 'Claude Code'),
        ' — cada projeto na sua pasta (', h('span', { className: 'u-mono' }, 'projetos/<nome>/'), '). ',
        `${itens.length} projetos.`))
  );

  const grid = h('div', { className: 'proj-grid' });
  itens.forEach((p) => {
    const st = STATUS[p.status] || STATUS.planejado;
    grid.appendChild(
      h('div', {
        className: 'proj-card',
        onclick: () => p.rota && router.navigate(p.rota),
        style: p.rota ? { cursor: 'pointer' } : {}
      },
        h('div', { className: 'proj-card__head' },
          h('span', { className: 'proj-card__nome' }, p.nome),
          h('span', { className: `badge badge--${st.cls}` }, st.label)),
        h('p', { className: 'proj-card__desc' }, p.desc),
        h('div', { className: 'proj-card__foot' },
          h('div', { className: 'proj-card__tags' }, ...(p.tags || []).map((t) => h('span', { className: 'proj-tag' }, t))),
          h('span', { className: 'proj-card__data u-mono u-text-muted' }, p.data)))
    );
  });
  page.appendChild(grid);

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🗂️ Convenção: cada novo projeto feito com o Claude Code ganha sua pasta em ',
      h('span', { className: 'u-mono' }, 'projetos/'), '. O histórico de alterações fica em ',
      h('span', { className: 'u-mono' }, 'historico/CHANGELOG.md'), '.')
  );

  return page;
}
