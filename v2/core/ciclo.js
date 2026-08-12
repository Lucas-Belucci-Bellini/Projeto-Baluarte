/**
 * Ciclo de vida dos módulos — o Core levantando e derrubando o sistema.
 *
 * O Registry decide **quem** carrega e **em que ordem**; este arquivo executa.
 * Contrato: `docs/v2/V2_MODULE_RULES.md`. Fases: `init → start` na subida,
 * `stop → dispose` na descida.
 *
 * ── Três decisões que carregam o resto ──────────────────────────────────────
 *
 * **A descida é na ordem INVERSA.** Se `ui` depende de `core`, `ui.dispose()`
 * roda antes de `core.dispose()` — senão o `ui` desmonta usando um `core` já
 * morto. Subir e descer na mesma ordem é o erro clássico, e ele só aparece no
 * desligamento, que é quando ninguém está olhando.
 *
 * **Falha no `init` desativa o módulo e quem depende dele.** É o §6 do plano
 * (módulo quebrado não derruba o Baluarte) na subida. O Registry já faz isso
 * para dependência ausente; aqui é para dependência que *existe mas quebrou ao
 * iniciar* — caso que o Registry não tem como prever, porque exige executar.
 *
 * **`init` tem teto de tempo.** Um `init` que nunca resolve trava a subida:
 * os módulos seguintes nunca iniciam, e não há erro nenhum — o Baluarte fica
 * meio no ar, em silêncio. É exatamente o modo de falha que esta arquitetura
 * existe para eliminar, então o teto converte trava invisível em falha
 * atribuída: "o módulo X não iniciou em N ms".
 *
 * ── O que este arquivo NÃO faz ──────────────────────────────────────────────
 * Não recarrega módulo em runtime (hot reload), não atualiza versão com o
 * sistema no ar. O manifesto prevê ambos; construí-los agora seria implementar
 * o futuro antes da hora (Regra 17) sem ter um consumidor.
 */

import { criarContexto } from './contexto.js';
import { criarLog } from './log.js';

/** Teto padrão do `init`. Generoso: derrubar módulo lento é pior que esperar. */
export const TETO_INIT_MS = 10_000;

/**
 * @typedef {object} Falha
 * @property {string} modulo
 * @property {string} fase
 * @property {string} motivo
 */

/**
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry selado
 * @param {import('./contexto.js').Deps} deps
 * @param {{tetoInitMs?: number}} [opcoes]
 */
export function criarCiclo(registry, deps, opcoes = {}) {
  const teto = opcoes.tetoInitMs ?? TETO_INIT_MS;
  const log = criarLog('core:ciclo');

  /** @type {Map<string, any>} contextos vivos, na ordem em que iniciaram */
  const vivos = new Map();
  /** @type {Falha[]} */
  let falhas = [];
  let fase = 'parado';   // parado | subindo | no-ar | descendo

  /**
   * Executa uma fase do módulo com teto de tempo.
   * @param {string} id @param {Function|undefined} fn @param {any} ctx @param {string} nome
   */
  async function executar(id, fn, ctx, nome) {
    if (typeof fn !== 'function') return;   // fase opcional
    let tid;
    const limite = new Promise((_, rej) => {
      tid = setTimeout(() => rej(new Error(`${nome} não terminou em ${teto}ms`)), teto);
    });
    try {
      await Promise.race([Promise.resolve(fn(ctx)), limite]);
    } finally {
      /* Sem isto, um teste com teto de 10s ficaria 10s pendurado depois de
       * passar — e em produção o timer segura o processo no Node. */
      clearTimeout(tid);
    }
  }

  /**
   * Sobe o sistema. Devolve o que subiu e o que falhou.
   * @returns {Promise<{ok: boolean, vivos: string[], falhas: Falha[]}>}
   */
  async function subir() {
    if (fase !== 'parado') throw new Error(`ciclo já está "${fase}"`);
    fase = 'subindo';
    falhas = [];

    /** ids desativados nesta subida — para cortar quem depende deles */
    const mortos = new Set();

    for (const id of registry.listar()) {
      const m = registry.modulo(id);
      /* `listar()` só devolve ids ativos, então isto não acontece — mas é
       * invariante do Registry, não do tipo, e o verificador está certo em
       * cobrar. Erro alto em vez de `undefined.lifecycle` três frames adiante. */
      if (!m) throw new Error(`ciclo: módulo "${id}" está na ordem e não no registro`);

      /* Dependência que morreu ao iniciar derruba quem depende — e como
       * `listar()` já vem em ordem topológica, uma passada basta: o dependente
       * sempre vem depois. */
      const quebradas = m.dependencies.filter((/** @type {string} */ d) => mortos.has(d));
      if (quebradas.length) {
        mortos.add(id);
        falhas.push({ modulo: id, fase: 'init', motivo: `dependência falhou: ${quebradas.join(', ')}` });
        log.aviso('módulo desativado em cascata', { modulo: id, por: quebradas });
        continue;
      }

      const ctx = criarContexto(m, deps);
      try {
        await executar(id, m.lifecycle.init, ctx, 'init');
        await executar(id, m.lifecycle.start, ctx, 'start');
        vivos.set(id, { ctx, manifesto: m });
        log.debug('módulo no ar', { modulo: id });
      } catch (err) {
        mortos.add(id);
        falhas.push({ modulo: id, fase: 'init', motivo: err instanceof Error ? err.message : String(err) });
        log.erro('módulo falhou ao iniciar', err, { modulo: id });

        /* Um módulo que quebrou no `start` pode ter feito metade do `init` —
         * timer, listener, conexão. Chamar `dispose` dá a ele a chance de
         * limpar; ignorar seria vazar recurso a cada falha. */
        try {
          await executar(id, m.lifecycle.dispose, ctx, 'dispose');
        } catch (err2) {
          log.aviso('dispose de módulo com init falho também falhou', {
            modulo: id, erro: err2 instanceof Error ? err2.message : String(err2)
          });
        }
      }
    }

    fase = 'no-ar';
    return { ok: falhas.length === 0, vivos: [...vivos.keys()], falhas: [...falhas] };
  }

  /**
   * Desce o sistema, na ordem inversa. Nunca levanta: desligamento que aborta no
   * meio deixa metade dos módulos vivos, e aí não há como tentar de novo.
   */
  async function descer() {
    if (fase !== 'no-ar') throw new Error(`ciclo está "${fase}", não no ar`);
    fase = 'descendo';
    /** @type {Falha[]} */
    const problemas = [];

    for (const id of [...vivos.keys()].reverse()) {
      const { ctx, manifesto } = vivos.get(id);
      for (const nome of ['stop', 'dispose']) {
        try {
          await executar(id, manifesto.lifecycle[nome], ctx, nome);
        } catch (err) {
          /* Registrado e seguindo: um `dispose` ruim não pode impedir os outros
           * de liberarem os deles. */
          problemas.push({ modulo: id, fase: nome, motivo: err instanceof Error ? err.message : String(err) });
          log.erro(`falha no ${nome}`, err, { modulo: id });
        }
      }
    }

    vivos.clear();
    fase = 'parado';
    return { ok: problemas.length === 0, problemas };
  }

  return {
    subir, descer,
    /** @param {string} id */
    contexto: (id) => vivos.get(id)?.ctx ?? null,
    vivos: () => [...vivos.keys()],
    falhas: () => [...falhas],
    get fase() { return fase; }
  };
}
