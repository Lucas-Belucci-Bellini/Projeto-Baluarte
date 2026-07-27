#!/usr/bin/env node
/**
 * Confere o portal Arsenal da wiki contra a base de armas e a calculadora.
 *
 *   node scripts/verificar-wiki-arsenal.mjs
 *
 * ## Por que existe
 *
 * O gerador (`scripts/arma3/gerar-base-armas.py`) valida as invariantes DENTRO
 * do dado: ausente é null, airFriction de balística é negativo, `type: 1` não
 * vira lançador. Mas ele não enxerga a wiki nem a página da calculadora — e o
 * defeito que motivou este script mora exatamente no vão entre os três:
 *
 *   o artigo da arma prometia "Abrir na tabela e na calculadora" e mandava
 *   `?arma=<id>`; se aquele id não fosse calculável, a calculadora caía em
 *   OUTRA arma, sem erro nenhum. Silencioso: a página abre, o número aparece,
 *   e é de outra arma.
 *
 * Nenhum teste de unidade pegaria isso, porque cada módulo está certo sozinho.
 * Foi assim que 16 links quebrados passaram — e, puxando o fio, apareceu o bug
 * de classificação que fazia 68 fuzis com lança-granadas virarem "lançador".
 *
 * ## O que checa
 *
 *   1. todo artigo do arsenal tem `?arma=` no link
 *   2. o id apontado EXISTE na base
 *   3. o rótulo do link só promete calculadora se a arma for calculável
 *   4. não há id de artigo duplicado
 *
 * Sai com código 1 se algo falhar, então serve em CI.
 */

import { A3ARM } from '../src/data/arma3-armas.js';
import { A3ACC } from '../src/data/arma3-acessorios.js';
import { A3TER } from '../src/data/arma3-terrenos.js';
import { WIKI_ARTIGOS } from '../src/data/wiki-arma3.js';
import { dadosBalisticos } from '../src/utils/arma3-balistica.js';

const porId = new Map(A3ARM.map((a) => [a.id, a]));
const artigos = WIKI_ARTIGOS.filter((a) => a.portal === 'arsenal');
const falhas = [];

if (!artigos.length) falhas.push('o portal "arsenal" não tem nenhum artigo');

const vistos = new Set();
for (const art of artigos) {
  if (vistos.has(art.id)) falhas.push(`id de artigo duplicado: ${art.id}`);
  vistos.add(art.id);

  const link = (art.links || [])[0];
  if (!link) { falhas.push(`${art.titulo}: sem link`); continue; }

  const m = /[?&]arma=([^&]+)/.exec(link.url || '');
  if (!m) { falhas.push(`${art.titulo}: link sem ?arma= — cai numa lista genérica`); continue; }

  const id = decodeURIComponent(m[1]);
  const arma = porId.get(id);
  if (!arma) { falhas.push(`${art.titulo}: aponta pra id inexistente "${id}"`); continue; }

  const calculavel = Boolean(dadosBalisticos(arma));
  const promete = /calculadora/i.test(link.rotulo || '');
  if (promete && !calculavel) {
    falhas.push(`${art.titulo}: promete calculadora, mas a arma não é calculável `
      + '(a calculadora cairia em outra arma, calada)');
  }
}

const calculaveis = artigos.filter((a) => {
  const m = /[?&]arma=([^&]+)/.exec((a.links[0] || {}).url || '');
  return m && dadosBalisticos(porId.get(decodeURIComponent(m[1])) || {});
}).length;

/* ── portal Miras & acessórios ──
 * O link manda `?aba=acessorios&q=<classe>`. Se a classe não existir na base,
 * a aba abre com a busca vazia de resultados — sem erro, e o leitor conclui
 * que o acessório sumiu. */
const classesAcc = new Set(A3ACC.map((c) => c.classe));
const artsOpt = WIKI_ARTIGOS.filter((a) => a.portal === 'optica');
if (!artsOpt.length) falhas.push('o portal "optica" não tem nenhum artigo');
for (const art of artsOpt) {
  const url = ((art.links || [])[0] || {}).url || '';
  const m = /[?&]q=([^&]+)/.exec(url);
  if (!/aba=acessorios/.test(url)) {
    falhas.push(`${art.titulo}: link não aponta pra aba=acessorios`);
    continue;
  }
  if (!m) { falhas.push(`${art.titulo}: link sem ?q= — cai na lista inteira`); continue; }
  const classe = decodeURIComponent(m[1]);
  if (!classesAcc.has(classe)) {
    falhas.push(`${art.titulo}: busca por "${classe}", que não está na base de acessórios`);
  }
}

/* ── portal Terrenos ──
 * O link promete "calcular azimute NESTE terreno" e manda `?terreno=<id>`.
 * O card do Vanguard só lista terreno COM grade; um id sem grade cairia no
 * padrão (Altis) calado — o leitor calcularia azimute do mapa errado. */
const terComGrade = new Set(A3TER.filter((t) => t.grade).map((t) => t.id));
const idsTer = new Set(A3TER.map((t) => t.id));
const artsTer = WIKI_ARTIGOS.filter((a) => a.portal === 'terrenos');
if (!artsTer.length) falhas.push('o portal "terrenos" não tem nenhum artigo');
for (const art of artsTer) {
  const url = ((art.links || [])[0] || {}).url || '';
  const m = /[?&]terreno=([^&]+)/.exec(url);
  if (!m) { falhas.push(`${art.titulo}: link sem ?terreno=`); continue; }
  const id = decodeURIComponent(m[1]);
  if (!idsTer.has(id)) {
    falhas.push(`${art.titulo}: aponta pro terreno inexistente "${id}"`);
  } else if (!terComGrade.has(id)) {
    falhas.push(`${art.titulo}: promete azimute, mas o terreno "${id}" não tem `
      + 'grade — o card cairia em OUTRO terreno, calado');
  }
}

/* Ids duplicados ENTRE portais: os três prefixam (ars-/opt-/ter-), mas uma
 * colisão levaria dois assuntos ao mesmo deep-link. */
const todosIds = WIKI_ARTIGOS.map((a) => a.id);
const dup = todosIds.length - new Set(todosIds).size;
if (dup) falhas.push(`${dup} id(s) de artigo duplicado(s) na wiki inteira`);

console.log(`artigos do arsenal: ${artigos.length}`);
console.log(`  com calculadora:  ${calculaveis}`);
console.log(`  só tabela:        ${artigos.length - calculaveis}`);
console.log(`artigos de óptica:  ${artsOpt.length}`);
console.log(`artigos de terreno: ${artsTer.length} (${terComGrade.size} com grade)`);

if (falhas.length) {
  console.error(`\n${falhas.length} problema(s):`);
  for (const f of falhas.slice(0, 25)) console.error('  -', f);
  process.exit(1);
}
console.log('\nok — todo artigo aponta pra uma arma que existe, e só promete o que entrega.');
