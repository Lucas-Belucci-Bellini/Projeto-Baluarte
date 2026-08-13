# V2 — Registro de decisões

> **Fonte:** [issue #423, comentário de 2026-08-09](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423#issuecomment-5234197025).
>
> Este arquivo existe porque aquele comentário é o mais valioso e o mais
> enterrado dos quatro: as decisões abaixo **não estão no corpo do plano**, e
> estão misturadas com páginas de discussão. Uma sessão que lesse só o
> `V2_MASTER_PLAN.md` começaria a reconstrução sem nenhuma delas.
>
> Formato pedido pela Regra 30: decisão · contexto · alternativas · escolha ·
> consequências.

---

## Decisão 1 — A V1 é referência congelada, não arquitetura a ser mantida

**Contexto.** Toda reconstrução corre o risco de ser sabotada pela frase *"mas
não podemos quebrar isso porque a V1 fazia assim"*. Sem uma regra explícita, o
legado dita a arquitetura nova por inércia.

**Escolha.** Nas palavras do operador:

> **A V1 será tratada como uma versão congelada de referência, não como uma
> arquitetura que precisa ser mantida para sempre.**

**Consequências.** A V2 pode divergir livremente da V1 em estrutura. O que
**não** pode divergir sem plano é o *dado* do operador — daí a exportação com
versão por chave (`src/core/backup.js`) ser a ponte, e não a compatibilidade de
API.

---

## Decisão 2 — Três canais durante a reconstrução

**Contexto.** A reconstrução vai demorar muito, e durante ela a V2 fica quebrada.
Usuários precisam de uma escolha informada, não de uma surpresa.

**Escolha.**

| Canal | Para quem | Promessa |
| --- | --- | --- |
| **V1 Stable** | uso normal | é a versão recomendada; recebe **só** correção de segurança, estabilidade e problema crítico |
| **V2 Preview** | quem quer acompanhar | pode quebrar |
| **V2 Development** | desenvolvimento e teste | experimental |

E a regra que amarra: **a V2 não deve comprometer a estabilidade da V1.**

**Consequências.** Quem optar por acompanhar a V2 precisa ser avisado de que
*funcionalidades podem desaparecer, APIs podem mudar, dados podem precisar de
migração e partes inteiras do sistema podem ficar indisponíveis*. O aviso já está
no ar (`src/layout/aviso-v2.js`, faixa no topo do site e do app, e o README).

Quando a V2 atingir estabilidade adequada, ela passa por testes e é preparada
para **substituir** a V1 como versão principal — não antes.

---

## Decisão 3 — A V2 **não** será um repositório novo

**Contexto.** "Começar um projeto novo" parece limpo visto de fora.

**Alternativa descartada.** Criar `Projeto-Baluarte-V2/` do zero.

**Por que foi descartada.** O que existe não é só código: são integrações,
chaves e configurações de API, bancos, schemas e migrações, endpoints,
automações, GitHub Actions, documentação, issues, histórico de decisões, dados
e sistemas que já dependem uns dos outros. Um repositório novo não elimina a
complexidade — transforma reconstrução em **reconstrução + migração**, e ainda
adiciona a pergunta impossível de responder: *"esquecemos alguma coisa do
Baluarte antigo?"*

**Escolha.** Reconstruir dentro do mesmo ecossistema, usando o Git como a
máquina do tempo:

```
main
  └── V1 estável
v2-development
  └── reconstrução
legacy/*
  └── o que for preservado
```

**Consequência com dente.** Migra-se a **referência** à credencial, nunca a
credencial. Segredos continuam em mecanismos de secrets/configuração — copiar
chave de API para arquivo novo durante a migração é proibido (Regra 10).

---

## Decisão 4 — O problema da V1 é arquitetural, não de qualidade de código

**Contexto.** A distinção muda a estratégia inteira:

```
Problema de código:      "essa implementação está ruim."
Problema arquitetural:   "essa implementação até funciona, mas o sistema
                          cresceu demais para continuar organizado assim."
```

**Escolha.** A frase que o operador quis literalmente no plano:

> **O objetivo da V2 não é substituir código ruim por código melhor. O objetivo é
> substituir uma arquitetura que se tornou pequena demais para o projeto.**

E a leitura que ela permite: **a V2 não é porque a V1 fracassou — é porque a V1
cresceu.**

**Consequências.** O código existente carrega conhecimento (o que funcionou, o
que não funcionou, quais integrações existem, quais problemas apareceram). Ele é
**experiência adquirida**, e a Regra 24 se aplica: código estranho se investiga
antes de "corrigir", porque pode haver razão histórica.

---

## Decisão 5 — Camada de dados e proveniência são fundação, não otimização

**Contexto.** O Baluarte não é um conjunto de bots que buscam coisas; é um
sistema de aquisição, organização e recuperação de conhecimento. Se cada bot
tiver o próprio banco e o próprio formato, o resultado é exatamente o problema
que a V2 quer evitar: **informação espalhada**.

**Escolha.** Uma camada de dados comum, com módulos especializados:

```
Data Layer
├── Source Registry      ├── Search / Index
├── Data Ingestion       ├── Versioning
├── Normalization        ├── Provenance
├── Metadata             ├── Cache
└── Storage Adapters
```

E **proveniência em cada informação** — conteúdo, fonte, URL, quando foi
coletada, quando foi atualizada, quem coletou, confiança, versão, relações.

**Por que a proveniência não pode esperar.** Se um bot achar algo hoje e outra
fonte contradisser daqui a seis meses, o sistema não pode simplesmente
sobrescrever. Precisa saber que existem duas informações conflitantes, de fontes
e datas diferentes — é o que transforma banco de dados em infraestrutura de
conhecimento, e é o que permite ao JARVIS responder *"há duas informações
conflitantes; a mais recente veio da fonte X"*.

**A regra que sai daqui.**

> O Baluarte deve possuir uma camada central de conhecimento capaz de receber
> informações de múltiplos módulos e agentes, mantendo origem, contexto,
> versionamento, relações e estado de validação **sem exigir que os produtores de
> informação conheçam a estrutura interna dos consumidores**.

**Consequência.** Quem coleta **não é dono** da informação. Collector → Ingestion
→ Normalizer → Classifier → Verifier → Indexer → Knowledge Graph, e daí para
Search / JARVIS / Wikis.

---

## Decisão 6 — Concorrência é requisito arquitetural desde o primeiro dia

**Contexto.** Os bots não formam uma fila; formam um ecossistema. Um bot pode
pesquisar enquanto outro organiza dado anterior, outro verifica fonte e outro
atualiza índice — tudo ao mesmo tempo.

**Alternativa descartada.** Cadeia linear (`Bot A → Bot B → Bot C → banco`), e o
grafo de conhecimento mútuo entre bots (`Bot 1 conhece Bot 2 conhece Bot 3…`),
que com 500 bots vira teia impossível de manter.

**Escolha.** Event Bus como sistema nervoso. Um bot publica `DATA_FOUND` e não
precisa saber que os outros existem; quem se interessa reage.

> **A arquitetura V2 deve ser projetada para concorrência e comunicação
> assíncrona entre módulos desde sua fundação. O modelo não deve assumir uma
> cadeia linear de processamento.**

**Proteção obrigatória.** Um **Task/Job Manager** — prioridade, estado, origem,
dependências, tentativas, timeout, resultado; estados `QUEUED · RUNNING ·
WAITING · COMPLETED · FAILED · CANCELLED`. Sem ele, bots criam trabalho
infinitamente e o sistema vira tempestade de processos.

**Por que agora e não depois.** Descobrir isso com centenas de módulos já
construídos seria uma reconstrução dentro da reconstrução.

---

## Decisão 7 — V3–V10 são marcos de capacidade, não reconstruções

**Contexto.** O roadmap lista V3 Desktop, V4 Segurança, V5 IA, V6 Automação,
V7 Jogos, V8 Otimização, V9 Gráficos, V10 Baluarte OS. Lido como oito
reconstruções, é um projeto impossível.

**Escolha.**

> **V2 é a geração arquitetural do Baluarte.** As versões V3–V10 representam a
> expansão progressiva de capacidades e módulos **sobre essa arquitetura**.
> Sempre que possível, uma versão nova deve adicionar capacidade através do
> sistema modular existente, e não exigir nova reconstrução do Core.

**Consequências.** `V2 Core → Desktop Modules → V3`, não `jogar a V2 fora →
criar Desktop`. A V2 termina quando a **arquitetura-base estiver madura**, não
quando os módulos acabarem — daí poder existir V2.0 … V2.9 acrescentando
módulos. O número de módulos é métrica de crescimento; V3–V10 são capacidades.

---

## Decisão 8 — Issue antiga é funcionalidade bloqueada, não descartada

**Contexto.** A leitura *"esse issue não entrou na V1, então foi abandonado"*
joga fora ideia boa por motivo errado.

**Escolha.** A leitura correta é *"esse issue é bom, mas a arquitetura da V1 não
consegue comportá-lo"*. E a pergunta muda de lado:

```
Issue → "precisamos conectar módulo A com módulo B"
      → problema arquitetural
      → Module API / Event Bus / Permissions
      → uma decisão arquitetural desbloqueia dezenas de issues
```

**Classificação proposta pelo operador** (ainda **não** aplicada no GitHub — é
ação dele):

```
V1: bug · improvement · feature
V2: architecture · module · integration · rewrite · infrastructure · deferred-from-v1
label: v2-candidate
```

| Situação | Destino |
| --- | --- |
| bug crítico da V1 · correção pequena | V1 |
| melhoria simples | V1, se não aumentar dívida |
| precisa de nova arquitetura / módulos / integração | V2 |
| requer grande refatoração | V2 |
| ideia experimental | V2 / experimental |
| não faz mais sentido | fechar / arquivar |

**Relação com o que já existe.** A [`TRIAGEM-1.0.0.md`](../TRIAGEM-1.0.0.md)
respondeu outra pergunta — *alguma das 53 descreve defeito no que está estável?*
(não) — e continua válida. Esta decisão é o passo seguinte: reclassificar as boas
como bloqueadas-pela-arquitetura. Continua valendo a Regra 25: **não transformar
automaticamente todo issue em tarefa da V2.**

---

## Decisão 9 — Aceitar que a V2 parecerá parada por meses

**Contexto.** Semanas trabalhando num Module Registry não produzem nada visível
na interface.

**Escolha.** Aceitar explicitamente, e registrar por quê: quando o Registry
estiver certo, Wiki, bots, JARVIS, analisadores e 3D passam a poder ser
acrescentados **sem que cada um precise conhecer profundamente os outros**.

> É o tipo de trabalho de infraestrutura que não aparece na interface, mas
> determina o que o projeto será capaz de fazer depois.

**Consequência.** "Vai demorar muito" não é sinal ruim aqui — é o custo da
fundação que precisa sustentar tudo até o Baluarte OS.
