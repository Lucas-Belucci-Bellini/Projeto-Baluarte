/**
 * Página /json-studio — JSON Studio (v2.0.0).
 *
 * Formata, minifica e valida JSON; mostra árvore navegável, erros com
 * linha/coluna e estatísticas da estrutura.
 */

import { h, cx, empty, debounce } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';

const STORAGE_KEY = 'json-studio:input';

const SAMPLE = `{
  "projeto": "Baluarte Mark XIII",
  "versao": "2.0.0",
  "ativo": true,
  "rotas": 36,
  "equipes": ["ALFA", "BRAVO", "CHARLIE"],
  "nucleo": {
    "setor": 0,
    "operador": "Lucas Belucci Bellini",
    "clearance": "OMEGA"
  },
  "tags": null
}`;

/* Converte uma posição absoluta no texto em linha/coluna. */
function posToLineCol(text, pos) {
  const upto = text.slice(0, Math.max(0, pos));
  const line = upto.split('\n').length;
  const col = pos - upto.lastIndexOf('\n');
  return { line, col };
}

/* Estatísticas: total de chaves, de valores e profundidade máxima. */
function analyze(value, depth = 1) {
  let keys = 0;
  let values = 0;
  let maxDepth = depth;
  if (value !== null && typeof value === 'object') {
    const entries = Array.isArray(value)
      ? value.map((v, i) => [i, v])
      : Object.entries(value);
    if (!Array.isArray(value)) keys += entries.length;
    for (const [, v] of entries) {
      const sub = analyze(v, depth + 1);
      keys += sub.keys;
      values += sub.values;
      maxDepth = Math.max(maxDepth, sub.maxDepth);
    }
  } else {
    values += 1;
  }
  return { keys, values, maxDepth };
}

/* Nó recursivo da árvore. */
function treeNode(key, value) {
  const keyEl = key != null
    ? h('span', { className: 'json-tree__key' }, String(key) + ': ')
    : null;

  if (value !== null && typeof value === 'object') {
    const isArr = Array.isArray(value);
    const entries = isArr
      ? value.map((v, i) => [i, v])
      : Object.entries(value);
    const det = h('details', { className: 'json-tree__node', open: true },
      h('summary', { className: 'json-tree__summary' },
        keyEl,
        h('span', { className: 'json-tree__bracket' },
          isArr ? `Array [${entries.length}]` : `Object {${entries.length}}`)
      )
    );
    entries.forEach(([k, v]) => det.appendChild(treeNode(k, v)));
    return det;
  }

  const t = value === null ? 'null' : typeof value;
  const display = t === 'string' ? `"${value}"` : String(value);
  return h('div', { className: 'json-tree__leaf' },
    keyEl,
    h('span', { className: `json-tree__val json-tree__val--${t}` }, display)
  );
}

export function jsonStudioPage() {
  const fullPage = h('div', { className: 'page-json' });
  let input = storage.get(STORAGE_KEY);
  if (typeof input !== 'string') input = SAMPLE;

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'),
        h('span', null, 'JSON STUDIO')),
      h('h1', { className: 'page-header__title' }, '{ } JSON Studio'),
      h('p', { className: 'page-header__description' },
        'Valida, ', h('span', { className: 'u-text-cyan' }, 'formata'),
        ' e minifica JSON, com árvore navegável, relatório de erro com ',
        'linha/coluna e estatísticas da estrutura.')
    )
  );

  const statusEl = h('div', { className: 'json-status' });
  const treeWrap = h('div', { className: 'json-tree' });

  const inputArea = h('textarea', {
    className: 'json-input u-mono',
    spellcheck: false,
    value: input,
    placeholder: 'Cole o JSON aqui…',
    oninput: () => { storage.set(STORAGE_KEY, inputArea.value); revalidate(); }
  });

  /* Revalida o conteúdo atual e atualiza status + árvore. */
  function revalidate() {
    const text = inputArea.value.trim();
    empty(treeWrap);
    if (!text) {
      setStatus('idle', 'Aguardando JSON…');
      return null;
    }
    try {
      const parsed = JSON.parse(text);
      const st = analyze(parsed);
      setStatus('ok',
        `JSON válido · ${st.keys} chaves · ${st.values} valores · profundidade ${st.maxDepth}`);
      treeWrap.appendChild(treeNode(null, parsed));
      return parsed;
    } catch (err) {
      const m = /position (\d+)/.exec(err.message);
      let detail = err.message;
      if (m) {
        const { line, col } = posToLineCol(inputArea.value, parseInt(m[1], 10));
        detail = `${err.message.replace(/ in JSON.*/, '')} — linha ${line}, coluna ${col}`;
      }
      setStatus('err', detail);
      return undefined;
    }
  }

  function setStatus(kind, text) {
    statusEl.className = `json-status json-status--${kind}`;
    const dot = { ok: '●', err: '▲', idle: '○' }[kind] || '○';
    empty(statusEl);
    statusEl.appendChild(h('span', { className: 'json-status__dot' }, dot));
    statusEl.appendChild(h('span', null, text));
  }

  function transform(minify) {
    const text = inputArea.value.trim();
    if (!text) { toast('Nada para processar', { type: 'warning' }); return; }
    try {
      const parsed = JSON.parse(text);
      inputArea.value = JSON.stringify(parsed, null, minify ? 0 : 2);
      storage.set(STORAGE_KEY, inputArea.value);
      revalidate();
      toast(minify ? 'JSON minificado' : 'JSON formatado', { type: 'success' });
    } catch {
      revalidate();
      toast('JSON inválido — corrija o erro apontado', { type: 'danger' });
    }
  }

  const toolbar = h('div', { className: 'json-toolbar' },
    h('button', { className: 'btn btn--primary btn--sm', onclick: () => transform(false) }, '⤸ Formatar'),
    h('button', { className: 'btn btn--sm', onclick: () => transform(true) }, '⤻ Minificar'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => {
        if (!inputArea.value.trim()) { toast('Nada para copiar', { type: 'warning' }); return; }
        navigator.clipboard.writeText(inputArea.value).then(
          () => toast('Copiado', { type: 'success' }),
          () => toast('Falha ao copiar', { type: 'danger' }));
      }
    }, '⧉ Copiar'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => { inputArea.value = SAMPLE; storage.set(STORAGE_KEY, SAMPLE); revalidate(); }
    }, '◆ Exemplo'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => { inputArea.value = ''; storage.set(STORAGE_KEY, ''); revalidate(); }
    }, '✕ Limpar')
  );

  fullPage.appendChild(toolbar);
  fullPage.appendChild(statusEl);
  fullPage.appendChild(
    h('div', { className: 'json-grid' },
      h('div', { className: 'json-pane' },
        h('div', { className: 'json-pane__label' }, 'ENTRADA'),
        inputArea
      ),
      h('div', { className: 'json-pane' },
        h('div', { className: 'json-pane__label' }, 'ÁRVORE'),
        treeWrap
      )
    )
  );

  revalidate();
  return fullPage;
}
