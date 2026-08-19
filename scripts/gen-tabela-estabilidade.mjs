#!/usr/bin/env node
process.argv.splice(2, 0, 'gen-tabela-estabilidade.ts');
await import('./lib/run-ts-generator.mjs');
