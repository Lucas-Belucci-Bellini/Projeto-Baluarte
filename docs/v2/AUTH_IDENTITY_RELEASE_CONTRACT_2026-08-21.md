# Auth — Contrato local de release de identidade

**Versão:** `auth-identity-release/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** projeção de superfície normal ou revisão elevada por módulo, sem autenticar, decodificar JWT ou persistir dados
**Autor:** Manus AI

## Objetivo

Reaproveitar com segurança a intenção da branch `feature/login-cadastro` sem fazer merge de uma base histórica. O contrato define como uma identidade já observada pelo servidor pode projetar a superfície de um módulo. Ele não implementa login, cadastro, refresh, logout, OAuth, criação de usuário ou RLS remoto.

> O contrato não concede autoridade. Ele produz uma projeção read-only para que a UI saiba se mantém a superfície normal, desabilita o módulo para usuário comum ou oferece revisão elevada somente a roles administrativas observadas pelo servidor.

## Entradas

A função recebe `ServerClaimsObservation` já produzido pelo adapter server-side, evidência de role com `source: 'server-app_metadata'` e o modo operacional do módulo. A origem `user_metadata`, uma role entregue pelo browser ou qualquer fonte desconhecida não pode produzir acesso.

Os roles reconhecidos são exatamente `user`, `admin`, `dev` e `owner`. Roles desconhecidos são tratados como ausência de role. A lista não deve ser expandida por dados do cliente. Para módulos fora de `healthy`, a revisão elevada exige role `admin`, `dev` ou `owner` e scope observado `module:read` fresco.

Os modos de módulo são `healthy`, `degraded`, `quarantined`, `maintenance`, `disabled` e `unregistered`. Um modo desconhecido é projetado como `disabled`.

## Saída

```ts
interface IdentityReleaseProjection {
  contractVersion: 'auth-identity-release/v1';
  projection: 'normal-surface' | 'elevated-review-only' | 'disabled';
  role: 'user' | 'admin' | 'dev' | 'owner' | 'unknown';
  moduleMode: 'healthy' | 'degraded' | 'quarantined' | 'maintenance' | 'disabled' | 'unregistered';
  reasons: readonly IdentityReleaseReason[];
  decision: 'not-authorized';
  authority: 'not-authorized';
  publicPromotionAllowed: false;
}
```

`reasons` é bounded e pode conter somente `claims-missing`, `claims-untrusted`, `claims-stale`, `subject-missing`, `role-source-invalid`, `role-unknown`, `user-metadata-ignored`, `module-mode-unknown`, `module-degraded`, `module-read-scope-missing` e `user-module-disabled`.

## Regras

| Situação | Projeção |
|---|---|
| Claims server-validated ausentes, não autenticadas, não frescas ou sem subject | `disabled` |
| Role ausente, desconhecida ou proveniente de `user_metadata` | `disabled` |
| Identidade válida, role conhecida e módulo `healthy` | `normal-surface` |
| Módulo quebrado e role `user` | `disabled` |
| Módulo quebrado e role `admin`/`dev`/`owner`, com `module:read` fresco | `elevated-review-only` |
| Módulo quebrado e role elevada sem `module:read` | `disabled` |
| Modo desconhecido | `disabled` |

A projeção `normal-surface` não autoriza chamadas server-side. A projeção `elevated-review-only` não reativa o botão público, não permite mutação e não muda `runtimeAuthority`. Ela serve apenas para a camada de UI/harness representar que uma revisão administrativa pode ser apresentada em contrato futuro.

## Invariantes

`decision` e `authority` são sempre `not-authorized`; `publicPromotionAllowed` é sempre `false`; roles são aceitas somente da evidência `server-app_metadata`; `user_metadata` é ignorado; o contrato não decodifica JWT; não contém texto de prompt, subject, issuer, token, URL ou segredo na saída; e não executa rede, storage, provider ou efeitos colaterais.

## Testes obrigatórios

A suíte deve cobrir usuário em módulo saudável, usuário em módulo quarantined/degraded, admin/dev/owner com e sem `module:read`, role de `user_metadata` ignorada, source inválido, claims expiradas, modo desconhecido, claims ausentes e invariantes de autoridade/redaction.

## Rollback

Remover o contrato, a implementação, os testes e a auditoria do slice não altera a branch histórica, Auth, Supabase, RLS, bridge OpenClaw ou o router atual.

— **Manus AI**
