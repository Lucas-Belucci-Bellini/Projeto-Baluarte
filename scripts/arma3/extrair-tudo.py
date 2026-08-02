#!/usr/bin/env python3
"""
Roda TODOS os parsers do Arma 3 de uma vez, na ordem, e dá um placar no fim.

    python scripts/arma3/extrair-tudo.py              # todos os parsers
    python scripts/arma3/extrair-tudo.py --imagens    # inclui o extrator de imagem
    python scripts/arma3/extrair-tudo.py mapas itens  # só esses

Cada etapa é independente: se uma falhar (porque o dump dela ainda não rodou no
jogo, por exemplo), as outras continuam e o placar mostra o que faltou. O código
de saída é 1 se alguma etapa falhou, pra dar pra usar em automação.

IMPORTANTE: isto NÃO substitui o passo do jogo. Cada parser lê o `.rpt`, e o
`.rpt` só tem os dados depois que o `.sqf` correspondente rodou no debug
console. Quando uma etapa não acha o dump dela, o placar diz qual `.sqf` falta.
"""

import os
import subprocess
import sys
import time

AQUI = os.path.dirname(os.path.abspath(__file__))

# nome curto -> (script, o .sqf que precisa ter rodado no jogo antes)
ETAPAS = [
    # ── o que já existia ──────────────────────────────────────────────────
    ('armas', 'parse-dump.py', 'dump-config.sqf'),
    ('mapas', 'parse-mapas.py', 'dump-mapas.sqf'),
    ('itens', 'parse-itens.py', 'dump-itens.sqf'),
    ('veiculos', 'parse-veiculos.py', 'dump-veiculos.sqf'),
    ('acessorios', 'parse-acessorios.py', 'dump-acessorios.sqf'),
    ('animacoes', 'parse-animacoes.py', 'dump-animacoes.sqf'),
    # ── segunda leva: o que o config tem e a plataforma ainda não usava ───
    ('grupos', 'parse-grupos.py', 'dump-grupos.sqf'),
    ('funcoes', 'parse-funcoes.py', 'dump-funcoes.sqf'),
    ('manual', 'parse-manual.py', 'dump-manual.sqf'),
    ('simbologia', 'parse-simbologia.py', 'dump-simbologia.sqf'),
    ('terreno-fisico', 'parse-terreno-fisico.py', 'dump-terreno-fisico.sqf'),
    ('proveniencia', 'parse-proveniencia.py', 'dump-proveniencia.sqf'),
]

IMAGENS = ('imagens', 'extrair-imagens.py', '(lê os dumps que existirem)')


def rodar(nome, script, sqf):
    caminho = os.path.join(AQUI, script)
    if not os.path.isfile(caminho):
        print(f'  ! {script} não existe', flush=True)
        return nome, False, 0.0, f'{script} não existe'

    print(f'\n{"=" * 64}\n== {nome}  ({script})\n{"=" * 64}', flush=True)
    t0 = time.time()
    r = subprocess.run([sys.executable, caminho], cwd=os.path.dirname(AQUI))
    dt = time.time() - t0

    if r.returncode == 0:
        return nome, True, dt, None
    return nome, False, dt, f'rode {sqf} no debug console do jogo primeiro'


def main():
    pedidos = [a for a in sys.argv[1:] if not a.startswith('-')]
    com_imagens = '--imagens' in sys.argv

    etapas = [e for e in ETAPAS if not pedidos or e[0] in pedidos]
    if com_imagens or 'imagens' in pedidos:
        etapas.append(IMAGENS)

    if not etapas:
        raise SystemExit(f'nenhuma etapa casou. Disponíveis: '
                         f'{", ".join(e[0] for e in ETAPAS)}, imagens')

    resultados = [rodar(*e) for e in etapas]

    print(f'\n{"=" * 64}\n== PLACAR\n{"=" * 64}')
    falhas = 0
    for nome, ok, dt, erro in resultados:
        if ok:
            print(f'  OK    {nome:12} {dt:6.1f}s')
        else:
            falhas += 1
            print(f'  FALHA {nome:12} {dt:6.1f}s  -> {erro}')

    print(f'\n{len(resultados) - falhas} de {len(resultados)} etapas OK')
    if falhas:
        print('\nOs parsers leem o .rpt do jogo: uma etapa falha quando o .sqf\n'
              'dela ainda nao rodou no debug console. Veja scripts/arma3/README.md.')
    raise SystemExit(1 if falhas else 0)


if __name__ == '__main__':
    main()
