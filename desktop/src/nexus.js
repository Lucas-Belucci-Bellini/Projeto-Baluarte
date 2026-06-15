// Motor real do GitNexus (M3a — encaixe + detecção).
//
// O motor é o servidor Express do pacote `gitnexus` (rotas /api/*) na porta 4747:
//   GET /api/health → { status: 'ok' }
//   GET /api/info   → { version, launchContext, nodeVersion }
//   GET /api/graph  → o grafo real (consumido numa fatia futura)
//
// Esta fatia só DETECTA se o motor está no ar e pega a versão. O spawn por
// padrão + o empacotamento dos nativos (tree-sitter ×11, onnxruntime-node,
// @ladybugdb/core) e o `electron-rebuild` vêm na fatia nativa (M3b). Por ora o
// spawn é opt-in via env `BALUARTE_NEXUS_CMD` (caminho do executável gitnexus).
const { spawn } = require('node:child_process');

const HOST = '127.0.0.1';
const PORT = 4747;
const BASE = `http://${HOST}:${PORT}`;

let child = null;

/** GET com timeout curto; devolve o JSON ou null se falhar/expirar. */
async function getJSON(pathname, timeoutMs = 1500) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(BASE + pathname, { signal: ctrl.signal });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Estado do motor: { available, url, version?, nodeVersion?, spawned }. */
async function status() {
  const health = await getJSON('/api/health');
  if (!health || health.status !== 'ok') return { available: false, url: BASE };
  const info = await getJSON('/api/info');
  return {
    available: true,
    url: BASE,
    version: info && info.version,
    nodeVersion: info && info.nodeVersion,
    spawned: !!child
  };
}

/**
 * Grafo REAL do motor: pega o 1º repo analisado (`/api/repos`) e busca o grafo
 * (`/api/graph?repo=…`). Devolve `{ repo, nodes, relationships }` no formato do
 * GitNexus (GraphNode/GraphRelationship). Vazio se não houver repo analisado.
 */
async function graph() {
  const list = await getJSON('/api/repos');
  const repo = Array.isArray(list) && list[0] ? list[0].name || list[0].path : null;
  const q = repo ? '?repo=' + encodeURIComponent(repo) : '';
  const g = await getJSON('/api/graph' + q, 8000);
  if (!g || !Array.isArray(g.nodes)) return { repo, nodes: [], relationships: [] };
  return { repo, nodes: g.nodes, relationships: g.relationships || [] };
}

/**
 * Best-effort: sobe o motor SÓ se `BALUARTE_NEXUS_CMD` apontar pra ele (caminho
 * do executável). Sem shell e com args fixos — nada de string de comando.
 * Empacotar o motor e subir por padrão = fatia nativa (M3b).
 */
function maybeStart() {
  const cmd = process.env.BALUARTE_NEXUS_CMD;
  if (!cmd || child) return;
  try {
    child = spawn(cmd, ['serve', '--port', String(PORT)], { stdio: 'ignore' });
    child.on('exit', () => {
      child = null;
    });
    child.on('error', () => {
      child = null;
    });
  } catch {
    child = null;
  }
}

function stop() {
  if (child) {
    try {
      child.kill();
    } catch {
      /* ignore */
    }
    child = null;
  }
}

module.exports = { status, graph, maybeStart, stop, BASE };
