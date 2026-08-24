# TaxForge — Schema Inventory

> Inventário do schema e dos consumidores observados durante a preparação da migração para Supabase/Postgres.

## Estado

Este documento é uma fotografia do repositório analisado em 2026-08-16. Ele não autoriza migração automática.

## Tabelas atuais

| Tabela | Domínio | Classificação atual | Evidência/consumidor |
|---|---|---|---|
| `users` | identidade local | substituir/alinha ao contrato Baluarte | `server/db.ts`, autenticação |
| `tax_scenario_workspaces` | TaxForge | manter/migrar | `server/db.ts`, `server/routers.ts` |
| `tax_workspace_events` | TaxForge | manter/migrar | `server/db.ts`, `server/routers.ts` |
| `tax_workspace_members` | TaxForge | manter/migrar | `server/db.ts`, `server/routers.ts` |
| `stocks` | stock-analysis | legado | `server/db.ts`, `server/routers.ts`, páginas de ações |
| `watchlist` | stock-analysis | legado | `server/db.ts`, `server/routers.ts`, `client/src/pages/Watchlist.tsx` |
| `stock_analysis` | stock-analysis | legado | `server/db.ts`, `server/routers.ts` |
| `price_history` | stock-analysis | legado | `server/db.ts`, `server/routers.ts` |
| `alerts` | stock-analysis | legado | `server/db.ts`, `server/routers.ts` |
| `notifications` | stock-analysis | legado | `server/db.ts`, `server/routers.ts` |
| `chat_history` | stock-analysis | legado | `server/db.ts`, `server/routers.ts` |
| `analysis_history` | stock-analysis | legado | `server/db.ts` |

## Achados importantes

1. O schema inteiro usa `drizzle-orm/mysql-core` e `drizzle-orm/mysql2`; portanto o alvo Supabase/Postgres exige uma remodelagem, não uma simples troca de conexão.
2. O domínio tributário remoto atual é pequeno: workspace, membros e eventos. Os payloads completos dos cenários continuam fora desse slice remoto.
3. `server/routers.ts` expõe simultaneamente `taxReform.*` e o antigo conjunto `stocks.*`, `watchlist.*`, `alerts.*`, `notifications.*` e `chat.*`.
4. O legado de ações ainda possui páginas e consumidores, portanto não deve ser apagado sem uma decisão de produto/migração.
5. O modelo atual de workspace usa `userId + companyKey` como eixo de acesso. O modelo definitivo deve migrar para organização/empresa + identidade compartilhada, com RLS no Postgres.
6. `scenarioIds` está armazenado como JSON no workspace. No modelo definitivo, versões e execuções de cenário devem possuir entidades próprias e relações normais.
7. `taxWorkspaceEvents` atualmente registra apenas `created/updated/deleted` e `scenarioCount`; isso é adequado como trilha mínima, mas não deve ser confundido com o futuro catálogo de eventos do Knowledge Mesh.

## Segurança encontrada para a remodelagem

Os procedimentos tributários já fazem checagem de acesso ao workspace antes de operações protegidas. O desenho Supabase deve manter essa propriedade no RLS, não depender somente do backend.

O inventário também indica que alguns procedimentos do legado devem ser revisados antes de qualquer exposição futura: operações como atualização de alerta/notificação precisam garantir ownership no servidor/RLS, em vez de confiar apenas no identificador recebido.

## Decisão

Não criar ainda as tabelas finais do Supabase.

Primeiro:

1. finalizar o mapa de consumidores do legado;
2. decidir se o stock-analysis permanece no produto ou é removido/extraído;
3. consolidar identidade/tenant com o Baluarte;
4. modelar o domínio tributário definitivo;
5. especificar RLS e testes de isolamento;
6. somente então escrever migrations Supabase.

## Próximo passo

**Concluir o mapa de consumidores das tabelas legadas e revisar o contrato de identidade/tenant do TaxForge antes de desenhar o DDL final.**
