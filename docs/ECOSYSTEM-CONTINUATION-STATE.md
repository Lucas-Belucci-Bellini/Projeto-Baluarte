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

Commit do inventário:

`73d67902ff928985ce7f6f4e1cea67e4024ba91d`

Projeto Supabase inspecionado:

`hcwzsxdcvmswebunznak`

A inspeção encontrou um banco já populado com múltiplos domínios no schema `public`, incluindo tenant/identidade, conhecimento/IA, legal, Veritas e TaxForge.

Pontos importantes:

- todas as tabelas retornadas pela inspeção estavam com RLS habilitado;
- RLS habilitado ainda precisa ser validado contra as policies reais;
- `tenants` + `tenant_members` já formam uma base de tenancy usada por várias tabelas TaxForge;
- Veritas usa atualmente `user_id`-based ownership;
- existem 23 tabelas `taxforge_*` no Supabase atual;
- não foram identificadas tabelas `ark_*`, `aegis_*` ou `dailyplanner_*` no inventário `public` atual;
- nenhuma migração destrutiva foi executada nesta etapa.

## TaxForge — estado anterior

Foi concluído o primeiro inventário do schema real do TaxForge em `drizzle/schema.ts` e dos principais consumidores em `server/db.ts` e `server/routers.ts`.

Documento de inventário:

`docs/domains/TAXFORGE-SCHEMA-INVENTORY.md`

Commit no Baluarte:

`8294fb0dda8c91bcc1fbc2f2d7836b4186b418eb?`

> Nota: o commit acima é mantido como referência histórica; o arquivo continua sendo a fonte do inventário do repositório. Não substituir o estado atual do Supabase pelo schema antigo.

O inventário confirmou que o schema antigo do TaxForge é MySQL/Drizzle e mistura o domínio tributário com o legado de stock-analysis. A migração para Supabase deve ser uma remodelagem controlada, não uma cópia do schema antigo.

## Último trabalho de arquitetura do Baluarte

Foi criada a branch `docs/v2-branch-evidence-matrix` com `docs/BALUARTE-V2-BRANCH-EVIDENCE-MATRIX.md`.

Commit: `4786446201838f76f8e4957fc78cf3f0535405e9`

A matriz enumera as 7 branches atualmente encontradas em `v2/*`, registra hipóteses iniciais sem tratá-las como fatos e define o protocolo para verificar head, linhagem, caminhos alterados, testes, CI e documentação.

## Próximo passo exato

**Reconciliar as 23 tabelas `taxforge_*` existentes no Supabase com o código atual do TaxForge. Em paralelo, auditar as RLS policies e privilégios das funções antes de ampliar o banco. Depois fechar identidade/tenant e o dicionário PostgreSQL do TaxForge.**

Após isso:

1. especificar RLS e testes de isolamento;
2. definir contratos de referência/eventos;
3. escrever migrations somente quando o modelo estiver fechado;
4. iniciar o dicionário ARK;
5. repetir para AEGIS, Veritas, Baluarte e DailyPlanner.

## Regra de retomada

Ao iniciar uma nova conversa:

1. abrir este arquivo;
2. abrir `docs/ARCHITECTURE-INDEX.md`;
3. abrir `docs/BALUARTE-BRANCH-INVENTORY.md`;
4. abrir `docs/BALUARTE-SUBSYSTEM-MAP.md`;
5. abrir `docs/BALUARTE-V2-BRANCH-EVIDENCE-MATRIX.md`;
6. abrir `docs/SUPABASE-CURRENT-STATE.md`;
7. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
8. verificar o estado real dos seis repositórios e do projeto Supabase;
9. localizar **Próximo passo exato**;
10. continuar dali;
11. atualizar este arquivo ao terminar.

## Segurança e confidencialidade arquitetural

Nenhum projeto deve acessar diretamente o banco interno de outro projeto apenas para acelerar implementação. Integrações passam por contratos, referências, APIs/eventos e autorização explícita.

A topologia interna do ecossistema é documentação de engenharia privada e não precisa ser exposta na documentação pública dos produtos. Nunca armazenar segredos, tokens, senhas ou chaves no repositório.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuir o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Última atualização

2026-08-16
