/**
 * O Runtime visto do renderer — o que atravessa aqui é IPC, não stdio.
 *
 * O boot da V2 roda no renderer; o processo Rust vive no `main` do Electron.
 * Entre os dois há a ponte do `desktop/src/ipc.js` (`runtime:*`). Este módulo é
 * o adaptador que transforma aquela ponte na forma que o `ModuleContext` espera
 * em `deps.runtime`: `{ lerArquivo(modulo, caminho) }`.
 *
 * ── Por que devolve `null` fora do app ──────────────────────────────────────
 * No navegador não existe `window.baluarte`, e não existe processo com quem
 * falar. Devolver `null` faz `deps.runtime` ficar indefinido, e o contexto do
 * módulo volta a ser exatamente o de antes — sem alça de Runtime. É o mesmo
 * princípio do mega-plano #238: web leve, app completo. Um adaptador que
 * fingisse existir na web daria aos módulos uma alça que sempre falha, o que é
 * pior do que não ter alça nenhuma.
 *
 * ── Por que o envelope é remontado a cada chamada ───────────────────────────
 * Concessão muda em runtime. Um envelope montado uma vez no boot responderia
 * sobre o passado: revogar uma permissão não alcançaria o módulo, e conceder
 * também não. É a mesma razão pela qual `declarado.concedidas` é função e não
 * valor no `contexto.js`.
 */

import { criarCargaRuntime } from './runtime-bootstrap.js';

/** @typedef {{native?: boolean, invoke?: (canal: string, payload: unknown) => Promise<any>}} PonteApp */

/**
 * @param {any} registry
 * @param {any} permissoes
 * @param {PonteApp|undefined} ponte normalmente `window.baluarte`
 * @returns {{lerArquivo: (modulo: string, caminho: string) => Promise<Record<string, unknown>>}|null}
 */
export function criarRuntimeApp(registry, permissoes, ponte) {
  /* As duas condições são separadas de propósito: `native` diz "estou no app", e
   * `invoke` diz "a ponte é usável". Uma sem a outra é ambiente meio montado, e
   * meio montado tem que ser tratado como ausente — não como disponível. */
  if (!ponte || ponte.native !== true || typeof ponte.invoke !== 'function') return null;

  const invoke = ponte.invoke.bind(ponte);

  return {
    lerArquivo: (modulo, caminho) =>
      invoke('runtime:ler', {
        envelope: criarCargaRuntime(registry, permissoes),
        modulo,
        path: caminho
      })
  };
}
