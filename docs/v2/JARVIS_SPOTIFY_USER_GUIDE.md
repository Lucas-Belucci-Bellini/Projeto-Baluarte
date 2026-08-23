# Como conectar o Spotify ao JARVIS

**Público:** pessoas que usam o aplicativo, mas não programam.

**Objetivo:** acompanhar somente os metadados da música que está tocando, como título, artista, posição e duração. O JARVIS não captura áudio, não usa o microfone e não controla o player.

## O jeito mais fácil

Quando o aplicativo já estiver configurado pelo administrador, não é necessário copiar nenhuma chave. Abra a página **JARVIS**, encontre a caixa **Presença musical externa** e clique em **Conectar Spotify**. O Spotify abrirá uma tela de login e consentimento. Entre na sua conta, aceite a permissão de leitura e volte para o aplicativo.

Depois da autorização, o botão passa a mostrar **SPOTIFY · ONLINE**. Quando houver uma música tocando, o núcleo visual Mark XIII exibirá uma reação discreta e o contexto musical poderá aparecer nas informações de estado do JARVIS. Se você pausar a música, a indicação muda para pausada; se o Spotify ficar indisponível, o aplicativo mostra estado desconhecido em vez de inventar uma informação.

| O que aparece | O que significa |
|---|---|
| `SPOTIFY · OFF` | Ainda não há conexão ativa. |
| `SPOTIFY · ONLINE` | A autorização foi concluída e a sessão está disponível. |
| `TOCANDO` | O Spotify informou que há playback ativo. |
| `PAUSADA` | O Spotify informou que o playback está pausado. |
| `UNKNOWN` ou estado desconhecido | O aplicativo não conseguiu confirmar o playback. Isso não significa necessariamente que a música esteja pausada. |

## Se o aplicativo mostrar um campo vazio

O campo Client ID é uma configuração pública do aplicativo, normalmente preenchida uma única vez pelo administrador. O usuário final não precisa criar uma chave. Peça ao responsável pelo aplicativo para configurar o Client ID público no ambiente de publicação; depois disso, o botão funcionará sem copiar códigos.

Se o campo estiver disponível para configuração local, use somente o **Client ID público** do aplicativo Spotify. Ele não é senha e não dá acesso à sua conta sozinho. O aplicativo usa Authorization Code with PKCE, uma proteção adequada para aplicações de navegador nas quais o Client Secret não pode ser escondido [1].

A Redirect URI deve ser cadastrada exatamente no aplicativo Spotify. No ambiente publicado, a URI esperada é `https://projeto-baluarte.vercel.app/`, incluindo a barra final. Em ambiente local, use o endereço de loopback que o responsável cadastrou. A regra de correspondência exata é definida pelo Spotify [2].

## Atenção à chave Spotify Soloist

Uma credencial que começa com `spak_` é uma **Spotify Soloist API Key**. Ela não é Client ID e não deve ser colada no campo do JARVIS. Não envie essa chave por chat, e-mail, issue, screenshot, navegador ou repositório.

A chave Soloist só é necessária para uma instalação local do daemon Soloist. Essa é uma configuração opcional para o computador que executa o Soloist; usuários comuns não precisam dela para usar a conexão Spotify Web API do aplicativo. Quando o Soloist for utilizado, ele deve ficar preso ao endereço local e atrás da ponte read-only fornecida pelo Projeto-Baluarte. A ponte não recebe a chave e não aceita comandos de reprodução [3] [4].

Como a chave apareceu em uma imagem compartilhada, ela deve ser considerada potencialmente exposta. O responsável pela conta deve rotacioná-la ou revogá-la manualmente no painel Spotify for Developers antes de usá-la novamente. O Projeto-Baluarte não executa essa ação automaticamente.

## Solução de problemas

| Situação | O que fazer |
|---|---|
| O botão diz que o app não está configurado | Só acontece em build publicado sem Client ID público. Desde 2026-08-23 ele vem embutido (`SPOTIFY_PUBLIC_CLIENT_ID`); se a mensagem aparecer, o build saiu de um fork que apagou o valor. Não tente usar a chave `spak_`. |
| O Spotify rejeita a autorização | Verifique se a Redirect URI cadastrada é exatamente igual à mostrada no JARVIS, incluindo protocolo, domínio, caminho e barra final. |
| A conexão volta para o JARVIS, mas fica offline | Desconecte e tente novamente. Se continuar, o administrador deve verificar o cadastro do aplicativo Spotify. |
| A música toca, mas o núcleo mostra estado desconhecido | O Spotify pode estar sem estado disponível, a sessão pode ter expirado ou a rede pode estar indisponível. O estado desconhecido é intencional para evitar informação inventada. |
| O Soloist local não aparece | Essa função exige o daemon Soloist e a ponte local iniciados pelo responsável técnico. Ela não é necessária para a conexão normal do aplicativo. |
| Você colou uma senha, Client Secret ou chave Soloist por engano | Remova o valor do campo, não o envie novamente e peça ao administrador para rotacionar a credencial correspondente. |

## Privacidade e limites

O JARVIS observa apenas metadados de playback. Não há captura de áudio, reconhecimento de melodia por microfone, transmissão, sincronização de conteúdo, envio automático de cada faixa para um modelo ou comandos de play, pausa, volume, fila ou busca. Essa limitação segue a política de não sincronizar conteúdo do Spotify [5].

## Para o administrador

Desde 2026-08-23 não há nada a fazer no caso normal: o Client ID público do app `Baluarte JARVIS` vem embutido no build (`SPOTIFY_PUBLIC_CLIENT_ID`, em `src/utils/jarvis-spotify.ts`), o campo técnico some da tela e o usuário vê só o botão. Publicar `VITE_SPOTIFY_CLIENT_ID` continua funcionando e tem precedência — é o caminho para quem hospeda o Baluarte com um aplicativo Spotify próprio.

O aplicativo está em Development mode. Isso basta para a conta do dono; outras contas precisam ser adicionadas em **User Management** no dashboard do Spotify, ou o aplicativo precisa pedir extensão de quota.

Nunca publique `SPOTIFY_SOLOIST_API_KEY`, `SOLOIST_API_KEY`, Client Secret, access token ou refresh token. A chave Soloist deve permanecer no ambiente privado do daemon. A integração local read-only está documentada em `docs/v2/SPOTIFY_SOLOIST_API_KEY_OBSERVATION_2026-08-22.md` e o contrato Web API está em `docs/v2/JARVIS_SPOTIFY_INTEGRATION_CONTRACT_2026-08-22.md`.

## Referências

[1]: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow "Spotify — Authorization Code with PKCE Flow"

[2]: https://developer.spotify.com/documentation/web-api/concepts/redirect_uri "Spotify — Redirect URIs"

[3]: https://developer.spotify.com/documentation/soloist/reference/soloist-ctl "Spotify Soloist — soloist ctl command line"

[4]: https://developer.spotify.com/documentation/soloist/reference/websocket-api "Spotify Soloist — WebSocket API"

[5]: https://developer.spotify.com/documentation/web-api/reference/get-information-about-the-users-current-playback "Spotify — Get Playback State"
