# TypeScript Migration Wave 40 — Nexus Page Consumers

**Data:** 20 de agosto de 2026

**Branch de entrega:** `main`

**Status:** gates locais concluídos; pronta para commit e publicação

**Autor:** Manus AI

## Objetivo

A Wave 40 promove cinco dynamic imports usados por consumers TypeScript do Núcleo Nexus e do Cockpit Nexus. Os imports deixam de passar explicitamente pelos wrappers `.js` e passam a usar os módulos canônicos `.ts` por specifiers extensionless, conforme o contrato do TypeScript para dynamic imports em arquivos `.ts` do projeto.

As cinco páginas já possuíam implementação TypeScript canônica: `apis.ts`, `conselho.ts`, `llm-lab.ts`, `cerebro.ts` e `memoria.ts`. Esta onda elimina a dependência desnecessária dos dois consumers TypeScript em relação aos wrappers JavaScript, sem remover os wrappers, sem alterar o router V1 e sem alterar o comportamento visual ou funcional das páginas.

> **Contrato promovido:** `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts` carregam `apis`, `conselho`, `llm-lab`, `cerebro` e `memoria` diretamente pelos módulos TypeScript canônicos, usando `import('./modulo')` sem `.js` e sem `.ts`.

## Arquivos alterados

| Arquivo | Alteração | Motivo |
|---|---|---|
| `src/pages/git-nexus-cockpit.ts` | Cinco dynamic imports passaram de `.js` para specifiers extensionless | Fazer o consumer TypeScript resolver a implementação canônica `.ts` |
| `src/pages/git-nexus-nucleo.ts` | Os mesmos cinco dynamic imports passaram de `.js` para specifiers extensionless | Manter o Núcleo JARVIS alinhado ao Cockpit |
| `docs/nexus/dominios.json` | Registrados `src/pages/apis.ts`, `src/pages/llm-lab.ts` e `src/pages/conselho.ts` | Sincronizar o mapa arquitetural com os arquivos canônicos usados |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_40_2026_08_20.md` | Novo relatório | Registrar contrato, validação, riscos e rollback |

`src/pages/cerebro.ts` e `src/pages/memoria.ts` já estavam registradas no domínio Nexus, portanto não foram duplicadas no mapa. Os wrappers `src/pages/apis.js`, `src/pages/conselho.js`, `src/pages/llm-lab.js`, `src/pages/cerebro.js` e `src/pages/memoria.js` permanecem no repositório para compatibilidade com consumers JavaScript e para permitir migração incremental sem quebra de contratos externos.

## Páginas e superfícies afetadas

| Página | Consumer TypeScript | Implementação canônica | Wrapper preservado |
|---|---|---|---|
| Central de APIs | Núcleo e Cockpit Nexus | `src/pages/apis.ts` | `src/pages/apis.js` |
| Conselho de IAs | Núcleo e Cockpit Nexus | `src/pages/conselho.ts` | `src/pages/conselho.js` |
| Mini-LLM | Núcleo e Cockpit Nexus | `src/pages/llm-lab.ts` | `src/pages/llm-lab.js` |
| Segundo Cérebro | Núcleo e Cockpit Nexus | `src/pages/cerebro.ts` | `src/pages/cerebro.js` |
| Memória | Núcleo e Cockpit Nexus | `src/pages/memoria.ts` | `src/pages/memoria.js` |

Os imports continuam lazy. O carregamento acontece somente quando o usuário abre a aba ou materializa a função correspondente no Núcleo. A alteração não transforma módulos lazy em imports eager e não aumenta o bundle inicial por si só.

## Segurança e compatibilidade

Esta é uma promoção de fronteira de módulo, não uma mudança de autorização. Nenhum segredo, token, endpoint, chamada Supabase, regra RLS, telemetria, fingerprint, geolocalização, PKCE ou canal IPC foi alterado. O mapa Nexus foi atualizado no mesmo changeset dos consumers TypeScript para evitar divergência arquitetural.

A superfície de erro já existente foi preservada: o Cockpit continua exibindo a mensagem de falha quando uma aba não carrega; o Núcleo continua exibindo a mensagem de materialização quando a função falha; e ambos continuam usando carregamento sob demanda. A permanência dos wrappers `.js` evita quebra de consumers JavaScript ainda não migrados.

A Wave 40 não promoveu `hx-beacon.ts`, `jarvis-repo-memory.ts`, `jarvis-spotify.ts` nem `jarvis-hermes-agent.js`. Essas fronteiras continuam bloqueadas ou reservadas para auditoria própria por envolverem telemetria, rede, memória remota, PKCE, polling, segredo ou contrato de agente.

## Gates executados

Todos os gates abaixo foram executados localmente sobre a árvore da Wave 40.

| Gate | Resultado | Observação |
|---|---:|---|
| `git diff --check` | PASS | Nenhum whitespace inválido |
| JSON do Nexus | PASS | `docs/nexus/dominios.json` válido |
| `npm run verificar-nexus` | PASS | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | PASS | TypeScript estrito sem erros |
| `npm run tipos:v2` | PASS | Contratos TypeScript da V2 sem erros |
| Contratos Supabase | PASS | 11/11 testes de contrato verdes |
| `npm test` | PASS | Suite completa verde |
| `npm run build` | PASS | Build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | PASS | 21/21 afirmações verdes |
| `npm run smoke` | PASS | 99/99 rotas verdes |
| `npm run caminho-critico` | PASS | 15/15 afirmações verdes |
| `npm run v2:runtime` | CONHECIDO | Exit 101 local por Cargo 1.75.0 e metadata `edition2024`; não mascarado |

O build continua produzindo avisos conhecidos de chunks maiores que 500 kB, especialmente nos bundles de Three.js e dos assets da Arma 3. Nenhum aviso foi silenciado ou transformado em configuração permissiva.

## Resultado da integração V2

A integração V2 confirmou o boot do navegador, a subida dos cinco módulos, a abertura das sessões de Runtime, a saúde refletida pelo Registry e Platform, as rotas V1 reais, o manifesto, a view nativa, a cena 3D, o scheduler, as métricas, as permissões e o adaptador V1. O resultado foi `21/21`.

O smoke confirmou `99/99` rotas verdes. O caminho crítico confirmou a jornada de boot, navegação, persistência de estado entre rotas, persistência de permissões através de reload e retorno final à home com `15/15` afirmações verdes.

## Runtime Rust: limitação conhecida

O gate local `npm run v2:runtime` terminou com exit 101 porque o Cargo 1.75.0 não reconhece a feature estabilizada posteriormente associada a `edition2024` na dependência `getrandom v0.4.3`. O erro é conhecido no ambiente local, não foi causado pela alteração de imports, não foi ocultado e não foi contornado com relaxamento de configuração.

A execução remota `V2 Runtime` do commit anterior da Wave 39 terminou com sucesso nos workflows do GitHub. A Wave 40 deve aguardar a validação remota do seu próprio commit após a publicação.

## Rollback

O rollback normal deve ser feito sem force push:

```bash
git revert <SHA_DA_WAVE_40>
git push origin main
```

O revert deve restaurar os cinco imports `.js` nos dois consumers TypeScript e remover somente as três entradas `.ts` adicionadas ao Nexus: `apis.ts`, `llm-lab.ts` e `conselho.ts`. As implementações `.ts` e os wrappers `.js` não precisam ser apagados.

Após o revert, repetir `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Publicação

A publicação deve ocorrer diretamente no branch `main`. Antes do commit, fazer `fetch origin main`; se houver avanço remoto, integrar com `git merge --no-edit origin/main`. Não usar PR e não usar force push.

**SHA da Wave 40:** `edad1b8f2679f5d6809d7ab1ddaa27b6014f2c59`

## Próximo passo recomendado

Depois de o CI remoto da Wave 40 ficar verde, continuar a migração de consumers TypeScript que ainda carregam wrappers `.js`, sempre mantendo os wrappers quando existirem consumers JavaScript. A próxima auditoria deve revisar as páginas `aprendizado.ts` e `terminal-ia.ts`, caso seus consumers TypeScript possam ser promovidos sem tocar em contratos de rede, memória remota ou segredo.

As fronteiras sensíveis — `hx-beacon`, memória remota, Spotify e o agente Hermes JavaScript — devem permanecer separadas em ondas próprias, com auditoria de privacidade, rede e comportamento antes de qualquer promoção.
