# Os dumps do Arma 3 — o que cada um traz e o formato que emite

Esta documentação mora AQUI, e não dentro dos `.sqf`, por um motivo prático que
custou duas rodadas para descobrir.

## ⚠️ Os `.sqf` não podem ter comentário. Nenhum.

Eles são **colados no debug console** do jogo. Nesse caminho as quebras de linha
não sobrevivem, e um `//` passa a comentar **todo o resto do script** — o jogo
responde `Error Invalid number in expression` apontando para um lugar que não
tem nada de errado.

Foi exatamente o que aconteceu: os seis dumps novos saíram com 23 a 31
comentários cada e nenhum rodou; os seis antigos têm **zero** e todos rodam.

```
dump-config, dump-mapas, dump-itens,           0 comentários   ✅
dump-veiculos, dump-acessorios, dump-animacoes
dump-grupos, dump-funcoes, dump-manual,       23–31            ❌
dump-simbologia, dump-terreno-fisico, dump-proveniencia
```

Também não podem ter **acento nem caractere de caixa** — o campo de entrada do
jogo não é UTF-8. Foi o primeiro defeito da mesma leva.

As duas regras são cobradas por `npm run testar-parsers-arma3`, que roda no CI.

## Como usar

No jogo: `Esc` → **Debug Console** → cola o arquivo inteiro → `LOCAL EXEC`.
Com **todos os DLCs e mods carregados** — o dump lê o config da sessão em
execução, então o que não estiver carregado não existe para ele.

Depois, no repositório, **um comando só**:

```bash
npm run atualizar-arma3              # lê o que é novo, extrai, regera
npm run atualizar-arma3 -- --ver     # só diz o que faria, sem mexer em nada
```

Ele varre a pasta de `.rpt` **uma vez** procurando as 13 marcas, roda só os
parsers cujo dump é novo, extrai só as imagens que faltam, regera só as bases
cuja entrada mudou, e no fim lista os `.sqf` que você ainda não colou no jogo.

Rodar de novo sem dump novo não faz nada além de dizer que está tudo em dia.

Ainda dá para chamar uma etapa isolada, quando quiser:

```bash
python scripts/arma3/extrair-tudo.py grupos
```

Ou pelo app: aba **📡 Extrair** em `/arma3-tutorial` (só no Baluarte Launcher).

⚠️ **Nenhum script alcança o jogo.** O `.rpt` só tem dado depois que você colou
o `.sqf` no console. O atualizador diz qual falta; colar é sempre manual.

## 🧊 Modelo 3D — MEDIDO, e a decisão está tomada (03/08/2026)

**Não reabra isto sem um fato novo.** A medição já foi feita sobre o acervo
real, e o resultado fecha o assunto por ora:

```
1302 modelos extraídos
  MLOD (converte)      0
  ODOL (binarizado) 1302     v71 ×85 · v73 ×586 · v75 ×631
```

**Zero MLOD.** O importador do Arma Toolbox lê MLOD; o Blender não resolve este
acervo. Três versões de engine no mesmo conjunto são a demonstração de por que
não existe leitor confiável de ODOL.

**Trocar o visualizador não ajuda.** Nenhum visor — three.js, Babylon,
Online3DViewer — lê ODOL. O gargalo é a conversão, e ela fica antes do visor. O
`visor-3d.js` que já existe abre `.glb/.gltf/.stl/.obj/.fbx` e não é o problema.

### De quem são os modelos

| origem | modelos | |
|---|---|---|
| Bohemia (`a3/*`) | 80 | 6,1% |
| mods (74 distintos) | 1.222 | 93,9% |

Os maiores: CUP 463 (em boa parte conteúdo do Arma 1/2 re-portado, ou seja arte
da Bohemia por baixo), RHS 229 (licença restritiva, veda derivados), depois 71
mods menores com licença individual.

⚠️ **"Não é da Bohemia" ≠ "pode".** Muito mod do ecossistema Arma usa APL-ND,
que proíbe obra derivada — e converter formato é obra derivada.

### Se um dia valer retomar

1. **Arma 3 Samples** — a Bohemia publica de graça modelos de exemplo **em
   MLOD**, licenciados para uso. Sem desbinarizador e sem zona cinzenta; o
   pipeline daqui roda neles sem mudar uma linha. **É o caminho recomendado.**
2. Pedir o MLOD original ao autor dos poucos mods que importam.
3. `Wesley-TB/P3DDebinarizer` (MIT, ativo) faz ODOL → MLOD, mas: Windows x64 +
   .NET 8, depende da `BisDll.dll` proprietária da Bohemia, e **não declara
   quais versões ODOL suporta** — o v75, que é a maior fatia aqui, é o mais
   provável de falhar. Testar UM arquivo antes de qualquer investimento.

Os 3 GB de `.p3d` extraídos continuam em `scripts/arma3/out/modelos/` e não
servem para nada até que isso mude.

---

⚠️ **Modelo 3D é outro caminho.** Comece sempre pelo diagnóstico:

```bash
python scripts/arma3/extrair-modelos.py       # tira os .p3d dos PBOs
npm run diagnostico-modelos                   # 2 segundos, decide o resto
```

Um `.p3d` diz o que é nos primeiros quatro bytes:

| assinatura | o que é | Blender importa? |
|---|---|---|
| `MLOD` / `P3DM` | editável, o que o Object Builder salva | **sim** |
| `ODOL` | binarizado pela Bohemia antes de empacotar | **não** |

O que o jogo distribui é quase tudo ODOL — binarizar é justamente o passo de
publicação. O importador do Arma Toolbox lê MLOD. Se o acervo extraído for todo
ODOL, **montar o Blender não resolve nada**, e o diagnóstico diz isso em dois
segundos em vez de depois de uma tarde perdida.

Havendo MLOD, a sonda testa o caminho na máquina antes do lote:

```bash
python scripts/arma3/converter-modelos.py --sonda    # 1 modelo, com relatório
python scripts/arma3/converter-modelos.py            # lote, retomável
```

A sonda roda o Blender **sem janela** e relata o que achou: se o addon está
instalado, se está ligado, que operador de importação existe, e se a importação
sem interface funciona. Muitos operadores de importação dependem de contexto de
janela e falham em `--background` — a sonda responde isso para a sua máquina em
vez de alguém adivinhar.

O `blender_p3d_glb.py` **procura** o operador em vez de chamar pelo nome: o
Arma Toolbox não é nosso, muda de versão e já mudou de nome de operador. Fixar
o nome e errar daria `AttributeError`, que não distingue "addon faltando" de
"addon desligado" de "nome mudou".

---

## `dump-grupos.sqf` → ordem de batalha

`CfgGroups`. A composição real de cada grupo do jogo — pelotão, esquadrão,
patrulha, seção de morteiro — por lado, facção e categoria, com a lista
**ordenada** de unidades e o posto de cada uma.

É o dado que falta para responder "o que é um esquadrão de fuzileiros" com a
estrutura DO JOGO. `CfgVehicles` diz que existe um "Rifleman"; só `CfgGroups`
diz que o esquadrão tem 1 líder, 2 fuzileiros e 1 auxiliar de metralhador —
nessa ordem, e que a primeira unidade é quem comanda.

```
F |lado|faccao|nome
C |lado|faccao|categoria|nome
G |id|lado|faccao|categoria|classe|nome
GU|id|<unidades, em pedaços de 700>
PLACAR|lados|grupos|unidades
```

**Não existe no config:** efetivo "de doutrina". Um grupo é o que o config
declara, que nem sempre bate com a organização real da força que ele representa.

## `dump-funcoes.sqf` → biblioteca SQF

`CfgFunctions`. As ~3000 funções registradas — as do jogo base (`BIS_fnc_*`)
mais as de cada mod carregado, com tag, categoria, arquivo e as marcas de
execução.

```
T |tag|prefixo|dirBase
F |tag|categoria|nome|arquivo|ext|preInit|postInit|recompile
PLACAR|tags|funcoes
```

**Não existe no config:** a DESCRIÇÃO de cada função — ela mora no cabeçalho do
`.sqf` dela, dentro do PBO. Catálogo sem descrição é honesto; catálogo com
descrição adivinhada pelo nome seria pior que nenhum, porque pareceria certo.
Para trazê-la é preciso passar pelo extrator de PBO (`scripts/arma3/pbo.py`).

## `dump-manual.sqf` → Manual de Campo

`CfgHints`. O Field Manual inteiro: categorias, tópicos, texto e imagem.
Conteúdo didático da Bohemia sobre como o jogo funciona — comandos de esquadrão,
balística, navegação, sinalização, primeiros socorros.

```
C |categoria|nome
H |id|categoria|classe|titulo|imagem
HT|id|<texto em pedaços>
HA|id|<argumentos em pedaços>
PLACAR|categorias|topicos
```

⚠️ **Licença:** o texto é © Bohemia Interactive. A base guarda para CONSULTA e a
tela que exibir precisa creditar — igual ao que o Centro Militar faz com a
Wikipédia. O campo `licenca` viaja junto com o conteúdo para não se perder no
caminho.

## `dump-simbologia.sqf` → marcadores, cores, patentes, insígnias

`CfgMarkers`, `CfgMarkerColors`, `CfgRanks`, `CfgUnitInsignia`. Quatro coisas
que andam juntas na tela: os símbolos de carta (que seguem a APP-6 da OTAN), a
paleta oficial de lado com o RGBA exato, a hierarquia do soldado ao coronel, e
os brasões de unidade.

```
M |classe|nome|icone|cor|tamanho|escopo|sombra
MC|classe|nome|r|g|b|a
R |classe|nome|textura
I |classe|nome|textura|autor
PLACAR|marcadores|cores|patentes|insignias
```

**Atenção ao zero:** `size` e `scope` valem ZERO legitimamente (escopo 0 =
escondido do editor). Ausente vira `null`, nunca 0 — tratar os dois igual
inverteria o sentido.

## `dump-terreno-fisico.sqf` → superfícies, vegetação, clima

`CfgSurfaces`, `CfgSurfaceCharacters`, `CfgWeather`. Como cada superfície se
COMPORTA: quanto freia o deslocamento, quanto barulho faz o passo, que poeira
levanta, que impacto de projétil produz — mais a vegetação que nasce nela.

É o dado que liga o terreno à balística e ao movimento. A base de terrenos que
já existe descreve a GRADE do mapa; nenhuma descreve o CHÃO.

```
S  |classe|arquivos|aspero|coefVelocidade|somAmbiente|somBater|poeira|impacto|personagem
SC |classe|probabilidade|densidade
SCO|classe|<objetos em pedaços>
W  |classe|nome
WP |classe|<parametros em pedaços>
PLACAR|superficies|personagens|clima
```

**`coefVelocidade` ausente ≠ 1.** Ausente significa que o config não declara e o
jogo usa o padrão da classe pai. Quem calcular tempo de deslocamento precisa
saber a diferença.

## `dump-proveniencia.sqf` → quem é dono de cada coisa

`CfgPatches` e `CfgMods`. Por addon, exatamente quais unidades e armas ele
registra; e que DLC/mod é aquele, com nome, cor e appId da Steam.

```
P |addon|autor|nome|requiredVersion
PR|addon|<requiredAddons em pedaços>
PU|addon|<unidades em pedaços>
PW|addon|<armas em pedaços>
M |mod|nome|dir|autor|appId|cor|logo
PLACAR|addons|mods
```

**Por que importa mais do que parece:** `gerar_base_armas_comum.py` tem hoje um
`DIR_DLC` escrito **à mão** (diretório → DLC), porque o campo `fonte` do dump é
`configSourceMod` — quem patcheou por ÚLTIMO. Com ACE carregado, quase todo o
vanilla apareceria como do ACE.

Dicionário à mão envelhece calado: DLC novo sai, o diretório não está na lista,
e as armas passam a mostrar origem errada sem ninguém perceber. O índice
`donoDe` mapeia classe → addon que a **registra**, que é a pergunta certa, e
permite derivar a origem em vez de mantê-la.

## `dump-icones.sqf` → inventário de imagens do config inteiro

Os seis dumps acima e os seis antigos varrem **árvores nomeadas** (`CfgWeapons`,
`CfgVehicles`, `CfgGlasses`) com **lista de campo fixa**. Imagem declarada em
qualquer outra classe é invisível para eles — e é assim que o pipeline chegou a
2.417 ícones enquanto o config declara 26.956.

Este varre o `configFile` **inteiro**, classe por classe, e recolhe toda
propriedade de texto cujo valor aponta para `.paa`/`.pac`.

```
I |id|caminho              imagem distinta, numerada na ordem de aparição
R |classe|propriedade|id   a classe DECLARA este retrato
ANDAMENTO|classes|imagens|segundos
PLACAR|classes|imagens|retratos
```

O `id` existe para a linha `R` não repetir o caminho: o mesmo `.paa` é declarado
por milhares de classes, e repetir o texto multiplicaria o `.rpt` por uma ordem
de grandeza sem acrescentar nada.

⚠️ **Um `.sqf` não extrai imagem.** Ele roda dentro do motor e a única saída é
texto no `.rpt` — não existe API para despejar os bytes de um `.paa`. Este dump
diz **quais imagens existem**; os pixels continuam saindo do PBO com
`extrair-imagens.py` + `Pal2PacE`, na máquina do operador.

⚠️ **Nem toda imagem do config é ícone.** A varredura recolhe *qualquer*
textura declarada como texto — fundo de interface, textura de material, arte de
carregamento. Por isso só as linhas `R`, cujas propriedades **significam** "esta
é a cara desta coisa" (`picture`, `icon`, `texture`, `editorPreview`, `logo`…),
alimentam a extração. O inventário `I` completo serve para diagnóstico: é como
se descobre que uma imagem existe e ninguém a estava pegando.

⚠️ **Isto não diz qual imagem cada classe EFETIVAMENTE usa.** O dump lê só o que
a classe **declara** (`configProperties` sem herança), e no Arma 3 a maioria dos
itens herda o `picture` do pai. Quem resolve herança é `getText (_c >> "picture")`,
que os dumps específicos já fazem. A pergunta aqui é outra — "que imagens
existem" — e é a que a extração precisa responder.

**É o dump mais caro.** Ele visita todas as classes do config, o que num jogo
bem modificado passa de 200 mil. Espere alguns minutos e um `.rpt` grande; a
linha `ANDAMENTO` sai a cada 20 mil classes para dar sinal de vida.

---

## Detalhes do formato, para quem for escrever outro dump

- **marca própria por dump** (`<<A3GRUPO>>`, `<<A3SIMB>>`…), para o parser achar
  as linhas dele no `.rpt` sem tropeçar nas dos outros;
- **campo longo vai picado** em pedaços de 700 caracteres. O `diag_log` corta em
  1012 e o corte é **silencioso** — na v1 do dump de armas isso comeu 11% dos
  dados sem ninguém perceber;
- **tudo passa pelo `_fnc_lim`**, que tira a barra vertical (o separador de
  campo), troca aspas duplas por simples e achata quebras de linha;
- **`isNumber` antes de `getNumber`**: `getNumber` devolve 0 para chave que não
  existe, e 0 é um valor legítimo. Sem o teste, "não declarado" viraria "vale
  zero" — que é mentir na tabela;
- **PLACAR no fim**, com as contagens que o jogo mediu. Cada parser compara com
  o que chegou; divergência vira aviso em vez de dado sumindo em silêncio.
