#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-simbologia.sqf: marcadores, cores, patentes e
insígnias.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-simbologia.sqf no debug console
    2. aqui:     python scripts/arma3/parse-simbologia.py
    3. saída:    scripts/arma3/out/arma3-simbologia.json

FORMATO lido (v1):
    M |classe|nome|icone|cor|tamanho|escopo|sombra
    MC|classe|nome|r|g|b|a
    R |classe|nome|textura
    I |classe|nome|textura|autor
    PLACAR|marcadores|cores|patentes|insignias

Honestidade (regra da #398): campo vazio no dump = o config não declara = `null`.
Aqui isso é mais do que preciosismo — `size` e `scope` valem ZERO legitimamente
(escopo 0 = objeto escondido do editor), então tratar ausente como zero
inverteria o sentido: "não declarado" viraria "escondido de propósito".
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, texto, num, limpo, inteiro, salvar  # noqa: E402

MARCA = '<<A3SIMB>>'


def main():
    caminho = achar_rpt(MARCA, 'dump-simbologia.sqf')
    print(f'lendo {caminho}')

    marcadores, cores, patentes, insignias = [], [], [], []
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'M' and len(campos) >= 7:
            marcadores.append({
                'classe': campos[0], 'nome': texto(campos[1]),
                'icone': texto(campos[2]), 'cor': texto(campos[3]),
                'tamanho': limpo(num(campos[4])),
                'escopo': inteiro(campos[5]),
                'sombra': inteiro(campos[6]),
            })
        elif tipo == 'MC' and len(campos) >= 6:
            rgba = [limpo(num(c)) for c in campos[2:6]]
            cores.append({
                'classe': campos[0], 'nome': texto(campos[1]),
                # só vira cor se os quatro canais forem numéricos: no config a
                # cor pode ser uma expressão do jogo, e meia cor não é cor
                'rgba': rgba if all(c is not None for c in rgba) else None,
                'hex': _hex(rgba) if all(c is not None for c in rgba) else None,
            })
        elif tipo == 'R' and len(campos) >= 3:
            patentes.append({'classe': campos[0], 'nome': texto(campos[1]),
                             'textura': texto(campos[2])})
        elif tipo == 'I' and len(campos) >= 4:
            insignias.append({'classe': campos[0], 'nome': texto(campos[1]),
                              'textura': texto(campos[2]), 'autor': texto(campos[3])})
        elif tipo == 'PLACAR' and len(campos) >= 4:
            placar = tuple(int(x) for x in campos[:4])

    if not marcadores and not patentes:
        raise SystemExit('o dump não trouxe nada — o .sqf rodou até o fim?')

    dados = {
        'fonte': 'CfgMarkers, CfgMarkerColors, CfgRanks, CfgUnitInsignia (jogo em execução)',
        'marcadores': sorted(marcadores, key=lambda m: m['classe']),
        'cores': sorted(cores, key=lambda c: c['classe']),
        'patentes': patentes,          # ordem do config = hierarquia; NÃO ordenar
        'insignias': sorted(insignias, key=lambda i: i['classe']),
    }

    resumo = {
        'marcadores': len(marcadores),
        'visíveis no editor': sum(1 for m in marcadores if (m['escopo'] or 0) >= 2),
        'cores': len(cores),
        'cores com RGBA': sum(1 for c in cores if c['rgba']),
        'patentes': len(patentes),
        'insígnias': len(insignias),
    }
    if placar:
        real = (len(marcadores), len(cores), len(patentes), len(insignias))
        if placar != real:
            print(f'  ! o jogo contou {placar} e chegaram {real} — houve perda no log')

    salvar('arma3-simbologia.json', dados, resumo)


def _hex(rgba):
    """RGBA 0–1 vira #RRGGBB. O alfa fica de fora: cor de marcador é opaca na
    legenda, e embutir alfa no hex faria a legenda mostrar cor errada.

    `int(x + 0.5)` e NÃO `round()`: o `round` do Python arredonda meio para o
    PAR (bancário), então 0,3 × 255 = 76,5 vira 76, enquanto navegador e
    ferramenta de cor dão 77. Um canal de diferença ninguém enxerga, mas quem
    conferir nosso hex contra outra ferramenta veria divergência e concluiria
    que a base está errada.
    """
    r, g, b = (max(0, min(255, int((c or 0) * 255 + 0.5))) for c in rgba[:3])
    return f'#{r:02x}{g:02x}{b:02x}'


if __name__ == '__main__':
    main()
