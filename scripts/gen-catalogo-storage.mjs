/**
 * Catálogo do storage local — GERADO da política e do código (#420, item 8).
 *
 * Responde, para cada chave que o Baluarte grava no navegador do operador, a
 * pergunta do item 8: **"se eu mexer aqui, o que quebro?"** Para uma chave de
 * storage a resposta tem três partes, e nenhuma estava escrita num lugar só:
 *
 *   quem toca   — os arquivos que leem ou gravam a chave
 *   que classe  — `publico` · `local` · `sensivel` · `secreto`, que decide se o
 *                 dado pode sair da máquina e se a gravação é recusada
 *   que versão  — e portanto se mudar o formato exige `migrar`
 *
 * ── A invariante que este catálogo cobra ────────────────────────────────────
 * **Toda chave tocada por `src/` precisa estar declarada em `politica.js`.**
 *
 * Não é preciosismo. Chave sem esquema não tem versão nem migração; no dia em
 * que o formato mudar, não existe caminho de volta para o dado já gravado, e o
 * `storage.get` devolve o fallback — o operador perde a escolha dele **em
 * silêncio**, sem erro e sem log. A regra está no `CLAUDE.md` e a primeira coisa
 * que este script achou foi uma chave que a violava (`mark11:state`).
 *
 * A violação impede a geração **e** o `--verificar` do CI: o documento nunca
 * registra um estado que o projeto considera inválido, e o PR fica vermelho.
 * Não há teste separado cobrando o mesmo — seria um segundo dono da mesma
 * regra, e regra com dois donos diverge.
 *
 * Rodar:  npm run gen-catalogo-storage
 *         npm run gen-catalogo-storage -- --verificar   (CI: falha se divergir)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, sep } from 'node:path';

import { semComentarios } from './lib/sem-comentarios.mjs';
import { mesmoConteudo } from './lib/eol.mjs';
import { ESQUEMAS } from '../src/core/politica.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(raiz, 'src');
const POLITICA = join(raiz, 'src/core/politica.js');
const DESTINO = join(raiz, 'docs/architecture/storage.md');

/* O prefixo do namespace vive em `core/storage.js`; o catálogo mostra a chave
 * COMO ELA APARECE no localStorage, que é o que o operador vê no DevTools. */
const PREFIXO = 'baluarte:';

/* Varre `.js` E `.ts` — mesma lição do catálogo de eventos: quem migra para
 * TypeScript deixa um `.js` que só re-exporta, e um scanner que lê apenas o
 * shim conclui que ninguém toca a chave. `.d.ts` fica de fora: declaração não
 * acessa storage. */
function arquivosFonte(dir) {
  const out = [];
  for (const nome of readdirSync(dir)) {
    const p = join(dir, nome);
    if (statSync(p).isDirectory()) out.push(...arquivosFonte(p));
    else if (nome.endsWith('.js') || (nome.endsWith('.ts') && !nome.endsWith('.d.ts'))) out.push(p);
  }
  return out.sort();
}

/* ── Quem toca cada chave ───────────────────────────────────────────────────
 * Procura o literal em QUALQUER posição, não só dentro de `storage.get(...)`:
 * metade das chaves é acessada por constante (`const SESSION_KEY = 'auth:session'`),
 * e um scanner que só olhasse a chamada diria que ninguém usa a sessão. */
const toca = new Map(ESQUEMAS.map((e) => [e.chave, new Set()]));
const literaisSoltos = new Map();   // chave usada em src/ e NÃO declarada

const CHAVE_LITERAL = /(['"])([a-zA-Z][a-zA-Z0-9_-]*:[a-zA-Z][a-zA-Z0-9:_-]*)\1/g;
const declaradas = new Set(ESQUEMAS.map((e) => e.chave));

for (const arquivo of arquivosFonte(SRC)) {
  /* Barra normal sempre: no Windows o `relative` devolve `src\core\politica.js`
   * e a exclusão logo abaixo — comparação literal com `'src/core/politica.js'` —
   * nunca casaria, fazendo a política aparecer como quem toca todas as chaves
   * que ela apenas declara. */
  const rel = relative(raiz, arquivo).split(sep).join('/');
  const codigo = semComentarios(readFileSync(arquivo, 'utf8'));

  /* Declaradas: basta o literal aparecer. */
  for (const chave of declaradas) {
    if (codigo.includes(`'${chave}'`) || codigo.includes(`"${chave}"`)) {
      if (rel !== 'src/core/politica.js') toca.get(chave).add(rel);
    }
  }

  /* Não declaradas: só conta o que passa pelo wrapper de storage — um literal
   * com dois-pontos pode ser evento, seletor CSS ou rota, e acusar tudo faria
   * o catálogo gritar lobo. */
  for (const m of codigo.matchAll(/storage\s*\.\s*(?:get|set|remove)\s*\(\s*(['"])([^'"]+)\1/g)) {
    const chave = m[2];
    if (!declaradas.has(chave)) {
      if (!literaisSoltos.has(chave)) literaisSoltos.set(chave, new Set());
      literaisSoltos.get(chave).add(rel);
    }
  }
  /* Constante intermediária: `const K = 'x:y'` seguido de `storage.get(K)`.
   * Cobre o caso das chaves acessadas por nome, sem tentar resolver o fluxo. */
  for (const m of codigo.matchAll(/(?:const|let|var)\s+\w+\s*=\s*(['"])([^'"]+)\1/g)) {
    const chave = m[2];
    if (!declaradas.has(chave) && CHAVE_LITERAL.test(`'${chave}'`)
        && /storage\s*\.\s*(get|set|remove)/.test(codigo)) {
      if (!literaisSoltos.has(chave)) literaisSoltos.set(chave, new Set());
      literaisSoltos.get(chave).add(rel);
    }
    CHAVE_LITERAL.lastIndex = 0;
  }
}

/* ── O "porquê" mora na política; o catálogo vai buscá-lo lá ────────────────
 * Cada entrada de ESQUEMAS pode vir precedida de um comentário de bloco que
 * explica a classificação (por que `nexus:key` é público, por que `auth:session`
 * é sensível e não secreto). Copiar essa prosa para cá à mão criaria a segunda
 * cópia que este projeto passou a sessão inteira evitando — então ela é EXTRAÍDA
 * do fonte, e continua tendo um dono só. */
const fonte = readFileSync(POLITICA, 'utf8');
const razoes = new Map();
{
  const linhas = fonte.split('\n');
  let bloco = [];
  for (const linha of linhas) {
    const t = linha.trim();
    if (t.startsWith('/*') || (bloco.length && (t.startsWith('*') || t.startsWith('*/')))) {
      const limpa = t.replace(/^\/\*+\s?/, '').replace(/^\*+\/?\s?/, '').replace(/\s*\*\/$/, '');
      bloco.push(limpa);
      continue;
    }
    const m = t.match(/^\{\s*chave:\s*'([^']+)'/);
    if (m && bloco.length) {
      const texto = bloco.join(' ').replace(/\s+/g, ' ').trim();
      if (texto) razoes.set(m[1], texto);
    }
    if (t) bloco = [];
  }
}

/* ── Invariante ────────────────────────────────────────────────────────────── */

if (literaisSoltos.size) {
  console.error('🔴 chave de storage EM USO e não declarada em src/core/politica.js:');
  for (const [chave, arquivos] of [...literaisSoltos].sort()) {
    console.error(`   ${chave} — ${[...arquivos].sort().join(', ')}`);
  }
  console.error('\n   Chave sem esquema não tem versão nem migração: no dia em que o');
  console.error('   formato mudar, o dado do operador cai no fallback em silêncio.');
  console.error('   Declare em ESQUEMAS com `migrar` (identidade serve, e é obrigatória');
  console.error('   quando a chave JÁ tem dado gravado).');
  process.exit(1);
}

/* ── Documento ─────────────────────────────────────────────────────────────── */

const porClasse = (c) => ESQUEMAS.filter((e) => e.classe === c);
const CLASSES = ['publico', 'local', 'sensivel', 'secreto'];
const DESC = {
  publico: 'Pode aparecer em qualquer lugar — inclusive no bundle. Classificar assim é uma afirmação, não um descuido.',
  local: 'Preferência da máquina. Não sai do navegador e não vale nada fora dele.',
  sensivel: 'Diz respeito ao operador. Fica no navegador porque precisa, e nunca é enviada a lugar nenhum pelo Baluarte.',
  secreto: '**Recusada na gravação** por `core/storage.js`. Existe para que classificar errado doa na hora, em vez de vazar depois.'
};

const arq = (s) => [...s].sort().map((f) => `\`${f}\``).join(' · ') || '— *(nenhum arquivo de `src/` toca)*';

const L = [];
L.push('# Catálogo do storage local');
L.push('');
L.push('> ⚠️ **ARQUIVO GERADO** por `scripts/gen-catalogo-storage.mjs` — não edite à mão.');
L.push('> O CI regera com `--verificar` e falha se divergir.');
L.push('');
L.push('Tudo que o Baluarte grava no navegador do operador. A pergunta que este');
L.push('documento responde é **"se eu mexer aqui, o que quebro?"** — e para uma chave');
L.push('de storage a resposta é: *quem toca*, *que classe* e *que versão*.');
L.push('');
L.push(`Hoje: **${ESQUEMAS.length} chaves declaradas**, todas com \`migrar\`.`);
L.push('');
L.push('As chaves aparecem no `localStorage` com o prefixo `' + PREFIXO + '` — é assim');
L.push('que elas surgem no DevTools, e é por isso que `clearAll()` alcança todas: o');
L.push('namespace é o que torna "limpar meus dados" uma promessa cumprível.');
L.push('');
L.push('## A regra que este catálogo cobra');
L.push('');
L.push('**Toda chave tocada por `src/` precisa estar declarada em `src/core/politica.js`.**');
L.push('');
L.push('Chave sem esquema não tem versão nem migração. No dia em que o formato mudar,');
L.push('não existe caminho de volta para o dado já gravado: `storage.get` devolve o');
L.push('fallback e o operador perde a escolha dele **em silêncio** — sem erro, sem log,');
L.push('sem pista. O gerador se recusa a rodar enquanto houver chave fora da política,');
L.push('e o `--verificar` do CI faz a mesma recusa no PR.');
L.push('');

for (const classe of CLASSES) {
  const doGrupo = porClasse(classe);
  L.push(`## \`${classe}\``);
  L.push('');
  L.push(DESC[classe]);
  L.push('');
  if (!doGrupo.length) {
    L.push('*Nenhuma chave nesta classe.*');
    L.push('');
    continue;
  }
  L.push('| Chave | Versão | Tocada por |');
  L.push('| --- | --- | --- |');
  for (const e of doGrupo) {
    L.push(`| \`${PREFIXO}${e.chave}\` | ${e.versao} | ${arq(toca.get(e.chave))} |`);
  }
  L.push('');
  const comRazao = doGrupo.filter((e) => razoes.has(e.chave));
  if (comRazao.length) {
    L.push('**Por que esta classificação:**');
    L.push('');
    for (const e of comRazao) L.push(`- \`${e.chave}\` — ${razoes.get(e.chave)}`);
    L.push('');
  }
}

L.push('## Mudar o formato de uma chave');
L.push('');
L.push('1. Suba a `versao` em `ESQUEMAS`.');
L.push('2. Escreva o `migrar(dados, de, para)` que leva o formato antigo ao novo.');
L.push('3. Rode `npm run gen-catalogo-storage` e commite este arquivo.');
L.push('');
L.push('O passo 2 não é opcional. Dado gravado antes dos envelopes é lido como');
L.push('**versão 0**; sem `migrar`, `storage.get` cai no fallback e o que o operador');
L.push('tinha desaparece sem barulho. É por isso que toda chave aqui — inclusive as');
L.push('que nunca mudaram de formato — carrega ao menos a migração identidade.');
L.push('');
L.push('---');
L.push('');
L.push('Gerado de `src/core/politica.js` (valores e justificativas) e de uma varredura');
L.push('de `src/**/*.js` (quem toca). Comentários são removidos antes da varredura: há');
L.push('arquivo que *menciona* uma chave em prosa sem nunca tocá-la, e contá-lo seria');
L.push('apontar o dedo para o arquivo errado no dia do conserto.');
L.push('');

const conteudo = L.join('\n');

if (process.argv.includes('--verificar')) {
  let atual = '';
  try { atual = readFileSync(DESTINO, 'utf8'); } catch { /* não existe */ }
  /* Ignorando o fim de linha — ver `lib/eol.mjs`. */
  if (!mesmoConteudo(atual, conteudo)) {
    console.error('🔴 docs/architecture/storage.md está fora de sincronia.');
    console.error('   Rode `npm run gen-catalogo-storage` e commite o resultado.');
    process.exit(1);
  }
  console.log(`✓ catálogo de storage em dia (${ESQUEMAS.length} chaves).`);
} else {
  writeFileSync(DESTINO, conteudo);
  console.log(`escrito: ${relative(raiz, DESTINO)}`);
  for (const c of CLASSES) console.log(`  ${c.padEnd(9)} ${porClasse(c).length}`);
  console.log(`  ${'com razão documentada'.padEnd(9)} ${razoes.size}`);
}
