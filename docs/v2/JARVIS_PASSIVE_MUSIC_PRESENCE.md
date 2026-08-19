# JARVIS — Presença Musical Passiva

**Estado:** primeira fatia implementada no navegador; integração OAuth do Spotify ainda não ativada

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

O site não pode inspecionar a aba ou o aplicativo Spotify de outro contexto por causa do isolamento de origem do navegador. Para acompanhar o Spotify fora da página do Baluarte, seria necessário um fluxo OAuth com a Web API do Spotify ou uma bridge nativa/OpenClaw autorizada pelo operador.

## Contrato futuro do Spotify

Uma integração futura deve ser opt-in e serverless apenas para o mínimo necessário: `user-read-currently-playing` ou escopo equivalente, tokens fora do bundle público, polling com intervalo controlado, redaction de tokens e botão claro para desconectar. O estado deve ser considerado `unknown` quando a API estiver indisponível, nunca inferido como “pausado”.

A bridge nativa também deverá exigir autorização explícita, expor somente metadados necessários e permitir desligamento imediato. Nenhuma integração Spotify real deve ser ativada antes de revisar consentimento, armazenamento de tokens, política de revogação e comportamento offline.

## Arquivos

- `src/utils/jarvis-music-presence.ts`
- `src/utils/music-embeds.d.ts`
- `src/pages/musicas.ts`
- `src/main.js`
- `test/v2/jarvis-music-presence.test.js`

## Próximo passo

Validar visualmente a página de músicas e, em uma etapa separada, desenhar o contrato de conexão Spotify/OpenClaw. A etapa externa só deve começar após a conta, escopos e destino de tokens serem confirmados pelo operador.
