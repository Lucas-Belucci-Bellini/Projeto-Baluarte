/**
 * SPA Router com hash-based routing (#/path).
 * Sem dependências, sem reload, simples.
 *
 * Uso:
 *   router.register('/home', () => homePage());
 *   router.register('/perfil/:id', ({ id }) => profile(id));
 *   router.start();
 *   router.navigate('/home');
 */

import { bus } from './events.js';

const routes = [];
let currentMatch = null;
let started = false;
let notFoundHandler = null;

/* Converte um padrão de rota num regex + lista de nomes de parâmetro.
 * Ex.: '/perfil/:id' -> regex /^\/perfil\/([^/]+)\/?$/ e keys=['id'].
 * Cada ':nome' vira um grupo de captura ([^/]+); a '/' final é opcional. */
function compile(pattern) {
  const keys = [];
  const regex = new RegExp(
    '^' +
      pattern.replace(/:([\w]+)/g, (_, k) => {
        keys.push(k);
        return '([^/]+)';
      }) +
      '/?$'
  );
  return { regex, keys };
}

function register(pattern, handler, meta = {}) {
  routes.push({ pattern, handler, meta, ...compile(pattern) });
}

function setNotFound(handler) {
  notFoundHandler = handler;
}

function parseHash() {
  const raw = window.location.hash.slice(1) || '/';
  const [path, queryStr] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryStr || '').entries());
  return { path: path || '/', query };
}

/* Acha a PRIMEIRA rota cujo regex casa com o path e extrai os params
 * nomeados (decodificando %20 etc.). Retorna null se nada casar. */
function match(path) {
  for (const route of routes) {
    const m = route.regex.exec(path);
    if (m) {
      const params = {};
      route.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      return { route, params };
    }
  }
  return null;
}

function resolve() {
  const { path, query } = parseHash();
  const found = match(path);

  if (found) {
    currentMatch = { path, query, params: found.params, route: found.route };
    bus.emit('route:before', currentMatch);
    const token = currentMatch;   // detecta navegação concorrente durante await
    try {
      const view = found.route.handler({ ...found.params, query });
      /* Handlers podem retornar um Promise (rotas lazy via import dinâmico).
       * Resolvemos antes de emitir; ignoramos se o usuário já navegou p/ outra. */
      if (view && typeof view.then === 'function') {
        view
          .then((resolved) => {
            if (currentMatch !== token) return;   // navegação obsoleta
            bus.emit('route:change', { ...currentMatch, view: resolved });
          })
          .catch((err) => {
            console.error(`[router] Erro ao carregar "${path}":`, err);
            bus.emit('route:error', { path, error: err });
          });
      } else {
        bus.emit('route:change', { ...currentMatch, view });
      }
    } catch (err) {
      console.error(`[router] Erro ao renderizar "${path}":`, err);
      bus.emit('route:error', { path, error: err });
    }
  } else {
    const view = notFoundHandler ? notFoundHandler(path) : null;
    bus.emit('route:notfound', { path, view });
  }
}

function navigate(path, opts = {}) {
  if (!path.startsWith('/')) path = '/' + path;
  const target = '#' + path;
  if (window.location.hash === target) {
    resolve();
    return;
  }
  if (opts.replace) {
    window.history.replaceState(null, '', target);
    resolve();
  } else {
    window.location.hash = target;
  }
}

function start(initial = '/home') {
  if (started) return;
  started = true;
  window.addEventListener('hashchange', resolve);
  window.addEventListener('DOMContentLoaded', resolve);

  if (!window.location.hash || window.location.hash === '#') {
    navigate(initial, { replace: true });
  } else {
    resolve();
  }
}

function current() {
  return currentMatch;
}

export const router = { register, setNotFound, navigate, start, current, count: () => routes.length };
