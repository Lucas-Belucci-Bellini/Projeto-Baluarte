# Migração TypeScript — Wave 23

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover os consumidores reais dos utilitários JARVIS já tipados para os módulos TypeScript canônicos, preservando os wrappers JavaScript de compatibilidade, a API pública, o boot da V1, o comportamento de permissões e o ciclo de vida da integração Spotify.

> Esta onda é uma promoção de fronteiras de importação, não uma reescrita dos engines JARVIS. Os módulos de rede, autenticação, polling, memória e permissões foram auditados antes da alteração; nenhum segredo foi introduzido e nenhum serviço externo foi acionado pelos testes.

## Baseline e publicação

A Wave 23 partiu do `main` em `eba1e362444b1e0895d2a5ae66f99a9c6db77051`, com `origin/main` sincronizado e 99 rotas registradas. A implementação foi publicada em um commit normal, sem PR e sem force push:

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `9753ea269eb3684ddfb3ad19a9194597aae9652c` |
| Mensagem | `refactor(jarvis): promote typed utility consumers` |
| Data da execução | 20 de agosto de 2026 |
| Rotas descobertas | 99 |
| Domínios Nexus | 21/21 |
| Lacunas Nexus | 0 |

O hash completo acima é o commit publicado da implementação. Este documento é fechado em um commit documental separado para que o SHA de código permaneça verificável e imutável.

## Contrato auditado

A fronteira promovida mantém os seguintes contratos públicos:

| Módulo canônico | Responsabilidade | Garantia preservada |
|---|---|---|
| `src/utils/jarvis-context.ts` | Briefing cacheado, contexto de runtime e seleção limitada de mensagens | Cache permanece somente em memória; janela de contexto continua limitada por caracteres e mensagens |
| `src/utils/jarvis-permissoes.ts` | Mapa tool → permissão e fallback de permissão | `deny-by-default` continua vigente; ferramenta não mapeada recebe `jarvis.skills.executar` |
| `src/utils/jarvis-music-presence.ts` | Presença passiva de mídia HTML, embed Spotify e playback Spotify API | Somente metadados; nenhum áudio é capturado; listeners possuem `start`/`stop` simétricos |
| `src/utils/jarvis-spotify-session.ts` | Estado de autorização Spotify via PKCE e ciclo do monitor | `state` e `code_verifier` continuam em `sessionStorage`; tokens permanecem em memória; desconexão para monitor e limpa sessão pendente |
| `src/utils/jarvis-spotify.ts` | Desafio PKCE, troca/refresh de token e monitor de playback | Endpoint e escopo existentes preservados; polling mínimo de 15 s, backoff até 120 s, refresh em 401 e respeito a `Retry-After` em 429 |

O boot chama `startJarvisMusicPresence()` e `resumeSpotifyAuthorization()` como antes. A página `/jarvis` continua usando a mesma API de contexto e sessão. A página `/musicas` continua observando embeds pelo mesmo par de funções. A política de tools permanece no mesmo gargalo `runTool()` e não foi aberta por esta mudança.

## Implementação

Os consumidores foram retargetados para specifiers **extensionless**, que é o padrão aceito pelo `tsconfig` atual quando um wrapper `.js` e uma implementação `.ts` coexistem. O wrapper continua disponível para consumidores legados, mas os consumidores migrados deixam de depender dele.

| Arquivo | Alteração |
|---|---|
| `src/main.js` | Boot V1 passa a importar presença musical e sessão Spotify pelos módulos TypeScript canônicos |
| `src/pages/jarvis.ts` | Contexto de runtime e controles de sessão Spotify passam a resolver os módulos canônicos |
| `src/pages/musicas.ts` | Presença musical passa a resolver o módulo TypeScript canônico |
| `src/utils/jarvis-engine.js` | Briefing do engine passa a resolver `jarvis-context` canônico |
| `src/utils/jarvis-tools.js` | Política de permissões passa a resolver `jarvis-permissoes` canônico |
| `src/utils/jarvis-contracts.ts` | Tipo `PermissionId` passa a vir da fronteira TypeScript canônica |
| `src/utils/jarvis-spotify-session.ts` | Runtime e tipos do módulo Spotify passam a usar a resolução canônica |
| `src/utils/jarvis-spotify.ts` | Publicação de playback passa a usar a presença musical canônica |
| `src/utils/jarvis-tools.d.ts` | Documentação atualizada para referenciar `jarvis-permissoes.ts` |
| `docs/nexus/dominios.json` | `src/main.js` e os módulos canônicos promovidos foram registrados no domínio correto, no mesmo changeset do bootstrap |

## Correção encontrada durante a onda

A primeira tentativa usou extensões explícitas `.ts` em imports estáticos. O `npm run tipos:ts` encontrou cinco ocorrências de `TS5097` em `jarvis.ts`, `musicas.ts`, `jarvis-spotify-session.ts` e `jarvis-spotify.ts`, porque o projeto não habilita `allowImportingTsExtensions`.

A causa raiz foi a regra atual de resolução do TypeScript, não uma incompatibilidade dos contratos JARVIS. A correção foi substituir os cinco specifiers por caminhos extensionless. Não houve relaxamento de `strict`, inclusão de `any`, `@ts-ignore`, `@ts-nocheck`, exclusão de arquivos ou mudança de configuração. A segunda execução de `npm run tipos:ts` passou.

## O que não foi promovido nesta onda

`jarvis-style.js` e `jarvis-recall.js` continuam sem implementação `.ts` canônica correspondente e, portanto, não foram falsamente apontados para um arquivo inexistente. Também permanecem fora da promoção estrutural os wrappers e implementações de `jarvis-hermes-native`, `jarvis-repo-memory`, `jarvis-engine`, `jarvis-tools`, `jarvis-skills`, `jarvis-webllm` e demais bridges maiores como código canônico; os dois consumers legados `jarvis-engine.js` e `jarvis-tools.js` somente trocaram suas dependências puras para os módulos já tipados.

Nenhuma alteração foi feita em OpenClaw, WhatsApp, notícias, Hermes/WebLLM, Supabase/RLS, autenticação do site, Vercel, layout, roteamento de páginas, permissões administrativas ou envio de conteúdo externo. Esses contratos ficam para ondas específicas, com testes próprios e rollback independente.

## Gates locais

Os gates foram executados depois da correção do TS5097. Os artefatos transitórios gerados pelo smoke, contendo tempos e títulos não determinísticos, foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| `npm run verificar-nexus` | verde | 99 rotas, 97 no mapa de domínio, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde | segunda execução passou após specifiers extensionless |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | 1.085 testes, 1.085 pass, 0 fail, 0 skipped |
| `npm run build` | verde | build concluído em 9,12 s; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 ao interpretar `edition2024` de `getrandom v0.4.3` |

A falha local do Rust não foi causada pela Wave 23 e não foi mascarada. O CI remoto usa toolchain estável compatível e deve ser considerado a validação autoritativa desse gate enquanto o ambiente local permanecer em Cargo 1.75.0.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| rustc | `1.75.0` |
| Pacote | `1.1.5` |

## Risco, observabilidade e rollback

O risco principal desta onda é uma resolução de módulo escolher um wrapper diferente do esperado em um consumer não coberto. TypeScript, build, smoke, caminho crítico e integração V2 cobrem o boot e as rotas principais; a CI também executa os contratos de segurança e a validação das rotas. Como a API não mudou e os wrappers continuam presentes, a reversão é local e simples.

O rollback recomendado é restaurar os imports promovidos aos specifiers `.js`, remover as entradas TypeScript adicionadas ao mapa Nexus e publicar um commit normal no `main`. Não é necessário reverter histórico, usar force push ou apagar os módulos canônicos. A política de permissões, o escopo Spotify, a coleta passiva de metadados e o fallback da V1 continuam observáveis pelos mesmos diagnósticos existentes.

## CI remota

A execução remota foi disparada para o SHA `9753ea26` e todos os workflows aplicáveis terminaram com sucesso.

| Workflow | Run inicial | Estado no momento da redação |
|---|---:|---|
| CI | `32333952542` | success |
| Core CI | `32333952655` | success |
| V2 Core | `32333952572` | success |
| V2 Runtime | `32333952512` | success |
| V2 Validation | `32333952604` | success |
| Vigia das rotas | `32333952555` | success |
| Arma 3 Data CI | `32333952558` | success |
| CodeQL | `32333952603` | success |

## Critério de conclusão

A Wave 23 está encerrada: a CI remota confirmou o SHA de implementação, este documento registra o resultado e nenhum gate remoto registrou regressão. O próximo passo recomendado é auditar a fronteira dos módulos Spotify/PKCE e Hermes antes de promover wrappers de rede ou bridges externos; `jarvis-style`, `jarvis-recall`, `jarvis-hermes-native` e `jarvis-repo-memory` permanecem ondas separadas.

**Autor:** Manus AI

**Fontes locais:** [`src/main.js`](../../src/main.js), [`src/pages/jarvis.ts`](../../src/pages/jarvis.ts), [`src/utils/jarvis-context.ts`](../../src/utils/jarvis-context.ts), [`src/utils/jarvis-permissoes.ts`](../../src/utils/jarvis-permissoes.ts), [`src/utils/jarvis-music-presence.ts`](../../src/utils/jarvis-music-presence.ts), [`src/utils/jarvis-spotify-session.ts`](../../src/utils/jarvis-spotify-session.ts), [`src/utils/jarvis-spotify.ts`](../../src/utils/jarvis-spotify.ts), [`docs/nexus/dominios.json`](../../docs/nexus/dominios.json).

**SHA de implementação:** `9753ea269eb3684ddfb3ad19a9194597aae9652c`.

**Data da redação:** 2026-08-20.

[1]: ../../src/main.js "Bootstrap V1"
[2]: ../../src/pages/jarvis.ts "Página canônica do JARVIS"
[3]: ../../src/utils/jarvis-context.ts "Contexto TypeScript do JARVIS"
[4]: ../../src/utils/jarvis-permissoes.ts "Mapa TypeScript de permissões"
[5]: ../../src/utils/jarvis-music-presence.ts "Presença musical TypeScript"
[6]: ../../src/utils/jarvis-spotify-session.ts "Sessão Spotify PKCE"
[7]: ../../src/utils/jarvis-spotify.ts "Monitor Spotify"
[8]: ../../docs/nexus/dominios.json "Mapa Nexus"
