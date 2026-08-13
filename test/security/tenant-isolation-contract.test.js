import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const migrationPath = 'supabase/migrations/20260711020000_nexus.sql';
const migration = fs.readFileSync(migrationPath, 'utf8');

const requiredTenantTables = [
  'public.tenants',
  'public.tenant_members',
  'public.partes',
  'public.processos',
  'public.processo_partes',
  'public.prazos_eventos',
  'public.juris_doutrina',
  'public.pecas',
  'public.pecas_versoes',
];

function functionBlock(name) {
  return migration.match(
    new RegExp(`create or replace function public\\.${name}\\b[\\s\\S]*?\\$\\$;`, 'i')
  )?.[0] ?? '';
}

test('tenant isolation contracts', async (t) => {
  await t.test('tenant-sensitive tables enable RLS', () => {
    for (const table of requiredTenantTables) {
      const name = table.split('.')[1];
      assert.match(
        migration,
        new RegExp(`alter table public\\.${name} enable row level security`, 'i'),
        `${table} must enable RLS`
      );
    }
  });

  await t.test('core tenant-owned tables carry tenant_id', () => {
    for (const table of ['partes', 'processos', 'prazos_eventos', 'juris_doutrina', 'pecas']) {
      const block = migration.match(
        new RegExp(`create table if not exists public\\.${table} \\(([\\s\\S]*?)\\);`, 'i')
      )?.[1] ?? '';
      assert.match(block, /tenant_id\s+uuid/i, `${table} must declare tenant_id`);
    }
  });

  await t.test('ingestion RPCs resolve tenant before writing', () => {
    for (const fn of ['ingest_event', 'ingest_memory', 'ingest_stat']) {
      const block = functionBlock(fn);
      assert.notEqual(block, '', `${fn} must have a discoverable function definition`);
      assert.match(block, /security definer/i, `${fn} must be an explicit privileged boundary`);
      assert.match(block, /set search_path\s*=\s*public(?:,\s*extensions)?/i, `${fn} must pin search_path`);
      assert.match(block, /v_tenant\s*:=\s*nexus\.resolve_tenant/i, `${fn} must resolve tenant`);
      assert.match(block, /insert into public\./i, `${fn} must write through an explicit table insert`);
    }
  });

  await t.test('jurisprudence query is tenant-scoped and membership-gated', () => {
    const block = functionBlock('buscar_juris');
    assert.notEqual(block, '', 'buscar_juris must have a discoverable function definition');
    assert.match(block, /security definer/i);
    assert.match(block, /set search_path\s*=\s*public/i);
    assert.match(block, /j\.tenant_id\s*=\s*p_tenant/i);
    assert.match(block, /nexus\.is_member\(p_tenant\)/i);
  });

  await t.test('jurisprudence execution is not granted to anonymous callers', () => {
    assert.match(
      migration,
      /revoke execute on function public\.buscar_juris\(uuid, vector, integer\) from anon;/i
    );
    assert.match(
      migration,
      /grant execute on function public\.buscar_juris\(uuid, vector, integer\) to authenticated, service_role;/i
    );
  });

  await t.test('tenant resolver and membership helper are not publicly executable', () => {
    assert.match(migration, /revoke execute on function nexus\.resolve_tenant\(text, text\) from public;/i);
    assert.match(migration, /revoke execute on function nexus\.is_member\(uuid\) from public;/i);
  });
});
