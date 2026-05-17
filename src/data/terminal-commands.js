/**
 * Catálogo de comandos do Terminal Web (Fase 3).
 *
 * Cada comando é uma função (args, ctx) → string | { stdout, stderr, exit }
 * - args: array de argumentos (sem o nome do comando)
 * - ctx: { vfs, env, history, cwd, setCwd, terminal, stdin, signal }
 *
 * Comandos retornando string são tratados como stdout simples.
 * Comandos retornando objeto podem retornar stderr, exit code, etc.
 */

import * as vfs from '../utils/vfs.js';
import { VERSION } from './version.js';

/* ===== Helpers internos ===== */

function pad(s, n) {
  s = String(s);
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

function fmtDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function asStdin(stdin) {
  return typeof stdin === 'string' ? stdin : '';
}

function err(msg, exit = 1) {
  return { stdout: '', stderr: msg, exit };
}

/* ===== Catálogo ===== */

export const COMMANDS = {

  /* ============ Help / Sistema ============ */

  help: {
    desc: 'lista comandos disponíveis',
    run: () => {
      const list = Object.keys(COMMANDS).sort();
      const cols = 4;
      const colWidth = Math.max(...list.map((c) => c.length)) + 2;
      let out = 'Comandos disponíveis (' + list.length + '):\n\n';
      for (let i = 0; i < list.length; i += cols) {
        out += list.slice(i, i + cols).map((c) => pad(c, colWidth)).join('') + '\n';
      }
      out += "\nDigite 'man <cmd>' para descrição. 'help' para esta lista.";
      return out;
    }
  },

  man: {
    desc: 'mostra descrição de um comando',
    run: (args) => {
      if (!args.length) return err('man: which manual page do you want?');
      const name = args[0];
      const cmd = COMMANDS[name];
      if (!cmd) return err(`No manual entry for ${name}`);
      let out = `NAME\n    ${name} — ${cmd.desc}\n`;
      if (cmd.usage) out += `\nUSAGE\n    ${cmd.usage}\n`;
      if (cmd.detail) out += `\nDESCRIPTION\n    ${cmd.detail}\n`;
      return out;
    }
  },

  clear: {
    desc: 'limpa a tela',
    run: (_a, ctx) => { ctx.terminal.clear(); return ''; }
  },
  cls: { desc: 'alias de clear', run: (a, ctx) => COMMANDS.clear.run(a, ctx) },

  exit: {
    desc: 'fecha a sessão (recarrega página)',
    run: (_a, ctx) => { ctx.terminal.println('logout'); setTimeout(() => location.reload(), 300); return ''; }
  },

  history: {
    desc: 'mostra histórico de comandos',
    run: (_a, ctx) => ctx.history.map((h, i) => `${pad(String(i + 1), 4)}  ${h}`).join('\n')
  },

  alias: {
    desc: 'cria/lista aliases',
    run: (args, ctx) => {
      if (!args.length) {
        return Object.entries(ctx.aliases).map(([k, v]) => `alias ${k}='${v}'`).join('\n') || '(nenhum alias)';
      }
      const joined = args.join(' ');
      const m = joined.match(/^([\w-]+)=(.+)$/);
      if (!m) return err("alias: usage: alias name=value");
      ctx.aliases[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
      return '';
    }
  },

  unalias: {
    desc: 'remove alias',
    run: (args, ctx) => {
      if (!args.length) return err('unalias: usage: unalias name');
      delete ctx.aliases[args[0]];
      return '';
    }
  },

  env: {
    desc: 'exibe variáveis de ambiente',
    run: (_a, ctx) => Object.entries(ctx.env).map(([k, v]) => `${k}=${v}`).join('\n')
  },
  printenv: { desc: 'alias de env', run: (a, ctx) => COMMANDS.env.run(a, ctx) },

  export: {
    desc: 'define variável de ambiente',
    run: (args, ctx) => {
      for (const a of args) {
        const m = a.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/i);
        if (m) ctx.env[m[1]] = m[2];
        else if (ctx.env[a] === undefined) ctx.env[a] = '';
      }
      return '';
    }
  },

  unset: {
    desc: 'remove variável',
    run: (args, ctx) => { args.forEach((a) => delete ctx.env[a]); return ''; }
  },

  whoami: { desc: 'exibe usuário atual', run: (_a, ctx) => ctx.env.USER || 'lucas' },

  hostname: { desc: 'exibe hostname', run: (_a, ctx) => ctx.env.HOSTNAME || 'baluarte' },

  uname: {
    desc: 'informações do sistema',
    run: (args) => {
      const all = args.includes('-a');
      if (all) return 'Baluarte 13.0.0 #1 SMP Mark XIII WebOS x86_64 GNU/Linux';
      return 'Baluarte';
    }
  },

  date: {
    desc: 'data e hora atual',
    run: () => new Date().toString()
  },

  uptime: {
    desc: 'tempo desde boot',
    run: (_a, ctx) => {
      const ms = Date.now() - (ctx.bootedAt || Date.now());
      const s = Math.floor(ms / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `up ${h}h ${m}m ${sec}s`;
    }
  },

  which: {
    desc: 'localiza comando',
    run: (args) => {
      if (!args.length) return err('which: missing argument');
      const cmd = args[0];
      if (COMMANDS[cmd]) return `/bin/${cmd}`;
      return err(`${cmd}: not found`);
    }
  },

  type: {
    desc: 'tipo de comando',
    run: (args, ctx) => {
      if (!args.length) return err('type: missing argument');
      const cmd = args[0];
      if (ctx.aliases[cmd]) return `${cmd} is aliased to '${ctx.aliases[cmd]}'`;
      if (COMMANDS[cmd]) return `${cmd} is a builtin`;
      return err(`${cmd}: not found`);
    }
  },

  /* ============ Filesystem ============ */

  pwd: { desc: 'diretório atual', run: (_a, ctx) => ctx.cwd },

  cd: {
    desc: 'muda diretório',
    run: (args, ctx) => {
      const target = args[0] || '~';
      const norm = vfs.normalizePath(target, ctx.cwd);
      if (!vfs.exists(norm)) return err(`cd: no such directory: ${target}`);
      if (!vfs.isDir(norm)) return err(`cd: not a directory: ${target}`);
      ctx.setCwd(norm);
      return '';
    }
  },

  ls: {
    desc: 'lista arquivos',
    run: (args, ctx) => {
      const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
      const longFmt = args.includes('-l') || args.includes('-la') || args.includes('-al');
      const paths = args.filter((a) => !a.startsWith('-'));
      const targets = paths.length ? paths : [ctx.cwd];
      const blocks = [];
      for (const p of targets) {
        let node;
        try { node = vfs.resolve(p, ctx.cwd); } catch { node = null; }
        if (!node) { blocks.push(`ls: cannot access '${p}': No such file or directory`); continue; }

        let items = node.type === 'dir' ? Object.values(node.children) : [node];
        if (!showAll) items = items.filter((i) => !i.name.startsWith('.'));
        items.sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        if (longFmt) {
          const lines = items.map((it) => {
            const t = it.type === 'dir' ? 'd' : '-';
            const size = vfs.nodeSize(it);
            return `${t}rwxr-xr-x  1 lucas lucas  ${pad(String(size), 6)} ${fmtDate(it.mtime)}  ${it.name}${it.type === 'dir' ? '/' : ''}`;
          });
          blocks.push(`total ${items.length}\n${lines.join('\n')}`);
        } else {
          blocks.push(items.map((i) => i.type === 'dir' ? `\x1b[36m${i.name}/\x1b[0m` : i.name).join('  '));
        }
      }
      return blocks.join('\n\n');
    }
  },

  ll: {
    desc: 'alias de ls -la',
    run: (args, ctx) => COMMANDS.ls.run(['-la', ...args], ctx)
  },

  tree: {
    desc: 'árvore de diretórios',
    run: (args, ctx) => {
      const path = args.find((a) => !a.startsWith('-')) || ctx.cwd;
      const node = vfs.resolve(path, ctx.cwd);
      if (!node) return err(`tree: '${path}': No such file or directory`);
      const lines = [];
      let count = { dirs: 0, files: 0 };
      function walk(n, prefix) {
        if (n.type !== 'dir') return;
        const entries = Object.values(n.children).sort((a, b) => {
          if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
        entries.forEach((e, i) => {
          const isLast = i === entries.length - 1;
          const branch = isLast ? '└── ' : '├── ';
          const ext = isLast ? '    ' : '│   ';
          lines.push(prefix + branch + e.name + (e.type === 'dir' ? '/' : ''));
          if (e.type === 'dir') { count.dirs++; walk(e, prefix + ext); }
          else count.files++;
        });
      }
      lines.push(path);
      walk(node, '');
      lines.push('');
      lines.push(`${count.dirs} directories, ${count.files} files`);
      return lines.join('\n');
    }
  },

  mkdir: {
    desc: 'cria diretório',
    run: (args, ctx) => {
      const recursive = args.includes('-p');
      const paths = args.filter((a) => !a.startsWith('-'));
      if (!paths.length) return err('mkdir: missing operand');
      try { paths.forEach((p) => vfs.mkdir(p, ctx.cwd, { recursive })); return ''; }
      catch (e) { return err(`mkdir: ${e.message}`); }
    }
  },

  rmdir: {
    desc: 'remove diretório vazio',
    run: (args, ctx) => {
      if (!args.length) return err('rmdir: missing operand');
      try { args.forEach((p) => vfs.unlink(p, ctx.cwd)); return ''; }
      catch (e) { return err(`rmdir: ${e.message}`); }
    }
  },

  rm: {
    desc: 'remove arquivos/diretórios',
    run: (args, ctx) => {
      const recursive = args.some((a) => /^-r|^-rf|^-fr/.test(a));
      const force = args.some((a) => /^-f|^-rf|^-fr/.test(a));
      const paths = args.filter((a) => !a.startsWith('-'));
      if (!paths.length) return err('rm: missing operand');
      try { paths.forEach((p) => vfs.unlink(p, ctx.cwd, { recursive, force })); return ''; }
      catch (e) { return err(`rm: ${e.message}`); }
    }
  },

  touch: {
    desc: 'cria arquivo vazio ou atualiza mtime',
    run: (args, ctx) => {
      if (!args.length) return err('touch: missing operand');
      try {
        for (const p of args) {
          if (vfs.exists(p, ctx.cwd)) {
            const node = vfs.resolve(p, ctx.cwd);
            node.mtime = Date.now();
            vfs.saveVfs();
          } else {
            vfs.writeFile(p, '', ctx.cwd);
          }
        }
        return '';
      } catch (e) { return err(`touch: ${e.message}`); }
    }
  },

  cat: {
    desc: 'concatena arquivos',
    run: (args, ctx) => {
      if (!args.length) return asStdin(ctx.stdin);
      try {
        return args.map((p) => vfs.readFile(p, ctx.cwd)).join('');
      } catch (e) { return err(`cat: ${e.message}`); }
    }
  },

  echo: {
    desc: 'imprime texto',
    run: (args) => {
      const noNl = args[0] === '-n';
      if (noNl) args = args.slice(1);
      return args.join(' ') + (noNl ? '' : '');
    }
  },

  printf: {
    desc: 'imprime formatado',
    run: (args) => {
      if (!args.length) return '';
      const [fmt, ...rest] = args;
      let i = 0;
      return fmt.replace(/%[sd]/g, () => rest[i++] ?? '').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    }
  },

  head: {
    desc: 'primeiras N linhas',
    run: (args, ctx) => {
      let n = 10;
      const idxN = args.indexOf('-n');
      if (idxN >= 0) { n = parseInt(args[idxN + 1], 10) || 10; args = args.filter((_, i) => i !== idxN && i !== idxN + 1); }
      const text = args.length ? args.map((p) => {
        try { return vfs.readFile(p, ctx.cwd); } catch (e) { return ''; }
      }).join('') : asStdin(ctx.stdin);
      return text.split('\n').slice(0, n).join('\n');
    }
  },

  tail: {
    desc: 'últimas N linhas',
    run: (args, ctx) => {
      let n = 10;
      const idxN = args.indexOf('-n');
      if (idxN >= 0) { n = parseInt(args[idxN + 1], 10) || 10; args = args.filter((_, i) => i !== idxN && i !== idxN + 1); }
      const text = args.length ? args.map((p) => {
        try { return vfs.readFile(p, ctx.cwd); } catch { return ''; }
      }).join('') : asStdin(ctx.stdin);
      const lines = text.split('\n');
      return lines.slice(Math.max(0, lines.length - n)).join('\n');
    }
  },

  cp: {
    desc: 'copia arquivo/diretório',
    run: (args, ctx) => {
      const recursive = args.some((a) => a === '-r' || a === '-R');
      const paths = args.filter((a) => !a.startsWith('-'));
      if (paths.length < 2) return err('cp: missing destination');
      const dest = paths.pop();
      try { paths.forEach((src) => vfs.copy(src, dest, ctx.cwd, { recursive })); return ''; }
      catch (e) { return err(`cp: ${e.message}`); }
    }
  },

  mv: {
    desc: 'move/renomeia',
    run: (args, ctx) => {
      const paths = args.filter((a) => !a.startsWith('-'));
      if (paths.length < 2) return err('mv: missing destination');
      const dest = paths.pop();
      try { paths.forEach((src) => vfs.rename(src, dest, ctx.cwd)); return ''; }
      catch (e) { return err(`mv: ${e.message}`); }
    }
  },

  find: {
    desc: 'busca arquivos por nome',
    run: (args, ctx) => {
      const path = args.find((a) => !a.startsWith('-')) || '.';
      const nameIdx = args.indexOf('-name');
      const pattern = nameIdx >= 0 ? args[nameIdx + 1] : '';
      const root = vfs.resolve(path, ctx.cwd);
      if (!root) return err(`find: '${path}': No such file or directory`);
      const re = pattern
        ? new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*').replace(/\?/g, '.') + '$')
        : null;
      const found = [];
      function walk(node, p) {
        const fullPath = p;
        if (!re || re.test(node.name)) found.push(fullPath || '/');
        if (node.type === 'dir') {
          for (const child of Object.values(node.children)) {
            walk(child, (p === '/' ? '' : p) + '/' + child.name);
          }
        }
      }
      walk(root, vfs.normalizePath(path, ctx.cwd));
      return found.join('\n');
    }
  },

  du: {
    desc: 'tamanho de diretório',
    run: (args, ctx) => {
      const path = args.find((a) => !a.startsWith('-')) || ctx.cwd;
      const node = vfs.resolve(path, ctx.cwd);
      if (!node) return err(`du: '${path}': No such file or directory`);
      const size = vfs.nodeSize(node);
      return `${size}\t${path}`;
    }
  },

  stat: {
    desc: 'metadados de arquivo',
    run: (args, ctx) => {
      if (!args.length) return err('stat: missing operand');
      const node = vfs.resolve(args[0], ctx.cwd);
      if (!node) return err(`stat: '${args[0]}': No such file or directory`);
      return [
        `  File: ${args[0]}`,
        `  Size: ${vfs.nodeSize(node)}`,
        `  Type: ${node.type}`,
        `Modify: ${fmtDate(node.mtime)}`
      ].join('\n');
    }
  },

  file: {
    desc: 'detecta tipo de arquivo',
    run: (args, ctx) => {
      if (!args.length) return err('file: missing operand');
      const node = vfs.resolve(args[0], ctx.cwd);
      if (!node) return err(`file: cannot open '${args[0]}'`);
      if (node.type === 'dir') return `${args[0]}: directory`;
      const ext = args[0].split('.').pop();
      const types = { md: 'Markdown', js: 'JavaScript', json: 'JSON', txt: 'ASCII text', log: 'log file', html: 'HTML', css: 'CSS' };
      return `${args[0]}: ${types[ext] || 'ASCII text'}`;
    }
  },

  /* ============ Texto / pipeline ============ */

  grep: {
    desc: 'busca texto',
    run: (args, ctx) => {
      const ignoreCase = args.includes('-i');
      const invert = args.includes('-v');
      const lineNum = args.includes('-n');
      const cleaned = args.filter((a) => !a.startsWith('-'));
      const pattern = cleaned[0];
      if (!pattern) return err('grep: missing pattern');
      const text = cleaned.length > 1
        ? cleaned.slice(1).map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      const re = new RegExp(pattern, ignoreCase ? 'i' : '');
      const lines = text.split('\n');
      const out = [];
      lines.forEach((l, i) => {
        const match = re.test(l);
        if (match !== invert) out.push(lineNum ? `${i + 1}:${l}` : l);
      });
      return out.join('\n');
    }
  },

  wc: {
    desc: 'conta linhas/palavras/caracteres',
    run: (args, ctx) => {
      const onlyL = args.includes('-l');
      const onlyW = args.includes('-w');
      const onlyC = args.includes('-c');
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      const lines = text.split('\n').length;
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      const chars = text.length;
      if (onlyL) return String(lines);
      if (onlyW) return String(words);
      if (onlyC) return String(chars);
      return `${pad(String(lines), 6)} ${pad(String(words), 6)} ${pad(String(chars), 6)}`;
    }
  },

  sort: {
    desc: 'ordena linhas',
    run: (args, ctx) => {
      const reverse = args.includes('-r');
      const numeric = args.includes('-n');
      const unique = args.includes('-u');
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      let lines = text.split('\n');
      lines.sort((a, b) => numeric ? parseFloat(a) - parseFloat(b) : a.localeCompare(b));
      if (reverse) lines.reverse();
      if (unique) lines = [...new Set(lines)];
      return lines.join('\n');
    }
  },

  uniq: {
    desc: 'remove duplicatas adjacentes',
    run: (args, ctx) => {
      const count = args.includes('-c');
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      const lines = text.split('\n');
      const out = [];
      let prev = null;
      let counter = 0;
      for (const l of lines) {
        if (l === prev) counter++;
        else {
          if (prev !== null) out.push(count ? `${pad(String(counter), 4)} ${prev}` : prev);
          prev = l; counter = 1;
        }
      }
      if (prev !== null) out.push(count ? `${pad(String(counter), 4)} ${prev}` : prev);
      return out.join('\n');
    }
  },

  rev: {
    desc: 'reverte caracteres por linha',
    run: (args, ctx) => {
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      return text.split('\n').map((l) => [...l].reverse().join('')).join('\n');
    }
  },

  tac: {
    desc: 'inverte ordem das linhas',
    run: (args, ctx) => {
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      return text.split('\n').reverse().join('\n');
    }
  },

  cut: {
    desc: 'corta colunas',
    run: (args, ctx) => {
      let delim = '\t', fields = '';
      const paths = [];
      for (let i = 0; i < args.length; i++) {
        const a = args[i];
        if (a === '-d') delim = args[++i] || '\t';
        else if (a.startsWith('-d')) delim = a.slice(2);
        else if (a === '-f') fields = args[++i] || '1';
        else if (a.startsWith('-f')) fields = a.slice(2);
        else paths.push(a);
      }
      const indices = fields.split(',').flatMap((f) => {
        const m = f.match(/^(\d+)-(\d+)$/);
        if (m) { const [_, a, b] = m; const out = []; for (let i = +a; i <= +b; i++) out.push(i); return out; }
        return [parseInt(f, 10)];
      }).filter((n) => !isNaN(n)).map((n) => n - 1);
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('\n')
        : asStdin(ctx.stdin);
      return text.split('\n').map((line) => {
        const parts = line.split(delim);
        return indices.map((i) => parts[i] ?? '').join(delim);
      }).join('\n');
    }
  },

  tr: {
    desc: 'substitui caracteres',
    run: (args, ctx) => {
      if (args.length < 2) return err('tr: usage: tr FROM TO');
      const [from, to] = args;
      return asStdin(ctx.stdin).split('').map((c) => {
        const i = from.indexOf(c);
        return i >= 0 ? to[i] || to[to.length - 1] : c;
      }).join('');
    }
  },

  /* ============ Cripto / utilidades ============ */

  base64: {
    desc: 'codifica/decodifica Base64',
    run: (args, ctx) => {
      const decode = args.includes('-d');
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('')
        : asStdin(ctx.stdin);
      try {
        return decode ? atob(text.trim()) : btoa(text);
      } catch (e) { return err('base64: invalid input'); }
    }
  },

  md5sum: {
    desc: 'checksum MD5 (info)',
    run: () => err('md5sum: MD5 indisponível em Web Crypto. Use sha256sum.')
  },

  sha256sum: {
    desc: 'checksum SHA-256',
    run: async (args, ctx) => {
      const paths = args.filter((a) => !a.startsWith('-'));
      const text = paths.length
        ? paths.map((p) => { try { return vfs.readFile(p, ctx.cwd); } catch { return ''; } }).join('')
        : asStdin(ctx.stdin);
      const buf = new TextEncoder().encode(text);
      const hash = await crypto.subtle.digest('SHA-256', buf);
      const hex = Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
      return `${hex}  ${paths[0] || '-'}`;
    }
  },

  /* ============ Numéricos / programação ============ */

  seq: {
    desc: 'sequência de números',
    run: (args) => {
      let start = 1, step = 1, end = 1;
      if (args.length === 1) end = +args[0];
      else if (args.length === 2) { start = +args[0]; end = +args[1]; }
      else if (args.length === 3) { start = +args[0]; step = +args[1]; end = +args[2]; }
      const out = [];
      for (let i = start; step > 0 ? i <= end : i >= end; i += step) out.push(i);
      return out.join('\n');
    }
  },

  expr: {
    desc: 'avalia expressão aritmética',
    run: (args) => {
      try {
        const result = Function(`'use strict'; return (${args.join(' ')})`)();
        return String(result);
      } catch { return err('expr: invalid expression'); }
    }
  },

  bc: {
    desc: 'calculadora arbitrária',
    run: (args, ctx) => COMMANDS.expr.run(args.length ? args : asStdin(ctx.stdin).split(/\s+/), ctx)
  },

  true: { desc: 'sempre retorna 0', run: () => '' },
  false: { desc: 'sempre retorna 1', run: () => err('', 1) },

  yes: {
    desc: 'imprime mensagem repetida',
    run: (args) => {
      const msg = args.join(' ') || 'y';
      return Array.from({ length: 50 }, () => msg).join('\n');
    }
  },

  /* ============ Easter eggs / branding ============ */

  banner: {
    desc: 'exibe banner do Baluarte',
    run: () => `
   ______        __                  __
  / ___  /__ _  /  /  ___ _________ / /__ ____
 /  // / _ \\ \\/ / /  ' \\/ -_) __/ _ // / // / __/
/____/\\___/_/_/_/_/_/_/\\__/_/  \\__,_/_/\\_, /_/
                                       /___/

      ⬡  PROJETO BALUARTE — Mark XIII  ⬡
      Operador: Lucas Belucci Bellini
      Status: ONLINE  ·  Clearance: OMEGA
`
  },

  cowsay: {
    desc: 'vaca falante',
    run: (args) => {
      const msg = args.join(' ') || 'Mooo!';
      const top = ' ' + '_'.repeat(msg.length + 2);
      const mid = '< ' + msg + ' >';
      const bot = ' ' + '-'.repeat(msg.length + 2);
      return [
        top, mid, bot,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||'
      ].join('\n');
    }
  },

  fortune: {
    desc: 'frase aleatória',
    run: () => {
      const lines = [
        'A verdadeira coragem é seguir adiante mesmo quando o medo grita.',
        'O Baluarte não cede.',
        'Um operador resoluto vale por dez tropas hesitantes.',
        'O conhecimento é a primeira arma.',
        '"Não hesite. Construa."  — Lucas Belucci Bellini',
        'Halo > DOOM, mas DOOM tem o melhor metal.',
        'No silêncio do código, ouvimos as falhas.',
        'A noite mais escura precede o reboot.',
      ];
      return lines[Math.floor(Math.random() * lines.length)];
    }
  },

  /* ============ Sistema fake ============ */

  ps: {
    desc: 'processos (fake)',
    run: () => [
      '  PID  TTY  TIME     CMD',
      '    1  ?    00:00:00 init',
      '   42  ?    00:00:01 baluarte-core',
      '  108  pts  00:00:00 vite-dev',
      '  256  pts  00:00:00 jarvis (idle)',
      ' 4096  pts  00:00:00 ' + (typeof navigator !== 'undefined' ? 'browser' : 'shell')
    ].join('\n')
  },

  kill: {
    desc: 'envia sinal (fake)',
    run: (args) => err(`kill: cannot kill process ${args[0] || '?'}: simulação`, 1)
  },

  df: {
    desc: 'uso de disco (fake)',
    run: () => [
      'Filesystem       1K-blocks    Used Available Use% Mounted on',
      '/dev/baluarte0   104857600 1234567  98765432   2% /',
      'tmpfs                 8192      32      8160   1% /tmp'
    ].join('\n')
  },

  free: {
    desc: 'memória (fake)',
    run: () => [
      '              total        used        free      shared',
      'Mem:       16777216     6291456    10485760     1048576',
      'Swap:       8388608           0     8388608'
    ].join('\n')
  },

  ping: {
    desc: 'ping (fake)',
    run: (args) => {
      const host = args[0] || 'localhost';
      const t = (Math.random() * 5 + 0.5).toFixed(2);
      return [
        `PING ${host} (127.0.0.1): 56 data bytes`,
        `64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=${t} ms`,
        `64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=${t} ms`,
        `64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=${t} ms`,
        '',
        `--- ${host} ping statistics ---`,
        '3 packets transmitted, 3 packets received, 0.0% packet loss'
      ].join('\n');
    }
  },

  /* ============ Baluarte específicos ============ */

  open: {
    desc: 'abre rota do Baluarte',
    run: (args) => {
      const route = args[0] || '/home';
      location.hash = route.startsWith('#') ? route : '#' + route;
      return `Abrindo ${route}…`;
    }
  },

  status: {
    desc: 'status geral do sistema',
    run: () => [
      '⬡ BALUARTE — Status do Núcleo',
      '─────────────────────────────────',
      `  Mark XIII · v${VERSION}`,
      '  Frontend: ONLINE · JS puro + Vite',
      '  PWA: ATIVO (offline-first)',
      '  J.A.R.V.I.S.: ONLINE',
      '  Shadow Bridge: operacional',
      '  IA Proprietária Mark 11: ONLINE'
    ].join('\n')
  },

  reboot: {
    desc: 'reinicia (recarrega página)',
    run: () => { setTimeout(() => location.reload(), 800); return 'Reiniciando núcleo Mark XIII…'; }
  },

  vfs: {
    desc: 'utilitários do filesystem',
    run: (args) => {
      if (args[0] === 'reset') {
        if (!confirm('Resetar todo o filesystem virtual? Isso apaga arquivos criados.')) return 'cancelado';
        vfs.resetVfs();
        return 'VFS resetado para o estado inicial.';
      }
      if (args[0] === 'size') {
        const total = vfs.nodeSize(vfs.loadVfs());
        return `Tamanho total: ${total} bytes`;
      }
      return 'usage: vfs reset|size';
    }
  }
};

/* Lista pública (usada pelo autocomplete) */
export function commandNames() {
  return Object.keys(COMMANDS);
}
