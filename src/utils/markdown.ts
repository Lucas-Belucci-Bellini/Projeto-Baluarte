/**
 * Markdown → HTML mínimo, para o preview da página `/utilidades`.
 *
 * Mora fora de `pages/utilidades.js` para poder ser testado sem navegador — a
 * página importa CSS e não abre em Node puro. Um renderizador que produz HTML a
 * partir de texto de fora precisa de teste; é o tipo de código onde "parece
 * certo" não basta.
 *
 * ⚠️ A regra deste arquivo: **tudo que vem do texto é escapado ANTES** de
 * qualquer transformação (`escapar()`), e a única coisa que volta a ser
 * "confiável" são as tags que este código escreve. Se você adicionar uma regra
 * nova, ela opera sobre texto já escapado — nunca sobre o original.
 */

/* Escapa o que faz um texto virar markup. Roda primeiro, sobre tudo. */
function escapar(md: unknown): string {
  return String(md)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Filtra o destino de um link.
 *
 * Escapar `<`/`>`/`&` **não** protege um `href`: o conteúdo do atributo nunca
 * precisou de tag nenhuma. `[clique](javascript:alert(1))` produzia
 * `<a href="javascript:alert(1)">` e executava no clique — que é exatamente o
 * caminho de quem cola markdown de fora no preview.
 *
 * Regra: sem esquema (relativo, âncora, caminho) passa; com esquema, só os
 * navegáveis. Qualquer outro vira `#`, que é inerte e visível — o link continua
 * lá, só não faz nada.
 */
export function urlSegura(value: unknown): string {
  /* Caracteres de controle são REMOVIDOS antes de olhar o esquema: o navegador
   * também os ignora ao resolver a URL, então `java&#9;script:` chegaria a ser
   * executado enquanto uma checagem ingênua não veria esquema nenhum. */
  const limpa = String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
  if (!limpa) return '#';

  const temEsquema = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(limpa);
  if (!temEsquema) return limpa; // relativo / âncora / caminho
  return /^(?:https?|mailto):/i.test(limpa) ? limpa : '#';
}

/**
 * Converte um subconjunto de markdown em HTML.
 * O resultado é composto somente por tags escritas por este módulo e texto
 * escapado antes das transformações.
 */
export function mdToHtml(markdown: string): string {
  let source = escapar(markdown);

  /* Blocos de código ``` */
  source = source.replace(
    /```([\s\S]*?)```/g,
    (_match: string, code: string) => `<pre><code>${code.replace(/^\n/, '')}</code></pre>`,
  );

  /* Títulos */
  source = source
    .replace(/^###### (.*)$/gm, '<h6>$1</h6>')
    .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>');

  /* Listas */
  source = source.replace(/(?:^- .*(?:\n|$))+/gm, (block: string) => (
    '<ul>'
    + block.trim()
      .split('\n')
      .map((line: string) => `<li>${line.replace(/^- /, '')}</li>`)
      .join('')
    + '</ul>'
  ));

  /* Ênfase e código inline */
  source = source
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  /* Links — o destino passa pelo filtro de esquema. O texto já está escapado. */
  source = source.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_match: string, text: string, destination: string) => (
      `<a href="${urlSegura(destination)}" target="_blank" rel="noopener">${text}</a>`
    ),
  );

  /* Parágrafos */
  return source
    .split(/\n{2,}/)
    .map((block: string) => (
      /^<(h\d|ul|pre)/.test(block.trim())
        ? block
        : `<p>${block.replace(/\n/g, '<br>')}</p>`
    ))
    .join('\n');
}
