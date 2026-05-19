/**
 * Engine do Terminal — parsing de linha, pipes, redirects, history.
 *
 * Suporta:
 *   - comando arg1 arg2 ...
 *   - cmd1 | cmd2 | cmd3                 (pipes)
 *   - cmd > file        (redirect saída, sobrescreve)
 *   - cmd >> file       (redirect saída, append)
 *   - cmd1 && cmd2      (executa cmd2 só se cmd1 sucesso)
 *   - $VAR ou ${VAR}    (expansão de variáveis)
 *   - aliases
 *   - history navegável
 */

import { COMMANDS } from '../data/terminal-commands.js';
import * as vfs from './vfs.js';

const HISTORY_KEY = 'terminal:history';
const HISTORY_MAX = 200;

/* ===== Parser ===== */

/** Tokeniza uma linha respeitando aspas simples, duplas e escape. */
function tokenize(line) {
  const tokens = [];
  let cur = '';
  let quote = null;
  let escape = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (escape) { cur += c; escape = false; continue; }
    if (c === '\\' && quote !== "'") { escape = true; continue; }
    if (quote) {
      if (c === quote) { quote = null; continue; }
      cur += c;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (/\s/.test(c)) {
      if (cur) { tokens.push(cur); cur = ''; }
      continue;
    }
    cur += c;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

/** Expande $VAR e ${VAR}. */
function expandVars(token, env) {
  return token.replace(/\$\{(\w+)\}|\$(\w+)/g, (_, a, b) => {
    const k = a || b;
    return env[k] != null ? env[k] : '';
  });
}

/* ===== Execução ===== */

/**
 * Executa uma linha completa.
 * @returns {Promise<{ stdout: string, stderr: string, exit: number }>}
 */
export async function execute(line, ctx) {
  const trimmed = line.trim();
  if (!trimmed) return { stdout: '', stderr: '', exit: 0 };

  /* Comentário */
  if (trimmed.startsWith('#')) return { stdout: '', stderr: '', exit: 0 };

  /* Adiciona ao history */
  pushHistory(ctx, trimmed);

  /* Suporte a múltiplos comandos por ; — cada saída fica numa linha. */
  const parts = trimmed.split(/;(?=(?:[^"']|"[^"]*"|'[^']*')*$)/);
  const outs = [];
  const final = { stdout: '', stderr: '', exit: 0 };
  for (const part of parts) {
    const r = await runOne(part.trim(), ctx);
    if (r.stdout) outs.push(r.stdout);
    final.stderr += r.stderr;
    final.exit = r.exit;
  }
  final.stdout = outs.join('\n');
  return final;
}

async function runOne(line, ctx) {
  if (!line) return { stdout: '', stderr: '', exit: 0 };

  let tokens;
  try { tokens = tokenize(line); } catch (e) {
    return { stdout: '', stderr: 'parse error: ' + e.message, exit: 2 };
  }

  /* Expansão de aliases (apenas comando inicial) */
  if (ctx.aliases[tokens[0]]) {
    const aliasTokens = tokenize(ctx.aliases[tokens[0]]);
    tokens = [...aliasTokens, ...tokens.slice(1)];
  }

  /* Expansão de variáveis */
  tokens = tokens.map((t) => expandVars(t, ctx.env));

  /* && chains: dividir antes em sub-linhas */
  const subLines = splitOnAnd(tokens);
  let out = { stdout: '', stderr: '', exit: 0 };
  for (const sub of subLines) {
    const r = await runPipeline(sub, ctx);
    out.stdout += r.stdout;
    out.stderr += r.stderr;
    out.exit = r.exit;
    if (r.exit !== 0) break;
  }
  return out;
}

function splitOnAnd(tokens) {
  const groups = [[]];
  for (const t of tokens) {
    if (t === '&&') groups.push([]);
    else groups[groups.length - 1].push(t);
  }
  return groups;
}

async function runPipeline(tokens, ctx) {
  /* Quebra por pipes e redirects */
  const stages = [];
  let cur = [];
  let outputs = [null];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === '|') {
      stages.push(cur); cur = []; outputs.push(null);
    } else if (t === '>' || t === '>>') {
      const file = tokens[++i];
      if (!file) return { stdout: '', stderr: `${t}: missing file operand`, exit: 2 };
      outputs[outputs.length - 1] = { type: t, file };
    } else {
      cur.push(t);
    }
  }
  if (cur.length) stages.push(cur);

  let stdin = '';
  let stderr = '';
  let exit = 0;

  for (let i = 0; i < stages.length; i++) {
    const stageTokens = stages[i];
    if (!stageTokens.length) continue;
    const [name, ...args] = stageTokens;
    const cmd = COMMANDS[name];
    if (!cmd) {
      stderr += `${name}: command not found\n`;
      exit = 127;
      break;
    }

    /* Executa */
    let result;
    try {
      const ret = cmd.run(args, { ...ctx, stdin });
      result = ret instanceof Promise ? await ret : ret;
    } catch (e) {
      stderr += `${name}: ${e.message}\n`;
      exit = 1;
      break;
    }

    let stageStdout = '';
    let stageStderr = '';
    let stageExit = 0;
    if (typeof result === 'string') stageStdout = result;
    else if (result && typeof result === 'object') {
      stageStdout = result.stdout || '';
      stageStderr = result.stderr || '';
      stageExit = result.exit || 0;
    }
    stderr += stageStderr;
    exit = stageExit;

    /* Redirect de saída para arquivo */
    const redir = outputs[i];
    if (redir) {
      try {
        if (redir.type === '>') vfs.writeFile(redir.file, stageStdout, ctx.cwd);
        else vfs.appendFile(redir.file, stageStdout, ctx.cwd);
      } catch (e) {
        stderr += `${redir.type}: ${e.message}\n`;
        exit = 1;
      }
      stageStdout = '';
    }

    stdin = stageStdout;
    if (exit !== 0 && stageStderr) break;
  }

  return { stdout: stdin, stderr, exit };
}

/* ===== History ===== */

export function loadHistory() {
  const list = JSON.parse(localStorage.getItem('baluarte:' + HISTORY_KEY) || '[]');
  return Array.isArray(list) ? list : [];
}

export function saveHistory(history) {
  try {
    localStorage.setItem('baluarte:' + HISTORY_KEY, JSON.stringify(history.slice(-HISTORY_MAX)));
  } catch {}
}

export function pushHistory(ctx, line) {
  if (!line) return;
  const last = ctx.history[ctx.history.length - 1];
  if (line === last) return;
  ctx.history.push(line);
  if (ctx.history.length > HISTORY_MAX) ctx.history.shift();
  saveHistory(ctx.history);
}

/* ===== Autocomplete ===== */

export function autocomplete(prefix, ctx) {
  const tokens = tokenize(prefix);
  const isFirst = tokens.length === 0 || (tokens.length === 1 && !prefix.endsWith(' '));
  const last = tokens[tokens.length - 1] || '';

  if (isFirst) {
    const all = [...Object.keys(COMMANDS), ...Object.keys(ctx.aliases)];
    return all.filter((c) => c.startsWith(last)).sort();
  }

  /* Autocompleta paths */
  let dirPart = '.';
  let basePart = last;
  if (last.includes('/')) {
    dirPart = last.slice(0, last.lastIndexOf('/')) || '/';
    basePart = last.slice(last.lastIndexOf('/') + 1);
  }
  try {
    const node = vfs.resolve(dirPart, ctx.cwd);
    if (!node || node.type !== 'dir') return [];
    const matches = Object.values(node.children)
      .filter((c) => c.name.startsWith(basePart))
      .map((c) => {
        const prefix = dirPart === '.' ? '' : (dirPart === '/' ? '/' : dirPart + '/');
        return prefix + c.name + (c.type === 'dir' ? '/' : '');
      });
    return matches.sort();
  } catch {
    return [];
  }
}

/* ===== Default ctx factory ===== */

export function createContext(terminal) {
  const ctx = {
    terminal,
    cwd: '/home/lucas',
    env: {
      USER: 'lucas',
      HOSTNAME: 'baluarte',
      HOME: '/home/lucas',
      PATH: '/bin:/usr/bin',
      SHELL: '/bin/balsh',
      LANG: 'pt_BR.UTF-8',
      TERM: 'baluarte-color'
    },
    aliases: {
      /* atalhos POSIX usuais */
      ll: 'ls -la', la: 'ls -a',
      /* estilo PowerShell — cmdlets mapeados para os comandos POSIX */
      dir: 'ls', gci: 'ls', gc: 'cat', sl: 'cd', gl: 'pwd', chdir: 'cd',
      copy: 'cp', move: 'mv', del: 'rm', erase: 'rm', ren: 'mv',
      sls: 'grep', gps: 'ps', write: 'echo'
    },
    history: loadHistory(),
    bootedAt: Date.now()
  };
  /* setCwd fecha sobre o ctx real — os comandos recebem uma cópia rasa
     ({ ...ctx, stdin }), então um `this.cwd = p` se perderia. A arrow
     function garante que a mudança de diretório (cd) atinja o ctx real. */
  ctx.setCwd = (p) => { ctx.cwd = p; };
  return ctx;
}
