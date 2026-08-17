# Baluarte — Ecosystem Continuation State

> Ponto oficial de retomada entre conversas. Atualizar sempre que uma etapa relevante for concluída.

## Objetivo

Manter no Projeto-Baluarte o estado mínimo necessário para retomar o trabalho do ecossistema sem depender da memória da conversa.

## Repositórios acompanhados

- `Lucas-Belucci-Bellini/taxforge`
- `Lucas-Belucci-Bellini/Ark-Initiative`
- `Lucas-Belucci-Bellini/DailyPlanner`
- `Lucas-Belucci-Bellini/AEGIS`
- `Lucas-Belucci-Bellini/Projeto-Baluarte`
- `Lucas-Belucci-Bellini/Veritas`

## Estado atual — mesh

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O primeiro proof-of-concept continua sendo `TaxForge -> Baluarte -> Veritas`.

### Trabalho concluído

- [x] Capability / Knowledge Request / Result contracts
- [x] provider discovery, fallback e authorization boundary
- [x] external references e provenance/evidence
- [x] event envelope inicial e failure states
- [x] Identity & Tenant Contract v1
- [x] auditoria do modelo real de identidade/tenant no Supabase
- [x] confirmação de que `auth.users`, `tenants` e `tenant_members` devem ser reutilizados
- [x] confirmação de que não devemos criar `mesh_users` ou `mesh_tenants`
- [x] RPC body audit
- [x] EXECUTE grants audit das RPCs selecionadas
- [x] RLS audit inicial de `tenants`, `tenant_members`, `juris_doutrina` e Veritas collaborators
- [x] decisão de manter autorização de domínio separada de capability do mesh

Documento mais recente:

`docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md` na branch `docs/rpc-rls-classification-v1`.

Commit:

`206c014768c5fb9cdddee7454b171bddfb5c6d67`

## Descobertas de segurança relevantes

- `current_tenant_role` é `SECURITY DEFINER`, mas está restrita a `authenticated`, `postgres` e `service_role` e consulta a associação do próprio `auth.uid()` ao tenant solicitado.
- `buscar_juris` é `SECURITY DEFINER`, está restrita a `authenticated`, `postgres` e `service_role`, filtra pelo tenant e exige membership.
- RPCs de colaboração do Veritas são autenticadas e derivam autorização do usuário/projeto.
- `bump_view` e `bump_visits` possuem `EXECUTE` para `anon`; continuam classificadas como telemetria, não capabilities do mesh. Não alterar sem decisão de produto.
- `tenants` possui SELECT autenticado condicionado a membership.
- `tenant_members` restringe leitura ao próprio membro ou admin/owner e mutações a admin/owner.
- `juris_doutrina` possui RLS por `tenant_id` e papel.
- `veritas_circuit_collaborators` possui SELECT condicionado a autorização de colaboração.

## Próximo passo EXATO

**Completar a matriz de segurança do primeiro provider antes de qualquer migration do mesh.**

Ordem:

1. escolher a primeira capability real que TaxForge solicitará ao Veritas;
2. identificar exatamente as tabelas/queries que implementam essa capability;
3. auditar todas as RLS policies e ownership checks dessas tabelas;
4. definir o menor resultado que pode atravessar o mesh;
5. definir provenance/evidence e confiança do resultado;
6. então desenhar `ecosystem_projects`, `ecosystem_capabilities` e `ecosystem_capability_grants` para esse caso concreto;
7. depois preparar `ecosystem_requests`, `ecosystem_results` e `external_references`;
8. somente então propor uma migration não destrutiva.

## Regras permanentes

- O Baluarte é o control plane/gateway arquitetural do mesh, mas não é dono dos domínios internos dos projetos.
- Nenhum projeto recebe SQL irrestrito no banco interno de outro projeto.
- Uma capability é publicada como contrato; sua implementação permanece privada.
- Identidade e tenant são avaliados antes da execução de uma capability.
- Fallback entre provedores é autorizado e limitado; não pode virar fan-out recursivo sem controle.
- Proveniência e confiança acompanham resultados que influenciam decisões relevantes.
- Funcionalidades semelhantes não precisam ser idênticas; Plan é opcional onde não fizer sentido.
- A topologia interna é documentação de engenharia privada; segurança real depende de autenticação, autorização, RLS, mínimo privilégio e auditoria.

## Como retomar

Abrir primeiro este arquivo e depois:

- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md`
- `docs/ECOSYSTEM-IDENTITY-TENANT-CONTRACT-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-16
