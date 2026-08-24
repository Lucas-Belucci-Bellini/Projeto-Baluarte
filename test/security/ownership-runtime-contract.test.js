import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dbFetch } from '../../src/core/supabase.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const rls = fs.readFileSync(
  path.join(root, 'supabase/migrations/20260814034533_site_security_performance_hardening.sql'),
  'utf8',
);
const fetchReal = globalThis.fetch;

afterEach(() => { globalThis.fetch = fetchReal; });

test('ownership: Data Layer envia o JWT do usuário como Bearer', async () => {
  let chamada;
  globalThis.fetch = async (url, options) => {
    chamada = { url, options };
    return { ok: true, status: 200, text: async () => '[]' };
  };

  await dbFetch('profiles?select=id', { token: 'user-jwt-1' });

  assert.equal(chamada.options.headers.authorization, 'Bearer user-jwt-1');
  assert.match(chamada.url, /\/rest\/v1\/profiles\?select=id$/);
});

test('ownership: sem JWT explícito, Data Layer usa somente a publishable key como Bearer', async () => {
  let chamada;
  globalThis.fetch = async (_url, options) => {
    chamada = options;
    return { ok: true, status: 200, text: async () => '[]' };
  };

  await dbFetch('profiles?select=id');

  assert.match(chamada.headers.authorization, /^Bearer sb_publishable_/);
});

test('ownership: tabelas pessoais exigem auth.uid para o dono da linha', () => {
  for (const table of ['knowledge_notes', 'memories', 'media_bookmarks']) {
    const policy = new RegExp(
      `create policy "${table === 'media_bookmarks' ? 'bookmarks' : table.split('_')[0]} owner (select|insert|update|delete)"[\\s\\S]*?to authenticated[\\s\\S]*?auth\\.uid\\(\\)`,
      'i',
    );
    assert.match(rls, policy, `${table} deve possuir policy owner vinculada a auth.uid()`);
  }
});
