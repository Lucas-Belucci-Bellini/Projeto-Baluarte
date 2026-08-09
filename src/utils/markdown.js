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
function escapar(md) {
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
export function urlSegura(u) {
  /* Caracteres de controle são REMOVIDOS antes de olhar o esquema: o navegador
   * também os ignora ao resolver a URL, então `java&#9;script:` chegaria a ser
   * executado enquanto uma checagem ingênua não veria esquema nenhum. */
  const limpa = String(u == null ? '' : u).replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!limpa) return '#';

  const temEsquema = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(limpa);
  if (!temEsquema) return limpa;                          // relativo / âncora / caminho
  return /^(?:https?|mailto):/i.test(limpa) ? limpa : '#';
}

/**
 * Converte um subconjunto de markdown em HTML.
 * @param {string} md
 * @returns {string} HTML seguro para `innerHTML`
 */
export function mdToHtml(md) {
  let s = escapar(md);

  /* Blocos de código ``` */
  s = s.replace(/```([\s\S]*?)```/g, (m, c) => `<pre><code>${c.replace(/^\n/, '')}</code></pre>`);

  /* Títulos */
  s = s.replace(/^###### (.*)$/gm, '<h6>$1</h6>').replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>').replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');

  /* Listas */
  s = s.replace(/(?:^- .*(?:\n|$))+/gm, (b) =>
    '<ul>' + b.trim().split('\n').map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>');

  /* Ênfase e código inline */
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

  /* Links — o destino passa pelo filtro de esquema. O texto já está escapado. */
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, texto, destino) => `<a href="${urlSegura(destino)}" target="_blank" rel="noopener">${texto}</a>`);

  /* Parágrafos */
  return s.split(/\n{2,}/)
    .map((blk) => /^<(h\d|ul|pre)/.test(blk.trim()) ? blk : '<p>' + blk.replace(/\n/g, '<br>') + '</p>')
    .join('\n');
}
