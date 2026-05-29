/**
 * Jarvis Style — humanizador de texto.
 *
 * Conceito do **avoid-ai-writing** (conorbronsdon): detectar e remover os
 * padrões típicos de "texto de IA" (aberturas-clichê, frases de preenchimento,
 * vocabulário inflado, fechos genéricos) para a resposta soar natural.
 *
 * Determinístico, sem dependências, pt-BR + inglês. Conservador de propósito:
 * só mexe no que é seguro, preservando o sentido.
 *
 *   humanize(texto)  → texto limpo
 *   detect(texto)    → { count, hits:[{categoria, trecho}] } (modo auditoria)
 */

/* Aberturas-clichê (removidas no início do texto). */
const OPENERS = [
  { re: /^\s*(?:claro|com certeza|certamente|sem dúvida|ótima pergunta|excelente pergunta|boa pergunta|com prazer)[!.,…]*\s+/i, label: 'abertura-clichê' },
  { re: /^\s*(?:vamos (?:mergulhar|explorar|dar uma olhada)|sem mais delongas|antes de mais nada)[!.,…:]*\s+/i, label: 'abertura-clichê' },
  { re: /^\s*(?:certainly|sure|absolutely|of course|great question|excellent question)[!.,…]*\s+/i, label: 'opener' },
  { re: /^\s*(?:let'?s dive (?:in|into)|without further ado)[!.,…:]*\s+/i, label: 'opener' },
  { re: /^\s*(?:as an ai(?: language model)?|como (?:uma? )?(?:ia|modelo de linguagem))[,]?\s*/i, label: 'meta-IA' }
];

/* Fechos genéricos (removidos no fim do texto). */
const CLOSERS = [
  { re: /\s*(?:espero que (?:isso |isto )?(?:ajude|tenha ajudado|seja útil)[!.…]*)\s*$/i, label: 'fecho-clichê' },
  { re: /\s*(?:se (?:tiver|você tiver|houver) (?:mais )?(?:alguma )?(?:dúvida|pergunta|questão)s?,?[^.!?]*[.!?]?)\s*$/i, label: 'fecho-clichê' },
  { re: /\s*(?:i hope this helps[!.…]*|feel free to ask[^.!?]*[.!?]?|let me know if you[^.!?]*[.!?]?)\s*$/i, label: 'closer' }
];

/* Frases de preenchimento (removidas inline; recapitaliza a próxima palavra). */
const FILLER = [
  { re: /(^|[.!?]\s+)(?:é importante (?:notar|ressaltar|lembrar|destacar) que|vale (?:a pena )?(?:notar|ressaltar|mencionar|lembrar) que|cabe (?:notar|ressaltar) que)\s+(\p{L})/giu, label: 'preenchimento' },
  { re: /(^|[.!?]\s+)(?:no (?:mundo|cenário) (?:de hoje|atual)|nos dias de hoje|na era (?:digital|moderna))[,]?\s+(\p{L})/giu, label: 'preenchimento' },
  { re: /(^|[.!?]\s+)(?:it'?s important to (?:note|remember) that|it is worth noting that|needless to say,?|in today'?s (?:world|landscape))[,]?\s+(\p{L})/giu, label: 'filler' }
];

/* Vocabulário inflado → palavra simples (mantém o sentido). */
const VOCAB = [
  [/\butiliz(a|am|ar|e)\b/gi, (m, s) => ({ a: 'usa', am: 'usam', ar: 'usar', e: 'use' }[s] || 'usar')],
  [/\baproveitar ao máximo\b/gi, () => 'aproveitar'],
  [/\bde forma (?:robusta|perfeita|impecável)\b/gi, () => 'bem'],
  [/\brobust([ao])\b/gi, (m, g) => 'sólid' + g],
  [/\bperfeitamente integrad([ao])\b/gi, (m, g) => 'integrad' + g],
  [/\butilize\b/gi, () => 'use'],
  [/\bleverage\b/gi, () => 'use'],
  [/\bdelve into\b/gi, () => 'explore'],
  [/\bmyriad of\b/gi, () => 'many'],
  [/\bplethora of\b/gi, () => 'many'],
  [/\bcutting-edge\b/gi, () => 'advanced'],
  [/\bseamless(ly)?\b/gi, (m, ly) => (ly ? 'smoothly' : 'smooth')],
  [/\bin order to\b/gi, () => 'to'],
  [/\bfacilitate\b/gi, () => 'help']
];

/* ===== API ===== */

/** Limpa o texto removendo padrões de "texto de IA". */
export function humanize(text) {
  if (!text || typeof text !== 'string') return text;
  let out = text;

  /* aberturas (algumas vezes empilhadas) */
  for (let pass = 0; pass < 3; pass++) {
    for (const { re } of OPENERS) out = out.replace(re, '');
  }
  /* fechos */
  for (const { re } of CLOSERS) out = out.replace(re, '');
  /* preenchimento inline + recapitalização */
  for (const { re } of FILLER) {
    out = out.replace(re, (m, pre = '', next = '') => (pre || '') + (next ? next.toUpperCase() : ''));
  }
  /* vocabulário */
  for (const [re, fn] of VOCAB) out = out.replace(re, fn);

  /* limpeza de espaços/pontuação e exclamações em excesso */
  out = out
    .replace(/!{2,}/g, '!')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  /* capitaliza a 1ª letra (caso uma abertura tenha sido removida) */
  out = out.replace(/^(\p{L})/u, (c) => c.toUpperCase());
  return out;
}

/** Audita o texto e devolve os padrões encontrados (não altera nada). */
export function detect(text) {
  const hits = [];
  if (!text) return { count: 0, hits };
  const scan = (groups) => {
    for (const { re, label } of groups) {
      const m = text.match(new RegExp(re.source, re.flags.replace('g', '') ));
      if (m) hits.push({ categoria: label, trecho: String(m[0]).trim().slice(0, 60) });
    }
  };
  scan(OPENERS); scan(CLOSERS); scan(FILLER);
  for (const [re] of VOCAB) {
    const m = text.match(re);
    if (m) hits.push({ categoria: 'vocabulário inflado', trecho: m[0] });
  }
  return { count: hits.length, hits };
}
