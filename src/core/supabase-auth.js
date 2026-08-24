/**
 * Auth de usuário — Supabase Auth por `fetch` (sem SDK, web leve #238).
 *
 * Login social (Google) via redirect ao endpoint `/auth/v1/authorize`. O Supabase
 * devolve os tokens no FRAGMENTO da URL (#access_token=…); como o app usa
 * hash-routing, `handleAuthRedirect()` (chamado no boot, antes do router) lê esses
 * params, guarda a sessão e limpa o hash. Sessão em localStorage; `getAccessToken()`
 * renova via refresh_token. A segurança real é o RLS no banco (o token é o JWT do
 * usuário; `auth.uid()` identifica o dono da linha em `profiles`).
 */

import { supabaseUrl, supabaseAnonKey, supabaseConfigured } from './supabase.js';
import { storage } from './storage.js';

/* Chave SEM o prefixo — o wrapper põe `baluarte:` sozinho, então o nome completo
 * continua sendo `baluarte:auth:session`, exatamente o que já está gravado no
 * navegador de quem usa. A migração não desloga ninguém.
 *
 * A classe é `sensivel`, não `secreto` (declarado em `core/politica.js`), e a
 * distinção é proposital: `secreto` é recusado na gravação, e a sessão do
 * usuário PRECISA viver no navegador — é assim que auth web funciona. O que a
 * protege não é escondê-la do frontend (impossível), é ela ser o JWT do próprio
 * usuário, curto, renovável, e com o RLS do banco decidindo o que ele alcança. */
const SESSION_KEY = 'auth:session';
const listeners = new Set();

function loadSession() {
  return storage.get(SESSION_KEY, null);
}

function storeSession(s) {
  if (s) storage.set(SESSION_KEY, s);
  else storage.remove(SESSION_KEY);
  listeners.forEach((fn) => { try { fn(s); } catch { /* listener falhou */ } });
}

/** Assina mudanças de sessão (login/logout). Devolve uma função pra desassinar. */
export function onAuthChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function isLoggedIn() {
  const s = loadSession();
  return !!(s && s.access_token);
}

/** Lê `{ id, email, meta, provider }` do JWT (decode local, sem verificar — só pra UI). */
export function currentUser() {
  const s = loadSession();
  if (!s || !s.access_token) return null;
  try {
    const part = s.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(escape(atob(part))));
    return {
      id: payload.sub,
      email: payload.email || '',
      meta: payload.user_metadata || {},
      provider: payload.app_metadata?.provider || 'email'
    };
  } catch {
    return null;
  }
}

/** Inicia login com Google (redirect). O redirectTo precisa estar no allow-list do Supabase. */
export function signInWithGoogle() {
  if (!supabaseConfigured()) return;
  const redirectTo = window.location.origin + window.location.pathname; // sem hash
  window.location.href =
    `${supabaseUrl()}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;
}

/**
 * Cria conta por e-mail/senha (`/auth/v1/signup`). Se o projeto exigir
 * confirmação por e-mail, o Supabase NÃO devolve tokens ainda — devolve
 * `{ confirmed: false }` e o usuário loga depois de clicar no link recebido.
 * Se confirmação automática estiver ligada, já vem sessão pronta.
 */
export async function signUpWithPassword(email, password) {
  if (!supabaseConfigured()) throw new Error('Cadastro indisponível (banco não configurado neste ambiente).');
  const res = await fetch(`${supabaseUrl()}/auth/v1/signup`, {
    method: 'POST',
    headers: { apikey: supabaseAnonKey(), 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(8000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || 'Não foi possível criar a conta.');
  if (data.access_token && data.refresh_token) {
    storeSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
    });
    return { confirmed: true };
  }
  return { confirmed: false };
}

/** Login por e-mail/senha (`/auth/v1/token?grant_type=password`). */
export async function signInWithPassword(email, password) {
  if (!supabaseConfigured()) throw new Error('Login indisponível (banco não configurado neste ambiente).');
  const res = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: supabaseAnonKey(), 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(8000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error_description || data.msg || 'E-mail ou senha inválidos.');
  storeSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
  });
}

/**
 * Atualiza a conta logada (`/auth/v1/user`, PUT — exige o access_token atual).
 * Trocar o e-mail dispara confirmação do Supabase pro endereço novo; a sessão
 * atual não muda até o link ser confirmado. Trocar a senha já vale na hora.
 */
async function updateUser(patch) {
  const token = await getAccessToken();
  if (!token) throw new Error('Sessão expirada. Entre novamente.');
  const res = await fetch(`${supabaseUrl()}/auth/v1/user`, {
    method: 'PUT',
    headers: { apikey: supabaseAnonKey(), authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(patch),
    signal: AbortSignal.timeout(8000)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.msg || data.error_description || data.error || 'Não foi possível atualizar a conta.');
  return data;
}

/** Troca a senha da conta logada. */
export const updatePassword = (password) => updateUser({ password });

/** Troca o e-mail da conta logada (o Supabase manda confirmação pro endereço novo). */
export const updateEmail = (email) => updateUser({ email });

/** Encerra a sessão (revoga no servidor, best-effort, e limpa local). */
export async function signOut() {
  const s = loadSession();
  if (s && s.access_token) {
    try {
      /* Teto curto: revogar no servidor é bônus, sair é o que o operador pediu.
       * Sem timeout, um servidor pendurado deixaria o botão "sair" travado. */
      await fetch(`${supabaseUrl()}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: supabaseAnonKey(), authorization: `Bearer ${s.access_token}` },
        signal: AbortSignal.timeout(4000)
      });
    } catch { /* offline ou pendurado: limpa local mesmo assim */ }
  }
  storeSession(null);
}

/** Devolve um access_token válido (renova se perto de expirar), ou null. */
export async function getAccessToken() {
  const s = loadSession();
  if (!s || !s.refresh_token) return null;
  const now = Math.floor(Date.now() / 1000);
  if (s.access_token && s.expires_at && s.expires_at - 60 > now) return s.access_token;
  try {
    /* Timeout obrigatório aqui: `getAccessToken()` roda ANTES de quase toda
     * operação autenticada. Sem teto, um refresh que pendura pendura junto tudo
     * que depende de dado — e o sintoma é a tela girando, não um erro. */
    const res = await fetch(`${supabaseUrl()}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: supabaseAnonKey(), 'content-type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) { storeSession(null); return null; }
    const data = await res.json();
    storeSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token || s.refresh_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600)
    });
    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Captura a sessão ao voltar do OAuth (tokens no #fragmento). No-op em navegação
 * normal (hash de rota tipo `#/home` não casa). Chamar 1x no boot, ANTES do router.
 * Devolve true se logou agora.
 */
export function handleAuthRedirect() {
  const hash = window.location.hash || '';
  if (!/(?:^|#|&)(access_token|error)=/.test(hash)) return false;

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const expires_in = parseInt(params.get('expires_in') || '3600', 10);

  /* Limpa o hash do OAuth e manda pra home (não deixa token na URL). */
  try { history.replaceState(null, '', window.location.pathname + window.location.search + '#/home'); } catch { /* ok */ }

  if (access_token && refresh_token) {
    storeSession({ access_token, refresh_token, expires_at: Math.floor(Date.now() / 1000) + expires_in });
    return true;
  }
  return false;
}
