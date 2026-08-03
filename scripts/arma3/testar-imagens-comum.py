#!/usr/bin/env python3
"""Prova a ligação classe → ícone (`gerar_imagens_comum.py`).

Esta é a regra que decide o que a wiki mostra num lugar vazio. Errar aqui não
quebra nada — só faz a tela mentir de um jeito discreto: "sem ícone" quando na
verdade o config declara e a extração falhou, ou o contrário.

Por isso o teste central não é "acha o ícone certo". É **ausência carrega
motivo, e o motivo é o certo** — porque é dele que sai a decisão de rodar o
extrator de novo ou aceitar o buraco.

Roda em `npm run testar-imagens-comum-arma3`, no CI.
"""

import json
import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gerar_imagens_comum as gic                                # noqa: E402

falhas = []


def checar(cond, titulo, detalhe=''):
    if cond:
        print(f'  ✓ {titulo}')
    else:
        print(f'  ✗ {titulo}')
        if detalhe:
            print(f'      {detalhe}')
        falhas.append(titulo)


def teste_resolucao():
    mapa = {'arifle_MX_F': '/arma3/armas/mx.webp'}

    img, aus = gic.resolver('arifle_MX_F', mapa, True)
    checar(img == '/arma3/armas/mx.webp' and aus is None,
           'classe com ícone: devolve o caminho e nenhum motivo')

    img, aus = gic.resolver('arifle_MX_Black_F', mapa, True,
                            equivalentes=['arifle_MX_F'])
    checar(img == '/arma3/armas/mx.webp' and aus is None,
           'variante herda o ícone do equivalente — é a MESMA imagem no jogo')

    img, aus = gic.resolver('nao_tem', mapa, True)
    checar(img is None and aus == gic.NAO_EXTRAIDO,
           'config DECLARA e não extraímos: motivo é recuperável')

    img, aus = gic.resolver('nao_tem', mapa, False)
    checar(img is None and aus == gic.SEM_PICTURE,
           'config NÃO declara: motivo é do jogo, não nosso')


def teste_tabela_de_nomes():
    """A `CfgVehicleIcons`: nome declarado → caminho.

    É o caso de 42.801 soldados (`icon = "iconMan"`) e de 17.316 veículos
    (`picture = "pictureStaticObject"`). Sem a tabela, o motivo tem de ser
    `icone-por-nome` — nem `sem-picture` (o config declara) nem
    `paa-nao-extraido` (rodar o extrator não resolve; falta a tabela)."""
    nomes = {'iconman': '/arma3/icones/nomeados/iconman_ca.webp'}

    img, aus = gic.resolver('B_Soldier_F', {}, 'iconMan', nomeados=nomes)
    checar(img == nomes['iconman'] and aus is None,
           'nome declarado vira caminho pela CfgVehicleIcons')

    img, aus = gic.resolver('B_Soldier_F', {}, 'ICONMAN', nomeados=nomes)
    checar(img == nomes['iconman'] and aus is None,
           'a busca ignora caixa — o engine do jogo também ignora')

    img, aus = gic.resolver('x', {}, 'iconMan', nomeados=None)
    checar(img is None and aus == gic.POR_NOME,
           'SEM a tabela o motivo aponta a tabela, não o extrator')

    img, aus = gic.resolver('x', {}, 'iconDeModQueNinguemTem', nomeados=nomes)
    checar(img is None and aus == gic.POR_NOME,
           'nome fora da tabela continua sendo ausência com endereço')

    # a tabela NÃO pode sequestrar um caminho: `\a3\...\x.paa` é arquivo.
    img, aus = gic.resolver('x', {}, '\\a3\\ui_f\\data\\iconMan.paa', nomeados=nomes)
    checar(img is None and aus == gic.NAO_EXTRAIDO,
           'caminho continua caminho mesmo com tabela carregada')

    # o mapa por classe ganha da tabela: é a imagem daquela classe, não a genérica
    img, aus = gic.resolver('B_Soldier_F', {'B_Soldier_F': '/proprio.webp'},
                            'iconMan', nomeados=nomes)
    checar(img == '/proprio.webp',
           'ícone da própria classe tem precedência sobre o genérico do nome')


def teste_e_caminho():
    """A distinção que separa `paa-nao-extraido` de `icone-por-nome`."""
    for v in ('\\a3\\ui_f\\data\\x.paa', 'a3/ui_f/x.pac', 'pasta\\arquivo',
              'algumacoisa.paa'):
        if not gic._e_caminho(v):
            checar(False, 'deveria ser caminho', repr(v))
            return
    for v in ('iconMan', 'pictureStaticObject', 'iconObject_1x1', '', '   ', None, 7):
        if gic._e_caminho(v):
            checar(False, 'NÃO deveria ser caminho', repr(v))
            return
    checar(True, 'separador ou extensão = caminho; o resto é nome')


def teste_os_dois_motivos_nao_se_confundem():
    """A distinção que justifica o campo existir.

    Um só estado ("sem ícone") não diria se vale rodar o extrator de novo."""
    _, a = gic.resolver('x', {}, True)
    _, b = gic.resolver('x', {}, False)
    checar(a != b, 'os dois motivos são distinguíveis', f'{a} vs {b}')
    checar(a == gic.NAO_EXTRAIDO and b == gic.SEM_PICTURE,
           'e cada um diz de quem é a falta')


def teste_tem_picture():
    checar(gic.tem_picture({'picture': '\\a3\\ui\\x.paa'}), 'picture preenchido conta')
    checar(not gic.tem_picture({'picture': ''}), 'picture vazio NÃO conta')
    checar(not gic.tem_picture({'picture': '   '}), 'picture só com espaço não conta')
    checar(not gic.tem_picture({}), 'sem o campo não conta')
    checar(gic.tem_picture({'icon': '\\a3\\ui\\i.paa'}),
           'símbolo de carta usa `icon`, não `picture`')
    checar(not gic.tem_picture({'icon': '\\x.paa'}, campos=('picture',)),
           'a lista de campos é respeitada')
    for ruim in (None, 42, 'texto', []):
        if gic.tem_picture(ruim):
            checar(False, 'entrada inválida não pode contar como declarada', f'{ruim!r}')
            return
    checar(True, 'entrada inválida não conta como declarada')


def teste_invariante():
    ok = [{'classe': 'a', 'img': '/x.webp', 'imgAusente': None},
          {'classe': 'b', 'img': None, 'imgAusente': gic.SEM_PICTURE}]
    checar(gic.conferir(ok) == [], 'registro correto passa')

    ruins = [
        ({'classe': 'c', 'img': '/x.webp', 'imgAusente': gic.SEM_PICTURE}, 'E imgAusente'),
        ({'classe': 'd', 'img': None, 'imgAusente': None}, 'sem motivo'),
        ({'classe': 'e', 'img': None, 'imgAusente': 'sei-la'}, 'desconhecido'),
    ]
    for reg, esperado in ruins:
        erros = gic.conferir([reg])
        if not erros or esperado not in erros[0]:
            checar(False, f'deveria reprovar: {reg}', f'{erros}')
            return
    checar(True, 'os três jeitos de estar errado são pegos')


def teste_mapa_ausente():
    """Extração não rodada não pode impedir a base de existir."""
    checar(gic.carregar_mapa('nao-existe-mesmo.json') == {},
           'mapa ausente devolve {} — a base sai honesta em vez de não sair')

    with tempfile.TemporaryDirectory() as tmp:
        antigo = gic.OUT
        try:
            gic.OUT = tmp
            p = os.path.join(tmp, 'quebrado.json')
            open(p, 'w').write('{isto não é json')
            checar(gic.carregar_mapa('quebrado.json') == {},
                   'mapa corrompido avisa e devolve {}, não estoura')
            json.dump(['lista', 'não', 'dicionário'], open(os.path.join(tmp, 'lista.json'), 'w'))
            checar(gic.carregar_mapa('lista.json') == {},
                   'mapa de tipo errado devolve {}')
        finally:
            gic.OUT = antigo


def teste_placar():
    e = [{'img': '/a.webp'}, {'img': '/b.webp'},
         {'img': None, 'imgAusente': gic.SEM_PICTURE},
         {'img': None, 'imgAusente': gic.NAO_EXTRAIDO},
         {'img': None, 'imgAusente': gic.POR_NOME}]
    p = gic.placar(e)
    checar(p['com ícone'] == 2 and p['sem imagem no config'] == 1
           and p['declarado mas não extraído'] == 1
           and p['ícone por nome (falta CfgVehicleIcons)'] == 1,
           'o placar separa os quatro estados', f'{p}')
    checar(sum(p.values()) == len(e),
           'e o placar fecha: todo registro cai em exatamente um estado')


def teste_contra_os_mapas_reais():
    """Se os mapas estiverem no disco, confere que são o que dizem ser."""
    achou = []
    for nome in ('armas-imagens.json', 'imagens-itens.json',
                 'imagens-veiculos.json', 'imagens-mapa.json'):
        m = gic.carregar_mapa(nome)
        if not m:
            continue
        achou.append(f'{nome.replace(".json","")}={len(m)}')
        ruins = [k for k, v in list(m.items())[:500]
                 if not isinstance(v, str) or not v.startswith('/')]
        if ruins:
            checar(False, f'{nome}: valor não é caminho público', f'{ruins[:3]}')
            return
    if not achou:
        print('  – nenhum mapa de imagem no disco ainda')
        return
    checar(True, f'mapas reais são {{classe: /caminho}}: {" · ".join(achou)}')


def main():
    print('provando a ligação classe → ícone\n')
    print('1. resolução')
    teste_resolucao()
    teste_os_dois_motivos_nao_se_confundem()
    print('\n1b. a tabela CfgVehicleIcons (nome → caminho)')
    teste_e_caminho()
    teste_tabela_de_nomes()
    print('\n2. o config declara?')
    teste_tem_picture()
    print('\n3. a invariante')
    teste_invariante()
    print('\n4. mapa ausente ou quebrado')
    teste_mapa_ausente()
    print('\n5. placar')
    teste_placar()
    print('\n6. contra os mapas reais')
    teste_contra_os_mapas_reais()

    print()
    if falhas:
        print(f'✗ {len(falhas)} falha(s): {", ".join(falhas)}')
        return 1
    print('✓ a ausência de ícone sempre carrega o motivo certo')
    return 0


if __name__ == '__main__':
    sys.exit(main())
