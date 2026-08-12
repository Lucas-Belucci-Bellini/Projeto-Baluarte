/**
 * Boot — onde o manifesto deixa de descrever e passa a mandar.
 *
 * ── O modo de falha que este arquivo existe para fechar ─────────────────────
 * A `V2_ARCHITECTURE.md` §3 marca o risco mais provável desta arquitetura: o
 * manifesto virar documentação. Se o Core continuar registrando rota por conta
 * própria enquanto o manifesto "descreve", a V2 terá **onze** lugares
 * declarando uma rota em vez dos dez da V1 — e a divergência que já existe
 * (22 labels diferentes entre `sidebar.js` e `shell.js`) ganha mais um lugar
 * para acontecer.
 *
 * Aqui a direção se inverte: o router **recebe** as rotas do Registry, a
 * navegação **recebe** os itens do Registry. Não existe `register()` avulso.
 * Registrar um módulo é a única forma de existir uma rota.
 *
 * ── Por que ADAPTAR o router da V1 em vez de escrever outro ─────────────────
 * Regra 3: não duplicar sistemas. O router da V1 resolve hash, 404, query e
 * ciclo de vida de página, tem teste e funciona. O que ele não tinha era **de
 * onde** vêm as rotas — e isso é o que muda. Escrever um segundo router seria
 * jogar fora um componente bom para consertar um problema que não é dele.
 *
 * ── O teste que este arquivo precisa passar ─────────────────────────────────
 * O da própria proposta: *"criar um módulo de mentira, registrar, ver aparecer
 * na navegação e nas rotas — sem editar nenhum arquivo do Core. Enquanto esse
 * teste não passar, o Module System não está pronto."* Está em
 * `test/v2/boot.test.js`.
 */

import { criarCiclo } from './ciclo.js';
import { criarLog } from './log.js';

/**
 * @typedef {object} Router
 * @property {(path: string, view: Function) => void} register
 */

/**
 * @typedef {object} Adaptadores
 * @property {Router} router          quem passa a receber as rotas
 * @property {(itens: any[]) => void} [renderNav]  quem desenha a navegação
 */

/**
 * O boot precisa de MAIS do que o contexto de um módulo precisa.
 *
 * O contexto quer `metricas.paraModulo()` e `apis.usar()` — o recorte de um
 * módulo. O boot quer o retrato do conjunto: `metricas.retrato()`,
 * `apis.catalogo()`, `apis.uso()`. Declarar um `Deps` só para os dois foi erro
 * meu, e o verificador de tipos apontou: consumidores diferentes têm contratos
 * diferentes — que é o princípio desta arquitetura aplicado a ela mesma.
 *
 * @typedef {import('./contexto.js').Deps & {
 *   metricas?: import('./contexto.js').Deps['metricas'] & { retrato: () => any },
 *   apis?: import('./contexto.js').Deps['apis'] & { catalogo: () => any, uso: () => any }
 * }} DepsBoot
 */

/**
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry selado
 * @param {DepsBoot} deps
 * @param {Adaptadores} adaptadores
 * @param {{tetoInitMs?: number}} [opcoes]
 */
export function criarBoot(registry, deps, adaptadores, opcoes = {}) {
  const log = criarLog('core:boot');
  const ciclo = criarCiclo(registry, deps, opcoes);

  /**
   * Sobe: primeiro os módulos, depois as rotas.
   *
   * A ordem importa e não é arbitrária. Registrar a rota antes do `init` abriria
   * uma janela em que o operador pode navegar para um módulo que ainda não
   * iniciou — e "às vezes a página abre vazia" é o tipo de bug que consome uma
   * tarde. Só entra no router o que está de fato no ar.
   */
  async function subir() {
    /* As permissões são resolvidas ANTES de qualquer contexto existir. A ordem
     * é obrigatória, não estilo: o `criarContexto` recusa montar um módulo que
     * declara permissão quando o decisor não conhece o módulo, e o `init` do
     * módulo pode perfeitamente chamar `ctx.exigir()` na primeira linha. */
    if (deps.permissoes) {
      deps.permissoes.conhecerModulos(
        registry.listar().map((id) => ({ id, permissions: registry.permissoes().get(id) ?? [] }))
      );
      const { concedidas, recusas } = deps.permissoes.aplicarPolitica();

      for (const r of recusas) {
        /* Recusa de política não impede a subida: nove módulos certos não param
         * por causa do décimo mal configurado. Mas ela nunca é silenciosa — uma
         * política que não pega e ninguém vê é o pior dos dois mundos. */
        log.aviso('política recusada', { modulo: r.modulo, motivo: r.motivo });
      }
      if (concedidas.length || recusas.length) {
        log.info('política aplicada', { concedidas: concedidas.length, recusas: recusas.length });
      }
    }

    const resultado = await ciclo.subir();
    const vivos = new Set(resultado.vivos);

    let rotas = 0;
    for (const { path, view, modulo } of registry.rotas()) {
      if (!vivos.has(modulo)) {
        /* Módulo que não subiu não ganha rota. Sem isto, um módulo quebrado
         * continuaria "navegável" e falharia no clique, longe da causa. */
        log.aviso('rota omitida: módulo não está no ar', { rota: path, modulo });
        continue;
      }
      adaptadores.router.register(path, view);
      rotas += 1;
    }

    const nav = registry.navegacao().filter((i) => vivos.has(i.modulo));
    adaptadores.renderNav?.(nav);

    /* Referência fraca sem alvo não impede nada — é o ponto dela. Mas fica
     * dita: sem isto, o sintoma é um botão que leva ao `notFound` calado, e a
     * causa (alguém removeu o módulo dono da rota) está a semanas de distância
     * do clique. */
    for (const r of registry.referenciasOrfas()) {
      log.aviso('referência fraca sem alvo', { modulo: r.modulo, tipo: r.tipo, alvo: r.alvo });
    }

    log.info('boot concluído', {
      modulos: resultado.vivos.length, rotas, nav: nav.length, falhas: resultado.falhas.length
    });

    return { ...resultado, rotas, nav };
  }

  /**
   * Retrato do que está no ar. É o que a página `/diagnostico` mostra — e ela
   * deixa de precisar saber onde procurar cada coisa, porque tudo tem uma fonte.
   */
  function diagnostico() {
    const vivos = ciclo.vivos();
    return {
      fase: ciclo.fase,
      modulos: vivos.map((id) => {
        const m = registry.modulo(id);
        const ctx = ciclo.contexto(id);
        return {
          id,
          nome: m?.name,
          versao: m?.version,
          estabilidade: m?.stability,
          rotas: m?.routes.map((/** @type {any} */ r) => r.path) ?? [],
          permissoes: ctx?.declarado.permissoes ?? [],
          /* Declarado e concedido lado a lado: a diferença entre os dois é o
           * que o operador tem para decidir, e mostrar só um dos números é
           * como "deny-by-default" vira slogan. */
          concedidas: ctx?.declarado.concedidas() ?? [],
          chaves: ctx?.declarado.chaves ?? [],
          emite: ctx?.declarado.emite ?? []
        };
      }),
      falhas: ciclo.falhas(),
      eventosOrfaos: registry.eventosOrfaos(),
      referenciasOrfas: registry.referenciasOrfas(),
      /* Um retrato só. Sem isto o operador junta métricas de um lugar, módulos
       * de outro e falhas de um terceiro — que é o que a página /diagnostico da
       * V1 faz hoje, vasculhando cinco fontes. */
      metricas: deps.metricas?.retrato() ?? null,
      apis: deps.apis?.catalogo?.() ?? null,
      usoDeApi: deps.apis?.uso?.() ?? null,
      permissoes: deps.permissoes?.retrato() ?? null,
      decisoesDePermissao: deps.permissoes?.ultimasDecisoes(20) ?? null
    };
  }

  return { subir, descer: () => ciclo.descer(), diagnostico, ciclo };
}
