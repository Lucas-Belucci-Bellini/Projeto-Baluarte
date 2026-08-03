#!/usr/bin/env python3
"""Tenta virar os `.p3d` extraídos em `.glb` para o visor 3D do site.

    python scripts/arma3/converter-modelos.py --diagnostico   # SEMPRE comece aqui
    python scripts/arma3/converter-modelos.py --sonda         # testa 1 modelo
    python scripts/arma3/converter-modelos.py                 # converte o que der
    python scripts/arma3/converter-modelos.py --limite 50

## Leia isto antes de montar o Blender

O `.p3d` que o jogo distribui é quase sempre **ODOL** — binarizado antes de
empacotar. O importador do Arma Toolbox lê **MLOD**, o formato editável. Se o
acervo extraído for todo ODOL, montar o Blender não resolve nada, e é melhor
descobrir isso em dois segundos de `--diagnostico` do que depois de uma tarde.

`--diagnostico` lê só o cabeçalho de cada arquivo e dá a proporção. Não precisa
do Blender, nem do jogo, nem do Arma 3 Tools.

## Se houver MLOD

`--sonda` roda o Blender sem janela sobre UM modelo e relata o que aconteceu:
se o addon está instalado, se está ligado, que operador de importação existe, e
se a importação sem interface funciona. Muitos operadores de importação
dependem de contexto de janela e falham em `--background`; a sonda responde
isso para a sua máquina em vez de eu adivinhar daqui.

Só depois disso vale rodar em lote — que é retomável: `.glb` que já existe no
destino não é refeito.

## O visor já existe

`src/utils/visor-3d.js` é um visor three.js completo (GLTF + DRACO
self-hosted, OrbitControls, enquadramento automático, chunk lazy pela regra
#238). Ele abre `.glb` de uma URL — não é preciso escolher biblioteca nova.
"""

import json
import os
import shutil
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from p3d_formato import (                                       # noqa: E402
    CONVERTE, DESCONHECIDO, NAO_CONVERTE, listar_p3d, resumir)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ENTRADA = os.path.join(AQUI, 'out', 'modelos')
SAIDA = os.path.join(RAIZ, 'public', 'arma3', 'modelos')
SCRIPT_BLENDER = os.path.join(AQUI, 'blender_p3d_glb.py')
MARCA = '<<P3D>>'


def achar_blender():
    """O Blender do PATH, ou os lugares onde ele costuma se instalar."""
    do_path = shutil.which('blender')
    if do_path:
        return do_path
    candidatos = [os.environ.get('BLENDER', '')]
    for base in (r'C:\Program Files\Blender Foundation',
                 '/Applications/Blender.app/Contents/MacOS',
                 '/usr/bin', '/usr/local/bin'):
        if not os.path.isdir(base):
            continue
        for atual, _dirs, arqs in os.walk(base):
            for a in arqs:
                if a.lower() in ('blender', 'blender.exe'):
                    candidatos.append(os.path.join(atual, a))
            if atual.count(os.sep) - base.count(os.sep) > 2:
                _dirs[:] = []
    for c in candidatos:
        if c and os.path.isfile(c):
            return c
    return None


def diagnostico():
    """A pergunta que decide tudo: quanto do acervo é sequer convertível?"""
    arquivos = listar_p3d(ENTRADA)
    if not arquivos:
        print(f'nenhum .p3d em {os.path.relpath(ENTRADA, RAIZ)}')
        print('Rode antes: python scripts/arma3/extrair-modelos.py')
        return 1

    por_tipo, versoes = resumir(arquivos)
    n = len(arquivos)
    print(f'{n} modelo(s) extraído(s) em {os.path.relpath(ENTRADA, RAIZ)}\n')
    print(f'  {"MLOD (converte)":24s} {len(por_tipo[CONVERTE]):6d}')
    print(f'  {"ODOL (binarizado)":24s} {len(por_tipo[NAO_CONVERTE]):6d}')
    print(f'  {"desconhecido":24s} {len(por_tipo[DESCONHECIDO]):6d}')
    if versoes:
        print('\n  versões vistas: ' + ', '.join(
            f'{k} ×{v}' for k, v in sorted(versoes.items())))

    conv = len(por_tipo[CONVERTE])
    print()
    if conv == 0:
        print('Nenhum modelo é MLOD — TUDO que veio dos PBOs está binarizado.')
        print('O importador do Arma Toolbox lê MLOD, então o Blender não vai')
        print('resolver este acervo. Montar o Blender agora seria tempo perdido.')
        print()
        print('O que sobra, em ordem de honestidade:')
        print('  · modelar/obter os poucos modelos que importam de outra fonte;')
        print('  · pedir ao autor de um mod o MLOD original (mods costumam ter);')
        print('  · deixar o 3D de fora e investir nos ícones, que já funcionam.')
        return 0

    print(f'{conv} modelo(s) em MLOD — esses o Blender consegue.')
    print('Próximo passo: python scripts/arma3/converter-modelos.py --sonda')
    return 0


def rodar_blender(blender, limite, so_mlod=True):
    """Chama o Blender sem janela e devolve os eventos que ele emitiu."""
    entrada = ENTRADA
    if so_mlod:
        arquivos = listar_p3d(ENTRADA)
        por_tipo, _ = resumir(arquivos)
        if not por_tipo[CONVERTE]:
            print('nenhum MLOD para converter — rode --diagnostico')
            return None
        # aponta o Blender para uma pasta só com o que dá para converter,
        # em vez de fazê-lo abrir e falhar em milhares de ODOL
        entrada = os.path.join(AQUI, 'out', 'modelos-mlod')
        os.makedirs(entrada, exist_ok=True)
        for c in por_tipo[CONVERTE]:
            atalho = os.path.join(entrada, os.path.basename(c))
            if not os.path.exists(atalho):
                shutil.copy2(c, atalho)

    cmd = [blender, '--background', '--factory-startup',
           '--python', SCRIPT_BLENDER, '--',
           '--entrada', entrada, '--saida', SAIDA]
    if limite:
        cmd += ['--limite', str(limite)]

    print(f'$ {" ".join(cmd[:3])} … --limite {limite or "sem"}\n')
    r = subprocess.run(cmd, capture_output=True, text=True)

    eventos = []
    for linha in (r.stdout or '').splitlines():
        i = linha.find(MARCA)
        if i < 0:
            continue
        try:
            eventos.append(json.loads(linha[i + len(MARCA):]))
        except json.JSONDecodeError:
            pass
    if not eventos:
        print('O Blender não emitiu nenhum evento nosso. Saída bruta (fim):')
        print((r.stderr or r.stdout or '')[-800:])
    return eventos


def relatar(eventos):
    if eventos is None:
        return 1
    for e in eventos:
        t = e.get('tipo')
        if t == 'blender':
            print(f'  Blender {e["versao"]}')
        elif t == 'addons':
            print(f'  addons ligados: {e["ligados"] or "NENHUM"}')
            if e['candidatos'] and not e['ligados']:
                print(f'    (candidatos vistos: {e["candidatos"]})')
        elif t == 'importadores':
            print(f'  operadores de importação: {e["achados"] or "NENHUM"}')
        elif t == 'escolhido':
            print(f'  usando {e["operador"]} em {e["arquivos"]} arquivo(s)\n')
        elif t == 'convertido':
            print(f'  ✓ {e["arquivo"]} — {e["bytes"] / 1024:.0f} kB')
        elif t == 'falhou':
            print(f'  ✗ {e["arquivo"]}: {e["erro"]}')
        elif t in ('sem-importador', 'sem-blender', 'sem-entrada'):
            print(f'\n  ! {e.get("erro") or t}')
        elif t == 'placar':
            print(f'\n  {e["convertidos"]} convertidos · {e["falharam"]} falharam '
                  f'· {e["ja_tinha"]} já existiam')
    return 0


def main():
    argv = sys.argv[1:]
    if '--diagnostico' in argv or not os.path.isdir(ENTRADA):
        return diagnostico()

    blender = achar_blender()
    if not blender:
        print('Blender não encontrado.')
        print('Instale-o, ou aponte a variável BLENDER para o executável.')
        print('Antes disso, rode --diagnostico: talvez nem precise.')
        return 1
    print(f'Blender: {blender}')

    if '--sonda' in argv:
        print('SONDA — um modelo só, para ver se o caminho existe nesta máquina\n')
        return relatar(rodar_blender(blender, 1))

    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 0
    return relatar(rodar_blender(blender, limite))


if __name__ == '__main__':
    sys.exit(main())
