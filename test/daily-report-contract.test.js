import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportScript = fs.readFileSync(path.join(root, 'scripts/v2-daily-report.mjs'), 'utf8');
const monitorScript = fs.readFileSync(path.join(root, 'scripts/v2-issue-monitor.mjs'), 'utf8');
const automationDoc = fs.readFileSync(path.join(root, 'docs/v2/DAILY_PROGRESS_AUTOMATION.md'), 'utf8');

test('daily report: observa origin/main antes dos gates e registra SHA exato', () => {
  assert.match(reportScript, /git fetch origin main/);
  assert.match(reportScript, /originMainSha/);
  assert.match(reportScript, /localGateSnapshot/);
  assert.match(reportScript, /git.*worktree.*origin\/main/);
  assert.match(reportScript, /node_modules/);
  assert.match(reportScript, /commands/);
});

test('daily report: inventaria páginas físicas e separa canônicas de wrappers', () => {
  assert.match(reportScript, /physical scan of src\/pages/);
  assert.match(reportScript, /isJsWrapper/);
  assert.match(reportScript, /canonicalPagesRemaining/);
  assert.match(reportScript, /typescriptPageImplementations/);
});

test('daily report: compara feature/login-cadastro, issues e releases read-only', () => {
  assert.match(reportScript, /feature\/login-cadastro/);
  assert.match(reportScript, /gh.*issue.*list/);
  assert.match(reportScript, /gh.*release.*list/);
  assert.doesNotMatch(reportScript, /gh.*(issue|pr).* (comment|close|edit|merge)/i);
});

test('daily report: classifica causa raiz, cascata, unknown e alerta crítico', () => {
  assert.match(reportScript, /rootCauseSnapshot/);
  assert.match(reportScript, /cascadeEffects/);
  assert.match(reportScript, /unknown/);
  assert.match(reportScript, /criticalAlerts/);
  assert.match(monitorScript, /criticalAlerts/);
});

test('daily report: automação mantém destinatário e proibição de mutações documentados', () => {
  assert.match(automationDoc, /lucasbb2007@gmail\.com/);
  assert.match(automationDoc, /comentar, fechar, atribuir, fazer merge, publicar/i);
  assert.match(automationDoc, /09:00/);
  assert.match(automationDoc, /origin\/main/);
});
