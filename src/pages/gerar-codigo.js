/**
 * /gerar-codigo — Gerador de Código (o site + a IA criam código).
 *
 * O operador descreve o que quer; o JARVIS (Gemini) gera o código, que é
 * mostrado com realce de sintaxe e pode ser copiado ou aberto no Editor.
 * Reaproveita o jarvis-engine (processServer) e o syntax-highlight.
 */

import '../styles/gerar-codigo.css';
import { h, empty, randHex } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { loadConfig, processServer } from '../utils/jarvis-engine.js';
import { highlight } from '../utils/syntax-highlight.js';
import { addMemory } from '../utils/jarvis-brain.js';

const LANGS = [
  ['javascript', 'JavaScript', 'js'], ['python', 'Python', 'py'], ['typescript', 'TypeScript', 'ts'],
  ['html', 'HTML', 'html'], ['css', 'CSS', 'css'], ['rust', 'Rust', 'rs'],
  ['c', 'C', 'c'], ['cpp', 'C++', 'cpp'], ['java', 'Java', 'java'], ['go', 'Go', 'go'],
  ['sql', 'SQL', 'sql'], ['bash', 'Bash', 'sh']
];

function stripFences(s) {
  let t = String(s || '').trim();
  const m = t.match(/```[a-zA-Z0-9]*\n?([\s\S]*?)```/);
  if (m) t = m[1].trim();
  return t;
}

export function gerarCodigoPage() {
  const page = h('div', { className: 'page-gerar' });
  let busy = false;
  let lastCode = '';

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'GERAR CÓDIGO')),
      h('h1', { className: 'page-header__title' }, '🧬 Gerador de Código'),
      h('p', { className: 'page-header__description' },
        'Descreva o que precisa e o ', h('span', { className: 'u-text-cyan' }, 'JARVIS'),
        ' escreve o código. Depois copie ou abra direto no Editor.'))
  );

  const langSel = h('select', { className: 'ger-select', 'aria-label': 'Linguagem do código gerado' },
    ...LANGS.map(([v, label]) => h('option', { value: v }, label)));
  const promptEl = h('textarea', {
    className: 'ger-prompt', rows: 3,
    placeholder: 'Ex.: uma função que valida CPF · um componente de contador · um script que lê um CSV e soma a coluna "valor"'
  });
  const genBtn = h('button', { className: 'btn btn--primary', onclick: () => generate() }, '🧬 Gerar código');
  promptEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(); });

  page.appendChild(h('div', { className: 'ger-controls' },
    langSel, genBtn,
    h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'Ctrl+Enter gera')));
  page.appendChild(promptEl);

  const status = h('div', { className: 'ger-status u-text-muted', style: { display: 'none' } });
  page.appendChild(status);

  /* saída */
  const codeBlock = h('pre', { className: 'ger-code' });
  const out = h('div', { className: 'ger-out', style: { display: 'none' } },
    h('div', { className: 'ger-out__head' },
      h('span', { className: 'ger-out__title' }, 'Código gerado'),
      h('div', { className: 'ger-out__actions' },
        h('button', { className: 'btn btn--ghost btn--sm', onclick: () => copyCode() }, '📋 Copiar'),
        h('button', { className: 'btn btn--ghost btn--sm', onclick: () => openInEditor() }, '↪ Abrir no Editor'))),
    codeBlock);
  page.appendChild(out);

  function setStatus(text, show = true) {
    status.textContent = text; status.style.display = show ? 'block' : 'none';
  }

  async function generate() {
    const prompt = promptEl.value.trim();
    if (prompt.length < 4) { toast('Descreva o que você quer gerar', { type: 'warning' }); return; }
    if (busy) return;
    busy = true; genBtn.disabled = true; genBtn.textContent = '⏳ Gerando…';
    out.style.display = 'none';
    setStatus('JARVIS escrevendo o código…');
    const lang = langSel.value;
    const sys = `Você é um gerador de código sênior. Gere SOMENTE código ${lang} que atenda ao pedido do operador, completo e pronto para uso, com comentários curtos quando ajudar. NÃO explique fora do código, NÃO use markdown nem cercas \`\`\`. Devolva apenas o código.`;
    try {
      const reply = await processServer([{ role: 'user', text: prompt }], { ...loadConfig(), systemPrompt: sys });
      const code = stripFences(reply);
      lastCode = code;
      /* Conecta ao mesmo sistema de memória do JARVIS (Cérebro + Raio-X). */
      try { addMemory({ text: `Gerou código (${lang}): ${prompt}`, source: 'gerador' }); } catch { /* best-effort */ }
      empty(codeBlock);
      codeBlock.innerHTML = highlight(code, lang);
      out.style.display = 'block';
      setStatus('', false);
      toast('Código gerado', { type: 'success' });
    } catch (e) {
      console.error('[gerar]', e);
      setStatus('⚠ Não consegui gerar agora (a IA do servidor pode estar indisponível). Tente de novo.');
      toast('Falha ao gerar', { type: 'danger' });
    } finally {
      busy = false; genBtn.disabled = false; genBtn.textContent = '🧬 Gerar código';
    }
  }

  function copyCode() {
    if (!lastCode) return;
    navigator.clipboard.writeText(lastCode)
      .then(() => toast('Copiado', { type: 'success' }), () => toast('Não consegui copiar', { type: 'danger' }));
  }

  function openInEditor() {
    if (!lastCode) return;
    const lang = langSel.value;
    const ext = (LANGS.find((l) => l[0] === lang) || [, , 'txt'])[2];
    const st = storage.get('editor:state') || { tabs: [], activeId: null };
    if (!Array.isArray(st.tabs)) st.tabs = [];
    const tab = { id: 'tab_' + randHex(4), name: `gerado.${ext}`, lang, content: lastCode };
    st.tabs.push(tab); st.activeId = tab.id;
    storage.set('editor:state', st);
    toast('Aberto no Editor', { type: 'success' });
    setTimeout(() => router.navigate('/editor'), 300);
  }

  return page;
}
