# Relatório final — JARVIS Núcleo V7 na rota `/jarvis`

**Data:** 2026-08-22  
**Repositório:** [`Lucas-Belucci-Bellini/Projeto-Baluarte`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte)  
**Status:** integração publicada na `main`; release `v1.3.3` pública e verificada  
**SHA final da `main`:** `94b97432a646fbe6a138e653eb58c8633566ffe6`

> **Resumo executivo:** o visual JARVIS Núcleo V7 indicado pelo README deixou de ser apenas um HTML standalone e passou a compor a rota real `/jarvis`. A integração foi publicada diretamente na `main`, sem PR, sem force push e sem substituir o Mark XIII: o Mark XIII continua sendo o fallback resiliente. A versão `1.3.3` foi criada somente depois de os gates, a CI remota, as tags, o Desktop Release e os oito assets públicos serem verificados.

## Resultado entregue

A rota real `/jarvis` agora monta o visual do artefato local `project V2/Modelar objeto 3D/jarvis-nucleo-v7.html` dentro de um iframe same-origin. O visual observado no navegador contém o astrolábio 3D dourado, anéis, partículas, controles locais e temas próprios do V7. O chat, as sessões, os modos de IA, a memória, o Spotify read-only, a observação do Runtime e os listeners existentes continuam na página principal.

O console Mark XIII permanece montado como fallback durante `loading` e em qualquer `error` do frame. Em `ready`, o V7 torna-se visível e o Mark XIII é ocultado. O `dispose()` remove listeners, navega o frame para `about:blank` e restaura o fallback. Uma falha do artefato visual não derruba a rota nem esconde o chat.

## Linha de commits publicados

| Marco | SHA | Resultado |
|---|---|---|
| Reconciliação documental da 1.3.2 | `1265ac01eb8cd1253386680d61d785e7b794ffd5` | Publicado antes do slice V7 |
| Integração funcional V7 | `6d62a0ce812625680d973d961e181e32a4eb8c07` | Publicado na `main`; 8/8 workflows verdes |
| Versionamento e preparação 1.3.3 | `57e2adb08b5a5c6b9142da069a8ab12597bc8030` | Publicado na `main`; 8/8 workflows verdes |
| Tags | `v1.3.3` e `desktop-v1.3.3` | Ambas apontam para `57e2adb08b5a5c6b9142da069a8ab12597bc8030` |
| Reconciliação final de release | `94b97432a646fbe6a138e653eb58c8633566ffe6` | `main` final; CI documental verde |

A branch local e `origin/main` terminaram alinhadas no SHA `94b97432a646fbe6a138e653eb58c8633566ffe6`.

## Decisão arquitetural

O artefato V7 não foi copiado para dentro da implementação TypeScript do chat. Foi criado o adaptador `src/utils/jarvis-v7-visual.ts`, que compõe o artefato visual e mantém uma fronteira explícita entre a superfície gráfica standalone e o estado operacional do JARVIS.

| Regra | Implementação |
|---|---|
| Origem | A URL aceita deve ser exatamente o caminho local same-origin `/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html` |
| Frame | `loading="eager"`, título explícito, `referrerPolicy="no-referrer"` |
| Sandbox | `allow-scripts allow-same-origin` |
| Capacidades não concedidas | Nenhum `allow="microphone"`, nenhum `allow="autoplay"`, nenhum formulário, popup, download ou navegação superior |
| Estado | `loading`, `ready` ou `fallback`, bounded e observável no DOM |
| Fallback | Console Mark XIII existente, sem segundo estado operacional JARVIS |
| Dados não transferidos | Tokens, Client Secret, claims, roles, permissões, chat, sessão e áudio Spotify |
| Autoridade | `runtimeAuthority: not-authorized` e `publicPromotionAllowed: false` preservados |

O contrato completo está em [`JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md`](JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md). A observação visual browser está em [`JARVIS_V7_BROWSER_OBSERVATION_2026-08-22.md`](JARVIS_V7_BROWSER_OBSERVATION_2026-08-22.md).

## Arquivos alterados no slice funcional

| Arquivo | Papel |
|---|---|
| `src/utils/jarvis-v7-visual.ts` | Adaptador de composição, validação de URL, lifecycle, estado e fallback |
| `src/pages/jarvis.ts` | Montagem do V7 junto ao Mark XIII sem remover chat, Spotify, sessões ou observabilidade |
| `src/styles/fase19.css` | Layout responsivo da composição V7/fallback |
| `scripts/v2-integracao.mjs` | Jornada browser da aplicação real `/#/jarvis`, separada das 20 rotas do harness V2 |
| `test/v2/jarvis-v7-visual.test.js` | Teste focal de URL same-origin, origem externa e protocolos inválidos |
| `docs/v2/JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md` | Contrato, segurança, testes e rollback |
| `docs/v2/JARVIS_V7_BROWSER_OBSERVATION_2026-08-22.md` | Evidência visual bounded da rota real |
| `README.md` | Declaração de que o V7 compõe `/jarvis` e Mark XIII é fallback |

Os arquivos canônicos do V7 — `jarvis-nucleo-v7.html`, `jarvis-nucleo-v7.ts` e `jarvis-nucleo-v7.js` — não foram alterados.

## Validação local

A primeira execução do lote pós-bump teve um falso vermelho temporal na integração V2: o harness encontrou uma porta stale e o navegador não recebeu o DOM esperado, produzindo timeout no seletor `#nav` e falhas cascata nas primeiras asserções. Nenhum código foi alterado para mascarar esse evento. As portas 4193, 4194 e 4195 foram limpas conforme o procedimento operacional documentado, e a execução isolada posterior passou `56/56`.

A suíte integral também teve uma primeira execução anterior com timeout isolado de 120 ms em `test/v2/runtime-stdio.test.js`. O teste isolado passou `12/12` e a execução integral seguinte passou `1262/1262`. O timeout não foi tratado como regressão do V7 e não houve aumento artificial de timeout ou relaxamento de contrato.

| Gate local | Resultado observado |
|---|---|
| Teste focal V7 | `4/4` |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | `1262/1262` na execução integral confirmatória |
| `npm run build` | Verde; warning conhecido de chunks acima de 500 kB permaneceu explícito |
| `npm run v2:integracao` | `56/56` após limpeza de portas |
| `npm run smoke` | `99/99` rotas verdes |
| `npm run caminho-critico` | `15/15` |
| Runner oficial | 20 gates de código com código 0 |
| Rust local | `blocked-known`, código 101, por incompatibilidade do Cargo local com `edition2024`; não foi convertido artificialmente em sucesso |

O smoke gerou relatórios temporários com timestamps e títulos corrompidos pela execução local; esses arquivos foram restaurados e não entraram no commit de versionamento.

## CI remota do commit funcional

O commit funcional `6d62a0ce812625680d973d961e181e32a4eb8c07` passou nos oito workflows aplicáveis:

| Workflow | Run |
|---|---:|
| Arma 3 Data CI | [`32597066383`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066383) |
| CI | [`32597066387`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066387) |
| CodeQL | [`32597066361`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066361) |
| Core CI | [`32597066396`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066396) |
| V2 Core | [`32597066405`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066405) |
| V2 Runtime | [`32597066425`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066425) |
| V2 Validation | [`32597066452`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066452) |
| Vigia das rotas | [`32597066384`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597066384) |

O gate do V2 não foi misturado com o harness: as 20 rotas do harness continuam sendo avaliadas separadamente, e a jornada `/jarvis` abre uma segunda página da aplicação real para validar V7, chat, configuração, fallback e ausência de erros JavaScript.

## CI remota do versionamento 1.3.3

O commit `57e2adb08b5a5c6b9142da069a8ab12597bc8030` passou nos oito workflows aplicáveis:

| Workflow | Run |
|---|---:|
| Arma 3 Data CI | [`32597791114`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791114) |
| CI | [`32597791146`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791146) |
| CodeQL | [`32597791136`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791136) |
| Core CI | [`32597791115`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791115) |
| V2 Core | [`32597791145`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791145) |
| V2 Runtime | [`32597791161`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791161) |
| V2 Validation | [`32597791127`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791127) |
| Vigia das rotas | [`32597791113`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32597791113) |

## Desktop Release e assets públicos

A tag `desktop-v1.3.3` acionou o Desktop Release [`32598087385`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/32598087385), concluído com sucesso em Windows, macOS ARM64 e Ubuntu. O workflow verificou a versão `1.3.3` do `desktop/package.json` e publicou os instaladores e manifests.

A release pública [`v1.3.3`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v1.3.3) não é draft nem prerelease e foi publicada em `2026-08-22T20:58:11Z`. Os oito assets responderam HTTP 200.

| Asset | Tamanho verificado |
|---|---:|
| `Baluarte-Launcher-Setup-1.3.3.exe` | 644.016.545 bytes |
| `Baluarte-Launcher-Setup-1.3.3.exe.blockmap` | 669.511 bytes |
| `Baluarte-Launcher-1.3.3.AppImage` | 773.768.798 bytes |
| `Baluarte-Launcher-1.3.3-arm64.dmg` | 406.610.336 bytes |
| `Baluarte-Launcher-1.3.3-arm64.dmg.blockmap` | 424.867 bytes |
| `latest.yml` | 363 bytes |
| `latest-linux.yml` | 386 bytes |
| `latest-mac.yml` | 363 bytes |

Os manifests públicos declararam `version: 1.3.3` e os seguintes SHA-512 base64:

| Manifest | SHA-512 |
|---|---|
| `latest.yml` | `03Fl5O9y0ZHGsktkIGvoWQSWsQekqRN7G5CycD5ztETz3a4C86Kna3aHAMyjsmGnjwAVFJNR/77rgpIbjW94sw==` |
| `latest-linux.yml` | `N9WXZ/T8yJn4Kd/eyvC5Y4o7eEKhPMBZbr8s4d5nE+ZcHJKks3Taw7QYGT4C9n3WtKOLFjz7h5jAdudK55JDzA==` |
| `latest-mac.yml` | `CsbY4dDSzqqGO9IUu0fd9lxqBYlpb9BpydLrgjkoqsOO1NfOMBCiKMDmpMbyD5gS1GS66ErWSx8lfLIAvel7ig==` |

O Service Worker usa a chave `baluarte-v1.3.3`. A nota de release detalhada está em [`docs/releases/v1.3.3.md`](../releases/v1.3.3.md).

## Segurança e limites

Esta entrega é visual e local. O iframe não recebe credenciais, tokens, Client Secret, claims, roles, conteúdo de conversa, sessão ou autoridade operacional. O sandbox não habilita microfone ou autoplay. Os controles `música`, `ficheiro`, `microfone`, `pulso`, `varrimento`, `dissecar`, `retrato`, `rotação`, `captura` e temas pertencem à superfície V7 e não foram conectados a playback Spotify, captura de áudio ou comandos do chat.

Spotify continua somente metadata read-only na aplicação principal. Nenhuma credencial Spotify foi adicionada ao repositório, ao frontend, ao iframe ou ao relatório. Não houve operação Supabase, DDL, migration, RLS, OpenClaw, WhatsApp, publicação externa, venda, pagamento ou envio de mensagens.

## Autenticação e publicação

A tentativa inicial de push do commit documental `1265ac01` falhou com credencial GitHub inválida (`Invalid username or token`). O histórico local foi preservado; não houve force push, rebase destrutivo, troca de remoto ou perda de commit. Depois que a autenticação válida ficou disponível para o ambiente Git, os commits `1265ac01`, `6d62a0ce`, `57e2adb0` e `94b97432` foram publicados diretamente na `main`. Nenhuma senha ou token foi solicitado ou registrado no chat.

## O que não deve ser alterado sem necessidade

A montagem Mark XIII, `disposeMarkXiiiConsole()`, os listeners de Spotify e Runtime, o router V1, os wrappers JavaScript, os contratos de permissão deny-by-default, o Service Worker e os artefatos canônicos do V7 não devem ser reescritos para evoluir o visual. Qualquer mudança futura deve preservar o fallback, o isolamento do iframe e a separação entre observação visual e autorização.

O warning de chunks acima de 500 kB é conhecido e não foi escondido. O bloqueio Rust local é conhecido e não deve ser “resolvido” relaxando toolchain ou alterando a arquitetura apenas para produzir um número verde artificial.

## Rollback

A referência operacional anterior é a release pública `v1.3.2`. Um problema futuro deve ser corrigido por um novo commit, sem reescrever histórico. O rollback operacional pode retornar à `v1.3.2`; o conteúdo diferente não deve reutilizar `baluarte-v1.3.3` como chave do Service Worker. A retirada do adaptador, sua chamada, seus estilos e seus testes retorna a montagem direta do Mark XIII, mantendo os artefatos V7 standalone e o README intactos.

## Próximos passos ordenados

1. Continuar a V2 em slices verticais, sem declarar estabilidade geral apenas porque o visual V7 e a release 1.3.3 passaram.
2. Se o adaptador ganhar mais estados ou callbacks, acrescentar um harness DOM dedicado para testar artificialmente `load`, `error`, `dispose` e restauração do fallback.
3. Manter a jornada da rota real `/jarvis` separada do harness de 20 rotas da V2 e preservar a verificação de ausência de erros JavaScript.
4. Só iniciar integração real com OpenClaw, WhatsApp ou notícias depois de contrato, fake local, autenticação protegida, allowlist, limites, idempotência, auditoria e confirmação explícita para ações externas.
5. Não alterar Spotify para playback ou captura de áudio sem um novo contrato, consentimento explícito do usuário, revisão de permissões e testes de segurança.

## Documentos relacionados

| Documento | Finalidade |
|---|---|
| [`docs/releases/v1.3.3.md`](../releases/v1.3.3.md) | Nota pública da release e assets |
| [`JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md`](JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md) | Contrato técnico da composição V7/fallback |
| [`JARVIS_V7_BROWSER_OBSERVATION_2026-08-22.md`](JARVIS_V7_BROWSER_OBSERVATION_2026-08-22.md) | Observação browser da rota real |
| [`README.md`](../../README.md) | Estado público, roadmap e entrada do V7 |
| [`historico/CHANGELOG.md`](../../historico/CHANGELOG.md) | Linha histórica de commits e releases |
