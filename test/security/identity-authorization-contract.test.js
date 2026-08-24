import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const rls = fs.readFileSync(
  path.join(root, 'supabase/migrations/20260814034533_site_security_performance_hardening.sql'),
  'utf8',
);
const permissions = fs.readFileSync(path.join(root, 'src/core/permissions.ts'), 'utf8');
const auth = fs.readFileSync(path.join(root, 'src/core/supabase-auth.js'), 'utf8');

test('identity/RLS: profiles é sempre limitado ao usuário autenticado', () => {
  for (const operation of ['read', 'insert', 'update']) {
    const policy = new RegExp(
      `create policy "profiles owner ${operation}"[\\s\\S]*?to authenticated[\\s\\S]*?\\(select auth\\.uid\\(\\)\\)\\s*=\\s*id`,
      'i',
    );
    assert.match(rls, policy, `policy profiles owner ${operation} deve usar auth.uid()`);
  }
});

test('authorization: tenant_members só permite a própria associação', () => {
  assert.match(
    rls,
    /create policy "sel_members"[\s\S]*?for select to authenticated[\s\S]*?user_id = \(select auth\.uid\(\)\)/i,
  );
});

test('authorization: permissões desconhecidas continuam negadas por padrão', () => {
  assert.match(permissions, /if \(!declaradas\.has\(id\)\)[\s\S]*?return false;/);
  assert.match(permissions, /if \(!declaradas\.has\(id\)\)[\s\S]*?throw new PermissionError\(id, 'desconhecida'/);
  assert.match(permissions, /const RISCO_PADRAO: Risco = 'restrito';/);
});

test('authorization: o frontend não contém service role nem trata claims locais como autoridade', () => {
  assert.doesNotMatch(auth, /service[_-]?role|SUPABASE_SERVICE_ROLE/i);
  assert.match(auth, /Lê `\{ id, email, meta \}` do JWT \(decode local, sem verificar — só pra UI\)/);
});
