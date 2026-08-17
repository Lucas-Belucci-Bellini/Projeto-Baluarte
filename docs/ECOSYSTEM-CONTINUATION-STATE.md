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
- [x] Round 018 iniciada: Repository Transition Audit do AEGIS definido como próxima etapa técnica

## AEGIS — novo estado

O AEGIS está sendo reorientado de IA autônoma de engenharia para:

**AEGIS — Autonomous Geospatial & Environmental Intelligence System**

Foco inicial: inteligência geoespacial/oceanográfica e mapeamento do fundo do mar.

O plano vivo está em `AEGIS/docs/AEGIS-OCEAN-MASTERPLAN.md`.

Princípios já registrados:
- evidência e proveniência como dados de primeira classe;
- distinção entre observação, processamento, inferência, hipótese e conclusão;
- cobertura e incerteza explícitas;
- PostGIS para dados espaciais estruturados;
- Object Storage para artefatos grandes quando apropriado;
- IA como suporte à interpretação, não substituto automático da observação física;
- Survey Intelligence para priorizar novas observações;
- integração futura com Baluarte por capabilities, não SQL direto.

O plano deve continuar sendo ampliado durante a conversa conforme novas decisões forem tomadas. Novas ideias conflitantes não devem ser apagadas silenciosamente: registrar como decisão, alternativa descartada ou questão aberta.

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

## Round 018 — AEGIS Repository Transition Audit

**Estado: EM ANDAMENTO.**

### Objetivo

Mapear o AEGIS antigo antes de implementar a nova plataforma Ocean.

### Primeira evidência encontrada

O `README.md` atual é uma especificação/prompt extensa do AEGIS original, focada em investigação e resolução autônoma de problemas de software. Ela contém uma metodologia potencialmente reutilizável:

`Observe → Understand → Investigate → Prove → Correct → Test → Verify → Document`

Essa metodologia será preservada conceitualmente como disciplina de investigação científica do novo AEGIS, mas seu domínio será substituído de software para observações geoespaciais/oceanográficas.

### Classificação provisória

| Artefato | Estado | Decisão |
|---|---|---|
| README/prompt de engenharia | ADAPT + ARCHIVE | preservar a metodologia de investigação; manter a missão antiga como referência histórica |
| domínio de engenharia de software | REPLACE | substituir pelo domínio Ocean/Seafloor |
| investigação baseada em evidência | PRESERVE/ADAPT | transformar em Evidence + Provenance Layer |
| validação/testes | ADAPT | transformar em QC científico, validação de produtos e revisão |
| auditoria | ADAPT | transformar em data/product/scientific audit |

Essa matriz é provisória e deve ser corrigida conforme o inventário real do repositório avançar.

### Próxima ação técnica

1. inventariar todo o conteúdo do AEGIS;
2. revisar branches relevantes;
3. procurar código executável além da especificação;
4. identificar dependências e infraestrutura existentes;
5. completar a matriz PRESERVE / ADAPT / REPLACE / ARCHIVE;
6. definir a arquitetura de diretórios Ocean;
7. só depois definir o schema inicial PostGIS/Supabase.

## Regra permanente de evolução

**Toda nova decisão relevante durante uma conversa deve aumentar este plano.** O plano do AEGIS é deliberadamente vivo: requisitos, ideias, hipóteses, riscos e decisões devem ser incorporados ao documento no AEGIS e o checkpoint do Baluarte deve apontar para a próxima ação exata.

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
3. Consultar as `ECOSYSTEM-DISCOVERY-ROUND-*` relevantes.
4. Verificar o estado real dos seis repositórios e do Supabase.
5. Continuar pelo **Round 018 — AEGIS Repository Transition Audit**, começando pelo inventário completo do AEGIS.

## Próximo checkpoint planejado

**Round 019 — AEGIS Ocean Minimum Domain Model**

Só iniciar após concluir o inventário/triagem do Round 018.

## Última atualização

2026-08-17 — Round 018 em andamento: primeira auditoria confirmou que o README atual é uma especificação de agente de engenharia; sua disciplina investigativa será reaproveitada, enquanto o domínio será reorientado para Ocean/Seafloor Intelligence.
