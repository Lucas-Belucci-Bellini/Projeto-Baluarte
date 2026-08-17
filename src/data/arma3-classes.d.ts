/**
 * O classname do Arma 3, explicado pedaço por pedaço.
 *
 * `arifle_MX_ACO_pointer_F` é ruído para quem não decorou a convenção — mas o
 * nome É estruturado: o prefixo diz o slot, os pedaços do meio dizem a óptica e
 * o acessório montados de fábrica.
 *
 * ── O campo `ev` é o mais importante daqui ──────────────────────────────────
 * Ele separa o que o **engine** usa do que é **convenção observada**. O prefixo
 * de arma o engine realmente lê para escolher o slot (`ev: 'slot'`); o resto é
 * padrão que a comunidade seguiu e o config não declara. Apagar essa distinção
 * transformaria observação em regra, e a página exibe os dois com rótulos
 * diferentes justamente por isso.
 */

/** De onde o pedaço tira sentido: regra do engine, ou convenção observada. */
export type A3ClsEvidencia = 'slot' | 'convencao';

/** Uma entrada do dicionário de prefixos (o pedaço inicial da classe). */
export interface A3ClsPrefixo {
  readonly p: string;
  readonly nome: string;
  readonly desc: string;
  readonly ev: A3ClsEvidencia;
}

/** Uma entrada do dicionário de sufixos (o pedaço final). */
export interface A3ClsSufixo {
  readonly s: string;
  readonly nome: string;
  readonly desc: string;
  readonly ev: A3ClsEvidencia;
}

/** Óptica ou acessório que o nome declara como montado de fábrica. */
export interface A3ClsMontado {
  readonly p: string;
  readonly nome: string;
  readonly desc: string;
  readonly ev: A3ClsEvidencia;
}

/** Um pedaço reconhecido dentro de um classname. */
export interface A3ClsParte {
  /** O trecho literal da classe, preservando maiúsculas. */
  readonly texto: string;
  readonly nome: string;
  readonly desc: string;
  readonly tipo: 'prefixo' | 'sufixo' | 'montado';
  readonly ev: A3ClsEvidencia;
}

/**
 * Só entra pedaço que casa com o dicionário.
 *
 * Meia explicação verdadeira vale mais que uma inteira inventada: classe de mod
 * que não segue a convenção devolve `partes` vazio, e a página simplesmente não
 * mostra o bloco — em vez de adivinhar.
 */
export interface A3ClsExplicacao {
  readonly partes: readonly A3ClsParte[];
}

/** O contexto muda o sentido de alguns pedaços (soldado ≠ veículo ≠ item). */
export type A3ClsContexto = 'item' | 'soldado' | 'veiculo';

export const A3CLS_PREFIXOS: readonly A3ClsPrefixo[];
export const A3CLS_SUFIXOS: readonly A3ClsSufixo[];
export const A3CLS_MONTADOS: readonly A3ClsMontado[];

/**
 * Entrada inválida devolve `{ partes: [] }` — não lança.
 *
 * A página chama isto com um campo que pode não existir
 * (`(art.arma || art.veiculo || …).classe`), então a ausência é caso normal, e
 * não erro. É por isso que o parâmetro aceita valores fora de `string`.
 */
export function explicarClasse(
  classe: string | null | undefined,
  contexto?: A3ClsContexto,
): A3ClsExplicacao;

/** Frase curta para tooltip: "fuzil de assalto · ACO montado · Arma 3". */
export function resumirClasse(
  classe: string | null | undefined,
  contexto?: A3ClsContexto,
): string;
