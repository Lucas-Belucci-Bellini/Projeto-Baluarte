# Evidence — benchmark de busca local

**Data:** 2026-08-26  
**Comando:** `npm run bench:evidence-search`  
**Dataset:** `PZ_IDS` local curado do módulo Wiki Zomboid  
**Ambiente:** Linux x86_64, Node v22.13.0, sandbox local

## Objetivo

Medir o custo observado da busca local bounded sobre dados reais já presentes no repositório e verificar que a projeção mantém `returned`, `available` e `truncated` coerentes com o limite. O benchmark é diagnóstico de engenharia; não escolhe full-text, índice persistente, pgvector, SLA ou threshold de produção.

## Carga

A fonte contém `159` mods curados. Para cada mod, o benchmark deriva evidências somente dos campos declarados entre `name`, `author`, `category`, `workshopId`, `modId` e `spawnId`; campos opcionais vazios ou ausentes são pulados, nunca preenchidos com valor inventado. O resultado foi um store local com `640` registros Evidence.

Cada cenário aquece o caminho e executa `250` buscas. O benchmark não acessa rede, Steam, banco ou provider. A revisão do dataset é um valor de metadado local já declarado pela entrada curada.

## Resultado observado

| Cenário | Limite | Disponíveis | Retornados | Truncado | Média observada |
|---|---:|---:|---:|---|---:|
| Todos os metadados (`wiki-zomboid`) | 25 | 640 | 25 | sim | `125,435 µs` |
| Campo workshop (`workshopid`) | 100 | 159 | 100 | sim | `202,140 µs` |
| Revisão do dataset | 100 | 640 | 100 | sim | `223,172 µs` |
| Escopo + estado (`wiki-zomboid`) | 100 | 640 | 100 | sim | `119,301 µs` |

Os valores são médias de uma execução no sandbox e podem variar com CPU, carga, garbage collection, Node e ambiente de CI. Eles não devem ser apresentados como performance de usuário ou budget operacional.

## Verificações

O benchmark falha se `latencia` não retornar os limites e contagens esperados. Os cenários conferem que o resultado permanece bounded, que `available` é contado antes do corte e que `returned` nunca ultrapassa o limite. A busca continua case-insensitive apenas nos campos estruturais permitidos.

## Limites arquiteturais

A busca continua em memória, linear no número de registros e sem ranking, stemming, fuzzy matching, full-text, tokenização, índice persistente ou busca no `statement`. Ela não grava, não altera status, não autentica fontes, não concede ownership, não resolve tenancy e não autoriza revisão humana.

O benchmark usa o catálogo local curado como carga reprodutível, mas não afirma que 640 registros representam produção. Antes de qualquer índice persistente ou budget operacional, será necessário possuir consulta real, volume observado, requisitos de relevância, tenancy, retenção, RLS, custos e staging aprovado.

## Relação com o Doctor

Este benchmark é um comando explícito e separado. Não foi incluído automaticamente no `verify:v2`, porque busca em dataset local é uma medição e não um check universal de ambiente. Uma integração futura ao Doctor exigiria definir duração, tolerância, custo de execução e política de classificação sem transformar os números em threshold arbitrário.


## Repetição observada

Uma segunda execução do mesmo comando, sem alteração de código ou dataset, produziu os valores abaixo. A variação reforça que os números são diagnóstico do ambiente e não threshold:

| Cenário | Primeira execução | Segunda execução |
|---|---:|---:|
| Todos os metadados | `125,435 µs` | `94,968 µs` |
| Campo workshop | `202,140 µs` | `173,501 µs` |
| Revisão do dataset | `223,172 µs` | `222,314 µs` |
| Escopo + estado | `119,301 µs` | `90,390 µs` |

As duas execuções mantiveram `640` registros, `250` repetições por cenário, `returned <= limit` e `truncated: true` nos cenários com mais correspondências que o limite. A diferença é compatível com aquecimento, garbage collection e carga do sandbox; nenhuma conclusão operacional deve ser derivada dela.
