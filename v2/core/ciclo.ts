/**
 * Ciclo de vida dos módulos da V2.
 *
 * O Registry define o conjunto e sua ordem; este módulo executa as fases
 * `init → start` e, no desligamento, `stop → dispose` em ordem inversa.
 */

import { criarContexto } from './contexto.js';
import { criarLog } from './log.js';
import type { ModuleContext, ContextDependencies } from './contexto.js';
import type { LifecycleHandler, NormalizedModuleManifest } from './manifest.js';
import type { ModuleRegistry } from './registry.js';

export const TETO_INIT_MS = 10_000;

export type LifecycleStage = 'init' | 'start' | 'stop' | 'dispose';
export type LifecycleState = 'parado' | 'subindo' | 'no-ar' | 'descendo';

export interface LifecycleFailure {
  modulo: string;
  fase: LifecycleStage;
  motivo: string;
}

export interface LifecycleStartResult {
  ok: boolean;
  vivos: string[];
  falhas: LifecycleFailure[];
}

export interface LifecycleStopResult {
  ok: boolean;
  problemas: LifecycleFailure[];
}

export interface LifecycleOptions {
  tetoInitMs?: number;
}

export interface ModuleCycle {
  subir(): Promise<LifecycleStartResult>;
  descer(): Promise<LifecycleStopResult>;
  contexto(id: string): ModuleContext | null;
  vivos(): string[];
  falhas(): LifecycleFailure[];
  readonly fase: LifecycleState;
}

interface RunningModule {
  ctx: ModuleContext;
  manifesto: NormalizedModuleManifest;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function criarCiclo(
  registry: ModuleRegistry,
  deps: ContextDependencies,
  opcoes: LifecycleOptions = {},
): ModuleCycle {
  const teto = opcoes.tetoInitMs ?? TETO_INIT_MS;
  const log = criarLog('core:ciclo');
  const vivos = new Map<string, RunningModule>();
  let falhas: LifecycleFailure[] = [];
  let fase: LifecycleState = 'parado';

  async function executar(
    _id: string,
    fn: LifecycleHandler | undefined,
    ctx: ModuleContext,
    nome: LifecycleStage,
  ): Promise<void> {
    if (typeof fn !== 'function') return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const limite = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${nome} não terminou em ${teto}ms`)),
        teto,
      );
    });

    try {
      await Promise.race([Promise.resolve(fn(ctx)), limite]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  async function subir(): Promise<LifecycleStartResult> {
    if (fase !== 'parado') throw new Error(`ciclo já está "${fase}"`);
    fase = 'subindo';
    falhas = [];
    const mortos = new Set<string>();

    for (const id of registry.listar()) {
      const manifesto = registry.modulo(id);
      if (!manifesto) {
        throw new Error(`ciclo: módulo "${id}" está na ordem e não no registro`);
      }

      const quebradas = manifesto.dependencies.filter((dependency) =>
        mortos.has(dependency),
      );
      if (quebradas.length > 0) {
        mortos.add(id);
        falhas.push({
          modulo: id,
          fase: 'init',
          motivo: `dependência falhou: ${quebradas.join(', ')}`,
        });
        log.aviso('módulo desativado em cascata', {
          modulo: id,
          por: quebradas,
        });
        continue;
      }

      const ctx = criarContexto(manifesto, deps);
      try {
        await executar(id, manifesto.lifecycle.init, ctx, 'init');
        await executar(id, manifesto.lifecycle.start, ctx, 'start');
        vivos.set(id, { ctx, manifesto });
        log.debug('módulo no ar', { modulo: id });
      } catch (error) {
        mortos.add(id);
        falhas.push({
          modulo: id,
          fase: 'init',
          motivo: errorMessage(error),
        });
        log.erro('módulo falhou ao iniciar', error, { modulo: id });

        try {
          await executar(id, manifesto.lifecycle.dispose, ctx, 'dispose');
        } catch (disposeError) {
          log.aviso('dispose de módulo com init falho também falhou', {
            modulo: id,
            erro: errorMessage(disposeError),
          });
        }
      }
    }

    fase = 'no-ar';
    return {
      ok: falhas.length === 0,
      vivos: [...vivos.keys()],
      falhas: [...falhas],
    };
  }

  async function descer(): Promise<LifecycleStopResult> {
    if (fase !== 'no-ar') throw new Error(`ciclo está "${fase}", não no ar`);
    fase = 'descendo';
    const problemas: LifecycleFailure[] = [];

    for (const id of [...vivos.keys()].reverse()) {
      const modulo = vivos.get(id);
      if (!modulo) {
        throw new Error(`ciclo inconsistente: módulo "${id}" sumiu durante a descida`);
      }

      for (const nome of ['stop', 'dispose'] as const) {
        try {
          await executar(id, modulo.manifesto.lifecycle[nome], modulo.ctx, nome);
        } catch (error) {
          problemas.push({
            modulo: id,
            fase: nome,
            motivo: errorMessage(error),
          });
          log.erro(`falha no ${nome}`, error, { modulo: id });
        }
      }
    }

    vivos.clear();
    fase = 'parado';
    return { ok: problemas.length === 0, problemas };
  }

  return {
    subir,
    descer,
    contexto: (id: string): ModuleContext | null => vivos.get(id)?.ctx ?? null,
    vivos: (): string[] => [...vivos.keys()],
    falhas: (): LifecycleFailure[] => [...falhas],
    get fase(): LifecycleState {
      return fase;
    },
  };
}
