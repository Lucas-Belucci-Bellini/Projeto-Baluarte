# Release 1.1.0 — contrato de atualização e estado do JARVIS

**Estado:** implementação incremental em validação

**Decisão:** a linha pública `1.0.0` foi pulada. O próximo marco de produto é `1.1.0`.

**SHA de origem desta rodada:** `df2be23758ce1ff1f91a03233120fee199c1130d`

## 1. O que muda na 1.1.0

A versão `1.1.0` inaugura a linha pública posterior ao congelamento histórico da V1. Ela não é uma reescrita: a superfície V1, os wrappers JavaScript e o contrato de rotas continuam preservados enquanto a infraestrutura V2 e a migração TypeScript avançam por fatias pequenas.

A primeira fatia de monetização adicionada nesta rodada é o contrato `v2/data/billing.ts`. Ele representa planos configuráveis, entitlements, limites finitos ou ilimitados e um Usage Ledger append-only com idempotência. Nenhum provider de pagamento real, cobrança real ou segredo financeiro foi ativado.

## 2. Como o TypeScript se comporta durante a atualização automática

TypeScript não é executado como uma segunda plataforma no navegador. Os arquivos `.ts` são verificados durante o desenvolvimento e transformados pelo Vite em JavaScript bundleado, normalmente com nomes de assets contendo hash. O instalador e o navegador recebem o resultado compilado; a extensão `.ts` não precisa existir no runtime do usuário.

| Superfície | O que acontece na atualização |
| --- | --- |
| Site web | O Vite gera um novo bundle JavaScript. O Service Worker muda para `baluarte-v1.1.0`, instala o worker novo e remove caches antigos por nome exato. |
| Rotas V1 | Os wrappers `.js` continuam apontando para as implementações canônicas `.ts`; URLs e contratos públicos não precisam mudar. |
| Dados locais do JARVIS | IndexedDB e `localStorage` permanecem no mesmo origin. A atualização substitui código e assets, não apaga sessões, histórico ou configuração por causa da migração de extensão. |
| Launcher Electron online | O launcher continua carregando o `REMOTE_URL` do site, preservando o origin para não perder `localStorage` e dados do JARVIS. |
| Launcher Electron offline | Um novo instalador precisa ser construído com `npm run build` antes do empacotamento, para atualizar o fallback `dist` embutido. |
| Runtime Rust | O workflow compila o binário nativo de cada sistema operacional antes de gerar os instaladores. |
| Rollback | Reinstalar o instalador anterior retorna ao código anterior; dados locais só devem ser migrados de forma compatível e nunca apagados automaticamente. |

A regra operacional é: **mudança de código TypeScript é uma mudança de bundle, não uma migração automática de dados**. Se um schema persistido mudar, a alteração deve possuir versão, leitura compatível, teste de migração e rollback separado.

## 3. Contrato do Service Worker

`public/sw.js` é servido cru e, por isso, mantém manualmente `baluarte-v1.1.0`. O teste `test/versao.test.js` compara essa cópia com `package.json` e `src/data/version.js`. A mudança de chave é necessária para que o navegador instale o worker novo e não continue entregando assets antigos.

A limpeza continua usando a lista exata de caches da versão atual. Não deve ser substituída por uma comparação ingênua com `startsWith`, pois versões como `1.1.0` e `1.1.0-rc` podem compartilhar prefixos sem serem o mesmo cache.

## 4. Launcher e confirmação humana

O launcher permanece com `autoDownload = false`. Ao detectar uma release, ele informa o operador e pede confirmação antes do download; depois do download, pede confirmação novamente antes de `quitAndInstall()`. Essa política evita uma troca silenciosa do app em uso e permite que o operador recuse uma release que ainda não tenha sido validada localmente.

A release desktop precisa usar `desktop/package.json` na versão `1.1.0`, executar o build web antes do empacotamento e publicar artefatos compatíveis com `electron-updater`. O workflow `.github/workflows/desktop-release.yml` continua sendo disparado por `desktop-v*` ou manualmente.

## 5. Estado do JARVIS V7

Foi procurada uma branch, tag, issue ou artefato local com o nome explícito `JARVIS V7`. O repositório não apresentou uma branch ou tag com esse identificador. A issue #316 descreve a frente do Núcleo de IA 10x, e a issue #259 descreve a próxima release do launcher e o requisito de atualizar o fallback offline, mas nenhuma delas entrega um pacote identificável chamado JARVIS V7.

Portanto, esta rodada não finge ter aplicado um código V7 que não foi localizado. O JARVIS atual recebeu uma atualização segura e verificável: o perfil engenheiro passou a orientar TypeScript strict para código novo, sem `any` ou `@ts-ignore`, mantendo wrappers JavaScript somente nas fronteiras legadas. O cache de briefing e o orçamento de contexto existentes em `src/utils/jarvis-context.ts` continuam sendo a base da otimização leve.

Para aplicar uma implementação específica do V7, ainda é necessário fornecer o arquivo, branch, tag, PR ou commit exato. Sem essa referência, o rollback e a comparação antes/depois não seriam auditáveis.

## 6. O que não foi ativado

Esta release não ativa cobrança real, Stripe, Mercado Pago, webhooks financeiros, overage automático, payout, banco de produção, alteração de RLS, envio de WhatsApp ou publicação automática de notícias. A infraestrutura de billing começa por contratos puros e testes locais, como exige o master prompt.

## 7. Estado dos gates desta rodada

| Gate | Resultado | Observação |
| --- | --- | --- |
| `npm run tipos:ts` | verde | 0 erros |
| `npm run tipos:v2` | verde | 0 erros |
| `npm test` | verde | 977/977 testes passaram |
| `npm run build` | verde | apenas avisos históricos de chunks grandes |
| `npm run smoke` | verde | 99/99 rotas |
| `npm run v2:integracao` | verde | 19/19 |
| `npm run caminho-critico` | verde | 15/15 |
| `npm run v2:runtime` | bloqueado por ambiente | Cargo 1.75 não lê `Cargo.lock` versão 4; não foi feita edição artificial do lockfile |
| `desktop/npm ci --ignore-scripts` | verde com alerta | Node 22 local não atende o engine declarado 24.x; auditoria reportou 17 vulnerabilidades do ecossistema Electron, sem correção forçada nesta rodada |

O gate Rust não foi classificado como erro causado pelo billing, pelo JARVIS ou pelo bump de versão. É uma incompatibilidade entre a ferramenta disponível no sandbox e o formato do lockfile. A CI de release usa uma toolchain Rust própria e ainda precisa ser observada no SHA final antes de declarar a release pronta.

## 8. Rollback

O rollback do código consiste em retornar ao SHA anterior à promoção. O rollback do site deve permitir que o Service Worker antigo volte a ser servido com seus assets correspondentes. O rollback de dados não pode depender de apagar `localStorage` ou IndexedDB: os schemas persistidos devem ser mantidos compatíveis ou migrados de modo reversível.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/259 "Issue #259 — Próxima release do app"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/316 "Issue #316 — Núcleo de IA 10x"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/.github/workflows/desktop-release.yml "Workflow de release desktop"
