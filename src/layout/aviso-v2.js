/**
 * Faixa de aviso: a V2 está em construção (#420).
 *
 * Decisão do operador, tomada com o trade-off na mesa: não há como impedir que
 * o desenvolvimento da V2 afete o site e o app, então o certo é **avisar** em
 * vez de deixar o visitante descobrir sozinho que algo quebrou.
 *
 * O app entra de brinde: o launcher é uma casca que faz `loadURL` do site ao
 * vivo, então quem abre o app vê a mesma faixa. Um único lugar cobre os dois.
 *
 * ── Três decisões de design, e o porquê de cada uma ─────────────────────────
 *
 * **Dispensável.** Aviso que não se cala vira ruído, e ruído ensina o operador a
 * ignorar avisos — inclusive o próximo, que pode ser sério. Fecha e não volta.
 *
 * **A dispensa é por versão.** A chave guarda `aviso:v2` = a versão em que o
 * aviso foi fechado. Quando o texto mudar de verdade (a V2 entrou noutra fase,
 * o risco é outro), basta subir `VERSAO_AVISO` e a faixa reaparece para quem já
 * tinha fechado. Sem isso, um aviso novo nasceria invisível justamente para quem
 * mais acompanha o projeto.
 *
 * **Sem `innerHTML`.** Mesma regra do resto do shell: o texto é montado por nó,
 * então nada que venha a ser interpolado aqui pode virar marcação.
 */

import { h } from '../utils/helpers.js';
import { storage } from '../core/storage.js';

/* Suba este número quando o AVISO mudar de conteúdo, não a cada deploy. */
const VERSAO_AVISO = 1;
const CHAVE = 'aviso:v2';

/** A faixa já foi dispensada nesta versão do aviso? */
export function avisoDispensado() {
  return storage.get(CHAVE) === VERSAO_AVISO;
}

/**
 * Monta a faixa no topo do `rootEl`, se ainda não tiver sido dispensada.
 * @param {HTMLElement} rootEl
 * @returns {HTMLElement|null} a faixa, ou `null` se dispensada
 */
export function mountAvisoV2(rootEl) {
  if (avisoDispensado()) return null;

  const fechar = h('button', {
    className: 'aviso-v2__fechar',
    type: 'button',
    'aria-label': 'Dispensar aviso',
    title: 'Dispensar',
    onclick: () => {
      storage.set(CHAVE, VERSAO_AVISO);
      faixa.remove();
      document.documentElement.classList.remove('tem-aviso-v2');
    }
  }, '✕');

  const faixa = h('div', {
    className: 'aviso-v2',
    role: 'status',
    'aria-live': 'polite'
  },
    h('span', { className: 'aviso-v2__selo' }, '🚧 V2 em construção'),
    h('span', { className: 'aviso-v2__texto' },
      'O Baluarte entrou na reconstrução da V2. Enquanto isso, partes do site e '
      + 'do app podem falhar ou mudar sem aviso.'),
    fechar
  );

  /* A classe no <html> deixa o CSS empurrar o shell para baixo sem que este
   * módulo precise conhecer a altura da faixa — quem sabe medir é o layout. */
  document.documentElement.classList.add('tem-aviso-v2');
  rootEl.insertBefore(faixa, rootEl.firstChild);
  return faixa;
}
