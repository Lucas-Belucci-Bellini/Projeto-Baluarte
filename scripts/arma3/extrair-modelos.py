#!/usr/bin/env python3
"""
Extrai os MODELOS 3D (.p3d) que o dump listou, para conversão posterior.

Este script faz **metade** do caminho até o visor 3D do site, e é importante
saber qual metade:

    ✅ tira o .p3d de dentro do PBO certo          <- aqui
    ❌ converte .p3d em glTF                        <- NÃO aqui (ver abaixo)

## Por que a conversão não está aqui

O `.p3d` que o Arma 3 distribui é **ODOL** (binarizado): formato proprietário,
sem especificação pública estável, e que muda entre versões do engine. Não
existe biblioteca em Python ou JavaScript que leia ODOL de forma confiável, e
escrever uma seria reimplementar um formato fechado a partir de engenharia
reversa — exatamente o tipo de coisa que quebra em silêncio na próxima
atualização do jogo.

O caminho que funciona é o do ecossistema de modding, e ele exige GUI:

    1. `Arma 3 Tools` → **Object Builder** abre o .p3d
    2. **Blender** + addon **Arma Toolbox** (Alwarren) importa e exporta glTF
    3. o `.glb` resultante entra em `public/arma3/modelos/<classe>.glb`

Os passos 1–2 são de sessão **LOCAL** (máquina do operador, com o jogo e as
ferramentas). Este script prepara o terreno para eles.

## O visor já existe

Não é preciso escolher biblioteca de visualização: `src/utils/visor-3d.js` já
é um visor three.js completo (GLTF + DRACO self-hosted, STL, OBJ, FBX,
OrbitControls, enquadramento automático, chunk lazy pela regra #238). Ele abre
`.glb` de uma URL — é só apontar para o arquivo convertido.

## Uso

    python scripts/arma3/extrair-modelos.py            # todos os do dump
    python scripts/arma3/extrair-modelos.py --limite 20
    python scripts/arma3/extrair-modelos.py --so-nucleo  # só jogo base + DLC

Saída: `scripts/arma3/out/modelos/<classe>.p3d` (fora do site — são grandes e
ainda não servem para o navegador) + `out/modelos-p3d.json` com o mapa e o
motivo de cada ausência.
"""

import json
import os
import re
import sys
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pbo import PBO                                             # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')
DESTINO = os.path.join(OUT, 'modelos')
CACHE_INDICE = os.path.join(OUT, 'indice-pbo.json')
DUMP_CONFIG = os.path.join(OUT, 'arma3-config.json')
DUMP_CATALOGO = os.path.join(OUT, 'arma3-catalogo.json')
MAPA_SAIDA = os.path.join(OUT, 'modelos-p3d.json')

MAX_PBOS_ABERTOS = 6      # o índice de um PBO grande pesa MBs; ver extrair-imagens.py


def nome_seguro(classe):
    """Nome de arquivo a partir da classe do config.

    A classe vem do dump, ou seja, de dado externo: quem escolhe o texto é o
    autor do mod. Concatenar direto em `os.path.join` deixaria uma classe com
    `../` (ou barra, ou dois-pontos no Windows) escrever FORA da pasta de
    destino. O `extrair-imagens.py` já fazia essa higienização; aqui faltava.

    Mantém só o que é seguro em qualquer sistema de arquivos e garante nome
    não vazio."""
    limpo = re.sub(r'[^A-Za-z0-9_.-]+', '-', str(classe)).strip('.-')
    return limpo[:120] or 'sem-nome'


def candidatos(caminho_virtual, indice):
    """[(pbo, caminho_interno)] em ordem de probabilidade.

    Mesma regra do extrair-imagens.py, e pelo mesmo motivo: **prefixo mais
    longo primeiro**, porque um mod divide conteúdo entre `x/addons/y` e
    `x/addons/y2` e casar o mais curto pega o PBO errado."""
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
        self.maximo, self.itens, self.ordem = maximo, {}, []

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


def alvos(so_nucleo=False):
    """{classe: caminho virtual do .p3d}, deduplicado por MODELO.

    Deduplicar importa muito aqui: 10.821 armas apontam para 1.337 modelos
    distintos (as variantes de óptica e camuflagem compartilham o mesmo .p3d).
    Extrair por arma faria o mesmo arquivo 8 vezes."""
    if not os.path.isfile(DUMP_CONFIG):
        raise SystemExit(
            f'não achei {DUMP_CONFIG}.\n'
            'Rode antes o dump no jogo e o parse-dump.py — ver README.md.')
    with open(DUMP_CONFIG, encoding='utf-8') as f:
        dump = json.load(f)

    por_modelo = {}
    fontes = list(dump['armas'].items())
    if os.path.isfile(DUMP_CATALOGO):
        with open(DUMP_CATALOGO, encoding='utf-8') as f:
            cat = json.load(f)
        for secao in ('veiculos', 'itens'):
            fontes += list((cat.get(secao) or {}).items())

    for classe, e in fontes:
        modelo = (e.get('model') or '').strip()
        if not modelo:
            continue
        if so_nucleo and not (e.get('model') or '').lower().lstrip('/').startswith('a3'):
            continue
        chave = modelo.lower().replace('\\', '/')
        # a classe de nome mais curto vira a dona do arquivo — é a canônica,
        # a mesma regra dos geradores
        if chave not in por_modelo or len(classe) < len(por_modelo[chave][0]):
            por_modelo[chave] = (classe, modelo)
    return dict(por_modelo.values())


def main():
    argv = sys.argv[1:]
    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 0
    so_nucleo = '--so-nucleo' in argv

    if not os.path.isfile(CACHE_INDICE):
        raise SystemExit(
            f'não achei o índice de PBOs ({CACHE_INDICE}).\n'
            'Rode antes: python scripts/arma3/extrair-imagens.py --reindexar')
    with open(CACHE_INDICE, encoding='utf-8') as f:
        indice = json.load(f)

    tarefas = alvos(so_nucleo)
    if limite:
        tarefas = dict(list(tarefas.items())[:limite])
    print(f'{len(tarefas)} modelos distintos a extrair')
    os.makedirs(DESTINO, exist_ok=True)

    cache = CachePBO()
    mapa, motivos = {}, Counter()
    for i, (classe, virtual) in enumerate(sorted(tarefas.items()), 1):
        destino = os.path.join(DESTINO, f'{nome_seguro(classe)}.p3d')
        if os.path.isfile(destino) and os.path.getsize(destino):
            mapa[classe] = os.path.relpath(destino, RAIZ)
            motivos['ja-extraido'] += 1
            continue

        achou = False
        for caminho_pbo, interno in candidatos(virtual, indice):
            pbo = cache.get(caminho_pbo)
            if not pbo:
                continue
            entrada = next((e for e in pbo.entradas
                            if e['nome'].lower().replace('\\', '/') == interno.lower()), None)
            # muito config escreve o model SEM a extensão — a mesma armadilha
            # que segurou ~800 ícones
            if not entrada and not interno.lower().endswith('.p3d'):
                alvo2 = (interno + '.p3d').lower()
                entrada = next((e for e in pbo.entradas
                                if e['nome'].lower().replace('\\', '/') == alvo2), None)
            if entrada:
                try:
                    dados = pbo.ler(entrada)
                except Exception as err:
                    motivos[f'erro-leitura: {type(err).__name__}'] += 1
                    break
                with open(destino, 'wb') as f:
                    f.write(dados)
                mapa[classe] = os.path.relpath(destino, RAIZ)
                motivos['extraido'] += 1
                achou = True
                break
        if not achou and classe not in mapa:
            motivos['nao-encontrado-no-pbo'] += 1
        if i % 100 == 0:
            print(f'  {i}/{len(tarefas)}…')

    with open(MAPA_SAIDA, 'w', encoding='utf-8') as f:
        json.dump({
            '_leia': ('.p3d é ODOL (binarizado). Converta com Blender + Arma Toolbox '
                      'e salve o .glb em public/arma3/modelos/<classe>.glb — o visor '
                      'src/utils/visor-3d.js abre direto.'),
            'total': len(mapa), 'modelos': mapa,
        }, f, ensure_ascii=False, indent=1)

    print()
    for k, n in motivos.most_common():
        print(f'  {n:6d}  {k}')
    print(f'\nescrito: {os.path.relpath(MAPA_SAIDA, RAIZ)}')
    print('\nPRÓXIMO PASSO (sessão LOCAL, exige GUI):')
    print('  Blender + addon Arma Toolbox -> importa .p3d, exporta .glb')
    print('  salve em public/arma3/modelos/<classe>.glb')
    print('  o visor (src/utils/visor-3d.js) já abre .glb — nada a construir lá')


if __name__ == '__main__':
    main()
