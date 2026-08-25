#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import process from 'node:process';

const SAFE = 'safe';
const NOT_RUN = 'not-run';

export const DOCTOR_EVIDENCE_LIMITS = Object.freeze({
  maxBytes: 256 * 1024,
  maxRecords: 100,
});

export const DOCTOR_CHECKS = Object.freeze([
  { id: 'event_catalog', category: 'contracts', command: 'node scripts/gen-catalogo-eventos.mjs --verificar', executable: 'node', args: ['scripts/gen-catalogo-eventos.mjs', '--verificar'], policy: SAFE },
  { id: 'nexus', category: 'architecture', command: 'npm run verificar-nexus', executable: 'npm', args: ['run', 'verificar-nexus'], policy: SAFE },
  { id: 'types_ts', category: 'typescript', command: 'npx tsc -p tsconfig.json --noEmit', executable: 'npx', args: ['tsc', '-p', 'tsconfig.json', '--noEmit'], policy: SAFE },
  { id: 'types_v2', category: 'typescript-v2', command: 'npx tsc -p v2/jsconfig.json --noEmit', executable: 'npx', args: ['tsc', '-p', 'v2/jsconfig.json', '--noEmit'], policy: SAFE },
  { id: 'npm_test', category: 'tests', command: 'npm test', executable: 'npm', args: ['test'], policy: SAFE },
  { id: 'event_bus_latency_benchmark', category: 'performance', command: 'npm run bench:event-bus', executable: 'npm', args: ['run', 'bench:event-bus'], policy: SAFE },
  { id: 'python_claims', category: 'python-contracts', command: 'python3 backend/test_claims_adapter.py', executable: 'python3', args: ['backend/test_claims_adapter.py'], policy: SAFE },
  { id: 'python_claims_transport', category: 'python-contracts', command: 'python3 backend/test_claims_transport.py', executable: 'python3', args: ['backend/test_claims_transport.py'], policy: SAFE },
  { id: 'python_observation', category: 'python-contracts', command: 'python3 backend/test_observation_contract.py', executable: 'python3', args: ['backend/test_observation_contract.py'], policy: SAFE },
  { id: 'python_observation_transport', category: 'python-contracts', command: 'python3 backend/test_observation_transport.py', executable: 'python3', args: ['backend/test_observation_transport.py'], policy: SAFE },
  { id: 'python_health', category: 'python-contracts', command: 'python3 backend/test_health_contract.py', executable: 'python3', args: ['backend/test_health_contract.py'], policy: SAFE },
  { id: 'module_visual', category: 'security-ui', command: 'npx tsx --test test/module-observation-visual.test.js', executable: 'npx', args: ['tsx', '--test', 'test/module-observation-visual.test.js'], policy: SAFE },
  { id: 'controlled_rollout', category: 'security-ui', command: 'npx tsx --test test/controlled-rollout-evidence.test.js', executable: 'npx', args: ['tsx', '--test', 'test/controlled-rollout-evidence.test.js'], policy: SAFE },
  { id: 'rls_local', category: 'security-local', command: 'npx tsx --test test/rls-staging-contract.test.js', executable: 'npx', args: ['tsx', '--test', 'test/rls-staging-contract.test.js'], policy: SAFE },
  { id: 'distributed_rate_limit', category: 'security-local', command: 'npx tsx --test test/distributed-rate-limit-contract.test.js', executable: 'npx', args: ['tsx', '--test', 'test/distributed-rate-limit-contract.test.js'], policy: SAFE },
  { id: 'doctor_tests', category: 'doctor', command: 'npx tsx --test test/v2-doctor.test.js', executable: 'npx', args: ['tsx', '--test', 'test/v2-doctor.test.js'], policy: SAFE },
  { id: 'build', category: 'build', command: 'npm run build', executable: 'npm', args: ['run', 'build'], policy: NOT_RUN, reasonCode: 'build-writes-dist' },
  { id: 'v2_integracao', category: 'integration', command: 'npm run v2:integracao', executable: 'npm', args: ['run', 'v2:integracao'], policy: NOT_RUN, reasonCode: 'starts-local-harness' },
  { id: 'smoke', category: 'smoke', command: 'npm run smoke', executable: 'npm', args: ['run', 'smoke'], policy: NOT_RUN, reasonCode: 'writes-smoke-report' },
  { id: 'critical_path', category: 'smoke', command: 'npm run caminho-critico', executable: 'npm', args: ['run', 'caminho-critico'], policy: NOT_RUN, reasonCode: 'may-write-runtime-report' },
  { id: 'python_compile', category: 'python-contracts', command: 'python3 -m py_compile backend/*.py api/*.py', executable: 'python3', args: ['-m', 'py_compile', 'backend/transport_security.py', 'backend/claims_adapter.py', 'backend/server.py', 'backend/health_contract.py', 'backend/observation_contract.py', 'api/claims.py', 'api/health.py', 'api/observability.py'], policy: NOT_RUN, reasonCode: 'writes-pycache' },
]);

const VALID_STATES = new Set(['green', 'failed', 'blocked-known', 'unknown', 'not-run']);

function boundedText(value, fallback) {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  return value.slice(0, 240);
}

function asExitCode(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export function normalizeDoctorRecord(input) {
  const candidate = input && typeof input === 'object' ? input : {};
  const requestedState = candidate.state;
  const state = typeof requestedState === 'string' && VALID_STATES.has(requestedState)
    ? requestedState
    : 'unknown';
  const exitCode = asExitCode(candidate.exitCode);
  return {
    id: boundedText(candidate.id, 'unknown-check'),
    category: boundedText(candidate.category, 'unknown'),
    state,
    command: boundedText(candidate.command, 'evidence-only'),
    exitCode,
    reasonCode: boundedText(candidate.reasonCode, state === 'unknown' ? 'missing-evidence' : 'unspecified'),
    summary: boundedText(candidate.summary, 'No bounded summary supplied.'),
    observedAt: boundedText(candidate.observedAt, new Date().toISOString()),
  };
}

export function summarizeDoctor(records) {
  const normalized = records.map(normalizeDoctorRecord);
  const counts = normalized.reduce((accumulator, record) => {
    accumulator[record.state] += 1;
    return accumulator;
  }, { green: 0, failed: 0, 'blocked-known': 0, unknown: 0, 'not-run': 0 });
  const exitCode = counts.failed > 0 ? 1 : counts.unknown > 0 ? 2 : 0;
  return {
    contractVersion: 'v2-doctor/v1',
    exitCode,
    counts,
    records: normalized,
  };
}

export function classifyDoctorFailure(check, error) {
  const exitCode = asExitCode(error?.status);
  const diagnostic = `${String(error?.stderr ?? '')}\n${String(error?.message ?? '')}`;
  const optionalGoogleSdkMissing = (check.id === 'python_claims_transport'
    || check.id === 'python_observation_transport')
    && /ModuleNotFoundError: No module named ['\"]google['\"]/.test(diagnostic);

  if (optionalGoogleSdkMissing) {
    return normalizeDoctorRecord({
      id: check.id,
      category: check.category,
      state: 'blocked-known',
      command: check.command,
      exitCode,
      reasonCode: 'python-google-genai-missing',
      summary: 'Optional Python transport is blocked because the declared google-genai SDK is not installed in this environment.',
    });
  }

  return normalizeDoctorRecord({
    id: check.id,
    category: check.category,
    state: 'failed',
    command: check.command,
    exitCode,
    reasonCode: 'command-failed',
    summary: 'Command returned a non-zero result.',
  });
}

function runCheck(check, cwd) {
  if (check.policy === NOT_RUN) {
    return normalizeDoctorRecord({
      id: check.id,
      category: check.category,
      state: 'not-run',
      command: check.command,
      reasonCode: check.reasonCode || 'mutation-policy',
      summary: 'Not executed by the read-only doctor.',
    });
  }
  try {
    execFileSync(check.executable, check.args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 120_000,
    });
    return normalizeDoctorRecord({
      id: check.id,
      category: check.category,
      state: 'green',
      command: check.command,
      exitCode: 0,
      reasonCode: 'completed',
      summary: 'Command completed successfully.',
    });
  } catch (error) {
    return classifyDoctorFailure(check, error);
  }
}

function cargoRecord(cwd) {
  try {
    const output = execFileSync('cargo', ['--version'], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 10_000,
    }).trim();
    const knownBlocked = output.includes('1.75.0');
    return normalizeDoctorRecord({
      id: 'rust_runtime',
      category: 'runtime',
      state: knownBlocked ? 'blocked-known' : 'not-run',
      command: 'cargo --version (runtime execution intentionally disabled)',
      exitCode: 0,
      reasonCode: knownBlocked ? 'cargo-1.75-edition2024-known-block' : 'runtime-execution-disabled',
      summary: knownBlocked ? 'Cargo toolchain is known to reject the project edition metadata.' : 'Runtime execution was not attempted by the read-only doctor.',
    });
  } catch {
    return normalizeDoctorRecord({
      id: 'rust_runtime',
      category: 'runtime',
      state: 'unknown',
      command: 'cargo --version',
      reasonCode: 'cargo-version-unavailable',
      summary: 'Cargo version could not be observed safely.',
    });
  }
}

function inventoryRecords() {
  return [
    ...DOCTOR_CHECKS.map((check) => normalizeDoctorRecord({
      id: check.id,
      category: check.category,
      state: 'not-run',
      command: check.command,
      reasonCode: 'inventory-only',
      summary: 'Listed without executing the command.',
    })),
    normalizeDoctorRecord({
      id: 'rust_runtime',
      category: 'runtime',
      state: 'not-run',
      command: 'cargo test --manifest-path v2/runtime/Cargo.toml',
      reasonCode: 'inventory-only',
      summary: 'Listed without executing runtime tests.',
    }),
  ];
}

function readDoctorEvidence(evidencePath) {
  const bytes = statSync(evidencePath).size;
  if (bytes > DOCTOR_EVIDENCE_LIMITS.maxBytes) {
    throw new Error(`doctor evidence exceeds ${DOCTOR_EVIDENCE_LIMITS.maxBytes} bytes`);
  }
  const raw = JSON.parse(readFileSync(evidencePath, 'utf8'));
  if (!Array.isArray(raw)) throw new Error('doctor evidence must be an array');
  if (raw.length > DOCTOR_EVIDENCE_LIMITS.maxRecords) {
    throw new Error(`doctor evidence exceeds ${DOCTOR_EVIDENCE_LIMITS.maxRecords} records`);
  }
  return raw;
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const evidenceIndex = argv.indexOf('--evidence');
  return {
    inventoryOnly: args.has('--inventory-only'),
    evidencePath: evidenceIndex >= 0 ? argv[evidenceIndex + 1] : null,
  };
}

export function buildDoctorReport({ cwd = process.cwd(), inventoryOnly = false, evidencePath = null } = {}) {
  if (inventoryOnly) return summarizeDoctor(inventoryRecords());
  if (evidencePath) return summarizeDoctor(readDoctorEvidence(evidencePath));
  return summarizeDoctor([...DOCTOR_CHECKS.map((check) => runCheck(check, cwd)), cargoRecord(cwd)]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs(process.argv);
    const report = buildDoctorReport(options);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.exitCode;
  } catch {
    console.error('v2-doctor failed to produce a bounded report');
    process.exitCode = 1;
  }
}
