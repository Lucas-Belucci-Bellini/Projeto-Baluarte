/**
 * Motor do Editor — gerencia tabs, persistência em localStorage e runners.
 *
 * Tabs são armazenadas em storage como:
 *   { tabs: [{ id, name, lang, content }], activeId }
 */

import { storage } from '../core/storage.js';
import { uid } from './helpers.js';
import { LANGS, getLang } from '../data/editor-langs.js';

const STORAGE_KEY = 'editor:state';

const DEFAULT_SAMPLES = {
  javascript: `// Welcome ao Editor de Código do Baluarte
// Pressione Ctrl+Enter para rodar.

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(\`fib(\${i}) = \${fibonacci(i)}\`);
}
`,
  html: `<!DOCTYPE html>
<html lang="pt-BR">
  <head><meta charset="UTF-8"><title>Demo</title></head>
  <body>
    <h1>Olá do Baluarte</h1>
    <p>Edite e veja a preview ao lado.</p>
    <script>
      document.querySelector('h1').style.color = '#00f0ff';
    </script>
  </body>
</html>
`,
  css: `:root { --accent: #00f0ff; }
body {
  background: #0a0a0a;
  color: var(--accent);
  font-family: system-ui;
  display: grid;
  place-items: center;
  min-height: 100vh;
}
h1 { text-shadow: 0 0 12px var(--accent); }
`,
  markdown: `# Documento de Teste

Edite à esquerda, veja a preview à direita.

## Lista
- item 1
- item 2

**Negrito** e *itálico*. Use \`código inline\` ou:

\`\`\`js
const x = 42;
\`\`\`

[Link para o repositório](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte)
`,
  python: `# Editor exibe Python com syntax highlight
# (sem runner ainda — chega na Fase 21 com IDE completa)

def fibonacci(n):
    return n if n < 2 else fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"fib({i}) = {fibonacci(i)}")
`
};

function makeTab(lang = 'javascript', content = null, name = null) {
  const langDef = getLang(lang);
  return {
    id: uid('tab'),
    name: name || `untitled.${langDef.ext}`,
    lang,
    content: content != null ? content : (DEFAULT_SAMPLES[lang] || '')
  };
}

/* ===== Estado ===== */

export function loadState() {
  const saved = storage.get(STORAGE_KEY);
  if (saved && Array.isArray(saved.tabs) && saved.tabs.length) {
    return saved;
  }
  /* Estado inicial com tabs de exemplo */
  const tabs = [
    makeTab('javascript', null, 'demo.js'),
    makeTab('html', null, 'demo.html'),
    makeTab('markdown', null, 'README.md')
  ];
  return { tabs, activeId: tabs[0].id };
}

export function saveState(state) {
  storage.set(STORAGE_KEY, state);
}

/* ===== Mutations ===== */

export function addTab(state, lang = 'javascript') {
  const tab = makeTab(lang);
  state.tabs.push(tab);
  state.activeId = tab.id;
  return tab;
}

export function closeTab(state, tabId) {
  const idx = state.tabs.findIndex((t) => t.id === tabId);
  if (idx === -1) return;
  state.tabs.splice(idx, 1);
  if (state.tabs.length === 0) {
    /* Garante pelo menos uma tab */
    addTab(state, 'javascript');
    return;
  }
  if (state.activeId === tabId) {
    state.activeId = state.tabs[Math.max(0, idx - 1)].id;
  }
}

export function getActiveTab(state) {
  return state.tabs.find((t) => t.id === state.activeId) || state.tabs[0];
}

export function updateTabContent(state, tabId, content) {
  const tab = state.tabs.find((t) => t.id === tabId);
  if (tab) tab.content = content;
}

export function changeTabLang(state, tabId, lang) {
  const tab = state.tabs.find((t) => t.id === tabId);
  if (!tab) return;
  const langDef = getLang(lang);
  tab.lang = lang;
  /* Atualiza extensão se nome ainda for default */
  if (/^untitled\./.test(tab.name)) tab.name = `untitled.${langDef.ext}`;
}

export function renameTab(state, tabId, newName) {
  const tab = state.tabs.find((t) => t.id === tabId);
  if (tab && newName.trim()) tab.name = newName.trim();
}

/* ===== Runner ===== */

/**
 * Executa o conteúdo da tab e devolve um HTML/string para preview.
 * @returns {{ type: 'iframe'|'html'|'logs', payload: string }}
 */
export function runTab(tab) {
  const lang = getLang(tab.lang);

  if (lang.runner === 'js') {
    return runJs(tab.content);
  }
  if (lang.runner === 'html') {
    return { type: 'iframe', payload: tab.content };
  }
  if (lang.runner === 'css') {
    /* CSS sem HTML não roda; embrulhamos em demo */
    const html = `<!DOCTYPE html><html><head><style>${tab.content}</style></head><body>
      <h1>CSS Preview</h1>
      <p>Esta página renderiza o CSS que você escreveu.</p>
      <button>Botão demo</button>
      <input placeholder="Input demo">
      <a href="#">Link demo</a>
    </body></html>`;
    return { type: 'iframe', payload: html };
  }
  if (lang.runner === 'markdown') {
    return { type: 'html', payload: renderMarkdown(tab.content) };
  }
  return {
    type: 'logs',
    payload: `[!] "${lang.name}" não tem runner nesta fase. Adicionado como referência visual e syntax highlight.`
  };
}

function runJs(code) {
  /* Captura console e erros, embrulha em iframe sandbox via srcdoc.
     Isolamento total + sem acesso ao DOM principal. */
  const escaped = code
    .replace(/<\/script>/gi, '<\\/script>');
  const srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
    body{background:#0a0a0a;color:#e6f1ff;font-family:'JetBrains Mono',monospace;font-size:13px;margin:0;padding:12px;}
    .log{padding:4px 0;border-bottom:1px dashed #1c2e47;white-space:pre-wrap;word-break:break-all}
    .log--error{color:#ff3355}
    .log--warn{color:#ffaa00}
    .log--info{color:#66ddff}
    .log__type{display:inline-block;width:60px;color:#5a6b85;text-transform:uppercase;font-size:11px}
  </style></head><body><div id="out"></div><script>
    const out = document.getElementById('out');
    function append(type, args){
      const div = document.createElement('div');
      div.className = 'log log--' + type;
      div.innerHTML = '<span class="log__type">' + type + '</span>' +
        args.map(a => typeof a==='object'?JSON.stringify(a,null,2):String(a)).join(' ');
      out.appendChild(div);
    }
    const _log=console.log,_err=console.error,_warn=console.warn,_info=console.info;
    console.log=(...a)=>{append('log',a);_log.apply(console,a);};
    console.error=(...a)=>{append('error',a);_err.apply(console,a);};
    console.warn=(...a)=>{append('warn',a);_warn.apply(console,a);};
    console.info=(...a)=>{append('info',a);_info.apply(console,a);};
    window.addEventListener('error', (e)=>append('error',[e.message + ' at line ' + e.lineno]));
    try {
      ${escaped}
    } catch(e) {
      append('error', [e.message]);
    }
  </script></body></html>`;
  return { type: 'iframe', payload: srcdoc };
}

/* ===== Markdown render mínimo ===== */

function renderMarkdown(md) {
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  /* Code fences ``` */
  html = html.replace(/```([a-z]*)\n([\s\S]*?)```/g, (_m, lang, code) =>
    `<pre><code class="lang-${lang}">${code}</code></pre>`
  );

  /* Headings */
  html = html.replace(/^(#{1,6})\s+(.+)$/gm, (_m, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text}</h${level}>`;
  });

  /* Bold + italic */
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>');

  /* Inline code */
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  /* Links */
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  /* Listas - itens */
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);

  /* Parágrafos: linhas que não viraram bloco */
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (/^\s*<(h[1-6]|ul|pre|ol|blockquote)/i.test(block.trim())) return block;
      if (!block.trim()) return '';
      return `<p>${block.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return `<div class="md-preview">${html}</div>`;
}

export { LANGS };
