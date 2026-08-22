# JARVIS Spotify — auditoria da onda PKCE

**Data:** 2026-08-22  
**Escopo:** integração read-only de playback externo e reação visual Mark XIII  
**Status:** código validado localmente; conexão com conta Spotify ainda não verificada por indisponibilidade externa do dashboard  
**Autor:** Manus AI

## Resultado executivo

A onda implementa Authorization Code with PKCE para uma SPA, com escopo mínimo `user-read-playback-state`. O navegador recebe somente o Client ID público; não existe Client Secret no frontend. Access token e refresh token ficam exclusivamente em memória JavaScript e não são colocados em `localStorage`, `sessionStorage`, eventos ou telemetria. O Client ID público pode ser lembrado em `localStorage` para evitar redigitação.

O monitor consulta somente `GET /v1/me/player` e publica metadados bounded — título, artista, posição e duração — no registro de presença musical existente. Não há captura de áudio, sincronização de conteúdo, transmissão, comandos de reprodução ou alteração de autoridade do Runtime. O núcleo Mark XIII aplica uma pulsação de baixa amplitude para `playing`, uma indicação discreta para `paused` e estado neutro para `unknown`.

## Controles de segurança e privacidade

| Controle | Implementação | Evidência |
|---|---|---|
| PKCE | `S256`, `state` e `code_verifier` por autorização | `src/utils/jarvis-spotify.ts` |
| Segredo | nenhum Client Secret aceito ou enviado | troca em `/api/token` usa `client_id`, `code` e `code_verifier` |
| Armazenamento | somente Client ID em persistência; PKCE temporário em sessão; tokens em memória | `src/utils/jarvis-spotify-session.ts` |
| Callback | rejeita `state` divergente e limpa o pending state | `resumeSpotifyAuthorization` |
| Retorno | `returnTo` limitado a rota relativa interna; `code`/`state` removidos do histórico antes da navegação | `src/main.js` |
| Redirect URI | HTTPS em produção; HTTP somente para `127.0.0.1` ou `[::1]`; sem usuário, senha ou hash | `assertConfig` |
| Autoridade | Spotify não promove sessão, papel, saúde ou autoridade do Runtime | `runtimeAuthority` permanece `not-authorized` |
| Playback | metadados apenas; `204` vira `unknown`, não pausa inventada | `createSpotifyPlaybackMonitor` |

## Riscos residuais

O cadastro do aplicativo Spotify e da Redirect URI ainda depende do dashboard do provedor. Em duas tentativas read-only no Chrome, o dashboard retornou `Something went wrong, we could not load this dashboard page. Try again later.`. Esse fato foi classificado como `unknown/external`; não é evidência de erro no Client ID nem motivo para alterar credenciais às cegas.

A integração real permanece pendente até que o operador cadastre exatamente `https://projeto-baluarte.vercel.app/` no aplicativo Spotify e execute o consentimento. Para desenvolvimento, a URI deve usar uma porta local com IP loopback explícito, por exemplo `http://127.0.0.1:4173/`; `localhost` não é aceito pelo validador desta aplicação.

## Rollback seguro

Para desativar a integração sem afetar o restante do JARVIS, desconectar Spotify na interface interrompe o monitor, limpa tokens em memória e remove o estado PKCE pendente. Se for necessário um rollback de código, reverter o commit desta onda restaura o comportamento anterior; não é necessário apagar variáveis de Vercel, porque nenhuma foi criada ou alterada nesta tarefa.

## Matriz de validação local

| Gate | Resultado |
|---|---:|
| `npm run tipos:ts` | PASS |
| `npx tsx --test test/v2/jarvis-spotify-session.test.js test/v2/jarvis-spotify.test.js` | PASS — 11 testes |
| `npm test` | PASS |
| `npm run tipos:v2` | PASS |
| `npm run build` | PASS |
| `npm run v2:integracao` | PASS |
| `npm run smoke` | PASS |
| `npm run caminho-critico` | PASS |
| `/home/ubuntu/run_baluarte_hardening_gates.sh` | PASS em todos os gates aplicáveis; `rust_runtime=101` documentado como `blocked-known` |

## Referências operacionais

1. [Spotify — Authorization Code with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow).
2. [Spotify — Redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect-uri).
3. [Spotify — Get Information About The User's Current Playback](https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback).
