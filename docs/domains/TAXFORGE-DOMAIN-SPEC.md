# TaxForge — Ecosystem Domain Specification

> Especificação do domínio TaxForge para o ecossistema coordenado pelo Baluarte.
>
> Fonte de arquitetura: `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`.

## 1. Objetivo

Definir o que o TaxForge precisa persistir, o que pertence exclusivamente ao seu domínio e quais informações podem atravessar o Project Knowledge Mesh.

O TaxForge é uma plataforma de simulação econômica/tributária e apoio à decisão. O banco deve preservar rastreabilidade entre dados, premissas, cenários, resultados, evidências, revisão humana e decisões.

## 2. Estado encontrado no repositório

A implementação atual possui um schema Drizzle baseado em MySQL e já contém uma primeira camada remota para usuários, workspaces de cenários, eventos de workspace e membros. O schema também contém legado de stock-analysis (`stocks`, `watchlist`, `stock_analysis`, `price_history`, `alerts`, `notifications`, `chat_history`, `analysis_history`).

Conclusão arquitetural: **não migrar cegamente o schema atual para Supabase/Postgres**. Primeiro separar o domínio tributário do legado, mapear dependências do código e então desenhar a versão Postgres/Supabase.

## 3. Domínio de dados alvo

### Tenant e contexto empresarial

- `organizations`
- `organization_members`
- `companies`
- `company_settings`

A identidade/tenant compartilhada deverá ser compatível com o contrato do Baluarte; o TaxForge não deve criar uma segunda identidade global incompatível.

### Dados empresariais

- `products`
- `suppliers`
- `contracts`
- `purchases`
- `cost_entries`
- `sales_inputs`
- `working_capital_inputs`

Cada entidade deve possuir `organization_id`/`company_id` conforme o contrato final e políticas RLS correspondentes.

### Cenários

- `scenarios`
- `scenario_versions`
- `scenario_assumptions`
- `scenario_runs`
- `scenario_run_metrics`

Um cenário é uma definição versionada. Uma execução é um resultado reproduzível daquela versão sob um conjunto explícito de entradas.

### D1 / D2 / D3

Os resultados devem permanecer rastreáveis à execução:

- D1 — eficiência operacional;
- D2 — simulação/preço;
- D3 — capital de giro.

Evitar três bancos ou três fontes de verdade independentes. Preferir uma execução canônica com métricas/resultados tipados por dimensão.

### Evidências e conhecimento

- `sources`
- `evidence`
- `evidence_links`
- `validation_reviews`
- `confidence_assessments`

Uma conclusão importante deve poder apontar para as premissas e evidências que a sustentam.

### Decisão e ação

- `analyses`
- `findings`
- `decisions`
- `decision_actions`
- `decision_reviews`

`decisions` pertence ao TaxForge. Uma tarefa criada no DailyPlanner deve ser uma projeção/referência externa, não uma cópia integral do domínio tributário.

### Regras tributárias

- `tax_rules`
- `tax_rule_versions`
- `tax_rule_sources`

Regra tributária deve ser versionada e associada às execuções que a utilizaram. Não sobrescrever uma regra histórica usada em uma análise anterior.

### Importações

- `import_batches`
- `import_rows`
- `import_errors`

Importações devem ser auditáveis e idempotentes quando possível. O arquivo original pode permanecer no Storage; o banco mantém metadados e resultados de validação.

## 4. Relações principais

```text
organization
  ↓
company
  ├── products
  ├── suppliers ── contracts
  ├── purchases
  └── cost/sales inputs
          ↓
       scenario
          ↓
   scenario_version
          ↓
     scenario_run
       ├── D1
       ├── D2
       └── D3
          ↓
       analysis
          ↓
      finding
          ↓
      decision
          ↓
   decision_action
```

Evidências devem poder estar ligadas à análise, finding, premissa ou regra utilizada.

## 5. O que NÃO compartilhar por padrão

Não publicar para outros projetos:

- contratos completos;
- dados brutos de fornecedores;
- preços/custos confidenciais;
- dados financeiros brutos;
- dados pessoais desnecessários;
- credenciais;
- payload completo de cenários;
- histórico completo de conversas com IA;
- arquivos empresariais originais.

O Knowledge Mesh deve receber apenas referências, eventos e resultados mínimos necessários para a integração autorizada.

## 6. O que pode ser compartilhado

Exemplos de eventos/referências:

- `taxforge.analysis.completed`
- `taxforge.decision.created`
- `taxforge.action.created`
- `taxforge.evidence.updated`
- `taxforge.scenario.completed`

Uma referência externa pode conter:

```text
source_project = taxforge
source_type    = decision
source_id      = <uuid>
relation       = requires_action
contract       = v1
visibility     = explicit
```

Um evento não deve transportar o banco interno inteiro.

## 7. Plano é capacidade, não obrigação

O TaxForge pode transformar uma decisão em ações/planejamento porque isso é natural ao domínio empresarial. Entretanto, o domínio não deve depender de um sistema universal de `plans`.

O Baluarte poderá fornecer uma capacidade de planejamento compartilhável. TaxForge publica a intenção/referência; o sistema consumidor decide como materializá-la.

## 8. Segurança

- Supabase/Postgres com RLS por organização/empresa.
- Nenhuma integração recebe credencial administrativa do banco.
- Acesso entre projetos por contrato e menor privilégio.
- IDs públicos preferencialmente UUID/UUIDv7 quando compatível com o padrão do ecossistema.
- Dados sensíveis não devem aparecer em eventos de integração sem necessidade.
- Auditoria para alterações de premissas, regras, execuções, decisões e permissões.

## 9. Supabase — direção arquitetural

O alvo do TaxForge deve ser PostgreSQL/Supabase, mas a migração deve ocorrer somente após o inventário de código e dependências.

Componentes candidatos:

- Postgres para dados relacionais;
- Auth integrado ao contrato de identidade;
- RLS para isolamento de tenant;
- Storage para documentos/arquivos de importação;
- Realtime somente onde houver necessidade real;
- Edge Functions/API para integrações controladas;
- migrations versionadas no repositório.

Não usar `service_role` no navegador e não criar acesso cross-project direto ao Postgres.

## 10. Migração do schema atual

Antes de implementar:

1. inventariar todas as tabelas Drizzle;
2. separar TaxForge de legado de ações/stock-analysis;
3. localizar todos os usos no frontend/backend;
4. mapear campos realmente necessários;
5. definir chaves e relações Postgres;
6. definir RLS;
7. escrever migrations;
8. migrar dados somente depois de validar o modelo;
9. remover/arquivar legado sem apagar dados prematuramente.

## 11. Contratos futuros com outros projetos

### Baluarte

TaxForge consome identidade, organização, permissões e referências externas conforme contratos compartilhados.

### DailyPlanner

`decision.created` ou `decision_action.created` pode resultar em uma tarefa externa. O DailyPlanner recebe apenas o contexto operacional necessário.

### AEGIS

AEGIS pode receber uma solicitação delimitada para investigar uma análise/execução específica. Deve receber evidências/contexto autorizado, não acesso amplo ao banco.

### ARK

Nenhuma integração direta prevista por padrão. Uma integração futura somente deve existir se houver caso de uso real e contrato específico.

### Veritas

Nenhuma dependência estrutural prevista. Uma análise pode referenciar um resultado externo se surgir um caso de uso concreto, sem importar o domínio de circuitos.

## 12. Critérios de aceite do domínio

O domínio TaxForge estará pronto para a próxima fase quando:

- [ ] todas as tabelas atuais forem inventariadas;
- [ ] legado de stock-analysis estiver classificado;
- [ ] modelo Postgres estiver definido;
- [ ] identidade/tenant estiver alinhada ao Baluarte;
- [ ] RLS estiver especificado;
- [ ] evidência e versionamento estiverem definidos;
- [ ] eventos públicos estiverem versionados;
- [ ] referências externas estiverem definidas;
- [ ] estratégia de migração estiver documentada;
- [ ] testes de isolamento multi-tenant estiverem planejados.

## Próximo passo

**Fazer o inventário completo do schema atual e do código que o consome, classificando cada tabela como `manter`, `migrar`, `substituir`, `legado` ou `remover após migração`.**
