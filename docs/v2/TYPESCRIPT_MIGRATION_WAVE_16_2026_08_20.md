# Migração TypeScript — Wave 16

**Status:** implementação local concluída; publicação preparada após gates verdes.

**Objetivo:** reduzir o inventário de wrappers JavaScript promovendo `/projetos`, `/calculadoras` e `/cripto` para seus módulos TypeScript canônicos, sem tocar em JARVIS, editor ou páginas com fronteiras externas ainda não auditadas.

## Baseline

A Wave 16 parte do `main` em `4ced5760ec057d893a899ee1090506cf9e00a491`, igual a `origin/main`, após a conclusão verde da Wave 15. O inventário atual mostra que os três candidatos possuem wrappers `.js` pequenos e implementações `.ts` prontas:

| Rota | Wrapper | Implementação | Tamanho TS | Export |
|---|---|---|---:|---|
| `/projetos` | `src/pages/projetos.js` | `src/pages/projetos.ts` | 21 linhas | `projetosPage` |
| `/calculadoras` | `src/pages/calculadoras/index.js` | `src/pages/calculadoras/index.ts` | 28 linhas | `calculadorasPage` |
| `/cripto` | `src/pages/cripto/index.js` | `src/pages/cripto/index.ts` | 42 linhas | `criptoPage` |

## Contratos auditados

`/projetos` é uma página síncrona, lê `src/data/projetos.json` e navega para rotas internas por meio do router. Não usa rede, sessão, Supabase ou permissões. O contrato público é `projetosPage(): HTMLDivElement`.

`/calculadoras` monta cinco painéis TypeScript/JavaScript por uma tabela de abas tipada. Mantém a chave de storage `calculadoras:active`, valida o id salvo antes de usar e retorna `calculadorasPage(): HTMLDivElement`. A promoção do índice não altera os painéis filhos nem suas fronteiras.

`/cripto` monta oito painéis, mantém a chave `cripto:active`, chama `stopMorse()` ao trocar de aba e atualiza o status da cifra. O contrato público é `criptoPage(): HTMLDivElement`. A promoção do índice não muda as implementações dos painéis nem o ciclo de áudio Morse.

Os wrappers atuais reexportam exatamente os símbolos públicos dos arquivos TypeScript. Não há autorização de servidor, credenciais, chamadas Supabase, `fetch`, WebSocket ou alteração de dados externos nos três índices auditados.

## Alteração implementada

O router será promovido de:

```text
/calculadoras  ./pages/calculadoras/index.js → ./pages/calculadoras/index.ts
/cripto        ./pages/cripto/index.js       → ./pages/cripto/index.ts
/projetos      ./pages/projetos.js          → ./pages/projetos.ts
```

`docs/nexus/dominios.json` foi atualizado na mesma changeset de `src/main.js`, substituindo apenas as três origens correspondentes. Os wrappers `.js` permanecem para consumidores legados.

## Gates

Os gates locais foram executados após a promoção:

| Gate | Resultado | Evidência |
|---|---:|---|
| `node -e JSON.parse(dominios.json)` | verde | mapa Nexus sintaticamente válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | verde | TypeScript estrito sem erro |
| `npm run tipos:v2` | verde | TypeScript V2 sem erro |
| `npm test` | verde | suíte completa passou; baseline de 1085 testes |
| `npm run build` | verde | build concluído; somente avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes; relatórios transitórios restaurados antes do commit |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta `edition2024` em `getrandom v0.4.3`; retorno 101 sem alteração artificial |

`git diff --check` passou. A alteração do Nexus foi corrigida e validada com `JSON.parse` antes dos demais gates; nenhuma concatenação ou arquivo gerado permanece no patch.

## Risco e rollback

O risco é baixo e limitado à resolução dos módulos e aos imports relativos de painéis. O storage existente, o retorno das páginas e os nomes de export são preservados. Rollback: restaurar as três extensões do router e as três origens Nexus para `.js`, mantendo os arquivos TypeScript e wrappers. A reversão deve ser um commit normal no `main`, sem force push.

## Critério de conclusão

A Wave 16 será concluída após o commit e a confirmação da CI remota no SHA final. Os critérios locais já foram satisfeitos: os três índices carregam diretamente os módulos `.ts`, Nexus e router estão sincronizados e todos os gates comportamentais passaram.

**Autor:** Manus AI
**SHA:** será preenchido após publicação.
**Data dos gates:** 2026-08-20T02:47Z–02:48Z.
