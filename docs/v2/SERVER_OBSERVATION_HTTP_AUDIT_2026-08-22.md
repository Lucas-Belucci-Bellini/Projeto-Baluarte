# Auditoria — Cliente HTTP server-observation/v1

**Data:** 2026-08-22  
**Estado:** marco local implementado; publicação depende dos gates finais  
**Base auditada:** `main` em `2093059410bf2aa6c8a0f90795e91625d0be1d53`  
**Escopo:** transporte GET read-only para observabilidade server-validated  
**Autor:** Manus AI

## Resumo

A auditoria encontrou dois endpoints já existentes para o mesmo envelope: `/observability/observe` no FastAPI e `/api/observability` no adaptador Vercel. O backend combina health e claims redigidos em `server-observation/v1`, aplica allowlist CORS e rate limit process-local e mantém `authority: not-authorized`. Não foi criado endpoint novo, não foi alterado provider e não foi aplicado DDL.

A implementação local adiciona `src/security/server-observation-http.ts`. O cliente recebe uma URL explícita, executa somente `GET`, aceita token opcional apenas para o header Bearer, injeta `AbortSignal` com timeout bounded e devolve somente resultado de transporte e a projeção `server-validated-session/v1`. Não há retry, cache, armazenamento, refresh, logout ou decisão de autorização.

## Decisões de segurança

| Área | Decisão |
|---|---|
| URL | Absoluta, somente `http:`/`https:`, sem query, fragmento, username ou password |
| Método | `GET`, sem body |
| Credencial | Opcional, somente header `Authorization`; não aparece no retorno ou erro |
| Timeout | Default 2500 ms, mínimo 100 ms, máximo 10000 ms |
| HTTP 429 | `server-rate-limited`, sem corpo externo |
| Outros erros HTTP | `http-error`, somente status inteiro |
| JSON/envelope | Validado; corpo externo nunca é retornado |
| Rede/timeout | Razões bounded; mensagem da exceção é descartada |
| Autoridade | Sempre `not-authorized`; `publicPromotionAllowed` sempre `false` |

## Falha histórica e correção

O workflow remoto `Security Contracts` havia revelado, no marco anterior, que o Node nativo não resolvia imports TypeScript sem extensão. O padrão de wrappers `.js` foi reutilizado para a projeção server-validated e para os contratos de observação. A política TypeScript strict, `allowJs: false` e `moduleResolution: bundler` permanecem intactas.

O Node 22 do sandbox não executa diretamente testes que importam `.ts` via `node --test`; o projeto usa `tsx` localmente. Essa diferença de runtime é registrada como limitação de ambiente, não é tratada como autorização para relaxar o contrato e deve continuar explícita no CI.

## Evidências locais

Os testes focais cobrem ausência e invalidez de endpoint sem chamada de rede, GET sem body, headers opcionais, ausência de credencial no resultado, 429, outros status HTTP, JSON inválido, envelope incompatível, erro de rede redigido, AbortSignal e timeout. O strict TypeScript e a suíte focal passaram antes do gate completo.

## Riscos restantes

O cliente não prova autenticidade criptográfica do envelope; ele somente consome o endpoint server-side e usa a projeção conservadora. Assinatura/origem server-side, rate limit distribuído, RLS remoto, auditoria operacional de produção e decisão de autorização continuam fora deste marco. O consumidor ainda deve fornecer uma URL de ambiente controlada, e nenhuma URL derivada de input do usuário pode ser passada para esta função.

## Rollback

O rollback consiste em remover o cliente, o wrapper de compatibilidade, o teste e os dois documentos deste marco. Os endpoints backend, o envelope `server-observation/v1`, a projeção local server-validated e o adapter Auth permanecem intactos.
