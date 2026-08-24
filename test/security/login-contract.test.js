import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const login = fs.readFileSync(path.join(root, 'src/pages/login.ts'), 'utf8');
const auth = fs.readFileSync(path.join(root, 'src/core/supabase-auth.js'), 'utf8');
const main = fs.readFileSync(path.join(root, 'src/main.js'), 'utf8');
const migrationFiles = fs.readdirSync(path.join(root, 'supabase/migrations'))
  .filter((name) => name.endsWith('.sql'))
  .map((name) => fs.readFileSync(path.join(root, 'supabase/migrations', name), 'utf8'))
  .join('\n');

test('login contract: route and canonical TypeScript page are registered', () => {
  assert.match(main, /['"]\/login['"]/);
  assert.match(login, /export function loginPage\(\)/);
  assert.match(login, /from ['"]\.\.\/core\/supabase-auth\.js['"]/);
  assert.doesNotMatch(login, /localStorage|storage\.(get|set|remove)/);
});

test('login contract: signup validates confirmation and handles pending email confirmation', () => {
  assert.match(login, /As senhas não coincidem/);
  assert.match(login, /signUpWithPassword\(email, password\)/);
  assert.match(login, /if \(confirmed\)/);
  assert.match(login, /confirme seu e-mail pelo link que enviamos/);
  assert.match(login, /onSwitch\('login'\)/);
});

test('auth contract: password flows have bounded requests and no frontend password persistence', () => {
  assert.match(auth, /fetch\([^\n]+\/auth\/v1\/signup/);
  assert.match(auth, /fetch\([^\n]+\/auth\/v1\/token\?grant_type=password/);
  assert.match(auth, /AbortSignal\.timeout\(8000\)/);
  assert.match(auth, /AbortSignal\.timeout\(4000\)/);
  assert.match(auth, /storeSession\(null\)/);
  assert.doesNotMatch(auth, /storage\.set\([^\n]*password/i);
});

test('auth contract: OAuth tokens are removed from the URL after redirect', () => {
  assert.match(auth, /handleAuthRedirect/);
  assert.match(auth, /history\.replaceState\(null, '', window\.location\.pathname/);
  assert.match(auth, /access_token && refresh_token/);
});

test('identity RLS contract: profiles policy binds rows to auth.uid', () => {
  assert.match(migrationFiles, /profiles/i);
  assert.match(migrationFiles, /auth\.uid\(\)\s*=\s*id/i);
});
