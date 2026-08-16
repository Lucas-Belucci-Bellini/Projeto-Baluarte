# Handoff — próximo bloco da V2

Escrito ao fim de uma sessão **LOCAL** (16/08/2026) para a próxima começar
andando, em vez de redescobrir. A fonte de verdade do que existe continua sendo
[`docs/v2/V2_PROGRESS.md`](v2/V2_PROGRESS.md); este arquivo diz **por onde pegar
e onde estão as minas**.

## Onde parou

Branch `claude/nexus-config-refactor-462339`, publicada, **PR ainda não aberto**.

Item 1 do "próximo bloco" está fechado: a fachada operacional (`criarPlataforma`)
passou a dirigir o entrypoint oficial (`v2/harness/main.js`), que antes subia o
`boot` na mão — sem supervisor, sem saúde, sem lifecycle. Os cinco itens
restantes seguem abertos.

## Pegue por aqui: o portão está vermelho

**Não comece pelo item 2 da lista.** Comece consertando o `13/14`.

```bash
npx playwright install chromium   # uma vez por máquina (114 MB)
npm run v2:integracao
```

Falha: `a superfície de briefing V2 renderiza`. O próprio script aponta a causa
provável — [`docs/v2/V2_MODULE_RULES.md`](v2/V2_MODULE_RULES.md), *"view devolve
o ELEMENTO"*.

É **anterior** à integração da fachada (medido: revertendo só o
`v2/harness/main.js`, dá 13/14 igual, mesma asserção). Ficou invisível porque
este portão **nunca tinha rodado no Windows**.

A razão de vir primeiro: com o portão vermelho, todo item seguinte fica
não-verificável — não dá para distinguir "quebrei agora" de "já estava quebrado"
sem repetir a medição a cada passo. Verde primeiro, construção depois.

## Minas já medidas — não gaste sessão redescobrindo

**1. Node 24 no Windows recusa spawnar `.cmd`.** É a correção do
CVE-2024-27980; aparece como `EINVAL` ou `ENOENT`. Como `npm`, `npx`, `corepack`
e o `gitnexus` global são todos wrappers `.cmd`, spawnar "o comando certo"
simplesmente não funciona. **Três instâncias encontradas nesta sessão**:
`scripts/sync-ai-tools.mjs`, `desktop/src/nexus.js` (vias `global` e `npx`) e
`scripts/v2-integracao.mjs`. Se for spawnar ferramenta nova, presuma que cai
nisto. Dois consertos válidos: chamar o bin com o próprio Node (preferível
quando é dependência do repo) ou rotear por `cmd.exe /d /s /c` com
`windowsVerbatimArguments` — ver `paraSpawnWindows` em
[`scripts/lib/ai-tools.mjs`](../scripts/lib/ai-tools.mjs).

**2. `npm test` está quebrado no Windows.** O script usa
`$(find test -name '*.test.js')`, que o cmd.exe não expande — o `tsx` recebe o
diretório `test` literal e morre em `ERR_UNSUPPORTED_DIR_IMPORT`. Rode por bash:

```bash
npx tsx --test $(find test -name '*.test.js')
```

Isso importa porque "suíte verde no congelamento" é item aberto da 1.0.0.

**3. `npm run tipos:ts` não cobre tudo.** O `tsconfig.json` inclui só `src/` e
`v2/`, e tem `allowJs: false`. Mudança em `desktop/**` ou `scripts/**` passa pelo
gate de tipos sem ser olhada — cubra com teste, não com `tsc`.

**4. O `v2:integracao` precisa do binário do Playwright.** Sem
`npx playwright install chromium` ele para antes de abrir o navegador.

## Dívidas que só uma sessão LOCAL fecha

- **Critério de aceite do app**: abrir o Baluarte Launcher, ir em `/git-nexus` e
  ver o badge verde com o orbe no grafo real. O processo está provado
  (`maybeStart()` sobe o motor empacotado e o `status()` volta `available: true`),
  mas **a janela nunca foi aberta**.
- **`npm run dist`** — o `extraResources` do motor está ligado, e nenhum
  instalador foi gerado para confirmar.
- **Release 1.0.0 do app + alias `v1.` na Vercel** — a própria
  [`docs/HARDENING-1.0.0.md`](HARDENING-1.0.0.md) marca como "só numa sessão
  LOCAL".

## A decisão que ainda não foi registrada

O ADR-001 diz que a **1.0.0 congela antes da V2**, e restam 5 itens abertos na
fila da 1.0.0 — todos ritual de congelamento (branch `release/v1.x`, tag, release
do app, triagem das 53 issues, suíte verde).

Construir V2 agora inverte essa ordem. O operador autorizou verbalmente nesta
sessão, mas **não há ADR registrando a inversão**. Enquanto não houver, uma
sessão nova vai ler o ADR-001, olhar a V2 andando, e não saber qual dos dois
vale. Se a inversão é para valer, ela merece um ADR; se foi pontual, merece
voltar à ordem.

> Nota de branches: `v2-development` e `release/v1.x` **não existem** — o modelo
> do `CLAUDE.md` descreve branches que nunca foram criadas. Na prática o código
> da V2 mora no `main`, e trabalho novo vai em branch própria a partir dele.

## Prompt para a próxima sessão

```
Sessão LOCAL do Projeto Baluarte. Leia docs/HANDOFF-V2-PROXIMO-BLOCO.md e
docs/v2/V2_PROGRESS.md.

Objetivo: deixar `npm run v2:integracao` em 14/14. Hoje dá 13/14 — falha
"a superfície de briefing V2 renderiza", e é defeito pré-existente, não
regressão. A pista está em docs/v2/V2_MODULE_RULES.md ("view devolve o
ELEMENTO"). Rode `npx playwright install chromium` uma vez antes.

Conserte a causa, não a asserção. Se descobrir que a asserção é que está
errada, diga isso com a evidência em vez de ajustá-la para passar.

Antes de commitar: npm run tipos:ts, npm run build e a suíte por bash
(npx tsx --test $(find test -name '*.test.js') — o `npm test` está quebrado
no Windows, ver o handoff).

Commit pequeno, branch própria a partir do main. Depois de verde, atualize a
caixa no V2_PROGRESS.md e siga para o item seguinte do "próximo bloco".

Me diga no fim o que NÃO conseguiu verificar.
```
