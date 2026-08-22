# JARVIS — Presença Musical Passiva

**Estado:** presença do navegador implementada; Web API OAuth PKCE e ponte local Soloist read-only disponíveis como caminhos opt-in

## O que foi entregue

O JARVIS agora possui um observador passivo de reprodução. Ele inicia junto do boot global e acompanha eventos `play`, `pause`, `ended` e `timeupdate` dos elementos `audio` e `video` pertencentes ao próprio Projeto-Baluarte. A página de músicas também publica sinais explícitos do controlador do Spotify Embed para a faixa em destaque.

O estado publicado em `window.BaluarteStatus.jarvisMusic` contém somente playback (`playing`, `paused` ou `idle`), origem, título, artista, posição, duração e horário de observação. A informação entra no contexto de leitura do JARVIS na próxima chamada, sem criar uma mensagem, uma sessão ou uma chamada de modelo automaticamente.

> O sentido de “sentir a melodia junto” nesta primeira fatia é acompanhar o estado e os metadados da reprodução. O navegador não entrega o áudio bruto ao JARVIS e nenhum microfone é usado.

## Privacidade e limites

| Capacidade | Estado |
|---|---|
| Acompanhar áudio local reproduzido dentro do site | Implementado |
| Acompanhar o acervo offline do site | Implementado via eventos dos elementos `audio` |
| Acompanhar a faixa em destaque do Spotify Embed da página | Implementado por playback update explícito |
| Ler a música que toca no aplicativo Spotify Desktop | Não disponível no navegador sem integração externa autorizada |
| Capturar microfone ou reconhecer melodia | Não implementado e não iniciado |
| Enviar automaticamente cada faixa para um modelo | Não implementado |
| Criar turno de conversa sem o usuário falar | Não acontece |

O site não pode inspecionar a aba ou o aplicativo Spotify de outro contexto por causa do isolamento de origem do navegador. Para acompanhar o Spotify fora da página do Baluarte existem dois caminhos distintos: Web API OAuth PKCE no navegador, usando apenas Client ID público e tokens em memória, ou uma ponte local Soloist autorizada pelo operador. A chave `spak_` do Soloist pertence somente ao daemon local e nunca deve chegar ao site.

## Contrato de integração externa do Spotify

A Web API é opt-in e usa somente o mínimo necessário: `user-read-playback-state`, tokens fora do bundle público, polling com intervalo controlado, redaction de tokens e botão claro para desconectar. O estado deve ser considerado `unknown` quando a API estiver indisponível, nunca inferido como “pausado”.

A ponte Soloist local implementada em `scripts/spotify-soloist-bridge.ts` exige bind em loopback, token próprio do bridge, CORS restrito e somente `GET /v1/spotify/playback`. Ela chama apenas `soloist ctl now --json`, redige URI, capa, volume, fila e ações, e converte indisponibilidade em erro/`unknown`. A API key `spak_` não é lida pela ponte: ela é usada somente pelo operador ao iniciar o daemon Soloist, fora do Git e do browser.

## Arquivos

- `src/utils/jarvis-music-presence.ts`
- `src/utils/jarvis-spotify-soloist.ts`
- `scripts/spotify-soloist-bridge.ts`
- `test/v2/jarvis-spotify-soloist.test.js`
- `src/utils/music-embeds.d.ts`
- `src/pages/musicas.ts`
- `src/main.js`
- `test/v2/jarvis-music-presence.test.js`

## Próximo passo

Validar visualmente a página de músicas e, quando o operador quiser usar o Soloist, iniciar o daemon local com a chave protegida e o WebSocket em loopback. O JARVIS deve apontar somente para a ponte read-only com token próprio; nenhum segredo deve ser inserido no campo Client ID OAuth.
