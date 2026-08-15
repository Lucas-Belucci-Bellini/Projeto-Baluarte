#!/usr/bin/env node
/**
 * Auditoria das ferramentas externas de IA: o que está instalado, em que commit
 * e se o clone local foi mexido.
 *
 *   npm run tools:status
 *
 * Existe porque o manifest versionado declara uma INTENÇÃO (`installedCommit`) e
 * o disco guarda o FATO. Quando os dois divergem — clone sujo, branch trocada,
 * ferramenta nunca instalada — o operador precisa ver isso antes de culpar o
 * Baluarte por um motor que não sobe.
 *
 * Sai com código 1 se alguma ferramenta estiver faltando, pra poder virar gate
 * de CI algum dia. Clone sujo ou commit diferente do manifest é só aviso: mexer
 * no fonte de uma ferramenta local é uma coisa legítima de se fazer.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { lerManifest, caminhoDaFerramenta, raizDoRepoPrincipal, git } from './lib/ai-tools.mjs';

const manifest = lerManifest();
const principal = raizDoRepoPrincipal();

const linhas = manifest.tools.map((tool) => {
  const alvo = caminhoDaFerramenta(manifest, tool);
  const curto = path.relative(principal, alvo) || alvo;
  if (!existsSync(path.join(alvo, '.git'))) {
    return { id: tool.id, estado: 'FALTA', branch: '-', commit: '-', caminho: curto };
  }
  const commit = git(['rev-parse', '--short', 'HEAD'], alvo) || '?';
  const esperado = tool.installedCommit;
  const sujo = git(['status', '--short'], alvo) !== '';
  let estado = 'ok';
  if (sujo) estado = 'sujo';
  else if (esperado && esperado !== commit) estado = 'movido';
  return {
    id: tool.id,
    estado,
    branch: git(['branch', '--show-current'], alvo) || '(detached)',
    commit,
    caminho: curto
  };
});

const larg = (campo, min) => Math.max(min, ...linhas.map((l) => String(l[campo]).length));
const w = { id: larg('id', 4), estado: larg('estado', 6), branch: larg('branch', 6), commit: larg('commit', 6) };
const linha = (l) =>
  `${String(l.id).padEnd(w.id)}  ${String(l.estado).padEnd(w.estado)}  ${String(l.branch).padEnd(w.branch)}  ${String(l.commit).padEnd(w.commit)}  ${l.caminho}`;

console.log(linha({ id: 'tool', estado: 'estado', branch: 'branch', commit: 'commit', caminho: 'caminho' }));
console.log(
  linha({
    id: '-'.repeat(w.id),
    estado: '-'.repeat(w.estado),
    branch: '-'.repeat(w.branch),
    commit: '-'.repeat(w.commit),
    caminho: '-'.repeat(24)
  })
);
for (const l of linhas) console.log(linha(l));

const faltando = linhas.filter((l) => l.estado === 'FALTA');
const movido = linhas.filter((l) => l.estado === 'movido');
if (movido.length > 0) {
  console.log(
    `\naviso: ${movido.map((l) => l.id).join(', ')} — commit no disco difere do manifest (atualize \`installedCommit\` se foi de propósito).`
  );
}
if (faltando.length > 0) {
  console.log(
    `\nfaltando: ${faltando.map((l) => l.id).join(', ')} — rode \`npm run tools:sync -- ${faltando.map((l) => l.id).join(' ')} --setup\`.`
  );
  process.exit(1);
}
