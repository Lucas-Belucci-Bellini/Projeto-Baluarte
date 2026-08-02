/**
 * Ciclo de vida de página — o gancho de SAÍDA que faltava.
 *
 * O router monta uma tela e descarta a anterior (`shell.renderPage`), mas até
 * aqui não existia nenhum aviso de "sua tela está saindo". Sem esse aviso, cada
 * página que abre listener global, timer, oscilador ou loop de animação tinha
 * que inventar a própria despedida — e 19 delas inventaram a mesma coisa: um
 * `MutationObserver` vigiando `document.body` inteiro com `subtree: true`, só
 * pra descobrir que já não estavam no DOM.
 *
 * Isso custa caro e erra fácil:
 *
 *  - o observer roda a CADA mutação do documento, a página toda, enquanto a
 *    tela vive — pra responder uma pergunta que o shell já sabe de graça;
 *  - quem esquecia um listener na lista de limpeza vazava calado. Foi assim que
 *    `/codigo` passou a deixar um `mouseup` em `window` a cada visita, e que
 *    `/morse` ficou com o Play morto ao voltar: o estado de "tocando" era de
 *    módulo, sobrevivia à troca de tela e o botão novo se recusava a tocar.
 *
 * Aqui a pergunta é respondida no único lugar que realmente sabe a resposta: o
 * ponto de troca de tela.
 *
 * Uso, dentro da função que constrói a página:
 *
 *     const page = h('div', …);
 *     window.addEventListener('resize', onResize);
 *     aoSair(page, () => window.removeEventListener('resize', onResize));
 *     return page;
 *
 * A limpeza roda uma vez só, na ordem inversa do registro (o mais recente sai
 * primeiro, como um `defer`), e uma falha numa não impede as seguintes — meia
 * limpeza é melhor que nenhuma.
 */

/* WeakMap: se a página for descartada sem passar pelo shell (troca por outro
 * caminho, teste, app desktop), o registro vai junto com ela e não vira
 * vazamento no próprio mecanismo de evitar vazamento. */
const REGISTRO = new WeakMap();

/**
 * Registra uma limpeza para quando `el` sair da tela.
 * @param {Node} el       o elemento raiz devolvido pela página
 * @param {Function} fn   o que desfazer
 */
export function aoSair(el, fn) {
  if (!el || typeof fn !== 'function') return;
  const lista = REGISTRO.get(el);
  if (lista) lista.push(fn);
  else REGISTRO.set(el, [fn]);
}

/**
 * Executa as limpezas registradas para `el` e esquece o registro.
 * Chamado pelo shell na troca de tela — página nenhuma precisa chamar isto.
 * @returns {number} quantas limpezas rodaram (0 se a página não registrou nada)
 */
export function encerrar(el) {
  const lista = el && REGISTRO.get(el);
  if (!lista) return 0;
  REGISTRO.delete(el);                     // antes de rodar: reentrância não repete
  for (let i = lista.length - 1; i >= 0; i -= 1) {
    try {
      lista[i]();
    } catch (err) {
      /* Uma limpeza que explode não pode levar as outras junto nem derrubar a
       * navegação: a tela nova já está a caminho. */
      console.error('[ciclo-vida] falha ao encerrar a tela anterior:', err);
    }
  }
  return lista.length;
}

/** Só para teste: quantas limpezas `el` tem pendentes. */
export function pendentes(el) {
  return (el && REGISTRO.get(el)?.length) || 0;
}
