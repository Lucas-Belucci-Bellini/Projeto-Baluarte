/**
 * Syntax highlighter simples baseado em regex.
 * Funciona razoavelmente bem para todas as 26 linguagens definidas em editor-langs.js
 * sem precisar de dependência externa.
 *
 * Estratégia:
 * 1. Tokeniza em ordem de prioridade (comments → strings → numbers → keywords → identifiers).
 * 2. Cada token recebe um span com classe `tk tk--<type>`.
 * 3. Para HTML/XML: regras especiais para tags e atributos.
 * 4. Para Markdown: regras para headings, bold, italic, code, links.
 *
 * Saída: HTML escapado e com spans de cor.
 */

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ===== Highlighters específicos ===== */

function highlightMarkup(text) {
  /* HTML/XML */
  let out = escapeHtml(text);

  /* Comentários <!-- --> */
  out = out.replace(
    /&lt;!--[\s\S]*?--&gt;/g,
    (m) => `<span class="tk tk--comment">${m}</span>`
  );

  /* Tags com atributos: <tag attr="value"> */
  out = out.replace(
    /(&lt;\/?)([a-zA-Z][\w-]*)([^&]*?)(\/?&gt;)/g,
    (_m, lt, tag, attrs, gt) => {
      const attrColored = attrs.replace(
        /([a-zA-Z-]+)(=)(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;|"[^"]*?"|'[^']*?')/g,
        '<span class="tk tk--attr">$1</span><span class="tk tk--punct">$2</span><span class="tk tk--string">$3</span>'
      );
      return `<span class="tk tk--punct">${lt}</span><span class="tk tk--keyword">${tag}</span>${attrColored}<span class="tk tk--punct">${gt}</span>`;
    }
  );

  return out;
}

function highlightMarkdown(text) {
  let out = escapeHtml(text);

  /* Code fences ``` */
  out = out.replace(
    /(^|\n)(```[\s\S]*?```)/g,
    (_m, pre, code) => `${pre}<span class="tk tk--code">${code}</span>`
  );

  /* Headings */
  out = out.replace(
    /(^|\n)(#{1,6}\s.+)/g,
    (_m, pre, h) => `${pre}<span class="tk tk--heading">${h}</span>`
  );

  /* Bold **x** */
  out = out.replace(
    /\*\*([^*\n]+)\*\*/g,
    '<span class="tk tk--bold">**$1**</span>'
  );

  /* Italic *x* */
  out = out.replace(
    /(?<!\*)\*([^*\n]+)\*(?!\*)/g,
    '<span class="tk tk--italic">*$1*</span>'
  );

  /* Inline code `x` */
  out = out.replace(/`[^`\n]+`/g, '<span class="tk tk--code">$&</span>');

  /* Links [text](url) */
  out = out.replace(
    /(\[)([^\]]+)(\]\()([^)]+)(\))/g,
    '<span class="tk tk--punct">$1</span><span class="tk tk--string">$2</span><span class="tk tk--punct">$3</span><span class="tk tk--link">$4</span><span class="tk tk--punct">$5</span>'
  );

  return out;
}

function highlightGeneric(text, lang) {
  /* 1. Escape HTML */
  let out = escapeHtml(text);

  /* 2. Comentários (fazemos com placeholders pra não conflitar) */
  const placeholders = [];
  function stash(html) {
    const idx = placeholders.length;
    placeholders.push(html);
    return `\x01${idx}\x02`;
  }

  /* Block comments */
  if (lang.blockComment) {
    const open = escapeRegex(escapeHtml(lang.blockComment.open));
    const close = escapeRegex(escapeHtml(lang.blockComment.close));
    out = out.replace(
      new RegExp(`${open}[\\s\\S]*?${close}`, 'g'),
      (m) => stash(`<span class="tk tk--comment">${m}</span>`)
    );
  }

  /* Line comments */
  if (lang.lineComment) {
    const lc = escapeRegex(escapeHtml(lang.lineComment));
    out = out.replace(
      new RegExp(`${lc}[^\\n]*`, 'g'),
      (m) => stash(`<span class="tk tk--comment">${m}</span>`)
    );
  }

  /* Strings (vários delimitadores) */
  for (const delim of lang.stringDelimiters || []) {
    const d = escapeHtml(delim);
    /* Permite escape \x dentro da string */
    out = out.replace(
      new RegExp(`${escapeRegex(d)}(?:\\\\.|[^${escapeRegex(d)}\\\\\\n])*${escapeRegex(d)}`, 'g'),
      (m) => stash(`<span class="tk tk--string">${m}</span>`)
    );
  }

  /* Números */
  out = out.replace(
    /\b(0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+|\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g,
    '<span class="tk tk--number">$1</span>'
  );

  /* Keywords */
  if (lang.keywords) {
    const kws = lang.keywords.split(/\s+/).filter(Boolean).map(escapeRegex);
    if (kws.length) {
      const flags = lang.caseInsensitive ? 'gi' : 'g';
      const re = new RegExp(`\\b(${kws.join('|')})\\b`, flags);
      out = out.replace(re, '<span class="tk tk--keyword">$1</span>');
    }
  }

  /* Operadores e pontuação simples */
  out = out.replace(
    /([{}()\[\];,])/g,
    '<span class="tk tk--punct">$1</span>'
  );

  /* Restaura placeholders */
  out = out.replace(/\x01(\d+)\x02/g, (_m, i) => placeholders[Number(i)]);

  return out;
}

/**
 * Highlight de uma string conforme a linguagem.
 * @param {string} text
 * @param {object} lang - definição de editor-langs.js
 * @returns {string} HTML pronto para inserir
 */
export function highlight(text, lang) {
  if (!text) return '';
  if (lang.isMarkdown) return highlightMarkdown(text);
  if (lang.isMarkup) return highlightMarkup(text);
  return highlightGeneric(text, lang);
}
