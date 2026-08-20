# Migração TypeScript — Wave 14

**Status:** implementação local em validação; publicação no `main` somente após todos os gates obrigatórios.

**Objetivo:** promover `/arsenal`, `/wiki-arma3` e `/arma3-tutorial` para importação direta de suas implementações TypeScript, mantendo os wrappers `.js` como compatibilidade legada e preservando a V1.

## Baseline

A auditoria foi realizada sobre o `main` em `e0bac4284faab73365e7e8859dc564a57d556495`, sincronizado com `origin/main`. O Vigia das rotas, CI, Core CI, V2 Runtime, V2 Validation, Arma 3 Data CI e CodeQL estavam verdes nesse SHA. A alteração desta wave é deliberadamente limitada ao router, ao mapa Nexus e à documentação desta onda.

O validador específico da superfície Arma 3 foi executado antes da promoção:

```text
node scripts/verificar-wiki-arsenal.mjs
artigos do arsenal: 106
  com calculadora:  94
  só tabela:        12
artigos de óptica:  211
artigos de terreno: 31 (31 com grade)
artigos de veículo: 874
artigos de equip.:  241
artigos de soldado: 940
ok — todo artigo aponta pra uma arma que existe, e só promete o que entrega.
```

## Resultado da auditoria contratual

| Rota | Implementação canônica | Wrapper legado | Export público | Retorno | Risco principal | Decisão |
|---|---|---|---|---|---|---|
| `/arsenal` | `src/pages/arsenal.ts` | `src/pages/arsenal.js` | `arsenalPage` | `HTMLDivElement` | `fetch` público à Wikipedia e estado persistido | Promover; o contrato é síncrono no bootstrap e o `fetch` só ocorre nas imagens solicitadas |
| `/wiki-arma3` | `src/pages/wiki-arma3.ts` | `src/pages/wiki-arma3.js` | `wikiArma3Page` | `HTMLDivElement` | deep-links por query, artigos relacionados e dados Arma 3 | Promover; a página é determinística e a validação de links permanece verde |
| `/arma3-tutorial` | `src/pages/arma3-tutorial.ts` | `src/pages/arma3-tutorial.js` | `arma3TutorialPage` | `Promise<HTMLDivElement>` | carregamento sob demanda das bases e estado `aba`/`arma` | Promover; o router suporta explicitamente handlers assíncronos e aguarda a Promise |

### Contratos preservados

`src/main.js` continua chamando `lazy(loader, exportName)`, portanto cada módulo precisa exportar exatamente o mesmo símbolo público usado pelo wrapper. Os três exports TypeScript conferem: `arsenalPage`, `wikiArma3Page` e `arma3TutorialPage`.

Os argumentos continuam compatíveis com o contrato do router. Arsenal usa argumentos opcionais; Wiki Arma 3 e Tutorial aceitam `query?: Readonly<Record<string, string>> | null`. O router entrega `{ ...params, query }` e possui suporte explícito a retorno assíncrono, o que torna o `Promise<HTMLDivElement>` do Tutorial uma extensão já prevista, não uma exceção introduzida pela wave.

Não foram encontrados guardas de sessão, chamadas Supabase, ampliação de autorização ou alteração de dados externos nas três páginas. A Wiki Arma 3 é uma superfície de conteúdo orientada por query; seu principal contrato é a integridade dos links entre artigos, filtros e abas do Tutorial. O Arsenal mantém uma consulta pública opcional à API da Wikipedia para miniaturas, com timeout de seis segundos e fallback entre idiomas. O Tutorial carrega bases Arma 3 sob demanda e falha de maneira explícita quando o preset necessário não está disponível.

## Alterações da Wave 14

A promoção troca somente as extensões no router:

```text
/arsenal        .js → .ts
/wiki-arma3     .js → .ts
/arma3-tutorial .js → .ts
```

Os wrappers `src/pages/arsenal.js`, `src/pages/wiki-arma3.js` e `src/pages/arma3-tutorial.js` permanecem no repositório e continuam reexportando os mesmos símbolos TypeScript. Nenhuma API pública foi removida.

`docs/nexus/dominios.json` foi atualizado na mesma changeset de `src/main.js`, substituindo as três origens legadas por suas implementações `.ts`. As rotas continuam no domínio `baluarte-arsenal`, sem alterar responsabilidade, permissões ou dependências do domínio.

## Testes e gates

Os gates locais foram executados após a alteração. O resultado verificável é:

| Gate | Resultado | Observação |
|---|---:|---|
| `node scripts/verificar-wiki-arsenal.mjs` | verde | 106 artigos de Arsenal, 211 de óptica, 31 terrenos com grade e demais invariantes aprovados |
| `npm run verificar-nexus` | verde | 99 rotas, 0 lacunas e 21/21 domínios declarados |
| `npm run tipos:ts` | verde | TypeScript estrito sem erro |
| `npm run tipos:v2` | verde | TypeScript V2 sem erro |
| `npm test` | verde | 1085 testes, 1085 pass, 0 fail, 0 skipped |
| `npm run build` | verde | build concluído; permanecem somente os avisos conhecidos de chunks grandes |
| `npm run v2:integracao` | verde | 21/21 asserções |
| `npm run smoke` | verde | 99/99 rotas verdes; os relatórios gerados foram restaurados para não misturar métricas transitórias ao commit |
| `npm run caminho-critico` | verde | 15/15 asserções |
| `npm run v2:runtime` | limitação local conhecida | Cargo 1.75.0 não interpreta a metadata `edition2024` de `getrandom v0.4.3`; o comando retornou 101 sem alteração de configuração |

O gate local de runtime não foi mascarado nem convertido em sucesso artificial. O CI remoto usa Rust estável e é a autoridade para esse componente. A integração de navegador confirmou o boot V2, as 19 rotas registradas no router real, o carregamento dos módulos e a jornada sem erros de JavaScript; o caminho crítico também confirmou a abertura do Arsenal, a persistência da permissão `arsenal.read` e o retorno à Home.

A falha de imagens da Wikipedia permanece isolada pelo timeout e fallback existentes no Arsenal; ela não é dependência obrigatória para a montagem do catálogo.

## Riscos, rollback e segurança

O risco técnico é baixo porque a mudança é de resolução do módulo, não de lógica de página. O risco específico do Tutorial é assíncrono e já está coberto pelo contrato do router. O risco específico da Wiki está concentrado nos deep-links e no validador Arma 3, que passou antes da promoção. O Arsenal mantém o timeout e o fallback existentes para a consulta externa.

Rollback: restaurar no `src/main.js` as três extensões `.ts` para `.js` e restaurar no bloco `baluarte-arsenal` do Nexus as três origens `.js`, sem remover os arquivos TypeScript ou os wrappers. A reversão deve ser publicada como commit normal no `main`, nunca por force push.

Nenhuma credencial, permissão, integração externa, dado Supabase ou configuração de CI foi alterada nesta wave. Não há ação externa de alto impacto pendente.

## Critério de conclusão

A Wave 14 será considerada concluída quando os gates locais aplicáveis estiverem verdes, o diff passar `git diff --check`, a documentação registrar o SHA publicado e os workflows remotos do commit final — incluindo CI, Core CI, V2 Core, V2 Runtime, V2 Validation, Security Contracts, Vigia das rotas, Arma 3 Data CI e CodeQL quando disparados — terminarem com sucesso.

## Próxima decisão

Depois da publicação e da confirmação da CI, revisar o inventário restante. A próxima candidata de menor risco deve ser escolhida por contrato, não por tamanho. `jarvis.ts` e `editor.ts` continuam bloqueados para promoção até a análise de seus contratos pesados; páginas grandes como `visao`, `jogos` e `batalha-naval` não devem ser promovidas sem auditoria equivalente.

**Autor:** Manus AI
**SHA de implementação:** será preenchido após o commit e a sincronização com `origin/main`.
**Data/hora dos gates:** 2026-08-20T02:09Z–02:10Z, conforme os logs locais da Wave 14.
