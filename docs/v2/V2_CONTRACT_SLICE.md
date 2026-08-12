# V2 — Contract slice

Este teste verifica a fronteira entre os componentes da primeira cadeia operacional:

```text
Registry
  ↓
Permission System
  ↓
Runtime Bootstrap
  ↓
Runtime Lifecycle
  ↓
Module
```

## Invariantes

1. O envelope é produzido a partir das concessões efetivas.
2. Capacidade negada não atravessa o envelope.
3. Um módulo ativo abre o Runtime antes de seu trabalho de lifecycle.
4. O fechamento do Runtime ocorre após o lifecycle.
5. O teste não depende de um transporte concreto; a escolha de IPC permanece posterior.

Este contrato é um teste de integração do Core. Ele não substitui o teste do Runtime Rust, que deve validar novamente o envelope e aplicar a política no lado de confiança.
