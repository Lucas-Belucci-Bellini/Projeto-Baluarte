#!/usr/bin/env python3
"""Extrai do jogo os ícones de TUDO e converte pra PNG/WebP (#398).

O ícone de cada coisa é um .paa dentro de algum PBO; o config aponta pra ele
por caminho virtual (`\\A3\\Weapons_F\\Data\\UI\\gear_x_ca.paa`).

Como o caminho vira arquivo:
    1. cada PBO declara um `prefix` no cabeçalho  (ex.: a3\\weapons_f)
    2. juntamos TODOS os PBOs que casam com o prefixo, do mais longo pro mais
       curto — mods dividem o conteúdo em vários PBOs com o MESMO prefixo, e
       guardar só o primeiro deixava ~1000 armas sem ícone
    3. se nenhum candidato tiver o caminho exato, procura pelo nome do arquivo
       nos PBOs da mesma raiz (`mss\\...` mora em `mss\\mss_core`, por exemplo)
    4. Pal2PacE.exe (Arma 3 Tools) converte o .paa em .png

O QUE extrair mora em `imagens_catalogo.py`, que é testável sem o jogo.

Uso:
    python scripts/arma3/extrair-imagens.py --listar     # o que dá pra extrair
    python scripts/arma3/extrair-imagens.py              # todas as categorias web
    python scripts/arma3/extrair-imagens.py itens        # uma categoria
    python scripts/arma3/extrair-imagens.py --tudo       # inclui os renders grandes
    python scripts/arma3/extrair-imagens.py --limite 500 # lote menor
    python scripts/arma3/extrair-imagens.py --reindexar  # refaz o índice de PBOs
    python scripts/arma3/extrair-imagens.py --webp       # PNG -> WebP + mapas

É retomável: imagem que já está no destino não é extraída de novo, então dá
pra interromper e continuar depois. São ~27 mil imagens no total.

Requer o Arma 3 Tools instalado (Pal2PacE). O índice de prefixos é cacheado —
varrer os PBOs de novo só com --reindexar.
"""

import json
import os
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from imagens_catalogo import (                                   # noqa: E402
    CATEGORIAS, OUT, POR_NOME, RAIZ, alvos, nomear)
from pbo import PBO, indexar                                     # noqa: E402

CACHE_INDICE = os.path.join(OUT, 'indice-pbo.json')

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


def carregar_dump(nome):
    """Devolve o JSON do dump ou None se ele não foi rodado. O None importa:
    ver `alvos()` em imagens_catalogo.py."""
    caminho = os.path.join(OUT, nome)
    if not os.path.isfile(caminho):
        return None
    with open(caminho, encoding='utf-8') as f:
        return json.load(f)


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
    casar o mais curto pegaria o PBO errado)."""
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


def ler_paa(virtual, indice, por_raiz, cache):
    """Bytes do .paa, ou None se nenhum PBO tiver esse caminho."""
    for caminho_pbo, interno in candidatos(virtual, indice):
        pbo = cache.get(caminho_pbo)
        if not pbo:
            continue
        # Muito config escreve o picture SEM extensão (`.../ui/gear_g17-b_ca`),
        # e dentro do PBO o arquivo é .paa.
        entrada = (pbo.achar(interno)
                   or pbo.achar(interno + '.paa')
                   or pbo.achar(interno + '.pac'))
        if entrada:
            try:
                return pbo.ler(entrada)
            except Exception:
                return None

    # rede de segurança: procura pelo nome do arquivo nos PBOs da mesma raiz
    alvo = os.path.splitext(os.path.basename(virtual.replace('\\', '/')))[0].lower()
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
                return pbo.ler(achado)
            except Exception:
                return None
    return None


def extrair(cat, pal2pace, indice, por_raiz, cache, limite=0):
    """Extrai uma categoria. Devolve (ok, resumo)."""
    lista_alvos = alvos(cat, carregar_dump)
    if lista_alvos is None:
        return False, f'dump {cat.dump} não existe — rode o dump no jogo e o parse'
    if not lista_alvos:
        return True, 'dump rodou mas nenhuma entrada tem imagem'

    nomes = nomear(list(lista_alvos))
    os.makedirs(cat.destino_abs, exist_ok=True)

    mapa, sem_pbo, falhou, convertidas, reaproveitadas = {}, [], [], 0, 0
    itens = sorted(lista_alvos.items())
    if limite:
        itens = itens[:limite]

    for i, (virtual, classes) in enumerate(itens, 1):
        nome = nomes[virtual]

        # retomável: já está no destino de alguma extração anterior?
        for ext in ('.webp', '.png'):
            if os.path.isfile(os.path.join(cat.destino_abs, nome + ext)):
                reaproveitadas += 1
                for c in classes:
                    mapa[c] = f'{cat.url_base}/{nome}{ext}' if cat.url_base else nome + ext
                break
        else:
            dados = ler_paa(virtual, indice, por_raiz, cache)
            if dados is None:
                sem_pbo.append((classes[0], virtual))
            else:
                destino = os.path.join(cat.destino_abs, nome + '.png')
                ok, err = converter(pal2pace, dados, destino)
                if ok:
                    convertidas += 1
                    for c in classes:
                        mapa[c] = f'{cat.url_base}/{nome}.png' if cat.url_base else nome + '.png'
                else:
                    falhou.append((classes[0], err))

        if i % 500 == 0 or i == len(itens):
            print(f'    {i}/{len(itens)} — {convertidas} novas, '
                  f'{reaproveitadas} já tinha, {len(sem_pbo)} sem PBO')

    with open(os.path.join(OUT, cat.mapa), 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    # arquivos no destino que nenhum mapa aponta: sobra de extração antiga com
    # a regra de nome velha. Não apago sozinho — só conto, o operador decide.
    esperados = {nomes[v] for v in lista_alvos}
    orfaos = [a for a in os.listdir(cat.destino_abs)
              if os.path.splitext(a)[0] not in esperados]

    for c, v in sem_pbo[:3]:
        print(f'      ? {c}: {v}')
    for c, e in falhou[:3]:
        print(f'      ! {c}: {e}')

    return True, (f'{len(mapa)} de {len(lista_alvos)} mapeadas · '
                  f'{convertidas} novas · {len(sem_pbo)} sem PBO · '
                  f'{len(falhou)} falharam'
                  + (f' · {len(orfaos)} órfãos no destino' if orfaos else ''))


def para_webp(cats):
    """Converte os PNG já extraídos em WebP e reescreve os mapas.

    Em PNG os ícones pesam ~10x mais, e isso entra no histórico do git pra
    sempre — pesa em todo clone e em todo build da Vercel. Em WebP o mesmo
    ícone 256x256 com transparência cai pra poucos KB, sem diferença visível."""
    from PIL import Image                              # só neste modo

    antes = depois = n = 0
    for cat in cats:
        if not os.path.isdir(cat.destino_abs):
            continue
        for arq in sorted(os.listdir(cat.destino_abs)):
            if not arq.lower().endswith('.png'):
                continue
            origem = os.path.join(cat.destino_abs, arq)
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

        caminho_mapa = os.path.join(OUT, cat.mapa)
        if os.path.isfile(caminho_mapa):
            with open(caminho_mapa, encoding='utf-8') as f:
                mapa = json.load(f)
            mapa = {c: (v[:-4] + '.webp' if v.endswith('.png') else v)
                    for c, v in mapa.items()}
            with open(caminho_mapa, 'w', encoding='utf-8') as f:
                json.dump(dict(sorted(mapa.items())), f, ensure_ascii=False, indent=1)

    if not n:
        print('nenhum PNG pendente — tudo já está em WebP')
        return
    print(f'\n{n} imagens: {antes / 1048576:.0f} MB -> {depois / 1048576:.1f} MB')


def listar():
    print(f'{"categoria":22s} {"peso":5s} {"alvos":>7s}  {"no disco":>8s}  o que é')
    for cat in CATEGORIAS:
        a = alvos(cat, carregar_dump)
        n = '—' if a is None else str(len(a))
        d = (len(os.listdir(cat.destino_abs))
             if os.path.isdir(cat.destino_abs) else 0)
        print(f'{cat.nome:22s} {cat.peso:5s} {n:>7s}  {d:8d}  {cat.sobre}')
    print('\n"—" = o dump dessa categoria ainda não foi rodado no jogo.')
    print('peso app = render grande, fica FORA de public/ (mega-plano #238).')


def main():
    argv = sys.argv[1:]

    if '--listar' in argv:
        return listar()

    pedidos = [a for a in argv if not a.startswith('-')]
    if pedidos:
        desconhecidas = [p for p in pedidos if p not in POR_NOME]
        if desconhecidas:
            raise SystemExit(f'categoria desconhecida: {", ".join(desconhecidas)}\n'
                             f'conhecidas: {", ".join(POR_NOME)}')
        cats = [POR_NOME[p] for p in pedidos]
    elif '--tudo' in argv:
        cats = list(CATEGORIAS)
    else:
        cats = [c for c in CATEGORIAS if c.peso == 'web']

    if '--webp' in argv:
        return para_webp(cats)

    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 0

    pal2pace = achar_pal2pace()
    print(f'Pal2PacE: {pal2pace}')
    indice = carregar_indice('--reindexar' in argv)
    print(f'índice: {len(indice)} prefixos, '
          f'{sum(len(v) for v in indice.values())} PBOs\n')

    por_raiz = {}
    for pref, caminhos in indice.items():
        por_raiz.setdefault(pref.split('\\')[0], []).extend(caminhos)

    cache = CachePBO()
    resultados = []
    for cat in cats:
        print(f'· {cat.nome} ({cat.peso}) — {cat.sobre}')
        ok, resumo = extrair(cat, pal2pace, indice, por_raiz, cache, limite)
        print(f'  {"✓" if ok else "✗"} {resumo}\n')
        resultados.append((cat, ok, resumo))

    print('=' * 68)
    faltando = [c for c, ok, _ in resultados if not ok]
    for cat, ok, resumo in resultados:
        print(f'{"✓" if ok else "✗"} {cat.nome:22s} {resumo}')
    if faltando:
        print(f'\n{len(faltando)} categoria(s) sem dump. Rode no jogo e depois:')
        for cat in faltando:
            etapa = cat.dump.replace('arma3-', '').replace('.json', '')
            print(f'   python scripts/arma3/extrair-tudo.py {etapa}')
    print('\nDepois de conferir, converta pra WebP:')
    print('   python scripts/arma3/extrair-imagens.py --webp')


if __name__ == '__main__':
    main()
