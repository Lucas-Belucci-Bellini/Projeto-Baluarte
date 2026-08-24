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

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O Mesh não deve criar integrações artificiais; cada capability precisa de necessidade, provider, interface e autorização comprováveis.

## Trabalho concluído

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
- [x] RLS audit inicial
- [x] decisão de manter autorização de domínio separada de capability do mesh
- [x] Veritas provider inventory: MCP capabilities verificadas
- [x] validação negativa inicial no TaxForge: nenhuma evidência encontrada de consumo de Boolean evaluation/truth tables/simplification
- [x] discovery inicial nos seis projetos: não criar capability artificial apenas para demonstrar o mesh
- [x] ARK provider discovery inicial
- [x] AEGIS provider discovery inicial: especificação forte, mas sem provider estável comprovado
- [x] Nexus implementation/contract audit
- [x] Event Bus implementation audit
- [x] Event catalogue generator audit
- [x] Local Storage/Data policy audit
- [x] Page lifecycle audit
- [x] Supabase-backed Global Comms audit; confirmado que Global Comms não é o Mesh
- [x] Rounds 005–014 registradas
- [x] Round 015 Capability Boundary Inventory iniciada
- [x] identificação de TaxForge como provider MCP operacional candidato
- [x] confirmação de que capabilities internas não devem ser automaticamente tratadas como capabilities Mesh
- [x] Round 016: decisão de reorientar AEGIS para Ocean/Seafloor Intelligence
- [x] Round 017: criado `AEGIS/docs/AEGIS-OCEAN-MASTERPLAN.md` como plano vivo
- [x] Round 018: inventário/transição do AEGIS e classificação do legado em PRESERVE / ADAPT / REPLACE / ARCHIVE
- [x] Round 018: preservação de investigação, evidência, proveniência, auditoria e validação como metodologia do novo AEGIS
- [x] Round 019–031: roadmap preliminar definido até Alpha 1.0
- [x] AEGIS Alpha Masterplan criado em `AEGIS/docs/AEGIS-ALPHA-MASTERPLAN.md`

## AEGIS — novo estado

O AEGIS está sendo reorientado de IA autônoma de engenharia para:

**AEGIS — Autonomous Geospatial & Environmental Intelligence System**

Foco inicial: inteligência geoespacial/oceanográfica e mapeamento do fundo do mar.

O plano vivo principal está em `AEGIS/docs/AEGIS-OCEAN-MASTERPLAN.md` e o plano até Alpha está em `AEGIS/docs/AEGIS-ALPHA-MASTERPLAN.md`.

### Princípios

- evidência e proveniência como dados de primeira classe;
- distinção entre observação, processamento, inferência, hipótese e conclusão;
- cobertura e incerteza explícitas;
- PostGIS para dados espaciais estruturados;
- Object Storage para artefatos grandes quando apropriado;
- IA como suporte à interpretação, não substituto automático da observação física;
- Survey Intelligence para priorizar novas observações;
- integração futura com Baluarte por capabilities, não SQL direto;
- plano deliberadamente vivo e expansível durante o design.

### Roadmap até Alpha

**Round 019 — Minimum Domain Model**
- sources, datasets, surveys, platforms, instruments, observations, processing runs, derived products, features, evidence, uncertainty, reviews.

**Round 020 — Storage/PostGIS Boundary**
- decidir o que fica em PostgreSQL/PostGIS, o que vai para Object Storage e como referências são mantidas.

**Round 021 — Dataset Ingestion Prototype**
- primeiro fluxo real de ingestão, validação de metadados e registro de proveniência.

**Round 022 — Bathymetry Processing Pipeline**
- normalização, processamento e geração do primeiro produto batimétrico/terrain.

**Round 023 — Evidence/Provenance Implementation**
- lineage completo de source -> observation -> processing -> product -> claim.

**Round 024 — Uncertainty Model**
- semântica de incerteza horizontal/vertical, qualidade, cobertura e confiança.

**Round 025 — Viewer Prototype**
- exploração 2D e primeira visualização 3D quando viável.

**Round 026 — Candidate Feature Detection**
- detecção assistiva de estruturas/anomalias e hipóteses com evidência.

**Round 027 — Human Review**
- revisão, decisão, justificativa e estado de publicação.

**Round 028 — Processing Orchestration**
- jobs, reprocessamento, idempotência, falhas e observabilidade.

**Round 029 — Knowledge Mesh Contract**
- interfaces mínimas para outros projetos solicitarem conhecimento oceanográfico sem acesso direto ao banco AEGIS.

**Round 030 — Alpha Integration Test**
- fluxo completo source -> ingestion -> processing -> product -> feature -> evidence -> uncertainty -> review -> knowledge product.

**Round 031 — Alpha 0.1**
- primeiro pacote Alpha funcional, limitado a uma área de estudo e datasets suportados.

### Release ladder pós-Alpha 0.1

- Alpha 0.2: múltiplos datasets, comparação de qualidade, incerteza e lineage.
- Alpha 0.3: feature detection, evidence graph e revisão humana.
- Alpha 0.4: 2D/3D, temporalidade e data-gap analysis.
- Alpha 0.5: API estável, Auth/RLS, workspace/project model e primeira integração Mesh.
- Alpha 0.6: processamento escalável, filas, recuperação e observabilidade.
- Alpha 0.7: pacote científico de validação, golden datasets e testes de regressão.
- Alpha 0.8: piloto externo controlado.
- Alpha 0.9: release candidate, congelamento dos contratos principais.
- Alpha 1.0: workflow operacional e repetível de dataset até knowledge product revisado.

### Critério de saída da Alpha 1.0

Um dataset real e delimitado deve conseguir percorrer:

`source -> ingestion -> normalized geospatial data -> processing -> bathymetry/terrain -> candidate feature -> evidence -> uncertainty -> human review -> reproducible knowledge product`

e outro sistema autorizado deve conseguir consumir um resultado documentado sem receber acesso direto às tabelas internas do AEGIS.

## Estado dos demais projetos

### Veritas
Possui capabilities MCP concretas documentadas, incluindo avaliação lógica, tabela verdade, simplificação, Karnaugh e simulação de circuitos. Ainda não há consumidor concreto encontrado entre os projetos atuais.

### DailyPlanner
Continua deliberadamente client-side com `localStorage`. Não criar Supabase apenas para o Mesh enquanto o requisito continuar client-side.

### ARK
Possui domínio de hazards/evidências e camada privada ARCA. Manter fronteira pública/privada. Nenhuma capability de produção deve ser criada sem consumidor + interface + autorização.

### TaxForge
Principal consumidor candidato por seu domínio fiscal/empresarial. Possui MCP operacional próprio, mas a existência de MCP não significa automaticamente que toda função seja capability compartilhável.

### Baluarte
É o control plane/gateway arquitetural do Mesh, mas não é dono dos domínios internos. Nexus, Event Bus e Global Comms são primitivas internas distintas do Knowledge Mesh.

## Próximo passo EXATO

**Round 019 — AEGIS Ocean Minimum Domain Model.**

Antes de criar tabelas Supabase/PostGIS, fechar as entidades, relações, invariantes, ownership, proveniência e limites entre metadados relacionais e artefatos científicos.

Depois seguir os Rounds 020–031 na ordem, expandindo o plano quando novas ideias forem adicionadas.

## Regra permanente de evolução

**Toda nova decisão relevante durante uma conversa deve aumentar este plano.** O plano do AEGIS é deliberadamente vivo: requisitos, ideias, hipóteses, riscos e decisões devem ser incorporados ao documento no AEGIS e o checkpoint do Baluarte deve apontar para a próxima ação exata.

Novas ideias não devem ser apagadas silenciosamente. Se uma ideia for rejeitada por escopo, ciência, segurança ou arquitetura, registrar a decisão e o motivo quando for relevante.

## Regras permanentes do Mesh

- O Baluarte é o control plane/gateway arquitetural do Mesh, mas não é dono dos domínios internos.
- Nenhum projeto recebe SQL irrestrito no banco interno de outro projeto.
- Capability é contrato; implementação pode permanecer privada.
- Identidade e tenant são avaliados antes da execução.
- Fallback é autorizado e limitado; evitar fan-out recursivo sem controle.
- Proveniência e confiança acompanham resultados relevantes.
- Funcionalidades semelhantes não precisam ser idênticas; Plan é opcional onde não fizer sentido.
- A topologia interna não é segurança: usar autenticação, autorização, RLS, mínimo privilégio e auditoria.
- Não criar dependências artificiais entre projetos.
- Não criar segunda implementação de Event Bus, Storage ou Permission Manager sem justificativa.
- Nexus interno e Knowledge Mesh são contratos distintos.
- `global_comms` não é transporte do Knowledge Mesh.

## Como retomar

1. Abrir este arquivo.
2. Abrir `AEGIS/docs/AEGIS-OCEAN-MASTERPLAN.md`.
3. Abrir `AEGIS/docs/AEGIS-ALPHA-MASTERPLAN.md`.
4. Consultar as `ECOSYSTEM-DISCOVERY-ROUND-*` relevantes.
5. Verificar o estado real dos seis repositórios e do Supabase.
6. Continuar pelo **Round 019 — AEGIS Ocean Minimum Domain Model**.

## Última atualização

2026-08-17 — Round 018 concluído e roadmap até Alpha 1.0 registrado. Próxima ação: Round 019 — Minimum Domain Model.
