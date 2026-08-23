/**
 * O Núcleo passa a saber o que está tocando — e a poder acompanhar.
 *
 * A queixa que originou isto: *"a função música não reconhece a música que tá
 * tocando no spotify, como resultado o espectrômetro não acompanha a música"*.
 * Duas causas independentes, e as duas são cobradas aqui.
 *
 *  1. **O Núcleo não sabia.** O V7 vive num `<iframe>` e não fala com o
 *     Spotify: quem tem a sessão é a página que o embute. O botão `♪ música`
 *     respondia "partitura generativa" com a faixa tocando na cara do operador.
 *     Agora o pai publica os metadados no quadro, e o botão diz o nome da faixa.
 *
 *  2. **O Núcleo não podia acompanhar.** A Web API do Spotify entrega metadados,
 *     não som, e a política dela proíbe sincronizar conteúdo; nem o Web Playback
 *     SDK salva, porque o áudio dele passa por EME/DRM e um
 *     `createMediaElementSource` sobre ele devolve silêncio. Não existe caminho,
 *     dentro da página, que analise a forma de onda do Spotify. Existe um que
 *     analisa o som REAL: `getDisplayMedia` com áudio de aba ou de sistema.
 *
 * Por isso o que se cobra abaixo não é "o espectrómetro segue o Spotify" — é que
 * a única fonte capaz disso exista, esteja ligada aos dois botões, e que a ponte
 * de metadados não deixe passar nada além de metadado.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(fileURLToPath(new URL('../..', import.meta.url)));
const ler = (...partes) => readFileSync(join(raiz, ...partes), 'utf8');

const nucleoV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.ts');
const artefatoV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.js');
const htmlV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.html');
const visual = ler('src', 'utils', 'jarvis-v7-visual.ts');
const paginaWeb = ler('src', 'pages', 'jarvis-nucleo.ts');
const paginaApp = ler('src', 'pages', 'jarvis.ts');

test('existe uma fonte que capta o som real do sistema ou da aba', () => {
  assert.match(nucleoV7, /async captureSystem\(\): Promise<boolean>/);
  assert.match(nucleoV7, /getDisplayMedia\(\{/);
  assert.match(nucleoV7, /audio: \{ echoCancellation: false, noiseSuppression: false, autoGainControl: false \}/);
  assert.match(nucleoV7, /type AudioMode = 'off' \| 'gen' \| 'file' \| 'mic' \| 'sistema'/);
});

test('o som capturado alimenta só o analisador — não volta para as colunas', () => {
  /* Ligar a captura ao `master` devolveria a música ao operador com atraso, por
   * cima do que ele já está a ouvir. O microfone já seguia esta regra. */
  const trecho = nucleoV7.slice(nucleoV7.indexOf('async captureSystem'), nucleoV7.indexOf('async useMic'));
  assert.match(trecho, /this\.micSrc\.connect\(this\.analyser!\)/);
  assert.doesNotMatch(trecho, /connect\(this\.master/);
  assert.doesNotMatch(trecho, /connect\(this\.musicBus/);
});

test('a captura pede vídeo porque o Chrome exige, e desliga-o em seguida', () => {
  /* Não há áudio de aba sem pedir vídeo junto. Ficar com a imagem seria recolher
   * mais do que o núcleo precisa, então a faixa de vídeo morre na entrada. */
  assert.match(nucleoV7, /stream\.getVideoTracks\(\)\.forEach\(t => t\.stop\(\)\)/);
});

test('cada modo de falha da partilha diz o que fazer a seguir', () => {
  for (const causa of ['SEM_AUDIO', 'SEM_CAPTURA', 'RECUSADO']) {
    assert.match(nucleoV7, new RegExp(causa), `falta a causa ${causa}`);
  }
  assert.match(nucleoV7, /escolha uma ABA e marque "partilhar áudio"/);
  assert.match(nucleoV7, /este navegador não partilha áudio/);
  assert.match(nucleoV7, /partilha cancelada/);
});

test('parar a partilha pelo banner do navegador não reentra em silence()', () => {
  /* `stop()` não dispara `ended` pela especificação — mas um motor que
   * disparasse faria `silence()` chamar `detach()` sem fim. O aviso é solto
   * antes de parar. */
  assert.match(nucleoV7, /t\.onended = null; t\.stop\(\)/);
});

test('o HUD ganhou o botão e o atalho da captura, e o de música tem nome próprio', () => {
  assert.match(htmlV7, /<button id="bSystem"/);
  assert.match(htmlV7, /<span id="musicName">♪ música<\/span>/);
  assert.match(nucleoV7, /getElementById\('bSystem'\)!\.onclick/);
  assert.match(nucleoV7, /k === 'a'\) \(document\.getElementById\('bSystem'\)/);
  assert.match(nucleoV7, /set\('bSystem', audio\.mode === 'sistema'\)/);
});

test('com o Spotify tocando, "música" deixa de inventar uma e vai atrás desta', () => {
  const trecho = nucleoV7.slice(nucleoV7.indexOf("getElementById('bMusic')!.onclick"));
  assert.match(trecho, /if \(presenca\.tocando\) \{ capturarSistema\(rotuloDaFaixa\(\)\); return; \}/);
  /* Sem Spotify tocando, o comportamento antigo continua inteiro. */
  assert.match(trecho, /const on = audio\.toggleGenerative\(\)/);
});

test('a ponte de presença só aceita mensagem do pai, da mesma origem, com a etiqueta certa', () => {
  const trecho = nucleoV7.slice(nucleoV7.indexOf('function ouvirPresencaMusical'));
  assert.match(trecho, /event\.origin !== location\.origin \|\| event\.source !== window\.parent/);
  assert.match(trecho, /registo\.source !== 'baluarte-presenca-musical'/);
});

test('a ponte é ligada antes da cena — o botão diz a verdade mesmo sem three.js', () => {
  /* `init()` só roda quando o three.js chega. Se a ponte morasse lá dentro, uma
   * CDN fora do ar levaria junto a capacidade de dizer o nome da faixa — que não
   * depende de 3D nenhum. A chamada tem de estar no topo do módulo: sem
   * indentação, fora de qualquer função. */
  assert.match(nucleoV7, /^ouvirPresencaMusical\(\);$/m);
  assert.match(nucleoV7, /^pintarBotaoMusica\(\);$/m);
  assert.doesNotMatch(nucleoV7, /^\s+ouvirPresencaMusical\(\);/m);
  assert.ok(
    nucleoV7.search(/^ouvirPresencaMusical\(\);$/m) > nucleoV7.indexOf('function init(): void'),
    'a chamada vem depois da definição de init(), no arranque do módulo',
  );
});

test('só metadado atravessa para dentro do quadro — nunca token', () => {
  const trecho = visual.slice(visual.indexOf('const enviarPresenca'), visual.indexOf('const onLoad'));
  assert.match(trecho, /source: 'baluarte-presenca-musical'/);
  assert.match(trecho, /tocando: presencaAtual\.tocando/);
  assert.match(trecho, /titulo: presencaAtual\.titulo/);
  assert.match(trecho, /artista: presencaAtual\.artista/);
  assert.doesNotMatch(trecho, /token|accessToken|refresh|clientId|secret/i);
  /* `targetOrigin` fechado: nada de '*'. */
  assert.match(trecho, /\}, currentOrigin\(\)\)/);
});

test('o estado é reenviado quando o quadro termina de carregar', () => {
  /* Uma faixa que já tocava antes do `load` nunca chegaria lá sem isto. */
  assert.match(visual, /const onLoad = \(\): void => \{ setState\('ready'\); enviarPresenca\(\); \}/);
});

test('o quadro declara as permissões de que a captura depende', () => {
  assert.match(visual, /allow: 'microphone; display-capture'/);
});

test('as duas superfícies publicam a presença — a web e o app', () => {
  for (const [nome, fonte] of [['web', paginaWeb], ['app', paginaApp]]) {
    assert.match(fonte, /publicarPresencaMusical\(\{/, `a página do ${nome} não publica`);
    assert.match(fonte, /tocando: detail\.connected === true && detail\.playback === 'playing'/);
  }
});

test('o artefato .js de referência acompanha o .ts canônico', () => {
  for (const marca of ['captureSystem', 'baluarte-presenca-musical', 'pintarBotaoMusica', 'capturarSistema']) {
    assert.match(artefatoV7, new RegExp(marca), `o artefato .js não tem ${marca}`);
  }
});
