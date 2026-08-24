# Contrato — `/jarvis` na web é o Núcleo, e só ele

**Data:** 2026-08-23
**Escopo:** o que a rota `/jarvis` entrega no navegador e o que ela entrega no app
**Implementação:** `src/pages/jarvis-nucleo.ts`, `src/main.js`, `src/utils/jarvis-v7-visual.ts`, `src/styles/fase19.css`
**Regra de origem:** #238 — web leve, app completo

## O defeito

A rota `/jarvis` era a maior violação viva do mega-plano #238. No navegador ela
montava a superfície inteira do JARVIS: seis modos de IA, sessões em IndexedDB,
memória e recall, skills, agente com ferramentas, barra de configuração — tudo
empilhado embaixo do Núcleo V7. O operador abriu o site e viu exatamente isso:
o núcleo 3D espremido no topo e um chat ocupando o resto da tela.

Nada disso pertence à web. É peso de boot, é superfície de ataque, e é
precisamente o que o app desktop existe para carregar.

## O contrato agora

| ambiente | o que `/jarvis` carrega |
|---|---|
| navegador (`window.baluarte.native` ausente) | `jarvis-nucleo.ts` — o Núcleo V7 em 3D ocupando a área de conteúdo, com as funções dele no canto, mais a doca de presença musical |
| Launcher (`window.baluarte.native === true`) | `jarvis.ts` — o JARVIS completo, inalterado |

São dois chunks distintos: o navegador não baixa mais o motor de IA que não
vai usar. O chunk da web mede **2,4 kB** contra os ~50 kB da página completa,
que por sua vez arrasta `jarvis-engine`, `jarvis-brain`, memória e recall.

As funções do núcleo — música, ficheiro, microfone, pulso, varrimento,
dissecar, retrato, rotação, captura e os três temas — já moram dentro do
artefato V7 e continuam ligando e desligando por lá, no canto superior direito.
Fora do iframe fica só a doca do Baluarte, no canto inferior esquerdo: estado
do Spotify, o botão de conectar e a faixa em reprodução quando houver.

O cockpit do Núcleo (`git-nexus-cockpit`, `git-nexus-nucleo`) continua abrindo
`jarvisPage()` na aba própria. Esse caminho é app-only e não muda.

## O que passou a ser verdade sobre o fracasso do V7

O evento `load` de um `<iframe>` conta apenas que o **documento** carregou. Se o
three.js não chega ou o WebGL não sobe, o documento carrega do mesmo jeito: o
pai marcava `ready` e exibia um retângulo com a frase `falha ao carregar
three.js`. Isso era tolerável quando o núcleo era um bloco no topo de uma
página cheia; virou inaceitável quando ele passou a ser a página inteira.

O artefato V7 agora avisa o desfecho por `postMessage`
(`{ source: 'jarvis-nucleo-v7', status: 'ready' | 'failed' }`), same-origin e com
`targetOrigin` fechado. `createJarvisV7Visual` escuta esse aviso — validando
origem, `event.source` e a etiqueta — e troca para a referência estática quando
o arranque falha. O `load` do iframe segue valendo como sinal otimista; quem
sabe a diferença entre "pronto" e "falhou" é a mensagem.

## Presença musical num clique

O Client ID público do app `Baluarte JARVIS` passou a viver no código
(`SPOTIFY_PUBLIC_CLIENT_ID`, em `src/utils/jarvis-spotify.ts`), com
`VITE_SPOTIFY_CLIENT_ID` mantendo precedência. O detalhe do porquê está no
contrato do Spotify; o efeito aqui é que a doca da web cumpre a promessa "um
clique e conectou" sem pedir configuração a ninguém.

O que **não** mudou: escopo `user-read-playback-state`, PKCE/S256, nenhum Client
Secret no navegador, access token e refresh token só em memória, e nenhum
comando de reprodução. A doca mostra título e artista quando o Spotify os
publica — e nada quando não publica, em vez de inventar estado.

## Verificação

`test/v2/jarvis-nucleo-web.test.js` cobra o contrato: a rota escolhe a página
por ambiente, a página web não importa nenhum módulo do motor de IA, o Núcleo é
montado e desmontado na saída da rota, a doca conecta num clique sem comando de
reprodução, e o Client ID embutido é um identificador público válido — nunca uma
chave `spak_` nem um segredo.

Observação de navegador feita nesta sessão, em `vite preview` com a CDN do
three.js bloqueada: a rota renderiza `page-nucleo`, sem `.jarvis-chat` e sem
`.jv-sessions`, o visual ocupa 798 px de altura e `data-visual-state` termina em
`fallback` — exatamente o caminho novo de falha, exercitado por acidente.
