# Catálogo de eventos do bus

> ⚠️ **ARQUIVO GERADO** por `scripts/gen-catalogo-eventos.mjs` — não edite à mão.
> O CI regera com `--verificar` e falha se divergir. Evento novo aparece aqui
> sozinho; evento renomeado sem atualizar quem escuta aparece como órfão.

Este documento responde, para o event bus, a pergunta que o [item 8 do #420]
manda cada documento de arquitetura responder: **"se eu mexer aqui, o que quebro?"**
Para um evento, a resposta é *quem escuta* — e isso estava espalhado pelo código.

Hoje: **19 eventos** em **8 namespaces**.

O bus é `src/core/events.js`. Ele aceita curinga — `bus.on('*')` para tudo e
`bus.on('arsenal:*')` para um namespace — com o nome do evento em `meta.event`.
`emit('*')` é proibido: curinga é assinatura, não evento.

## `(sem prefixo)`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `toast` | `src/utils/toast.ts` | `src/utils/toast.ts` |

## `flags`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `flags:ambiente` | `src/core/flags.ts` | — |
| `flags:mudou` | `src/core/flags.ts` | — |
| `flags:promovida` | `src/core/flags.ts` | — |

## `hermes`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `hermes:engine` | `src/utils/jarvis-hermes-agent.js` | `src/pages/git-nexus-nucleo.ts` |

## `nucleo`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `nucleo:event` | `src/utils/nucleo-socket.js` | `src/pages/git-nexus-cockpit.ts` · `src/pages/git-nexus-nucleo.ts` |
| `nucleo:status` | `src/utils/nucleo-socket.js` | `src/pages/git-nexus-cockpit.ts` · `src/pages/git-nexus-nucleo.ts` · `src/pages/jarvis.ts` |

## `page`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `page:pin` | `src/layout/header.ts` | `src/layout/shell.ts` |

## `permissions`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `permissions:concedida` | `src/core/permissions.ts` | `src/core/politica.js` |
| `permissions:declarada` | `src/core/permissions.ts` | — |
| `permissions:negada` | `src/core/permissions.ts` | — |
| `permissions:revogada` | `src/core/permissions.ts` | `src/core/politica.js` |

## `route`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `route:before` | `src/core/router.ts` | — |
| `route:change` | `src/core/router.ts` | `src/main.js` · `src/pages/jarvis-nucleo.ts` · `src/pages/jarvis.ts` · `src/utils/nexus.js` |
| `route:error` | `src/core/router.ts` | `src/main.js` |
| `route:notfound` | `src/core/router.ts` | `src/main.js` |

## `sidebar`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `sidebar:close-mobile` | `src/layout/shell.ts` · `src/layout/sidebar.ts` | `src/layout/sidebar.ts` |
| `sidebar:toggle-collapse` | `src/layout/header.ts` · `src/layout/sidebar.ts` | `src/layout/sidebar.ts` |
| `sidebar:toggle-mobile` | `src/layout/header.ts` | `src/layout/sidebar.ts` |

## Pontas soltas

Nenhuma das duas listas abaixo é necessariamente defeito — mas as duas são
perguntas que valem ser feitas antes de congelar a 1.0.0.

### Emitido e ninguém escuta

Pode ser ponto de extensão deixado de propósito, ou pode ser ouvinte que alguém
apagou e não percebeu. O emissor continua custando trabalho ou nenhum dos dois.

- `flags:ambiente` — emitido por `src/core/flags.ts`
- `flags:mudou` — emitido por `src/core/flags.ts`
- `flags:promovida` — emitido por `src/core/flags.ts`
- `permissions:declarada` — emitido por `src/core/permissions.ts`
- `permissions:negada` — emitido por `src/core/permissions.ts`
- `route:before` — emitido por `src/core/router.ts`

### Escutado e ninguém emite

Nenhum. Todo ouvinte tem pelo menos um emissor.

---

Gerado de `src/**/*.js`. Comentários são removidos antes da varredura — o JSDoc
de `core/events.js` traz exemplos de uso (`bus.on('arsenal:*')`) que não são
código, e sem isso o catálogo nasceria mentindo sobre o próprio exemplo.
