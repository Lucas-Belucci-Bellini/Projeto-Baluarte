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
