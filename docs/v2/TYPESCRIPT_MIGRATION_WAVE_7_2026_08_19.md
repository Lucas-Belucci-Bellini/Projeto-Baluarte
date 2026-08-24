# TypeScript Migration — Wave 7 — Utilities and Operations

## Status

`PUBLISHED — REMOTE CI GREEN`

## Base

A sétima onda foi construída sobre o SHA publicado `9b2423ab7405b4d75cd78608de5c6f71a7f04ef7` e publicada no SHA `fabef305` (`refactor(ops): route seventh wave directly to TypeScript`).

## Objetivo

Mover seis utilitários e páginas operacionais para implementações TypeScript canônicas diretamente no router V1, preservando permissões, gates e wrappers JavaScript.

## Rotas migradas

| Rota | Implementação canônica | Export |
|---|---|---|
| `/utilidades` | `src/pages/utilidades.ts` | `utilidadesPage` |
| `/logic-sim` | `src/pages/logic-sim.ts` | `logicSimPage` |
| `/portas` | `src/pages/portas.ts` | `portasPage` |
| `/shadow` | `src/pages/shadow.ts` | `shadowPage` |
| `/elites` | `src/pages/elites.ts` | `elitesPage` |
| `/dossie` | `src/pages/dossie.ts` | `dossiePage` |

As seis origens correspondentes foram atualizadas em `docs/nexus/dominios.json` no mesmo changeset.

## Fronteiras de segurança preservadas

A rota `/shadow` continua dependendo do gateway existente em `src/utils/shadow-gate.js`; esta onda não abriu o setor selado nem alterou a política de sessão. Os links operacionais de `/elites` e `/dossie` continuam usando o router e as permissões já existentes. A migração alterou somente a resolução do módulo TypeScript canônico.

## Inventário após a onda

O diretório `src/pages` mantém **108 implementações TypeScript** e **100 wrappers ou fronteiras JavaScript**. O `src/main.js` agora possui **47 rotas carregando `.ts` diretamente** e **43 imports lazy de páginas ainda passando por `.js`**.

## Validação direcionada

`npm run verificar-nexus` passou com 99 rotas, 0 lacunas e 0 divergências. `npm run tipos:ts` passou. `npm run tipos:v2` passou. Os contratos de segurança direcionados passaram em `16/16`. `npm run v2:integracao` passou em `21/21` após limpar um Vite órfão da porta 4193. A bateria completa local passou: 1085/1085 testes, build, smoke `99/99`, caminho crítico `15/15` e contratos de segurança `39/39`.

## Causa ambiental separada

A primeira integração encontrou novamente um processo Vite órfão na porta 4193 e falhou esperando `.cripto-entrada`. O processo foi removido sem tocar nos previews 4174, e a repetição limpa passou em `21/21`. Nenhuma página migrada causou o timeout. O gate local `npm run v2:runtime` permanece limitado pelo Cargo 1.75.0 ao metadado `edition2024`; o workflow remoto V2 Runtime passou.

## Riscos e rollback

O risco principal é um consumidor legado depender do wrapper JS ou de um gate de segurança incidental. Nenhum wrapper ou gateway foi removido. O rollback consiste em reverter as seis extensões no `src/main.js`, as seis origens no `docs/nexus/dominios.json` e este documento.

## Próximo passo

Selecionar páginas de economia, perfil ou outras rotas leves. `jogos.ts`, `batalha-naval.ts`, `visao.ts`, `jarvis.ts` e `editor.ts` continuam fora até análise individual de seus contratos maiores.
