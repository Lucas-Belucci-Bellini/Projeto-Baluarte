# Runtime no ciclo de vida da V2

## Regra

Um módulo autorizado abre sua sessão de Runtime antes de `init`. Um módulo que
não consegue obter Runtime não deve ser apresentado como `running`.

## Subida

```text
Registry selado
  -> autorização
  -> abrir Runtime
  -> init
  -> start
  -> RUNNING
```

## Falha

Se `open Runtime`, `init` ou `start` falhar:

- o módulo não entra em `running`;
- a falha é atribuída ao módulo;
- dependentes posteriores podem ser desativados pelo ciclo topológico;
- recursos parcialmente criados devem ser liberados por `dispose`;
- a sessão de Runtime deve ser fechada.

## Descida

```text
RUNNING
  -> stop
  -> dispose
  -> fechar Runtime
  -> STOPPED
```

A ordem de descida continua inversa à ordem topológica do Registry.

## Fronteira

`module-runtime-lifecycle.js` não escolhe IPC, Tauri, socket ou stdio. Ele só
coordena o contrato lógico entre lifecycle e Runtime Session. O transporte é
uma decisão posterior e independente.
