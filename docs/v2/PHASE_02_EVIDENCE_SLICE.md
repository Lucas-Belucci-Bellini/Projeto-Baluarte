# PHASE 02 — Evidence Layer

**Status:** implementado como slice local e publicado na `main` somente após os gates.  
**Autor:** Manus AI  
**Escopo:** proveniência e ciclo de verificação de fatos para módulos V2.

## Decisão

A primeira entrega da Data Layer não tenta migrar os catálogos existentes, não coleta dados da rede e não escreve diretamente em Supabase. Ela cria uma fronteira pequena, determinística e testável para fatos observados: cada evidência precisa de identificador, chave da afirmação, texto, fonte, momento de coleta, confiança e módulo responsável.

> **Regra:** informação coletada por agentes não é fato confiável sem fonte, data, versão/revisão e validação explícitas.

## Contrato entregue

`v2/data/evidence.ts` fornece `validateEvidence`, `normalizeEvidence` e `EvidenceStore`. O adapter `v2/data/catalog-evidence.ts` transforma campos de catálogos em claims determinísticas, e o módulo expõe isso como `appendCatalog`. A normalização rejeita confidence fora de `[0, 1]`, datas inválidas, fontes sem URI, campos obrigatórios vazios e estados desconhecidos. O registro normalizado é congelado e a inserção é append-only por `id`; a mudança permitida nesta fase é apenas de ciclo de verificação (`pending`, `verified`, `rejected`, `superseded`).

O módulo `v2/modules/evidence/module.js` expõe o mesmo contrato ao Module Registry, sem rotas, sem permissões, sem rede e sem storage implícito. Seu `dispose()` libera a instância do store. Isso demonstra isolamento: o módulo pode falhar ou ser desligado sem derrubar a superfície V1.

## Testes

Foram adicionados `test/v2/evidence.test.js` e `test/v2/evidence-module.test.js`. Eles cobrem validação, defaults, imutabilidade, duplicidade, filtragem por claim/módulo, transição de status, manifesto sem rota, lifecycle de inicialização e descarte.

| Gate | Resultado |
|---|---:|
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| `npm test` | **971/971** |
| `npm run build` | Verde; warning conhecido de chunks grandes |
| `npm run smoke` | Verde |
| `npm run v2:integracao` | **19/19** |
| `npm run caminho-critico` | **15/15** |
| `npm run prova-offline` | **9/9** |
| `npm run sonda-memoria` | Verde |

## Limites conscientes

Este slice ainda não faz ingestão, deduplicação semântica, busca full-text, embeddings, revisão humana ou persistência Postgres. A migration SQL existente continua sendo a fundação futura e não foi alterada nesta fase. A persistência deve ser adicionada depois de definir o adapter, os testes de concorrência e a política de tenancy; não será criada uma segunda implementação de Storage no frontend.

## Próximo passo recomendado

O adapter local de catálogo já foi conectado ao módulo e validado com fixtures. O próximo slice deve conectá-lo a um fluxo de leitura controlado da Wiki, começando com fixtures locais e schemas verificáveis. Só depois de medir a necessidade real deve entrar fila de ingestão, worker Python ou pgvector.
