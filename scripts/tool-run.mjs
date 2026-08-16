#!/usr/bin/env node
/**
 * Executa a CLI de uma ferramenta externa instalada localmente.
 *
 *   node scripts/tool-run.mjs gitnexus status
 *   node scripts/tool-run.mjs hermes-agent --version
 *
 * Existe por dois motivos, os dois descobertos na prática:
 *
 * 1. O caminho das ferramentas é relativo à raiz do repositório **principal**,
 *    e o Baluarte também é aberto de worktrees. Um `node .baluarte/…` cru no
 *    `package.json` funciona no repo principal e quebra com "Cannot find
 *    module" em qualquer worktree — mesmo comando, dois resultados, dependendo
 *    de onde o terminal está.
 * 2. Ferramenta Python instalada em venv tem executável em `Scripts/x.exe` no
 *    Windows e `bin/x` no resto. Sem um lugar único pra resolver isso, cada
 *    script npm viraria um `if` de plataforma.
 *
 * O manifest declara como rodar (`tools[].run`); aqui só resolvemos e
 * repassamos argv + código de saída. Quem manda na interface é a ferramenta.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { lerManifest, raizDoRepoPrincipal } from './lib/ai-tools.mjs';

const [id, ...resto] = process.argv.slice(2);
if (!id) {
  console.error('uso: node scripts/tool-run.mjs <ferramenta> [args…]');
  process.exit(2);
}

const manifest = lerManifest();
const tool = manifest.tools.find((t) => t.id === id);
if (!tool) {
  const conhecidos = manifest.tools.map((t) => t.id).join(', ');
  console.error(`[tools] "${id}" não está em config/ai-tools.json — conheço: ${conhecidos}`);
  process.exit(1);
}
if (!tool.run) {
  console.error(`[tools] "${id}" não declara como ser executado (campo "run" no manifest)`);
  process.exit(1);
}

const principal = raizDoRepoPrincipal();
const abs = (p) => path.resolve(principal, p);

let comando;
let args;
if (tool.run.kind === 'node') {
  comando = process.execPath;
  args = [abs(tool.run.entrypoint), ...resto];
} else if (tool.run.kind === 'bin') {
  const declarado = process.platform === 'win32' ? tool.run.windows : tool.run.posix;
  if (!declarado) {
    console.error(`[tools] "${id}" não tem executável declarado para ${process.platform}`);
    process.exit(1);
  }
  comando = abs(declarado);
  args = resto;
} else {
  console.error(`[tools] "${id}": run.kind desconhecido "${tool.run.kind}" (use "node" ou "bin")`);
  process.exit(1);
}

const alvo = tool.run.kind === 'node' ? args[0] : comando;
if (!existsSync(alvo)) {
  console.error(`[tools] ${id}: não encontrei ${alvo}`);
  const receita = tool.commands?.sync || `npm run tools:sync -- ${id} --setup`;
  console.error(`[tools] instale com: ${receita}`);
  process.exit(1);
}

const r = spawnSync(comando, args, { stdio: 'inherit', shell: false, windowsHide: true });
if (r.error) {
  console.error(`[tools] ${id}: ${r.error.message}`);
  process.exit(1);
}
process.exit(r.status ?? 1);
