/**
 * Ciclo de vida dos módulos da V2.
 *
 * O Registry define o conjunto e sua ordem; este módulo executa as fases
 * `init → start` e, no desligamento, `stop → dispose` em ordem inversa.
 *
 * ── O Runtime Host entra antes do `init` ────────────────────────────────────
 * O contrato de `docs/v2/V2_LIFECYCLE_RUNTIME_CONTRACT.md` já dizia a ordem:
 *
 *   Registry selado → Runtime.open → module.init → module.start
 *   module.stop → Runtime.close → module.dispose
 *
 * mas nada a executava. O `criarLifecycleRuntime` — o Host por módulo — existia,
 * era testado, e tinha **um** consumidor de produção (`vertical-slice.js`), que
 * não é o caminho por onde os módulos sobem. O ciclo real ia direto ao `init`.
 *
 * A consequência é o que este arquivo passa a impedir: um módulo era declarado
 * `running` sem que a autorização dele tivesse sido produzida uma única vez. O
 * retrato dizia "no ar" sobre um módulo que o Runtime nunca autorizou.
 *
 * O Host é **opcional** de propósito — sem ele o ciclo se comporta como antes,
 * o que mantém honesto quem sobe sem Runtime (testes de unidade de outras
 * peças). Mas opcional que ninguém passa foi justamente a doença anterior:
 * o entrypoint da V2 (`v2/harness/main.js`) passa um Host real.
 */

import { criarContexto } from './contexto.js';
import { criarLog } from './log.js';
import type { ModuleContext, ContextDependencies } from './contexto.js';
import type { LifecycleHandler, NormalizedModuleManifest } from './manifest.js';
import type { ModuleRegistry } from './registry.js';

export const TETO_INIT_MS = 10_000;

/* `runtime` é a fase da abertura/fechamento do Host. Fica no vocabulário para
 * que a falha diga a verdade: quando a autorização não sai, `init` NÃO rodou, e
 * relatar `init` seria acusar o módulo por algo que aconteceu antes dele. */
export type LifecycleStage = 'runtime' | 'init' | 'start' | 'stop' | 'dispose';
export type LifecycleState = 'parado' | 'subindo' | 'no-ar' | 'descendo';

/**
 * Runtime Host por módulo — a superfície que `criarLifecycleRuntime` devolve.
 *
 * O ciclo depende da forma, não da implementação: quem abre pode ser o Host com
 * transporte real, o de autorização-sem-transporte do entrypoint, ou um duplo de
 * teste. É a mesma razão de o transporte ser injetável uma camada abaixo.
 */
export interface RuntimeHost {
  abrir(id: string): Promise<void>;
  fechar(id: string): Promise<void>;
}

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
  runtime?: RuntimeHost;
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
  const runtime = opcoes.runtime;
  const log = criarLog('core:ciclo');
  const vivos = new Map<string, RunningModule>();
  let falhas: LifecycleFailure[] = [];
  let fase: LifecycleState = 'parado';

  /* O teto saiu de dentro do `executar` porque a abertura do Host precisa do
   * mesmo limite: um Runtime que não responde pendura a subida exatamente como
   * um `init` que trava — e esse é o defeito que o teto existe para pegar. */
  async function comTeto<T>(fn: () => Promise<T> | T, nome: LifecycleStage): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const limite = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new Error(`${nome} não terminou em ${teto}ms`)),
        teto,
      );
    });

    try {
      return await Promise.race([Promise.resolve(fn()), limite]);
    } finally {
      if (timer !== undefined) clearTimeout(timer);
    }
  }

  async function executar(
    _id: string,
    fn: LifecycleHandler | undefined,
    ctx: ModuleContext,
    nome: LifecycleStage,
  ): Promise<void> {
    if (typeof fn !== 'function') return;
    await comTeto(() => fn(ctx), nome);
  }

  /* Sem Host, no-op: o ciclo segue sendo o de antes. Com Host, a autorização é
   * pré-condição da subida — quem não abre não chega ao `init`. */
  async function abrirRuntime(id: string): Promise<void> {
    if (!runtime) return;
    await comTeto(() => runtime.abrir(id), 'runtime');
  }

  async function fecharRuntime(id: string): Promise<void> {
    if (!runtime) return;
    await comTeto(() => runtime.fechar(id), 'runtime');
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
      /* A fase começa em `runtime` e só avança quando o Host abriu. Sem esta
       * variável a falha do Host seria reportada como `init` — o mesmo rótulo
       * de um defeito do módulo, para uma causa que é do sistema. */
      let etapa: LifecycleStage = 'runtime';
      try {
        await abrirRuntime(id);
        etapa = 'init';
        await executar(id, manifesto.lifecycle.init, ctx, 'init');
        await executar(id, manifesto.lifecycle.start, ctx, 'start');
        vivos.set(id, { ctx, manifesto });
        log.debug('módulo no ar', { modulo: id });
      } catch (error) {
        mortos.add(id);
        falhas.push({
          modulo: id,
          fase: etapa,
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
        } finally {
          /* Fecha o Host mesmo com a subida falha — senão uma sessão aberta
           * sobrevive a um módulo que não existe. `fechar` de quem não abriu é
           * no-op, então o caminho em que o PRÓPRIO `abrir` falhou é seguro. */
          try {
            await fecharRuntime(id);
          } catch (fecharError) {
            log.aviso('fechar Runtime de módulo com subida falha também falhou', {
              modulo: id,
              erro: errorMessage(fecharError),
            });
          }
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

      /* A ordem é do contrato: `stop` → `Runtime.close` → `dispose`. O Runtime
       * fecha ANTES do descarte para que os recursos de execução acabem
       * enquanto a instância que os pediu ainda existe. */
      try {
        await executar(id, modulo.manifesto.lifecycle.stop, modulo.ctx, 'stop');
      } catch (error) {
        problemas.push({ modulo: id, fase: 'stop', motivo: errorMessage(error) });
        log.erro('falha no stop', error, { modulo: id });
      }

      /* Cada passo tem `try` próprio, e não um `for` sobre as fases: `stop` que
       * falha não pode impedir o Runtime de fechar nem o módulo de ser
       * descartado — desligamento que desiste no primeiro erro vaza o resto. */
      try {
        await fecharRuntime(id);
      } catch (error) {
        problemas.push({ modulo: id, fase: 'runtime', motivo: errorMessage(error) });
        log.erro('falha ao fechar o Runtime', error, { modulo: id });
      }

      try {
        await executar(id, modulo.manifesto.lifecycle.dispose, modulo.ctx, 'dispose');
      } catch (error) {
        problemas.push({ modulo: id, fase: 'dispose', motivo: errorMessage(error) });
        log.erro('falha no dispose', error, { modulo: id });
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
