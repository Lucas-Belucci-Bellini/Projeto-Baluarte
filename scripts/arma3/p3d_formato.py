#!/usr/bin/env python3
"""Que tipo de `.p3d` é este — e, por consequência, se dá para converter.

Um `.p3d` diz o que é nos primeiros bytes, e essa é a informação que decide
todo o resto da tubulação de modelo 3D:

    MLOD / P3DM   editável. É o formato que o Object Builder salva e que o
                  importador do Arma Toolbox lê. Converte.
    ODOL          binarizado pela Bohemia antes de empacotar. Formato fechado,
                  sem especificação pública estável, que muda entre versões do
                  engine. O importador do Blender NÃO lê.

O que o jogo distribui dentro dos PBOs é quase tudo ODOL — a binarização é
justamente o passo de publicação. Saber a proporção ANTES de gastar horas
montando Blender é a diferença entre um plano e uma aposta.

Isto é leitura de cabeçalho, não de malha: barato, e não depende de ter o jogo,
o Blender ou o Arma 3 Tools instalados. Por isso dá para provar no CI.
"""

import os
import struct

# Assinaturas conhecidas, em bytes, na posição 0.
MLOD = b'MLOD'
ODOL = b'ODOL'
P3DM = b'P3DM'      # aparece por LOD dentro de um MLOD; solto é MLOD de 1 LOD

CONVERTE = 'mlod'          # o Arma Toolbox importa
NAO_CONVERTE = 'odol'      # binarizado — sem leitor confiável
DESCONHECIDO = 'desconhecido'


class Formato:
    def __init__(self, tipo, versao=None, detalhe=''):
        self.tipo = tipo
        self.versao = versao
        self.detalhe = detalhe

    @property
    def convertivel(self):
        return self.tipo == CONVERTE

    def __repr__(self):
        v = f' v{self.versao}' if self.versao is not None else ''
        return f'<{self.tipo}{v}>'

    def __eq__(self, outro):
        return (isinstance(outro, Formato) and self.tipo == outro.tipo
                and self.versao == outro.versao)


def classificar_bytes(cabeca):
    """Classifica pelos primeiros bytes do arquivo.

    Aceita cabeçalho curto de propósito: arquivo truncado é `desconhecido` com
    o motivo, não exceção. Um `.p3d` que o PBO entregou pela metade é um caso
    real — melhor relatar do que derrubar a passada inteira."""
    if not isinstance(cabeca, (bytes, bytearray)):
        return Formato(DESCONHECIDO, detalhe='não são bytes')
    if len(cabeca) < 4:
        return Formato(DESCONHECIDO, detalhe=f'só {len(cabeca)} byte(s)')

    assinatura = bytes(cabeca[:4])
    versao = None
    if len(cabeca) >= 8:
        versao = struct.unpack('<I', bytes(cabeca[4:8]))[0]

    if assinatura == ODOL:
        return Formato(NAO_CONVERTE, versao, 'binarizado pela Bohemia')
    if assinatura == MLOD:
        return Formato(CONVERTE, versao, 'MLOD editável')
    if assinatura == P3DM:
        # P3DM solto é um MLOD de um LOD só. A versão que segue é a do LOD,
        # não a do arquivo — por isso não a reporto como versão de formato.
        return Formato(CONVERTE, None, 'P3DM (MLOD de um LOD)')
    return Formato(DESCONHECIDO, detalhe=f'assinatura {assinatura!r}')


def classificar(caminho, abrir=None):
    """Classifica um arquivo. Lê só 8 bytes."""
    abrir = abrir or (lambda p: open(p, 'rb'))
    try:
        with abrir(caminho) as f:
            return classificar_bytes(f.read(8))
    except OSError as err:
        return Formato(DESCONHECIDO, detalhe=f'não deu para abrir: {err}')


def resumir(caminhos, classificador=classificar):
    """{tipo: [caminhos]} — o retrato do acervo antes de tentar converter."""
    saida = {CONVERTE: [], NAO_CONVERTE: [], DESCONHECIDO: []}
    versoes = {}
    for c in caminhos:
        f = classificador(c)
        saida[f.tipo].append(c)
        if f.versao is not None:
            chave = f'{f.tipo} v{f.versao}'
            versoes[chave] = versoes.get(chave, 0) + 1
    return saida, versoes


def listar_p3d(pasta):
    if not os.path.isdir(pasta):
        return []
    return sorted(os.path.join(pasta, a) for a in os.listdir(pasta)
                  if a.lower().endswith('.p3d'))
