#!/usr/bin/env python3
"""Prova o catálogo de imagens sem precisar do jogo instalado.

O que dá para provar aqui é a parte que errava em silêncio: a resolução de
nome. Extrair de PBO exige o Arma 3 na máquina; decidir COMO a imagem se chama
não exige nada, e era ali que 310 imagens recebiam a foto de outra.

Os testes são de propriedade, não de valor esperado — nenhum deles confere
contra nome que eu digitei de memória:
  · injetividade      caminhos distintos -> nomes distintos (o defeito)
  · determinismo      rodar duas vezes dá o mesmo
  · independência     embaralhar a entrada não muda a saída
  · ausência ≠ vazio  dump que não rodou é None, não {}

Roda em `npm run testar-imagens-arma3`, no CI.
"""

import json
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from imagens_catalogo import (                                   # noqa: E402
    CATEGORIAS, OUT, alvos, nomear, normalizar)

falhas = []


def checar(condicao, titulo, detalhe=''):
    if condicao:
        print(f'  ✓ {titulo}')
    else:
        print(f'  ✗ {titulo}')
        if detalhe:
            print(f'      {detalhe}')
        falhas.append(titulo)


# --------------------------------------------------------------- nomear()

def teste_injetividade():
    """A propriedade que faltava. `\\fir_f14\\icon.paa` e `\\fir_f15\\icon.paa`
    têm o mesmo basename e recebiam o mesmo arquivo — o F-14 ficava com o ícone
    do F-15, sem erro nenhum."""
    virtuais = [
        r'\fir_f14\icon.paa',
        r'\fir_f15\icon.paa',
        r'\fir_f15_legacy\icon.paa',
        r'\a3\weapons_f\data\ui\gear_mx_ca.paa',
        r'\mss\mss_atacr\data\ui\mk5_ca.paa',
        r'\mss\mss_sb\data\ui\mk5_ca.paa',
    ]
    nomes = nomear(virtuais)
    checar(len(set(nomes.values())) == len(virtuais),
           'caminhos distintos recebem nomes distintos',
           f'{len(virtuais)} caminhos -> {len(set(nomes.values()))} nomes')

    # o que não colide fica com o nome limpo — legibilidade importa
    checar(nomes[r'\a3\weapons_f\data\ui\gear_mx_ca.paa'] == 'gear_mx_ca',
           'nome sem colisão fica limpo, sem sufixo')

    # e o que colide: NINGUÉM fica com o nome limpo
    colididos = [nomes[v] for v in virtuais if v.endswith('icon.paa')]
    checar(all(n != 'icon' for n in colididos),
           'em grupo que colide, nenhum membro fica com o nome limpo',
           f'nomes: {colididos}')


def teste_determinismo_e_ordem():
    """Se o nome dependesse da ordem de iteração, dois computadores gerariam
    árvores diferentes do mesmo jogo — e o diff não explicaria."""
    virtuais = [f'\\mod{i}\\ui\\icon.paa' for i in range(8)]
    virtuais += [f'\\a3\\x\\unico{i}.paa' for i in range(8)]

    a = nomear(virtuais)
    b = nomear(virtuais)
    checar(a == b, 'rodar duas vezes dá exatamente o mesmo mapa')

    baralhado = virtuais[:]
    random.Random(7).shuffle(baralhado)
    c = nomear(baralhado)
    checar(a == c, 'embaralhar a entrada não muda nenhum nome',
           next((f'{k}: {a[k]} != {c[k]}' for k in a if a[k] != c[k]), ''))


def teste_nome_seguro():
    """O nome vira arquivo em disco e URL. Não pode escapar da pasta nem
    carregar caractere que o servidor trate de forma especial."""
    perigosos = [
        r'\a3\..\..\etc\passwd.paa',
        r'\a3\ui\Ícone Ação (2).paa',
        r'\a3\ui\.paa',
        r'\a3\ui\a b/c.paa',
    ]
    nomes = nomear(perigosos)
    ruins = [n for n in nomes.values()
             if not n or '/' in n or '\\' in n or '.' in n or n.strip('-') != n]
    checar(not ruins, 'todo nome é seguro para disco e URL', f'ruins: {ruins}')


# ------------------------------------------------------------ normalizar()

def teste_normalizar():
    """O config escreve o mesmo .paa de várias formas. Se a chave fosse o texto
    cru, a mesma imagem seria extraída e gravada três vezes."""
    iguais = [r'\A3\Weapons_F\Data\UI\gear_ca.paa',
              r'a3/weapons_f/data/ui/gear_ca.paa',
              r'A3\weapons_f\Data\UI\gear_ca.paa']
    vistos = {normalizar(v) for v in iguais}
    checar(len(vistos) == 1,
           'as três formas do mesmo caminho viram uma chave só', f'{vistos}')

    checar(all(normalizar(v) is None for v in ['', '   ', '""', '\\', None, 0, []]),
           'caminho vazio (nas várias formas do config) não vira alvo')


# ---------------------------------------------------------------- alvos()

def teste_ausencia_nao_e_vazio():
    """O defeito original: `extrair-imagens.py` procurava `arma3-catalogo.json`,
    um dump que nunca existiu. Arquivo ausente não dava erro — só sumia com
    tudo que não fosse arma. Nove por cento do jogo, calado."""
    cat = next(c for c in CATEGORIAS if c.nome == 'itens')

    checar(alvos(cat, lambda _: None) is None,
           'dump que não rodou devolve None (não {})')
    checar(alvos(cat, lambda _: {'itens': {}}) == {},
           'dump que rodou e veio vazio devolve {} (não None)')

    dump = {'itens': {'A': {'picture': r'\x\a.paa'}, 'B': {'picture': r'\X\A.PAA'}},
            'oculos': {'C': {'picture': ''}},
            'mochilas': {'D': {'picture': r'\x\b.paa'}, 'E': {'naoTem': 1}}}
    r = alvos(cat, lambda _: dump)
    checar(r == {r'x\a.paa': ['A', 'B'], r'x\b.paa': ['D']},
           'classes que compartilham a mesma imagem se juntam num alvo só',
           f'{r}')


def teste_secao_lista():
    """Os dumps NOVOS escrevem lista, não dicionário.

    `simbologia`, `proveniencia` e `manual` emitem `[{classe: ..., ...}]`
    enquanto os antigos emitem `{classe: {...}}`. Assumir dicionário estourava
    com `AttributeError` — e como esses dumps não existem no repositório,
    nenhum teste passava por esse caminho até o CI tropeçar nele."""
    simb = next(c for c in CATEGORIAS if c.nome == 'simbologia')
    dump = {'marcadores': [{'classe': 'b_inf', 'icone': r'\ui\b_inf.paa'},
                           {'classe': 'sem_icone', 'icone': ''},
                           {'icone': r'\ui\orfao.paa'}],       # sem chave
            'patentes': [{'classe': 'PRIVATE', 'textura': r'\ui\pvt.paa'}],
            'insignias': []}
    r = alvos(simb, lambda _: dump)
    checar(r == {r'ui\b_inf.paa': ['b_inf'], r'ui\pvt.paa': ['PRIVATE']},
           'seção em LISTA é lida igual à seção em dicionário', f'{r}')
    checar(all(c for cs in r.values() for c in cs),
           'item de lista sem o campo-chave é descartado, não vira classe ""')

    # a proveniência chama de `mod` o que as outras chamam de `classe`
    dlc = next(c for c in CATEGORIAS if c.nome == 'dlc')
    r = alvos(dlc, lambda _: {'mods': [{'mod': 'Expansion', 'logo': r'\a\l.paa'}]})
    checar(r == {r'a\l.paa': ['Expansion']},
           'categoria declara a própria chave (mods usa `mod`, não `classe`)',
           f'{r}')

    r = alvos(simb, lambda _: {'marcadores': 'isto não é seção'})
    checar(r == {}, 'seção de tipo inesperado devolve vazio em vez de estourar')


# ------------------------------------------------------------- o catálogo

def teste_catalogo_coerente():
    nomes = [c.nome for c in CATEGORIAS]
    checar(len(nomes) == len(set(nomes)), 'nome de categoria não se repete')

    mapas = [c.mapa for c in CATEGORIAS]
    checar(len(mapas) == len(set(mapas)),
           'cada categoria escreve o próprio mapa (uma não sobrescreve a outra)')

    # `nomear()` roda por categoria, então só garante nome único DENTRO dela.
    # Duas categorias na mesma pasta poderiam colidir entre si sem ninguém ver.
    destinos = [c.destino for c in CATEGORIAS]
    repetidos = {d for d in destinos if destinos.count(d) > 1}
    checar(not repetidos,
           'cada categoria tem pasta própria (nomear() só protege dentro da categoria)',
           f'compartilhada: {repetidos}')

    web_fora = [c.nome for c in CATEGORIAS
                if c.peso == 'web' and not c.destino.startswith('public/')]
    checar(not web_fora, 'categoria web grava dentro de public/', f'{web_fora}')

    app_dentro = [c.nome for c in CATEGORIAS
                  if c.peso == 'app' and c.destino.startswith('public/')]
    checar(not app_dentro,
           'categoria app NÃO grava em public/ (render grande fora do site)',
           f'{app_dentro}')

    checar(all(c.url_base and c.url_base.startswith('/')
               for c in CATEGORIAS if c.peso == 'web'),
           'toda categoria web tem URL pública começando em /')

    legado = next(c for c in CATEGORIAS if c.nome == 'armas')
    checar(legado.destino == 'public/arma3/armas'
           and legado.mapa == 'armas-imagens.json',
           'armas mantém destino e mapa antigos (src/data/arma3-armas.js aponta pra lá)')


def teste_contra_os_dumps_reais():
    """Se os dumps estiverem na máquina, prova a propriedade contra o dado de
    verdade — 10 mil caminhos com as colisões que o jogo realmente tem. Sem os
    dumps, o teste se declara pulado em vez de passar caladamente."""
    def carregar(nome):
        caminho = os.path.join(OUT, nome)
        if not os.path.isfile(caminho):
            return None
        with open(caminho, encoding='utf-8') as f:
            return json.load(f)

    total = 0
    rodou = []
    for cat in CATEGORIAS:
        # Uma seção com forma inesperada estourava aqui como traceback cru, sem
        # dizer QUAL categoria. Foi assim que o CI reprovou, e o log não dizia
        # onde olhar. Erro de leitura é falha desta categoria, não do teste.
        try:
            a = alvos(cat, carregar)
        except Exception as err:
            checar(False, f'[{cat.nome}] não consegui ler {cat.dump}',
                   f'{type(err).__name__}: {err}')
            continue
        if a is None:
            continue
        nomes = nomear(list(a))
        if len(set(nomes.values())) != len(a):
            checar(False, f'[{cat.nome}] colisão no dado real',
                   f'{len(a)} caminhos -> {len(set(nomes.values()))} nomes')
            return
        total += len(a)
        rodou.append(cat.nome)

    if not rodou:
        print('  – dumps reais ausentes — propriedade não conferida contra o jogo')
        return
    checar(True, f'{total} caminhos reais, zero colisão '
                 f'({len(rodou)} categorias com dump)')


def main():
    print('provando o catálogo de imagens\n')
    print('1. nome de arquivo')
    teste_injetividade()
    teste_determinismo_e_ordem()
    teste_nome_seguro()
    print('\n2. caminho virtual do config')
    teste_normalizar()
    print('\n3. leitura do dump')
    teste_ausencia_nao_e_vazio()
    teste_secao_lista()
    print('\n4. o catálogo')
    teste_catalogo_coerente()
    print('\n5. contra os dumps reais')
    teste_contra_os_dumps_reais()

    print()
    if falhas:
        print(f'✗ {len(falhas)} falha(s): {", ".join(falhas)}')
        return 1
    print('✓ catálogo de imagens íntegro')
    return 0


if __name__ == '__main__':
    sys.exit(main())
