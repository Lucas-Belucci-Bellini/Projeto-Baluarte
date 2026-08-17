/**
 * Procedência da extração do Arma 3 — quanto saiu do jogo, contado no dump.
 *
 * O módulo é **gerado** por `scripts/arma3/gerar-base-extracao.py` a partir dos
 * dumps em `scripts/arma3/out/`, e o CI regera e falha se divergir. Por isso
 * aqui há apenas a DECLARAÇÃO: converter o `.js` para `.ts` obrigaria o gerador
 * a emitir TypeScript, e gerador que emite tipo é gerador que precisa saber de
 * tipo — acoplamento sem ganho, para dado que é catálogo puro.
 *
 * `n` pode ser nulo: a página filtra as linhas sem número (`l.n != null`) em vez
 * de imprimir "0", porque ausência de medida não é medida zero.
 */

/** Uma linha do placar: o rótulo, o número medido e a ressalva. */
export interface A3ExtLinha {
  readonly rot: string;
  readonly n: number | null;
  readonly nota: string | null;
}

/** Um bloco do painel, com o `.rpt` de origem declarado. */
export interface A3ExtBloco {
  readonly id: string;
  readonly titulo: string;
  /** O arquivo `.rpt` de onde a contagem saiu — é o que sustenta "medido". */
  readonly rpt: string;
  readonly linhas: readonly A3ExtLinha[];
}

/**
 * O que já foi extraído e **ainda não tem tela própria**.
 *
 * Declarar a fila é parte da honestidade do painel: o dado existe no repo, a
 * tela é que não. Sumir com isso daria impressão de acervo completo.
 */
export interface A3ExtPendente {
  readonly rot: string;
  readonly n: number;
  readonly rpt: string;
}

export const A3EXT_BLOCOS: readonly A3ExtBloco[];
export const A3EXT_FILA: readonly A3ExtPendente[];
