# V2 — Matriz de testes de segurança do Runtime

A fronteira de confiança deve ser testada contra entradas que tentem transformar dados lógicos em caminhos ou capacidades privilegiadas.

| Caso | Esperado | Camada |
|---|---|---|
| módulo vazio | rejeitar | Envelope |
| `.` / `..` | rejeitar | Envelope |
| `../x` | rejeitar | Envelope |
| `a/b` | rejeitar | Envelope |
| `a\\b` | rejeitar | Envelope |
| NUL no ID | rejeitar | Envelope |
| módulo duplicado | rejeitar | Envelope |
| capacidade desconhecida | rejeitar | Envelope |
| capacidade duplicada | rejeitar | Envelope |
| caminho absoluto | rejeitar | RuntimePolicy |
| caminho fora da raiz | rejeitar | RuntimePolicy |
| arquivo inexistente | erro controlado | RuntimePolicy |
| capability ausente | rejeitar | RuntimePolicy |
| Runtime parado | rejeitar | Runtime |
| módulo autorizado + arquivo interno | permitir | Runtime |

## Regra de confiança

Os testes do Core verificam que o contrato é produzido corretamente. Os testes do Rust verificam novamente o contrato e aplicam a política. Nenhuma validação do JavaScript é considerada uma barreira de segurança suficiente por si só.

## Próximo nível

Quando o transporte E2E estiver estável, adicionar casos de protocolo malformado, mensagens excessivamente grandes, encerramento inesperado do processo e múltiplas requisições sequenciais.
