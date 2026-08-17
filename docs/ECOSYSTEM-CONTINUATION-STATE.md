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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. A descoberta de capabilities continua em andamento; ainda não existe um primeiro consumer cross-project comprovado para colocar em produção.

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
- [x] discovery round 2 dos seis repositórios

## Estado por projeto

### Veritas
Provider real via MCP, com `veritas.logic.evaluate`, `veritas.logic.truth_table`, `veritas.logic.simplify`, `veritas.logic.karnaugh` e `veritas.circuit.simulate`. Nenhum consumer cross-project foi comprovado.

### ARK
Possui domínio de resiliência/hazards e camada ARCA privada. Pode fornecer dados públicos no futuro, mas qualquer integração deve preservar a separação público/privado.

### TaxForge
Possui workflows empresariais reais, incluindo supplier risk, mas o modelo atual não fornece contexto geográfico suficiente para justificar a hipótese TaxForge→ARK sem alteração de domínio.

### DailyPlanner
É deliberadamente client-side hoje: `localStorage`, import/export JSON, sem login, backend ou sincronização. Não adicionar Supabase apenas para o Mesh.

### AEGIS
A `main` atual contém apenas a especificação/prompt da IA. Não existe adapter executável de Mesh nesta branch.

### Baluarte
É o control plane/gateway arquitetural e a fonte de verdade do planejamento do ecossistema.

## Resultado da discovery round 2

Nenhum par cross-project atende ainda simultaneamente a:

1. consumer workflow existente;
2. provider capability implementada;
3. boundary de dados clara;
4. autorização identificável;
5. payload mínimo definível;
6. provenance preservável;
7. failure behavior especificável.

Portanto: **não criar registry/requests/results no Supabase ainda.**

Documento desta rodada:

`docs/ECOSYSTEM-DISCOVERY-ROUND-2.md`

## Próximo passo EXATO

1. Inspecionar as capabilities concretas já existentes no Baluarte, especialmente runtime, Task Manager, Event Bus e MCP/adapters.
2. Inspecionar as APIs/serviços reais do ARK para separar providers públicos concretos de material apenas documental.
3. Comparar essas capabilities com workflows concretos de TaxForge e Baluarte.
4. Procurar consumidores reais das capabilities do Veritas além do TaxForge.
5. Só aprovar o primeiro contrato cross-project quando houver evidência dos dois lados.
6. Quando houver um par provado, auditar RLS/ownership, definir payload mínimo e então desenhar o primeiro slice de registry no Supabase.

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

- `docs/ECOSYSTEM-DISCOVERY-ROUND-2.md`
- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-17
