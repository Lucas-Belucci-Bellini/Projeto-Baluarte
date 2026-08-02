#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-terreno-fisico.sqf: superfícies, vegetação e clima.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-terreno-fisico.sqf no debug console
    2. aqui:     python scripts/arma3/parse-terreno-fisico.py
    3. saída:    scripts/arma3/out/arma3-terreno-fisico.json

FORMATO lido (v1):
    S  |classe|arquivos|aspero|coefVelocidade|somAmbiente|somBater|poeira|impacto|personagem
    SC |classe|probabilidade|densidade
    SCO|classe|<objetos em pedaços>
    W  |classe|nome
    WP |classe|<parametros em pedaços>
    PLACAR|superficies|personagens|clima

`coefVelocidade` (maxSpeedCoef) é o dado com uso mais direto: é o multiplicador
de velocidade máxima naquela superfície. 1 = terreno livre; abaixo disso freia.
Ausente significa "o config não declara", e o jogo então usa o padrão da classe
pai — NÃO significa 1. Por isso fica `null` e não 1: quem calcular tempo de
deslocamento precisa saber a diferença.
"""

import ast
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, Pedacos, texto, num, limpo, salvar  # noqa: E402

MARCA = '<<A3CHAO>>'


def lista_sqf(bruto):
    """Array SQF serializado com `str` vira lista Python.

    `ast.literal_eval` e não `eval`: o conteúdo vem de config de mod, ou seja,
    texto de terceiro.
    """
    if not bruto:
        return []
    try:
        return ast.literal_eval(bruto.replace('"', "'"))
    except (ValueError, SyntaxError):
        return []


def main():
    caminho = achar_rpt(MARCA, 'dump-terreno-fisico.sqf')
    print(f'lendo {caminho}')

    superficies, caracteres, climas = [], {}, {}
    pedacos = Pedacos()
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'S' and len(campos) >= 9:
            superficies.append({
                'classe': campos[0],
                'arquivos': texto(campos[1]),
                'aspereza': limpo(num(campos[2])),
                'coefVelocidade': limpo(num(campos[3])),   # null ≠ 1 — ver docstring
                'somAmbiente': texto(campos[4]),
                'somImpacto': texto(campos[5]),
                'poeira': texto(campos[6]),
                'impacto': texto(campos[7]),
                'personagem': texto(campos[8]),
            })
        elif tipo == 'SC' and len(campos) >= 3:
            caracteres[campos[0]] = {
                'classe': campos[0],
                'probabilidade': lista_sqf(campos[1]),
                'densidade': limpo(num(campos[2])),
                'objetos': [],
            }
        elif tipo == 'W' and len(campos) >= 2:
            climas[campos[0]] = {'classe': campos[0], 'nome': texto(campos[1]), 'parametros': {}}
        elif tipo in ('SCO', 'WP') and len(campos) >= 2:
            pedacos.add(tipo, campos[0], '|'.join(campos[1:]))
        elif tipo == 'PLACAR' and len(campos) >= 3:
            placar = tuple(int(x) for x in campos[:3])

    if not superficies:
        raise SystemExit('o dump não trouxe superfície nenhuma — o .sqf rodou até o fim?')

    for nome, c in caracteres.items():
        c['objetos'] = [str(o) for o in lista_sqf(pedacos.get('SCO', nome))]

    for nome, w in climas.items():
        w['parametros'] = {str(k): v for k, v in lista_sqf(pedacos.get('WP', nome))}

    # Liga superfície ↔ vegetação: `character` aponta para uma classe de
    # CfgSurfaceCharacters. Apontar para algo que não existe é dado quebrado do
    # config — vale avisar em vez de deixar o elo morto passar.
    orfas = [s['classe'] for s in superficies
             if s['personagem'] and s['personagem'] not in caracteres
             and s['personagem'].lower() != 'empty']
    if orfas:
        print(f'  ! {len(orfas)} superfície(s) apontam para vegetação inexistente — ex.: {orfas[0]}')

    dados = {
        'fonte': 'CfgSurfaces, CfgSurfaceCharacters, CfgWeather (jogo em execução)',
        'superficies': sorted(superficies, key=lambda s: s['classe']),
        'vegetacao': sorted(caracteres.values(), key=lambda c: c['classe']),
        'clima': sorted(climas.values(), key=lambda w: w['classe']),
    }

    com_coef = [s for s in superficies if s['coefVelocidade'] is not None]
    resumo = {
        'superfícies': len(superficies),
        'declaram coef. de velocidade': len(com_coef),
        'mais lenta': min(com_coef, key=lambda s: s['coefVelocidade'])['classe'] if com_coef else '—',
        'vegetação': len(caracteres),
        'climas': len(climas),
    }
    if placar and placar[0] != len(superficies):
        print(f'  ! o jogo contou {placar[0]} superfícies e chegaram {len(superficies)} — perda no log')

    salvar('arma3-terreno-fisico.json', dados, resumo)


if __name__ == '__main__':
    main()
