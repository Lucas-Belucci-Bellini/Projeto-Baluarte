#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const dateArg = process.argv.find((value) => value.startsWith('--date='))?.slice('--date='.length);
const reportDate = dateArg || new Date().toISOString().slice(0, 10);
const outputDir = path.join(root, 'reports', 'daily');
const jsonPath = path.join(outputDir, `${reportDate}.json`);
const markdownPath = path.join(outputDir, `${reportDate}.md`);
const repo = 'Lucas-Belucci-Bellini/Projeto-Baluarte';

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  return { code: result.status ?? 1, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
}

function parseJsonCommand(command, commandArgs) {
  const result = run(command, commandArgs);
  if (result.code !== 0) return { value: null, error: (result.stderr || result.stdout).trim() || `${command} failed` };
  try { return { value: JSON.parse(stripAnsi(result.stdout)), error: null }; } catch (error) { return { value: null, error: error instanceof Error ? error.message : String(error) }; }
}

function listFiles(directory, extension) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return listFiles(full, extension);
    return entry.name.endsWith(extension) ? [full] : [];
  });
}

function isJsWrapper(file) {
  const content = fs.readFileSync(file, 'utf8').trim();
  return /^export\s+\{[^}]+\}\s+from\s+['"][^'"]+\.ts['"];?$/.test(content);
}

function migrationCounts() {
  const inventoryPath = path.join(root, 'docs', 'v2', 'PAGES_JS_REMAINING_INVENTORY.md');
  const aggregatePath = path.join(root, 'docs', 'v2', 'TYPESCRIPT_REMAINING.md');
  const inventory = fs.existsSync(inventoryPath) ? fs.readFileSync(inventoryPath, 'utf8') : '';
  const aggregate = fs.existsSync(aggregatePath) ? fs.readFileSync(aggregatePath, 'utf8') : '';
  const canonicalPagesRemaining = [...inventory.matchAll(/^\| \d+ \| `([^`]+)` \|/gm)].map((match) => match[1]);
  const total = aggregate.match(/\| \*\*Total\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|/);
  const wrappers = aggregate.match(/\*\*(\d+) wrappers/)?.[1];
  return {
    pagesJavaScriptTotal: total ? Number(total[1]) : null,
    canonicalPagesRemaining,
    typescriptPageImplementations: null,
    javascriptWrappers: wrappers ? Number(wrappers) : null,
    typescriptImplementations: total ? Number(total[3]) : null,
    boundaryDeclarations: total ? Number(total[4]) : null,
    source: 'docs/v2/PAGES_JS_REMAINING_INVENTORY.md',
  };
}

function gitSnapshot() {
  const sha = run('git', ['rev-parse', 'HEAD']).stdout.trim();
  const branch = run('git', ['branch', '--show-current']).stdout.trim();
  const status = run('git', ['status', '--short']).stdout.trim();
  const subject = run('git', ['log', '-1', '--format=%s']).stdout.trim();
  return { sha, branch, dirty: Boolean(status), statusLines: status ? status.split('\n') : [], subject };
}

function githubSnapshot(sha) {
  const runs = parseJsonCommand('gh', ['run', 'list', '--repo', repo, '--branch', 'main', '--limit', '40', '--json', 'databaseId,workflowName,status,conclusion,headSha,createdAt,updatedAt,url,displayTitle']);
  const issues = parseJsonCommand('gh', ['issue', 'list', '--repo', repo, '--state', 'open', '--limit', '80', '--json', 'number,title,labels,updatedAt,url,author']);
  const prs = parseJsonCommand('gh', ['pr', 'list', '--repo', repo, '--state', 'open', '--limit', '40', '--json', 'number,title,headRefName,baseRefName,isDraft,mergeStateStatus,url,updatedAt']);
  const matchingRuns = Array.isArray(runs.value) ? runs.value.filter((item) => item.headSha === sha || item.headSha === sha.slice(0, 12)) : [];
  const runSummary = matchingRuns.map((item) => ({ id: item.databaseId, workflow: item.workflowName, status: item.status, conclusion: item.conclusion, createdAt: item.createdAt, url: item.url, title: item.displayTitle }));
  const issueList = Array.isArray(issues.value) ? issues.value.map((item) => ({ number: item.number, title: item.title, labels: (item.labels ?? []).map((label) => typeof label === 'string' ? label : label.name), updatedAt: item.updatedAt, url: item.url, author: item.author?.login ?? null })) : [];
  const important = issueList.filter((issue) => {
    const text = `${issue.title} ${issue.labels.join(' ')}`.toLowerCase();
    return /blocker|critical|security|release|urgent|p0|p1|login|cadastro|supabase|vercel|v2|main/.test(text);
  });
  return {
    available: Boolean(runs.value || issues.value || prs.value),
    errors: [runs.error, issues.error, prs.error].filter(Boolean),
    runs: runSummary,
    allOpenIssues: issueList,
    importantIssues: important,
    openPullRequests: Array.isArray(prs.value) ? prs.value : [],
  };
}

function previousReport() {
  if (!fs.existsSync(outputDir)) return null;
  const files = fs.readdirSync(outputDir).filter((file) => file.endsWith('.json')).sort().reverse();
  const previous = files.find((file) => file !== path.basename(jsonPath));
  if (!previous) return null;
  try { return JSON.parse(fs.readFileSync(path.join(outputDir, previous), 'utf8')); } catch { return null; }
}

function releaseSnapshot() {
  const releasePath = path.join(root, 'docs', 'v2', 'RELEASE_PLAN.md');
  const content = fs.existsSync(releasePath) ? fs.readFileSync(releasePath, 'utf8') : '';
  const next = content.match(/O próximo marco recomendado é \*\*([^*]+)\*\*/)?.[1]?.replaceAll('`', '') ?? 'não definido';
  return { nextRecommended: next, document: 'docs/v2/RELEASE_PLAN.md' };
}

function renderMarkdown(report) {
  const gateRows = report.github.runs.length
    ? report.github.runs.map((run) => `| ${run.workflow} | ${run.conclusion || run.status} | [run ${run.id}](${run.url}) |`).join('\n')
    : '| — | unknown | Nenhum run correspondente disponível para este SHA |';
  const issueRows = report.github.importantIssues.length
    ? report.github.importantIssues.map((issue) => `| #${issue.number} | ${issue.title.replaceAll('|', '\\|')} | ${issue.labels.join(', ') || '—'} | [abrir](${issue.url}) |`).join('\n')
    : '| — | Nenhuma issue prioritária detectada pelas regras atuais | — |';
  const pageRows = report.migration.canonicalPagesRemaining.length
    ? report.migration.canonicalPagesRemaining.map((file) => `| ${file} | canônica JS |`).join('\n')
    : '| — | zero páginas canônicas JS |';
  return `# Relatório diário do Projeto-Baluarte — ${report.date}\n\n**SHA observado:** \`${report.git.sha}\`  \n**Branch local:** \`${report.git.branch || 'detached'}\`  \n**Commit:** ${report.git.subject || '—'}  \n**Workspace local:** ${report.git.dirty ? 'com alterações não commitadas' : 'limpo'}\n\n## Resumo executivo\n\nO projeto tem **${report.migration.canonicalPagesRemaining.length} páginas canônicas JavaScript restantes** no workspace observado. A próxima promoção planejada é **${report.release.nextRecommended}**. Este relatório é determinístico: ausência de dados externos aparece como "unknown", nunca como sucesso.\n\n## Migração TypeScript\n\n| Métrica | Valor |\n| --- | ---: |\n| Páginas JS canônicas restantes | ${report.migration.canonicalPagesRemaining.length} |\n| Wrappers JS de compatibilidade | ${report.migration.javascriptWrappers} |\n| Implementações TypeScript | ${report.migration.typescriptImplementations} |\n| Declarações de fronteira | ${report.migration.boundaryDeclarations} |\n\n| Página restante | Estado |\n| --- | --- |\n${pageRows}\n\n## Gates do SHA\n\n| Workflow | Estado | Evidência |\n| --- | --- | --- |\n${gateRows}\n\n${report.github.errors.length ? `**Limitações de coleta:** ${report.github.errors.join('; ')}\n\n` : ''}## Issues importantes\n\n| Issue | Título | Labels | Link |\n| --- | --- | --- | --- |\n${issueRows}\n\n## Próximos passos\n\n1. Resolver a causa raiz de tipos V2 antes de contar novamente CI, V2 Core e V2 Validation como problemas independentes.\n2. Continuar a migração das páginas restantes sem quebrar os gates V1 verdes.\n3. Verificar a branch "feature/login-cadastro" e convertê-la antes do marco "1.1.0 — Identidade Preview".\n4. Não fazer merge, comentário ou envio externo automático a partir deste gerador.\n\n## Fontes internas\n\n- [Auditoria de confiabilidade](../../docs/v2/CI_BOT_RELIABILITY_AUDIT_2026-08-15.md)\n- [Feature login-cadastro](../../docs/v2/LOGIN_CADASTRO_FEATURE.md)\n- [Plano de releases](../../docs/v2/RELEASE_PLAN.md)\n- [Automação diária](../../docs/v2/DAILY_PROGRESS_AUTOMATION.md)\n`;
}

const git = gitSnapshot();
const migration = migrationCounts();
const github = githubSnapshot(git.sha);
const previous = previousReport();
const report = {
  schemaVersion: 1,
  date: reportDate,
  generatedAt: new Date().toISOString(),
  repo,
  git,
  migration,
  github,
  release: releaseSnapshot(),
  changesSincePrevious: previous ? {
    previousDate: previous.date,
    shaChanged: previous.git?.sha !== git.sha,
    canonicalPagesDelta: migration.canonicalPagesRemaining.length - (previous.migration?.canonicalPagesRemaining?.length ?? migration.canonicalPagesRemaining.length),
    newImportantIssues: github.importantIssues.filter((issue) => !(previous.github?.importantIssues ?? []).some((oldIssue) => oldIssue.number === issue.number)).map((issue) => issue.number),
  } : null,
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(report));
console.log(`daily-report: ${markdownPath}`);
console.log(`daily-report-json: ${jsonPath}`);
console.log(`sha: ${git.sha}`);
console.log(`canonical-pages-remaining: ${migration.canonicalPagesRemaining.length}`);
console.log(`github-data: ${github.available ? 'available' : 'unknown'}`);
if (args.has('--print-important')) console.log(JSON.stringify(github.importantIssues, null, 2));
