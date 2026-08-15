#!/usr/bin/env node
/**
 * O `.gitattributes` acompanha os geradores?
 *
 *   node scripts/verificar-gerados.mjs
 *
 * ## Por que existe
 *
 * `linguist-generated=true` é o que impede o GitHub de contar 2,2 MB de tabela
 * despejada do Arma 3 como "JavaScript escrito à mão" — hoje 45,7% do JS de
 * `src/`. É uma lista de caminhos, e lista de caminhos apodrece: um gerador
 * novo entra, ninguém lembra do `.gitattributes`, e a barra de linguagens volta
 * a mentir. Calada, porque nada quebra.
 *
 * O modo de falha é o de sempre neste repositório: número plausível e errado.
 *
 * ## O que checa
 *
 *   1. todo arquivo que um gerador DECLARA escrever está marcado
 *   2. todo caminho marcado EXISTE (senão a linha é lixo que engana quem lê)
 *   3. nada marcado é escrito à mão — a heurística inversa, para o dia em que
 *      alguém marcar demais e esconder trabalho de verdade da contagem
 *
 * Sai com 1 se algo falhar, então serve em CI.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const falhas = [];

/* ── 1. o que o .gitattributes declara ───────────────────────────────────── */
const attrPath = join(RAIZ, '.gitattributes');
if (!existsSync(attrPath)) {
  console.error('falta .gitattributes — sem ele o Linguist conta dado gerado como código');
  process.exit(1);
}
const marcados = new Set(
  readFileSync(attrPath, 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#') && /linguist-generated\s*=\s*true/.test(l))
    .map((l) => l.trim().split(/\s+/)[0])
);

/* ── 2. o que os geradores dizem escrever ────────────────────────────────── */
/* Lê os scripts em vez de repetir a lista: repetir criaria uma terceira cópia
 * da mesma verdade, e a divergência entre elas seria invisível. */
function scriptsDe(dir) {
  const saida = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) saida.push(...scriptsDe(p));
    else if (/\.(mjs|py)$/.test(e.name)) saida.push(p);
  }
  return saida;
}

const declarados = new Set();
for (const s of scriptsDe(join(RAIZ, 'scripts'))) {
  const txt = readFileSync(s, 'utf8');
  for (const m of txt.matchAll(/['"]((?:src|public)\/[\w./-]+\.(?:js|mjs|json))['"]/g)) {
    declarados.add(m[1]);
  }
  /* O gerador Python monta o caminho por partes: join(RAIZ,'src','data','x.js') */
  for (const m of txt.matchAll(/'(src|public)',\s*'([\w-]+)',\s*'([\w.-]+)'/g)) {
    declarados.add(`${m[1]}/${m[2]}/${m[3]}`);
  }
}

/* Um script CITAR um caminho não prova que o ESCREVE — `src/main.js` aparece
 * porque um script o lê. O segundo sinal desempata: o arquivo gerado se
 * declara no cabeçalho. Só cobramos marcação quando os DOIS concordam, que é
 * a mesma regra usada para montar a lista à mão. */
/* O marcador tem de ABRIR uma linha do cabeçalho.
 *
 * Procurar "gerado" em qualquer posição não distingue "este arquivo é gerado"
 * de "este arquivo LÊ um arquivo gerado" — e a diferença é grande: o
 * `src/pages/codigo.js` é escrito à mão e sua terceira linha diz
 * "Lê src/data/codemap.json (gerado por scripts/gen-codemap.mjs)". Marcá-lo
 * esconderia trabalho de verdade da contagem de linguagens, que é o erro
 * oposto ao que este script existe para pegar — e o mais difícil de notar,
 * porque some um número em vez de inflar.
 *
 * Quem É gerado abre a linha com o aviso (`/* GERADO por …`, ` * Gerado por …`);
 * quem só menciona traz o marcador no meio da frase. JSON não tem comentário,
 * então declara em `"geradoEm"`. */
function autodeclara(rel) {
  const p = join(RAIZ, rel);
  if (!existsSync(p) || statSync(p).isDirectory()) return false;
  const cab = readFileSync(p, 'utf8').slice(0, 600).toLowerCase();

  /* JSON não tem comentário; declara no próprio dado. */
  if (/"geradoem"/.test(cab)) return true;

  const marca = /(gerado|@generated)\b/.test(cab);
  if (!marca) return false;

  /* Marcador ABRINDO a linha já basta: quem só menciona traz no meio da frase.
   * Mas a frase pode ter quebrado antes dele — `arma3-colecao.js` escreve
   * "Catálogo COMPLETO … — GERADO por gerar-colecao.mjs". Aí vale o segundo
   * sinal: a ORDEM DE NÃO EDITAR. Ninguém escreve "não editar à mão" a
   * respeito do arquivo do vizinho; é sempre sobre este. */
  return /^[\s/*#]*(gerado|@generated)\b/m.test(cab)
    || /n[ãa]o (editar|edite|mexa|altere)/.test(cab);
}

for (const rel of [...declarados].sort()) {
  if (!existsSync(join(RAIZ, rel))) continue;
  if (!autodeclara(rel)) continue;                  // só cita, não gera
  if (!marcados.has(rel)) {
    falhas.push(`${rel}: um gerador escreve e o cabeçalho confirma, mas o `
      + '.gitattributes não marca — o Linguist vai contar como código escrito');
  }
}

/* ── 3. caminho marcado que não existe ───────────────────────────────────── */
for (const rel of marcados) {
  if (!existsSync(join(RAIZ, rel))) {
    falhas.push(`${rel}: marcado no .gitattributes e não existe — `
      + 'linha morta que faz a lista parecer mais completa do que é');
  }
}

/* ── 4. marcação a mais: escondeu trabalho escrito à mão ─────────────────── */
for (const rel of marcados) {
  if (!existsSync(join(RAIZ, rel))) continue;
  if (!autodeclara(rel) && !declarados.has(rel)) {
    falhas.push(`${rel}: marcado como gerado, mas nenhum gerador o declara e o `
      + 'cabeçalho não diz que é gerado — isso ESCONDE trabalho da contagem');
  }
}

console.log(`caminhos marcados como gerados: ${marcados.size}`);
console.log(`saídas de gerador confirmadas:  ${[...declarados].filter(autodeclara).length}`);

if (falhas.length) {
  console.error(`\n${falhas.length} divergência(s):`);
  for (const f of falhas.slice(0, 20)) console.error('  -', f);
  process.exit(1);
}
console.log('\nok — o .gitattributes acompanha os geradores nos dois sentidos.');
