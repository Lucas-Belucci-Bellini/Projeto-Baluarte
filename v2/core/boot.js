import { criarCiclo } from './ciclo.js';
import { criarLog } from './log.js';

/** @typedef {(path: string, view: Function) => void} RouterRegister */
/** @typedef {{register: RouterRegister}} Router */
/** @typedef {{path: string, view: Function, modulo: string}} RuntimeRoute */
/** @typedef {{modulo: string, tipo: string, alvo: string}} RuntimeReference */
/** @typedef {{modulo: string, permissions: ReadonlyArray<string>}} RuntimePermissionModule */
/** @typedef {{id: string, name?: string, version?: string, stability?: string, routes: ReadonlyArray<{path: string}>, permissoes?: ReadonlyArray<string>}} RuntimeModule */
/** @typedef {{id: string, modulo: string, tipo?: string}} RuntimeNavigationItem */
/**
 * @typedef {{
 *   registrar: (manifesto: unknown) => boolean,
 *   selar: () => unknown,
 *   selado: boolean,
 *   listar: () => ReadonlyArray<string>,
 *   modulo: (id: string) => RuntimeModule | undefined,
 *   esquemas: () => ReadonlyArray<unknown>,
 *   permissoes: () => ReadonlyMap<string, ReadonlyArray<string>>,
 *   eventos: () => ReadonlyMap<string, unknown>,
 *   rotas: () => ReadonlyArray<RuntimeRoute>,
 *   navegacao: () => ReadonlyArray<RuntimeNavigationItem>,
 *   referenciasOrfas: () => ReadonlyArray<RuntimeReference>,
 *   eventosOrfaos: () => ReadonlyArray<RuntimeReference>
 * }} RuntimeBootRegistry
 */

/** @typedef {object} Adaptadores
 * @property {Router} router
 * @property {(itens: ReadonlyArray<RuntimeNavigationItem>) => void} [renderNav]
 */

/** @typedef {import('./contexto.js').Deps & {
 *   metricas?: import('./contexto.js').Deps['metricas'] & { retrato: () => any },
 *   apis?: import('./contexto.js').Deps['apis'] & { catalogo: () => any, uso: () => any }
 * }} DepsBoot
 */

/**
 * @param {RuntimeBootRegistry} registry
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
      for (const r of recusas) log.aviso('política recusada', { modulo: r.modulo, motivo: r.motivo });
      if (concedidas.length || recusas.length) log.info('política aplicada', { concedidas: concedidas.length, recusas: recusas.length });
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
    for (const r of registry.referenciasOrfas()) log.aviso('referência fraca sem alvo', { modulo: r.modulo, tipo: r.tipo, alvo: r.alvo });
    log.info('boot concluído', { modulos: resultado.vivos.length, rotas, nav: nav.length, falhas: resultado.falhas.length });
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
          id, nome: m?.name, versao: m?.version, estabilidade: m?.stability,
          rotas: m?.routes.map((r) => r.path) ?? [],
          permissoes: ctx?.declarado.permissoes ?? [],
          concedidas: ctx?.declarado.concedidas() ?? [],
          chaves: ctx?.declarado.chaves ?? [], emite: ctx?.declarado.emite ?? []
        };
      }),
      falhas: ciclo.falhas(), eventosOrfaos: registry.eventosOrfaos(), referenciasOrfas: registry.referenciasOrfas(),
      metricas: deps.metricas?.retrato() ?? null, apis: deps.apis?.catalogo?.() ?? null,
      usoDeApi: deps.apis?.uso?.() ?? null, permissoes: deps.permissoes?.retrato() ?? null,
      decisoesDePermissao: deps.permissoes?.ultimasDecisoes(20) ?? null
    };
  }

  return { subir, descer: () => ciclo.descer(), diagnostico, ciclo };
}
