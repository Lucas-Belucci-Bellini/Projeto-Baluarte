/**
 * A conversa e o config passam a viver POR CIMA do Núcleo, abertas por ele.
 *
 * A queixa: *"tem como deixar essa parte de forma que ela fique dentro e seja
 * ativável pelos botões do jarvis […] mas sem descer criar mais página para
 * baixo como está agora"*.
 *
 * Antes, a rota `/jarvis` no app empilhava o Núcleo V7, depois a barra de
 * estado, depois a conversa — e a página crescia até o 3D virar cabeçalho de
 * outra coisa. Agora o Núcleo ocupa a área de conteúdo e as duas superfícies
 * flutuam sobre ele, uma de cada vez.
 *
 * A parte que não é óbvia: **o Núcleo não abre nada.** Ele vive num `<iframe>` e
 * não sabe o que é uma sessão de chat. Os botões só existem se a página que o
 * embute disser que tem essas superfícies (o app tem; a web, não), e premi-los
 * apenas avisa o pai. É isso que permite os botões estarem lá dentro sem o
 * artefato 3D ganhar dependência nenhuma.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { comLF } from '../../scripts/lib/eol.mjs';

const raiz = join(fileURLToPath(new URL('../..', import.meta.url)));
const ler = (...partes) => readFileSync(join(raiz, ...partes), 'utf8');

const nucleoV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.ts');
const artefatoV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.js');
const htmlV7 = ler('project V2', 'Modelar objeto 3D', 'jarvis-nucleo-v7.html');
const visual = ler('src', 'utils', 'jarvis-v7-visual.ts');
const paginaApp = ler('src', 'pages', 'jarvis.ts');
const paginaWeb = ler('src', 'pages', 'jarvis-nucleo.ts');
/* comLF: checkout Windows grava .css em CRLF (sem .gitattributes pro .css) e a
 * asserção abaixo casa `\{\n\s+flex` de forma literal — só a comparação muda,
 * ver scripts/lib/eol.mjs. */
const estilos = comLF(ler('src', 'styles', 'fase19.css'));

test('os botões de superfície nascem escondidos no HUD', () => {
  /* A web embute o mesmo artefato e não tem conversa nenhuma. Se nascessem
   * visíveis, o navegador ganharia dois botões que não fazem nada. */
  assert.match(htmlV7, /<button id="bChat" aria-pressed="false" hidden>/);
  assert.match(htmlV7, /<button id="bConfig" aria-pressed="false" hidden>/);
  assert.match(htmlV7, /<div class="sep" id="sepSurfaces" hidden><\/div>/);
});

test('só aparecem quando o pai declara que tem a superfície', () => {
  const trecho = nucleoV7.slice(nucleoV7.indexOf('function ouvirSuperficies'));
  assert.match(trecho, /registo\.source === 'baluarte-superficies'/);
  assert.match(trecho, /botao\.hidden = !oferece\(qual\)/);
  /* E o app é quem declara — a web não chama isto em lugar nenhum. */
  assert.match(paginaApp, /publicarSuperficies\(\{ conversa: true, config: true \}\)/);
  assert.doesNotMatch(paginaWeb, /publicarSuperficies/);
});

test('o Núcleo só avisa: quem abre a conversa é quem a tem', () => {
  const trecho = nucleoV7.slice(nucleoV7.indexOf('function pedirSuperficie'), nucleoV7.indexOf('function ouvirSuperficies'));
  assert.match(trecho, /source: 'baluarte-nucleo-acao'/);
  assert.match(trecho, /\}, location\.origin\)/);
  /* Nenhum vestígio de chat dentro do artefato 3D. */
  assert.doesNotMatch(nucleoV7, /jarvis-chat|jv-sessions|renderConfigPanel/);
});

test('a ponte de superfícies valida origem e remetente como a da presença', () => {
  const trecho = nucleoV7.slice(nucleoV7.indexOf('function ouvirSuperficies'));
  assert.match(trecho, /event\.origin !== location\.origin \|\| event\.source !== window\.parent/);
});

test('o pai reenvia oferta e estado quando o quadro recarrega', () => {
  /* Sem isto, um reload do iframe deixaria os botões escondidos com a conversa
   * aberta atrás deles. */
  assert.match(visual, /const onLoad = \(\): void => \{ setState\('ready'\); enviarPresenca\(\); enviarSuperficies\(\); \}/);
  assert.match(visual, /source: 'baluarte-superficies'/);
  assert.match(visual, /source: 'baluarte-superficie-estado'/);
});

test('o app monta o palco com as superfícies como camadas, não como páginas', () => {
  assert.match(paginaApp, /className: 'page-jarvis page-jarvis--palco'/);
  assert.match(paginaApp, /const palco = h\('div', \{ className: 'jv-palco' \}, jarvisV7Visual\.root\)/);
  assert.match(paginaApp, /className: 'jv-camada' \}, painelConversa, painelConfig/);
  /* O que provava o defeito: a conversa era o último filho da PÁGINA. */
  assert.doesNotMatch(paginaApp, /fullPage\.appendChild\(\s*h\('div', \{ className: 'jv-layout' \}/);
});

test('premir o botão aceso fecha, e o Esc também', () => {
  assert.match(paginaApp, /superficieAberta = superficieAberta === qual \? null : qual/);
  assert.match(paginaApp, /e\.key === 'Escape' && superficieAberta/);
  /* O botão do HUD acende junto: sem devolver o estado, o clique parece inerte. */
  assert.match(paginaApp, /publicarSuperficieAberta\(superficieAberta\)/);
});

test('o ouvinte do Esc é solto ao sair da rota', () => {
  /* É do documento: deixá-lo vivo faria uma rota futura mexer em painéis mortos. */
  assert.match(paginaApp, /markXiiiEscOff = \(\) => document\.removeEventListener\('keydown', aoTeclar\)/);
  assert.match(paginaApp, /markXiiiEscOff\?\.\(\);/);
});

test('existe saída quando o Núcleo não sobe', () => {
  /* Os botões moram DENTRO do V7. Se ele falhar, o app ficaria sem chat e sem
   * aviso — a tira de socorro existe só para esse caso, e some quando ele sobe. */
  assert.match(paginaApp, /socorro\.hidden = state !== 'fallback'/);
  assert.match(paginaApp, /jv-palco__socorro-botao/);
  assert.match(estilos, /\.jv-palco__socorro\b/);
});

test('a altura do palco é medida, não calculada', () => {
  /* `calc(100vh - …)` errou por 39 px em navegador — o bastante para a página
   * ganhar a barra de rolagem que o palco existe para não ter. */
  assert.match(visual, /export function ocuparAlturaRestante/);
  assert.match(visual, /elemento\.style\.setProperty\('--palco-altura'/);
  for (const [nome, fonte] of [['app', paginaApp], ['web', paginaWeb]]) {
    assert.match(fonte, /ocuparAlturaRestante\(/, `a página do ${nome} não mede`);
  }
  /* E solta os ouvintes ao sair — resize e ResizeObserver sobrevivem à rota. */
  assert.match(paginaApp, /markXiiiPalcoOff\?\.\(\);/);
  assert.match(paginaWeb, /soltarAltura\(\);/);
});

test('o palco não estica além do que foi medido', () => {
  assert.match(estilos, /\.page-jarvis--palco \{ min-height: 0; \}/);
  assert.match(estilos, /\.page-jarvis \.jv-palco \{\n\s+flex: none;\n\s+height: var\(--palco-altura\);/);
});

test('o artefato .js de referência acompanha o .ts canônico', () => {
  for (const marca of ['pedirSuperficie', 'ouvirSuperficies', 'baluarte-nucleo-acao', 'sepSurfaces']) {
    assert.match(artefatoV7, new RegExp(marca), `o artefato .js não tem ${marca}`);
  }
});
