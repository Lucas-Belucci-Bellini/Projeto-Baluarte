/**
 * SPA Router com hash-based routing (#/path).
 * Sem dependências, sem reload, simples.
 *
 * Uso:
 *   router.register('/home', () => homePage());
 *   router.register('/perfil/:id', ({ id }) => profile(id));
 *   router.start();
 *   router.navigate('/home');
 *
 * A lista de rotas é também o registro central do shell: `list()` e
 * `describe()` permitem que busca/sidebar/diagnóstico consumam a mesma fonte,
 * sem manter uma segunda lista manual de páginas.
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
    ...compile(pattern)
  });
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

function decodeParam(value, key, path) {
  try {
    return decodeURIComponent(value);
  } catch (err) {
    const error = new Error(`Parâmetro de rota inválido (${key}) em ${path}`);
    error.cause = err;
    throw error;
  }
}

/* Acha a PRIMEIRA rota cujo regex casa com o path e extrai os params
 * nomeados (decodificando %20 etc.). Retorna null se nada casar. */
function match(path) {
  for (const route of routes) {
    const m = route.regex.exec(path);
    if (m) {
      const params = {};
      route.keys.forEach((k, i) => (params[k] = decodeParam(m[i + 1], k, path)));
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
            /* `path` vem de `location.hash`: fora do primeiro argumento do
             * console, senão vira format string controlada de fora. */
            console.error('[router] erro ao carregar rota:', { rota: path }, err);
            if (currentMatch === token) bus.emit('route:error', { path, error: err, route: found.route });
          });
      } else {
        bus.emit('route:change', { ...currentMatch, view });
      }
    } catch (err) {
      console.error('[router] erro ao renderizar rota:', { rota: path }, err);
      if (currentMatch === token) bus.emit('route:error', { path, error: err, route: found.route });
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

  /* `DOMContentLoaded` só é esperado se o documento AINDA estiver sendo lido.
   *
   * Antes o listener era registrado sempre — e como `main.js` é
   * `<script type="module">` (portanto deferido), ele roda ANTES do evento.
   * Resultado: a rota inicial resolvia duas vezes em toda carga fria, a página
   * era construída duas vezes e só a segunda ia para o DOM.
   *
   * Para a maioria das telas isso só desperdiçava trabalho. Para as que guardam
   * referência de elemento em variável de módulo, quebrava a tela: a variável
   * ficava apontando para a cópia ÓRFÃ, e a que o usuário via não respondia a
   * nada. Foi o que aconteceu com `/calc-cientifica` — abrir o link direto, dar
   * F5 ou usar um favorito entregava uma calculadora morta, sem erro no
   * console. Entrando pela navegação interna funcionava, que é o que escondeu
   * o defeito o tempo todo (e o que faz o vigia de rotas não pegar: a tela
   * RENDERIZA, ela só não obedece). */
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', resolve, { once: true });
  }

  if (!window.location.hash || window.location.hash === '#') {
    navigate(initial, { replace: true });
  } else {
    resolve();
  }
}

function current() {
  return currentMatch;
}

/* `list()` devolve os padrões registrados, na ordem de registro. Existe pra
 * quem precisa enxergar o site inteiro sem manter uma segunda lista — a
 * paleta de comandos indexa daqui, então rota nova aparece na busca sozinha.
 * Rotas com parâmetro (`/perfil/:id`) ficam de fora: elas não são um destino
 * navegável por si. */
const list = () => routes.map((r) => r.pattern).filter((p) => !p.includes(':'));

/* Registro consultável para a V2. Não expõe handlers, regex ou referências
 * internas: UI, busca e diagnóstico recebem apenas dados serializáveis. */
const describe = () => routes.map((route) => ({
  pattern: route.pattern,
  meta: { ...route.meta },
  parameterized: route.keys.length > 0
}));

const find = (pattern) => {
  const route = routes.find((item) => item.pattern === pattern);
  if (!route) return null;
  return {
    pattern: route.pattern,
    meta: { ...route.meta },
    parameterized: route.keys.length > 0
  };
};

export const router = {
  register,
  setNotFound,
  navigate,
  start,
  current,
  list,
  describe,
  find,
  count: () => routes.length
};
