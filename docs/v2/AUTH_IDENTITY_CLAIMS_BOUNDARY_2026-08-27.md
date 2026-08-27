# Auth Identity Claims Boundary — 2026-08-27

**Status:** implementação local em validação; não é autoridade Auth/RLS de produção
**Escopo:** fechar a projeção de identidade quando `issuer` ou `audience` não correspondem ao contrato esperado
**Não-escopo:** login real, sessão Supabase, RLS remoto, claims assinadas, persistência, tenancy ou promoção de módulo

## Causa observada

`observeServerClaims()` já calculava `issuerMatches` e `audienceMatched` ao decidir se os scopes poderiam ser aceitos. A projeção seguinte (`projectIdentityRelease()`) verificava fonte, autenticação, sujeito e frescor, mas não consumia explicitamente a correspondência de issuer nem de audience. Assim, uma observação construída com fonte declarada como validada, autenticação verdadeira, sujeito presente e timestamps frescos poderia chegar à projeção sem uma prova explícita de que issuer e audience eram os esperados.

## Decisão

A observação agora expõe `identity.issuerMatched`. A projeção exige simultaneamente `trustedSource`, `issuerMatched`, `audienceMatched`, `authenticated`, `subjectPresent` e `validity.fresh`. Se issuer ou audience forem incompatíveis, a projeção permanece `disabled`, adiciona `claims-untrusted` e mantém `publicPromotionAllowed: false`.

A validação continua sendo uma **projeção local deny-by-default**. Ela não autentica tokens, não consulta provedor externo e não concede autoridade server-side. A fonte `server-validated` é uma condição de contrato da fixture/teste; não deve ser aceita como claim confiável apenas por texto fornecido pelo cliente.

## Evidência

| Verificação | Resultado |
|---|---:|
| Teste focal `test/auth-identity-release.test.js` | 8/8 pass |
| Regressões adicionadas | issuer incompatível e audience incompatível permanecem disabled |
| Typecheck V2 | pass |
| GitNexus impact de `observeServerClaims` | risco `LOW`, epistemic `exact`, 0 consumidores upstream resolvidos |

## Segurança

Nenhum segredo, request remoto, Supabase write, migration, RLS, service role ou integração externa foi usado. O objetivo é impedir que a camada de projeção local trate claims estruturalmente incompletas como prontas; o aceite de produção continua bloqueado até haver autoridade server-side, validação de assinatura, sessão real, RLS e testes de ambiente.

## Rollback

Fazer `git revert` do commit da slice. O rollback remove o novo campo/guard e o teste, sem reset, force-push ou alteração destrutiva de histórico. Se a correção for revertida, o gap de correspondência issuer/audience deve voltar a ser marcado como aberto e não pode ser considerado seguro por ausência de falha observada.

## Próximo gate

Executar a suíte completa, Security Contracts, build, integração, smoke, offline, memória e Doctor. Só abrir PR após diff staged revisado e sem arquivos alheios. A PR deve permanecer draft até todos os checks aplicáveis e o status Vercel estarem verdes; a nova slice não autoriza remover o draft das PRs #526/#527 nem ativar Auth/RLS remoto.
