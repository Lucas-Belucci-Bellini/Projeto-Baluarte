# V2 — Contrato do Runtime desktop empacotado

**Status:** `LOCAL + CI VERIFIED` no escopo Linux `linux-unpacked`

**Marco:** `v2.0.0-alpha.18` — aceite do Runtime dentro do app Electron

**Código integrado:** `ca325d03fbddf77b43b64519ba2f69cdf4f07f4f`

## Objetivo

Este contrato fecha uma lacuna prática do Runtime desktop: provar que o processo Electron empacotado encontra o binário Rust e o transporte ESM por `process.resourcesPath`, em vez de funcionar apenas no checkout de desenvolvimento.

O teste usa a configuração real de `desktop/package.json`, produz um artefato `linux-unpacked` em diretório temporário e executa somente um entrypoint de smoke. O launcher normal, a URL remota, o router V1, o preload e os canais IPC de produção não são substituídos nem exercitados por um caminho alternativo.

## Caminho comprovado

```text
Electron app.isPackaged
→ resources/runtime/baluarte-runtime
→ resources/v2core/runtime-stdio.js
→ desktop/src/runtime.js
→ transporte ESM
→ processo Rust
→ authorize
→ read_file confinado
→ rejeição de ../
```

## Invariantes

| Invariante | Evidência exigida |
|---|---|
| O smoke só roda em app empacotado | `app.isPackaged === true` |
| O smoke não aceita override de binário | `BALUARTE_RUNTIME_BIN` ausente |
| O binário vem de `process.resourcesPath` | caminho observado coincide com `resources/runtime/<executável>` |
| O transporte acompanha o pacote | `resources/v2core/runtime-stdio.js` existe |
| O Runtime autoriza o módulo sintético | resposta `authorized` |
| A raiz confiável continua confinada | leitura de `alpha/hello.txt` retorna o conteúdo esperado |
| Escape de raiz não passa | leitura `alpha/../secret.txt` retorna `error` |
| O build não publica artefatos | `--publish never` e saída temporária |

## Comando canônico

```sh
npm ci
npm ci --prefix desktop
npm run v2:desktop-packaged
```

O comando é Linux-only nesta primeira versão porque usa `xvfb-run` e executa `linux-unpacked`. Ele constrói o bundle web, compila `v2/runtime` com Cargo release, empacota com Electron Builder e remove a saída temporária mesmo em falha.

## Fronteira de segurança

O teste não concede autoridade ao renderer, não cria canal IPC, não grava banco, não usa Supabase, não altera Auth/RLS, não aceita role vinda do cliente e não executa código externo arbitrário. O arquivo temporário de teste contém somente um módulo sintético e um arquivo local controlado. A permissão observada é `READ_FILES`, e a política de confinamento continua sendo a do Runtime Rust existente.

> Este contrato prova **localização e comunicação do Runtime no pacote**. Ele não transforma o Runtime local em autoridade de produção e não equivale a sandbox completo.

## Não-escopo

A slice não produz instaladores públicos, não modifica a publicação `desktop-release.yml`, não valida Windows/macOS físicos, não valida assinatura de código, auto-update, câmera, microfone, OAuth, persistência ou distribuição final. Também não altera a V1, o Service Worker, a sidebar, o router, o Event Bus, o Storage, Evidence, Auth, Supabase ou RLS.

## Rollback

O rollback primário é reverter o squash merge da PR #510. A referência de backup anterior ao merge é [`backup/2026-08-26-before-v2-packaged-runtime`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/backup/2026-08-26-before-v2-packaged-runtime), no SHA anterior `0c85f35a5266945ed347ab87ed607b669363271a`. O rollback remove somente o comando, o workflow e os entrypoints de smoke; não exige cleanup remoto porque a execução é local, temporária e read-only sobre serviços externos.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/510 "PR #510 — Runtime empacotado"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/33021833916 "Workflow PR — V2 Desktop Packaged Runtime"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/actions/runs/33022206259 "Workflow pós-merge — V2 Desktop Packaged Runtime"

— **Manus AI**
