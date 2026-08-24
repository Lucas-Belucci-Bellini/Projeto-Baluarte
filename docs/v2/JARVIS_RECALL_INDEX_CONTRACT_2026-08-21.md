# JARVIS — Contrato do índice local de recall

**Versão:** `jarvis-recall-index/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** índice derivado em memória para documentos resumidos do recall
**Autor:** Manus AI

## Objetivo

Pré-calcular, uma vez por revisão de corpus, os tokens dos documentos, a frequência documental e os vetores TF-IDF necessários ao ranking. A query atual continua sendo tokenizada e vetorizada em cada chamada; nenhum texto de query, resultado ou resposta é cacheado.

## Estrutura derivada

O índice é associado a uma lista específica de `RecallDoc[]` e contém somente:

| Campo | Uso | Limite |
|---|---|---:|
| `docs` | referências dos documentos resumidos | máximo 256 |
| `tokensByDoc` | tokens derivados de cada resumo | bounded pelo corpus |
| `idfByToken` | frequência documental derivada | bounded pelo vocabulário |
| `vectorsByDoc` | vetores TF-IDF derivados | bounded pelo corpus |
| `characters` | métrica numérica opcional | inteiro bounded |

A associação deve ser invalidada quando a revisão do corpus mudar ou quando a identidade/ordem dos documentos recebidos não for a mesma do índice. O índice não deve manter `sessionId` em observabilidade; o runtime pode manter a referência interna já presente no `RecallDoc` para preservar o resultado.

## Equivalência obrigatória

Para qualquer query, corpus e `k` válidos, o caminho indexado deve produzir os mesmos hits, scores dentro da precisão numérica normal do JavaScript, ordenação, filtro `score > 0.04` e corte que o caminho atual. Se a construção do índice falhar, `recall()` deve retornar ao algoritmo original em vez de lançar ou retornar autorização implícita.

O índice não pode alterar stopwords, normalização, limiar, cálculo de cosseno ou semântica de documentos vazios. Query vazia, corpus vazio e `k` não positivo continuam retornando array vazio.

## API local

A API pode ser interna ao módulo `jarvis-recall.js`, mas o contrato permite um argumento opcional `index` em `recall(query, docs, k, index)`. Sem esse argumento, o caminho atual continua funcionando. A página pode passar o índice criado no mesmo ciclo que obteve o corpus; consumidores existentes não precisam conhecer a nova estrutura.

O índice é derivado do corpus e não deve ser persistido. A memória cacheada deve continuar sendo invalidada pela revisão do corpus antes que um índice novo seja usado. Não haverá cache por query nem chave baseada em texto do usuário.

## Segurança e privacidade

Não registrar tokens, palavras, queries, documentos ou scores em eventos. Observabilidade, se adicionada, limita-se a `documents`, `indexedDocuments`, `cacheHit` e `buildMs`. O cálculo continua read-only, sem permissão adicional, sem acesso a rede e sem bridge OpenClaw.

## Testes obrigatórios

A suíte deve comparar caminho original e indexado em queries com acento, stopwords, query vazia, documentos vazios, empates e `k` variável. Deve verificar que um índice de corpus/revisão diferente não é reutilizado, que os limites bounded são aplicados e que nenhum texto aparece na observação.

## Rollback

Remover o índice e o quarto argumento opcional de `recall()` devolve o algoritmo existente sem tocar persistência, configuração ou consumidores externos.

— **Manus AI**
