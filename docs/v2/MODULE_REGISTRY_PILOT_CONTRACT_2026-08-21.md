# Module Registry — Contrato do piloto operacional v1

**Status:** CONTRACT FIRST — read-only projection
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Base SHA:** `7677c389afd0739579b99f14efecec4d52cec0a3`
**Escopo:** projetar o estado de botão e revisão por módulo a partir de health operacional e claims observados, sem alterar autorização ou superfície pública.

## 1. Objetivo

O adapter usa `RegistryHealthEntry` produzido por `criarModuleRegistryHealth()` e `ServerClaimsObservation` produzido por `observeServerClaims()`. Ele não instancia Registry, não inicia Runtime, não modifica modo operacional e não chama router, shell ou DOM.

A projeção resolve um problema específico: quando uma página/módulo está quebrada, o botão da superfície normal deve ficar desabilitado; quando há evidência server-validated fresca com `module:read`, uma superfície operacional futura pode marcar a área para revisão elevada. Essa marcação é **review-only**: como o contrato de claims atual sempre retorna `decision: not-authorized` e `authority: not-authorized`, o adapter nunca libera acesso por si só.

## 2. Estados projetados

| Campo | Valores | Regra |
|---|---|---|
| `button` | `enabled` / `disabled` | Só `mode=healthy` e `status=healthy` habilitam o botão |
| `normalUserAction` | `preserve-current-surface` | Sempre preservado; o adapter não troca rota nem shell |
| `fallback` | `v1-preserved` | Sempre preservado no piloto |
| `elevatedReview` | `unavailable` / `review-only` | `review-only` exige claims confiáveis, autenticados, frescos e scope `module:read`; não é autorização |
| `authority` | `not-authorized` | Constante obrigatória |
| `publicPromotionAllowed` | `false` | Constante obrigatória |

Módulos `degraded`, `quarantined`, `maintenance`, `disabled`, `registered`, `unregistered` ou com health inconsistente produzem `button: disabled`. O estado `healthy` sem claims válidos pode habilitar a observação de uma superfície já existente, mas nunca produz review elevado.

## 3. Reasons bounded

O resultado deve usar somente reasons bounded:

- `module-healthy`;
- `module-degraded`;
- `module-quarantined`;
- `module-maintenance`;
- `module-disabled`;
- `module-unregistered`;
- `module-not-ready`;
- `claims-missing`;
- `claims-stale`;
- `claims-untrusted`;
- `module-read-scope-missing`;
- `review-only-observation`.

Mensagens de erro, IDs de usuário, tokens, roles, metadata, request IDs e stack traces não entram na projeção.

## 4. Invariantes de segurança

O adapter não confia em role local, `localStorage`, query string, atributo DOM, nome de usuário ou metadata editável. O escopo aceito deve vir da observação server-validated e fresca. Mesmo com scope `module:read`, a saída continua `authority: not-authorized` e `publicPromotionAllowed: false`.

Quarentena e overrides `maintenance`/`disabled` continuam pertencendo ao `module-registry-health.js`, que exige autorização server-side para mudanças. O novo adapter apenas lê a entrada final e a projeta para uma UI futura.

## 5. Testes obrigatórios

O piloto deve cobrir módulo saudável, degradado, quarentenado, maintenance, disabled, não registrado, health inconsistente, claims ausentes, claims stale/untrusted, scope ausente, scope `module:read`, constância de authority/promotion, ausência de IDs nos reasons e preservação do fallback V1.

## 6. Fora do escopo e rollback

Não há alteração em `src/main.js`, `docs/nexus/dominios.json`, shell, sidebar, router, Auth, RLS, Supabase, Billing, Service Worker, versão ou release. Rollback é a reversão do commit local do adapter, testes e documentação.

— **Manus AI**
