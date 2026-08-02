/**
 * Página /utilidades — Caixa de Ferramentas (Lote 1).
 * Mini-ferramentas técnicas, JS puro, sem dependências:
 *   1) Gerador de Senhas  2) Gerador de UUID  3) Contador de Texto
 *   4) Timestamp ↔ Data   5) Calculadora de Porcentagem
 */

import '../styles/utilidades.css';
import { h, empty, pad2 } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';

function copy(text) {
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => toast('Copiado.', { type: 'success' }))
    .catch(() => toast('Não consegui copiar.', { type: 'warning' }));
}

function section(title, icon, body) {
  return h('div', { className: 'card util-card' },
    h('h2', { className: 'util-card__title' }, `${icon} ${title}`),
    body);
}

/* ===== 1) Gerador de Senhas ===== */
function toolSenha() {
  const out = h('input', { className: 'input util-out u-mono', readonly: true, placeholder: 'Sua senha aparece aqui' });
  const lenLabel = h('span', { className: 'u-text-cyan u-mono' }, '16');
  const len = h('input', { type: 'range', min: '6', max: '48', value: '16',
    'aria-label': 'Tamanho da senha em caracteres',
    oninput: (e) => { lenLabel.textContent = e.target.value; } });
  const opts = {
    lower: h('input', { type: 'checkbox', checked: true }),
    upper: h('input', { type: 'checkbox', checked: true }),
    num: h('input', { type: 'checkbox', checked: true }),
    sym: h('input', { type: 'checkbox', checked: true })
  };
  const strength = h('div', { className: 'util-strength u-text-muted' }, '');

  function gen() {
    let pool = '';
    if (opts.lower.checked) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (opts.upper.checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (opts.num.checked) pool += '0123456789';
    if (opts.sym.checked) pool += '!@#$%^&*()-_=+[]{};:,.<>?';
    if (!pool) { toast('Selecione ao menos um tipo de caractere.', { type: 'warning' }); return; }
    const n = parseInt(len.value, 10);
    const rnd = new Uint32Array(n);
    crypto.getRandomValues(rnd);
    let pw = '';
    for (let i = 0; i < n; i++) pw += pool[rnd[i] % pool.length];
    out.value = pw;
    const variety = [opts.lower, opts.upper, opts.num, opts.sym].filter((o) => o.checked).length;
    const score = Math.min(100, Math.round((n / 24) * 50 + variety * 12.5));
    strength.textContent = `Força: ${score >= 80 ? 'forte' : score >= 50 ? 'média' : 'fraca'} (${score}/100)`;
    strength.className = 'util-strength ' + (score >= 80 ? 'u-text-success' : score >= 50 ? 'u-text-warning' : 'u-text-danger');
  }

  const checks = h('div', { className: 'util-checks' },
    h('label', null, opts.lower, ' a-z'),
    h('label', null, opts.upper, ' A-Z'),
    h('label', null, opts.num, ' 0-9'),
    h('label', null, opts.sym, ' !@#'));

  gen();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Tamanho'), len, lenLabel),
    checks,
    h('div', { className: 'util-row' }, out,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(out.value) }, '⧉')),
    strength,
    h('button', { className: 'btn btn--primary btn--sm', onclick: gen }, '↻ Gerar senha'));
}

/* ===== 2) Gerador de UUID ===== */
function toolUuid() {
  const out = h('textarea', { className: 'input util-out u-mono', rows: 4, readonly: true,
    'aria-label': 'UUIDs gerados' });
  const qty = h('input', { className: 'input util-qty', type: 'number', min: '1', max: '100', value: '5',
    'aria-label': 'Quantidade de UUIDs' });
  function gen() {
    const n = Math.max(1, Math.min(100, parseInt(qty.value, 10) || 1));
    const ids = [];
    for (let i = 0; i < n; i++) {
      ids.push(crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }));
    }
    out.value = ids.join('\n');
  }
  gen();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Quantidade'), qty,
      h('button', { className: 'btn btn--primary btn--sm', onclick: gen }, '↻ Gerar'),
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(out.value) }, '⧉ Copiar')),
    out);
}

/* ===== 3) Contador de Texto ===== */
function toolContador() {
  const stats = h('div', { className: 'util-stats' });
  const ta = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Cole ou digite o texto...',
    oninput: () => update() });
  function update() {
    const t = ta.value;
    const chars = t.length;
    const noSpace = t.replace(/\s/g, '').length;
    const words = (t.trim().match(/\S+/g) || []).length;
    const lines = t ? t.split(/\n/).length : 0;
    const min = Math.max(1, Math.ceil(words / 200));
    empty(stats);
    [['Caracteres', chars], ['Sem espaços', noSpace], ['Palavras', words], ['Linhas', lines], ['Leitura', `~${min} min`]]
      .forEach(([k, v]) => stats.appendChild(
        h('div', { className: 'util-stat' },
          h('div', { className: 'util-stat__v u-text-cyan' }, String(v)),
          h('div', { className: 'util-stat__k u-text-muted' }, k))));
  }
  update();
  return h('div', { className: 'util-body' }, ta, stats);
}

/* ===== 4) Timestamp ↔ Data ===== */
function toolTimestamp() {
  const tsIn = h('input', { className: 'input u-mono', type: 'text', placeholder: 'Unix (s ou ms), ex: 1716661200' });
  const tsOut = h('div', { className: 'util-result u-mono' }, '—');
  const dtIn = h('input', { className: 'input', type: 'datetime-local', 'aria-label': 'Data e hora para converter em Unix' });
  const dtOut = h('div', { className: 'util-result u-mono' }, '—');

  tsIn.oninput = () => {
    const raw = tsIn.value.trim();
    if (!/^\d+$/.test(raw)) { tsOut.textContent = '—'; return; }
    let n = parseInt(raw, 10);
    if (raw.length <= 10) n *= 1000;
    const d = new Date(n);
    tsOut.textContent = isNaN(d) ? 'inválido' : d.toLocaleString('pt-BR') + ' · ' + d.toISOString();
  };
  dtIn.oninput = () => {
    if (!dtIn.value) { dtOut.textContent = '—'; return; }
    const ms = new Date(dtIn.value).getTime();
    dtOut.textContent = `${Math.floor(ms / 1000)} s · ${ms} ms`;
  };
  const agora = h('button', { className: 'btn btn--ghost btn--sm', onclick: () => {
    tsIn.value = String(Math.floor(Date.now() / 1000)); tsIn.oninput();
  } }, 'Agora');

  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Unix → Data'),
      h('div', { className: 'util-row' }, tsIn, agora), tsOut),
    h('div', { className: 'util-field' }, h('span', null, 'Data → Unix'), dtIn, dtOut));
}

/* ===== 5) Calculadora de Porcentagem ===== */
function toolPorcentagem() {
  const num = (ph) => h('input', { className: 'input util-qty', type: 'number', placeholder: ph });
  const a1 = num('X'), b1 = num('Y'), r1 = h('span', { className: 'util-result u-text-cyan' }, '—');
  const a2 = num('X'), b2 = num('Y'), r2 = h('span', { className: 'util-result u-text-cyan' }, '—');
  const a3 = num('de'), b3 = num('para'), r3 = h('span', { className: 'util-result u-text-cyan' }, '—');
  const fmt = (n) => (isFinite(n) ? (Math.round(n * 100) / 100) : '—');
  a1.oninput = b1.oninput = () => { r1.textContent = `${fmt((+a1.value / 100) * +b1.value)}`; };
  a2.oninput = b2.oninput = () => { r2.textContent = `${fmt((+a2.value / +b2.value) * 100)} %`; };
  a3.oninput = b3.oninput = () => { r3.textContent = `${fmt(((+b3.value - +a3.value) / Math.abs(+a3.value)) * 100)} %`; };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-pct' }, a1, h('span', null, '% de'), b1, h('span', null, '='), r1),
    h('div', { className: 'util-pct' }, a2, h('span', null, 'é quantos % de'), b2, h('span', null, '='), r2),
    h('div', { className: 'util-pct' }, h('span', null, 'variação de'), a3, h('span', null, 'para'), b3, h('span', null, '='), r3));
}

/* ===== 6) Diff de Texto (LCS por linha) ===== */
function toolDiff() {
  const a = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Texto A' });
  const b = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Texto B' });
  const out = h('div', { className: 'util-diff' });
  function run() {
    const A = a.value.split('\n'), B = b.value.split('\n');
    const m = A.length, n = B.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--)
      for (let j = n - 1; j >= 0; j--)
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    empty(out);
    const add = (cls, txt) => out.appendChild(h('div', { className: 'util-diff__line ' + cls }, txt || ' '));
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (A[i] === B[j]) { add('eq', '  ' + A[i]); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { add('del', '- ' + A[i]); i++; }
      else { add('ins', '+ ' + B[j]); j++; }
    }
    while (i < m) add('del', '- ' + A[i++]);
    while (j < n) add('ins', '+ ' + B[j++]);
    if (!out.children.length) add('eq', '(idêntico ou vazio)');
  }
  a.oninput = b.oninput = run; run();
  return h('div', { className: 'util-body' }, h('div', { className: 'util-diff-inputs' }, a, b), out);
}

/* ===== 7) Lorem Ipsum ===== */
function toolLorem() {
  const W = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et '
    + 'dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo '
    + 'consequat duis aute irure voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat '
    + 'non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');
  const out = h('textarea', { className: 'input util-out', rows: 6, readonly: true,
    'aria-label': 'Texto Lorem Ipsum gerado' });
  const qty = h('input', { className: 'input util-qty', type: 'number', min: '1', max: '20', value: '3',
    'aria-label': 'Quantidade de parágrafos' });
  const sentence = () => {
    const len = 6 + Math.floor(Math.random() * 10), s = [];
    for (let i = 0; i < len; i++) s.push(W[Math.floor(Math.random() * W.length)]);
    const t = s.join(' ');
    return t.charAt(0).toUpperCase() + t.slice(1) + '.';
  };
  function gen() {
    const p = Math.max(1, Math.min(20, parseInt(qty.value, 10) || 1)), paras = [];
    for (let i = 0; i < p; i++) {
      const ns = 3 + Math.floor(Math.random() * 4), arr = [];
      for (let k = 0; k < ns; k++) arr.push(sentence());
      paras.push(arr.join(' '));
    }
    out.value = paras.join('\n\n');
  }
  gen();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Parágrafos'), qty,
      h('button', { className: 'btn btn--primary btn--sm', onclick: gen }, '↻ Gerar'),
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(out.value) }, '⧉')),
    out);
}

/* ===== 8) Número por extenso (pt-BR, aproximado) ===== */
function porExtenso(n) {
  if (!Number.isFinite(n)) return '—';
  n = Math.trunc(n);
  if (n === 0) return 'zero';
  const neg = n < 0; n = Math.abs(n);
  if (n > 999999999999) return 'número muito grande';
  const u = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const d = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const c = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  const tres = (x) => {
    if (x === 0) return '';
    if (x === 100) return 'cem';
    const p = []; const h_ = Math.floor(x / 100), r = x % 100;
    if (h_) p.push(c[h_]);
    if (r < 20 && r > 0) p.push(u[r]);
    else if (r >= 20) { const dd = Math.floor(r / 10), uu = r % 10; p.push(uu ? d[dd] + ' e ' + u[uu] : d[dd]); }
    return p.join(' e ');
  };
  const g = []; let x = n;
  while (x > 0) { g.push(x % 1000); x = Math.floor(x / 1000); }
  const esc = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']];
  const partes = [];
  for (let k = g.length - 1; k >= 0; k--) {
    const v = g[k];
    if (!v) continue;
    if (k === 1) partes.push(v === 1 ? 'mil' : tres(v) + ' mil');
    else if (k === 0) partes.push(tres(v));
    else partes.push(tres(v) + ' ' + (v === 1 ? esc[k][0] : esc[k][1]));
  }
  return ((neg ? 'menos ' : '') + partes.join(' e ')).replace(/\s+/g, ' ').trim();
}
function toolExtenso() {
  const inp = h('input', { className: 'input', type: 'number', placeholder: 'Digite um número inteiro' });
  const out = h('div', { className: 'util-result' }, '—');
  inp.oninput = () => { out.textContent = inp.value.trim() === '' ? '—' : porExtenso(parseInt(inp.value, 10)); };
  return h('div', { className: 'util-body' }, inp, out);
}

/* ===== 9) Base64 de Imagem ===== */
function toolImgBase64() {
  const out = h('textarea', { className: 'input util-out u-mono', rows: 4, readonly: true, placeholder: 'data:image/...;base64,...' });
  const prev = h('div', { className: 'util-imgprev' });
  const file = h('input', {
    className: 'input', type: 'file', accept: 'image/*', 'aria-label': 'Escolher imagem para converter em data URI',
    onchange: (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => { out.value = String(r.result); empty(prev); prev.appendChild(h('img', { src: r.result, alt: 'preview' })); };
      r.readAsDataURL(f);
    }
  });
  return h('div', { className: 'util-body' }, file, prev,
    h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(out.value) }, '⧉ Copiar data URI'),
    out);
}

/* ===== 10) Sorteador / Roleta ===== */
function toolSorteador() {
  const ta = h('textarea', { className: 'input util-textarea', rows: 5, placeholder: 'Um item por linha...' });
  const res = h('div', { className: 'util-result u-text-cyan' }, '—');
  const items = () => ta.value.split('\n').map((s) => s.trim()).filter(Boolean);
  return h('div', { className: 'util-body' }, ta,
    h('div', { className: 'util-row' },
      h('button', { className: 'btn btn--primary btn--sm', onclick: () => {
        const it = items();
        res.textContent = it.length ? '🎲 ' + it[Math.floor(Math.random() * it.length)] : 'Adicione itens.';
      } }, '🎲 Sortear 1'),
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => {
        const it = items();
        for (let i = it.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [it[i], it[j]] = [it[j], it[i]]; }
        ta.value = it.join('\n');
      } }, '🔀 Embaralhar')),
    res);
}

/* ===== 11) Conversor de Caso ===== */
function toolCaso() {
  const inp = h('textarea', { className: 'input util-textarea', rows: 2, placeholder: 'Digite um texto...' });
  const out = h('div', { className: 'util-body' });
  function row(label, value) {
    const v = h('input', { className: 'input util-out u-mono', readonly: true, value, 'aria-label': label });
    return h('div', { className: 'util-row' }, h('span', null, label), v,
      h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(value) }, '⧉'));
  }
  function titleCase(s) { return s.toLowerCase().replace(/\b\p{L}/gu, (c) => c.toUpperCase()); }
  function camel(s) {
    const w = s.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zA-Z0-9]+/g) || [];
    return w.map((x, i) => i === 0 ? x.toLowerCase() : x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join('');
  }
  function joinCase(s, sep) {
    const w = s.normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-zA-Z0-9]+/g) || [];
    return w.map((x) => x.toLowerCase()).join(sep);
  }
  function update() {
    const t = inp.value;
    empty(out);
    out.append(
      row('MAIÚSCULAS', t.toUpperCase()),
      row('minúsculas', t.toLowerCase()),
      row('Título', titleCase(t)),
      row('camelCase', camel(t)),
      row('snake_case', joinCase(t, '_')),
      row('kebab-case', joinCase(t, '-')));
  }
  inp.oninput = update; update();
  return h('div', { className: 'util-body' }, inp, out);
}

/* ===== 12) Gerador de Slug ===== */
function toolSlug() {
  const inp = h('input', { className: 'input', type: 'text', placeholder: 'Título do artigo: Olá, Mundo!' });
  const out = h('input', { className: 'input util-out u-mono', readonly: true, 'aria-label': 'Slug gerado' });
  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  inp.oninput = () => { out.value = slugify(inp.value); };
  return h('div', { className: 'util-body' }, inp,
    h('div', { className: 'util-row' }, out, h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(out.value) }, '⧉')));
}

/* ===== 13) Tabela ASCII ===== */
function toolAscii() {
  const lookup = h('input', { className: 'input', type: 'text', maxlength: '1', placeholder: 'Digite 1 caractere' });
  const lookOut = h('div', { className: 'util-result u-mono' }, '—');
  lookup.oninput = () => {
    const ch = lookup.value;
    lookOut.textContent = ch ? `'${ch}' → dec ${ch.codePointAt(0)} · hex 0x${ch.codePointAt(0).toString(16)} · &#${ch.codePointAt(0)};` : '—';
  };
  const grid = h('div', { className: 'util-ascii' });
  for (let code = 32; code <= 126; code++) {
    grid.appendChild(h('button', {
      className: 'util-ascii__cell', title: `dec ${code} · hex ${code.toString(16)}`,
      onclick: () => copy(String.fromCharCode(code))
    },
      h('span', { className: 'util-ascii__ch' }, String.fromCharCode(code)),
      h('span', { className: 'util-ascii__code u-text-muted' }, String(code))));
  }
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Caractere'), lookup, lookOut),
    grid);
}

/* ===== 14) Números Romanos ===== */
function toolRomanos() {
  const MAP = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
  const toRoman = (n) => { let r = ''; for (const [v, s] of MAP) while (n >= v) { r += s; n -= v; } return r; };
  const fromRoman = (s) => {
    const val = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let n = 0; s = s.toUpperCase();
    for (let i = 0; i < s.length; i++) {
      if (!(s[i] in val)) return NaN;
      n += (val[s[i + 1]] > val[s[i]]) ? -val[s[i]] : val[s[i]];
    }
    return n;
  };
  const ar = h('input', { className: 'input', type: 'number', min: '1', max: '3999', placeholder: 'Arábico (1–3999)' });
  const arOut = h('div', { className: 'util-result u-mono' }, '—');
  ar.oninput = () => { const n = parseInt(ar.value, 10); arOut.textContent = (n >= 1 && n <= 3999) ? toRoman(n) : '—'; };
  const ro = h('input', { className: 'input u-mono', type: 'text', placeholder: 'Romano (ex: MMXXIV)' });
  const roOut = h('div', { className: 'util-result u-mono' }, '—');
  ro.oninput = () => { const n = fromRoman(ro.value.trim()); roOut.textContent = (ro.value.trim() && !isNaN(n)) ? String(n) : '—'; };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Arábico → Romano'), ar, arOut),
    h('div', { className: 'util-field' }, h('span', null, 'Romano → Arábico'), ro, roOut));
}

/* ===== 15) Calculadora de Datas ===== */
function toolDatas() {
  const d1 = h('input', { className: 'input', type: 'date', 'aria-label': 'Data inicial' });
  const d2 = h('input', { className: 'input', type: 'date', 'aria-label': 'Data final' });
  const diffOut = h('div', { className: 'util-result u-text-cyan' }, '—');
  const calcDiff = () => {
    if (!d1.value || !d2.value) { diffOut.textContent = '—'; return; }
    const ms = new Date(d2.value) - new Date(d1.value);
    const dias = Math.round(ms / 86400000);
    diffOut.textContent = `${Math.abs(dias)} dia(s)` + (dias < 0 ? ' (d2 antes de d1)' : '');
  };
  d1.oninput = d2.oninput = calcDiff;
  const base = h('input', { className: 'input', type: 'date', 'aria-label': 'Data de partida' });
  const n = h('input', { className: 'input util-qty', type: 'number', value: '30', placeholder: 'dias' });
  const addOut = h('div', { className: 'util-result u-text-cyan' }, '—');
  const calcAdd = () => {
    if (!base.value) { addOut.textContent = '—'; return; }
    const d = new Date(base.value);
    d.setDate(d.getDate() + (parseInt(n.value, 10) || 0));
    addOut.textContent = d.toLocaleDateString('pt-BR');
  };
  base.oninput = n.oninput = calcAdd;
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Diferença entre datas'),
      h('div', { className: 'util-row' }, d1, h('span', null, '→'), d2), diffOut),
    h('div', { className: 'util-field' }, h('span', null, 'Somar/subtrair dias'),
      h('div', { className: 'util-row' }, base, h('span', null, '+'), n, h('span', null, 'dias')), addOut));
}

/* ===== px ↔ rem ===== */
function toolPxRem() {
  const base = h('input', { className: 'input util-qty', type: 'number', value: '16',
    'aria-label': 'Tamanho base em pixels' });
  const px = h('input', { className: 'input util-qty', type: 'number', placeholder: 'px' });
  const rem = h('input', { className: 'input util-qty', type: 'number', placeholder: 'rem' });
  const b = () => parseFloat(base.value) || 16;
  px.oninput = () => { rem.value = px.value === '' ? '' : (parseFloat(px.value) / b()).toString(); };
  rem.oninput = () => { px.value = rem.value === '' ? '' : (parseFloat(rem.value) * b()).toString(); };
  base.oninput = () => px.oninput();
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-row' }, h('span', null, 'Base (px)'), base),
    h('div', { className: 'util-row' }, px, h('span', null, 'px ='), rem, h('span', null, 'rem')));
}

/* ===== Relógio Mundial / Fusos ===== */
function toolFusos() {
  const ZONES = [
    ['São Paulo', 'America/Sao_Paulo'], ['Nova York', 'America/New_York'],
    ['Los Angeles', 'America/Los_Angeles'], ['Londres', 'Europe/London'],
    ['Lisboa', 'Europe/Lisbon'], ['Paris', 'Europe/Paris'],
    ['Tóquio', 'Asia/Tokyo'], ['Sydney', 'Australia/Sydney']
  ];
  const list = h('div', { className: 'util-stats' });
  function update() {
    const now = new Date();
    empty(list);
    ZONES.forEach(([label, tz]) => {
      const t = new Intl.DateTimeFormat('pt-BR', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
      list.appendChild(h('div', { className: 'util-stat' },
        h('div', { className: 'util-stat__v u-text-cyan' }, t),
        h('div', { className: 'util-stat__k u-text-muted' }, label)));
    });
  }
  update();
  return h('div', { className: 'util-body' },
    h('button', { className: 'btn btn--ghost btn--sm', onclick: update }, '↻ Atualizar'),
    list);
}

/* ===== Markdown → HTML ===== */
function mdToHtml(md) {
  let s = md.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  s = s.replace(/```([\s\S]*?)```/g, (m, c) => `<pre><code>${c.replace(/^\n/, '')}</code></pre>`);
  s = s.replace(/^###### (.*)$/gm, '<h6>$1</h6>').replace(/^##### (.*)$/gm, '<h5>$1</h5>')
    .replace(/^#### (.*)$/gm, '<h4>$1</h4>').replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>').replace(/^# (.*)$/gm, '<h1>$1</h1>');
  s = s.replace(/(?:^- .*(?:\n|$))+/gm, (b) => '<ul>' + b.trim().split('\n').map((l) => '<li>' + l.replace(/^- /, '') + '</li>').join('') + '</ul>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*\n]+)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s.split(/\n{2,}/).map((blk) => /^<(h\d|ul|pre)/.test(blk.trim()) ? blk : '<p>' + blk.replace(/\n/g, '<br>') + '</p>').join('\n');
}
function toolMarkdown() {
  const ta = h('textarea', { className: 'input util-textarea', rows: 6, placeholder: '# Título\n\nTexto **negrito**, *itálico*, `código` e [link](https://...)\n\n- item 1\n- item 2' });
  const preview = h('div', { className: 'util-mdprev' });
  const src = h('textarea', { className: 'input util-out u-mono', rows: 4, readonly: true,
    'aria-label': 'HTML gerado' });
  function update() { const html = mdToHtml(ta.value); preview.innerHTML = html; src.value = html; }
  ta.oninput = update; update();
  return h('div', { className: 'util-body' }, ta,
    h('div', { className: 'util-field' }, h('span', null, 'Preview'), preview),
    h('div', { className: 'util-field' }, h('span', null, 'HTML'),
      h('div', { className: 'util-row' }, src, h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copy(src.value) }, '⧉'))));
}

/* ===== Texto ↔ Binário ===== */
function toolBinario() {
  const t = h('input', { className: 'input', type: 'text', placeholder: 'Texto' });
  const b = h('input', { className: 'input u-mono', type: 'text', placeholder: 'Binário (8 bits por byte)' });
  t.oninput = () => { b.value = [...new TextEncoder().encode(t.value)].map((x) => x.toString(2).padStart(8, '0')).join(' '); };
  b.oninput = () => {
    try {
      const bytes = b.value.trim().split(/\s+/).filter(Boolean).map((x) => parseInt(x, 2));
      t.value = new TextDecoder().decode(new Uint8Array(bytes));
    } catch { t.value = '—'; }
  };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'Texto → Binário'), t),
    h('div', { className: 'util-field' }, h('span', null, 'Binário → Texto'), b));
}

/* ===== JSON ↔ CSV ===== */
function toolJsonCsv() {
  const json = h('textarea', { className: 'input util-textarea u-mono', rows: 5, placeholder: '[{"nome":"Ana","idade":30}]' });
  const csv = h('textarea', { className: 'input util-textarea u-mono', rows: 5, placeholder: 'nome,idade' });
  json.oninput = () => {
    try {
      const arr = JSON.parse(json.value);
      if (!Array.isArray(arr) || !arr.length) { csv.value = ''; return; }
      const keys = [...new Set(arr.flatMap((o) => Object.keys(o)))];
      const esc = (v) => { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
      csv.value = [keys.join(','), ...arr.map((o) => keys.map((k) => esc(o[k])).join(','))].join('\n');
    } catch { csv.value = '(JSON inválido — use um array de objetos)'; }
  };
  csv.oninput = () => {
    try {
      const lines = csv.value.trim().split('\n');
      if (lines.length < 1 || !lines[0]) { json.value = ''; return; }
      const keys = lines[0].split(',').map((s) => s.trim());
      const rows = lines.slice(1).map((l) => { const v = l.split(','); const o = {}; keys.forEach((k, i) => (o[k] = (v[i] || '').trim())); return o; });
      json.value = JSON.stringify(rows, null, 2);
    } catch { json.value = '(CSV inválido)'; }
  };
  return h('div', { className: 'util-body' },
    h('div', { className: 'util-field' }, h('span', null, 'JSON → CSV'), json),
    h('div', { className: 'util-field' }, h('span', null, 'CSV → JSON'), csv));
}

/* ===== Regra de Três ===== */
function toolRegraTres() {
  const ni = (ph) => h('input', { className: 'input util-qty', type: 'number', placeholder: ph });
  const a = ni('A'), b = ni('B'), c = ni('C'), x = h('span', { className: 'util-result u-text-cyan' }, '—');
  const calc = () => { const va = +a.value, vb = +b.value, vc = +c.value; x.textContent = va ? String(Math.round((vb * vc / va) * 1e6) / 1e6) : '—'; };
  a.oninput = b.oninput = c.oninput = calc;
  return h('div', { className: 'util-body' },
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: 0 } }, 'A está para B, assim como C está para X'),
    h('div', { className: 'util-pct' }, a, h('span', null, '↔'), b, h('span', null, ' · '), c, h('span', null, '↔'), x));
}

/* ===== Conversor de Bytes ===== */
function toolBytes() {
  const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];
  const val = h('input', { className: 'input util-qty', type: 'number', value: '1024', 'aria-label': 'Quantidade a converter' });
  const unit = h('select', { className: 'input util-qty', 'aria-label': 'Unidade de origem' },
    ...UNITS.map((u, i) => h('option', { value: String(1024 ** i) }, u)));
  const out = h('div', { className: 'util-stats' });
  const update = () => {
    const bytes = (parseFloat(val.value) || 0) * (+unit.value);
    empty(out);
    UNITS.forEach((u, i) => {
      const v = bytes / (1024 ** i);
      out.appendChild(h('div', { className: 'util-stat' },
        h('div', { className: 'util-stat__v u-text-cyan' }, String(Math.round(v * 1000) / 1000)),
        h('div', { className: 'util-stat__k u-text-muted' }, u)));
    });
  };
  val.oninput = update; unit.onchange = update; update();
  return h('div', { className: 'util-body' }, h('div', { className: 'util-row' }, val, unit), out);
}

/* ===== Frequência de Palavras ===== */
function toolFreq() {
  const ta = h('textarea', { className: 'input util-textarea', rows: 4, placeholder: 'Cole um texto...' });
  const out = h('div', { className: 'util-freq' });
  ta.oninput = () => {
    const words = ta.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').match(/[a-z0-9]+/g) || [];
    const freq = {}; words.forEach((w) => (freq[w] = (freq[w] || 0) + 1));
    const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 15);
    empty(out);
    if (!top.length) { out.appendChild(h('div', { className: 'u-text-muted' }, '—')); return; }
    top.forEach(([w, n]) => out.appendChild(h('div', { className: 'util-freq__row' },
      h('span', null, w), h('span', { className: 'u-text-cyan u-mono' }, String(n)))));
  };
  return h('div', { className: 'util-body' }, ta, out);
}

export function utilidadesPage() {
  const page = h('div', { className: 'page-utilidades' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'UTILIDADES')),
      h('h1', { className: 'page-header__title' }, '🧰 Caixa de Ferramentas'),
      h('p', { className: 'page-header__description' },
        'Utilidades rápidas do dia a dia — ',
        h('span', { className: 'u-text-cyan' }, '25 ferramentas técnicas'),
        ' (senhas, UUID, texto, datas, fusos, Markdown, binário, JSON↔CSV, bytes…). Tudo no navegador.'))
  );
  page.appendChild(
    h('div', { className: 'util-grid' },
      section('Gerador de Senhas', '🔑', toolSenha()),
      section('Gerador de UUID', '🆔', toolUuid()),
      section('Contador de Texto', '🔢', toolContador()),
      section('Timestamp ↔ Data', '🕔', toolTimestamp()),
      section('Calculadora de Porcentagem', '％', toolPorcentagem()),
      section('Diff de Texto', '🔀', toolDiff()),
      section('Lorem Ipsum', '📝', toolLorem()),
      section('Número por Extenso', '🔡', toolExtenso()),
      section('Base64 de Imagem', '🖼', toolImgBase64()),
      section('Sorteador / Roleta', '🎲', toolSorteador()),
      section('Conversor de Caso', '🔤', toolCaso()),
      section('Gerador de Slug', '🔗', toolSlug()),
      section('Tabela ASCII', '🔠', toolAscii()),
      section('Números Romanos', 'Ⅻ', toolRomanos()),
      section('Calculadora de Datas', '📅', toolDatas()),
      section('px ↔ rem', '📐', toolPxRem()),
      section('Relógio Mundial', '🌐', toolFusos()),
      section('Markdown → HTML', '📄', toolMarkdown()),
      section('Texto ↔ Binário', '🔟', toolBinario()),
      section('JSON ↔ CSV', '📊', toolJsonCsv()),
      section('Regra de Três', '➗', toolRegraTres()),
      section('Conversor de Bytes', '💾', toolBytes()),
      section('Frequência de Palavras', '📈', toolFreq()))
  );
  return page;
}
