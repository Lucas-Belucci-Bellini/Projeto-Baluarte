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

Depois, no repositório:

```bash
python scripts/arma3/extrair-tudo.py            # todas as etapas
python scripts/arma3/extrair-tudo.py grupos     # só uma
```

Ou pelo app: aba **📡 Extrair** em `/arma3-tutorial` (só no Baluarte Launcher).

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
