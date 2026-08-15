#!/usr/bin/env python3
"""O grafo do pipeline do Arma 3 e as regras de "isto precisa rodar de novo?".

Separado de `atualizar-arma3.py` pela mesma razão de `imagens_catalogo.py`: a
decisão de rodar ou pular é lógica pura, e lógica pura dá para provar sem ter o
jogo instalado. Quem precisa da máquina é só a execução.

O pipeline tem três degraus, e só o primeiro depende do operador:

    jogo  --.sqf-->  .rpt  --parse-->  out/*.json  --gera-->  src/data + public
                                            \\--extrai-->  public/arma3/icones

Regra de atualização, degrau por degrau:

  1. **parse** — cada `out/<x>.json` guarda em `fonte` o nome do `.rpt` de onde
     saiu. Se o `.rpt` escolhido hoje tem o mesmo nome E é mais velho que o
     JSON, o dump já foi lido: pula. Nome diferente ou `.rpt` mais novo
     significa dump novo, e aí roda.

  2. **imagens** — já é retomável por construção: imagem que está no destino
     não é reextraída. Não precisa de regra aqui.

  3. **bases** — compara mtime: se toda saída é mais nova que toda entrada,
     nada mudou desde a última geração.

⚠️ Por que mtime e não hash do conteúdo: o `.rpt` de uma sessão longa passa de
1 GB, e ler tudo para decidir se vale a pena ler tudo não faz sentido. Para os
JSON intermediários o hash seria barato, mas misturar os dois critérios criaria
dois conceitos de "mudou" no mesmo pipeline. mtime é o critério do `make` há
cinquenta anos, e o modo de errar dele é conhecido: `touch` sem edição faz
regerar à toa (custa tempo, não corretude).
"""

import os

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')


class Etapa:
    """Um parser: lê o `.rpt` pela marca dele e escreve um JSON em out/."""

    def __init__(self, nome, marca, script, saida, sqf, sobre):
        self.nome = nome
        self.marca = marca
        self.script = script
        self.saida = saida
        self.sqf = sqf
        self.sobre = sobre

    @property
    def saida_abs(self):
        return os.path.join(OUT, self.saida)


class Base:
    """Um gerador: lê JSON de out/ e escreve a base que o site importa."""

    def __init__(self, nome, script, entradas, saidas, sobre):
        self.nome = nome
        self.script = script
        self.entradas = entradas      # nomes em out/
        self.saidas = saidas          # caminhos relativos à raiz
        self.sobre = sobre

    @property
    def entradas_abs(self):
        return [os.path.join(OUT, e) for e in self.entradas]

    @property
    def saidas_abs(self):
        return [os.path.join(RAIZ, *s.split('/')) for s in self.saidas]


ETAPAS = [
    Etapa('armas', '<<A3DUMP>>', 'parse-dump.py', 'arma3-config.json',
          'dump-config.sqf', 'armas, carregadores e munições'),
    Etapa('mapas', '<<A3MAPA>>', 'parse-mapas.py', 'arma3-mapas.json',
          'dump-mapas.sqf', 'mundos e a grade de cada um'),
    Etapa('itens', '<<A3ITEM>>', 'parse-itens.py', 'arma3-itens.json',
          'dump-itens.sqf', 'itens, óculos e mochilas'),
    Etapa('veiculos', '<<A3VEIC>>', 'parse-veiculos.py', 'arma3-veiculos.json',
          'dump-veiculos.sqf', 'veículos, soldados e facções'),
    Etapa('acessorios', '<<A3ACC>>', 'parse-acessorios.py', 'arma3-acessorios.json',
          'dump-acessorios.sqf', 'o que encaixa em cada arma'),
    Etapa('animacoes', '<<A3ANIM>>', 'parse-animacoes.py', 'arma3-animacoes.json',
          'dump-animacoes.sqf', 'estados de animação'),
    Etapa('grupos', '<<A3GRUPO>>', 'parse-grupos.py', 'arma3-grupos.json',
          'dump-grupos.sqf', 'ordem de batalha'),
    Etapa('funcoes', '<<A3FUNC>>', 'parse-funcoes.py', 'arma3-funcoes.json',
          'dump-funcoes.sqf', 'biblioteca SQF'),
    Etapa('manual', '<<A3MANUAL>>', 'parse-manual.py', 'arma3-manual.json',
          'dump-manual.sqf', 'Manual de Campo'),
    Etapa('simbologia', '<<A3SIMB>>', 'parse-simbologia.py', 'arma3-simbologia.json',
          'dump-simbologia.sqf', 'marcadores, cores, patentes, insígnias'),
    Etapa('terreno-fisico', '<<A3CHAO>>', 'parse-terreno-fisico.py',
          'arma3-terreno-fisico.json', 'dump-terreno-fisico.sqf',
          'superfícies, vegetação, clima'),
    Etapa('proveniencia', '<<A3PROV>>', 'parse-proveniencia.py',
          'arma3-proveniencia.json', 'dump-proveniencia.sqf',
          'quem registra cada classe'),
    Etapa('icones', '<<A3ICO>>', 'parse-icones.py', 'arma3-icones.json',
          'dump-icones.sqf', 'varredura de imagem do config inteiro'),
]

POR_NOME = {e.nome: e for e in ETAPAS}


BASES = [
    Base('armas', 'gerar-base-armas.py',
         ['arma3-config.json', 'armas-imagens.json'],
         ['src/data/arma3-armas.js', 'src/data/arma3-municao.js',
          'public/arma3/armas-db.json'],
         'a base de armas e munição'),
    Base('acessorios', 'gerar-base-acessorios.py',
         ['arma3-acessorios.json', 'arma3-itens.json'],
         ['src/data/arma3-acessorios.js', 'public/arma3/acessorios-db.json'],
         'acessórios e compatibilidade'),
    Base('terrenos', 'gerar-base-terrenos.py',
         ['arma3-mapas.json'],
         ['src/data/arma3-terrenos.js', 'public/arma3/terrenos-db.json'],
         'terrenos e grade'),
    # Os mapas de imagem são ENTRADA destas três bases desde que os ícones
    # foram ligados à wiki. Omiti-los faria o pipeline dizer "tudo em dia"
    # depois de uma extração de imagens nova, e a wiki seguiria mostrando
    # lugar vazio — que é exatamente o modo de falha que este módulo existe
    # para impedir: PULAR o que mudou, calado.
    Base('veiculos', 'gerar-base-veiculos.py',
         ['arma3-veiculos.json', 'imagens-veiculos.json', 'imagens-nomeadas.json'],
         ['src/data/arma3-veiculos.js', 'public/arma3/veiculos-db.json'],
         'veículos'),
    Base('equipamento', 'gerar-base-equipamento.py',
         ['arma3-itens.json', 'imagens-itens.json'],
         ['src/data/arma3-equipamento.js', 'public/arma3/equipamento-db.json'],
         'coletes, uniformes, mochilas'),
    Base('soldados', 'gerar-base-soldados.py',
         ['arma3-veiculos.json', 'imagens-mapa.json', 'imagens-nomeadas.json'],
         ['src/data/arma3-soldados.js', 'public/arma3/soldados-db.json'],
         'funções de soldado'),
    Base('extracao', 'gerar-base-extracao.py',
         ['arma3-config.json', 'arma3-itens.json', 'arma3-veiculos.json',
          'arma3-mapas.json', 'arma3-acessorios.json', 'arma3-animacoes.json',
          'armas-imagens.json'],
         ['src/data/arma3-extracao.js'],
         'o painel de estado da extração'),
]


# ── decidir o que rodar ────────────────────────────────────────────────────

def fonte_de(caminho_json):
    """O `.rpt` de onde este JSON saiu, sem carregar o arquivo inteiro.

    `fonte` é a primeira chave que os parsers escrevem, então os primeiros
    bytes bastam — e alguns destes JSON passam de 80 MB."""
    try:
        with open(caminho_json, encoding='utf-8') as f:
            cabeca = f.read(400)
    except OSError:
        return None
    marca = '"fonte":'
    i = cabeca.find(marca)
    if i < 0:
        return None
    resto = cabeca[i + len(marca):].lstrip()
    if not resto.startswith('"'):
        return None
    fim = resto.find('"', 1)
    return resto[1:fim] if fim > 0 else None


def precisa_parse(etapa, rpt, existe=os.path.isfile, mtime=os.path.getmtime,
                  fonte=None):
    """(rodar?, motivo). `rpt` é o .rpt escolhido para a marca desta etapa.

    As funções de disco entram por parâmetro para o teste poder simular um
    sistema de arquivos sem criar arquivo nenhum."""
    if rpt is None:
        return False, 'sem dump no .rpt — falta rodar o .sqf no jogo'

    saida = etapa.saida_abs
    if not existe(saida):
        return True, 'primeira extração'

    origem = fonte(saida) if fonte else fonte_de(saida)
    if origem is None:
        return True, 'o JSON não diz de que .rpt veio'
    if origem != os.path.basename(rpt):
        return True, f'dump veio de outro .rpt ({origem})'
    if mtime(rpt) > mtime(saida):
        return True, 'o .rpt tem dump mais novo que o JSON'
    return False, 'já está atualizado'


def precisa_base(base, existe=os.path.isfile, mtime=os.path.getmtime):
    """(rodar?, motivo). Roda se alguma entrada é mais nova que alguma saída."""
    entradas = [e for e in base.entradas_abs if existe(e)]
    if not entradas:
        return False, 'nenhuma entrada existe ainda'

    faltando = [s for s in base.saidas_abs if not existe(s)]
    if faltando:
        return True, f'{len(faltando)} saída(s) não existem'

    mais_nova = max(mtime(e) for e in entradas)
    mais_velha = min(mtime(s) for s in base.saidas_abs)
    if mais_nova > mais_velha:
        return True, 'entrada mais nova que a base gerada'
    return False, 'já está atualizada'


def indexar_rpts(pasta, marcas, listar=None, abrir=None, mtime=os.path.getmtime):
    """{marca: caminho do melhor .rpt} varrendo cada arquivo UMA vez.

    `achar_rpt` do a3dump_comum lê cada `.rpt` inteiro procurando UMA marca.
    Com 13 etapas isso são 13 leituras completas de uma pasta cujos arquivos
    passam de 1 GB. Aqui procuramos as 13 marcas na mesma passada.

    O critério de escolha é o mesmo do `achar_rpt`, de propósito: prefere o
    dump COMPLETO (que tem a linha de FIM) e, entre esses, o mais recente. Se
    divergisse, rodar o parser sozinho daria um resultado e pelo orquestrador
    daria outro."""
    listar = listar or (lambda p: sorted(os.listdir(p)))
    abrir = abrir or (lambda p: open(p, encoding='cp1252', errors='replace'))

    cands = {m: [] for m in marcas}
    try:
        arquivos = [a for a in listar(pasta) if a.lower().endswith('.rpt')]
    except OSError:
        return {m: None for m in marcas}

    for arq in arquivos:
        caminho = os.path.join(pasta, arq)
        achadas = {}
        try:
            with abrir(caminho) as f:
                for linha in f:
                    for m in marcas:
                        if m in linha:
                            completo = achadas.get(m, False) or (m + 'FIM' in linha)
                            achadas[m] = completo
        except OSError:
            continue
        for m, completo in achadas.items():
            cands[m].append((completo, mtime(caminho), caminho))

    escolhidos = {}
    for m, lista in cands.items():
        lista.sort(reverse=True)
        escolhidos[m] = lista[0][2] if lista else None
    return escolhidos
