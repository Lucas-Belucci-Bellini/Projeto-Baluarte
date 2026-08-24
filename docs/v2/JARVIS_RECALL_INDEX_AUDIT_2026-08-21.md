# JARVIS — Auditoria do índice local de recall

**Status:** AUDIT COMPLETE — nenhuma mudança de implementação nesta etapa
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `d17910e7d9d3e64a038f1d0aaf71fb62ec8999d6`
**Data:** 2026-08-21
**Objetivo:** reduzir o custo repetido de tokenize/TF-IDF do recall por revisão de corpus, sem cachear queries, respostas ou dados externos.

## Diagnóstico

`src/utils/jarvis-recall.js` tokeniza a query uma vez, mas tokeniza cada documento para calcular a frequência documental e novamente para calcular o vetor TF-IDF durante cada chamada de `recall()`. O corpus resumido pode ser reutilizado entre turnos após o slice `jarvis-memory-cache`, porém o índice algorítmico ainda é reconstruído por pergunta.

A página JARVIS chama `recall()` com a pergunta atual e até 256 documentos resumidos. A query muda em cada turno; portanto, cachear resultado de query teria risco de retenção desnecessária e baixo reaproveitamento. A oportunidade segura é pré-calcular, por revisão de corpus, somente tokens, frequências documentais e vetores dos documentos. O vetor da query e o ranking continuam sendo calculados a cada pergunta.

| Operação atual | Repetição | Otimização candidata |
|---|---:|---|
| Tokenização da query | 1 por query | Preservar; query nunca é cacheada |
| Tokenização dos documentos | 2 vezes por documento/query | 1 vez por revisão de corpus |
| Frequência documental/IDF | 1 reconstrução por query | 1 índice por corpus |
| Vetor da query | 1 por query | Preservar |
| Cosseno/ranking | 1 por documento/query | Preservar |
| Filtro da sessão corrente | 1 por turno | Preservar usando referências dos documentos |

## Causa raiz versus efeitos

A causa raiz é a ausência de um índice derivado do corpus. A repetição de tokenização e construção de IDF é o efeito direto; CPU/latência adicional em conversas longas são efeitos cascata. Não há evidência de que o cálculo de cosseno seja um problema de segurança ou que o ranking esteja incorreto.

## Limite seguro

O índice será criado junto ao cache de corpus e associado à mesma revisão monotônica. Ele manterá apenas estruturas derivadas bounded e referências aos documentos já presentes no cache. Não haverá chave com texto bruto, cache por query, persistência IndexedDB, Nexus, provider ou telemetria de conteúdo. Se um índice não corresponder exatamente às referências dos documentos pedidos, `recall()` deverá reconstruí-lo localmente em vez de usar dados potencialmente stale.

A semântica atual deve permanecer: `score > 0.04`, ordenação decrescente e corte por `k`. A exclusão da sessão corrente deve continuar antes do ranking, sem contaminar o índice completo.

## Rollback

Rollback é a remoção do índice opcional e do argumento adicional de `recall()`. O algoritmo atual continua sendo um fallback válido; nenhuma migration ou mudança externa é necessária.

— **Manus AI**

## Implementação e medição

O índice derivado foi implementado em `src/utils/jarvis-recall.js` como `buildRecallIndex()` e pode ser passado como quarto argumento opcional de `recall()`. `src/pages/jarvis.ts` reutiliza o índice da mesma revisão quando filtra a sessão corrente; subsets e cópias de documentos caem no caminho de reconstrução segura. A query continua sendo tokenizada e vetorizada a cada chamada, e `runTool()`, permissões, memória durável e bridges não foram tocados.

Os testes focais passaram em **35/35**, incluindo equivalência de ranking/scores para queries com acento, query vazia, documentos vazios, subset e corpus com objetos clonados. `npm run tipos:ts` passou. O índice mantém no máximo 256 documentos e não possui API de observação de tokens, queries, hits ou scores.

O benchmark determinístico `scripts/jarvis-recall-index-benchmark.mjs` usou 256 documentos, oito queries e oito rodadas. O caminho sem índice executou 16.384 tokenizações documentais; o caminho indexado executou 256 na construção inicial e nenhuma tokenização documental adicional durante as 64 consultas. Foram evitadas 16.128 tokenizações, redução lógica de 98,44%. A equivalência foi `true`; as medianas observadas foram 11,169 ms contra 0,839 ms, fator 13,31x no sandbox. Os tempos são diagnósticos locais, não promessa de latência de hardware, provider ou navegador.

## Rollback

O rollback remove o índice, o quarto argumento opcional de `recall()`, o benchmark, os testes e as referências documentais, retornando ao algoritmo original sem migration, alteração de schema, persistência remota ou mudança de autoridade.

— **Manus AI**
