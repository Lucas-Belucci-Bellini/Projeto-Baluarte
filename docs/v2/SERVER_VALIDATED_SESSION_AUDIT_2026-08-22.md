# Auditoria — Sessão server-validated TypeScript

**SHA auditado:** `94cb671d1d9860b0fec3f3fe6a8d465f792ae1c9`  
**Data da auditoria:** 2026-08-22  ̶  horário observado no ambiente de execução  
**Branch:** `main`  
**Status:** AUDITORIA CONCLUÍDA — implementação limitada a projeção local read-only

## Objetivo

Mapear a fronteira atual entre o estado de sessão local do browser, o endpoint backend de claims e as projeções de observabilidade V2 antes de conectar uma nova slice. A slice não deve decodificar JWT, interpretar `user_metadata`, conceder permissão, alterar RLS, criar endpoint remoto ou transformar observação em autorização.

## Fontes auditadas

| Área | Fonte | Resultado |
|---|---|---|
| Sessão local | `src/core/auth-session.ts` | Projeta somente `access_token`, `refresh_token` e expiração; revalida storage e preserva refresh token quando permitido |
| Adapter compatível | `src/core/supabase-auth.js` / `.d.ts` | API V1 permanece JavaScript; `getAccessToken()`, `currentUser()`, refresh, logout e redirect já possuem fronteira declarada |
| Claims frontend | `src/layout/server-claims-observation.ts` | Observação bounded, escopos conhecidos, validade curta e invariantes `decision/authority: not-authorized` |
| Observação combinada | `src/layout/server-observation.ts` | Normaliza o envelope `server-observation/v1` de health + claims e produz fallback Runtime sem autoridade |
| Claims backend | `backend/claims_adapter.py` | Valida bearer server-side via Supabase `/auth/v1/user`, deriva escopos a partir de `app_metadata` e redige token/claims/metadata |
| Rotas backend | `backend/server.py` | `/claims/observe` e `/observability/observe` retornam apenas envelopes de observação; rate limit e CORS permanecem server-side |
| Consumidores | `src/core/comms.js`, `src/core/media-sync.js` | Dependem de sessão local para operações de dados; não devem receber roles ou autoridade por esta slice |

## Descoberta principal

Existe uma diferença intencional entre os contratos de produção. O backend retorna `server-claims/v1` com `source: server-authority`, `redaction` e flags de identidade, enquanto `server-claims-observation.ts` é uma projeção frontend de `claims-observation/v1` com `source: server-authority-projection`. O endpoint combinado `/observability/observe` já é compatível com `observeServerObservation()` e deve ser preferido para a primeira integração de leitura.

Essa diferença não é tratada como erro do backend nem corrigida por duplicação de contrato. A nova slice deve consumir o envelope combinado através de uma projeção TypeScript própria, preservando a distinção entre sessão local e evidência server-validated.

## Contrato de saída proposto

A projeção local expõe somente estado operacional bounded: `anonymous`, `authenticated`, `stale`, `degraded` ou `unavailable`; health/fallback; escopos aceitos; frescor dos claims; códigos de evidência; e os invariantes `authority: 'not-authorized'` e `publicPromotionAllowed: false`. Não expõe token, subject, role, `user_metadata`, `app_metadata`, headers, URL privada, stack trace ou payload bruto.

Uma resposta `authenticated` exige claims observados, `authenticated: true`, `claimsFresh: true` e fallback não bloqueado. Uma resposta ausente, inválida, rate-limited ou stale não é convertida em usuário autenticado. Em caso de dúvida, o estado cai para `unavailable` ou `degraded`.

## Fora do escopo

Esta slice não fará chamada de rede automaticamente, não alterará `supabase-auth.js`, não fará decode local de JWT, não criará autorização no cliente, não aplicará DDL/migration, não ativará RLS remoto, não conectará OpenClaw e não liberará módulos quebrados para usuários comuns.

## Riscos e rollback

O risco principal é confundir a presença de uma sessão local com validação server-side ou tratar scopes observados como permissão operacional. O mitigador é uma saída tipada sem token/role e com autoridade constante `not-authorized`. O rollback é remover o novo projetor e seus testes; os contratos existentes de Auth, claims, observation, Registry e módulos continuam independentes.

## Testes previstos

Serão cobertos envelope válido, claims anônimos, claims stale, health degraded, fallback blocked, rate limit, payload arbitrário, campos sensíveis, resposta ausente e invariantes de não-autorização. Depois, a suíte completa e o runner oficial serão executados antes de qualquer publicação na `main`.

## Resultado da validação inicial

A primeira execução remota revelou uma falha local de integração, não de lógica de autorização: o workflow `Security Contracts` usa Node nativo e não resolveu imports TypeScript sem extensão a partir de `server-validated-session.ts` (`ERR_MODULE_NOT_FOUND` para `server-claims-observation`). O strict TypeScript e os testes via `tsx` já passavam.

A correção mantém uma única implementação canônica e adiciona somente os wrappers `src/layout/server-claims-observation.js` e `src/layout/server-observation.js`, seguindo o padrão existente de compatibilidade. A nova projeção importa essas fronteiras `.js`, que reexportam os `.ts` com extensão explícita para o Node do CI. No sandbox, `node --test` em Node 22 ainda não carrega diretamente `.ts`; essa limitação de runtime local é distinta do workflow remoto Node 24, que possui suporte de type stripping. O runner oficial do projeto continua usando `tsx`/Vite conforme seus scripts e não recebeu relaxamento de configuração.

Após a correção, `npm run tipos:ts`, os testes focais e `npm test` passaram. O workflow Security Contracts será revalidado no SHA que publicar os wrappers e o projetor.
