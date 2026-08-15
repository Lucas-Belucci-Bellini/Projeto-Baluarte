import '../styles/seguranca.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { guardEnabled, setGuardEnabled, getGuardLog, clearGuardLog, guardStats, TOOL_LEVEL } from '../utils/jarvis-guard.js';
import type { GuardLevel } from '../utils/jarvis-guard.js';

interface LevelInfo { readonly label: string; readonly cls: string; }
const LEVEL: Readonly<Record<GuardLevel, LevelInfo>> = { safe: { label: 'seguro', cls: 'success' }, caution: { label: 'cautela', cls: 'warning' }, block: { label: 'bloqueado', cls: 'danger' } };
function fmt(timestamp: number): string { try { return new Date(timestamp).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } }
function statBox(value: number, label: string): HTMLDivElement { return h('div', { className: 'seg-stat' }, h('div', { className: 'seg-stat__v' }, String(value)), h('div', { className: 'seg-stat__l' }, label)); }
export function segurancaPage(): HTMLDivElement {
  const page = h('div', { className: 'page-seguranca' });
  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } }, h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'SEGURANÇA')), h('h1', { className: 'page-header__title' }, '🛡️ Segurança do Agente'), h('p', { className: 'page-header__description' }, 'Toda ação do modo agente do JARVIS passa por esta política antes de executar — ações perigosas são ', h('span', { className: 'u-text-cyan' }, 'bloqueadas'), ' e cada decisão é registrada. Inspirado no Sponsio.')));
  const toggleWrap = h('div', { className: 'seg-toggle' });
  const statsEl = h('div', { className: 'seg-stats' });
  page.append(toggleWrap, statsEl);
  const policyCard = h('div', { className: 'seg-card' }, h('div', { className: 'seg-card__title' }, '📋 Política por ferramenta'));
  const policyGrid = h('div', { className: 'seg-pol' });
  for (const [tool, level] of Object.entries(TOOL_LEVEL)) { const info = LEVEL[level]; policyGrid.appendChild(h('div', { className: 'seg-pol__row' }, h('span', { className: 'u-mono' }, tool), h('span', { className: `badge badge--${info.cls}` }, info.label))); }
  policyCard.append(policyGrid, h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: '8px' } }, 'Além disso, todo argumento é varrido por padrões perigosos (rede, eval, DOM, sistema, credenciais). Criar código com esses padrões é bloqueado; navegação só aceita rotas internas.'));
  page.appendChild(policyCard);
  const logCard = h('div', { className: 'seg-card' });
  const logList = h('div', { className: 'seg-log' });
  logCard.append(h('div', { className: 'seg-card__head' }, h('span', { className: 'seg-card__title' }, '📜 Log de decisões'), h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => { clearGuardLog(); refresh(); toast('Log limpo'); } }, '🗑 Limpar')), logList);
  page.appendChild(logCard);
  function refresh(): void { const enabled = guardEnabled(); empty(toggleWrap); toggleWrap.appendChild(h('button', { className: `seg-switch ${enabled ? 'is-on' : 'is-off'}`, onclick: (): void => { setGuardEnabled(!enabled); refresh(); toast(enabled ? 'Guarda DESLIGADO' : 'Guarda LIGADO', { type: enabled ? 'warning' : 'success' }); } }, h('span', { className: 'seg-switch__dot' }), enabled ? 'Guarda ATIVO' : 'Guarda DESLIGADO')); const stats = guardStats(); empty(statsEl); statsEl.append(statBox(stats.total, 'decisões'), statBox(stats.safe || 0, 'seguras'), statBox(stats.caution || 0, 'cautela'), statBox(stats.block || 0, 'bloqueadas')); empty(logList); const log = getGuardLog(); if (!log.length) { logList.appendChild(h('div', { className: 'seg-empty u-text-muted' }, 'Nenhuma decisão ainda. Use o modo Agente do JARVIS para ver o guard em ação.')); return; } log.forEach((entry) => { const info = LEVEL[entry.level]; logList.appendChild(h('div', { className: 'seg-log__row' }, h('span', { className: `badge badge--${info.cls}` }, info.label), h('span', { className: 'seg-log__tool u-mono' }, entry.tool), h('span', { className: 'seg-log__why' }, entry.reason), h('span', { className: 'seg-log__time u-mono u-text-muted' }, fmt(entry.ts)))); }); }
  refresh();
  return page;
}
