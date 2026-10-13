# ⬡ Baluarte — Próximos Passos

Plano de continuação. Leia este arquivo no início da próxima sessão para
saber exatamente o que fazer. Estado atual: **v2.0.0 entregue, 41 rotas**.

---

## Regras do projeto (não esquecer)

- **Stack:** JavaScript puro ES2022 + HTML5 + CSS3 + Vite 5. **Sem
  TypeScript, sem framework, sem JSX.** Páginas são funções que retornam
  `HTMLElement` via o helper `h()`.
- **Branches:** cada atualização vai na sua própria branch → PR → merge
  no `main`. O Vercel reconstrói a partir do `main`.
- `npm run build` precisa ficar sempre limpo.
- **Sem teste de navegador** do meu lado — o Lucas testa no Vercel e
  reporta. Responder ao Lucas em **português**.
- Não apagar branches antigas (`fase-*` e as `feat/*`) — o Lucas quer
  guardá-las.
- Push de **tags** é bloqueado pelo sandbox — a tag `v2.0.0` precisa ser
  criada pelo Lucas (GitHub Releases ou no PC dele).

### Checklist para ligar uma página nova

1. `src/main.js` — `import` + `router.register('/rota', () => pageFn())`
2. `src/layout/sidebar.js` — item no grupo `NAV_GROUPS` certo
3. `src/layout/shell.js` — título no mapa `pageTitleForRoute`
4. `index.html` — `<link rel="stylesheet">` do CSS novo
5. `src/pages/ferramentas.js` — `TOOL_ROUTES` (se for ferramenta do Hub)
6. `src/pages/perfil.js` — atualizar a contagem "Rotas ativas"
7. `src/main.js` — atualizar o comentário e o `console.log` de contagem

---

## Punch-list (em ordem sugerida)

### 1. Rádio — modo "Online" (estações reais)
Hoje `/radio` é um sintetizador (Web Audio). Adicionar um **modo
Online** com estações de rádio de internet REAIS.
- Usar a **Radio Browser API** (`https://de1.api.radio-browser.info` —
  gratuita, sem chave, com CORS). Endpoint de busca:
  `/json/stations/search?name=&country=&tag=&limit=`.
- Tocar o campo `url_resolved` da estação num `<audio>`.
- Toggle Sintetizador / Online; busca por nome/país/gênero.
- Tratar streams mortos (evento `error` do `<audio>`).
- Arquivo: `src/pages/radio.js`.
- **Importante:** rádio RF de verdade (ondas no ar) é impossível no
  navegador — só streams de internet. Já expliquei isso ao Lucas.

### 2. QR Code Studio — leitura pela câmera + mais
- **Ler QR pela câmera:** usar a API `BarcodeDetector`
  (`new BarcodeDetector({ formats: ['qr_code'] })`) com `getUserMedia`.
  Mostrar aviso se o navegador não suportar.
- **Versões maiores** (5+): exige interleaving multi-bloco no
  codificador — hoje `src/utils/qr-encoder.js` só faz bloco único v1-4.
- **Modelos:** WiFi (`WIFI:S:<ssid>;T:WPA;P:<senha>;;`), vCard, e-mail.
- Arquivos: `src/pages/qr-studio.js`, `src/utils/qr-encoder.js`.

### 3. Editor — Find & Replace
- Painel de busca/substituição em `/editor` (`Ctrl+F` / `Ctrl+H`).
- Buscar, próximo/anterior, substituir, substituir tudo, contador.
- Arquivos: `src/pages/editor.js`, `src/styles/editor.css`.

### 4. Terminal — auditoria a fundo
- O bug do `cd` já foi corrigido. Revisar os ~60 comandos em
  `src/data/terminal-commands.js` procurando outros bugs.
- O Lucas quer que o terminal reproduza o comportamento do PowerShell —
  avaliar adicionar mais cmdlets/aliases.
- Arquivos: `src/data/terminal-commands.js`, `src/utils/terminal-engine.js`.

### 5. Logic Sim — lógica sequencial
- Adicionar flip-flops (D, JK, T) como componentes reais.
- Hoje o motor (`src/utils/logic-sim-engine.js`) assume **1 saída** por
  componente — flip-flops têm Q e Q̄, precisa generalizar `outs`.
- Salvar/carregar circuitos no localStorage (`serialize`/`deserialize`
  já existem — falta a UI de salvar/abrir).
- Arquivos: `src/utils/logic-sim-engine.js`, `src/pages/logic-sim.js`.

### 6. Color Studio
- Último item do roadmap sem página (id `colorpicker` no Hub).
- Nova página `/color-studio`: conversor HEX/RGB/HSL/OKLCH, gerador de
  paletas, construtor de gradiente, verificador de contraste (WCAG).
- Arquivos novos: `src/pages/color-studio.js`, `src/styles/color-studio.css`
  (+ dados se precisar). Apontar `colorpicker` em `TOOL_ROUTES`.

### 7. Polimento (opcional)
- O bundle JS passou de 500 KB — avaliar code-splitting por rota
  (`import()` dinâmico) ou `manualChunks` no `vite.config.js`.
- A fan fic (`fanfic.json`, 5 MB) já é servida como asset separado.

---

## O que a v2.0.0 entregou (contexto)

Correções (Tabela Verdade, terminal `cd`, dados desatualizados,
versão centralizada) · Ferramentas novas (Gerador de Morse, Enciclopédia
de Lógica Digital, JSON Studio, QR Code Studio, Git Helper, Rádio
sintetizado) · Editor estilo VS Code · FFT captando áudio do PC ·
Conteúdo novo (Arquivo de Memes 2016, Cinema, Robótica, aba de Música,
esteganografia, carreiras de tecnologia) · Datasets expandidos (Arsenal
= catálogo militar com 251 itens em 15 categorias, Academia com 16
linguagens + recursos, CiberSeg 55 entradas, Modpack ~78 mods, Universo
15 mundos) · README reescrito.

O site foi de 31 → 41 rotas, entregue em ~17 PRs, cada atualização na
sua branch.
