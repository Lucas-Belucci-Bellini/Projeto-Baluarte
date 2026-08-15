#!/usr/bin/env node

/**
 * Estado das ferramentas de IA instaladas localmente.
 *
 * Responde três perguntas diferentes, que é fácil confundir:
 *
 *   state   — a árvore de trabalho do clone está limpa ou tem edição solta?
 *   pin     — o commit instalado bate com o `installedCommit` do manifest?
 *             `divergiu` quer dizer que a máquina não está no que o repo declara.
 *   remoto  — existe commit novo lá em cima? (só com `--remoto`, precisa de rede)
 *
 * O `pin` é o que responde "isto aqui está atualizado?" sem rede: o manifest é
 * a versão que o Baluarte diz suportar. O `remoto` responde "saiu coisa nova?".
 *
 * Uso:
 *   npm run tools:status                  # local, rápido, sem rede
 *   npm run tools:status -- --remoto      # consulta cada origin (rede)
 *   npm run tools:status -- --estrito     # sai != 0 se algo divergiu/atrasou
 *
 * Onde estão os clones: `BALUARTE_AI_TOOLS_DIR` ou o `installRoot` do manifest
 * (mesma regra do `sync-ai-tools.mjs` e do `empacotar-motores.mjs`).
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'config', 'ai-tools.json'), 'utf8'));

const args = process.argv.slice(2);
const verRemoto = args.includes('--remoto');
const estrito = args.includes('--estrito');

const installRoot = path.resolve(
  repoRoot,
  process.env.BALUARTE_AI_TOOLS_DIR || manifest.installRoot || '.baluarte/tools',
);

function git(args, cwd) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    shell: false,
    windowsHide: true,
  });
  if (result.status !== 0) return '';
  return result.stdout.trim();
}

function localPathFor(tool) {
  const declarado = tool.localPath ? path.resolve(repoRoot, tool.localPath) : null;
  if (declarado && existsSync(declarado)) return declarado;
  // Sem o clone no caminho declarado (ex.: rodando de um worktree), cai no
  // installRoot — que o BALUARTE_AI_TOOLS_DIR pode redirecionar.
  return path.resolve(installRoot, tool.id);
}

function pad(value, length) {
  return String(value).padEnd(length, ' ');
}

/** O commit da máquina bate com o que o manifest declara suportar? */
function pinDe(tool, head) {
  const pin = tool.installedCommit;
  if (!pin) return '-';
  if (!head) return '?';
  return head.startsWith(pin) ? 'ok' : 'divergiu';
}

/** Existe commit novo no origin? Só com --remoto; '' quando não consultamos. */
function remotoDe(tool, head) {
  if (!verRemoto) return '';
  if (!tool.repo) return '-';
  const saida = git(['ls-remote', tool.repo, 'HEAD'], repoRoot);
  if (!saida) return '?';
  const shaRemoto = saida.split(/\s+/)[0];
  if (!shaRemoto || !head) return '?';
  return shaRemoto === head ? 'atualizado' : 'desatualizado';
}

const rows = manifest.tools.map((tool) => {
  const target = localPathFor(tool);
  const instalado = existsSync(path.join(target, '.git'));
  if (!instalado) {
    return {
      id: tool.id,
      state: 'missing',
      branch: '-',
      commit: tool.installedCommit || '-',
      pin: '-',
      remoto: verRemoto ? '-' : '',
      path: path.relative(repoRoot, target),
    };
  }
  const head = git(['rev-parse', 'HEAD'], target);
  return {
    id: tool.id,
    state: git(['status', '--short'], target) ? 'dirty' : 'clean',
    branch: git(['branch', '--show-current'], target) || '-',
    commit: head ? head.slice(0, 8) : '-',
    pin: pinDe(tool, head),
    remoto: remotoDe(tool, head),
    path: path.relative(repoRoot, target),
  };
});

const colRemoto = verRemoto ? `${pad('remoto', 14)} ` : '';
const sepRemoto = verRemoto ? `${'-'.repeat(14)} ` : '';
console.log(
  `${pad('tool', 24)} ${pad('state', 8)} ${pad('branch', 18)} ${pad('commit', 10)} ${pad('pin', 9)} ${colRemoto}path`,
);
console.log(
  `${'-'.repeat(24)} ${'-'.repeat(8)} ${'-'.repeat(18)} ${'-'.repeat(10)} ${'-'.repeat(9)} ${sepRemoto}${'-'.repeat(24)}`,
);
for (const row of rows) {
  const base = `${pad(row.id, 24)} ${pad(row.state, 8)} ${pad(row.branch, 18)} ${pad(row.commit, 10)} ${pad(row.pin, 9)}`;
  console.log(`${base} ${verRemoto ? pad(row.remoto, 14) + ' ' : ''}${row.path}`);
}

if (!verRemoto) {
  console.log('\n(sem consulta de rede — use `--remoto` para saber se saiu commit novo)');
}

const divergiram = rows.filter((r) => r.pin === 'divergiu');
const atrasados = rows.filter((r) => r.remoto === 'desatualizado');
const ausentes = rows.filter((r) => r.state === 'missing');

if (ausentes.length) {
  console.log(`\nnão instalados: ${ausentes.map((r) => r.id).join(', ')}  ->  npm run tools:sync -- <id>`);
}
if (divergiram.length) {
  console.log(
    `\ndivergiram do manifest: ${divergiram.map((r) => r.id).join(', ')}` +
      '\n  a máquina não está no commit que o config/ai-tools.json declara.' +
      '\n  atualize o `installedCommit` do manifest OU volte o clone para ele.',
  );
}
if (atrasados.length) {
  console.log(
    `\ncom commit novo no origin: ${atrasados.map((r) => r.id).join(', ')}  ->  npm run tools:sync -- <id>`,
  );
}

if (estrito && (divergiram.length || atrasados.length || ausentes.length)) {
  process.exit(1);
}
