# Supabase Security Advisor Snapshot — 2026-08-20

**Projeto:** Lucas-Belucci-Bellini's Project
**Project ref:** `hcwzsxdcvmswebunznak`
**Região:** `us-west-2`
**Status observado:** `ACTIVE_HEALTHY`
**Fonte:** Supabase Management MCP, `get_advisors(type=security)`
**Observação:** somente leitura; nenhuma função, grant, RLS policy ou configuração Auth foi alterada durante a coleta.

## Findings retornados

| Tipo | Nível | Quantidade | Entidades |
|---|---:|---:|---|
| `anon_security_definer_function_executable` | WARN | 2 | `public.bump_view(text)`, `public.bump_visits()` |
| `authenticated_security_definer_function_executable` | WARN | 9 | `public.bump_view(text)`, `public.bump_visits()`, `public.buscar_juris(uuid, vector, integer)`, `public.current_tenant_role(uuid)`, `public.veritas_add_circuit_collaborator(uuid, uuid, text)`, `public.veritas_can_collaborate(uuid)`, `public.veritas_can_edit_project(uuid)`, `public.veritas_is_project_owner(uuid)`, `public.veritas_remove_circuit_collaborator(uuid, uuid)` |
| `auth_leaked_password_protection` | WARN | 1 | Supabase Auth |
| `rls_enabled_no_policy` | INFO | 1 | `subscription_events` |

Os 12 avisos acima não devem ser tratados como 12 causas-raiz independentes. Há três famílias: grants de `SECURITY DEFINER` expostos no schema `public`, proteção de senha vazada desativada no Auth e uma tabela RLS sem policy. A classificação final depende de caller esperado, tabelas acessadas, necessidade de privilégio elevado, `search_path`, grants, RLS e consumidores reais.

## Remediation URLs retornadas

- `anon_security_definer_function_executable`: <https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable>
- `authenticated_security_definer_function_executable`: <https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable>
- `auth_leaked_password_protection`: <https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection>

## Regra de auditoria

O advisor é um sinal de exposição e não prova sozinho que uma função esteja explorável. Antes de revogar `EXECUTE`, trocar `SECURITY DEFINER` por `SECURITY INVOKER` ou criar policy, é necessário correlacionar a migration/definição da função, o caller do produto, a intenção pública/anônima, o `search_path`, as tabelas acessadas, as policies e testes de regressão. A única alteração segura nesta etapa é documentação e investigação.

## Referências locais

- `docs/v2/SUPABASE_SECURITY_AUDIT.md`
- `docs/v2/SUPABASE-RLS-TAXFORGE-AUDIT.md`
- `docs/v2/MASTER_GAP_ANALYSIS.md`

**Autor:** Manus AI
