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
- [ ] inventário completo branch → subsistema → documentação → implementação → testes
- [ ] mapa final de consumidores do TaxForge
- [ ] dicionário de dados ARK
- [ ] dicionário de dados DailyPlanner
- [ ] dicionário de dados AEGIS
- [ ] dicionário de dados Veritas
- [ ] dicionário de dados Baluarte
- [ ] contrato de identidade compartilhada
- [ ] contrato de organização/tenant
- [ ] contrato de referência externa
- [ ] contrato de eventos
- [ ] catálogo versionado de eventos
- [ ] matriz de permissões entre projetos
- [ ] topologia Supabase final

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

Documento de referência:

`docs/SUPABASE-CURRENT-STATE.md`

Segurança:

`docs/SUPABASE-SECURITY-FUNCTION-AUDIT.md`

Projeto Supabase inspecionado:

`hcwzsxdcvmswebunznak`

A inspeção encontrou um banco já populado com múltiplos domínios no schema `public`, incluindo tenant/identidade, conhecimento/IA, legal, Veritas e TaxForge.

Pontos importantes:

- existem 23 tabelas `taxforge_*` no Supabase atual;
- todas as tabelas retornadas pela inspeção estavam com RLS habilitado;
- RLS habilitado ainda precisa ser validado contra as policies reais;
- `tenants` + `tenant_members` já formam uma base de tenancy usada por várias tabelas TaxForge;
- Veritas usa atualmente `user_id`-based ownership;
- não foram identificadas tabelas `ark_*`, `aegis_*` ou `dailyplanner_*` no inventário `public` atual;
- nenhuma migração destrutiva foi executada nesta etapa;
- o advisor de segurança sinaliza `subscription_events` com RLS sem policy;
- há funções `SECURITY DEFINER` publicamente ou autenticadamente executáveis que precisam ser mapeadas aos consumidores antes de alterar privilégios;
- leaked-password protection do Auth está desativado e precisa ser tratado como tarefa de segurança separada.

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

**Mapear os consumidores das funções de segurança do Supabase e completar o mapa de consumidores do TaxForge.**

1. Para cada `SECURITY DEFINER`, localizar o corpo SQL, consumidor e motivo de exposição.
2. Classificar cada função como `KEEP_PUBLIC_RPC`, `AUTHENTICATED_RPC`, `INTERNAL_ONLY` ou `REPLACE`.
3. Enumerar as funções de `server/db.ts`, `server/routers.ts`, `server/storage.ts` e workspace-permissions.
4. Marcar cada operação como `LIVE_MYSQL_WORKSPACE`, `LEGACY_OR_PARALLEL_MYSQL_STOCK` ou `UNRESOLVED`.
5. Consultar policies, foreign keys e privilégios das funções nas 23 tabelas `taxforge_*`.
6. Comparar identidade `users`/workspace do MySQL com `tenants`/`tenant_members` do Supabase.
7. Só então decidir o modelo PostgreSQL canônico e escrever a primeira migration não destrutiva.

Depois disso:

`canonical TaxForge PostgreSQL → RLS tests → ecosystem identity contract → external references/events → ARK data dictionary`

## Regra de retomada

Ao iniciar uma nova conversa:

1. abrir este arquivo;
2. abrir `docs/ARCHITECTURE-INDEX.md`;
3. abrir `docs/BALUARTE-BRANCH-INVENTORY.md`;
4. abrir `docs/BALUARTE-SUBSYSTEM-MAP.md`;
5. abrir `docs/BALUARTE-V2-BRANCH-EVIDENCE-MATRIX.md`;
6. abrir `docs/SUPABASE-CURRENT-STATE.md`;
7. abrir `docs/SUPABASE-SECURITY-FUNCTION-AUDIT.md`;
8. abrir `docs/TAXFORGE-SUPABASE-SCHEMA-RECONCILIATION.md`;
9. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
10. verificar o estado real dos seis repositórios e do projeto Supabase;
11. localizar **Próximo passo exato**;
12. continuar dali;
13. atualizar este arquivo ao terminar.

## Segurança e confidencialidade arquitetural

Nenhum projeto deve acessar diretamente o banco interno de outro projeto apenas para acelerar implementação. Integrações passam por contratos, referências, APIs/eventos e autorização explícita.

A topologia interna do ecossistema é documentação de engenharia privada e não precisa ser exposta na documentação pública dos produtos. Nunca armazenar segredos, tokens, senhas ou chaves no repositório.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuir o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Última atualização

2026-08-16
