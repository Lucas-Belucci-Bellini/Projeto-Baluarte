# Evidence Audit Preview — Contrato local V2

**Status:** implementado no commit funcional `dbd09f52`; release `1.3.2` publicada após validação
**Data:** 2026-08-22
**Autor:** Manus AI
**Dependência:** `v2/data/evidence.ts` e módulo `evidence`

## Objetivo

Este slice define uma projeção estrutural da Evidence para auditoria local de consumidores. O objetivo é permitir verificar quais registros existem, quais estados estão presentes e se a saída continua redigida, sem criar um histórico de eventos, sem apagar dados e sem autorizar revisão humana.

> `auditPreview` é um retrato bounded do estado atual do `EvidenceStore`; não é um log de auditoria operacional, não prova identidade do consumidor e não substitui auditoria server-side.

## API proposta

O módulo Evidence deverá expor `auditPreview(options?)` com:

```ts
{
  moduleId?: string;
  limit?: number;
}
```

`moduleId`, quando presente, deve ser uma string não vazia e filtra por igualdade exata. `limit` deve ser um inteiro positivo, terá default 25 e teto 100. Argumentos inválidos devem lançar `TypeError`; não haverá coerção silenciosa. A chamada sem opções deve funcionar.

A saída deverá ser um objeto congelado com `scope`, `limit`, `records` e `summary`. Cada registro poderá conter somente `id`, `moduleId`, `status` e `observedAt`. O resumo deverá conter apenas `returned`, contagens por status (`pending`, `verified`, `rejected`, `superseded`) e `truncated`. As contagens descrevem apenas os registros devolvidos; `truncated` informa que o limite ocultou registros adicionais, sem expor um total ilimitado escondido.

A ordem deverá preservar a ordem append-only do store. A saída não poderá incluir `statement`, `source`, URI, título, publisher, revision, collector, confidence, claimKey, retrievedAt, supersededBy, token, role, claims ou permissão.

## Lifecycle e segurança

A projeção deverá reutilizar o `EvidenceStore` existente e a fronteira do Registry. Antes do `init` e depois de `dispose`, deverá retornar um retrato vazio depois da validação das opções. Não deverá criar outro Storage, rota, permissão, barramento, rede, Supabase, SQL, RLS, Auth, OpenClaw, WhatsApp ou Spotify.

`auditPreview` será read-only: não poderá chamar `append`, `appendCatalog` ou `markStatus`. Não haverá UI de aprovação, endpoint remoto, papel administrativo no cliente ou decisão de retenção automática.

## Testes obrigatórios

O teste focal deverá provar chamada sem opções, filtro exato por módulo, limite, contagens somente dos registros devolvidos, `truncated`, imutabilidade, omissão de conteúdo sensível, argumentos inválidos, fallback antes do init e fallback após `dispose`. Deve também provar que a chamada não altera quantidade, ordem ou status do store.

O gate browser deverá chamar `window.__v2.api('evidence', 'auditPreview', ...)` no boot limpo e confirmar retrato vazio, bounded, congelado e sem campos sensíveis. Nenhum seed persistente deverá ser adicionado ao harness.

## Rollback e próximo passo

O rollback é remover somente `auditPreview`, seu contrato, testes e documentação, preservando `retentionPreview`, `append`, `appendCatalog`, `get`, `list`, `listByClaim`, `listByModule`, `markStatus`, a fila Wiki e todos os wrappers. Se aprovado, o próximo passo separado poderá tratar retenção operacional ou auditoria server-side com identidade, tenancy, ownership e retenção formal.

Persistência Supabase/RLS continua bloqueada até aprovação explícita de staging, custo, migrations, tenancy, segurança e rollback.
