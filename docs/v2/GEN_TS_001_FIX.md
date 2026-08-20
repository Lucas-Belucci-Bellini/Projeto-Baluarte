# GEN-TS-001 — Fronteira Node/TypeScript dos geradores

## Status

`RESOLVED AND PUBLISHED ON MAIN`

## Causa raiz

Os geradores de estabilidade e storage eram arquivos `.mjs` executáveis com Node puro, mas importavam `src/core/politica.js`. Durante a migração, os wrappers JavaScript de `permissions`, `flags`, `storage` e módulos relacionados passaram a reexportar implementações `.ts`. O Node `22.x` não interpreta `.ts` sem loader e encerrava com `ERR_UNKNOWN_FILE_EXTENSION` em `src/core/permissions.ts`.

Isso era uma **causa raiz única**, não dois defeitos independentes: os dois geradores atravessavam a mesma fronteira `.js → .ts` sem explicitar o loader. O `npm` escondia parcialmente o problema porque os comandos usavam `tsx` diretamente, enquanto a invocação direta `node scripts/*.mjs --verificar` continuava quebrada.

## Contrato adotado

A implementação canônica continua em TypeScript:

- `scripts/gen-tabela-estabilidade.ts`
- `scripts/gen-catalogo-storage.ts`

A compatibilidade operacional continua em launchers `.mjs`:

- `scripts/gen-tabela-estabilidade.mjs`
- `scripts/gen-catalogo-storage.mjs`

Os launchers não importam TypeScript. Eles delegam para `node --import tsx <alvo.ts>`, encaminham argumentos, preservam stdout/stderr, propagam código de saída e informam falhas de processo. A fronteira fica explícita tanto para execução direta quanto para `npm` e CI.

## Arquivos alterados

| Arquivo | Papel |
|---|---|
| `package.json` | Aponta os comandos públicos para os launchers Node-safe. |
| `scripts/lib/run-ts-generator.mjs` | Runner comum que instala explicitamente o loader `tsx`. |
| `scripts/gen-tabela-estabilidade.mjs` | Compatibilidade/entrada Node para o gerador de estabilidade. |
| `scripts/gen-catalogo-storage.mjs` | Compatibilidade/entrada Node para o gerador de storage. |
| `scripts/gen-tabela-estabilidade.ts` | Implementação canônica migrada. |
| `scripts/gen-catalogo-storage.ts` | Implementação canônica migrada. |

## Verificação

A reprodução anterior falhava com `node scripts/gen-tabela-estabilidade.mjs --verificar` e `node scripts/gen-catalogo-storage.mjs --verificar`, ambos com `ERR_UNKNOWN_FILE_EXTENSION`.

Após a mudança, passaram:

| Comando | Resultado |
|---|---:|
| `node scripts/gen-tabela-estabilidade.mjs --verificar` | Verde |
| `node scripts/gen-catalogo-storage.mjs --verificar` | Verde — 72 chaves |
| `npm run gen-tabela-estabilidade -- --verificar` | Verde |
| `npm run gen-catalogo-storage -- --verificar` | Verde — 72 chaves |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `git diff --check` | Verde |

Os gates comportamentais completos foram repetidos após a publicação. A baseline corrente registra `npm test` 1085/1085, build verde, integração V2 21/21, smoke 99/99, caminho crítico 15/15 e CI remoto verde. A limitação local do Rust permanece ambiental e separada deste contrato.

## Segurança e rollback

Nenhuma configuração de `strict` foi relaxada, nenhum `any` foi adicionado e nenhum segredo foi introduzido. O loader atua somente no processo do gerador; não altera o bundle da V1, o runtime do navegador ou o comportamento do storage.

O rollback é o revert do commit desta mudança. Como os arquivos `.ts` preservam a implementação e os launchers preservam os nomes públicos `.mjs`, o retorno é atômico e não exige migração de dados.

## Limitação residual

Outros wrappers `.js → .ts` da migração ainda exigem uma fronteira com loader quando executados fora do Vite/tsx. Esta auditoria `GEN-TS-002` verificou a superfície de scripts executáveis e não encontrou outra correção imediata necessária. O relatório `docs/v2/GEN_TS_002_AUDIT_2026-08-20.md` registra a evidência e os limites da auditoria.
