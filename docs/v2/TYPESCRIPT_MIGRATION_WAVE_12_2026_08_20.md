# TypeScript Migration — Wave 12 — Geo

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base auditada

A Wave 12 foi preparada sobre o SHA `20bd600e`, que contém a Wave 11 publicada diretamente no `main` e seu registro documental. A entrega final foi publicada no SHA `7c29d1c04913b53191419bb7434b04973092be16`.

## Objetivo

Promover `/geo` para a implementação TypeScript canônica sem alterar o contrato do rastreador geográfico, do ciclo de vida, da triangulação ou das permissões de rede.

## Rota migrada

| Rota | Implementação canônica | Export |
|---|---|---|
| `/geo` | `src/pages/geopulse.ts` | `geopulsePage` |

`src/main.js` e `docs/nexus/dominios.json` foram atualizados juntos. O wrapper `src/pages/geopulse.js` permanece como fronteira de compatibilidade.

## Auditoria de escopo

A implementação TypeScript de Geo possui 287 linhas, exporta `geopulsePage` e usa helpers, ciclo de vida, `geo-tracker` e triangulação. A auditoria não encontrou Supabase, sessão, papel administrativo, owner, `fetch`, abertura de janela ou claim de autorização na página. A rota foi considerada adequada para uma promoção isolada.

As páginas `/tecnologia-militar` e `/guerras-conflitos` ficaram fora desta onda porque suas implementações TypeScript contêm sinais de papel/dev e exigem uma revisão específica do contrato de acesso. Nenhuma lógica de autorização foi removida ou duplicada.

## Validação local

| Gate | Resultado |
|---|---|
| `npm run verificar-nexus` | Passou: 99 rotas, 0 lacunas, 0 divergências |
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | Passou: 1085/1085 |
| `npm run build` | Passou; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou: 21/21 |
| `npm run smoke` | Passou: 99/99 |
| `npm run caminho-critico` | Passou: 15/15 |
| Contratos direcionados | Passou: 22/22 |
| `git diff --check` | Passou |

O gate local `npm run v2:runtime` continua retornando `101` devido ao Cargo 1.75.0 e ao metadado `edition2024` da dependência `getrandom`. A configuração não foi alterada para ocultar o bloqueio; o workflow remoto V2 Runtime permanece autoritativo.

## Riscos e rollback

O risco é uma divergência futura entre o wrapper JavaScript e o TypeScript canônico. Nenhum wrapper foi removido, nenhum dado externo foi alterado e nenhum contrato de rede ou autorização foi ampliado. Rollback: reverter a extensão de `/geo` no router, a origem no Nexus e este documento.

## Próximo passo

A Wave 12 foi sincronizada com `origin/main`, publicada diretamente no `main` no SHA `7c29d1c04913b53191419bb7434b04973092be16` e os oito workflows remotos passaram: CI, Core CI, V2 Core, V2 Runtime, V2 Validation, Vigia das rotas, Arma 3 Data CI e CodeQL. O registro documental foi publicado no SHA `a0235885719b2bd6c22cf6cdc66708d214086c2a`, também com os oito workflows remotos verdes. Depois, auditar as páginas com papéis (`/tecnologia-militar` e `/guerras-conflitos`) antes de promovê-las.
