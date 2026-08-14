import '../styles/gerar-codigo.css';
import { h, empty, randHex } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { loadConfig, processServer } from '../utils/jarvis-engine.js';
import type { JarvisConfig, JarvisMessage } from '../utils/jarvis-engine.js';
import { highlight } from '../utils/syntax-highlight.js';
import { addMemory } from '../utils/jarvis-brain.js';
import { LANGS } from '../data/editor-langs.js';
import type { LanguageDefinition } from '../data/editor-langs.js';

interface EditorTab {
  id: string;
  name: string;
  lang: string;
  content: string;
}

interface EditorState {
  tabs: EditorTab[];
  activeId: string | null;
}

function stripFences(value: string): string {
  let text = value.trim();
  const match = text.match(/```[a-zA-Z0-9+#.-]*\n?([\s\S]*?)```/);
  if (match?.[1]) text = match[1].trim();
  return text;
}

function isEditorState(value: unknown): value is EditorState {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return Array.isArray(record.tabs) && record.tabs.every((tab) => {
    if (tab === null || typeof tab !== 'object') return false;
    const candidate = tab as Record<string, unknown>;
    return typeof candidate.id === 'string' && typeof candidate.name === 'string'
      && typeof candidate.lang === 'string' && typeof candidate.content === 'string';
  });
}

function languageForId(id: string): LanguageDefinition {
  return LANGS.find((language) => language.id === id) ?? LANGS[0];
}

export function gerarCodigoPage(): HTMLDivElement {
  const page = h('div', { className: 'page-gerar' });
  let busy = false;
  let lastCode = '';

  page.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'GERAR CÓDIGO')),
    h('h1', { className: 'page-header__title' }, '🧬 Gerador de Código'),
    h('p', { className: 'page-header__description' },
      'Descreva o que precisa e o ', h('span', { className: 'u-text-cyan' }, 'JARVIS'),
      ' escreve o código. Depois copie ou abra direto no Editor.')));

  const langSel = h('select', { className: 'ger-select', 'aria-label': 'Linguagem do código gerado' },
    ...LANGS.map((language) => h('option', { value: language.id }, language.name)));
  const promptEl = h('textarea', {
    className: 'ger-prompt',
    rows: 3,
    placeholder: 'Ex.: uma função que valida CPF · um componente de contador · um script que lê um CSV e soma a coluna "valor"',
  });
  const genBtn = h('button', { className: 'btn btn--primary', onclick: (): void => { void generate(); } }, '🧬 Gerar código');
  promptEl.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) void generate();
  });

  page.appendChild(h('div', { className: 'ger-controls' }, langSel, genBtn,
    h('span', { className: 'u-text-muted', style: { fontSize: '11px' } }, 'Ctrl+Enter gera')));
  page.appendChild(promptEl);

  const status = h('div', { className: 'ger-status u-text-muted', style: { display: 'none' } });
  page.appendChild(status);

  const codeBlock = h('pre', { className: 'ger-code' });
  const out = h('div', { className: 'ger-out', style: { display: 'none' } },
    h('div', { className: 'ger-out__head' },
      h('span', { className: 'ger-out__title' }, 'Código gerado'),
      h('div', { className: 'ger-out__actions' },
        h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => copyCode() }, '📋 Copiar'),
        h('button', { className: 'btn btn--ghost btn--sm', onclick: (): void => openInEditor() }, '↪ Abrir no Editor'))),
    codeBlock);
  page.appendChild(out);

  function setStatus(text: string, show = true): void {
    status.textContent = text;
    status.style.display = show ? 'block' : 'none';
  }

  async function generate(): Promise<void> {
    const prompt = promptEl.value.trim();
    if (prompt.length < 4) {
      toast('Descreva o que você quer gerar', { type: 'warning' });
      return;
    }
    if (busy) return;
    busy = true;
    genBtn.disabled = true;
    genBtn.textContent = 'Gerando…';
    out.style.display = 'none';
    setStatus('JARVIS escrevendo o código…');
    const language = languageForId(langSel.value);
    const systemPrompt = `Você é um gerador de código sênior. Gere SOMENTE código ${language.id} que atenda ao pedido do operador, completo e pronto para uso, com comentários curtos quando ajudar. `
      + 'NÃO explique fora do código, NÃO use markdown nem cercas ```.'
      + ' Devolva apenas o código.';
    try {
      const messages: readonly JarvisMessage[] = [{ role: 'user', text: prompt }];
      const config: JarvisConfig = { ...loadConfig(), systemPrompt };
      const reply = await processServer(messages, config);
      lastCode = stripFences(reply);
      try {
        addMemory({ text: `Gerou código (${language.id}): ${prompt}`, source: 'gerador' });
      } catch {
        // Memória é best-effort e não pode bloquear a geração.
      }
      empty(codeBlock);
      codeBlock.innerHTML = highlight(lastCode, language);
      out.style.display = 'block';
      setStatus('', false);
      toast('Código gerado', { type: 'success' });
    } catch (error) {
      console.error('[gerar]', error);
      setStatus('Não consegui gerar agora. A IA do servidor pode estar indisponível. Tente de novo.');
      toast('Falha ao gerar', { type: 'danger' });
    } finally {
      busy = false;
      genBtn.disabled = false;
      genBtn.textContent = 'Gerar código';
    }
  }

  function copyCode(): void {
    if (!lastCode) return;
    void navigator.clipboard.writeText(lastCode).then(
      () => toast('Copiado', { type: 'success' }),
      () => toast('Não consegui copiar', { type: 'danger' }),
    );
  }

  function openInEditor(): void {
    if (!lastCode) return;
    const languageId = langSel.value;
    const language = languageForId(languageId);
    const saved: unknown = storage.get('editor:state');
    const editorState: EditorState = isEditorState(saved)
      ? saved
      : { tabs: [], activeId: null };
    const tab: EditorTab = {
      id: `tab_${randHex(4)}`,
      name: `gerado.${language.ext}`,
      lang: language.id,
      content: lastCode,
    };
    editorState.tabs.push(tab);
    editorState.activeId = tab.id;
    storage.set('editor:state', editorState);
    toast('Aberto no Editor', { type: 'success' });
    window.setTimeout(() => router.navigate('/editor'), 300);
  }

  return page;
}
