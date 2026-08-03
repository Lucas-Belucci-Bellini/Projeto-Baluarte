#!/usr/bin/env python3
"""Roda DENTRO do Blender, sem janela, para virar .p3d em .glb.

    blender --background --python scripts/arma3/blender_p3d_glb.py -- \\
            --entrada out/modelos --saida public/arma3/modelos --limite 5

Não é chamado à mão: `converter-modelos.py` monta a linha e lê a saída.

## Por que ele PROCURA o operador em vez de chamar pelo nome

O importador vem do addon **Arma Toolbox** (Alwarren), que não é meu, muda de
versão e já mudou de nome de operador. Fixar `bpy.ops.import_scene.armap3d` e
errar produziria `AttributeError` — uma mensagem que não diz se o addon falta,
se está desligado, ou se só mudou de nome.

Então este script varre `bpy.ops` atrás de qualquer operador de importação que
mencione p3d/arma/mlod, e **relata o que encontrou**. Se não achar nada, diz
isso com todas as letras em vez de estourar. O diagnóstico vale mais do que a
tentativa: com ele o operador sabe se instala o addon, se liga o addon, ou se o
caminho está fechado.

## A saída é JSON, uma linha por modelo

O Blender escreve muito lixo em stdout (avisos de driver, de versão de arquivo,
de material). Cada linha nossa vai prefixada com `<<P3D>>` para o orquestrador
achar as dela sem depender de o Blender ficar quieto — mesma ideia da marca nos
dumps do jogo.
"""

import json
import os
import sys
import traceback

MARCA = '<<P3D>>'


def diga(tipo, **campos):
    campos['tipo'] = tipo
    print(MARCA + json.dumps(campos, ensure_ascii=False), flush=True)


def argumentos():
    """Só o que vem depois de `--`; antes disso são argumentos do Blender."""
    argv = sys.argv
    if '--' not in argv:
        return {}
    argv = argv[argv.index('--') + 1:]
    saida = {}
    i = 0
    while i < len(argv):
        if argv[i].startswith('--') and i + 1 < len(argv):
            saida[argv[i][2:]] = argv[i + 1]
            i += 2
        else:
            i += 1
    return saida


def ligar_addons():
    """Tenta habilitar o Arma Toolbox pelos nomes de módulo que ele já usou."""
    import addon_utils
    ligados, tentados = [], []
    for mod in addon_utils.modules():
        nome = getattr(mod, '__name__', '')
        if any(t in nome.lower() for t in ('arma', 'a3ob', 'p3d')):
            tentados.append(nome)
            try:
                addon_utils.enable(nome, default_set=False, persistent=False)
                ligados.append(nome)
            except Exception as err:
                diga('addon-falhou', modulo=nome, erro=str(err)[:200])
    return ligados, tentados


def achar_importador():
    """[nomes de operador] que parecem importar .p3d, em ordem de aposta."""
    import bpy
    achados = []
    for grupo in dir(bpy.ops):
        if grupo.startswith('_'):
            continue
        try:
            ops = getattr(bpy.ops, grupo)
            nomes = dir(ops)
        except Exception:
            continue
        for nome in nomes:
            cheio = f'{grupo}.{nome}'
            baixo = cheio.lower()
            if 'p3d' in baixo or ('arma' in baixo and 'import' in baixo):
                achados.append(cheio)
    # importadores explícitos primeiro
    achados.sort(key=lambda n: (0 if 'import' in n.lower() else 1, n))
    return achados


def limpar_cena():
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)


def converter(caminho_p3d, destino_glb, operador):
    import bpy
    limpar_cena()

    grupo, nome = operador.split('.', 1)
    op = getattr(getattr(bpy.ops, grupo), nome)
    op(filepath=caminho_p3d)

    if not bpy.context.scene.objects:
        raise RuntimeError('o importador rodou mas a cena ficou vazia')

    os.makedirs(os.path.dirname(destino_glb), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=destino_glb,
        export_format='GLB',
        export_apply=True,
        use_selection=False)

    if not os.path.isfile(destino_glb) or os.path.getsize(destino_glb) == 0:
        raise RuntimeError('o exportador não gerou arquivo')
    return os.path.getsize(destino_glb)


def main():
    args = argumentos()
    entrada = args.get('entrada')
    saida = args.get('saida')
    limite = int(args.get('limite', 0))

    try:
        import bpy                                              # noqa: F401
    except ImportError:
        diga('sem-blender', erro='isto precisa rodar dentro do Blender')
        return 2

    import bpy
    diga('blender', versao='.'.join(str(x) for x in bpy.app.version))

    ligados, tentados = ligar_addons()
    diga('addons', ligados=ligados, candidatos=tentados)

    operadores = achar_importador()
    diga('importadores', achados=operadores)

    if not operadores:
        diga('sem-importador', erro=(
            'nenhum operador de importação de .p3d foi encontrado. '
            'O addon Arma Toolbox (Alwarren) provavelmente não está instalado '
            'neste Blender. Instale-o e rode de novo.'))
        return 3

    if not entrada or not os.path.isdir(entrada):
        diga('sem-entrada', caminho=str(entrada))
        return 4

    arquivos = sorted(a for a in os.listdir(entrada) if a.lower().endswith('.p3d'))
    if limite:
        arquivos = arquivos[:limite]

    operador = operadores[0]
    diga('escolhido', operador=operador, arquivos=len(arquivos))

    ok = falhou = pulou = 0
    for arq in arquivos:
        origem = os.path.join(entrada, arq)
        destino = os.path.join(saida, os.path.splitext(arq)[0] + '.glb')
        if os.path.isfile(destino) and os.path.getsize(destino) > 0:
            pulou += 1
            continue
        try:
            tam = converter(origem, destino, operador)
            ok += 1
            diga('convertido', arquivo=arq, bytes=tam)
        except Exception as err:
            falhou += 1
            diga('falhou', arquivo=arq, erro=str(err)[:300],
                 traco=traceback.format_exc(limit=2)[-400:])

    diga('placar', convertidos=ok, falharam=falhou, ja_tinha=pulou)
    return 0 if ok or pulou else 5


if __name__ == '__main__':
    sys.exit(main())
