/**
 * Contexto do módulo — a peça que torna "permissão mínima" executável.
 *
 * ── O problema que isto resolve ─────────────────────────────────────────────
 * Na V1, um módulo pega o que quiser importando: `import { storage } from
 * '../core/storage.js'` dá acesso às 72 chaves, incluindo o cofre de API. A
 * declaração de permissão no manifesto seria **retórica** se o módulo pudesse
 * contornar por import — e foi exatamente assim que o JARVIS passou a escrever
 * em `editor:state` (ver `v2/modules/editor/module.js`).
 *
 * Aqui o módulo **não importa capacidades: ele as recebe**. O `init(ctx)` chega
 * com um contexto já recortado pelo manifesto — o storage só enxerga as chaves
 * declaradas, o log já vem etiquetado, e o que não foi declarado simplesmente
 * não está no objeto.
 *
 * É a Regra 8 (não confiar em estado global) e a Regra 11 (permissão mínima)
 * como mecânica em vez de disciplina. Disciplina depende de todo mundo lembrar;
 * mecânica não depende de ninguém.
 *
 * ── O limite honesto disto ──────────────────────────────────────────────────
 * Em JavaScript, um módulo determinado ainda consegue importar o storage global
 * e furar tudo. Isto **não é sandbox** — é a diferença entre o caminho errado
 * ser impossível e ser visivelmente errado. Um `import` de `core/storage.js`
 * dentro de um módulo salta aos olhos em revisão; um `storage.set` disfarçado
 * no meio de 900 linhas, não. Sandbox de verdade exigiria outro runtime, e isso
 * é V4 (segurança), não V2 — Regra 17.
 */

import { criarLog } from './log.js';
import { PERMISSOES } from './manifest.js';

/**
 * Erro de permissão. Tipo próprio para o chamador poder distinguir "não pode"
 * de "quebrou" — que é a diferença entre pedir autorização e abrir um bug.
 */
export class ErroPermissao extends Error {
  /** @param {string} modulo @param {string} permissao */
  constructor(modulo, permissao) {
    super(`módulo "${modulo}" não declarou a permissão ${permissao}`);
    this.name = 'ErroPermissao';
    this.modulo = modulo;
    this.permissao = permissao;
  }
}

/** Erro de acesso a chave não declarada. */
export class ErroChave extends Error {
  /** @param {string} modulo @param {string} chave */
  constructor(modulo, chave) {
    super(`módulo "${modulo}" não declarou a chave "${chave}"`);
    this.name = 'ErroChave';
    this.modulo = modulo;
    this.chave = chave;
  }
}

/**
 * @typedef {object} BusV2
 * @property {(ev: string, payload?: any, meta?: Record<string, unknown>) => void} emit
 * @property {(ev: string, fn: Function) => (() => void)} on
 *
 * ⚠️ **O bus da V1 NÃO satisfaz este contrato.** `src/core/events.js` declara
 * `emit(event, payload)` — dois parâmetros — e monta `meta = { event }` por
 * conta própria. Um terceiro argumento seria descartado em silêncio, e a
 * `origem` sumiria sem erro.
 *
 * Não é detalhe de tipagem: a §7 do plano exige que um evento carregue nome,
 * origem, timestamp, payload e versão, e o bus da V1 carrega só os dois
 * primeiros. É item de migração, e está aqui para quem for portar o bus não
 * descobrir clicando. (Achado pelo verificador de tipos, antes de rodar.)
 */

/**
 * @typedef {object} Deps
 * @property {{get: (k: string) => any, set: (k: string, v: any) => boolean, remove?: (k: string) => void}} storage
 * @property {BusV2} [bus]
 * @property {{usar: (solicitante: string, declaradas: string[], alvo: string, exigencia?: {versao?: number}) => Record<string, Function>}} [apis]
 */

/**
 * Monta o contexto de um módulo a partir do manifesto normalizado.
 *
 * @param {{id: string, permissions: string[], storage: {key: string}[], events: {emits: string[], consumes: string[]}, dependencies?: string[]}} manifesto
 * @param {Deps} deps implementações reais do Core (injetadas para poder testar)
 */
export function criarContexto(manifesto, deps) {
  const id = manifesto.id;
  const log = criarLog(id);
  const declaradas = new Set(manifesto.permissions);
  const chaves = new Set(manifesto.storage.map((s) => s.key));
  const podeEmitir = new Set(manifesto.events.emits);

  /* ── permissões ─────────────────────────────────────────────────────── */

  /** @param {string} p */
  function pode(p) {
    return declaradas.has(p);
  }

  /**
   * Exige a permissão ou levanta. Existe além do `pode()` porque a maioria dos
   * chamadores quer falhar, não ramificar — e um `if (!pode()) return` calado é
   * o modo de falha silenciosa que esta arquitetura combate.
   * @param {string} p
   */
  function exigir(p) {
    if (!PERMISSOES.includes(/** @type {any} */ (p))) {
      throw new Error(`permissão desconhecida: ${p}`);
    }
    if (!declaradas.has(p)) {
      /* Registra ANTES de levantar: quem captura a exceção pode engoli-la, e aí
       * a tentativa de acesso indevido some sem deixar rastro. */
      log.aviso('acesso negado', { permissao: p });
      throw new ErroPermissao(id, p);
    }
    return true;
  }

  /* ── storage recortado ──────────────────────────────────────────────── */

  const storage = {
    /** @param {string} chave @param {any} [padrao] */
    get(chave, padrao) {
      if (!chaves.has(chave)) throw new ErroChave(id, chave);
      return deps.storage.get(chave) ?? padrao;
    },
    /** @param {string} chave @param {any} valor */
    set(chave, valor) {
      if (!chaves.has(chave)) throw new ErroChave(id, chave);
      return deps.storage.set(chave, valor);
    },
    /** As chaves que ESTE módulo declarou — nada além. */
    chaves: () => [...chaves]
  };

  /* ── barramento recortado ───────────────────────────────────────────── */

  const barramento = deps.bus;
  const bus = barramento && {
    /**
     * Emitir evento fora do que o manifesto declara é erro alto, não aviso: um
     * módulo emitindo em nome de outro corrompe o catálogo de eventos, e o
     * catálogo é o que permite descobrir quem depende de quê (§7).
     * @param {string} evento @param {any} [payload]
     */
    emit(evento, payload) {
      if (!podeEmitir.has(evento)) {
        throw new Error(`módulo "${id}" não declarou emitir "${evento}"`);
      }
      /* `origem` no envelope é o que a §7 pede e o bus da V1 não tem. */
      barramento.emit(evento, payload, { origem: id });
    },
    /** Escutar é livre — é o ponto do Event Bus (ver `V2_MODULE_RULES.md`). */
    /** @param {string} evento @param {Function} fn */
    on: (evento, fn) => barramento.on(evento, fn)
  };

  /* ── contratos com outros módulos ───────────────────────────────────── */

  /**
   * A api de outro módulo, se este declarou depender dele.
   *
   * Fica no contexto — e não num import — porque é isso que torna a dependência
   * **visível ao Registry**: importar o arquivo do outro módulo funcionaria e
   * seria invisível, e aí ordenar a subida ou cortar em cascata viraria
   * adivinhação.
   *
   * @param {string} alvo
   * @param {{versao?: number}} [exigencia]
   */
  const usar = (alvo, exigencia) => {
    if (!deps.apis) {
      throw new Error(`contexto de "${id}" foi montado sem resolvedor de apis`);
    }
    return deps.apis.usar(id, manifesto.dependencies ?? [], alvo, exigencia);
  };

  return {
    modulo: id,
    log,
    pode,
    exigir,
    storage,
    ...(deps.apis ? { usar } : {}),
    ...(bus ? { bus } : {}),
    /** O que este módulo declarou — para o `/diagnostico` mostrar sem adivinhar. */
    declarado: {
      permissoes: [...declaradas],
      chaves: [...chaves],
      emite: [...podeEmitir],
      depende: [...(manifesto.dependencies ?? [])]
    }
  };
}

/** @typedef {ReturnType<typeof criarContexto>} Contexto */
