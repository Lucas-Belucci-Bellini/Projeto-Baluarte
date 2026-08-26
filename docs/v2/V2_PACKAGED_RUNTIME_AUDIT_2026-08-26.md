# V2 — Auditoria do Runtime desktop empacotado

**Data:** 2026-08-26

**Marco:** `v2.0.0-alpha.18`

**SHA final do código:** `ca325d03fbddf77b43b64519ba2f69cdf4f07f4f`

**PR técnica:** [#510](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/510)

## Resultado executivo

A lacuna do caminho empacotado foi fechada dentro do escopo declarado. O workflow remoto construiu o web bundle, compilou o Runtime Rust em release, empacotou o Electron usando a configuração real e executou o artefato Linux `linux-unpacked` sob Xvfb. O entrypoint de smoke confirmou que o binário e o transporte vieram de `process.resourcesPath`, que a autorização e a leitura confinada funcionam e que um caminho `../` é recusado.

A prova foi feita no PR e novamente após o merge. A versão local reproduziu o build web e todos os gates executáveis, mas não pôde compilar o Runtime porque o sandbox não possui `cargo`; portanto o smoke empacotado local ficou `blocked-known`/ambiental e não foi contado como verde local. O workflow remoto com toolchain Rust disponível é a evidência final do artefato.

## Evidência técnica

| Gate | Resultado | Observação |
|---|---:|---|
| `node --check` | passou | Entry point Electron e orquestrador do smoke |
| Teste focal `desktop-runtime` | `7 pass / 1 skipped` | Skip honesto do E2E local quando o binário não existe |
| `npm run tipos:ts` | passou | Sem alteração em strict/checkJs |
| `npm run tipos:v2` | passou | Contratos V2 preservados |
| `npm test` | `1385 pass / 6 skipped / 0 fail` | Suíte completa antes do merge |
| `npm run v2:integracao` | passou | Retry após limpeza confirmada de Vite stale nas portas 4193–4195 |
| `npm run build` | passou | Warning conhecido de chunks grandes |
| `npm run smoke` | `99/99` | V1 preservada |
| `npm run caminho-critico` | `15/15` | Jornada principal preservada |
| `npm run prova-offline` | `9/9` | Fallback preservado |
| `npm run sonda-memoria` | passou | Sem acúmulo observado |
| Security Contracts | `73/73` | Sem nova autoridade ou segredo |
| Project Registry | passou | Contrato local preservado |
| Module Mode Policy | passou | Fixture local preservada |
| Doctor | `16 green, 2 blocked-known, 1 unknown, 5 not-run, 0 failed` | Exit `2` honesto pelo Cargo não observável |
| Smoke empacotado local | não concluído | `cargo` ausente no sandbox; não mascarado |
| Workflow PR | sucesso | Run `33021833916`, job `98353816385` |
| Workflows pós-merge | `9/9` sucesso | Inclui run `33022206259` do smoke empacotado |

## Incidente operacional durante a validação

A primeira chamada local de `npm run v2:integracao` encontrou três previews Vite stale nas portas reservadas `4193`, `4194` e `4195`. Cada PID foi confirmado por `ps` como `vite preview`; dois pertenciam a uma worktree removida e um conjunto posterior ao próprio registry. Somente esses PIDs confirmados foram encerrados. A integração foi repetida com sucesso e os relatórios gerados foram restaurados ao estado tracked original antes do commit.

Não houve rerun indiscriminado, bypass, force push, alteração de proteção, commit vazio ou classificação de estado desconhecido como sucesso.

## Arquivos integrados

| Arquivo | Função |
|---|---|
| `desktop/src/packaged-runtime-smoke-main.js` | Entry point de teste que roda apenas em app empacotado com sinal explícito |
| `scripts/v2-packaged-runtime-smoke.mjs` | Orquestra build, Cargo, Electron Builder e execução Xvfb em diretório temporário |
| `.github/workflows/v2-desktop-packaged-runtime.yml` | Gate remoto isolado, read-only para o repositório e sem publicação |
| `package.json` | Comando `v2:desktop-packaged` |

## Limites residuais

A alpha.18 não é aceite físico multiplataforma. Windows e macOS continuam dependendo da matriz de distribuição e de validação de hardware/assinatura. O workflow não publica instaladores e não prova auto-update, OAuth, câmera, microfone, AppImage instalado, DMG, NSIS, persistência, Auth/RLS ou Runtime como autoridade de produção. O ambiente local continua sem Cargo observável.

A PR #501 permanece OPEN/DRAFT e isolada pelo histórico de rate limit externo do Vercel. A PR #471 permanece OPEN/DRAFT e intocada. Nenhuma delas foi rebased, marcada ready ou mesclada neste marco.

## Rollback

Reverter o squash merge da PR #510 retorna à alpha.17 no SHA `0c85f35a5266945ed347ab87ed607b669363271a`. O backup criado antes do merge é [`backup/2026-08-26-before-v2-packaged-runtime`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/backup/2026-08-26-before-v2-packaged-runtime). Nenhuma alteração externa persistente foi realizada.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/510 "PR #510 — Runtime empacotado"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/33021833916 "Run PR — V2 Desktop Packaged Runtime"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/33022206259 "Run pós-merge — V2 Desktop Packaged Runtime"
[4]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/releases/tag/v2.0.0-alpha.17 "Release anterior — alpha.17"

— **Manus AI**
