# SUPABASE STAGING RECOVERY PLAN

**Status:** `WAITING FOR OPERATOR CONFIRMATION / NO BRANCH CREATED`
**Data:** 2026-08-20
**Projeto:** `hcwzsxdcvmswebunznak`
**Organização:** `Lucas-Belucci-Bellini's Org`
**Plano atual:** `free`

## Objetivo

Disponibilizar um ambiente Supabase isolado para reconciliar o histórico de migrations, testar o hardening das funções `SECURITY DEFINER` e validar Auth/RLS/Billing sem executar DDL diretamente no projeto principal.

## Estado conhecido

O projeto principal está `ACTIVE_HEALTHY`, mas o único registro de branch disponível está em `MIGRATIONS_FAILED`. O histórico remoto possui 89 migrations, enquanto o checkout versiona 17. Não existe staging saudável no momento.

O Supabase informou custo estimado de **US$ 0,01344 por hora** para uma branch. Nenhuma branch foi criada nesta etapa. A criação exige confirmação explícita do operador porque pode gerar cobrança recorrente enquanto permanecer ativa.

## Gate de confirmação

Antes de criar a branch, o operador precisa confirmar que compreende o custo estimado de **US$ 0,01344/hora** e autorizar a criação de uma branch de desenvolvimento. Sem essa confirmação, não executar `create_branch`.

A branch deve ser temporária, sem dados de produção, e precisa receber um nome inequívoco, como `baluarte-security-reconciliation`. Ao concluir os testes, deve ser pausada, expirada ou removida conforme o resultado e a preferência do operador.

## Sequência autorizada após confirmação

| Ordem | Ação | Critério de saída |
|---:|---|---|
| 1 | Criar branch Supabase isolada | Branch criada e status monitorado |
| 2 | Confirmar status de migrations | Não iniciar DDL enquanto o status não estiver saudável |
| 3 | Reproduzir/inventariar schema e migrations | Drift local/remoto documentado |
| 4 | Aplicar somente migration de hardening | `search_path` e grants validados |
| 5 | Executar testes de Auth, RLS, tenant e Veritas | Casos allow/deny comprovados |
| 6 | Rodar Security Advisor antes/depois | Diferenças classificadas, não apenas contadas |
| 7 | Decidir importação/reconciliação do histórico | Fonte canônica escolhida |
| 8 | Encerrar branch | Sem custo residual e resultado documentado |

## Regras de segurança

A branch não deve receber dados de produção. Nenhum segredo deve ser inserido no frontend. Nenhuma chave de ingestão deve aparecer em SQL, logs ou documentação pública. Nenhuma policy permissiva deve ser criada apenas para silenciar `rls_enabled_no_policy`. Nenhum grant `EXECUTE` deve ser reaberto apenas para eliminar erros de PostgREST.

A migration `20260820090000_security_definer_search_path_hardening.sql` não deve ser aplicada no projeto principal antes de ser executada e testada na branch saudável. O mesmo vale para alterações de `subscription_events`, Auth leaked-password protection e Billing remoto.

## Rollback

O rollback primário é não aplicar a migration no projeto principal. Na branch, qualquer falha deve resultar em descarte/reset da branch, não em correção manual no banco de produção. Se uma decisão posterior exigir publicação, ela deve ser versionada no repositório, passar pelos gates locais/remotos e ser aplicada com uma migration idempotente e observável.

## Referências

[1]: https://supabase.com/docs/guides/deployment/branching "Supabase — Branching"
[2]: https://supabase.com/docs/guides/database/migrations "Supabase — Database Migrations"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/docs/v2/SUPABASE_MIGRATION_DRIFT_AUDIT_2026-08-20.md "Baluarte — Supabase Migration Drift Audit"
