/**
 * Página /git-helper — Git Helper (v2.0.0).
 *
 * Cheatsheet de comandos Git + modelos de .gitignore. Clicar copia.
 */

import '../styles/git-helper.css';
import { h } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { GIT_SECTIONS, GITIGNORE_TEMPLATES } from '../data/git-helper.js';

function copy(text, label) {
  navigator.clipboard.writeText(text).then(
    () => toast(`${label} copiado`, { type: 'success' }),
    () => toast('Falha ao copiar', { type: 'danger' })
  );
}

export function gitHelperPage() {
  const fullPage = h('div', { className: 'page-git' });

  const totalCmds = GIT_SECTIONS.reduce((n, s) => n + s.comandos.length, 0);

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'GIT HELPER')),
      h('h1', { className: 'page-header__title' }, '⎇ Git Helper'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${totalCmds} comandos`),
        ' Git essenciais, agrupados, e modelos de ',
        h('span', { className: 'u-text-cyan' }, '.gitignore'),
        '. Clique em qualquer comando para copiar.')
    )
  );

  GIT_SECTIONS.forEach((sec) => {
    fullPage.appendChild(
      h('div', { className: 'section-header' },
        h('h2', { className: 'section-header__title' }, `${sec.icon} ${sec.grupo}`))
    );
    const grid = h('div', { className: 'git-grid' });
    sec.comandos.forEach((c) => {
      grid.appendChild(
        h('button', {
          className: 'git-cmd',
          title: 'Copiar comando',
          onclick: () => copy(c.cmd, 'Comando')
        },
          h('code', { className: 'git-cmd__code' }, c.cmd),
          h('span', { className: 'git-cmd__desc' }, c.desc)
        )
      );
    });
    fullPage.appendChild(grid);
  });

  /* ===== .gitignore ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, '⊘ Modelos de .gitignore'))
  );
  const tplGrid = h('div', { className: 'git-templates' });
  GITIGNORE_TEMPLATES.forEach((t) => {
    tplGrid.appendChild(
      h('div', { className: 'git-template card' },
        h('div', { className: 'git-template__head' },
          h('span', { className: 'git-template__nome' }, t.nome),
          h('button', {
            className: 'btn btn--ghost btn--sm',
            onclick: () => copy(t.conteudo, '.gitignore ' + t.nome)
          }, '⧉ copiar')
        ),
        h('pre', { className: 'git-template__code' }, h('code', null, t.conteudo))
      )
    );
  });
  fullPage.appendChild(tplGrid);

  return fullPage;
}
