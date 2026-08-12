# V2 — Decisões de stack

> # ⛔ SUPERADO por [`V2_STACK_REVIEW.md`](./V2_STACK_REVIEW.md) e pelo [ADR-004](../architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md)
>
> **O que este documento errou, e vale saber por quê.** Ele tentou responder à
> diretriz de reavaliar o stack e concluiu "três linguagens, cada uma com sua
> responsabilidade" — mas **nunca perguntou se o Core deveria ser JavaScript**.
> Assumiu que sim, porque a V1 é. O operador viu:
>
> > *"ele ainda está entendendo a V2 como uma reconstrução arquitetural
> > principalmente dentro do stack atual […] A V1 é uma referência de
> > comportamento e dados. Ela não é uma referência obrigatória de arquitetura ou
> > linguagem."*
>
> A revisão nova mede em vez de supor, e chega a **cinco** mudanças de
> linguagem que esta análise não viu — inclusive um sistema inteiro que não
> existia (o Core de Runtime, em Rust) e a migração de Electron para Tauri.
>
> Fica no repositório em vez de ser apagado: o inventário da §1 continua correto
> e é a base da revisão nova, e o erro de método — *reavaliar o stack sem
> questionar a premissa* — é mais útil registrado do que sumido.

> **Diretriz do operador (2026-08-10):** *"Não quero que JavaScript seja mantido
> simplesmente porque a maior parte da V1 foi escrita em JavaScript. […] Não
> quero trocar linguagens por trocar. Quero que cada linguagem tenha uma
> responsabilidade clara. […] Não tenha como objetivo preservar a arquitetura da
> V1."*

## Correção de rota

A primeira versão da [`V2_ARCHITECTURE.md`](./V2_ARCHITECTURE.md) abria com
*"sete dos dezessete sistemas já existem e ficam"*. Isso é o argumento do esforço
já gasto — exatamente o que a [Regra 2](./V2_MASTER_PLAN.md#2-a-regra-mais-importante)
proíbe (*"'nós já temos isso' NÃO é motivo suficiente para manter código"*).
Aquela análise foi refeita aqui sem a âncora.

---

## 1. O que o Baluarte já é (medido, não suposto)

**O projeto não é "um site em JS".** Já é poliglota, e isso não estava
documentado em lugar nenhum:

| Camada | Tecnologia | Tamanho |
| --- | --- | --- |
| Web | JS puro (ES2022) + Vite 5 | 114 páginas · ~32k linhas |
| Dados estáticos | JS como formato de dados | 59 arquivos · ~21k linhas |
| Serverless | **Python** — 8 funções na Vercel (`chat`, `claude`, `hermes`, `memory`, `social`, `voz`, `nucleo`, `health`) | ~844 linhas |
| Backend local | **Python** — FastAPI + uvicorn (`backend/server.py`) | 254 linhas |
| Persistência | **PostgreSQL** via Supabase — auth, prefs, memória, comms, realtime, media | 10 módulos consumidores |
| Desktop | Electron (casca sobre o site ao vivo) + ponte gitnexus | — |
| 3D | `three` (única dependência de produção além do Capacitor) | — |

**Consequência imediata:** a pergunta *"devemos adotar Python?"* está mal posta.
Python já carrega IA, memória e social há tempo. O que falta não é a linguagem —
é arquitetura em volta dela.

### Duas dívidas que a medição expôs

**Duplicação (Regra 3).** `backend/server.py` implementa `/health` e `/chat`; e
existem `api/health.py` e `api/chat.py`. Duas implementações do mesmo serviço,
uma local e uma serverless, que podem divergir — e provavelmente já divergem.

**`src/data/` é banco de dados escrito como código.** 21 mil linhas de JS cuja
única função é ser dado: `arma3-colecao.js` sozinho tem 4.057 linhas. Isso não é
código — é uma tabela que exige `git push` e rebuild para mudar uma linha, não
tem consulta, não tem índice, não tem proveniência. Com bots alimentando dados
continuamente, esse formato **não escala** e é a primeira coisa que a Data Layer
substitui.

---

## 2. As decisões

### 🟢 PostgreSQL — a espinha de dados

**Responsabilidade:** identidade, dado do operador, conhecimento coletado,
proveniência, relações, índice, fila de tarefas.

Já existe (Supabase), já é usado por 10 módulos, e cobre sozinho quase tudo que
a [Decisão 5](./V2_DECISION_LOG.md) pede. Onde outros projetos acrescentariam um
banco de grafo, um Elasticsearch e um Redis, o Postgres entrega:

- **grafo de conhecimento** → tabelas de relação + CTE recursiva
- **busca** → full-text nativo; `pgvector` quando houver busca semântica
- **fila de tarefas** → `SELECT … FOR UPDATE SKIP LOCKED`
- **proveniência e versão** → colunas, não infraestrutura

> **Por que não um banco de grafo dedicado (Neo4j) agora:** o operador pediu
> arquitetura *"relativamente leve e administrável"*. Um segundo banco é um
> segundo backup, uma segunda migração, um segundo lugar de falha — para um
> ganho que só aparece em consultas de profundidade alta que ainda não existem.
> **Critério de reabertura:** quando uma consulta de grafo real passar de ~5
> saltos ou o `EXPLAIN` mostrar CTE recursiva dominando o tempo.

### 🟢 Python — coleta, dados e IA

**Responsabilidade:** bots, ingestão, normalização, classificação, verificação,
indexação, JARVIS server-side, parsers.

Já é a linguagem da camada de IA. Para o que a
[Decisão 6](./V2_DECISION_LOG.md) descreve — dezenas de bots em paralelo,
`asyncio`, ecossistema de scraping, NLP e ML — é a escolha certa e não custa
migração: **é greenfield**.

**O que muda:** a camada ad-hoc vira serviço com contrato. Resolver a duplicação
`backend/` × `api/` é pré-requisito, não detalhe.

### 🟡 Tipos no web — sim, mas **não** como as 12 iterações anteriores

Aqui é preciso honestidade histórica. O `README.md` diz, com todas as letras:

> *"Esta é a 13ª iteração do projeto. As 12 anteriores quebraram por
> **TypeScript**, stubs incompletos ou HTMLs gigantes inline."*

Recomendar TypeScript sem enfrentar isso seria leviano. Mas ignorar o benefício
também: escrevendo `v2/core/manifest.js` nesta sessão, produzi **13 invariantes
de runtime**, e mais da metade são *"esta string é um destes valores"* ou *"isto
é função"* — exatamente o que o compilador faz de graça. Contratos de módulo são
onde tipos pagam mais.

**O que provavelmente matou as 12 iterações não foi o sistema de tipos** — foi a
combinação listada: build complexo + nada terminado + nenhum teste. Nesse
cenário, build quebrado = projeto morto. Hoje há 494 testes, CI e 21 fases de
entrega incremental provadas.

Ainda assim, a recomendação é a versão que **não pode matar a 13ª**:

```
Etapa 1  JSDoc + checkJs no v2/     → verificação de tipo COMPLETA
                                      zero mudança de build
                                      zero migração de sintaxe
                                      reversível apagando uma linha
Etapa 2  .ts só onde se pagar       → contratos do Core, Module System
Etapa 3  avaliar o resto            → com dado, não com gosto
```

A Etapa 1 entrega a maior parte do benefício com risco praticamente nulo. Se ela
atrapalhar, desfaz-se em um commit — coisa que uma migração de sintaxe não
permite.

### 🔴 Rust · C/C++ · WebAssembly — **não agora**, e o motivo é regra sua

Nenhum uso hoje justifica. Os candidatos plausíveis:

| Candidato | Veredito |
| --- | --- |
| Parsers Lua/SQF | Python/JS resolvem no volume atual; sem medição, é suposição |
| Engine 3D | é WebGL — Rust não muda isso |
| Processamento de dados | o gargalo será I/O e banco, não CPU |
| Desktop (Tauri) | Electron funciona; trocar é reescrever a casca por ganho de tamanho que não bloqueia nada |

A **Regra 19** diz: *"não afirmar que algo é mais rápido, mais leve ou mais
eficiente sem medição quando a medição for possível"*. A **Regra 5** exige
justificar dependência. Adotar Rust agora seria trocar linguagem por parecer
moderno — o que o próprio operador pediu para não fazer.

> **Critério explícito de reabertura:** um perfil de execução real mostrando que
> um componente é limitado por CPU e responde por >20% do tempo de uma operação
> que o operador percebe. Aí Rust→WASM entra **naquele componente**, não no
> projeto.

### 🔴 Framework de UI — não por atacado

Trocar 114 páginas de DOM manual por React/Svelte é a maior migração possível
pelo menor ganho arquitetural: **não é o framework que falta, é o manifesto**. A
medição mostrou 10 lugares por página e zero inversão de dependência — o
problema é declaração espalhada, não renderização.

**Exceção com critério:** um módulo específico e comprovadamente pesado de
estado — a IDE é o candidato — pode adotar uma biblioteca de UI **dentro do seu
próprio limite**, se o Module System garantir isolamento. É o teste real da
arquitetura: se um módulo não pode escolher sua própria tecnologia de
renderização, o isolamento é retórico.

### 🔴 Microserviços — não

O operador já disse. Registrado aqui para não ser reaberto por moda: a
arquitetura é **modular no processo**, com fronteiras de módulo, não de rede.
Serviço separado só quando houver razão operacional real (escala independente ou
runtime diferente — os bots Python são o caso legítimo).

---

## 3. O desenho que sai disso

```
┌──────────────────────────────────────────────────────────┐
│  WEB — JS tipado (JSDoc→TS)                              │
│  Core · Module System · Event Bus · UI                   │
└───────────────┬──────────────────────────────────────────┘
                │ contratos versionados (HTTP/JSON)
┌───────────────┴──────────────────────────────────────────┐
│  SERVIÇOS — Python                                       │
│  bots · ingestão · classificação · JARVIS · parsers      │
│  Task Manager (fila no Postgres)                         │
└───────────────┬──────────────────────────────────────────┘
                │ SQL
┌───────────────┴──────────────────────────────────────────┐
│  DADOS — PostgreSQL                                      │
│  conhecimento · proveniência · relações · índice · fila  │
└──────────────────────────────────────────────────────────┘
```

**Três linguagens, três responsabilidades**, e a fronteira entre elas é contrato
versionado — não import. É onde mora o trabalho de arquitetura real: se o
contrato web↔Python for frouxo, a modularidade morre na fronteira, e nenhum
Module System no lado JS salva.

---

## 4. O que precisa ser preservado na migração

O operador pediu: *"ao migrar uma tecnologia, primeiro identifique as
dependências e o que precisa ser preservado."*

| Ativo | Onde está | Como sobrevive |
| --- | --- | --- |
| Dado local do operador | `localStorage`, 72 chaves | `src/core/backup.js` — exporta com **versão por chave** |
| Identidade e nuvem | Supabase (auth, prefs, memória, comms) | Postgres **fica**; muda o schema em volta, com migração |
| Conteúdo (Crônicas, Arma 3, arsenal) | `src/data/` — 21k linhas de JS | migra para tabelas; o JS vira *seed*, não fonte |
| Segredos | variáveis de ambiente (Vercel/Supabase) | **migra-se a referência, nunca o valor** — nenhuma chave entra em código ou commit |
| Histórico de decisão | ADRs, `docs/`, issues | fica |
| Testes | 494 | ficam e valem para a V2 |

---

## 5. O que fica em aberto

1. **Qual é o primeiro serviço Python de verdade** — o Task Manager (fundação) ou
   um bot de prova (valida a ponta a ponta)? Inclino-me ao Task Manager: bot sem
   fila vira script solto, e script solto é o que a Decisão 6 quer evitar.
2. **Resolver `backend/` × `api/`** antes ou depois do Core? É dívida da V1 que a
   V2 herda; deixar para depois significa construir sobre duplicação conhecida.
3. **Supabase gerenciado ou Postgres próprio?** Muda pouco no schema e muito na
   operação. O gerenciado sustenta o crescimento de dados que a Decisão 5
   antecipa?
