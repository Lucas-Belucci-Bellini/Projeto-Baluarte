# PHASE 0 — Baseline do Projeto-Baluarte V2

**Status:** BASELINE OBSERVADA — sem correções de código nesta etapa  
**Data/hora da coleta:** 2026-08-19T02:11–02:16 UTC  
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Branch:** `main`  
**SHA observado:** `f64022766b477a311de0da55c23c19a2d1fedf84`  
**Working tree na descoberta:** limpo  

## 1. Ferramentas

| Ferramenta | Versão observada |
|---|---|
| Node.js | `v22.13.0` |
| npm | `10.9.2` |
| TypeScript | `7.0.2` |
| Python | `3.12.3` |
| rustc | `1.75.0` |
| cargo | `1.75.0` |
| Vite declarado | `5.4.10` |
| Playwright declarado | `1.49.0` |

O `package.json` declara engine Node `24.x`, enquanto a coleta foi executada com Node `22.13.0`. Os gates JavaScript passaram; essa diferença deve permanecer registrada como risco de paridade de ambiente. O Runtime Rust não pôde ser executado localmente porque o Cargo disponível não entende o lockfile v4; não foi instalado ou alterado toolchain durante a auditoria.

## 2. Comandos e resultados

| Comando | Resultado | Observação |
|---|---|---|
| `npm run tipos:ts` | **0 / verde** | TypeScript incremental sem diagnósticos |
| `npm test` | **960/960 / verde** | 954 subtests agrupando 960 testes |
| `npm run build` | **verde** | Vite produziu `dist/`; permanece aviso histórico de chunks grandes |
| `npm run tipos:v2` | **0 / verde** | Gate JSDoc/checkJs atual sem diagnósticos |
| `npm run v2:integracao` | **19/19 / verde** | Core, módulos, Runtime Session, router V1 e engine 3D |
| `npm run smoke` | **98/98 / verde** | Todas as rotas descobertas passaram |
| `npm run caminho-critico` | **15/15 / verde** | Jornada boot → navegação → estado → persistência |
| `npm run v2:runtime` | **não executado por ambiente** | Cargo `1.75.0`: lockfile v4 exige `-Znext-lockfile-bump` |
| `npm audit --omit=dev --audit-level=high` | **0 vulnerabilidades / verde** | Dependências de produção analisadas |
| `npm audit --audit-level=high` | **vermelho informativo** | 6 vulnerabilidades de desenvolvimento: 4 high e 2 moderate |
| `npm run sonda-memoria` | **verde** | Sem acumulação de timer, loop de animação ou áudio |
| `npm run prova-offline` | **9/9 / verde** | Cache e degradação offline passaram |
| `npm run gen-catalogo-eventos -- --verificar` | **verde** | 19 eventos e 8 namespaces |
| `npm run gen-catalogo-storage -- --verificar` | **falha local** | O script Node importa `src/core/permissions.ts` sem loader TS |
| `npm run gen-tabela-estabilidade -- --verificar` | **falha local** | Mesmo problema de importação direta de `.ts` |

As falhas dos dois geradores são reproduzíveis e devem ser tratadas como uma família de compatibilidade da automação Node após a migração TypeScript, não como falhas independentes de catálogo. Nenhum arquivo gerado foi alterado durante a coleta.

## 3. Contagens observadas

| Indicador | Valor |
|---|---:|
| Arquivos `.js` em `src/pages/` | 99; wrappers e compatibilidade, não páginas canônicas restantes |
| Implementações `.ts` em `src/pages/` | 107 |
| Contratos `.d.ts` sob `src/` | 164 |
| Rotas reais registradas | 98 |
| Páginas canônicas JS restantes | 0 |
| Wrappers JS de compatibilidade | 142, conforme relatório diário |
| Implementações TypeScript | 156, conforme relatório diário |
| Declarações de fronteira | 171, conforme relatório diário |

A diferença entre a contagem física de arquivos em `src/pages/` e os números agregados do relatório é intencional: o inventário físico inclui arquivos auxiliares/submódulos, enquanto o relatório agrega implementações e fronteiras do escopo definido pelo gerador.

## 4. Known failures e warnings

A falha de Runtime é uma limitação do ambiente local, classificada como `ENV-RUST-001`, não como falha demonstrada do código. O `cargo metadata` funciona, mas `cargo test` para antes de compilar por causa do formato do lockfile. O CI remoto deve ser a evidência do Runtime até que um toolchain Rust compatível esteja disponível.

As seis vulnerabilidades de desenvolvimento não devem ser corrigidas com `npm audit fix --force` sem revisão, pois a ferramenta indica upgrades potencialmente breaking. O warning de chunks grandes do Vite é conhecido e não reprova o build atual.

## 5. Baseline de promoção

O SHA `f6402276` é a referência para a próxima fase. A main está funcional nos gates JavaScript, TypeScript, V2, smoke e caminho crítico. A próxima mudança deve ser pequena, ter teste próprio, atualizar documentação e repetir os gates relevantes. Nenhuma release V2 estável deve ser declarada somente com base nesta baseline, porque identidade/login-cadastro, vertical slice completo, autorização server-side, evidência de dados e validação remota do Runtime continuam dependências do roadmap.
