# Evidence — busca local bounded

**Data:** 2026-08-26  
**Status:** contrato local, read-only e experimental  
**Gap relacionado:** search/index budgets da Fase 06/13

## Objetivo

Oferecer uma busca determinística e limitada sobre evidências já presentes no `EvidenceStore`, sem rede, persistência, indexador externo ou autoridade. O slice fecha somente a lacuna de uma consulta local mínima para diagnóstico e módulos V2; não é mecanismo de busca de produção nem substitui o Knowledge Mesh.

## API

A projeção canônica é `projectEvidenceSearch(records, options)`. O `EvidenceStore` expõe `search(options)`, e o módulo `evidence` delega a chamada à mesma implementação. `options.query` é obrigatório e deve ser texto não vazio. Podem ser informados `moduleId`, `status` e `limit`.

| Campo | Regra |
|---|---|
| `query` | Obrigatório; trim e comparação case-insensitive; procura somente metadados selecionados. |
| `moduleId` | Escopo opcional exato, trim e não vazio quando presente. |
| `status` | Filtro opcional entre `pending`, `verified`, `rejected` e `superseded`. |
| `limit` | Padrão `25`, teto `100`, inteiro positivo; nunca há paginação implícita. |
| `available` | Quantidade total de correspondências antes do limite. |
| `truncated` | `true` somente quando há mais correspondências que o limite. |

A consulta considera apenas `id`, `claimKey`, `moduleId` e `source.revision`. Ela não procura em `statement`, URI, publisher ou collector. Essa escolha evita transformar texto de conteúdo ou origem em uma superfície de projeção e mantém o retorno estruturalmente redigido.

## Projeção

Cada item retorna somente `id`, `moduleId`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. O resultado, a lista e cada item são congelados. Nenhum registro é alterado, nenhum status é promovido e nenhuma fonte é considerada verdadeira por aparecer nos resultados.

O retorno também informa `query`, `scope`, `status`, `limit` e o resumo `{ returned, available, truncated }`. Quando o módulo Evidence ainda não foi inicializado, sua API retorna uma projeção vazia pela mesma política bounded; não cria store implícito.

## Ordem e determinismo

A ordem segue a ordem append-only atual do store. A busca filtra em memória e seleciona os primeiros `limit` matches. Não há score, ranking de relevância, stemming, fuzzy matching, normalização semântica, idioma preferido, indexação persistente ou consulta remota.

## Segurança e limites

Esta API é observação local. Ela não autentica uma evidência, não atribui ownership, não resolve tenancy, não autoriza revisão humana, não grava banco e não promove status. `moduleId` é somente filtro de namespace produtor; não é proprietário operacional.

O limite máximo de `100` itens protege a projeção. O store continua limitado ao processo e a memória disponível; não há budget de latência de produção nesta etapa. O custo observado não deve ser apresentado como SLA ou threshold sem benchmark separado e ambiente comparável.

## Compatibilidade

A API existente `list`, `listByClaim`, `listByModule`, `retentionPreview`, `auditPreview` e `reviewQueue` permanece inalterada. O Wiki Zomboid mantém sua superfície pública de seis campos para a fila de revisão e não passa a expor a busca automaticamente. A V1 não é modificada.

## O que continua bloqueado

Busca/index de produção, full-text, ranking, índice persistente, ingestão remota, Evidence server-side, retenção operacional, ownership, revisão humana, tenancy, RLS, auditoria de produção e Knowledge Mesh continuam dependendo de contratos próprios e staging aprovado. Este slice não escolhe arquitetura de banco nem cria autoridade client-side.
