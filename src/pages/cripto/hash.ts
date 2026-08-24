import { h, debounce } from '../../utils/helpers.js';
import { toast } from '../../utils/toast';
import { allHashes } from '../../utils/cripto-engine.js';
import type { HashResults } from '../../utils/cripto-engine.js';

type HashAlgorithm = keyof HashResults;
const ALGOS: readonly HashAlgorithm[] = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512', 'MD5'];

function copyHash(algo: HashAlgorithm, value: string): void {
  if (!navigator.clipboard) return;
  void navigator.clipboard.writeText(value).then(() => toast(`${algo} copiado!`, { type: 'success' }));
}

export function hashPanel(): HTMLDivElement {
  const wrap = h('div', { className: 'cripto-tile' });
  const input = h('textarea', { className: 'input', rows: 4, placeholder: 'Texto para hash…', value: 'Hello Baluarte', oninput: debounce(render, 100) });
  const grid = h('div', { className: 'cripto-hash-grid' });
  async function render(): Promise<void> {
    grid.innerHTML = '<div class="u-text-muted">Calculando…</div>';
    const hashes = await allHashes(input.value);
    grid.innerHTML = '';
    for (const algo of ALGOS) {
      const value = hashes[algo];
      const isMd5 = algo === 'MD5';
      const row = h('div', { className: `cripto-hash-row${isMd5 ? ' is-info' : ''}` }, h('div', { className: 'cripto-hash-row__head' }, h('strong', null, algo), h('span', { className: 'u-text-muted u-mono' }, isMd5 ? '· N/A' : `· ${value.length / 2} bytes (${value.length} hex chars)`), !isMd5 && h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => copyHash(algo, value) }, '⎘ copiar')), h('div', { className: 'cripto-out cripto-hash__value u-mono' }, value));
      grid.appendChild(row);
    }
  }
  wrap.append(h('h3', { className: 'cripto-tile__title' }, '#  Hashes — SHA family'), h('p', { className: 'u-text-muted', style: { fontSize: '12px' } }, 'Implementação via ', h('code', null, 'crypto.subtle'), ' (Web Crypto API) — calcula nativamente sem dependências.'), h('div', { className: 'cripto-tile__grid' }, h('label', null, 'Texto', input)), grid);
  setTimeout(() => { void render(); }, 0);
  return wrap;
}
