# TypeScript Migration — Wave 13 — Military Technology and Conflicts

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base auditada

A Wave 13 foi preparada sobre o SHA `87901af2`, que contém a Wave 12 de Geo publicada e sua documentação final com os gates remotos verdes. A entrega final foi publicada no SHA `12886090eacc967f035185eeaf67bf3a58e8f0b6`.

## Objetivo

Promover páginas militares informativas que possuem implementações TypeScript completas, sem alterar a autorização do sistema de módulos, o acesso administrativo ou os contratos de dados remotos.

## Rotas migradas localmente

| Rota | Implementação canônica | Export |
|---|---|---|
| `/tecnologia-militar` | `src/pages/tecnologia-militar.ts` | `tecnologiaMilitarPage` |
| `/guerras-conflitos` | `src/pages/guerras-conflitos.ts` | `guerrasConflitosPage` |

`src/main.js` e `docs/nexus/dominios.json` foram atualizados juntos. Os wrappers JavaScript permanecem para compatibilidade e rollback.

## Auditoria de segurança

A análise inicial encontrou a palavra `role` em uma busca ampla, mas a leitura das implementações canônicas confirmou que não existe controle de acesso, leitura de sessão, Supabase, `fetch`, owner, admin ou dev nessas duas páginas. O conteúdo é estático e a lógica limita-se à seleção de domínio tecnológico e filtro de era histórica. Portanto, a promoção não enfraquece o módulo de permissões.

`/arsenal` permaneceu fora por conter `fetch` e contrato de dados remoto. `/wiki-arma3` permaneceu fora por ser extenso e conter lógica de papel administrativo. Essas superfícies serão tratadas em uma onda separada, com contratos específicos.

## Validação local

| Gate | Resultado |
|---|---|
| `npm run verificar-nexus` | Passou: 99 rotas, 0 lacunas, 0 divergências |
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | Passou: 1085/1085 |
| `npm run build` | Passou; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou: 21/21 após limpar Vite órfão |
| `npm run smoke` | Passou: 99/99 |
| `npm run caminho-critico` | Passou: 15/15 |
| Contratos direcionados | Passou: 22/22 |
| `git diff --check` | Passou |

A primeira execução da integração encontrou o timeout ambiental conhecido em `.cripto-entrada`, causado por previews Vite órfãos nas portas 4193/4194. Após encerrar somente esses processos, a repetição passou em `21/21`. O gate local `npm run v2:runtime` continua limitado pelo Cargo 1.75.0 ao interpretar `edition2024`; nenhuma configuração foi alterada para mascarar isso.

## Riscos e rollback

Nenhum wrapper foi removido, nenhum dado externo foi alterado e nenhum contrato de autorização foi ampliado. Rollback: reverter as duas extensões no router, as duas origens Nexus e este documento.

## Próximo passo

A Wave 13 foi sincronizada com `origin/main`, publicada diretamente no `main` no SHA `12886090eacc967f035185eeaf67bf3a58e8f0b6` e os oito workflows remotos passaram: CI, Core CI, V2 Core, V2 Runtime, V2 Validation, Vigia das rotas, Arma 3 Data CI e CodeQL. Depois, iniciar a auditoria contratual de `/arsenal` e `/wiki-arma3`.
