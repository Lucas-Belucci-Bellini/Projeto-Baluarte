/**
 * Página /utilidades — Caixa de Ferramentas (Lote 1).
 * Mini-ferramentas técnicas, JS puro, sem dependências:
 *   1) Gerador de Senhas  2) Gerador de UUID  3) Contador de Texto
 *   4) Timestamp ↔ Data   5) Calculadora de Porcentagem
 */

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
  const out = h('textarea', { className: 'input util-out u-mono', rows: 4, readonly: true });
  const qty = h('input', { className: 'input util-qty', type: 'number', min: '1', max: '100', value: '5' });
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
  const dtIn = h('input', { className: 'input', type: 'datetime-local' });
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
        h('span', { className: 'u-text-cyan' }, 'senhas, UUID, contador de texto, timestamp e porcentagem'),
        '. Tudo no navegador.'))
  );
  page.appendChild(
    h('div', { className: 'util-grid' },
      section('Gerador de Senhas', '🔑', toolSenha()),
      section('Gerador de UUID', '🆔', toolUuid()),
      section('Contador de Texto', '🔢', toolContador()),
      section('Timestamp ↔ Data', '🕔', toolTimestamp()),
      section('Calculadora de Porcentagem', '％', toolPorcentagem()))
  );
  return page;
}
