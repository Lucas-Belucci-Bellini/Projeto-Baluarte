# SUPABASE SECURITY ADVISOR AUDIT

**Status:** `AUDIT ONLY — NO REMOTE MUTATION`
**Data:** 2026-08-20
**Projeto:** `Lucas-Belucci-Bellini's Project`
**Project ref:** `hcwzsxdcvmswebunznak`
**Região:** `us-west-2`
**Estado observado:** `ACTIVE_HEALTHY`
**Branch do código:** `main`
**SHA do código observado:** `966d8da878b0135941c2f58b40091432f740a301`

> A imagem recebida mostrava avisos do Supabase Security Advisor. A auditoria reproduziu os advisors no projeto Supabase real, consultou metadados, definições SQL, grants, RLS, policies e consumers locais. Nenhum grant, função, policy, migration remota ou configuração Auth foi alterado.

## 1. Resumo executivo

O advisor retornou **13 lints**, agrupados em **três famílias de causa-raiz**: exposição de funções `SECURITY DEFINER` no schema `public`, proteção de senhas vazadas desativada no Supabase Auth e a tabela `subscription_events` com RLS ligado, porém sem policy. Não há `ERROR` no snapshot; todos os avisos vieram como `WARN`, e o lint da tabela veio como `INFO`.

Os 13 itens não são 13 vulnerabilidades independentes. `bump_view` e `bump_visits` aparecem em dois lints cada porque são executáveis por `anon` e `authenticated`; isso representa uma única decisão de exposição por RPC, não quatro causas distintas. As funções autenticadas de Veritas e tenant também formam uma família de contrato: elas são chamadas como RPCs ou por policies e contêm checks de identidade/ownership que não podem ser removidos sem testes.

A classificação atual é: **não revogar os grants dos contadores sem substituir o fluxo público**, **não revogar os grants autenticados usados por policies/RPCs sem mapear callers**, **endurecer o `search_path` das funções `SECURITY DEFINER` numa migration versionada**, **manter `subscription_events` fechado até existir contrato de acesso** e **habilitar leaked-password protection no painel Auth quando o plano/configuração do projeto permitir**.

## 2. Snapshot dos advisors

| Família | Nível | Quantidade retornada | Entidades |
|---|---:|---:|---|
| `anon_security_definer_function_executable` | `WARN` | 2 | `public.bump_view(text)`, `public.bump_visits()` |
| `authenticated_security_definer_function_executable` | `WARN` | 9 | Contadores, `buscar_juris`, `current_tenant_role` e cinco RPCs Veritas |
| `auth_leaked_password_protection` | `WARN` | 1 | Supabase Auth |
| `rls_enabled_no_policy` | `INFO` | 1 | `public.subscription_events` |

O snapshot bruto e as URLs retornadas estão preservados em [`SUPABASE_ADVISOR_SNAPSHOT_2026-08-20.md`](SUPABASE_ADVISOR_SNAPSHOT_2026-08-20.md).

## 3. Evidência remota coletada

### 3.1 Grants e `SECURITY DEFINER`

| Função | `SECURITY DEFINER` | `search_path` observado | `anon EXECUTE` | `authenticated EXECUTE` | Interpretação inicial |
|---|---:|---|---:|---:|---|
| `public.bump_view(text)` | sim | `pg_catalog, public` | sim | sim | RPC público intencional para page views; input possui regex |
| `public.bump_visits()` | sim | `pg_catalog, public` | sim | sim | RPC público intencional para contador global |
| `public.buscar_juris(uuid, vector, integer)` | sim | `pg_catalog, public, extensions` | não | sim | RAG condicionado a tenant e `nexus.is_member` |
| `public.current_tenant_role(uuid)` | sim | `pg_catalog, public` | não | sim | helper de policy baseado em `auth.uid()` |
| `public.veritas_add_circuit_collaborator(...)` | sim | `public, pg_temp` | não | sim | mutation protegida por owner check |
| `public.veritas_can_collaborate(uuid)` | sim | `public, pg_temp` | não | sim | predicate de ownership/collaboration |
| `public.veritas_can_edit_project(uuid)` | sim | `public, pg_temp` | não | sim | predicate de owner/editor |
| `public.veritas_is_project_owner(uuid)` | sim | `public, pg_temp` | não | sim | predicate de owner |
| `public.veritas_remove_circuit_collaborator(uuid, uuid)` | sim | `public, pg_temp` | não | sim | mutation protegida por owner check |

A evidência confirma que `anon` não executa os RPCs de tenant/Veritas e que `buscar_juris` já teve seu grant público revogado pela migration `20260711022335_nexus_buscar_juris_revoke_public.sql`. O problema residual não é “todas as funções estão públicas”; é a necessidade de justificar os RPCs autenticados e reduzir o risco de `search_path` mutável.

### 3.2 Corpos das funções

`bump_view` valida `p_route` contra `^/[a-z0-9/_-]{0,63}$` e somente faz upsert em `public.site_stats`. `bump_visits` atualiza somente a linha `visits` de `public.site_stats`. Os consumers locais possuem guardas em `sessionStorage`, mas essas guardas não impedem chamadas abusivas diretas à RPC.

`buscar_juris` filtra por `tenant_id`, exige `nexus.is_member(p_tenant)`, ignora embeddings nulos e limita o resultado entre 1 e 50. `current_tenant_role` busca o papel da linha de `tenant_members` cujo `user_id` é `auth.uid()`.

As funções Veritas fazem checks de ownership e colaboração com `auth.uid()`. `veritas_add_circuit_collaborator` rejeita usuário nulo, o próprio owner e papéis diferentes de `editor`/`viewer`; `veritas_remove_circuit_collaborator` exige owner; os predicates de leitura/edição diferenciam colaboração e papel `editor`.

### 3.3 RLS e policies

| Tabela | RLS | Force RLS | Policies observadas | Leitura inicial |
|---|---:|---:|---|---|
| `public.juris_doutrina` | ligado | não | `sel_juris`, `ins_juris`, `upd_juris`, `del_juris` | Proteção por papel do tenant |
| `public.tenant_members` | ligado | não | `sel_members`, `admin_owner_manage_members` | Usuário próprio ou admin/owner |
| `public.veritas_circuit_projects` | ligado | não | own/collaborator/editor/delete | Ownership e colaboração |
| `public.veritas_circuit_collaborators` | ligado | não | member select | Predicate de colaboração |
| `public.site_stats` | ligado | não | leitura pública | Escrita direta não possui policy |
| `public.subscription_events` | ligado | não | nenhuma | Sem leitura/escrita via API por policy; grant authenticated de SELECT está stale/sem efeito prático enquanto não houver policy |

O advisor `rls_enabled_no_policy` em `subscription_events` é portanto um **gap de contrato**, não prova de vazamento. A tabela tem `SELECT` concedido a `authenticated`, mas RLS sem policy continua negando acesso por API; `anon` não tem SELECT/INSERT. A tabela está fechada, porém a intenção futura precisa ser registrada antes de criar uma policy.

## 4. Causas-raiz e efeitos cascata

| ID | Causa-raiz | Efeitos cascata | Severidade | Arquitetural ou local | Estado |
|---|---|---|---|---|---|
| `SUPA-SD-001` | Funções `SECURITY DEFINER` em `public` com grants necessários ao produto e `search_path` não mínimo | 11 lints de grants, incluindo duplicidade anon/auth dos contadores | Alta para hardening; exploit não demonstrado | Contrato de banco/API | Confirmado |
| `SUPA-AUTH-001` | Leaked-password protection desativado na configuração Auth | Cadastro por senha pode aceitar credenciais já expostas; não afeta OAuth por si só | Média | Configuração remota | Confirmado; correção depende do painel/plano |
| `SUPA-RLS-001` | `subscription_events` tem RLS sem policy e grant autenticado stale | Advisor INFO; tabela inacessível por API, mas contrato de Billing fica ambíguo | Baixa imediata / média antes de Billing remoto | Contrato de dados | Confirmado |
| `SUPA-ABUSE-001` | RPCs anônimas de métricas podem ser chamadas diretamente sem rate limit server-side | `sessionStorage` reduz duplicidade normal, mas não abuso intencional | Média | Abuso/observabilidade | Risco residual, não resolvido nesta auditoria |

## 5. Decisão por finding

### `bump_view` e `bump_visits`

Classificação: `KEEP_PUBLIC_RPC — REVIEWED`. O site chama essas RPCs sem login, e as migrations e consumers confirmam que essa é a intenção funcional. Revogar `EXECUTE` quebraria contagem pública e exigiria substituir a superfície por Edge Function, rate limit, CAPTCHA ou outro mecanismo. A correção correta não é revogação cega.

O hardening recomendado é manter input validation, qualificar todas as relações, reduzir `search_path` para vazio e adicionar uma estratégia de abuso antes de declarar a telemetria pública pronta para escala. O fato de a chamada ocorrer via RPC não impede alguém de forjar chamadas; o guard de sessão do navegador não é um controle de segurança.

### RPCs autenticados de tenant/Veritas

Classificação: `AUTHENTICATED_RPC` ou `KEEP_INTERNAL_SECURITY_PRIMITIVE`, conforme a função. Os grants autenticados devem permanecer até que os callers sejam movidos para uma camada server-side ou até que as policies sejam redesenhadas. `current_tenant_role`, `veritas_can_collaborate`, `veritas_can_edit_project` e `veritas_is_project_owner` são usados por policies e não podem ser simplesmente revogados.

A correção mínima segura é hardening de `search_path` para `''`, com nomes de schema qualificados e preservação das assinaturas/grants. Em paralelo, devem existir testes de owner, editor, viewer, membro de outro tenant, usuário anônimo e project id inexistente.

### Leaked-password protection

Classificação: `AUTH_CONFIG — ACTION REQUIRED`. A documentação oficial informa que a proteção usa a API de senhas comprometidas do HaveIBeenPwned e que a opção está disponível no Pro Plan ou superior. Não há uma ferramenta de repositório que possa habilitar essa configuração com segurança; portanto ela não será simulada em SQL nem ativada por código. O operador deverá habilitá-la no painel Auth quando o plano permitir e depois repetir o advisor e os testes de cadastro/login.

### `subscription_events`

Classificação: `DENY_BY_DEFAULT — CONTRACT PENDING`. Não criar uma policy permissiva apenas para remover o INFO. Antes de Billing remoto, definir proprietário, tenant, evento, idempotency key, retenção, leitura do usuário, leitura do owner/admin e inserção exclusivamente server-side. Até lá, manter RLS sem policy é mais seguro que abrir leitura ou escrita.

## 6. Correção recomendada para a próxima onda

A próxima migration de segurança deverá ser pequena e reversível:

1. recriar as funções `SECURITY DEFINER` de aplicação com `set search_path = ''`;
2. qualificar `public.*`, `nexus.*`, `auth.*` e `extensions.*` usados nos corpos;
3. preservar assinaturas, retornos, grants intencionais e comportamento dos RPCs;
4. adicionar testes de grants e de autorização para cada função;
5. executar advisors novamente depois da migration;
6. não mudar Auth, `subscription_events` ou métricas públicas na mesma migration.

A migration não deve ser aplicada ao projeto remoto antes de validar os testes locais e confirmar que o Supabase CLI/branch de staging está disponível. Se não houver staging, a alteração deve ser publicada primeiro no repositório como migration pendente e a aplicação remota deve ser tratada como uma etapa separada com rollback explícito.

## 7. O que não foi alterado

Nenhuma função remota foi revogada, nenhuma `SECURITY DEFINER` foi trocada por `INVOKER`, nenhuma policy foi criada para `subscription_events`, nenhuma configuração Auth foi alterada e nenhum segredo foi lido ou adicionado. A imagem foi usada como sinal de investigação; os dados finais vieram do advisor e das queries somente leitura.

## Referências

[1]: https://supabase.com/docs/guides/database/functions "Supabase — Database Functions"
[2]: https://supabase.com/docs/guides/database/postgres/row-level-security "Supabase — Row Level Security"
[3]: https://supabase.com/docs/guides/auth/password-security "Supabase — Password security"
[4]: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable "Supabase — Security Advisor: authenticated SECURITY DEFINER executable"
[5]: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable "Supabase — Security Advisor: anon SECURITY DEFINER executable"
[6]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/docs/SUPABASE-SECURITY-FUNCTION-AUDIT.md "Baluarte — Supabase security function audit"
[7]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/supabase/migrations/20260711022335_nexus_buscar_juris_revoke_public.sql "Baluarte — revoke public buscar_juris"


## 8. Gate de staging

A consulta de branches encontrou somente a branch padrão `main`, com `preview_project_status: ACTIVE_HEALTHY`, porém `status: MIGRATIONS_FAILED` e sem dados. Não existe uma branch de staging saudável disponível para testar esta migration. Por isso, aplicar DDL diretamente no projeto principal seria uma alteração de produção sem rollback experimental e foi deliberadamente evitado.

A migration permanece versionada e testada por contrato no repositório. A aplicação remota deverá ocorrer somente depois de corrigir ou disponibilizar um ambiente de staging Supabase saudável, executar os testes de autorização e comparar o advisor antes/depois.


## 9. Publicação no main e validação

A auditoria, a migration versionada e os testes de contrato foram publicados diretamente no `main`.

**Commit publicado:** `a8e5a42c1a32dde352f51186ec049a73aa048e62`
**Estado final:** `HEAD == origin/main`; working tree limpo
**CI remota:** 8/8 workflows verdes — `Core CI`, `V2 Validation`, `CodeQL`, `Vigia das rotas`, `V2 Runtime`, `Security Contracts`, `CI` e `Arma 3 Data CI`.

Os gates locais passaram: Nexus `99 rotas / 0 lacunas / 21/21 domínios`, TypeScript V1/V2, testes de contrato Supabase `8/8`, suíte principal, build, integração V2 `21/21`, smoke `99/99` e caminho crítico `15/15`. O runtime Rust local continua com exit 101 por Cargo 1.75.0 e `edition2024`, enquanto o workflow remoto V2 Runtime passou.

A migration `20260820090000_security_definer_search_path_hardening.sql` está agora no repositório, mas **não foi aplicada ao banco remoto**. A única branch Supabase disponível está com `MIGRATIONS_FAILED`; aplicar DDL diretamente na produção sem staging saudável violaria o contrato de rollback. Portanto, o próximo passo operacional é recuperar/criar um ambiente de staging Supabase saudável, aplicar a migration ali, executar testes de autorização e só então avaliar aplicação no projeto principal.


O histórico remoto também diverge do checkout local. A reconciliação está documentada em [`SUPABASE_MIGRATION_DRIFT_AUDIT_2026-08-20.md`](SUPABASE_MIGRATION_DRIFT_AUDIT_2026-08-20.md); enquanto o status `MIGRATIONS_FAILED` persistir, nenhum DDL novo deve ser aplicado diretamente ao projeto principal.
