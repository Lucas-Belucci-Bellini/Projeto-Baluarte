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
 * @param {ReturnType<typeof import('./registry.js').criarRegistry>} registry selado
 * @param {import('./contexto.js').Deps} deps
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
          chaves: ctx?.declarado.chaves ?? [],
          emite: ctx?.declarado.emite ?? []
        };
      }),
      falhas: ciclo.falhas(),
      eventosOrfaos: registry.eventosOrfaos()
    };
  }

  return { subir, descer: () => ciclo.descer(), diagnostico, ciclo };
}
