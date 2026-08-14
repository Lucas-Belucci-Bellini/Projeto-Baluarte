/**
 * Boot — conecta Registry, Ciclo, Router V1, navegação e diagnóstico.
 *
 * O Registry decide o conjunto; o Ciclo executa os módulos; o Boot só publica
 * rotas e navegação depois que cada módulo está no ar.
 */

import { criarCiclo } from './ciclo.js';
import { criarLog } from './log.js';
import type {
  ContextDependencies,
  ModuleContext,
} from './contexto.js';
import type {
  ModuleRegistry,
  RegistryNavigationEntry,
  RegistryRoute,
} from './registry.js';
import type {
  LifecycleFailure,
  LifecycleOptions,
  ModuleCycle,
} from './ciclo.js';

export interface RouterAdapter {
  register(path: string, view: RegistryRoute['view']): void;
}

export interface BootAdapters {
  router: RouterAdapter;
  renderNav?: (items: readonly RegistryNavigationEntry[]) => void;
}

export interface PermissionController {
  conhecerModulos(modules: ReadonlyArray<{ id: string; permissions: string[] }>): void;
  aplicarPolitica(): {
    concedidas: unknown[];
    recusas: ReadonlyArray<{ modulo: string; motivo: string }>;
  };
  retrato(): unknown;
  ultimasDecisoes(limit: number): unknown;
}

export interface ApiResolver {
  usar(
    requester: string,
    declaredDependencies: string[],
    target: string,
    requirement?: { versao?: number },
  ): Record<string, (...args: unknown[]) => unknown>;
  talvez(
    requester: string,
    references: string[],
    target: string,
    requirement?: { versao?: number },
  ): Record<string, (...args: unknown[]) => unknown> | null;
  catalogo(): unknown;
  uso(): unknown;
}

export interface BootDependencies extends ContextDependencies {
  permissoes?: PermissionController;
  apis?: ApiResolver;
  metricas?: {
    paraModulo(id: string): unknown;
    retrato(): unknown;
  };
}

export interface BootOptions extends LifecycleOptions {}

export interface BootResult {
  ok: boolean;
  vivos: string[];
  falhas: LifecycleFailure[];
  rotas: number;
  nav: RegistryNavigationEntry[];
}

export interface BootDiagnosticModule {
  id: string;
  nome?: string;
  versao?: string;
  estabilidade?: string;
  rotas: string[];
  permissoes: string[];
  concedidas: string[];
  chaves: string[];
  emite: string[];
}

export interface BootDiagnostic {
  fase: string;
  modulos: BootDiagnosticModule[];
  falhas: LifecycleFailure[];
  eventosOrfaos: ReturnType<ModuleRegistry['eventosOrfaos']>;
  referenciasOrfas: ReturnType<ModuleRegistry['referenciasOrfas']>;
  metricas: unknown;
  apis: unknown;
  usoDeApi: unknown;
  permissoes: unknown;
  decisoesDePermissao: unknown;
}

export interface Boot {
  subir(): Promise<BootResult>;
  descer(): Promise<ReturnType<ModuleCycle['descer']> extends Promise<infer T> ? T : never>;
  diagnostico(): BootDiagnostic;
  ciclo: ModuleCycle;
}

export function criarBoot(
  registry: ModuleRegistry,
  deps: BootDependencies,
  adaptadores: BootAdapters,
  opcoes: BootOptions = {},
): Boot {
  const log = criarLog('core:boot');
  const ciclo = criarCiclo(registry, deps, opcoes);

  async function subir(): Promise<BootResult> {
    if (deps.permissoes) {
      deps.permissoes.conhecerModulos(
        registry.listar().map((id) => ({
          id,
          permissions: [...(registry.permissoes().get(id) ?? [])],
        })),
      );
      const { concedidas, recusas } = deps.permissoes.aplicarPolitica();

      for (const recusa of recusas) {
        log.aviso('política recusada', {
          modulo: recusa.modulo,
          motivo: recusa.motivo,
        });
      }
      if (concedidas.length > 0 || recusas.length > 0) {
        log.info('política aplicada', {
          concedidas: concedidas.length,
          recusas: recusas.length,
        });
      }
    }

    const resultado = await ciclo.subir();
    const vivos = new Set(resultado.vivos);
    let rotas = 0;

    for (const route of registry.rotas()) {
      if (!vivos.has(route.modulo)) {
        log.aviso('rota omitida: módulo não está no ar', {
          rota: route.path,
          modulo: route.modulo,
        });
        continue;
      }
      adaptadores.router.register(route.path, route.view);
      rotas += 1;
    }

    const nav = registry.navegacao().filter((item) => vivos.has(item.modulo));
    adaptadores.renderNav?.(nav);

    for (const reference of registry.referenciasOrfas()) {
      log.aviso('referência fraca sem alvo', {
        modulo: reference.modulo,
        tipo: reference.tipo,
        alvo: reference.alvo,
      });
    }

    log.info('boot concluído', {
      modulos: resultado.vivos.length,
      rotas,
      nav: nav.length,
      falhas: resultado.falhas.length,
    });

    return { ...resultado, rotas, nav };
  }

  function diagnostico(): BootDiagnostic {
    const vivos = ciclo.vivos();
    return {
      fase: ciclo.fase,
      modulos: vivos.map((id) => {
        const manifest = registry.modulo(id);
        const ctx: ModuleContext | null = ciclo.contexto(id);
        return {
          id,
          nome: manifest?.name,
          versao: manifest?.version,
          estabilidade: manifest?.stability,
          rotas: manifest?.routes.map((route) => route.path) ?? [],
          permissoes: ctx?.declarado.permissoes ?? [],
          concedidas: ctx?.declarado.concedidas() ?? [],
          chaves: ctx?.declarado.chaves ?? [],
          emite: ctx?.declarado.emite ?? [],
        };
      }),
      falhas: ciclo.falhas(),
      eventosOrfaos: registry.eventosOrfaos(),
      referenciasOrfas: registry.referenciasOrfas(),
      metricas: deps.metricas?.retrato() ?? null,
      apis: deps.apis?.catalogo?.() ?? null,
      usoDeApi: deps.apis?.uso?.() ?? null,
      permissoes: deps.permissoes?.retrato() ?? null,
      decisoesDePermissao: deps.permissoes?.ultimasDecisoes(20) ?? null,
    };
  }

  return {
    subir,
    descer: () => ciclo.descer(),
    diagnostico,
    ciclo,
  };
}
