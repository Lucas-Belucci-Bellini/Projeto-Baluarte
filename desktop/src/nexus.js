// Motor real do GitNexus (M3a detecção · M3b grafo · M3c spawn por padrão).
//
// O motor é o servidor HTTP do pacote `gitnexus` (rotas /api/*), na porta que o
// manifest declara (4747 hoje):
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
//
// O **contrato de processo** — porta, rota de health, args do `serve` e a janela
// de readiness — não mora mais aqui: é declarado no bloco `service` do
// `gitnexus` em `config/ai-tools.json`, e este arquivo só o lê. Se o manifest
// sumir ou vier ilegível (app empacotado sem o `config/`), caímos exatamente nos
// valores que estavam hardcoded antes — o comportamento não muda.
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const WIN = process.platform === 'win32';

let child = null; // processo do motor que NÓS subimos (null se externo/ausente)
let activeVia = null; // rótulo da estratégia que funcionou ('global' | 'npx' | …)
let starting = false; // trava de reentrância pra não spawnar em paralelo

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => {
  // eslint-disable-next-line no-console
  console.log('[nexus]', ...a);
};

// Fallback = exatamente o que estava hardcoded aqui antes da refatoração.
const SERVICO_PADRAO = {
  host: '127.0.0.1',
  porta: 4747,
  health: '/api/health',
  // O `--host` vai explícito de propósito: sem ele o gitnexus 1.6.9 escuta em
  // `::1` (loopback IPv6), embora o `--help` anuncie 127.0.0.1 como default. O
  // `fetch` daqui vai em IPv4 e nunca acharia o motor.
  serveArgs: ['serve', '--port', '4747', '--host', '127.0.0.1'],
  readyMs: 20000,
  dependeDe: []
};

// O npx baixa o pacote na 1ª vez, então a janela dele é maior. Isso é
// propriedade da *estratégia*, não do serviço — por isso fica no código, e não
// no contrato do manifest.
const READY_NPX_MS = 90000;

/** Acha o `config/ai-tools.json` (raiz do repo em dev; resources no empacotado). */
function manifestoPath() {
  const roots = [
    path.join(__dirname, '..', '..'), // repo root em dev (desktop/src → repo)
    process.resourcesPath || null,
    process.cwd()
  ].filter(Boolean);
  for (const root of roots) {
    const p = path.join(root, 'config', 'ai-tools.json');
    try {
      if (fs.existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Lê o bloco `service` do `gitnexus` no manifest. Nunca lança: campo ausente ou
 * inválido cai no padrão **campo a campo**, então um manifest pela metade
 * degrada pro comportamento antigo em vez de quebrar o boot.
 */
function lerServico() {
  const p = manifestoPath();
  if (!p) return { ...SERVICO_PADRAO };
  try {
    const manifest = JSON.parse(fs.readFileSync(p, 'utf8'));
    const tool = (manifest.tools || []).find((t) => t && t.id === 'gitnexus');
    const s = (tool && tool.service) || null;
    if (!s) return { ...SERVICO_PADRAO };
    const porta = Number(s.porta);
    const readyMs = Number(s.readyMs);
    return {
      host: typeof s.host === 'string' && s.host ? s.host : SERVICO_PADRAO.host,
      porta: Number.isInteger(porta) && porta > 0 ? porta : SERVICO_PADRAO.porta,
      health: typeof s.health === 'string' && s.health ? s.health : SERVICO_PADRAO.health,
      serveArgs:
        Array.isArray(s.serveArgs) && s.serveArgs.length
          ? s.serveArgs.map(String)
          : SERVICO_PADRAO.serveArgs,
      readyMs: Number.isFinite(readyMs) && readyMs > 0 ? readyMs : SERVICO_PADRAO.readyMs,
      dependeDe: Array.isArray(s.dependeDe) ? s.dependeDe.map(String) : []
    };
  } catch (err) {
    log('manifest ilegível — usando o contrato padrão:', String((err && err.message) || err));
    return { ...SERVICO_PADRAO };
  }
}

const SERVICO = lerServico();
const HOST = SERVICO.host;
const PORT = SERVICO.porta;
const BASE = `http://${HOST}:${PORT}`;

// O contrato declara host e porta em dois lugares (os campos e o `serveArgs`).
// Se divergirem, o app escuta num endereço e sobe o motor noutro — o badge fica
// âmbar sem ninguém entender por quê. Não "consertamos" em silêncio: avisamos.
for (const [campo, valor] of [
  ['porta', String(SERVICO.porta)],
  ['host', SERVICO.host]
]) {
  if (!SERVICO.serveArgs.includes(valor)) {
    log(`aviso: service.serveArgs não cita ${campo}=${valor} — confira config/ai-tools.json`);
  }
}

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

/** True se há um motor respondendo a rota de health agora. */
async function isAvailable(timeoutMs = 1200) {
  const h = await getJSON(SERVICO.health, timeoutMs);
  return !!(h && h.status === 'ok');
}

/** Estado do motor: { available, url, version?, nodeVersion?, spawned, via? }. */
async function status() {
  const health = await getJSON(SERVICO.health);
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
  // Raízes prováveis: override do operador, ao lado do app empacotado e na raiz
  // do repo (dev). `BALUARTE_GITNEXUS_DIR` aponta direto pro pacote instalado
  // por `npm run tools:sync -- gitnexus --setup` (ver docs/local-ai-tools.md).
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
    '.', // `BALUARTE_GITNEXUS_DIR` já apontando pro pacote
    // Motor empacotado por `npm run motores:empacotar`. No app instalado o root
    // é `resourcesPath/engine` e a subpasta é `gitnexus`; em dev o root é a raiz
    // do repo, então o caminho completo entra aqui.
    'desktop/engine/gitnexus',
    'gitnexus',
    '.baluarte/tools/gitnexus/gitnexus', // instalação padrão (tools:sync)
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
  const args = SERVICO.serveArgs.slice();
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
      // npx baixa na 1ª vez → janela de readiness maior; resto usa o contrato.
      const readyMs = c.via === 'npx' ? READY_NPX_MS : SERVICO.readyMs;
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
