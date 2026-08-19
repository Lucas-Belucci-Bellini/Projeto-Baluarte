# Vigia das rotas — hardening de navegação

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Observação

No SHA `6e192fe5`, o workflow `Vigia das rotas` permanecia em execução na etapa **Abrir todas as rotas**, enquanto checkout, instalação, navegador e build já haviam terminado. O job possui limite de 25 minutos, e o smoke visitava cada rota sequencialmente com `page.goto(..., waitUntil: 'load', timeout: 30000)`.

A causa operacional provável é a espera do evento `load` em uma rota que depende de recursos externos ou de carregamento tardio. Como o objetivo do Vigia é validar a renderização da aplicação, não transformar a disponibilidade de host externo em bloqueio de navegação, a espera foi reduzida para o evento `domcontentloaded`, mantendo a janela de espera posterior para a aplicação montar a página.

## Mudança

` scripts/smoke-rotas.mjs ` agora usa:

```text
waitUntil: domcontentloaded
NAVEGACAO_TIMEOUT_MS: 15000 por padrão
```

O timeout pode ser ajustado sem alterar código por meio de `NAVEGACAO_TIMEOUT_MS`. Exceções de JavaScript continuam vermelhas, falhas de rede continuam classificadas como avisos conforme o contrato existente, rotas vazias continuam detectadas e cada página continua sendo fechada após a auditoria.

## Verificação local

| Comando | Resultado |
|---|---:|
| `npm run build` | Verde |
| `npm run smoke` | **99/99 rotas verdes** |
| `npm run caminho-critico` | **15/15** |
| `npm test` | **1042/1042** |
| `git diff --check` | Verde |

## Segurança e rollback

A mudança não altera autenticação, permissões, storage, dados externos ou o bundle da aplicação. O rollback é o revert do commit. O teste não passa a ignorar `pageerror`, rota não encontrada ou tela quase vazia.

## Próximo passo

Publicar esta correção no `main` e observar o workflow do Vigia no SHA novo. Se a etapa continuar longa, usar o relatório/log do job para identificar a rota específica e não aumentar timeouts globalmente sem evidência.
