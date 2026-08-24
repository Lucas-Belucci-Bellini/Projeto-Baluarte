# Auth Adapter TypeScript — Auditoria e implementação

**Status:** slice local implementada; provider remoto preservado
**SHA base auditado:** `5ad5e53ee7e9160c8e54283b5b8f70b9b212f95c`
**Data:** 2026-08-21
**Autor:** Manus AI

## Resumo executivo

O adapter Auth existente continua sendo `src/core/supabase-auth.js`, utilizado pela página canônica `src/pages/login.ts` e por testes V1 de login, OAuth, refresh e logout. A lacuna identificada era a ausência de tipos reais para a sessão e a aceitação direta de payloads desconhecidos do provider. A slice adiciona `src/core/auth-session.ts` como projetor puro e atualiza `src/core/supabase-auth.d.ts` com tipos de sessão/listener, mantendo os endpoints, a chave de storage, o import `.js` e a API pública.

A implementação não cria uma nova autoridade de identidade. `currentUser()` continua sendo somente projeção de UI; roles, claims, módulos e RLS permanecem dependentes de validação server-side. Não houve DDL, migration, staging, alteração de secret, chamada Supabase real ou mudança de `runtimeAuthority`.

## Arquivos alterados nesta slice

| Arquivo | Papel | Risco controlado |
|---|---|---|
| `src/core/auth-session.ts` | Projeta respostas completas, storage e refresh para registro bounded | Payload provider inválido ou TTL inconsistente virar sessão persistida |
| `src/core/supabase-auth.js` | Usa os projetores sem mudar a API ou endpoints | Regressão de login, OAuth, refresh ou logout |
| `src/core/supabase-auth.d.ts` | Tipagem da fronteira pública legada | Consumidores TypeScript enxergarem `unknown` ou contratos frágeis |
| `tsconfig.json` | Inclui o novo contrato no strict gate | Arquivo TS não verificado pelo CI local |
| `test/security/auth-session-contract.test.js` | Sete testes focais de projeção | Falha de token parcial, expiração ou refresh preservado |
| `docs/v2/AUTH_ADAPTER_TYPESCRIPT_CONTRACT_2026-08-21.md` | Contrato e limites da slice | Escopo crescer para provider/RLS sem aprovação |

## Comportamento preservado

O login só cria sessão quando recebe `access_token` e `refresh_token`. Cadastro sem tokens continua retornando `confirmed: false`, permitindo confirmação posterior de e-mail. Refresh inválido remove a sessão local. Logout continua revogando no servidor em modo best-effort e limpando a sessão local mesmo offline. OAuth continua limpando tokens do fragmento e não autentica com token parcial.

A condição `access_token && refresh_token` foi preservada no adapter por compatibilidade com o contrato OAuth legado. A projeção TypeScript é aplicada depois dessa guarda, portanto o texto do contrato antigo e a proteção nova coexistem sem duplicar a regra de negócio.

## Verificações executadas

| Comando | Resultado |
|---|---:|
| `npm run tipos:ts` | Passou |
| Testes Auth/login focais | 32/32 |
| `npm test` | 1215/1215 |
| `npm run build` | Passou; somente warnings conhecidos de chunks grandes |
| `npm run tipos:v2` | Passou |
| `npm run verificar-nexus` | 99 rotas, 0 lacunas |

## Causa raiz versus efeito cascata

A causa raiz era contratual: a fronteira do adapter JavaScript estava declarada com `unknown` para o listener e sem tipo explícito de sessão. Isso não representava vários erros independentes. Os riscos derivados eram a persistência de payload incompleto, TTL inválido e perda acidental de `refresh_token` durante refresh. A nova projeção centraliza esses casos em três helpers puros e reduz a superfície de tratamento duplicado.

## Bloqueios não alterados

RLS remoto segue bloqueado até aprovação explícita de staging e custo. O provider Auth real não foi chamado. O frontend não decodifica JWT para autorização, não recebe service role e não decide admin/dev/owner. A integração OpenClaw, WhatsApp, notícias automáticas, billing remoto e promoção pública continuam fora desta slice.

## Riscos residuais

A implementação canônica ainda está em JavaScript; a próxima etapa pode migrar o adapter para TypeScript somente após tipar os limites de `fetch`, `Response`, storage e ambiente browser com testes de compatibilidade. A sessão continua sendo um dado sensível necessário no navegador e não deve ser logada. A validade criptográfica do JWT não é decidida localmente; essa separação é intencional e obrigatória.

## Rollback

O rollback remove `src/core/auth-session.ts`, o teste focal, a inclusão no `tsconfig.json`, os tipos atualizados e os imports/projeções em `supabase-auth.js`. A chave `auth:session`, o router, a página login, as migrations e o provider remoto não precisam ser alterados.

— **Manus AI**
