/**
 * Página /conta — Configurações da Conta.
 *
 * Identidade da sessão (e-mail, provedor) e as duas trocas sensíveis que só
 * fazem sentido com o operador já autenticado: e-mail e senha. Aparência,
 * backup e limpeza de dados locais continuam no /perfil — esta página é só
 * a conta em si.
 */

import '../styles/login.css';
import '../styles/conta.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { supabaseConfigured } from '../core/supabase.js';
import { isLoggedIn, currentUser, signOut, updateEmail, updatePassword } from '../core/supabase-auth.js';

function fieldError(msg) {
  return h('div', { className: 'lg-error', role: 'alert' }, msg);
}

function sectionTitle(icon, title) {
  return h('div', { className: 'acc-section' },
    h('span', { className: 'acc-section__icon' }, icon),
    h('h2', { className: 'acc-section__title' }, title));
}

function identityCard(user) {
  const meta = user.meta || {};
  const name = meta.name || meta.full_name || (user.email || '').split('@')[0] || 'Operador';
  const avatar = meta.avatar_url || meta.picture;
  const provider = user.provider === 'google' ? 'Google' : 'E-mail e senha';

  return h('div', { className: 'acc-card' },
    avatar
      ? h('img', { className: 'acc-avatar', src: avatar, alt: '', referrerpolicy: 'no-referrer' })
      : h('span', { className: 'acc-avatar acc-avatar--ph' }, (name[0] || '?').toUpperCase()),
    h('div', { className: 'acc-identity' },
      h('div', { className: 'acc-name' }, name),
      user.email && h('div', { className: 'acc-email u-text-muted' }, user.email),
      h('span', { className: 'acc-badge' }, provider)),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: async () => {
        await signOut();
        toast('Você saiu da conta');
        router.navigate('/login');
      }
    }, 'Sair'));
}

function emailForm(currentEmail) {
  const errBox = h('div', { className: 'lg-error-slot' });
  const input = h('input', {
    className: 'input', type: 'email', name: 'email', autocomplete: 'email',
    placeholder: currentEmail || 'seu@email.com', required: true
  });
  const submitBtn = h('button', { className: 'btn btn--primary lg-submit', type: 'submit' }, 'Trocar e-mail');

  return h('form', {
    className: 'lg-form',
    onsubmit: async (e) => {
      e.preventDefault();
      empty(errBox);
      const email = input.value.trim();
      if (!email || email === currentEmail) {
        errBox.appendChild(fieldError('Informe um e-mail diferente do atual.'));
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Trocando…';
      try {
        await updateEmail(email);
        toast('Confirme o link enviado ao novo e-mail para concluir a troca.', { type: 'info', duration: 4000 });
        input.value = '';
      } catch (err) {
        errBox.appendChild(fieldError(err.message || 'Algo deu errado. Tente de novo.'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trocar e-mail';
      }
    }
  },
    errBox,
    h('label', { className: 'lg-field' }, h('span', null, 'NOVO E-MAIL'), input),
    submitBtn);
}

function passwordForm() {
  const errBox = h('div', { className: 'lg-error-slot' });
  const passInput = h('input', {
    className: 'input', type: 'password', name: 'password', autocomplete: 'new-password',
    placeholder: 'Nova senha (mín. 6 caracteres)', required: true, minLength: 6
  });
  const confirmInput = h('input', {
    className: 'input', type: 'password', name: 'confirm', autocomplete: 'new-password',
    placeholder: 'Confirme a nova senha', required: true, minLength: 6
  });
  const submitBtn = h('button', { className: 'btn btn--primary lg-submit', type: 'submit' }, 'Trocar senha');

  return h('form', {
    className: 'lg-form',
    onsubmit: async (e) => {
      e.preventDefault();
      empty(errBox);
      if (passInput.value !== confirmInput.value) {
        errBox.appendChild(fieldError('As senhas não coincidem.'));
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Trocando…';
      try {
        await updatePassword(passInput.value);
        toast('Senha trocada.', { type: 'success' });
        passInput.value = '';
        confirmInput.value = '';
      } catch (err) {
        errBox.appendChild(fieldError(err.message || 'Algo deu errado. Tente de novo.'));
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Trocar senha';
      }
    }
  },
    errBox,
    h('label', { className: 'lg-field' }, h('span', null, 'NOVA SENHA'), passInput),
    h('label', { className: 'lg-field' }, h('span', null, 'CONFIRMAR SENHA'), confirmInput),
    submitBtn);
}

export function contaPage() {
  const page = h('div', { className: 'page-conta' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CONTA')),
      h('h1', { className: 'page-header__title' }, '⚙ Configurações da Conta'),
      h('p', { className: 'page-header__description' },
        'Identidade, e-mail e senha da sua conta. Aparência, backup e dados locais ficam no Perfil.'))
  );

  if (!supabaseConfigured()) {
    page.appendChild(h('p', { className: 'u-text-muted' },
      'Indisponível (banco não configurado neste ambiente).'));
    return page;
  }

  const user = currentUser();
  if (!isLoggedIn() || !user) {
    /* O router já bloqueia rota sem sessão (ver reg() em main.js); isto é só
     * defesa em profundidade caso a sessão expire no meio da visita. */
    router.navigate('/login');
    return page;
  }

  page.appendChild(sectionTitle('◉', 'Identidade'));
  page.appendChild(identityCard(user));

  page.appendChild(sectionTitle('✉', 'Trocar e-mail'));
  page.appendChild(h('div', { className: 'acc-wrap anim-fade-in' }, emailForm(user.email)));

  page.appendChild(sectionTitle('⛨', 'Trocar senha'));
  page.appendChild(h('div', { className: 'acc-wrap anim-fade-in' }, passwordForm()));

  page.appendChild(h('div', { className: 'acc-more' },
    h('button', { className: 'acc-more-link', onclick: () => router.navigate('/perfil') },
      h('span', null, '◔ Aparência, backup e dados locais estão no Perfil'),
      h('span', { className: 'acc-more-link__arrow' }, '→'))));

  return page;
}
