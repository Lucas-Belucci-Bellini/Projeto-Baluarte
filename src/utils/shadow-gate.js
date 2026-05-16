/**
 * Shadow Bridge — Gateway A.R.G.E.N.T. (Fase 21 / v1.0.0).
 *
 * A Ponte Shadow é um setor restrito SEM entrada no menu. Não existe
 * aba, card ou link apontando para ela em lugar nenhum da interface.
 * Para abrir o gateway, o operador precisa *saber*: digitar a
 * sequência de invocação em qualquer tela (fora de campos de texto).
 *
 * Autenticação:
 *   1. O operador digita o código de acesso no gateway.
 *   2. O código passa por SHA-256 iterado 100× (deriveHash) + salt fixo.
 *   3. O hash resultante é comparado com ARGENT_HASH.
 *   4. O código em texto plano NUNCA aparece no código-fonte — apenas
 *      o hash. Quem inspecionar o bundle encontra a prova matemática
 *      da senha, jamais a senha em si.
 */

import { h } from './helpers.js';
import { deriveHash } from './auth-engine.js';
import { router } from '../core/router.js';

/* Salt fixo. Não é segredo — só precisa ser constante para o hash bater. */
const ARGENT_SALT = 'baluarte::shadow-bridge::gateway::v1';

/* SHA-256 ×100 (+salt) do código de acesso. Somente o hash — nunca o texto. */
const ARGENT_HASH = '77fb2254801df2426a089f5d2ae74c6f26a44ba95f5ab13bbf58a082d7c19d95';

/* Sequência de invocação: digitá-la em qualquer tela abre o gateway. */
const SUMMON = 'argent';

/* A sessão restrita vive só na aba — fechou o navegador, selou a ponte. */
const UNLOCK_KEY = 'baluarte:shadow:argent-session';

let gateEl = null;

/** A Ponte Shadow está desbloqueada nesta sessão? */
export function isShadowUnlocked() {
  try {
    return sessionStorage.getItem(UNLOCK_KEY) === '1';
  } catch {
    return false;
  }
}

function setUnlocked(on) {
  try {
    if (on) sessionStorage.setItem(UNLOCK_KEY, '1');
    else sessionStorage.removeItem(UNLOCK_KEY);
  } catch {
    /* sessionStorage indisponível — gateway funciona só por navegação */
  }
}

/** Sela a ponte: encerra a sessão restrita. */
export function lockShadow() {
  setUnlocked(false);
}

/** Verifica um código contra ARGENT_HASH (comparação ~constant-time). */
async function verifyCode(input) {
  const computed = await deriveHash(String(input).trim(), ARGENT_SALT, 100);
  if (computed.length !== ARGENT_HASH.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ ARGENT_HASH.charCodeAt(i);
  }
  return diff === 0;
}

function closeGate() {
  if (gateEl) {
    gateEl.remove();
    gateEl = null;
  }
}

/** Abre o gateway oculto da Ponte Shadow. */
export function openShadowGate() {
  if (gateEl) return;

  const msgEl = h('p', { className: 'argent-gate__msg' });
  const input = h('input', {
    className: 'argent-gate__input',
    type: 'password',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-label': 'Código de acesso',
    placeholder: '_'
  });

  let busy = false;
  async function submit() {
    if (busy) return;
    if (!input.value.trim()) return;
    busy = true;
    msgEl.textContent = 'verificando assinatura…';
    msgEl.className = 'argent-gate__msg is-wait';
    const ok = await verifyCode(input.value);
    busy = false;
    if (ok) {
      msgEl.textContent = 'ACESSO CONCEDIDO — abrindo a ponte.';
      msgEl.className = 'argent-gate__msg is-ok';
      setUnlocked(true);
      setTimeout(() => {
        closeGate();
        router.navigate('/shadow');
      }, 700);
    } else {
      msgEl.textContent = 'código rejeitado — sem correspondência.';
      msgEl.className = 'argent-gate__msg is-err';
      input.value = '';
      input.focus();
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') { e.preventDefault(); closeGate(); }
  });

  const term = h('div', { className: 'argent-gate__term' },
    h('div', { className: 'argent-gate__bar' },
      h('span', null, '// terminal restrito //'),
      h('button', {
        className: 'argent-gate__x', 'aria-label': 'Fechar', onclick: closeGate
      }, '✕')
    ),
    h('div', { className: 'argent-gate__scr' },
      h('p', { className: 'argent-gate__line' }, 'ponte oculta · estabelecendo enlace'),
      h('p', { className: 'argent-gate__line' }, 'canal cifrado · SHA-256 iterado ×100'),
      h('p', { className: 'argent-gate__line argent-gate__line--dim' },
        'a senha não vive neste site — apenas a prova matemática dela.'),
      h('p', { className: 'argent-gate__line' }, 'aguardando código de acesso do operador:'),
      h('div', { className: 'argent-gate__prompt' },
        h('span', { className: 'argent-gate__caret' }, '▸'),
        input
      ),
      msgEl,
      h('div', { className: 'argent-gate__actions' },
        h('button', { className: 'btn btn--ghost btn--sm', onclick: closeGate }, 'abortar'),
        h('button', { className: 'btn btn--primary btn--sm', onclick: submit }, 'autenticar')
      )
    )
  );

  gateEl = h('div', {
    className: 'argent-gate',
    onclick: (e) => { if (e.target === gateEl) closeGate(); }
  }, term);

  document.body.appendChild(gateEl);
  setTimeout(() => input.focus(), 30);
}

/**
 * Instala o listener de invocação. Digitar a sequência secreta em
 * qualquer tela (desde que o foco não esteja num campo de texto)
 * abre o gateway. Chamado uma vez, no boot.
 */
export function initShadowGate() {
  let buffer = '';
  window.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
      return;
    }
    if (!e.key || e.key.length !== 1 || !/[a-z]/i.test(e.key)) return;
    buffer = (buffer + e.key.toLowerCase()).slice(-SUMMON.length);
    if (buffer === SUMMON) {
      buffer = '';
      openShadowGate();
    }
  });
}
