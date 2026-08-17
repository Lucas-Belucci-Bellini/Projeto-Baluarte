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

## Fonte de arquitetura

`docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`

## Novo alvo arquitetural

`docs/ECOSYSTEM-INTELLIGENCE-MESH.md`

Objetivo: evoluir de integrações ponto-a-ponto para uma rede de descoberta de capacidades e conhecimento. Um projeto pode solicitar uma capacidade que outro projeto já possui; o mesh encontra um provedor autorizado, valida o contrato e devolve resultado/proveniência. Se um provedor não atender, a descoberta pode continuar entre outros provedores autorizados.

Regra fundamental: **interoperabilidade não significa acesso direto aos bancos internos uns dos outros**. Cada projeto continua dono de seu domínio. O mesh usa contratos, APIs/eventos, referências externas, autorização e mínimo privilégio.

Alvo de longo prazo: aproximadamente 100 projetos sem exigir 100 × 99 integrações diretas.

Primeiro par de prova recomendado: `TaxForge ↔ Veritas`, depois expandir para ARK/AEGIS/DailyPlanner.

## Estado atual

### Fase A — documentação e arquitetura

- [x] mapa inicial do ecossistema
- [x] definição preliminar dos domínios de dados
- [x] regra de propriedade dos dados
- [x] regra de capacidades opcionais (incluindo Plano opcional no ARK)
- [x] princípio Project Knowledge Mesh
- [x] princípios de segurança e menor privilégio
- [x] especificação inicial do domínio TaxForge
- [x] inventário inicial do schema TaxForge
- [x] inventário inicial da complexidade de branches do Baluarte
- [x] classificação inicial de famílias de branches
- [x] mapa inicial branch → subsistema
- [x] primeira matriz de evidências para V2
- [x] matriz enumerando as famílias atuais `v2/*` e protocolo de verificação
- [x] snapshot do estado atual do Supabase
- [x] primeiro checkpoint de reconciliação TaxForge ↔ Supabase
- [x] reconciliação inicial código vivo TaxForge ↔ schema Supabase
- [x] auditoria inicial de SECURITY DEFINER e privilégios do Supabase
- [x] primeiro mapa de consumidores/classificação das SECURITY DEFINER
- [x] especificação inicial da rede de inteligência/capability mesh
- [ ] inventário completo branch → subsistema → documentação → implementação → testes
- [ ] mapa final de consumidores do TaxForge
- [ ] dicionário de dados ARK
- [ ] dicionário de dados DailyPlanner
- [ ] dicionário de dados AEGIS
- [ ] dicionário de dados Veritas
- [ ] dicionário de dados Baluarte
- [ ] contrato de identidade compartilhada
- [ ] contrato de organização/tenant
- [ ] contrato de capacidade
- [ ] contrato de referência externa
- [ ] contrato de eventos
- [ ] catálogo versionado de eventos
- [ ] contrato de proveniência/evidência
- [ ] matriz de permissões entre projetos
- [ ] topologia Supabase final
- [ ] primeiro fluxo TaxForge ↔ Veritas

### Fase B — bancos por domínio

A inspeção do banco real começou. Ainda não iniciar migrações destrutivas ou declarar o schema final até a reconciliação dos domínios e dos contratos.

Ordem inicial prevista:

1. TaxForge
2. ARK
3. AEGIS
4. Veritas
5. Baluarte
6. DailyPlanner somente quando houver necessidade real de sincronização

## Supabase — estado atual

Documentos de referência:

- `docs/SUPABASE-CURRENT-STATE.md`
- `docs/SUPABASE-SECURITY-FUNCTION-AUDIT.md`
- `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`

Projeto Supabase inspecionado: `hcwzsxdcvmswebunznak`

A inspeção encontrou um banco já populado com múltiplos domínios no schema `public`, incluindo tenant/identidade, conhecimento/IA, legal, Veritas e TaxForge.

Pontos importantes:

- existem 23 tabelas `taxforge_*` no Supabase atual;
- todas as tabelas retornadas pela inspeção estavam com RLS habilitado;
- RLS habilitado ainda precisa ser validado contra as policies reais;
- `tenants` + `tenant_members` já formam uma base de tenancy usada por várias tabelas TaxForge;
- Veritas usa atualmente `user_id`-based ownership;
- não foram identificadas tabelas `ark_*`, `aegis_*` ou `dailyplanner_*` no inventário `public` atual;
- nenhuma migração destrutiva foi executada nesta etapa;
- `subscription_events` foi identificado anteriormente como RLS sem policy e permanece pendente de correção/decisão;
- existem funções `SECURITY DEFINER` e agora há um mapa inicial de classificação/consumidores para elas;
- leaked-password protection do Auth continua como tarefa de segurança separada.

### SECURITY DEFINER — resultado desta etapa

A inspeção direta do catálogo PostgreSQL encontrou, entre outras:

- `nexus.resolve_tenant` — credencial/tenant resolution; service-only;
- `nexus.is_member` — helper interno de tenancy;
- `ingest_event`, `ingest_memory`, `ingest_stat` — ingestão service-only;
- `buscar_juris` — authenticated RPC com verificação de membership;
- `current_tenant_role` — authenticated role helper;
- `veritas_*` collaboration/ownership functions — authenticated RPCs com checks internos;
- `bump_view` e `bump_visits` — únicos application RPCs encontrados com execução anônima;
- funções de trigger/event trigger e funções internas de PgBouncer/Vault — não são application RPCs.

Documento detalhado: `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`.

Nenhuma alteração de privilégio foi feita nesta etapa.

## TaxForge — reconciliação atual

Documento canônico de trabalho:

`docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`

O código atual do TaxForge continua usando MySQL/Drizzle: `drizzle/schema.ts` importa `mysql-core`, `drizzle.config.ts` define `dialect: "mysql"`, e `server/db.ts` usa `drizzle-orm/mysql2`. O servidor realmente usa as tabelas `users`, `tax_scenario_workspaces`, `tax_workspace_events` e `tax_workspace_members` para o fluxo atual de workspace/permissões. O mesmo schema contém um domínio separado de stock-analysis.

O Supabase possui 23 tabelas `taxforge_*` mais ricas para o domínio tributário. Portanto, a decisão correta neste momento é **convergência de banco**, não criação de novas tabelas.

### Classificação atual

- `LIVE_MYSQL_WORKSPACE`: users, tax_scenario_workspaces, tax_workspace_events, tax_workspace_members
- `LEGACY_OR_PARALLEL_MYSQL_STOCK`: stocks, watchlist, stock_analysis, price_history, alerts, notifications, chat_history, analysis_history
- `SUPABASE_CANDIDATE`: companies, products, suppliers, contracts, scenarios/versions/runs, evidence/sources, analyses/versions, reviews, decisions/actions, tax_rules/versions, imports
- `UNRESOLVED`: equivalência exata entre os dois modelos, migração de identidade/tenant e uso real das 23 tabelas Supabase pelo aplicativo

## Próximo passo exato

**Começar a especificação dos contratos do mesh, sem implementar ainda o roteador universal.**

1. Definir `capability_contract` e sua versão.
2. Definir `knowledge_request` mínimo.
3. Definir `knowledge_result` com provenance/evidence.
4. Definir autorização por projeto + tenant + capability.
5. Mapear quais dados podem atravessar cada boundary.
6. Escolher TaxForge e Veritas como primeiro par de prova.
7. Em paralelo, completar o mapa de consumidores do TaxForge e validar as policies/RLS das 23 tabelas `taxforge_*`.
8. Só depois desenhar a primeira migration não destrutiva do registry/contratos.

Depois disso:

`identity contract → tenant contract → capability contract → external references → event contract → provenance → TaxForge ↔ Veritas proof → ARK data dictionary`

## Regra de retomada

Ao iniciar uma nova conversa:

1. abrir este arquivo;
2. abrir `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`;
3. abrir `docs/ARCHITECTURE-INDEX.md`;
4. abrir `docs/BALUARTE-BRANCH-INVENTORY.md`;
5. abrir `docs/BALUARTE-SUBSYSTEM-MAP.md`;
6. abrir `docs/BALUARTE-V2-BRANCH-EVIDENCE-MATRIX.md`;
7. abrir `docs/SUPABASE-CURRENT-STATE.md`;
8. abrir `docs/SUPABASE-SECURITY-FUNCTION-AUDIT.md`;
9. abrir `docs/SUPABASE-SECURITY-FUNCTION-CONSUMER-MAP.md`;
10. abrir `docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`;
11. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
12. verificar o estado real dos seis repositórios e do projeto Supabase;
13. localizar **Próximo passo exato**;
14. continuar dali;
15. atualizar este arquivo ao terminar.

## Segurança e confidencialidade arquitetural

Nenhum projeto deve acessar diretamente o banco interno de outro projeto apenas para acelerar implementação. Integrações passam por contratos, referências, APIs/eventos e autorização explícita.

A topologia interna do ecossistema é documentação de engenharia privada e não precisa ser exposta na documentação pública dos produtos. Nunca armazenar segredos, tokens, senhas ou chaves no repositório.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuir o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Regra da rede de inteligência

**O projeto que precisa de uma capacidade não deve reconstruí-la automaticamente se existir um provedor autorizado no ecossistema.** Primeiro deve consultar o catálogo de capacidades. Se o provedor não conseguir atender, a descoberta pode continuar entre outros provedores autorizados.

O objetivo é maximizar reutilização de conhecimento/capacidade sem transformar os projetos em um monólito e sem conceder acesso irrestrito aos dados internos.

## Última atualização

2026-08-16
