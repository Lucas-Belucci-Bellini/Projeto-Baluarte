/**
 * Remove comentários de um fonte JS preservando strings (#420, item 8).
 *
 * Existe porque os geradores de catálogo varrem `src/**` atrás de literais —
 * nomes de evento, chaves de storage — e **comentário não é código**. Sem isto:
 *
 *   - o JSDoc de `core/events.js` traz `bus.on('arsenal:*')` como exemplo, e o
 *     catálogo de eventos nasceria com um ouvinte que não existe;
 *   - `core/supabase-auth.js` menciona `baluarte:auth:session` em prosa, e o
 *     catálogo de storage contaria um arquivo que só *fala* da chave.
 *
 * O caso que obriga a máquina de estados (em vez de um regex) é `'https://x'`:
 * a barra dupla mora DENTRO de uma string, e tratá-la como início de comentário
 * engoliria o resto do arquivo — junto com os literais de verdade que vêm
 * depois. Foi testado plantando exatamente isso.
 *
 * Não trata literal de regex (`/ab\/c/`). Não precisa: nenhum dos padrões
 * procurados aparece dentro de regex neste código, e um erro aqui só produziria
 * ruído no catálogo, nunca dado errado no produto.
 */
export function semComentarios(txt) {
  let saida = '';
  let estado = 'codigo';
  let aspa = '';
  for (let i = 0; i < txt.length; i += 1) {
    const c = txt[i];
    const prox = txt[i + 1];
    if (estado === 'codigo') {
      if (c === '/' && prox === '/') { estado = 'linha'; i += 1; continue; }
      if (c === '/' && prox === '*') { estado = 'bloco'; i += 1; continue; }
      if (c === "'" || c === '"' || c === '`') { estado = 'string'; aspa = c; }
      saida += c;
    } else if (estado === 'linha') {
      if (c === '\n') { estado = 'codigo'; saida += c; }
    } else if (estado === 'bloco') {
      if (c === '*' && prox === '/') { estado = 'codigo'; i += 1; }
    } else if (estado === 'string') {
      if (c === '\\') { saida += c + (prox ?? ''); i += 1; continue; }
      if (c === aspa) estado = 'codigo';
      saida += c;
    }
  }
  return saida;
}
