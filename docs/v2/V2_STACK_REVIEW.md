# Fase 0 — Revisão do stack da V2

> **Princípio que governa este documento**, dado pelo operador:
> *"A V1 é uma referência de comportamento e dados. Ela não é uma referência
> obrigatória de arquitetura ou linguagem."*
>
> Isto **substitui** a análise anterior ([`V2_STACK.md`](./V2_STACK.md)), que
> concluiu "três linguagens" sem nunca ter perguntado se o Core deveria ser
> JavaScript — assumiu que sim, porque a V1 é. A crítica está certa e é a razão
> deste documento existir.
>
> Nada aqui foi decidido por gosto. Os números estão em
> [`../../v2/bench/RESULTADOS.md`](../../v2/bench/RESULTADOS.md) e os
> programas que os produziram em [`../../v2/bench/`](../../v2/bench/) — dá para
> rodar de novo e discordar com evidência.

## O que a medição mudou na minha resposta

Entrei nesta análise achando que a resposta seria "TypeScript no navegador,
Rust para o resto". Saí com uma resposta diferente, e a diferença veio de três
números.

### 1. O Core do navegador em Rust seria **4,7× mais lento**, não mais rápido

No navegador, Rust só chega via WASM. WASM não enxerga DOM nem objeto JS: o que
atravessa é número, ou bytes copiados para a memória linear. O Core faz
orquestração — casar nome de evento, achar módulo, checar permissão. Os dados
são **strings JS**.

Cada lado medido na sua melhor forma (Rust sem alocar, JS com `encodeInto`):

| operação | JS | WASM (Rust) | |
| --- | --- | --- | --- |
| chamada trivial | ~1,9 ns | ~12 ns | o pedágio da travessia |
| despacho por **id numérico** | — | ~12 ns | Rust ganha quando o dado é número |
| despacho por **nome** (o caso real) | **~26 ns** | **~124 ns** | **4,7× mais lento** |

A leitura é direta: a travessia custa ~12 ns. **Toda operação do Core que custe
menos que isso em JS fica mais lenta em WASM por definição** — a conta que se
economiza é menor que o pedágio que se paga. E o Core inteiro é feito de
operações assim: 2,4 µs por evento, 0,9 µs por manifesto, permissão abaixo de
0,1 µs.

> Uma primeira rodada deu 23,85× em vez de 4,7×, porque meu Rust fazia
> `format!` a cada chamada. Eu estava medindo o meu Rust ruim e chamando aquilo
> de "custo da fronteira". Fica registrado: **comparação de linguagem tem que
> dar a cada lado a melhor implementação**, senão a conclusão é sobre quem
> escreveu, não sobre a ferramenta.

### 2. O defeito mais caro que encontrei não tinha nada a ver com linguagem

O banco de medição rodou 50 000 tarefas pelo escalonador: **1073 µs por tarefa
trivial**, 53 segundos para a leva. A escolha do próximo varria a fila inteira e
retirava com `splice` — O(n) e O(n), ou seja **O(n²)**.

Trocado por montes binários com entradas preguiçosas, mesma semântica: **4,0 µs**.
**265× mais rápido, em JavaScript.**

Isto é o argumento central desta revisão, e vale mais que qualquer tabela:

> Uma reescrita em Rust teria entregado talvez 50 µs por tarefa. Pareceria
> ótimo — e continuaria sendo O(n²), esperando a próxima ordem de grandeza para
> voltar. **Trocar de linguagem para consertar algoritmo é pagar caro por um
> conserto que não aconteceu.**

Nenhum dos 19 testes do escalonador pegou isso, porque testes usam três, dez
tarefas. Agora há dois testes de carga que ficam vermelhos se voltar.

### 3. Python é 140× mais lento que Node em laço de byte — e isso não o desqualifica

Sobre dado real do projeto (`arma3-config.json`, 17,9 MB, 532 622 chaves):

| | parse JSON | passeio | memória | **laço de byte** |
| --- | --- | --- | --- | --- |
| Python 3.11 | 729 ms | 129 ms | 115 MB | **4365 ms** |
| Node 22 | 243 ms | 49 ms | 131 MB | 31 ms |
| Rust 1.94 | **152 ms** | **12 ms** | **104 MB** | **19 ms** |

(as três produzem o mesmo hash — é o mesmo trabalho)

Duas conclusões que puxam para lados opostos, e as duas valem:

- **Em JSON e memória, a diferença é modesta.** Rust é 1,6× mais rápido que
  Node no parse e usa memória comparável. Para um trabalho de lote que roda de
  hora em hora, 152 ms contra 243 ms **não é razão para trocar de linguagem**.
- **Em laço de byte, Python é ruinoso**: 4,4 s contra 31 ms. Um worker que faça
  varredura binária em Python puro é 140× mais caro do que precisa ser.

Isto **corrige** a colocação ingênua de "Python para os workers". Python é a
escolha certa quando o trabalho é *orquestrar biblioteca* (json, numpy, `bpy` do
Blender, cliente de IA, scraping) — ali o laço quente está em C e o Python só
manda. É a escolha errada quando o laço quente é o **próprio código Python** — e
o parser de `.p3d`/`.pbo` do Arma 3 é exatamente esse caso.

---

## O achado que reorganiza tudo: "Core" são **dois** sistemas

A pergunta *"o Core deveria ser Rust?"* não tinha resposta única porque a
palavra Core está cobrindo duas coisas que só pareciam uma enquanto tudo morava
no navegador:

```
CORE DE ORQUESTRAÇÃO              CORE DE RUNTIME
(existe, no navegador)            (NÃO existe ainda)

registro de módulos               execução de processo
roteamento                        acesso real a arquivo
ciclo de vida de view             rede em nome do operador
barramento de eventos de UI       supervisão de agentes
                                  escalonamento entre processos
                                  acesso ao banco
                                  servir modelo local

travessias/segundo: MUITAS        travessias/segundo: POUCAS
dado por travessia: MÍNIMO        dado por travessia: MUITO
dado é objeto JS e DOM            dado é byte, arquivo, linha
                                  ─────────────────────────────
        TypeScript                          Rust
```

O `contexto.js` já admite, por escrito, que a permissão do navegador **não é
sandbox**: *"um módulo determinado ainda consegue importar o storage global e
furar tudo… sandbox de verdade exigiria outro runtime"*. Aquele "outro runtime"
é o Core de Runtime, e ele é Rust. Não porque Rust seja rápido — porque é onde
`EXECUTION`, `READ_FILES` e `NETWORK` deixam de ser convenção e viram fronteira
de processo de verdade.

**A regra que sai disso, e que vale para toda fronteira de linguagem no
Baluarte:**

> A fronteira entre linguagens vai onde o **volume por travessia é alto e a
> frequência é baixa**. Onde a frequência é alta e o volume é baixo, a fronteira
> é o gargalo — e ali as duas pontas falam a mesma língua.

O contrato de módulo já foi escrito para isso, antes de eu saber que precisaria:
*"Isto não é RPC. É chamada de função no mesmo runtime, com fronteira declarada.
O dia em que um módulo morar noutro processo, o contrato já existe e o transporte
entra por baixo."* (`V2_MODULE_RULES.md`)

---

## Componente a componente

Formato pedido pelo operador. **Linguagem escolhida ≠ linguagem atual** em cinco
dos treze.

```
INTERFACE WEB  (src/pages, src/layout, src/styles — 75 613 linhas)
├── atual ......... JavaScript puro
├── responsabilidade  páginas, shell, navegação, formulários, 3D
├── problemas ..... sem tipos; 22 rótulos divergentes entre sidebar e shell;
│                   31 rotas sem título; erro de contrato só aparece clicando
├── alternativas .. WASM/Rust (recusado: 4,7× mais lento no despacho real e
│                   sem acesso ao DOM); manter JS puro (recusado: a V1 provou
│                   que o custo da falta de tipo é real)
├── ESCOLHIDA ..... TypeScript
└── porquê ........ é a única linguagem de primeira classe no navegador; a
                    tipagem mata por construção a classe de defeito mais comum
                    da V1. O JSDoc+checkJs de hoje é etapa 1 — dá 90% da
                    verificação sem mudar build; TS de sintaxe é a etapa 2

CORE DE ORQUESTRAÇÃO  (v2/core — 3 500 linhas)
├── atual ......... JavaScript + JSDoc
├── responsabilidade  manifesto, registro, rotas, contexto, ciclo de vida,
│                   barramento de UI, métricas
├── problemas ..... nenhum de linguagem. Os defeitos achados foram
│                   algorítmicos (O(n²) no escalonador) e de arquitetura
│                   (deny-by-default sem implementação)
├── alternativas .. Rust→WASM (MEDIDO: 4,7× mais lento no trabalho real, e o
│                   Core não tem trabalho pesado para compensar — 2,4 µs por
│                   evento); Go (não roda no navegador senão via WASM, com
│                   runtime e GC embarcados, pior que Rust no mesmo papel)
├── ESCOLHIDA ..... TypeScript
└── porquê ........ ele orquestra objetos JS e DOM. Pôr uma fronteira no meio
                    do caminho mais quente do sistema é pagar pedágio em cada
                    passo para economizar em nenhum

CORE DE RUNTIME  (não existe)
├── atual ......... — (o que existe é a simulação dele no navegador)
├── responsabilidade  execução isolada de módulo, permissão REAL sobre
│                   arquivo/rede/processo, supervisão de agentes,
│                   escalonamento entre processos, ponte com o banco
├── problemas ..... a permissão do navegador é honra, não fronteira — está
│                   escrito no próprio `contexto.js`
├── alternativas .. Node (mesmo processo dos módulos: isolamento nenhum, e o
│                   consumo de memória de um runtime por agente é alto);
│                   Go (bom aqui; perde para Rust em memória e em FFI, e o
│                   operador tem razão em não somar linguagem sem motivo);
│                   C/C++ (sem razão que Rust não cubra melhor)
├── ESCOLHIDA ..... Rust
└── porquê ........ é o único lugar do Baluarte onde os argumentos de Rust
                    valem TODOS ao mesmo tempo: isolamento por tipo,
                    concorrência sem corrida, memória previsível, e binário
                    único sem runtime para distribuir no app desktop

WORKERS DE IA E DADOS  (jarvis-python/, api/, v2/services/tarefas/)
├── atual ......... Python 3.11
├── responsabilidade  IA, embeddings, coleta, análise, automação
├── problemas ..... nenhum relevante: o trabalho é orquestrar biblioteca, e o
│                   laço quente já está em C
├── alternativas .. Rust (recusado: o ecossistema de IA não está lá, e a
│                   diferença medida em JSON é 1,6×)
├── ESCOLHIDA ..... Python
└── porquê ........ ecossistema. É a razão inteira, e é suficiente

PARSERS BINÁRIOS  (scripts/arma3 — .p3d, .pbo, 37 arquivos)
├── atual ......... Python
├── responsabilidade  ler formato binário do jogo, extrair modelo e config
├── problemas ..... MEDIDO: laço de byte em Python puro é 140× mais lento que
│                   Node e 230× que Rust (4365 ms vs 31 ms vs 19 ms em 18 MB)
├── alternativas .. numpy/Cython (esconde o laço em C, mas o formato exige
│                   lógica de estado que não vetoriza); manter Python
│                   (recusado: 230× é ordem de grandeza, não afinação)
├── ESCOLHIDA ..... Rust  ⚠️ MUDANÇA
└── porquê ........ é o caso de livro: CPU pura, sem alocação, sem
                    ecossistema envolvido. O que sobra em Python é a camada de
                    orquestração do pipeline, que fica

FILA DE TAREFAS ENTRE PROCESSOS  (v2/data, v2/services/tarefas)
├── atual ......... PostgreSQL + Python
├── responsabilidade  distribuir trabalho entre N agentes sem broker
├── problemas ..... nenhum. `SELECT … FOR UPDATE SKIP LOCKED` resolve com o
│                   banco que já existe
├── alternativas .. Redis/RabbitMQ/Kafka (recusados: mais um serviço para
│                   operar, para um problema que o Postgres já resolve)
├── ESCOLHIDA ..... PostgreSQL (o consumidor pode ser Python OU Rust)
└── porquê ........ a fila é contrato SQL, não biblioteca. Quem consome é
                    escolha de cada worker, e isso é a fronteira certa

CAMADA DE DADOS  (v2/data)
├── atual ......... PostgreSQL 16, append-only, com trigger contra UPDATE
├── responsabilidade  proveniência, versão, relação, índice, contradição
├── alternativas .. SQLite (perde no acesso concorrente de N agentes);
│                   NoSQL (recusado: o dado do Baluarte é relacional — fonte,
│                   entidade, afirmação, relação)
├── ESCOLHIDA ..... PostgreSQL + SQL  (mantida)
└── porquê ........ integridade e consulta complexa são o serviço principal

APP DESKTOP  (desktop/)
├── atual ......... Electron
├── responsabilidade  hospedar o Baluarte local com acesso a máquina
├── problemas ..... ~150 MB por instância; o Chromium inteiro para servir uma
│                   UI que já roda no navegador
├── alternativas .. Tauri (WebView do sistema + backend Rust: dezenas de MB, e
│                   o backend É o Core de Runtime — os dois problemas se
│                   resolvem com a mesma peça); manter Electron
├── ESCOLHIDA ..... Tauri (Rust)  ⚠️ MUDANÇA — depois da 1.0.0 da V1
└── porquê ........ o app precisa de um processo nativo de confiança de
                    qualquer forma; Tauri faz dele a casa do Core de Runtime
                    em vez de um segundo processo ao lado

3D  (src/utils/hero-webgl, three.js)
├── atual ......... JavaScript + Three.js/WebGL
├── ESCOLHIDA ..... TypeScript + WebGPU quando amadurecer  (mantida)
└── porquê ........ a GPU já faz o trabalho pesado; a linguagem só a comanda.
                    Rust aqui só entraria com engine nativa fora do navegador,
                    e isso não é um problema que o Baluarte tenha hoje

SERVERLESS  (api/ — 8 funções Python)
├── ESCOLHIDA ..... Python  (mantida)
└── porquê ........ funciona, é I/O, e o custo de mexer não tem retorno

FERRAMENTAS E SCRIPTS  (scripts/)
├── ESCOLHIDA ..... Python para dado, Node para o que toca o build  (mantida)
└── porquê ........ script que ninguém executa em laço quente não é decisão
                    de arquitetura

CONTRATO ENTRE CAMADAS
├── ESCOLHIDA ..... JSON Schema na fronteira + SQL no banco
└── porquê ........ é o que permite Rust, TS e Python falarem sem que nenhum
                    dependa do modelo de objetos do outro
```

### Linguagens que **não** entram, e por quê

O operador foi explícito em não somar linguagem por somar, e a análise concorda:

- **Go** — bom no papel do Core de Runtime, e perde para Rust nos dois critérios
  que importam ali: memória previsível (sem GC) e FFI limpo para os módulos
  nativos. Tendo Rust, Go não resolve nada que sobre.
- **C / C++** — todo caso que os justificaria é coberto por Rust com garantia de
  memória a mais e sem custo de desempenho.
- **WebAssembly como estratégia** — não como camada. Continua sendo a saída
  quando *houver* trabalho pesado de fato no navegador (ver "critério" abaixo),
  e a medição diz que não é o caso do Core.

---

## Como uma escolha futura vai ser feita

Para não voltar a decidir por intuição, o critério fica escrito e é o mesmo que
produziu as decisões acima:

1. **Meça o trabalho antes de escolher a ferramenta.** Se a operação custa
   microssegundos e roda milhares de vezes por segundo, o gargalo é o algoritmo
   ou a fronteira, não a linguagem.
2. **Some o pedágio da fronteira.** `economia no cálculo − custo de atravessar =
   ganho real`. Se der negativo, a resposta é não, por mais rápida que a outra
   linguagem seja.
3. **Dê a cada lado a melhor implementação.** Rust ruim contra JS bom mede quem
   escreveu.
4. **Ecossistema é argumento técnico legítimo.** Foi ele que decidiu Python para
   IA, e é o único argumento ali.
5. **Ordem de grandeza justifica reescrita; fator 1,6× não.** 230× no parser
   binário justifica; 1,6× no parse de JSON não.

---

## O que isto significa para o que já foi construído

Honesto, sem defender o que fiz:

| | destino |
| --- | --- |
| `v2/core/` (3 500 linhas) | **fica** — vira TypeScript de sintaxe. É Core de Orquestração, e a medição diz que ele está na linguagem certa. Os contratos (manifesto, registro, permissão, referências) são desenho, não linguagem: sobrevivem à conversão |
| escalonador | **parte muda de casa.** Escalonar view no navegador continua aqui; escalonar trabalho entre processos é do Core de Runtime |
| permissões | **o modelo fica, a execução muda.** O manifesto e o decisor continuam em TS; `EXECUTION`/`READ_FILES`/`NETWORK` passam a ser cobradas pelo runtime Rust, onde a negativa é fronteira e não convenção |
| `v2/data/` + worker Python | **fica** |
| parsers Arma 3 | **migram para Rust** — 230× é ordem de grandeza |
| `desktop/` (Electron) | **migra para Tauri**, depois da 1.0.0 da V1 |

**Nada disso é jogado fora, e nada disso é mantido por ter sido feito.** A
diferença entre as duas frases é a medição.

## O que fica pendente de decisão do operador

1. **TypeScript de sintaxe** — o README lembra que TypeScript ajudou a matar as
   12 iterações anteriores do projeto. A etapa 1 (JSDoc + `checkJs`) já dá
   verificação completa sem mudar build. Passar para `.ts` muda o build e é
   decisão sua, não minha.
2. **Ordem de construção.** Sugiro: Core de Runtime em Rust **antes** da
   conversão para TS — ele é o que não existe, e é o que define a fronteira que
   o lado TS vai ter que respeitar. Converter primeiro seria converter algo que
   ainda vai mudar de forma.
3. **Tauri** só depois da tag `v1.0.0`, porque mexe no app que o gate de release
   protege.
