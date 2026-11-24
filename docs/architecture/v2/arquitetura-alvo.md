# Arquitetura-alvo do Baluarte V2

> **Status:** 🟡 documento de arquitetura em elaboração — direção parcialmente
> confirmada.
>
> **Origem:** [issue #540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540),
> com o comunicado de disponibilização da [issue #539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539).
> Complementa o Plano Mestre [#423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423)
> e o plano de fundação [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420).
>
> **Regra deste documento:** o que ainda não foi confirmado permanece marcado
> como **proposto** ou **pendente**. Proposta não é decisão. Decisão fechada vira
> ADR em [`../decisions/`](../decisions/) e só é reaberta por outro ADR.

---

## Como ler este documento

| Marca | Significado |
| --- | --- |
| ✅ **Definido** | direção confirmada pelo responsável pelo projeto, registrada em ADR quando for decisão arquitetural |
| 🟣 **Proposto** | recomendação técnica para discussão — **não aprovada** |
| 🟡 **Pendente** | escolha ainda não feita; não pode ser tratada como decidida |
| ⛔ **Conflito aberto** | duas fontes de decisão divergem; precisa de resolução explícita do operador |

As seções 15 e seguintes da issue #540 são uma **proposta técnica do autor da
issue**. Elas aparecem aqui resumidas e marcadas, porque são o ponto de partida
mais concreto que existe — não porque estejam aprovadas.

---

## 1. Direção confirmada

1. ✅ **A V2 é uma reconstrução arquitetural**, não uma atualização incremental da
   V1. Muda a estrutura de código, as responsabilidades e a organização dos
   componentes.
2. ✅ **Todo o frontend da V2 será escrito em TypeScript.**
3. ✅ **O backend da V2 reunirá Python, Rust e C++.**
4. ✅ **Durante a reconstrução, o Baluarte será disponibilizado somente como
   aplicativo** — sem retorno do site e sem data definida ([#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539), [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md)).

O que **não** está confirmado: a divisão exata de responsabilidades entre Python,
Rust e C++; a linguagem do Core; o mecanismo de comunicação entre componentes; o
banco; o shell do aplicativo; o empacotamento; as plataformas; o nível de
compatibilidade com a V1. Ver [§16](#16-decisões-pendentes).

Decisões antigas que continuam valendo para o que já foi construído estão em
[ADR-001](../decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md),
[ADR-002](../decisions/ADR-002-permissoes-deny-by-default.md),
[ADR-003](../decisions/ADR-003-congelamento-e-manutencao-da-v1.md) e
[ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) — com as
ressalvas registradas em [§17](#17-conflitos-e-divergências-abertos).

---

## 2. Ponto de partida real

Nada aqui é promessa: é o que existe no repositório hoje. A arquitetura-alvo
precisa partir disto, não de uma folha em branco.

| Peça | Onde | Linguagem | Estado |
| --- | --- | --- | --- |
| Site V1 | `src/`, `index.html`, Vite 5 | JavaScript puro | congelando; referência de comportamento e dados (ADR-001/#420) |
| App V1 | `desktop/` (Electron + IPC) | JavaScript | operacional; herda a decisão de shell do ADR-004 |
| Core V2 protótipo | `v2/core/` — manifesto, registry, contexto, log, ciclo, boot, bus, config, api, métricas, trabalho | JS com `checkJs` + arquivos `.ts` parciais | 11 peças, testadas; migração parcial para TS em andamento |
| Runtime V2 | `v2/runtime/` (`Cargo.toml`, `src/`, `tests/`) | Rust | crate real; hoje só `ReadFile` implementado e `RuntimeStopped` |
| Worker V2 | `v2/services/tarefas/` | Python | backoff, heartbeat, lote; 14 testes |
| Dados V2 | `v2/data/migrations/`, `v2/data/*.ts` | SQL/Postgres + TS | migrações de proveniência, grafo e fila; testes contra Postgres real |
| Módulos de prova | `v2/modules/{cripto,editor,militar}` | JS | primeiro módulo nativo, caso de acoplamento e caso difícil |
| Harness | `v2/harness/` | JS | prova a V2 dirigindo o router real da V1 |
| Benchmark | `v2/bench/` | JS/mjs | números que sustentam o ADR-004 |
| Protótipos visuais | `project V2/*.html` | HTML | referência de interface, não arquitetura |

Consequência prática: a V2 **já tem** um Core de orquestração prototipado em JS,
um Runtime em Rust, um worker Python e persistência em Postgres. A questão
arquitetural não é "o que criar do zero", é **o que cada peça vira** e **onde
ficam as fronteiras** na nova organização.

---

## 3. Princípios

Os oito objetivos da [visão da V2](../v2-vision.md) continuam sendo a bússola.
Aplicados a este documento:

1. **O Baluarte é plataforma, não site.** O produto é o aplicativo.
2. **Projeto externo se conecta por contrato**, sem alterar o Core.
3. **O Core não conhece implementações.** Conhece contratos e capacidades.
4. **Um domínio tem um dono.** Não existem duas implementações concorrentes da
   mesma regra em linguagens diferentes.
5. **Toda fronteira tem contrato versionado e testável.**
6. **Acesso é negado por omissão** (ADR-002). Manifesto não é sandbox.
7. **Medir antes de trocar de linguagem.** A lição do ADR-004: um defeito O(n²)
   de 1073 µs virou 4,0 µs **em JavaScript**. Linguagem não conserta algoritmo.
8. **Preparar ≠ implementar.** Interface sem consumidor pode ser documentada;
   não deve ser construída antes do caso de uso.
9. **A V1 é referência congelada** de comportamento e dados — não de arquitetura
   nem de linguagem (ADR-001, ADR-003).
10. **Local-first:** as funções essenciais do aplicativo não dependem de
    infraestrutura remota. Serviço remoto é capacidade opcional, não pré-requisito
    de boot.

---

## 4. Visão de alto nível

Diagrama lógico. Ele **não** define ainda se cada caixa é processo, biblioteca ou
pacote — isso é pendência ([§16](#16-decisões-pendentes)).

```text
┌──────────────────────────────────────────────────────────────┐
│                    BALUARTE — APLICATIVO                     │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ FRONTEND — TYPESCRIPT                                   │  │
│  │ Interface · Navegação · Estado · Cliente tipado          │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │ contrato local tipado          │
│  ┌───────────────────────────▼────────────────────────────┐  │
│  │ CORE / HOST                                             │  │
│  │ Boot · Runtime · Event Bus · Task Manager · Registry    │  │
│  │ Permissões · Config · Logs · Supervisão de processos    │  │
│  └──────┬──────────────────────────────────┬──────────────┘  │
│         │ contrato de worker               │ C ABI / FFI       │
│  ┌──────▼──────────────────┐      ┌────────▼───────────────┐  │
│  │ PYTHON — WORKERS        │      │ C++ — BIBLIOTECAS      │  │
│  │ IA · Automação · Dados  │      │ Nativas especializadas │  │
│  │ Parsers · Integrações   │      │ (só com benchmark)     │  │
│  └─────────────────────────┘      └────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ MODULE SYSTEM — manifestos e capacidades concedidas     │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ DADOS E EVIDÊNCIAS — armazenamento, migrações,          │  │
│  │ proveniência, backup e restauração                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

A linguagem do Core/Host é pendente. A [proposta da #540 §15](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) recomenda
Rust; o ADR-004 já fixou **Rust para o Core de Runtime** (processo local) e
**TypeScript para o Core de Orquestração** de interface. A consolidação das duas
visões é uma decisão do operador — [§17](#17-conflitos-e-divergências-abertos).

---

## 5. Fronteiras por linguagem

### 5.1 Matriz de responsabilidades

| Domínio | Responsável | Estado | Observação |
| --- | --- | --- | --- |
| Interface, navegação, estado visual, cliente dos contratos | **TypeScript** | ✅ Definido | todo o frontend; nada de JS solto no frontend novo |
| Validação de dados no limite da interface | **TypeScript** | ✅ Definido | esquema e cliente tipados |
| Core de Orquestração (rotas, views, eventos de UI) | TypeScript | ✅ ADR-004 | hoje prototipado em `v2/core` (JS/TS parcial) |
| Core de Runtime (processo local, permissões reais, filesystem, supervisão) | **Rust** | ✅ ADR-004 | implementação mínima existe em `v2/runtime` |
| IA, coleta, automação, integrações flexíveis | **Python** | ✅ ADR-004 | executa como worker supervisionado |
| Parsers binários (`.p3d`, `.pbo`) | Rust | ✅ ADR-004 | Python era 140× mais lento em laço de byte |
| Bibliotecas nativas especializadas / SDKs C/C++ | **C++** | 🟡 Pendente de escopo | #540 determina a presença; a fronteira exige benchmark |
| Camada de dados e persistência | 🟡 A definir | 🟡 Pendente | ⛔ ADR-004 fixa Postgres; #540 mantém pendente ([§17](#17-conflitos-e-divergências-abertos)) |
| Mecanismo de comunicação entre linguagens | 🟡 A definir | 🟡 Pendente | proposta em [§8](#8-contratos-e-comunicação) |
| Shell do aplicativo | 🟡 A definir | 🟡 Pendente | ADR-004 indica Tauri (Rust) pós-1.0.0 |

### 5.2 Regras de fronteira

- **TypeScript apresenta e coordena a experiência.** Não acessa banco,
  filesystem irrestrito, processo do sistema ou biblioteca nativa diretamente.
  Tudo passa por capacidade concedida pelo Core.
- **Rust é o núcleo confiável de execução local.** Não absorve regra de negócio
  de módulo; permanece pequeno e estável.
- **Python implementa workers** — IA, automação, dados, integração — sob
  inicialização, permissão, timeout, cancelamento e encerramento do Core. Worker
  não abre API pública por padrão.
- **C++ fornece biblioteca nativa isolada**, com interface C estável (C ABI),
  consumida pelo Core. Não criar um segundo Core em C++ e não duplicar o que Rust
  já faz sem ganho medido.
- **Uma regra de negócio tem um único dono.** Se a mesma regra aparecer em duas
  linguagens, uma das duas está errada.

### 5.3 Critério para decidir a linguagem de uma função

1. Qual é o ecossistema que resolve o problema (biblioteca, SDK, modelo)?
2. Qual é o volume por travessia e a frequência da chamada?
3. Existe benchmark que mostre ganho real, descontando o pedágio da fronteira?
4. A função precisa de garantia de memória/isolamento que só Rust ou C++ dão?
5. Se nenhuma resposta for decisiva, a função fica na linguagem do domínio
   proprietário — não se cria fronteira nova sem motivo.

---

## 6. Core e ciclo de execução

Componentes que o [#423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423)
e a [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540)
tratam como fundação. A coluna "hoje" aponta o que já existe no protótipo.

| Componente | Objetivo | Hoje |
| --- | --- | --- |
| Boot | inicializar configuração, contexto, logs, dados e registrar módulos | `v2/core/boot.js` |
| Config | configuração declarada, com faixa e segredo que não vaza | `v2/core/config.js` |
| Log | log estruturado com dono, nível e correlação | `v2/core/log.js` |
| Event Bus | comunicação por eventos com origem, versão e curinga | `v2/core/bus.js` |
| Task Manager | concorrência, teto, prioridade, cancelamento, justiça | `v2/core/trabalho.ts` |
| Module Registry | descoberta, colisão, ciclo, ordem, dependências | `v2/core/registry.ts` |
| Lifecycle | `init → start → stop → dispose`, isolado por módulo | `v2/core/ciclo.js` |
| Permissions | capacidades por módulo, negadas por omissão | `v2/core/contexto.js` |
| Runtime host | execução isolada, política por módulo, filesystem autorizado | `v2/runtime/` (Rust) |
| Process supervisor | iniciar/parar/encerrar workers Python e processos auxiliares | 🟡 pendente |
| Métricas / diagnóstico | contagem, tempo, teto de cardinalidade, saúde | `v2/core/metricas.js`, `v2/core/module-runtime-health.js` |

**Contrato mínimo de cada componente** (a ser detalhado por ADR ou contrato
próprio): objetivo, API pública, proprietário, dependências permitidas, ciclo de
vida, falhas possíveis, comportamento de recuperação e testes.

### 6.1 Fluxo de inicialização (proposto)

1. O shell inicia o Core.
2. O Core carrega configuração e verifica a versão dos dados.
3. Inicializa logs, persistência e serviços essenciais.
4. O Module Registry descobre e valida os módulos instalados.
5. O Core inicia somente os workers necessários.
6. O frontend conecta-se ao Core pelo contrato local.
7. A interface recebe o estado de prontidão e apresenta o aplicativo.
8. Ao encerrar, o Core cancela tarefas, encerra workers, fecha recursos e
   persiste o estado necessário.

### 6.2 Regras de falha

- Falha em módulo opcional **não derruba o aplicativo**.
- Falha no Core ou em serviço essencial produz diagnóstico claro e recuperação
  segura — nunca um estado meio-inicializado silencioso.
- Worker Python que não responde é encerrado por timeout e registrado; o Core não
  fica bloqueado.
- Recurso não concedido falha fechado (ADR-002).

---

## 7. Module System

O Module System é a entrega central da V2 ([`V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md)).
O diagnóstico que o originou continua válido: o problema da V1 não é acoplamento
entre módulos, é **não existir um lugar onde um módulo se declare**. Na V1,
adicionar uma página exige tocar dez arquivos; na V2, um manifesto.

### 7.1 Manifesto — formato atual do protótipo

O contrato já validado em `v2/core/manifest.d.ts` (tipos reais, não proposta):

```ts
interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  stability?: 'estavel' | 'beta' | 'experimental';
  ambiente?: 'web' | 'app' | 'ambos';
  icon?: string;
  routes?: { path: string; view: () => Promise<unknown> }[];
  nav?: { section?: string | null; order?: number };
  dependencies?: string[];
  references?: { routes?: string[]; modules?: string[] };
  permissions?: Permission[];       // READ_FILES, WRITE_FILES, NETWORK,
                                    // DATABASE, SYSTEM_INFO, USER_DATA, EXECUTION
  storage?: { key: string; version: number; class: DataClass; migrate? }[];
  events?: { emits?: string[]; consumes?: string[] };
  api?: Record<string, unknown>;
  apiVersion?: number;
  lifecycle?: Record<string, LifecycleHandler>;
}
```

Regras que o protótipo já provou:

- **Módulo não é rota.** As 99 rotas da V1 não viram 99 módulos.
- **Namespace de storage por módulo** — um módulo não alcança a chave de outro.
- **O Core consome o manifesto.** Se ele só descrevesse, a V2 teria onze lugares
  de registro em vez de dez.
- **Manifesto não é sandbox.** Permissão declarada é pedido; capacidade concedida
  é decisão do Core, validada de novo no Runtime.

### 7.2 O que o Module System precisa documentar

- contrato padrão e validação de manifesto;
- descoberta, registro, inicialização e encerramento;
- permissões, capacidades e isolamento real por plataforma;
- comunicação entre módulos (API declarada, eventos versionados);
- versionamento e compatibilidade de contrato;
- dependências, ordem de inicialização e detecção de ciclo;
- instalação, atualização e remoção;
- comportamento quando um módulo falha ou entra em crash loop.

### 7.3 Estado atual

O protótipo cobre manifesto, registry, contexto, ciclo, boot, API entre módulos e
isolamento de falha. `cripto`, `editor` e `militar` validaram o contrato contra
casos fácil, acoplado e difícil. O que falta está em
[`v2/README.md`](../../../v2/README.md) (“O que ainda não existe”) e depende do
gate da V1.

---

## 8. Contratos e comunicação

Toda fronteira precisa de contrato verificável. Chamada direta entre linguagens
sem contrato é o defeito que a V2 existe para não repetir.

### 8.1 Fronteiras e transporte

| Fronteira | Transporte proposto | Estado |
| --- | --- | --- |
| Frontend TS ↔ Core | contrato local tipado, operações em lista permitida, envelope com id de requisição, resposta e erro padronizados | 🟣 proposto; o protótipo usa ponte JS |
| Core ↔ Runtime Rust | envelope JSON versionado, validado dos dois lados | 🟣 em parte implementado (`v2/runtime/CONTRACT.md`) |
| Core ↔ worker Python | protocolo estruturado sobre stdio ou socket local protegido, supervisionado | 🟣 proposto; worker existe, protocolo não fechado |
| Core ↔ biblioteca C++ | C ABI pequena e documentada: ownership, códigos de erro, concorrência | 🟡 pendente (escopo de C++ em aberto) |
| Módulo ↔ Core | API e eventos versionados; manifesto e capacidades | ✅ protótipo validado |
| Módulo ↔ persistência | contratos de dados e serviços autorizados; sem conexão própria | 🟣 proposto |

### 8.2 Envelope do Runtime (formato existente)

```json
{
  "versao": 1,
  "modulos": [
    {
      "modulo": "wiki",
      "permissoes": ["READ_FILES"]
    }
  ]
}
```

Rejeições já implementadas: versão incompatível, módulo duplicado, ID vazio,
permissão desconhecida e permissão duplicada. A raiz de filesystem vem do host
confiável, não do manifesto.

### 8.3 Regras de contrato

1. **Versionar tudo que atravessa fronteira** — envelope, manifesto, API de
   módulo, esquema de dados.
2. **Erro é parte do contrato**, com código estável e mensagem legível.
3. **Timeout, cancelamento e recuperação são explícitos**, não deixados ao
   transporte.
4. **Serialização começa simples.** JSON resolve o começo; Protobuf ou binário
   só entram com necessidade medida de desempenho, compatibilidade ou geração de
   clientes.
5. **Autenticação interna** entre componentes locais segue o modelo de
   capacidades; worker não ganha acesso ao aplicativo inteiro.
6. **Teste de contrato acompanha cada fronteira** ([§13](#13-testes-qualidade-e-integração-contínua)).

---

## 9. Dados, persistência e evidências

A [Decisão 5](../../v2/V2_DECISION_LOG.md) trata camada de dados e proveniência
como **fundação**, não otimização: se cada módulo tiver seu banco e formato, volta
o problema que a V2 quer resolver.

### 9.1 O que precisa existir

- **Data Layer** — Source Registry, ingestão, normalização, metadados, busca,
  versionamento, cache, adaptadores de armazenamento.
- **Evidence Layer** — origem, data de coleta, data de atualização, coletor,
  confiança, versão, relações e estado de validação em cada informação.
- **Contratos de persistência** — modelos, esquemas versionados, migrações.
- **Backup e restauração testados**, não apenas implementados.
- **Isolamento e política de acesso** por módulo.
- **Conflito é dado, não erro:** duas fontes contraditórias coexistem com
  proveniência distinta; o sistema sabe qual é mais recente e de onde veio.

### 9.2 O que já existe

`v2/data/migrations/` tem esquema de proveniência, grafo e fila, com testes
contra Postgres real. O worker Python usa fila com `SKIP LOCKED`. Isso é o
alicerce concreto da Data Layer — não uma proposta.

### 9.3 Pendência que trava decisões

O motor de persistência está ⛔ em conflito: o ADR-004 fixou **PostgreSQL** para
dados e fila; a #540 mantém "qual banco e estratégia de persistência" como
pendente e a §15.6 propõe **SQLite local** para configuração e estado, com
Postgres remoto só onde houver sincronização. As duas coisas podem conviver
(SQLite no dispositivo + Postgres no servidor), mas isso precisa ser decidido e
registrado — não presumido.

---

## 10. Segurança e confiabilidade

| Tema | Regra |
| --- | --- |
| Autorização | negado por omissão (ADR-002); capacidade precisa ser declarada e concedida |
| Manifesto | é declaração de intenção, **não** sandbox; isolamento real depende da plataforma |
| Segredos | referência à credencial, nunca a credencial em arquivo; Regra 10 do plano |
| Validação de entrada | no limite de cada fronteira, inclusive entre componentes locais |
| Isolamento entre módulos | política por módulo no Core e no Runtime; filesystem com raiz autorizada |
| Limites de recursos | CPU, memória, tempo, fila; Task Manager aplica teto e cancelamento |
| Logs e auditoria | estruturados, com dono, correlação e retenção definida |
| Atualização | assinatura/verificação dos artefatos e rollback testado |
| Falha | fechar, registrar e recuperar; nunca degradar em silêncio para acesso amplo |

A segurança do aplicativo não pode depender de o módulo ser "confiável". Módulo de
terceiro não recebe acesso irrestrito ao sistema operacional por padrão.

---

## 11. Aplicativo e estratégia de disponibilização

✅ **Decidido ([#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539), [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md)):**
durante a reconstrução, o Baluarte é disponibilizado **somente como aplicativo**.
O site não faz parte dos planos neste momento e não há data de retorno. Uma
eventual versão web exigirá decisão própria e novo ADR.

Isso reposiciona a arquitetura:

- a experiência do aplicativo é o produto, não um invólucro do site;
- empacotamento, atualização e rollback do app são requisitos de primeira classe;
- o frontend TypeScript não pode assumir um servidor web público;
- recursos da V1 que só existiam para o site não são herdados automaticamente.

Ainda pendente: tecnologia do shell, plataformas suportadas inicialmente,
empacotamento dos runtimes Rust/Python/C++, assinatura, canal de atualização,
rollback e diagnóstico de suporte. O ADR-004 indica **Tauri (Rust)** como destino
pós-1.0.0; a #540 lista o shell como pendente — ver
[§17](#17-conflitos-e-divergências-abertos).

---

## 12. Estrutura de repositório (proposta)

Estrutura lógica sugerida pela #540 §15.4. **Não é obrigatória**, não exige
monorepo e não deve ser criada inteira no primeiro dia. A organização atual
(`src/` da V1 + `v2/` da reconstrução) permanece até a migração de cada fatia.

```text
baluarte/
├── apps/
│   └── desktop/
│       ├── frontend/          # TypeScript: UI e experiência
│       ├── shell/             # integração do aplicativo
│       └── assets/
├── core/
│   ├── host/                  # Core e Runtime (linguagem pendente)
│   ├── contracts/             # contratos e esquemas versionados
│   ├── module-system/
│   └── security/
├── backend/
│   ├── python/                # workers, IA, automação, integrações
│   └── cpp/                   # bibliotecas nativas, include, testes
├── modules/<nome>/            # manifesto, contratos, src, testes
├── data/                      # schemas, migrações, evidências
├── shared/                    # esquemas e clientes gerados
├── tests/                     # contratos, integração, e2e, performance
├── packaging/
└── docs/                      # architecture, adr, security, operations
```

Decisão pendente: **monorepo único ou múltiplos repositórios**. Critérios:
build, versionamento, ownership, distribuição e custo de integração.

---

## 13. Testes, qualidade e integração contínua

Cada domínio tem verificação própria; cada fronteira tem teste de contrato. O
CI só vale se cobrar o que importa.

| Verificação | Estado |
| --- | --- |
| Type-check e testes do frontend TypeScript | 🟡 frontend novo ainda não existe; `v2/tipos` cobre o protótipo |
| Testes e verificações de Python | ✅ worker `tarefas` tem testes |
| Testes, lint e build de Rust | 🟡 crate existe; cobertura mínima |
| Testes e compilação de C++ | 🟡 não existe |
| Testes de contrato entre linguagens | 🟡 parcial (envelope do Runtime) |
| Testes do Core e do ciclo de vida dos módulos | ✅ protótipo com testes e mutantes |
| Testes ponta a ponta do aplicativo | 🟡 harness existe; app V2 não |
| Verificação de segurança e dependências | 🟡 herda o que a V1 tem |
| Build reproduzível e validação de artefatos | 🟡 pendente de empacotamento |

Regra: **CI verde não se obtém relaxando verificação nem escondendo falha.** Se um
teste de contrato falha, a fronteira mudou sem versão — o conserto é o contrato,
não o teste.

---

## 14. Migração V1 → V2

A V1 é referência congelada de comportamento e dados (ADR-001, ADR-003). A
migração é **por estrangulamento e por fatias verticais** — nunca "apagar e
começar de novo", nunca big bang nas 99 rotas.

### 14.1 Inventário (pendente)

Para cada funcionalidade, módulo, dado e dependência da V1, classificar:

| Classe | Critério |
| --- | --- |
| **Reaproveitar** | funciona e cabe no contrato novo sem gambiarra |
| **Adaptar** | a ideia serve; a implementação muda de forma |
| **Reescrever** | a arquitetura nova exige outra implementação |
| **Substituir** | existe solução melhor no ecossistema novo |
| **Descontinuar** | não faz sentido no produto atual |

### 14.2 Regras

- Uma capacidade só sai da V1 depois que a fatia V2 equivalente passa nos
  critérios de aceite e nos testes de contrato.
- O dado do operador migra pela ponte de backup com versão por chave — é o dado
  que não pode divergir sem plano (Decisão 1).
- Migrar por fatias testáveis; não exigir a V2 inteira pronta para validar o
  primeiro fluxo.
- O que precisa permanecer compatível com a V1 deve ser listado explicitamente,
  não inferido.

### 14.3 Primeira fatia (proposta)

Abrir o app, subir o Core, executar uma chamada tipada do frontend, rodar um
worker, persistir um dado e encerrar corretamente. É pequena o bastante para
falhar cedo e completa o bastante para provar todas as fronteiras.

---

## 15. Riscos

| Risco | Por que é real | Mitigação |
| --- | --- | --- |
| **Complexidade multilíngue** | três toolchains em build, teste, depuração e distribuição | reduzir fronteiras; contrato estável; CI por linguagem |
| **C++ sem caso de uso** | pode duplicar Rust e virar dívida permanente | exigir benchmark e caso concreto antes da primeira linha |
| **Python empacotado no app** | versão, dependências e inicialização reproduzível | worker supervisionado; ambiente isolado; teste de boot limpo |
| **IPC excessivo** | travessia custa caro; frequência alta transforma fronteira em gargalo | medir; operações em lote; manter alta frequência no mesmo lado |
| **Manifesto vira documentação** | modo de falha silencioso: tudo parece certo enquanto diverge | Core consome o manifesto; gerador cobra no CI |
| **Plugin system inseguro** | manifesto não é sandbox | isolamento real por plataforma antes de executar módulo externo |
| **Big bang na migração** | 99 rotas de uma vez é a Regra 28 ao contrário | ondas e fatias verticais |
| **V2 parecer parada** | meses de fundação sem resultado visível | marcos verificáveis (Decisão 9) |
| **Perda de dado na migração** | já quase aconteceu | backup versionado por chave + restauração testada |

---

## 16. Decisões pendentes

Nenhuma linha abaixo pode ser tratada como decidida. Cada uma deve virar ADR com
contexto, alternativas, escolha, consequências e data.

As três decisões que travam as demais (D5, D6 e D7) têm um dossier com opções,
recomendação e critérios de aceite em
[`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) — ainda
proposta, não decisão.

| # | Decisão | Bloqueia | Observação |
| --- | --- | --- | --- |
| D1 | Framework/biblioteca de interface e estratégia de estado do frontend TS | início do app V2 | ADR-004 só fixa a linguagem |
| D2 | Responsabilidade precisa de Python | desenho dos workers | base no ADR-004; falta contrato |
| D3 | Responsabilidade precisa de Rust | desenho do Core/Runtime | base no ADR-004; falta consolidar com #540 |
| D4 | Escopo de C++ | build, CI, distribuição | precisa de benchmark; não é "C++ para tudo" |
| D5 | Linguagem do Core de Orquestração e do Host | arquitetura do app | ADR-004: TS (orquestração) + Rust (runtime); #540 propõe Rust como host |
| D6 | Componentes são processos, bibliotecas ou mistura | IPC, empacotamento, segurança | impacta quase tudo |
| D7 | Mecanismo de comunicação entre linguagens | contratos, testes de contrato | §8 propõe, não decide |
| D8 | Banco e estratégia de persistência | Data/Evidence Layer | ⛔ ver §17 |
| D9 | Empacotamento, atualização e rollback do app | distribuição | app-only aumenta a urgência |
| D10 | Plataformas suportadas inicialmente | shell, build, testes | ADR-004 menciona Tauri/M3c/M4 |
| D11 | Compatibilidade com dados e módulos da V1 | migração | ADR-001/003 preservam a V1 |
| D12 | Monorepo ou múltiplos repositórios | organização do código | critérios em §12 |
| D13 | Shell do aplicativo (Tauri vs. Electron vs. outro) | app V2 | ADR-004 indica Tauri; #540 pendente — ⛔ ver §17 |

Prioridade sugerida (proposta, não decisão): **D3/D5/D6 → D7 → D1/D13 → D8 →
D9/D10 → D2/D4 → D11/D12**. A razão é que a fronteira Core↔linguagens determina o
formato de tudo o mais; escolher UI antes dela arrisca refazer o cliente.

---

## 17. Conflitos e divergências abertos

Esta seção existe porque fingir que as fontes concordam é pior do que registrar a
divergência. Nada aqui foi resolvido por este documento.

| # | Divergência | Fontes | Situação |
| --- | --- | --- | --- |
| C1 | C++ fora vs. C++ no backend | ADR-004 (“Go, C e C++ ficam de fora”) × #540 (“backend reunirá Python, Rust e C++”) | **Resolvido a favor da #540** por [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md). O escopo de C++ continua pendente (D4). |
| C2 | Site/web no escopo vs. somente app | v2-vision e ADR-004 falam de “interface web”; #539 diz somente app | **Resolvido a favor do app-only** por [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md). A menção a “web” no ADR-004 vira registro histórico. |
| C3 | Postgres decidido vs. persistência pendente | ADR-004 (PostgreSQL) × #540 §13 e §15.6 (pendente; propõe SQLite local) | ⛔ **Aberto.** Não revogar o ADR-004 por conveniência nem ignorar a #540. Decidir D8. |
| C4 | Tauri decidido vs. shell pendente | ADR-004 (Tauri pós-1.0.0) × #540 §13 (shell pendente) | ⛔ **Aberto.** Até revogação formal, o ADR-004 prevalece; a #540 pode reabrir. Decidir D13. |
| C5 | Core de Orquestração em TS no navegador vs. host Rust no app | ADR-004 §2 × #540 §15.2 | ⛔ **Aberto.** Com o app-only, “navegador” perde o sentido original. Decidir D5. |
| C6 | Localização do código: `v2/` atual vs. `apps/ core/ backend/` proposto | `v2/README.md` × #540 §15.4 | 🟡 **Aberto**, porém sem urgência: a estrutura atual funciona até a migração. |
| C7 | Protótipo `v2/core` em JS vs. frontend/core em TS | #540 §3 (TS) × `v2/core` (JS + `checkJs`, `.ts` parcial) | 🟡 **Em andamento.** A direção é TS; a migração acompanha a reconstrução, não é conversão isolada. |

---

## 18. Etapas de implementação (proposta)

Sequência sugerida pela #540 §15.9. **Não aprovada**; serve para dimensionar o
trabalho e ordenar as decisões.

| Etapa | Entrega | Critério de saída |
| --- | --- | --- |
| A | Contratos e protótipo vertical | shell TS mínimo + Core mínimo + uma chamada real do frontend ao Core |
| B | Runtime e módulos | ciclo de vida, registry, permissões e Event Bus integrados; um módulo simples; falha e reinício testados |
| C | Worker Python | Core inicia/encerra worker; protocolo, timeout, cancelamento e logs |
| D | C++ nativo | caso real escolhido; baseline medido; C ABI e ownership definidos; integração só após benchmark |
| E | Dados e recuperação | Data/Evidence Layer, migrações, backup e restauração testados |
| F | Migração de capacidades | inventário da V1; migração por fatia; comparação antigo × novo; legado removido só após aceite |

Portão da etapa A: se uma chamada tipada do frontend ao Core não funcionar com
contrato versionado, o resto do desenho está no ar. É mais barato descobrir ali.

---

## 19. Critérios de conclusão desta documentação

Espelha a §14 da issue #540. O que este documento **não** fecha permanece aberto.

- [x] Direção confirmada e registrada (frontend TS, backend Python/Rust/C++, app-only).
- [x] Ponto de partida real documentado com caminhos do repositório.
- [x] Componentes de fundação e seus contratos mínimos identificados.
- [x] Riscos, conflitos e decisões pendentes explicitados.
- [ ] Diagrama de arquitetura coerente com o **código final** — hoje é coerente com o protótipo, não com a V2 entregue.
- [ ] Responsabilidade exata de cada linguagem definida — TS ✅; Python/Rust base ADR-004; C++ pendente.
- [ ] Contratos entre frontend e backend documentados em esquema versionado — há proposta e envelope do Runtime, não o contrato completo.
- [ ] Contratos do Core e dos módulos fechados — o manifesto existe; o restante está em protótipo.
- [ ] Estratégia de dados, segurança e persistência fechada — C3 aberto.
- [ ] Estratégia de build, testes e distribuição fechada — D9/D10 abertos.
- [ ] Plano de migração V1 → V2 com inventário — regras existem; inventário não.
- [ ] Links para todos os ADRs e planos de implementação — parciais; cada D vira ADR.

---

## 20. Referências

**Issues**
- [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540) — este documento (arquitetura-alvo).
- [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539) — disponibilização somente como app.
- [#423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423) — Plano Mestre V2.
- [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420) — fundação, hardening e transição V1 → V2.
- [#430](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/430) — verificação especializada e integrador de contratos.

**Decisões**
- [ADR-001](../decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md) — 1.0.0 como ponto de congelamento.
- [ADR-002](../decisions/ADR-002-permissoes-deny-by-default.md) — permissões deny-by-default.
- [ADR-003](../decisions/ADR-003-congelamento-e-manutencao-da-v1.md) — congelamento e manutenção da V1.
- [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) — stack poliglota por responsabilidade.
- [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) — V2 como app, frontend TS e backend Python/Rust/C++.
- [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md) — disponibilização somente como app.

**Planos e registros**
- [`docs/v2/V2_MASTER_PLAN.md`](../../v2/V2_MASTER_PLAN.md) — as 26 seções da reconstrução.
- [`docs/v2/V2_RULES.md`](../../v2/V2_RULES.md) — as 40 regras.
- [`docs/v2/V2_DECISION_LOG.md`](../../v2/V2_DECISION_LOG.md) — decisões que não estão no corpo do plano.
- [`docs/v2/V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md) — proposta de arquitetura que originou o Module System.
- [`docs/v2/V2_STACK_REVIEW.md`](../../v2/V2_STACK_REVIEW.md) — análise e benchmark do stack.
- [`v2/README.md`](../../../v2/README.md) — o que existe na reconstrução.
- [`v2/runtime/CONTRACT.md`](../../../v2/runtime/CONTRACT.md) — contrato do Runtime Rust.

---

**Última atualização:** 2026-11-24 · **Mantenedor:** operador do projeto ·
**Regra:** decisão nova vira ADR; este documento aponta para o ADR, não o
substitui.
