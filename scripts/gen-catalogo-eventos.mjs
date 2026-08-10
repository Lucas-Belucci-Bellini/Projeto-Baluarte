/**
 * Catálogo de eventos do bus — GERADO do código (#420, item 8).
 *
 * O item 4 do #420 pedia o event bus como "sistema nervoso" do Baluarte, e ele
 * virou isso: `bus.on('*')` e `bus.on('arsenal:*')` funcionam. Mas um sistema
 * nervoso é inútil se ninguém sabe quais nervos existem — e a pergunta que o
 * item 8 manda cada documento responder é "se eu mexer aqui, o que quebro?".
 * Para um evento, a resposta é *quem escuta*, e isso não está escrito em lugar
 * nenhum: está espalhado por 11 arquivos.
 *
 * Escrever esse catálogo à mão seria promessa em dois lugares, e promessa em
 * dois lugares diverge — é o mesmo raciocínio da tabela de estabilidade do
 * README, que também é gerada e cobrada pelo CI. Alguém renomeia um evento,
 * esquece o documento, e o documento passa a mentir com cara de verdade.
 *
 * ── Por que tirar comentário antes de varrer ────────────────────────────────
 * O próprio `core/events.js` traz, no JSDoc, três exemplos de uso:
 *
 *     bus.on('route:change', handler);
 *     bus.on('*', ...);
 *     bus.on('arsenal:*', ...);
 *
 * Sem remover comentários, `arsenal:*` entraria no catálogo como ouvinte real —
 * e não existe um só emissor `arsenal:` no código. O catálogo nasceria mentindo
 * justamente sobre o exemplo que o #420 usa para explicar a ideia.
 *
 * Rodar:  npm run gen-catalogo-eventos
 *         npm run gen-catalogo-eventos -- --verificar   (CI: falha se divergir)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

import { semComentarios } from './lib/sem-comentarios.mjs';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(raiz, 'src');
const DESTINO = join(raiz, 'docs/architecture/events.md');

function arquivosJS(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...arquivosJS(p));
    else if (nome.endsWith('.js')) out.push(p);
  }
  return out.sort();
}

/* ── Varredura ─────────────────────────────────────────────────────────────── */

const eventos = new Map();   // nome → { emite: Set<arquivo>, escuta: Set<arquivo> }
const registro = (nome) => {
  if (!eventos.has(nome)) eventos.set(nome, { emite: new Set(), escuta: new Set() });
  return eventos.get(nome);
};

const PADRAO = /bus\s*\.\s*(emit|on)\s*\(\s*(['"])([^'"]+)\2/g;

for (const arquivo of arquivosJS(SRC)) {
  const rel = relative(raiz, arquivo);
  const codigo = semComentarios(readFileSync(arquivo, 'utf8'));
  for (const m of codigo.matchAll(PADRAO)) {
    const [, metodo, , nome] = m;
    registro(nome)[metodo === 'emit' ? 'emite' : 'escuta'].add(rel);
  }
}

/* Um curinga não é um evento: é uma assinatura que casa com vários. Sai da
 * tabela de eventos e vira nota, senão `*` apareceria como "evento que ninguém
 * emite" — verdade inútil que polui o catálogo. */
const curingas = [...eventos.keys()].filter((n) => n.includes('*')).sort();
for (const c of curingas) eventos.delete(c);

const nomes = [...eventos.keys()].sort();
const espaco = (n) => (n.includes(':') ? n.split(':')[0] : '(sem prefixo)');
const namespaces = [...new Set(nomes.map(espaco))].sort();

const orfaos = nomes.filter((n) => eventos.get(n).emite.size && !eventos.get(n).escuta.size);
const fantasmas = nomes.filter((n) => !eventos.get(n).emite.size && eventos.get(n).escuta.size);

/* ── Documento ─────────────────────────────────────────────────────────────── */

const arq = (s) => [...s].sort().map((f) => `\`${f}\``).join(' · ') || '—';

const L = [];
L.push('# Catálogo de eventos do bus');
L.push('');
L.push('> ⚠️ **ARQUIVO GERADO** por `scripts/gen-catalogo-eventos.mjs` — não edite à mão.');
L.push('> O CI regera com `--verificar` e falha se divergir. Evento novo aparece aqui');
L.push('> sozinho; evento renomeado sem atualizar quem escuta aparece como órfão.');
L.push('');
L.push('Este documento responde, para o event bus, a pergunta que o [item 8 do #420]');
L.push('manda cada documento de arquitetura responder: **"se eu mexer aqui, o que quebro?"**');
L.push('Para um evento, a resposta é *quem escuta* — e isso estava espalhado pelo código.');
L.push('');
L.push(`Hoje: **${nomes.length} eventos** em **${namespaces.length} namespaces**.`);
L.push('');
L.push('O bus é `src/core/events.js`. Ele aceita curinga — `bus.on(\'*\')` para tudo e');
L.push('`bus.on(\'arsenal:*\')` para um namespace — com o nome do evento em `meta.event`.');
L.push('`emit(\'*\')` é proibido: curinga é assinatura, não evento.');
L.push('');

for (const ns of namespaces) {
  const doNs = nomes.filter((n) => espaco(n) === ns);
  L.push(`## \`${ns}\``);
  L.push('');
  L.push('| Evento | Emitido por | Escutado por |');
  L.push('| --- | --- | --- |');
  for (const n of doNs) {
    const e = eventos.get(n);
    L.push(`| \`${n}\` | ${arq(e.emite)} | ${arq(e.escuta)} |`);
  }
  L.push('');
}

L.push('## Pontas soltas');
L.push('');
L.push('Nenhuma das duas listas abaixo é necessariamente defeito — mas as duas são');
L.push('perguntas que valem ser feitas antes de congelar a 1.0.0.');
L.push('');
L.push('### Emitido e ninguém escuta');
L.push('');
if (orfaos.length) {
  L.push('Pode ser ponto de extensão deixado de propósito, ou pode ser ouvinte que alguém');
  L.push('apagou e não percebeu. O emissor continua custando trabalho ou nenhum dos dois.');
  L.push('');
  for (const n of orfaos) L.push(`- \`${n}\` — emitido por ${arq(eventos.get(n).emite)}`);
} else {
  L.push('Nenhum. Todo evento emitido tem pelo menos um ouvinte.');
}
L.push('');
L.push('### Escutado e ninguém emite');
L.push('');
if (fantasmas.length) {
  L.push('Este é o mais perigoso dos dois: a tela espera um evento que nunca chega, e o');
  L.push('sintoma é "não acontece nada" — sem erro, sem log, sem pista.');
  L.push('');
  for (const n of fantasmas) L.push(`- \`${n}\` — escutado por ${arq(eventos.get(n).escuta)}`);
} else {
  L.push('Nenhum. Todo ouvinte tem pelo menos um emissor.');
}
L.push('');

if (curingas.length) {
  L.push('### Assinaturas curinga em uso');
  L.push('');
  L.push('Não são eventos — casam com vários. Ficam fora da tabela de propósito.');
  L.push('');
  for (const c of curingas) L.push(`- \`${c}\` — em ${arq(eventos.get(c)?.escuta ?? new Set())}`);
  L.push('');
}

L.push('---');
L.push('');
L.push('Gerado de `src/**/*.js`. Comentários são removidos antes da varredura — o JSDoc');
L.push('de `core/events.js` traz exemplos de uso (`bus.on(\'arsenal:*\')`) que não são');
L.push('código, e sem isso o catálogo nasceria mentindo sobre o próprio exemplo.');
L.push('');

const conteudo = L.join('\n');

if (process.argv.includes('--verificar')) {
  let atual = '';
  try { atual = readFileSync(DESTINO, 'utf8'); } catch { /* não existe */ }
  if (atual !== conteudo) {
    console.error('🔴 docs/architecture/events.md está fora de sincronia com o código.');
    console.error('   Rode `npm run gen-catalogo-eventos` e commite o resultado.');
    process.exit(1);
  }
  console.log(`✓ catálogo de eventos em dia (${nomes.length} eventos, ${namespaces.length} namespaces).`);
} else {
  writeFileSync(DESTINO, conteudo);
  console.log(`escrito: ${relative(raiz, DESTINO)}`);
  console.log(`  eventos ............ ${nomes.length}`);
  console.log(`  namespaces ......... ${namespaces.length}`);
  console.log(`  emitido sem ouvinte  ${orfaos.length}`);
  console.log(`  ouvinte sem emissor  ${fantasmas.length}`);
  if (curingas.length) console.log(`  curingas em uso .... ${curingas.join(', ')}`);
}
