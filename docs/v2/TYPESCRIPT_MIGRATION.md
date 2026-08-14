# Migração do Baluarte de JavaScript para TypeScript

**Status:** migração incremental iniciada  
**Snapshot de trabalho:** `fd25ef9a02a85c2f3c74d4feafaaad8cbefeb73f`  
**Regra:** preservar a V1, migrar por contratos e validar cada onda

## 1. Objetivo

O Core de Orquestração do Baluarte será migrado progressivamente de JavaScript para TypeScript. A migração não é um rewrite simultâneo: cada módulo convertido deve continuar sendo consumido pelas páginas JavaScript ainda não migradas, passar pelo build Vite e preservar seus testes comportamentais.

A decisão arquitetural já aceita define TypeScript para a interface web e para o Core de Orquestração. Rust permanece reservado ao Core de Runtime processual, Python aos workers/IA e PostgreSQL/Supabase à camada de dados.[1]

## 2. Estado da linha de base

Antes da primeira onda, o `main` atual apresentou:

| Gate | Resultado | Interpretação |
| --- | --- | --- |
| `npm run tipos:v2` | 71 erros | Dívida de contratos da V2 já existente, principalmente em Boot, Platform, grupos, Manager e Registry |
| `npm test` | 865 passou, 6 falharam, de 871 | Seis falhas existentes no contrato Supervisor/Health; não foram causadas pela primeira onda |
| `npm run build` | Verde | O Vite continua compilando a aplicação |

Os resultados acima são a linha de base. A migração não deve usar esses 71 diagnósticos como motivo para reescrever tudo ao mesmo tempo; eles devem ser reduzidos por famílias de contrato.

## 3. Primeira onda implementada

A primeira onda migrou o Event Bus e o State global:

| Módulo | Implementação canônica | Compatibilidade |
| --- | --- | --- |
| Event Bus | `src/core/events.ts` | `src/core/events.js` reexporta `events.ts` |
| State | `src/core/state.ts` | `src/core/state.js` reexporta `state.ts` |

O Event Bus agora possui tipos explícitos para `EventMeta`, `EventHandler`, `EventBus`, mapas de handlers e buckets de eventos exatos, prefixados e globais. O State possui `createStore<State>`, `StoreListener`, `Store` e `AppState` tipados.

A compatibilidade por wrapper é temporária. Ela permite que imports legados como `../core/events.js` continuem funcionando enquanto o grafo de consumidores é convertido gradualmente. O Vite resolve o `.ts` no build e o runner `tsx` permite que a suíte Node teste a implementação canônica.

## 4. Gates da primeira onda

| Comando | Resultado |
| --- | --- |
| `npm run tipos:ts` | Verde para `events.ts` e `state.ts` |
| `npx tsx --test test/events.test.js` | 16/16 verdes |
| `npm run build` | Verde |
| `npm test` | 865/871; as mesmas 6 falhas da linha de base |
| `npm run tipos:v2` | 71 erros históricos, sem aumento atribuído à onda |

O `tsconfig.json` raiz inclui somente os arquivos migrados da primeira onda. Isso é intencional: o portão deve crescer junto com a conversão, não fingir que arquivos ainda JavaScript já têm contratos TypeScript.

## 5. Ordem das próximas ondas

| Onda | Escopo | Critério de saída |
| --- | --- | --- |
| 1 | Event Bus e State | Tipos estritos, build verde e testes comportamentais preservados |
| 2 | Router e contratos de navegação | Rotas, aliases, 404, route error e loaders tipados |
| 3 | Permissions, Flags e Storage | Permissões, estados, schemas e migrações tipados sem relaxar RLS/política |
| 4 | Shell, Header, Sidebar e Layout | Boot e navegação consumindo contratos TS por wrappers mínimos |
| 5 | Registry/Module System | Manifesto, estados de módulo, fallback e circuit breaker tipados |
| 6 | Páginas de maior valor | Wiki Arma 3, Arsenal, Biblioteca, JARVIS e diagnóstico por slices |
| 7 | Data e integrações | Contratos de dados, Supabase, Evidence Layer e Runtime bridge |

A conversão de páginas deve ocorrer depois do Core, porque cada página depende de router, eventos, estado, permissões, shell e storage. Migrar páginas antes de fechar esses contratos apenas deslocaria a dívida para dezenas de arquivos.

## 6. Regras de compatibilidade

Durante a migração, os consumidores JavaScript podem importar um wrapper `.js`, mas a lógica não pode existir em duas implementações. O `.ts` é a fonte canônica; o `.js` apenas reexporta. Cada onda deve reduzir o grafo de wrappers ou substituir os imports diretamente.

Não usar `any`, `@ts-ignore`, `@ts-nocheck`, relaxamento de `strict` ou exclusões para transformar o portão em verde. Se uma fronteira externa ainda não tem contrato, ela deve receber um tipo explícito de adaptador, uma declaração de módulo ou um `unknown` que seja estreitado no ponto de entrada.

## 7. Comandos de desenvolvimento

```bash
npm run tipos:ts       # arquivos TypeScript já migrados
npm run tipos:v2       # portão existente da V2 em JS + JSDoc
npm test               # suíte JavaScript executada por tsx
npm run build          # build real do Vite
```

O próximo incremento recomendado é o Router. Ele é a ponte entre as páginas legadas e o novo Module Registry; tipá-lo cedo permite validar rotas, loaders, fallback de chunk e os estados `enabled`, `disabled` e `maintenance` antes da conversão em massa das páginas.

## 8. Referências

[1]: ../../../docs/architecture/decisions/ADR-004-stack-poliglota-por-responsabilidade.md "ADR-004 — Stack poliglota por responsabilidade"
