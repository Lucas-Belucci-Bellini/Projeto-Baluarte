# Contrato — JARVIS + Spotify Playback Presence

**Data:** 2026-08-22  
**Escopo:** autorização PKCE e leitura de presença musical externa  
**Implementação:** `src/utils/jarvis-spotify.ts`, `src/utils/jarvis-spotify-session.ts`, `src/utils/jarvis-mark-xiii.ts` e `src/pages/jarvis.ts`  
**Autor:** Manus AI

## Resultado da auditoria

A rota pública `/jarvis` já possui o console Mark XIII da referência visual: sidebar, barra Baluarte, núcleo central com órbitas/partículas, telemetria lateral, presença musical e chat. A falha observada não era uma API key de IA. O controle Spotify usa um **Client ID público**; não deve usar Client Secret no navegador.

O dashboard Spotify for Developers retornou `Something went wrong, we could not load this dashboard page. Try again later.` em duas visualizações consecutivas no Chrome conectado. Esse fato é classificado como `unknown/external`; não prova que o Client ID ou a Redirect URI estejam inválidos.

## Regras oficiais aplicadas

O Spotify recomenda Authorization Code with PKCE para aplicações single-page nas quais um client secret não pode ser armazenado com segurança.[1] O code verifier precisa ser uma string de alta entropia entre 43 e 128 caracteres; o cliente usa 64 caracteres e challenge SHA-256/S256.[1]

A `redirect_uri` usada na autorização e na troca do código precisa coincidir exatamente com uma entrada permitida no dashboard, incluindo maiúsculas/minúsculas e barra final.[1] Em produção, o contrato usa HTTPS; em desenvolvimento, HTTP fica restrito a IP loopback explícito como `127.0.0.1` ou `[::1]`, e `localhost` é rejeitado pelo validador.[2]

A integração solicita apenas `user-read-playback-state`, escopo que permite ler o estado atual do player e os dispositivos Connect, sem escopos de escrita ou controle.[3] O endpoint `GET /me/player` pode retornar 200, 204, 401, 403 ou 429; 204 significa que não há estado de playback utilizável e não deve ser convertido artificialmente em pausa.[4]

> “Do not synchronize Spotify content.” — Spotify, notas de política do endpoint Get Playback State.[4]

Por isso o JARVIS lê somente metadados bounded de playback, não captura áudio, não grava a música, não sincroniza conteúdo e não envia comandos de reprodução.

## Mudanças implementadas

O validador aceita Client IDs modernos com caracteres alfanuméricos, `_` e `-`, entre 20 e 128 caracteres. O `Client ID` público é memorizado apenas no `localStorage` do navegador para não exigir colagem repetida; access token e refresh token continuam somente em memória. O estado PKCE permanece em `sessionStorage` até a troca do código e nunca inclui Client Secret.

A sessão emite o evento local `baluarte:spotify-session` com somente `connected`, estado de playback e metadados de faixa. O console Mark XIII reage de forma sutil a `playing` e `paused`: o núcleo ganha uma pulsação controlada e a telemetria mostra `TOCANDO`, `PAUSADA` ou `ONLINE`. Essa reação não representa health, autorização, identidade ou permissão de módulo.

A página JARVIS preenche o Client ID salvo, atualiza o botão após conexão/desconexão e documenta que o redirect efetivo é `${location.origin}${location.pathname}`. O fluxo não lê nem armazena Client Secret.

## Configuração esperada

| Ambiente | Redirect URI a cadastrar no Spotify |
|---|---|
| Produção | `https://projeto-baluarte.vercel.app/` |
| Desenvolvimento Vite | `http://127.0.0.1:5173/` ou a porta efetivamente usada, se cadastrada como loopback |
| Teste local alternativo | `http://127.0.0.1:4173/` quando o preview usar essa porta |

A URI deve ser cadastrada exatamente com o caminho e a barra final efetivamente enviados pelo navegador. Se o deploy usar domínio customizado, o domínio customizado precisa ser cadastrado separadamente.

## Bloqueios

O dashboard Spotify ficou indisponível durante a auditoria; portanto, a existência do aplicativo, Client ID e Redirect URI não pôde ser confirmada por leitura remota. Nenhuma tentativa de login Spotify foi executada, nenhum campo foi salvo e nenhuma credencial foi modificada. A configuração real deve ser feita no dashboard quando ele voltar a responder, usando o Client ID público no campo da rota JARVIS e a Redirect URI exata no aplicativo Spotify.

## Testes

Os testes cobrem PKCE/S256, formato moderno do Client ID, rejeição de `localhost`, HTTPS de produção, loopback explícito, ausência de Client Secret, persistência somente do Client ID, state divergente, troca sem segredo, 204, 401, refresh em memória, 429 e metadados sem token. O teste focal deve ser executado com `npx tsx --test test/v2/jarvis-spotify-session.test.js test/v2/jarvis-spotify.test.js`.

## Referências

[1]: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow "Spotify — Authorization Code with PKCE Flow"

[2]: https://developer.spotify.com/documentation/web-api/concepts/redirect_uri "Spotify — Redirect URIs"

[3]: https://developer.spotify.com/documentation/web-api/concepts/scopes "Spotify — Scopes"

[4]: https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback "Spotify — Get Playback State"

## Correções finais desta onda

O Client ID agora aceita o formato alfanumérico público com `_` e `-`, entre 20 e 128 caracteres, mas rejeita explicitamente o prefixo `spak_`: esse prefixo identifica uma chave secreta do Spotify Soloist, não um Client ID OAuth. O validador passou a rejeitar `localhost` como Redirect URI HTTP e aceita somente `127.0.0.1` ou `[::1]` em desenvolvimento, conforme a regra atual do Spotify.

O fluxo PKCE guarda um `returnTo` interno opcional, limitado a caminhos relativos, para voltar à tela `#/jarvis` após a troca do código. O boot limpa `code` e `state` da URL antes de navegar, evitando deixar o código OAuth no histórico visível. O evento de sessão atualiza o botão, a telemetria e o núcleo visual sem carregar access token ou refresh token.

O núcleo Mark XIII reage apenas a estados de playback publicados pelo monitor: `playing` cria uma pulsação de baixa amplitude, `paused` mantém uma indicação discreta e `unknown` conserva o estado online sem inventar música. A reação não captura áudio do Spotify e não tenta sincronizar conteúdo.

A integração continua não verificada contra a conta Spotify real porque o dashboard `https://developer.spotify.com/dashboard` esteve indisponível no Chrome conectado durante a auditoria. O passo operacional restante da Web API é cadastrar o Client ID público e as Redirect URIs exatas no dashboard quando ele voltar a responder, depois clicar em `Conectar Spotify` na rota JARVIS. A chave Soloist segue outro caminho: daemon local protegido e ponte read-only, descritos em `SPOTIFY_SOLOIST_API_KEY_OBSERVATION_2026-08-22.md`.
