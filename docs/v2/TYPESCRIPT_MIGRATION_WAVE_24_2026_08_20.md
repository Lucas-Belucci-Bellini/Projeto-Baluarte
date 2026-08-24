# Migração TypeScript — Wave 24

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover a fronteira TypeScript canônica de `baluarte-status` nos consumidores JARVIS auditados, reduzindo dependências desnecessárias do wrapper JavaScript sem alterar o estado global, o diagnóstico, o boot, as permissões, o polling Spotify ou o runtime Nexus.

> Esta é uma onda de retargeting de imports. A implementação de `baluarte-status.ts` já existia e continua sendo a fonte canônica; o wrapper `baluarte-status.js` permanece para consumidores legados. Nenhuma lógica foi reescrita.

## Baseline e publicação

A Wave 24 partiu do fechamento documental da Wave 23 em `6881957bff3f5b6bd91d1907883034bdad9f4f67`, com `origin/main` sincronizado. A implementação foi entregue diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `c9f624b09eff091596834c36e86adeaa3e299aa4` |
| Mensagem | `refactor(jarvis): promote typed status consumer` |
| Rotas descobertas | 99 |
| Arquivos com dono Nexus | 389 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contrato auditado

`baluarte-status.ts` mantém um estado pequeno, local e observável para diagnósticos. Ele expõe `setStatus`, `clearStatus`, `setCurrentFunction`, `getStatusSnapshot` e `getStatusText`; clona valores aninhados ao produzir snapshots e não faz fetch, WebSocket, persistência, autenticação ou chamada de modelo.

| Consumidor promovido | Uso preservado | Risco controlado |
|---|---|---|
| `src/utils/jarvis-context.ts` | Inclui o estado atual do site no contexto somente leitura | Nenhuma mudança no briefing, cache ou janela de mensagens |
| `src/utils/jarvis-music-presence.ts` | Publica playback e limpa `jarvisMusic` quando fica idle | Nenhuma mudança na privacidade, nos listeners ou nos metadados Spotify |
| `src/utils/jarvis-tools.js` | Lê o snapshot para a tool de diagnóstico | Nenhuma mudança no catálogo, no guard ou no deny-by-default |
| `src/pages/git-nexus-nucleo.ts` | Renderiza o texto de status no núcleo | Nenhuma mudança em Hermes, WebLLM, WebSocket, cena 3D ou lifecycle V2 |

O contrato de compatibilidade permanece intacto: consumidores JavaScript que ainda importam `baluarte-status.js` continuam recebendo os mesmos exports reexportados de `baluarte-status.ts`.

## Implementação

Os quatro consumers foram trocados para a implementação canônica. Em arquivos TypeScript foi usado o specifier extensionless, conforme a regra do projeto para coexistência de `.js` wrapper e `.ts` canônico. Nenhuma rota foi adicionada, removida ou renomeada.

| Arquivo | Alteração |
|---|---|
| `src/utils/jarvis-context.ts` | `baluarte-status.js` → resolução extensionless de `baluarte-status.ts` |
| `src/utils/jarvis-music-presence.ts` | `baluarte-status.js` → resolução extensionless de `baluarte-status.ts` |
| `src/utils/jarvis-tools.js` | `baluarte-status.js` → `baluarte-status.ts` no consumer JavaScript legado |
| `src/pages/git-nexus-nucleo.ts` | `baluarte-status.js` → resolução extensionless de `baluarte-status.ts` |
| `docs/nexus/dominios.json` | `baluarte-status.ts` registrado junto ao domínio Core |

O `src/main.js` não foi alterado nesta onda; por isso, a sincronização necessária foi apenas a inclusão do arquivo canônico no domínio Core, sem mudança no conjunto de 99 rotas.

## Escopo mantido fora

Não foram tocados `jarvis-style.js`, `jarvis-recall.js`, `jarvis-hermes-native.js`, `jarvis-repo-memory.js`, `jarvis-spotify.js`, `jarvis-spotify-session.js`, `jarvis-engine.js`, `jarvis-tools.js` além do import pontual, OpenClaw, WhatsApp, notícias, Supabase/RLS, Vercel, autenticação, layout, módulo de permissões administrativas ou qualquer envio externo.

As páginas TypeScript que ainda usam `baluarte-status.js` — como shell, editor, calculadoras e ferramentas — permanecem candidatas para uma onda posterior, depois de observar a CI desta promoção JARVIS. Essa decisão mantém a fatia pequena e permite rollback imediato se surgir um problema de resolução em consumer não auditado.

## Gates locais

Os gates locais foram executados após a alteração, com Vite stale encerrado antes da integração. Os relatórios transitórios gerados pelo smoke, com tempos e títulos não determinísticos, foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 389 arquivos com dono |
| `npm run tipos:ts` | verde | resolução TypeScript concluída |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 7,98 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A limitação Rust é ambiental e já conhecida: o Cargo local não interpreta o metadata `edition2024`. Nenhuma configuração foi relaxada ou alterada para esconder a falha; o CI remoto usa toolchain compatível.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal é algum consumer legado resolver o wrapper em vez do `.ts` canônico, ou haver uma diferença de inicialização global em um caminho que não foi coberto pelos quatro consumers auditados. TypeScript, build, integração V2, smoke e caminho crítico cobrem a V1/V2 pública; os wrappers continuam disponíveis como fallback.

O rollback é restaurar os quatro imports para `.js`, remover a linha de `baluarte-status.ts` do mapa Nexus e publicar um commit normal no `main`. Não é necessário reverter histórico, apagar a implementação TypeScript ou usar force push.

## CI remota

A execução remota foi disparada para o SHA `c9f624b0`; todos os workflows aplicáveis terminaram com sucesso.

| Workflow | Run inicial | Estado no momento da redação |
|---|---:|---|
| CI | `32334668796` | success |
| Core CI | `32334668772` | success |
| V2 Core | `32334668715` | success |
| V2 Runtime | `32334668917` | success |
| V2 Validation | `32334668816` | success |
| Vigia das rotas | `32334668701` | success |
| Arma 3 Data CI | `32334668832` | success |
| CodeQL | `32334668710` | success |

## Critério de conclusão

A Wave 24 está encerrada: a CI remota confirmou o SHA de implementação, este documento registra o resultado e nenhum workflow registrou regressão. O próximo passo recomendado é promover os demais consumidores TypeScript de `baluarte-status` ou auditar a próxima fronteira pura, antes de voltar aos módulos JARVIS com rede, autenticação, memória ou bridges.

**Autor:** Manus AI

**SHA de implementação:** `c9f624b09eff091596834c36e86adeaa3e299aa4`.

**Data:** 2026-08-20.
