# Migração TypeScript — Wave 25

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** concluir a promoção dos consumidores TypeScript restantes de `baluarte-status`, removendo a dependência de wrapper `.js` em todo o conjunto de páginas e shell já convertidos para TypeScript, sem alterar a lógica das ferramentas, a V1, o Nexus ou o Runtime V2.

> Esta onda fecha uma fronteira de utilidade: todos os 14 consumidores `.ts` restantes agora resolvem o módulo canônico `baluarte-status.ts`. O wrapper `baluarte-status.js` continua preservado para consumidores JavaScript legados e não foi apagado.

## Baseline e publicação

A Wave 25 partiu do fechamento da Wave 24 em `62205ab6c5c50a5ee22b264d6302d36b3fbd45fe`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `24c199d148b7fc8dcadf7809307d367045bcd1bd` |
| Mensagem | `refactor(core): promote typed status consumers` |
| Consumidores promovidos | 14 |
| Referências `.ts` restantes a `baluarte-status.js` | 0 |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Inventário encerrado

Antes da onda, o inventário encontrou 14 consumidores TypeScript do wrapper de status: o shell principal e 13 páginas/famílias de ferramentas. Todos foram retargetados sem mudança de assinatura.

| Área | Arquivos promovidos |
|---|---|
| Shell | `src/layout/shell.ts` |
| Cálculo e lógica | `src/pages/calc-numerica.ts`, `src/pages/logic-sim.ts`, `src/pages/tabela-verdade.ts` |
| Criptografia e transformação | `src/pages/cripto/index.ts`, `src/pages/esteganografia.ts`, `src/pages/regex.ts` |
| Ferramentas de conteúdo | `src/pages/color-studio.ts`, `src/pages/json-studio.ts`, `src/pages/qr-studio.ts`, `src/pages/simbolos.ts` |
| Interface e terminal | `src/pages/editor.ts`, `src/pages/morse.ts`, `src/pages/terminal.ts` |

Depois da alteração, a busca `rg -n "baluarte-status\\.js" src --glob '*.ts'` não encontrou nenhuma referência. Os wrappers JavaScript continuam no repositório e podem ser consumidos por módulos ainda não migrados.

## Contrato auditado

`baluarte-status.ts` é um estado local pequeno que expõe `setStatus`, `clearStatus`, `setCurrentFunction`, `getStatusSnapshot` e `getStatusText`. Ele não faz rede, não persiste dados, não autentica usuário, não abre sockets, não executa ferramentas e não depende de OpenClaw, Spotify, Hermes ou WebLLM.

A promoção manteve quatro propriedades importantes: o estado continua sendo atualizado durante o boot e a navegação; snapshots continuam clonando estruturas aninhadas; `clearStatus` continua removendo somente a chave solicitada; e o wrapper JavaScript segue reexportando os mesmos símbolos. O shell, o editor, as calculadoras, os simuladores, os estúdios e o terminal somente mudaram a resolução do módulo importado.

## Implementação

Nos 14 arquivos TypeScript, os imports `.js` foram substituídos por specifiers extensionless, padrão usado pelo projeto para permitir que TypeScript resolva a implementação `.ts` canônica quando o wrapper `.js` ainda existe.

| Grupo | Resultado |
|---|---|
| `src/layout/shell.ts` | Atualiza a função corrente pelo status canônico |
| `src/pages/*.ts` | 13 páginas passam a publicar status no módulo TypeScript |
| Wrapper `src/utils/baluarte-status.js` | Mantido para compatibilidade; não foi deletado |
| Nexus | Nenhuma rota mudou; o mapa Nexus já registrava o domínio Core e continua válido |

Não houve alteração no `src/main.js`; portanto, não foi necessário alterar o conjunto de rotas nem adicionar uma entrada de rota no mapa. A fronteira é interna aos módulos já registrados.

## Escopo mantido fora

Esta onda não promoveu wrappers de engines de cálculo, VFS, parser lógico, áudio, câmera ou terminal; apenas mudou o import do status. Também ficaram fora `jarvis-style.js`, `jarvis-recall.js`, `jarvis-hermes-native.js`, `jarvis-repo-memory.js`, `jarvis-spotify.js`, `jarvis-spotify-session.js`, OpenClaw, WhatsApp, notícias, Supabase/RLS, Vercel, autenticação e layout visual.

A próxima decisão pode ser promover consumidores JavaScript restantes de `baluarte-status` ou escolher outra fronteira TypeScript pura. Não é recomendado misturar nesta mesma onda os módulos JARVIS com rede, autenticação, memória ou bridges.

## Gates locais

Os gates rápidos e comportamentais foram executados após as 14 substituições. Vite stale foi encerrado antes da integração. Os relatórios transitórios do smoke, que contêm tempos e títulos não determinísticos, foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 389 arquivos com dono |
| `npm run tipos:ts` | verde | 0 referências TS restantes ao wrapper de status |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 8,73 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A falha local do Rust continua ambiental e não foi escondida por configuração. O CI remoto usa toolchain compatível e é a validação autoritativa desse gate.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal é uma diferença de resolução entre um consumer TypeScript e o wrapper mantido para JavaScript. A API pública não mudou, o wrapper continua disponível e os gates cobrem boot, navegação, V1, V2, build e rotas.

O rollback é restaurar os 14 imports para `.js` e publicar um commit normal no `main`. Não é necessário remover `baluarte-status.ts`, alterar `strict`, apagar wrappers ou reescrever histórico.

## CI remota

A execução remota foi disparada para o SHA curto `24c199d1`; todos os oito workflows aplicáveis terminaram com sucesso.

| Workflow | Run inicial | Estado no momento da redação |
|---|---:|---|
| CI | `32335463574` | success |
| Core CI | `32335463557` | success |
| V2 Core | `32335463539` | success |
| V2 Runtime | `32335463593` | success |
| V2 Validation | `32335463507` | success |
| Vigia das rotas | `32335463560` | success |
| Arma 3 Data CI | `32335463505` | success |
| CodeQL | `32335463525` | success |

## Critério de conclusão

A Wave 25 está encerrada: a CI remota confirmou o SHA de implementação, o relatório registra o resultado e nenhum workflow registrou regressão. A fronteira `baluarte-status` está totalmente promovida nos consumidores TypeScript, com wrappers mantidos para a migração gradual do restante do JavaScript.

**Autor:** Manus AI

**SHA de implementação:** `24c199d148b7fc8dcadf7809307d367045bcd1bd`.

**Data:** 2026-08-20.
