import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const aqui = dirname(fileURLToPath(import.meta.url));
const alvo = resolve(aqui, '..', process.argv[2]);
const argumentos = process.argv.slice(3);

const resultado = spawnSync(process.execPath, ['--import', 'tsx', alvo, ...argumentos], {
  stdio: 'inherit',
  env: process.env
});

if (resultado.error) {
  console.error(`Não foi possível iniciar o gerador TypeScript ${alvo}: ${resultado.error.message}`);
  process.exit(1);
}

if (resultado.signal) {
  console.error(`O gerador TypeScript foi encerrado pelo sinal ${resultado.signal}.`);
  process.exit(1);
}

process.exit(resultado.status ?? 1);
