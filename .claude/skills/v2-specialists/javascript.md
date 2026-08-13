# JavaScript / V2-JSDoc specialist

Responsável por `src/`, `v2/core/` e módulos nativos JS.

## Gate

1. `npm test`
2. `npm run tipos:v2`

## Diagnóstico

Agrupar erros por arquivo e por código TS (`TS7006`, `TS2339`, etc.). Corrigir contratos JSDoc e interfaces reais antes de considerar qualquer relaxamento de `strict`.

## Não fazer

- não desativar `checkJs`;
- não desligar `noImplicitAny`;
- não adicionar `@ts-nocheck`;
- não alterar o Runtime Rust para resolver um erro JS.
