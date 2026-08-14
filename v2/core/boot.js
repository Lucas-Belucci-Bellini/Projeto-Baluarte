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

/** @typedef {(path: string, view: Function) => void} RouterRegister */
/** @typedef {{register: RouterRegister}} Router */
/** @typedef {{path: string, view: Function, modulo: string}} RuntimeRoute */
/** @typedef {{modulo: string, tipo: string, alvo: string}} RuntimeReference */
/** @typedef {{modulo: string, permissions: ReadonlyArray<string>}} RuntimePermissionModule */
/** @typedef {{id: string, name?: string, version?: string, stability?: string, routes: ReadonlyArray<{path: string}>, permissoes?: ReadonlyArray<string>}} RuntimeModule */
/** @typedef {{modulo: string, nome: string, icone: string, secao: string|null, ordem: number, path: string, estabilidade: string}} RuntimeNavigationItem */
/**
 * @typedef {{
 *   selado: boolean,
 *   listar: () => ReadonlyArray<string>,
 *   modulo: (id: string) => RuntimeModule | undefined,
 *   permissoes: () => ReadonlyMap<string, ReadonlyArray<string>>,
 *   rotas: () => ReadonlyArray<RuntimeRoute>,
 *   navegacao: () => ReadonlyArray<RuntimeNavigationItem>,
 *   referenciasOrfas: () => ReadonlyArray<RuntimeReference>,
 *   eventosOrfaos: () => ReadonlyArray<RuntimeReference>
 * }} RuntimeBootRegistry
 */

/**
 * @typedef {object} Adaptadores
 * @property {Router} router
 * @property {(itens: ReadonlyArray<RuntimeNavigationItem>) => void} [renderNav]
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

  async function subir() {
    if (deps.permissoes) {
      deps.permissoes.conhecerModulos(
        registry.listar().map((id) => ({ id, permissions: [...(registry.permissoes().get(id) ?? [])] }))
      );
      const { concedidas, recusas } = deps.permissoes.aplicarPolitica();

      for (const r of recusas) {
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
        log.aviso('rota omitida: módulo não está no ar', { rota: path, modulo });
        continue;
      }
      adaptadores.router.register(path, view);
      rotas += 1;
    }

    const nav = registry.navegacao().filter((i) => vivos.has(i.modulo));
    adaptadores.renderNav?.(nav);

    for (const r of registry.referenciasOrfas()) {
      log.aviso('referência fraca sem alvo', { modulo: r.modulo, tipo: r.tipo, alvo: r.alvo });
    }

    log.info('boot concluído', {
      modulos: resultado.vivos.length, rotas, nav: nav.length, falhas: resultado.falhas.length
    });

    return { ...resultado, rotas, nav };
  }

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
          rotas: m?.routes.map((/** @type {{path: string}} */ r) => r.path) ?? [],
          permissoes: ctx?.declarado.permissoes ?? [],
          concedidas: ctx?.declarado.concedidas() ?? [],
          chaves: ctx?.declarado.chaves ?? [],
          emite: ctx?.declarado.emite ?? []
        };
      }),
      falhas: ciclo.falhas(),
      eventosOrfaos: registry.eventosOrfaos(),
      referenciasOrfas: registry.referenciasOrfas(),
      metricas: deps.metricas?.retrato() ?? null,
      apis: deps.apis?.catalogo?.() ?? null,
      usoDeApi: deps.apis?.uso?.() ?? null,
      permissoes: deps.permissoes?.retrato() ?? null,
      decisoesDePermissao: deps.permissoes?.ultimasDecisoes(20) ?? null
    };
  }

  return { subir, descer: () => ciclo.descer(), diagnostico, ciclo };
}
