---
name: run-projeto-baluarte
description: Rodar, buildar, testar ou tirar screenshot do site Projeto Baluarte. Use quando pedirem para "rodar o site", "subir o servidor", "tirar screenshot da página X", "verificar se a página Y funciona" ou rodar o smoke test (boot + editor de código).
---

# Rodar o Projeto Baluarte

Site em JavaScript puro (sem framework) servido pelo **Vite**, com rotas por
hash (`#/home`, `#/editor`, `#/arsenal`, `#/codigo`…). O jeito de dirigir o
site de forma programática é o **driver Playwright** desta skill — ele sobe o
vite sozinho se a porta 5173 estiver livre, ou reaproveita um servidor já de pé.

Todos os caminhos abaixo são relativos à **raiz do repositório**.

## Pré-requisitos

```bash
npm install   # só vite; node >= 18
```

O driver usa o `playwright` global do container (`/opt/node22/lib/node_modules`)
e o Chromium de `/opt/pw-browsers` — nada a instalar no container do Claude
Code. Fora dele: `npm i -g playwright && npx playwright install chromium`
(ou aponte `CHROME_PATH` para um Chrome existente).

## Caminho do agente (use este)

```bash
# teste rápido de saúde: boot + Editor de Código (highlight e autocomplete, issue #197)
node .claude/skills/run-projeto-baluarte/driver.mjs smoke

# screenshot de qualquer rota
node .claude/skills/run-projeto-baluarte/driver.mjs shot '#/editor' /tmp/editor.png

# rodar JS dentro da página e ver o retorno
node .claude/skills/run-projeto-baluarte/driver.mjs eval '#/home' 'document.title'
```

Saída esperada do `smoke`:

```
boot ok · título: Ponte de Comando · Baluarte
editor: highlight ok (números coloridos, HTML íntegro)
editor: autocomplete ok (sou + Tab → System.out.println)
SMOKE OK
```

## Caminho humano

```bash
npm run dev        # vite na :5173, abre no navegador
npm run build      # build de produção em dist/ (deploy é na Vercel)
```

## Gotchas

- **O textarea do editor é transparente de propósito** (`color: transparent`):
  o texto colorido que se vê é um `<pre class="editor-highlight">` por baixo.
  Para ler o que está "escrito", use `inputValue('.editor-textarea')`; para
  conferir cores, leia o `innerHTML` de `.editor-highlight code`.
- **Estado fica no localStorage** (abas do editor, perfil, memórias do
  JARVIS). Cada launch do driver usa um perfil limpo de navegador, então os
  testes não vazam estado entre execuções — mas dentro de uma mesma página,
  o que você digitar persiste se recarregar.
- **Chromium precisa de `--no-sandbox --disable-gpu`** no container (o driver
  já passa).
- **`pkill -f "vite --port 5173"` mata o seu próprio comando** se a string
  estiver na linha de comando dele — use `pkill -f "[v]ite --port"`.
- Rotas são **hash routing**: é `#/editor`, não `/editor`.

## Troubleshooting

| Sintoma | Causa/Correção |
|---|---|
| `Cannot find module 'playwright'` | O driver já tenta `/opt/node22/lib/node_modules/playwright`; fora do container, `npm i -g playwright` |
| `vite não subiu na porta 5173` | Falta `npm install`, ou a porta está com outro processo (`--strictPort` não rouba porta) |
| Screenshot em branco | Falta o `waitForTimeout` pós-navegação (animações de entrada); o driver já espera 800ms |
