# V2 — Primeiro vertical slice

O primeiro slice operacional da V2 estabelece uma cadeia mínima completa para um módulo:

```text
Registry
  ↓
Runtime authorization
  ↓
Runtime session
  ↓
init
  ↓
start
  ↓
RUNNING
  ↓
stop
  ↓
dispose
  ↓
Runtime close
```

## Propriedades

- Um módulo só entra em `running` depois de abrir seu Runtime.
- Falha durante `init` ou `start` fecha o Runtime.
- Falha durante a parada não impede a tentativa de `dispose` e de fechamento do Runtime.
- O transporte continua injetável; este slice não escolhe IPC.
- O slice não substitui `ciclo.js`; ele é um caminho de integração testável para a próxima etapa do boot.

## A cadeia percorrida com o Runtime REAL (17/08/2026)

A "próxima integração" que este documento pedia — *conectar o slice ao ciclo
oficial e criar um contract test com manifesto real do Registry* — está em
`test/v2/slice-nativo.test.js`.

O que muda em relação a tudo que existia antes: **o Runtime não é mais um duplo.**
O entrypoint da V2 injeta um Host cujo `abrir` chama `criarGrantRuntime` —
autorização sem transporte, porque no navegador não há processo com quem falar —
e todo teste até aqui usou espião ou duplo. A propriedade "um módulo só entra em
`running` depois de abrir seu Runtime" era, portanto, verdadeira sobre um Runtime
que nunca tinha existido.

Agora o `abrir` monta o envelope com `criarCargaRuntime` e manda `authorize` pelo
transporte ao binário. Quem decide se o módulo sobe é o processo Rust.

As três propriedades cobradas, todas com as peças reais (Registry, Permission
System, ciclo, transporte, binário):

| | |
| --- | --- |
| a cadeia sobe e desce | `subir` → `abertas() == ['alpha']` → `descer` → `abertas() == []` |
| o Runtime confina | `hello.txt` lê; `../secret.txt` é recusado **pelo Rust** |
| declarar ≠ receber | sem concessão, o módulo **sobe** e a leitura é **negada** |

A terceira é a que prova que o teste não passa à toa: mesma rota, permissão
diferente, resultado diferente — a discriminação vem do outro lado da fronteira,
não do JavaScript. E remover o Host do `criarCiclo` derruba o primeiro teste.

## O módulo passou a usar o Runtime, não só a ser autorizado por ele

`criarContexto` ganhou uma dependência **opcional** `runtime`, e o `ModuleContext`
ganhou `ctx.runtime.lerArquivo(caminho)`.

A propriedade que importa está na **aridade**: a alça entregue ao módulo recebe
*caminho, e só*. O id do módulo fica fechado por closure, preenchido pelo
contexto. Se `lerArquivo` aceitasse um módulo, `alpha` poderia nomear a raiz de
`beta` e o confinamento por módulo viraria convenção em vez de garantia. Há
mutante para isso: trocar a alça por uma que aceita o módulo derruba dois testes.

Opcional de propósito — sem `deps.runtime`, o contexto é o de sempre. É o caso do
navegador, onde não existe processo com quem falar.

**A permissão não é rechecada no contexto.** Quem cobra `READ_FILES` é o Runtime,
do outro lado da fronteira. Repetir a checagem seria defesa em profundidade
escondendo mutante (Regra 1) — o mesmo motivo pelo qual o
[`V2_MODULE_LIFECYCLE_STATUS.md`](./V2_MODULE_LIFECYCLE_STATUS.md) não recheca
autorização.

Medido em `test/v2/slice-nativo.test.js` (5/5, com o binário real): o `init` de
`alpha` lê `hello.txt` e recebe `BALUARTE-V2`; o mesmo `init` tenta
`../secret.txt` e o **Rust** recusa.

## A injeção em produção — renderer → IPC → main

`v2/core/runtime-app.js` é o adaptador do renderer: transforma
`window.baluarte.invoke('runtime:ler', …)` na forma que o `ModuleContext` espera.
O entrypoint (`v2/harness/main.js`) o injeta em `deps.runtime`.

**Fora do app ele devolve `null`**, e `null` faz `deps.runtime` ficar indefinido —
o contexto volta a ser exatamente o de antes. Um adaptador que fingisse existir na
web daria aos módulos uma alça que sempre falha, o que é pior do que não ter alça.
É o gate do #238: web leve, app completo. Medido: o portão `v2:integracao`
continua **15/15** no navegador.

**Ambiente meio montado conta como ausente.** `native` sem `invoke` (ou o
contrário) é ponte quebrada; tratá-la como pronta empurraria o erro para dentro do
`init` de um módulo, longe da causa. E `native` tem de ser `true`, não apenas
verdadeiro.

**O envelope é remontado a cada chamada.** Congelá-lo no boot faria a leitura
responder sobre o passado: conceder depois do arranque não alcançaria o módulo, e
revogar tampouco. Mesma razão pela qual `declarado.concedidas` é função, e não
valor. Há teste para os três casos — antes, depois de conceder, depois de revogar.

> **O Host continua autorizando localmente, mesmo no app.** Trocar
> `criarGrantRuntime` pela autorização nativa faria um binário ausente derrubar
> módulos que hoje sobem. E não afrouxa nada: quem nega a leitura de quem não
> recebeu `READ_FILES` é o Rust, na hora do uso — provado pelo teste "declarar não
> é receber". Autorização local + uso nativo é a divisão certa enquanto o binário
> for opcional.

## O que ainda falta

**O app rodando com isso.** A cadeia está provada em Node com as peças reais, e o
adaptador está provado contra uma ponte falsa — mas ninguém abriu um Baluarte
empacotado com o Runtime dentro. É o mesmo ramo `process.resourcesPath` que o
[`V2_RUNTIME_STDIO.md`](./V2_RUNTIME_STDIO.md) já lista como não exercitado.
