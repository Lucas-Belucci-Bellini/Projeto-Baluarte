/**
 * Catálogo da coleção Steam do operador — os 237 itens assinados.
 *
 * O módulo é **gerado** (`gerar-colecao.mjs`, a partir da Steam Web API
 * `GetPublishedFileDetails` + raspagem das páginas) e o cabeçalho do `.js` diz
 * "NÃO editar à mão". Por isso aqui há apenas a DECLARAÇÃO: converter o `.js`
 * obrigaria o gerador a emitir TypeScript, e gerador que emite tipo é gerador
 * que precisa saber de tipo — acoplamento sem ganho, para dado que é catálogo.
 *
 * ── Por que esta declaração existe ──────────────────────────────────────────
 * `wiki-arma3.d.ts` já importava `A3ColInfo` daqui, mas o arquivo não existia.
 * Como o portão roda com `skipLibCheck`, o import quebrado não virava erro: ele
 * virava `any` em silêncio, e `A3COL_INFO.nome` aceitava `number` sem reclamar.
 * Tipo que não recusa nada é tipo decorativo — que é justamente o que esta
 * migração existe para não produzir.
 *
 * As formas abaixo foram **medidas** sobre os 237 itens do catálogo, não
 * supostas: `guia` aparece em 95 deles e `dlcs` em 12, então os dois são
 * opcionais; todo o resto está presente nos 237.
 */

/** A coleção em si — o que a capa da wiki mostra na faixa "📦 Coleção". */
export interface A3ColInfo {
  /** ID da coleção no Workshop, o mesmo que aparece na `url`. */
  readonly id: string;
  readonly nome: string;
  readonly autor: string;
  readonly url: string;
}

/** Um recorte da coleção: mods, cenários, composições, terrenos, campanhas. */
export interface A3ColCategoria {
  readonly id: string;
  readonly nome: string;
  readonly icon: string;
  readonly desc: string;
}

/**
 * Um item assinado da coleção.
 *
 * `guia` é o texto original do autor, em inglês, direto do Workshop — só existe
 * para os itens **sem** tutorial escrito à mão (`temTutorial: false`), que é
 * exatamente por que ele é opcional: onde há tutorial próprio, o guia cru não
 * é publicado.
 */
export interface A3ColItem {
  readonly nome: string;
  /** Casa com `A3ColCategoria.id`. */
  readonly cat: string;
  /** Tamanho como a Steam informa, já formatado ("3 MB"). */
  readonly tam: string;
  /** Capa no CDN da Steam. */
  readonly img: string;
  readonly tags: readonly string[];
  /** Outros itens do Workshop exigidos por este. Vazio é comum. */
  readonly deps: readonly string[];
  readonly resumo: string;
  /** Se há tutorial escrito à mão na aba Mods (então `guia` não vem). */
  readonly temTutorial: boolean;
  readonly autor: string;
  /** Guia original do autor, em inglês. Presente em 95 dos 237 itens. */
  readonly guia?: string;
  /** DLCs exigidas. Presente em 12 dos 237 itens. */
  readonly dlcs?: readonly string[];
}

export const A3COL_INFO: A3ColInfo;
export const A3COL_CATS: readonly A3ColCategoria[];

/** Indexado pelo ID do item no Workshop — chave desconhecida devolve `undefined`. */
export const A3COL_ITENS: Readonly<Record<string, A3ColItem | undefined>>;

export const A3COL_TOTAL: number;
