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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. Até a Round 014 ainda não existe um primeiro proof-of-concept cross-project que justifique produção.

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
- [x] Nexus implementation discovery: `src/nexus/orquestrador.js` implementa composição de manifestos, validação de contrato, dependências, ciclos, colisões de rotas e inicialização
- [x] Nexus contract audit: `docs/NEXUS-CONTRATO.md` confirma isolamento entre domínios e contrato único de entrada (`baluarte.module.js`)
- [x] Event Bus implementation audit: `src/core/events.ts` é a implementação canônica com `on`, `once`, `off`, `emit`, curingas e isolamento de handlers
- [x] Event catalogue generator audit: `scripts/gen-catalogo-eventos.mjs` deriva eventos do código e pode ser verificado no CI
- [x] Local Storage/Data policy audit: `src/core/politica.js` + `scripts/gen-catalogo-storage.mjs` impõem declaração, versão e migração das chaves
- [x] Page lifecycle audit: `src/core/ciclo-vida.js` implementa registro e encerramento de recursos de página
- [x] Supabase-backed Global Comms audit: `src/core/comms.js` usa REST + Realtime + autenticação/RLS existentes, mas não é o Mesh
- [x] Rounds 005–014 de discovery registradas no repositório
- [x] checkpoint mestre atualizado para Round 015

## Baluarte platform primitives — estado real

### Implementadas e verificadas

- **Event Bus:** `src/core/events.ts`; wrapper JS preserva compatibilidade.
- **Local Storage/Data policy:** política de chaves, versões e migração; catálogo gerado.
- **Page lifecycle:** `aoSair`, `encerrar`, `pendentes`.
- **Nexus:** composição/validação de módulos internos.
- **Supabase-backed Global Comms:** comunicação remota de usuários via `global_comms` + Realtime.

### Ainda não devem ser tratadas como Mesh implementado

- capability registry cross-project;
- request/result transport cross-project;
- provider routing cross-project;
- evidence/provenance runtime dedicado ao Mesh;
- external API/MCP boundary para chamadas de capability;
- enforcement específico do Mesh além das fronteiras de autenticação/RLS já existentes.

## Veritas provider status

Veritas possui capabilities MCP concretas documentadas, incluindo avaliação lógica, geração de tabela verdade, simplificação, Karnaugh e simulação de circuitos. O servidor atual usa stdio; transporte HTTP autenticado remoto é descrito como camada futura.

A inspeção atual do TaxForge não encontrou necessidade concreta para essas operações. Portanto, não colocar essas capabilities no registry de produção ainda.

## DailyPlanner status

O DailyPlanner continua deliberadamente client-side, com `localStorage`, sem login, backend ou sincronização entre dispositivos. Não criar Supabase apenas para o Mesh enquanto o requisito continuar client-side.

## ARK status

O ARK possui um domínio de hazards/evidências públicas e uma camada privada ARCA. A fronteira pública/privada deve ser preservada. Candidatos conceituais incluem observação/pesquisa de hazards e proveniência, mas nenhum deve virar capability de produção antes de existir consumidor + interface + autorização.

## AEGIS status

AEGIS define um fluxo forte de investigação: observe → entenda → investigue → prove → corrija → teste → verifique → documente. O README atual é uma especificação detalhada do agente. Não registrar AEGIS como provider de produção até existir implementação executável e interface estável (API/MCP/etc.).

## TaxForge status

TaxForge é o principal consumidor candidato por seu domínio de cenários, evidências, fornecedores, contratos e decisões. O MCP operacional atual possui integração própria, mas não deve ser confundido automaticamente com capability de domínio compartilhável.

## Round 014 — decisão

A busca por um primeiro par Consumer → Provider foi encerrada sem inventar dependência. Veritas possui um provider MCP real, mas nenhum consumidor concreto entre os projetos atuais foi encontrado para suas capabilities. TaxForge permanece o principal consumidor candidato, mas ainda não há provider externo comprovado que resolva uma necessidade real sua.

## Próximo passo EXATO — Round 015

Fazer um **Capability Boundary Inventory** dos seis projetos usando suas fronteiras públicas reais:

1. catalogar APIs/MCP/endpoints/funções exportadas já existentes;
2. catalogar capacidades de domínio, separando-as de tooling/devops;
3. registrar entradas, saídas e requisitos de autorização;
4. registrar quais resultados podem carregar provenance/evidence;
5. procurar consumidores já implícitos pelo produto, sem criar casos artificiais;
6. classificar cada candidato como `provider-candidate`, `consumer-candidate`, `internal-only` ou `not-ready`;
7. escolher um primeiro contrato somente se consumidor + provider + interface forem comprovados;
8. se nenhum par existir, registrar a busca como negativa e manter o Mesh sem migrations especulativas.

## Regras permanentes

- O Baluarte é o control plane/gateway arquitetural do Mesh, mas não é dono dos domínios internos dos projetos.
- Nenhum projeto recebe SQL irrestrito no banco interno de outro projeto.
- Uma capability é publicada como contrato; sua implementação permanece privada.
- Identidade e tenant são avaliados antes da execução de uma capability.
- Fallback entre provedores é autorizado e limitado; não pode virar fan-out recursivo sem controle.
- Proveniência e confiança acompanham resultados que influenciam decisões relevantes.
- Funcionalidades semelhantes não precisam ser idênticas; Plan é opcional onde não fizer sentido.
- A topologia interna é documentação de engenharia privada; segurança real depende de autenticação, autorização, RLS, mínimo privilégio e auditoria.
- Não criar dependências artificiais entre projetos apenas para demonstrar o Mesh.
- Não criar uma segunda implementação de Event Bus, Storage ou Permission Manager no Baluarte sem justificar arquiteturalmente.
- O Nexus interno e o Knowledge Mesh são contratos distintos.
- Não transformar `global_comms` em transporte do Knowledge Mesh.

## Como retomar

Abrir primeiro este arquivo. Em seguida, consultar `docs/ECOSYSTEM-DISCOVERY-ROUND-014.md`, os documentos `ECOSYSTEM-DISCOVERY-ROUND-*`, os contratos do Mesh, os documentos de discovery de Veritas/ARK/AEGIS, `ECOSYSTEM-BALUARTE-PLATFORM-PRIMITIVES-V1.md`, os audits do Supabase e `docs/NEXUS-CONTRATO.md`.

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO — Round 015**.

## Última atualização

2026-08-17 — Round 014 capability-contract discovery; next step is Round 015
