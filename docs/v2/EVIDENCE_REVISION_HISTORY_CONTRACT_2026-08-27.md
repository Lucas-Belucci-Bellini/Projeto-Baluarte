# Evidence Revision History — contrato local V2

**Status:** implementação local em validação; não é persistência de produção
**Base:** `09fff078fdf0912aee9f289919aaddd2127280de` (`main`)
**Slice:** `v2/evidence-revision-contract`
**Escopo:** tornar explícita a revisão de cada registro de Evidence e expor um histórico bounded, estrutural e somente leitura.

## Problema observado

A `EvidenceStore` já preservava fatos append-only e permitia alterar o status de um registro, mas o `EvidenceRecord` não informava qual revisão representava o estado atual e o `auditPreview()` mostrava apenas o retrato corrente. Isso dificultava comprovar a sequência local `append → status change` sem expor o statement, a fonte ou o collector ao consumidor de auditoria.

## Contrato implementado

Cada registro normalizado recebe `revision: 1`. Cada chamada bem-sucedida de `markStatus()` cria um novo estado imutável com a revisão incrementada e adiciona um evento interno bounded ao histórico daquele `id`. A sequência inicial é classificada como `appended`; alterações de status são classificadas como `status-changed`.

A função `projectEvidenceRevisionHistory(id, history, options)` e a API `evidence.revisionPreview(id, options)` retornam somente `id`, `moduleId`, `revision`, `kind`, `status`, `observedAt` e, quando aplicável, `supersededBy`. A saída e seus itens são congelados. O limite padrão é 25, o máximo é 100, e a resposta informa `returned`, `available` e `truncated`. Um `id` sem histórico retorna uma resposta vazia; argumentos inválidos são recusados.

A função foi exportada pelo wrapper JavaScript existente, sem duplicar a implementação TypeScript. A API anterior (`append`, `get`, `list`, `auditPreview`, `reviewQueue`, `search`, `markStatus` e eventos bounded) permanece disponível.

## Segurança e limites

Esta é uma extensão local e em memória. Não acessa rede, Supabase, RLS, Auth, claims, billing, staging, DDL, service role, filesystem, OpenClaw, MCP, Hermes ou qualquer provider externo. O histórico não contém `statement`, `source`, `uri`, `collector`, token, subject, IP, role ou permissão. Ele não aprova evidências, não executa revisão humana, não concede autoridade e não substitui uma trilha durável server-side.

O contrato não define política de transição de status nem retenção operacional. Não inventa retry, ownership ou persistência. A integração remota e a migração para armazenamento durável continuam dependentes de contratos, staging, backup, rollback e aprovação separados.

## Evidência esperada

| Verificação | Critério |
|---|---|
| Teste focal | EvidenceStore e módulo Evidence comprovam revisão inicial, incremento, redaction, imutabilidade, limite e fallback vazio |
| Tipos | `npm run tipos:ts` e `npm run tipos:v2` sem erro novo |
| Suíte | `npm test` sem regressão |
| Build e integração | Build, integração V2, smoke e caminho crítico verdes |
| Segurança | Security Contracts verdes; nenhum dado sensível atravessa o projetor |
| Doctor | Estados ambientais mantidos honestamente; sem converter Cargo ausente ou vulnerabilidades em verde |

## Rollback

O rollback normal da slice integrada é `git revert` do squash merge correspondente. Antes da integração, basta não promover a branch. O rollback não deve usar reset destrutivo, force-push, alteração de proteção ou apagar histórico. A mudança funcional está limitada a `v2/data/evidence.ts`, `v2/data/evidence.js`, `v2/modules/evidence/module.js` e seus testes; esta nota documenta o contrato e pode ser revertida separadamente.

## Próximo bloqueio

Mesmo com este contrato local, a Evidence Layer continua sem persistência durável, ownership, revisão humana server-side, retenção operacional, RLS e auditoria de consumidor em produção. Esta slice não altera a classificação global: a V2 permanece `IN PROGRESS`.
