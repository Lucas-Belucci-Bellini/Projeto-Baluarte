# Migração TypeScript — Wave 28

**Status:** implementação publicada diretamente no `main`; gates locais e CI remota concluídos com sucesso.

**Objetivo:** promover o consumer TypeScript do Centro Militar para `mil-curation.ts`, preservando integralmente a leitura pública best-effort do Supabase, o fallback offline `{}`, a consulta existente e o contrato RLS.

> Esta onda toca uma fronteira Supabase somente para trocar o módulo resolvido. Não houve alteração de tabela, SQL, credencial, política RLS, escrita ou configuração externa.

## Baseline e publicação

A Wave 28 partiu do fechamento documental da Wave 27 em `1bd684edc01f17480d0ac7e6e5c571e6824c25fc`, com `origin/main` sincronizado. A implementação foi publicada diretamente no `main`, sem PR e sem force push.

| Item | Valor |
|---|---|
| Branch | `main` |
| Commit de implementação | `202ef55807ee81b4698c75ce5ac7ec9abfa88136` |
| Mensagem | `refactor(militar): promote typed curation consumer` |
| Consumers alterados | 1 runtime + 1 mapa Nexus |
| Rotas descobertas | 99 |
| Lacunas Nexus | 0 |
| Domínios Nexus | 21/21 |

## Contrato Supabase auditado

`mil-curation.ts` consulta `mil_curation` somente quando `supabaseConfigured()` informa que o cliente está configurado. A chamada existente continua sendo `dbSelect('mil_curation', 'select=id,note,featured,sort&order=sort')`. O módulo valida a resposta como array, filtra linhas inválidas por `id`, normaliza `note`, `featured` e `sort`, e retorna um mapa por id.

Se Supabase não estiver configurado, estiver offline ou lançar erro, `fetchMilCuration()` continua retornando `{}`. O Centro Militar segue funcional sem a camada de curadoria. Nenhum caminho de escrita foi adicionado; a documentação do módulo continua tratando a escrita como responsabilidade de `service_role`/dashboard, fora do frontend.

| Fronteira | Garantia preservada |
|---|---|
| Auth/RLS | Nenhuma política foi alterada; a consulta permanece leitura pública existente |
| Dados | Apenas `id`, `note`, `featured` e `sort` continuam sendo selecionados |
| Falha | Ausência de Supabase, resposta inválida e exceção continuam virando mapa vazio |
| UI | `militar.ts` recebe o mesmo `MilCurationMap` e mantém os tópicos, destaque e ordem |
| Compatibilidade | `mil-curation.js` continua reexportando `fetchMilCuration` |

## Implementação

| Arquivo | Alteração |
|---|---|
| `src/pages/militar.ts` | Import runtime e import type passam de `mil-curation.js` para `mil-curation.ts` via specifier extensionless |
| `docs/nexus/dominios.json` | `mil-curation.ts` registrado junto ao domínio militar |

Nenhuma rota foi adicionada, removida ou renomeada. O `src/main.js` não foi alterado nesta onda; a sincronização especial de rotas não foi necessária.

## Escopo mantido fora

Não foram tocados Supabase client, SQL, migrations, RLS, service role, autenticação, Vercel, `wikipedia.ts`, `geo-tracker`, armazenamento, OpenClaw, Spotify, Hermes, WebLLM, memória, bridges ou layout. A consulta real não foi executada contra uma conta externa pelos gates; os testes validam o comportamento local, a resolução do bundle e a preservação do fallback.

Uma futura mudança de RLS ou de schema exige uma migration e testes de contrato próprios. A próxima onda de dados externos não deve misturar promoção de wrapper com alteração de política de segurança.

## Gates locais

Os gates rápidos e comportamentais foram executados após a promoção. Vite stale foi encerrado antes da integração. Artefatos transitórios do smoke foram restaurados antes do commit.

| Gate | Resultado | Evidência |
|---|---:|---|
| `git diff --check` | verde | nenhuma falha de whitespace |
| JSON Nexus | verde | `dominios.json` válido |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas, 21/21 domínios, 394 arquivos com dono |
| `npm run tipos:ts` | verde | imports runtime e type-only resolvidos |
| `npm run tipos:v2` | verde | V2 TypeScript passou |
| `npm test` | verde | suíte existente sem regressão |
| `npm run build` | verde | build concluído em 7,86 s; apenas avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 retorna 101 em `getrandom v0.4.3` por `edition2024` |

A falha local do Rust continua ambiental e não foi mascarada. O CI remoto usa uma toolchain compatível.

## Ferramentas relevantes

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Cargo | `1.75.0` |
| Pacote | `1.1.5` |

## Riscos e rollback

O risco principal é uma resolução diferente do wrapper ou uma futura divergência entre o shape da resposta Supabase e `MilCurationEntry`. O import type continua apontando para o mesmo contrato, a implementação canônica já valida dados desconhecidos e o fallback mantém a V1 funcional.

O rollback é restaurar os dois imports de `militar.ts` para `.js`, remover a entrada de `mil-curation.ts` do mapa Nexus e publicar um commit normal no `main`. Não é necessário reverter SQL, mudar RLS, apagar a implementação TypeScript ou usar force push.

## CI remota

A execução remota foi disparada para o SHA curto `202ef558`; todos os oito workflows aplicáveis terminaram com sucesso.

| Workflow | Run | Resultado |
|---|---:|---|
| CI | `32337757456` | success |
| Core CI | `32337757394` | success |
| V2 Core | `32337757402` | success |
| V2 Runtime | `32337757400` | success |
| V2 Validation | `32337757411` | success |
| Vigia das rotas | `32337757396` | success |
| Arma 3 Data CI | `32337757419` | success |
| CodeQL | `32337757467` | success |

## Critério de conclusão

A Wave 28 está encerrada: o Centro Militar resolve `mil-curation.ts` diretamente, o wrapper permanece disponível, a consulta e o fallback Supabase não mudaram, os gates locais passaram e a CI remota confirmou os oito workflows sem regressão. O próximo passo recomendado é retornar aos utilitários puros restantes ou auditar uma fronteira externa específica com testes de contrato antes de novas promoções.

**Autor:** Manus AI

**SHA de implementação:** `202ef55807ee81b4698c75ce5ac7ec9abfa88136`.

**Data:** 2026-08-20.
