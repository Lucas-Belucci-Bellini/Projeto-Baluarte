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
      assert.match(block, /tenant_id\\s+uuid/i, `${table} must declare tenant_id`);
    }
  });

  await t.test('ingestion RPCs resolve tenant before writing', () => {
    for (const fn of ['ingest_event', 'ingest_memory', 'ingest_stat']) {
      const block = migration.match(
        new RegExp(`create or replace function public\\.${fn}\\([\\s\\S]*?end; \\;\\$\\$;`, 'i')
      )?.[0] ?? '';
      assert.match(block, /v_tenant\\s*:=\\s*nexus\.resolve_tenant/i, `${fn} must resolve tenant`);
      assert.match(block, /insert into public\./i, `${fn} must write through an explicit table insert`);
    }
  });

  await t.test('jurisprudence query is tenant-scoped and membership-gated', () => {
    const block = migration.match(
      /create or replace function public\.buscar_juris\([\s\S]*?limit p_limite;/i
    )?.[0] ?? '';
    assert.match(block, /j\.tenant_id\s*=\s*p_tenant/i);
    assert.match(block, /nexus\.is_member\(p_tenant\)/i);
  });
});
