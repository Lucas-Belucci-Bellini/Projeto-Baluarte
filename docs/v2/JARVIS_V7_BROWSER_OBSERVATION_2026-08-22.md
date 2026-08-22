# Observação browser — JARVIS Núcleo V7 integrado

**Data:** 2026-08-22
**Ambiente:** servidor local Vite em `http://127.0.0.1:4195/#/jarvis`
**Objetivo:** confirmar visualmente que a rota real `/jarvis` usa o artefato V7 apontado pelo README, sem perder o chat ou a superfície V1.

## Evidência observada

A aplicação real abriu na rota `/jarvis` com sidebar, header, controles de configuração, presença Spotify, lista de sessões, área de conversa e campo de mensagem preservados. O contêiner visual carregou o iframe local do `jarvis-nucleo-v7.html`; a tela exibiu o astrolábio 3D dourado do V7 com partículas, anéis orbitais, título J.A.R.V.I.S. e controles `música`, `ficheiro`, `microfone`, `pulso`, `varrimento`, `dissecação`, `retrato`, `rotação`, `captura` e temas.

O Markdown extraído do iframe identificou `#stage`, canvas e os controles do V7. A captura visual principal mostrou o núcleo 3D dourado ocupando a área central da aplicação, enquanto o chat continuou abaixo da composição visual. O estado de reprodução Spotify permaneceu `SPOTIFY · OFF` no contexto local, sem credencial ou token visível.

## Resultado

A integração visual real está funcional no ambiente local observado. O V7 substitui visualmente o Mark XIII quando o iframe dispara `load`; o Mark XIII continua montado como fallback no mesmo contêiner. O teste browser automatizado confirmou a composição e não registrou erro de JavaScript.

Esta observação não comprova microfone, Spotify externo ou desempenho em hardware do usuário. Esses comportamentos continuam condicionados às permissões do navegador, ao Client ID público e ao ambiente externo, conforme o contrato [`JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md`](./JARVIS_V7_INTEGRATION_CONTRACT_2026-08-22.md).

## Capturas

As capturas ficam no ambiente de execução do agente; o resultado determinístico que deve ser repetido é o gate `npm run v2:integracao`, que valida a estrutura e a ausência de erros. Nenhuma imagem foi copiada para dentro do repositório como asset de produção.
