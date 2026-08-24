/**
 * Jarvis Style — humanizador de texto.
 *
 * Detecta e remove os padrões típicos de "texto de IA" (aberturas-clichê,
 * frases de preenchimento, vocabulário inflado, fechos genéricos) para a
 * resposta soar natural. Determinístico, sem dependências, pt-BR + inglês.
 *
 * ── Por que declaração, e não conversão ─────────────────────────────────────
 * O módulo é uma tabela de expressões regulares e duas funções puras sobre
 * texto. Declarar a fronteira tipa quem consome sem mexer nas regras, que são
 * o valor do arquivo.
 *
 * ── O detalhe que o tipo preserva ───────────────────────────────────────────
 * `humanize()` devolve a **entrada intacta** quando ela não é string — inclusive
 * `null` e `undefined`. Não é descuido: a função é chamada sobre respostas de
 * modelo que podem não ter chegado, e trocar isso por `''` apagaria a diferença
 * entre "não veio resposta" e "veio resposta vazia".
 */

/** Um padrão encontrado pela auditoria, com o trecho que casou (até 60 chars). */
export interface JarvisStyleAchado {
  readonly categoria: string;
  readonly trecho: string;
}

export interface JarvisStyleAuditoria {
  readonly count: number;
  readonly hits: readonly JarvisStyleAchado[];
}

/**
 * Limpa o texto removendo padrões de "texto de IA".
 *
 * Entrada que não é string volta **como veio** — ver o cabeçalho.
 */
export function humanize<T>(text: T): T extends string ? string : T;

/** Audita o texto e devolve os padrões encontrados. Não altera nada. */
export function detect(text: string | null | undefined): JarvisStyleAuditoria;
