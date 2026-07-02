/**
 * Página /portas — Enciclopédia de Lógica Digital (v2.0.0).
 *
 * Portas fundamentais com símbolo SVG, expressão e tabela verdade;
 * blocos construtivos; e o catálogo de circuitos integrados 7400/4000.
 */

import { h } from '../utils/helpers.js';
import { router } from '../core/router.js';
import {
  FUNDAMENTAL_GATES,
  BUILDING_BLOCKS,
  CHIP_FAMILIES,
  LOGIC_STATS
} from '../data/logic-circuits.js';

/* ===== Símbolo SVG de cada porta (forma distintiva ANSI/MIL) ===== */
function gateSVG(sym) {
  const W = 'stroke="#d4a24e" stroke-width="2.5" fill="none" stroke-linecap="round"';
  const B = 'stroke="#d4a24e" stroke-width="2.5" fill="rgba(212,162,78,0.10)" stroke-linejoin="round"';
  const bub = (cx) => `<circle cx="${cx}" cy="32" r="5" stroke="#d4a24e" stroke-width="2.5" fill="#0a0a0a"/>`;
  let body = '';
  let extra = '';
  let wires = '';

  switch (sym) {
    case 'buffer':
      body = `<path d="M32,12 L70,32 L32,52 Z" ${B}/>`;
      wires = `<path d="M10,32 H32" ${W}/><path d="M70,32 H92" ${W}/>`;
      break;
    case 'not':
      body = `<path d="M32,12 L68,32 L32,52 Z" ${B}/>` + bub(73);
      wires = `<path d="M10,32 H32" ${W}/><path d="M78,32 H92" ${W}/>`;
      break;
    case 'and':
      body = `<path d="M30,12 L52,12 A20,20 0 0 1 52,52 L30,52 Z" ${B}/>`;
      wires = `<path d="M10,22 H30" ${W}/><path d="M10,42 H30" ${W}/><path d="M72,32 H92" ${W}/>`;
      break;
    case 'nand':
      body = `<path d="M30,12 L52,12 A20,20 0 0 1 52,52 L30,52 Z" ${B}/>` + bub(77);
      wires = `<path d="M10,22 H30" ${W}/><path d="M10,42 H30" ${W}/><path d="M82,32 H92" ${W}/>`;
      break;
    case 'or':
      body = `<path d="M30,12 Q46,12 76,32 Q46,52 30,52 Q42,32 30,12 Z" ${B}/>`;
      wires = `<path d="M10,22 H33" ${W}/><path d="M10,42 H33" ${W}/><path d="M76,32 H92" ${W}/>`;
      break;
    case 'nor':
      body = `<path d="M30,12 Q46,12 76,32 Q46,52 30,52 Q42,32 30,12 Z" ${B}/>` + bub(81);
      wires = `<path d="M10,22 H33" ${W}/><path d="M10,42 H33" ${W}/><path d="M86,32 H92" ${W}/>`;
      break;
    case 'xor':
      body = `<path d="M30,12 Q46,12 76,32 Q46,52 30,52 Q42,32 30,12 Z" ${B}/>`;
      extra = `<path d="M22,12 Q34,32 22,52" ${W}/>`;
      wires = `<path d="M10,22 H27" ${W}/><path d="M10,42 H27" ${W}/><path d="M76,32 H92" ${W}/>`;
      break;
    case 'xnor':
      body = `<path d="M30,12 Q46,12 76,32 Q46,52 30,52 Q42,32 30,12 Z" ${B}/>` + bub(81);
      extra = `<path d="M22,12 Q34,32 22,52" ${W}/>`;
      wires = `<path d="M10,22 H27" ${W}/><path d="M10,42 H27" ${W}/><path d="M86,32 H92" ${W}/>`;
      break;
    default:
      body = '';
  }
  return `<svg viewBox="0 0 100 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="símbolo ${sym}">${wires}${extra}${body}</svg>`;
}

/* ===== Tabela verdade ===== */
function truthTable(truth) {
  const head = h('tr', null, ...truth.headers.map((hd) => h('th', null, hd)));
  const body = truth.rows.map((row) =>
    h('tr', null, ...row.map((v) => {
      const cls = v === 1 ? 'is-one' : v === 0 ? 'is-zero' : 'is-other';
      return h('td', { className: cls }, String(v));
    }))
  );
  return h('table', { className: 'logic-tt' },
    h('thead', null, head),
    h('tbody', null, ...body)
  );
}

export function portasPage() {
  const fullPage = h('div', { className: 'page-portas' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'PORTAS LÓGICAS')),
      h('h1', { className: 'page-header__title' }, '⊡ Enciclopédia de Lógica Digital'),
      h('p', { className: 'page-header__description' },
        h('span', { className: 'u-text-cyan' }, `${LOGIC_STATS.gates} portas`),
        ' fundamentais com símbolo, expressão e tabela verdade · ',
        h('span', { className: 'u-text-cyan' }, `${LOGIC_STATS.blocks} blocos`),
        ' construtivos · ',
        h('span', { className: 'u-text-cyan' }, `${LOGIC_STATS.chips} circuitos integrados`),
        ' das séries 7400 e 4000. Monte qualquer um deles no ',
        h('a', {
          className: 'u-text-cyan portas-link',
          href: '#/logic-sim',
          onclick: (e) => { e.preventDefault(); router.navigate('/logic-sim'); }
        }, 'Logic Sim'),
        '.'
      )
    )
  );

  /* ===== Portas fundamentais ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Portas Fundamentais'))
  );

  const gateGrid = h('div', { className: 'portas-grid' });
  FUNDAMENTAL_GATES.forEach((g) => {
    gateGrid.appendChild(
      h('article', { className: 'porta-card card' },
        h('div', { className: 'porta-card__head' },
          h('div', { className: 'porta-card__symbol', html: gateSVG(g.symbol) }),
          h('div', { className: 'porta-card__id' },
            h('h3', { className: 'porta-card__name' }, g.name),
            g.universal
              ? h('span', { className: 'badge badge--magenta' }, 'UNIVERSAL')
              : h('span', { className: 'porta-card__inputs u-text-muted' },
                  g.inputs === 1 ? '1 entrada' : `${g.inputs} entradas`)
          )
        ),
        h('div', { className: 'porta-card__expr u-mono' }, g.expr),
        h('p', { className: 'porta-card__desc' }, g.desc),
        truthTable(g.truth)
      )
    );
  });
  fullPage.appendChild(gateGrid);

  /* ===== Universalidade ===== */
  fullPage.appendChild(
    h('div', { className: 'portas-note card' },
      h('div', { className: 'portas-note__title' }, '◆ Portas universais — NAND e NOR'),
      h('p', null,
        'NAND e NOR são chamadas ', h('strong', null, 'universais'),
        ' porque qualquer função lógica — e portanto qualquer computador — ',
        'pode ser construída usando apenas um desses dois tipos de porta. ',
        'Um NOT é um NAND com as entradas unidas; um AND é um NAND seguido de ',
        'NOT; um OR sai de três NANDs. Por isso fábricas de chips otimizam ',
        'pesadamente esses dois blocos.')
    )
  );

  /* ===== Blocos construtivos ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Blocos Construtivos'))
  );

  const blockGrid = h('div', { className: 'portas-grid' });
  BUILDING_BLOCKS.forEach((b) => {
    blockGrid.appendChild(
      h('article', { className: 'porta-card card' },
        h('div', { className: 'porta-card__head' },
          h('div', { className: 'porta-card__id' },
            h('h3', { className: 'porta-card__name' }, b.name),
            h('span', {
              className: 'badge ' + (b.kind === 'Sequencial' ? 'badge--magenta' : 'badge--cyan')
            }, b.kind.toUpperCase())
          )
        ),
        h('div', { className: 'porta-card__expr u-mono' }, b.expr),
        h('p', { className: 'porta-card__desc' }, b.desc),
        truthTable(b.truth)
      )
    );
  });
  fullPage.appendChild(blockGrid);

  /* ===== Circuitos integrados ===== */
  fullPage.appendChild(
    h('div', { className: 'section-header' },
      h('h2', { className: 'section-header__title' }, 'Famílias de Circuitos Integrados'))
  );

  CHIP_FAMILIES.forEach((fam) => {
    const rows = fam.chips.map((c) =>
      h('tr', null,
        h('td', { className: 'u-mono u-text-cyan' }, c.code),
        h('td', null, c.name),
        h('td', { className: 'u-mono u-text-muted' }, `${c.pins} pinos`)
      )
    );
    fullPage.appendChild(
      h('div', { className: 'portas-chips card' },
        h('div', { className: 'portas-chips__head' },
          h('h3', { className: 'portas-chips__family' }, fam.family),
          h('span', { className: 'portas-chips__count u-text-muted' }, `${fam.chips.length} CIs`)
        ),
        h('p', { className: 'portas-chips__note u-text-muted' }, fam.note),
        h('table', { className: 'portas-chip-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Código'),
              h('th', null, 'Função'),
              h('th', null, 'Encapsulamento'))),
          h('tbody', null, ...rows)
        )
      )
    );
  });

  return fullPage;
}
