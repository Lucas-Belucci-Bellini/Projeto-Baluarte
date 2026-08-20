# Supabase Security Audit — V2

## Estado

Auditoria inicial somente leitura. Nenhuma função de produção foi alterada nesta etapa.

## Inventário observado

O projeto possui funções `SECURITY DEFINER` nos schemas `nexus`, `public`, `pgbouncer` e `vault`.

### Funções de aplicação que exigem revisão

- `nexus.is_member(uuid)`
- `nexus.resolve_tenant(text, text)`
- `public.bump_view(text)`
- `public.bump_visits()`
- `public.buscar_juris(uuid, vector, integer)`
- `public.ingest_event(text, text, text, jsonb, text)`
- `public.ingest_memory(text, text, text, text[], text)`
- `public.ingest_stat(text, text, text, numeric, jsonb, date)`
- `public.comms_rate_limit()`
- `public.handle_new_user()`
- `public.rls_auto_enable()`

As funções internas de `pgbouncer` e `vault` não devem ser alteradas como parte desta auditoria de aplicação sem evidência de que a alteração é necessária.

## Regra de não alteração

`SECURITY DEFINER` não é, sozinho, evidência de vulnerabilidade. Antes de trocar para `SECURITY INVOKER` ou alterar grants, documentar:

1. caller e role esperado;
2. tabelas acessadas;
3. necessidade real de privilégios elevados;
4. `search_path` efetivo;
5. grants para `anon`, `authenticated` e `service_role`;
6. políticas RLS das tabelas acessadas;
7. testes de regressão.

## Próxima auditoria

Prioridade alta para `ingest_*`, `buscar_juris`, `nexus.resolve_tenant` e `nexus.is_member`, por atravessarem fronteiras de tenant ou aceitarem parâmetros controlados pelo chamador.

Não alterar produção até concluir a análise de grants, RLS e `search_path`.


## Refresh 2026-08-20 — Security Advisor real

O snapshot do projeto `hcwzsxdcvmswebunznak` retornou 13 lints: 12 WARN relacionados a execução de funções `SECURITY DEFINER` e leaked-password protection, além de 1 INFO para `subscription_events` com RLS sem policy. Os detalhes reproduzíveis, grants, corpos SQL, policies e consumers estão em [`SUPABASE_SECURITY_ADVISOR_AUDIT_2026-08-20.md`](SUPABASE_SECURITY_ADVISOR_AUDIT_2026-08-20.md) e [`SUPABASE_ADVISOR_SNAPSHOT_2026-08-20.md`](SUPABASE_ADVISOR_SNAPSHOT_2026-08-20.md).

A Wave de hardening foi preparada no repositório em `supabase/migrations/20260820090000_security_definer_search_path_hardening.sql`. Ela fixa `search_path = ''` e qualifica relações, mas não foi aplicada remotamente nesta etapa. Os grants intencionais dos contadores públicos, os RPCs autenticados de Veritas/tenant, `subscription_events` e Auth permanecem separados para evitar quebra ou abertura acidental.

A regra operacional continua sendo: não revogar `EXECUTE`, criar policy ou alterar Auth apenas para zerar o dashboard. Primeiro validar callers, staging, RLS, rollback e testes; depois aplicar a migration no ambiente correto e rodar novamente o advisor.
