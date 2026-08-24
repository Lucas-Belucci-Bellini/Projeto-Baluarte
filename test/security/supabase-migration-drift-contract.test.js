import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const manifest = fs.readFileSync(
  path.join(root, 'docs/v2/SUPABASE_REMOTE_MIGRATION_MANIFEST_2026-08-20.tsv'),
  'utf8',
);
const driftAudit = fs.readFileSync(
  path.join(root, 'docs/v2/SUPABASE_MIGRATION_DRIFT_AUDIT_2026-08-20.md'),
  'utf8',
);

const remoteRows = manifest
  .split('\n')
  .filter((line) => line && !line.startsWith('#'))
  .map((line) => line.split('\t'));

const localMigrations = fs
  .readdirSync(path.join(root, 'supabase/migrations'))
  .filter((name) => name.endsWith('.sql'));

test('Supabase drift snapshot preserves the 89-entry remote inventory', () => {
  assert.equal(remoteRows.length, 89);
  assert.ok(
    remoteRows.some(([version, name]) => version === '20260814140657' && name === 'lock_down_ingestion_rpc_execution'),
  );
  assert.ok(
    remoteRows.some(([version, name]) => version === '20260814144509' && name === 'harden_security_definer_search_paths'),
  );
  assert.ok(
    remoteRows.some(([version, name]) => version === '20260814151418' && name === 'create_billing_entitlements_foundation'),
  );
});

test('Supabase drift contract keeps the pending local hardening migration explicit', () => {
  assert.ok(localMigrations.includes('20260820090000_security_definer_search_path_hardening.sql'));
  assert.ok(!remoteRows.some(([version]) => version === '20260820090000'));
  assert.match(driftAudit, /Histórico retornado por `list_migrations` \| 89|89 migrations/i);
  assert.match(driftAudit, /\| 17 \|/i);
  assert.match(driftAudit, /MIGRATIONS_FAILED/i);
});

test('Supabase ingest functions remain service-only in the unreconciled state', () => {
  assert.match(driftAudit, /ingest_stat/i);
  assert.match(driftAudit, /service-only/i);
  assert.match(driftAudit, /não foi feita nenhuma alteração de grant|não revogar.*grant/i);
  assert.match(driftAudit, /DDL nova|DDL inválido|DDL remoto/i);
});
