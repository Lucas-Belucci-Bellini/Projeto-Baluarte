/**
 * Syntax highlighter simples baseado em regex.
 * Funciona razoavelmente bem para todas as 26 linguagens definidas em editor-langs.js
 * sem precisar de dependência externa.
 *
 * Estratégia (issue #197 — reescrito como tokenizador de passada única):
 * 1. Um ÚNICO regex combinado encontra cada token no texto cru, em ordem de
 *    prioridade (comments → strings → numbers → palavras → pontuação).
 * 2. Cada token é escapado e vira um span `tk tk--<type>`; o texto entre
 *    tokens é só escapado. Nunca re-escaneamos HTML já gerado — era isso que
 *    quebrava o highlight antes (o regex de keywords casava com o `class=`
 *    dos spans de número, estourando o HTML em Java/JS/etc).
 * 3. Palavras seguidas de `(` ganham `tk--func` (cor de chamada de função,
 *    como no VS Code).
 * 4. Para HTML/XML: regras especiais para tags e atributos.
 * 5. Para Markdown: regras para headings, bold, italic, code, links.
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

/* Cache do regex combinado + set de keywords por linguagem (montar isso a
   cada tecla seria desperdício — a definição da linguagem nunca muda). */
const tokenizerCache = new Map();

function getTokenizer(lang) {
  const cached = tokenizerCache.get(lang.id);
  if (cached) return cached;

  /* Alternativas em ordem de prioridade. Grupos nomeados dizem o tipo. */
  const parts = [];

  if (lang.blockComment) {
    const open = escapeRegex(lang.blockComment.open);
    const close = escapeRegex(lang.blockComment.close);
    /* `|$` deixa um bloco ainda não fechado (usuário digitando) já colorido */
    parts.push(`(?<bcomment>${open}[\\s\\S]*?(?:${close}|$))`);
  }
  if (lang.lineComment) {
    parts.push(`(?<lcomment>${escapeRegex(lang.lineComment)}[^\\n]*)`);
  }
  if (lang.stringDelimiters && lang.stringDelimiters.length) {
    const alts = lang.stringDelimiters.map((delim) => {
      const d = escapeRegex(delim);
      /* Permite escape \x dentro da string */
      return `${d}(?:\\\\.|[^${d}\\\\\\n])*${d}`;
    });
    parts.push(`(?<string>${alts.join('|')})`);
  }
  parts.push('(?<number>\\b(?:0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+|\\d+\\.?\\d*(?:[eE][+-]?\\d+)?)\\b)');
  parts.push('(?<word>[A-Za-z_$][\\w$]*)');
  parts.push('(?<punct>[{}()\\[\\];,])');

  const keywords = new Set(
    (lang.keywords || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((k) => (lang.caseInsensitive ? k.toLowerCase() : k))
  );

  const tokenizer = { re: new RegExp(parts.join('|'), 'g'), keywords };
  tokenizerCache.set(lang.id, tokenizer);
  return tokenizer;
}

function highlightGeneric(text, lang) {
  const { re, keywords } = getTokenizer(lang);
  re.lastIndex = 0;

  let out = '';
  let last = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    /* Texto entre tokens: só escapa */
    out += escapeHtml(text.slice(last, m.index));

    const tok = m[0];
    const esc = escapeHtml(tok);
    const g = m.groups;

    if (g.bcomment != null || g.lcomment != null) {
      out += `<span class="tk tk--comment">${esc}</span>`;
    } else if (g.string != null) {
      out += `<span class="tk tk--string">${esc}</span>`;
    } else if (g.number != null) {
      out += `<span class="tk tk--number">${esc}</span>`;
    } else if (g.word != null) {
      const key = lang.caseInsensitive ? tok.toLowerCase() : tok;
      if (keywords.has(key)) {
        out += `<span class="tk tk--keyword">${esc}</span>`;
      } else if (/^[ \t]*\(/.test(text.slice(re.lastIndex, re.lastIndex + 16))) {
        /* identificador seguido de "(" = chamada/definição de função */
        out += `<span class="tk tk--func">${esc}</span>`;
      } else {
        out += esc;
      }
    } else {
      out += `<span class="tk tk--punct">${esc}</span>`;
    }

    last = re.lastIndex;
    /* Segurança contra match vazio (não deve acontecer, mas evita loop) */
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  out += escapeHtml(text.slice(last));

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
