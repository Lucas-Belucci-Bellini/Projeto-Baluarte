/**
 * /mural — Mural do Baluarte (rede social leve, issue #187).
 *
 * Um feed onde o operador (e quem mais abrir o site) publica recados. Os posts
 * ficam salvos LOCALMENTE (localStorage) e, se houver GITHUB_TOKEN configurado,
 * também são COMMITADOS no repositório (`mural/posts.json`, via /api/social) —
 * aí viram compartilhados e versionados. Sem backend/banco/login.
 */

import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';

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

export function muralPage() {
  const page = h('div', { className: 'page-mural' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MURAL')),
      h('h1', { className: 'page-header__title' }, '📣 Mural do Baluarte'),
      h('p', { className: 'page-header__description' },
        'Recados da comunidade. Os posts ficam salvos ', h('span', { className: 'u-text-cyan' }, 'no repositório'),
        ' (quando o token está configurado) — compartilhados e versionados.'))
  );

  /* Compositor */
  const nameInput = h('input', { className: 'mural-name', type: 'text', maxlength: '40', placeholder: 'Seu nome', value: storage.get(NAME_KEY, '') });
  nameInput.addEventListener('input', () => storage.set(NAME_KEY, nameInput.value.trim()));
  const textInput = h('textarea', { className: 'mural-text', rows: 2, maxlength: '1000', placeholder: 'Escreva um recado…' });
  const postBtn = h('button', { className: 'btn btn--primary', onclick: publish }, '📣 Publicar');
  textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) publish(); });
  page.appendChild(h('div', { className: 'mural-compose' },
    nameInput,
    h('div', { className: 'mural-compose__row' }, textInput, postBtn)));

  const status = h('div', { className: 'mural-status u-text-muted' }, 'Carregando o mural…');
  const feed = h('div', { className: 'mural-feed' });
  page.append(status, feed);

  function render() {
    const posts = localPosts();
    empty(feed);
    if (!posts.length) { feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, 'Nenhum recado ainda. Seja o primeiro! 📣')); return; }
    posts.forEach((p) => {
      feed.appendChild(h('div', { className: 'mural-post' },
        h('div', { className: 'mural-post__head' },
          h('span', { className: 'mural-post__author' }, p.author || 'Anônimo'),
          h('span', { className: 'mural-post__time u-text-muted' }, when(p.ts))),
        h('div', { className: 'mural-post__text' }, p.text)));
    });
  }

  function publish() {
    const text = textInput.value.trim();
    if (text.length < 1) { toast('Escreva algo', { type: 'warning' }); return; }
    const author = nameInput.value.trim() || 'Operador';
    const post = { id: 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), author, text, ts: Date.now() };
    saveLocal([...localPosts(), post]);
    textInput.value = '';
    render();
    toast('Publicado 📣', { type: 'success' });
    repoPost(post); /* commita no repo (best-effort) */
  }

  /* primeira pintura local + sincroniza com o repo */
  render();
  repoList().then((posts) => {
    if (posts.length) { saveLocal(merge(localPosts(), posts)); render(); }
    status.textContent = repoState === false
      ? '💾 Mural local (defina GITHUB_TOKEN na Vercel para compartilhar — ver docs/MEMORIA-REPO.md).'
      : `🌐 ${localPosts().length} recado(s) · sincronizado com o repositório.`;
  });

  return page;
}
