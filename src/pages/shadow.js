/**
 * Página /shadow — Shadow Bridge auth (Fase 18).
 *
 * Camada de autenticação client-side com SHA-256 × 100 + salt.
 * Protege áreas sensíveis localmente (não substitui auth server).
 */

import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import {
  isSetup, setupPassword, login, logout, isAuthenticated,
  getSession, timeRemaining, resetAuth
} from '../utils/auth-engine.js';

function fmtDuration(ms) {
  if (ms <= 0) return 'expirado';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export function shadowPage() {
  const fullPage = h('div', { className: 'page-shadow' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'SHADOW BRIDGE')),
      h('h1', { className: 'page-header__title' }, '◐ Shadow Bridge'),
      h('p', { className: 'page-header__description' },
        'Camada de autenticação ',
        h('span', { className: 'u-text-cyan' }, 'SHA-256 × 100'),
        ' com salt aleatório. Sessão de 4 horas. ',
        h('span', { className: 'u-text-muted' },
          'Implementação client-side — não substitui auth servidor.')
      )
    )
  );

  const cardEl = h('div', { className: 'shadow-card' });
  fullPage.appendChild(cardEl);

  function render() {
    empty(cardEl);

    /* Estado 1: ainda não configurou senha */
    if (!isSetup()) {
      const passInput = h('input', {
        className: 'input', type: 'password',
        placeholder: 'Senha (≥4 caracteres)',
        autocomplete: 'new-password'
      });
      const pass2Input = h('input', {
        className: 'input', type: 'password',
        placeholder: 'Confirme a senha',
        autocomplete: 'new-password'
      });

      cardEl.appendChild(
        h('div', { className: 'shadow-card__icon' }, '◐'),
        h('h2', { className: 'shadow-card__title' }, 'Configurar Shadow Bridge'),
        h('p', { className: 'shadow-card__desc u-text-muted' },
          'Defina uma senha mestre. Ela passará por 100 iterações de SHA-256 com salt antes de ser armazenada. A senha nunca é armazenada em texto plano.'),
        h('div', { className: 'shadow-form' },
          h('label', null, h('span', null, 'SENHA'), passInput),
          h('label', null, h('span', null, 'CONFIRMAR'), pass2Input),
          h('button', {
            className: 'btn btn--primary',
            onclick: async () => {
              if (passInput.value !== pass2Input.value) {
                toast('Senhas não coincidem', { type: 'danger' });
                return;
              }
              try {
                await setupPassword(passInput.value);
                toast('Shadow Bridge configurado!', { type: 'success' });
                render();
              } catch (e) {
                toast(e.message, { type: 'danger' });
              }
            }
          }, '⚿ Configurar')
        )
      );
      return;
    }

    /* Estado 2: autenticado */
    if (isAuthenticated()) {
      const session = getSession();
      cardEl.appendChild(
        h('div', { className: 'shadow-card__icon shadow-card__icon--success' }, '✓'),
        h('h2', { className: 'shadow-card__title' }, 'Sessão Ativa'),
        h('div', { className: 'shadow-info' },
          h('div', { className: 'shadow-info__row' },
            h('span', null, 'Token (preview)'),
            h('code', null, session.token.slice(0, 16) + '…')
          ),
          h('div', { className: 'shadow-info__row' },
            h('span', null, 'Iniciada'),
            h('code', null, new Date(session.startedAt).toLocaleString('pt-BR'))
          ),
          h('div', { className: 'shadow-info__row' },
            h('span', null, 'Expira em'),
            h('code', { className: 'u-text-cyan' }, fmtDuration(timeRemaining()))
          )
        ),
        h('div', { className: 'shadow-actions' },
          h('button', {
            className: 'btn btn--ghost',
            onclick: () => { logout(); toast('Sessão encerrada', { type: 'info' }); render(); }
          }, '🔓 Logout'),
          h('button', {
            className: 'btn btn--ghost btn--sm u-text-danger',
            title: 'Apaga senha e sessão (reset completo)',
            onclick: () => {
              if (confirm('Reset apaga senha configurada e exige novo setup. Continuar?')) {
                resetAuth();
                toast('Auth resetado', { type: 'warning' });
                render();
              }
            }
          }, '× Reset completo')
        )
      );
      return;
    }

    /* Estado 3: precisa fazer login */
    const passInput = h('input', {
      className: 'input', type: 'password',
      placeholder: 'Senha mestre',
      autocomplete: 'current-password',
      onkeydown: (e) => { if (e.key === 'Enter') doLogin(); }
    });

    async function doLogin() {
      try {
        const ok = await login(passInput.value);
        if (!ok) {
          toast('Senha incorreta', { type: 'danger' });
          passInput.value = '';
          return;
        }
        toast('Acesso concedido', { type: 'success' });
        render();
      } catch (e) {
        toast(e.message, { type: 'danger' });
      }
    }

    cardEl.appendChild(
      h('div', { className: 'shadow-card__icon' }, '◐'),
      h('h2', { className: 'shadow-card__title' }, 'Autenticar — Shadow Bridge'),
      h('p', { className: 'shadow-card__desc u-text-muted' },
        'Digite a senha mestre para abrir uma nova sessão de 4 horas.'),
      h('div', { className: 'shadow-form' },
        h('label', null, h('span', null, 'SENHA'), passInput),
        h('button', { className: 'btn btn--primary', onclick: doLogin }, '⚿ Entrar'),
        h('button', {
          className: 'btn btn--ghost btn--sm u-text-danger',
          onclick: () => {
            if (confirm('Reset apaga a senha configurada. Você terá que criar uma nova. Continuar?')) {
              resetAuth();
              render();
            }
          }
        }, 'Esqueci a senha (reset)')
      )
    );
  }

  render();
  return fullPage;
}
