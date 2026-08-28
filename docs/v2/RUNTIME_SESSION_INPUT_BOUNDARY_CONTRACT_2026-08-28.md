# Runtime Session Input Boundary — contrato local

## Estado

- **Slice:** validação fail-closed da lista de módulos antes de abrir uma Runtime Session.
- **Base:** `origin/main` em `6ba7875a5746bbc10bb66e6b8d3fa8d103e43267`, após a integração da PR #530.
- **Branch:** `v2/runtime-session-input-boundary`.
- **Status:** implementação, testes focais e gates locais concluídos; pronta para revisão staged e PR draft.

## Objetivo e causa

`criarSessaoRuntime().abrir(modulos)` já validava o envelope de Runtime e a resposta do transporte, mas assumia que `modulos` era sempre uma lista válida. Uma entrada não-lista, vazia ou repetida alcançava a construção de grants ou falhava com erro genérico de execução. Isso não era uma fronteira explícita de segurança e permitia envelopes com grants repetidos quando o mesmo módulo aparecia duas vezes.

A slice valida a entrada antes de alterar o estado da sessão ou tocar no transporte. `modulos` deve ser uma lista; cada item deve ser texto não vazio; IDs repetidos são recusados com erro explícito. Entradas inválidas preservam a sessão em `closed`, não alteram `ultimoErro` e não incrementam envios ao transporte.

## Contrato e escopo

A função interna `validarListaModulos(value)` é usada exclusivamente pelo caminho `abrir()`. A lista original é preservada para o mapeamento de grants quando válida. A validação não normaliza, deduplica silenciosamente ou concede permissões; ela somente recusa entradas estruturalmente ambíguas.

Os testes focais cobrem abertura normal com permissões efetivas, lista não-array, item vazio, módulo repetido, resposta inválida, resposta válida, falha de transporte, fechamento idempotente e abertura concorrente já existente.

## Não escopo

Esta slice não implementa Auth/RBAC/RLS server-side, sessão assinada, expiração, refresh token, tenancy, ownership, lock distribuído, retry, persistência, IPC real, Tauri, Electron, Rust, OpenClaw, MCP, Hermes ou integração externa. O transporte continua injetado e experimental conforme o contrato existente.

A validação local não prova que um ID de módulo existe no Registry nem que uma permissão é autorizada em produção. A autorização efetiva continua sendo calculada pelo objeto `permissoes` injetado e o Runtime deve validar o envelope recebido na fronteira correspondente.

## Segurança e compatibilidade

A validação ocorre antes de `estado = 'opening'`, portanto entradas inválidas falham fechado sem tocar no transporte e sem transformar um erro de chamada em falha de sessão. A API anterior para listas válidas permanece a mesma. A V1 não foi modificada.

## Evidência local

- `npm run tipos:ts`: passou.
- `npm run tipos:v2`: passou.
- Teste focal Runtime Session: **7/7 passou; 0 falhas**.
- Suíte completa: **1395 pass, 6 skipped, 0 fail**.
- Build: passou; warning conhecido de chunks grandes.
- Integração V2: **58/58**.
- Smoke: **99/99 rotas verdes**.
- Caminho crítico: **15/15**.
- Prova offline: **9/9**.
- Sonda de memória: passou.
- Security Contracts: **73/73**.
- `verify:v2`: exit 2 honesto, sem falhas novas; Python opcional permanece `blocked-known`, Cargo `unknown` e gates read-only `not-run`.

O sandbox usa Node `22.13.0` enquanto o projeto requer Node `24.x`; o aviso `EBADENGINE` foi mantido explícito. O runner Node puro da Platform TypeScript não é relevante nesta slice; o teste Runtime Session executa diretamente em JavaScript.

## GitNexus e impacto

O GitNexus foi indexado antes da edição. O impacto de `criarSessaoRuntime` foi `LOW`, `exact`, com um consumidor upstream direto e nenhum processo ou módulo adicional resolvido. A revisão manual mantém a alteração restrita a `runtime-session.js`, seu teste e este contrato.

## Rollback

O rollback é um `git revert` do commit de integração da slice. A remoção de `validarListaModulos` e dos testes restaura o comportamento anterior para chamadas inválidas, sem migration, dado persistente, tag ou alteração de proteção.

## Bloqueios e release

A PR #529, #531 e #532 permanecem independentes e sujeitas ao bloqueio externo do Vercel com `Deployment rate limited — retry in 24 hours.`. Esta slice não executa rerun, deploy, upgrade, polling, schedule, webhook ou bypass. A alpha.22 ainda não foi publicada.

A futura PR deve permanecer draft até checks aplicáveis verdes, Vercel `success`, `mergeStateStatus=CLEAN` e `mergeable=MERGEABLE`.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte Projeto Baluarte — repositório GitHub.
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/v2/core/runtime-session.js Runtime Session — implementação na linha principal.
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/530 PR #530 — base integrada da slice.
