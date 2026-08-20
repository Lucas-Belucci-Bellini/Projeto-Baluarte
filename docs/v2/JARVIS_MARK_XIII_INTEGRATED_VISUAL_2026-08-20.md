# JARVIS — Visual Integrado Mark XIII

**Data:** 20 de agosto de 2026  
**Status:** `PUBLICADO NO MAIN — GATES LOCAIS VERDES`
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch de entrega:** `main`  
**SHA do marco publicado:** `ecfa6b34e4ad949bc82072183ae8a50ada9bf585`
**Escopo:** rota real `/jarvis`, preservação do chat V1, Spotify, memória, modos de IA e artefato MPA V7

## Correção do diagnóstico

O problema identificado foi real: o site continuava montando a página TypeScript antiga do JARVIS, enquanto o visual Núcleo V7 existia somente como uma entrada MPA separada em `project V2/Modelar objeto 3D/jarvis-nucleo-v7.html`. Portanto, abrir `/jarvis` não mostrava o núcleo integrado ao shell Mark XIII apresentado na referência visual.

A correção não remove o V7 standalone. Em vez disso, a rota real `/jarvis` agora começa com um console visual integrado ao shell da página e mantém abaixo dele as capacidades já existentes: conversas, sessões, modos Local/WebLLM/Claude/Ollama/Hermes/Servidor/OpenClaw/Agente, memória, skills, ferramentas, gráficos e presença musical Spotify.

> A referência principal deste marco é o primeiro anexo do usuário: o JARVIS integrado ao ambiente Mark XIII/Baluarte, com telemetria, indicadores de núcleo/rede, status de versão, painel de energia, presença musical e selector de tema. O segundo artefato, o Núcleo V7 em tela cheia, continua sendo a entrada MPA 3D canônica de `1.2.6`.

## Implementação

| Camada | Alteração | Contrato preservado |
|---|---|---|
| Página real | `src/pages/jarvis.ts` monta `createMarkXiiiConsole()` antes do chat. | A rota `/jarvis` continua sendo a página V1 TypeScript canônica. |
| Console visual | `src/utils/jarvis-mark-xiii.ts` cria o painel integrado, canvas reativo, telemetria, status, clock e controles. | Nenhuma rota nova e nenhum segundo shell. |
| Animação | Canvas 2D desenha núcleo luminoso, anéis, partículas e conexões. | Loop possui `dispose()` para evitar acumulação ao trocar de rota. |
| Música | O botão do console reutiliza o botão Spotify já existente na página. | Somente metadados de playback; sem áudio externo e sem comandos de reprodução. |
| Tema | Os temas dourado, rosa e jade alteram a paleta do canvas e do console. | Preferência visual não concede autoridade nem permissão. |
| Acessibilidade | O canvas possui label, o status possui `aria-live`, e os controles são botões nativos. | `prefers-reduced-motion` reduz o loop visual e desativa efeitos CSS. |
| V7 standalone | `jarvis-nucleo-v7.html/.ts/.js` permanece como MPA validada. | Release `1.2.6` e seu contrato de empacotamento não foram quebrados. |

## Comportamento esperado na rota `/jarvis`

Ao abrir `/jarvis`, o usuário deve encontrar primeiro o console Mark XIII com os indicadores `NÚCLEO ONLINE`, `REDE OK` e `VERSÃO V1.2.6`. O painel de telemetria apresenta núcleo, rede, eventos, energia, telemetria, perfil, música e motor. O núcleo central é desenhado no canvas com rede de partículas e brilho dourado, e a barra inferior expõe a presença Spotify e os temas visuais.

O perfil exibido no painel acompanha o modo selecionado no bloco `Modos & Config`. A presença Spotify inicia em `ONLINE` ou `OFF` conforme o estado já existente e é atualizada pelo mesmo fluxo de conexão/desconexão usado pelo chat. Ao trocar de rota e voltar para `/jarvis`, o loop anterior é cancelado antes de uma nova montagem.

## Testes

O contrato estático `test/jarvis-mark-xiii-console.test.js` confirma que a página real monta o console integrado, que o estado é `integrated-v1`, que a superfície possui label semântico, animação, telemetria, presença musical e fallback de movimento. O contrato anterior `test/jarvis-v7-release.test.js` continua verde para os três artefatos V7 e para o empacotamento MPA.

A validação local executada neste marco passou no typecheck TypeScript, nos cinco testes direcionados do JARVIS, no smoke de **99/99** rotas, na suíte geral, no build e no caminho crítico **15/15**. O build mantém apenas os warnings conhecidos de chunks grandes, especialmente Three.js e os assets Arma 3.

## Limites e segurança

Este marco é uma integração visual e de apresentação. Ele não transforma o cliente em autoridade de acesso, não cria claims, não decide roles, não altera Auth/RLS, não escreve em Supabase, não ativa Billing e não promove módulos quebrados para usuários normais. A disponibilidade e os estados de health continuam seguindo os contratos V2 existentes.

O canvas não é uma captura estática da imagem de referência. Ele é uma superfície funcional reproduzida em código, com telemetria DOM, controles, tema, estado Spotify e limpeza do loop. O V7 standalone continua separado porque sua entrada MPA usa dependências Three.js e contratos próprios de release.

## Rollback

Para reverter somente este marco, remova o import e a montagem de `createMarkXiiiConsole()` de `src/pages/jarvis.ts`, remova `src/utils/jarvis-mark-xiii.ts`, retire o bloco `JARVIS · Console integrado Mark XIII` de `src/styles/fase19.css` e remova `test/jarvis-mark-xiii-console.test.js` e este documento. Não remova `jarvis-nucleo-v7.html`, `jarvis-nucleo-v7.ts`, `jarvis-nucleo-v7.js`, o contrato MPA ou as rotas V1.

Depois do rollback, execute `git diff --check`, `npm run tipos:ts`, `npm test`, `npm run build`, `npm run smoke` e `npm run caminho-critico`. A publicação segue diretamente no `main`, com backup branch e integração de qualquer push remoto concorrente antes do commit.

## Próximo marco

O próximo marco do JARVIS deve medir o custo real do console no navegador, comparar CPU/memória com o V7 standalone, ligar o estado de health do Runtime à telemetria sem inferir autoridade e validar o comportamento em dispositivos de menor capacidade. A ponte OpenClaw, Spotify, notícias e execução de ferramentas continua sujeita a opt-in, least privilege, confirmação explícita para ações externas e auditoria.
