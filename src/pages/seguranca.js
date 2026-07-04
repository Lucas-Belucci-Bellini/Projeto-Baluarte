/**
 * /seguranca — Segurança do Agente (inspirado no Sponsio).
 *
 * Mostra a política de segurança que vETA cada chamada de ferramenta do modo
 * agente do JARVIS, com liga/desliga e o log de decisões. Lê src/utils/jarvis-guard.js.
 */

import '../styles/seguranca.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import {
  guardEnabled, setGuardEnabled, getGuardLog, clearGuardLog, guardStats, TOOL_LEVEL
} from '../utils/jarvis-guard.js';

const LEVEL = {
  safe: { label: 'seguro', cls: 'success' },
  caution: { label: 'cautela', cls: 'warning' },
  block: { label: 'bloqueado', cls: 'danger' }
};

function fmt(ts) {
  try { return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export function segurancaPage() {
  const page = h('div', { className: 'page-seguranca' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SEGURANÇA')),
      h('h1', { className: 'page-header__title' }, '🛡️ Segurança do Agente'),
      h('p', { className: 'page-header__description' },
        'Toda ação do modo agente do JARVIS passa por esta política antes de executar — ',
        'ações perigosas são ', h('span', { className: 'u-text-cyan' }, 'bloqueadas'),
        ' e cada decisão é registrada. Inspirado no Sponsio.'))
  );

  /* Liga/desliga + stats */
  const toggleWrap = h('div', { className: 'seg-toggle' });
  const statsEl = h('div', { className: 'seg-stats' });
  page.appendChild(toggleWrap);
  page.appendChild(statsEl);

  /* Política */
  const polCard = h('div', { className: 'seg-card' },
    h('div', { className: 'seg-card__title' }, '📋 Política por ferramenta'));
  const polGrid = h('div', { className: 'seg-pol' });
  for (const [tool, lvl] of Object.entries(TOOL_LEVEL)) {
    const L = LEVEL[lvl];
    polGrid.appendChild(h('div', { className: 'seg-pol__row' },
      h('span', { className: 'u-mono' }, tool),
      h('span', { className: `badge badge--${L.cls}` }, L.label)));
  }
  polCard.appendChild(polGrid);
  polCard.appendChild(h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: '8px' } },
    'Além disso, todo argumento é varrido por padrões perigosos (rede, eval, DOM, sistema, credenciais). ' +
    'Criar código com esses padrões é bloqueado; navegação só aceita rotas internas.'));
  page.appendChild(polCard);

  /* Log */
  const logCard = h('div', { className: 'seg-card' });
  const logHead = h('div', { className: 'seg-card__head' },
    h('span', { className: 'seg-card__title' }, '📜 Log de decisões'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => { clearGuardLog(); refresh(); toast('Log limpo'); }
    }, '🗑 Limpar'));
  const logList = h('div', { className: 'seg-log' });
  logCard.appendChild(logHead);
  logCard.appendChild(logList);
  page.appendChild(logCard);

  function refresh() {
    /* toggle */
    const on = guardEnabled();
    empty(toggleWrap);
    toggleWrap.appendChild(h('button', {
      className: `seg-switch ${on ? 'is-on' : 'is-off'}`,
      onclick: () => { setGuardEnabled(!on); refresh(); toast(on ? 'Guarda DESLIGADO' : 'Guarda LIGADO', { type: on ? 'warning' : 'success' }); }
    }, h('span', { className: 'seg-switch__dot' }), on ? 'Guarda ATIVO' : 'Guarda DESLIGADO'));

    /* stats */
    const st = guardStats();
    empty(statsEl);
    statsEl.append(
      statBox(st.total, 'decisões'),
      statBox(st.safe || 0, 'seguras'),
      statBox(st.caution || 0, 'cautela'),
      statBox(st.block || 0, 'bloqueadas'));

    /* log */
    empty(logList);
    const log = getGuardLog();
    if (!log.length) {
      logList.appendChild(h('div', { className: 'seg-empty u-text-muted' },
        'Nenhuma decisão ainda. Use o modo Agente do JARVIS para ver o guard em ação.'));
      return;
    }
    log.forEach((e) => {
      const L = LEVEL[e.level] || LEVEL.caution;
      logList.appendChild(h('div', { className: 'seg-log__row' },
        h('span', { className: `badge badge--${L.cls}` }, L.label),
        h('span', { className: 'seg-log__tool u-mono' }, e.tool),
        h('span', { className: 'seg-log__why' }, e.reason),
        h('span', { className: 'seg-log__time u-mono u-text-muted' }, fmt(e.ts))));
    });
  }

  function statBox(v, l) {
    return h('div', { className: 'seg-stat' },
      h('div', { className: 'seg-stat__v' }, String(v)),
      h('div', { className: 'seg-stat__l' }, l));
  }

  refresh();
  return page;
}
