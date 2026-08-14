/**
 * SPA Router com hash-based routing.
 *
 * A implementação canônica agora é TypeScript. `router.js` permanece como
 * wrapper de compatibilidade até os consumidores da V1 migrarem seus imports.
 */

import { bus } from './events.js';

export type RouteQuery = Record<string, string>;
export type RouteParams = Record<string, string>;
export type RouteView = unknown;
export type RouteMeta = Record<string, unknown>;

export interface RouteArgs {
  query: RouteQuery;
  [key: string]: unknown;
}

export type RouteHandler = (args: RouteArgs) => RouteView | Promise<RouteView>;

export interface RouteDefinition {
  pattern: string;
  handler: RouteHandler;
  meta: RouteMeta;
  regex: RegExp;
  keys: string[];
}

export interface RouteMatch {
  path: string;
  query: RouteQuery;
  params: RouteParams;
  route: RouteDefinition;
}

export interface RouteDescription {
  pattern: string;
  meta: RouteMeta;
  parameterized: boolean;
}

export interface NavigateOptions {
  replace?: boolean;
}

export interface Router {
  register(pattern: string, handler: RouteHandler, meta?: RouteMeta): void;
  setNotFound(handler: (path: string) => RouteView): void;
  navigate(path: string, options?: NavigateOptions): void;
  start(initial?: string): void;
  current(): RouteMatch | null;
  list(): string[];
  describe(): RouteDescription[];
  find(pattern: string): RouteDescription | null;
  count(): number;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'then' in value &&
      typeof value.then === 'function',
  );
}

export function createRouter(): Router {
  const routes: RouteDefinition[] = [];
  let currentMatch: RouteMatch | null = null;
  let started = false;
  let notFoundHandler: ((path: string) => RouteView) | null = null;

  function compile(pattern: string): { regex: RegExp; keys: string[] } {
    const keys: string[] = [];
    const regex = new RegExp(
      '^' +
        pattern.replace(/:([\w]+)/g, (_match, key: string) => {
          keys.push(key);
          return '([^/]+)';
        }) +
        '/?$',
    );
    return { regex, keys };
  }

  function register(pattern: string, handler: RouteHandler, meta: RouteMeta = {}): void {
    if (typeof pattern !== 'string' || !pattern.startsWith('/')) {
      throw new TypeError('router.register(): pattern deve começar com /');
    }
    if (typeof handler !== 'function') {
      throw new TypeError(`router.register(${pattern}): handler deve ser uma função`);
    }
    if (routes.some((route) => route.pattern === pattern)) {
      throw new Error(`router.register(): rota duplicada: ${pattern}`);
    }

    routes.push({
      pattern,
      handler,
      meta: { ...meta },
      ...compile(pattern),
    });
  }

  function setNotFound(handler: (path: string) => RouteView): void {
    notFoundHandler = handler;
  }

  function parseHash(): { path: string; query: RouteQuery } {
    const raw = window.location.hash.slice(1) || '/';
    const [path, queryString] = raw.split('?');
    const query = Object.fromEntries(
      new URLSearchParams(queryString || '').entries(),
    );
    return { path: path || '/', query };
  }

  function decodeParam(value: string, key: string, path: string): string {
    try {
      return decodeURIComponent(value);
    } catch (cause) {
      throw new Error(`Parâmetro de rota inválido (${key}) em ${path}`, { cause });
    }
  }

  function match(path: string): { route: RouteDefinition; params: RouteParams } | null {
    for (const route of routes) {
      const result = route.regex.exec(path);
      if (result) {
        const params: RouteParams = {};
        route.keys.forEach((key, index) => {
          params[key] = decodeParam(result[index + 1], key, path);
        });
        return { route, params };
      }
    }
    return null;
  }

  function routePayload(matchResult: RouteMatch): RouteArgs {
    return { ...matchResult.params, query: matchResult.query };
  }

  function resolve(): void {
    const { path, query } = parseHash();
    const found = match(path);

    if (!found) {
      const view = notFoundHandler ? notFoundHandler(path) : null;
      bus.emit('route:notfound', { path, view });
      return;
    }

    currentMatch = { path, query, params: found.params, route: found.route };
    bus.emit('route:before', currentMatch);
    const token = currentMatch;

    try {
      const view = found.route.handler(routePayload(token));
      if (isPromiseLike(view)) {
        Promise.resolve(view)
          .then((resolved) => {
            if (currentMatch !== token) return;
            bus.emit('route:change', { ...token, view: resolved });
          })
          .catch((error: unknown) => {
            console.error('[router] erro ao carregar rota:', { rota: path }, error);
            if (currentMatch === token) {
              bus.emit('route:error', { path, error, route: found.route });
            }
          });
      } else {
        bus.emit('route:change', { ...token, view });
      }
    } catch (error) {
      console.error('[router] erro ao renderizar rota:', { rota: path }, error);
      if (currentMatch === token) {
        bus.emit('route:error', { path, error, route: found.route });
      }
    }
  }

  function navigate(path: string, options: NavigateOptions = {}): void {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const target = `#${normalizedPath}`;
    if (window.location.hash === target) {
      resolve();
      return;
    }
    if (options.replace) {
      window.history.replaceState(null, '', target);
      resolve();
    } else {
      window.location.hash = target;
    }
  }

  function start(initial = '/home'): void {
    if (started) return;
    started = true;
    window.addEventListener('hashchange', resolve);

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', resolve, { once: true });
    }

    if (!window.location.hash || window.location.hash === '#') {
      navigate(initial, { replace: true });
    } else {
      resolve();
    }
  }

  function current(): RouteMatch | null {
    return currentMatch;
  }

  function list(): string[] {
    return routes
      .map((route) => route.pattern)
      .filter((pattern) => !pattern.includes(':'));
  }

  function describe(): RouteDescription[] {
    return routes.map((route) => ({
      pattern: route.pattern,
      meta: { ...route.meta },
      parameterized: route.keys.length > 0,
    }));
  }

  function find(pattern: string): RouteDescription | null {
    const route = routes.find((item) => item.pattern === pattern);
    if (!route) return null;
    return {
      pattern: route.pattern,
      meta: { ...route.meta },
      parameterized: route.keys.length > 0,
    };
  }

  return {
    register,
    setNotFound,
    navigate,
    start,
    current,
    list,
    describe,
    find,
    count: () => routes.length,
  };
}

export const router = createRouter();
