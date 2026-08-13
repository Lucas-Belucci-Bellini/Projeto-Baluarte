/**
 * A view do módulo — e o primeiro lugar onde a ergonomia da V2 é testada.
 *
 * ── O que muda em relação a uma página da V1 ────────────────────────────────
 * Ela **não importa nada do Core**. Recebe `estado.ctx` e usa o que está lá:
 * storage recortado, métricas carimbadas, escalonador, bus, log. Se precisar de
 * algo que o contexto não dá, isso é sinal de que falta declarar no manifesto —
 * não de que falta importar um arquivo.
 *
 * É a diferença prática entre módulo e página: a página da V1 alcança tudo; o
 * módulo alcança o que declarou.
 *
 * ── Duas decisões de UI que são de arquitetura ──────────────────────────────
 *
 * **Cifrar vai para o escalonador, não roda direto.** PBKDF2 com 100 000
 * iterações trava a aba por centenas de milissegundos. No escalonador ele
 * divide vaga com o resto do Baluarte em vez de monopolizar a thread — e ganha
 * cancelamento de graça.
 *
 * **Sem `innerHTML`.** Mesma regra do shell da V1: o texto vem do operador, e
 * texto de operador que vira marcação é injeção.
 *
 * ── O primeiro achado de ergonomia, e ele foi meu ───────────────────────────
 * Escrevi `ctx.usarMotor.cifrar(...)` por reflexo, procurando o motor DENTRO do
 * contexto. Não existe — e não deve existir. `ctx.usar()` inclusive recusa a
 * própria api, com a mensagem "não precisa de usar() para a própria api".
 *
 * O contrato governa **atravessar fronteira de módulo**. Dentro do módulo, o
 * caminho é o import de sempre: `import { cifrar } from './motor.js'`. Confundir
 * os dois é fácil justamente porque a arquitetura fala tanto de contrato que dá
 * a impressão de que tudo passa por ele — e a correção vale mais registrada do
 * que apagada.
 */

import { cifrar, decifrar, hash } from './motor.js';

/**
 * `@template` em vez de `string`: assim `h('textarea', …)` devolve
 * `HTMLTextAreaElement` e `entrada.value` é conhecido. Com `tag: string` o
 * retorno é `HTMLElement` genérico, e o verificador reprova o acesso a `.value`
 * — corretamente, porque nem todo elemento tem.
 *
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, any>} [attrs]
 * @param {...any} filhos
 * @returns {HTMLElementTagNameMap[K]}
 */
function h(tag, attrs = {}, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (v !== undefined && v !== null) el.setAttribute(k, String(v));
  }
  for (const f of filhos.flat()) {
    if (f === null || f === undefined || f === false) continue;
    el.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
  }
  return el;
}

/**
 * @param {{ctx: any, painel: string}|null} estado o que o `init()` guardou —
 * `null` quando o módulo não subiu, e esse caso é tratado logo abaixo
 * @param {any} [_args]
 */
export function criarView(estado, _args) {
  /* Sem estado, o módulo não subiu. Falhar alto aqui é melhor que renderizar
   * uma tela morta que parece funcionar. */
  if (!estado?.ctx) {
    throw new Error('cripto: view pedida antes do init — o módulo não está no ar');
  }
  const { ctx } = estado;

  const entrada = h('textarea', {
    className: 'cripto-entrada', rows: '4', placeholder: 'texto', 'aria-label': 'Texto'
  });
  const senha = h('input', { type: 'password', placeholder: 'senha', 'aria-label': 'Senha' });
  const saida = h('pre', { className: 'cripto-saida', 'aria-live': 'polite' });
  const aviso = h('p', { className: 'cripto-aviso', role: 'status' });

  /** @type {AbortController|null} */
  let emCurso = null;

  /**
   * Roda uma operação do motor pelo escalonador.
   *
   * Cancela a anterior antes de começar: sem isso, clicar duas vezes deixa duas
   * derivações de chave competindo e a resposta que aparece é a que terminar
   * por último — não a que o operador pediu por último.
   *
   * @param {string} rotulo
   * @param {(sinal: AbortSignal) => Promise<string>} fn
   */
  async function operar(rotulo, fn) {
    emCurso?.abort();
    const ctrl = new AbortController();
    emCurso = ctrl;

    aviso.textContent = 'trabalhando…';
    saida.textContent = '';

    try {
      const r = await ctx.trabalho.fazer(
        rotulo,
        (/** @type {{sinal?: AbortSignal}} */ { sinal }) => fn(sinal ?? ctrl.signal),
        { prioridade: ctx.trabalho.INTERATIVO, sinal: ctrl.signal }
      );
      if (ctrl.signal.aborted) return;      // chegou tarde: outro pedido venceu
      saida.textContent = r;
      aviso.textContent = '';
      ctx.metricas.contar(`cripto_${rotulo}`);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      /* Mensagem para o operador, detalhe para o log. Jogar o `err` cru na tela
       * mostra stack a quem quer saber se a senha está errada. */
      aviso.textContent = err instanceof Error ? err.message : 'não deu certo';
      ctx.log.erro(`falha em ${rotulo}`, err);
      ctx.metricas.contar('cripto_falha', { op: rotulo });
    } finally {
      if (emCurso === ctrl) emCurso = null;
    }
  }

  const botoes = h('div', { className: 'cripto-botoes' },
    h('button', {
      type: 'button',
      onclick: () => operar('cifrar', async () => {
        const r = await cifrar(entrada.value, senha.value);
        /* Anuncia sem o conteúdo: evento com texto cifrado vira vazamento pelo
         * caminho de quem observa. */
        ctx.bus?.emit('cripto:cifrou', { tamanho: entrada.value.length });
        return r;
      })
    }, 'Cifrar'),

    h('button', {
      type: 'button',
      onclick: () => operar('decifrar', async () => {
        const r = await decifrar(entrada.value, senha.value);
        ctx.bus?.emit('cripto:decifrou', { tamanho: r.length });
        return r;
      })
    }, 'Decifrar'),

    h('button', {
      type: 'button',
      onclick: () => operar('hash', () => hash(entrada.value))
    }, 'SHA-256')
  );

  return h('div', { className: 'modulo-cripto' },
    h('h1', {}, 'Lab de Criptografia'),
    h('p', { className: 'u-text-muted' }, 'AES-GCM com PBKDF2. O texto não sai do navegador.'),
    entrada, senha, botoes, aviso, saida
  );
}
