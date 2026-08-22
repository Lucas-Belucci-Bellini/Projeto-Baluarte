# JARVIS V7 + Chat — Contrato de composição visual

**Status:** implementação local em validação  
**Data:** 2026-08-22  
**Rota:** `/#/jarvis`

## Decisão

A rota JARVIS deve apresentar o Núcleo V7 como sua única superfície visual principal. A área de conversa deve aparecer logo depois do V7, contendo lista de sessões, criação de conversa, mensagens, campo de texto e envio. O bloco grande de `Presença musical externa` não deve ocupar a área entre o visual e o chat.

O Spotify continua disponível, mas seus controles passam a viver dentro de `⚙ MODOS & CONFIG`. Isso reduz ruído visual sem apagar a integração PKCE de leitura de metadados. A seção continua informando que não há áudio nem comandos de reprodução.

## Superfície preservada

| Elemento | Regra |
|---|---|
| Núcleo V7 | Primeiro filho visual da página; iframe local same-origin, estado `ready` quando carregado |
| Conversa | Permanece na página, com sessões e campo de mensagem diretamente após a barra compacta do JARVIS |
| Modos de IA | Continuam acessíveis em `Modos & Config` |
| Perfil, humanização, memória e skills | Continuam no painel de configuração |
| Spotify | Continua read-only dentro de `Modos & Config` |
| Mark XIII | Continua montado como fallback técnico e estado de runtime; não é visual principal quando V7 está pronto |
| V1/router/sidebar | Não são alterados |

## Invariantes

A página não pode conter um card Spotify direto entre o V7 e o layout de conversa. O visual deve preceder a conversa. O chat, as sessões e o envio devem continuar no DOM. Abrir o painel de configuração deve revelar a seção Spotify sem criar um segundo shell ou uma segunda sidebar. A navegação para fora de `/jarvis` deve continuar descartando o V7 e o Mark XIII.

## Segurança e escopo

A mudança é de composição. Não altera login, autorização, claims, sessões, memória, Event Bus, Runtime, OpenClaw, WhatsApp, Supabase, RLS ou Billing. O iframe não recebe token, Client Secret, claim, role, chat, sessão, áudio ou permissão de microfone/autoplay. O Spotify continua limitado a metadados de playback conforme o contrato já publicado.

## Rollback

O rollback é restaurar a faixa Spotify como filho direto da página e remover o argumento extra de `renderConfigPanel`, preservando o commit funcional V7 anterior. Não é necessário reverter histórico; qualquer correção deve ser um novo commit na `main`.

## Gates

O marco exige `npm run tipos:ts`, `npm test`, `npm run build`, `npm run v2:integracao` em porta limpa, `npm run smoke`, `npm run caminho-critico`, inspeção browser do estado V7 e verificação de que Spotify fica dentro da configuração. A release só pode avançar depois da CI do SHA funcional, e eventual Desktop Release só depois do bump semântico aprovado.
