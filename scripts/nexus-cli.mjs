#!/usr/bin/env node
/**
 * Ponte para a CLI do GitNexus instalada localmente.
 *
 *   npm run nexus:local -- status
 *   npm run nexus:analyze
 *   npm run nexus:serve
 *
 * Existe porque o caminho da CLI (`.baluarte/tools/gitnexus/…`) é **relativo à
 * raiz do repositório principal**, e o Baluarte também é aberto de worktrees.
 * Um `node .baluarte/…` cru no `package.json` funciona no repo principal e
 * quebra com "Cannot find module" em qualquer worktree — o mesmo comando, dois
 * resultados, dependendo de onde o terminal está. Aqui a resolução passa pelo
 * manifest, então o comando é o mesmo em qualquer checkout.
 *
 * Repassa argv e o código de saída sem interpretar nada: quem manda na
 * interface é o GitNexus, não este arquivo.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { lerManifest, caminhoDaFerramenta, raizDoRepoPrincipal } from './lib/ai-tools.mjs';

const manifest = lerManifest();
const tool = manifest.tools.find((t) => t.id === 'gitnexus');
if (!tool) {
  console.error('[nexus] `gitnexus` não está em config/ai-tools.json');
  process.exit(1);
}

// `entrypoint` é relativo ao repo principal; sem ele, deduz do clone.
const entry = tool.entrypoint
  ? path.resolve(raizDoRepoPrincipal(), tool.entrypoint)
  : path.join(caminhoDaFerramenta(manifest, tool), 'gitnexus', 'dist', 'cli', 'index.js');

if (!existsSync(entry)) {
  console.error(`[nexus] CLI não encontrada em ${entry}`);
  console.error('[nexus] instale/compile com: npm run tools:sync -- gitnexus --setup');
  process.exit(1);
}

const r = spawnSync(process.execPath, [entry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  shell: false,
  windowsHide: true
});
if (r.error) {
  console.error(`[nexus] ${r.error.message}`);
  process.exit(1);
}
process.exit(r.status ?? 1);
