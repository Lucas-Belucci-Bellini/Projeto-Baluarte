# Fase 17 — Spotify OAuth seguro, presença externa e reação visual do Núcleo

## Estado

**Implementado no código e desativado até opt-in do operador.** Nenhum Client ID real, token, conta Spotify ou connector externo foi ativado durante esta fase.

## Arquitetura adotada

A integração usa **Authorization Code with PKCE**, sem `client_secret` no navegador. O escopo padrão é somente `user-read-playback-state`, suficiente para consultar o playback atual. O botão da página `/jarvis` pede o Client ID público, calcula uma `redirect_uri` baseada na origem e no pathname atual e redireciona para a autorização oficial do Spotify.

O `state` e o `code_verifier` ficam somente em `sessionStorage` durante o retorno OAuth. O access token e o refresh token não são gravados em `localStorage`, no status global, em URL, em payload de conversa ou no repositório. Nesta primeira fatia os tokens permanecem apenas em memória; ao recarregar a página, o operador precisa autorizar novamente. Isso reduz persistência acidental e evita que o JARVIS tenha acesso permanente à conta.

Depois da troca do código, o monitor consulta `GET /v1/me/player` em intervalo mínimo de 15 segundos. O monitor pausa quando a aba está oculta, trata `204` como estado `unknown`, trata `401` como sessão inválida, respeita `Retry-After` em `429` e não tenta repetir erros de autenticação. O monitor envia apenas o header Bearer ao endpoint oficial; nenhum token entra no `BaluarteStatus`.

## Menor privilégio e limites

O JARVIS lê metadados e estado de reprodução. Ele não recebe áudio bruto, não usa microfone, não faz scraping cross-origin, não altera fila, não pausa, não pula faixa e não controla o player. Escopos de escrita como `user-modify-playback-state` não são solicitados.

A presença é normalizada no contrato existente `window.BaluarteStatus.jarvisMusic`, com `source: "spotify-api"`, `playback`, título, artista, posição, duração e horário de observação. O contexto é injetado na próxima conversa pelo helper central `getJarvisRuntimeContext`; não há turno automático de IA apenas porque uma faixa mudou.

## Reação visual 3D

A cena de produção do Núcleo (`src/utils/nucleo-scene.js`) lê somente o status musical global. Quando `playback` é `playing`, aplica uma reação deliberadamente sutil: aumento limitado da escala respiratória, pequena variação da rotação da constelação, aumento máximo de `0.10` no bloom e marcação interna `data-music-active="true"`. Ao pausar ou perder a sessão, a interpolação retorna suavemente ao estado normal. A preferência `prefers-reduced-motion` continua prevalecendo.

## Configuração operacional

1. Criar um app em [Spotify for Developers](https://developer.spotify.com/dashboard) e cadastrar exatamente a redirect URI exibida pela aplicação, normalmente `https://<domínio>/`.
2. Copiar somente o **Client ID público** para o controle `Presença musical externa` em `/jarvis`.
3. Confirmar a autorização solicitada pelo Spotify.
4. Validar no `/jarvis` que o estado muda para `SPOTIFY · ONLINE` e iniciar uma conversa nova.
5. Desconectar pelo mesmo controle; o monitor para e a presença fica sem playback externo.

O Client ID não é segredo, mas ainda assim não deve ser confundido com access token ou client secret. Client secret não deve ser colocado no frontend, no GitHub, no `localStorage` nem em prompt.

## Teste ponta a ponta

`test/v2/jarvis-spotify.test.js` valida, com transporte fake e sem conta real:

- PKCE com `S256`, `state` e escopo mínimo;
- troca de código sem client secret;
- playback `200` com faixa e artista;
- publicação no registro único de presença;
- presença no contexto que alimenta as conversas do JARVIS;
- resposta `204` como `unknown` sem faixa antiga;
- tratamento de `401` e `429` com `Retry-After`;
- ausência de access token e refresh token no status musical;
- compatibilidade com o estado pausado já existente.

## Fontes oficiais consultadas

- [Spotify Authorization](https://developer.spotify.com/documentation/web-api/concepts/authorization)
- [Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Get Information About the User's Current Playback](https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback)

## O que permanece fora desta fase

Não há refresh token persistido, backend proxy, connector Spotify configurado, sincronização entre dispositivos, comandos de reprodução, coleta de áudio ou reconhecimento de melodia. A integração real depende de o operador cadastrar o app no Spotify e fazer o opt-in no navegador.
