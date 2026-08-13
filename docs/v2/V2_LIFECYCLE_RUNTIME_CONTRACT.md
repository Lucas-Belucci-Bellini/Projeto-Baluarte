# V2 — Lifecycle ↔ Runtime contract

A integração do Runtime com o lifecycle segue uma ordem fixa.

## Subida

```text
Registry selado
  → Runtime.open
  → module.init
  → module.start
```

O módulo não deve iniciar trabalho antes de o Runtime ter sido autorizado e aberto.

## Descida

```text
module.stop
  → Runtime.close
  → module.dispose
```

O Runtime é fechado antes do descarte final do módulo para que recursos de execução sejam encerrados antes de a instância desaparecer.

## Invariantes

- Registry deve estar selado antes da abertura.
- Um módulo aberto não é aberto novamente.
- `close` de módulo não aberto é no-op.
- Falha em `close` não pode deixar o registro interno marcado como aberto.
- Transporte e processo Rust permanecem detalhes abaixo da Session.
