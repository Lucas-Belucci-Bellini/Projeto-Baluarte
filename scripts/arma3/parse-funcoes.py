#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-funcoes.sqf e monta o catálogo de funções SQF.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-funcoes.sqf no debug console
    2. aqui:     python scripts/arma3/parse-funcoes.py
    3. saída:    scripts/arma3/out/arma3-funcoes.json

FORMATO lido (v1):
    T |tag|prefixo|dirBase
    F |tag|categoria|nome|arquivo|ext|preInit|postInit|recompile
    PLACAR|tags|funcoes

O nome CHAMÁVEL da função é `TAG_fnc_nome` — é assim que se invoca no jogo, e é
o que o catálogo publica em `chamada`. Quando a tag do config difere do nome da
classe (acontece em mod que renomeia), vale a tag.

O que NÃO existe no config, e por isso não aparece aqui:
  - a DESCRIÇÃO da função. Ela mora no cabeçalho do .sqf, dentro do PBO. Um
    catálogo sem descrição é honesto; um catálogo com descrição adivinhada a
    partir do nome seria pior que não ter catálogo, porque pareceria certo.
    Para trazê-la é preciso passar pelo extrator de PBO (scripts/arma3/pbo.py) —
    fica registrado como próximo passo, não como buraco escondido.
"""

import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, texto, inteiro, salvar   # noqa: E402

MARCA = '<<A3FUNC>>'


def flag(s):
    """-1 no dump = a chave não existe no config. Vira None, não False."""
    v = inteiro(s)
    return None if v is None or v < 0 else bool(v)


def main():
    caminho = achar_rpt(MARCA, 'dump-funcoes.sqf')
    print(f'lendo {caminho}')

    tags = {}
    funcoes = []
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'T' and len(campos) >= 3:
            tags[campos[0]] = {'classe': campos[0], 'tag': texto(campos[1]) or campos[0],
                               'dir': texto(campos[2])}
        elif tipo == 'F' and len(campos) >= 8:
            tag_classe = campos[0]
            tag = (tags.get(tag_classe) or {}).get('tag') or tag_classe
            funcoes.append({
                'tag': tag_classe,
                'categoria': campos[1],
                'nome': campos[2],
                # como se chama no jogo — é o que o operador digita
                'chamada': f'{tag}_fnc_{campos[2]}',
                'arquivo': texto(campos[3]),
                'ext': texto(campos[4]),
                'preInit': flag(campos[5]),
                'postInit': flag(campos[6]),
                'recompile': flag(campos[7]),
            })
        elif tipo == 'PLACAR' and len(campos) >= 2:
            placar = tuple(int(x) for x in campos[:2])

    if not funcoes:
        raise SystemExit('o dump não trouxe função nenhuma — o .sqf rodou até o fim?')

    funcoes.sort(key=lambda f: (f['tag'], f['categoria'], f['nome']))
    por_tag = Counter(f['tag'] for f in funcoes)

    dados = {
        'fonte': 'CfgFunctions (config do jogo em execução)',
        'semDescricao': ('a descrição de cada função mora no cabeçalho do .sqf, '
                         'dentro do PBO — não no config. Ver scripts/arma3/pbo.py.'),
        'tags': [dict(t, funcoes=por_tag.get(t['classe'], 0)) for t in
                 sorted(tags.values(), key=lambda t: t['classe'])],
        'funcoes': funcoes,
    }

    resumo = {
        'tags': len(tags),
        'funções': len(funcoes),
        'categorias': len({(f['tag'], f['categoria']) for f in funcoes}),
        'com preInit': sum(1 for f in funcoes if f['preInit']),
        'com postInit': sum(1 for f in funcoes if f['postInit']),
        'maior tag': por_tag.most_common(1)[0] if por_tag else '—',
    }
    if placar and placar[1] != len(funcoes):
        print(f'  ! o jogo contou {placar[1]} funções e chegaram {len(funcoes)} — houve perda no log')

    salvar('arma3-funcoes.json', dados, resumo)


if __name__ == '__main__':
    main()
