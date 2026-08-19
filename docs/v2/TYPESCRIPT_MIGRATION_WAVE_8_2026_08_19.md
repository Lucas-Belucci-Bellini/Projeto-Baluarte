# TypeScript Migration — Wave 8 — Economy, Roadmap and Diagnostics

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Base auditada

A Wave 8 foi preparada sobre o SHA `6576f4f1c8d567cabb393f653aac7a768f68abf4`, que já continha a Wave 7 publicada e o merge concorrente de documentação do main.

## Objetivo

Promover rotas leves com implementações TypeScript canônicas sem reescrever contratos de autenticação nem abrir a migração pesada de JARVIS, editor, jogos ou visão.

## Rotas migradas

| Rota | Implementação canônica | Export | Domínio Nexus |
|---|---|---|---|
| `/economia` | `src/pages/economia.ts` | `economiaPage` | `baluarte-economia` |
| `/roadmap` | `src/pages/roadmap.ts` | `roadmapPage` | `baluarte-shell` |
| `/diagnostico` | `src/pages/diagnostico.ts` | `diagnosticoPage` | `baluarte-core` |

As três origens foram atualizadas em `docs/nexus/dominios.json` no mesmo changeset que `src/main.js`.

## Decisão de escopo

`/perfil` e `/login` possuem implementações TypeScript disponíveis, porém foram mantidos fora desta onda porque atravessam autenticação Supabase, sessão e papéis do operador. Eles serão tratados em uma onda própria, com matriz de contrato e testes de login antes da promoção. `jarvis.js`, `editor.js`, `visao.js`, `jogos.js` e `batalha-naval.js` permanecem candidatos de maior acoplamento.

## Segurança e comportamento preservados

`/diagnostico` continua usando `src/core/permissions.js` e `src/core/politica.js` para conceder, revogar e exibir decisões em memória; a migração não alterou a política deny-by-default. `/economia` continua sem chamadas externas introduzidas nesta mudança. `/roadmap` continua sendo uma superfície informativa do shell. Nenhum segredo, serviço externo, RLS ou configuração foi alterado.

## Validação local

| Gate | Resultado |
|---|---|
| `npm run verificar-nexus` | Passou: 99 rotas, 0 lacunas, 0 divergências |
| `npm run tipos:ts` | Passou |
| `npm run tipos:v2` | Passou |
| `npm test` | Passou: 1085/1085 |
| `npm run build` | Passou; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | Passou: 21/21 após limpar previews órfãos |
| `npm run smoke` | Passou: 99/99 |
| `npm run caminho-critico` | Passou: 15/15 |
| Contratos de segurança | Passou: 39/39 |
| `git diff --check` | Passou |

A primeira execução de integração encontrou o mesmo timeout ambiental em `.cripto-entrada`, causado por processos Vite órfãos nas portas 4193/4194. Os processos foram encerrados e a repetição limpa passou em 21/21. O gate local `npm run v2:runtime` continua não executável neste ambiente porque Cargo 1.75.0 não interpreta a dependência com `edition2024`; isso é limitação de ferramenta local já conhecida, não falha da Wave 8. O workflow remoto V2 Runtime é o gate autoritativo e permanece necessário após publicação.

## Riscos e rollback

O risco principal é regressão de um consumidor que ainda importe o wrapper JavaScript. Nenhum wrapper foi removido. O rollback é reverter as três extensões no `src/main.js`, as três origens no `docs/nexus/dominios.json` e este documento. A política de permissões e os drivers de dados não foram modificados.

## Próximo passo

Publicar após inspeção de divergência com `origin/main`, monitorar os workflows remotos e então iniciar a auditoria específica de `/perfil` e `/login`.
