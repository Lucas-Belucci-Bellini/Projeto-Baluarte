# ADR-004 — Stack poliglota por responsabilidade, e onde ficam as fronteiras

- **Status:** aceita
- **Data:** 2026-08-11
- **Contexto:** #420 (arquitetura), #423 (ordem de construção)
- **Medição:** [`v2/bench/RESULTADOS.md`](../../../v2/bench/RESULTADOS.md)
- **Análise completa:** [`docs/v2/V2_STACK_REVIEW.md`](../../v2/V2_STACK_REVIEW.md)
- **Substitui:** a conclusão de `docs/v2/V2_STACK.md`

## Contexto

A V2 vinha sendo construída em JavaScript por herança da V1, não por escolha. O
operador determinou:

> *"A V1 é uma referência de comportamento e dados. Ela não é uma referência
> obrigatória de arquitetura ou linguagem."*

E pediu a avaliação **antes** de mais Core ser empilhado — no momento em que
existe **um** módulo nativo e não cem, quando trocar ainda é controlável.

A análise anterior (`V2_STACK.md`) falhou em algo específico: concluiu "três
linguagens" sem nunca ter perguntado se o Core deveria ser JavaScript. Assumiu
que sim porque a V1 é. Isso é exatamente o que esta ADR corrige.

## Decisão

**Uma linguagem por responsabilidade, com a fronteira posta onde o volume por
travessia é alto e a frequência é baixa.**

| camada | linguagem | mudança? |
| --- | --- | --- |
| Interface web e 3D | **TypeScript** | tipagem (hoje JSDoc+`checkJs`) |
| Core de **Orquestração** (navegador) | **TypeScript** | continua |
| Core de **Runtime** (processo local) | **Rust** | **novo — não existe hoje** |
| IA, coleta, automação | **Python** | continua |
| Parsers binários (`.p3d`, `.pbo`) | **Rust** | **migra do Python** |
| Fila entre processos | **PostgreSQL** (`SKIP LOCKED`) | continua |
| Camada de dados | **PostgreSQL + SQL** | continua |
| App desktop | **Tauri (Rust)** | **migra do Electron**, pós-1.0.0 |

**Go, C e C++ ficam de fora.** Go só disputaria o Core de Runtime, e perde para
Rust em memória previsível e FFI; C/C++ não cobrem nada que Rust não cubra com
garantia a mais.

## Razões, com os números

**1. O Core do navegador NÃO vai para Rust — seria 4,7× mais lento.**
No navegador Rust só chega via WASM, e WASM não enxerga DOM nem objeto JS. Com
cada lado na sua melhor forma, o despacho de evento real (nome em string) mede
**~26 ns em JS contra ~124 ns em WASM**. A travessia crua custa ~12 ns: toda
operação do Core que custe menos que isso em JS fica mais lenta em WASM por
definição. E o Core inteiro é assim — 2,4 µs por evento, 0,9 µs por manifesto.

**2. "Core" eram dois sistemas, e só um existia.** O Core de Orquestração
(módulos, rotas, views, eventos de UI) é alta frequência e volume mínimo por
travessia: fica junto da UI, em TypeScript. O Core de Runtime (execução isolada,
permissão real sobre arquivo/rede/processo, supervisão de agentes) é baixa
frequência e volume alto: é Rust — e é onde `EXECUTION` e `READ_FILES` deixam de
ser convenção, como o próprio `contexto.js` já admitia por escrito.

**3. O defeito mais caro não era de linguagem.** O escalonador media **1073 µs
por tarefa trivial** por ser O(n²). Corrigido com montes binários: **4,0 µs**,
265× mais rápido, em JavaScript. Uma reescrita em Rust teria entregado ~50 µs —
parecendo ótimo e continuando quadrático.

**4. Python é 140× mais lento que Node em laço de byte** (4365 ms contra 31 ms
em 18 MB), e isso não o desqualifica: em JSON a diferença para Rust é 1,6×, e o
que decide Python para IA é ecossistema. Mas desqualifica Python **no parser
binário**, que é laço quente em Python puro.

## Critério para as próximas escolhas

1. Meça o trabalho antes de escolher a ferramenta.
2. Some o pedágio: `economia − travessia = ganho real`. Negativo, a resposta é não.
3. Dê a cada lado a melhor implementação — Rust ruim contra JS bom mede quem escreveu.
4. Ecossistema é argumento técnico legítimo.
5. **Ordem de grandeza justifica reescrita; fator 1,6× não.**

## Consequências

**Boas.** Cada camada tem dono e linguagem óbvios: quem for consertar o Event
Bus sabe onde ir sem conhecer o Baluarte inteiro. Um módulo deixa de precisar
ser da linguagem do Core. E o app desktop e o Core de Runtime passam a ser a
mesma peça em vez de dois processos.

**Custos, ditos sem maquiagem.** Três toolchains no CI. Fronteira Rust↔TS a
projetar e a manter. Os parsers do Arma 3 param de evoluir enquanto migram. E o
Core de Runtime é código novo, sem testes, num momento em que a fundação em JS
já está verde — vai haver período em que existe menos coisa funcionando do que
existe hoje. O operador já disse que aceita: *"prefiro que a V2 fique quebrada
durante meses enquanto uma camada é reconstruída corretamente"*.

**Ordem sugerida.** Core de Runtime em Rust **antes** da conversão para TS: ele
é o que não existe e é o que define a fronteira que o lado TS terá de respeitar.
Converter primeiro seria converter algo que ainda vai mudar de forma.

**Não decidido aqui:** adotar TypeScript de *sintaxe* (muda o build; hoje o
`checkJs` dá a verificação sem mexer nele) — é decisão do operador. Tauri fica
para depois da tag `v1.0.0`, porque mexe no app que o gate de release protege.
