# JARVIS Núcleo V7 — Contrato de integração visual

**Status:** implementado localmente; aguardando publicação e CI remota
**Data:** 2026-08-22
**Autor:** Manus AI
**Escopo:** integrar o artefato V7 apontado pelo README à página `/jarvis` sem remover o Mark XIII

## Diagnóstico

O README público aponta para `project V2/Modelar objeto 3D/jarvis-nucleo-v7.html`, cujo documento carrega `jarvis-nucleo-v7.ts` como fonte canônica do Vite e mantém `jarvis-nucleo-v7.js` como artefato standalone. A página atual `/jarvis`, por sua vez, monta `createMarkXiiiConsole()` dentro de `src/pages/jarvis.ts` e já conecta chat, sessões, Spotify, presença musical, observação de Runtime e fallback local.

O V7 é uma superfície visual standalone, com astrolábio 3D, controles de música/ficheiro/microfone, pulso, varrimento, dissecação, rotação, captura e temas. Ele é visualmente incompatível com a montagem interna do Mark XIII e não foi copiado inteiro para a página TypeScript do chat. A integração implementada é uma adaptação de composição que carrega o HTML V7 dentro de um iframe same-origin, mantendo o Mark XIII montado como fallback local.

## Contrato de montagem

`createJarvisV7Visual(options)` recebe a URL relativa do artefato, o elemento Mark XIII de fallback e uma callback de estado. O adaptador criará um contêiner acessível, um iframe com `title` explícito, `loading="eager"`, `referrerpolicy="no-referrer"` e `sandbox="allow-scripts allow-same-origin"`. Não haverá `allow="microphone"` nem `allow="autoplay"` implícitos.

O fallback Mark XIII será exibido inicialmente, enquanto o iframe carrega. Em `load`, o V7 será exibido e o fallback ocultado; em `error`, o V7 será ocultado e o fallback continuará visível. O estado visual será `loading`, `ready` ou `fallback`. O adaptador não altera chat, sessões, modo de IA, memória, Spotify OAuth, tokens, Runtime Authority ou permissões.

A URL padrão será `/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html`, com origem derivada do `location.origin`; nenhum endereço externo será aceito pelo construtor. A validação rejeitará URLs absolutas de outra origem, protocolos não HTTP(S), `javascript:`, `data:` e valores vazios. O arquivo standalone continuará acessível pelo link do README e não será substituído.

## Segurança e comportamento

Este slice é visual e local. O iframe não recebe credenciais, tokens, Client Secret, claims, roles ou conteúdo de conversa. O sandbox não habilita formulários, navegação superior, popups, downloads ou captura de áudio. O V7 pode apresentar controles locais próprios, mas eles não controlam a reprodução do Spotify e não se tornam comandos do chat. A presença Spotify existente do Mark XIII permanece fora do iframe e continua read-only.

O adaptador implementado não usa `innerHTML`, `any`, `@ts-ignore`, `@ts-nocheck`, novo Event Bus ou um segundo estado JARVIS. A integração deverá manter `runtimeAuthority: not-authorized` e `publicPromotionAllowed: false`. A falha de carregamento não poderá derrubar a rota nem esconder o chat.

## Testes e observabilidade

O teste focal implementado prova normalização da URL same-origin, rejeição de origem externa e protocolos inválidos. O gate browser prova a criação do iframe com sandbox/atributos esperados, a composição V7 + fallback, a transição observada no navegador e a preservação do chat. A parte de eventos artificiais de `load`/`error` permanece coberta pelo contrato e deve receber um harness DOM dedicado se o adaptador evoluir para controle de estado mais complexo.

O gate browser deverá verificar que `/jarvis` continua renderizando o chat e que o contêiner visual aponta para o V7. A integração deve aceitar tanto o estado `ready` quanto `fallback`, porque a disponibilidade de módulos/assets do navegador não pode transformar uma falha visual em falha global. O gate deverá confirmar que o Mark XIII ou o V7 existe e que a rota não expõe credenciais.

Deve ser acrescentada uma observação visual bounded no DOM, sem stack trace, com `data-visual-source="jarvis-nucleo-v7"` e `data-visual-state`. A observação não é health do Runtime nem autorização.

## Compatibilidade e rollback

O Mark XIII permanece como fallback e não será removido neste marco. O rollback é retirar o adaptador, sua chamada na página, testes e documentação, retornando à montagem direta já publicada. O artefato V7 standalone, os links do README e o código-fonte TypeScript do V7 devem permanecer intactos.

A validação local passou: teste focal do V7 `4/4`, typechecks `tipos:ts` e `tipos:v2`, suíte completa `1262/1262`, integração browser `56/56`, smoke `99/99`, caminho crítico `15/15` e runner oficial com 20 gates de código 0; Rust local permanece `blocked-known` código 101 por incompatibilidade do Cargo com `edition2024`. A primeira rodada da suíte teve um falso vermelho temporal isolado no Runtime stdio (`1/1262`) e a execução isolada e a rodada seguinte passaram; nenhuma alteração foi feita para mascarar o teste.

A próxima release incremental poderá ser `1.3.3`, somente depois do commit funcional na `main`, CI remota verde, Desktop Release e oito assets verificáveis. A V2 continuará sem declaração de estabilidade.
