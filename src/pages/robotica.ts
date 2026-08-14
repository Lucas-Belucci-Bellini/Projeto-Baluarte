import '../styles/robotica.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { ROBOTICA_MODULOS, ROBOTICA_TOTAL } from '../data/robotica.js';
import type { RoboticaModulo, RoboticaNivel } from '../data/robotica.js';

const STORAGE_KEY = 'robotica:state';
const NIVEL_BADGE: Record<RoboticaNivel, string> = { Básico: 'badge--success', Intermediário: 'badge--cyan', Avançado: 'badge--magenta' };
interface RoboticaState { id?: string; }

function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function loadState(): RoboticaState { const saved: unknown = storage.get(STORAGE_KEY); return isRecord(saved) && typeof saved.id === 'string' ? { id: saved.id } : {}; }

export function roboticaPage(): HTMLDivElement {
  const saved = loadState();
  let activeId = ROBOTICA_MODULOS.some((module) => module.id === saved.id) ? saved.id as string : ROBOTICA_MODULOS[0]?.id ?? '';
  const fullPage = h('div', { className: 'page-robotica' });
  fullPage.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CONHECIMENTO'), h('span', null, '›'), h('span', null, 'ROBÓTICA')), h('h1', { className: 'page-header__title' }, '⚙ Currículo de Robótica'), h('p', { className: 'page-header__description' }, h('span', { className: 'u-text-cyan' }, `${ROBOTICA_TOTAL} módulos`), ' do básico ao avançado: história, anatomia, sensores, atuadores, eletrônica, cinemática, controle PID, ROS, visão computacional e IA.')));
  const panel = h('div', { className: 'robotica-panel' });
  const rail = h('div', { className: 'robotica-rail' });
  ROBOTICA_MODULOS.forEach((module, index) => rail.appendChild(h('button', { className: cx('robotica-rail__item', module.id === activeId && 'is-active'), 'data-m': module.id, onclick: (): void => { activeId = module.id; storage.set(STORAGE_KEY, { id: activeId }); document.querySelectorAll<HTMLElement>('.robotica-rail__item').forEach((button) => button.classList.toggle('is-active', button.dataset.m === module.id)); renderPanel(); } }, h('span', { className: 'robotica-rail__num' }, String(index + 1).padStart(2, '0')), h('span', { className: 'robotica-rail__icon' }, module.icon), h('span', { className: 'robotica-rail__label' }, module.titulo))));
  function renderPanel(): void {
    empty(panel);
    const module: RoboticaModulo | undefined = ROBOTICA_MODULOS.find((candidate) => candidate.id === activeId);
    if (!module) return;
    panel.appendChild(h('div', { className: 'robotica-mod__head' }, h('span', { className: 'robotica-mod__icon' }, module.icon), h('div', null, h('h2', { className: 'robotica-mod__title' }, module.titulo), h('span', { className: `badge ${NIVEL_BADGE[module.nivel]}` }, module.nivel))));
    panel.appendChild(h('p', { className: 'robotica-mod__resumo' }, module.resumo));
    panel.appendChild(h('div', { className: 'robotica-mod__topicos-label' }, `◆ Tópicos-chave (${module.topicos.length})`));
    const topics = h('div', { className: 'robotica-topicos' });
    module.topicos.forEach((topic) => topics.appendChild(h('div', { className: 'robotica-topico' }, h('div', { className: 'robotica-topico__nome' }, topic.nome), h('div', { className: 'robotica-topico__desc' }, topic.desc))));
    panel.appendChild(topics);
  }
  renderPanel();
  fullPage.appendChild(h('div', { className: 'robotica-layout' }, rail, panel));
  return fullPage;
}
