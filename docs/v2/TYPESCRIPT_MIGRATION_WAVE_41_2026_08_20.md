# TypeScript Migration Wave 41 — Learning and Terminal Consumers

**Data:** 20 de agosto de 2026

**Branch de entrega:** `main`

**Status:** gates locais concluídos; pronta para commit e publicação

**Autor:** Manus AI

## Objetivo

A Wave 41 promove os dynamic imports de `aprendizado.ts` e `terminal-ia.ts` usados pelo Núcleo Nexus e pelo Cockpit Nexus. Os dois consumers TypeScript deixam de apontar explicitamente para wrappers `.js` e passam a resolver os módulos canônicos TypeScript com specifiers extensionless.

A alteração é de fronteira de módulo e mantém os contratos funcionais existentes. O painel de aprendizado continua somente leitura para as memórias do navegador, com sincronização explícita do repositório quando o usuário aciona o botão. O Terminal-IA continua tentando o servidor e degradando para o modo local quando a IA remota não está disponível.

> **Contrato promovido:** os quatro imports `aprendizado` e `terminal-ia` em `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts` agora carregam diretamente as implementações `.ts`, sem `.js` e sem `.ts` no caminho do dynamic import.

## Arquivos alterados

| Arquivo | Alteração | Motivo |
|---|---|---|
| `src/pages/git-nexus-cockpit.ts` | Imports de `aprendizado` e `terminal-ia` migrados para specifiers extensionless | Consumers TypeScript apontam para as implementações canônicas |
| `src/pages/git-nexus-nucleo.ts` | Os mesmos dois imports migrados para specifiers extensionless | Núcleo e Cockpit mantêm a mesma resolução de módulos |
| `docs/nexus/dominios.json` | Registrados `src/pages/aprendizado.ts` e `src/pages/terminal-ia.ts` no domínio JARVIS | Sincronizar o mapa Nexus com os arquivos usados |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_41_2026_08_20.md` | Novo relatório | Registrar contrato, validação, riscos e rollback |

Os wrappers `src/pages/aprendizado.js` e `src/pages/terminal-ia.js` permanecem intencionalmente no repositório. Eles continuam disponíveis para qualquer consumer JavaScript ainda não migrado e preservam a estratégia de migração incremental.

## Comportamento preservado

### Aprendizado

`aprendizado.ts` continua montando um painel de análise das memórias existentes. Ele cria corpus, estatísticas, clusters, ranking TF-IDF, gráfico de crescimento de vocabulário e modelo bigrama local. O painel informa que a análise é somente leitura. A sincronização de memórias do repositório continua dependente de ação explícita no botão e permanece protegida pelo tratamento de erro existente.

A promoção não altera `jarvis-brain.js`, `memory-ml.js`, `llm-mini.js`, persistência, rota, storage ou dados do codemap. Não houve mudança de algoritmo nem de payload.

### Terminal-IA

`terminal-ia.ts` continua oferecendo comandos `:go`, `:mem`, `:code`, `:chart`, `:brain`, `:clear` e `:help`. Perguntas livres tentam `processServer`; se o servidor falhar, o terminal usa `processLocal` e informa a degradação para modo local. A navegação, a memória local, o desenho de charts e o histórico do input mantêm o mesmo lifecycle.

A promoção não altera o endpoint do servidor, o prompt, o contrato de `JarvisConfig`, os comandos, os dados do Segundo Cérebro ou o comportamento de fallback. O carregamento continua lazy e só acontece quando a aba ou função é aberta.

## Segurança e fronteiras

Nenhuma regra de autenticação, autorização, RLS, Supabase, telemetria, fingerprint, geolocalização, PKCE, segredo ou canal IPC foi alterada. O mapa Nexus foi atualizado no mesmo changeset dos consumers TypeScript.

A alteração não transforma imports lazy em imports eager, portanto não cria uma nova superfície de execução no boot. O Cockpit e o Núcleo continuam encapsulando falhas de carregamento e exibindo as mensagens de erro já existentes.

As fronteiras sensíveis continuam fora desta onda: `hx-beacon.ts`, `jarvis-repo-memory.ts`, `jarvis-spotify.ts` e `jarvis-hermes-agent.js`. Elas exigem auditorias próprias por envolverem telemetria, rede, memória remota, PKCE, polling, segredo ou contrato de agente.

## Gates executados

Todos os gates abaixo foram executados localmente sobre a árvore da Wave 41.

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
| `npm run v2:runtime` | CONHECIDO | Exit 101 local por Cargo 1.75.0 e metadata `edition2024`; não mascarado |

Os avisos de chunks acima de 500 kB continuam conhecidos e concentrados nos bundles de Three.js e assets da Arma 3. Nenhuma configuração foi relaxada para silenciá-los.

## Resultado da integração V2

A integração V2 confirmou o boot do navegador, os cinco módulos, sessões de Runtime, saúde do Registry e Platform, incidentes de health, as rotas reais da V1, manifesto, view nativa, cena 3D, scheduler, métricas, permissões e adaptador V1. Resultado: `21/21`.

O smoke confirmou `99/99` rotas verdes. O caminho crítico confirmou boot, navegação, estado entre rotas, persistência de permissões através de reload e retorno à home com `15/15` afirmações verdes.

## Runtime Rust: limitação conhecida

O gate local `npm run v2:runtime` terminou com exit 101 porque o Cargo 1.75.0 não reconhece a feature `edition2024` exigida pela metadata da dependência `getrandom v0.4.3`. A falha é conhecida do ambiente, não foi causada pela promoção de imports e não foi escondida ou contornada.

A Wave 40 foi publicada e seus workflows remotos terminaram verdes, incluindo CI, Core CI, CodeQL, V2 Runtime, V2 Validation, Arma 3 Data CI e Vigia das rotas. A Wave 41 ainda precisa da validação remota do seu próprio commit.

## Rollback

O rollback deve usar revert normal no `main`, sem force push:

```bash
git revert <SHA_DA_WAVE_41>
git push origin main
```

O revert deve restaurar os quatro imports `.js` em `git-nexus-cockpit.ts` e `git-nexus-nucleo.ts` e remover as duas entradas `.ts` adicionadas ao Nexus. As implementações TypeScript e os wrappers `.js` devem permanecer no repositório.

Após o revert, repetir `git diff --check`, `npm run verificar-nexus`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Publicação

A publicação será feita diretamente no branch `main`. Antes do commit, será executado `fetch origin main`; qualquer avanço remoto será integrado por `git merge --no-edit origin/main`. Não será usada PR nem force push.

**SHA da Wave 41:** será preenchido após o commit.

## Próximo passo recomendado

Após o CI remoto da Wave 41 ficar verde, auditar os próximos consumers TypeScript que ainda carregam wrappers `.js`, especialmente os módulos restantes do Núcleo e do Cockpit. A migração deve seguir a mesma regra: promover apenas fronteiras já tipadas, manter wrappers para JavaScript, atualizar o Nexus no mesmo changeset e não misturar a migração com mudanças de produto.

As fronteiras de telemetria, memória remota, Spotify e agente Hermes devem continuar separadas para auditorias específicas.
