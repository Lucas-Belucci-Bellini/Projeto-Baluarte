# Contrato — Evidence Review Queue local

**Data:** 2026-08-25
**Fase:** Data/Evidence — retenção e auditoria operacional local
**Implementação:** `v2/data/evidence.ts`, `v2/modules/evidence/module.js` e `v2/modules/wiki-zomboid/module.js`
**Verificação:** `test/v2/evidence.test.js` e `test/v2/wiki-zomboid-module.test.js`

## Objetivo

Centralizar a seleção bounded de evidências `pending` que precisam de revisão, sem criar persistência nova, sem permitir mutação e sem acoplar o piloto Wiki Zomboid a uma política duplicada. O contrato é local e preparatório para uma futura revisão humana server-side; ele não é uma autorização operacional.

## Projeção

`projectEvidenceReviewQueue(records, options?)` e `EvidenceStore.reviewQueue(options?)` aceitam `moduleId` opcional e `limit` positivo, limitado a 100 e com padrão 25. A seleção preserva a ordem append-only dos registros e considera somente `status: pending`. O resumo informa `returned`, `available` e `truncated`.

Cada item contém somente `id`, `moduleId`, `claimKey`, `status`, `confidence`, `observedAt` e `sourceRevision`. Não entram na fila projetada `statement`, URI, título, publisher, collector ou qualquer payload externo. O objeto, itens e vetor são congelados.

| Campo | Regra |
|---|---|
| `scope` | `all` ou `moduleId` normalizado |
| `limit` | padrão 25, teto 100, inteiro positivo |
| `status` | sempre `pending` nesta fila |
| `available` | total de pendências no escopo antes do limite |
| `truncated` | `true` quando há mais pendências que o limite |

## Compatibilidade

O módulo Evidence expõe a fila genérica pela API V2. O Wiki Zomboid delega a seleção a essa API e mantém seu formato legado de seis campos, omitindo `moduleId` para não quebrar consumidores existentes. A ausência do módulo Evidence continua retornando uma lista vazia.

## Não-escopo

Este contrato não muda status, não cria tarefa, não envia rede, não grava banco, não remove evidência, não aprova claims, não decide autoridade e não implementa revisão humana. Persistência Postgres/Supabase, tenancy, ownership server-side, concorrência e retenção operacional continuam dependentes de decisões e staging separados.

## Rollback

Remover `projectEvidenceReviewQueue`, `EvidenceStore.reviewQueue`, a delegação no módulo Evidence/Wiki, o teste focal e este documento retorna ao comportamento anterior de `reviewQueue` local, sem alterar o schema SQL, endpoints ou módulos de produto.
