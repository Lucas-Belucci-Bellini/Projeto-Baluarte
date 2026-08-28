# Event Bus Envelope Integrity — contrato local

## Estado

- **Slice:** validação estrutural read-only do envelope público do Event Bus.
- **Base:** `origin/main` em `6ba7875a5746bbc10bb66e6b8d3fa8d103e43267`, após a integração da PR #530.
- **Branch:** `v2/evidence-history-integrity`.
- **Status local:** implementado e focalmente testado; a PR ainda não foi criada neste momento.
- **Próximo estado esperado:** abrir uma PR draft somente depois dos gates locais completos e da revisão staged.

## Objetivo e causa

O Event Bus já produz envelopes com `id`, `evento`, `origem`, `correlacao`, `causa`, `versao`, `em` e `contexto` opcional. Antes desta slice não havia um projetor/validador estrutural público para diagnosticar se um envelope preservava esse contrato sem executar handlers, alterar o bus ou avaliar o payload separado.

A slice adiciona `validarEnvelope(value)` em `v2/core/bus.js`. Ela retorna `{ valid, errors }`, congela a resposta e agrega recusas determinísticas para campos ausentes, tipos inválidos, versão não positiva, timestamp inválido e contexto que não seja objeto. O payload continua deliberadamente fora do envelope: ele é entregue como segundo argumento do handler e não faz parte do diagnóstico estrutural desta função.

## Escopo

A mudança é limitada a:

1. Expor uma função read-only de validação do envelope.
2. Validar `id`, `evento`, `origem`, `correlacao`, `causa`, `versao`, `em` e `contexto`.
3. Provar que a validação não altera o envelope e não exige ou copia `payload`.
4. Preservar todas as superfícies existentes de `criarBus`, `emit`, `derivar`, `saude`, `contagem`, `inscricoes` e `limpar`.

## Não escopo e limites

Esta slice não valida schemas de payload, não rejeita eventos durante `emit`, não cria retry, não altera readiness, não cria persistência, não cria autoridade, não modifica correlação/causa, não acessa rede, não usa Supabase/RLS, não adiciona Auth/RBAC/tenancy, não inicia adapters externos e não altera a V1.

A validação é diagnóstica. Um resultado `valid: true` significa somente que a estrutura observada corresponde aos campos estruturais locais; não é prova de autenticidade, autorização, origem confiável ou correção semântica do payload.

## Segurança e compatibilidade

A resposta não contém o payload nem cria cópia executável do envelope. `validarEnvelope` é read-only e retorna resposta e lista de erros congeladas. A função não registra segredos, não chama dependências externas e não concede permissões. A API antiga do bus permanece inalterada; a nova função é uma exportação adicional para diagnóstico e testes.

## Evidência local

- `npm run tipos:v2`: passou após o ajuste de narrowing JSDoc/TypeScript.
- `node --test test/v2/bus.test.js test/v2/bus-saude.test.js test/v2/bus-correlacao.test.js`: **53/53 testes passaram; 0 falhas; 0 cancelados; 0 skipped**.
- GitNexus: reindexação concluída no worktree; impacto de `EvidenceStore` não é relevante para esta slice. A alteração atual é restrita a `v2/core/bus.js` e ao teste de contrato do bus.
- Ambiente: sandbox usa Node `22.13.0`; o projeto declara Node `24.x`. O `npm install` reportou `EBADENGINE`; essa limitação deve permanecer explícita nos gates amplos.

## Rollback

O rollback é reversível por `git revert` do commit de integração desta slice, sem reset, force push ou alteração de proteção. A remoção da exportação e dos testes da slice restaura o comportamento anterior; nenhum dado remoto ou migration precisa ser revertido.

## Próximos gates

Antes da PR draft, executar os gates locais completos definidos pela governança: `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke`, `npm run caminho-critico`, `npm run prova-offline`, `npm run sonda-memoria`, testes de segurança e `npm run verify:v2`. Artefatos transitórios devem ser restaurados somente quando forem gerados por este worktree, e arquivos protegidos/alheios devem permanecer fora do staging.

A PR #529 continua independente e bloqueada pelo status externo do Vercel (`build-rate-limit`). Esta slice não faz rerun, deploy, upgrade, polling, schedule, webhook ou bypass para contornar esse bloqueio.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte Projeto Baluarte — repositório GitHub.
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/529 PR #529 — checkpoint documental Auth/claims.
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/530 PR #530 — Evidence Revision History, integrada no SHA base desta slice.
