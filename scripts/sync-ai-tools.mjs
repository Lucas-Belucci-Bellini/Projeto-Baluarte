#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.join(repoRoot, 'config', 'ai-tools.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const rawArgs = process.argv.slice(2);
const withSetup = rawArgs.includes('--with-setup');
const requested = rawArgs.filter((arg) => arg !== '--with-setup' && arg !== '--all');
const installRoot = path.resolve(
  repoRoot,
  process.env.BALUARTE_AI_TOOLS_DIR || manifest.installRoot || '.baluarte/tools',
);

function commandFor(step) {
  if (process.platform === 'win32' && step.windowsCommand) return step.windowsCommand;
  return step.command;
}

function run(command, args, cwd) {
  const rendered = [command, ...args].join(' ');
  console.log(`[tools] ${rendered}`);
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: false,
    windowsHide: true,
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exitCode = result.status || 1;
    throw new Error(`Command failed (${result.status}): ${rendered}`);
  }
}

function selectTools() {
  if (requested.length === 0) return manifest.tools;
  const wanted = new Set(requested.map((item) => item.toLowerCase()));
  const selected = manifest.tools.filter((tool) => wanted.has(tool.id.toLowerCase()));
  const found = new Set(selected.map((tool) => tool.id.toLowerCase()));
  const missing = [...wanted].filter((id) => !found.has(id));
  if (missing.length > 0) {
    throw new Error(`Unknown tool(s): ${missing.join(', ')}`);
  }
  return selected;
}

function localPathFor(tool) {
  if (tool.localPath) return path.resolve(repoRoot, tool.localPath);
  return path.join(installRoot, tool.id);
}

function syncTool(tool) {
  const target = localPathFor(tool);
  mkdirSync(path.dirname(target), { recursive: true });

  if (existsSync(path.join(target, '.git'))) {
    console.log(`[tools] updating ${tool.id} in ${path.relative(repoRoot, target)}`);
    run('git', ['-C', target, 'pull', '--ff-only'], repoRoot);
  } else {
    console.log(`[tools] cloning ${tool.id} into ${path.relative(repoRoot, target)}`);
    run('git', ['clone', tool.repo, target], repoRoot);
  }

  if (!withSetup || !Array.isArray(tool.setup)) return;

  for (const step of tool.setup) {
    const cwd = path.resolve(repoRoot, step.cwd || tool.localPath || installRoot);
    const command = commandFor(step);
    const args = Array.isArray(step.args) ? step.args : [];
    run(command, args, cwd);
  }
}

try {
  mkdirSync(installRoot, { recursive: true });
  for (const tool of selectTools()) {
    syncTool(tool);
  }
} catch (error) {
  console.error(`[tools] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(process.exitCode || 1);
}
