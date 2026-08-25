# Gate de decisão — Evidence ownership e retenção operacional

**Data:** 2026-08-25  
**Fase:** Data/Evidence — pré-persistência  
**Status:** decisão registrada; implementação local deliberadamente bloqueada  
**Escopo:** auditoria cooperativa para a V2 e orientação do próximo slice

## Resultado da auditoria

A camada Evidence local já possui `moduleId`, `retentionPreview()`, `auditPreview()` e `reviewQueue()`. Ela consegue mostrar produtor declarado, idade, janela de retenção, estado e pendências de forma bounded e read-only. Ela não possui, porém, identidade humana, tenant, owner server-side, concorrência remota ou uma política operacional de descarte.

A conclusão é importante: **não há um próximo campo seguro para adicionar ao `EvidenceRecord` local que possa ser chamado de ownership**. `moduleId` identifica o namespace do módulo que anexou o registro; não prova propriedade de usuário, organização, tenant ou autoridade para revisar/remover o registro.

> **Decisão:** ownership operacional e retenção efetiva permanecem bloqueados até contrato server-side, staging e rollback aprovados. Nenhum owner é inferido a partir de `moduleId`, sessão observada, role client-side ou metadata de UI.

## O que continua permitido localmente

| Capacidade | Estado | Regra |
|---|---|---|
| Classificar idade | Permitida | `retentionPreview()` recebe `now` explícito e só projeta `within-window`, `past-window` ou `future-observed`. |
| Auditar estrutura | Permitida | `auditPreview()` expõe somente ids, módulo, status, data e contagens bounded. |
| Enfileirar pendências | Permitida | `reviewQueue()` seleciona `pending` em ordem append-only e não muta registros. |
| Exibir produtor | Permitida | `moduleId` pode aparecer como origem do registro, nunca como owner autorizado. |
| Atribuir owner | Bloqueada | Exige identidade server-validated, tenant, política de membership e auditoria. |
| Alterar status por revisão humana | Bloqueada operacionalmente | `markStatus()` permanece apenas no contrato local existente; não é aprovação server-side. |
| Apagar ou expirar registros | Bloqueada | Classificação `past-window` não autoriza descarte. |
| Persistir em Postgres/Supabase | Bloqueada | Depende de adapter, tenancy, RLS, concorrência, retenção, custo e staging. |

## Gate para uma futura decisão server-side

Antes de implementar ownership ou retenção operacional, uma proposta futura deve responder, com testes e ambiente de staging, a todas as perguntas abaixo:

1. Qual é a entidade proprietária: usuário, organização, tenant ou serviço? A resposta deve ser uma identidade verificada no servidor, não um valor vindo do navegador.
2. Como o registro recebe `tenant_id`, quem pode ler, quem pode revisar e quem pode remover? Essas regras precisam de RLS/policy explícita, membership e negação por padrão.
3. Como duas revisões concorrentes são ordenadas? O contrato precisa de versão, idempotência, auditoria antes/depois e comportamento diante de conflito.
4. Qual é a retenção por classe de evidência? A política precisa distinguir expiração, preservação legal, supersession e revisão; `past-window` sozinho não basta.
5. Como o descarte é reversível ou auditável? O rollback deve ser testado em staging e não pode depender de mutação client-side.
6. Qual adapter separa a UI do banco e impede uma segunda fonte de verdade? A migração deve ser versionada, revisada e acompanhada de custo, índices e limites.

Sem respostas aceitas para esse gate, qualquer código que adicione `ownerId`, `tenantId`, `eligibleForDeletion`, `approve()` ou `delete()` ao caminho local seria prematuro e criaria falsa autoridade.

## Impacto na V2

Este documento não altera `v2/data/evidence.ts`, o módulo Evidence, o Wiki Zomboid, o Event Bus, Auth, RLS ou Supabase. Também não cria rota, storage, migration, job, permissão ou endpoint. O comportamento publicado nas alphas anteriores permanece intacto.

O próximo slice de Data/Evidence não deve ser escolhido por adicionar campos ao store local. Ele deve ser um contrato server-side/staging somente depois que identidade, tenancy, ownership, retenção, concorrência e rollback tiverem decisão explícita. Até lá, o caminho seguro é manter as projeções locais bounded e continuar outros slices locais previstos pela matriz.

## Rollback

Como este é um registro documental, o rollback é remover este arquivo e seu checkpoint de matriz. Nenhum código, dado, tag anterior ou branch de backup é afetado.
