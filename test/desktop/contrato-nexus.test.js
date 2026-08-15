/**
 * Trava do contrato de processo do GitNexus (#222 — 1º passo do supervisor).
 *
 * A porta, a rota de health, os args do `serve` e a janela de readiness saíram
 * das constantes de `desktop/src/nexus.js` e passaram a ser declaradas no bloco
 * `service` do `gitnexus` em `config/ai-tools.json`.
 *
 * Isso foi **refatoração**: o motor tem que subir exatamente como subia antes.
 * Estes testes são a rede — se alguém mexer no manifest e mudar o
 * comportamento sem querer, quebra aqui e não no aceite manual do launcher.
 *
 * Rodar: npm test
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const manifest = require(path.join(raiz, 'config', 'ai-tools.json'));
const nexus = require(path.join(raiz, 'desktop', 'src', 'nexus.js'));

/** Exatamente o que estava hardcoded no nexus.js antes da refatoração. */
const ANTIGO = {
  porta: 4747,
  health: '/api/health',
  serveArgs: ['serve', '--port', '4747'],
  readyMs: 20000
};

const servico = () => manifest.tools.find((t) => t.id === 'gitnexus')?.service;

test('o gitnexus declara o bloco `service` no manifest', () => {
  const s = servico();
  assert.ok(s, 'config/ai-tools.json: o tool `gitnexus` precisa do bloco `service`');
});

test('porta, health e readyMs seguem idênticos ao que estava hardcoded', () => {
  const s = servico();
  assert.equal(s.porta, ANTIGO.porta);
  assert.equal(s.health, ANTIGO.health);
  assert.equal(s.readyMs, ANTIGO.readyMs);
});

test('serveArgs preserva os args antigos e acrescenta o --host explícito', () => {
  // Este é o único ponto em que o contrato se afasta do hardcoded antigo, e é
  // correção de defeito, não refatoração: o gitnexus 1.6.9 escuta em `::1` se o
  // `--host` não for passado — mesmo anunciando 127.0.0.1 como default no
  // `--help`. Como o app faz fetch em IPv4, sem esta flag o /api/health nunca
  // responde e o badge fica âmbar com o motor vivo do lado.
  const s = servico();
  assert.deepEqual(s.serveArgs.slice(0, 3), ANTIGO.serveArgs, 'os 3 primeiros args têm que ser os de antes');
  assert.ok(s.serveArgs.includes('--host'), 'serveArgs precisa do --host explícito');
});

test('o host do contrato bate com o que o serveArgs manda o motor abrir', () => {
  const s = servico();
  assert.equal(s.host, '127.0.0.1');
  const i = s.serveArgs.indexOf('--host');
  assert.equal(s.serveArgs[i + 1], s.host, 'service.host e o --host do serveArgs divergiram');
});

test('o nexus.js deriva PORT e BASE do manifest, sem mudar de valor', () => {
  assert.equal(nexus.PORT, ANTIGO.porta);
  assert.equal(nexus.BASE, `http://127.0.0.1:${ANTIGO.porta}`);
});

test('a superfície exportada continua a mesma', () => {
  assert.deepEqual(Object.keys(nexus).sort(), [
    'BASE',
    'PORT',
    'getJSON',
    'graph',
    'isAvailable',
    'maybeStart',
    'status',
    'stop'
  ]);
});

test('serveArgs cita a mesma porta de service.porta', () => {
  // O contrato declara a porta em dois lugares. Se divergirem, o app escuta uma
  // e sobe o motor na outra — o badge fica âmbar sem ninguém entender por quê.
  const s = servico();
  assert.ok(
    s.serveArgs.includes(String(s.porta)),
    `service.serveArgs (${s.serveArgs.join(' ')}) não cita a porta ${s.porta}`
  );
});
