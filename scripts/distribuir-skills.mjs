#!/usr/bin/env node
/**
 * Distribui as skills do Baluarte para os agentes instalados na máquina.
 *
 *   npm run skills:distribuir           # mostra o que faria
 *   npm run skills:distribuir -- --sim  # copia de verdade
 *
 * As skills moram em `.claude/skills/<id>/SKILL.md`, e Hermes, OpenClaw e
 * Claude Code usam **o mesmo formato** — pasta com um `SKILL.md` de frontmatter
 * YAML. Então distribuir é copiar, não converter.
 *
 * Escreve FORA do repositório, em diretório de configuração do operador
 * (`~/.claude/skills`, `~/.hermes/skills`, `~/.openclaw/skills`). Por isso o
 * padrão é ensaio: quem mexe na máquina de alguém avisa antes. `--sim` executa.
 *
 * Só copia as skills DESTE projeto, cada uma na própria pasta com o nome que já
 * tem. Desfazer é apagar essas pastas — nada é mesclado dentro de arquivo
 * existente, e nada de terceiro é tocado.
 */

import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerManifest } from './lib/ai-tools.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGEM = path.join(RAIZ, '.claude', 'skills');
const CASA = process.env.USERPROFILE || process.env.HOME || '';
const executar = process.argv.includes('--sim');

const manifest = lerManifest();
const destinos = (manifest.skillTargets || []).map((t) => ({
  ...t,
  caminho: path.resolve(CASA, t.dir)
}));

const skills = existsSync(ORIGEM)
  ? readdirSync(ORIGEM).filter((d) => existsSync(path.join(ORIGEM, d, 'SKILL.md')))
  : [];

if (skills.length === 0) {
  console.error('[skills] nenhuma skill em .claude/skills — nada a distribuir');
  process.exit(1);
}

console.log(`[skills] ${skills.length} skill(s): ${skills.join(', ')}`);
if (!executar) console.log('[skills] ENSAIO — nada foi escrito. Use `-- --sim` para valer.\n');

let escritos = 0;
for (const destino of destinos) {
  const existia = existsSync(destino.caminho);
  console.log(`  ${destino.id.padEnd(12)} ${destino.caminho}${existia ? '' : '  (será criado)'}`);
  if (!executar) continue;
  mkdirSync(destino.caminho, { recursive: true });
  for (const skill of skills) {
    cpSync(path.join(ORIGEM, skill), path.join(destino.caminho, skill), { recursive: true });
    escritos += 1;
  }
}

if (executar) {
  console.log(`\n[skills] ${escritos} cópia(s) em ${destinos.length} destino(s).`);
  console.log('[skills] desfazer: apague as pastas com esses nomes nos destinos acima.');
}
