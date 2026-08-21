#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';

export const DOCTOR_CHECKS = Object.freeze([
  Object.freeze({
    id: 'event_catalog',
    category: 'contracts',
    command: 'node scripts/gen-catalogo-eventos.mjs --verificar',
    executable: 'node',
    args: ['scripts/gen-catalogo-eventos.mjs', '--verificar'],
  }),
  Object.freeze({
    id: 'nexus',
    category: 'architecture',
    command: 'npm run verificar-nexus',
    executable: 'npm',
    args: ['run', 'verificar-nexus'],
  }),
  Object.freeze({
    id: 'types_ts',
    category: 'typescript',
    command: 'npx tsc -p tsconfig.json --noEmit',
    executable: 'npx',
    args: ['tsc', '-p', 'tsconfig.json', '--noEmit'],
  }),
  Object.freeze({
    id: 'types_v2',
    category: 'typescript-v2',
    command: 'npx tsc -p v2/jsconfig.json --noEmit',
    executable: 'npx',
    args: ['tsc', '-p', 'v2/jsconfig.json', '--noEmit'],
  }),
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

function runCheck(check, cwd) {
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
    const exitCode = asExitCode(error?.status);
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
  if (evidencePath) {
    const raw = JSON.parse(readFileSync(evidencePath, 'utf8'));
    if (!Array.isArray(raw)) throw new Error('doctor evidence must be an array');
    return summarizeDoctor(raw);
  }
  return summarizeDoctor([...DOCTOR_CHECKS.map((check) => runCheck(check, cwd)), cargoRecord(cwd)]);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    const options = parseArgs(process.argv);
    const report = buildDoctorReport(options);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.exitCode;
  } catch (error) {
    console.error('v2-doctor failed to produce a bounded report');
    process.exitCode = 1;
  }
}
