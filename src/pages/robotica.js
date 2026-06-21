/**
 * Página /robotica — Currículo de Robótica (v2.0.0).
 *
 * 12 módulos do básico ao avançado, com rail de navegação + painel.
 */

import '../styles/robotica.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { ROBOTICA_MODULOS, ROBOTICA_TOTAL } from '../data/robotica.js';

const STORAGE_KEY = 'robotica:state';

const NIVEL_BADGE = {
  'Básico': 'badge--success',
  'Intermediário': 'badge--cyan',
  'Avançado': 'badge--magenta'
};

export function roboticaPage() {
  const saved = storage.get(STORAGE_KEY) || {};
  let activeId = ROBOTICA_MODULOS.some((m) => m.id === saved.id)
    ? saved.id
    : ROBOTICA_MODULOS[0].id;

  const fullPage = h('div', { className: 'page-robotica' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'CONHECIMENTO'), h('span', null, '›'),
        h('span', null, 'ROBÓTICA')),
      h('h1', { className: 'page-header__title' }, '⚙ Currículo de Robótica'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${ROBOTICA_TOTAL} módulos`),
        ' do básico ao avançado: história, anatomia, sensores, atuadores, ',
        'eletrônica, cinemática, controle PID, ROS, visão computacional e IA.')
    )
  );

  const panel = h('div', { className: 'robotica-panel' });

  /* Rail de módulos */
  const rail = h('div', { className: 'robotica-rail' });
  ROBOTICA_MODULOS.forEach((m, i) => {
    rail.appendChild(
      h('button', {
        className: cx('robotica-rail__item', m.id === activeId && 'is-active'),
        'data-m': m.id,
        onclick: () => {
          activeId = m.id;
          storage.set(STORAGE_KEY, { id: activeId });
          document.querySelectorAll('.robotica-rail__item').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.m === m.id));
          renderPanel();
        }
      },
        h('span', { className: 'robotica-rail__num' }, String(i + 1).padStart(2, '0')),
        h('span', { className: 'robotica-rail__icon' }, m.icon),
        h('span', { className: 'robotica-rail__label' }, m.titulo)
      )
    );
  });

  function renderPanel() {
    empty(panel);
    const m = ROBOTICA_MODULOS.find((x) => x.id === activeId);
    if (!m) return;

    panel.appendChild(
      h('div', { className: 'robotica-mod__head' },
        h('span', { className: 'robotica-mod__icon' }, m.icon),
        h('div', null,
          h('h2', { className: 'robotica-mod__title' }, m.titulo),
          h('span', { className: `badge ${NIVEL_BADGE[m.nivel] || 'badge--muted'}` }, m.nivel)
        )
      )
    );

    panel.appendChild(h('p', { className: 'robotica-mod__resumo' }, m.resumo));

    panel.appendChild(
      h('div', { className: 'robotica-mod__topicos-label' }, `◆ Tópicos-chave (${m.topicos.length})`)
    );

    const list = h('div', { className: 'robotica-topicos' });
    m.topicos.forEach((t) => {
      list.appendChild(
        h('div', { className: 'robotica-topico' },
          h('div', { className: 'robotica-topico__nome' }, t.nome),
          h('div', { className: 'robotica-topico__desc' }, t.desc)
        )
      );
    });
    panel.appendChild(list);
  }

  renderPanel();

  fullPage.appendChild(
    h('div', { className: 'robotica-layout' }, rail, panel)
  );

  return fullPage;
}
