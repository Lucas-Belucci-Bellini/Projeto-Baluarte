# Fase 19 — Hardening da redirect URI Spotify

## Estado

**Implementado no main em preparação.** O callback OAuth agora é validado antes de montar a URL de autorização.

## Regras

| Redirect URI | Resultado |
|---|---|
| `https://dominio/callback` | Permitida |
| `http://localhost:porta/callback` | Permitida somente para desenvolvimento local |
| `http://dominio/callback` | Rejeitada |
| URI com username/password | Rejeitada |
| URI com fragmento `#...` | Rejeitada |
| URI malformada | Rejeitada |

A produção exige HTTPS porque o callback recebe o código OAuth. Localhost é a exceção limitada para desenvolvimento. O Client ID continua sendo público; client secret não é aceito nem necessário no fluxo PKCE.

## Testes

A suíte Spotify valida as quatro classes de redirect URI e mantém o restante do contrato PKCE, playback, refresh em memória e contexto musical.
