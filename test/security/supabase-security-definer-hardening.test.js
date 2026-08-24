import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const migration = fs.readFileSync(
  path.resolve(
    here,
    '../../supabase/migrations/20260820090000_security_definer_search_path_hardening.sql',
  ),
  'utf8',
);

const functions = [
  'bump_view',
  'bump_visits',
  'buscar_juris',
  'current_tenant_role',
  'veritas_is_project_owner',
  'veritas_can_collaborate',
  'veritas_can_edit_project',
  'veritas_add_circuit_collaborator',
  'veritas_remove_circuit_collaborator',
];

test('Supabase hardening fixes search_path for every exposed SECURITY DEFINER function', () => {
  for (const functionName of functions) {
    const start = migration.indexOf(`create or replace function public.${functionName}`);
    assert.notEqual(start, -1, `missing hardened function: ${functionName}`);
    const next = migration.indexOf('\ncreate or replace function ', start + 1);
    const body = migration.slice(start, next === -1 ? migration.length : next);
    assert.match(
      body,
      /security definer\s+set search_path = ''/i,
      `${functionName} must pin an empty search_path`,
    );
  }
});

test('Supabase hardening keeps privileged relations schema-qualified', () => {
  assert.match(migration, /(?:from|into) public\.site_stats/i);
  assert.match(migration, /update public\.site_stats/i);
  assert.match(migration, /from public\.juris_doutrina/i);
  assert.match(migration, /from public\.tenant_members/i);
  assert.match(migration, /from public\.veritas_circuit_projects/i);
  assert.match(migration, /from public\.veritas_circuit_collaborators/i);
  assert.match(migration, /operator\(extensions\.<=>\)/i);
  assert.match(migration, /nexus\.is_member\(p_tenant\)/i);
  assert.match(migration, /auth\.uid\(\)/i);
});

test('Supabase hardening preserves public metric RPCs and excludes unrelated Auth/RLS changes', () => {
  assert.match(migration, /public\.bump_view\(p_route text\)/i);
  assert.match(migration, /public\.bump_visits\(\)/i);
  assert.match(migration, /Public metrics RPC/i);
  assert.doesNotMatch(migration, /revoke execute/i);
  assert.doesNotMatch(migration, /(?:^|\n)\s*(?:alter\s+table|create\s+policy|grant|revoke)[^;]*subscription_events/im);
  assert.doesNotMatch(migration, /(?:^|\n)\s*(?:alter\s+auth|enable\s+leaked)/im);
});
