# JARVIS — Auditoria de cache do recall cross-session

**Status:** AUDIT COMPLETE — nenhuma persistência externa alterada nesta etapa
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA observado:** `0ae0076dd3add3d322b6d5dc45df606bf71e12c8`
**Data:** 2026-08-21
**Objetivo:** reduzir varreduras repetidas do corpus local de memória sem alterar privacidade, permissões, providers ou bridge OpenClaw.

## Diagnóstico

O recall cross-session é construído em `src/pages/jarvis.ts` por `buildMemoryCorpus()`. A função chama `getAllMessages()` em cada envio com `memoryOn`, agrupa todas as mensagens de todas as sessões, ordena cada sessão e gera um resumo determinístico por sessão com `summarizeSession()`. Depois, `recall()` calcula TF-IDF/cosseno sobre o corpus completo e injeta até três resumos relevantes no system prompt transitório.

A página também reconstrói o corpus no boot para alimentar a ferramenta síncrona `recall_memory` por `setMemoryCache()`. Como não existe revisão de mutação, o hot path não consegue distinguir corpus unchanged de corpus novo. O custo repetido é a leitura completa e a reconstrução dos documentos; o cálculo TF-IDF da pergunta continua sendo feito por turno e não será cacheado neste slice, porque a query muda a cada envio.

A persistência em `src/utils/jarvis-memory.js` tem duas camadas: IndexedDB, quando disponível, e `memFallback` quando o navegador/storage falha. As mutações relevantes são `createSession()`, `addMessage()`, `updateSession()`, `deleteSession()` e `clearAll()`. O espelho best-effort no Nexus não é fonte de frescor do cache e não será consultado para invalidar memória local.

| Causa | Efeito | Tratamento deste slice |
|---|---|---|
| Ausência de revisão de mutação | Toda chamada reconstrói o corpus, mesmo sem novas mensagens | Adicionar contador local bounded, incrementado em mutações efetivas |
| `buildMemoryCorpus()` sem cache | Leitura e resumo completos por envio | Cachear somente o corpus completo quando a revisão coincide |
| Query variável do recall | TF-IDF/cosseno repetido por pergunta | Preservar cálculo por query; não criar cache de conteúdo de pergunta |
| IndexedDB indisponível | Fallback em memória e perda após reload | Manter comportamento; a revisão também é local/volátil |
| Nexus best-effort | Dependência externa e eventual latência | Não envolver o Nexus na autoridade do cache |

## Limite seguro

O cache será apenas de documentos `{ text, sessionId }` já resumidos, nunca de mensagens brutas além do que o fluxo existente já carrega durante a construção. A chave será uma revisão monotônica local e o cache será invalidado em toda mutação que puder alterar sessões/mensagens. O cache não concede autoridade, não altera o resultado de `recall()`, não expõe conteúdo em telemetria e não modifica a persistência.

A função `buildMemoryCorpus(excludeSessionId)` continuará retornando um resultado correto para qualquer exclusão. Somente o caminho `excludeSessionId === null`, usado pela página para construir o corpus completo, será cacheado. O filtro da sessão corrente continuará ocorrendo antes de `recall()`, como hoje.

## O que não será feito

Não haverá indexação persistente, worker, alteração de schema IndexedDB, cache de respostas do modelo, sincronização com Supabase/Nexus, mudança de retenção ou compactação irreversível. O recall não será transformado em autorização e a ferramenta `recall_memory` continuará atrás da mesma fronteira de permissões.

## Rollback

O rollback remove o contador de revisão, o cache de documentos e os testes/telemetria do slice. A persistência existente permanece compatível porque nenhum store ou payload foi alterado.

— **Manus AI**

## Implementação e medição

O slice foi implementado sem alteração de schema IndexedDB ou persistência externa. `src/utils/jarvis-memory.js` agora mantém `getMemoryRevision()`, uma revisão monotônica local incrementada em criação, atualização efetiva, adição de mensagem, deleção e limpeza. `src/utils/jarvis-recall.js` cacheia no máximo 256 documentos resumidos, retorna cópias, invalida por revisão divergente e registra somente `revision`, `documents`, `cacheHit` e `buildMs` bounded. `src/pages/jarvis.ts` reutiliza o corpus completo somente quando `excludeSessionId === null` e a revisão coincide; exclusão da sessão corrente e cálculo de `recall()` continuam no caminho existente.

A suíte focal passou em **34/34**. A regressão completa passou em **1183/1183**, `tipos:ts`, `tipos:v2`, `v2:integracao` em **45/45**, smoke em **99/99** e caminho crítico em **15/15**. A primeira tentativa de integração falhou por um processo Vite stale ocupando a porta 4193; o processo foi encerrado conforme o procedimento operacional documentado e a execução seguinte passou 45/45. Nenhum código foi alterado para mascarar o timeout.

O benchmark determinístico `scripts/jarvis-memory-cache-benchmark.mjs` usa 256 sessões, oito mensagens por sessão e cinco rodadas. O caminho sem cache reconstruiria 1.280 documentos; o caminho cacheado evitou deterministicamente as 1.280 reconstruções sob a mesma revisão, com redução lógica de 100%. No sandbox observado, as medianas foram 19,554 ms contra 0,001 ms; o fator temporal de 19.554x é apenas diagnóstico desta execução e não é promessa de hardware, latência de browser ou provider. A evidência principal é a eliminação determinística da reconstrução de resumos, não o tempo absoluto.

## Segurança e rollback

O cache não armazena query, resposta de modelo, token, subject ou metadata. A mutação local invalida o corpus pela revisão; o Nexus continua best-effort e não participa da autoridade do cache. O método legado de `setMemoryCache()` permanece compatível e `recall_memory` conserva a mesma fronteira de permissão.

Rollback é a reversão do commit do contador, cache, benchmark, testes e documentação. Não exige migration, staging, DDL, provider, Supabase ou alteração de configuração externa.

— **Manus AI**
