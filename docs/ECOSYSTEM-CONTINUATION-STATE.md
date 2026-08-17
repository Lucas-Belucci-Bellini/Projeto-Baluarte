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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O primeiro proof-of-concept continua sendo `TaxForge -> Baluarte -> Veritas`, mas a validação de consumidor ainda não foi comprovada.

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
- [x] Veritas provider inventory: MCP capabilities verificadas
- [x] validação negativa inicial no TaxForge: nenhuma evidência encontrada de consumo de Boolean evaluation/truth tables/simplification

## Veritas provider status

Veritas possui capabilities verificadas no MCP, incluindo:

- `veritas.logic.evaluate`
- `veritas.logic.truth_table`
- `veritas.logic.simplify`
- `veritas.logic.karnaugh`
- `veritas.circuit.simulate`

Porém, a inspeção do TaxForge não encontrou uma necessidade concreta para essas operações. Portanto, nenhuma capability Veritas deve entrar no registry de produção ainda.

Documento de referência:

`docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`

## ARK status

O ARK possui um domínio de hazards/evidências públicas e uma camada privada ARCA. A fronteira pública/privada deve ser preservada. O mapeamento para Supabase e o capability contract ainda precisam ser reconciliados com o estado real da branch/main antes de qualquer migration.

## Próximo passo EXATO

**Não fabricar o primeiro consumer Veritas. Fazer capability discovery orientado por necessidade real nos seis repositórios.**

Ordem:

1. procurar no TaxForge, ARK, DailyPlanner, AEGIS e Baluarte workflows que possam consumir uma capability Veritas já verificada;
2. se nenhum consumidor real aparecer, classificar Veritas como provider disponível e continuar discovery em outros pares projeto→provider;
3. escolher o primeiro par que tenha necessidade concreta;
4. identificar exatamente as tabelas/queries/serviços que implementam a capability;
5. auditar RLS, ownership e autorização;
6. definir o menor payload que atravessa o mesh;
7. definir provenance/evidence e confiança;
8. somente então desenhar tabelas de registry/requests/results para o caso concreto;
9. só depois propor migration não destrutiva no Supabase.

## Regras permanentes

- O Baluarte é o control plane/gateway arquitetural do mesh, mas não é dono dos domínios internos dos projetos.
- Nenhum projeto recebe SQL irrestrito no banco interno de outro projeto.
- Uma capability é publicada como contrato; sua implementação permanece privada.
- Identidade e tenant são avaliados antes da execução de uma capability.
- Fallback entre provedores é autorizado e limitado; não pode virar fan-out recursivo sem controle.
- Proveniência e confiança acompanham resultados que influenciam decisões relevantes.
- Funcionalidades semelhantes não precisam ser idênticas; Plan é opcional onde não fizer sentido.
- A topologia interna é documentação de engenharia privada; segurança real depende de autenticação, autorização, RLS, mínimo privilégio e auditoria.
- Não criar dependências artificiais entre projetos apenas para demonstrar o Mesh.

## Como retomar

Abrir primeiro este arquivo e depois:

- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-16
