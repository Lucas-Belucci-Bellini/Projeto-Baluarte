// Motor real do GitNexus (M3a detecção · M3b grafo · M3c spawn por padrão).
//
// O motor é o servidor HTTP do pacote `gitnexus` (rotas /api/*) na porta 4747:
//   GET /api/health → { status: 'ok' }
//   GET /api/info   → { version, launchContext, nodeVersion }
//   GET /api/repos  → [{ name, path, … }]
//   GET /api/graph  → o grafo real { nodes, relationships }
//
// M3c: o launcher sobe o motor SOZINHO. Em vez de exigir `BALUARTE_NEXUS_CMD`,
// resolvemos um comando em camadas (override → cópia vendorizada → bin global →
// npx) e fazemos polling de readiness no /api/health. Se já houver um motor no
// ar (o operador rodou `gitnexus serve` na mão), a gente só conecta — não duplica.
//
// Desligar o autostart: env `BALUARTE_NEXUS_DISABLE=1` (a UI ainda detecta um
// motor externo, só não tenta subir um).
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const HOST = '127.0.0.1';
const PORT = 4747;
const BASE = `http://${HOST}:${PORT}`;
const WIN = process.platform === 'win32';

let child = null; // processo do motor que NÓS subimos (null se externo/ausente)
let activeVia = null; // rótulo da estratégia que funcionou ('global' | 'npx' | …)
let starting = false; // trava de reentrância pra não spawnar em paralelo

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => {
  // eslint-disable-next-line no-console
  console.log('[nexus]', ...a);
};

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

/** True se há um motor respondendo /api/health agora. */
async function isAvailable(timeoutMs = 1200) {
  const h = await getJSON('/api/health', timeoutMs);
  return !!(h && h.status === 'ok');
}

/** Estado do motor: { available, url, version?, nodeVersion?, spawned, via? }. */
async function status() {
  const health = await getJSON('/api/health');
  if (!health || health.status !== 'ok') return { available: false, url: BASE };
  const info = await getJSON('/api/info');
  return {
    available: true,
    url: BASE,
    version: info && info.version,
    nodeVersion: info && info.nodeVersion,
    spawned: !!child,
    via: activeVia || (child ? 'spawn' : 'externo')
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
 * Procura uma cópia vendorizada do motor no repo (ex.: `GitNexus-1.6.7/…`) e
 * devolve o caminho do entrypoint Node (o `bin` do pacote), ou null.
 * Rodamos com a própria binário do Electron em modo Node (ELECTRON_RUN_AS_NODE),
 * então não exige Node de sistema.
 */
function vendoredEntry() {
  // Raízes prováveis: ao lado do app empacotado e na raiz do repo (dev).
  const roots = [
    process.env.BALUARTE_GITNEXUS_DIR,
    path.join(__dirname, '..', '..'), // repo root em dev (desktop/src → repo)
    process.resourcesPath ? path.join(process.resourcesPath, 'engine') : null,
    process.cwd()
  ].filter(Boolean);
  // Subpastas onde a cópia costuma estar (a vendorizada é aninhada e tem o
  // pacote em `…/gitnexus`). Só serve se o `dist/` estiver compilado — a cópia
  // do repo tem só `src/` (TS), então isto é um best-effort pós-build.
  const subdirs = [
    '.',
    '.baluarte/tools/gitnexus/gitnexus',
    '.baluarte/tools/gitnexus',
    'GitNexus-1.6.7/GitNexus-1.6.7/gitnexus',
    'GitNexus-1.6.7/gitnexus',
    'GitNexus-1.6.7/GitNexus-1.6.7',
    'GitNexus-1.6.7',
    'gitnexus',
    'engine'
  ];
  // Caminho do bin/entry (campo `bin` do package.json do gitnexus).
  const entries = ['dist/cli/index.js', 'dist/cli.js', 'dist/index.js'];
  for (const root of roots) {
    for (const sub of subdirs) {
      for (const e of entries) {
        const p = path.join(root, sub, e);
        try {
          if (fs.existsSync(p)) return p;
        } catch {
          /* ignore */
        }
      }
    }
  }
  return null;
}

/**
 * Estratégias de comando pra subir `gitnexus serve --port 4747`, em ordem de
 * preferência. Cada uma é `{ cmd, args, env?, via }` — args fixos, sem shell.
 */
function candidates() {
  const args = ['serve', '--port', String(PORT)];
  const list = [];

  // 1) override explícito do operador (caminho do executável gitnexus).
  const explicit = process.env.BALUARTE_NEXUS_CMD;
  if (explicit) list.push({ cmd: explicit, args, via: 'env' });

  // 2) cópia vendorizada rodada com o Electron em modo Node (zero-setup).
  const entry = vendoredEntry();
  if (entry) {
    list.push({
      cmd: process.execPath,
      args: [entry, ...args],
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
      via: 'vendored'
    });
  }

  // 3) binário global no PATH (`npm i -g gitnexus`).
  list.push({ cmd: WIN ? 'gitnexus.cmd' : 'gitnexus', args, via: 'global' });

  // 4) npx (cold-start mais lento, mas não exige install prévio).
  list.push({
    cmd: WIN ? 'npx.cmd' : 'npx',
    args: ['-y', 'gitnexus@latest', ...args],
    env: { ...process.env, GITNEXUS_SKIP_OPTIONAL_GRAMMARS: '1' },
    via: 'npx'
  });

  return list;
}

/** Aguarda o /api/health responder ok, até `timeoutMs`. */
async function waitForHealth(timeoutMs, intervalMs = 600) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await isAvailable()) return true;
    await delay(intervalMs);
  }
  return false;
}

/** Sobe um candidato e espera ficar saudável. Resolve true/false. */
function trySpawn(c, readyMs) {
  return new Promise((resolve) => {
    let proc;
    try {
      proc = spawn(c.cmd, c.args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: c.env || process.env,
        windowsHide: true
      });
    } catch (err) {
      log(`falha ao spawnar (${c.via}):`, String((err && err.message) || err));
      return resolve(false);
    }

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };

    // ENOENT (comando inexistente) e saída precoce → tenta o próximo.
    proc.on('error', (err) => {
      log(`erro do motor (${c.via}):`, String((err && err.message) || err));
      finish(false);
    });
    proc.on('exit', (code) => {
      if (!settled) log(`motor (${c.via}) saiu cedo (code ${code})`);
      finish(false);
    });
    // stderr do motor ajuda o debug local do M3c.
    if (proc.stderr) {
      proc.stderr.on('data', (b) => {
        const s = String(b).trim();
        if (s) log(`(${c.via}) ${s.slice(0, 240)}`);
      });
    }

    waitForHealth(readyMs).then((ok) => {
      if (ok && !settled) {
        child = proc;
        activeVia = c.via;
        proc.removeAllListeners('exit');
        proc.on('exit', () => {
          child = null;
          activeVia = null;
        });
        log(`motor no ar via "${c.via}" (${BASE})`);
        finish(true);
      } else {
        try {
          proc.kill();
        } catch {
          /* ignore */
        }
        finish(false);
      }
    });
  });
}

/**
 * M3c — sobe o motor por padrão. Se já houver um respondendo, só conecta.
 * Tenta cada estratégia (override → vendored → global → npx) até uma ficar
 * saudável. Best-effort: nunca lança; só loga. Async, mas pode ser chamada
 * fire-and-forget pelo main.
 */
async function maybeStart() {
  if (child || starting) return;
  if (process.env.BALUARTE_NEXUS_DISABLE) {
    log('autostart desligado (BALUARTE_NEXUS_DISABLE).');
    return;
  }
  starting = true;
  try {
    if (await isAvailable()) {
      log('motor externo já no ar — conectando (sem subir um novo).');
      activeVia = 'externo';
      return;
    }
    const list = candidates();
    for (const c of list) {
      // npx baixa na 1ª vez → janela de readiness maior; resto é rápido.
      const readyMs = c.via === 'npx' ? 90000 : 20000;
      log(`tentando subir o motor via "${c.via}"…`);
      // eslint-disable-next-line no-await-in-loop
      if (await trySpawn(c, readyMs)) return;
    }
    log('não consegui subir o motor (sem gitnexus instalado/alcançável). UI cai no codemap.');
  } catch (err) {
    log('maybeStart falhou:', String((err && err.message) || err));
  } finally {
    starting = false;
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
    activeVia = null;
  }
}

module.exports = { status, graph, maybeStart, stop, isAvailable, getJSON, BASE, PORT };
