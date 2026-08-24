# Spotify for Developers — observação externa

**Data:** 2026-08-22  
**URL:** `https://developer.spotify.com/dashboard`  
**Modo:** inspeção read-only no Chrome conectado.

O dashboard retornou a mensagem `Something went wrong, we could not load this dashboard page. Try again later.` em duas visualizações consecutivas. Não foi possível verificar o aplicativo Spotify, o Client ID ou a Redirect URI nessa sessão. Nenhum campo foi editado e nenhuma credencial foi lida ou inserida.

Classificação: `unknown/external`. Essa indisponibilidade não prova que o Client ID esteja inválido e não deve ser corrigida alterando o código às cegas. O fluxo local já usa PKCE/S256 e não requer Client Secret no frontend. A próxima tentativa deve ocorrer quando o dashboard estiver disponível; só então comparar a Redirect URI exata com `https://projeto-baluarte.vercel.app/` e o domínio local usado no desenvolvimento.
