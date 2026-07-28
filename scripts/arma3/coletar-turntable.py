#!/usr/bin/env python3
"""
Recolhe os quadros que o scripts/arma3/turntable.sqf gerou e prepara pra web.

    1. no jogo:  cole scripts/arma3/turntable.sqf e DESPAUSE
    2. aqui:     python scripts/arma3/coletar-turntable.py
    3. saída:    public/arma3/3d/<classe>/<NN>.webp
                 scripts/arma3/out/turntable.json

ONDE O JOGO GRAVA: o comando `screenshot` do Arma 3 NÃO escreve na pasta de
instalação. Ele escreve em `<pasta de perfis>/<perfil>/Screenshots/`, ex.:
    Documents/Arma 3 - Other Profiles/GHOST/Screenshots/a3tt_arifle_MX_F_0.png
Isso custou uma busca pra descobrir, então fica anotado aqui e no README.

POR QUE PROCESSA: o `screenshot` salva a tela INTEIRA, sem recorte. Cada quadro
sai a 1920x1080 e ~12 MB — 24 quadros de um único objeto passam de 250 MB, o que
é inviável pra web e pro git. Este script recorta o centro (a câmera do
turntable aponta pro objeto, então ele está centralizado) e reduz pra WebP.

LIMITE HONESTO: o recorte é geométrico, não por detecção de objeto. O fundo é o
mundo do jogo (terreno, horizonte, céu), não um fundo limpo — não existe canal
alfa pra recortar por silhueta. Para fundo limpo, o turntable precisa pôr o
objeto alto o bastante pra só haver céu atrás.
"""

import glob
import json
import os
import sys

try:
    from PIL import Image
except ImportError:
    raise SystemExit('este script precisa do Pillow: pip install Pillow')

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DESTINO = os.path.join(RAIZ, 'public', 'arma3', '3d')
INDICE = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'turntable.json')

PREFIXO = 'a3tt'
LADO = 512          # lado final do quadro, em pixels
FRACAO = 0.55       # quanto da ALTURA da tela entra no recorte central
QUALIDADE = 82

# Onde o Arma 3 guarda os perfis (e, dentro deles, os Screenshots)
PERFIS = [
    os.path.join(os.path.expanduser('~'), 'Documents', 'Arma 3 - Other Profiles'),
    os.path.join(os.path.expanduser('~'), 'Documents', 'Arma 3'),
]


def achar_quadros():
    """Devolve {classe: [caminhos ordenados por índice]}."""
    achados = []
    for base in PERFIS:
        if not os.path.isdir(base):
            continue
        achados += glob.glob(os.path.join(base, '*', 'Screenshots', PREFIXO + '_*.png'))
        achados += glob.glob(os.path.join(base, 'Screenshots', PREFIXO + '_*.png'))

    grupos = {}
    for caminho in achados:
        nome = os.path.splitext(os.path.basename(caminho))[0]
        resto = nome[len(PREFIXO) + 1:]
        if '_' not in resto:
            continue                       # ex.: a3tt_probe (a sonda do .sqf)
        classe, _, indice = resto.rpartition('_')
        if not classe or not indice.isdigit():
            continue
        grupos.setdefault(classe, []).append((int(indice), caminho))

    return {c: [p for _i, p in sorted(v)] for c, v in sorted(grupos.items())}


def processar(caminho, alvo):
    """Recorta o centro e grava em WebP. Devolve (bytes_antes, bytes_depois)."""
    antes = os.path.getsize(caminho)
    with Image.open(caminho) as im:
        im = im.convert('RGB')
        largura, altura = im.size
        lado = int(altura * FRACAO)
        esq = (largura - lado) // 2
        topo = (altura - lado) // 2
        im = im.crop((esq, topo, esq + lado, topo + lado))
        im = im.resize((LADO, LADO), Image.LANCZOS)
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        im.save(alvo, 'WEBP', quality=QUALIDADE, method=5)
    return antes, os.path.getsize(alvo)


def main():
    apenas = sys.argv[1:] or None
    grupos = achar_quadros()

    if not grupos:
        raise SystemExit(
            'nenhum quadro do turntable encontrado.\n'
            'Rode o scripts/arma3/turntable.sqf no jogo (DESPAUSADO) primeiro.\n'
            'Os PNG saem em <pasta de perfis>/<perfil>/Screenshots/.')

    if apenas:
        grupos = {c: v for c, v in grupos.items() if c in apenas}
        if not grupos:
            raise SystemExit(f'nenhuma dessas classes tem quadros: {", ".join(apenas)}')

    objetos = {}
    total_antes = total_depois = 0

    for classe, quadros in grupos.items():
        pasta = os.path.join(DESTINO, classe)
        for i, origem in enumerate(quadros):
            alvo = os.path.join(pasta, f'{i:02d}.webp')
            a, d = processar(origem, alvo)
            total_antes += a
            total_depois += d
        objetos[classe] = {
            'quadros': len(quadros),
            'lado': LADO,
            'caminho': f'/arma3/3d/{classe}',
        }
        print(f'  {classe:28} {len(quadros):>3} quadros')

    os.makedirs(os.path.dirname(INDICE), exist_ok=True)
    with open(INDICE, 'w', encoding='utf-8') as f:
        json.dump({'objetos': objetos, 'lado': LADO, 'fracaoRecorte': FRACAO},
                  f, ensure_ascii=False, indent=1)

    mb = 1048576.0
    print(f'\nobjetos ........ {len(objetos)}')
    print(f'quadros ........ {sum(o["quadros"] for o in objetos.values())}')
    print(f'PNG de entrada . {total_antes / mb:.1f} MB')
    print(f'WebP de saída .. {total_depois / mb:.2f} MB '
          f'({100 - int(100 * total_depois / max(total_antes, 1))}% menor)')
    print(f'\nescrito: {DESTINO}')
    print(f'         {INDICE}')

    incompletos = [c for c, o in objetos.items() if o['quadros'] < 24]
    if incompletos:
        print(f'\n  ATENÇÃO: menos de 24 quadros em {", ".join(incompletos)} — '
              f'o turntable pode não ter terminado o giro desses.')


if __name__ == '__main__':
    main()
