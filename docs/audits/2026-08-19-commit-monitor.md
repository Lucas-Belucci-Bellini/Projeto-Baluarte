# Auditoria final do monitoramento de commits — 2026-08-19

## Resumo executivo

O problema não era apenas o volume de commits exibidos. O gargalo principal estava no backend: a rota de commits materializava toda a história do Git e somente depois aplicava o limite solicitado pela interface. Ao mesmo tempo, o dashboard fazia polling fixo a cada 30 segundos, podia sobrepor ciclos lentos e reconstruía toda a tela a cada resposta.

A correção introduz um **cursor incremental por SHA**, um **limite máximo explícito**, uma **leitura de cauda para eventos**, uma **série agregada de commits por dia** e um polling **single-flight** com `setTimeout`, que só agenda o próximo ciclo depois que o atual termina. A interface mantém uma janela de até 20 commits individuais e representa o restante no gráfico agregado, evitando tentar desenhar uma barra ou um elemento para cada commit.

## Estado e baseline

O repositório auditado é [`Lucas-Belucci-Bellini/Projeto-Baluarte`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte), branch `main`, SHA observado `95fc52ab89234de6468b39b2eece2475e44a639f`. O workspace estava limpo antes da alteração e permanece sem commit novo ou push remoto ao final desta tarefa.

Versões observadas: Node.js `v22.13.0`, npm `10.9.2` e Python `3.12.3`.

A história local continha **29 commits nas últimas 24 horas**, **539 nos últimos 7 dias** e **793 nos últimos 30 dias**. O dado foi obtido com `git rev-list --count` no SHA auditado.

## Causa raiz versus efeito cascata

| Classificação | Constatação | Consequência |
| --- | --- | --- |
| Causa raiz | `jarvis_commits` chamava `list(repo.iter_commits())[:limit]`. | A consulta custava a história completa mesmo quando a UI precisava de 20 itens. |
| Causa raiz | Não havia cursor de commit. | Cada polling repetia uma leitura ampla, sem buscar somente novidades. |
| Causa raiz | O gráfico genérico de `src/pages/graficos.ts` era manual e local. | Ele não tinha contrato para receber a atividade do Git. |
| Efeito cascata | O dashboard usava `setInterval` sem controle de ciclo em andamento. | Uma coleta lenta podia se sobrepor à seguinte. |
| Efeito cascata | O DOM inteiro era limpo e reconstruído em todo ciclo. | A atualização consumia mais trabalho e ficava instável sob carga. |
| Gargalo secundário | Eventos eram carregados integralmente antes do limite. | O custo crescia com o tamanho do JSONL diário. |

## Decisão arquitetural

A API `GET /jarvis-db/commits` agora aceita `limit` e `after`. O valor de `limit` é limitado entre 1 e 100, o resultado inclui o SHA completo do `HEAD`, o campo `hasMore`, os commits retornados e a atividade agregada dos últimos 14 dias. Quando `after` é fornecido, a resposta contém somente os commits posteriores ao SHA conhecido. Um cursor inválido retorna HTTP 400.

A atividade diária é limitada a 5.000 commits por consulta e fica em cache pelo SHA do `HEAD`; se não houver commit novo, a agregação não é recalculada. A rota de eventos lê apenas as últimas linhas necessárias do arquivo JSONL, em vez de materializar o log inteiro.

No frontend, o dashboard preserva o último snapshot válido durante a coleta, não inicia um segundo ciclo enquanto o primeiro está em andamento e mescla commits novos em uma janela máxima de 20 itens sem duplicação. A nova visualização de cadência tem uma barra por dia, não uma barra por commit.

> O monitor agora acompanha a produção de commits por **janela incremental e agregação**, em vez de tentar renderizar a história inteira.

## Arquivos alterados

| Arquivo | Alteração |
| --- | --- |
| [`backend/server.py`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/backend/server.py) | Cursor incremental, teto de leitura, cache por SHA, agregação diária e leitura de cauda dos eventos. |
| [`requirements.txt`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/requirements.txt) | Declaração explícita de `GitPython`, usado pelo endpoint do Git DB. |
| [`src/pages/jarvis-dashboard.ts`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/src/pages/jarvis-dashboard.ts) | Snapshot resiliente, polling single-flight, mesclagem incremental e gráfico agregado. |
| [`src/styles/jarvis-dashboard.css`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/src/styles/jarvis-dashboard.css) | Estilos da cadência diária e da indicação da janela visual. |
| `docs/audits/2026-08-19-commit-monitor.md` | Registro desta auditoria, contrato, testes e rollback. |

## Testes e gates

| Comando | Resultado |
| --- | --- |
| `python3 -m py_compile backend/server.py` | Passou. |
| Validação isolada com 125 commits e 200 eventos | Passou; confirmou limite 100, cursor no `HEAD`, cursor intermediário, HTTP 400 para cursor inválido e retorno das últimas 7 linhas. |
| `npm run tipos:ts` | Passou. |
| `npm test` | Passou: 977 testes, 6 ignorados, 0 falhas. |
| `npm run build` | Passou. |
| `npm run smoke` | Passou: 99 rotas verdes. |
| `npm run tipos:v2` | Passou. |
| `git diff --check` | Passou. |

O smoke inicialmente encontrou apenas a ausência do navegador headless no ambiente de teste. O runtime foi instalado e o comando foi repetido com sucesso. Os relatórios gerados automaticamente pelo smoke foram restaurados para que não fizessem parte do diff da correção.

## Riscos e limitações

A série diária possui teto de amostragem de 5.000 commits; quando esse teto é atingido, a API sinaliza `activityTruncated: true` e a interface informa que os valores podem estar subestimados. Esse limite é deliberado para impedir que o gráfico se torne outro gargalo.

O dashboard ainda faz uma reconstrução controlada da composição de cards quando recebe um snapshot novo; a diferença é que essa reconstrução ocorre no máximo uma vez por ciclo concluído e com dados limitados/agregados. Uma futura otimização poderia atualizar apenas nós específicos, mas ela não é necessária para resolver o gargalo atual.

A página genérica `/graficos` continua sendo um gerador manual de gráficos. A visualização automática de commits foi colocada no dashboard vivo, onde existe o contrato do Git DB, sem acoplar o gerador genérico a uma fonte externa.

## Rollback

Como não houve commit novo nem push remoto, o rollback local pode ser feito restaurando os cinco arquivos alterados:

```bash
git restore backend/server.py requirements.txt src/pages/jarvis-dashboard.ts src/styles/jarvis-dashboard.css
git clean -f -- docs/audits/2026-08-19-commit-monitor.md
```

O rollback remove somente a correção desta tarefa e não altera o histórico Git remoto.

## Ações externas não executadas

Nenhum commit foi criado, nenhum push foi feito e nenhuma ação foi executada no GitHub, Gmail, Supabase, Vercel ou em outro serviço externo. A dependência `GitPython` foi instalada no ambiente de validação e declarada no `requirements.txt`; a instalação de produção ainda precisa ser feita pelo fluxo normal de deploy.

## Próximo passo recomendado

Revisar o diff local e, após a aprovação, criar **um único commit consolidado** para esta correção. Depois do deploy do backend com GitPython disponível, abrir o dashboard vivo e confirmar que o gráfico mostra a cadência diária enquanto o histórico individual permanece limitado à janela recente.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/backend/server.py "Backend do Projeto-Baluarte"
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/src/pages/jarvis-dashboard.ts "Dashboard vivo do JARVIS"
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/blob/main/src/pages/graficos.ts "Gerador genérico de gráficos"

## Adendo — isolamento entre monitor e gráfico

O dashboard foi dividido em dois circuitos independentes. O monitor controla status, sessões, memória e eventos com `monitorInFlight` e `monitorTimer`. O gráfico controla commits e cadência com `graphInFlight` e `graphTimer`. Cada circuito preserva o último snapshot válido e exibe seu próprio estado de indisponibilidade.

Quando o endpoint de commits falha, o monitor continua renderizando e atualizando seus quatro cards. Quando o endpoint de status falha, o gráfico continua renderizando a atividade e a lista de commits. Nenhum circuito limpa o painel do outro durante uma atualização.

| Cenário simulado no navegador | Resultado |
| --- | --- |
| `/jarvis-db/commits` indisponível | Monitor continuou com 4 cards; gráfico informou que o monitor seguiria independente. |
| `/jarvis-db/status` indisponível | Gráfico continuou com `graph-test` e `Cadência de commits`; monitor mostrou último estado mantido. |

A implementação foi validada com `npm run tipos:ts`, `npm test` — 977 aprovados, 6 ignorados e 0 falhas —, `npm run build`, `npm run smoke` — 99 rotas verdes — e `git diff --check`. Nenhum commit ou push foi executado.

## Adendo — capacidade mínima de 5.000 commits por semana

O requisito operacional informado pelo proprietário é suportar pelo menos 5.000 commits por semana. Como o gráfico agrega uma janela de 14 dias, o teto anterior de 5.000 commits poderia truncar uma semana cheia mais parte da semana seguinte. O teto foi ajustado para `20_000` commits por janela de 14 dias: 10.000 commits correspondentes a duas semanas de requisito, com margem adicional de 2x.

O limite `COMMIT_LIMIT_MAX = 100` continua existindo somente para a lista textual de commits individuais. Ele não limita a capacidade agregada do gráfico; a interface mostra até 20 commits recentes e transforma o volume restante em 14 barras diárias.

| Cenário | Resultado |
| --- | --- |
| 10.000 commits sintéticos em 14 dias | Todos agregados; `activityTruncated: false`. |
| Teto configurado | 20.000 commits por janela de 14 dias. |
| Primeira consulta do benchmark de 10.000 commits | 655,42 ms. |
| Consulta aquecida pelo cache | 13,67 ms. |
| Histórico real atual, 1.576 commits | 34,32 ms na primeira consulta e 7,74 ms aquecido. |
