/**
 * Decisor de permissões — quem responde "pode?" quando um módulo pergunta.
 *
 * ── O buraco que este arquivo fecha ─────────────────────────────────────────
 * A `V2_MODULE_RULES.md` afirma, em letras grandes: *"deny-by-default segue
 * valendo: **declarar não é receber**. O manifesto diz o que o módulo pode
 * pedir; conceder é decisão do Permission System."*
 *
 * O Permission System não existia. O `contexto.js` respondia `pode(p)` com
 * `manifesto.permissions.includes(p)` — ou seja, **declarar era receber**, e o
 * texto acima descrevia um sistema que ninguém tinha escrito. Não é bug de
 * implementação: é a arquitetura afirmando uma garantia que ela não dava.
 *
 * Vale dizer sem rodeio porque é o modo de falha mais caro desta fase: uma
 * garantia documentada e não implementada é pior que garantia nenhuma — a
 * ausência ninguém confia, a falsa todo mundo confia.
 *
 * ── As três decisões que definem este arquivo ───────────────────────────────
 *
 * **1. É fábrica, não singleton.** O `src/core/permissions.js` da V1 guarda
 * concessões em `Map` no escopo do módulo: dois testes em paralelo compartilham
 * estado, e "quem concedeu isso?" vira arqueologia. Aqui o decisor é criado,
 * injetado e descartado — Regra 8.
 *
 * **2. Concessão ⊆ declaração.** Conceder ao módulo `x` algo que o manifesto
 * dele não declara é **recusado**, não concedido em silêncio. Se a política e o
 * manifesto discordam, alguém está errado, e escolher um dos dois caladamente é
 * como o manifesto deixa de ser a verdade sobre o sistema.
 *
 * **3. A resposta tem três "nãos" diferentes**, e confundi-los custa caro:
 *
 *   `desconhecida`   a permissão não existe no vocabulário → typo de quem chama
 *   `nao-declarada`  existe, o módulo não pediu no manifesto → bug do módulo
 *   `negada`         declarada e não concedida → **legítimo**; a UI pode pedir
 *
 * Só o terceiro merece perguntar ao operador. Os outros dois são defeito, e uma
 * interface que pede autorização para um typo ensina o operador a clicar "sim".
 *
 * ── O que este arquivo NÃO é ────────────────────────────────────────────────
 * Não é o nível de permissão por AÇÃO (`arsenal.read`, `terminal.execute`), com
 * risco e curinga, que a V1 tem e o JARVIS usa. Aquele nível decide chamada de
 * tool; este decide o que um MÓDULO alcança. São camadas diferentes e o de baixo
 * vem depois, quando houver tools da V2 para governar — Regra 17.
 */

import { PERMISSOES } from './manifest.js';

/** Teto do rastro de decisões. Regra do teto: nada cresce sem limite (§6 dos padrões). */
export const TETO_AUDITORIA = 500;

/**
 * Erro de política — a política pediu algo impossível.
 *
 * Separado de `ErroPermissao` (que é "o módulo não pode") de propósito: este
 * aqui nunca é uma negativa legítima, é sempre configuração errada.
 */
export class ErroPolitica extends Error {
  /** @param {string} msg */
  constructor(msg) {
    super(msg);
    this.name = 'ErroPolitica';
  }
}

/** @typedef {'ok'|'desconhecida'|'nao-declarada'|'negada'} Veredicto */

/**
 * @typedef {object} Opcoes
 * @property {Record<string, string[]>} [politica] concessões iniciais por módulo
 * @property {{emit: (ev: string, payload?: any, meta?: any) => void}} [bus]
 */

/**
 * @param {Opcoes} [opcoes]
 */
export function criarPermissoes(opcoes = {}) {
  /** modulo → Set de permissões concedidas */
  const concedidas = new Map();
  /** modulo → Set de permissões declaradas no manifesto (o teto) */
  const declaradas = new Map();
  /** @type {{acao: string, modulo: string, permissao?: string, resultado?: string, origem?: string, em: number}[]} */
  const trilha = [];

  /** @param {any} entrada */
  function registrar(entrada) {
    trilha.push({ ...entrada, em: Date.now() });
    if (trilha.length > TETO_AUDITORIA) trilha.shift();
  }

  /** @param {string} ev @param {any} payload */
  function anunciar(ev, payload) {
    /* O bus é opcional: o decisor precisa funcionar em teste puro, sem Core
     * montado. E emitir não pode derrubar a decisão — quem escuta permissão
     * negada não pode impedir a negativa de acontecer. */
    try { opcoes.bus?.emit(ev, payload, { origem: 'core:permissoes' }); } catch { /* ver acima */ }
  }

  /** @param {string} p */
  const conhecida = (p) => PERMISSOES.includes(/** @type {any} */ (p));

  /* ── o teto: o que cada módulo declarou ─────────────────────────────── */

  /**
   * Ensina ao decisor o que cada módulo declarou. Sem isto ele não tem como
   * cobrar a regra 2 — e conceder sem teto é conceder qualquer coisa.
   *
   * **Reensinar um teto mais estreito derruba as concessões que não cabem mais.**
   * Sem essa poda, um módulo que numa versão nova deixasse de declarar `NETWORK`
   * continuaria com `NETWORK` concedida — a concessão sobreviveria ao próprio
   * fundamento. É a mesma regra do `importar()`: o teto é autoridade, a
   * concessão é lembrança.
   *
   * @param {{id: string, permissions: string[]}[]} manifestos normalizados
   */
  function conhecerModulos(manifestos) {
    for (const m of manifestos) {
      const teto = new Set(m.permissions);
      declaradas.set(m.id, teto);

      const atuais = concedidas.get(m.id);
      if (!atuais) continue;
      const podadas = [...atuais].filter((p) => !teto.has(p));
      for (const p of podadas) atuais.delete(p);
      if (!atuais.size) concedidas.delete(m.id);
      if (podadas.length) {
        registrar({ acao: 'podar', modulo: m.id, permissao: podadas.join(','), origem: 'teto' });
        anunciar('permissoes:revogada', { modulo: m.id, permissoes: podadas, origem: 'teto' });
      }
    }
  }

  /* ── conceder e revogar ─────────────────────────────────────────────── */

  /**
   * Concede. Recusa em três casos, e cada recusa diz qual.
   *
   * @param {string} modulo
   * @param {string|string[]} permissao
   * @param {{origem?: string}} [ctx] de onde veio a decisão ('politica',
   *        'operador', 'app'…). Sem isto, seis meses depois ninguém sabe quem
   *        abriu a porta — a V1 aprendeu isso e está certa.
   * @returns {string[]} o que foi concedido AGORA (já concedido não conta)
   */
  function conceder(modulo, permissao, ctx = {}) {
    const pedidos = Array.isArray(permissao) ? permissao : [permissao];
    const origem = ctx.origem ?? 'desconhecida';
    const teto = declaradas.get(modulo);

    if (!teto) {
      throw new ErroPolitica(
        `módulo "${modulo}" não é conhecido pelo decisor — conhecerModulos() antes de conceder`
      );
    }

    const novas = [];
    for (const p of pedidos) {
      if (!conhecida(p)) {
        throw new ErroPolitica(`permissão desconhecida: "${p}" (módulo "${modulo}")`);
      }
      if (!teto.has(p)) {
        /* A regra 2. Conceder aqui faria o manifesto mentir sobre o alcance do
         * módulo, e o manifesto é a única fonte — se ele pode ser contornado
         * pela política, ele não é fonte de nada. */
        throw new ErroPolitica(
          `"${modulo}" não declarou ${p} no manifesto — a política concede além do declarado`
        );
      }
      const atuais = concedidas.get(modulo) ?? new Set();
      if (atuais.has(p)) continue;
      atuais.add(p);
      concedidas.set(modulo, atuais);
      novas.push(p);
    }

    if (novas.length) {
      registrar({ acao: 'conceder', modulo, permissao: novas.join(','), origem });
      anunciar('permissoes:concedida', { modulo, permissoes: novas, origem });
    }
    return novas;
  }

  /**
   * Revoga. **Não** exige que o módulo seja conhecido nem que a permissão esteja
   * declarada: tirar acesso é sempre seguro, e um botão de pânico que valida
   * pré-condições é um botão de pânico que falha na hora do pânico.
   *
   * @param {string} modulo
   * @param {string|string[]|'*'} [permissao] omitido ou `'*'` revoga tudo do módulo
   * @param {{origem?: string}} [ctx]
   * @returns {string[]}
   */
  function revogar(modulo, permissao = '*', ctx = {}) {
    const atuais = concedidas.get(modulo);
    if (!atuais) return [];

    const alvo = permissao === '*' ? [...atuais]
      : (Array.isArray(permissao) ? permissao : [permissao]);

    const tiradas = alvo.filter((p) => atuais.delete(p));
    if (!atuais.size) concedidas.delete(modulo);

    if (tiradas.length) {
      registrar({ acao: 'revogar', modulo, permissao: tiradas.join(','), origem: ctx.origem ?? 'desconhecida' });
      anunciar('permissoes:revogada', { modulo, permissoes: tiradas, origem: ctx.origem });
    }
    return tiradas;
  }

  /* ── consultar ──────────────────────────────────────────────────────── */

  /**
   * O veredicto completo. Existe separado do `pode()` porque quem vai **mostrar**
   * algo ao operador precisa saber qual dos três "nãos" aconteceu.
   *
   * @param {string} modulo @param {string} permissao @returns {Veredicto}
   */
  function avaliar(modulo, permissao) {
    if (!conhecida(permissao)) return 'desconhecida';
    if (!declaradas.get(modulo)?.has(permissao)) return 'nao-declarada';
    return concedidas.get(modulo)?.has(permissao) ? 'ok' : 'negada';
  }

  /**
   * Pode? Nunca levanta — é a forma de perguntar quando "não" é caminho normal
   * (esconder um botão). Deny-by-default: módulo desconhecido responde `false`.
   *
   * @param {string} modulo @param {string} permissao
   */
  function pode(modulo, permissao) {
    return avaliar(modulo, permissao) === 'ok';
  }

  /* ── política declarada ─────────────────────────────────────────────── */

  /**
   * Aplica a política contra os manifestos. **Acumula** as recusas em vez de
   * parar na primeira: quem escreve política quer a lista inteira, mesma razão
   * do validador de manifesto.
   *
   * Devolver as recusas em vez de levantar é deliberado — uma política com um
   * item errado não deve impedir o Baluarte de subir com os outros nove certos.
   * Quem chama decide se aquilo é fatal; o `boot` registra e segue.
   *
   * @param {Record<string, string[]>} [politica]
   * @returns {{concedidas: {modulo: string, permissoes: string[]}[], recusas: {modulo: string, motivo: string}[]}}
   */
  function aplicarPolitica(politica = opcoes.politica ?? {}) {
    const feitas = [];
    const recusas = [];

    for (const [modulo, lista] of Object.entries(politica)) {
      try {
        const novas = conceder(modulo, lista, { origem: 'politica' });
        if (novas.length) feitas.push({ modulo, permissoes: novas });
      } catch (err) {
        recusas.push({ modulo, motivo: err instanceof Error ? err.message : String(err) });
        registrar({ acao: 'politica-recusada', modulo, resultado: 'recusada', origem: 'politica' });
      }
    }
    return { concedidas: feitas, recusas };
  }

  /* ── persistência ───────────────────────────────────────────────────── */

  /** Estado serializável. Só pares concretos — nada de regra que muda de sentido depois. */
  function exportar() {
    return {
      versao: 1,
      concedidas: [...concedidas.entries()].map(([modulo, ps]) => ({ modulo, permissoes: [...ps] }))
    };
  }

  /**
   * Recarrega concessões salvas. O que não passa mais no teto é **descartado**,
   * não restaurado: o estado gravado é uma lembrança, não uma autoridade. Um
   * módulo que deixou de declarar `NETWORK` numa versão nova não pode reganhar
   * `NETWORK` porque o arquivo de ontem dizia que tinha.
   *
   * @param {any} estado
   */
  function importar(estado) {
    const aplicadas = [];
    const descartadas = [];

    for (const item of estado?.concedidas ?? []) {
      for (const p of item?.permissoes ?? []) {
        try {
          conceder(item.modulo, p, { origem: 'importada' });
          aplicadas.push(`${item.modulo}:${p}`);
        } catch {
          descartadas.push(`${item.modulo}:${p}`);
        }
      }
    }
    registrar({ acao: 'importar', modulo: '*', resultado: `${aplicadas.length} de ${aplicadas.length + descartadas.length}` });
    return { aplicadas, descartadas };
  }

  /* ── introspecção ───────────────────────────────────────────────────── */

  /** Retrato para o `/diagnostico`: o que cada módulo pediu e o que recebeu. */
  function retrato() {
    return [...declaradas.entries()].map(([modulo, ps]) => ({
      modulo,
      declaradas: [...ps],
      concedidas: [...ps].filter((p) => concedidas.get(modulo)?.has(p)),
      /* O delta é a informação que interessa: declarado-e-não-concedido é
       * exatamente o que o operador tem para decidir. */
      pendentes: [...ps].filter((p) => !concedidas.get(modulo)?.has(p))
    }));
  }

  /** @param {number} [n] */
  const ultimasDecisoes = (n = 50) => trilha.slice(-n);

  return {
    conhecerModulos, conceder, revogar, pode, avaliar,
    aplicarPolitica, exportar, importar, retrato, ultimasDecisoes,
    /** Só para o contexto registrar tentativa negada — o rastro é o ponto. */
    /** @param {string} modulo @param {string} permissao @param {Veredicto} resultado */
    anotar(modulo, permissao, resultado) {
      registrar({ acao: 'exigir', modulo, permissao, resultado });
      if (resultado !== 'ok') anunciar('permissoes:negada', { modulo, permissao, resultado });
    }
  };
}

/** @typedef {ReturnType<typeof criarPermissoes>} Permissoes */
