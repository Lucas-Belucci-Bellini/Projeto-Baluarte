/**
 * Autocomplete do Editor — IntelliSense estilo VS Code (issue #197).
 *
 * Mostra um dropdown perto do cursor enquanto o usuário digita, com três
 * tipos de sugestão (nessa ordem):
 *   ▤ snippets   — gatilhos rápidos (psvm → main do Java, sout, fori, log…)
 *   ◆ keywords   — palavras-chave da linguagem ativa
 *   ✎ palavras   — identificadores já usados no próprio arquivo
 *
 * Teclas: ↑↓ navega · Tab/Enter aceita · Esc fecha · Ctrl+Espaço abre manual.
 *
 * Uso (ver pages/editor.js):
 *   const ac = createAutocomplete({ textarea, anchor, getLang });
 *   oninput   → ac.refresh()
 *   onkeydown → if (ac.handleKey(e)) return;   // antes dos outros atalhos
 *   onscroll  → ac.close()
 */

import '../styles/editor.css';
import { h, empty } from './helpers.js';
import { snippetsFor } from '../data/editor-snippets.js';

const MAX_ITEMS = 9;
const INDENT = '  '; /* mesmo indent do editor (Tab = 2 espaços) */

/**
 * @param {object} opts
 * @param {HTMLTextAreaElement} opts.textarea
 * @param {HTMLElement} opts.anchor - container position:relative que recebe o dropdown
 * @param {() => object} opts.getLang - definição da linguagem ativa (editor-langs.js)
 */
export function createAutocomplete({ textarea, anchor, getLang }) {
  let items = [];
  let active = 0;
  let isOpen = false;
  let suppress = false; /* evita reabrir durante o próprio insert */

  const boxEl = h('div', { className: 'editor-autocomplete', style: { display: 'none' } });
  anchor.appendChild(boxEl);

  /* ---- posição do cursor em pixels (técnica do div-espelho) ---- */
  function caretXY() {
    const cs = getComputedStyle(textarea);
    const mirror = h('div', {
      style: {
        position: 'absolute', top: '0', left: '0', visibility: 'hidden',
        whiteSpace: 'pre', font: cs.font, lineHeight: cs.lineHeight,
        padding: cs.padding, tabSize: cs.tabSize
      }
    });
    mirror.textContent = textarea.value.slice(0, textarea.selectionStart);
    const marker = h('span', null, '​');
    mirror.appendChild(marker);
    anchor.appendChild(mirror);
    const pos = { x: marker.offsetLeft, y: marker.offsetTop };
    mirror.remove();
    return pos;
  }

  /* ---- prefixo sendo digitado (palavra imediatamente antes do cursor) ---- */
  function currentPrefix() {
    const upto = textarea.value.slice(0, textarea.selectionStart);
    const m = upto.match(/[A-Za-z_$][\w$]*$/);
    return m ? m[0] : '';
  }

  /* ---- monta a lista de sugestões para um prefixo ---- */
  function collect(prefix) {
    const lang = getLang();
    const out = [];
    const seen = new Set();
    const starts = (s) => s.startsWith(prefix) && s !== prefix;
    const startsOrEq = (s) => s.startsWith(prefix);

    for (const sn of snippetsFor(lang.id)) {
      if ((prefix ? startsOrEq(sn.trigger) : true) && !seen.has(sn.trigger)) {
        out.push({ kind: 'snippet', label: sn.trigger, detail: sn.detail, body: sn.body });
        seen.add(sn.trigger);
      }
    }
    for (const kw of (lang.keywords || '').split(/\s+/)) {
      if (kw && (prefix ? starts(kw) : false) && !seen.has(kw)) {
        out.push({ kind: 'keyword', label: kw, detail: 'keyword', body: kw });
        seen.add(kw);
      }
    }
    if (prefix) {
      const words = textarea.value.match(/[A-Za-z_$][\w$]{2,}/g) || [];
      for (const w of words) {
        if (starts(w) && !seen.has(w)) {
          out.push({ kind: 'word', label: w, detail: 'no arquivo', body: w });
          seen.add(w);
        }
        if (out.length >= MAX_ITEMS * 2) break;
      }
    }
    return out.slice(0, MAX_ITEMS);
  }

  /* ---- desenha o dropdown ---- */
  function render(prefix) {
    empty(boxEl);
    items.forEach((item, i) => {
      const label = prefix
        ? h('span', { className: 'editor-autocomplete__label' },
            h('b', null, prefix), item.label.slice(prefix.length))
        : h('span', { className: 'editor-autocomplete__label' }, item.label);
      const row = h(
        'div',
        {
          className: 'editor-autocomplete__item' + (i === active ? ' is-active' : ''),
          /* mousedown (não click) pra não tirar o foco do textarea */
          onmousedown: (e) => { e.preventDefault(); accept(item); },
          onmouseenter: () => { active = i; render(prefix); }
        },
        h('span', { className: `editor-autocomplete__kind editor-autocomplete__kind--${item.kind}` },
          item.kind === 'snippet' ? '▤' : item.kind === 'keyword' ? '◆' : '✎'),
        label,
        h('span', { className: 'editor-autocomplete__detail' }, item.detail || '')
      );
      boxEl.appendChild(row);
    });

    /* posiciona logo abaixo do cursor, sem sair do editor */
    const { x, y } = caretXY();
    const lineH = parseFloat(getComputedStyle(textarea).lineHeight) || 21;
    let left = x - textarea.scrollLeft;
    let top = y - textarea.scrollTop + lineH + 2;
    boxEl.style.display = 'block';
    const bw = boxEl.offsetWidth;
    const bh = boxEl.offsetHeight;
    if (left + bw > anchor.clientWidth) left = Math.max(0, anchor.clientWidth - bw - 4);
    if (top + bh > anchor.clientHeight) top = Math.max(0, y - textarea.scrollTop - bh - 2);
    boxEl.style.left = `${left}px`;
    boxEl.style.top = `${top}px`;
  }

  function open(force = false) {
    const prefix = currentPrefix();
    if (!prefix && !force) return close();
    items = collect(prefix);
    if (!items.length) return close();
    if (active >= items.length) active = 0;
    isOpen = true;
    render(prefix);
  }

  function close() {
    if (!isOpen && boxEl.style.display === 'none') return;
    isOpen = false;
    items = [];
    active = 0;
    boxEl.style.display = 'none';
  }

  /* ---- insere a sugestão escolhida no lugar do prefixo ---- */
  function accept(item) {
    const prefix = currentPrefix();
    const start = textarea.selectionStart - prefix.length;
    const val = textarea.value;

    /* indentação da linha atual, para alinhar snippets de várias linhas */
    const lineStart = val.lastIndexOf('\n', start - 1) + 1;
    const baseIndent = (val.slice(lineStart, start).match(/^[ \t]*/) || [''])[0];

    let body = item.body.replace(/\t/g, INDENT);
    if (body.includes('\n')) {
      body = body.split('\n').map((l, i) => (i === 0 ? l : baseIndent + l)).join('\n');
    }

    let cursorAt = body.indexOf('$0');
    if (cursorAt === -1) cursorAt = body.length;
    body = body.replace('$0', '');

    suppress = true;
    textarea.value = val.slice(0, start) + body + val.slice(textarea.selectionStart);
    textarea.selectionStart = textarea.selectionEnd = start + cursorAt;
    /* dispara o fluxo normal (highlight, persist, contadores) */
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    suppress = false;
    close();
    textarea.focus();
  }

  /* ---- API ---- */

  function refresh() {
    if (suppress) return;
    open(false);
  }

  /**
   * Trata a tecla ANTES dos outros atalhos do editor.
   * @returns {boolean} true se a tecla foi consumida pelo autocomplete
   */
  function handleKey(e) {
    if (!isOpen) {
      if ((e.ctrlKey || e.metaKey) && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        open(true);
        return true;
      }
      return false;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      active = (active + 1) % items.length;
      render(currentPrefix());
      return true;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      active = (active - 1 + items.length) % items.length;
      render(currentPrefix());
      return true;
    }
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      accept(items[active]);
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return true;
    }
    /* mover o cursor pro lado fecha (o input event cuida do resto) */
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
      close();
    }
    return false;
  }

  textarea.addEventListener('blur', () => setTimeout(close, 120));

  return { refresh, handleKey, close, get isOpen() { return isOpen; } };
}
