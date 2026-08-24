# Auditoria de Estabilidade das Páginas — JavaScript → TypeScript

**Audited commit:** `c5b25e0e6b48a1b1b9def7dd80a14db282c1cba7`

**Versão:** `1.2.6`

**Status:** `AUDIT COMPLETED — NO PAGE MIGRATION DEBT`

**Data:** 20 de agosto de 2026

## Resposta direta

As **implementações canônicas das páginas estão em TypeScript**. Os arquivos JavaScript que ainda aparecem em `src/pages/` não representam páginas antigas esquecidas: são **wrappers de compatibilidade** que reexportam a implementação `.ts` correspondente para consumidores JavaScript legados.

O inventário verificado no `main` encontrou:

| Tipo de arquivo | Quantidade | Interpretação |
|---|---:|---|
| Implementações canônicas TypeScript | **123** | Código real das páginas e superfícies tipadas |
| Arquivos JavaScript físicos | **115** | Wrappers de compatibilidade |
| Páginas JavaScript canônicas restantes | **0** | Nenhuma implementação funcional canônica ficou em `.js` |
| Consumers TypeScript carregando wrapper de página `.js` | **0** | Consumers TS já apontam para as superfícies `.ts` |

Portanto, dizer que “ainda existem páginas `.js`” sem distinguir o tipo do arquivo gera uma leitura incorreta. Existem arquivos `.js`, mas eles funcionam como uma camada temporária de compatibilidade e não como a fonte principal da página.

## Por que a migração foi feita

A migração teve exatamente os dois objetivos definidos pelo projeto.

### 1. Encontrar e corrigir problemas das páginas

A mudança não foi apenas trocar extensões. Cada onda promoveu uma implementação para TypeScript strict, preservou o wrapper necessário, ajustou imports e consumidores, criou ou reforçou declarações `.d.ts` nas fronteiras de dados e executou testes comportamentais. Isso tornou visíveis classes de erro que JavaScript permitia deixar silenciosas: propriedades inexistentes, respostas com formato incorreto, eventos sem narrowing seguro, imports divergentes, callbacks com estado indefinido e contratos incompatíveis entre página, dados e utilitários.

Quando uma página dependia de catálogo gerado, API do navegador, engine de áudio, WebGL, storage ou outro módulo, a migração precisou manter a forma real desses dados. A regra foi não usar `any`, `@ts-ignore`, `@ts-nocheck` ou relaxamento de `strict` para esconder problemas. As fronteiras que ainda exigem compatibilidade permanecem explícitas e isoladas.

### 2. Aumentar a estabilidade para o crescimento do site

TypeScript não torna uma página estável sozinho. Ele fornece uma camada de verificação estática para que o crescimento do catálogo não transforme cada alteração em uma regressão imprevisível. A estabilidade real vem da combinação entre tipos, contratos, testes, build, smoke, integração browser, caminho crítico, fallback e rollback.

A arquitetura resultante permite que novas páginas sejam adicionadas em TypeScript sem obrigar uma reescrita do router V1. O wrapper JavaScript mantém consumidores antigos funcionando enquanto os consumidores são promovidos. Essa separação reduz o risco de uma migração grande quebrar o site inteiro e permite remover wrappers somente quando a auditoria de consumidores comprovar que eles não são mais necessários.

> **Conclusão:** o objetivo não era eliminar todo texto `.js` imediatamente; era eliminar implementações canônicas JavaScript sem quebrar compatibilidade. Esse objetivo foi atingido: a dívida funcional de páginas JS canônicas é zero.

## Evidências executadas

A auditoria foi realizada no commit `c5b25e0e6b48a1b1b9def7dd80a14db282c1cba7`, depois da publicação da release `1.2.6` com o visual JARVIS Núcleo V7.

| Evidência | Resultado |
|---|---:|
| Inventário físico `src/pages/**/*.js` | 115 |
| Inventário físico `src/pages/**/*.ts` | 123 |
| JS canônico sem reexport TypeScript | 0 |
| `npm run tipos:ts` | PASS |
| `npm run tipos:v2` | PASS |
| `npm test` | **1110/1110** |
| `npm run build` | PASS; warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | **25/25** |
| `npm run smoke` | **99/99** |
| `npm run caminho-critico` | **15/15** |
| CI remoto no código da 1.2.6 | PASS |
| V2 Runtime remoto | PASS |
| Vigia das rotas remoto | PASS |
| CodeQL remoto | PASS |

O runtime Rust local continua com a limitação ambiental conhecida do Cargo `1.75.0` ao interpretar metadata `edition2024`. Isso não foi mascarado nem corrigido com alteração de configuração; o workflow remoto V2 Runtime passou.

## Como ler um wrapper JavaScript

Um wrapper típico possui somente uma reexportação para a fonte TypeScript, por exemplo:

```js
export { algumaPagina } from './alguma-pagina.ts';
```

O wrapper continua existindo porque consumidores JavaScript, entradas históricas ou ferramentas de compatibilidade podem depender do caminho `.js`. O código funcional, os tipos e os testes pertencem ao arquivo `.ts`. Remover o wrapper antes de localizar todos os consumidores seria uma regressão de compatibilidade, não uma melhoria de arquitetura.

## O que ficou mais estável

A migração estabilizou cinco fronteiras importantes.

| Fronteira | Ganho de estabilidade |
|---|---|
| Página → dados | Estruturas de datasets, campos opcionais e normalização ficam explícitas |
| Página → utilitário | Assinaturas e retornos incompatíveis falham no typecheck |
| Página → router | Imports lazy e nomes de exportação são verificados |
| Página → browser API | Eventos, elementos, áudio, canvas e WebGL exigem narrowing explícito |
| Página → release | Build, smoke, integração e caminho crítico confirmam comportamento além da compilação |

A estabilidade também foi preservada operacionalmente: o shell V1, o router e os wrappers continuam disponíveis; o Service Worker é versionado; o smoke cobre 99 rotas; o caminho crítico confirma navegação, estado, persistência e retorno à Home; e a V2 observa módulos sem permitir que uma falha isolada derrube a plataforma.

## O que ainda não deve ser confundido com estabilidade concluída

A ausência de páginas JS canônicas não significa que todos os módulos do Baluarte estejam maduros ou que a V2 esteja completa. JARVIS, Spotify, OpenClaw, Supabase/RLS, Billing, observabilidade server-side, acessibilidade ampla, performance e o Command Center possuem marcos próprios. A migração TypeScript resolve a base de implementação das páginas; não transforma automaticamente cada integração externa em produção segura.

Também não se deve remover os 115 wrappers em lote. Eles devem sair em ondas posteriores, depois de uma busca de consumidores, teste de build, smoke, integração e rollback por grupo. O wrapper é dívida de compatibilidade controlada, não dívida funcional de página.

## Próxima regra para páginas novas

Toda página nova deve seguir este fluxo:

1. Criar a implementação canônica em TypeScript strict.
2. Definir os tipos dos dados e das APIs de fronteira.
3. Adicionar wrapper JavaScript somente se houver consumidor legado real.
4. Promover consumidores TypeScript para o caminho sem wrapper quando isso for seguro.
5. Adicionar teste comportamental e cobertura de deep link quando aplicável.
6. Executar typechecks, testes, build, integração, smoke e caminho crítico.
7. Registrar risco, rollback e SHA no relatório do marco.

Assim, o crescimento do site adiciona módulos tipados e verificáveis em vez de aumentar uma segunda camada de páginas JavaScript funcionais.

## Ferramentas registradas

| Ferramenta | Versão observada |
|---|---|
| Node.js local | `v22.13.0` |
| npm local | `10.9.2` |
| TypeScript | `7.0.2` |
| tsx | `4.23.12` |
| Versão do projeto | `1.2.6` |

## Referências

[1]: ./PAGES_JS_REMAINING_INVENTORY.md "Inventário operacional de páginas JS/TS"
[2]: ./TYPESCRIPT_REMAINING.md "Roadmap da migração TypeScript"
[3]: ./MAIN_ERROR_AUDIT.md "Auditoria de erros do main"
[4]: ./V2_RULES.md "Regras obrigatórias da V2"
[5]: ../releases/v1.2.6.md "Release 1.2.6 — JARVIS Núcleo V7"
