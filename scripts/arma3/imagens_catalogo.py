#!/usr/bin/env python3
"""O catálogo de imagens do Arma 3: o que extrair, de onde, e para onde.

Separado de `extrair-imagens.py` porque é a parte que dá para testar sem ter o
jogo instalado — a resolução de nome não depende de PBO nenhum, e é justamente
onde estava o defeito que fazia 310 imagens receberem a foto errada.

Duas decisões moram aqui:

**Peso.** `web` vai para `public/` e é servido pelo site; `app` fica fora do
bundle. Os `editorPreview` são renders grandes do editor — 16.5 mil deles, e o
mega-plano (#238) diz web leve, app completo. Ícone de inventário é ícone;
render de 512px é foto, e foto não entra no clone de todo mundo.

**Nome.** O nome do arquivo sai do basename do caminho virtual, que é curto e
legível — mas `\\fir_f14\\icon.paa` e `\\fir_f15\\icon.paa` têm o MESMO
basename. Quando isso acontece, TODOS os caminhos daquele grupo ganham sufixo
de hash; nenhum fica com o nome limpo. Simétrico de propósito: se só o segundo
ganhasse sufixo, o nome de cada um dependeria da ordem de iteração, e um dia o
F-14 e o F-15 trocariam de ícone sem nada no diff explicando por quê.
"""

import hashlib
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')


class Categoria:
    """Uma leva de imagens: de que dump sai, que campo ler, onde gravar.

    `chave` só importa quando a seção do dump é LISTA. Os parsers antigos
    escrevem `{classe: {...}}` e os novos escrevem `[{classe: ..., ...}]` —
    as duas formas convivem, e quem lê precisa saber qual campo do item é o
    nome dele. Declarado em vez de adivinhado: chutar 'classe' e cair em
    string vazia juntaria todas as entradas numa só, calado."""

    def __init__(self, nome, dump, fontes, destino, peso, mapa, sobre,
                 chave='classe'):
        self.nome = nome
        self.dump = dump              # arquivo em out/
        self.fontes = fontes          # [(secao, campo)]
        self.destino = destino        # relativo à raiz do repo
        self.peso = peso              # 'web' (vai pro site) | 'app' (fica fora)
        self.mapa = mapa              # arquivo de saída em out/
        self.sobre = sobre
        self.chave = chave            # só usado quando a seção é lista

    @property
    def destino_abs(self):
        return os.path.join(RAIZ, *self.destino.split('/'))

    @property
    def url_base(self):
        """O prefixo público. Só faz sentido para categoria 'web'."""
        if self.peso != 'web':
            return None
        assert self.destino.startswith('public/')
        return self.destino[len('public'):]


# Ordem = ordem de execução sugerida: o barato e o já-feito primeiro.
CATEGORIAS = [
    Categoria(
        'armas', 'arma3-config.json', [('armas', 'picture')],
        'public/arma3/armas', 'web', 'armas-imagens.json',
        'ícone de inventário das armas'),

    Categoria(
        'itens', 'arma3-itens.json',
        [('itens', 'picture'), ('oculos', 'picture'), ('mochilas', 'picture')],
        'public/arma3/icones/itens', 'web', 'imagens-itens.json',
        'ícone de inventário de item, óculos e mochila'),

    Categoria(
        'veiculos', 'arma3-veiculos.json', [('veiculos', 'picture')],
        'public/arma3/icones/veiculos', 'web', 'imagens-veiculos.json',
        'ícone de inventário dos veículos'),

    Categoria(
        'mapa', 'arma3-veiculos.json',
        [('veiculos', 'icon'), ('soldados', 'icon')],
        'public/arma3/icones/mapa', 'web', 'imagens-mapa.json',
        'símbolo de carta de veículo e soldado (o que aparece no mapa)'),

    Categoria(
        'mundos', 'arma3-mapas.json', [('mundos', 'icon')],
        'public/arma3/icones/mundos', 'web', 'imagens-mundos.json',
        'ícone de cada mundo'),

    Categoria(
        'simbologia', 'arma3-simbologia.json',
        [('marcadores', 'icone'), ('patentes', 'textura'), ('insignias', 'textura')],
        'public/arma3/icones/simbologia', 'web', 'imagens-simbologia.json',
        'marcador APP-6, divisa de patente e brasão de unidade'),

    Categoria(
        'dlc', 'arma3-proveniencia.json', [('mods', 'logo')],
        'public/arma3/icones/dlc', 'web', 'imagens-dlc.json',
        'logo de cada DLC e mod', chave='mod'),

    Categoria(
        'manual', 'arma3-manual.json', [('topicos', 'imagem')],
        'public/arma3/icones/manual', 'web', 'imagens-manual.json',
        'ilustração do Manual de Campo'),

    # A varredura geral: pega retrato de classe que nenhum dump específico
    # visita. Os outros varrem árvores nomeadas com lista de campo fixa; este
    # varre o configFile inteiro. Vem por último de propósito — o que as
    # categorias acima já resolveram fica com o destino delas, e aqui só sobra
    # o que ninguém reclamou.
    Categoria(
        'varredura', 'arma3-icones.json',
        [('porClasse', p) for p in
         ('picture', 'icon', 'texture', 'editorPreview', 'picturePreview',
          'uiPicture', 'logo', 'image', 'overviewPicture', 'previewPicture',
          'portrait', 'pictureLogo')],
        'public/arma3/icones/varredura', 'web', 'imagens-varredura.json',
        'retrato de classe que nenhum outro dump alcança'),

    # --- daqui pra baixo NÃO entra no site ---
    Categoria(
        'previews-veiculos', 'arma3-veiculos.json', [('veiculos', 'editorPreview')],
        'scripts/arma3/out/renders/veiculos', 'app', 'imagens-previews-veiculos.json',
        'render do editor — grande, só app'),

    Categoria(
        'previews-soldados', 'arma3-veiculos.json', [('soldados', 'editorPreview')],
        'scripts/arma3/out/renders/soldados', 'app', 'imagens-previews-soldados.json',
        'render do editor — grande, só app'),

    Categoria(
        'cartas', 'arma3-mapas.json',
        [('mundos', 'pictureMap'), ('mundos', 'pictureShot')],
        'scripts/arma3/out/renders/mundos', 'app', 'imagens-cartas.json',
        'carta e foto de cada mundo — enorme, só app'),
]

POR_NOME = {c.nome: c for c in CATEGORIAS}

# O config escreve caminho vazio de várias formas. Nenhuma delas é imagem.
VAZIOS = {'', '""', "''", '\\', '/', '.paa', 'default'}


def normalizar(virtual):
    """Caminho virtual do config -> chave canônica. `None` se não for imagem.

    O config mistura `/` e `\\`, maiúsculas, e barra inicial opcional — o mesmo
    .paa aparece escrito de três jeitos e viraria três extrações da mesma
    imagem se a chave fosse o texto cru."""
    if not isinstance(virtual, str):
        return None
    v = virtual.strip().replace('/', '\\').strip('\\').lower()
    if v in VAZIOS or not v:
        return None
    return v


def _slug(virtual):
    base = os.path.basename(virtual.replace('\\', '/'))
    base = os.path.splitext(base)[0]
    return re.sub(r'[^a-z0-9_-]+', '-', base.lower()).strip('-') or 'sem-nome'


def nomear(virtuais):
    """{caminho virtual: nome de arquivo sem extensão}, sem colisão.

    Grupo com um caminho só fica com o nome limpo. Grupo com mais de um: TODOS
    ganham `-hash6`, inclusive o primeiro. Se só os repetidos ganhassem sufixo,
    quem fica com o nome limpo dependeria da ordem — e mudaria sozinho quando
    um mod novo entrasse na lista."""
    grupos = {}
    for v in virtuais:
        grupos.setdefault(_slug(v), []).append(v)

    nomes = {}
    for slug, membros in grupos.items():
        if len(membros) == 1:
            nomes[membros[0]] = slug
            continue
        for v in membros:
            h = hashlib.sha1(v.encode('utf-8')).hexdigest()[:6]
            nomes[v] = f'{slug}-{h}'
    return nomes


def registros(secao, chave='classe'):
    """[(nome, item)] a partir de uma seção de dump, seja ela dict ou lista.

    Os parsers antigos escrevem `{classe: {...}}`; os que vieram depois
    (simbologia, proveniência, manual) escrevem `[{classe: ..., ...}]`. Assumir
    dicionário quebrava com `AttributeError` no instante em que o operador
    rodasse um dos dumps novos — e como esses dumps não existem no repositório,
    nenhum teste tocava nesse caminho."""
    if isinstance(secao, dict):
        return [(nome, e) for nome, e in secao.items() if isinstance(e, dict)]
    if isinstance(secao, list):
        saida = []
        for e in secao:
            if not isinstance(e, dict):
                continue
            nome = e.get(chave)
            if nome:                  # sem nome não dá para mapear classe→imagem
                saida.append((nome, e))
        return saida
    return []


def alvos(categoria, carregar):
    """{caminho virtual: [classes que usam]} de uma categoria.

    `carregar(nome_do_dump)` devolve o JSON ou None — injetado para o teste não
    precisar dos 80 MB de dump real. Devolve `None` (≠ dicionário vazio) quando
    o dump não existe: "não rodei" e "rodei e não achei nada" são coisas
    diferentes, e confundir as duas foi exatamente o defeito antigo."""
    dump = carregar(categoria.dump)
    if dump is None:
        return None

    saida = {}
    for secao, campo in categoria.fontes:
        for classe, e in registros(dump.get(secao), categoria.chave):
            v = normalizar(e.get(campo))
            if v:
                saida.setdefault(v, []).append(classe)
    return saida
