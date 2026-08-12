# Contrato do Runtime V2

## Objetivo

Definir a fronteira lógica entre o Core de Orquestração e o Core de Runtime sem acoplar a API a um transporte específico.

## Fluxo de autorização

```text
Manifesto
   ↓
Module Registry
   ↓
Permission System
   ↓
runtime-bridge.js
   ↓
RuntimePolicy::from_names()
   ↓
Runtime Rust
```

A ponte `v2/core/runtime-bridge.js` produz apenas um envelope serializável de
permissões **já concedidas**. Ela não concede acesso. O Runtime Rust continua
sendo a autoridade final para aceitar ou negar uma operação.

## Estado do Runtime

O Runtime possui dois estados operacionais:

```text
Running  <── start() ──>  Stopped
             stop()
```

Uma operação recebida enquanto o Runtime está `Stopped` falha com `RuntimeStopped`. Isso dá ao transporte futuro um comportamento claro durante desligamento, reinício e supervisão.

## Capacidades

O vocabulário de autorização é:

```text
READ_FILES
WRITE_FILES
NETWORK
DATABASE
SYSTEM_INFO
USER_DATA
EXECUTION
```

Somente `READ_FILES` possui operação implementada neste corte. Os demais nomes são vocabulário estável de permissões, não permissões implícitas.

O Runtime aceita nomes de capacidades vindos do manifesto por `RuntimePolicy::from_names()`. Nomes desconhecidos são rejeitados; permissões duplicadas são normalizadas. O consumidor não pode inventar uma capacidade e esperar que ela seja ignorada silenciosamente.

Cada capacidade também declara se possui implementação (`Capability::implemented()`). Isso permite distinguir uma permissão concedida de uma operação que ainda não existe.

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
- `CapabilityNotImplemented` — a capacidade existe no vocabulário, mas a operação ainda não foi implementada;
- `RuntimeStopped` — o Runtime não está aceitando operações;
- `InvalidPath` — o pedido não é um caminho relativo válido;
- `PathOutsideRoot` — o caminho resolvido escaparia da raiz autorizada;
- `NotAFile` — o alvo não é um arquivo;
- `Io` — falha operacional de filesystem.

## Regras de evolução

1. O consumidor não acessa o filesystem diretamente.
2. Cada nova operação precisa de uma capacidade explícita.
3. A capacidade deve ser verificada no Runtime, e não apenas no consumidor.
4. Nomes de capacidade desconhecidos devem ser rejeitados no limite do Runtime.
5. O `runtime-bridge.js` só transporta concessões existentes; ele nunca aumenta o conjunto de permissões.
6. O contrato lógico deve ser testado antes de escolher IPC, Tauri ou serialização.
7. Não adicionar capacidades apenas porque serão úteis para um módulo futuro.
8. Mudanças incompatíveis devem ser registradas em ADR antes de migrar consumidores.
9. O transporte não pode conceder uma capacidade que a `RuntimePolicy` não concedeu.
10. `Stopped` é uma barreira operacional: requisições não devem ser enfileiradas silenciosamente para execução posterior.
11. Uma capacidade declarada não significa que sua operação já esteja disponível.
12. O envelope de autorização é versionado para permitir rejeição segura de formatos incompatíveis antes da execução.
