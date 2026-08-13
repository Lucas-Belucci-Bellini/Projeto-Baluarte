# Contrato do Runtime V2

## Objetivo

Definir a fronteira lógica entre o Core de Orquestração e o Core de Runtime sem acoplar a API a um transporte físico específico.

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
envelope JSON v1
   ↓
RuntimeEnvelope::validate()
   ↓
RuntimeHost
   ├── módulo A → RuntimePolicy A → raiz A
   ├── módulo B → RuntimePolicy B → raiz B
   └── ...
```

A ponte `v2/core/runtime-bridge.js` produz apenas um envelope serializável de
permissões **já concedidas**. Ela não concede acesso. O Runtime Rust valida o
envelope novamente e o `RuntimeHost` cria uma política isolada para cada módulo.

A raiz física não vem do manifesto: ela é fornecida pelo host confiável. Assim,
um módulo não consegue escolher a própria área de filesystem apenas alterando o
manifesto.

## Envelope

Formato atual:

```json
{
  "versao": 1,
  "modulos": [
    {
      "modulo": "wiki",
      "permissoes": ["READ_FILES"]
    }
  ]
}
```

O Runtime rejeita versões incompatíveis, módulos duplicados, IDs vazios,
permissões desconhecidas e permissões duplicadas. O envelope pode ser convertido
para `RuntimePolicy` somente depois da validação.

## Estado do Runtime

O Runtime possui dois estados operacionais:

```text
Running  <── start() ──>  Stopped
             stop()
```

Uma operação recebida enquanto o Runtime está `Stopped` falha com `RuntimeStopped`.

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

Somente `READ_FILES` possui operação implementada neste corte. Os demais nomes
são vocabulário estável de permissões, não permissões implícitas.

O Runtime aceita nomes de capacidades vindos do manifesto por
`RuntimePolicy::from_names()`. Nomes desconhecidos são rejeitados; permissões
duplicadas são normalizadas na criação da policy e rejeitadas no envelope.

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

## Transporte

O Core possui `runtime-transport.js`, mas ele é uma **abstração**, não uma
implementação de IPC. Seu contrato recebe uma função `enviar(payload)` e trabalha
somente com JSON serializável.

Isso permite testar toda a fronteira sem escolher ainda entre Tauri, stdio,
socket ou outro transporte físico.

## Regras de evolução

1. O consumidor não acessa o filesystem diretamente.
2. Cada nova operação precisa de uma capacidade explícita.
3. A capacidade deve ser verificada no Runtime, e não apenas no consumidor.
4. Nomes de capacidade desconhecidos devem ser rejeitados no limite do Runtime.
5. O `runtime-bridge.js` só transporta concessões existentes; ele nunca aumenta o conjunto de permissões.
6. O contrato lógico deve ser testado antes de escolher o transporte físico.
7. Não adicionar capacidades apenas porque serão úteis para um módulo futuro.
8. Mudanças incompatíveis devem ser registradas em ADR antes de migrar consumidores.
9. O transporte não pode conceder uma capacidade que a `RuntimePolicy` não concedeu.
10. `Stopped` é uma barreira operacional: requisições não devem ser enfileiradas silenciosamente para execução posterior.
11. Uma capacidade declarada não significa que sua operação já esteja disponível.
12. O envelope de autorização é versionado para permitir rejeição segura de formatos incompatíveis antes da execução.
13. A raiz física de um módulo é responsabilidade do host confiável, nunca do manifesto.
14. Cada módulo recebe uma `RuntimePolicy` própria; permissões de um módulo não são compartilhadas implicitamente com outro.
15. O Runtime deve falhar fechado quando faltar configuração de sandbox, raiz ou capacidade.
