import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = fs.readFileSync(
  path.resolve(here, '../../supabase/migrations/20260711020000_nexus.sql'),
  'utf8'
);

test('Supabase security contract: tenant resolution remains SECURITY DEFINER with explicit search_path', () => {
  assert.match(
    migration,
    /create or replace function nexus\.resolve_tenant\([\s\S]*?security definer\s*\nset search_path = public, extensions/i
  );
  assert.match(migration, /revoke execute on function nexus\.resolve_tenant\(text, text\) from public;/i);
});

test('Supabase security contract: tenant membership helper is not executable by PUBLIC', () => {
  assert.match(migration, /create or replace function nexus\.is_member\([\s\S]*?security definer/i);
  assert.match(migration, /revoke execute on function nexus\.is_member\(uuid\) from public;/i);
});

test('Supabase security contract: public ingest RPCs resolve a tenant before writing', () => {
  for (const fn of ['ingest_event', 'ingest_memory', 'ingest_stat']) {
    const pattern = new RegExp(
      `create or replace function public\\.${fn}\\([\\s\\S]*?v_tenant := nexus\\.resolve_tenant\\(p_slug, p_key\\);`,
      'i'
    );
    assert.match(migration, pattern, `${fn} must resolve the tenant before its write`);
  }
});

test('Supabase security contract: legal RAG query is not publicly executable', () => {
  assert.match(migration, /revoke execute on function public\.buscar_juris\(uuid, vector, integer\) from public;/i);
  assert.match(migration, /revoke execute on function public\.buscar_juris\(uuid, vector, integer\) from anon;/i);
  assert.match(migration, /grant execute on function public\.buscar_juris\(uuid, vector, integer\) to authenticated, service_role;/i);
});

test('Supabase security contract: telemetry event types include the documented public telemetry set', () => {
  for (const type of ['page_view', 'click', 'interaction', 'session', 'voice', 'error', 'learning', 'custom']) {
    assert.match(migration, new RegExp(`'${type}'`, 'i'), `missing telemetry type: ${type}`);
  }
});
