#!/usr/bin/env python3
"""Lê o dump-icones e escreve `out/arma3-icones.json`.

Este dump é diferente dos outros seis: ele não descreve uma família de coisas,
descreve o INVENTÁRIO de imagens do config inteiro. Os outros dumps varrem
árvores nomeadas (`CfgWeapons`, `CfgVehicles`, `CfgGlasses`) com lista de campo
fixa; ícone que more em qualquer outra classe é invisível para eles.

Formato:
    I|id|caminho              imagem distinta, numerada na ordem em que apareceu
    R|classe|propriedade|id   "esta classe declara este retrato"
    ANDAMENTO|classes|imagens|segundos
    PLACAR|classes|imagens|retratos

O `id` existe para a linha `R` não repetir o caminho inteiro: o mesmo `.paa` é
declarado por milhares de classes, e repetir o texto multiplicaria o `.rpt` por
uma ordem de grandeza sem acrescentar nada.

⚠️ O que este dump NÃO responde: qual imagem cada classe EFETIVAMENTE usa. Ele
lê só as propriedades que a classe DECLARA (`configProperties` sem herança), e
no Arma 3 a maioria dos itens herda o `picture` do pai. Quem resolve herança é
`getText (_c >> "picture")`, que os dumps específicos já fazem. Aqui a pergunta
é outra: "que imagens existem", que é o que a extração precisa saber.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from a3dump_comum import achar_rpt, registros, salvar                # noqa: E402

MARCA = '<<A3ICO>>'


def main():
    caminho = achar_rpt(MARCA, 'dump-icones.sqf')
    print(f'lendo {caminho}')

    imagens = {}          # id -> caminho
    retratos = {}         # classe -> {propriedade: id}
    placar = None
    fora_de_ordem = 0

    for tipo, campos in registros(caminho, MARCA):
        if tipo == 'I' and len(campos) >= 2:
            ident, alvo = campos[0], '|'.join(campos[1:])
            if ident in imagens and imagens[ident] != alvo:
                # o mesmo id apontando pra dois caminhos = duas sessões de dump
                # misturadas no mesmo .rpt. Silenciar isso embaralharia tudo.
                fora_de_ordem += 1
            imagens[ident] = alvo

        elif tipo == 'R' and len(campos) >= 3:
            classe, prop, ident = campos[0], campos[1], campos[2]
            retratos.setdefault(classe, {})[prop] = ident

        elif tipo == 'PLACAR' and len(campos) >= 3:
            placar = {'classes': campos[0], 'imagens': campos[1], 'retratos': campos[2]}

    if fora_de_ordem:
        raise SystemExit(
            f'{fora_de_ordem} id(s) de imagem apontando para caminhos diferentes.\n'
            f'Isso acontece quando DUAS execuções do dump caem no mesmo .rpt.\n'
            f'Feche o jogo, apague o .rpt e rode o dump uma vez só.')

    if not imagens:
        raise SystemExit(
            f'nenhuma imagem no dump. Cole scripts/arma3/dump-icones.sqf no '
            f'debug console e rode de novo.')

    # o id é sequencial na origem; sem buracos, a numeração fecha
    ids = sorted(int(i) for i in imagens)
    buracos = [i for i in range(len(ids)) if i not in set(ids)]
    if buracos:
        print(f'  ! {len(buracos)} id(s) faltando entre 0 e {ids[-1]} — '
              f'linha perdida no log. Ex.: {buracos[:5]}')

    # `retratos` guarda id para o .rpt não repetir o caminho milhares de vezes.
    # `porClasse` desfaz isso: é a forma que `imagens_catalogo.py` sabe ler, e
    # ter as duas evita que cada consumidor refaça a resolução por conta.
    por_classe = {
        classe: {prop: imagens[i] for prop, i in props.items() if i in imagens}
        for classe, props in sorted(retratos.items())
    }

    dados = {
        'fonte': os.path.basename(caminho),
        'imagens': [imagens[str(i)] for i in ids if str(i) in imagens],
        'retratos': dict(sorted(retratos.items())),
        'porClasse': por_classe,
    }

    if placar:
        esperado = int(placar['imagens'])
        if esperado != len(dados['imagens']):
            print(f'  ! o jogo contou {esperado} imagens, chegaram '
                  f'{len(dados["imagens"])} — {esperado - len(dados["imagens"])} '
                  f'se perderam no caminho.')
        esperado_r = int(placar['retratos'])
        chegou_r = sum(len(v) for v in retratos.values())
        if esperado_r != chegou_r:
            print(f'  ! o jogo contou {esperado_r} retratos, chegaram {chegou_r}.')

    por_prop = {}
    for props in retratos.values():
        for p in props:
            por_prop[p] = por_prop.get(p, 0) + 1

    salvar('arma3-icones.json', dados, {
        'imagens distintas': len(dados['imagens']),
        'classes com retrato': len(retratos),
        'classes varridas pelo jogo': placar['classes'] if placar else '?',
        'propriedades': ', '.join(f'{k}={v}' for k, v in
                                  sorted(por_prop.items(), key=lambda x: -x[1])[:6]),
    })


if __name__ == '__main__':
    main()
