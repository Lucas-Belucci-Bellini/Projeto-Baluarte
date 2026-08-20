# TypeScript Migration Wave 39 — Native Hermes Consumer

**Data:** 20 de agosto de 2026

**Branch de entrega:** `main`

**Status:** pronta para publicação; gates locais concluídos

**Autor:** Manus AI

## Objetivo

A Wave 39 promove o consumer TypeScript do status do motor Hermes nativo no Núcleo Nexus. O contrato agora é consumido diretamente pela implementação canônica `jarvis-hermes-native.ts`, sem remover o wrapper JavaScript de compatibilidade usado pelo agente Hermes legado.

A alteração é deliberadamente estreita: ela não muda o canal IPC, não altera o payload de geração, não muda a política de fallback e não introduz novos privilégios no navegador. O objetivo é reduzir mais uma dependência TypeScript de um wrapper `.js` sem ampliar a superfície de risco do JARVIS.

> **Contrato promovido:** `nativeHermesStatus(): Promise<NativeHermesStatus>` e o tipo `NativeHermesStatus` passam a ser importados pelo `src/pages/git-nexus-nucleo.ts` a partir do módulo TypeScript canônico, usando specifier sem extensão.

## Arquivos alterados

| Arquivo | Alteração | Motivo |
|---|---|---|
| `src/pages/git-nexus-nucleo.ts` | Imports de `nativeHermesStatus` e `NativeHermesStatus` migrados de `jarvis-hermes-native.js` para `jarvis-hermes-native` | Consumer TypeScript passa a apontar para a implementação canônica sem extensão `.ts` |
| `docs/nexus/dominios.json` | `src/utils/jarvis-hermes-native.ts` registrado no domínio `baluarte-jarvis` | Manter o mapa Nexus sincronizado com a implementação efetivamente usada |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_39_2026_08_20.md` | Novo relatório desta onda | Registrar contrato, validação, riscos e rollback |

O arquivo `src/utils/jarvis-hermes-native.js` permanece intencionalmente no repositório. Ele é o wrapper de compatibilidade para consumers JavaScript, em especial `src/utils/jarvis-hermes-agent.js`, e continua reexportando a implementação TypeScript. Nenhum `src/main.js` foi alterado nesta onda; portanto, a regra de atualização conjunta com o Nexus para mudanças no entrypoint não foi acionada.

## Contrato e comportamento preservado

A implementação canônica em `src/utils/jarvis-hermes-native.ts` mantém os seguintes invariantes:

| Invariante | Comportamento validado |
|---|---|
| Detecção de ambiente | A ponte só é considerada disponível quando `window.baluarte.native === true` e `invoke` é uma função |
| Status sem exceção | `nativeHermesStatus()` retorna `{ available: false }` quando não há Launcher, ponte ou resposta válida |
| Falha da ponte | Erros da consulta de status são absorvidos e convertidos em indisponibilidade |
| Geração nativa | `makeNativeBrain()` continua usando apenas o canal `hermes:generate` da ponte de preload |
| Degradação | Sem motor nativo, o Núcleo informa WebLLM e o agente pode continuar pelo caminho web |
| Compatibilidade JS | O wrapper `.js` segue disponível para o agente Hermes JavaScript |

A página `git-nexus-nucleo.ts` usa o status para atualizar o vital `MOTOR`. Quando o motor nativo está disponível, a interface mostra `NATIVO (GGUF)`; durante download, mostra progresso; quando não há ponte, mostra `WEB (WEBLLM)`. Esse comportamento já existia e não foi redesenhado nesta onda.

## Segurança e fronteiras

A promoção não concede acesso a arquivos locais, não expõe segredo, não altera autenticação, não modifica Supabase e não muda endpoints externos. A ponte continua sendo o funil de preload do aplicativo desktop. O site em navegador permanece sem acesso ao motor nativo e recebe o estado de indisponibilidade com degradação explícita.

O consumer promovido chama somente `nativeHermesStatus()`. A função de geração `makeNativeBrain()` não foi redirecionada nesta onda. Isso separa a migração de tipagem do aumento de superfície de execução e preserva o wrapper para o consumer JavaScript do agente Hermes.

## Gates executados

Todos os gates abaixo foram executados sobre a árvore da Wave 39 antes do commit.

| Gate | Resultado | Observação |
|---|---:|---|
| `git diff --check` | PASS | Nenhum whitespace inválido |
| JSON do Nexus | PASS | `docs/nexus/dominios.json` válido |
| `npm run verificar-nexus` | PASS | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | PASS | TypeScript estrito sem erros |
| `npm run tipos:v2` | PASS | Contratos TypeScript da V2 sem erros |
| Contratos Supabase | PASS | 11/11 testes de contrato verdes |
| `npm test` | PASS | Suite completa verde |
| `npm run build` | PASS | Build concluído; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | PASS | 21/21 afirmações verdes |
| `npm run smoke` | PASS | 99/99 rotas verdes |
| `npm run caminho-critico` | PASS | 15/15 afirmações verdes |
| `npm run v2:runtime` | CONHECIDO | Exit 101 local por limitação do Cargo 1.75.0 com metadata de dependência `edition2024`; não mascarado nem alterado |

O build continua emitindo os avisos conhecidos de chunks acima de 500 kB, principalmente relacionados a Three.js e aos assets da Arma 3. Esses avisos não são regressões desta onda e não foram silenciados.

## Verificação de integração V2

A integração V2 confirmou que o boot do navegador, os cinco módulos, o Runtime, o Registry, o Platform, os incidentes de health, as 19 rotas exercitadas, o manifesto, a view nativa, a cena 3D, o scheduler, as métricas, as permissões e o adaptador da V1 continuam funcionando. O resultado foi `21/21`.

O smoke confirmou `99` rotas descobertas e `99` rotas verdes. O caminho crítico confirmou a jornada completa de boot, navegação, estado entre rotas, persistência de permissões através de reload e retorno à home com `15/15` afirmações.

## Limitação conhecida do runtime Rust

O gate local `npm run v2:runtime` continua sujeito à limitação conhecida do ambiente: o Cargo 1.75.0 falha ao processar metadata de dependência associada a `edition2024`, resultando em exit 101. A limitação não foi causada pelo import promovido, não foi ocultada e não foi corrigida por alteração de configuração. A validação funcional da integração V2 permaneceu verde.

## Riscos e não objetivos

O risco residual principal é a coexistência temporária de consumers TypeScript e JavaScript do mesmo contrato, mitigada pela permanência do wrapper `.js` e pela cobertura de tipos, integração, smoke e caminho crítico. Não foram alterados os canais IPC, o preload, as políticas de autenticação, o módulo de memória, o Spotify, o HX Beacon ou as migrações Supabase.

As seguintes fronteiras continuam fora do escopo por exigirem auditoria específica:

| Fronteira | Motivo para não promover agora |
|---|---|
| `hx-beacon.ts` | Telemetria com fingerprint, geolocalização e `sendBeacon` externo; exige auditoria de privacidade |
| `jarvis-repo-memory.ts` | Consumer JavaScript e comunicação com `/api/memory`; exige auditoria de rede e contrato |
| `jarvis-spotify.ts` | PKCE, criptografia, polling e integração Spotify; exige auditoria mais profunda |
| `jarvis-hermes-agent.js` | Ainda é consumer JavaScript do wrapper; promoção posterior deve preservar o contrato do agente e o fallback |

## Rollback

Para reverter somente esta onda após a publicação, usar o revert normal no `main`, sem force push:

```bash
git revert <SHA_DA_WAVE_39>
git push origin main
```

O rollback deve remover a entrada TypeScript correspondente de `docs/nexus/dominios.json` e restaurar os imports `.js` em `src/pages/git-nexus-nucleo.ts` no mesmo revert. O wrapper `src/utils/jarvis-hermes-native.js` não deve ser removido, pois continua necessário para consumers JavaScript.

Antes de aceitar o rollback, repetir `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Publicação

O SHA publicado deve ser preenchido após a integração final com `origin/main` e o push. A publicação deve ocorrer diretamente no branch `main`, com `fetch` e merge sem force push caso outro processo tenha enviado mudanças concorrentes.

**SHA da Wave 39:** `ae658b8a06dc99e3be1b80abae0b4f5112ee8108`

## Próximo passo recomendado

Depois de o CI da Wave 39 ficar verde, auditar os próximos consumers TypeScript seguros. A prioridade é revisar se existe outro wrapper `.js` com consumer TypeScript puro que não envolva telemetria, rede, segredos ou contratos de runtime. A promoção do `jarvis-hermes-agent.js` deve ficar para uma onda própria, com testes do fallback e do contrato de geração nativa.

A migração dos wrappers com fronteira sensível não deve ser forçada apenas para reduzir a contagem de arquivos `.js`; a regra de governança continua sendo preservar comportamento, segurança e gates verdes.
