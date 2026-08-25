import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  DOCTOR_CHECKS,
  DOCTOR_EVIDENCE_LIMITS,
  buildDoctorReport,
  classifyDoctorFailure,
  normalizeDoctorRecord,
  summarizeDoctor,
} from '../scripts/v2-doctor.mjs';

test('doctor preserves green and known blocked states', () => {
  const report = summarizeDoctor([
    { id: 'types_ts', category: 'typescript', state: 'green', exitCode: 0, reasonCode: 'completed', summary: 'ok' },
    { id: 'rust_runtime', category: 'runtime', state: 'blocked-known', exitCode: 0, reasonCode: 'cargo-1.75-edition2024-known-block', summary: 'known' },
  ]);
  assert.equal(report.exitCode, 0);
  assert.equal(report.counts.green, 1);
  assert.equal(report.counts['blocked-known'], 1);
});

test('doctor fails when a check is failed or unknown', () => {
  assert.equal(summarizeDoctor([{ id: 'build', state: 'failed', exitCode: 1 }]).exitCode, 1);
  assert.equal(summarizeDoctor([{ id: 'remote', state: 'unknown' }]).exitCode, 2);
});

test('doctor normalizes invalid records to unknown without trusting arbitrary state', () => {
  const record = normalizeDoctorRecord({ id: 'x', state: 'green<script>', summary: 'bounded' });
  assert.equal(record.state, 'unknown');
  assert.equal(record.reasonCode, 'missing-evidence');
  assert.equal(record.summary, 'bounded');
});

test('doctor classifies missing declared google-genai as a known environment block', () => {
  const check = DOCTOR_CHECKS.find((item) => item.id === 'python_claims_transport');
  const record = classifyDoctorFailure(check, {
    status: 1,
    stderr: 'ModuleNotFoundError: No module named \'google\'',
    message: 'command failed',
  });
  assert.equal(record.state, 'blocked-known');
  assert.equal(record.reasonCode, 'python-google-genai-missing');
  assert.equal(summarizeDoctor([record]).exitCode, 0);
});

test('doctor keeps unrelated command failures as failed', () => {
  const check = DOCTOR_CHECKS.find((item) => item.id === 'python_claims_transport');
  const record = classifyDoctorFailure(check, {
    status: 1,
    stderr: 'AssertionError: transport contract changed',
  });
  assert.equal(record.state, 'failed');
  assert.equal(record.reasonCode, 'command-failed');
  assert.equal(summarizeDoctor([record]).exitCode, 1);
});

test('doctor catalogues the Event Bus benchmark as safe observability', () => {
  const benchmark = DOCTOR_CHECKS.find((check) => check.id === 'event_bus_latency_benchmark');
  assert.deepEqual(benchmark, {
    id: 'event_bus_latency_benchmark',
    category: 'performance',
    command: 'npm run bench:event-bus',
    executable: 'npm',
    args: ['run', 'bench:event-bus'],
    policy: 'safe',
  });
});

test('doctor accepts bounded evidence and rejects oversized evidence', () => {
  const directory = mkdtempSync(join(tmpdir(), 'baluarte-doctor-'));
  try {
    const validPath = join(directory, 'valid.json');
    writeFileSync(validPath, JSON.stringify([{ id: 'x', state: 'green' }]));
    const report = buildDoctorReport({ evidencePath: validPath });
    assert.equal(report.counts.green, 1);

    const tooManyPath = join(directory, 'too-many.json');
    writeFileSync(tooManyPath, JSON.stringify(Array.from(
      { length: DOCTOR_EVIDENCE_LIMITS.maxRecords + 1 },
      (_, index) => ({ id: `x-${index}`, state: 'green' }),
    )));
    assert.throws(
      () => buildDoctorReport({ evidencePath: tooManyPath }),
      /exceeds 100 records/,
    );

    const tooLargePath = join(directory, 'too-large.json');
    writeFileSync(tooLargePath, JSON.stringify({ padding: 'x'.repeat(DOCTOR_EVIDENCE_LIMITS.maxBytes) }));
    assert.throws(
      () => buildDoctorReport({ evidencePath: tooLargePath }),
      /exceeds 262144 bytes/,
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test('inventory-only mode lists checks without executing them', () => {
  const report = buildDoctorReport({ inventoryOnly: true });
  assert.equal(report.exitCode, 0);
  assert.equal(report.counts['not-run'], DOCTOR_CHECKS.length + 1);
  assert.equal(report.counts.failed, 0);
  assert.equal(report.records.every((record) => record.reasonCode === 'inventory-only'), true);
});
