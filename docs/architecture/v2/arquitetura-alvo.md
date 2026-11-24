# Arquitetura-alvo do Baluarte V2

> **Status:** ✅ **revisão arquitetural concluída em 2026-11-24** — direção
> parcialmente confirmada e pendências explicitadas. A conclusão da documentação
> **não depende** da implementação; ver [§19](#19-critérios-de-conclusão).
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

**Vocabulário.** O ADR-004 separa duas funções que a palavra “Core” costuma
juntar: o **Core de UI** (TypeScript, no webview) e o **Host de Runtime** (Rust,
processo principal). Neste documento, “Host” sempre significa a segunda; “Core de
UI” a primeira. Quando aparece **“Core”** sozinho — sobretudo no Module System — é
o lado que carrega módulos e concede capacidades, histórico do ADR-004, e não
autoriza fundir as duas funções (isso é **D5**).

---

## 1. Direção confirmada

1. ✅ **A V2 é uma reconstrução arquitetural**, não uma atualização incremental da
   V1. Muda a estrutura de código, as responsabilidades e a organização dos
   componentes.
2. ✅ **Todo o frontend da V2 será escrito em TypeScript.**
3. ✅ **O backend da V2 reunirá Python, Rust e C++.**
4. ✅ **Durante a reconstrução, o Baluarte será disponibilizado somente como
   aplicativo** — sem retorno do site e sem data definida ([#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539), [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md)).

O que **não** está confirmado: a divisão fina de responsabilidades entre Python,
Rust e C++; se o Core de UI e o Host de Runtime permanecem separados ou se
consolidam em um único núcleo (D5); o mecanismo de comunicação entre componentes
(D7); o banco (D8); o shell do aplicativo (D13); o empacotamento; as plataformas;
o nível de compatibilidade com a V1. Ver [§16](#16-decisões-pendentes).

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
| App V1 | `desktop/` (Electron + IPC) | JavaScript | operacional; o ADR-004 aponta Tauri pós-1.0.0, decisão não revogada |
| Core V2 protótipo | `v2/core/` — manifesto, registry, contexto, log, ciclo, boot, bus, config, api, métricas, trabalho | JS com `checkJs` + arquivos `.ts` parciais | 11 peças centrais listadas no `v2/README.md`, além de pontes de runtime; migração parcial para TS em andamento |
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

### 2.1 O que ainda **não** existe

Para não confundir protótipo com produto entregue:

- **nenhum frontend novo em TypeScript** — a interface da V2 não começou;
- **nenhum shell de aplicativo V2** — o app atual é o da V1 (Electron);
- **nenhum supervisor de processos** no Host;
- **nenhum contrato IPC com allowlist** entre UI e Host;
- **nenhuma linha de C++** no repositório;
- **nenhuma biblioteca nativa integrada** via C ABI;
- **nenhum empacotamento** que distribua Rust + Python + C++ juntos;
- **nenhum inventário da V1** para migração (ver [§14](#14-migração-v1--v2));
- **nenhuma Data/Evidence Layer completa** — há migrações e modelos em `v2/data/`,
  não a camada fechada;
- **nenhum ADR** para as decisões D1–D13.

O que existe é fundação testada: Core de UI prototipado, Runtime mínimo em Rust,
worker Python, fila em Postgres, módulos de prova e harness.

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
┌──────────────────────────────────────────────────────────────────┐
│                    BALUARTE — APLICATIVO                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ WEBVIEW                                                     │  │
│  │  FRONTEND — TYPESCRIPT                                      │  │
│  │  Interface · Navegação · Estado · Cliente tipado             │  │
│  │  CORE DE UI — TYPESCRIPT (ADR-004)                          │  │
│  │  Rotas · Views · Eventos de UI · Estado da aplicação         │  │
│  └───────────────────────────┬────────────────────────────────┘  │
│                              │ contrato local tipado             │
│  ┌───────────────────────────▼────────────────────────────────┐  │
│  │ HOST DE RUNTIME — RUST (ADR-004)                            │  │
│  │ Boot · Permissões reais · Filesystem · Processos · Logs     │  │
│  │ RuntimeHost · RuntimePolicy · supervisor (pendente)         │  │
│  └──────┬─────────────────────────────────────┬───────────────┘  │
│         │ chamada curta: stdio JSON-lines     │ C ABI / FFI      │
│         │ trabalho longo: fila Postgres        │ (in-process)     │
│  ┌──────▼──────────────────┐        ┌──────────▼─────────────┐   │
│  │ PYTHON — WORKERS        │        │ C++ — BIBLIOTECAS      │   │
│  │ IA · Automação · Dados  │        │ Nativas especializadas │   │
│  │ Parsers de conteúdo     │        │ (escopo pendente;      │   │
│  │ Integrações             │        │  só com benchmark)     │   │
│  └─────────────────────────┘        └────────────────────────┘   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ MODULE SYSTEM — manifestos e capacidades concedidas          │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ DADOS E EVIDÊNCIAS — armazenamento, migrações, proveniência, │  │
│  │ backup e restauração                                         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

O diagrama separa duas responsabilidades que o **ADR-004 já distingue**: Core de
UI (TypeScript, no webview) e Host de Runtime (Rust, processo principal). A
[proposta da #540 §15](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540)
sugere consolidar os dois em um host Rust único; isso é a pendência **D5** e
**não** está representado como decidido. O diagrama também não decide se cada
caixa é processo, biblioteca ou pacote (**D6**).

---

## 5. Fronteiras por linguagem

### 5.1 Matriz de responsabilidades

| Domínio | Responsável | Estado | Observação |
| --- | --- | --- | --- |
| Interface, navegação, estado visual, cliente dos contratos | **TypeScript** | ✅ Definido | todo o frontend; nada de JS solto no frontend novo |
| Validação de dados no limite da interface | **TypeScript** | ✅ Definido | esquema e cliente tipados |
| Core de UI (rotas, views, eventos de UI, estado) | **TypeScript** | ✅ ADR-004 | roda no webview do app; protótipo em `v2/core` (JS/TS parcial) |
| Host de Runtime (processo, permissões reais, filesystem, supervisão) | **Rust** | ✅ ADR-004 | `v2/runtime` mínimo; supervisor de processos pendente |
| Consolidação dos dois núcleos em um host Rust único | 🟡 A definir | 🟡 Pendente (D5) | proposta da #540 §15; **não aprovada** |
| IA, coleta, automação, integrações flexíveis | **Python** | ✅ ADR-004 | executa como worker supervisionado |
| Parsers binários (`.p3d`, `.pbo`) | Rust | ✅ ADR-004 | Python era 140× mais lento em laço de byte |
| Parsers de conteúdo/documento | Python | ✅ ADR-004 | ecossistema de parsing e NLP |
| Bibliotecas nativas especializadas / SDKs C/C++ | **C++** | ✅ presença (ADR-005) · 🟡 escopo (D4) | #540 confirma a presença; a forma (biblioteca C ABI) é **proposta** |
| Camada de dados e persistência | 🟡 A definir | 🟡 Pendente (D8) + ⛔ | ADR-004 fixa Postgres; #540 mantém pendente ([§9.3](#93-persistência--pendência-que-trava-decisões)) |
| Mecanismo de comunicação entre linguagens | 🟡 A definir | 🟡 Pendente (D7) | proposta em [§8](#8-contratos-e-comunicação) |
| Shell do aplicativo | 🟡 A definir | 🟡 Pendente (D13) + ⛔ | direção anterior: Tauri (ADR-004), não revogada |

### 5.2 Regras de fronteira

- **TypeScript apresenta e coordena a experiência.** Não acessa banco,
  filesystem irrestrito, processo do sistema ou biblioteca nativa diretamente.
  Tudo passa por capacidade concedida pelo Core.
- **Rust é o núcleo confiável de execução local.** Não absorve regra de negócio
  de módulo; permanece pequeno e estável.
- **Python implementa workers** — IA, automação, dados, integração — sob
  inicialização, permissão, timeout, cancelamento e encerramento do Core. Worker
  não abre API pública por padrão.
- **C++, quando entrar, entra como biblioteca nativa isolada** — não como processo
  nem como segundo Core. A forma e a interface (inclusive a hipótese de C ABI) e
  o escopo são pendência **D4**; sem benchmark, não se cria a fronteira. Não
  duplicar o que Rust já faz sem ganho medido.
- **Uma regra de negócio tem um único dono.** Se a mesma regra aparecer em duas
  linguagens, uma das duas está errada.
- **Parsers têm dono por tipo de dado:** binário e laço quente (`.p3d`, `.pbo`)
  é Rust; conteúdo e documento é Python. A mesma rotina não é implementada duas
  vezes.
- **TypeScript não implementa regra de negócio de módulo.** Valida no limite,
  apresenta estado e chama o contrato; a decisão fica no dono do domínio.

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

Este fluxo descreve **ordem de dependências**, não decide D5/D6/D7. “Core” aqui é
o lado que carrega módulos e concede capacidades; se ele roda no Host (Rust) ou no
Core de UI (TypeScript), e quem inicia quem, continua pendente.

### 6.2 Regras de falha

- Falha em módulo opcional **não derruba o aplicativo**.
- Falha no Core ou em serviço essencial produz diagnóstico claro e recuperação
  segura — nunca um estado meio-inicializado silencioso.
- Worker Python que não responde é encerrado por timeout e registrado; o Core não
  fica bloqueado.
- Recurso não concedido falha fechado (ADR-002).

### 6.3 Logs, métricas e diagnóstico

- **Log estruturado** com dono (módulo/componente), nível, correlação e retenção;
  segredo não entra no payload.
- **Métricas** com contagem, tempo e teto de cardinalidade — `v2/core/metricas.js`
  já existe no protótipo.
- **Diagnóstico é leitor do estado real** (módulos, permissões, flags, esquemas,
  saúde e workers), não uma lista paralela mantida à mão.
- **Saúde** por módulo e por worker, com estado explícito de “não observado” —
  ausência de dado não é sinal verde.
- **Contrato de diagnóstico** precisa ser versionado quando exposto à UI; hoje o
  protótipo tem peças, não o contrato fechado.

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

> O campo `ambiente` (`web` | `app` | `ambos`) existe porque o protótipo nasceu
> ao lado da V1. Com a #539, a V2 entrega **somente app**; manter `web` no
> contrato é dívida de compatibilidade, não autorização para criar superfície web
> nova. Remover ou renomear o campo é decisão futura — não decidida aqui.

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

| Fronteira | Transporte | Estado |
| --- | --- | --- |
| UI (TS) ↔ Core de UI | mesmo processo/webview, chamada direta tipada | ✅ protótipo |
| Core de UI ↔ Host (Rust) | IPC com allowlist, envelope versionado, timeout e erro com código estável | 🟣 proposto (D7); hoje a ponte é JS |
| Host ↔ worker Python — chamada curta | JSON-lines sobre stdio, worker iniciado pelo Host | 🟣 proposto |
| Host ↔ worker Python — trabalho longo | fila com `SKIP LOCKED` | ✅ no protótipo, sobre Postgres — engine segue em conflito (D8, [§9.3](#93-persistência--pendência-que-trava-decisões)) |
| Host ↔ biblioteca C++ | C ABI in-process: ownership, códigos de erro, thread-safety | 🟡 pendente (D4/D7) |
| Módulo ↔ Core | API e eventos versionados; manifesto e capacidades | ✅ protótipo validado |
| Eventos entre módulos | Event Bus com origem, versão, correlação e curinga | ✅ protótipo |
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

### 9.3 Persistência — pendência que trava decisões

O motor de persistência está ⛔ em conflito: o **ADR-004 fixou PostgreSQL** para
dados e fila, e há migrações reais em `v2/data/migrations/`; a **#540 mantém
“qual banco e estratégia de persistência” como pendente** e a §15.6 propõe
**SQLite local** para configuração e estado operacional. O ADR-004 **não foi
revogado** — continua sendo a decisão registrada até que outro ADR o substitua.

Alternativas, com custo dito:

| Opção | Vantagens | Custos e riscos | Quando faz sentido |
| --- | --- | --- | --- |
| **A. PostgreSQL só** (ADR-004) | uma engine; fila `SKIP LOCKED` já funciona; migrações existem; concorrência testada | exige instância; app offline depende de Postgres local empacotado ou remoto; peso de distribuição | quando o app sempre tem um Postgres local ou remoto confiável |
| **B. SQLite local só** | zero servidor; arquivo único; backup trivial; boot rápido; offline por construção | `SKIP LOCKED` não existe; escrita concorrente limitada; fila multi-worker precisa de outro desenho | quando o produto é single-user local-first e a fila é interna ao app |
| **C. Híbrido** — SQLite local + Postgres remoto | estado/configuração local e offline; sincronização e colaboração onde precisam existir | duas engines, duas migrações, resolução de conflito, sincronização e teste de consistência | quando há uso local forte **e** recursos remotos reais |

Critérios para decidir (critérios, não decisão):

1. O app precisa operar 100% offline? Se sim, configuração e estado local não
   podem depender de Postgres remoto.
2. Existe colaboração/sincronização entre dispositivos? Se sim, algum serviço
   remoto é necessário — e a pergunta vira onde fica a fonte da verdade.
3. A fila é interna ao app ou compartilhada entre máquinas? `SKIP LOCKED` só faz
   sentido no segundo caso.
4. Qual é o custo de empacotar e atualizar a engine escolhida dentro do app?
5. O dado do operador precisa sobreviver à troca de engine? Se sim, o formato de
   exportação é parte da decisão.

Enquanto **D8** não for decidido, nada na arquitetura-alvo depende de uma engine
específica: os contratos de dados são descritos por comportamento, e as
migrações existentes permanecem válidas para a opção A.

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
| Permissão em duas camadas | o Core valida o manifesto; o Runtime revalida o envelope antes de executar |
| Diagnóstico | mostra estado real e nega acesso a segredo; não é lista mantida à mão |

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

**O que já está decidido e o que não está.** O ADR-004 registrou **Tauri (Rust)**
como destino do app, migrando do Electron pós-1.0.0; essa decisão **não foi
revogada**. A #540 lista a tecnologia do shell como pendente (**D13**). Até
decisão formal em contrário, vale a direção anterior — mas ela não deve ser
tratada como aprovada para a V2 se o operador reabrir o tema.

Ainda pendente: plataformas suportadas inicialmente, empacotamento dos runtimes
Rust/Python/C++, assinatura, canal de atualização, rollback e diagnóstico de
suporte. Ver [§17](#17-conflitos-e-divergências-abertos).

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

> O `core/host/` acima reproduz a #540 §15.4 e **presume a fusão dos núcleos**.
> Se D5/D6 forem resolvidos pela separação do ADR-004, a estrutura vira algo como
> `core/ui/` + `core/host/`. O layout é proposta; não decide D5.

---

## 13. Testes, qualidade e integração contínua

Cada domínio tem verificação própria; cada fronteira tem teste de contrato. O
CI só vale se cobrar o que importa.

| Verificação | Estado |
| --- | --- |
| Type-check e testes do frontend TypeScript | 🟡 frontend novo ainda não existe; `npm run tipos:v2` cobre o protótipo |
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

#### Como o inventário é feito (método, não resultado)

O inventário ainda **não existe**. Quando for produzido, deve ser um documento
próprio (a criar em `docs/v2/`) com uma linha por capacidade da V1 e, no mínimo:

| Campo | Conteúdo |
| --- | --- |
| identificador | rota, módulo, tool ou serviço da V1 |
| caminho no repo | `src/...`, `api/...`, `desktop/...` |
| tipo | página, util, integração, dado, automação |
| dependências | o que consome e quem depende dele |
| dado do operador | chave de storage, tabela, arquivo — e versão |
| classificação | reaproveitar · adaptar · reescrever · substituir · descontinuar |
| justificativa | por que a classe, não “porque é mais fácil” |
| destino V2 | módulo, worker, biblioteca ou nada |
| critério de aceite | como provar que a fatia migrada equivale |

Ordem prática: começar pelos itens com mais dependentes e menos acoplamento de
UI — `politica.js`, storage e permissões — e só depois as páginas. Rotas que só
existem para o site público entram como “descontinuar na entrega app-only” ou
“revisar”, nunca como migração automática.

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
proposta, não decisão. A análise longa que sustenta o dossier — alternativas
completas, quatro arquiteturas integradas, custos medidos × estimados e critérios
de falsificação — está em
[`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md), também 🟣.
As evidências desse estudo foram auditadas de forma independente em
[`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md) — o que
se reproduziu, o que não se reproduziu e o que o código de fato entrega. A
auditoria também não decide nada. O que falta para assinar D5/D6/D7 — e o que pode
esperar a implementação — está em
[`plano-prontidao-arq1.md`](./plano-prontidao-arq1.md), igualmente 🔍.

**Quem decide:** todas as linhas abaixo são decisões do operador. O agente pode
documentar alternativas e recomendar, mas não promover proposta a decisão.

| # | Decisão | Bloqueia | Observação |
| --- | --- | --- | --- |
| D1 | Framework/biblioteca de interface e estratégia de estado do frontend TS | início do app V2 | ADR-004 só fixa a linguagem |
| D2 | Responsabilidade precisa de Python | desenho dos workers | base no ADR-004; falta contrato |
| D3 | Responsabilidade precisa de Rust | desenho do Core/Runtime | base no ADR-004; falta consolidar com #540 |
| D4 | Escopo de C++ | build, CI, distribuição | precisa de benchmark; não é "C++ para tudo" |
| D5 | Consolidação do Core de UI e do Host: dois núcleos ou host Rust único | arquitetura do app | ADR-004 registra a separação (TS + Rust); #540 §15 propõe fusão. Nenhuma das duas formas foi aprovada para a V2 |
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
| C1 | C++ fora vs. C++ no backend | ADR-004 (“Go, C e C++ ficam de fora”) × #540 (“backend reunirá Python, Rust e C++”) | **Resolvido a favor da #540 apenas quanto à presença** por [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md). Forma e escopo seguem pendentes (D4); biblioteca C ABI é **proposta**. |
| C2 | Site/web no escopo vs. somente app | v2-vision e ADR-004 falam de “interface web”; #539 diz somente app | **Resolvido a favor do app-only** por [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md). A menção a “web” no ADR-004 vira registro histórico. |
| C3 | Postgres decidido vs. persistência pendente | ADR-004 (PostgreSQL) × #540 §13 e §15.6 (pendente; propõe SQLite local) | ⛔ **Aberto.** O ADR-004 não é revogado por omissão; a #540 reabre o tema. Alternativas e critérios em [§9.3](#93-persistência--pendência-que-trava-decisões). Decidir D8. |
| C4 | Tauri decidido vs. shell pendente | ADR-004 (Tauri pós-1.0.0) × #540 §13 (shell pendente) | ⛔ **Aberto.** O ADR-004 é a direção registrada e não revogada; a #540 pode reabrir. Decidir D13. |
| C5 | Dois núcleos (Core de UI TS + Host Rust, ADR-004) vs. host Rust único (#540 §15.2) | ADR-004 §2 × #540 §15.2 | ⛔ **Aberto (D5).** O ADR-004 continua sendo a decisão registrada; a fusão é proposta. Com app-only, “navegador” deve ser lido como “webview”. |
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
| D | C++ nativo | caso real escolhido; baseline medido; interface e ownership definidos (forma conforme D4); integração só após benchmark |
| E | Dados e recuperação | Data/Evidence Layer, migrações, backup e restauração testados |
| F | Migração de capacidades | inventário da V1; migração por fatia; comparação antigo × novo; legado removido só após aceite |

Portão da etapa A: se uma chamada tipada do frontend ao Core não funcionar com
contrato versionado, o resto do desenho está no ar. É mais barato descobrir ali.

---

## 19. Critérios de conclusão

A conclusão da **documentação** é independente da implementação. Ela está
concluída quando outra pessoa entende a arquitetura, as pendências e o caminho —
mesmo que nenhuma linha nova da V2 exista.

### 19.1 Documentação — concluída nesta revisão

- [x] Direção confirmada separada de proposta (frontend TS, backend
      Python/Rust/C++, app-only).
- [x] Responsabilidade de cada linguagem descrita, com a divisão fina marcada como
      pendente.
- [x] Fronteiras e contratos descritos por comportamento, com formato proposto e
      estado de implementação.
- [x] Core, ciclo de vida, Module System, permissões, segurança, logs,
      diagnóstico, dados e evidências contemplados.
- [x] Ponto de partida real **e** lista do que não existe.
- [x] Plano de migração com método de inventário e classificação.
- [x] Decisões pendentes, conflitos e quem decide explicitados.
- [x] Links para issues, ADRs, documentos e código verificados.

### 19.2 Refinamentos que acompanham a implementação — não bloqueiam a documentação

- [ ] Esquemas de contrato versionados em arquivo (por exemplo
      `shared/schemas/`), gerados e cobrados no CI.
- [ ] Diagrama atualizado conforme o código entregue.
- [ ] Inventário da V1 preenchido (o método está em [§14](#14-migração-v1--v2)).
- [ ] ADRs das decisões D1–D13.

### 19.3 O que impede a **implementação** de começar

- [ ] D5/D6/D7 aprovados (Core, forma dos componentes, comunicação).
- [ ] D13 (shell) resolvido antes da Etapa A.
- [ ] D8 (persistência) resolvido antes da Data/Evidence Layer.
- [ ] Gate e demais condições do [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420)
      conforme a decisão vigente.

Nenhum item de 19.3 é pré-requisito para considerar esta documentação concluída.

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

**Propostas**
- [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) — opções e
  recomendação para D5/D6/D7.
- [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md) — estudo longo
  que sustenta a proposta.

**Auditoria**
- [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md) —
  reprodução independente dos benchmarks e checagem do estado real dos protótipos;
  não aprova nenhuma decisão.

**Planejamento**
- [`plano-prontidao-arq1.md`](./plano-prontidao-arq1.md) — os sete ajustes, a
  separação entre aprovação arquitetural e prontidão operacional, critérios
  verificáveis e portões P0–P5.

---

**Última revisão:** 2026-11-24 — revisão arquitetural documental, sem mudança de
código · **Mantenedor:** operador do projeto · **Regra:** decisão nova vira ADR;
este documento aponta para o ADR, não o substitui.
