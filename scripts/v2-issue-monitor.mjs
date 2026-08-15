#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const date = process.argv.find((value) => value.startsWith('--date='))?.slice('--date='.length) || new Date().toISOString().slice(0, 10);
const reportPath = path.join(root, 'reports', 'daily', `${date}.json`);

if (!fs.existsSync(reportPath)) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', 'v2-daily-report.mjs'), `--date=${date}`], { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const issues = report.github?.importantIssues ?? [];
const newNumbers = new Set(report.changesSincePrevious?.newImportantIssues ?? []);

console.log(`issue-monitor: ${issues.length} issues prioritárias conhecidas`);
if (!newNumbers.size) {
  console.log('issue-monitor: nenhum alerta novo');
  process.exit(0);
}

for (const issue of issues.filter((item) => newNumbers.has(item.number))) {
  console.log(`ALERTA issue #${issue.number}: ${issue.title}`);
  console.log(`labels: ${issue.labels.join(', ') || '—'}`);
  console.log(`url: ${issue.url}`);
}
console.log('issue-monitor: alerta informativo; nenhuma ação externa foi executada');
