/**
 * Superfície mínima do Briefing V2.
 * Não executa busca nem envio; apenas mostra candidatos já normalizados.
 */

/** @typedef {{id:string, source:string, url:string, title:string, publishedAt:string|null, capturedAt:string, language:string, topics:string[], summary:string|null, confidence:number, status:string}} BriefingItem */
/** @typedef {{items:BriefingItem[], evidence?:unknown, evidenceLinked?:number, evidenceErrors?:number}} BriefingState */

/**
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, unknown>} [attrs]
 * @param {...(Node|string|null|undefined)} children
 * @returns {HTMLElementTagNameMap[K]}
 */
function h(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className' && typeof value === 'string') element.className = value;
    else if (key === 'textContent' && typeof value === 'string') element.textContent = value;
    else if (value !== undefined && value !== null) element.setAttribute(key, String(value));
  }
  for (const child of children.flat()) {
    if (child === null || child === undefined) continue;
    element.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return element;
}

/** @param {BriefingState|null} state @param {unknown} [_args] */
export function criarView(state, _args) {
  if (!state) throw new Error('briefing: view pedida antes do init');
  const items = state.items;
  const evidenceReady = Boolean(state.evidence);
  const evidenceLinked = typeof state.evidenceLinked === 'number' ? state.evidenceLinked : 0;
  const evidenceErrors = typeof state.evidenceErrors === 'number' ? state.evidenceErrors : 0;
  const list = h('div', { className: 'briefing-list' });

  if (!items.length) {
    list.appendChild(h('p', { className: 'briefing-empty' }, 'Nenhum candidato de notícia foi ingerido ainda.'));
  } else {
    items.forEach((item) => {
      const link = h('a', { href: item.url, target: '_blank', rel: 'noreferrer' }, item.title);
      const meta = [item.source, item.publishedAt || 'data indisponível', `confiança ${Math.round(item.confidence * 100)}%`].join(' · ');
      list.appendChild(h('article', { className: 'briefing-item' },
        h('h2', { className: 'briefing-item__title' }, link),
        h('p', { className: 'briefing-item__meta' }, meta),
        item.summary ? h('p', { className: 'briefing-item__summary' }, item.summary) : null,
        h('small', { className: 'briefing-item__status' }, `status: ${item.status} · capturado: ${item.capturedAt}`)
      ));
    });
  }

  return h('section', { className: 'modulo-briefing', 'aria-labelledby': 'briefing-titulo' },
    h('h1', { id: 'briefing-titulo' }, 'Briefing de Notícias'),
    h('p', { className: 'u-text-muted' }, 'Módulo experimental V2. Somente leitura; toda notícia mantém fonte e URL original.'),
    h('p', { className: 'briefing-evidence-status', 'data-evidence-status': evidenceReady ? 'connected' : 'unavailable' }, evidenceReady
      ? `Evidence local conectada · ${evidenceLinked} vinculada(s)${evidenceErrors ? ` · ${evidenceErrors} erro(s)` : ''}.`
      : 'Evidence local não configurada; o Briefing continua disponível.'),
    list
  );
}
