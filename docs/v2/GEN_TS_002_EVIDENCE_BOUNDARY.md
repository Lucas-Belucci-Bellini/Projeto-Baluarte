# GEN-TS-002 — Fronteira Evidence `.js`/`.ts`

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Causa e escopo

O módulo `v2/modules/evidence/module.js` importava diretamente `v2/data/catalog-evidence.ts`. Isso contrariava o padrão de migração já usado em `v2/data/evidence.js` e nos módulos V2: consumidores JavaScript devem atravessar uma fronteira `.js`, enquanto a implementação canônica permanece em TypeScript.

A correção desta onda é deliberadamente pequena. Foi criado `v2/data/catalog-evidence.js` como wrapper de compatibilidade e o módulo Evidence passou a importar esse wrapper. A lógica de validação, normalização, criação de `claimKey` e contrato `CatalogEvidenceInput` não foi duplicada nem alterada.

## Arquivos

| Arquivo | Papel |
|---|---|
| `v2/data/catalog-evidence.ts` | Implementação TypeScript canônica e tipos do catálogo |
| `v2/data/catalog-evidence.js` | Fronteira JavaScript temporária para consumidores legados/V2 |
| `v2/modules/evidence/module.js` | Import atualizado para o wrapper `.js` |

## Verificação local

| Comando | Resultado |
|---|---:|
| `npm run tipos:v2` | Verde |
| Testes específicos Evidence | **9/9** |
| `npm run v2:integracao` | **19/19** |
| `npm test` | **1042/1042** |
| `npm run build` | Verde; warning conhecido de chunks grandes |
| `git diff --check` | Verde |

## Segurança e rollback

A mudança não altera permissões, armazenamento, rede, persistência, autoridade de usuário ou ingestão externa. Nenhuma credencial foi introduzida. O rollback é o revert do commit, removendo o wrapper e restaurando o import anterior.

## Limitação residual

O wrapper segue o padrão de compatibilidade da migração e ainda depende de um loader TypeScript quando executado fora do Vite/`tsx`. A execução de módulos V2 diretamente com Node puro precisa de uma política própria de launchers/loader e permanece como trabalho separado; esta onda não transforma o runtime inteiro nem altera todos os wrappers de páginas.
