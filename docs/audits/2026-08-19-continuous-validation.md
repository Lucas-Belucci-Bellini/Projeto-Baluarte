# Validação contínua do Projeto-Baluarte

## Baseline

O checkout estava na branch `main`, sincronizado com `origin/main` no SHA `1e500e3f8be3bea4a4fefaad23f3f7660f9dbe82`, sem mudanças pendentes. Os arquivos do README, hero SVG, HTML V7, JavaScript compilado e auditoria estavam presentes.

## Gates locais

Todos os comandos abaixo terminaram com código `0`:

| Gate | Resultado |
|---|---:|
| `npm run tipos:ts` | PASS |
| `npm test` | PASS |
| `npm run build` | PASS |
| `npm run gen-tabela-estabilidade -- --verificar` | PASS |
| `npm run tipos:v2` | PASS |
| `npm run v2:integracao` | PASS — 21/21 |
| `npm run smoke` | PASS — 99/99 rotas verdes |
| `npm run caminho-critico` | PASS — 15/15 |
| `npm run v2:runtime` | PASS — 12 testes unitários, 3 testes de processo |

## JARVIS em produção

A página pública `https://projeto-baluarte.vercel.app/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html` abriu com o título do Núcleo V7, canvas 3D e controles de música, ficheiro, microfone, pulso, varrimento, dissecação, retrato, rotação, captura e temas Ouro/Rubi/Jade. O console do navegador não apresentou saída ou erro.

## Interações em produção

Após a abertura pública, o botão **Pulso** respondeu e a cena continuou animada. Em seguida, o tema **Rubi** foi acionado; o estado textual `espectro rubi` apareceu e a paleta da cena mudou visualmente. Não houve erro de console durante a sequência.

O teste do bundle deve usar o asset hash servido pelo Vite (`/assets/jarvisNucleoV7-DS30hhbo.js`), não o caminho-fonte `project V2/Modelar objeto 3D/jarvis-nucleo-v7.js`. A página carregou esse asset com HTTP 200.

## Gates remotos

O main recebeu commits automáticos de documentação V2 durante a rodada. No SHA `1e500e3f8be3bea4a4fefaad23f3f7660f9dbe82`, os sete gates (`Vigia das rotas`, `V2 Runtime`, `Core CI`, `Arma 3 Data CI`, `V2 Validation`, `CI` e `CodeQL`) terminaram com sucesso. O SHA seguinte `e61a786f9393ea71547f7be54272654eabc93285`, também com alterações automáticas de V2, repetiu os sete gates com sucesso.

## Terceira rodada

A terceira rodada repetiu `tipos:ts`, testes, build, estabilidade, `tipos:v2`, integração V2, smoke, caminho crítico e Runtime sem falhas. O JARVIS público abriu novamente com canvas 3D e os controles de música, ficheiro, microfone, pulso, varrimento, dissecação, retrato, rotação, captura e temas. O console ficou sem saída ou erro.

## Auditoria do vínculo HTML + TypeScript

O `jarvis-nucleo-v7.html` contém a interface, estilos e elementos de controle, mas carregava `./jarvis-nucleo-v7.js`. O `jarvis-nucleo-v7.ts` é a fonte canônica e possui o boot completo `init() → setView() → animate()`, porém antes desta mudança só participava da geração prévia do artefato JavaScript.

Para que o HTML e o TypeScript funcionem juntos no desenvolvimento, a entrada multipágina do Vite deve carregar `./jarvis-nucleo-v7.ts` diretamente. O Vite transpila e empacota essa fonte no build; o artefato `.js` permanece rastreado como fallback standalone e referência de produção compilada, mas deixa de ser a fonte carregada pelo HTML dentro do pipeline Vite.

## HTML + TypeScript no Vite

O servidor Vite de desenvolvimento entregou o `jarvis-nucleo-v7.html` com `@vite/client`, respondeu o `jarvis-nucleo-v7.ts` transformado em JavaScript com HTTP 200 e abriu a cena 3D no navegador. O canvas e os 12 controles do HTML apareceram, e o console do navegador não apresentou erros. Isso confirma a integração direta HTML → TypeScript no modo de desenvolvimento.

O teste interativo do modo HTML + TS também passou: o botão **Pulso** respondeu e o tema **Rubi** mudou a cena e exibiu `espectro rubi`, sem erro de console.

## Build e produção estática

Após remover o import dinâmico variável, o build voltou a gerar o bundle completo `jarvisNucleoV7-BLLSuDmJ.js` com 41,94 kB. O HTML em `dist` apontou para esse bundle, que respondeu HTTP 200. A versão estática abriu no navegador com canvas 3D, controles completos e console limpo. O import dinâmico de 0,25 kB foi rejeitado como solução porque não empacotava a fonte; a entrada TypeScript direta do Vite é a implementação final.

## Deploy público após a integração

O commit `ca803a40148b7f585530569180dc8962990e6bc0` recebeu deploy Vercel com sucesso. A página pública passou a referenciar `jarvisNucleoV7-BLLSuDmJ.js` — o bundle de 41,94 kB gerado a partir do `jarvis-nucleo-v7.ts` — e tanto a página quanto o bundle responderam HTTP 200. A cena 3D apareceu no navegador público e o console não apresentou erros.

O check `Supabase Preview` continua reportando a divergência pré-existente `Remote migration versions not found in local migrations directory`; o mesmo erro já estava presente no commit anterior e não é causado pela integração do JARVIS. Os gates do Projeto-Baluarte e o deploy Vercel terminaram com sucesso.

A instância local também foi exposta temporariamente por um proxy HTTP para validação externa. O proxy retornou HTTP 200, a cena 3D e os controles apareceram no navegador e o console compartilhado ficou sem erros; o endereço temporário não é tratado como URL permanente.

## Rodada contínua posterior

Os gates locais foram repetidos sem falhas: validador do JARVIS, TypeScript, 1.085 testes, build, estabilidade, tipos V2, integração V2 21/21, smoke 99/99, caminho crítico 15/15 e Runtime. O JARVIS local abriu novamente com canvas e controles; o console permaneceu sem erros.

## Nova rodada contínua de validação

O estado dos dois repositórios foi confirmado sincronizado com seus respectivos `origin/main` e sem alterações locais. Os gates locais repetidos passaram: validador JARVIS, TypeScript, 1.085 testes, build, tabela de estabilidade, tipos V2, integração V2 21/21, smoke, caminho crítico 15/15 e Runtime V2. O JARVIS local abriu com canvas 3D e controles; o botão de rotação foi acionado e a cena respondeu visualmente.

## Rodada contínua adicional

Os gates locais foram repetidos novamente sem falhas. O JARVIS local abriu com canvas 3D e controles; o botão Pulso foi acionado e a cena respondeu visualmente. A validação pública e os gates remotos ainda serão conferidos nesta rodada.
