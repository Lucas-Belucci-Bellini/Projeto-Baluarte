import '../styles/projetos.css';
import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import projetosData from '../data/projetos.json';

type ProjectStatus = 'ativo' | 'novo' | 'planejado';
interface ProjectRecord { readonly nome: string; readonly status: string; readonly rota?: string; readonly desc: string; readonly tags?: readonly string[]; readonly data: string; }
interface StatusView { readonly label: ProjectStatus; readonly cls: 'success' | 'cyan' | 'warning'; }
const STATUS: Record<ProjectStatus, StatusView> = { ativo: { label: 'ativo', cls: 'success' }, novo: { label: 'novo', cls: 'cyan' }, planejado: { label: 'planejado', cls: 'warning' } };
function statusView(status: string): StatusView { return status === 'ativo' || status === 'novo' || status === 'planejado' ? STATUS[status] : STATUS.planejado; }

export function projetosPage(): HTMLDivElement {
  const page = h('div', { className: 'page-projetos' });
  const itens = projetosData.projetos as readonly ProjectRecord[];
  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'PROJETOS')), h('h1', { className: 'page-header__title' }, '📁 Projetos'), h('p', { className: 'page-header__description' }, 'Tudo que foi construído com o ', h('span', { className: 'u-text-cyan' }, 'Claude Code'), ' — cada projeto na sua pasta (', h('span', { className: 'u-mono' }, 'projetos/<nome>/'), '). ', `${itens.length} projetos.`)));
  const grid = h('div', { className: 'proj-grid' });
  itens.forEach((project) => { const status = statusView(project.status); grid.appendChild(h('div', { className: 'proj-card', onclick: (): void => { if (project.rota) router.navigate(project.rota); }, style: project.rota ? { cursor: 'pointer' } : {} }, h('div', { className: 'proj-card__head' }, h('span', { className: 'proj-card__nome' }, project.nome), h('span', { className: `badge badge--${status.cls}` }, status.label)), h('p', { className: 'proj-card__desc' }, project.desc), h('div', { className: 'proj-card__foot' }, h('div', { className: 'proj-card__tags' }, ...(project.tags ?? []).map((tag) => h('span', { className: 'proj-tag' }, tag))), h('span', { className: 'proj-card__data u-mono u-text-muted' }, project.data)))); });
  page.appendChild(grid);
  page.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } }, '🗂️ Convenção: cada novo projeto feito com o Claude Code ganha sua pasta em ', h('span', { className: 'u-mono' }, 'projetos/'), '. O histórico de alterações fica em ', h('span', { className: 'u-mono' }, 'historico/CHANGELOG.md'), '.'));
  return page;
}
