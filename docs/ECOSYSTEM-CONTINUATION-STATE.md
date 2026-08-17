# Baluarte — Ecosystem Continuation State

> Ponto oficial de retomada do trabalho entre conversas. Atualizar este arquivo sempre que uma etapa relevante do ecossistema for concluída.

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

### Fase A — documentação

- [x] mapa inicial do ecossistema
- [x] definição preliminar dos domínios de dados
- [x] regra de propriedade dos dados
- [x] regra de capacidades opcionais (incluindo Plano opcional no ARK)
- [x] princípio Project Knowledge Mesh
- [x] princípios de segurança e menor privilégio
- [x] especificação inicial do domínio TaxForge
- [x] inventário inicial do schema TaxForge
- [x] inventário inicial da complexidade de branches do Baluarte
- [x] primeira camada de classificação de branches criada em `docs/BALUARTE-BRANCH-INVENTORY.md`
- [ ] mapa de branch -> subsistema -> documentação -> implementação
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

Ainda não iniciar a construção completa dos bancos até os contratos acima estarem suficientemente definidos.

Ordem inicial prevista:

1. TaxForge
2. ARK
3. AEGIS
4. Veritas
5. Baluarte
6. DailyPlanner somente quando houver necessidade real de sincronização

### Fase C — integração

Ainda pendente:

- identidade compartilhada;
- organizações;
- referências externas;
- eventos;
- notificações;
- integrações específicas por projeto.

## Último trabalho concluído nesta retomada

Foi criada a branch `docs/baluarte-branch-inventory` e o PR draft **#438** para adicionar `docs/BALUARTE-BRANCH-INVENTORY.md`. O documento estabelece a primeira camada de classificação das branches em canônicas, desenvolvimento ativo, experimentais, históricas/backup, conteúdo/domínio e infraestrutura/integração. Não foi feita nenhuma exclusão de branches.

PR: #438 — `docs: establish branch inventory navigation layer`

Commit da documentação: `38574ccfd765c269d511141414f146bd73bcab55`

A busca atual do repositório mostrou centenas de branches e uma grande família `backup/*`. A contagem anterior registrada foi 293 branches; novas buscas devem ser tratadas como estado atual e não como número permanente.

## TaxForge — estado anterior

Foi concluído o primeiro inventário do schema real do TaxForge em `drizzle/schema.ts` e dos principais consumidores em `server/db.ts` e `server/routers.ts`.

Documento de inventário:

`docs/domains/TAXFORGE-SCHEMA-INVENTORY.md`

Commit no Baluarte:

`8294fb0dda8c91bcc1fbc2f2d7836b418ec09553`

O inventário confirmou que o schema atual é MySQL/Drizzle e mistura o domínio tributário com o legado de stock-analysis. O `server/routers.ts` ainda expõe ambos os conjuntos de funcionalidades. Portanto, a migração para Supabase deve ser uma remodelagem controlada, não uma cópia do schema atual.

## Próximo passo exato

**Completar o branch-to-subsystem inventory do Baluarte.** O próximo artefato deve transformar a classificação inicial em um registro navegável por branch/família, apontando para subsistema, documentação, implementação, testes, PR/linhagem e autoridade arquitetural. Priorizar as famílias não-`backup/*` e depois resumir as famílias históricas sem apagar nada.

Depois disso:

1. completar o mapa de consumidores do legado de stock-analysis;
2. definir o contrato de identidade/tenant do Baluarte;
3. fechar a classificação das tabelas TaxForge;
4. fechar o dicionário Postgres do TaxForge;
5. especificar RLS e testes de isolamento;
6. só então escrever migrations Supabase;
7. depois iniciar o dicionário de dados do ARK.

## Regra de retomada

Ao iniciar uma nova conversa sobre este ecossistema:

1. abrir este arquivo;
2. abrir `docs/ARCHITECTURE-INDEX.md`;
3. abrir `docs/BALUARTE-BRANCH-INVENTORY.md`;
4. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
5. verificar o estado da Fase A/B/C;
6. localizar o **Próximo passo exato**;
7. verificar o estado real dos seis repositórios antes de modificar qualquer coisa;
8. continuar a partir desse ponto;
9. atualizar este arquivo com o novo ponto de retomada.

## Regra de segurança arquitetural

Nenhum banco deve ser ligado diretamente ao banco interno de outro projeto apenas para acelerar a implementação. A integração deve passar por contratos, referências, APIs/eventos e autorização explícita.

## Regra de confidencialidade arquitetural

A existência e o comportamento público de cada produto não exigem exposição da topologia interna completa do ecossistema. Documentação interna de arquitetura deve permanecer separada de documentação pública. Nunca armazenar segredos, tokens, senhas ou chaves no repositório.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuírem o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Última atualização

2026-08-16
