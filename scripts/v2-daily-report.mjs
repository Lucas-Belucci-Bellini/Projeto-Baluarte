#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const repo = 'Lucas-Belucci-Bellini/Projeto-Baluarte';
const timezone = 'America/Sao_Paulo';
const now = new Date();
const dateArg = process.argv.find((value) => value.startsWith('--date='))?.slice('--date='.length);
const reportDate = dateArg || new Intl.DateTimeFormat('en-CA', {
  timeZone: timezone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(now);
const outputDir = path.join(root, 'reports', 'daily');
const jsonPath = path.join(outputDir, `${reportDate}.json`);
const markdownPath = path.join(outputDir, `${reportDate}.md`);
const gateRunnerPath = process.env.BALUARTE_GATE_RUNNER || '/home/ubuntu/run_baluarte_hardening_gates.sh';

const GATE_DEPENDENCIES = Object.freeze({
  types_ts: ['build', 'npm_test', 'smoke', 'caminho_critico'],
  types_v2: ['v2_integracao', 'v2_doctor'],
  build: ['smoke', 'caminho_critico'],
  v2_integracao: ['smoke', 'caminho_critico'],
  event_catalog: [],
  nexus: [],
  npm_test: [],
  smoke: [],
  caminho_critico: [],
  py_transport: [],
  py_claims: [],
  py_claims_transport: [],
  py_observation: [],
  py_observation_transport: [],
  py_health: [],
  module_visual: [],
  controlled_rollout: [],
  rls_local: [],
  distributed_rate_limit: [],
  v2_doctor: [],
  py_compile: [],
  rust_runtime: [],
});

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    timeout: options.timeout ?? 1_200_000,
    env: options.env,
  });
  const timedOut = result.error?.code === 'ETIMEDOUT' || result.signal === 'SIGTERM';
  return {
    code: timedOut ? 124 : (result.status ?? 1),
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    timedOut,
  };
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, '');
}

function redact(value) {
  return value
    .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,;]+/gi, '$1[redacted]')
    .replace(/(bearer\s+)[^\s,;]+/gi, '$1[redacted]')
    .replace(/(access_token|refresh_token|password|secret|api[_-]?key|service[_-]?role)\s*[:=]\s*[^\s,;]+/gi, '$1=[redacted]')
    .replace(/https?:\/\/[^\s]+(?:access_token|refresh_token|token|secret)[^\s]*/gi, '[redacted-url]');
}

function parseJsonCommand(command, commandArgs) {
  const result = run(command, commandArgs);
  if (result.code !== 0) {
    return { value: null, error: redact((result.stderr || result.stdout).trim() || `${command} failed with code ${result.code}`) };
  }
  try {
    return { value: JSON.parse(stripAnsi(result.stdout)), error: null };
  } catch (error) {
    return { value: null, error: error instanceof Error ? error.message : String(error) };
  }
}

function relative(file, base = root) {
  return path.relative(base, file).split(path.sep).join('/');
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
  const content = fs.readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .trim();
  return /^export\s*\{[\s\S]*\}\s*from\s*['"][^'"]+\.ts['"]\s*;?$/.test(content);
}

function migrationSnapshot(workspaceRoot = root) {
  const pageDir = path.join(workspaceRoot, 'src', 'pages');
  const jsFiles = listFiles(pageDir, '.js').sort();
  const declarationFiles = listFiles(pageDir, '.d.ts').sort();
  const tsFiles = listFiles(pageDir, '.ts').filter((file) => !file.endsWith('.d.ts')).sort();
  const wrappers = jsFiles.filter(isJsWrapper);
  const canonical = jsFiles.filter((file) => !wrappers.includes(file));
  const inventoryPath = path.join(workspaceRoot, 'docs', 'v2', 'PAGES_JS_REMAINING_INVENTORY.md');
  const aggregatePath = path.join(workspaceRoot, 'docs', 'v2', 'TYPESCRIPT_REMAINING.md');
  const inventory = fs.existsSync(inventoryPath) ? fs.readFileSync(inventoryPath, 'utf8') : '';
  const aggregate = fs.existsSync(aggregatePath) ? fs.readFileSync(aggregatePath, 'utf8') : '';
  const documentedCanonical = [...inventory.matchAll(/^\| \d+ \| `([^`]+)` \|/gm)].map((match) => match[1]);
  const total = aggregate.match(/\| \*\*Total\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \| \*\*(\d+)\*\* \|/);
  return {
    pagesJavaScriptPhysical: jsFiles.length,
    canonicalPagesRemaining: canonical.map((file) => relative(file, workspaceRoot)),
    javascriptWrappers: wrappers.length,
    typescriptPageImplementations: tsFiles.length,
    boundaryDeclarations: declarationFiles.length,
    documentedCanonicalPagesRemaining: documentedCanonical,
    documentedAggregate: total ? {
      javascript: Number(total[1]),
      wrappers: Number(total[2]),
      typescript: Number(total[3]),
      declarations: Number(total[4]),
    } : null,
    source: 'physical scan of src/pages plus docs/v2 inventories',
  };
}

function gitSnapshot() {
  const localSha = run('git', ['rev-parse', 'HEAD']).stdout.trim();
  const originMainSha = run('git', ['rev-parse', 'origin/main']).stdout.trim();
  const branch = run('git', ['branch', '--show-current']).stdout.trim();
  const status = run('git', ['status', '--short']).stdout.trim();
  const subject = run('git', ['log', '-1', '--format=%s']).stdout.trim();
  const divergence = run('git', ['rev-list', '--left-right', '--count', 'HEAD...origin/main']).stdout.trim().split(/\s+/).map(Number);
  return {
    sha: localSha,
    originMainSha: originMainSha || null,
    branch,
    dirty: Boolean(status),
    statusLines: status ? status.split('\n') : [],
    subject,
    localAhead: Number.isFinite(divergence[0]) ? divergence[0] : null,
    localBehind: Number.isFinite(divergence[1]) ? divergence[1] : null,
  };
}

function recentDocumentation(workspaceRoot = root) {
  const result = run('git', ['log', '-8', '--date=iso-strict', '--format=%H\t%ad\t%s', '--', 'docs/v2'], { cwd: workspaceRoot });
  const entries = result.stdout.trim() ? result.stdout.trim().split('\n').map((line) => {
    const [sha, committedAt, ...subjectParts] = line.split('\t');
    return { sha, committedAt, subject: subjectParts.join('\t') };
  }) : [];
  return {
    available: result.code === 0,
    entries,
    error: result.code === 0 ? null : redact(result.stderr || result.stdout),
  };
}

function featureSnapshot() {
  const comparison = parseJsonCommand('gh', ['api', `repos/${repo}/compare/main...feature/login-cadastro`]);
  if (!comparison.value || typeof comparison.value !== 'object') {
    return { available: false, error: comparison.error || 'compare feature/login-cadastro indisponível' };
  }
  const value = comparison.value;
  return {
    available: true,
    status: value.status ?? null,
    aheadBy: Number.isInteger(value.ahead_by) ? value.ahead_by : null,
    behindBy: Number.isInteger(value.behind_by) ? value.behind_by : null,
    totalCommits: Number.isInteger(value.total_commits) ? value.total_commits : null,
    changedFiles: Array.isArray(value.files) ? value.files.length : null,
    compareUrl: value.html_url ?? null,
    latestCommits: Array.isArray(value.commits) ? value.commits.slice(0, 5).map((commit) => ({
      sha: commit.sha,
      subject: commit.commit?.message?.split('\n')[0] ?? '—',
    })) : [],
  };
}

function releaseSnapshot(workspaceRoot = root) {
  const releasePath = path.join(workspaceRoot, 'docs', 'v2', 'RELEASE_PLAN.md');
  const packagePath = path.join(workspaceRoot, 'package.json');
  const releasePlan = fs.existsSync(releasePath) ? fs.readFileSync(releasePath, 'utf8') : '';
  const packageJson = fs.existsSync(packagePath) ? JSON.parse(fs.readFileSync(packagePath, 'utf8')) : {};
  const tag = run('git', ['describe', '--tags', '--abbrev=0'], { cwd: workspaceRoot }).stdout.trim();
  const currentVersion = packageJson.version ?? tag.replace(/^desktop-v|^v/, '');
  const releaseLines = releasePlan.split('\n');
  const currentReleaseIndex = releaseLines.findIndex((line) => line.includes(`| \`${currentVersion}\``));
  const nextReleaseLine = currentReleaseIndex >= 0
    ? releaseLines.slice(currentReleaseIndex + 1).find((line) => /^\| `[^`]+` —/.test(line))
    : null;
  const nextReleaseMatch = nextReleaseLine?.match(/^\| `([^`]+)` — ([^|]+)/);
  const nextRecommended = nextReleaseMatch
    ? `${nextReleaseMatch[1]} — ${nextReleaseMatch[2].trim()}`
    : 'não definido';
  return {
    packageVersion: packageJson.version ?? null,
    nearestTag: tag || null,
    nextRecommended: nextRecommended.replaceAll('`', ''),
    document: 'docs/v2/RELEASE_PLAN.md',
  };
}

function githubSnapshot(sha, previous) {
  const runs = parseJsonCommand('gh', ['run', 'list', '--repo', repo, '--branch', 'main', '--limit', '80', '--json', 'databaseId,workflowName,status,conclusion,headSha,createdAt,updatedAt,url,displayTitle']);
  const issues = parseJsonCommand('gh', ['issue', 'list', '--repo', repo, '--state', 'open', '--limit', '80', '--json', 'number,title,labels,updatedAt,url,author']);
  const releases = parseJsonCommand('gh', ['release', 'list', '--repo', repo, '--limit', '10', '--json', 'tagName,name,isDraft,isPrerelease,publishedAt']);
  const feature = featureSnapshot();
  const matchingRuns = Array.isArray(runs.value)
    ? runs.value.filter((item) => item.headSha === sha || item.headSha === sha.slice(0, 12))
    : [];
  const runSummary = matchingRuns.map((item) => ({
    id: item.databaseId,
    workflow: item.workflowName,
    status: item.status,
    conclusion: item.conclusion,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    url: item.url,
    title: item.displayTitle,
  }));
  const issueList = Array.isArray(issues.value) ? issues.value.map((item) => ({
    number: item.number,
    title: item.title,
    labels: (item.labels ?? []).map((label) => typeof label === 'string' ? label : label.name),
    updatedAt: item.updatedAt,
    url: item.url,
    author: item.author?.login ?? null,
  })) : [];
  const importantIssues = issueList.filter((issue) => {
    const text = `${issue.title} ${issue.labels.join(' ')}`.toLowerCase();
    return /blocker|critical|security|release|urgent|p0|p1|login|cadastro|supabase|vercel|v2|main/.test(text);
  });
  const previousIssues = previous?.github?.importantIssues ?? [];
  return {
    available: Boolean(runs.value || issues.value || releases.value || feature.available),
    errors: [
      runs.error ? `GitHub runs: ${runs.error}` : null,
      issues.error ? `GitHub issues: ${issues.error}` : null,
      releases.error ? `GitHub releases: ${releases.error}` : null,
      feature.error ? `feature/login-cadastro: ${feature.error}` : null,
    ].filter(Boolean),
    runs: runSummary,
    allOpenIssues: issueList,
    importantIssues,
    newImportantIssues: importantIssues.filter((issue) => !previousIssues.some((oldIssue) => oldIssue.number === issue.number)).map((issue) => issue.number),
    openPullRequests: [],
    releases: Array.isArray(releases.value) ? releases.value : [],
    featureLoginCadastro: feature,
  };
}

function gateDiagnostic(logPath) {
  if (!logPath || !fs.existsSync(logPath)) return null;
  const lines = fs.readFileSync(logPath, 'utf8').split('\n').map((line) => redact(stripAnsi(line.trim()))).filter(Boolean);
  const candidate = lines.find((line) => /error|failed|failure|panic|fatal|unknown|blocked/i.test(line));
  return candidate ? candidate.slice(0, 500) : (lines[lines.length - 1]?.slice(0, 500) ?? null);
}

function localGateSnapshot(workspaceRoot = root) {
  if (!fs.existsSync(gateRunnerPath)) {
    return { available: false, runner: gateRunnerPath, workspace: workspaceRoot, error: 'runner oficial não encontrado', gates: [] };
  }
  const temporaryRunner = path.join('/tmp', `baluarte-daily-gates-${process.pid}.sh`);
  const runnerText = fs.readFileSync(gateRunnerPath, 'utf8').replace(
    'cd /home/ubuntu/Projeto-Baluarte-ts',
    `cd ${workspaceRoot}`,
  );
  fs.writeFileSync(temporaryRunner, runnerText, { mode: 0o700 });
  let result;
  try {
    result = run('bash', [temporaryRunner], { cwd: workspaceRoot, timeout: 1_800_000 });
  } finally {
    fs.rmSync(temporaryRunner, { force: true });
  }
  const output = stripAnsi(`${result.stdout}\n${result.stderr}`);
  const summaryPath = output.match(/^SUMMARY_FILE\t(.+)$/m)?.[1]?.trim() ?? null;
  const summaryText = summaryPath && fs.existsSync(summaryPath) ? fs.readFileSync(summaryPath, 'utf8') : output;
  const gates = summaryText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [id, codeText, logPath] = line.split('\t');
    if (!id || !/^\d+$/.test(codeText ?? '')) return null;
    const code = Number(codeText);
    const classification = code === 0 ? 'pass' : (id === 'rust_runtime' && code === 101 ? 'blocked-known' : 'failed');
    return { id, code, classification, logPath: logPath ?? null, diagnostic: code === 0 ? null : gateDiagnostic(logPath) };
  }).filter(Boolean);
  return {
    available: gates.length > 0,
    runner: gateRunnerPath,
    workspace: workspaceRoot,
    runnerCode: result.code,
    timedOut: result.timedOut,
    error: gates.length > 0 ? null : redact(result.stderr || result.stdout || 'summary indisponível'),
    gates,
  };
}

function rootCauseSnapshot(gates) {
  const failures = gates.filter((gate) => gate.classification === 'failed');
  const rootIds = failures
    .filter((gate) => !failures.some((other) => GATE_DEPENDENCIES[other.id]?.includes(gate.id)))
    .map((gate) => gate.id);
  const roots = failures.filter((gate) => rootIds.includes(gate.id)).map((gate) => ({
    id: gate.id,
    code: gate.code,
    diagnostic: gate.diagnostic,
    architectural: ['event_catalog', 'nexus', 'types_ts', 'types_v2', 'v2_integracao'].includes(gate.id),
  }));
  const cascades = failures.filter((gate) => !rootIds.includes(gate.id)).map((gate) => ({
    id: gate.id,
    code: gate.code,
    causedBy: rootIds.filter((rootId) => GATE_DEPENDENCIES[rootId]?.includes(gate.id)),
    diagnostic: gate.diagnostic,
  }));
  return {
    rootCauses: roots,
    cascadeEffects: cascades,
    blockedKnown: gates.filter((gate) => gate.classification === 'blocked-known').map((gate) => ({ id: gate.id, code: gate.code, diagnostic: gate.diagnostic })),
  };
}

function previousReport() {
  if (!fs.existsSync(outputDir)) return null;
  const files = fs.readdirSync(outputDir).filter((file) => file.endsWith('.json')).sort().reverse();
  const previous = files.find((file) => file !== path.basename(jsonPath));
  if (!previous) return null;
  try {
    return JSON.parse(fs.readFileSync(path.join(outputDir, previous), 'utf8'));
  } catch {
    return null;
  }
}

function changesSnapshot(previous, git, migration, github) {
  const previousOriginSha = previous?.git?.originMainSha || previous?.git?.sha;
  const newCommits = previousOriginSha && git.originMainSha
    ? run('git', ['log', '--format=%H\t%s', `${previousOriginSha}..${git.originMainSha}`]).stdout.trim().split('\n').filter(Boolean).map((line) => {
      const [sha, ...subject] = line.split('\t');
      return { sha, subject: subject.join('\t') };
    })
    : [];
  const previousFeature = previous?.github?.featureLoginCadastro;
  const currentFeature = github.featureLoginCadastro;
  const featureChanged = Boolean(previousFeature && currentFeature && JSON.stringify({
    status: previousFeature.status,
    aheadBy: previousFeature.aheadBy,
    behindBy: previousFeature.behindBy,
    totalCommits: previousFeature.totalCommits,
  }) !== JSON.stringify({
    status: currentFeature.status,
    aheadBy: currentFeature.aheadBy,
    behindBy: currentFeature.behindBy,
    totalCommits: currentFeature.totalCommits,
  }));
  return {
    previousDate: previous?.date ?? null,
    previousOriginSha: previousOriginSha ?? null,
    shaChanged: previousOriginSha ? previousOriginSha !== git.originMainSha : null,
    newCommits,
    canonicalPagesDelta: migration.canonicalPagesRemaining.length - (previous?.migration?.canonicalPagesRemaining?.length ?? migration.canonicalPagesRemaining.length),
    newImportantIssues: github.newImportantIssues,
    featureChanged,
  };
}

function criticalAlerts(report) {
  const alerts = [];
  for (const issueNumber of report.changesSincePrevious?.newImportantIssues ?? []) {
    const issue = report.github.importantIssues.find((item) => item.number === issueNumber);
    if (issue) alerts.push({ kind: 'issue', severity: 'critical', reason: 'issue prioritária nova', summary: `#${issue.number} ${issue.title}`, url: issue.url });
  }
  for (const root of report.causes.rootCauses) {
    alerts.push({ kind: 'gate', severity: 'critical', reason: 'falha de causa raiz em gate', summary: `${root.id} código ${root.code}`, detail: root.diagnostic });
  }
  for (const remote of report.github.runs.filter((runItem) => ['failure', 'cancelled', 'timed_out', 'action_required'].includes(runItem.conclusion))) {
    alerts.push({ kind: 'remote-gate', severity: 'critical', reason: 'workflow remoto não verde', summary: remote.workflow, url: remote.url });
  }
  if (!report.fetch.available) {
    alerts.push({ kind: 'external', severity: 'critical', reason: 'fonte externa indisponível', summary: report.fetch.error || 'git fetch origin/main indisponível' });
  }
  if (!report.observation.worktreeCreated) {
    alerts.push({ kind: 'external', severity: 'critical', reason: 'origin/main não pôde ser isolado para observação', summary: report.observation.error || 'worktree de observação indisponível' });
  }
  for (const error of report.github.errors) {
    alerts.push({ kind: 'external', severity: 'critical', reason: 'fonte externa indisponível', summary: error });
  }
  if (report.feature?.changed) {
    alerts.push({ kind: 'feature', severity: 'important', reason: 'feature/login-cadastro mudou desde o relatório anterior', summary: report.github.featureLoginCadastro.compareUrl || 'compare indisponível' });
  }
  return alerts;
}

function renderMarkdown(report) {
  const pageRows = report.migration.canonicalPagesRemaining.length
    ? report.migration.canonicalPagesRemaining.map((file) => `| ${file} | canônica JS |`).join('\n')
    : '| — | zero páginas canônicas JS |';
  const gateRows = report.gates.gates.length
    ? report.gates.gates.map((gate) => `| ${gate.id} | ${gate.classification} | ${gate.code} | ${gate.diagnostic || '—'} |`).join('\n')
    : '| — | unknown | — | runner/summary indisponível |';
  const rootRows = report.causes.rootCauses.length
    ? report.causes.rootCauses.map((cause) => `| ${cause.id} | ${cause.code} | ${cause.architectural ? 'contrato arquitetural' : 'local'} | ${cause.diagnostic || '—'} |`).join('\n')
    : '| — | — | nenhuma causa raiz observada | — |';
  const cascadeRows = report.causes.cascadeEffects.length
    ? report.causes.cascadeEffects.map((effect) => `| ${effect.id} | ${effect.causedBy.join(', ') || 'não determinado'} | ${effect.diagnostic || '—'} |`).join('\n')
    : '| — | — | nenhum efeito cascata observado |';
  const issueRows = report.github.importantIssues.length
    ? report.github.importantIssues.map((issue) => `| #${issue.number} | ${issue.title.replaceAll('|', '\\|')} | ${issue.labels.join(', ') || '—'} | ${issue.url ? `[abrir](${issue.url})` : '—'} |`).join('\n')
    : '| — | nenhuma issue prioritária detectada | — |';
  const docsRows = report.documentation.entries.length
    ? report.documentation.entries.map((entry) => `| ${entry.committedAt} | ${entry.sha.slice(0, 12)} | ${entry.subject.replaceAll('|', '\\|')} |`).join('\n')
    : '| — | — | unknown |';
  const alertRows = report.criticalAlerts.length
    ? report.criticalAlerts.map((alert) => `| ${alert.severity} | ${alert.kind} | ${alert.reason} | ${alert.summary.replaceAll('|', '\\|')} |`).join('\n')
    : '| — | — | nenhum alerta crítico novo | — |';
  const feature = report.github.featureLoginCadastro;
  return `# Relatório diário do Projeto-Baluarte — ${report.date}

> **Estado observado antes do envio.** Este relatório foi gerado após a inspeção do \`origin/main\`, dos gates disponíveis e das fontes externas. A rotina é somente leitura no GitHub: não comenta, fecha, atribui, faz merge, publica ou executa ações destrutivas.

**SHA exato do origin/main:** \`${report.git.originMainSha || 'unknown'}\`
**SHA do checkout que executou os gates:** \`${report.git.sha || 'unknown'}\`
**Branch local:** \`${report.git.branch || 'detached'}\`
**Observado em:** ${report.generatedAt} UTC / ${report.observedAtBrasilia} Brasília
**Workspace depois da coleta:** ${report.finalGit.dirty ? 'com alterações locais (não publicadas)' : 'limpo'}
**Modo de observação:** ${report.observation.worktreeCreated ? 'worktree temporário exatamente em origin/main' : `fallback local — ${report.observation.error || 'causa não informada'}`}

## Resumo executivo

Foram encontradas **${report.migration.canonicalPagesRemaining.length} páginas canônicas JavaScript** no inventário físico de \`src/pages\`, **${report.migration.javascriptWrappers} wrappers JS** e **${report.migration.typescriptPageImplementations} implementações TypeScript**. Desde o relatório anterior, houve **${report.changesSincePrevious?.newCommits?.length ?? 0} commits novos no origin/main** e **${report.changesSincePrevious?.newImportantIssues?.length ?? 0} issues prioritárias novas**. O próximo marco documentado é **${report.release.nextRecommended}**. O resultado não converte indisponibilidade externa em sucesso: GitHub, feature compare ou qualquer fonte ausente aparece como \`unknown\`.

## Migração JavaScript → TypeScript

| Métrica física | Valor |
|---|---:|
| Arquivos JS em \`src/pages\` | ${report.migration.pagesJavaScriptPhysical} |
| Páginas JS canônicas | ${report.migration.canonicalPagesRemaining.length} |
| Wrappers JS de compatibilidade | ${report.migration.javascriptWrappers} |
| Implementações \`.ts\` em \`src/pages\` | ${report.migration.typescriptPageImplementations} |
| Declarações \`.d.ts\` em páginas | ${report.migration.boundaryDeclarations} |
| Inventário documental de canônicas | ${report.migration.documentedCanonicalPagesRemaining.length} |

| Página restante | Estado |
|---|---|
${pageRows}

A contagem acima é física e independente do inventário documental. Divergência entre as duas fontes deve ser tratada como risco documental, não como uma nova página ou um novo defeito sem investigação.

## Commits e documentação recentes

**Commits novos desde o relatório anterior:** ${report.changesSincePrevious?.newCommits?.length ?? 0}.

| Data | SHA | Alteração documental |
|---|---|---|
${docsRows}

## Gates disponíveis

| Gate | Classificação | Código | Diagnóstico resumido |
|---|---|---:|---|
${gateRows}

O estado \`blocked-known\` não é contado como causa raiz nova. O runner atual mantém o runtime Rust nessa categoria quando a toolchain local não suporta a edição exigida. Se o runner ou uma fonte externa não estiver disponível, o relatório registra \`unknown\` e a causa da indisponibilidade.

## Causas raiz versus efeitos cascata

### Causas raiz observadas

| Gate | Código | Natureza | Diagnóstico |
|---|---:|---|---|
${rootRows}

### Efeitos cascata

| Gate afetado | Causa raiz provável | Diagnóstico |
|---|---|---|
${cascadeRows}

A classificação é baseada na ordem de dependências declarada no gerador e não substitui a leitura do log quando existe falha. Nenhum efeito cascata é contado como problema independente quando ele depende de um gate raiz.

## Issues prioritárias

| Issue | Título | Labels | Link |
|---|---|---|---|
${issueRows}

## feature/login-cadastro

| Campo | Estado observado |
|---|---|
| Comparação | ${feature.available ? (feature.compareUrl ? `[abrir](${feature.compareUrl})` : 'disponível') : 'unknown'} |
| Status | ${feature.status ?? 'unknown'} |
| Commits à frente | ${feature.aheadBy ?? 'unknown'} |
| Commits atrás | ${feature.behindBy ?? 'unknown'} |
| Commits totais | ${feature.totalCommits ?? 'unknown'} |
| Arquivos alterados | ${feature.changedFiles ?? 'unknown'} |

A branch histórica não é mesclada automaticamente. A migração TypeScript e os contratos já publicados no main continuam sendo a linha de implementação válida.

## Plano de releases

| Campo | Valor observado |
|---|---|
| Versão do package | ${report.release.packageVersion ?? 'unknown'} |
| Tag mais próxima do checkout | ${report.release.nearestTag ?? 'unknown'} |
| Próximo marco recomendado | ${report.release.nextRecommended} |
| Documento | ${report.release.document} |

## Alertas críticos

| Severidade | Tipo | Motivo | Resumo |
|---|---|---|---|
${alertRows}

Quando houver uma linha crítica, a execução agendada deve enviar um alerta imediato ao destinatário configurado, sem executar qualquer mutação no GitHub. O destinatário operacional deste projeto é \`lucasbb2007@gmail.com\`.

## Segurança e limites

Nenhum token, senha, cookie, service role, bearer, metadata sensível ou dump integral de log é incluído no relatório. A coleta usa GitHub, Vercel/Supabase quando disponíveis por seus gates/configuração; falhas externas aparecem como \`unknown/external\`. O fluxo não executa DDL, não altera Supabase, não publica no Vercel e não decide autorização client-side.

## Comandos executados

| Comando | Finalidade |
|---|---|
${report.commands.map((command) => `| \`${command.replaceAll('|', '\\|')}\` | coleta ou gate read-only |`).join('\n')}

## Fontes internas

- [Automação diária](../../docs/v2/DAILY_PROGRESS_AUTOMATION.md)
- [Plano de releases](../../docs/v2/RELEASE_PLAN.md)
- [Feature login-cadastro](../../docs/v2/LOGIN_CADASTRO_FEATURE.md)
- [Auditoria TypeScript](../../docs/v2/PAGES_TS_STABILITY_AUDIT_2026-08-20.md)
`;
}

const previous = previousReport();
const fetchMain = run('git', ['fetch', 'origin', 'main', '--quiet'], { timeout: 120_000 });
const initialGit = gitSnapshot();
const temporaryWorkspace = path.join('/tmp', `baluarte-daily-observation-${process.pid}`);
let workspaceRoot = root;
let worktreeCreated = false;
let worktreeError = null;
if (fetchMain.code === 0 && initialGit.originMainSha) {
  fs.rmSync(temporaryWorkspace, { recursive: true, force: true });
  const addWorktree = run('git', ['worktree', 'add', '--detach', temporaryWorkspace, 'origin/main'], { timeout: 120_000 });
  if (addWorktree.code === 0) {
    const localNodeModules = path.join(root, 'node_modules');
    const worktreeNodeModules = path.join(temporaryWorkspace, 'node_modules');
    if (fs.existsSync(localNodeModules)) fs.symlinkSync(localNodeModules, worktreeNodeModules, 'dir');
    workspaceRoot = temporaryWorkspace;
    worktreeCreated = true;
  } else {
    worktreeError = redact(addWorktree.stderr || addWorktree.stdout || 'worktree origin/main indisponível');
  }
}
const migration = migrationSnapshot(workspaceRoot);
const documentation = recentDocumentation(workspaceRoot);
const github = githubSnapshot(initialGit.originMainSha || initialGit.sha, previous);
const release = releaseSnapshot(workspaceRoot);
const gates = localGateSnapshot(workspaceRoot);
if (worktreeCreated) {
  const removeWorktree = run('git', ['worktree', 'remove', '--force', temporaryWorkspace], { timeout: 120_000 });
  if (removeWorktree.code !== 0 && !worktreeError) worktreeError = redact(removeWorktree.stderr || removeWorktree.stdout || 'worktree cleanup indisponível');
}
const finalGit = gitSnapshot();
const causes = rootCauseSnapshot(gates.gates);
const commands = [
  'git fetch origin main --quiet',
  'git rev-parse origin/main',
  'git worktree add --detach <temporary> origin/main',
  'git status --short (origin/main observation worktree)',
  'git log -- docs/v2 (origin/main observation worktree)',
  'physical scan src/pages (*.js, *.ts, *.d.ts) (origin/main observation worktree)',
  'gh api repos/Lucas-Belucci-Bellini/Projeto-Baluarte/compare/main...feature/login-cadastro',
  'gh run list --repo Lucas-Belucci-Bellini/Projeto-Baluarte --branch main',
  'gh issue list --repo Lucas-Belucci-Bellini/Projeto-Baluarte --state open',
  'gh release list --repo Lucas-Belucci-Bellini/Projeto-Baluarte',
  `${gateRunnerPath} (origin/main observation worktree)`,
];
const report = {
  schemaVersion: 2,
  date: reportDate,
  generatedAt: now.toISOString(),
  observedAtBrasilia: new Intl.DateTimeFormat('pt-BR', { timeZone: timezone, dateStyle: 'short', timeStyle: 'medium' }).format(now),
  repo,
  timezone,
  readOnly: true,
  fetch: { code: fetchMain.code, available: fetchMain.code === 0, error: fetchMain.code === 0 ? null : redact(fetchMain.stderr || fetchMain.stdout) },
  observation: {
    worktreeCreated,
    workspace: worktreeCreated ? 'temporary worktree at origin/main' : 'local checkout fallback',
    observedOriginSha: initialGit.originMainSha || null,
    error: worktreeError,
  },
  git: initialGit,
  finalGit,
  migration,
  documentation,
  github,
  release,
  gates,
  causes,
  commands,
  changesSincePrevious: changesSnapshot(previous, initialGit, migration, github),
};
report.feature = {
  changed: report.changesSincePrevious.featureChanged,
  available: github.featureLoginCadastro.available,
};
report.criticalAlerts = criticalAlerts(report);

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(markdownPath, renderMarkdown(report));
console.log(`daily-report: ${markdownPath}`);
console.log(`daily-report-json: ${jsonPath}`);
console.log(`origin-main-sha: ${initialGit.originMainSha || 'unknown'}`);
console.log(`checkout-sha: ${initialGit.sha || 'unknown'}`);
console.log(`canonical-pages-remaining: ${migration.canonicalPagesRemaining.length}`);
console.log(`gates: ${gates.available ? gates.gates.filter((gate) => gate.classification === 'pass').length : 'unknown'}`);
console.log(`critical-alerts: ${report.criticalAlerts.length}`);
if (args.has('--print-important')) console.log(JSON.stringify(github.importantIssues, null, 2));
if (args.has('--print-alerts')) console.log(JSON.stringify(report.criticalAlerts, null, 2));
