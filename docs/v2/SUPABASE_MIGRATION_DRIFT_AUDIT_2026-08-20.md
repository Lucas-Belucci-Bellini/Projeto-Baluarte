# SUPABASE MIGRATION DRIFT AUDIT

**Status:** `DIAGNOSTIC ONLY — NO REMOTE MUTATION`
**Data:** 2026-08-20
**Projeto:** `Lucas-Belucci-Bellini's Project`
**Project ref:** `hcwzsxdcvmswebunznak`
**Branch do código:** `main`
**SHA do código:** `b4371a349d59786b9dbdf9da807521e8c58bfd96`

> O projeto remoto e o checkout local não possuem o mesmo inventário de migrations. Esta divergência precisa ser resolvida antes de aplicar `20260820090000_security_definer_search_path_hardening.sql` ou qualquer DDL nova no banco principal.

## 1. Evidência

| Fonte | Quantidade | Observação |
|---|---:|---|
| `supabase/migrations/*.sql` no checkout | 17 | Primeiro arquivo `20260622033728`; último local `20260820090000` |
| Histórico retornado por `list_migrations` | 89 | Primeiro `20260622033728`; último remoto `20260817010913` |
| Migrations remotas ausentes no checkout | 74 | Incluem camadas Knowledge, Skill, Billing, Veritas, Rooms e TaxForge |
| Migrations locais ausentes no histórico remoto | 2 | `20260819060000_billing_foundation` e `20260820090000_security_definer_search_path_hardening` |
| Branch Supabase disponível | 1 | Somente `main`/default |
| Estado da branch disponível | `MIGRATIONS_FAILED` | `preview_project_status` reportado como `ACTIVE_HEALTHY`, mas migration status falhou |
| Branch de staging saudável | 0 | Não há ambiente seguro para validar DDL |

O histórico remoto mostra que, depois de `20260814034533_site_security_performance_hardening`, foram aplicadas dezenas de migrations que não existem no checkout local. Elas incluem `harden_security_definer_search_paths`, `remove_public_function_execute_defaults`, `harden_ingestion_rpcs`, `harden_juris_search_rpc_v2`, `create_billing_entitlements_foundation`, `veritas_circuit_*`, `room_001_*` e `taxforge_*`.

O checkout local contém `billing_foundation` e a nova migration `security_definer_search_path_hardening`, mas esses nomes/versões não aparecem no histórico retornado do projeto remoto. Não é seguro inferir que sejam equivalentes às migrations remotas apenas por semelhança funcional.

## 2. Causa-raiz provável

O banco Supabase recebeu migrations de outro fluxo de trabalho, agente ou checkout entre 14 e 17 de agosto, enquanto o repositório principal conservou somente um subconjunto de migrations. O projeto remoto é, portanto, uma fonte de estado aplicada mais ampla que o diretório `supabase/migrations` atualmente versionado.

A branch padrão também carrega o estado `MIGRATIONS_FAILED`, o que indica que há falha de aplicação ou inconsistência no pipeline de branch. Sem logs de migration detalhados, não é possível declarar qual arquivo falhou nem se o problema foi SQL inválido, ordem, duplicação de objeto, dependência, conflito de nome ou estado parcial.

## 3. O que não pode ser feito agora

Não aplicar a migration de `search_path` diretamente no projeto principal. Não resetar a branch. Não deletar a branch. Não executar `reset_branch`, `rebase_branch`, `merge_branch` ou `apply_migration` sem preservar o inventário e obter um ambiente de teste saudável. Não copiar as 74 migrations remotas para o checkout sem recuperar seus conteúdos e revisar ordenação, licença, origem e efeitos.

A simples criação de uma policy para `subscription_events`, a revogação global de EXECUTE ou a alteração de Auth também estão bloqueadas pelo mesmo drift. O dashboard Advisor deve ser interpretado junto com o schema efetivamente aplicado, não apenas com o SQL local.

## 4. Plano de recuperação seguro

A recuperação recomendada é uma operação de reconciliação, não uma nova migration cega:

1. Exportar o inventário remoto completo com versão, nome, status e conteúdo disponível, preservando o snapshot original.
2. Obter logs da falha `MIGRATIONS_FAILED` e identificar a migration exata e o statement que falhou.
3. Recuperar ou reconstruir, a partir de fonte confiável, as 74 migrations ausentes do checkout; não gerar SQL equivalente por memória.
4. Comparar funções, tabelas, grants, policies, extensions, views e triggers entre o banco remoto e o estado versionado.
5. Criar uma branch Supabase de desenvolvimento saudável ou outro staging explícito; não usar a branch default quebrada como staging.
6. Reaplicar/reproduzir o histórico em staging, validar `pgTAP`/contratos de Auth, tenant, Veritas, Billing e RLS, e somente depois testar a migration de hardening.
7. Atualizar o repositório com a fonte canônica reconciliada, registrar owners e decidir se o histórico deve ser importado, squashed com prova ou mantido como baseline externa.
8. Reexecutar `get_advisors(type=security)` antes e depois, sem exigir que avisos intencionais de RPC público desapareçam artificialmente.

## 5. Estado da correção publicada

A migration local `supabase/migrations/20260820090000_security_definer_search_path_hardening.sql` foi publicada no `main` como proposta versionada e possui testes de contrato locais. Ela não foi aplicada ao Supabase remoto. Isso é intencional: a migration não deve atravessar uma fronteira de produção quando o histórico aplicado está 74 arquivos à frente/fora do checkout.

A release do código continua funcional porque nenhuma alteração remota foi feita nesta etapa. A correção de código e documentação foi publicada em `main` e validada pela CI, mas o estado do banco permanece `REMOTE_SCHEMA_UNRECONCILED`.

## 6. Próximo gate obrigatório

O próximo gate não é “zerar o advisor”; é `SUPABASE_SCHEMA_RECONCILED`: inventário remoto recuperado, migration failure identificado, staging saudável disponível, teste de autorização executado, rollback conhecido e diferença entre grants/policies documentada.

Até esse gate passar, manter:

| Domínio | Postura |
|---|---|
| `bump_view` / `bump_visits` | RPC público intencional, com hardening versionado pendente de staging |
| Veritas/tenant | Grants autenticados preservados; não revogar sem testar policies |
| `subscription_events` | RLS sem policy e sem abertura de acesso |
| Auth leaked-password protection | Ação manual no painel quando plano permitir; não simular em SQL |
| Billing remoto | Desligado; nenhum write remoto novo |
| Supabase migrations | Sem aplicação cega no projeto principal |

## Referências

[1]: https://supabase.com/docs/guides/database/migrations "Supabase — Database Migrations"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase — Row Level Security"
[3]: https://supabase.com/docs/guides/database/functions "Supabase — Database Functions"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/docs/v2/SUPABASE_SECURITY_ADVISOR_AUDIT_2026-08-20.md "Baluarte — Supabase Security Advisor Audit"


## 6.1 Evidência de logs recentes

A consulta read-only aos `postgres_logs` das últimas 24 horas retornou 100 registros, todos com `permission denied for function ingest_stat` e SQLSTATE `42501`, originados pelo PostgREST/role `authenticator`. Não apareceu nessa janela uma mensagem explícita de falha de migration, statement DDL inválido, conflito de objeto ou erro de schema.

A interpretação mais provável é **efeito esperado do hardening remoto**: o histórico remoto inclui `lock_down_ingestion_rpc_execution`, e as funções `ingest_*` foram classificadas como service-only. O log demonstra que algum caller HTTP ainda tenta chamar `ingest_stat` pela API pública, mas não demonstra que a função deva voltar a ser pública. O contrato seguro continua sendo rejeitar a chamada e mover o caller autorizado para uma fronteira server-side/controlada.

Esse finding deve ser tratado separadamente do `MIGRATIONS_FAILED`: ele é um evento de autorização em runtime, não a causa comprovada do drift de migrations. Não foi feita nenhuma alteração de grant para silenciar os registros.


## 6.2 Capacidade e custo de staging

O projeto está na organização `Lucas-Belucci-Bellini's Org`, atualmente no plano `free`. O Supabase informou custo estimado de **US$ 0,01344 por hora** para uma branch de desenvolvimento. Nenhuma branch foi criada, pois isso pode gerar cobrança e exige confirmação explícita do operador após revisar o custo.

Enquanto não houver confirmação e uma branch saudável, o trabalho seguro continua sendo reconciliação documental, recuperação do inventário e testes de contrato no repositório. O projeto principal remoto permanece `ACTIVE_HEALTHY`, mas isso não invalida o status separado de `MIGRATIONS_FAILED` observado na única branch registrada.


O procedimento operacional e o gate de custo estão detalhados em [`SUPABASE_STAGING_RECOVERY_PLAN.md`](SUPABASE_STAGING_RECOVERY_PLAN.md). A criação de branch permanece pendente de confirmação explícita do operador.
