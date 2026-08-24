/**
 * Página /login — Entrar / Criar conta.
 *
 * Aba dedicada de autenticação (fora do /perfil): login por e-mail+senha,
 * cadastro por e-mail+senha e login social com Google, tudo em cima do
 * Supabase Auth (`src/core/supabase-auth.js`). Se já estiver logado, mostra
 * a conta atual com atalho pro Dossiê do Operador.
 */

import '../styles/login.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { supabaseConfigured } from '../core/supabase.js';
import {
  isLoggedIn, currentUser, signInWithGoogle, signOut,
  signInWithPassword, signUpWithPassword
} from '../core/supabase-auth.js';

const GOOGLE_G_SVG = '<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function fieldError(msg) {
  return h('div', { className: 'lg-error', role: 'alert' }, msg);
}

/* Formulário e-mail+senha; `onSwitch` troca a aba (usado após cadastro
 * pendente de confirmação, pra jogar o usuário direto pro Entrar). */
function authForm(mode, onSwitch) {
  const isSignup = mode === 'signup';
  const errBox = h('div', { className: 'lg-error-slot' });
  const emailInput = h('input', {
    className: 'input', type: 'email', name: 'email', autocomplete: 'email',
    placeholder: 'seu@email.com', required: true
  });
  const passInput = h('input', {
    className: 'input', type: 'password', name: 'password',
    autocomplete: isSignup ? 'new-password' : 'current-password',
    placeholder: isSignup ? 'Crie uma senha (mín. 6 caracteres)' : 'Sua senha', required: true, minLength: 6
  });
  const confirmInput = isSignup
    ? h('input', {
      className: 'input', type: 'password', name: 'confirm', autocomplete: 'new-password',
      placeholder: 'Confirme a senha', required: true, minLength: 6
    })
    : null;

  const submitBtn = h('button', { className: 'btn btn--primary lg-submit', type: 'submit' },
    isSignup ? 'Criar conta' : 'Entrar');

  return h('form', {
    className: 'lg-form',
    onsubmit: async (e) => {
      e.preventDefault();
      empty(errBox);
      const email = emailInput.value.trim();
      const password = passInput.value;
      if (isSignup && password !== confirmInput.value) {
        errBox.appendChild(fieldError('As senhas não coincidem.'));
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = isSignup ? 'Criando conta…' : 'Entrando…';
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
      } catch (err) {
        errBox.appendChild(fieldError(err.message || 'Algo deu errado. Tente de novo.'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? 'Criar conta' : 'Entrar';
      }
    }
  },
    errBox,
    h('label', { className: 'lg-field' }, h('span', null, 'E-MAIL'), emailInput),
    h('label', { className: 'lg-field' }, h('span', null, 'SENHA'), passInput),
    isSignup && h('label', { className: 'lg-field' }, h('span', null, 'CONFIRMAR SENHA'), confirmInput),
    submitBtn);
}

/* Card único: alterna entre "já logado" (conta + Sair) e "Entrar/Criar conta"
 * (tabs + Google + formulário). Re-renderiza sozinho no login/logout. */
function accountCard() {
  const box = h('div', { className: 'lg-card' });
  /* Cadastro vem antes do login (operador quer novos usuários obrigados a
   * criar conta primeiro): aba padrão e ordem visual começam em "signup". */
  let mode = 'signup';

  function render() {
    empty(box);

    if (!supabaseConfigured()) {
      box.appendChild(h('p', { className: 'u-text-muted' },
        'Login indisponível (banco não configurado neste ambiente).'));
      return;
    }

    if (isLoggedIn()) {
      const u = currentUser() || { meta: {} };
      const meta = u.meta || {};
      const name = meta.name || meta.full_name || (u.email || '').split('@')[0] || 'Operador';
      const avatar = meta.avatar_url || meta.picture;
      box.appendChild(h('div', { className: 'lg-account' },
        avatar
          ? h('img', { className: 'lg-account__avatar', src: avatar, alt: '', referrerpolicy: 'no-referrer' })
          : h('span', { className: 'lg-account__avatar lg-account__avatar--ph' }, (name[0] || '?').toUpperCase()),
        h('div', { className: 'lg-account__info' },
          h('div', { className: 'lg-account__name' }, name),
          u.email && h('div', { className: 'lg-account__email u-text-muted' }, u.email))));
      box.appendChild(h('div', { className: 'lg-account__actions' },
        h('button', { className: 'btn btn--primary btn--sm', onclick: () => router.navigate('/perfil') },
          'Ir para o Perfil'),
        h('button', {
          className: 'btn btn--ghost btn--sm',
          onclick: async () => { await signOut(); toast('Você saiu da conta'); render(); }
        }, 'Sair')));
      return;
    }

    box.appendChild(h('div', { className: 'lg-tabs' },
      h('button', {
        className: 'lg-tab' + (mode === 'signup' ? ' is-active' : ''),
        onclick: () => { mode = 'signup'; render(); }
      }, 'Criar conta'),
      h('button', {
        className: 'lg-tab' + (mode === 'login' ? ' is-active' : ''),
        onclick: () => { mode = 'login'; render(); }
      }, 'Entrar')));
    box.appendChild(h('button', { className: 'btn-google', onclick: () => signInWithGoogle() },
      h('span', { className: 'btn-google__g', html: GOOGLE_G_SVG }),
      mode === 'signup' ? 'Criar conta com Google' : 'Entrar com Google'));
    box.appendChild(h('div', { className: 'lg-divider' }, h('span', null, 'ou')));
    box.appendChild(authForm(mode, (next) => { mode = next; render(); }));
  }

  render();
  return box;
}

export function loginPage() {
  const page = h('div', { className: 'page-login' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'ACESSO')),
      h('h1', { className: 'page-header__title' }, '⛨ Criar Conta / Entrar'),
      h('p', { className: 'page-header__description' },
        'É preciso ter uma conta para acessar o Baluarte. Ela também sincroniza estética (tema + universo) e favoritos entre dispositivos.'))
  );

  page.appendChild(h('div', { className: 'lg-wrap anim-fade-in' }, accountCard()));

  return page;
}
/** Compatibilidade V1: a página canônica vive em login.ts. */
export { loginPage } from './login.ts';
