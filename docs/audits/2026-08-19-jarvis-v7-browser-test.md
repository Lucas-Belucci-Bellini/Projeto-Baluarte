# Teste de navegador do JARVIS Núcleo V7

Data do teste: 2026-08-19

## Ambiente

- Arquivo: `project V2/Modelar objeto 3D/jarvis-nucleo-v7.html`
- Servidor: HTTP estático local em `127.0.0.1:4187`
- Arquivo TypeScript servido: `jarvis-nucleo-v7.ts` com HTTP 200
- Página testada: `http://127.0.0.1:4187/jarvis-nucleo-v7.html`

## Resultado observado

A página carregou com título `NÚCLEO J.A.R.V.I.S. v7 · Astrolábio Sonoro · Projeto Baluarte`, removeu a tela de carregamento, criou um elemento `canvas` e renderizou o núcleo 3D com Three.js. Os controles `música`, `ficheiro`, `microfone`, `pulso`, `varrimento`, `dissecar`, `retrato`, `rotação`, `captura`, `ouro`, `rubi` e `jade` apareceram no DOM e na tela.

O console não apresentou erro de JavaScript, erro de rede, erro do Three.js ou erro de carregamento do TypeScript. O único registro foi o aviso informativo esperado do Babel Standalone sobre transpilar scripts no navegador:

> You are using the in-browser Babel transformer. Be sure to precompile your scripts for production.

Conclusão parcial: o HTML funciona quando servido por HTTP. Abrir diretamente via `file://` pode não ser suportado de forma confiável por causa do carregamento do TypeScript relativo; a forma operacional recomendada é hospedá-lo via GitHub Pages, servidor HTTP ou outro host estático.

## Interações testadas

- O botão `pulso` alterou a animação do núcleo e permaneceu responsivo.
- O botão `rubi` alterou o tema visual e exibiu o rótulo `espectro rubi`.

Ambas as ações foram realizadas no navegador sem erro visível ou falha de JavaScript.

## Validação após a correção

A versão corrigida foi servida novamente em `http://127.0.0.1:4187/jarvis-nucleo-v7.html?compiled=1`. O HTML carregou `jarvis-nucleo-v7.js`, criou o canvas 3D, concluiu o boot visual e exibiu todos os controles. O console ficou sem registros, incluindo sem o aviso anterior do Babel, confirmando que o transpile em tempo de execução foi removido com sucesso.

## Interações após a compilação

- `bView` alternou de `retrato` para `diagnóstico` e atualizou o rótulo na interface.
- `bScan` acionou o efeito de varrimento sem interromper a cena.

As duas ações responderam visualmente sem erros no navegador.

## Gates locais após a correção

Executados em 2026-08-19:

| Gate | Resultado |
|---|---:|
| `npm run tipos:ts` | PASS |
| `npm test` | PASS |
| `npm run build` | PASS |
| `npm run tipos:v2` | PASS |
| `npm run v2:integracao` | PASS — 19/19 |
| `npm run smoke` | PASS — 99/99 rotas verdes |
| `npm run caminho-critico` | PASS — 15/15 afirmações |

O build exibiu apenas o aviso já existente sobre chunks grandes do aplicativo principal; não houve falha de compilação ou teste.

## Validação do artefato de deploy

O Vite passou a tratar `jarvis-nucleo-v7.html` como entrada multipágina. O build gerou:

- `dist/project V2/Modelar objeto 3D/jarvis-nucleo-v7.html`
- `dist/assets/jarvisNucleoV7-DS30hhbo.js`

A simulação HTTP retornou `200` para a página e para o bundle. A rota foi aberta no navegador com o caminho codificado e renderizou o núcleo 3D completo, com canvas e controles. O console ficou sem registros.
