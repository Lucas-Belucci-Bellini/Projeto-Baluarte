/**
 * Página /json-studio — JSON Studio (v2.0.0).
 *
 * Formata, minifica e valida JSON; mostra árvore navegável, erros com
 * linha/coluna e estatísticas da estrutura.
 */

import '../styles/json-studio.css';
import { h, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { setStatus as publishStatus } from '../utils/baluarte-status.js';

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

type JsonPrimitive = string | number | boolean | null;
type JsonObject = { readonly [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];
type StatusKind = 'ok' | 'err' | 'idle';

interface JsonStats {
  readonly keys: number;
  readonly values: number;
  readonly maxDepth: number;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (value === null) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) return value.every(isJsonValue);
  if (typeof value !== 'object') return false;
  return Object.values(value).every(isJsonValue);
}

function isJsonContainer(value: JsonValue): value is JsonObject | readonly JsonValue[] {
  return Array.isArray(value) || (value !== null && typeof value === 'object');
}

function entriesOf(value: JsonObject | readonly JsonValue[]): ReadonlyArray<readonly [string | number, JsonValue]> {
  if (Array.isArray(value)) {
    return value.map((child, index): readonly [number, JsonValue] => [index, child]);
  }
  return Object.entries(value);
}

function posToLineCol(text: string, position: number): { line: number; col: number } {
  const upto = text.slice(0, Math.max(0, position));
  const line = upto.split('\n').length;
  const col = position - upto.lastIndexOf('\n');
  return { line, col };
}

function analyze(value: JsonValue, depth = 1): JsonStats {
  let keys = 0;
  let values = 0;
  let maxDepth = depth;
  if (isJsonContainer(value)) {
    const entries = entriesOf(value);
    if (!Array.isArray(value)) keys += entries.length;
    for (const [, child] of entries) {
      const sub = analyze(child, depth + 1);
      keys += sub.keys;
      values += sub.values;
      maxDepth = Math.max(maxDepth, sub.maxDepth);
    }
  } else {
    values += 1;
  }
  return { keys, values, maxDepth };
}

function treeNode(key: string | number | null, value: JsonValue): HTMLElement {
  const keyElement = key !== null
    ? h('span', { className: 'json-tree__key' }, `${String(key)}: `)
    : null;

  if (isJsonContainer(value)) {
    const isArray = Array.isArray(value);
    const entries = entriesOf(value);
    const details = h('details', { className: 'json-tree__node', open: true },
      h('summary', { className: 'json-tree__summary' },
        keyElement,
        h('span', { className: 'json-tree__bracket' },
          isArray ? `Array [${entries.length}]` : `Object {${entries.length}}`,
        ),
      ),
    );
    entries.forEach(([entryKey, child]) => details.appendChild(treeNode(entryKey, child)));
    return details;
  }

  const type = value === null ? 'null' : typeof value;
  const display = type === 'string' ? `"${value}"` : String(value);
  return h('div', { className: 'json-tree__leaf' },
    keyElement,
    h('span', { className: `json-tree__val json-tree__val--${type}` }, display),
  );
}

export function jsonStudioPage(): HTMLDivElement {
  const fullPage = h('div', { className: 'page-json' });
  const stored: unknown = storage.get<unknown>(STORAGE_KEY);
  const input = typeof stored === 'string' ? stored : SAMPLE;

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'JSON STUDIO'),
      ),
      h('h1', { className: 'page-header__title' }, '{ } JSON Studio'),
      h('p', { className: 'page-header__description' },
        'Valida, ',
        h('span', { className: 'u-text-cyan' }, 'formata'),
        ' e minifica JSON, com árvore navegável, relatório de erro com ',
        'linha/coluna e estatísticas da estrutura.',
      ),
    ),
  );

  const statusEl = h('div', { className: 'json-status' });
  const treeWrap = h('div', { className: 'json-tree' });

  const inputArea = h('textarea', {
    className: 'json-input u-mono',
    spellcheck: false,
    value: input,
    placeholder: 'Cole o JSON aqui…',
    oninput: () => {
      storage.set(STORAGE_KEY, inputArea.value);
      revalidate();
    },
  });

  function setStatus(kind: StatusKind, text: string): void {
    statusEl.className = `json-status json-status--${kind}`;
    const dot: Record<StatusKind, string> = { ok: '●', err: '▲', idle: '○' };
    empty(statusEl);
    statusEl.appendChild(h('span', { className: 'json-status__dot' }, dot[kind]));
    statusEl.appendChild(h('span', null, text));
  }

  function revalidate(): JsonValue | undefined {
    const text = inputArea.value.trim();
    publishStatus('jsonStudio', { caracteres: text.length });
    empty(treeWrap);
    if (!text) {
      setStatus('idle', 'Aguardando JSON…');
      return undefined;
    }
    try {
      const parsed: unknown = JSON.parse(text);
      if (!isJsonValue(parsed)) throw new Error('JSON contém valor não serializável');
      const stats = analyze(parsed);
      setStatus(
        'ok',
        `JSON válido · ${stats.keys} chaves · ${stats.values} valores · profundidade ${stats.maxDepth}`,
      );
      treeWrap.appendChild(treeNode(null, parsed));
      return parsed;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'JSON inválido';
      const match = /position (\d+)/.exec(message);
      let detail = message;
      if (match) {
        const position = Number.parseInt(match[1], 10);
        const { line, col } = posToLineCol(inputArea.value, position);
        detail = `${message.replace(/ in JSON.*/, '')} — linha ${line}, coluna ${col}`;
      }
      setStatus('err', detail);
      return undefined;
    }
  }

  function transform(minify: boolean): void {
    const text = inputArea.value.trim();
    if (!text) {
      toast('Nada para processar', { type: 'warning' });
      return;
    }
    try {
      const parsed: unknown = JSON.parse(text);
      if (!isJsonValue(parsed)) throw new Error('JSON contém valor não serializável');
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
    h('button', {
      className: 'btn btn--primary btn--sm',
      onclick: () => transform(false),
    }, '⤸ Formatar'),
    h('button', {
      className: 'btn btn--sm',
      onclick: () => transform(true),
    }, '⤻ Minificar'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => {
        if (!inputArea.value.trim()) {
          toast('Nada para copiar', { type: 'warning' });
          return;
        }
        navigator.clipboard.writeText(inputArea.value).then(
          () => toast('Copiado', { type: 'success' }),
          () => toast('Falha ao copiar', { type: 'danger' }),
        );
      },
    }, '⧉ Copiar'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => {
        inputArea.value = SAMPLE;
        storage.set(STORAGE_KEY, SAMPLE);
        revalidate();
      },
    }, '◆ Exemplo'),
    h('button', {
      className: 'btn btn--ghost btn--sm',
      onclick: () => {
        inputArea.value = '';
        storage.set(STORAGE_KEY, '');
        revalidate();
      },
    }, '✕ Limpar'),
  );

  fullPage.appendChild(toolbar);
  fullPage.appendChild(statusEl);
  fullPage.appendChild(
    h('div', { className: 'json-grid' },
      h('div', { className: 'json-pane' },
        h('div', { className: 'json-pane__label' }, 'ENTRADA'),
        inputArea,
      ),
      h('div', { className: 'json-pane' },
        h('div', { className: 'json-pane__label' }, 'ÁRVORE'),
        treeWrap,
      ),
    ),
  );

  revalidate();
  return fullPage;
}
