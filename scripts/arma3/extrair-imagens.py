#!/usr/bin/env python3
"""
Extrai as imagens (picture, icon, pictureMap, etc.) de todos os dados do Arma 3.

O script lê TODOS os JSONs gerados na pasta out/, coleta todos os caminhos virtuais
de imagens, acha o PBO correspondente, extrai, converte via Pal2PacE e depois converte
diretamente para WebP, deletando o PNG original para economizar espaço.

O mapa gerado (arma3-icones.json) apontará:
    { "caminho\\virtual\\no\\config.paa": "/arma3/icones/arquivo.webp" }

Uso:
    python scripts/arma3/extrair-imagens.py              # usa os dumps do config
    python scripts/arma3/extrair-imagens.py --teste 6    # 6 ícones, sem dump
    python scripts/arma3/extrair-imagens.py --limite 500 # lote menor
    python scripts/arma3/extrair-imagens.py --reindexar  # refaz o índice de PBOs

Requer o Arma 3 Tools instalado (Pal2PacE) e a biblioteca Pillow.
"""

import json
import os
import re
import glob
import subprocess
import sys
import tempfile

try:
    from PIL import Image
except ImportError:
    raise SystemExit('este script precisa do Pillow: pip install Pillow')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pbo import PBO, indexar                                    # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')
DESTINO_ICONES = os.path.join(RAIZ, 'public', 'arma3', 'icones')
CACHE_INDICE = os.path.join(OUT, 'indice-pbo.json')
MAPA_SAIDA = os.path.join(OUT, 'arma3-icones.json')

STEAM = r'C:\Program Files (x86)\Steam\steamapps'
RAIZES_PBO = [
    os.path.join(STEAM, 'common', 'Arma 3', 'Addons'),
    os.path.join(STEAM, 'common', 'Arma 3'),
    os.path.join(STEAM, 'workshop', 'content', '107410'),
]

MAX_PBOS_ABERTOS = 6


def achar_pal2pace():
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
    p = caminho_virtual.replace('/', '\\').lower().strip('\\')
    partes = p.split('\\')
    saida = []
    for corte in range(len(partes) - 1, 0, -1):
        pref = '\\'.join(partes[:corte])
        for caminho in indice.get(pref, []):
            saida.append((caminho, '/'.join(partes[corte:])))
    return saida


class CachePBO:
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


def converter_webp(pal2pace, dados_paa, destino_webp):
    """Grava o .paa num temporário, converte pra PNG e salva direto como WebP."""
    with tempfile.TemporaryDirectory() as tmp:
        origem = os.path.join(tmp, 'icone.paa')
        tmp_png = os.path.join(tmp, 'icone.png')
        with open(origem, 'wb') as f:
            f.write(dados_paa)
        try:
            r = subprocess.run([pal2pace, origem, tmp_png],
                               capture_output=True, text=True, timeout=60)
        except (subprocess.TimeoutExpired, OSError) as err:
            return False, str(err)[:120]
        
        if not os.path.isfile(tmp_png) or os.path.getsize(tmp_png) == 0:
            return False, (r.stderr or r.stdout or 'Pal2PacE não gerou saída').strip()[:160]

        # Converte o PNG resultante para WebP e salva
        try:
            with Image.open(tmp_png) as im:
                os.makedirs(os.path.dirname(destino_webp), exist_ok=True)
                im.save(destino_webp, 'WEBP', quality=90, method=4)
        except Exception as err:
            return False, f"Erro ao converter para WebP: {err}"
            
    return True, ''


def extract_alvos_from_json(filepath):
    alvos = set()
    with open(filepath, encoding='utf-8') as f:
        data = json.load(f)
    
    def walk(node):
        if isinstance(node, dict):
            for k, v in node.items():
                if k in ['picture', 'icon', 'pictureMap', 'pictureShot'] and isinstance(v, str) and v.strip():
                    alvos.add(v.strip())
                walk(v)
        elif isinstance(node, list):
            for item in node:
                walk(item)
                
    walk(data)
    return alvos


def alvos_do_dump():
    alvos = set()
    jsons = glob.glob(os.path.join(OUT, '*.json'))
    for f in jsons:
        nome = os.path.basename(f)
        if nome in ['indice-pbo.json', 'arma3-icones.json', 'turntable.json', 'armas-imagens.json']:
            continue
        alvos.update(extract_alvos_from_json(f))
    
    if not alvos:
        raise SystemExit(
            f'não achei nenhuma imagem nos JSONs de {OUT}.\n'
            'Rode antes os dumps no jogo e os parse-* correspondentes.')
    return alvos


def alvos_de_teste(n):
    caminho = os.path.join(STEAM, 'common', 'Arma 3', 'Addons', 'weapons_f.pbo')
    if not os.path.isfile(caminho):
        raise SystemExit(f'não achei {caminho}')
    pbo = PBO(caminho)
    icones = [e for e in pbo.entradas
              if e['nome'].lower().endswith('_ca.paa') and '/ui/' in e['nome'].lower()]
    pref = pbo.prefixo.replace('/', '\\').strip('\\')
    return {'\\' + pref + '\\' + e['nome'].replace('/', '\\') for e in icones[:n]}


def main():
    argv = sys.argv[1:]

    reindexar = '--reindexar' in argv
    teste = int(argv[argv.index('--teste') + 1]) if '--teste' in argv else 0
    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 0

    pal2pace = achar_pal2pace()
    print(f'Pal2PacE: {pal2pace}')
    indice = carregar_indice(reindexar)
    print(f'índice: {len(indice)} prefixos, '
          f'{sum(len(v) for v in indice.values())} PBOs')

    por_raiz = {}
    for pref, caminhos in indice.items():
        por_raiz.setdefault(pref.split('\\')[0], []).extend(caminhos)

    alvos = alvos_de_teste(teste) if teste else alvos_do_dump()
    print(f'caminhos virtuais únicos a converter: {len(alvos)}\n')

    os.makedirs(DESTINO_ICONES, exist_ok=True)
    mapa, sem_pbo, falhou = {}, [], []
    cache = CachePBO()
    convertidas = 0

    lista = sorted(list(alvos))
    if limite:
        lista = lista[:limite]

    # Carrega o mapa anterior se existir para não reprocessar o que já foi
    if os.path.isfile(MAPA_SAIDA):
        with open(MAPA_SAIDA, encoding='utf-8') as f:
            mapa = json.load(f)

    for i, virtual in enumerate(lista, 1):
        if virtual in mapa and os.path.isfile(os.path.join(RAIZ, 'public', mapa[virtual].lstrip('/'))):
            # Já existe e está mapeado, pula!
            if i % 250 == 0 or i == len(lista):
                print(f'  {i}/{len(lista)} imagens...')
            continue

        nome = re.sub(r'[^a-z0-9_-]+', '-',
                      os.path.splitext(os.path.basename(virtual.replace('\\', '/')))[0].lower())
        
        # Pode haver colisão de nomes se dois PBOs tiverem arquivos com mesmo nome mas prefixo diferente.
        # Vamos adicionar os primeiros caracteres de um hash simples se houver conflito? 
        # Na maioria das vezes o nome final bate sem problemas, mas pra garantir, checamos.
        destino = os.path.join(DESTINO_ICONES, nome + '.webp')
        c = 1
        while os.path.isfile(destino) and mapa.get(virtual) != f'/arma3/icones/{nome}.webp':
            nome = f"{nome}-{c}"
            destino = os.path.join(DESTINO_ICONES, nome + '.webp')
            c += 1

        dados = None
        for caminho_pbo, interno in candidatos(virtual, indice):
            pbo = cache.get(caminho_pbo)
            if not pbo:
                continue
            entrada = (pbo.achar(interno)
                        or pbo.achar(interno + '.paa')
                        or pbo.achar(interno + '.pac'))
            if entrada:
                try:
                    dados = pbo.ler(entrada)
                except Exception as err:
                    falhou.append((virtual, str(err)[:90]))
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
                        falhou.append((virtual, str(err)[:90]))
                    break

        if dados is None:
            sem_pbo.append((virtual, virtual))
        else:
            ok, err = converter_webp(pal2pace, dados, destino)
            if ok:
                convertidas += 1
                mapa[virtual] = f'/arma3/icones/{os.path.basename(destino)}'
            else:
                falhou.append((virtual, err))

        if i % 250 == 0 or i == len(lista):
            print(f'  {i}/{len(lista)} imagens — {convertidas} novos, '
                  f'{len(mapa)} virtuais mapeados no total')

    os.makedirs(OUT, exist_ok=True)
    with open(MAPA_SAIDA, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    print(f'\nWebP novos ........ {convertidas}')
    print(f'caminhos mapeados . {len(mapa)} de {len(alvos)}')
    print(f'sem PBO ........... {len(sem_pbo)} imagens')
    print(f'falha na conversão  {len(falhou)}')
    for c, v in sem_pbo[:5]:
        print(f'  ? NÃO ACHOU NO PBO: {v}')
    for c, e in falhou[:5]:
        print(f'  ! FALHOU AO CONVERTER: {c}: {e}')
    print(f'\nimagens: {DESTINO_ICONES}')
    print(f'mapa:    {MAPA_SAIDA}')


if __name__ == '__main__':
    main()
