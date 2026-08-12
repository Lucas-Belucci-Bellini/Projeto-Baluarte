# Contrato do Runtime V2

## Objetivo

Definir a fronteira lógica entre o Core de Orquestração e o Core de Runtime sem
acoplar a API a um transporte específico.

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
- `InvalidPath` — o pedido não é um caminho relativo válido;
- `PathOutsideRoot` — o caminho resolvido escaparia da raiz autorizada;
- `NotAFile` — o alvo não é um arquivo;
- `Io` — falha operacional de filesystem.

## Regras de evolução

1. O consumidor não acessa o filesystem diretamente.
2. Cada nova operação precisa de uma capacidade explícita.
3. O contrato lógico deve ser testado antes de escolher IPC, Tauri ou serialização.
4. Não adicionar capacidades apenas porque serão úteis para um módulo futuro.
5. Mudanças incompatíveis devem ser registradas em ADR antes de migrar consumidores.
