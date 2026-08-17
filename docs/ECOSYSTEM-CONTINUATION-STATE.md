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

### Trabalho concluído nesta etapa

- [x] Capability / Knowledge Request / Result contracts
- [x] provider discovery, fallback e authorization boundary
- [x] external references e provenance/evidence
- [x] event envelope inicial e failure states
- [x] Identity & Tenant Contract v1
- [x] auditoria do modelo real de identidade/tenant no Supabase
- [x] confirmação de que `auth.users`, `tenants` e `tenant_members` devem ser reutilizados
- [x] confirmação de que não devemos criar `mesh_users` ou `mesh_tenants`
- [x] definição do próximo domínio aditivo: projects, capabilities, grants, external references e requests/results

Novo documento desta etapa:

`docs/SUPABASE-IDENTITY-TENANT-AUDIT.md` na branch `docs/supabase-identity-tenant-audit`.

Documento de continuação/schema:

`docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md` na branch `docs/supabase-identity-tenant-audit`.

Commit da auditoria:

`fde3aba83b4dbb32a4abe7195fe3e4da73e40513`

Commit do schema-next:

`af74e1552efcd701105efde7881dc0b732438b25`

## Próximo passo EXATO

**Validar as RLS policies e funções de autorização das tabelas de identidade/tenant, TaxForge e Veritas antes de qualquer migration do mesh.**

Ordem:

1. revisar policies de `tenants` e `tenant_members`;
2. revisar policies das tabelas `taxforge_*` e confirmar isolamento por `tenant_id`;
3. revisar onde Veritas usa `user_id` diretamente e separar ownership de autorização de mesh;
4. classificar funções/RPCs de autorização como public/authenticated/service-only;
5. então desenhar o `ecosystem_projects` e `ecosystem_capabilities` lógicos;
6. depois `capability_grants` e `external_references`;
7. depois preparar o proof `TaxForge -> Baluarte -> Veritas`;
8. somente então propor migration não destrutiva.

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
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md` na branch `docs/supabase-identity-tenant-audit`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-IDENTITY-TENANT-CONTRACT-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md` na branch `docs/supabase-identity-tenant-audit`
- `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`
- `docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-16
