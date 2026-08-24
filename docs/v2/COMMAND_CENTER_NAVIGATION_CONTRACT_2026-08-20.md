# Command Center e Navegação em Dois Níveis

**Status:** `IMPLEMENTED — READ-ONLY PILOT`

**Base:** `8e1cec266f10c0e64064e6330ef099692cb49060`

**Novo marco local:** piloto validado com `25/25` na integração V2 e `16/16` nos testes UI; publicação no `main` ocorrerá somente após os gates completos.

## Origem da decisão

O material anexado propõe reduzir a sidebar a grandes sistemas do Baluarte e mover a profundidade para dentro de cada domínio. A proposta também sugere um Command Center na Home, uma busca universal e uma barra superior mais simples. A ideia é compatível com a auditoria UI-00 porque resolve o crescimento da informação sem reescrever o shell inteiro.

A decisão atual não altera a sidebar pública. Primeiro foi criado um contrato puro que transforma a projeção já existente do Registry em categorias e comandos pesquisáveis. Assim, a arquitetura pode ser testada antes de qualquer mudança visual.

> **Princípio adotado:** a sidebar futura pode mostrar sistemas; o contrato atual ainda preserva cada rota, domínio e fallback enquanto a migração é observada.

## Contrato implementado

`src/layout/command-center.ts` expõe `projectCommandCenter()` e `searchCommandCenter()`. A função recebe um `NavigationProjection` existente e uma lista explícita de definições de categoria. Ela não consulta DOM, não registra rotas, não monta páginas, não cria um Event Bus e não concede permissões.

| Contrato | Responsabilidade |
|---|---|
| `CommandCenterCategoryDefinition` | Mapear domínios existentes a um grande sistema, com label, ícone e ordem |
| `CommandDescriptor` | Projetar uma rota já existente como comando pesquisável |
| `CommandCenterCategory` | Agrupar comandos preservando fallback e ordem |
| `CommandCenterProjection` | Expor categorias, comandos e placeholder da busca |
| `searchCommandCenter()` | Buscar por label, título, path e domínio normalizados |

## Categorias do piloto

O harness V2 usa definições de teste para `Global`, `IA`, `Desenvolvimento`, `Conhecimento`, `Criativo` e `Ecossistema`. Domínios que ainda não têm mapeamento não desaparecem: entram em `Outros sistemas` com `fallback: true`.

Isso evita que a visão futura invente uma taxonomia incompatível com o catálogo atual. O próximo passo poderá substituir os nomes experimentais por uma decisão registrada no Manifest, mas não deve remover o fallback até que todos os domínios tenham paridade verificada.

## Busca universal

A busca do piloto devolve comandos derivados da navegação atual. A consulta `editor` encontra `/editor` e preserva sua categoria derivada. O contrato não executa o comando; ele apenas retorna o descriptor. A execução futura deverá reutilizar o router e o Event Bus existentes, com autorização e disponibilidade avaliadas no momento da ação.

Nenhum resultado contém stack trace, token, capability interna ou decisão de papel. Módulos `disabled`, `maintenance` ou `quarantined` não ganham acesso pela busca. O descriptor pode ser filtrado por uma camada de disponibilidade autorizada antes de qualquer execução visual.

## Relação com o layout proposto

| Ideia do anexo | Tratamento atual |
|---|---|
| Sidebar com 8–10 sistemas | Preparada por categorias read-only; sidebar V1 ainda não substituída |
| Navegação em dois níveis | Contrato de categoria + comandos; painel contextual ainda não implementado |
| Home Command Center | Roadmap; não há alteração da Home neste slice |
| `Ctrl + K` | Roadmap; o contrato de busca existe, o atalho visual ainda não |
| Barra superior simplificada | Roadmap; header V1 permanece intacto |
| Universal Search | Piloto read-only com busca sobre projeção Registry |
| Ferramentas agrupadas | Preparado por domínio; sem remoção ou movimentação de rotas |

## Segurança e compatibilidade

O contrato mantém `ShellRefs`, `renderSidebar()`, o router V1 e as 99 rotas. Ele não infere permissão a partir de `phase`, `stability`, localStorage, query string ou metadata do cliente. Os gates de health e promoção continuam anteriores a qualquer ação.

A busca não é uma fronteira de segurança. Deep links, claims server-side, disponibilidade do Registry, Auth/RLS e fallback continuam sendo avaliados por suas respectivas camadas. Uma entrada encontrada não significa que a superfície possa ser aberta ou que o usuário tenha autoridade para executar uma ação.

## Validação

| Gate | Resultado |
|---|---:|
| Testes UI | 16/16 |
| Integração browser V2 | 25/25 |
| Fallback de domínios sem mapeamento | verde |
| Busca `editor` → `/editor` | verde |
| Sidebar V1 substituída | não |
| Router V1 alterado | não |
| Auth/RLS/Billing ativados | não |

## Riscos e rollback

O risco principal é criar uma taxonomia paralela ao Module Manifest. O contrato reduz esse risco exigindo definições explícitas, rejeitando domínios atribuídos a duas categorias e preservando uma categoria de fallback. O rollback é remover o novo contrato, a exposição read-only do harness, os testes e a documentação; nenhuma rota ou dado persistido precisa de migração.

O contrato não é uma declaração de que o novo layout está pronto. Ele é a base testável para uma futura superfície de Command Center. A promoção visual só poderá começar após paridade de catálogo, acessibilidade, deep links, disponibilidade server-side, observabilidade e um plano de retorno ao shell V1.

## Próximo marco

O próximo slice recomendado é um protótipo visual isolado do Command Center dentro do harness V2, sem montar no `#app` público. Esse protótipo deve usar os descriptors reais, respeitar keyboard navigation e reduced motion e comprovar que o fallback V1 continua disponível.

## Referências

[1]: ./UI_00_INVENTORY_2026-08-20.md "Inventário do shell e limites UI-00"
[2]: ./PHASE_UI_DESIGN_SYSTEM.md "PHASE UI — Design System e Information Architecture"
[3]: ./UI_03_REGISTRY_OBSERVATION_2026-08-20.md "Observação Registry read-only"
[4]: ./PROMOTION_GATE_EDITOR_2026-08-20.md "Gate de promoção controlada"
[5]: ../../src/layout/command-center.ts "Contrato Command Center"
[6]: ../../scripts/v2-integracao.mjs "Gate browser V2"
