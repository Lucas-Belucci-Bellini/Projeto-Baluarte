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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O primeiro proof-of-concept ainda não foi escolhido: a validação de `TaxForge -> Baluarte -> Veritas` não encontrou consumidor concreto para as capabilities de lógica atualmente verificadas no Veritas.

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
- [x] discovery inicial nos seis projetos: não criar capability artificial apenas para demonstrar o mesh
- [x] ARK provider discovery inicial: hazards/evidências públicas são candidatos, mas consumidor/interface ainda não confirmados
- [x] AEGIS provider discovery inicial: o repositório atual comprova a especificação/prompt do agente, mas não uma API/MCP provider estável
- [x] Baluarte V2 platform primitive discovery: Event Bus, Module System/Registry, Permission System, Storage/Data Layer e External API aparecem como fundamentos arquiteturais no V2 Master Plan

## Baluarte platform primitives — novo estado

`docs/ECOSYSTEM-BALUARTE-PLATFORM-PRIMITIVES-V1.md` registra o resultado da rodada. O `docs/v2/V2_MASTER_PLAN.md` confirma que o Baluarte V2 foi desenhado para módulos externos e contratos/API, com isolamento, permissões separadas da funcionalidade e sem acesso de módulos aos detalhes internos de outros módulos.

Primitivas candidatas:

- Module contract / registry
- Event Bus
- Permission System
- Storage / Data Layer
- External API boundary
- Audit / diagnostics / observability

Essas são **primitivas arquiteturais candidatas**, não devem ser tratadas como serviços externos prontos sem verificar implementação e testes concretos.

## Veritas provider status

Veritas possui capabilities verificadas no MCP, incluindo:

- `veritas.logic.evaluate`
- `veritas.logic.truth_table`
- `veritas.logic.simplify`
- `veritas.logic.karnaugh`
- `veritas.circuit.simulate`

A inspeção atual do TaxForge não encontrou necessidade concreta para essas operações. Portanto, não colocar essas capabilities no registry de produção ainda.

## DailyPlanner status

O DailyPlanner continua deliberadamente client-side, com `localStorage`, sem login, backend ou sincronização entre dispositivos. Não criar Supabase apenas para o mesh enquanto o requisito continuar client-side.

## ARK status

O ARK possui um domínio de hazards/evidências públicas e uma camada privada ARCA. A fronteira pública/privada deve ser preservada. Candidatos conceituais incluem observação/pesquisa de hazards e proveniência, mas nenhum deve virar capability de produção antes de existir consumidor + interface + autorização.

## AEGIS status

AEGIS define um fluxo forte de investigação: observe → entenda → investigue → prove → corrija → teste → verifique → documente. O README atual é uma especificação detalhada do agente. O novo registro está em `docs/ECOSYSTEM-AEGIS-PROVIDER-DISCOVERY-V1.md`. Não registrar AEGIS como provider de produção até existir implementação executável e interface estável (API/MCP/etc.).

## TaxForge status

TaxForge é o principal consumidor candidato por seu domínio de cenários, evidências, fornecedores, contratos e decisões. A investigação deve procurar uma necessidade que já exista no produto antes de introduzir uma integração externa.

## Próximo passo EXATO

**Verificar as implementações concretas das primitivas V2 do Baluarte e, em paralelo, mapear necessidades externas reais do TaxForge.**

Ordem:

1. localizar implementação + testes do Event Bus;
2. localizar Module Registry/contract e lifecycle;
3. localizar enforcement do Permission System;
4. localizar Storage/Data Layer e Evidence Layer;
5. localizar a fronteira External API/MCP;
6. mapear no TaxForge módulos/serviços que pedem conhecimento ou processamento externo;
7. comparar essas necessidades com ARK, AEGIS e Veritas;
8. escolher o primeiro par somente quando houver consumidor + provider + interface real;
9. identificar exatamente os dados e autorização necessários;
10. definir o menor payload e provenance;
11. só então desenhar registry/requests/results para o caso concreto;
12. só depois propor migration não destrutiva no Supabase.

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
- Não criar uma segunda implementação de Event Bus, Storage ou Permission Manager no Baluarte sem justificar arquiteturalmente.

## Como retomar

Abrir primeiro este arquivo e depois:

- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`
- `docs/ECOSYSTEM-ARK-PROVIDER-DISCOVERY-V1.md`
- `docs/ECOSYSTEM-AEGIS-PROVIDER-DISCOVERY-V1.md`
- `docs/ECOSYSTEM-BALUARTE-PLATFORM-PRIMITIVES-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-17
