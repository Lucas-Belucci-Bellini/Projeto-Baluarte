/**
 * /mural — Mural do Baluarte.
 *
 * Usa leitura pública do banco oficial quando Supabase está configurado e
 * mantém o fallback local com sincronização best-effort no repositório.
 */

import '../styles/mural.css';
import { h, empty, randHex } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { supabaseConfigured, dbSelect } from '../core/supabase.js';

const POSTS_KEY = 'mural:posts';
const NAME_KEY = 'mural:author';
const API = '/api/social';

type RepoState = boolean | null;

interface MuralPost {
  readonly id: string;
  readonly author: string;
  readonly text: string;
  readonly ts: number;
}

interface RemoteMuralPost {
  readonly id?: string;
  readonly author: string;
  readonly text: string;
  readonly created_at: string;
}

interface RepoResponse {
  readonly ok?: unknown;
  readonly error?: unknown;
  readonly posts?: unknown;
}

let repoState: RepoState = null;
let queue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isMuralPost(value: unknown): value is MuralPost {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.author === 'string'
    && typeof value.text === 'string'
    && typeof value.ts === 'number';
}

function isRemoteMuralPost(value: unknown): value is RemoteMuralPost {
  return isRecord(value)
    && (value.id === undefined || typeof value.id === 'string')
    && typeof value.author === 'string'
    && typeof value.text === 'string'
    && typeof value.created_at === 'string';
}

function localPosts(): MuralPost[] {
  return storage.get<MuralPost[]>(POSTS_KEY, []).filter(isMuralPost);
}

function saveLocal(posts: readonly MuralPost[]): boolean {
  return storage.set(POSTS_KEY, posts.slice(-500));
}

function noToken(data: RepoResponse): boolean {
  return data.ok === false
    && typeof data.error === 'string'
    && /GITHUB_TOKEN/i.test(data.error);
}

async function readJson(response: Response): Promise<RepoResponse> {
  const value: unknown = await response.json();
  return isRecord(value) ? value as RepoResponse : {};
}

function repoPost(post: MuralPost): Promise<void> {
  if (repoState === false) return Promise.resolve();
  queue = queue.then(async () => {
    if (repoState === false) return;
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'post', post }),
      });
      const data = await readJson(response);
      if (data.ok === true) repoState = true;
      else if (noToken(data)) repoState = false;
    } catch {
      // A repository sync is best-effort; the local post remains available.
    }
  });
  return queue;
}

async function repoList(): Promise<MuralPost[]> {
  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    });
    const data = await readJson(response);
    if (data.ok === true) {
      repoState = true;
      return Array.isArray(data.posts) ? data.posts.filter(isMuralPost) : [];
    }
    if (noToken(data)) repoState = false;
    return [];
  } catch {
    return [];
  }
}

function merge(first: readonly MuralPost[], second: readonly MuralPost[]): MuralPost[] {
  const seen = new Set<string>();
  const all: MuralPost[] = [];
  for (const post of [...first, ...second]) {
    const key = post.id || `${post.ts}|${post.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(post);
  }
  return all.sort((left, right) => (right.ts || 0) - (left.ts || 0));
}

function when(timestamp: number): string {
  const elapsed = Math.max(0, Date.now() - (timestamp || 0));
  const minutes = Math.floor(elapsed / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  try {
    return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

function postElement(author: string, text: string, timestamp: number): HTMLDivElement {
  return h('div', { className: 'mural-post' },
    h('div', { className: 'mural-post__head' },
      h('span', { className: 'mural-post__author' }, author || 'Anônimo'),
      h('span', { className: 'mural-post__time u-text-muted' }, when(timestamp))),
    h('div', { className: 'mural-post__text' }, text),
  );
}

function remoteToPost(value: RemoteMuralPost): MuralPost {
  return {
    id: value.id ?? `remote-${value.created_at}-${value.text}`,
    author: value.author,
    text: value.text,
    ts: new Date(value.created_at).getTime() || 0,
  };
}

export function muralPage(): HTMLDivElement {
  const page = h('div', { className: 'page-mural' });
  const databaseMode = supabaseConfigured();
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MURAL')),
      h('h1', { className: 'page-header__title' }, '📣 Mural do Baluarte'),
      h('p', { className: 'page-header__description' }, databaseMode
        ? ['Recados do operador, no ', h('span', { className: 'u-text-cyan' }, 'banco oficial'), ' (Supabase). Leitura pública, publicação restrita ao dono.']
        : ['Recados da comunidade. Os posts ficam salvos ', h('span', { className: 'u-text-cyan' }, 'no repositório'), ' (quando o token está configurado) — compartilhados e versionados.']),
    ),
  );
  const status = h('div', { className: 'mural-status u-text-muted' }, 'Carregando o mural…');
  const feed = h('div', { className: 'mural-feed' });
  if (databaseMode) mountDatabaseMode(page, status, feed);
  else mountLocalMode(page, status, feed);
  return page;
}

function mountDatabaseMode(page: HTMLDivElement, status: HTMLDivElement, feed: HTMLDivElement): void {
  page.appendChild(h('div', { className: 'mural-compose mural-compose--locked' },
    h('span', { className: 'u-text-muted' }, '🔒 Publicação restrita ao operador — login do dono chega no próximo passo.')));
  page.append(status, feed);
  const render = (posts: readonly MuralPost[]): void => {
    empty(feed);
    if (!posts.length) {
      feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, 'Nenhum recado ainda. 📣'));
      return;
    }
    posts.forEach((post) => feed.appendChild(postElement(post.author, post.text, post.ts)));
  };
  dbSelect('mural_posts', 'select=id,author,text,created_at&order=created_at.desc&limit=200')
    .then((value: unknown) => {
      const posts = Array.isArray(value)
        ? value.filter(isRemoteMuralPost).map(remoteToPost)
        : [];
      render(posts);
      status.textContent = `🛡️ Banco oficial (Supabase) · ${posts.length} recado(s).`;
    })
    .catch((error: unknown) => {
      status.textContent = '⚠️ Não consegui ler o mural do banco agora. Tente recarregar.';
      empty(feed);
      const message = isRecord(error) && typeof error.message === 'string' ? error.message : String(error);
      feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, message));
    });
}

function mountLocalMode(page: HTMLDivElement, status: HTMLDivElement, feed: HTMLDivElement): void {
  const nameInput = h('input', {
    className: 'mural-name',
    type: 'text',
    maxlength: '40',
    placeholder: 'Seu nome',
    value: storage.get<string>(NAME_KEY, ''),
  });
  nameInput.addEventListener('input', () => storage.set(NAME_KEY, nameInput.value.trim()));
  const textInput = h('textarea', {
    className: 'mural-text', rows: 2, maxlength: '1000', placeholder: 'Escreva um recado…',
  });
  const render = (): void => {
    const posts = localPosts();
    empty(feed);
    if (!posts.length) {
      feed.appendChild(h('div', { className: 'mural-empty u-text-muted' }, 'Nenhum recado ainda. Seja o primeiro! 📣'));
      return;
    }
    posts.forEach((post) => feed.appendChild(postElement(post.author, post.text, post.ts)));
  };
  const publish = (): void => {
    const text = textInput.value.trim();
    if (text.length < 1) {
      toast('Escreva algo', { type: 'warning' });
      return;
    }
    const author = nameInput.value.trim() || 'Operador';
    const post: MuralPost = {
      id: `p${Date.now().toString(36)}${randHex(3)}`,
      author,
      text,
      ts: Date.now(),
    };
    saveLocal([...localPosts(), post]);
    textInput.value = '';
    render();
    toast('Publicado 📣', { type: 'success' });
    void repoPost(post);
  };
  const publishButton = h('button', { className: 'btn btn--primary', onclick: publish }, '📣 Publicar');
  textInput.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) publish();
  });
  page.appendChild(h('div', { className: 'mural-compose' },
    nameInput,
    h('div', { className: 'mural-compose__row' }, textInput, publishButton)));
  page.append(status, feed);
  render();
  void repoList().then((posts) => {
    if (posts.length) {
      saveLocal(merge(localPosts(), posts));
      render();
    }
    status.textContent = repoState === false
      ? '💾 Mural local (defina GITHUB_TOKEN na Vercel para compartilhar — ver docs/MEMORIA-REPO.md).'
      : `🌐 ${localPosts().length} recado(s) · sincronizado com o repositório.`;
  });
}
