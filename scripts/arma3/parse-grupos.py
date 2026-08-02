#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-grupos.sqf e monta a ORDEM DE BATALHA.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-grupos.sqf no debug console
    2. aqui:     python scripts/arma3/parse-grupos.py
    3. saída:    scripts/arma3/out/arma3-grupos.json

Sem argumento, acha sozinho o .rpt mais recente com um dump de grupos.

O QUE ESTE DADO RESPONDE, e nenhuma base existente responde: como as unidades se
ORGANIZAM. `CfgVehicles` (base de soldados) diz que existe um "Rifleman"; só
`CfgGroups` diz que um esquadrão de fuzileiros da NATO tem 1 líder, 2 fuzileiros,
1 auxiliar de metralhador, 1 paramédico — nessa ordem, e que a primeira unidade
da lista é quem comanda.

FORMATO lido (v1):
    F |lado|faccao|nome
    C |lado|faccao|categoria|nome
    G |id|lado|faccao|categoria|classe|nome
    GU|id|<unidades em pedaços>
    PLACAR|lados|grupos|unidades

Honestidade (regra da #398): todo valor vem do config do jogo em execução.
Campo vazio no dump = o config NÃO declara = `null`, nunca zero nem "".

O que NÃO existe no config, e por isso não aparece aqui:
  - efetivo "de doutrina". Um grupo do jogo é o que o config declara, que nem
    sempre bate com a organização real da força que ele representa. A base diz
    o que o Arma 3 tem; qualquer comparação com doutrina real é leitura de quem
    usa, não dado daqui.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, Pedacos, texto, salvar   # noqa: E402

MARCA = '<<A3GRUPO>>'


def parse_unidades(bruto):
    """A lista SQF `[[nome,tipo,rotulo,posto,posicao], …]` vira lista de dicts.

    O dump serializa com `str`, que dá sintaxe de array SQF — próxima de JSON
    mas com aspas simples. Convertido com `ast`, não com `eval`: o conteúdo vem
    de config de mod, ou seja, texto de terceiro.
    """
    import ast
    if not bruto:
        return []
    try:
        cru = ast.literal_eval(bruto.replace('"', "'"))
    except (ValueError, SyntaxError) as e:
        print(f'  ! lista de unidades ilegível ({e}) — provável truncamento no log')
        return []
    saida = []
    for i, u in enumerate(cru):
        if not isinstance(u, (list, tuple)) or len(u) < 5:
            continue
        nome, tipo, rotulo, posto, posicao = u[:5]
        saida.append({
            'ordem': i,
            'lider': i == 0,          # a primeira unidade do grupo é quem comanda
            'slot': texto(str(nome)),
            'classe': texto(str(tipo)),
            'nome': texto(str(rotulo)),
            'posto': texto(str(posto)),
            'posicao': None if posicao is None or posicao == -1 else int(posicao),
        })
    return saida


def main():
    caminho = achar_rpt(MARCA, 'dump-grupos.sqf')
    print(f'lendo {caminho}')

    faccoes = {}
    categorias = {}
    grupos = {}
    pedacos = Pedacos()
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'F' and len(campos) >= 3:
            faccoes[(campos[0], campos[1])] = texto(campos[2])
        elif tipo == 'C' and len(campos) >= 4:
            categorias[(campos[0], campos[1], campos[2])] = texto(campos[3])
        elif tipo == 'G' and len(campos) >= 6:
            grupos[campos[0]] = {
                'id': campos[0], 'lado': campos[1], 'faccao': campos[2],
                'categoria': campos[3], 'classe': campos[4], 'nome': texto(campos[5]),
                'unidades': [],
            }
        elif tipo == 'GU' and len(campos) >= 2:
            pedacos.add('GU', campos[0], '|'.join(campos[1:]))
        elif tipo == 'PLACAR' and len(campos) >= 3:
            placar = tuple(int(x) for x in campos[:3])

    if not grupos:
        raise SystemExit('o dump não trouxe grupo nenhum — o .sqf rodou até o fim?')

    for gid, g in grupos.items():
        g['unidades'] = parse_unidades(pedacos.get('GU', gid))
        g['efetivo'] = len(g['unidades'])
        g['nomeFaccao'] = faccoes.get((g['lado'], g['faccao']))
        g['nomeCategoria'] = categorias.get((g['lado'], g['faccao'], g['categoria']))

    vazios = [g['id'] for g in grupos.values() if not g['unidades']]
    if vazios:
        print(f'  ! {len(vazios)} grupo(s) sem unidade — ex.: {vazios[0]}')

    dados = {
        'fonte': 'CfgGroups (config do jogo em execução)',
        'lados': sorted({g['lado'] for g in grupos.values()}),
        'faccoes': [{'lado': k[0], 'classe': k[1], 'nome': v} for k, v in sorted(faccoes.items())],
        'grupos': sorted(grupos.values(), key=lambda g: g['id']),
    }

    total_unidades = sum(g['efetivo'] for g in grupos.values())
    resumo = {
        'lados': len(dados['lados']),
        'facções': len(faccoes),
        'grupos': len(grupos),
        'unidades somadas': total_unidades,
        'maior grupo': max(grupos.values(), key=lambda g: g['efetivo'])['id'] if grupos else '—',
    }
    if placar:
        # o jogo contou; se divergir, algo se perdeu entre o log e aqui
        if placar[1] != len(grupos) or placar[2] != total_unidades:
            print(f'  ! o jogo contou {placar[1]} grupos / {placar[2]} unidades, '
                  f'e chegaram {len(grupos)} / {total_unidades} — houve perda no log')

    salvar('arma3-grupos.json', dados, resumo)


if __name__ == '__main__':
    main()
