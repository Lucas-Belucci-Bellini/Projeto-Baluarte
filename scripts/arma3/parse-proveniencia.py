#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-proveniencia.sqf: quem é dono de cada coisa.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-proveniencia.sqf no debug console
    2. aqui:     python scripts/arma3/parse-proveniencia.py
    3. saída:    scripts/arma3/out/arma3-proveniencia.json

FORMATO lido (v1):
    P |addon|autor|nome|requiredVersion
    PR|addon|<requiredAddons em pedaços>
    PU|addon|<unidades em pedaços>
    PW|addon|<armas em pedaços>
    M |mod|nome|dir|autor|appId|cor|logo
    PLACAR|addons|mods

## O ÍNDICE INVERSO É O PONTO

Além de guardar os addons, este parser monta `donoDe`: classe → addon que a
REGISTRA. É o que resolve o problema que `gerar_base_armas_comum.py` hoje
contorna com um dicionário `DIR_DLC` escrito à mão.

Por que o dicionário à mão existe: o campo `fonte` do dump de armas é
`configSourceMod`, que diz quem patcheou a entrada por ÚLTIMO — com ACE
carregado, quase todo o vanilla aparece como sendo do ACE. Já `CfgPatches` diz
quem REGISTROU a classe, que é a pergunta certa.

Um dicionário à mão envelhece calado: DLC novo sai, o diretório dele não está na
lista, e as armas passam a mostrar origem errada sem ninguém perceber. Com este
índice a origem passa a ser derivada do jogo — que é a regra do projeto para
dado de armamento ("nunca é inventado, deriva-se").

Quando uma classe é registrada por mais de um addon (um mod que estende outro),
`donoDe` guarda TODOS, na ordem em que apareceram. Escolher um seria inventar
uma resposta que o config não dá.
"""

import ast
import os
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, Pedacos, texto, num, limpo, salvar  # noqa: E402

MARCA = '<<A3PROV>>'


def lista_sqf(bruto):
    if not bruto:
        return []
    try:
        v = ast.literal_eval(bruto.replace('"', "'"))
        return [str(x) for x in v] if isinstance(v, (list, tuple)) else []
    except (ValueError, SyntaxError):
        return []


def main():
    caminho = achar_rpt(MARCA, 'dump-proveniencia.sqf')
    print(f'lendo {caminho}')

    addons = {}
    mods = []
    pedacos = Pedacos()
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'P' and len(campos) >= 4:
            addons[campos[0]] = {
                'addon': campos[0], 'autor': texto(campos[1]), 'nome': texto(campos[2]),
                'versaoRequerida': limpo(num(campos[3])),
                'requer': [], 'unidades': [], 'armas': [],
            }
        elif tipo in ('PR', 'PU', 'PW') and len(campos) >= 2:
            pedacos.add(tipo, campos[0], '|'.join(campos[1:]))
        elif tipo == 'M' and len(campos) >= 7:
            mods.append({
                'mod': campos[0], 'nome': texto(campos[1]), 'dir': texto(campos[2]),
                'autor': texto(campos[3]), 'appId': limpo(num(campos[4])),
                'cor': lista_sqf(campos[5]) or None, 'logo': texto(campos[6]),
            })
        elif tipo == 'PLACAR' and len(campos) >= 2:
            placar = tuple(int(x) for x in campos[:2])

    if not addons:
        raise SystemExit('o dump não trouxe addon nenhum — o .sqf rodou até o fim?')

    for nome, a in addons.items():
        a['requer'] = lista_sqf(pedacos.get('PR', nome))
        a['unidades'] = lista_sqf(pedacos.get('PU', nome))
        a['armas'] = lista_sqf(pedacos.get('PW', nome))

    # índice inverso: classe -> addons que a registram
    dono_de = {}
    for a in addons.values():
        for classe in a['unidades'] + a['armas']:
            dono_de.setdefault(classe.lower(), []).append(a['addon'])

    disputadas = {c: d for c, d in dono_de.items() if len(d) > 1}
    if disputadas:
        exemplo = next(iter(disputadas.items()))
        print(f'  · {len(disputadas)} classe(s) registradas por mais de um addon '
              f'(mod estendendo outro) — ex.: {exemplo[0]} → {exemplo[1]}')

    # addon -> mod/DLC pelo prefixo do diretório declarado em CfgMods
    por_dir = {(m['dir'] or '').lower(): m for m in mods if m['dir']}

    dados = {
        'fonte': 'CfgPatches e CfgMods (config do jogo em execução)',
        'paraQueServe': ('`donoDe` mapeia classe → addon que a REGISTRA. É a resposta '
                         'certa para "de que DLC é isto", diferente de `configSourceMod`, '
                         'que diz quem patcheou por último (com ACE carregado, quase '
                         'todo o vanilla apareceria como do ACE).'),
        'mods': sorted(mods, key=lambda m: m['mod']),
        'addons': sorted(addons.values(), key=lambda a: a['addon']),
        'donoDe': {c: d for c, d in sorted(dono_de.items())},
    }

    autores = Counter(a['autor'] for a in addons.values() if a['autor'])
    resumo = {
        'addons': len(addons),
        'mods/DLCs': len(mods),
        'classes indexadas': len(dono_de),
        'com mais de um dono': len(disputadas),
        'autores distintos': len(autores),
        'maior autor': autores.most_common(1)[0] if autores else '—',
        'mods com diretório': len(por_dir),
    }
    if placar and placar[0] != len(addons):
        print(f'  ! o jogo contou {placar[0]} addons e chegaram {len(addons)} — perda no log')

    salvar('arma3-proveniencia.json', dados, resumo)


if __name__ == '__main__':
    main()
