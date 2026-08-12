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

## Próxima integração

O próximo passo é conectar este slice ao ciclo oficial do Boot/Supervisor e criar um contract test usando um manifesto real do Registry.
