# JARVIS — Contrato de cache local do recall

**Versão:** `jarvis-memory-cache/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** corpus resumido cross-session em memória do processo/página
**Autor:** Manus AI

## Objetivo

Reduzir a reconstrução repetida do corpus de memória entre conversas quando nenhuma sessão ou mensagem mudou. O contrato cacheia somente documentos resumidos, preservando o cálculo de relevância por pergunta e a persistência existente.

> O cache otimiza leitura local; ele não é fonte de autoridade, não concede permissão e não substitui IndexedDB, o fallback em memória ou o espelho best-effort do Nexus.

## Modelo de frescor

A memória local mantém uma revisão monotônica inteira. A revisão começa em `0` e aumenta uma vez para cada mutação efetiva que possa alterar o conjunto de sessões ou mensagens. A revisão não é persistida em IndexedDB e pode reiniciar após reload; isso é seguro porque o cache também vive somente no mesmo runtime.

| Mutação | Incrementa revisão | Motivo |
|---|---:|---|
| `createSession()` | Sim | Adiciona sessão potencialmente relevante |
| `addMessage()` | Sim | Altera o resumo da sessão |
| `updateSession()` | Sim quando a sessão existe | Pode alterar metadados usados por consumidores |
| `deleteSession()` | Sim | Remove sessão e mensagens |
| `clearAll()` | Sim | Remove todo o corpus |
| leitura sem mudança | Não | Não há dado novo para invalidar |

`buildMemoryCorpus(null)` pode retornar o cache quando `cachedRevision === currentRevision`. Para qualquer `excludeSessionId` não nulo, a função deve construir o resultado específico sem substituir o cache completo. O recall continuará recebendo uma cópia filtrada e calculará TF-IDF/cosseno para a query atual.

## Limites e segurança

O cache deve manter no máximo `MAX_MEMORY_CACHE_DOCS = 256` documentos e truncar cada resumo ao limite já estabelecido por `summarizeSession()`. O retorno deve ser uma cópia do array para impedir que `recall()` ou `setMemoryCache()` alterem o cache interno acidentalmente. A política não registra textos, ids ou queries na observabilidade; somente contagens e indicação de hit/miss podem ser observadas.

Falhas de IndexedDB continuam caindo no `memFallback`. A revisão deve avançar também nesse caminho, pois o fallback é uma fonte de dados mutável. Falhas na construção do corpus continuam best-effort e não podem bloquear a conversa nem converter erro em autorização.

## Invariantes

A implementação não pode alterar o formato dos stores IndexedDB, o payload de Nexus, a função `recall()`, o guard de `recall_memory`, a política de permissões, o limite de memória durável ou qualquer bridge externo. Não haverá cache de respostas, cache por query, armazenamento de credenciais ou persistência remota.

## Observabilidade bounded

A observação opcional pode expor somente:

| Campo | Limite |
|---|---:|
| `revision` | inteiro não negativo |
| `documents` | inteiro entre 0 e 256 |
| `cacheHit` | booleano |
| `buildMs` | inteiro entre 0 e 60.000 |
|

Nenhum texto de conversa, `sessionId`, token, subject ou metadata deve aparecer no evento.

## Testes obrigatórios

A suíte deve verificar que duas construções sem mutação reutilizam o cache; que `addMessage()` invalida o resultado; que `deleteSession()` e `clearAll()` removem documentos; que exclusão por sessão não contamina o cache completo; que o limite de 256 documentos é aplicado; que o fallback segue funcionando; e que a observabilidade não contém identificadores.

## Rollback

O rollback remove o contador, a chave de cache e as observações, devolvendo `buildMemoryCorpus()` à leitura completa existente. Nenhuma migration ou operação externa é necessária.

— **Manus AI**
