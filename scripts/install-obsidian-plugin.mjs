#!/usr/bin/env node
/**
 * Instala no vault do Baluarte um plugin do Obsidian que foi compilado a partir
 * de um clone em `.baluarte/tools/`.
 *
 *   node scripts/install-obsidian-plugin.mjs claude-code-terminal
 *
 * A raiz deste repositório **é** um vault do Obsidian (`.obsidian/`), e os
 * plugins de lá são versionados no padrão `main.js` + `manifest.json`. O clone
 * com fonte, `node_modules` e toolchain fica fora do git; só o artefato entra.
 *
 * Alguns plugins precisam de um módulo nativo ao lado (o `claude-code-terminal`
 * resolve `node-pty` em `<pasta do plugin>/node_modules/node-pty`, ver
 * `src/main.ts`). Esses vêm em `modules` — e caem sozinhos no `.gitignore`,
 * porque `node_modules/` é a primeira linha dele e casa em qualquer
 * profundidade. Binário nativo de 64 MB não entra no histórico.
 */

import { cpSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { lerManifest, caminhoDaFerramenta, raizDoRepoPrincipal } from './lib/ai-tools.mjs';

const id = process.argv[2];
if (!id) {
  console.error('uso: node scripts/install-obsidian-plugin.mjs <ferramenta>');
  process.exit(2);
}

const manifest = lerManifest();
const tool = manifest.tools.find((t) => t.id === id);
if (!tool?.obsidian) {
  console.error(`[obsidian] "${id}" não declara o bloco "obsidian" em config/ai-tools.json`);
  process.exit(1);
}

const origem = caminhoDaFerramenta(manifest, tool);
const destino = path.join(raizDoRepoPrincipal(), '.obsidian', 'plugins', tool.obsidian.pluginId);
mkdirSync(destino, { recursive: true });

let copiados = 0;
for (const arquivo of tool.obsidian.files || []) {
  const de = path.join(origem, arquivo);
  if (!existsSync(de)) {
    console.error(`[obsidian] falta ${arquivo} — compile antes: npm run tools:sync -- ${id} --setup`);
    process.exit(1);
  }
  cpSync(de, path.join(destino, path.basename(arquivo)));
  copiados += 1;
}

for (const modulo of tool.obsidian.modules || []) {
  const de = path.join(origem, 'node_modules', modulo);
  if (!existsSync(de)) {
    console.error(`[obsidian] falta o módulo nativo ${modulo} em ${origem}/node_modules`);
    process.exit(1);
  }
  cpSync(de, path.join(destino, 'node_modules', modulo), { recursive: true });
  console.log(`[obsidian] módulo ${modulo} (não versionado — node_modules/ é ignorado)`);
}

console.log(`[obsidian] ${tool.obsidian.pluginId}: ${copiados} arquivo(s) em .obsidian/plugins/${tool.obsidian.pluginId}`);
console.log('[obsidian] ative em Obsidian → Configurações → Plugins da comunidade.');
