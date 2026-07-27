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

console.log(`artigos do arsenal: ${artigos.length}`);
console.log(`  com calculadora:  ${calculaveis}`);
console.log(`  só tabela:        ${artigos.length - calculaveis}`);

if (falhas.length) {
  console.error(`\n${falhas.length} problema(s):`);
  for (const f of falhas.slice(0, 25)) console.error('  -', f);
  process.exit(1);
}
console.log('\nok — todo artigo aponta pra uma arma que existe, e só promete o que entrega.');
