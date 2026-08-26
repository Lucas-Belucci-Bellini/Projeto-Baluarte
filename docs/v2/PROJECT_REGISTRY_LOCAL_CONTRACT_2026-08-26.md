# Project Registry local — contrato read-only

**Data:** 2026-08-26  
**Slice:** `project-registry-local`  
**Estado:** Alpha; local-only, read-only e sem execução externa  
**Implementação:** `v2/data/project-registry.ts`  
**Wrapper:** `v2/data/project-registry.js`  
**Verificador:** `scripts/project-registry-check.mjs`

## Objetivo

Este slice cria uma primeira fronteira local para inventariar projetos externos citados pelo Master Plan da V2 sem instalar, baixar, importar, executar ou autorizar qualquer repositório externo. O objetivo é evitar que projetos sejam tratados como dependências ou funcionalidades apenas porque aparecem no roadmap.

O Project Registry é um **catálogo de candidatos**, não um marketplace, plugin loader, downloader, executor, bridge, sistema de integração ou autoridade de produção.

## Fonte dos registros

As quatro entradas iniciais são nomes de projetos já citados na seção de projetos externos do Master Plan:

| ID | Nome | Fonte registrada | Auditoria | Decisão |
|---|---|---|---|---|
| `veritas` | Veritas | referência ao Master Plan | `not-audited` | `defer` |
| `dailyplanner` | DailyPlanner | referência ao Master Plan | `not-audited` | `defer` |
| `stock-analyzer-bot` | Stock Analyzer Bot | referência ao Master Plan | `not-audited` | `defer` |
| `project-vanguard` | Project Vanguard | referência ao Master Plan | `not-audited` | `defer` |

Nenhuma URL de repositório, licença, estado de manutenção, arquitetura, capability, risco, custo ou claim externo foi inventado. Campos ausentes permanecem ausentes ou com classificação `unknown` após normalização.

## Contrato de entrada

Cada registro possui, quando conhecido, `id`, `name`, `source`, `auditState`, `repositoryUrl`, `license`, `maintenance`, `architecture`, `capabilities`, `overlap`, `security`, `cost`, `decision` e `nextStep`.

A fonte possui `kind` (`roadmap`, `repository` ou `local-document`) e `reference` textual não vazio. A decisão é limitada a:

```text
use | adapt | inspire | isolate | defer | reject
```

O estado de auditoria é limitado a:

```text
not-audited | locally-audited | externally-verified | blocked-external
```

A regra conservadora principal é: uma entrada `not-audited` **só pode receber `defer`**. Uma futura auditoria passiva poderá preencher evidência real e mudar a decisão em outro slice, com fonte, licença, segurança, manutenção, custo, impacto e rollback documentados.

## API local

`projectRegistrySnapshot(entries?, options?)` normaliza o catálogo, rejeita IDs duplicados, aplica filtros opcionais por texto, estado de auditoria e decisão, e aplica limite padrão `25` com teto `100`.

O texto da busca cobre somente `id` e `name`. O snapshot retorna `scope: project-registry/local`, filtros normalizados, entradas congeladas e um resumo com `available`, `returned` e `truncated`.

A saída e suas estruturas aninhadas são congeladas. O snapshot não modifica a entrada, não escreve arquivos e não possui método de mutação, instalação, execução, sincronização ou publicação.

## Segurança e não-escopo

O slice não faz rede, não chama GitHub, não consulta APIs externas, não baixa código, não instala dependências, não executa subprocessos externos, não carrega plugins, não cria credenciais, não adiciona secrets, não acessa Supabase, não cria migrations, não altera RLS, não concede permissões e não transforma `moduleId` ou `projectId` em ownership.

O Project Registry não prova qualidade ou segurança de nenhum projeto. `externally-verified` não deve ser usado sem evidência externa auditável; neste slice não há entradas nesse estado.

A implementação também não decide automaticamente `USE` ou `ADAPT`, não escolhe licença, não faz comparação de custo e não cria adapters. Esses passos dependem de uma auditoria passiva futura e de uma decisão arquitetural explícita.

## Validação

O teste focal cobre:

- catálogo local com quatro entradas conservadoras;
- filtro por texto, auditoria e decisão;
- teto bounded de `100`;
- snapshot, entradas e listas congelados;
- rejeição de decisão positiva para entrada não auditada;
- rejeição de IDs duplicados e limites inválidos.

O comando operacional é:

```bash
npm run check:project-registry
```

Ele executa apenas a projeção local e imprime um resumo JSON. O comando é seguro/read-only e não substitui auditoria externa, análise de licença ou security review.

## Compatibilidade

O slice é aditivo. Não altera V1, router, sidebar, Service Worker, Core existente, Module Registry, Event Bus, Storage, Auth, RLS, JARVIS, integrações externas ou comportamento das 99 rotas do smoke. A implementação TypeScript possui wrapper ESM JavaScript seguindo o padrão dos contratos V2 existentes.

## Próximos passos possíveis

O próximo passo, se priorizado pela matriz, é uma auditoria passiva e limitada de uma fonte oficial por projeto, sem executar código externo. Essa auditoria deverá registrar URL, licença, manutenção, arquitetura, capabilities, sobreposição, riscos e custo apenas quando houver evidência suficiente.

Depois de uma auditoria real, cada entrada poderá permanecer `defer`, ser marcada `reject`, ou receber outra decisão documentada. Um adapter só deve ser criado depois do contrato, da análise de dependências, da licença, da segurança, do isolamento e dos testes.

## Rollback

O rollback do slice remove `v2/data/project-registry.ts`, `v2/data/project-registry.js`, `scripts/project-registry-check.mjs`, o teste, o comando npm e este contrato. Como o slice não faz escrita remota nem migration, não há rollback de dados externos.

O rollback deve ser executado por revert controlado do commit da branch/PR correspondente, sem tocar na PR #501, na PR Claude #471 ou em alterações não relacionadas do checkout principal.
