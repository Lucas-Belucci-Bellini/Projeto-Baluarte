# Contrato — a correlação do Event Bus

**Data:** 2026-08-24
**Fase:** 03 — Event Bus e Task Manager (matriz de execução)
**Implementação:** `v2/core/bus.js` · **Verificação:** `test/v2/bus-correlacao.test.js`

## A lacuna

A matriz dava a Fase 03 como `IN PROGRESS`, com o próximo passo *"health,
correlation, retry and cancel contract"*. Destes, o **cancelamento já existia**
(`v2/core/trabalho.ts`: `Cancelado`, `AbortSignal`, cancelamento de trabalho que
ainda espera na fila). A **correlação não existia em lado nenhum** — um `grep`
por `correlac` no repositório inteiro só encontrava o DSP do radar.

O bus já resolvia metade do problema. O seu próprio cabeçalho registava por quê:

> *"sem `origem`, 'quem emitiu isto?' não tem resposta em runtime, e com centenas
> de módulos essa é a primeira pergunta de qualquer investigação."*

O argumento vale um nível acima, e é onde ele parava. `origem` diz qual módulo
emitiu **este** evento. Não diz de onde ele veio. Num sistema em que um clique
vira `rota:mudou`, que dispara `modulo:carregar`, que dispara `runtime:pedido`,
que falha — a pergunta da investigação não é *"quem emitiu o erro"* (o runtime,
obviamente). É **"o que começou isto?"**. Sem um fio ligando os quatro, a
resposta sai de adivinhar por timestamp — que é exatamente o que deixa de
funcionar quando há concorrência, ou seja, quando se precisa dela.

## O contrato

Cada envelope carrega agora **três identidades**, e não uma:

| campo | o que é |
|---|---|
| `id` | este evento, único |
| `correlacao` | a **cadeia** inteira a que ele pertence |
| `causa` | o `id` do evento imediatamente anterior — `null` na raiz |

`correlacao` sozinha diria que os quatro eventos do exemplo são parentes.
`causa` é o que torna a cadeia uma **árvore**: com ela sabe-se *quem gerou quem*.

```
rota:mudou        id=a1  causa=—   corr=K
 └ modulo:carregar id=b2  causa=a1  corr=K
    └ runtime:pedido id=c3 causa=b2  corr=K
       └ runtime:erro  id=d4 causa=c3  corr=K
```

### A propagação é automática

Um `emit` feito **de dentro de um handler** herda a `correlacao` do evento a ser
tratado e aponta `causa` para ele. Ninguém precisa passar nada.

Isto não é conveniência: exigir que cada módulo enfiasse a cadeia à mão seria
garantir que ela se parte justamente nos módulos que ninguém reviu — que são
precisamente os que se acaba a investigar.

Funciona porque `emit` é síncrono e o JavaScript tem uma thread só: enquanto os
handlers de um evento correm, qualquer `emit` que façam cai dentro dessa janela.
O escopo é **guardado e restaurado**, não limpo — os despachos aninham, e limpar
no fim do aninhado deixaria os handlers restantes do externo a emitir fora da
cadeia.

A precedência é **explícito > herdado > cadeia nova**. O explícito vem primeiro
porque é o único caminho de quem cruza uma fronteira assíncrona ou de processo:
se a herança ganhasse, `derivar()` não funcionaria de dentro de um handler.

### ⚠️ O limite honesto

A herança vale para o que é emitido **enquanto** o handler corre. Um handler
`async` que emite depois de um `await` já saiu do despacho, e o `emit` nasceria
com cadeia nova.

Para esse caso existe **`derivar(envelope)`**, que devolve o `meta` a passar à
mão:

```js
bus.on('inicio', async (payload, envelope) => {
  const dados = await buscar();
  bus.emit('terminou', dados, derivar(envelope));   // continua a cadeia
});
```

Não há como o bus adivinhar sozinho sem `AsyncLocalStorage`, que não existe no
navegador. O limite está documentado no código e **cobrado por teste** — se um
dia passar a herdar sozinho, o teste falha e obriga a rever esta página em vez
de deixar a documentação mentir.

### Por que o `id` não é UUID

`crypto.randomUUID` exige contexto seguro, e o valor aparece em toda linha de
diagnóstico — 36 caracteres por evento tornam o log ilegível justamente quando
se está a lê-lo com pressa. Doze caracteres de base36 dão ~62 bits, folgado para
distinguir cadeias de uma sessão. Há fallback para ambiente sem `crypto`: o bus
não pode ser o que quebra primeiro.

## O que **não** mudou

Nada do que o bus já garantia. Curinga continua a ser inscrição e não evento
(`emit('*')` levanta); origem ausente continua `desconhecida` e não vazio; o
handler continua isolado; o envelope continua a chegar como segundo argumento.
O último teste do ficheiro cobra exatamente isso, para que a mudança não pague
o seu custo em regressão silenciosa.

O gerador de catálogo (`gen-catalogo-eventos`) varre `bus.emit('nome'` em
`src/` — campos novos no envelope não o afetam, e ele continua verde.

## Verificação

`test/v2/bus-correlacao.test.js` — **13 testes**. Os que valem mencionar por
serem sobre defeitos, não sobre funcionalidade:

- **"acabado o despacho, o próximo emit começa cadeia nova"** — um escopo não
  restaurado faria todos os eventos seguintes da sessão caírem na mesma cadeia,
  e um rastreio que diz *"tudo está correlacionado"* não diz nada.
- **"handler que levanta não deixa o bus preso na cadeia"** — daí o `finally`.
- **"handlers irmãos apontam todos para o pai"** — se o escopo fosse atualizado
  por handler em vez de por evento, o segundo irmão teria o primeiro como causa,
  inventando uma relação que não existe.
- **"o despacho aninhado devolve o escopo ao pai, não ao vazio"**.
- **"o log de handler que levanta leva a cadeia junto"** — sem a correlação na
  linha de erro, o log diz que algo falhou e não deixa ligar essa falha ao que a
  causou, que é o motivo inteiro desta mudança.

| gate | resultado |
|---|---:|
| `npm test` | `1319/1319` |
| `npm run v2:integracao` | `58/58` |
| `tipos:ts` · `tipos:v2` | 0 erros |
| `build`, `verificar-nexus`, catálogos, tabela de estabilidade | verdes |

## O que fica em aberto na Fase 03

**`retry`** e **`health`** do contrato continuam por fazer — esta entrega fecha
a `correlation`, e o `cancel` já estava fechado no escalonador. O retry depende
de decidir política por classe de evento (o que é seguro repetir, e quantas
vezes), e essa decisão não estava tomada; forçá-la aqui seria inventar
requisito, contra a regra do #423 §3.
