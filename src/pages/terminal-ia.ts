/**
 * /terminal-ia — REPL do JARVIS para comandos do site e linguagem natural.
 */

import '../styles/terminal.css';
import '../styles/terminal-ia.css';
import { h, empty } from '../utils/helpers.js';
import { router } from '../core/router.js';
import {
  getBaluarteBriefing,
  loadConfig,
  processLocal,
  processServer,
} from '../utils/jarvis-engine.js';
import type {
  JarvisChartPayload,
  JarvisConfig,
  JarvisMessage,
} from '../utils/jarvis-engine.js';
import { findCapability } from '../data/site-capabilities.js';
import {
  addMemory,
  captureConversation,
  captureReply,
  clearMemories,
  conceptLabel,
  getMemories,
  memoryContext,
  searchMemories,
} from '../utils/jarvis-brain.js';
import { drawChart } from '../utils/chart-engine.js';
import cerebro from '../data/cerebro.json';
import codemap from '../data/codemap.json';

interface ChartBlockSpec {
  readonly type?: string;
  readonly title?: string;
  readonly labels?: unknown;
  readonly values?: unknown;
}

interface CerebroNode {
  readonly id: string;
  readonly label: string;
  readonly tipo: string;
  readonly rota?: string;
}

interface CerebroLink {
  readonly source: string;
  readonly target: string;
}

interface CerebroGraph {
  readonly nodes: readonly CerebroNode[];
  readonly links: readonly CerebroLink[];
}

interface CodemapMeta {
  readonly files?: number;
  readonly loc?: number;
  readonly links?: number;
}

interface CodemapNode {
  readonly id: string;
  readonly label: string;
  readonly loc: number;
  readonly importedBy: number;
}

interface CodemapTopImported {
  readonly label: string;
  readonly importedBy: number;
}

interface CodemapGraph {
  readonly meta?: CodemapMeta;
  readonly nodes?: readonly CodemapNode[];
  readonly topImported?: readonly CodemapTopImported[];
}

const brainGraph = cerebro as unknown as CerebroGraph;
const codeGraph = codemap as unknown as CodemapGraph;

const HELP: readonly (readonly [string, string])[] = [
  ['<texto livre>', 'pergunta ao JARVIS (Gemini, com todo o contexto do site)'],
  [':go <destino>', 'navega para qualquer página ("go enciclopedia militar")'],
  [':mem add <fato>', 'memoriza um fato (liga ao Segundo Cérebro)'],
  [':mem find <termo>', 'busca nas memórias'],
  [':mem list', 'lista as memórias'],
  [':code <termo>', 'inspeciona o próprio código (Raio-X / codemap)'],
  [':chart <tipo>: a 1, b 2', 'desenha um gráfico'],
  [':brain <conceito>', 'mostra ligações no Segundo Cérebro'],
  [':clear', 'limpa o terminal'],
  [':help', 'mostra esta ajuda'],
];

function isChartBlockSpec(value: unknown): value is ChartBlockSpec {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberArray(value: unknown): readonly number[] {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === 'number' && !Number.isNaN(item))
    : [];
}

export function terminalIaPage(): HTMLDivElement {
  const page = h('div', { className: 'page-terminal-ia' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'TERMINAL-IA')),
      h('h1', { className: 'page-header__title' }, '💻 Terminal-IA'),
      h('p', { className: 'page-header__description' },
        'O terminal do Claude Code no site: comandos ',
        h('span', { className: 'u-mono' }, ':go :mem :code :chart :brain'),
        ' ou linguagem natural com o JARVIS.'),
    ),
  );

  const output = h('div', { className: 'tia-out' });
  const prompt = h('span', { className: 'tia-prompt' }, '⬡ baluarte ❯');
  const input = h('input', {
    className: 'tia-input', type: 'text', autocomplete: 'off', spellcheck: false, 'aria-label': 'comando',
  });
  const windowElement = h('div', { className: 'tia-win' },
    output,
    h('div', { className: 'tia-line tia-line--input' }, prompt, input));
  page.appendChild(windowElement);
  windowElement.addEventListener('click', () => input.focus());

  function echo(text: string, className = ''): void {
    output.appendChild(h('div', { className: `tia-row ${className}` }, text));
    windowElement.scrollTop = windowElement.scrollHeight;
  }

  function echoElement(element: Node): void {
    output.appendChild(element);
    windowElement.scrollTop = windowElement.scrollHeight;
  }

  function rows(pairs: readonly (readonly [string, string])[], separator = '  —  '): void {
    pairs.forEach(([left, right]) => echo(`${left}${separator}${right}`, 'tia-dim'));
  }

  echo('J.A.R.V.I.S. // Terminal-IA online. Digite :help para os comandos.', 'tia-ok');

  function chartElement(payload: JarvisChartPayload): HTMLDivElement {
    const canvas = h('canvas', { style: { width: '100%', height: '220px', display: 'block' } });
    const box = h('div', { className: 'tia-chart' }, canvas);
    requestAnimationFrame(() => {
      try {
        drawChart(canvas, payload.type || 'bar', payload.data, { title: payload.title || '' });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        echo(`erro ao desenhar: ${message}`, 'tia-err');
      }
    });
    return box;
  }

  function renderCharts(text: string): string {
    return text.replace(/```chart\s*([\s\S]*?)```/gi, (whole: string, body: string) => {
      try {
        const parsed: unknown = JSON.parse(body.trim());
        if (!isChartBlockSpec(parsed)) return whole;
        const values = numberArray(parsed.values);
        if (!values.length) return whole;
        const labels = stringArray(parsed.labels);
        const payload: JarvisChartPayload = {
          type: typeof parsed.type === 'string' ? parsed.type : 'bar',
          title: typeof parsed.title === 'string' ? parsed.title : '',
          data: {
            labels: labels.length ? labels : values.map((_, index) => `#${index + 1}`),
            values,
          },
        };
        echoElement(chartElement(payload));
        return '';
      } catch {
        return whole;
      }
    }).trim();
  }

  async function ask(text: string): Promise<void> {
    captureConversation(text);
    const pending = h('div', { className: 'tia-row tia-dim' }, 'JARVIS pensando…');
    echoElement(pending);
    const config = loadConfig();
    const base = config.systemPrompt || 'Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte. Seja direto e técnico.';
    let memory = '';
    try {
      memory = memoryContext(text);
    } catch {
      memory = '';
    }
    const callConfig: JarvisConfig = {
      ...config,
      systemPrompt: `${base}\n\n${getBaluarteBriefing()}${memory ? `\n\n${memory}` : ''}`,
    };
    try {
      const messages: readonly JarvisMessage[] = [{ role: 'user', text }];
      const reply = await processServer(messages, callConfig);
      pending.remove();
      captureReply(reply);
      const clean = renderCharts(reply);
      if (clean) echo(clean, 'tia-ai');
    } catch {
      pending.remove();
      const local = processLocal(text);
      if (local.action?.type === 'chart') echoElement(chartElement(local.action.payload));
      echo(`${local.text}  ·  (IA do servidor indisponível — modo local)`, 'tia-ai');
      if (local.action?.type === 'navigate') {
        const destination = local.action.payload;
        setTimeout(() => router.navigate(destination), 500);
      }
    }
  }

  function command(line: string): void {
    const space = line.indexOf(' ');
    const name = (space < 0 ? line : line.slice(0, space)).toLowerCase();
    const argument = space < 0 ? '' : line.slice(space + 1).trim();
    if (name === 'help') {
      echo('Comandos:', 'tia-ok');
      rows(HELP);
      return;
    }
    if (name === 'clear') {
      empty(output);
      return;
    }
    if (name === 'go') {
      const capability = findCapability(argument);
      if (capability) {
        echo(`→ ${capability.label} (${capability.path})`, 'tia-ok');
        setTimeout(() => router.navigate(capability.path), 350);
      } else {
        echo(`destino não encontrado: "${argument}"`, 'tia-err');
      }
      return;
    }
    if (name === 'mem') {
      const subcommand = argument.split(' ')[0];
      const rest = argument.slice(subcommand.length).trim();
      if (subcommand === 'add' && rest) {
        const item = addMemory({ text: rest, source: 'terminal' });
        const concepts = item?.conceptIds?.map(conceptLabel) ?? [];
        echo(`🧠 memorizado${concepts.length ? ` → ${concepts.join(', ')}` : ''}`, 'tia-ok');
      } else if (subcommand === 'find' && rest) {
        const hits = searchMemories(rest, 8);
        if (hits.length) hits.forEach((memoryItem) => echo(`• ${memoryItem.text}`, 'tia-dim'));
        else echo('nenhuma memória encontrada', 'tia-err');
      } else if (subcommand === 'list') {
        const memories = getMemories();
        if (memories.length) memories.forEach((memoryItem) => echo(`• ${memoryItem.text}`, 'tia-dim'));
        else echo('memória vazia. use :mem add <fato>', 'tia-dim');
      } else if (subcommand === 'clear') {
        clearMemories();
        echo('memória limpa', 'tia-ok');
      } else {
        echo('uso: :mem add|find|list|clear', 'tia-err');
      }
      return;
    }
    if (name === 'code') {
      const meta = codeGraph.meta ?? {};
      echo(`${meta.files ?? 0} arquivos · ${meta.loc ?? 0} linhas · ${meta.links ?? 0} imports`, 'tia-ok');
      if (argument) {
        const query = argument.toLowerCase();
        const hits = (codeGraph.nodes ?? [])
          .filter((node) => `${node.id} ${node.label}`.toLowerCase().includes(query))
          .slice(0, 10);
        if (hits.length) hits.forEach((node) => echo(`• ${node.id}  ${node.loc} ln  ·  importado ${node.importedBy}×`, 'tia-dim'));
        else echo(`nenhum arquivo casa com "${argument}". Abra /codigo para o grafo 3D.`, 'tia-dim');
      } else {
        (codeGraph.topImported ?? []).slice(0, 6)
          .forEach((item) => echo(`• ${item.label} — importado ${item.importedBy}×`, 'tia-dim'));
      }
      return;
    }
    if (name === 'chart') {
      const local = processLocal(`gráfico ${argument}`);
      if (local.action?.type === 'chart') echoElement(chartElement(local.action.payload));
      else echo('não entendi os dados. Ex.: :chart barras: jan 10, fev 20, mar 30', 'tia-err');
      return;
    }
    if (name === 'brain') {
      const query = argument.toLowerCase();
      const node = brainGraph.nodes.find((candidate) => candidate.label.toLowerCase().includes(query) || candidate.id === query);
      if (!node) {
        echo(`conceito não encontrado: "${argument}". Abra /cerebro.`, 'tia-err');
        return;
      }
      const linkIds = brainGraph.links
        .filter((link) => link.source === node.id || link.target === node.id)
        .map((link) => link.source === node.id ? link.target : link.source);
      const labels = linkIds.map((id) => brainGraph.nodes.find((candidate) => candidate.id === id)?.label ?? id);
      const memoryCount = getMemories().filter((item) => item.conceptIds?.includes(node.id)).length;
      echo(`🧠 ${node.label} (${node.tipo}) — ${labels.length} ligações · ${memoryCount} memória(s)`, 'tia-ok');
      if (labels.length) echo(`↔ ${[...new Set(labels)].join(', ')}`, 'tia-dim');
      if (node.rota) {
        echo(`abrindo ${node.rota}…`, 'tia-dim');
        setTimeout(() => router.navigate(node.rota as string), 600);
      }
      return;
    }
    echo(`comando desconhecido: :${name} — tente :help`, 'tia-err');
  }

  const history: string[] = [];
  let historyIndex = 0;
  input.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      const line = input.value.trim();
      input.value = '';
      if (!line) return;
      echo(`❯ ${line}`, 'tia-cmd');
      history.push(line);
      historyIndex = history.length;
      if (line.startsWith(':')) command(line.slice(1).trim());
      else void ask(line);
    } else if (event.key === 'ArrowUp') {
      if (historyIndex > 0) {
        historyIndex -= 1;
        input.value = history[historyIndex] || '';
        event.preventDefault();
      }
    } else if (event.key === 'ArrowDown') {
      if (historyIndex < history.length) {
        historyIndex += 1;
        input.value = history[historyIndex] || '';
      }
    }
  });
  setTimeout(() => input.focus(), 60);
  return page;
}
