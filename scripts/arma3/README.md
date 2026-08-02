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

#### ⚠️ Os 20 quadros que estão no repo NÃO servem — não ligue na UI

`public/arma3/3d/arifle_MX_F/` tem 20 `.webp` e `out/turntable.json` os declara,
mas **nenhum deles mostra a arma de forma utilizável**. Medido quadro a quadro
(média RGB de cada um):

- **`00`–`09`**: verde forte, +60 de G sobre R/B — visão noturna. A arma é um
  borrão branco de poucos pixels.
- **`10`–`19`**: sem verde, mas estourados de luz e com **estrutura do cenário**
  no lugar do objeto (`12` é viga de teto; `16` pega a arma torta, fora do
  centro, contra parede e chão).

A causa provável — inferência, não medição, porque só se confirma com o jogo
aberto:

1. `setDate` para meio-dia é instantâneo, mas a **adaptação de luz do engine
   não é**; os primeiros quadros saem com a exposição da noite ainda.
2. `_centro` é `player + 30 m` para cima, e 30 m **não garante céu atrás** — se
   o operador estiver dentro de um galpão, o fundo é o telhado.
3. `camSetTarget` mira a origem do `.p3d`, que não é o centro visual da arma; o
   `coletar-turntable.py` recorta os 55% centrais, então o que ficou fora do
   centro é cortado.

Ligar isso na wiki mostraria um borrão verde com a legenda "MX 6.5 mm" — que é
exatamente o que a regra de dado ausente proíbe. **Enquanto não houver uma
rodada boa, o 3D fica sem UI.** O `coletar-turntable.py` em si está certo: os
244,8 MB → 0,40 MB são reais, e ele só pega `a3tt_*.png`, não screenshot solto.

#### O que mudou no `.sqf` pra próxima rodada (⚠️ não testado)

Três ajustes, um por causa provável acima. **Nenhum foi validado no jogo** —
quem roda é a sessão local; se não resolver, o diagnóstico é que está errado,
não o script. Como o arquivo não pode ter comentário (ver a regra do debug
console adiante), a explicação é esta:

| Variável | Era | É | Por quê |
|---|---|---|---|
| `_esperaLuz` | (não existia) | `4` | `sleep` depois do `setDate` pra exposição do engine alcançar o meio-dia antes da 1ª foto |
| `_alto` | `30` fixo | `100` | passar de qualquer construção, pra não fotografar telhado |
| `_altura` | `0.30` | `-0.25` | câmera **abaixo** do objeto olhando pra cima: o fundo vira céu em vez de chão |

E a câmera passou a orbitar e mirar `_foco` — o centro do `boundingBoxReal`
convertido com `modelToWorld` — em vez do objeto. A origem do `.p3d` costuma
cair na coronha ou no cano, não no meio da arma; mirando a origem, o objeto
saía torto e o recorte central do coletor cortava fora. Sai no `.rpt` como
linha `<<A3TT>>FOCO|<classe>|<centro no modelo>|<centro no mundo>`, pra dar
pra conferir sem abrir imagem.

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

  ⚠️ **O config cobre pouco.** No dump real, só **719 das 10.822 armas** (6,6%)
  declaram `compatibleItems`; o resto deixa o slot vazio e delega ao CBA. Por
  isso o v2 pergunta ao ENGINE também, pelo comando `compatibleItems`, e grava
  em `compativeisEngine`. A lista do engine cobre muito mais, mas é achatada:
  não diz em qual slot cada item entra. Os dois campos são complementares —
  o do config quando existir, o do engine como rede.
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

### `getNumber` apaga a diferença entre ausente e zero

`getNumber` do SQF devolve **0** para propriedade que **não existe**. Com ele,
um veículo sem `armor` declarado e um com `armor = 0` saem idênticos do jogo, e
o JSON passaria a afirmar "blindagem zero" sobre coisa que o config não diz.

Quem for escrever dump novo: teste `isNumber` antes e emita string **vazia**
quando a propriedade não existir; no parser, vazio vira `None`. É a regra
`hit: null ≠ hit: 0` da #398 aplicada num lugar onde é fácil de perder.

### Foguete e míssil não são projétil balístico

No config, munição de lançador tem `airFriction` **positivo** e `v0` de ejeção
(~30 m/s) — o míssil acelera depois de sair do tubo, até o `typicalSpeed`.
Jogar esse par num integrador de arrasto (que assume `airFriction < 0`) daria
uma bala **ganhando** velocidade. O gerador marca `balistico: false` nesses
casos e a calculadora do site os recusa em vez de desenhar ficção.

Consequência prática: `hit: 0` também é legítimo — o cartucho iluminativo do
Carl Gustav realmente não causa dano.

### `type: 1` é autoritativo — descrição não pode vencer o config

Fuzil com lança-granadas acoplado (`arifle_MX_GL_F`) tem `type: 1` (arma
primária) e descrição "Assault Rifle · … · Grenade Launcher". Deixar o texto
classificar transformava 68 fuzis em "lançador" — e, pior, marcava
`balistico: false`, então a calculadora recusava arma com balística de fuzil
perfeitamente boa. O UGL é boca **secundária**, não o tipo da arma.
O `gerar-base-armas.py` recusa gerar se isso reaparecer.

### Sobre o `out/` estar versionado

O plano original era deixar o `out/` fora do git. Na prática ele **está
commitado**, e é intencional: só o operador roda o dump (exige o jogo com o
preset), então sem o intermediário no repo uma sessão **remota** não regera
`src/data/arma3-armas.js` depois de um ajuste no gerador — dependeria de um
round-trip com a máquina do operador a cada mudança.

### A ampliação da mira NÃO sai de `0.75 / FOV`

Parece que sai, e não sai. Conferindo o ELCAN SpecterOS:

| fonte | valor |
|---|---|
| `oticas[].zoomMin` do config | 0,0625 |
| conta `0,75 / 0,0625` | **12×** |
| `descriptionShort` do próprio jogo | **2x** |

Fator 6 de diferença. Seja porque o 0,75 não é a referência certa, seja porque
a óptica 2D do ACE renderiza por outro caminho, a conta não se sustenta — e
publicar "zoom real lido do config" com ela seria inventar número com cara de
medição.

**Use o texto.** Dos 1.167 itens com óptica (`itemInfoType == 201`):

| | |
|---|---|
| citam "magnification" na descrição | 292 |
| **com `Magnification: Nx` extraível** | **241** |
| sem ampliação declarada | **926** |

Para os 926, exiba o FOV cru rotulado como FOV e diga que a ampliação não é
declarada — **não converta**.

> Correção: uma versão anterior desta seção dizia "435 de 1.167, sobrando 732".
> Estava errado — contei ocorrências de `Nx` soltas em qualquer lugar do texto
> (402), que pegam coisas como "3x magnifier" e nomes de produto, não o rótulo
> `Magnification:`. O número que vale é o que dá pra extrair sem adivinhar: 241.

### O `.rpt` é cp1252 e engole UTF-8: 191 descrições vêm com mojibake

`6xâ€“25x` é `6x–25x` com o en-dash lido como cp1252. O parser abre o `.rpt`
nessa codificação (correto — é o que o jogo escreve), mas parte do texto do
config já está em UTF-8, então volta embaralhado.

Conserto no consumidor, não no parser (o `.rpt` não mente; a codificação é
mista mesmo):

```python
def reparar(s):
    try:
        return s.encode('cp1252', errors='strict').decode('utf-8', errors='strict')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s            # já estava certo
```

O `strict` nos dois lados é o que segura: sem ele, texto correto seria
"consertado" para lixo.

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

### ⚠️ Granadas e explosivos NÃO estão no dump — precisa rodar de novo

O `dump-config.sqf` filtra as armas por `type in [1, 2, 4]` (primária, pistola,
lançador) e só coleta os carregadores QUE ESSAS ARMAS USAM. Só que granada de
mão, fumígena, sinalizador, mina e carga explosiva pertencem às pseudo-armas
**`Throw`** e **`Put`**, que não são desses tipos — e por isso ficaram de fora.

Medido: `HandGrenade`, `MiniGrenade`, `SmokeShell`, `Chemlight_green`,
`DemoCharge_Remote_Mag` e `ATMine_Range_Mag` **não estão** nos 1.432
carregadores capturados. Dos 1.432, 1.323 são bala; o que sobra é munição de
lançador e de morteiro, não coisa de arremesso.

Por isso **não existe aba de granadas** na wiki: montar uma com este dump
mostraria o M72 e o RPG-26 como "granada", que é falso. O `dump-config.sqf`
já foi corrigido (varre `Throw` e `Put` antes do resto e loga
`<<A3DUMP>>ARREMESSO|`), mas **o dump precisa rodar de novo no jogo** pra
trazer o dado.

Como conferir se a rodada nova pegou: procure a linha `<<A3DUMP>>ARREMESSO|`
no `.rpt` — ela diz quantos carregadores cada pseudo-arma trouxe. Zero ali
significa que o preset não tem nada de arremesso, o que seria estranho.

### Facções faltando — 40.430 soldados sem lado

Os soldados sem `lado` **não** são de facção `sideUnknown`, como parecia: são
de **21 facções que não estão no `CfgFactionClasses` capturado**. A maior é
`sof_rangers`, com 24.555 soldados — e são *Rangers* (classes `TFL_mw_pcu_*`),
não civis. `zulu_flannels` tem 5.632.

**Não preencha com "Civil".** O conserto é capturar essas facções num dump
novo; enquanto isso o campo fica ausente, que é a verdade.

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

### Mapas — dump rodado E consumido

`out/arma3-mapas.json` tem os **102 mundos** — 71 são alias (casca apontando
pro `.wrp` de outro), sobrando **31 terrenos reais** (8 oficiais + 23 de mod).
`gerar-base-terrenos.py` os transforma em `src/data/arma3-terrenos.js`, com a
**grade literal do config** (offset + passo por eixo, com sinal): 30 mundos
contam o northing de cima pra baixo, 1 (ChernobylZone) conta pra cima.
`src/utils/arma3-grade.js` converte grade↔metros respeitando o sinal, e
`scripts/verificar-grade.mjs` cobra ida-e-volta, anti-simetria de azimute e
vizinhança em TODOS os mundos. O card "Azimute de grade" em `#/vanguard`
consome isso — é o cálculo de ângulo nos mapas do jogo.

### Miras e acessórios — consumidos do dump de itens

`gerar-base-acessorios.py` filtra os 3.218 com `itemInfoType` de acessório
(101/201/301/302) e publica 211 do jogo/DLC no bundle + os 3.218 no JSON.
A ampliação vem SÓ do texto ("Magnification: Nx", 241 de 1.167 miras); o
resto mostra o FOV cru. Armadilha nova paga aqui: mod que reusa modelo E
ícone vanilla (`ACE_DBAL_A3_Red`) — o desempate final é o PREFIXO da classe
(a Bohemia só usa `optic_/muzzle_/bipod_/acc_/chemicaldetector_`).

### Imagens — a colisão de nome, e como ela foi resolvida

Esta seção descrevia por que o extrator só cobria armas: ele nomeia o arquivo
de saída pelo *basename* do caminho virtual, e para armas isso é uma vantagem
(variantes de camo compartilham o mesmo `.paa`, e converter uma vez serve
todas). Fora das armas o basename **colide** — quase todo terreno chama sua
miniatura de `pictureMap_ca.paa`.

O diagnóstico estava certo e a conta é maior do que parecia: sobre os 26.956
caminhos que o config declara, **186 basenames colidem e 310 imagens
receberiam a foto de outra**. `icon.paa` sozinho é usado por 12 mods — o F-14
ficaria com o ícone do F-15. **12 dessas colisões estão nas armas que já foram
publicadas.**

Resolvido em `imagens_catalogo.py`:

- **dedupe pelo caminho virtual inteiro**, normalizado (o config escreve o
  mesmo `.paa` com `/` ou `\`, com e sem barra inicial, em qualquer caixa);
- **nome = basename**, e quando um basename é reivindicado por mais de um
  caminho, **todos** os membros do grupo ganham sufixo `-hash6` — inclusive o
  primeiro. Simétrico de propósito: se só os repetidos ganhassem sufixo, quem
  fica com o nome limpo dependeria da ordem de iteração, e um mod novo faria
  dois ícones trocarem de lugar sem nada no diff explicando;
- **uma pasta por categoria**, porque `nomear()` só garante unicidade dentro da
  categoria — duas gravando no mesmo lugar poderiam colidir entre si.

`npm run testar-imagens-arma3` prova a injetividade, o determinismo e a
independência de ordem — e roda a propriedade contra os 26.956 caminhos reais
quando os dumps estão na máquina. Roda no CI.

### Imagens — o que é ícone e o que é render

Nem toda imagem do config é ícone. `editorPreview` é um render grande do
editor, e são **16,5 mil** deles; `pictureMap`/`pictureShot` são a carta e a
foto do mundo. Esses ficam em `scripts/arma3/out/renders/` (peso `app`) e
**não** entram em `public/` — mega-plano #238, web leve e app completo. Só
`--tudo` os extrai.

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
