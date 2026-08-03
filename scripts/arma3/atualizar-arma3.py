#!/usr/bin/env python3
"""Um comando só: roda o pipeline inteiro e mexe apenas no que mudou.

    python scripts/arma3/atualizar-arma3.py            # tudo que precisa
    python scripts/arma3/atualizar-arma3.py --ver       # só diz o que faria
    python scripts/arma3/atualizar-arma3.py --sem-imagens
    python scripts/arma3/atualizar-arma3.py --tudo      # ignora o "já atualizado"

O que ele faz, na ordem:

  1. varre a pasta de `.rpt` UMA vez, procurando as 13 marcas ao mesmo tempo;
  2. roda só os parsers cujo dump é novo, passando o `.rpt` já escolhido;
  3. extrai as imagens que ainda não estão no destino;
  4. regera só as bases cuja entrada mudou;
  5. diz o que fez, o que pulou, e o que falta você rodar no jogo.

Por que a varredura única importa: `achar_rpt` lê cada `.rpt` inteiro
procurando UMA marca. Chamado por 13 parsers, são 13 leituras completas de uma
pasta cujos arquivos passam de 1 GB. Aqui é uma só.

⚠️ **Isto não roda os `.sqf`.** Nenhum script alcança o jogo: o dump só existe
depois que você colou o `.sqf` no debug console. Quando falta dump, o relatório
diz qual `.sqf` colar.

⚠️ **Modelo 3D não é atualizável por aqui.** `extrair-modelos.py` tira o `.p3d`
do PBO, mas `.p3d` -> glTF **não tem caminho por script**: o formato ODOL é
fechado e muda entre versões do engine. A conversão passa pelo Blender com o
Arma Toolbox, na mão. Ver `docs/HANDOFF-LOCAL.md` § E2.
"""

import os
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pipeline_arma3 import (                                     # noqa: E402
    AQUI, BASES, ETAPAS, RAIZ, indexar_rpts, precisa_base, precisa_parse)


def pasta_rpt():
    return os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')


def rodar(script, args=()):
    t0 = time.time()
    r = subprocess.run([sys.executable, os.path.join(AQUI, script), *args],
                       capture_output=True, text=True, cwd=RAIZ)
    dt = time.time() - t0
    if r.returncode != 0:
        cauda = (r.stderr or r.stdout).strip().splitlines()
        return False, dt, (cauda[-1] if cauda else 'sem mensagem')
    return True, dt, ''


def main():
    argv = sys.argv[1:]
    so_ver = '--ver' in argv
    forcar = '--tudo' in argv
    com_imagens = '--sem-imagens' not in argv

    base_rpt = pasta_rpt()
    if not os.path.isdir(base_rpt):
        print(f'! pasta de logs não encontrada: {base_rpt}')
        print('  Isto precisa rodar na máquina onde o Arma 3 está instalado.')
        return 1

    print(f'varrendo {base_rpt} (uma passada, 13 marcas)…')
    t0 = time.time()
    escolhidos = indexar_rpts(base_rpt, [e.marca for e in ETAPAS])
    achados = sum(1 for v in escolhidos.values() if v)
    print(f'  {achados}/{len(ETAPAS)} dumps encontrados em {time.time() - t0:.1f}s\n')

    # ── 1. parsers ────────────────────────────────────────────────────────
    rodados, pulados, faltando, falhas = [], [], [], []
    print('DUMPS')
    for etapa in ETAPAS:
        rpt = escolhidos[etapa.marca]
        roda, motivo = precisa_parse(etapa, rpt)
        if forcar and rpt is not None:
            roda, motivo = True, 'forçado por --tudo'

        if rpt is None:
            faltando.append(etapa)
            print(f'  – {etapa.nome:16s} {motivo}')
        elif not roda:
            pulados.append(etapa)
            print(f'  = {etapa.nome:16s} {motivo}')
        elif so_ver:
            print(f'  → {etapa.nome:16s} rodaria: {motivo}')
        else:
            ok, dt, err = rodar(etapa.script, [rpt])
            if ok:
                rodados.append(etapa)
                print(f'  ✓ {etapa.nome:16s} {motivo} ({dt:.1f}s)')
            else:
                falhas.append((etapa.nome, err))
                print(f'  ✗ {etapa.nome:16s} {err}')

    # ── 2. imagens ────────────────────────────────────────────────────────
    if com_imagens:
        print('\nIMAGENS')
        if so_ver:
            ok, dt, err = rodar('extrair-imagens.py', ['--listar'])
            print('  (--ver: mostrando o inventário em vez de extrair)')
        else:
            print('  extraindo o que ainda não está no destino…')
            ok, dt, err = rodar('extrair-imagens.py')
            if ok:
                print(f'  ✓ imagens ({dt:.1f}s)')
            else:
                falhas.append(('imagens', err))
                print(f'  ✗ {err}')

    # ── 3. bases ──────────────────────────────────────────────────────────
    print('\nBASES')
    for base in BASES:
        roda, motivo = precisa_base(base)
        if forcar:
            roda, motivo = True, 'forçado por --tudo'
        if not roda:
            print(f'  = {base.nome:16s} {motivo}')
        elif so_ver:
            print(f'  → {base.nome:16s} regeraria: {motivo}')
        else:
            ok, dt, err = rodar(base.script)
            if ok:
                print(f'  ✓ {base.nome:16s} {motivo} ({dt:.1f}s)')
            else:
                falhas.append((base.nome, err))
                print(f'  ✗ {base.nome:16s} {err}')

    # ── relatório ─────────────────────────────────────────────────────────
    print('\n' + '=' * 68)
    if not so_ver:
        print(f'{len(rodados)} dump(s) lidos · {len(pulados)} já atualizados · '
              f'{len(faltando)} sem dump')

    if faltando:
        print(f'\nFalta rodar no jogo ({len(faltando)}):')
        print('  Esc -> Debug Console -> cola o arquivo -> LOCAL EXEC')
        print('  (com TODOS os DLCs e mods carregados)')
        for etapa in faltando:
            print(f'    scripts/arma3/{etapa.sqf:26s} {etapa.sobre}')

    if falhas:
        print(f'\n{len(falhas)} falha(s):')
        for nome, err in falhas:
            print(f'    {nome}: {err}')
        return 1

    if not faltando and not so_ver:
        print('\nTudo em dia. Confira com: npm run verificar-arma3')
    return 0


if __name__ == '__main__':
    sys.exit(main())
