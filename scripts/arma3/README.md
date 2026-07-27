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

São **seis** dumps independentes. No jogo: `Esc` → `DEBUG CONSOLE` → cola o
`.sqf` → `EXECUTE`. Pode rodar os seis na mesma sessão: cada um tem sua
própria marca no `.rpt` e seu próprio parser.

```bash
# armas, carregadores e munições
#   no jogo: scripts/arma3/dump-config.sqf
python scripts/arma3/parse-dump.py

# terrenos: tamanho, grid, localidades, aeroportos, miniaturas
#   no jogo: scripts/arma3/dump-mapas.sqf
python scripts/arma3/parse-mapas.py

# miras, silenciadores, uniformes, coletes, capacetes, NVG, óculos, mochilas
#   no jogo: scripts/arma3/dump-itens.sqf
python scripts/arma3/parse-itens.py

# veículos, soldados e facções
#   no jogo: scripts/arma3/dump-veiculos.sqf
python scripts/arma3/parse-veiculos.py

# compatibilidade arma x acessorio, slot por slot
#   no jogo: scripts/arma3/dump-acessorios.sqf
python scripts/arma3/parse-acessorios.py

# catalogo de animacoes: estados do corpo + gestos, com grafo de transicoes
#   no jogo: scripts/arma3/dump-animacoes.sqf
python scripts/arma3/parse-animacoes.py

# ícones das armas (o extrator de imagem, por enquanto só armas)
python scripts/arma3/extrair-imagens.py
```

Ou tudo de uma vez, com placar no fim e código de saída 1 se algo falhar:

```bash
python scripts/arma3/extrair-tudo.py
```

### `turntable.sqf` — o render 3D

Roda **diferente dos outros**: em `spawn` e com o jogo **despausado**, porque
tira uma foto por quadro. Orbita a câmera em N passos e gera o sprite-sheet de
giro; o site mostra o objeto rodando ao arrastar o mouse.

Usa `createSimpleObject` direto no `.p3d` que o config declara, então o mesmo
código serve arma, carregador, munição (o projétil), veículo e item — e
**funciona nas DLCs cifradas**, porque quem carrega o modelo é o próprio jogo,
não um leitor externo de ODOL. A distância da câmera sai do `boundingBoxReal`,
então pistola e tanque se enquadram sozinhos.

A lista `_alvos` vem com 3 classes vanilla de propósito: valide barato antes de
mirar em lista grande. 10.822 armas × 24 fotos seriam 260 mil imagens — o
turntable é para subconjunto curado, não para o acervo inteiro.

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
- **`dump-mapas.sqf` / `parse-mapas.py`** — `CfgWorlds`: tamanho real
  (`mapSize`, em metros), grid completo, localidades (`Names`), aeroportos
  (principal + `SecondaryAirports`), autor, mod de origem e as miniaturas.
  Marca `<<A3MAPA>>`.
- **`dump-itens.sqf` / `parse-itens.py`** — todo `CfgWeapons` que **não** é arma,
  mais `CfgGlasses` e as mochilas de `CfgVehicles`: miras (zoom por
  `OpticsMode` + `discreteDistance`), silenciadores (`AmmoCoef`), coletes e
  capacetes (`armor`/`passThrough` por hitpoint), uniformes, NVG, binóculos.
  Marca `<<A3ITEM>>`.
- **`dump-acessorios.sqf` / `parse-acessorios.py`** — a matriz **arma ×
  acessório**: para cada arma, o `compatibleItems[]` de cada slot do
  `WeaponSlotsInfo` (`MuzzleSlot`, `CowsSlot`, `PointerSlot`,
  `UnderBarrelSlot`, ou o que o mod inventar). Listas idênticas viram um grupo
  compartilhado — variante de camo aceita o mesmo conjunto — então o JSON não
  explode. Marca `<<A3ACC>>`.
- **`dump-veiculos.sqf` / `parse-veiculos.py`** — `CfgFactionClasses`, os
  soldados (`isKindOf CAManBase`) e os veículos: velocidade, combustível,
  lotação, carga, blindagem, custo, potência, armas de casco + torres de
  primeiro nível, e `armor` por hitpoint. Marca `<<A3VEIC>>`.
- **`pbo.py`** — leitor de PBO em Python puro (índice, `prefix`, LZSS), leitura
  preguiçosa. CLI: `list`, `extract`, `find`, `index`.
- **`extrair-imagens.py`** — casa o caminho virtual do config com o PBO certo
  pelo `prefix` (prefixo **mais longo**: mods têm `…_weapons` e `…_weapons2`) e
  chama o `Pal2PacE.exe` do Arma 3 Tools pra virar PNG.

## Contrato dos dados (o que a sessão remota consome)

Tudo em `scripts/arma3/out/` é **versionado** — decisão do operador: os dados
vão pro repositório, não só as ferramentas. São ~150 MB somados, e o histórico
do git guarda isso pra sempre (pesa em todo clone e em todo build). Os parsers
regeneram tudo em minutos, se um dia valer a pena reverter.

**`scripts/arma3/out/arma3-config.json`** (18 MB) — uma entrada por arma:

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

**`scripts/arma3/out/arma3-mapas.json`** — um `mundos[classe]` por terreno:

```json
{"mundos": {"ExMapa": {
   "nome": "Mapa Exemplo", "autor": "Autor Ex", "fonte": "EXMOD",
   "tamanhoM": 8192, "areaQuadradoKm2": 67.1, "gridMenorPassoM": 100,
   "longitude": 16.482, "latitude": -35.097, "dataInicial": "6/7/2035",
   "pictureMap": "/EX/data/pictureMap_ca.paa", "wrp": "/EX/mapa.wrp",
   "aeroportos": [{"nome": "principal", "x": 1534.7, "y": 5033.1}],
   "localidades": [{"nome": "Vila Ex", "tipo": "NameVillage",
                    "x": 2915.2, "y": 6164.5, "raioA": 200, "raioB": 200}],
   "localidadesPorTipo": {"NameVillage": 1}, "totalLocalidades": 1}}}
```

**`scripts/arma3/out/arma3-itens.json`** — `itens` + `oculos` + `mochilas`:

```json
{"itens": {"ex_mira_01": {
   "nome": "Mira Exemplo", "fonte": "EXMOD", "massa": 0.3,
   "categoriaSugerida": "mira", "itemInfoType": 201,
   "oticas": [{"modo": "Scope", "zoomMin": 0.0625, "zoomMax": 0.25,
               "visao": ["Normal", "NVG"]}],
   "distancias": [100, 200, 300], "protecao": null,
   "picture": "/EX/ui/mira_ca.paa"}}}
```

**`scripts/arma3/out/arma3-veiculos.json`** — `veiculos` + `soldados` + `faccoes`:

```json
{"veiculos": {"ex_tanque": {
   "nome": "Tanque Exemplo", "categoriaEditor": "Tank",
   "classeVeiculo": "blindado", "ehVeiculo": true,
   "faccao": "IND_F", "lado": "Independente", "tripulacao": "ex_crew",
   "maxSpeed": 60, "combustivel": 1200, "lotacao": 3, "cargaMax": 500,
   "armor": 650, "armorStructural": 400, "potencia": 1200,
   "armas": ["cannon_ex"],
   "hitpoints": [{"parte": "HitEngine", "armor": 0.8, "passThrough": 0.2}]}},
 "soldados": {"B_ex_soldado": {
   "nome": "Fuzileiro Exemplo", "lado": "BLUFOR",
   "uniforme": "U_ex_uniforme", "mochila": "B_ex",
   "itensLigados": ["V_ex_colete", "ItemMap"]}}}
```

⚠️ **`ehVeiculo` existe por um motivo.** `CfgVehicles` guarda tudo que o editor
posiciona: prédio, ruína, caixa de munição, módulo e prop entram junto. Dos
24.261 registros, só **5.425** são veículo de verdade. Publicar "24 mil
veículos" seria enganoso — filtre por `ehVeiculo`.

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

### Itens e veículos — dump rodado, dados prontos

| | |
|---|---|
| itens de inventário | **67.368** (uniformes 40.720 · capacetes 12.829 · coletes 9.875 · miras 1.167 · lasers 1.049 · silenciadores 572) |
| óculos · mochilas | 6.560 · 1.086 |
| registros de `CfgVehicles` | **24.261**, dos quais **5.425 são veículo** (terrestres 2.836 · aéreos 1.167 · blindados 688 · estáticos 596 · navais 138) |
| soldados · facções | **44.761** · 248 |
| com imagem no config | itens 48.543/67.368 · veículos 23.604/24.261 |

A contagem do jogo bateu **exata** com a lida nos três dumps — nenhuma linha
truncada, nenhum registro perdido.

### Mapas — dump ainda não rodado

Os scripts estão prontos e o bug que derrubava o dump na primeira tentativa
está corrigido (veja as armadilhas abaixo). Falta o operador rodar
`dump-mapas.sqf` e o `parse-mapas.py`.

### Imagens — só as armas, por enquanto

`extrair-imagens.py` cobre apenas os ícones de arma. Estender para mapas,
veículos e itens exige **uma mudança de projeto, não só um parâmetro novo**: o
extrator nomeia o arquivo de saída pelo *basename* do caminho virtual, e para
armas isso é uma vantagem (variantes de camo compartilham o mesmo `.paa`, e
converter uma vez serve todas). Nos mapas isso **colide**: quase todo terreno
chama sua miniatura de `pictureMap_ca.paa`, então mundos diferentes
sobrescreveriam o mesmo arquivo e a wiki mostraria o mapa errado. A saída
precisa ser chaveada por classe (`altis-mapa.webp`), com dedupe pelo caminho
virtual completo — não pelo nome do arquivo.

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
- **`toFixed` só aceita número, e o config mente sobre isso.** A v1 do
  `dump-mapas.sqf` morreu com `Error tofixed: Type String, expected Number`:
  algum terreno do preset declara coordenada como *string* dentro do array
  (`position[]={"2500","5650"}`). Ao ler `getArray`, nunca assuma o tipo dos
  elementos.
- **`getNumber` devolve `0` para "vale zero" E para "campo ausente".** Use
  `isNumber` pra separar os dois, senão a regra de honestidade cai por terra
  sozinha: um veículo sem `armor` declarado sairia com `armor: 0`, dizendo "não
  tem blindagem" quando o certo é "não sabemos".
- **Não hardcode os códigos de `ItemInfo >> type` de memória.** Os das peças de
  roupa dá pra confirmar no config dos addons (801 uniforme, 701 colete, 605
  capacete, 616 NVG), mas os de acessório moram no config raiz da *engine*
  (`Dta/bin.pbo`), fora dos addons. Eu ia chamar `302` de "bipé"; nos 67 mil
  itens reais ele mistura bipé, grip, pointer e item avulso. O dump emite o
  número cru **e** a cadeia de herança justamente pra o parser decidir com
  evidência: foi assim que saíram 201=mira, 101=silenciador, 301=laser.
- **`type` 616 é compartilhado** por NVG e binóculo/telêmetro — só a herança
  separa os dois.
- **`configSourceMod` é a fonte, `vehicleClass` é a categoria do editor.**
  Nenhum dos dois diz se algo é veículo: para isso, a herança
  (`Tank`/`Car`/`Air`/`Ship`/`StaticWeapon` vs `Building`/`ReammoBox`/`Logic`).

O caminho LZSS do `pbo.py` ainda não apareceu em PBO real — segue sem validação
em dado de produção.
