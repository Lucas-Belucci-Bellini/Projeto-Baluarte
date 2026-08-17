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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. Ainda não existe um primeiro par cross-project comprovado. O próximo par em investigação é `TaxForge -> ARK`, mas permanece candidato até existir um consumer real no código do TaxForge.

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
- [x] TaxForge MCP implementation audit
- [x] ARK public hazard implementation audit
- [x] TaxForge ↔ ARK discovery v1 documentado como hipótese não comprovada

## Veritas provider status

Veritas possui capabilities verificadas no MCP, incluindo:

- `veritas.logic.evaluate`
- `veritas.logic.truth_table`
- `veritas.logic.simplify`
- `veritas.logic.karnaugh`
- `veritas.circuit.simulate`

Porém, a inspeção dos consumidores atuais não encontrou uma necessidade concreta para essas operações. Nenhuma capability Veritas deve entrar no registry de produção ainda.

Documento de referência:

`docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`

## TaxForge ↔ ARK status

TaxForge possui MCP, mas a implementação observada é principalmente uma camada de auditoria/qualidade do próprio repositório. Ela não é ainda um gateway de consumo de capabilities externas.

ARK possui uma capability candidata de dados públicos de hazards (`ark.hazards.public_snapshot`) baseada em GDACS/USGS, com provenance e cache. A camada privada ARCA permanece fora do Mesh.

Documento de referência:

`docs/ECOSYSTEM-TAXFORGE-ARK-DISCOVERY-V1.md`

Status: `CANDIDATE — NOT PROVEN`.

## Próximo passo EXATO

**Validar se existe no TaxForge um workflow real que consuma inteligência pública de hazards do ARK.**

Se existir:

1. identificar o ponto exato do produto que precisa do dado;
2. definir o menor payload de entrada;
3. definir o resultado e provenance;
4. auditar autorização/RLS/ownership;
5. desenhar o contrato cross-project;
6. só então estudar registry/request/result no Supabase.

Se não existir:

1. rejeitar TaxForge → ARK como integração artificial;
2. manter ARK como provider disponível;
3. continuar discovery de outros pares entre os seis repositórios.

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
- `docs/ECOSYSTEM-TAXFORGE-ARK-DISCOVERY-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-17
