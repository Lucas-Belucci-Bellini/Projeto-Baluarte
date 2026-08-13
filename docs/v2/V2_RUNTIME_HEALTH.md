# V2 — Runtime health e restart budget

O Supervisor não deve reiniciar indefinidamente um módulo que falha.

## Estados

- `unknown`: ainda não há sinal de saúde.
- `healthy`: Runtime respondeu e o módulo está operacional.
- `failed`: houve falha e ainda existe orçamento de recuperação.
- `exhausted`: o limite de reinícios na janela foi atingido.

## Restart budget

Cada falha registra um timestamp. Apenas falhas dentro da janela configurada contam para o limite. Ao ultrapassar `maxRestarts`, o módulo entra em `exhausted` e não pode ser reiniciado automaticamente.

A política é deliberadamente separada do Supervisor: ela decide **se** pode reiniciar; o Supervisor decide **como** executar o ciclo de cleanup/restart.
