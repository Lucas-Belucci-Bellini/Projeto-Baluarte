#!/usr/bin/env node
process.argv.splice(2, 0, 'gen-catalogo-storage.ts');
await import('./lib/run-ts-generator.mjs');
