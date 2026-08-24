# Ecosystem Discovery — Round 009

## Resultado

A busca por interfaces externas e capacidades de domínio nos quatro projetos candidatos não encontrou, nesta rodada, uma interface pronta que permita declarar um provider cross-project real.

Isso não é uma falha da arquitetura. É uma decisão importante: o Knowledge Mesh não deve ser criado antes de existir uma necessidade e um provider concretos.

## Matriz atual

| Projeto | Capability candidata | Interface externa confirmada | Provider Mesh confirmado |
|---|---|---:|---:|
| TaxForge | análise/validação fiscal e operação do projeto | MCP operacional | Não |
| Veritas | análise de circuitos/lógica | Não confirmada nesta rodada | Não |
| ARK | risco/resiliência/observação | Não confirmada nesta rodada | Não |
| AEGIS | investigação/evidência/validação | Não confirmada nesta rodada | Não |
| DailyPlanner | tarefas/agenda | Não confirmada nesta rodada | Não |

## Próximo movimento

Não implementar ainda `mesh_requests`, `capabilities` ou bridges no Supabase.

A próxima etapa deve ser uma análise estrutural dos repositórios (README, arquitetura, diretórios e contratos existentes) para montar um catálogo de capabilities independente de APIs. Depois, escolher uma capability com consumidor e provider reais.

## Critério para o primeiro fluxo

Só considerar um fluxo Mesh quando houver:

1. consumidor concreto;
2. necessidade concreta;
3. provider concreto;
4. contrato de entrada/saída definível;
5. autorização explícita;
6. provenance/origem da resposta;
7. estratégia de falha e versão.

## Continuidade

Este arquivo é o checkpoint da Round 009. Próxima conversa: continuar pelo catálogo estrutural de capabilities antes de tocar no Supabase.
