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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O primeiro contrato de mesh está em `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`.

O contrato já define capability, knowledge request/result, discovery, autorização, referências externas, proveniência, eventos e falhas. O primeiro proof-of-concept continua sendo `TaxForge -> Baluarte -> Veritas`.

### Trabalho concluído nesta etapa

- [x] draft de `Capability Contract`
- [x] draft de `Knowledge Request`
- [x] draft de `Knowledge Result`
- [x] regras de provider discovery e fallback
- [x] boundary de autorização
- [x] external references
- [x] provenance/evidence
- [x] event envelope inicial
- [x] estados de falha
- [x] non-goals e regras de evolução
- [x] primeiro draft de `Identity & Tenant Contract v1`

Novo documento:

`docs/ECOSYSTEM-IDENTITY-TENANT-CONTRACT-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`.

Commit do novo contrato:

`d5dbf754cbd8774f2865d1157ae5be8cb6fb7ef4`

## Próximo passo EXATO

**Revisar o Identity/Tenant Contract contra o modelo real do Supabase antes de criar qualquer tabela do mesh.**

Ordem:

1. comparar `principal_id / organization_id / project_id` do contrato com `auth.users`, `tenants`, `tenant_members` e ownership atual;
2. identificar onde Veritas ainda usa `user_id` diretamente;
3. validar as 23 tabelas `taxforge_*` e suas RLS policies;
4. definir o mínimo de identidade que pode ser compartilhado sem expor schemas internos;
5. depois desenhar o `capability_registry` lógico;
6. depois definir `external_reference`;
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
- `docs/ECOSYSTEM-MESH-CONTRACTS-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-IDENTITY-TENANT-CONTRACT-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`
- `docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-16
