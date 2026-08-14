import '../styles/git-helper.css';
import { h } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { GIT_SECTIONS, GITIGNORE_TEMPLATES } from '../data/git-helper.js';
import type { GitSection, GitignoreTemplate } from '../data/git-helper.js';

function copy(text: string, label: string): void {
  void navigator.clipboard.writeText(text).then(
    () => toast(`${label} copiado`, { type: 'success' }),
    () => toast('Falha ao copiar', { type: 'danger' }),
  );
}

function renderSection(section: GitSection): HTMLDivElement {
  const grid = h('div', { className: 'git-grid' });
  section.comandos.forEach((command) => {
    grid.appendChild(h('button', {
      className: 'git-cmd',
      title: 'Copiar comando',
      onclick: (): void => copy(command.cmd, 'Comando'),
    },
      h('code', { className: 'git-cmd__code' }, command.cmd),
      h('span', { className: 'git-cmd__desc' }, command.desc),
    ));
  });
  return grid;
}

function renderTemplate(template: GitignoreTemplate): HTMLDivElement {
  return h('div', { className: 'git-template card' },
    h('div', { className: 'git-template__head' },
      h('span', { className: 'git-template__nome' }, template.nome),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: (): void => copy(template.conteudo, `.gitignore ${template.nome}`),
      }, '⧉ copiar')),
    h('pre', { className: 'git-template__code' }, h('code', null, template.conteudo)),
  );
}

export function gitHelperPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-git' });
  const totalCommands = GIT_SECTIONS.reduce((total, section) => total + section.comandos.length, 0);

  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'GIT HELPER')),
    h('h1', { className: 'page-header__title' }, '⎇ Git Helper'),
    h('p', { className: 'page-header__description' },
      h('span', { className: 'u-text-cyan' }, `${totalCommands} comandos`),
      ' Git essenciais, agrupados, e modelos de ', h('span', { className: 'u-text-cyan' }, '.gitignore'),
      '. Clique em qualquer comando para copiar.')));

  GIT_SECTIONS.forEach((section) => {
    fullPage.appendChild(h('div', { className: 'section-header' }, h('h2', { className: 'section-header__title' }, `${section.icon} ${section.grupo}`)));
    fullPage.appendChild(renderSection(section));
  });

  fullPage.appendChild(h('div', { className: 'section-header' }, h('h2', { className: 'section-header__title' }, '⊘ Modelos de .gitignore')));
  const templatesGrid = h('div', { className: 'git-templates' });
  GITIGNORE_TEMPLATES.forEach((template) => templatesGrid.appendChild(renderTemplate(template)));
  fullPage.appendChild(templatesGrid);

  return fullPage;
}
