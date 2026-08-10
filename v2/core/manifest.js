/**
 * Module Manifest — validação do contrato de módulo da V2.
 *
 * Especificação: `docs/v2/V2_MODULE_RULES.md`.
 *
 * ── Por que este é o primeiro código da V2 ──────────────────────────────────
 * A medição da V1 (ver `docs/v2/V2_ARCHITECTURE.md` §1) mostrou que o problema
 * não é acoplamento entre módulos — é que **nenhum lugar declara um módulo**.
 * Uma capacidade existe hoje por presença espalhada: `main.js` registrou,
 * `sidebar.js` listou, `shell.js` deu título, `icons.js` deu ícone. Dez lugares
 * por página, e a duplicação já derivou em 22 labels.
 *
 * O manifesto é a resposta, e o validador vem antes do Registry porque **contrato
 * antes de consumidor**: um Registry desenhado sem o formato fixado inventa o
 * formato por acidente, e aí o formato é o que o Registry precisou, não o que os
 * módulos precisam.
 *
 * ── O que este arquivo NÃO faz, e por quê ───────────────────────────────────
 * Nada aqui olha para mais de um módulo. Colisão de `id`, rota duplicada entre
 * módulos e ciclo de dependência são invariantes **do conjunto**, e quem vê o
 * conjunto é o Registry. Misturar as duas responsabilidades aqui obrigaria o
 * validador a receber um registro inteiro para validar um manifesto — que é
 * exatamente o acoplamento que a V2 existe para não ter (Regra 33: limites
 * claros).
 *
 * ── Erros acumulam ──────────────────────────────────────────────────────────
 * `validar()` devolve TODOS os problemas, não o primeiro. Quem escreve um
 * manifesto quer a lista inteira; parar no primeiro transforma um manifesto com
 * cinco erros em cinco execuções. É a Regra 7 na prática — erro observável é
 * erro que dá para agir sobre.
 */

/** Níveis de estabilidade — os mesmos três que a V1 já usa. */
export const ESTABILIDADES = ['estavel', 'beta', 'experimental'];

/** Classes de dado — o vocabulário do storage da V1, que fica (§8 do plano). */
export const CLASSES = ['publico', 'local', 'sensivel', 'secreto'];

/** Onde um módulo pode rodar. O gate web/app da V1 vira campo do manifesto. */
export const AMBIENTES = ['web', 'app', 'ambos'];

/** Vocabulário de permissões do #423 §9. Declarar ≠ receber. */
export const PERMISSOES = [
  'READ_FILES', 'WRITE_FILES', 'NETWORK',
  'DATABASE', 'SYSTEM_INFO', 'USER_DATA', 'EXECUTION'
];

const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const SEMVER = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;

/** @param {unknown} v */
const ehObjeto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
/** @param {unknown} v */
const ehFuncao = (v) => typeof v === 'function';

/**
 * @typedef {object} Rota
 * @property {string} path
 * @property {() => Promise<unknown>} view import preguiçoso da view
 */

/**
 * @typedef {object} EsquemaStorage
 * @property {string} key       precisa começar com `<id>:`
 * @property {number} version   inteiro ≥ 1
 * @property {string} class     uma de `CLASSES`
 * @property {Function} [migrate] obrigatório quando `version > 1`
 */

/**
 * @typedef {object} Manifesto
 * @property {string} id
 * @property {string} name
 * @property {string} version
 * @property {string} [description]
 * @property {string} [stability]
 * @property {string} [ambiente]
 * @property {string} [icon]
 * @property {Rota[]} [routes]
 * @property {{section?: string|null, order?: number}} [nav]
 * @property {string[]} [dependencies]
 * @property {string[]} [permissions]
 * @property {EsquemaStorage[]} [storage]
 * @property {{emits?: string[], consumes?: string[]}} [events]
 * @property {Record<string, unknown>} [api]
 * @property {number} [apiVersion] versão do CONTRATO oferecido (padrão 1)
 * @property {Record<string, Function>} [lifecycle]
 */

/**
 * Valida um manifesto de módulo isolado.
 *
 * A entrada é `unknown` de propósito, não `Manifesto`: o valor vem de um arquivo
 * que outra pessoa escreveu, e declarar o tipo do que ainda não foi validado
 * seria afirmar justamente o que esta função existe para verificar.
 *
 * @param {unknown} entrada
 * @returns {{ok: boolean, erros: string[]}} `erros` vazio quando `ok`
 */
export function validar(entrada) {
  /** @type {string[]} */
  const erros = [];
  /** @param {string} msg */
  const e = (msg) => erros.push(msg);

  if (!ehObjeto(entrada)) return { ok: false, erros: ['manifesto não é um objeto'] };

  /* Depois do guarda acima é objeto. O cast é para leitura de campo ainda não
   * verificado — cada um é conferido logo abaixo. */
  const m = /** @type {Record<string, any>} */ (entrada);

  /* ── identidade ─────────────────────────────────────────────────────── */
  const id = m.id;
  if (typeof id !== 'string' || !id) e('`id` é obrigatório');
  else if (!KEBAB.test(id)) e(`\`id\` deve ser kebab-case: "${id}"`);

  /* Vazio E ausente dão o mesmo erro de propósito: os 31 casos de "rota
   * registrada sem título" na V1 vieram de ausência, não de nome ruim. */
  if (typeof m.name !== 'string' || !m.name.trim()) e('`name` é obrigatório e não pode ser vazio');

  if (typeof m.version !== 'string' || !SEMVER.test(m.version)) {
    e(`\`version\` deve ser semver: ${JSON.stringify(m.version)}`);
  }

  if (m.stability !== undefined && !ESTABILIDADES.includes(m.stability)) {
    e(`\`stability\` inválida: ${JSON.stringify(m.stability)} (use ${ESTABILIDADES.join(' | ')})`);
  }
  if (m.ambiente !== undefined && !AMBIENTES.includes(m.ambiente)) {
    e(`\`ambiente\` inválido: ${JSON.stringify(m.ambiente)} (use ${AMBIENTES.join(' | ')})`);
  }

  /* ── rotas ──────────────────────────────────────────────────────────── */
  if (m.routes !== undefined) {
    if (!Array.isArray(m.routes)) e('`routes` deve ser array');
    else {
      const vistas = new Set();
      m.routes.forEach((r, i) => {
        if (!ehObjeto(r)) { e(`\`routes[${i}]\` deve ser objeto`); return; }
        if (typeof r.path !== 'string' || !r.path.startsWith('/')) {
          e(`\`routes[${i}].path\` deve começar com "/": ${JSON.stringify(r.path)}`);
        } else if (vistas.has(r.path)) {
          e(`\`routes[${i}].path\` duplicada no módulo: "${r.path}"`);
        } else vistas.add(r.path);

        /* `view` é função porque o carregamento é preguiçoso: quem importa a
         * view no topo do manifesto arrasta o módulo inteiro para o bundle
         * inicial, e aí "módulo removível" vira ficção. */
        if (!ehFuncao(r.view)) e(`\`routes[${i}].view\` deve ser função (import preguiçoso)`);
      });
    }
  }

  /* ── storage ────────────────────────────────────────────────────────── */
  if (m.storage !== undefined) {
    if (!Array.isArray(m.storage)) e('`storage` deve ser array');
    else m.storage.forEach((s, i) => {
      if (!ehObjeto(s)) { e(`\`storage[${i}]\` deve ser objeto`); return; }

      /* O invariante que impede dois módulos de reivindicarem a mesma chave.
       * Sem ele, o segundo a carregar vence — em silêncio, que é o modo de
       * falha que esta arquitetura inteira existe para eliminar. */
      if (typeof s.key !== 'string' || !s.key) e(`\`storage[${i}].key\` é obrigatória`);
      else if (id && !s.key.startsWith(`${id}:`)) {
        e(`\`storage[${i}].key\` deve começar com "${id}:" — é "${s.key}"`);
      }

      if (!Number.isInteger(s.version) || s.version < 1) {
        e(`\`storage[${i}].version\` deve ser inteiro >= 1: ${JSON.stringify(s.version)}`);
      }
      if (!CLASSES.includes(s.class)) {
        e(`\`storage[${i}].class\` inválida: ${JSON.stringify(s.class)} (use ${CLASSES.join(' | ')})`);
      }
      /* A lição das 59 chaves da V1: dado do operador não migra sozinho. */
      if (Number.isInteger(s.version) && s.version > 1 && !ehFuncao(s.migrate)) {
        e(`\`storage[${i}]\` está na versão ${s.version} e não tem \`migrate\` — dado antigo cairia no fallback em silêncio`);
      }
    });
  }

  /* ── eventos ────────────────────────────────────────────────────────── */
  if (m.events !== undefined) {
    if (!ehObjeto(m.events)) e('`events` deve ser objeto');
    else {
      for (const campo of ['emits', 'consumes']) {
        const lista = m.events[campo];
        if (lista === undefined) continue;
        if (!Array.isArray(lista)) { e(`\`events.${campo}\` deve ser array`); continue; }
        lista.forEach((nome, i) => {
          if (typeof nome !== 'string' || !nome) {
            e(`\`events.${campo}[${i}]\` deve ser string não vazia`);
            return;
          }
          /* Só `emits` é cobrado: um módulo não emite em nome de outro, mas
           * consumir evento alheio é justamente o ponto do Event Bus. */
          if (campo === 'emits' && id && !nome.startsWith(`${id}:`)) {
            e(`\`events.emits[${i}]\` deve começar com "${id}:" — é "${nome}"`);
          }
        });
      }
    }
  }

  /* ── dependências e permissões ──────────────────────────────────────── */
  if (m.dependencies !== undefined) {
    if (!Array.isArray(m.dependencies)) e('`dependencies` deve ser array');
    else m.dependencies.forEach((d, i) => {
      if (typeof d !== 'string' || !KEBAB.test(d)) {
        e(`\`dependencies[${i}]\` deve ser id kebab-case: ${JSON.stringify(d)}`);
      } else if (d === id) {
        e('`dependencies` contém o próprio módulo');
      }
    });
  }

  if (m.permissions !== undefined) {
    if (!Array.isArray(m.permissions)) e('`permissions` deve ser array');
    else m.permissions.forEach((p, i) => {
      if (!PERMISSOES.includes(p)) {
        e(`\`permissions[${i}]\` desconhecida: ${JSON.stringify(p)} (use ${PERMISSOES.join(' | ')})`);
      }
    });
  }

  /* ── api e ciclo de vida ────────────────────────────────────────────── */
  if (m.api !== undefined && !ehObjeto(m.api)) e('`api` deve ser objeto');

  /* Versão de api sem api é declaração órfã — quase sempre sinal de que alguém
   * removeu os métodos e esqueceu o resto. */
  if (m.apiVersion !== undefined) {
    if (!Number.isInteger(m.apiVersion) || m.apiVersion < 1) {
      e(`\`apiVersion\` deve ser inteiro >= 1: ${JSON.stringify(m.apiVersion)}`);
    } else if (!ehObjeto(m.api) || Object.keys(m.api).length === 0) {
      e('`apiVersion` declarada sem `api` — versão de contrato que não existe');
    }
  }

  if (m.lifecycle !== undefined) {
    if (!ehObjeto(m.lifecycle)) e('`lifecycle` deve ser objeto');
    else for (const fase of ['init', 'start', 'stop', 'dispose']) {
      if (m.lifecycle[fase] !== undefined && !ehFuncao(m.lifecycle[fase])) {
        e(`\`lifecycle.${fase}\` deve ser função`);
      }
    }
  }

  if (m.nav !== undefined) {
    if (!ehObjeto(m.nav)) e('`nav` deve ser objeto');
    else if (m.nav.order !== undefined && typeof m.nav.order !== 'number') {
      e('`nav.order` deve ser número');
    }
  }

  return { ok: erros.length === 0, erros };
}

/**
 * Preenche os padrões, para o resto do Core não repetir `?? 'experimental'` em
 * toda leitura. Assume manifesto já validado.
 *
 * Padrão de `stability` é **experimental**, não estável: o mesmo raciocínio do
 * deny-by-default das permissões da V1 — quem não declarou não recebe a
 * promessa mais forte por omissão.
 *
 * @param {Manifesto} m manifesto já validado
 * @returns {Required<Pick<Manifesto, 'stability'|'ambiente'|'description'|'icon'|'routes'|'dependencies'|'permissions'|'storage'>> & Manifesto & {events: {emits: string[], consumes: string[]}, nav: {section: string|null, order: number}, api: Record<string, unknown>, lifecycle: Record<string, Function>}}
 */
export function normalizar(m) {
  return {
    stability: 'experimental',
    ambiente: 'ambos',
    description: '',
    icon: '',
    routes: [],
    dependencies: [],
    permissions: [],
    storage: [],
    ...m,
    events: { emits: [], consumes: [], ...(m.events || {}) },
    nav: { section: null, order: 0, ...(m.nav || {}) },
    api: m.api || {},
    lifecycle: m.lifecycle || {}
  };
}
