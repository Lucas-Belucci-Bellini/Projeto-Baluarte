# Contrato — a saúde do Event Bus e do escalonador

**Data:** 2026-08-24
**Fase:** 03 — Event Bus e Task Manager (matriz de execução)
**Implementação:** `v2/core/bus.js`, `v2/core/trabalho.ts` ·
**Verificação:** `test/v2/bus-saude.test.js`, `test/v2/trabalho-saude.test.js`

## A lacuna

A Fase 03 pedia *"health, correlation, retry and cancel contract"*. O
cancelamento já existia no escalonador; a
[correlação](./EVENT_BUS_CORRELACAO_2026-08-24.md) entrou na 1.3.8. Restavam
`health` e `retry`. Esta entrega fecha o `health`.

Os dois componentes sabiam dizer **o que estavam a fazer**. Nenhum sabia dizer
**se estava a correr mal**.

### O bus contava sucesso e perdia fracasso

`contagem()` sobe a cada `emit`. Sobe igual se os handlers todos funcionaram e
igual se todos levantaram. O handler que levanta ia para `deps.log?.erro?.()` —
e `criarBus()` **sem deps**, que é o construtor padrão e o que quase todo teste
usa, perdia-o inteiro.

Ou seja: um bus cuja telemetria toda está partida ficava indistinguível de um
saudável. A única prova de que algo falhou vivia numa dependência opcional.

### O escalonador é instantâneo, e por isso esquece

`estado()` diz o que está a correr **agora**. Depois de a fila drenar, um
escalonador que recusou 400 trabalhos por `FilaCheia` fica idêntico a um que
nunca recebeu nenhum. A recusa ia para `deps.metricas?.contar?.()` — opcional
pela mesma razão, ausente pelo mesmo padrão.

É a metade de runtime do risco que a matriz nomeia para esta fase: *"eventos
órfãos e retry inconsistente"*.

## O contrato

### `bus.saude()`

| campo | o que é |
|---|---|
| `readiness` | `healthy` / `unhealthy` |
| `motivos` | texto legível, o acionável primeiro |
| `contagem` | `{emissoes, falhas, padroes, ouvintes}` |
| `porEvento` | `{evento: {emissoes, falhas}}` |
| `ultimasFalhas` | as N últimas, com **a cadeia junto** |

A falha guarda a **mensagem**, não o `Error`: reter o objeto num anel de 50
manteria stack e closures vivas — o histórico de diagnóstico viraria uma fuga
de memória silenciosa. É a mesma decisão que `criarRuntimeHealth` já tinha
tomado.

O anel é limitado (`tetoFalhas`, 50 por omissão). Histórico sem teto é
vazamento, e o que se quer ler é o recente, não o de há uma hora. **A contagem
não é truncada pelo anel** — 20 falhas com anel de 3 continuam a contar 20.

### `escalonador.saude()`

| campo | o que é |
|---|---|
| `readiness` | `healthy` / `unhealthy` |
| `motivos` | fila no teto, saturação, recusas, falhas, cancelamentos |
| `estado` | o `estado()` de sempre, embutido |
| `contagem` | `{enfileirados, concluidos, falhados, recusados, cancelados}` |

Os acumulados são **independentes de `deps.metricas`**. As métricas continuam a
receber tudo o que já recebiam; isto é o que sobra quando ninguém as injetou.

## Onde o veredito é conservador, e por quê

Esta é a parte que mais importa, porque é onde seria fácil inventar requisito.

### Não há `liveness`

`liveness` responde *"o processo está vivo?"*. O bus é uma estrutura de dados
dentro do Core, e o Core já responde a isso em [`saude.js`](../../v2/core/saude.js).
Um campo que só sabe dizer `healthy` não é sinal — é um carimbo, e um carimbo
num retrato de saúde acaba lido como garantia. Fica de fora de propósito.

### Falha de handler **não** degrada o bus

O isolamento é decisão de desenho deste bus, escrita no seu cabeçalho: um
handler ruim não derruba os outros. Logo, um handler a levantar é o bus **a
funcionar como projetado**. Degradar o veredito por isso contradiria a mesma
regra de isolamento que `V2_HEALTH.md` já fixa para falha de módulo:

> *"Falhas de módulos saudáveis, eventos órfãos e referências órfãs aparecem nos
> motivos e contadores, mas não transformam automaticamente todo o sistema em
> unhealthy. Isso preserva o isolamento de falhas definido para a V2."*

A falha aparece nos **motivos** e na **contagem** — que é onde ela é acionável.

### O que **é** `unhealthy`, nos dois casos

Só a condição que impede o componente de fazer o seu trabalho, e só quando o
código já a decide sozinho:

- **Bus sem nenhum inscrito.** O `emit` sucede, o contador sobe, e o evento não
  chega a ninguém. É o evento órfão visto do runtime.
- **Fila no teto.** `naFila >= tetoFila` é literalmente o `FilaCheia` que
  `enfileirar` levanta: o escalonador está a **recusar trabalho neste
  instante**.

Saturação (`rodando >= limite` com fila) fica de fora: é contrapressão normal.
Um escalonador cheio a trabalhar está a fazer exatamente o que lhe foi pedido.

### O limiar que **não** foi escolhido

Seria fácil escrever *"mais de N falhas é unhealthy"*. Não está aqui, de
propósito: escolher esse N é decidir política, e é exatamente a decisão não
tomada que mantém o `retry` desta fase por fazer (#423 §3 — preparar ≠
implementar, e requisito não se inventa).

O sinal que substitui o limiar sem inventar nada é a **razão**: `falhas ==
emissões` é um handler que **nunca** funcionou, não um que oscila. Esse aparece
nomeado nos motivos; o que falha metade das vezes, não.

## Isto é observação, nunca autoridade

Nem `bus.saude()` nem `escalonador.saude()` iniciam, param, cancelam, reiniciam
ou concedem o que quer que seja. Vale aqui a regra que os contratos da V2 já
repetem: **estabilidade não é health, e health não é autorização.**

## Um defeito vizinho, corrigido junto

`v2/harness/main.js` expunha `eventos: bus.contagem()` — um **valor**, tirado
uma vez no boot. O comentário imediatamente abaixo dessa linha avisa contra
exatamente isso:

> *"FUNÇÃO, não valor: a primeira versão tirava o retrato uma vez, no boot, e o
> teste lia um instantâneo anterior ao clique… Ponte de teste que congela estado
> mente sobre o sistema vivo."*

Ninguém consumia o campo, então não havia sintoma. Passou a função, e a saúde
nova entrou ao lado como `saudeBus()` e `saudeTrabalho()` — funções desde o
início, pela lição que já estava paga.

## Verificação

`test/v2/bus-saude.test.js` (**17**) e `test/v2/trabalho-saude.test.js` (**11**).
Os que valem mencionar por serem sobre defeitos:

- **"sem log injetado, a falha do handler deixa de desaparecer"** e
  **"sem métricas injetadas, a recusa deixa de desaparecer"** — o defeito
  original, um em cada componente, com o construtor padrão.
- **"a recusa evaporou ao drenar"** — cobra o esquecimento do `estado()`
  instantâneo depois de a fila esvaziar.
- **"handler que levanta NÃO degrada o veredito"** (100 falhas, continua
  `healthy`) e **"saturado com fila NÃO é unhealthy"** — se um dia flipar, o
  contrato mudou e o teste obriga a rever esta página em vez de deixar a
  documentação mentir.
- **"o histórico de falhas é limitado"** — e a contagem não é truncada pelo anel.
- **"cancelado antes de começar conta uma vez só"** — dois caminhos escrevem
  `cancelados` (o listener do abort e o `executar`); contar nos dois inflaria o
  retrato.
- **"falha depois de `limpar()` no meio do despacho continua visível"** — o
  ramo parece rebuscado e não é: `alvos()` tira uma cópia dos handlers, então
  quem chama `limpar()` não impede os seguintes de correr, e a falha de um deles
  entra num evento que já saiu do contador. Sem o ramo, ela some do detalhe e as
  somas deixam de reconciliar.
- **"o retrato é uma cópia"** — quem lê a saúde não pode corromper o bus.
- **"a saúde não mudou nada do que já garantia"**, num ficheiro e no outro.

| gate | resultado |
|---|---:|
| `npm test` | `1347/1347` |
| `npm run v2:integracao` | `58/58` |
| `tipos:ts` · `tipos:v2` | 0 erros |
| `build`, `verificar-nexus`, catálogos, tabela de estabilidade | verdes |

## O que fica em aberto na Fase 03

**`retry`.** Depende de decidir política de repetição por classe de evento — o
que é seguro repetir, e quantas vezes. Essa decisão continua por tomar, e
tomá-la aqui seria inventar requisito. `correlation`, `cancel` e agora `health`
estão fechados.
