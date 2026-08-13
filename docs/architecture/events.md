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
| `toast` | `src/utils/toast.js` | `src/utils/toast.js` |

## `flags`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `flags:ambiente` | `src/core/flags.js` | — |
| `flags:mudou` | `src/core/flags.js` | — |
| `flags:promovida` | `src/core/flags.js` | — |

## `hermes`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `hermes:engine` | `src/utils/jarvis-hermes-agent.js` | `src/pages/git-nexus-nucleo.js` |

## `nucleo`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `nucleo:event` | `src/utils/nucleo-socket.js` | `src/pages/git-nexus-cockpit.js` · `src/pages/git-nexus-nucleo.js` |
| `nucleo:status` | `src/utils/nucleo-socket.js` | `src/pages/git-nexus-cockpit.js` · `src/pages/git-nexus-nucleo.js` |

## `page`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `page:pin` | `src/layout/header.js` | `src/layout/shell.js` |

## `permissions`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `permissions:concedida` | `src/core/permissions.js` | `src/core/politica.js` |
| `permissions:declarada` | `src/core/permissions.js` | — |
| `permissions:negada` | `src/core/permissions.js` | — |
| `permissions:revogada` | `src/core/permissions.js` | `src/core/politica.js` |

## `route`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `route:before` | `src/core/router.js` | — |
| `route:change` | `src/core/router.js` | `src/main.js` · `src/utils/nexus.js` |
| `route:error` | `src/core/router.js` | `src/main.js` |
| `route:notfound` | `src/core/router.js` | `src/main.js` |

## `sidebar`

| Evento | Emitido por | Escutado por |
| --- | --- | --- |
| `sidebar:close-mobile` | `src/layout/shell.js` · `src/layout/sidebar.js` | `src/layout/sidebar.js` |
| `sidebar:toggle-collapse` | `src/layout/header.js` · `src/layout/sidebar.js` | `src/layout/sidebar.js` |
| `sidebar:toggle-mobile` | `src/layout/header.js` | `src/layout/sidebar.js` |

## Pontas soltas

Nenhuma das duas listas abaixo é necessariamente defeito — mas as duas são
perguntas que valem ser feitas antes de congelar a 1.0.0.

### Emitido e ninguém escuta

Pode ser ponto de extensão deixado de propósito, ou pode ser ouvinte que alguém
apagou e não percebeu. O emissor continua custando trabalho ou nenhum dos dois.

- `flags:ambiente` — emitido por `src/core/flags.js`
- `flags:mudou` — emitido por `src/core/flags.js`
- `flags:promovida` — emitido por `src/core/flags.js`
- `permissions:declarada` — emitido por `src/core/permissions.js`
- `permissions:negada` — emitido por `src/core/permissions.js`
- `route:before` — emitido por `src/core/router.js`

### Escutado e ninguém emite

Nenhum. Todo ouvinte tem pelo menos um emissor.

---

Gerado de `src/**/*.js`. Comentários são removidos antes da varredura — o JSDoc
de `core/events.js` traz exemplos de uso (`bus.on('arsenal:*')`) que não são
código, e sem isso o catálogo nasceria mentindo sobre o próprio exemplo.
