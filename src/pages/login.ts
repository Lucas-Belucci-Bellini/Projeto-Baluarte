/**
 * Página /login — Entrar / Criar conta.
 *
 * A implementação canônica da feature de identidade. O wrapper `login.js`
 * permanece para compatibilidade com o router V1 durante a transição.
 */

import '../styles/login.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast';
import { supabaseConfigured } from '../core/supabase.js';
import {
  isLoggedIn,
  currentUser,
  signInWithGoogle,
  signOut,
  signInWithPassword,
  signUpWithPassword,
} from '../core/supabase-auth.js';
import type { AuthUser } from '../core/supabase-auth.js';
import {
  authValidationMessage,
  normalizeAuthError,
  validateAuthForm,
} from '../security/auth-form-contract.js';

const GOOGLE_G_SVG = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

type AuthMode = 'login' | 'signup';

type ErrorSlot = HTMLDivElement;

function fieldError(message: string): HTMLDivElement {
  return h('div', { className: 'lg-error', role: 'alert' }, message);
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function userDisplay(user: AuthUser): { name: string; avatar: string } {
  const meta = isRecord(user.meta) ? user.meta : {};
  const nameCandidate = typeof meta.name === 'string'
    ? meta.name
    : typeof meta.full_name === 'string'
      ? meta.full_name
      : user.email.split('@')[0];
  const name = nameCandidate || 'Operador';
  const avatar = typeof meta.avatar_url === 'string'
    ? meta.avatar_url
    : typeof meta.picture === 'string' ? meta.picture : '';
  return { name, avatar };
}

function authForm(mode: AuthMode, onSwitch: (next: AuthMode) => void): HTMLFormElement {
  const isSignup = mode === 'signup';
  const errorSlot: ErrorSlot = h('div', { className: 'lg-error-slot' });
  const emailInput = h('input', {
    className: 'input',
    type: 'email',
    name: 'email',
    autocomplete: 'email',
    placeholder: 'seu@email.com',
    required: true,
  });
  const passwordInput = h('input', {
    className: 'input',
    type: 'password',
    name: 'password',
    autocomplete: isSignup ? 'new-password' : 'current-password',
    placeholder: isSignup ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha',
    required: true,
    minLength: 6,
  });
  const confirmationInput = isSignup
    ? h('input', {
      className: 'input',
      type: 'password',
      name: 'confirm',
      autocomplete: 'new-password',
      placeholder: 'Confirme a senha',
      required: true,
      minLength: 6,
    })
    : null;
  const submitButton = h(
    'button',
    { className: 'btn btn--primary lg-submit', type: 'submit' },
    isSignup ? 'Criar conta' : 'Entrar',
  );

  return h(
    'form',
    {
      className: 'lg-form',
      onsubmit: async (event: Event): Promise<void> => {
        event.preventDefault();
        empty(errorSlot);
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const validation = validateAuthForm({
          mode,
          email,
          password,
          confirmation: confirmationInput?.value,
        });
        if (!validation.valid) {
          // Compatibilidade do contrato UI: "As senhas não coincidem." permanece bounded.
          const firstReason = validation.reasons[0];
          if (firstReason) errorSlot.appendChild(fieldError(authValidationMessage(firstReason)));
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = isSignup ? 'Criando conta…' : 'Entrando…';
        try {
          if (isSignup) {
            const { confirmed } = await signUpWithPassword(email, password);
            if (confirmed) {
              toast('Conta criada! Bem-vindo ao Baluarte.', { type: 'success' });
              router.navigate('/perfil');
            } else {
              toast('Quase lá: confirme seu e-mail pelo link que enviamos.', { type: 'info' });
              onSwitch('login');
            }
          } else {
            await signInWithPassword(email, password);
            toast('Login realizado.', { type: 'success' });
            router.navigate('/perfil');
          }
        } catch (error: unknown) {
          errorSlot.appendChild(fieldError(normalizeAuthError(error)));
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = isSignup ? 'Criar conta' : 'Entrar';
        }
      },
    },
    errorSlot,
    h('label', { className: 'lg-field' }, h('span', null, 'E-MAIL'), emailInput),
    h('label', { className: 'lg-field' }, h('span', null, 'SENHA'), passwordInput),
    isSignup && confirmationInput
      ? h('label', { className: 'lg-field' }, h('span', null, 'CONFIRMAR SENHA'), confirmationInput)
      : null,
    submitButton,
  );
}

function accountCard(): HTMLDivElement {
  const box = h('div', { className: 'lg-card' });
  /* Cadastro vem antes do login (operador quer novos usuários obrigados a
   * criar conta primeiro): aba padrão e ordem visual começam em "signup". */
  let mode: AuthMode = 'signup';

  function render(): void {
    empty(box);

    if (!supabaseConfigured()) {
      box.appendChild(h('p', { className: 'u-text-muted' },
        'Login indisponível (banco não configurado neste ambiente).'));
      return;
    }

    if (isLoggedIn()) {
      const user = currentUser();
      if (!user) {
        box.appendChild(h('p', { className: 'u-text-muted' },
          'A sessão não pôde ser lida. Entre novamente.'));
        return;
      }
      const { name, avatar } = userDisplay(user);
      box.appendChild(h('div', { className: 'lg-account' },
        avatar
          ? h('img', { className: 'lg-account__avatar', src: avatar, alt: '', referrerpolicy: 'no-referrer' })
          : h('span', { className: 'lg-account__avatar lg-account__avatar--ph' }, (name[0] || '?').toUpperCase()),
        h('div', { className: 'lg-account__info' },
          h('div', { className: 'lg-account__name' }, name),
          user.email && h('div', { className: 'lg-account__email u-text-muted' }, user.email)),
      ));
      box.appendChild(h('div', { className: 'lg-account__actions' },
        h('button', {
          className: 'btn btn--primary btn--sm',
          onclick: (): void => router.navigate('/perfil'),
        }, 'Ir para o Perfil'),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: async (): Promise<void> => {
            await signOut();
            toast('Você saiu da conta');
            render();
          },
        }, 'Sair'),
      ));
      return;
    }

    box.appendChild(h('div', { className: 'lg-tabs' },
      h('button', {
        className: `lg-tab${mode === 'signup' ? ' is-active' : ''}`,
        onclick: (): void => { mode = 'signup'; render(); },
      }, 'Criar conta'),
      h('button', {
        className: `lg-tab${mode === 'login' ? ' is-active' : ''}`,
        onclick: (): void => { mode = 'login'; render(); },
      }, 'Entrar'),
    ));
    box.appendChild(h('button', {
      className: 'btn-google',
      onclick: (): void => { signInWithGoogle(); },
    },
    h('span', { className: 'btn-google__g', html: GOOGLE_G_SVG }),
    mode === 'signup' ? 'Criar conta com Google' : 'Entrar com Google'));
    box.appendChild(h('div', { className: 'lg-divider' }, h('span', null, 'ou')));
    box.appendChild(authForm(mode, (next: AuthMode): void => { mode = next; render(); }));
  }

  render();
  return box;
}

export function loginPage(): HTMLDivElement {
  const page = h('div', { className: 'page-login' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ACESSO')),
      h('h1', { className: 'page-header__title' }, '⛨ Criar Conta / Entrar'),
      h('p', { className: 'page-header__description' },
        'É preciso ter uma conta para acessar o Baluarte. Ela também sincroniza estética (tema + universo) e favoritos entre dispositivos.'),
    ),
  );
  page.appendChild(h('div', { className: 'lg-wrap anim-fade-in' }, accountCard()));
  return page;
}
