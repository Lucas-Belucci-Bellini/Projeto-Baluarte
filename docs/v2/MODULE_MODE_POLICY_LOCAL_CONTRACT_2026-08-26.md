# Module Mode Policy — contrato fake server-side local

**Status:** `IMPLEMENTED LOCALLY — NO REMOTE AUTHORITY`
**Versão:** `module-registry-mode-policy/v1`
**Data:** 2026-08-26
**Escopo:** fixture determinística para testar a fronteira de decisão dos modos do Module Registry antes de Supabase/RLS

## Objetivo

Este contrato fecha uma etapa segura da lacuna `MODULE-RBAC-001`: exercitar localmente a passagem de uma identidade server-side conhecida para o callback `authorize` consumido por `criarModuleRegistryHealth()`. A implementação é uma fixture de teste, não um provedor de identidade, não autentica usuários e não concede autoridade ao navegador.

A fixture existe para tornar observável a matriz de decisões `allow`/`deny` antes de qualquer staging. Ela é in-memory, deterministicamente reproduzível, sem rede, storage, token, JWT, claim, secret, Supabase, RLS ou efeito operacional no módulo.

## Identidades fechadas

A fixture expõe exatamente quatro identidades e não aceita cadastro dinâmico:

| ID | Papel | Origem |
|---|---|---|
| `fixture-user` | `user` | `server-test-fixture` |
| `fixture-admin` | `admin` | `server-test-fixture` |
| `fixture-dev` | `dev` | `server-test-fixture` |
| `fixture-owner` | `owner` | `server-test-fixture` |

O catálogo de papéis é o mesmo contrato já aprovado para a projeção de identidade: `user`, `admin`, `dev` e `owner`. O campo `actorRole` presente em um request é tratado como dado não confiável e nunca substitui o papel selecionado pela fixture server-side.

## Matriz local de decisão

A matriz abaixo é específica da fixture e não é uma política de produção. Ela foi escolhida para cobrir os quatro papéis e manter a alteração de modo mais sensível (`disabled`) fora do papel `dev`:

| Papel | `active` | `maintenance` | `disabled` | Aprovador fixture |
|---|---:|---:|---:|---|
| `user` | deny | deny | deny | — |
| `dev` | allow | allow | deny | `fixture-admin` |
| `admin` | allow | allow | allow | `fixture-owner` |
| `owner` | allow | allow | allow | `fixture-owner` |

Toda decisão `allow` exige `id` de módulo, modo válido, motivo não vazio e `requestId` não vazio. A resposta inclui `actorId`, `actorRole` e `approvedBy` derivados da identidade fechada, no formato aceito pelo contrato auditado do Module Registry Health. Uma decisão `deny` devolve somente razão bounded e, quando válido, o `requestId` do pedido.

## Razões bounded

As razões negativas são limitadas a `identity-unknown`, `request-invalid`, `module-id-missing`, `mode-invalid`, `reason-missing`, `request-id-invalid` e `role-mode-denied`. Nenhuma razão inclui token, subject, URL, stack trace, segredo ou payload arbitrário.

## Integração segura

`authorizeAs(identityId)` devolve um callback fechado sobre a identidade server-side da fixture. O callback pode ser passado a:

```js
criarModuleRegistryHealth(registry, runtimeHealth, {
  requireAudit: true,
  audit,
  authorize: policy.authorizeAs('fixture-admin'),
});
```

A fixture somente produz a decisão. O adaptador canônico continua responsável por validar módulo registrado, modo, motivo, `requireAudit`, sink, idempotência, retenção bounded e aplicação local do override. Uma aprovação da fixture não significa que o browser pode mudar modo, nem que a autoridade de produção existe.

## Invariantes

O contrato mantém as seguintes invariantes:

| Invariante | Evidência |
|---|---|
| Quatro identidades, sem expansão dinâmica | `identidades()` retorna quatro registros congelados |
| `user` não pode mudar modo | três decisões `deny` no teste focal |
| `dev` não pode desabilitar módulo | `role-mode-denied` para `disabled` |
| `admin` e `owner` cobrem os três modos | casos allow para cada modo |
| Papel do request não eleva autoridade | spoof de `actorRole: owner` em `fixture-user` permanece deny |
| Decisões e identidades são defensivas | respostas/arrays congelados e cópias ao ler |
| Sem efeitos externos | implementação não importa rede, storage, provider ou token |
| Compatível com auditoria do adaptador | integração focal com `requireAudit: true` e ledger |

## Verificação

O comando operacional é:

```text
npm run check:module-mode-policy
```

A saída esperada nesta versão é `4` identidades, papéis `user/admin/dev/owner`, `6` casos de matriz, `3` decisões allow, `3` decisões deny e spoof negado. O teste focal `test/v2/module-registry-mode-policy.test.js` passa `8/8` e cobre também requests inválidos, identidade desconhecida, resposta congelada e integração com Module Registry Health.

## Não-escopo

Esta fixture não implementa login, cadastro, refresh, logout, OAuth, verificação de JWT, busca de claims, provider Auth, persistência, Supabase, SQL, migration, RLS, tenancy, ownership, service role, política distribuída, rede, retry, fila, restart ou mutação remota. Ela não altera o boot, router, sidebar, superfície V1, modo público ou autorização do navegador.

O aprovador `fixture-admin`/`fixture-owner` é apenas uma identidade sintética para testar o formato auditado; não representa usuários reais nem prova que a matriz de produção está aprovada. A integração real depende de staging separado, quatro identidades de teste isoladas, políticas RLS verificáveis, fixtures, cleanup idempotente, evidência de cada decisão, revisão de segurança e rollback aprovado.

## Gates desta slice

Antes do commit, a implementação passou `node --check`, teste focal `8/8`, `npm run check:module-mode-policy`, `npm run tipos:ts`, `npm run tipos:v2` e `git diff --check`. A suíte completa, build, integração V2, smoke, caminho crítico, offline, memória, Security Contracts e workflows remotos continuam gates obrigatórios para PR e publicação.

## Rollback

O rollback é o revert dos arquivos `v2/core/module-registry-mode-policy.js`, `scripts/module-mode-policy-check.mjs`, `test/v2/module-registry-mode-policy.test.js`, `package.json` e deste contrato. Como a fixture não executa rede, não grava dados nem altera schema, nenhum cleanup externo é necessário. O callback booleano legado de `criarModuleRegistryHealth()` permanece preservado após a reversão.

## Próximo passo autorizado

Sem aprovação explícita para staging, a próxima etapa continua sendo somente uma auditoria local ou documental da matriz. Nenhum claim client-side, service role, SQL, RLS ou write remoto deve ser introduzido por inferência a partir desta fixture.

— **Manus AI**
