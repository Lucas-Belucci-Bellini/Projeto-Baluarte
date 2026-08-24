# Migração TypeScript — Wave 29

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover a fronteira do `toast.ts` em todos os consumers TypeScript encontrados, incluindo o bootstrap V1, sem alterar a API visual, o Event Bus, os timers, as mensagens, as opções ou o wrapper JavaScript de compatibilidade.

> Esta foi uma onda de retargeting global. O módulo canônico já existia e a alteração foi limitada à resolução dos imports; não houve reescrita da lógica de toast nem mudança de comportamento de UI.

## Baseline e publicação

A Wave 29 partiu do fechamento documental da Wave 28 em `2f9ba044fe663957bd4d97055ed9eb03e0529080`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `d35600b5764c1c59eb1c90295968a31d85d70152` |
| Mensagem | `refactor(core): promote typed toast consumers` |
| Arquivos alterados | 52 |
| Consumers TypeScript promovidos | 50 páginas + `src/main.js` |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Inventário promovido

A busca inicial encontrou 50 arquivos `.ts` ainda importando `toast.js`. O bootstrap V1 também importava o wrapper e foi promovido na mesma mudança para impedir que a inicialização continuasse dividida entre wrapper e implementação canônica.

| Área | Consumers |
|---|---:|
| Bootstrap e páginas gerais | 32 |
| Família de criptografia | 6 |
| JARVIS, memória, LLM e mídia | 12 |
| Total TypeScript | 50 |
| Bootstrap JavaScript | 1 |

Os consumers incluem `/academia`, `/apis`, `/aprendizado`, `/arsenal`, `/biblioteca`, `/editor`, `/geopulse`, `/jarvis`, `/login`, `/memoria`, `/musicas`, `/utilidades`, `/zomboid-admin` e as seis páginas de criptografia. A busca posterior não encontrou nenhuma referência `toast.js` dentro de arquivos TypeScript.

## Contrato auditado

`toast.ts` continua importando `bus` de `core/events.js` e `h` de `helpers.js`. O estado do toast permanece em memória: há somente um elemento ativo e um timer principal. Antes de mostrar uma nova notificação, o elemento anterior é removido e o timer anterior é cancelado.

`initToast()` continua registrando o listener do evento `toast` no Event Bus. `toast()` continua emitindo a mensagem com `type` e `duration`, usando `info` e `2400 ms` como defaults. A animação continua sendo iniciada por `requestAnimationFrame`, e o encerramento continua removendo a classe visual antes da remoção final do elemento.

| Fronteira | Garantia preservada |
|---|---|
| API | `toast(message, options)` e `initToast()` não mudaram |
| Tipos | `ToastType` e `ToastOptions` continuam canônicos em TypeScript |
| Event Bus | Mesmo evento `toast`, mesmo payload e mesmo listener |
| Lifecycle | Mesmo cancelamento de timer e remoção do elemento anterior |
| Compatibilidade | `toast.js` continua reexportando `initToast` e `toast` |
| Bootstrap | `main.js` agora resolve `toast.ts` diretamente |

## Implementação

A promoção removeu o sufixo `.js` dos imports nos 50 consumers TypeScript e alterou o import de `initToast` em `src/main.js` para `toast.ts`. A entrada `src/utils/toast.ts` foi adicionada ao domínio Core de `docs/nexus/dominios.json` na mesma changeset do `main.js`, conforme a governança do projeto.

Nenhuma chamada foi renomeada, nenhum argumento foi alterado, nenhum timeout foi ajustado e nenhum wrapper foi apagado. O resultado é uma cadeia canônica TypeScript com fallback JavaScript preservado.

## Escopo mantido fora

Não foram tocados Event Bus, `helpers.ts`, CSS de toast, timers, acessibilidade, autenticação, Supabase/RLS, Spotify, Hermes, WebLLM, OpenClaw, memória, Vercel, layout ou roteamento. A onda não altera o comportamento visual nem cria uma nova política de notificação.

## Gates locais

Os gates foram executados após a promoção global. Vite stale foi encerrado antes da integração. Os artefatos transitórios de smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 395 arquivos com dono |
| `npm run tipos:ts` | verde | 50 consumers e bootstrap resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 8,44 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A falha local do Rust continua ambiental e não foi mascarada. O CI remoto usa uma toolchain compatível.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal é um consumer especial depender acidentalmente do wrapper por resolução transitiva. O build, os tipos, o smoke, o caminho crítico, a integração V2 e o CI remoto confirmaram a resolução canônica sem regressão.

O rollback é restaurar os 50 imports TypeScript e o import do `main.js` para `.js`, remover `toast.ts` da entrada adicionada ao Nexus e publicar um commit normal no `main`. Não é necessário apagar `toast.ts`, alterar Event Bus, relaxar `strict` ou reverter histórico.

## CI remota

A execução remota foi disparada para o SHA curto `d35600b5`; todos os oito workflows aplicáveis terminaram com sucesso.

| Workflow | Run | Resultado |
|---|---:|---|
| CI | `32338531118` | success |
| Core CI | `32338531088` | success |
| V2 Core | `32338531023` | success |
| V2 Runtime | `32338531110` | success |
| V2 Validation | `32338531097` | success |
| Vigia das rotas | `32338531204` | success |
| Arma 3 Data CI | `32338531093` | success |
| CodeQL | `32338531108` | success |

O CodeQL exibiu somente os avisos conhecidos de Node 20 forçado para Node 24 e de futura migração do CodeQL Action v3; a execução terminou com sucesso e nenhum alerta de segurança foi introduzido por esta onda.

## Critério de conclusão

A Wave 29 está encerrada: o bootstrap e os 50 consumers TypeScript resolvem `toast.ts`, o wrapper permanece disponível, o Event Bus e o lifecycle visual não mudaram, os gates locais passaram e a CI remota confirmou os oito workflows sem regressão.

O próximo passo recomendado é inventariar outra fronteira compartilhada de baixo risco. Módulos com storage, WebGL, Supabase adicional, autenticação ou bridges devem continuar em ondas separadas.

**Autor:** Manus AI

**SHA de implementação:** `d35600b5764c1c59eb1c90295968a31d85d70152`.

**Data:** 2026-08-20.
