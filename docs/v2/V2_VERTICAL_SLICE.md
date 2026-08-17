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

## O que ainda falta para "módulo nativo"

**O módulo não alcança o Runtime.** `criarContexto` entrega `storage`, `bus`,
`metricas`, `trabalho`, `apis` e `permissoes` — não há alça de Runtime no
`ModuleContext`. No teste acima, quem lê arquivo é o *teste*, não o `init` do
módulo.

Ou seja: a cadeia de **autorização** está nativa; a de **uso** não. Fechar isso é
acrescentar o Runtime ao contexto do módulo, gateado pelas permissões declaradas —
mudança de contrato do `ModuleContext`, e por isso um item próprio, não um
detalhe deste.
