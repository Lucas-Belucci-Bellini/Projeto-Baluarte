#!/usr/bin/env node
/**
 * Auditoria das ferramentas externas de IA: o que está instalado, em que commit
 * e se o clone local foi mexido.
 *
 *   npm run tools:status
 *   npm run tools:status -- --remoto     # + consulta o origin de cada uma (rede)
 *   npm run tools:status -- --estrito    # sai != 0 também em `movido`/`atrás`
 *
 * Existe porque o manifest versionado declara uma INTENÇÃO (`installedCommit`) e
 * o disco guarda o FATO. Quando os dois divergem — clone sujo, branch trocada,
 * ferramenta nunca instalada — o operador precisa ver isso antes de culpar o
 * Baluarte por um motor que não sobe.
 *
 * São duas perguntas diferentes, e é fácil confundir:
 *
 *   estado  — o disco bate com o manifest? (`sujo`, `movido`, `FALTA`)
 *   remoto  — saiu commit novo lá em cima? (só com `--remoto`, precisa de rede)
 *
 * Sai com código 1 se alguma ferramenta estiver faltando, pra poder virar gate
 * de CI algum dia. Clone sujo ou commit diferente do manifest é só aviso: mexer
 * no fonte de uma ferramenta local é uma coisa legítima de se fazer. Quem quiser
 * o rigor de CI também nesses casos usa `--estrito`.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { lerManifest, caminhoDaFerramenta, raizDoRepoPrincipal, git } from './lib/ai-tools.mjs';

const args = process.argv.slice(2);
const verRemoto = args.includes('--remoto');
const estrito = args.includes('--estrito');

const manifest = lerManifest();
const principal = raizDoRepoPrincipal();

/**
 * O origin tem commit que o disco não tem? Compara o HEAD remoto (sem fetch,
 * via `ls-remote`) com o HEAD local. '' quando não perguntamos.
 */
function estadoRemoto(tool, alvo, branch) {
  if (!verRemoto) return '';
  if (!tool.repo) return '-';
  // Comparar contra a MESMA branch, não contra o HEAD remoto. O graphify, por
  // exemplo, fica na `v8`: medir a `v8` local contra a default do origin dá
  // "atrás" eternamente, e um alarme que sempre toca ninguém escuta.
  const alvoRef = branch && branch !== '(detached)' ? `refs/heads/${branch}` : 'HEAD';
  let saida = git(['ls-remote', tool.repo, alvoRef], principal);
  if (!saida && alvoRef !== 'HEAD') saida = git(['ls-remote', tool.repo, 'HEAD'], principal);
  if (!saida) return '?';
  const shaRemoto = saida.split(/\s+/)[0];
  const shaLocal = git(['rev-parse', 'HEAD'], alvo);
  if (!shaRemoto || !shaLocal) return '?';
  return shaRemoto === shaLocal ? 'atual' : 'atrás';
}

const linhas = manifest.tools.map((tool) => {
  const alvo = caminhoDaFerramenta(manifest, tool);
  const curto = path.relative(principal, alvo) || alvo;
  if (!existsSync(path.join(alvo, '.git'))) {
    return {
      id: tool.id,
      estado: 'FALTA',
      branch: '-',
      commit: '-',
      remoto: verRemoto ? '-' : '',
      caminho: curto
    };
  }
  const commit = git(['rev-parse', '--short', 'HEAD'], alvo) || '?';
  const esperado = tool.installedCommit;
  const sujo = git(['status', '--short'], alvo) !== '';
  let estado = 'ok';
  if (sujo) estado = 'sujo';
  else if (esperado && esperado !== commit) estado = 'movido';
  const branch = git(['branch', '--show-current'], alvo) || '(detached)';
  return {
    id: tool.id,
    estado,
    branch,
    commit,
    remoto: estadoRemoto(tool, alvo, branch),
    caminho: curto
  };
});

const larg = (campo, min) => Math.max(min, ...linhas.map((l) => String(l[campo]).length));
const w = {
  id: larg('id', 4),
  estado: larg('estado', 6),
  branch: larg('branch', 6),
  commit: larg('commit', 6),
  remoto: verRemoto ? larg('remoto', 6) : 0
};
const linha = (l) =>
  `${String(l.id).padEnd(w.id)}  ${String(l.estado).padEnd(w.estado)}  ${String(l.branch).padEnd(w.branch)}  ${String(
    l.commit
  ).padEnd(w.commit)}  ${verRemoto ? String(l.remoto).padEnd(w.remoto) + '  ' : ''}${l.caminho}`;

console.log(
  linha({ id: 'tool', estado: 'estado', branch: 'branch', commit: 'commit', remoto: 'remoto', caminho: 'caminho' })
);
console.log(
  linha({
    id: '-'.repeat(w.id),
    estado: '-'.repeat(w.estado),
    branch: '-'.repeat(w.branch),
    commit: '-'.repeat(w.commit),
    remoto: '-'.repeat(w.remoto),
    caminho: '-'.repeat(24)
  })
);
for (const l of linhas) console.log(linha(l));

if (!verRemoto) {
  console.log('\n(sem rede — use `--remoto` para saber se saiu commit novo no origin)');
}

const faltando = linhas.filter((l) => l.estado === 'FALTA');
const movido = linhas.filter((l) => l.estado === 'movido');
const atrasados = linhas.filter((l) => l.remoto === 'atrás');

if (movido.length > 0) {
  console.log(
    `\naviso: ${movido.map((l) => l.id).join(', ')} — commit no disco difere do manifest (atualize \`installedCommit\` se foi de propósito).`
  );
}
if (atrasados.length > 0) {
  console.log(
    `\ncom commit novo no origin: ${atrasados.map((l) => l.id).join(', ')} — rode \`npm run tools:sync -- ${atrasados
      .map((l) => l.id)
      .join(' ')}\`.`
  );
}
if (faltando.length > 0) {
  console.log(
    `\nfaltando: ${faltando.map((l) => l.id).join(', ')} — rode \`npm run tools:sync -- ${faltando
      .map((l) => l.id)
      .join(' ')} --setup\`.`
  );
  process.exit(1);
}
if (estrito && (movido.length > 0 || atrasados.length > 0)) {
  process.exit(1);
}
