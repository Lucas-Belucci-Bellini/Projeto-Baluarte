# Health e Readiness da V2

## Objetivo

A V2 separa três perguntas que não devem ser confundidas:

- **liveness** — o Core está vivo o suficiente para responder a supervisão?
- **readiness** — o Core terminou o boot e possui pelo menos um módulo ativo?
- **diagnóstico** — quais módulos, falhas, eventos e referências explicam o estado?

O módulo `v2/core/saude.js` consome apenas o retrato produzido pelo Boot. Ele não
inicia módulos, não reinicia processos e não altera permissões.

## Estados

| Condição | Liveness | Readiness |
| --- | --- | --- |
| `parado` | unhealthy | unhealthy |
| `subindo` | healthy | unhealthy |
| `no-ar`, com módulo | healthy | healthy |
| `no-ar`, sem módulo | healthy | unhealthy |
| `descendo` | healthy | unhealthy |

Falhas de módulos saudáveis, eventos órfãos e referências órfãs aparecem nos
motivos e contadores, mas não transformam automaticamente todo o sistema em
unhealthy. Isso preserva o isolamento de falhas definido para a V2.

## Próxima integração

A saúde deve ser exposta pelo futuro supervisor/transportador como uma leitura,
nunca como uma API capaz de iniciar, parar ou conceder capacidades. A camada de
supervisão poderá decidir o que fazer com um estado unhealthy; o módulo de saúde
não deve decidir por ela.
