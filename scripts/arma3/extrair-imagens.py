#!/usr/bin/env python3
"""
Extrai os ícones das armas "como aparecem no jogo" e converte pra PNG (#398).

O pedido do operador: "quero uma forma de olhar as armas que eu olho no jogo —
foi para isso que estou te dando todos os arquivos". O ícone de cada arma é um
.paa dentro de algum PBO; o config aponta pra ele por caminho virtual
(`\\A3\\Weapons_F\\Data\\UI\\gear_x_ca.paa`).

Como o caminho vira arquivo:
    1. cada PBO declara um `prefix` no cabeçalho  (ex.: a3\\weapons_f)
    2. casamos o prefixo mais longo do caminho do config
    3. o resto do caminho é a entrada dentro daquele PBO
    4. Pal2PacE.exe (Arma 3 Tools) converte o .paa em .png

Uso:
    python scripts/arma3/extrair-imagens.py              # usa o dump do config
    python scripts/arma3/extrair-imagens.py --teste 6    # 6 ícones, sem dump
    python scripts/arma3/extrair-imagens.py --reindexar  # refaz o índice de PBOs

Requer o Arma 3 Tools instalado (Pal2PacE). O índice de prefixos é cacheado —
varrer os PBOs de novo só com --reindexar.
"""

import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pbo import PBO, indexar                                    # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')
DESTINO_PNG = os.path.join(RAIZ, 'public', 'arma3', 'armas')
CACHE_INDICE = os.path.join(OUT, 'indice-pbo.json')
DUMP_CONFIG = os.path.join(OUT, 'arma3-config.json')
MAPA_SAIDA = os.path.join(OUT, 'armas-imagens.json')

STEAM = r'C:\Program Files (x86)\Steam\steamapps'
RAIZES_PBO = [
    os.path.join(STEAM, 'common', 'Arma 3', 'Addons'),
    os.path.join(STEAM, 'common', 'Arma 3'),          # Curator/Expansion/Heli...
    os.path.join(STEAM, 'workshop', 'content', '107410'),
]


def achar_pal2pace():
    """Pal2PacE mudou de pasta entre versões do Arma 3 Tools — procura em vez
    de fixar o caminho. A variável A3TOOLS tem prioridade."""
    bases = [os.environ.get('A3TOOLS', ''), os.path.join(STEAM, 'common', 'Arma 3 Tools')]
    for base in bases:
        if not base or not os.path.isdir(base):
            continue
        for atual, _dirs, arqs in os.walk(base):
            for a in arqs:
                if a.lower() == 'pal2pace.exe':
                    return os.path.join(atual, a)
    raise SystemExit(
        'Pal2PacE.exe não encontrado.\n'
        'Instale o Arma 3 Tools pela Steam (é grátis) ou aponte A3TOOLS pra pasta dele.')


def carregar_indice(reindexar=False):
    if not reindexar and os.path.isfile(CACHE_INDICE):
        with open(CACHE_INDICE, encoding='utf-8') as f:
            return json.load(f)
    print('indexando PBOs (só o cabeçalho de cada um — demora um pouco na 1ª vez)…')
    indice = indexar(RAIZES_PBO)
    os.makedirs(OUT, exist_ok=True)
    with open(CACHE_INDICE, 'w', encoding='utf-8') as f:
        json.dump(indice, f, ensure_ascii=False, indent=1)
    return indice


def resolver(caminho_virtual, indice):
    """`\\A3\\Weapons_F\\Data\\UI\\x_ca.paa` -> (caminho_do_pbo, 'Data/UI/x_ca.paa').

    Casa o prefixo MAIS LONGO: mods costumam ter `rhsusf\\addons\\rhsusf_weapons`
    e `rhsusf\\addons\\rhsusf_weapons2` — pegar o primeiro que bate erraria."""
    p = caminho_virtual.replace('/', '\\').lower().strip('\\')
    partes = p.split('\\')
    for corte in range(len(partes) - 1, 0, -1):
        pref = '\\'.join(partes[:corte])
        if pref in indice:
            return indice[pref], '/'.join(partes[corte:])
    return None, None


def converter(pal2pace, dados_paa, destino_png):
    """Grava o .paa num temporário e chama o Pal2PacE pra virar PNG."""
    with tempfile.TemporaryDirectory() as tmp:
        origem = os.path.join(tmp, 'icone.paa')
        with open(origem, 'wb') as f:
            f.write(dados_paa)
        try:
            r = subprocess.run([pal2pace, origem, destino_png],
                               capture_output=True, text=True, timeout=60)
        except subprocess.TimeoutExpired:
            return False, 'Pal2PacE travou (timeout de 60 s)'
        if not os.path.isfile(destino_png) or os.path.getsize(destino_png) == 0:
            return False, (r.stderr or r.stdout or 'Pal2PacE não gerou saída').strip()[:160]
    return True, ''


def alvos_do_dump():
    """Lê o JSON do dump in-game: {classe: caminho do ícone}."""
    if not os.path.isfile(DUMP_CONFIG):
        raise SystemExit(
            f'não achei {DUMP_CONFIG}.\n'
            'Rode antes o dump no jogo (scripts/arma3/dump-config.sqf) e depois\n'
            'python scripts/arma3/parse-dump.py — ou use --teste pra um ensaio.')
    with open(DUMP_CONFIG, encoding='utf-8') as f:
        dump = json.load(f)
    return {c: a['picture'] for c, a in dump['armas'].items() if a.get('picture')}


def alvos_de_teste(n):
    """Ensaio sem depender do dump: pega ícones de arma do weapons_f.pbo."""
    caminho = os.path.join(STEAM, 'common', 'Arma 3', 'Addons', 'weapons_f.pbo')
    if not os.path.isfile(caminho):
        raise SystemExit(f'não achei {caminho}')
    pbo = PBO(caminho)
    icones = [e for e in pbo.entradas
              if e['nome'].lower().endswith('_ca.paa') and '/ui/' in e['nome'].lower()]
    pref = pbo.prefixo.replace('/', '\\').strip('\\')
    return {os.path.splitext(os.path.basename(e['nome']))[0].lower():
            '\\' + pref + '\\' + e['nome'].replace('/', '\\')
            for e in icones[:n]}


def main():
    argv = sys.argv[1:]
    reindexar = '--reindexar' in argv
    teste = int(argv[argv.index('--teste') + 1]) if '--teste' in argv else 0

    pal2pace = achar_pal2pace()
    print(f'Pal2PacE: {pal2pace}')
    indice = carregar_indice(reindexar)
    print(f'índice: {len(indice)} prefixos de PBO')

    alvos = alvos_de_teste(teste) if teste else alvos_do_dump()
    print(f'ícones a extrair: {len(alvos)}\n')

    os.makedirs(DESTINO_PNG, exist_ok=True)
    mapa, faltou_pbo, falhou_conv = {}, [], []
    cache_pbo = {}

    for i, (classe, virtual) in enumerate(sorted(alvos.items()), 1):
        caminho_pbo, interno = resolver(virtual, indice)
        if not caminho_pbo:
            faltou_pbo.append((classe, virtual))
            continue
        try:
            if caminho_pbo not in cache_pbo:
                cache_pbo[caminho_pbo] = PBO(caminho_pbo)
            pbo = cache_pbo[caminho_pbo]
            entrada = pbo.achar(interno)
            if not entrada:
                faltou_pbo.append((classe, virtual))
                continue
            dados = pbo.ler(entrada)
        except Exception as err:
            falhou_conv.append((classe, str(err)[:100]))
            continue

        destino = os.path.join(DESTINO_PNG, f'{classe}.png')
        ok, err = converter(pal2pace, dados, destino)
        if ok:
            mapa[classe] = f'/arma3/armas/{classe}.png'
        else:
            falhou_conv.append((classe, err))
        if i % 25 == 0 or i == len(alvos):
            print(f'  {i}/{len(alvos)} — {len(mapa)} ok')

    os.makedirs(OUT, exist_ok=True)
    with open(MAPA_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    print(f'\nPNG gerados ....... {len(mapa)}')
    print(f'PBO não resolvido . {len(faltou_pbo)}')
    print(f'falha na conversão  {len(falhou_conv)}')
    for c, v in faltou_pbo[:5]:
        print(f'  ? {c}: {v}')
    for c, e in falhou_conv[:5]:
        print(f'  ! {c}: {e}')
    print(f'\nimagens: {DESTINO_PNG}')
    print(f'mapa:    {MAPA_SAIDA}')


if __name__ == '__main__':
    main()
