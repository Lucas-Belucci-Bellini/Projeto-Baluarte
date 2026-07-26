#!/usr/bin/env python3
"""
Extrai os ícones das armas "como aparecem no jogo" e converte pra PNG (#398).

O pedido do operador: "quero uma forma de olhar as armas que eu olho no jogo —
foi para isso que estou te dando todos os arquivos". O ícone de cada arma é um
.paa dentro de algum PBO; o config aponta pra ele por caminho virtual
(`\\A3\\Weapons_F\\Data\\UI\\gear_x_ca.paa`).

Como o caminho vira arquivo:
    1. cada PBO declara um `prefix` no cabeçalho  (ex.: a3\\weapons_f)
    2. juntamos TODOS os PBOs que casam com o prefixo, do mais longo pro mais
       curto — mods dividem o conteúdo em vários PBOs com o MESMO prefixo, e
       guardar só o primeiro deixava ~1000 armas sem ícone
    3. se nenhum candidato tiver o caminho exato, procura pelo nome do arquivo
       nos PBOs da mesma raiz (`mss\\...` mora em `mss\\mss_core`, por exemplo)
    4. Pal2PacE.exe (Arma 3 Tools) converte o .paa em .png

Uso:
    python scripts/arma3/extrair-imagens.py              # usa o dump do config
    python scripts/arma3/extrair-imagens.py --teste 6    # 6 ícones, sem dump
    python scripts/arma3/extrair-imagens.py --limite 500 # lote menor
    python scripts/arma3/extrair-imagens.py --reindexar  # refaz o índice de PBOs
    python scripts/arma3/extrair-imagens.py --webp       # PNG -> WebP + mapa

Requer o Arma 3 Tools instalado (Pal2PacE). O índice de prefixos é cacheado —
varrer os PBOs de novo só com --reindexar.
"""

import json
import os
import re
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

MAX_PBOS_ABERTOS = 6      # cache pequeno: o índice de um PBO grande pesa MBs


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
    """{prefixo: [caminhos de pbo]} — LISTA, porque vários PBOs compartilham
    prefixo e o ícone pode estar em qualquer um deles."""
    if not reindexar and os.path.isfile(CACHE_INDICE):
        with open(CACHE_INDICE, encoding='utf-8') as f:
            indice = json.load(f)
        if indice and isinstance(next(iter(indice.values())), list):
            return indice
        print('índice antigo (1 PBO por prefixo) — refazendo…')
    print('indexando PBOs (só o cabeçalho de cada um — demora um pouco na 1ª vez)…')
    indice = indexar(RAIZES_PBO)
    os.makedirs(OUT, exist_ok=True)
    with open(CACHE_INDICE, 'w', encoding='utf-8') as f:
        json.dump(indice, f, ensure_ascii=False, indent=1)
    return indice


def candidatos(caminho_virtual, indice):
    """Devolve [(caminho_pbo, caminho_interno)] em ordem de probabilidade.

    Prefixo mais longo primeiro (mods têm `x\\addons\\y` e `x\\addons\\y2`, e
    casar o mais curto pegaria o PBO errado). Depois, como rede de segurança,
    os PBOs da mesma raiz — o config às vezes aponta pra `mss\\a.paa` enquanto
    o PBO declara `mss\\mss_core`."""
    p = caminho_virtual.replace('/', '\\').lower().strip('\\')
    partes = p.split('\\')
    saida = []
    for corte in range(len(partes) - 1, 0, -1):
        pref = '\\'.join(partes[:corte])
        for caminho in indice.get(pref, []):
            saida.append((caminho, '/'.join(partes[corte:])))
    return saida


class CachePBO:
    """Guarda poucos PBOs abertos. Sem limite, os índices de centenas de mods
    juntos estouram a memória (WinError 1455 — já aconteceu aqui)."""

    def __init__(self, maximo=MAX_PBOS_ABERTOS):
        self.maximo = maximo
        self.itens = {}
        self.ordem = []

    def get(self, caminho):
        if caminho in self.itens:
            return self.itens[caminho]
        try:
            pbo = PBO(caminho)
        except Exception:
            return None
        self.itens[caminho] = pbo
        self.ordem.append(caminho)
        while len(self.ordem) > self.maximo:
            self.itens.pop(self.ordem.pop(0), None)
        return pbo


def converter(pal2pace, dados_paa, destino_png):
    """Grava o .paa num temporário e chama o Pal2PacE pra virar PNG."""
    with tempfile.TemporaryDirectory() as tmp:
        origem = os.path.join(tmp, 'icone.paa')
        with open(origem, 'wb') as f:
            f.write(dados_paa)
        try:
            r = subprocess.run([pal2pace, origem, destino_png],
                               capture_output=True, text=True, timeout=60)
        except (subprocess.TimeoutExpired, OSError) as err:
            return False, str(err)[:120]
        if not os.path.isfile(destino_png) or os.path.getsize(destino_png) == 0:
            return False, (r.stderr or r.stdout or 'Pal2PacE não gerou saída').strip()[:160]
    return True, ''


def alvos_do_dump():
    if not os.path.isfile(DUMP_CONFIG):
        raise SystemExit(
            f'não achei {DUMP_CONFIG}.\n'
            'Rode antes o dump no jogo (scripts/arma3/dump-config.sqf) e depois\n'
            'python scripts/arma3/parse-dump.py — ou use --teste pra um ensaio.')
    with open(DUMP_CONFIG, encoding='utf-8') as f:
        dump = json.load(f)
    return {c: a['picture'] for c, a in dump['armas'].items() if a.get('picture')}


def alvos_de_teste(n):
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


def para_webp():
    """Converte os PNG já extraídos em WebP e reescreve o mapa.

    2.250 ícones em PNG dão ~174 MB, e isso entra no histórico do git pra
    sempre — pesa em todo clone e em todo build da Vercel. Em WebP o mesmo
    ícone 256x256 com transparência cai pra poucos KB, sem diferença visível."""
    from PIL import Image                              # só neste modo

    antes = depois = n = 0
    for arq in sorted(os.listdir(DESTINO_PNG)):
        if not arq.lower().endswith('.png'):
            continue
        origem = os.path.join(DESTINO_PNG, arq)
        destino = origem[:-4] + '.webp'
        antes += os.path.getsize(origem)
        if not os.path.isfile(destino):
            with Image.open(origem) as im:
                im.save(destino, 'WEBP', quality=90, method=4)
        depois += os.path.getsize(destino)
        os.remove(origem)
        n += 1
        if n % 500 == 0:
            print(f'  {n} convertidos…')

    if os.path.isfile(MAPA_SAIDA):
        with open(MAPA_SAIDA, encoding='utf-8') as f:
            mapa = json.load(f)
        mapa = {c: (v[:-4] + '.webp' if v.endswith('.png') else v) for c, v in mapa.items()}
        with open(MAPA_SAIDA, 'w', encoding='utf-8') as f:
            json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    print(f'\n{n} imagens: {antes / 1048576:.0f} MB -> {depois / 1048576:.1f} MB')
    print(f'mapa atualizado: {MAPA_SAIDA}')


def main():
    argv = sys.argv[1:]
    if '--webp' in argv:
        return para_webp()

    reindexar = '--reindexar' in argv
    teste = int(argv[argv.index('--teste') + 1]) if '--teste' in argv else 0
    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 0

    pal2pace = achar_pal2pace()
    print(f'Pal2PacE: {pal2pace}')
    indice = carregar_indice(reindexar)
    print(f'índice: {len(indice)} prefixos, '
          f'{sum(len(v) for v in indice.values())} PBOs')

    # PBOs agrupados pela primeira parte do prefixo — a rede de segurança
    por_raiz = {}
    for pref, caminhos in indice.items():
        por_raiz.setdefault(pref.split('\\')[0], []).extend(caminhos)

    alvos = alvos_de_teste(teste) if teste else alvos_do_dump()

    # Muitas variantes compartilham o MESMO .paa (camo, retextura, versão de
    # mod): converte uma vez por imagem e aponta todas as classes pra ela.
    por_imagem = {}
    for classe, virtual in alvos.items():
        por_imagem.setdefault(virtual.lower(), []).append(classe)
    print(f'armas: {len(alvos)} | imagens distintas: {len(por_imagem)}\n')

    os.makedirs(DESTINO_PNG, exist_ok=True)
    mapa, sem_pbo, falhou = {}, [], []
    cache = CachePBO()
    convertidas = 0

    lista = sorted(por_imagem.items())
    if limite:
        lista = lista[:limite]

    for i, (virtual, classes) in enumerate(lista, 1):
        nome = re.sub(r'[^a-z0-9_-]+', '-',
                      os.path.splitext(os.path.basename(virtual.replace('\\', '/')))[0].lower())
        for ext in ('.png', '.webp'):
            destino = os.path.join(DESTINO_PNG, nome + ext)
            if os.path.isfile(destino):
                for c in classes:
                    mapa[c] = f'/arma3/armas/{nome}{ext}'
                break
        else:
            destino = os.path.join(DESTINO_PNG, nome + '.png')
            dados = None

            for caminho_pbo, interno in candidatos(virtual, indice):
                pbo = cache.get(caminho_pbo)
                if not pbo:
                    continue
                # Muito config escreve o picture SEM extensão
                # (`.../ui/gear_g17-b_ca`), e dentro do PBO o arquivo é .paa.
                entrada = (pbo.achar(interno)
                           or pbo.achar(interno + '.paa')
                           or pbo.achar(interno + '.pac'))
                if entrada:
                    try:
                        dados = pbo.ler(entrada)
                    except Exception as err:
                        falhou.append((classes[0], str(err)[:90]))
                    break

            if dados is None:                       # rede de segurança: por nome
                alvo = os.path.splitext(
                    os.path.basename(virtual.replace('\\', '/')))[0].lower()
                raiz = virtual.replace('\\', '/').strip('/').split('/')[0].lower()
                for caminho_pbo in por_raiz.get(raiz, [])[:60]:
                    pbo = cache.get(caminho_pbo)
                    if not pbo:
                        continue
                    achado = next((e for e in pbo.entradas
                                   if os.path.splitext(os.path.basename(e['nome']))[0].lower() == alvo
                                   and e['nome'].lower().endswith(('.paa', '.pac'))), None)
                    if achado:
                        try:
                            dados = pbo.ler(achado)
                        except Exception as err:
                            falhou.append((classes[0], str(err)[:90]))
                        break

            if dados is None:
                sem_pbo.append((classes[0], virtual))
            else:
                ok, err = converter(pal2pace, dados, destino)
                if ok:
                    convertidas += 1
                    for c in classes:
                        mapa[c] = f'/arma3/armas/{nome}.png'
                else:
                    falhou.append((classes[0], err))

        if i % 250 == 0 or i == len(lista):
            print(f'  {i}/{len(lista)} imagens — {convertidas} PNG novos, '
                  f'{len(mapa)} armas mapeadas')

    os.makedirs(OUT, exist_ok=True)
    with open(MAPA_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    print(f'\nPNG novos ......... {convertidas}')
    print(f'armas mapeadas .... {len(mapa)} de {len(alvos)} com ícone no config')
    print(f'sem PBO ........... {len(sem_pbo)} imagens')
    print(f'falha na conversão  {len(falhou)}')
    for c, v in sem_pbo[:5]:
        print(f'  ? {c}: {v}')
    for c, e in falhou[:5]:
        print(f'  ! {c}: {e}')
    print(f'\nimagens: {DESTINO_PNG}')
    print(f'mapa:    {MAPA_SAIDA}')


if __name__ == '__main__':
    main()
