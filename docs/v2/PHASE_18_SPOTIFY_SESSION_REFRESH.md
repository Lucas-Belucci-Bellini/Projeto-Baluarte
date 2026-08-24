# Fase 18 — Refresh de sessão Spotify sem persistência de tokens

## Estado

**Implementado e testado localmente.** A integração continua desligada até o operador fornecer um Client ID público e concluir o opt-in OAuth.

## Mudança

O monitor Spotify agora aceita um fornecedor de access token e uma função opcional de refresh. Depois de um `401`, ele tenta uma única renovação em memória usando o refresh token recebido na troca PKCE. Se a renovação funcionar, repete a consulta de playback com o novo access token. Se falhar, retorna `unauthorized` e a sessão é encerrada.

O refresh token nunca é gravado em `localStorage`, cookies, URL, prompt, `BaluarteStatus`, logs ou repositório. Ele existe somente no escopo de memória da sessão atual. Ao desconectar, os tokens são descartados junto com o monitor. Ao recarregar a página, o operador deve autorizar novamente.

## Invariantes

| Invariante | Garantia |
|---|---|
| Uma tentativa de refresh por `401` | Evita loop de autenticação |
| Retry após refresh | Só ocorre se um novo access token foi obtido |
| Refresh falho | Sessão vira não autorizada |
| `429` | Mantém `Retry-After`, sem refresh desnecessário |
| Status musical | Contém apenas metadados de playback |
| Controle Spotify | Não ganha escopos de escrita nem comandos de player |

## Teste

O teste `test/v2/jarvis-spotify.test.js` simula access token expirado, confirma a segunda chamada com token renovado, garante que o novo token não aparece no status musical e ainda valida `401` sem refresh e `429` com `Retry-After`.

## Limite deliberado

Esta fase não implementa persistência criptografada de refresh token, backend proxy ou sincronização entre dispositivos. A decisão mantém a superfície de ataque pequena até existir uma necessidade operacional clara e uma política de armazenamento aprovada.
