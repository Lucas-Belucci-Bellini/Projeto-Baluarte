/**
 * `localStorage` cru só nos dois lugares onde é a resposta certa.
 *
 * Por que este teste existe, concretamente: `utils/wikipedia.js` gravava
 * `wiki:sum:pt:Título` direto, **sem o prefixo `baluarte:`**. O botão "Limpar
 * todos os dados locais" do `/perfil` filtra por esse prefixo — então ele nunca
 * alcançava o cache. O operador clicava, lia *"todos os dados locais foram
 * apagados"*, e o registro do que ele consultou continuava no disco. O relatório
 * de storage da `/shadow` também não os contava.
 *
 * Nada disso dá erro. Nenhum teste de comportamento pega. Só aparece quando
 * alguém abre o DevTools e vê chave estranha — ou nunca.
 *
 * A defesa é estrutural: quem grava passa pelo wrapper, que é dono do namespace.
 * Este teste cobra isso e mantém a lista de exceções **curta e justificada** —
 * uma lista de exceções que cresce sem ninguém olhar é o mesmo que não ter regra.
 *
 * `sessionStorage` NÃO é cobrado aqui, de propósito: o wrapper é `localStorage`
 * (persiste para sempre) e as flags de sessão existem justamente para morrer com
 * a aba. Ver a nota em `src/core/politica.js`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(raiz, 'src');

/**
 * Quem pode tocar `localStorage` direto — e o motivo tem que caber numa linha.
 * Antes de somar um nome aqui: o wrapper (`src/core/storage.js`) resolve?
 */
const PERMITIDOS = new Map([
  ['src/core/storage.js', 'é o wrapper — é o dono do namespace'],
  ['src/pages/shadow.js', 'MEDE o que está gravado, inclusive o que o wrapper não escreveu'],
  ['src/pages/perfil.js', 'varre o cache legado gravado fora do namespace (descartável pós-1.0.0)']
]);

const RE = /\blocalStorage\s*\.\s*(getItem|setItem|removeItem|key|clear)\s*\(/;

function arquivosJs(dir) {
  const saida = [];
  for (const nome of readdirSync(dir)) {
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) saida.push(...arquivosJs(caminho));
    else if (nome.endsWith('.js')) saida.push(caminho);
  }
  return saida;
}

const infratores = arquivosJs(src)
  .map((caminho) => ({ rel: relative(raiz, caminho).replace(/\\/g, '/'), caminho }))
  .filter(({ rel }) => !PERMITIDOS.has(rel))
  .filter(({ caminho }) => RE.test(readFileSync(caminho, 'utf8')));

test('nenhum arquivo novo grava em localStorage por fora do wrapper', () => {
  assert.deepEqual(
    infratores.map((i) => i.rel), [],
    'Use `storage.get/set/remove` de `src/core/storage.js` — ele põe o namespace ' +
    '`baluarte:` sozinho, e é o que faz "Limpar todos os dados locais" alcançar a chave. ' +
    'Se o acesso cru for mesmo necessário, some o arquivo a PERMITIDOS aqui com a justificativa.'
  );
});

test('a lista de exceções continua curta e justificada', () => {
  /* Sem um teto, a lista vira o lugar onde a regra vai morrer aos poucos. */
  assert.ok(
    PERMITIDOS.size <= 4,
    `${PERMITIDOS.size} exceções — se está crescendo, o wrapper está faltando alguma coisa.`
  );
  for (const [arquivo, motivo] of PERMITIDOS) {
    assert.ok(motivo && motivo.length > 15, `exceção "${arquivo}" sem justificativa real`);
  }
});
