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

```bash
# 1. no jogo: Esc -> DEBUG CONSOLE -> cola scripts/arma3/dump-config.sqf -> EXECUTE
# 2. lê o .rpt e monta o JSON das armas
python scripts/arma3/parse-dump.py
# 3. extrai os ícones das armas que o dump listou e converte pra PNG
python scripts/arma3/extrair-imagens.py
```

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
  chama o `Pal2PacE.exe` do Arma 3 Tools pra virar PNG.

## Contrato dos dados (o que a sessão remota consome)

**`scripts/arma3/out/arma3-config.json`** — fora do git (é intermediário, grande
e regenerável). Uma entrada por arma:

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
