"""Ligar classe a ícone, do jeito honesto — compartilhado pelos geradores.

O `gerar-base-armas.py` já resolvia isso desde a extração das armas. Quando os
ícones de item, veículo e símbolo de carta chegaram (9.588 no total), a escolha
era copiar aquela lógica em mais três geradores ou extraí-la. Copiar seria
criar quatro versões da mesma regra, e a divergência entre elas não faria
barulho: o dado sairia plausível e errado, que é o defeito que este
repositório mais paga caro.

## A regra: ausência tem MOTIVO

Todo registro sai com `img` **ou** `imgAusente`, nunca os dois, nunca nenhum.
E `imgAusente` não é um booleano — é a razão:

    sem-picture-no-config   o config não declara imagem para esta classe.
                            Não há o que extrair; a wiki mostra o lugar vazio
                            sem prometer que um dia enche.
    paa-nao-extraido        o config declara um CAMINHO, mas o .paa não saiu do
                            PBO — DLC cifrado (`.ebo`), mod ausente na sessão
                            do dump, ou extração ainda não rodada. Recuperável
                            rodando o extrator.
    icone-por-nome         o config declara um NOME, não um caminho. Soldado
                            escreve `icon = "iconMan"`, e quem traduz isso em
                            `.paa` é a classe `CfgVehicleIcons` — uma tabela de
                            indireção que nenhum dump captura ainda. Não
                            adianta rodar o extrator: falta a tabela.

Sem essa separação, "sem ícone" viraria um estado só, e ninguém saberia se o
buraco é do jogo, da nossa extração, ou de um dump que falta — três problemas
com três soluções diferentes.

O terceiro apareceu medindo: 44.534 soldados declaram ícone e nenhum deles é
caminho. São 16 nomes distintos para 44 mil classes, `iconMan` sozinho em
42.801 delas.

## Variante compartilha imagem

Muita classe é variante de outra e aponta para o MESMO `.paa` (camuflagem,
retextura, versão de mod). Quando a canônica não tem entrada no mapa, vale a de
qualquer equivalente — é a mesma imagem no jogo, não um palpite.
"""

import json
import os

AQUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(AQUI, 'out')

SEM_PICTURE = 'sem-picture-no-config'
NAO_EXTRAIDO = 'paa-nao-extraido'
POR_NOME = 'icone-por-nome'


def _e_caminho(v):
    """O valor declarado é um CAMINHO ou um NOME?

    Caminho tem separador ou extensão de textura. `iconMan` não tem nenhum dos
    dois — é chave da `CfgVehicleIcons`, e tratá-lo como arquivo faz a busca no
    PBO falhar por um motivo que não é o real."""
    if not isinstance(v, str):
        return False
    s = v.strip().lower()
    if not s:
        return False
    return '\\' in s or '/' in s or s.endswith(('.paa', '.pac'))


def carregar_mapa(nome):
    """{classe: caminho público} de um mapa em out/, ou {} se ainda não existe.

    Mapa ausente não é erro: significa que a extração daquela categoria não
    rodou. O gerador continua e todo registro sai com `imgAusente` — a base
    fica honesta em vez de não existir.
    """
    caminho = os.path.join(OUT, nome)
    if not os.path.isfile(caminho):
        return {}
    try:
        with open(caminho, encoding='utf-8') as f:
            dados = json.load(f)
    except (OSError, json.JSONDecodeError) as err:
        print(f'  ! {nome} ilegível ({err}) — seguindo sem ícone')
        return {}
    return dados if isinstance(dados, dict) else {}


def resolver(classe, mapa, declarado, equivalentes=(), nomeados=None):
    """(img, imgAusente) para uma classe.

    `declarado` é o VALOR que o config traz (ou um booleano, para quem só sabe
    dizer se existe). O valor é melhor: com ele dá para separar caminho de nome,
    e o motivo da ausência passa a apontar a solução certa.

    `nomeados` é a `CfgVehicleIcons` já extraída ({nome: caminho público}).
    Quando o config declara NOME em vez de caminho — o caso de 42.801 soldados
    escrevendo `icon = "iconMan"` — é ela que fecha a ponte. Sem ela o registro
    sai com `icone-por-nome`, que é ausência com endereço: falta a tabela, não
    a imagem.
    """
    img = mapa.get(classe)
    if not img:
        for c in equivalentes:
            if mapa.get(c):
                img = mapa[c]
                break
    if img:
        return img, None

    if isinstance(declarado, str):
        alvo = declarado.strip()
        if not alvo:
            return None, SEM_PICTURE
        if _e_caminho(alvo):
            return None, NAO_EXTRAIDO
        if nomeados:
            porNome = nomeados.get(alvo.lower())
            if porNome:
                return porNome, None
        return None, POR_NOME
    return None, (NAO_EXTRAIDO if declarado else SEM_PICTURE)


def tem_picture(entrada, campos=('picture', 'icon', 'editorPreview')):
    """O config declara alguma imagem para este registro?

    Aceita vários campos porque a resposta muda por família: item usa
    `picture`, símbolo de carta usa `icon`. Um valor vazio conta como não
    declarado — que é exatamente o que ele significa no config.
    """
    if not isinstance(entrada, dict):
        return False
    for c in campos:
        v = entrada.get(c)
        if isinstance(v, str) and v.strip():
            return True
    return False


def conferir(entradas, rotulo='registro'):
    """A invariante: exatamente um entre `img` e `imgAusente`.

    Devolve lista de problemas, no formato que os `verificar()` dos geradores
    já usam. Vazia = passou.
    """
    erros = []
    motivos = {SEM_PICTURE, NAO_EXTRAIDO, POR_NOME}
    for e in entradas:
        img = e.get('img')
        ausente = e.get('imgAusente')
        nome = e.get('classe') or e.get('id') or rotulo
        if img and ausente:
            erros.append(f'{nome}: tem img E imgAusente')
        elif not img and not ausente:
            erros.append(f'{nome}: sem img e sem motivo declarado')
        elif ausente and ausente not in motivos:
            erros.append(f'{nome}: motivo desconhecido "{ausente}"')
    return erros


def placar(entradas):
    """Contagem para o gerador imprimir. Números, não adjetivos."""
    com = sum(1 for e in entradas if e.get('img'))
    sem_cfg = sum(1 for e in entradas if e.get('imgAusente') == SEM_PICTURE)
    nao_ext = sum(1 for e in entradas if e.get('imgAusente') == NAO_EXTRAIDO)
    por_nome = sum(1 for e in entradas if e.get('imgAusente') == POR_NOME)
    return {
        'com ícone': com,
        'sem imagem no config': sem_cfg,
        'declarado mas não extraído': nao_ext,
        'ícone por nome (falta CfgVehicleIcons)': por_nome,
    }


def enxugar(e):
    """Tira do registro a metade NULA do par `img`/`imgAusente`.

    Os dois são mutuamente exclusivos por construção, então escrever os dois é
    escrever uma chave sabidamente nula por registro. Em `soldados-db.json` são
    482 KB para não dizer nada — e a base já enxuga campo que ninguém lê
    (`SO_NO_NUCLEO`) pelo mesmo motivo.

    Só para o JSON sob demanda: `conferir()` roda ANTES, sobre o registro
    inteiro, e é lá que a invariante é cobrada. Quem lê usa `.get`/`?.` nos dois
    lados, para quem a chave ausente e a chave nula são a mesma coisa.
    """
    return {k: v for k, v in e.items()
            if v is not None or k not in ('img', 'imgAusente')}


def imprimir_placar(entradas):
    """O placar na saída do gerador — para o buraco aparecer sem ninguém abrir
    o JSON. Sem linha zerada: estado que não ocorreu não vira ruído."""
    p = placar(entradas)
    print('ícones:')
    for rotulo, n in p.items():
        if n:
            print(f'  {rotulo:38} {n}')
