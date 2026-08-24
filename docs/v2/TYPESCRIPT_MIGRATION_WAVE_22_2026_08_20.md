# Migração TypeScript — Wave 22

**Status:** publicada diretamente no `main`; implementação e CI remota concluídas com sucesso.

**Objetivo:** remover os carregamentos internos restantes de wrappers JavaScript para JARVIS, Dashboard e JARVIS Vision, promovendo os módulos TypeScript canônicos sem alterar engines, bridges, permissões, sessões ou integração OpenClaw.

## Baseline

A Wave 22 parte do `main` em `5774b27d85cb5cca60f827bb6868f8a408d0e518`, após o fechamento documental da Wave 21. A execução de push do Vigia das rotas terminou verde; uma segunda execução agendada para o mesmo SHA foi observada separadamente.

`src/pages/jarvis.ts` tem 1.144 linhas e exporta `jarvisPage`. O arquivo `jarvis.js` é wrapper de compatibilidade. `jarvis-dashboard.ts` tem 534 linhas e `jarvis-dashboard.js` é wrapper. `jarvis-vision.ts` tem o contrato explícito de CDN/câmera e já foi promovido no router na Wave 19, mas ainda era carregado por wrappers dentro do cockpit/núcleo.

## Contratos auditados

O JARVIS completo mantém múltiplos modos (`local`, `webllm`, Hermes local/servidor/agente, Claude, Ollama, servidor, notícias, Claude servidor, OpenClaw e agente), sessões persistidas, memória, skills, Spotify e runtime context. A página usa `loadConfig`/`saveConfig`, engines `process*`, memória IndexedDB/local fallback, permissões de ferramentas e pontes externas. Essa superfície não será reescrita nem terá comportamento alterado nesta fatia.

O `git-nexus-cockpit.ts` e o `git-nexus-nucleo.ts` possuem loaders lazy que retornam `Promise<HTMLElement>` e chamam somente os símbolos públicos das páginas. A substituição de `import('./jarvis.js')` por `import('./jarvis.ts')`, e equivalentes para Dashboard e Vision, preserva a assinatura e o isolamento lazy. Os wrappers continuam no repositório para consumidores JavaScript legados.

Nenhuma chamada OpenClaw, Spotify, CDN, WebGPU, API de modelo, publicação, login ou escrita externa será executada pelos gates. Os testes somente validam resolução de módulos, boot, navegação, fallback e contratos existentes.

## Primeira fatia implementada

Nos carregadores internos:

```text
src/pages/git-nexus-cockpit.ts
  jarvis.js          → resolução extensionless de ./jarvis
  jarvis-dashboard.js→ resolução extensionless de ./jarvis-dashboard
  jarvis-vision.js   → resolução extensionless de ./jarvis-vision

src/pages/git-nexus-nucleo.ts
  jarvis.js          → resolução extensionless de ./jarvis
  jarvis-dashboard.js→ resolução extensionless de ./jarvis-dashboard
  jarvis-vision.js   → resolução extensionless de ./jarvis-vision
```

A primeira tentativa com extensões explícitas `.ts` produziu seis erros `TS5097`, porque o `tsconfig` não habilita `allowImportingTsExtensions`. A causa raiz foi a regra de resolução do TypeScript, não o contrato JARVIS. A correção segura foi usar specifiers extensionless, que resolvem os arquivos canônicos TypeScript sem relaxar `strict` nem alterar o `tsconfig`.

O router V1 e o gate Nexus permanecem inalterados nesta fatia. `docs/nexus/dominios.json` foi sincronizado para refletir as três páginas canônicas TypeScript. Os wrappers permanecem disponíveis, mas deixam de ser o caminho usado pelo cockpit/núcleo.

## O que permanece bloqueado

A integração de engines, OpenClaw, Spotify, WebLLM, Hermes, servidor e skills não será modificada. A migração de eventuais utilitários JARVIS JavaScript para TypeScript exige ondas separadas, porque possuem contratos de rede, autenticação, sessão, permissões e fallback. A primeira fatia não promete que todo o subgrafo JARVIS esteja convertido; ela remove apenas a resolução interna dos três módulos de página já tipados.

## Gates

Os gates locais foram executados após a alteração e após a correção do TS5097:

| Gate | Resultado | Evidência |
|---|---:|---|
| `node -e JSON.parse(dominios.json)` | verde | mapa Nexus sintaticamente válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde | primeira tentativa encontrou 6 TS5097; segunda execução após specifiers extensionless passou |
| `npm run tipos:v2` | verde | V2 sem erro |
| `npm test` | verde | suíte completa passou; baseline de 1085 testes |
| `npm run build` | verde | build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. Os relatórios transitórios de smoke foram restaurados antes do commit. Nenhuma chamada OpenClaw, Spotify, WebGPU, CDN, API de modelo ou escrita externa foi executada.

## Riscos e rollback

O risco principal é um caminho lazy permanecer apontando para wrapper ou um export divergir. Isso será coberto por TypeScript, build, smoke e os testes de integração do gate. Não há mudança de estado global, persistência ou autorização. Rollback: restaurar as seis extensões internas para `.js` e as três origens Nexus para `.js` em um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 22 foi concluída: os carregadores internos usam os três módulos TypeScript, o Nexus está sincronizado, todos os gates comportamentais passaram e a CI remota terminou verde no SHA de implementação.

| Workflow remoto | Resultado |
|---|---:|
| CI | success |
| Core CI | success |
| V2 Core | success |
| V2 Runtime | success |
| V2 Validation | success |
| Vigia das rotas | success |
| Arma 3 Data CI | success |
| CodeQL | success |

**Autor:** Manus AI
**SHA de implementação e publicação:** `62839fe7ff50603fc81b18179515a92a4d785566`.
**Data dos gates:** 2026-08-20T04:35Z–04:42Z.
