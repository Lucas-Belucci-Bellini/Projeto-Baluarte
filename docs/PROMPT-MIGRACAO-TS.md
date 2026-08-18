# Prompt — terminar a migração das páginas para TypeScript

Cole o bloco abaixo numa sessão **local** nova. Ele é autossuficiente: não depende
de nada que tenha sido dito em conversa anterior.

> **Por que existe:** o operador decidiu levar **todas** as páginas a TypeScript,
> porque isso já conserta defeitos do site. Faltam 5. A medição, a ordem e os
> bloqueios estão em [`v2/TYPESCRIPT_REMAINING.md §0`](./v2/TYPESCRIPT_REMAINING.md).

---

```
Sessão LOCAL do Projeto Baluarte (Windows). Leia o CLAUDE.md e o
docs/HANDOFF-LOCAL.md (a seção de retomada, no topo) antes de mexer.

OBJETIVO ÚNICO
Terminar a migração das páginas de JavaScript para TypeScript. Só pare quando
`src/pages/*.js` não tiver mais nenhum módulo canônico — isto é, quando todo
`.js` em src/pages for um wrapper de uma linha.

Faltam 5. A medição está em docs/v2/TYPESCRIPT_REMAINING.md §0, e a ordem
importa porque o que separa uma página da outra é quantas fontes de dados ainda
estão sem declaração:

  1. visao.js          832 linhas ·  1 import ·  0 sem tipo  <- comece por esta
  2. wiki-arma3.js     756        ·  5        ·  3
  3. vanguard.js       822        ·  8        ·  5
  4. jarvis.js         999        · 17        ·  5
  5. arma3-tutorial.js 1376       · 11        ·  9

Só a visao.js dá para migrar sem escrever nenhum .d.ts antes. As outras quatro
exigem tipar as fontes primeiro (wiki-arma3, arma3-extracao, arma3-classes,
arma3-armas, arma3-terrenos, arma3-balistica, os jarvis-*).

O PADRÃO, que já vale para as 102 páginas migradas
- A implementação vai para `src/pages/X.ts`.
- O `src/pages/X.js` vira UM re-export: `export { xPage } from './X.ts';`
- O `src/main.js` NÃO muda — ele continua importando o `.js`.
- Olhe `src/pages/radio.ts` e `src/pages/arsenal.ts` como referência viva.

A REGRA QUE NÃO SE NEGOCIA
Das 102 páginas já em TypeScript, **nenhuma usa `any`** — zero ocorrências de
`: any` ou `as any` em src/pages/*.ts, e 79 delas declaram tipos locais. Uma
página migrada com `any` passa no `tipos:v2` e não conserta defeito nenhum: é
tipo decorativo, o oposto do motivo de a migração existir. Prefira uma página
bem tipada por vez a cinco anotadas.

Quando a página consome dado sem tipo, escreva o `.d.ts` da FONTE antes — é o
que arsenal.ts faz (`import type { ArsenalCategory } from '../data/arsenal.js'`).
Não invente tipos locais duplicando o que a fonte já sabe.

PARTICULARIDADE DA PRIMEIRA
visao.js tem 6 classes e usa globais de CDN do MediaPipe (window.FaceMesh,
window.Hands, window.Camera). Tipá-la sem `any` exige `declare global` para
esses três — veja como radio.ts faz com `webkitAudioContext`.

COMO VERIFICAR CADA PÁGINA (nesta ordem)
  npm run tipos:v2          -> tem de sair 0 erros
  npx tsx --test <testes>   -> `npm test` NÃO roda no Windows (usa o find do DOS);
                               enumere os arquivos com globSync do Node
  npm run smoke             -> abre todas as rotas num Chromium real
Rode o smoke DEPOIS de cada página: ele é o único que prova que a rota ainda
renderiza. Tipo verde com tela branca é o pior resultado possível.

REGRAS DO PROJETO
Branch por feature a partir do main, commit pequeno, entrada no
historico/CHANGELOG.md, backup branch antes de qualquer merge. Migração de
página é comportamento visível: pare para revisão em vez de mesclar sozinho.

ARMADILHAS JÁ PAGAS — não reintroduza
- Família "Windows", nove instâncias. Script novo que monta caminho, compara
  texto de arquivo ou spawna processo tem que ser pensado nos dois sistemas — o
  CI só cobre Linux. `import()` de caminho absoluto precisa de pathToFileURL.
- Peça pronta e DESLIGADA dá o mesmo retrato verde que peça ligada. Antes de
  acreditar que algo está em uso, ache os importadores por busca textual: o
  índice do GitNexus responde e MENTE sobre TypeScript (omite consumidores .ts),
  então `impact()` não serve aqui — declare isso a cada edição.
- Ao escrever teste, plante o defeito e confirme o vermelho. Nesta base já houve
  asserção que passava com a peça quebrada.

ESTADO ATUAL
main em 3998e8ff. Branch aberta e não mesclada: feat/v2-ambiente-aplicado (muda
contrato: LifecycleStartResult e BootResult). Backup do main anterior:
backup/2026-08-17-antes-merge-v2 -> 91b01188.

O Rust roda nesta máquina pelo toolchain GNU:
  cargo +stable-x86_64-pc-windows-gnu test --manifest-path v2/runtime/Cargo.toml
com o mingw64\bin do pacote BrechtSanders.WinLibs.POSIX.UCRT no PATH.

NÃO FAÇA
- Não converta as 5 de uma vez. Uma por vez, verificada, commitada.
- Não remova os wrappers .js — consumidores legados ainda importam por eles.
- Não toque no Supabase Preview (é decisão de produto, já diagnosticada).
- Não mescle no main sem eu pedir.

Me diga, ao fim de cada página, o que NÃO conseguiu verificar.
```

---

## Como saber que acabou

```bash
node -e "const{globSync}=require('node:fs'),fs=require('fs');const f=globSync('src/pages/*.js').filter(p=>!fs.existsSync(p.replace(/\.js$/,'.ts')));console.log(f.length?f.join('\n'):'nenhuma pagina canonica em JS')"
```

Quando isso imprimir `nenhuma pagina canonica em JS`, o objetivo do prompt foi
cumprido. e cada vez qye terminar uma pagina jogue no github
