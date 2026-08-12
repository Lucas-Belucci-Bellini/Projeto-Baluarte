# Baluarte V2 — Master Construction Plan

> **Transcrito do corpo da [issue #423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423)**
> (fixada no topo do repositório, junto com #420 e #422).
> A partir daqui este arquivo é a versão de trabalho; a issue fica como origem.
>
> As decisões que **não** estão neste corpo, e que nasceram na discussão da issue,
> vivem em [`V2_DECISION_LOG.md`](./V2_DECISION_LOG.md). As regras de construção,
> em [`V2_RULES.md`](./V2_RULES.md).

## Status

A V1 está chegando ao congelamento, mas podem existir imprevistos a resolver
antes da 1.0.0. A partir do congelamento, a V2 é uma **reconstrução
arquitetural** — não uma atualização da V1. Ela é a fundação das versões futuras
e, eventualmente, do Baluarte OS.

---

## 1. Objetivo principal

Construir arquitetura **modular, expansível, testável** e preparada para receber
dezenas ou centenas de módulos e projetos externos — permitindo que o Baluarte
cresça **sem que cada módulo novo obrigue a reescrever o núcleo**.

Deve comportar: módulos internos e externos · projetos independentes · APIs ·
JARVIS · Wikis · IDE · 3D Engine · sistema social · sensores · automação ·
futuros componentes do Baluarte OS.

## 2. A regra mais importante

**Não transportar automaticamente a arquitetura da V1 para a V2.**

Para cada componente existente, decidir: **manter · refatorar · reescrever ·
substituir · remover** — com base na arquitetura da V2, não no esforço já gasto
na V1.

> **"Nós já temos isso" NÃO é motivo suficiente para manter código.**

## 3. Documentos de referência

Antes de qualquer implementação, ler: **#420** · **#422** · documentação
arquitetural existente · README · documentação de segurança, do Event Bus, de
storage e do JARVIS · testes existentes · estrutura atual.

O roteiro principal é **#420 + #422**. Issues antigas são **matéria-prima** — não
transformar todas em requisitos da V2.

## 4. Primeira fase — arquitetura

Antes de construir módulos grandes, **projetar**:

Core · Module System · Module Registry · Module Lifecycle · Event Bus · API
interna · API externa · Storage Layer · Permission System · Configuration
System · Logging · Diagnostics · Feature Flags · Testing · Error Handling ·
Versioning · Compatibility Layer.

A arquitetura deve permitir **adicionar e remover módulos sem modificar
diretamente o núcleo**.

## 5. Sistema de módulos

Todo módulo tem contrato:

```
Module
├── id            ├── permissions
├── name          ├── events
├── version       ├── API
├── dependencies  ├── configuration
├── capabilities  └── lifecycle
```

O sistema deve saber: quais módulos existem · quais estão ativos · dependências ·
permissões · APIs fornecidas · eventos produzidos e consumidos · como iniciar,
parar, atualizar e remover.

**Um módulo não deve depender de detalhes internos de outro.** Comunicação por
contratos bem definidos.

## 6. Princípio de isolamento

Módulo quebrado não derruba o Baluarte. É **requisito arquitetural**:

```
3D Engine quebrado  → JARVIS continua funcionando
JARVIS quebrado     → Wiki continua funcionando
Social quebrado     → IDE continua funcionando
```

## 7. Event Bus

Segue sendo parte fundamental. Eventos têm: nome · origem · timestamp · payload ·
versão · contexto quando necessário.

O sistema deve permitir descobrir **quem emite, quem escuta, quais eventos estão
órfãos e quais módulos dependem deles**.

> O catálogo de eventos deve ser **gerado** sempre que possível.
> **NÃO manter catálogos manuais que possam ficar desatualizados.**

*(Já existe na V1: `scripts/gen-catalogo-eventos.mjs` →
[`../architecture/events.md`](../architecture/events.md), cobrado pelo CI.)*

## 8. Storage

Camada de armazenamento **abstraída** — módulos não acessam mecanismos
específicos sem passar pela camada do Core.

Deve prever: versionamento · migrações · schemas · validação · classificação de
dados · **backup** · recuperação · compatibilidade.

**Nenhuma alteração de schema sem pensar na migração dos dados existentes.**

## 9. Permissões

O sistema de permissões vive no Core. Módulo declara explicitamente o que pode
acessar (`READ_FILES`, `WRITE_FILES`, `NETWORK`, `DATABASE`, `SYSTEM_INFO`,
`USER_DATA`, `EXECUTION`).

> A existência de uma API **não** significa que qualquer módulo pode usá-la.
> **Permissão é separada de funcionalidade.**

## 10. JARVIS

A V2 constrói a **fundação** do JARVIS como cérebro do ecossistema — não o JARVIS
completo. Primeiro: API · contexto · memória · ferramentas · permissões ·
eventos · observabilidade · comunicação com módulos.

O JARVIS interage com módulos por APIs e contratos, **não tem acesso irrestrito**,
e toda ação importante exige permissão apropriada.

## 11. IDE

Preparar a arquitetura da futura Baluarte IDE (editor, explorer, terminal, Git,
testes, debugger, extensões, projetos, integração JARVIS) — **priorizando a
infraestrutura**, não a IDE completa.

## 12. 3D Engine

Preparar visualizador/engine 3D reutilizável, como **módulo independente**:
modelos locais e externos · cenas · câmera · iluminação · materiais · animações ·
interação · seleção · metadata · annotations.

## 13. Sistema social

Preparar arquitetura para usuários, comunidades, canais, mensagens, threads,
reações, mídia, arquivos, notificações, moderação e permissões — permitindo que
comunidades integrem futuramente Wikis, projetos, bots e 3D. **Não construir uma
rede social completa na primeira etapa.**

## 14. Sensores

Abstração de sensores; o Core **não** depende de sensor específico.

```
Sensor → Sensor API → Detection Event → Sensor Fusion → módulos consumidores
```

Preparar inicialmente: simulador · registry · API · eventos · metadata. Sensores
físicos entram depois por drivers/adapters.

## 15. Wikis

Cada Wiki é módulo independente (Militar, Arma 3, mods, Arma 4, GTA, Zombies,
futuras). **Dados, cálculo, parser e interface desacoplados.**

## 16. Parsers

Módulos capazes de interpretar formatos específicos (Lua, SQF, formatos de jogos,
configuração, dados estruturados). Cada parser independente.

## 17. Projetos externos

A V2 recebe projetos externos **sem que eles conheçam detalhes internos do
Baluarte** — via contratos/API. Alvo: Veritas, DailyPlanner, Stock Analyzer Bot,
Project Vanguard e futuros, como módulos/serviços integrados.

## 18. Performance

Desde a V2: **medir · testar · registrar · comparar.** Não otimizar por
percepção. Identificar consumo de memória, CPU, tempo de execução, carregamento,
eventos lentos, módulos pesados e gargalos. A otimização profunda é de versões
posteriores, mas **a V2 deve ser observável**.

## 19. Testes

Todo sistema novo nasce com testes. Prioridade: unit → integration → contract →
smoke → regression. Nenhum módulo crítico depende só de teste manual.

## 20. Documentação

Toda decisão arquitetural importante documentada. Preferir ADRs, diagramas,
contratos, schemas, exemplos e **documentação gerada**. Evitar documentação
duplicada manualmente — **o que puder ser gerado pelo código, gerar**.

## 21. Estratégia de branches

```
main
├── release/v1.x
└── v2-development
```

Branches de trabalho da V2: `v2/architecture` · `v2/core` · `v2/modules` ·
`v2/jarvis` · `v2/ide` · `v2/3d` · `v2/social` · `v2/wiki` · `v2/integrations`.

**Não fazer merge de grandes alterações sem testes.**

## 22. Regra contra feature creep

A existência de uma ideia não significa que ela precisa ser implementada
imediatamente. Para cada ideia perguntar:

1. É necessária para a arquitetura?
2. É necessária para a V2?
3. Pode esperar?
4. É melhor deixar só a interface preparada?
5. Vai aumentar acoplamento?
6. Existe maneira mais simples?

**Se puder esperar sem prejudicar a arquitetura, deve esperar.**

## 23. Princípio "preparar ≠ implementar"

Pode existir `Sensor API` sem radar físico · `3D Engine API` sem todos os
modelos · `JARVIS Tool API` sem todos os agentes · `Desktop API` sem o
Baluarte OS.

## 24. Futuro do projeto

```
V1  projeto atual          V6  automação
V2  reconstrução           V7  jogos
V3  módulos de Desktop     V8  otimização
V4  segurança              V9  gráficos + performance + hardware
V5  IA                     V10 Baluarte OS V1 + Beta Test
```

**Meta: Baluarte OS V1 em 2030.**

*(Ver a Decisão 7 do log: V3–V10 são marcos de capacidade sobre a arquitetura da
V2, não oito reconstruções.)*

## 25. Objetivo final da V2

Ao terminar, o Baluarte deve ser capaz de: receber, remover, atualizar e isolar
módulos · conectar projetos externos · compartilhar APIs e eventos · controlar
permissões · armazenar dados corretamente · testar automaticamente · **observar a
própria execução** · permitir novas interfaces sobre o Core.

## 26. Regra final para o agente

Antes de modificar código: estudar o repositório · estudar #420 · estudar #422 ·
estudar a arquitetura atual · identificar dependências · propor a alteração ·
explicar riscos · implementar em pequenas etapas · executar testes · documentar ·
verificar regressões.

**Não** fazer grandes reescritas cegamente · **não** apagar código sem entender
dependências · **não** assumir que um arquivo está obsoleto sem verificar
consumidores · **não** criar abstrações desnecessárias porque parecem elegantes ·
**não** adicionar dependências sem justificar · **não** implementar
funcionalidades futuras só porque estão planejadas.

Ordem: **arquitetura → Core → Module System → contratos → migração dos módulos
necessários → só então novos módulos grandes.**

---

## Definição de sucesso

A V2 **não** será bem-sucedida por ter mais funcionalidades que a V1.

> Ela será bem-sucedida quando **adicionar uma nova funcionalidade deixar de
> exigir alterações em dezenas de partes não relacionadas do sistema**.

Objetivo: reduzir acoplamento · aumentar modularidade · testabilidade ·
observabilidade · capacidade de expansão.
