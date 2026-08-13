# V2 — Runtime protocol errors

A resposta do Runtime usa códigos estáveis para que o Core não dependa de texto de erro.

| Código | Significado |
|---|---|
| `RUNTIME_REJECTED` | envelope ou política recusados antes da operação |
| `RUNTIME_ERROR` | operação autorizada, mas execução falhou |

O texto `message` é diagnóstico humano; não deve ser usado como identificador de fluxo.

## Regra

O Core deve tratar códigos desconhecidos como erro não recuperado, preservando a mensagem apenas para diagnóstico.
