# Migração TypeScript — Wave 31

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover `scroll-reveal.ts`, `pwa.ts` e `visit-counter.ts` nos consumers TypeScript comprovados, mantendo o lifecycle de IntersectionObserver, o CTA PWA, o guard de `sessionStorage`, a RPC Supabase e os fallbacks existentes.

> Esta onda altera somente a resolução dos imports. Nenhum listener, timeout, consulta, RPC, política RLS, chave de sessionStorage ou comportamento visual foi reescrito.

## Baseline e publicação

A Wave 31 partiu do fechamento documental da Wave 30 em `0c7b9e4ff4694a11a1cf7923be84aa958df2ba18`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `ab18a6ad1dc957c94614b07b0defb5ce2a6b4a95` |
| Mensagem | `refactor(shell): promote typed reveal pwa visit` |
| Arquivos alterados | 4 |
| Consumers promovidos | 3 |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contratos auditados

`scroll-reveal.ts` continua respeitando `prefers-reduced-motion`, a disponibilidade de `IntersectionObserver`, o filtro de filhos e os observers separados para blocos altos. A chamada do shell continua ocorrendo depois da montagem da página, sem alterar a sequência do render.

`pwa.ts` continua retendo o `beforeinstallprompt`, notificando listeners, limpando o prompt após `appinstalled`, detectando standalone e retornando `false` quando não existe prompt disponível. A sidebar continua usando os mesmos três métodos para exibir e atualizar o CTA.

`visit-counter.ts` continua usando `sessionStorage` somente como guard local. Em uma primeira visita, a função chama `dbRpc('bump_visits')`, marca `baluarte:visit-counted` e retorna o total; em visitas seguintes, lê o total sem inflar a contagem. Se Supabase, RPC, tabela, RLS, storage ou rede não estiverem disponíveis, o resultado continua sendo `null`.

| Módulo | Consumer | Garantia preservada |
|---|---|---|
| `scroll-reveal.ts` | `src/layout/shell.ts` | reveal, observers, reduced motion e rota continuam iguais |
| `pwa.ts` | `src/layout/sidebar.ts` | CTA, prompt, listener e standalone continuam iguais |
| `visit-counter.ts` | `src/pages/home.ts` | guard de sessão, RPC, leitura e fallback nulo continuam iguais |

Os wrappers `scroll-reveal.js`, `pwa.js` e `visit-counter.js` continuam reexportando as APIs públicas.

## Implementação

| Arquivo | Alteração |
|---|---|
| `src/layout/shell.ts` | `scroll-reveal.js` → `scroll-reveal.ts` |
| `src/layout/sidebar.ts` | `pwa.js` → `pwa.ts` |
| `src/pages/home.ts` | `visit-counter.js` → `visit-counter.ts` |
| `docs/nexus/dominios.json` | Registro dos três módulos TypeScript nos domínios shell/Core |

Nenhuma rota foi adicionada, removida ou renomeada. O `src/main.js` não foi alterado nesta onda.

## Escopo mantido fora

Não foram tocados `page-views.ts`, `supabase.ts`, SQL, migrations, RLS, service role, router, storage geral, autenticação, Spotify, Hermes, WebLLM, OpenClaw, WebGL ou Vercel. Embora `visit-counter.ts` leia e escreva via RPC, esta onda não altera a superfície externa nem executa nova política de dados.

## Gates locais

Os gates foram executados após a promoção. Vite stale foi encerrado antes da integração. Artefatos transitórios do smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 401 arquivos com dono |
| `npm run tipos:ts` | verde | shell, sidebar e home resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 9,49 s; apenas avisos conhecidos de chunks grandes |
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

O risco principal era alterar comportamento de instalação PWA, revelar blocos fora de hora ou inflar métricas por divergência do guard de sessão. Os tipos, build, smoke, caminho crítico, integração V2 e CI confirmaram a resolução sem regressão.

O rollback é restaurar os três imports para `.js`, remover as três entradas TypeScript adicionadas ao mapa Nexus e publicar um commit normal no `main`. Não é necessário alterar sessionStorage, RPC, RLS, service worker, IntersectionObserver ou histórico.

## CI remota

A execução remota foi disparada para o SHA curto `ab18a6ad`; todos os oito workflows terminaram com sucesso.

| Workflow | Run | Resultado |
|---|---:|---|
| CI | `32340454127` | success |
| Core CI | `32340454086` | success |
| V2 Core | `32340453943` | success |
| V2 Runtime | `32340453954` | success |
| V2 Validation | `32340453931` | success |
| Vigia das rotas | `32340453952` | success |
| Arma 3 Data CI | `32340453959` | success |
| CodeQL | `32340453939` | success |

Os avisos do Vigia sobre Node 20 forçado para Node 24 são informativos do workflow e não representam falha desta onda.

## Critério de conclusão

A Wave 31 está encerrada: shell, sidebar e home resolvem os módulos TypeScript canônicos, wrappers permanecem disponíveis, lifecycle DOM/PWA/sessionStorage e contratos Supabase não mudaram, gates locais passaram e a CI remota confirmou os oito workflows sem regressão.

O próximo passo recomendado é continuar o inventário de utilitários TS-backed restantes, mantendo integrações externas e alterações de schema em ondas isoladas.

**Autor:** Manus AI

**SHA de implementação:** `ab18a6ad1dc957c94614b07b0defb5ce2a6b4a95`.

**Data:** 2026-08-20.
