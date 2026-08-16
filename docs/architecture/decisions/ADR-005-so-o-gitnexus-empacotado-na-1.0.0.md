# ADR-005 — Só o GitNexus vai empacotado no instalador da 1.0.0

- **Status:** aceita
- **Data:** 2026-08-16
- **Contexto:** #222 (app desktop), #238 (web leve / app completo)
- **Depende de:** [ADR-001](ADR-001-1.0.0-como-ponto-de-congelamento.md) (a 1.0.0
  congela antes da V2) e [ADR-004](ADR-004-stack-poliglota-por-responsabilidade.md)
  (o app migra do Electron para Tauri **pós-1.0.0**)
- **Mecanismo:** [`docs/local-ai-tools.md`](../../local-ai-tools.md) ·
  `npm run motores:empacotar`

## O problema

O operador pediu que as 7 ferramentas de IA já estivessem disponíveis quando a
pessoa abrisse o app, sem `npm i -g` nem npx. A primeira ideia — versionar os
clones no repositório — não é viável: eles somam **~5,1 GB** contra os ~4,3 GB
que o repo já tem, e o GitHub bloqueia no push qualquer arquivo acima de 100 MB.
Pior: o volume vem de `node_modules` e build, que é exatamente a parte que faria
"já estar pronto".

O caminho certo é o **instalador**, não o git. Sobra decidir *quantos* motores
entram nele.

## A decisão

Na 1.0.0, **só o `gitnexus`** é empacotado. As outras seis ficam instaláveis
pelo `npm run tools:sync`, como já são hoje.

O `desktop/package.json` leva `desktop/engine/` em `extraResources`, e o
conteúdo é produzido por `npm run motores:empacotar`, declarado no bloco
`empacotar` de cada ferramenta no manifest. Só o `gitnexus` tem esse bloco.

## Por quê

**Três das sete não são serviços.** Pelo próprio manifest, `claude-code` e
`codex` são `referenciaApenas` — o primeiro não tem sequer `package.json`, e o
segundo é um workspace Rust que exige `cargo`, ausente na máquina do operador.
`claude-code-terminal` é plugin do Obsidian, e já está entregue do jeito certo:
o build (`main.js`) versionado em `.obsidian/plugins/`, o clone fora. Não há o
que um launcher "suba" nesses três.

**Duas exigiriam embarcar um runtime Python.** `graphify` e `hermes-agent` rodam
de venvs em `.baluarte/venvs/`, fora do clone e de propósito. Venv grava caminho
absoluto e não é relocável, então empacotá-los significa embutir Python no
instalador — investimento grande num app que o ADR-004 já marcou para virar
Tauri logo depois da 1.0.0.

**A sexta é viável, mas ninguém a consome.** O `openclaw` compila (`pnpm build`)
e poderia ser empacotado, mas o app não fala com ele: quem fala é a ponte
`scripts/openclaw-bridge.mjs`, contra um gateway na 18789 que o operador sobe.
Empacotar hoje seria pagar 3,1 GB de clone por uma integração que não existe.

**E o gitnexus custa caro sozinho.** O pacote enxuto dá **461 MB** — já é muito
para um launcher. Somar os outros passaria de 1 GB. O tamanho por si só pede que
a próxima conversa seja sobre *baixar sob demanda*, não sobre empacotar mais.

## Consequências

- O `/git-nexus` funciona no app instalado sem setup, que era o objetivo real.
- As outras seis continuam a um `npm run tools:sync -- <id> --setup` de
  distância, e o `npm run tools:status -- --remoto` diz quando envelhecem.
- O instalador cresce ~461 MB. É o preço aceito nesta versão.
- Nada do mecanismo é jogado fora na migração para Tauri: o manifest, o
  `empacotar-motores.mjs` e o `tools:status` são Node puro e produzem uma pasta,
  e o Tauri também tem `resources`. O descartável são as ~6 linhas de
  `extraResources` do electron-builder.

## O que revogaria esta decisão

- O app passar a **consumir** de fato um dos outros motores (o mais provável é o
  `openclaw`, se a ponte deixar de exigir gateway externo).
- A migração para Tauri, que reabre a pergunta com outro bundler e outro custo.
- A decisão de trocar "embutir no instalador" por "baixar no primeiro uso" — que
  tornaria o tamanho irrelevante e permitiria oferecer as sete.
