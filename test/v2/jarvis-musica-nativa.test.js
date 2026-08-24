/**
 * Saber o que toca SEM depender do Spotify.
 *
 * A queixa que originou isto: *"por algum motivo mesmo eu sendo redirecionado eu
 * não consigo conectar ao spotify"* — e, logo a seguir, *"acho que criar algo
 * que faça isso funcionar seria legal"*.
 *
 * O handshake do Spotify está correto (foi exercitado ponta a ponta em
 * navegador). O que trava não é código: é configuração de terceiro — conta, app
 * registado, e a conta do operador listada em User Management enquanto o app
 * estiver em Development mode. Nenhuma linha deste repositório resolve isso.
 *
 * Então o caminho que funciona é outro: o Windows já sabe o que está tocando. O
 * SMTC alimenta o cartão de mídia do sistema com o que QUALQUER aplicação toca —
 * Spotify de desktop, Spotify no navegador, YouTube, VLC — e ler dali não pede
 * conta nenhuma.
 *
 * O que se cobra aqui é o que se consegue verificar fora do Windows: a forma do
 * script que fala com o WinRT, a normalização do que atravessa a ponte, e o
 * poller. A leitura real exige o WinRT e está registada como não verificada.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require_ = createRequire(import.meta.url);
const musicaNativa = require_('../../desktop/src/musica.js');
const web = await import('../../src/utils/jarvis-musica-nativa.ts');

/* ── a sonda nativa ─────────────────────────────────────────────────────── */

test('a sonda degrada fora do Windows em vez de estourar', async () => {
  /* Este teste corre no Linux do CI. Se a sonda lançasse aqui, o app inteiro
   * ficaria refém de um recurso que é, por desenho, só de uma plataforma. */
  const resultado = await musicaNativa.agora();
  assert.equal(resultado.disponivel, false);
  assert.match(resultado.motivo, /Windows/);
  assert.equal(resultado.playback, 'idle');
  assert.equal(resultado.titulo, null);
});

test('o diagnóstico diz em que plataforma correu, sem inventar saída', async () => {
  const d = await musicaNativa.diagnostico();
  assert.equal(d.plataforma, process.platform);
  assert.equal(d.suportado, process.platform === 'win32');
});

test('o script do WinRT sobrevive à codificação, e chega inteiro', () => {
  /* `-EncodedCommand` leva UTF-16LE em base64 justamente para não haver nada a
   * escapar entre JS e PowerShell — a fonte clássica de um script que funciona
   * no terminal e quebra empacotado. Se a ida e volta não for idêntica, o que
   * chega ao Windows não é o que está escrito aqui. */
  const ps = Buffer.from(musicaNativa.comandoCodificado(), 'base64').toString('utf16le');
  assert.match(ps, /GlobalSystemMediaTransportControlsSessionManager/);
  assert.match(ps, /RequestAsync/);
  assert.match(ps, /TryGetMediaPropertiesAsync/);
  /* Sem o `Await` por reflexão, o PowerShell não sabe esperar um
   * `IAsyncOperation` e o script devolve o objeto da promessa, não a faixa. */
  assert.match(ps, /AsTask/);
  /* O nome do tipo genérico termina em crase-1 e tem de chegar LITERAL: dentro
   * de aspas simples, onde a crase do PowerShell não escapa nada. */
  assert.ok(ps.includes(`'IAsyncOperation${String.fromCharCode(96)}1'`), 'o nome do tipo genérico foi corrompido');
  /* Playing = 4 e Paused = 5 no enum do SMTC. Trocar isto faz o Núcleo dizer
   * que está pausado com a música tocando. */
  assert.match(ps, /4 \{ 'playing' \}/);
  assert.match(ps, /5 \{ 'paused' \}/);
  /* Falhar em JSON e não em exceção solta é o que deixa distinguir "não há
   * sessão" de "este Windows não expõe o SMTC". */
  assert.match(ps, /ConvertTo-Json/);
  assert.match(ps, /catch \{[\s\S]*ok = \$false/);
});

/* ── a travessia da ponte ───────────────────────────────────────────────── */

test('o que vem do processo principal é tratado como desconhecido', () => {
  /* O outro lado da ponte é outro programa. Confiar na forma do que ele mandou
   * é a mesma classe de erro que confiar num JSON de rede. */
  for (const lixo of [null, undefined, 'texto', 42, [], { disponivel: 'sim' }]) {
    assert.equal(web.lerMusicaNativa(lixo).disponivel, false);
  }
});

test('um playback que não existe vira "unknown", não passa cru', () => {
  const r = web.lerMusicaNativa({ disponivel: true, playback: 'dançando', titulo: 'X' });
  assert.equal(r.playback, 'unknown');
  assert.equal(r.titulo, 'X');
});

test('o motivo da indisponibilidade sobrevive à travessia', () => {
  const r = web.lerMusicaNativa({ disponivel: false, motivo: 'o Windows recusou a leitura' });
  assert.equal(r.disponivel, false);
  assert.equal(r.motivo, 'o Windows recusou a leitura');
});

test('título e artista em branco viram null, não string vazia', () => {
  const r = web.lerMusicaNativa({ disponivel: true, playback: 'playing', titulo: '   ', artista: '' });
  assert.equal(r.titulo, null);
  assert.equal(r.artista, null);
});

/* ── o poller ───────────────────────────────────────────────────────────── */

test('o monitor avisa só quando MUDA', async () => {
  /* Quem ouve repinta a interface e reenvia a presença para dentro do quadro do
   * V7. Emitir a cada ciclo faria o mesmo trabalho cinco vezes por minuto sem
   * nada de novo para dizer. */
  const vistos = [];
  let faixa = 'Primeira';
  const monitor = web.createMusicaNativaMonitor({
    intervaloMs: 1000,
    ler: async () => ({ disponivel: true, motivo: null, playback: 'playing', titulo: faixa, artista: 'A', app: null }),
    onChange: (a) => vistos.push(a.titulo),
  });
  monitor.start();
  await new Promise((r) => setTimeout(r, 30));
  assert.deepEqual(vistos, ['Primeira']);

  faixa = 'Segunda';
  await new Promise((r) => setTimeout(r, 1200));
  monitor.stop();
  assert.deepEqual(vistos, ['Primeira', 'Segunda']);
});

test('parar o monitor cala-o de vez', async () => {
  let leituras = 0;
  const monitor = web.createMusicaNativaMonitor({
    intervaloMs: 1000,
    ler: async () => { leituras += 1; return { disponivel: true, motivo: null, playback: 'playing', titulo: `t${leituras}`, artista: null, app: null }; },
    onChange: () => {},
  });
  monitor.start();
  await new Promise((r) => setTimeout(r, 30));
  monitor.stop();
  const congelado = leituras;
  await new Promise((r) => setTimeout(r, 1300));
  assert.equal(leituras, congelado, 'o monitor continuou a spawnar depois do stop()');
});

test('o ciclo não se sobrepõe a si mesmo quando a sonda é lenta', async () => {
  /* Com `setInterval`, uma sonda que demora mais que o intervalo acumularia
   * chamadas até o PowerShell disputar consigo próprio. */
  let emVoo = 0;
  let maximo = 0;
  const monitor = web.createMusicaNativaMonitor({
    intervaloMs: 1000,
    ler: async () => {
      emVoo += 1; maximo = Math.max(maximo, emVoo);
      await new Promise((r) => setTimeout(r, 60));
      emVoo -= 1;
      return { disponivel: true, motivo: null, playback: 'playing', titulo: 'x', artista: null, app: null };
    },
    onChange: () => {},
  });
  monitor.start();
  await new Promise((r) => setTimeout(r, 300));
  monitor.stop();
  assert.equal(maximo, 1, 'houve mais de uma leitura em voo ao mesmo tempo');
});

test('sem a ponte, a resposta diz onde a capacidade mora', async () => {
  assert.equal(web.musicaNativaDisponivel(), false);
  const r = await web.musicaNativaAgora();
  assert.equal(r.disponivel, false);
  assert.match(r.motivo, /app|Launcher/i);
});
