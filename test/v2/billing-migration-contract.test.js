import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migration = await readFile(new URL('../../supabase/migrations/20260819060000_billing_foundation.sql', import.meta.url), 'utf8');

test('billing migration defines explicit tenancy boundaries', () => {
  assert.match(migration, /create schema if not exists billing/);
  assert.match(migration, /create table if not exists billing\.workspaces/);
  assert.match(migration, /account_id uuid not null references auth\.users\(id\)/);
  assert.match(migration, /create table if not exists billing\.workspace_members/);
  assert.match(migration, /primary key \(workspace_id, user_id\)/);
  assert.match(migration, /check \(role in \('owner', 'admin', 'dev', 'user'\)\)/);
});

test('billing migration preserves plan version and assignment invariants', () => {
  assert.match(migration, /primary key \(plan_id, version\)/);
  assert.match(migration, /foreign key \(plan_id, plan_version\) references billing\.plans\(plan_id, version\)/);
  assert.match(migration, /check \(effective_to is null or effective_to > effective_from\)/);
  assert.match(migration, /plan_assignments_one_active_window/);
});

test('usage persistence is idempotent and append-only', () => {
  assert.match(migration, /unique \(workspace_id, idempotency_key\)/);
  assert.match(migration, /create or replace function billing\.prevent_usage_mutation/);
  assert.match(migration, /before update or delete on billing\.usage_events/);
  assert.match(migration, /billing\.usage_events é append-only/);
});

test('billing migration enables RLS and does not expose tables to public roles', () => {
  for (const table of ['workspaces', 'workspace_members', 'plans', 'plan_assignments', 'usage_events']) {
    assert.match(migration, new RegExp(`alter table billing\\.${table} enable row level security`));
  }
  assert.match(migration, /revoke all on schema billing from public, anon/);
  assert.match(migration, /revoke all on all tables in schema billing from public, anon/);
  assert.match(migration, /grant execute on function billing\.is_workspace_member\(uuid\) to authenticated, service_role/);
});
