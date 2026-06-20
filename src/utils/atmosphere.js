/**
 * Atmosfera imersiva global (#246/#195/#262) — UMA camada de fundo, montada uma
 * vez pelo shell, que vive ATRÁS de todo o app. Dá a TODAS as páginas o "nível
 * Spline" pedido pelo operador (referências no #262): auroras volumétricas que
 * respiram + raios de luz + grid HUD à deriva + vinheta de foco.
 *
 * Barato: só CSS anima (sem rAF, sem dependência). pointer-events:none — nunca
 * intercepta clique. prefers-reduced-motion é tratado no CSS (atmosphere.css).
 * Idempotente: se já existe, não duplica.
 */

import { h } from './helpers.js';

export function mountAtmosphere(root) {
  if (!root || root.querySelector('.bx-atmosphere')) return null;
  const atmo = h('div', { className: 'bx-atmosphere', 'aria-hidden': 'true' },
    h('div', { className: 'bx-atmosphere__aurora' }),
    h('div', { className: 'bx-atmosphere__rays' }),
    h('div', { className: 'bx-atmosphere__grid' }),
    h('div', { className: 'bx-atmosphere__vignette' }));
  root.appendChild(atmo);
  return atmo;
}
