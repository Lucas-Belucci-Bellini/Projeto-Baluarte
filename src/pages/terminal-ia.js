/**
 * /terminal-ia — o "terminal do Claude Code" no site.
 *
 * REPL onde o operador digita comandos (`:go`, `:mem`, `:code`, `:chart`,
 * `:brain`) ou linguagem natural, e o JARVIS responde e age. Reaproveita toda
 * a base já pronta: jarvis-engine (Gemini/local), site-capabilities (mapa do
 * site), jarvis-brain (memória + codemap) e chart-engine (gráficos).
 */

import '../styles/terminal.css';
import '../styles/terminal-ia.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { loadConfig, processLocal, processServer, getBaluarteBriefing } from '../utils/jarvis-engine.js';
import { findCapability } from '../data/site-capabilities.js';
import { addMemory, searchMemories, getMemories, clearMemories, memoryContext, conceptLabel, captureConversation, captureReply } from '../utils/jarvis-brain.js';
import { drawChart } from '../utils/chart-engine.js';
import cerebro from '../data/cerebro.json';
import codemap from '../data/codemap.json';

const HELP = [
  ['<texto livre>', 'pergunta ao JARVIS (Gemini, com todo o contexto do site)'],
  [':go <destino>', 'navega para qualquer página ("go enciclopedia militar")'],
  [':mem add <fato>', 'memoriza um fato (liga ao Segundo Cérebro)'],
  [':mem find <termo>', 'busca nas memórias'],
  [':mem list', 'lista as memórias'],
  [':code <termo>', 'inspeciona o próprio código (Raio-X / codemap)'],
  [':chart <tipo>: a 1, b 2', 'desenha um gráfico'],
  [':brain <conceito>', 'mostra ligações no Segundo Cérebro'],
  [':clear', 'limpa o terminal'],
  [':help', 'mostra esta ajuda']
];

export function terminalIaPage() {
  const page = h('div', { className: 'page-terminal-ia' });

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'TERMINAL-IA')),
      h('h1', { className: 'page-header__title' }, '💻 Terminal-IA'),
      h('p', { className: 'page-header__description' },
        'O terminal do Claude Code no site: comandos ', h('span', { className: 'u-mono' }, ':go :mem :code :chart :brain'),
        ' ou linguagem natural com o JARVIS.'))
  );

  const out = h('div', { className: 'tia-out' });
  const prompt = h('span', { className: 'tia-prompt' }, '⬡ baluarte ❯');
  const input = h('input', { className: 'tia-input', type: 'text', autocomplete: 'off', spellcheck: false, 'aria-label': 'comando' });
  const win = h('div', { className: 'tia-win' },
    out,
    h('div', { className: 'tia-line tia-line--input' }, prompt, input));
  page.appendChild(win);

  win.addEventListener('click', () => input.focus());

  /* ===== saída ===== */
  function echo(text, cls) {
    out.appendChild(h('div', { className: 'tia-row ' + (cls || '') }, text));
    win.scrollTop = win.scrollHeight;
  }
  function echoEl(el) { out.appendChild(el); win.scrollTop = win.scrollHeight; }
  function rows(pairs, sep = '  —  ') {
    pairs.forEach(([a, b]) => echo(`${a}${sep}${b}`, 'tia-dim'));
  }

  /* banner */
  echo('J.A.R.V.I.S. // Terminal-IA online. Digite :help para os comandos.', 'tia-ok');

  /* ===== gráficos ===== */
  function chartEl(payload) {
    const canvas = h('canvas', { style: { width: '100%', height: '220px', display: 'block' } });
    const box = h('div', { className: 'tia-chart' }, canvas);
    requestAnimationFrame(() => {
      try { drawChart(canvas, payload.type || 'bar', payload.data, { title: payload.title || '' }); }
      catch (e) { echo('erro ao desenhar: ' + e.message, 'tia-err'); }
    });
    return box;
  }
  function renderCharts(text) {
    return String(text || '').replace(/```chart\s*([\s\S]*?)```/gi, (whole, body) => {
      try {
        const spec = JSON.parse(body.trim());
        const values = (spec.values || []).map(Number).filter((n) => !Number.isNaN(n));
        if (values.length) {
          echoEl(chartEl({ type: spec.type || 'bar', title: spec.title || '', data: { labels: spec.labels && spec.labels.length ? spec.labels : values.map((_, i) => '#' + (i + 1)), values } }));
          return '';
        }
      } catch { /* ignora */ }
      return whole;
    }).trim();
  }

  /* ===== JARVIS (linguagem natural) ===== */
  async function ask(text) {
    captureConversation(text); /* auto-memória: tudo que se escreve no terminal vira memória */
    const pending = h('div', { className: 'tia-row tia-dim' }, 'JARVIS pensando…');
    echoEl(pending);
    const cfg = loadConfig();
    const base = (cfg && cfg.systemPrompt) || 'Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte. Seja direto e técnico.';
    let mem = '';
    try { mem = memoryContext(text); } catch { /* ok */ }
    const callConfig = { ...cfg, systemPrompt: `${base}\n\n${getBaluarteBriefing()}${mem ? '\n\n' + mem : ''}` };
    try {
      const reply = await processServer([{ role: 'user', text }], callConfig);
      pending.remove();
      captureReply(reply);
      const clean = renderCharts(reply);
      if (clean) echo(clean, 'tia-ai');
    } catch {
      /* sem servidor → resposta local determinística */
      pending.remove();
      const r = processLocal(text);
      if (r.action?.type === 'chart') echoEl(chartEl(r.action.payload));
      echo(r.text + '  ·  (IA do servidor indisponível — modo local)', 'tia-ai');
      if (r.action?.type === 'navigate') setTimeout(() => router.navigate(r.action.payload), 500);
    }
  }

  /* ===== comandos ===== */
  function cmd(line) {
    const sp = line.indexOf(' ');
    const name = (sp < 0 ? line : line.slice(0, sp)).toLowerCase();
    const arg = sp < 0 ? '' : line.slice(sp + 1).trim();

    if (name === 'help') { echo('Comandos:', 'tia-ok'); rows(HELP); return; }
    if (name === 'clear') { empty(out); return; }

    if (name === 'go') {
      const cap = findCapability(arg);
      if (cap) { echo(`→ ${cap.label} (${cap.path})`, 'tia-ok'); setTimeout(() => router.navigate(cap.path), 350); }
      else echo(`destino não encontrado: "${arg}"`, 'tia-err');
      return;
    }

    if (name === 'mem') {
      const sub = arg.split(' ')[0];
      const rest = arg.slice(sub.length).trim();
      if (sub === 'add' && rest) {
        const it = addMemory({ text: rest, source: 'terminal' });
        const cs = (it.conceptIds || []).map(conceptLabel);
        echo(`🧠 memorizado${cs.length ? ' → ' + cs.join(', ') : ''}`, 'tia-ok');
      } else if (sub === 'find' && rest) {
        const hits = searchMemories(rest, 8);
        if (hits.length) hits.forEach((m) => echo('• ' + m.text, 'tia-dim'));
        else echo('nenhuma memória encontrada', 'tia-err');
      } else if (sub === 'list') {
        const all = getMemories();
        if (all.length) all.forEach((m) => echo('• ' + m.text, 'tia-dim'));
        else echo('memória vazia. use :mem add <fato>', 'tia-dim');
      } else if (sub === 'clear') {
        clearMemories(); echo('memória limpa', 'tia-ok');
      } else echo('uso: :mem add|find|list|clear', 'tia-err');
      return;
    }

    if (name === 'code') {
      const m = codemap.meta || {};
      echo(`${m.files} arquivos · ${m.loc} linhas · ${m.links} imports`, 'tia-ok');
      if (arg) {
        const q = arg.toLowerCase();
        const hits = (codemap.nodes || []).filter((n) => (n.id + ' ' + n.label).toLowerCase().includes(q)).slice(0, 10);
        if (hits.length) hits.forEach((n) => echo(`• ${n.id}  ${n.loc} ln  ·  importado ${n.importedBy}×`, 'tia-dim'));
        else echo(`nenhum arquivo casa com "${arg}". Abra /codigo para o grafo 3D.`, 'tia-dim');
      } else {
        (codemap.topImported || []).slice(0, 6).forEach((x) => echo(`• ${x.label} — importado ${x.importedBy}×`, 'tia-dim'));
      }
      return;
    }

    if (name === 'chart') {
      const r = processLocal('gráfico ' + arg);
      if (r.action?.type === 'chart') echoEl(chartEl(r.action.payload));
      else echo('não entendi os dados. Ex.: :chart barras: jan 10, fev 20, mar 30', 'tia-err');
      return;
    }

    if (name === 'brain') {
      const q = arg.toLowerCase();
      const node = cerebro.nodes.find((n) => n.label.toLowerCase().includes(q) || n.id === q);
      if (!node) { echo(`conceito não encontrado: "${arg}". Abra /cerebro.`, 'tia-err'); return; }
      const links = cerebro.links.filter((l) => l.source === node.id || l.target === node.id)
        .map((l) => (l.source === node.id ? l.target : l.source));
      const labels = links.map((id) => { const n = cerebro.nodes.find((x) => x.id === id); return n ? n.label : id; });
      const mems = getMemories().filter((mm) => (mm.conceptIds || []).includes(node.id)).length;
      echo(`🧠 ${node.label} (${node.tipo}) — ${labels.length} ligações · ${mems} memória(s)`, 'tia-ok');
      if (labels.length) echo('↔ ' + [...new Set(labels)].join(', '), 'tia-dim');
      if (node.rota) { echo(`abrindo ${node.rota}…`, 'tia-dim'); setTimeout(() => router.navigate(node.rota), 600); }
      return;
    }

    echo(`comando desconhecido: :${name} — tente :help`, 'tia-err');
  }

  /* ===== entrada + histórico ===== */
  const history = [];
  let hi = 0;
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const line = input.value.trim();
      input.value = '';
      if (!line) return;
      echo('❯ ' + line, 'tia-cmd');
      history.push(line); hi = history.length;
      if (line.startsWith(':')) cmd(line.slice(1).trim());
      else ask(line);
    } else if (e.key === 'ArrowUp') {
      if (hi > 0) { hi--; input.value = history[hi] || ''; e.preventDefault(); }
    } else if (e.key === 'ArrowDown') {
      if (hi < history.length) { hi++; input.value = history[hi] || ''; }
    }
  });

  setTimeout(() => input.focus(), 60);
  return page;
}
