/**
 * Dependências dos mods da coleção — o que cada item exige para rodar.
 *
 * Indexado pelo **ID do item no Steam Workshop** (o mesmo de `A3COL_ITENS`), e
 * o valor é a lista de mods exigidos, por nome.
 *
 * `| undefined` no valor não é frescura: são 77 chaves para os 237 itens da
 * coleção, então a maioria dos ids **não está aqui** — a ausência significa "não
 * depende de nada declarado", e tratar isso como lista vazia garantida faria a
 * página iterar `undefined`.
 */

export const A3TUT_DEPS: Readonly<Record<string, readonly string[] | undefined>>;
