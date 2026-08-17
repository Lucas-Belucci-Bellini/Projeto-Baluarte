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
- [~] dicionário de dados detalhado por projeto — TaxForge iniciado em `docs/domains/TAXFORGE-DOMAIN-SPEC.md` (PR #437)
- [ ] inventário final do schema/consumidores do TaxForge
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

Foi reaberto o estado central e verificado o schema real do TaxForge em `drizzle/schema.ts`, além de `server/db.ts`.

O schema atual usa Drizzle/MySQL e mistura dois domínios:

1. **TaxForge atual:** `users`, `taxScenarioWorkspaces`, `taxWorkspaceEvents`, `taxWorkspaceMembers`.
2. **Legado de stock-analysis:** `stocks`, `watchlist`, `stockAnalysis`, `priceHistory`, `alerts`, `notifications`, `chatHistory`, `analysisHistory`.

O código de `server/db.ts` consome diretamente ambos os grupos. Portanto, não devemos migrar `drizzle/schema.ts` cegamente para Supabase.

A especificação arquitetural do domínio já foi criada em:

`docs/domains/TAXFORGE-DOMAIN-SPEC.md`

Branch:

`docs/taxforge-domain-spec`

PR:

`#437 — docs: define TaxForge ecosystem domain`

## Próximo passo exato

**Completar o inventário do TaxForge: mapear cada tabela atual para seus consumidores no código e classificá-la como `manter`, `migrar`, `substituir`, `legado` ou `remover após migração`.**

Prioridade imediata:

- mapear `taxScenarioWorkspaces`, `taxWorkspaceEvents`, `taxWorkspaceMembers` e `users`;
- localizar todos os consumidores das tabelas de stock-analysis;
- separar definitivamente o domínio tributário do legado;
- somente depois desenhar as tabelas Supabase definitivas do TaxForge.

Depois disso, seguir para o dicionário de dados do ARK.

## Regra de retomada

Ao iniciar uma nova conversa sobre este ecossistema:

1. abrir este arquivo;
2. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
3. verificar o estado da Fase A/B/C;
4. localizar o **Próximo passo exato**;
5. verificar o estado real dos seis repositórios antes de modificar qualquer coisa;
6. continuar a partir desse ponto;
7. atualizar este arquivo com o novo ponto de retomada.

## Regra de segurança arquitetural

Nenhum banco deve ser ligado diretamente ao banco interno de outro projeto apenas para acelerar a implementação. A integração deve passar por contratos, referências, APIs/eventos e autorização explícita.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuírem o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Última atualização

2026-08-16
