# Contrato do Runtime V2

## Objetivo

Definir a fronteira lógica entre o Core de Orquestração e o Core de Runtime sem
acoplar a API a um transporte específico.

## Estado do Runtime

O Runtime possui dois estados operacionais:

```text
Running  <── start() ──>  Stopped
             stop()
```

Uma operação recebida enquanto o Runtime está `Stopped` falha com
`RuntimeStopped`. Isso permite que o transporte futuro tenha um comportamento
claro durante desligamento, reinício e supervisão.

## Capacidades

O vocabulário de autorização do contrato é:

```text
READ_FILES
WRITE_FILES
NETWORK
DATABASE
SYSTEM_INFO
USER_DATA
EXECUTION
```

**Somente `READ_FILES` possui uma operação implementada neste corte.** Os demais
nomes são parte do vocabulário estável de permissões, não permissões implícitas.
Uma capacidade nova só ganha comportamento depois de uma implementação e testes
específicos.

## Requisições atuais

```text
ReadFile { path: string }
```

`path` é sempre relativo à raiz autorizada pela `RuntimePolicy`.

## Respostas atuais

```text
FileContents(bytes)
Error(error)
```

Erros relevantes:

- `CapabilityDenied` — a capacidade necessária não foi concedida;
- `CapabilityNotImplemented` — a capacidade existe no vocabulário, mas a
  operação ainda não foi implementada;
- `RuntimeStopped` — o Runtime não está aceitando operações;
- `InvalidPath` — o pedido não é um caminho relativo válido;
- `PathOutsideRoot` — o caminho resolvido escaparia da raiz autorizada;
- `NotAFile` — o alvo não é um arquivo;
- `Io` — falha operacional de filesystem.

## Regras de evolução

1. O consumidor não acessa o filesystem diretamente.
2. Cada nova operação precisa de uma capacidade explícita.
3. A capacidade deve ser verificada no Runtime, e não apenas no consumidor.
4. O contrato lógico deve ser testado antes de escolher IPC, Tauri ou
   serialização.
5. Não adicionar capacidades apenas porque serão úteis para um módulo futuro.
6. Mudanças incompatíveis devem ser registradas em ADR antes de migrar
   consumidores.
7. O transporte não pode conceder uma capacidade que a `RuntimePolicy` não
   concedeu.
8. `Stopped` é uma barreira operacional: requisições não devem ser enfileiradas
   silenciosamente para execução posterior.
