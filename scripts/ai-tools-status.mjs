#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(repoRoot, 'config', 'ai-tools.json'), 'utf8'));

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
  if (tool.localPath) return path.resolve(repoRoot, tool.localPath);
  return path.resolve(repoRoot, manifest.installRoot || '.baluarte/tools', tool.id);
}

function pad(value, length) {
  return String(value).padEnd(length, ' ');
}

const rows = manifest.tools.map((tool) => {
  const target = localPathFor(tool);
  const installed = existsSync(path.join(target, '.git'));
  if (!installed) {
    return {
      id: tool.id,
      state: 'missing',
      branch: '-',
      commit: tool.installedCommit || '-',
      path: path.relative(repoRoot, target),
    };
  }
  return {
    id: tool.id,
    state: git(['status', '--short'], target) ? 'dirty' : 'clean',
    branch: git(['branch', '--show-current'], target) || '-',
    commit: git(['rev-parse', '--short', 'HEAD'], target) || '-',
    path: path.relative(repoRoot, target),
  };
});

console.log(`${pad('tool', 24)} ${pad('state', 8)} ${pad('branch', 18)} ${pad('commit', 12)} path`);
console.log(`${'-'.repeat(24)} ${'-'.repeat(8)} ${'-'.repeat(18)} ${'-'.repeat(12)} ${'-'.repeat(24)}`);
for (const row of rows) {
  console.log(`${pad(row.id, 24)} ${pad(row.state, 8)} ${pad(row.branch, 18)} ${pad(row.commit, 12)} ${row.path}`);
}
