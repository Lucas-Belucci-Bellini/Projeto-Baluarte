# Observação local — Layout JARVIS V7 + conversa

**Data/hora:** 2026-08-22 23:33  
**URL local:** `http://127.0.0.1:4196/#/jarvis`  
**Status:** composição aprovada para validação

## Resultado observado

O visual interativo do Núcleo V7 ocupa a superfície principal do JARVIS, com o astrolábio dourado, anéis, partículas e controles próprios. Logo abaixo aparecem a barra compacta do JARVIS e a área de conversa com sessões, botão `+ NOVA CONVERSA`, mensagens, campo `Mensagem…` e botão de envio.

A faixa grande `Presença musical externa` não aparece mais entre o núcleo e a conversa. Os controles do Spotify continuam no DOM da página e são movidos para dentro do painel `⚙ MODOS & CONFIG` quando o operador o abre. Assim o layout segue a referência visual pedida sem apagar o fluxo read-only de metadados.

A navegação, o cabeçalho da plataforma, o modo Hermes, a contagem de skills, a lista de sessões e a área de chat continuam presentes. O iframe V7 segue local same-origin e sandboxed; o Mark XIII permanece montado como fallback técnico dentro da composição de fallback, não como visual principal quando o V7 está pronto.

## Decisão

A recomposição é somente de apresentação. Não muda login, sessões, memória, seleção de modo, Runtime, Event Bus, Spotify PKCE, permissões ou integrações externas. Nenhum token, Client Secret, microfone, autoplay, playback ou captura de áudio foi adicionado.

## Verificação adicional

Ao abrir `⚙ MODOS & CONFIG` no preview, o painel expandido manteve os modos de IA, perfil, humanização, memória, skills e modelos. A seção `♫ Presença musical externa` aparece dentro desse painel, com Client ID público, status, limpar neste dispositivo, conectar Spotify e instruções PKCE. A área principal continua sem a faixa Spotify; o V7 e a conversa não foram deslocados para baixo por esse conteúdo até o operador solicitar a configuração.
