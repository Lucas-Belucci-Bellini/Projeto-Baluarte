# Baluarte — Ecosystem Knowledge Mesh Masterplan

> Documento central do Projeto-Baluarte para registrar o que deve ser construído, preservado e integrado entre TaxForge, Ark-Initiative, DailyPlanner, AEGIS, Projeto-Baluarte e Veritas.
>
> **Regra:** este documento é a fonte central do planejamento do ecossistema. Os projetos continuam donos de seus próprios domínios. A integração completa só começa quando os contratos e domínios estiverem suficientemente definidos.

## 0. Repositórios oficiais — navegação para agentes locais

Estes links devem permanecer neste documento para que Claude, Codex e outros agentes trabalhando localmente consigam localizar os repositórios e preparar atualizações. O usuário faz o clone/pull e a publicação final conforme seu fluxo local.

| Projeto | Repositório | Pull local |
|---|---|---|
| TaxForge | https://github.com/Lucas-Belucci-Bellini/taxforge.git | `git pull https://github.com/Lucas-Belucci-Bellini/taxforge.git` |
| Ark-Initiative | https://github.com/Lucas-Belucci-Bellini/Ark-Initiative.git | `git pull https://github.com/Lucas-Belucci-Bellini/Ark-Initiative.git` |
| DailyPlanner | https://github.com/Lucas-Belucci-Bellini/DailyPlanner.git | `git pull https://github.com/Lucas-Belucci-Bellini/DailyPlanner.git` |
| AEGIS | https://github.com/Lucas-Belucci-Bellini/AEGIS.git | `git pull https://github.com/Lucas-Belucci-Bellini/AEGIS.git` |
| Projeto-Baluarte | https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte.git | `git pull https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte.git` |
| Veritas | https://github.com/Lucas-Belucci-Bellini/Veritas.git | `git pull https://github.com/Lucas-Belucci-Bellini/Veritas.git` |

### Fluxo local do usuário

```text
GitHub
  ↓
git clone / git pull
  ↓
repositório local
  ↓
Claude / Codex / desenvolvimento local
  ↓
commit + push / PR conforme o fluxo escolhido
  ↓
GitHub
  ↓
git pull no ambiente local quando necessário
```

**Importante:** os links acima são referências de navegação e sincronização. Não significam que um projeto deve acessar diretamente o banco interno de outro projeto. A integração continua obedecendo aos contratos descritos neste documento.

## 1. Objetivo

Construir um ecossistema de aplicações interoperáveis sem transformar os seis projetos em um único sistema monolítico e sem obrigar todos os projetos a possuir as mesmas funcionalidades.

O Baluarte funciona como camada de plataforma e coordenação. Cada projeto mantém seu domínio, seu banco lógico e suas regras de negócio.

## 2. Projetos acompanhados

| Projeto | Papel principal | Domínio de dados | Prioridade de banco |
|---|---|---|---|
| TaxForge | Simulação econômica/tributária e decisão empresarial | fiscal, financeiro, cenários, evidências e decisões | alta |
| Ark-Initiative | Resiliência climática e ambiental | geografia, sensores, observações, riscos, incidentes e resposta | alta |
| DailyPlanner | Planejamento pessoal e tarefas | tarefas, agenda, lembretes e preferências | baixa até haver necessidade de sincronização |
| AEGIS | Investigação e engenharia autônoma / oceanografia | investigações, hipóteses, evidências, correções, observações acústicas e reconstruções | alta |
| Projeto-Baluarte | Plataforma/hub e orquestração | identidade, projetos, permissões, integrações, eventos e coordenação | alta |
| Veritas | Lógica, circuitos e colaboração | projetos, circuitos, versões, simulações e análises | média/alta |

## 3. Regra de propriedade dos dados

Nenhum projeto deve depender de acesso direto irrestrito às tabelas internas de outro projeto.

Preferir:

```text
Projeto A
  ↓
contrato de integração
  ↓
evento / API / referência
  ↓
Projeto B
```

O projeto de origem continua responsável pela semântica e integridade do dado que publica.

## 4. Camada compartilhada do Baluarte

O Baluarte deve concentrar somente capacidades realmente compartilháveis:

- identidade;
- organizações;
- memberships;
- projetos;
- papéis e permissões;
- integrações;
- eventos;
- notificações;
- referências externas;
- auditoria de plataforma;
- preferências e capacidades comuns.

Não colocar no núcleo compartilhado os dados fiscais do TaxForge, os sensores do ARK, os circuitos do Veritas ou as investigações/observações do AEGIS.

## 5. TaxForge — domínio previsto

Domínio próprio:

```text
empresa
produtos
fornecedores
contratos
compras
custos
importações
cenários
versões
premissas
execuções D1/D2/D3
análises
evidências
fontes
revisões
decisões
ações
regras tributárias
versões de regras
auditoria
```

Integrações candidatas:

- decisão → tarefa no DailyPlanner;
- projeto/organização → identidade do Baluarte;
- evidência/resultado → AEGIS somente quando houver investigação autorizada;
- referências externas → Knowledge Mesh.

## 6. Ark-Initiative — domínio previsto

Domínio próprio:

```text
regiões
feições geográficas
sensores
leituras
observações meteorológicas
infraestrutura
dependências de infraestrutura
riscos
ameaças
aferições/simulações
incidentes
alertas
abrigos
rotas
ações de resposta
fontes
```

### Plano é opcional

O ARK não deve exigir um sistema de planos para toda atividade. Uma análise ou alerta pode existir sozinho. Quando uma pessoa ou organização quiser transformar uma descoberta em ação coordenada, poderá criar um plano/projeto de contribuição.

## 7. DailyPlanner — domínio previsto

O DailyPlanner deve permanecer simples.

Domínio futuro:

```text
tasks
schedules
reminders
categories
preferences
```

Não criar uma infraestrutura de banco complexa antes de existir necessidade real de sincronização multiusuário/multidispositivo.

Integração candidata:

```text
TaxForge decision
  ↓
external reference
  ↓
DailyPlanner task
```

A tarefa recebe contexto suficiente para ser executada, mas não precisa copiar o domínio tributário inteiro.

## 8. AEGIS — domínio previsto

Domínio próprio:

```text
agents
repositories
investigations
hypotheses
evidence
findings
root causes
fixes
validations
test runs
incidents
reports
audit events
surveys
survey platforms
sensors
sensor configurations
observations
acoustic observations
spatial features
reconstructions
processing runs
uncertainty models
scientific derivatives
data classifications
```

AEGIS está evoluindo para um segundo eixo de pesquisa oceanográfica: percepção acústica espacial, reconstrução 3D e análise científica de observações submarinas. O plano detalhado vive em `AEGIS/docs/AEGIS-OCEAN-ALPHA-MASTERPLAN.md`.

Fluxo científico:

```text
sensor
 ↓
observação
 ↓
processamento
 ↓
reconstrução espacial
 ↓
incerteza + proveniência
 ↓
produto científico 2D/3D
 ↓
validação
```

O AEGIS deve suportar pesquisa em baixa visibilidade e ambientes sob gelo, inclusive quando a plataforma de pesquisa for de uso dual. O projeto deve registrar se a aquisição foi passiva, ativa ou híbrida e registrar contexto/impacto acústico relevante, sem transformar isso em mecanismo de evasão ou ocultação militar.

### Governança dual-use do AEGIS

- finalidade da campanha vinculada aos dados;
- classificação dos datasets;
- menor privilégio;
- RLS/ACL;
- autorização explícita para dados restritos;
- auditoria de acesso/exportação;
- revisão humana para capacidades de maior risco;
- separação entre produtos científicos e workflows operacionais;
- derivados científicos redigidos/generalizados quando necessário.

O AEGIS não deve implementar capacidades cujo objetivo primário seja targeting, interceptação, vigilância militar operacional ou vantagem operacional de combate.

## 9. Veritas — domínio previsto

Preservar a arquitetura local-first já existente e evoluir o domínio Supabase sem destruir a experiência offline.

Domínio:

```text
projects
circuits
circuit_versions
components
simulations
truth_tables
analyses
ai_runs
collaborations
exports
chip_catalog
```

Integrações devem compartilhar referências e resultados quando necessário, não circuitos completos por padrão.

## 10. Capacidades opcionais

Funcionalidades semelhantes não precisam ter a mesma obrigatoriedade em todos os projetos.

Exemplo:

```text
Plano
 ├─ TaxForge: natural após decisão
 ├─ ARK: opcional
 ├─ DailyPlanner: núcleo de tarefas
 ├─ AEGIS: não obrigatório
 ├─ Baluarte: capacidade de plataforma
 └─ Veritas: não é núcleo
```

O Baluarte fornece capacidades reutilizáveis; cada aplicação decide se as habilita.

## 11. Project Knowledge Mesh

A interoperabilidade deve ser baseada em contratos.

Conceito:

```text
                  Baluarte Platform
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    TaxForge            ARK           Veritas
        │                │                │
        └──────────── AEGIS ──────────────┘
                         │
                   DailyPlanner
```

Uma referência compartilhada deve poder identificar:

- projeto de origem;
- tipo do objeto;
- ID do objeto;
- projeto de destino, quando aplicável;
- tipo de relação;
- permissões;
- timestamps;
- versão do contrato.

## 12. Eventos compartilhados

Eventos devem ser pequenos e estáveis.

Exemplos:

```text
project.created
project.updated
analysis.completed
decision.created
action.created
task.created
investigation.opened
investigation.completed
alert.created
integration.requested
integration.approved
```

O evento não deve carregar o banco inteiro do projeto de origem.

## 13. Segurança

Regras mínimas:

1. RLS por tenant/organização onde houver dados multiusuário.
2. Menor privilégio entre projetos.
3. Nenhum projeto recebe credenciais administrativas do banco de outro projeto.
4. Referências cruzadas não concedem acesso automaticamente.
5. Dados sensíveis permanecem no domínio de origem.
6. Integrações devem ser auditáveis.
7. Acesso de AEGIS a repositórios e dados deve ser delimitado ao escopo autorizado.

## 14. Estratégia de construção

Enquanto o desenho estiver sendo fechado:

```text
documentar
  ↓
definir contrato
  ↓
revisar
  ↓
branch
  ↓
PR
  ↓
testes/revisão
  ↓
merge
```

Não iniciar a integração completa apenas porque uma tabela já existe.

## 15. Ordem planejada

### Fase A — documentação

- [ ] mapa do ecossistema;
- [ ] dicionário de dados por projeto;
- [ ] contratos Supabase;
- [ ] contratos de integração;
- [ ] catálogo de eventos;
- [ ] matriz de permissões;
- [ ] política de referências externas;
- [ ] AEGIS Ocean Alpha Masterplan;
- [ ] AEGIS sensor/observation vocabulary;
- [ ] AEGIS provenance + uncertainty contracts;
- [ ] AEGIS data-classification and survey-purpose model.

### Fase B — bancos por domínio

- [ ] TaxForge;
- [ ] ARK;
- [ ] AEGIS;
- [ ] Veritas;
- [ ] Baluarte;
- [ ] DailyPlanner somente quando necessário.

### Fase C — integração

- [ ] identidade compartilhada;
- [ ] organizações;
- [ ] referências externas;
- [ ] eventos;
- [ ] notificações;
- [ ] integrações específicas por projeto.

### Fase D — ligação completa

Somente depois de os contratos estarem estáveis:

```text
frontend
  ↓
API
  ↓
autorização
  ↓
domínio
  ↓
Supabase/Postgres
  ↓
eventos
  ↓
Knowledge Mesh
```

## 16. Branch strategy

Para mudanças de arquitetura/documentação:

```text
docs/<escopo>
```

Para domínio:

```text
feat/<projeto>-<dominio>
```

Para integração:

```text
feat/ecosystem-<capacidade>
```

Para correções:

```text
fix/<escopo>
```

Cada mudança relevante deve passar por PR antes do merge na branch de destino.

## 17. Fonte central de planejamento

Este arquivo pertence ao Projeto-Baluarte porque o Baluarte é o ponto de coordenação do ecossistema.

Os repositórios individuais continuam sendo a fonte de verdade de suas próprias implementações.

Portanto:

```text
Baluarte
 = mapa + contratos + coordenação

TaxForge
 = domínio fiscal

ARK
 = domínio de resiliência

DailyPlanner
 = domínio de planejamento pessoal

AEGIS
 = domínio de investigação + oceanografia/acústica científica

Veritas
 = domínio de lógica/circuitos
```

**Não copiar a implementação de um projeto para outro apenas para obter uniformidade. A uniformidade deve estar nos contratos, segurança e interoperabilidade — não necessariamente nas tecnologias ou nos modelos internos.**

## 18. CONTINUATION CHECKPOINT — 2026-08-17

### Estado atual

- AEGIS Ocean Alpha Masterplan foi criado em `AEGIS/docs/AEGIS-OCEAN-ALPHA-MASTERPLAN.md`.
- PR do AEGIS: `#24` (`docs/ocean-acoustic-alpha-masterplan`), atualmente aberto como draft.
- O plano incorporou: percepção acústica espacial, reconstrução 3D, sensor fusion, baixa visibilidade/ambiente sob gelo, modos passivo/ativo/híbrido, acoustic-impact management, proveniência, incerteza, scientific derivatives e dual-use governance.

### Próximo ponto exato para continuar

1. Revisar o PR AEGIS #24.
2. No AEGIS, criar o **Sensor & Observation Vocabulary**.
3. Criar os contratos **Provenance + Uncertainty**.
4. Criar o modelo **Survey Purpose + Data Classification**.
5. Depois propor o **logical PostGIS/Supabase schema**.
6. Só após a revisão desses contratos começar a implementação de banco.

### Regra para próximas conversas

Se uma nova conversa começar apenas com "vamos continuar" e os seis repositórios forem citados, este checkpoint deve ser consultado primeiro. Não reiniciar o planejamento do zero.

### Regra de sincronização local

O usuário mantém os repositórios localmente e executa `git pull` para sincronizar as alterações publicadas no GitHub. Agentes locais devem usar os links da seção 0 para identificar o repositório correto e preparar alterações no projeto correspondente, sem presumir acesso ao diretório local do usuário.

**Próxima ação recomendada: AEGIS — Sensor & Observation Vocabulary.**
