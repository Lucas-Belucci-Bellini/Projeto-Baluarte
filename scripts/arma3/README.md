# Extração local do Arma 3 (issue #398)

Ferramentas da sessão **LOCAL** (a máquina do operador, com o jogo e os mods
instalados). A divisão combinada: **o local produz os dados nas branches; a
sessão remota organiza e integra no site.** Este arquivo é o contrato entre
os dois lados.

## Por que existe um caminho in-game e um caminho de arquivo

Nenhum dos dois sozinho cobre tudo:

| | alcança | não alcança |
|---|---|---|
| **Dump in-game** (`dump-config.sqf`) | vanilla + **DLCs** + todos os mods, herança já resolvida pelo engine, valor efetivo pós-compat | nada — mas exige o operador abrir o jogo |
| **Arquivos** (`pbo.py` + Arma 3 Tools) | ícones `.paa`, modelos `.p3d`, configs em `.pbo` | os **88 `.ebo`** cifrados: Expeditionary, Reaction Forces e Western Sahara |

As DLCs cifradas são justamente as que o preset usa, então o dump in-game é
insubstituível para os números. O Arma 3 Tools é insubstituível para as imagens.

## Fluxo

São **duas** extrações in-game, independentes. A de armas já rodou; a de
catálogo (todo o resto) espera o operador.

```bash
# ── ARMAS ────────────────────────────────────────────────────────────────
# 1. no jogo: Esc -> DEBUG CONSOLE -> cola scripts/arma3/dump-config.sqf -> EXECUTE
python scripts/arma3/parse-dump.py        # .rpt  -> out/arma3-config.json
python scripts/arma3/gerar-base-armas.py  # JSON  -> src/data/arma3-armas.js
                                          #       + public/arma3/armas-db.json

# ── CATÁLOGO (veículos, soldados, miras, uniformes, coletes, mochilas…) ──
# 1. no jogo: Esc -> DEBUG CONSOLE -> cola scripts/arma3/dump-catalogo.sqf -> EXECUTE
python scripts/arma3/parse-catalogo.py    # .rpt  -> out/arma3-catalogo.json
python scripts/arma3/gerar-catalogo.py    # JSON  -> src/data/arma3-catalogo.js
                                          #       + public/arma3/catalogo-db.json

# ── ÍCONES (lê as DUAS extrações; roda depois dos parse-*) ───────────────
python scripts/arma3/extrair-imagens.py
python scripts/arma3/extrair-imagens.py --webp
```

Os `gerar-*` podem rodar sem o dump correspondente: geram um módulo válido e
vazio, com `disponivel: false`, e a tela mostra "aguardando extração" em vez de
tabela vazia sem explicação. O build nunca quebra por falta de um arquivo que
não está no git.

## O que cada script faz

- **`dump-config.sqf`** — despeja `CfgWeapons`/`CfgMagazines`/`CfgAmmo` do config
  já mesclado em memória. Sai no `.rpt`, em linhas `<<A3DUMP>>` delimitadas por
  `|` (sem JSON de propósito: o log do jogo mexe com aspas).

  ⚠️ **Não adicione comentários nem acento neste arquivo.** O debug console
  executa o texto colado sem passar pelo pré-processador, então `/* */` e `//`
  não são removidos: o parser lê o `/` como divisão e morre com
  `Invalid number in expression` já no primeiro caractere. Por isso o arquivo é
  ASCII puro e sem um único comentário — a explicação mora aqui, não lá dentro.
- **`parse-dump.py`** — lê o `.rpt` (acha o mais recente sozinho) e resolve a
  cadeia **arma → carregador → munição**.
- **`pbo.py`** — leitor de PBO em Python puro (índice, `prefix`, LZSS), leitura
  preguiçosa. CLI: `list`, `extract`, `find`, `index`.
- **`extrair-imagens.py`** — casa o caminho virtual do config com o PBO certo
  pelo `prefix` (prefixo **mais longo**: mods têm `…_weapons` e `…_weapons2`) e
  chama o `Pal2PacE.exe` do Arma 3 Tools pra virar PNG. Lê as **duas**
  extrações (armas e catálogo) — o catálogo é opcional.
- **`dump-catalogo.sqf`** — o dump de tudo que **não é arma**: `CfgVehicles`
  (veículos, soldados, mochilas, armamento estático), os itens do `CfgWeapons`
  com `ItemInfo` (miras, supressores, apontadores, bipés, uniformes, coletes,
  capacetes, NVG, binóculos, GPS, rádio) e `CfgGlasses`. Mesmas regras do outro
  `.sqf`: **ASCII puro, sem um comentário sequer** (o debug console não passa
  pelo pré-processador) e quebra em 700 caracteres.

  Ele **não usa `getNumber` direto** nos campos de dado, e isso é deliberado —
  ver a seção seguinte.
- **`parse-catalogo.py`** — lê o `.rpt` do catálogo e resolve óptica
  (FOV → zoom) e proteção por ponto do corpo.
- **`gerar-base-armas.py` / `gerar-catalogo.py`** — transformam o JSON
  intermediário nos módulos que o site importa. Colapsam variante cosmética,
  classificam origem pelo **caminho do asset** e validam as invariantes de
  honestidade antes de escrever (falham em vez de gerar tabela que mente).

### `getNumber` apaga a diferença entre ausente e zero

`getNumber` do SQF devolve **0** para propriedade que **não existe**. Um veículo
sem `armor` declarado e um com `armor = 0` saem idênticos do jogo — e o JSON
passaria a afirmar "blindagem zero" sobre coisa que o config não diz.

Por isso o `dump-catalogo.sqf` usa o helper `_fnc_n`, que testa `isNumber` antes
e emite string **vazia** quando a propriedade não existe; o parser converte
vazio em `None`. É a regra `hit: null ≠ hit: 0` da #398 aplicada num lugar onde
ela é fácil de perder sem perceber.

### Foguete e míssil não são projétil balístico

No config, munição de lançador tem `airFriction` **positivo** e `v0` de ejeção
(~30 m/s) — o míssil acelera depois de sair do tubo, até o `typicalSpeed`.
Jogar esse par num integrador de arrasto (que assume `airFriction < 0`) daria
uma bala **ganhando** velocidade. O gerador marca `balistico: false` nesses
casos e a calculadora do site os recusa em vez de desenhar ficção.

Consequência prática: `hit: 0` também é legítimo — o cartucho iluminativo do
Carl Gustav realmente não causa dano. Quem distingue ausente de zero é o
parser, não uma regra de "zero é suspeito".

## Contrato dos dados (o que a sessão remota consome)

**`scripts/arma3/out/arma3-config.json`** — uma entrada por arma:

```json
{"armas": {"ex_fuzil_01": {
   "nome": "Fuzil Exemplo", "tipo": 1, "fonte": "EXMOD",
   "capacidade": 30, "rpm": 700, "v0": 750, "dano": 9.5,
   "airFriction": -0.001, "caliber": 1.2, "maxZeroing": 800,
   "municao": "ex_ammo", "picture": "/ui/ex_ca.paa",
   "modos": [{"nome": "FullAuto", "rpm": 700, "dispersao": 0.0015, "auto": true}],
   "tipoSugerido": "fuzil"}}}
```

**`public/arma3/armas/<classe>.png`** — versionado. Ícone 256×256 da arma, com o
nome da classe, pronto pra `<img src="/arma3/armas/<classe>.png">`.

**`scripts/arma3/out/armas-imagens.json`** — o mapa `{classe: caminho público}`.

### Sobre o `out/` estar versionado

O plano original era deixar o `out/` **fora do git** (é intermediário, grande e
regenerável). Na prática ele **está commitado** — 18,7 MB de `arma3-config.json`
mais os dois mapas — e isso é intencional: só o operador consegue rodar o dump,
porque exige o jogo instalado com o preset. Se o intermediário não estivesse no
repo, uma sessão **remota** não teria como regerar `src/data/arma3-armas.js`
depois de qualquer ajuste no gerador — dependeria de um round-trip com a máquina
do operador a cada mudança.

O custo é real (pesa em todo clone e em todo build) e vale reavaliar quando a
extração estabilizar. Enquanto o formato ainda muda, ter o dado no repo é o que
mantém as duas pontas trabalhando sozinhas.

### Regras de honestidade (as mesmas da #398)

- Todo número vem do config do jogo em execução. Nada é estimado.
- Dado ausente vira `null`, **nunca** zero — `hit: null` significa "não sabemos",
  e `hit: 0` significaria "não causa dano". Confundir os dois é mentir na tabela.
- `tipoSugerido` (fuzil/DMR/sniper/SMG/LMG) é o **único** campo inferido, porque
  essa separação é editorial e não existe no config. Está marcado como tal.
- `v0` já é o efetivo: o multiplicador `initSpeed` da arma aplicado sobre o
  `initSpeed` do carregador.

## Estado atual — dump rodado, dados prontos

O operador rodou o dump com o preset completo carregado. Resultado:

| | |
|---|---|
| armas | **10.822** (o total do jogo bate com o lido) |
| carregadores · munições | 1.432 · 472 |
| com balística completa (`v0` + `airFriction` + dano) | **99%** |
| ícones | **10.226** de 10.457 (97,8%) em 2.417 WebP, 39 MB |

Amostra conferida contra o jogo: MX `v0=752,5 dano=10 airFriction=-0,000774`;
M200 Intervention `v0=867 cap=7`; P99 `v0=390`; Stoner 99 `cap=200`.

### O que NÃO dá pra extrair (limite conhecido, não bug)

- **125 imagens de Expeditionary Forces** — DLC em `.ebo` cifrado, que nem o
  Arma 3 Tools abre. Os *números* dessas armas estão no JSON (vieram do dump
  in-game); só o ícone falta.
- **365 armas sem `picture` no config** — não existe ícone pra extrair.

### Armadilhas que custaram caro (não repita)

- O `diag_log` **trunca a linha em 1012 caracteres**. Foi por isso que a v1 do
  formato perdeu 11% das armas *em silêncio*. Ao acrescentar campo, quebre em
  mais linhas em vez de alongar a existente.
- O `.rpt` é o log da **sessão inteira**: guarda todos os dumps que rodaram. O
  parser zera o estado a cada `INICIO` — só o último vale.
- Muito config escreve o `picture` **sem extensão** (`.../ui/gear_x_ca`), e o
  arquivo dentro do PBO é `.paa`. Foi o que segurou ~800 ícones.
- Um prefixo de PBO pode ter **vários** PBOs (modelo num, textura noutro).
- Manter muitos PBOs abertos estoura a memória da máquina (`WinError 1455`);
  o cache é limitado a 6 de propósito.

O caminho LZSS do `pbo.py` ainda não apareceu em PBO real — segue sem validação
em dado de produção.
