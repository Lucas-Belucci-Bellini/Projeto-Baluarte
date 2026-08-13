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
