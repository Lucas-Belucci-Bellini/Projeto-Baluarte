#!/usr/bin/env python3
"""
Gera o painel "estado da extração" da wiki: quanto foi tirado do jogo, medido.

    python scripts/arma3/gerar-base-extracao.py

Lê os dumps de `out/` e escreve `src/data/arma3-extracao.js`.

## Por que um gerador para meia dúzia de números

Porque digitados eles envelhecem calados. Este painel é a PROCEDÊNCIA da wiki
inteira — é o que sustenta a frase "os números são medidos no config". Se ele
disser 10.822 armas quando o dump tem outra coisa, a alegação de procedência
vira a primeira mentira da página.

Cada número aqui sai de `len()` no dump correspondente, e o arquivo carrega o
nome do `.rpt` de origem de cada um. Nada é estimado, nada é arredondado.

## O que NÃO está aqui

Contagem de coisa que ainda não tem gerador (veículos, soldados) aparece como
"extraído, ainda sem página" — porque é a verdade: o dado está no repo, a
tela não existe. Fingir que está publicado seria pior que admitir a fila.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import js_valor  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')
SAIDA = os.path.join(RAIZ, 'src', 'data', 'arma3-extracao.js')


def carregar(nome):
    p = os.path.join(OUT, nome)
    if not os.path.isfile(p):
        return None
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def main():
    cfg = carregar('arma3-config.json')
    itens = carregar('arma3-itens.json')
    veic = carregar('arma3-veiculos.json')
    mapas = carregar('arma3-mapas.json')
    acess = carregar('arma3-acessorios.json')
    anim = carregar('arma3-animacoes.json')
    imgs = carregar('armas-imagens.json')

    if not cfg:
        raise SystemExit('falta out/arma3-config.json — rode os dumps antes.')

    armas = cfg.get('armas') or {}
    mags = cfg.get('carregadores') or cfg.get('magazines') or {}
    ammo = cfg.get('municoes') or cfg.get('ammo') or {}

    # Balística completa = os TRÊS presentes: v0, airFriction e dano. Os nomes
    # são os do dump (`v0`, não `initSpeed`; `dano`, não `hit`) — errar o nome
    # devolve zero calado, que aqui viraria "0% do acervo tem balística" na
    # cara do leitor. Por isso o número é conferido contra o acervo abaixo.
    def tem(a, campo):
        return isinstance(a.get(campo), (int, float)) and not isinstance(a.get(campo), bool)

    completas = sum(1 for a in armas.values()
                    if tem(a, 'v0') and tem(a, 'airFriction') and tem(a, 'dano'))
    if armas and not completas:
        raise SystemExit(
            'nenhuma arma com v0+airFriction+dano — nome de campo errado no '
            'dump. Gerar 0 aqui publicaria "0% tem balística", que é mentira.')

    it = (itens or {}).get('itens') or {}
    porInfo = {}
    for v in it.values():
        t = v.get('itemInfoType')
        if t:
            porInfo[t] = porInfo.get(t, 0) + 1

    vlist = (veic or {}).get('veiculos') or {}
    soldados = (veic or {}).get('soldados') or {}

    blocos = [
        {
            'id': 'armamento',
            'titulo': 'Armamento',
            'rpt': cfg.get('fonte'),
            'linhas': [
                {'rot': 'armas no config', 'n': len(armas), 'nota': None},
                {'rot': 'com balística completa (v₀ + arrasto + dano)', 'n': completas,
                 'nota': f'{round(100 * completas / max(len(armas), 1))}% do acervo'},
                {'rot': 'carregadores', 'n': len(mags), 'nota': None},
                {'rot': 'munições', 'n': len(ammo), 'nota': None},
                {'rot': 'ícones extraídos do jogo (WebP)',
                 'n': len((imgs or {}).get('imagens') or (imgs or {})) if imgs else None,
                 'nota': 'convertidos de .paa com o Arma 3 Tools'},
            ],
        },
        {
            'id': 'equipamento',
            'titulo': 'Equipamento e acessórios',
            'rpt': (itens or {}).get('fonte'),
            'linhas': [
                {'rot': 'itens de inventário', 'n': len(it), 'nota': None},
                {'rot': 'miras (itemInfoType 201)', 'n': porInfo.get(201), 'nota': None},
                {'rot': 'lasers e lanternas (301)', 'n': porInfo.get(301), 'nota': None},
                {'rot': 'silenciadores (101)', 'n': porInfo.get(101), 'nota': None},
                {'rot': 'bipés e empunhaduras (302)', 'n': porInfo.get(302), 'nota': None},
                {'rot': 'óculos', 'n': len((itens or {}).get('oculos') or {}), 'nota': None},
                {'rot': 'mochilas', 'n': len((itens or {}).get('mochilas') or {}), 'nota': None},
            ],
        },
        {
            'id': 'terrenos',
            'titulo': 'Terrenos',
            'rpt': (mapas or {}).get('fonte'),
            'linhas': [
                {'rot': 'mundos em CfgWorlds', 'n': len((mapas or {}).get('mundos') or {}),
                 'nota': 'inclui os alias, que a wiki não repete'},
            ],
        },
        {
            'id': 'compatibilidade',
            'titulo': 'Compatibilidade de acessório',
            'rpt': (acess or {}).get('fonte'),
            'linhas': [
                {'rot': 'armas com slot mapeado',
                 'n': sum(1 for a in ((acess or {}).get('armas') or {}).values()
                          if (a.get('slots') or a.get('slotsVazios'))),
                 'nota': 'quais slots a arma TEM'},
                {'rot': 'grupos de compatibilidade',
                 'n': len((acess or {}).get('grupos') or {}),
                 'nota': 'o que encaixa só onde o config declara'},
            ],
        },
    ]

    # Veículos já têm tela — entram como bloco, não como fila.
    reais = sum(1 for x in vlist.values() if x.get('ehVeiculo'))
    blocos.append({
        'id': 'veiculos',
        'titulo': 'Veículos',
        'rpt': (veic or {}).get('fonte'),
        'linhas': [
            {'rot': 'registros em CfgVehicles', 'n': len(vlist),
             'nota': 'inclui parede, arbusto e marcador — não só veículo'},
            {'rot': 'veículos de verdade', 'n': reais, 'nota': 'os que a tabela mostra'},
            {'rot': 'com blindagem por parte',
             'n': sum(1 for x in vlist.values() if x.get('ehVeiculo') and x.get('hitpoints')),
             'nota': None},
            {'rot': 'facções', 'n': len((veic or {}).get('faccoes') or {}), 'nota': None},
        ],
    })

    # Extraído mas ainda sem tela — declarado como fila, não como entregue.
    fila = [
        {'rot': 'soldados', 'n': len(soldados) or None,
         'rpt': (veic or {}).get('fonte')},
        {'rot': 'animações e gestos',
         'n': len((anim or {}).get('animacoes') or (anim or {}).get('gestos') or {}) or None,
         'rpt': (anim or {}).get('fonte')},
    ]
    fila = [f for f in fila if f['n']]

    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-extracao.py).',
        ' *',
        ' * A PROCEDÊNCIA da wiki: quanto saiu do jogo, contado no dump, com o',
        ' * nome do .rpt de origem. Digitado à mão isto envelheceria calado — e',
        ' * é justamente o número que sustenta "os dados são medidos".',
        ' */',
        '',
        f'export const A3EXT_BLOCOS = {js_valor(blocos)};',
        '',
        '/* Extraído do jogo, mas ainda sem tela própria. Fica declarado como',
        ' * fila em vez de sumir: o dado está no repo, a página é que não existe. */',
        f'export const A3EXT_FILA = {js_valor(fila)};',
        '',
    ]
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('\n'.join(linhas))

    for b in blocos:
        print(f'{b["titulo"]}  ({b["rpt"]})')
        for l in b['linhas']:
            print(f'  {l["rot"]:48} {l["n"]}')
    if fila:
        print('\nextraído, ainda sem tela:')
        for f_ in fila:
            print(f'  {f_["rot"]:48} {f_["n"]}')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
