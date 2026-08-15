#!/usr/bin/env node
/**
 * Instala/atualiza as ferramentas externas de IA declaradas em
 * `config/ai-tools.json`.
 *
 *   npm run tools:sync                      # todas
 *   npm run tools:sync -- gitnexus          # uma
 *   npm run tools:sync -- gitnexus --setup  # + passos locais (npm install, build…)
 *
 * Clona quando não existe, `git pull --ff-only` quando existe. **Nunca** faz
 * merge nem rebase: se o clone local divergiu, o script para e diz — decidir o
 * que fazer com o trabalho local do operador não é papel de um instalador.
 *
 * Os passos de `setup` só rodam com `--setup` porque alguns custam minutos e
 * gigabytes (o build do GitNexus baixa tree-sitter e LadybugDB nativos). Clonar
 * é barato e idempotente; compilar não é.
 */

import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  lerManifest,
  selecionar,
  caminhoDaFerramenta,
  raizDasFerramentas,
  raizDoRepoPrincipal
} from './lib/ai-tools.mjs';

const args = process.argv.slice(2);
const comSetup = args.includes('--setup') || args.includes('--with-setup');
const ids = args.filter((a) => !a.startsWith('--'));

/** No Windows os wrappers são `.cmd`; o manifest declara os dois. */
function comandoDe(passo) {
  return process.platform === 'win32' && passo.windowsCommand ? passo.windowsCommand : passo.command;
}

function rodar(comando, argumentos, cwd) {
  const linha = [comando, ...argumentos].join(' ');
  console.log(`[tools] ${linha}`);
  const r = spawnSync(comando, argumentos, { cwd, stdio: 'inherit', shell: false, windowsHide: true });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`falhou (${r.status}): ${linha}`);
}

function sincronizar(manifest, tool) {
  const alvo = caminhoDaFerramenta(manifest, tool);
  const principal = raizDoRepoPrincipal();
  const curto = path.relative(principal, alvo) || alvo;
  mkdirSync(path.dirname(alvo), { recursive: true });

  if (existsSync(path.join(alvo, '.git'))) {
    console.log(`[tools] atualizando ${tool.id} em ${curto}`);
    rodar('git', ['-C', alvo, 'pull', '--ff-only'], principal);
  } else {
    console.log(`[tools] clonando ${tool.id} em ${curto}`);
    const profundidade = tool.fullClone ? [] : ['--depth', '1'];
    rodar('git', ['clone', ...profundidade, tool.repo, alvo], principal);
  }

  if (!comSetup) {
    const passos = Array.isArray(tool.setup) ? tool.setup.length : 0;
    if (passos > 0) console.log(`[tools] ${tool.id}: ${passos} passo(s) de setup pendente(s) — rode com --setup`);
    return;
  }
  for (const passo of tool.setup || []) {
    const cwd = path.resolve(principal, passo.cwd || tool.localPath || raizDasFerramentas(manifest));
    rodar(comandoDe(passo), Array.isArray(passo.args) ? passo.args : [], cwd);
  }
}

try {
  const manifest = lerManifest();
  mkdirSync(raizDasFerramentas(manifest), { recursive: true });
  for (const tool of selecionar(manifest, ids)) sincronizar(manifest, tool);
  console.log('[tools] ok');
} catch (erro) {
  console.error(`[tools] ${erro instanceof Error ? erro.message : String(erro)}`);
  process.exit(1);
}
