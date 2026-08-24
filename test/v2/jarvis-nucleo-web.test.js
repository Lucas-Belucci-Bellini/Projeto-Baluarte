/**
 * A rota /jarvis na web: só o Núcleo, e o Spotify num clique.
 *
 * Dois defeitos concretos motivaram estes testes:
 *
 *  1. o navegador recebia a superfície inteira do JARVIS (seis modos de IA,
 *     sessões, memória, skills, agente) empilhada embaixo do núcleo 3D, contra
 *     a regra "web leve / app completo" do #238;
 *  2. o botão "Conectar Spotify" respondia "peça ao administrador para
 *     concluir a configuração" — porque o Client ID público só existia se
 *     alguém tivesse publicado a variável de build.
 *
 * O que se cobra aqui é o contrário dos dois: a página web não importa nada do
 * motor de IA, e `getConfiguredSpotifyClientId()` responde sem depender de
 * ambiente nenhum.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  getConfiguredSpotifyClientId,
  isSpotifyClientId,
  SPOTIFY_PUBLIC_CLIENT_ID,
} from '../../src/utils/jarvis-spotify.ts';

const raiz = join(fileURLToPath(new URL('../..', import.meta.url)));
const ler = (...partes) => readFileSync(join(raiz, ...partes), 'utf8');

const nucleo = ler('src', 'pages', 'jarvis-nucleo.ts');
const completa = ler('src', 'pages', 'jarvis.ts');
const main = ler('src', 'main.js');
const estilos = ler('src', 'styles', 'fase19.css');

test('o Client ID público sai pronto no build — o clique não pede configuração', () => {
  assert.equal(isSpotifyClientId(SPOTIFY_PUBLIC_CLIENT_ID), true);
  assert.equal(getConfiguredSpotifyClientId(), SPOTIFY_PUBLIC_CLIENT_ID);
});

test('o Client ID embutido é identificador público, nunca segredo', () => {
  /* Client Secret e chave Soloist têm outra forma e outro lugar; se algum dia
   * um deles for colado aqui, o teste é quem avisa. */
  assert.equal(SPOTIFY_PUBLIC_CLIENT_ID.startsWith('spak_'), false);
  assert.match(SPOTIFY_PUBLIC_CLIENT_ID, /^[A-Za-z0-9_-]{20,128}$/);
  assert.doesNotMatch(nucleo, /client_secret|clientSecret/i);
});

test('a rota /jarvis carrega o Núcleo na web e o JARVIS completo no app', () => {
  assert.match(main, /router\.register\('\/jarvis', \(args\) => \(isNative\(\)/);
  assert.match(main, /import\('\.\/pages\/jarvis\.ts'\)\.then\(\(m\) => m\.jarvisPage\(args\)\)/);
  assert.match(main, /import\('\.\/pages\/jarvis-nucleo\.ts'\)\.then\(\(m\) => m\.jarvisNucleoPage\(args\)\)/);
});

test('a página web do Núcleo não arrasta nada do motor de IA', () => {
  const pesados = [
    'jarvis-engine', 'jarvis-memory', 'jarvis-webllm', 'jarvis-brain',
    'jarvis-tools', 'jarvis-skills', 'jarvis-recall', 'jarvis-agent-core',
    'jarvis-hermes-agent', 'hermes-local', 'jarvis-context',
  ];
  for (const modulo of pesados) {
    assert.doesNotMatch(nucleo, new RegExp(`from '[^']*${modulo}`), `a web não deve importar ${modulo}`);
  }
  assert.doesNotMatch(nucleo, /jarvis-input|jarvis-messages|createSession|handleSend/);
});

test('a página web monta o Núcleo V7 com as funções dele no canto', () => {
  assert.match(nucleo, /createJarvisV7Visual/);
  assert.match(nucleo, /export function jarvisNucleoPage\(\): HTMLDivElement/);
  assert.match(nucleo, /className: 'page-nucleo'/);
  assert.match(estilos, /\.page-nucleo\b/);
  /* Sair da rota desmonta o iframe: WebGL não fica rodando atrás de outra tela. */
  assert.match(nucleo, /bus\.on<\{ path\?: string \}>\('route:change'/);
  assert.match(nucleo, /visual\?\.dispose\(\)/);
});

test('a doca da web conecta o Spotify num clique e mostra só metadados', () => {
  assert.match(nucleo, /jv-nucleo-dock/);
  assert.match(estilos, /\.jv-nucleo-dock\b/);
  assert.match(nucleo, /onclick: conectarSpotify/);
  assert.match(nucleo, /beginSpotifyAuthorization\(\{ clientId, redirectUri, returnTo, scope: SPOTIFY_SCOPE \}\)/);
  assert.match(nucleo, /const SPOTIFY_SCOPE = 'user-read-playback-state'/);
  /* Presença musical é leitura: nada de comando de reprodução na doca. */
  assert.doesNotMatch(nucleo, /\/me\/player\/(play|pause|next|previous)/);
});

test('a página completa esconde o campo técnico quando o build já traz o Client ID', () => {
  assert.match(completa, /!configuredSpotifyClientId && spotifyClientRow/);
  assert.match(completa, /const clientId = \(configuredSpotifyClientId \|\| spotifyClientInput\.value\)\.trim\(\)/);
  assert.doesNotMatch(completa, /Peça ao administrador para concluir a configuração/);
});
