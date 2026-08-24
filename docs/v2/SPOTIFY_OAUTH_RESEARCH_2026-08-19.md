# Pesquisa oficial Spotify — 2026-08-19

## Fontes consultadas

1. Authorization: https://developer.spotify.com/documentation/web-api/concepts/authorization
2. Authorization Code with PKCE Flow: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow
3. Get Playback State: https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback

## Achados

A documentação oficial indica que aplicações JavaScript no navegador, mobile ou desktop que não conseguem proteger um client secret devem usar Authorization Code with PKCE. O fluxo exige um code verifier de alta entropia, um code challenge derivado por SHA-256, autorização do usuário, troca do código por token e uso do access token nas chamadas.

Para acompanhar a reprodução atual do próprio usuário, o endpoint oficial é `GET https://api.spotify.com/v1/me/player`. O escopo mínimo indicado é `user-read-playback-state`. A resposta pode ser 200, 204, 401, 403 ou 429. O corpo pode informar `is_playing`, `progress_ms`, timestamp, item atual (faixa ou episódio), tipo de item e dispositivo. Resposta 204 deve ser tratada como ausência/estado desconhecido, não como pausa inferida.

A própria referência mostra políticas relevantes: manter o conteúdo Spotify na forma original, não sincronizar conteúdo Spotify e não transmitir conteúdo Spotify. A implementação do Baluarte deve guardar somente metadados mínimos do playback, não baixar nem reproduzir áudio via API e não enviar a música para modelos.

## Decisão arquitetural preliminar

A aplicação deve usar PKCE no navegador, estado/nonce anti-CSRF associado ao início do fluxo, redirect URI exata registrada, token de acesso mantido em memória quando possível e refresh token tratado com cuidado. A API externa deve ficar desativada por padrão até o operador fornecer `client_id`, cadastrar a redirect URI e concluir a autorização explícita.

A primeira integração deve ter apenas leitura de playback, sem `user-modify-playback-state`, sem playlists, sem biblioteca e sem perfil além do que a resposta de playback exigir. O polling deve ser moderado e interrompido quando a página não estiver visível; 401 deve revogar o estado local, 204 deve produzir `unknown`, 429 deve respeitar `Retry-After` e falhas de rede não devem ser convertidas silenciosamente em `paused`.
