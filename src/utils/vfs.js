/**
 * Virtual File System — Baluarte Mark XIII
 *
 * Sistema de arquivos em memória, persistido em localStorage.
 * Usado pelo Terminal Web (Fase 3) e poderá ser compartilhado com
 * outras ferramentas em fases futuras.
 *
 * Modelo:
 *   Cada nó é um objeto { type: 'dir'|'file', name, content?, children?, mtime, ... }
 *   Caminhos são absolutos ('/home/lucas/file.txt') ou relativos.
 */

import { storage } from '../core/storage.js';

const STORAGE_KEY = 'vfs:tree';

const SAMPLE_README = `# Baluarte Terminal

Bem-vindo ao terminal virtual do Mark XIII!

Este é um filesystem em memória persistido em localStorage.
Todos os comandos POSIX-like funcionam aqui:
ls, cd, cat, mkdir, rm, cp, mv, grep, find...

Digite 'help' para ver a lista completa.
Atalhos:
  Setas ↑/↓  histórico
  Tab        autocomplete
  Ctrl+L     limpar tela
  Ctrl+C     cancelar comando

Boa exploração, operador!
`;

const SAMPLE_NOTES = `Notas do operador
==================
- Verificar status dos sensores quânticos
- Atualizar dossier da equipe ALFA
- Calibrar antena Long Range Tower
`;

const SAMPLE_LOG = `[2026-05-08 03:14] Boot sequence iniciada
[2026-05-08 03:14] Núcleo Infinity Dreadnought online
[2026-05-08 03:14] 13 sistemas operacionais
[2026-05-08 03:15] Auth Shadow Bridge: STANDBY
[2026-05-08 03:15] J.A.R.V.I.S.: OFFLINE (Fase 20)
`;

/* ===== Estrutura inicial ===== */

function initialTree() {
  const now = Date.now();
  return {
    type: 'dir',
    name: '/',
    mtime: now,
    children: {
      home: dir('home', now, {
        lucas: dir('lucas', now, {
          'README.md': file('README.md', SAMPLE_README, now),
          'notas.txt': file('notas.txt', SAMPLE_NOTES, now),
          docs: dir('docs', now, {
            'baluarte.md': file('baluarte.md', '# Projeto Baluarte\n\nMark XIII em construção.\n', now)
          }),
          src: dir('src', now, {
            'main.js': file('main.js', "console.log('Hello from VFS');\n", now)
          })
        })
      }),
      etc: dir('etc', now, {
        hostname: file('hostname', 'baluarte-mark-xiii\n', now),
        motd: file('motd', '⬡ Baluarte Mark XIII · Welcome\n', now)
      }),
      tmp: dir('tmp', now, {}),
      var: dir('var', now, {
        log: dir('log', now, {
          'system.log': file('system.log', SAMPLE_LOG, now)
        })
      }),
      bin: dir('bin', now, {
        /* placeholder — comandos vivem em terminal-commands.js */
      })
    }
  };
}

function dir(name, mtime, children = {}) {
  return { type: 'dir', name, mtime, children };
}
function file(name, content, mtime) {
  return { type: 'file', name, content, mtime };
}

/* ===== Estado ===== */

let tree = null;

export function loadVfs() {
  if (tree) return tree;
  const saved = storage.get(STORAGE_KEY);
  tree = saved && saved.type === 'dir' ? saved : initialTree();
  return tree;
}

export function saveVfs() {
  if (tree) storage.set(STORAGE_KEY, tree);
}

export function resetVfs() {
  tree = initialTree();
  saveVfs();
  return tree;
}

/* ===== Path utilities ===== */

export function normalizePath(path, cwd = '/') {
  if (!path) path = cwd;
  if (path === '~') path = '/home/lucas';
  if (path.startsWith('~/')) path = '/home/lucas/' + path.slice(2);
  if (!path.startsWith('/')) {
    path = (cwd === '/' ? '' : cwd) + '/' + path;
  }
  const parts = path.split('/').filter(Boolean);
  const stack = [];
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') {
      stack.pop();
      continue;
    }
    stack.push(p);
  }
  return '/' + stack.join('/');
}

export function dirname(path) {
  const norm = normalizePath(path);
  if (norm === '/') return '/';
  const i = norm.lastIndexOf('/');
  return i <= 0 ? '/' : norm.slice(0, i);
}

export function basename(path) {
  const norm = normalizePath(path);
  if (norm === '/') return '/';
  return norm.slice(norm.lastIndexOf('/') + 1);
}

export function joinPath(a, b) {
  if (b.startsWith('/')) return normalizePath(b);
  return normalizePath(a + '/' + b);
}

/* ===== Lookup ===== */

/** Resolve um path para o nó. Retorna null se não existir. */
export function resolve(path, cwd = '/') {
  const norm = normalizePath(path, cwd);
  if (norm === '/') return loadVfs();
  const parts = norm.split('/').filter(Boolean);
  let node = loadVfs();
  for (const part of parts) {
    if (node.type !== 'dir') return null;
    const child = node.children[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

/** Resolve path e retorna { parent, name, node }. */
export function resolveSlot(path, cwd = '/') {
  const norm = normalizePath(path, cwd);
  if (norm === '/') return { parent: null, name: '/', node: loadVfs() };
  const parent = resolve(dirname(norm));
  const name = basename(norm);
  if (!parent || parent.type !== 'dir') return { parent: null, name, node: null };
  return { parent, name, node: parent.children[name] || null };
}

/* ===== Mutations ===== */

export function mkdir(path, cwd = '/', { recursive = false } = {}) {
  const norm = normalizePath(path, cwd);
  if (norm === '/') throw new Error('cannot create root');
  const parts = norm.split('/').filter(Boolean);

  let cursor = loadVfs();
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isLast = i === parts.length - 1;
    if (cursor.children[part]) {
      if (cursor.children[part].type !== 'dir') {
        throw new Error(`mkdir: not a directory: ${part}`);
      }
      if (isLast && !recursive) {
        throw new Error(`mkdir: cannot create '${part}': File exists`);
      }
    } else {
      if (!isLast && !recursive) {
        throw new Error(`mkdir: cannot create '${parts.slice(0, i + 1).join('/')}': No such file or directory`);
      }
      cursor.children[part] = dir(part, Date.now());
    }
    cursor = cursor.children[part];
  }
  saveVfs();
  return cursor;
}

export function writeFile(path, content, cwd = '/') {
  const norm = normalizePath(path, cwd);
  const parent = resolve(dirname(norm));
  if (!parent || parent.type !== 'dir') {
    throw new Error(`cannot write '${norm}': directory not found`);
  }
  const name = basename(norm);
  const existing = parent.children[name];
  if (existing && existing.type === 'dir') {
    throw new Error(`'${norm}' is a directory`);
  }
  parent.children[name] = file(name, content, Date.now());
  saveVfs();
  return parent.children[name];
}

export function appendFile(path, content, cwd = '/') {
  const node = resolve(path, cwd);
  if (node && node.type === 'file') {
    node.content = (node.content || '') + content;
    node.mtime = Date.now();
    saveVfs();
    return node;
  }
  return writeFile(path, content, cwd);
}

export function readFile(path, cwd = '/') {
  const node = resolve(path, cwd);
  if (!node) throw new Error(`no such file: ${path}`);
  if (node.type !== 'file') throw new Error(`'${path}' is a directory`);
  return node.content || '';
}

export function unlink(path, cwd = '/', { recursive = false, force = false } = {}) {
  const norm = normalizePath(path, cwd);
  if (norm === '/') throw new Error('cannot remove root');
  const slot = resolveSlot(norm);
  if (!slot.node) {
    if (force) return;
    throw new Error(`cannot remove '${norm}': No such file or directory`);
  }
  if (slot.node.type === 'dir') {
    const hasChildren = Object.keys(slot.node.children).length > 0;
    if (hasChildren && !recursive) {
      throw new Error(`cannot remove '${norm}': Is a directory (use -r)`);
    }
  }
  delete slot.parent.children[slot.name];
  saveVfs();
}

export function rename(src, dest, cwd = '/') {
  const srcSlot = resolveSlot(src, cwd);
  if (!srcSlot.node) throw new Error(`'${src}' not found`);
  const destNorm = normalizePath(dest, cwd);
  let destParent;
  let destName;
  /* Se dest é diretório existente, mantém nome de origem dentro dele */
  const destNode = resolve(destNorm);
  if (destNode && destNode.type === 'dir') {
    destParent = destNode;
    destName = srcSlot.name;
  } else {
    destParent = resolve(dirname(destNorm));
    destName = basename(destNorm);
  }
  if (!destParent || destParent.type !== 'dir') {
    throw new Error(`destination not found: ${dest}`);
  }
  const node = srcSlot.node;
  delete srcSlot.parent.children[srcSlot.name];
  node.name = destName;
  destParent.children[destName] = node;
  saveVfs();
}

export function copy(src, dest, cwd = '/', { recursive = false } = {}) {
  const srcNode = resolve(src, cwd);
  if (!srcNode) throw new Error(`'${src}' not found`);
  if (srcNode.type === 'dir' && !recursive) {
    throw new Error(`'${src}' is a directory (use -r)`);
  }
  const cloned = JSON.parse(JSON.stringify(srcNode));

  const destNorm = normalizePath(dest, cwd);
  let destParent;
  let destName;
  const destNode = resolve(destNorm);
  if (destNode && destNode.type === 'dir') {
    destParent = destNode;
    destName = basename(normalizePath(src, cwd));
  } else {
    destParent = resolve(dirname(destNorm));
    destName = basename(destNorm);
  }
  if (!destParent || destParent.type !== 'dir') {
    throw new Error(`destination not found: ${dest}`);
  }
  cloned.name = destName;
  cloned.mtime = Date.now();
  destParent.children[destName] = cloned;
  saveVfs();
}

/* ===== Listing helpers ===== */

export function listDir(path, cwd = '/') {
  const node = resolve(path, cwd);
  if (!node) throw new Error(`no such directory: ${path}`);
  if (node.type !== 'dir') throw new Error(`'${path}' is not a directory`);
  return Object.values(node.children).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function nodeSize(node) {
  if (node.type === 'file') return (node.content || '').length;
  return Object.values(node.children).reduce((s, c) => s + nodeSize(c), 0);
}

export function isDir(path, cwd = '/') {
  const node = resolve(path, cwd);
  return node ? node.type === 'dir' : false;
}

export function exists(path, cwd = '/') {
  return !!resolve(path, cwd);
}
