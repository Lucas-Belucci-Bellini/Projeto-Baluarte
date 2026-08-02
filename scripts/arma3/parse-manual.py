#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-manual.sqf e monta o Manual de Campo.

Fluxo (parte LOCAL — precisa do jogo aberto):
    1. no jogo:  cole scripts/arma3/dump-manual.sqf no debug console
    2. aqui:     python scripts/arma3/parse-manual.py
    3. saída:    scripts/arma3/out/arma3-manual.json

FORMATO lido (v1):
    C |categoria|nome
    H |id|categoria|classe|titulo|imagem
    HT|id|<texto em pedaços>
    HA|id|<argumentos em pedaços>
    PLACAR|categorias|topicos

LICENÇA — importante e não é detalhe: o texto é da Bohemia Interactive. Esta base
existe para CONSULTA e a tela que exibir precisa creditar a fonte, do mesmo jeito
que o Centro Militar credita a Wikipédia. `dados['licenca']` viaja junto com o
conteúdo justamente para que não se perca no caminho até a tela.
"""

import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, Pedacos, texto, salvar   # noqa: E402

MARCA = '<<A3MANUAL>>'

# O texto do manual traz marcações do jogo (%1, teclas entre <>) que só fazem
# sentido com o contexto da tela. Mantidas CRUAS: quem exibir decide o que fazer
# com elas. Limpar aqui seria decidir pela tela e perder informação.
TAG_TECLA = re.compile(r'<[^>]{1,40}>')


def main():
    caminho = achar_rpt(MARCA, 'dump-manual.sqf')
    print(f'lendo {caminho}')

    categorias = {}
    topicos = {}
    pedacos = Pedacos()
    placar = None

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'C' and len(campos) >= 2:
            categorias[campos[0]] = texto(campos[1])
        elif tipo == 'H' and len(campos) >= 5:
            topicos[campos[0]] = {
                'id': campos[0], 'categoria': campos[1], 'classe': campos[2],
                'titulo': texto(campos[3]), 'imagem': texto(campos[4]),
            }
        elif tipo in ('HT', 'HA') and len(campos) >= 2:
            pedacos.add(tipo, campos[0], '|'.join(campos[1:]))
        elif tipo == 'PLACAR' and len(campos) >= 2:
            placar = tuple(int(x) for x in campos[:2])

    if not topicos:
        raise SystemExit('o dump não trouxe tópico nenhum — o .sqf rodou até o fim?')

    for tid, t in topicos.items():
        t['texto'] = texto(pedacos.get('HT', tid))
        t['argumentos'] = texto(pedacos.get('HA', tid))
        t['nomeCategoria'] = categorias.get(t['categoria'])
        t['temTeclas'] = bool(t['texto'] and TAG_TECLA.search(t['texto']))

    sem_texto = [t['id'] for t in topicos.values() if not t['texto']]
    if sem_texto:
        print(f'  ! {len(sem_texto)} tópico(s) sem texto — ex.: {sem_texto[0]}')

    dados = {
        'fonte': 'CfgHints (Field Manual do jogo em execução)',
        'licenca': ('Texto © Bohemia Interactive. Guardado para consulta; a tela '
                    'que exibir precisa creditar a fonte.'),
        'categorias': [{'classe': k, 'nome': v,
                        'topicos': sum(1 for t in topicos.values() if t['categoria'] == k)}
                       for k, v in sorted(categorias.items())],
        'topicos': sorted(topicos.values(), key=lambda t: t['id']),
    }

    resumo = {
        'categorias': len(categorias),
        'tópicos': len(topicos),
        'com texto': sum(1 for t in topicos.values() if t['texto']),
        'com imagem': sum(1 for t in topicos.values() if t['imagem']),
        'citam tecla': sum(1 for t in topicos.values() if t['temTeclas']),
    }
    if placar and placar[1] != len(topicos):
        print(f'  ! o jogo contou {placar[1]} tópicos e chegaram {len(topicos)} — houve perda no log')

    salvar('arma3-manual.json', dados, resumo)


if __name__ == '__main__':
    main()
