/**
 * /mural — Mural do Baluarte (rede social leve, issue #187).
 *
 * Dois modos:
 *  • BANCO OFICIAL (Supabase) — quando configurado: lê os posts do banco
 *    (leitura pública via RLS). A publicação é restrita ao operador e passa a
 *    exigir login do dono (chega no próximo passo). Cross-device e durável.
 *  • LOCAL (fallback) — sem Supabase: posts no localStorage + commit best-effort
 *    no repositório (`/api/social`), como antes. Garante zero regressão.
 */

import '../styles/mural.css';
import { h, empty, randHex } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { supabaseConfigured, dbSelect, dbInsert, requestOtp, verifyOtp, getAccessToken, signOut, isOwner } from '../core/supabase.js';

const POSTS_KEY = 'mural:posts';
const NAME_KEY = 'mural:author';
const API = '/api/social';

let repoState = null;   // null=desconhecido, true=ativo, false=sem token
let queue = Promise.resolve();

const localPosts = () => storage.get(POSTS_KEY, []);
const saveLocal = (arr) => storage.set(POSTS_KEY, arr.slice(-500));
const noToken = (d) => d && d.ok === false && typeof d.error === 'string' && /GITHUB_TOKEN/i.test(d.error);

function repoPost(post) {
  if (repoState === false) return Promise.resolve();
  queue = queue.then(async () => {
    if (repoState === false) return;
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'post', post }) });
      const d = await res.json();
      if (d.ok) repoState = true; else if (noToken(d)) repoState = false;
    } catch { /* best-effort */ }
  });
  return queue;
}
async function repoList() {
  try {
    const res = await fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'list' }) });
    const d = await res.json();
    if (d.ok) { repoState = true; return Array.isArray(d.posts) ? d.posts : []; }
    if (noToken(d)) repoState = false;
    return [];
  } catch { return []; }
}

function merge(a, b) {
  const seen = new Set(); const all = [];
  for (const p of [...a, ...b]) {
    const k = p.id || (p.ts + '|' + p.text);
    if (seen.has(k)) continue; seen.add(k); all.push(p);
  }
  return all.sort((x, y) => (y.ts || 0) - (x.ts || 0));
}

function when(ts) {
  const d = Math.max(0, Date.now() - (ts || 0));
  const min = Math.floor(d / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return min + ' min';
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + 'h';
  try { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); } catch { return ''; }
}

function postEl(author, text, ts) {
  return h('div', { className: 'mural-post' },
    h('div', { className: 'mural-post__head' },
      h('span', { className: 'mural-post__author' }, author || 'Anônimo'),
      h('span', { className: 'mural-post__time u-text-muted' }, when(ts))),
    h('div', { className: 'mural-post__text' }, text));
}

export function muralPage() {
  const page = h('div', { className: 'page-mural' });
  const dbMode = supabaseConfigured();

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MURAL')),
      h('h1', { className: 'page-header__title' }, '📣 Mural do Baluarte'),
      h('p', { className: 'page-header__description' }, dbMode
        ? ['Recados do operador, no ', h('span', { className: 'u-text-cyan' }, 'banco oficial'), ' (Supabase). Leitura pública, publicação restrita ao dono.']
        : ['Recados da comunidade. Os posts ficam salvos ', h('span', { className: 'u-text-cyan' }, 'no repositório'), ' (quando o token está configurado) — compartilhados e versionados.']))
  );

  const status = h('div', { className: 'mural-status u-text-muted' }, 'Carregando o mural…');
  const feed = h('div', { className: 'mural-feed' });

  if (dbMode) {
    mountDbMode(page, status, feed);
  } else {
    mountLocalMode(page, status, feed);
  }

  return page;
}

/* ---- Modo BANCO OFICIAL (Supabase) ------------------------------------- */
function mountDbMode(page, status, feed) {
  const composeWrap = h('div');
  page.append(composeWrap, status, feed);

  function loadFeed() {
    dbSelect('mural_posts', 'select=id,author,text,created_at&order=created_at.desc&limit=200')
      .then((posts) => {
        const list = Array.isArray(posts) ? posts : [];
        empty(feed);
        if (!list.length) feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, 'Nenhum recado ainda. 📣'));
        else list.forEach((p) => feed.appendChild(postEl(p.author, p.text, new Date(p.created_at).getTime())));
        status.textContent = `🛡️ Banco oficial (Supabase) · ${list.length} recado(s).`;
      })
      .catch((err) => {
        status.textContent = '⚠️ Não consegui ler o mural do banco agora. Tente recarregar.';
        empty(feed);
        feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, String((err && err.message) || err)));
      });
  }

  function renderCompose() {
    empty(composeWrap);
    if (isOwner()) composeWrap.appendChild(ownerComposer());
    else composeWrap.appendChild(loginBox());
  }

  function ownerComposer() {
    const nameInput = h('input', { className: 'mural-name', type: 'text', maxlength: '40', placeholder: 'Seu nome', value: storage.get(NAME_KEY, 'Operador') });
    nameInput.addEventListener('input', () => storage.set(NAME_KEY, nameInput.value.trim()));
    const textInput = h('textarea', { className: 'mural-text', rows: 2, maxlength: '1000', placeholder: 'Escreva um recado…' });
    const postBtn = h('button', { className: 'btn btn--primary', onclick: publish }, '📣 Publicar');
    textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) publish(); });
    const outBtn = h('button', { className: 'btn btn--ghost btn--sm', onclick: () => { signOut(); renderCompose(); toast('Sessão encerrada'); } }, 'Sair');

    async function publish() {
      const text = textInput.value.trim();
      if (text.length < 1) { toast('Escreva algo', { type: 'warning' }); return; }
      const author = nameInput.value.trim() || 'Operador';
      postBtn.disabled = true;
      try {
        const token = await getAccessToken();
        if (!token) { toast('Faça login de novo', { type: 'warning' }); signOut(); renderCompose(); return; }
        await dbInsert('mural_posts', { author, text }, token);
        textInput.value = '';
        toast('Publicado 📣', { type: 'success' });
        loadFeed();
      } catch (err) {
        if (err && err.status === 401) { toast('Sessão expirada — entre de novo', { type: 'error' }); signOut(); renderCompose(); }
        else toast('Falhou: ' + ((err && err.message) || err), { type: 'error' });
      } finally { postBtn.disabled = false; }
    }

    return h('div', { className: 'mural-compose' },
      h('div', { className: 'mural-compose__owner u-text-muted' }, h('span', null, '🛡️ Logado como operador'), outBtn),
      nameInput,
      h('div', { className: 'mural-compose__row' }, textInput, postBtn));
  }

  function loginBox() {
    const box = h('div', { className: 'mural-compose mural-compose--login' });
    const emailInput = h('input', { className: 'mural-name', type: 'email', placeholder: 'e-mail do operador' });
    const sendBtn = h('button', { className: 'btn btn--primary', onclick: sendCode }, 'Enviar código');
    box.append(
      h('span', { className: 'u-text-muted' }, '🔒 Login do operador pra publicar:'),
      h('div', { className: 'mural-compose__row' }, emailInput, sendBtn));

    async function sendCode() {
      const email = emailInput.value.trim();
      if (!email) { toast('Informe o e-mail', { type: 'warning' }); return; }
      sendBtn.disabled = true;
      try {
        await requestOtp(email);
        toast('Código enviado pro e-mail 📧', { type: 'success' });
        empty(box);
        const codeInput = h('input', { className: 'mural-name', type: 'text', inputmode: 'numeric', maxlength: '8', placeholder: 'código de 6 dígitos' });
        const verifyBtn = h('button', { className: 'btn btn--primary', onclick: doVerify }, 'Entrar');
        codeInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doVerify(); });
        box.append(
          h('span', { className: 'u-text-muted' }, `📧 Código enviado pra ${email}. Cole abaixo:`),
          h('div', { className: 'mural-compose__row' }, codeInput, verifyBtn));
        codeInput.focus();

        async function doVerify() {
          const code = codeInput.value.trim();
          if (!code) { toast('Cole o código', { type: 'warning' }); return; }
          verifyBtn.disabled = true;
          try {
            await verifyOtp(email, code);
            toast('Bem-vindo, operador 🛡️', { type: 'success' });
            renderCompose();
          } catch { toast('Código inválido ou expirado', { type: 'error' }); verifyBtn.disabled = false; }
        }
      } catch (err) {
        toast('Não consegui enviar: ' + ((err && err.message) || err), { type: 'error' });
        sendBtn.disabled = false;
      }
    }

    return box;
  }

  renderCompose();
  loadFeed();
}

/* ---- Modo LOCAL (fallback: localStorage + repo) ------------------------ */
function mountLocalMode(page, status, feed) {
  const nameInput = h('input', { className: 'mural-name', type: 'text', maxlength: '40', placeholder: 'Seu nome', value: storage.get(NAME_KEY, '') });
  nameInput.addEventListener('input', () => storage.set(NAME_KEY, nameInput.value.trim()));
  const textInput = h('textarea', { className: 'mural-text', rows: 2, maxlength: '1000', placeholder: 'Escreva um recado…' });
  const postBtn = h('button', { className: 'btn btn--primary', onclick: publish }, '📣 Publicar');
  textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) publish(); });
  page.appendChild(h('div', { className: 'mural-compose' },
    nameInput,
    h('div', { className: 'mural-compose__row' }, textInput, postBtn)));
  page.append(status, feed);

  function render() {
    const posts = localPosts();
    empty(feed);
    if (!posts.length) { feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, 'Nenhum recado ainda. Seja o primeiro! 📣')); return; }
    posts.forEach((p) => feed.appendChild(postEl(p.author, p.text, p.ts)));
  }

  function publish() {
    const text = textInput.value.trim();
    if (text.length < 1) { toast('Escreva algo', { type: 'warning' }); return; }
    const author = nameInput.value.trim() || 'Operador';
    const post = { id: 'p' + Date.now().toString(36) + randHex(3), author, text, ts: Date.now() };
    saveLocal([...localPosts(), post]);
    textInput.value = '';
    render();
    toast('Publicado 📣', { type: 'success' });
    repoPost(post);
  }

  render();
  repoList().then((posts) => {
    if (posts.length) { saveLocal(merge(localPosts(), posts)); render(); }
    status.textContent = repoState === false
      ? '💾 Mural local (defina GITHUB_TOKEN na Vercel para compartilhar — ver docs/MEMORIA-REPO.md).'
      : `🌐 ${localPosts().length} recado(s) · sincronizado com o repositório.`;
  });
}
