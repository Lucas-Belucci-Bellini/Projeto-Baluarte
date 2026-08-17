/**
 * Fim de linha, para os verificadores de catálogo compararem texto.
 *
 * ── O defeito ───────────────────────────────────────────────────────────────
 * Os três geradores (`gen-tabela-estabilidade`, `gen-catalogo-eventos`,
 * `gen-catalogo-storage`) montam o documento com `join('\n')` e, no
 * `--verificar`, comparam a string gerada com o que o `readFileSync` traz do
 * disco. Em qualquer checkout Windows o disco tem **CRLF**: não há
 * `.gitattributes` no repositório, então o `core.autocrlf` do git converte na
 * hora do checkout. A comparação então falha por `\r`, e por mais nada.
 *
 * O sintoma é traiçoeiro porque a mensagem manda fazer a coisa errada: *"rode o
 * gerador e commite o resultado"*. Regenerar não muda linha nenhuma — o
 * `git diff` sai vazio, porque o git converte de volta na escrita. O operador
 * fica olhando um vermelho que não tem conteúdo, com um conserto que não
 * conserta.
 *
 * No Linux não há conversão, então o CI é verde e o defeito é invisível de um
 * lado só — a assimetria que a `docs/HANDOFF-REMOTO.md` chama de família
 * "Windows". Confirmado como pré-existente rodando os três contra o
 * `origin/main` puro, com o CI verde no mesmo SHA.
 *
 * ── Por que normalizar em vez de renormalizar o repositório ──────────────────
 * Um `.gitattributes` com `*.md text eol=lf` também resolveria, e resolveria a
 * classe inteira do problema — mas mexe em todo `.md` versionado. As duas saídas
 * têm alcance diferente e a escolha é do operador; esta é a cirúrgica, e não
 * impede a outra depois.
 *
 * ── O que este helper NÃO faz ───────────────────────────────────────────────
 * Não muda o que é **escrito**. O caminho de escrita continua emitindo `\n`, e é
 * o git que decide o que vai para o disco. Isto vale só para a COMPARAÇÃO: a
 * pergunta que o `--verificar` faz é "o conteúdo divergiu?", e fim de linha não
 * é conteúdo.
 */

/**
 * Devolve o texto com os fins de linha normalizados para `\n`.
 *
 * Só `\r\n` — não trata `\r` solitário (Mac OS 9), que o git não produz em
 * checkout e que não apareceria aqui sem alguém tê-lo commitado de propósito.
 *
 * @param {string} texto
 * @returns {string}
 */
export function comLF(texto) {
  return texto.replace(/\r\n/g, '\n');
}

/**
 * Os dois textos são iguais ignorando o fim de linha?
 *
 * Existe para que o local da chamada diga a intenção — `mesmoConteudo(a, b)` é
 * a pergunta que o `--verificar` faz. Comparar `comLF(a) !== comLF(b)` na mão
 * funciona igual, mas convida a esquecer um dos lados.
 *
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function mesmoConteudo(a, b) {
  return comLF(a) === comLF(b);
}
