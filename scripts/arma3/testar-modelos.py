#!/usr/bin/env python3
"""Prova o classificador de `.p3d` sem o jogo, sem o Blender, sem o Arma 3 Tools.

A tubulação de modelo 3D depende de uma pergunta só: **este arquivo é MLOD ou
ODOL?** MLOD o Blender importa; ODOL não tem leitor confiável. Errar isso nos
dois sentidos custa caro e de formas diferentes:

  · **ODOL classificado como MLOD** → o operador monta o Blender, roda em lote,
    e colhe milhares de falhas sem entender por quê;
  · **MLOD classificado como ODOL** → desiste-se de modelos que dariam certo.

Por isso as asserções são sobre bytes reais de cabeçalho, não sobre o que eu
lembro de ter lido: as assinaturas `MLOD`, `ODOL` e `P3DM` estão no formato há
vinte anos e são o que o próprio Object Builder escreve.

Roda em `npm run testar-modelos-arma3`, no CI.
"""

import os
import struct
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from p3d_formato import (                                       # noqa: E402
    CONVERTE, DESCONHECIDO, NAO_CONVERTE, Formato,
    classificar, classificar_bytes, listar_p3d, resumir)

falhas = []


def checar(condicao, titulo, detalhe=''):
    if condicao:
        print(f'  ✓ {titulo}')
    else:
        print(f'  ✗ {titulo}')
        if detalhe:
            print(f'      {detalhe}')
        falhas.append(titulo)


def cabeca(assinatura, versao=None):
    b = bytes(assinatura)
    if versao is not None:
        b += struct.pack('<I', versao)
    return b


def teste_assinaturas():
    f = classificar_bytes(cabeca(b'ODOL', 73))
    checar(f.tipo == NAO_CONVERTE and f.versao == 73,
           'ODOL v73 (Arma 3) é reconhecido como binarizado', repr(f))
    checar(not f.convertivel, 'ODOL não é declarado convertível')

    f = classificar_bytes(cabeca(b'MLOD', 257))
    checar(f.tipo == CONVERTE and f.versao == 257,
           'MLOD v257 é reconhecido como editável', repr(f))
    checar(f.convertivel, 'MLOD é declarado convertível')

    f = classificar_bytes(cabeca(b'P3DM', 28))
    checar(f.tipo == CONVERTE,
           'P3DM solto conta como MLOD de um LOD', repr(f))

    # ODOL antigo (OFP/Arma 2) — ainda binarizado, ainda sem leitor
    f = classificar_bytes(cabeca(b'ODOL', 40))
    checar(f.tipo == NAO_CONVERTE,
           'ODOL de versão antiga também é binarizado (não só o v7x)')


def teste_nao_confunde():
    """O modo de falha caro: dizer que dá para converter quando não dá."""
    for lixo in (b'GLTF\x02\x00\x00\x00', b'\x00\x00\x00\x00', b'RIFF',
                 b'PK\x03\x04', b'<htm', b'ODO', b''):
        f = classificar_bytes(lixo)
        if f.convertivel:
            checar(False, 'arquivo que não é P3D nunca é dado como convertível',
                   f'{lixo!r} -> {f!r}')
            return
    checar(True, 'arquivo que não é P3D nunca é dado como convertível')

    checar(classificar_bytes(b'odol' + b'\x00' * 4).tipo == DESCONHECIDO,
           'a assinatura é sensível à caixa (odol minúsculo não é ODOL)')


def teste_entrada_ruim():
    """Um .p3d truncado pelo PBO é caso real. Relatar > derrubar a passada."""
    for ruim in (None, 42, 'string', [], b'ML'):
        f = classificar_bytes(ruim)
        if f.tipo != DESCONHECIDO:
            checar(False, 'entrada inválida vira desconhecido, não exceção',
                   f'{ruim!r} -> {f!r}')
            return
    checar(True, 'entrada inválida vira desconhecido, não exceção')

    f = classificar_bytes(b'MLOD')          # sem os 4 bytes de versão
    checar(f.tipo == CONVERTE and f.versao is None,
           'cabeçalho sem versão ainda classifica o tipo')

    f = classificar('/nao/existe/nada.p3d')
    checar(f.tipo == DESCONHECIDO and 'abrir' in f.detalhe,
           'arquivo inexistente é relatado, não estoura')


def teste_le_pouco():
    """Modelo do Arma 3 passa de 100 MB. Ler tudo para ver 4 bytes é absurdo."""
    lidos = []

    class Espia:
        def __init__(self, dados):
            self.dados = dados

        def read(self, n=-1):
            lidos.append(n)
            return self.dados[:n] if n and n > 0 else self.dados

        def __enter__(self):
            return self

        def __exit__(self, *a):
            return False

    classificar('x.p3d', abrir=lambda _: Espia(cabeca(b'ODOL', 73) + b'x' * 10**6))
    checar(lidos and all(0 < n <= 64 for n in lidos),
           'lê só o cabeçalho, não o arquivo inteiro', f'leituras: {lidos}')


def teste_resumo():
    dados = {'a.p3d': Formato(NAO_CONVERTE, 73),
             'b.p3d': Formato(NAO_CONVERTE, 73),
             'c.p3d': Formato(CONVERTE, 257),
             'd.p3d': Formato(DESCONHECIDO)}
    por_tipo, versoes = resumir(list(dados), classificador=lambda c: dados[c])

    checar(len(por_tipo[NAO_CONVERTE]) == 2 and len(por_tipo[CONVERTE]) == 1
           and len(por_tipo[DESCONHECIDO]) == 1,
           'o resumo separa os três destinos')
    checar(sum(len(v) for v in por_tipo.values()) == len(dados),
           'nenhum arquivo some nem é contado duas vezes no resumo')
    checar(versoes.get('odol v73') == 2,
           'as versões são contadas por tipo', f'{versoes}')


def teste_listar():
    with tempfile.TemporaryDirectory() as tmp:
        for nome in ('a.p3d', 'B.P3D', 'nao.txt', 'c.p3d.bak'):
            open(os.path.join(tmp, nome), 'wb').close()
        achados = [os.path.basename(c) for c in listar_p3d(tmp)]
        checar(sorted(achados) == ['B.P3D', 'a.p3d'],
               'lista .p3d em qualquer caixa e ignora o resto', f'{achados}')
    checar(listar_p3d('/nao/existe') == [],
           'pasta inexistente devolve lista vazia, não erro')


def teste_acervo_real():
    """Se houver modelos extraídos, dá o retrato deles."""
    pasta = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                         'out', 'modelos')
    arquivos = listar_p3d(pasta)
    if not arquivos:
        print('  – nenhum .p3d extraído ainda '
              '(rode extrair-modelos.py na máquina do jogo)')
        return
    por_tipo, versoes = resumir(arquivos)
    checar(True, f'{len(arquivos)} modelo(s) reais: '
                 f'{len(por_tipo[CONVERTE])} MLOD · '
                 f'{len(por_tipo[NAO_CONVERTE])} ODOL · '
                 f'{len(por_tipo[DESCONHECIDO])} ?')


def main():
    print('provando o classificador de .p3d\n')
    print('1. assinaturas')
    teste_assinaturas()
    print('\n2. não confundir (o erro caro)')
    teste_nao_confunde()
    print('\n3. entrada ruim')
    teste_entrada_ruim()
    print('\n4. custo de leitura')
    teste_le_pouco()
    print('\n5. resumo do acervo')
    teste_resumo()
    teste_listar()
    print('\n6. contra o que está extraído')
    teste_acervo_real()

    print()
    if falhas:
        print(f'✗ {len(falhas)} falha(s): {", ".join(falhas)}')
        return 1
    print('✓ o classificador sabe o que dá e o que não dá para converter')
    return 0


if __name__ == '__main__':
    sys.exit(main())
