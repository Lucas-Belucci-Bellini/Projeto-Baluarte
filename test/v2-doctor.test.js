import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildDoctorReport, normalizeDoctorRecord, summarizeDoctor } from '../scripts/v2-doctor.mjs';

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

test('inventory-only mode lists checks without executing them', () => {
  const report = buildDoctorReport({ inventoryOnly: true });
  assert.equal(report.exitCode, 0);
  assert.equal(report.counts['not-run'], 5);
  assert.equal(report.counts.failed, 0);
  assert.equal(report.records.every((record) => record.reasonCode === 'inventory-only'), true);
});
