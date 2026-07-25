#!/usr/bin/env python3
"""
Leitor de PBO (o container de addon do Arma 3) — Python puro, sem dependência.

Existe porque a parte LOCAL da issue #398 precisa abrir os arquivos reais do
jogo e dos mods (ícones .paa, modelos .p3d, configs) e o Arma 3 Tools oficial
não está instalado nesta máquina. Formato documentado na BIKI ("PBO File
Format") e estável desde o Operation Flashpoint.

  Estrutura:
    [entradas do índice]   nome NUL-terminado + 5×uint32
                           (packing, tamanho_original, reservado, timestamp, tamanho)
    [fim do índice]        entrada de nome vazio e campos zerados
    [blobs]                os dados de cada entrada, na mesma ordem do índice
    [assinatura]           0x00 + SHA-1 de 20 bytes (ignorada aqui)

  packing: 0 → cru · 0x43707273 ('Cprs') → LZSS · 0x456e6372 ('Encr') → cifrado

A primeira entrada costuma ser o cabeçalho de propriedades (nome vazio, packing
'Vers'), seguido de pares chave/valor NUL-terminados — é de lá que sai o
`prefix`, o caminho virtual que o jogo usa (ex.: `meumod\addons\armas`).

Uso:
    python scripts/arma3/pbo.py list    <arquivo.pbo> [padrão]
    python scripts/arma3/pbo.py extract <arquivo.pbo> <destino> [padrão]
    python scripts/arma3/pbo.py find    <pasta> <padrão> [--limite N]

`padrão` é glob simples (fnmatch), casado sem diferenciar maiúsculas:
    python scripts/arma3/pbo.py find "C:/.../Arma 3/Addons" "*.paa" --limite 20
"""

import fnmatch
import os
import struct
import sys

PACK_CRU = 0x00000000
PACK_VERS = 0x56657273   # 'Vers' — entrada de propriedades do cabeçalho
PACK_LZSS = 0x43707273   # 'Cprs' — comprimido
PACK_CIFR = 0x456E6372   # 'Encr' — cifrado (não abrimos)


class ErroPBO(Exception):
    pass


def descomprimir_lzss(dados, tamanho_final):
    """LZSS da Bohemia (variante do Okumura): janela circular de 4096 bytes
    pré-preenchida com espaço. Um byte de flags controla os 8 itens seguintes:
    bit 1 = literal; bit 0 = par (posição de 12 bits, tamanho de 4 bits + 3)."""
    JANELA = 4096
    LIMIAR = 2
    buf = bytearray(b' ' * JANELA)
    r = JANELA - 18
    saida = bytearray()
    i = 0
    flags = 0
    n = len(dados)

    while len(saida) < tamanho_final:
        flags >>= 1
        if not (flags & 0x100):                    # acabaram os 8 bits: lê novo byte
            if i >= n:
                break
            flags = dados[i] | 0xFF00
            i += 1
        if flags & 1:                              # literal
            if i >= n:
                break
            c = dados[i]; i += 1
            saida.append(c)
            buf[r] = c
            r = (r + 1) % JANELA
        else:                                      # referência à janela
            if i + 1 >= n:
                break
            pos = dados[i]; tam = dados[i + 1]; i += 2
            pos |= (tam & 0xF0) << 4
            tam = (tam & 0x0F) + LIMIAR
            for k in range(tam + 1):
                if len(saida) >= tamanho_final:
                    break
                c = buf[(pos + k) % JANELA]
                saida.append(c)
                buf[r] = c
                r = (r + 1) % JANELA
    return bytes(saida)


class PBO:
    """Índice de um .pbo já aberto. Os dados só são lidos sob demanda."""

    def __init__(self, caminho):
        self.caminho = caminho
        self.propriedades = {}
        self.entradas = []                          # dicts: nome, packing, orig, tam, offset
        with open(caminho, 'rb') as f:
            self._ler_indice(f)

    def _ler_indice(self, f):
        bruto = f.read()
        i = 0
        primeira = True
        while True:
            fim = bruto.find(b'\0', i)
            if fim < 0:
                raise ErroPBO('índice truncado (sem terminador de nome)')
            nome = bruto[i:fim].decode('cp1252', 'replace')
            i = fim + 1
            if i + 20 > len(bruto):
                raise ErroPBO('índice truncado (sem os 5 campos)')
            packing, orig, _res, _ts, tam = struct.unpack_from('<5I', bruto, i)
            i += 20

            if nome == '' and packing == PACK_VERS and primeira:
                # cabeçalho de propriedades: pares chave/valor até string vazia
                while True:
                    fim = bruto.find(b'\0', i)
                    chave = bruto[i:fim].decode('cp1252', 'replace'); i = fim + 1
                    if chave == '':
                        break
                    fim = bruto.find(b'\0', i)
                    valor = bruto[i:fim].decode('cp1252', 'replace'); i = fim + 1
                    self.propriedades[chave.lower()] = valor
                primeira = False
                continue

            primeira = False
            if nome == '' and tam == 0:
                break                               # fim do índice
            self.entradas.append({
                'nome': nome.replace('\\', '/'),
                'packing': packing, 'orig': orig, 'tam': tam, 'offset': 0
            })

        # os blobs começam logo após o índice, na ordem das entradas
        pos = i
        for e in self.entradas:
            e['offset'] = pos
            pos += e['tam']
        self._bruto = bruto

    @property
    def prefixo(self):
        return self.propriedades.get('prefix', '')

    def listar(self, padrao=None):
        if not padrao:
            return list(self.entradas)
        p = padrao.lower()
        return [e for e in self.entradas if fnmatch.fnmatch(e['nome'].lower(), p)]

    def ler(self, entrada):
        """Devolve os bytes já descomprimidos de uma entrada."""
        if isinstance(entrada, str):
            alvo = entrada.replace('\\', '/').lower()
            achou = [e for e in self.entradas if e['nome'].lower() == alvo]
            if not achou:
                raise ErroPBO(f'entrada não encontrada: {entrada}')
            entrada = achou[0]
        dados = self._bruto[entrada['offset']:entrada['offset'] + entrada['tam']]
        if entrada['packing'] == PACK_CIFR:
            raise ErroPBO(f"entrada cifrada (não suportado): {entrada['nome']}")
        if entrada['packing'] == PACK_LZSS and entrada['orig'] and entrada['orig'] != entrada['tam']:
            return descomprimir_lzss(dados, entrada['orig'])
        return dados


def _humano(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or u == 'GB':
            return f'{n:.0f} {u}' if u == 'B' else f'{n:.1f} {u}'
        n /= 1024


def cmd_list(argv):
    pbo = PBO(argv[0])
    padrao = argv[1] if len(argv) > 1 else None
    itens = pbo.listar(padrao)
    print(f'# {os.path.basename(pbo.caminho)}  prefixo={pbo.prefixo!r}  '
          f'{len(itens)} de {len(pbo.entradas)} entradas')
    for e in itens:
        marca = 'LZSS' if e['packing'] == PACK_LZSS else ('CIFR' if e['packing'] == PACK_CIFR else '----')
        print(f'  {marca} {_humano(e["orig"] or e["tam"]):>9}  {e["nome"]}')


def cmd_extract(argv):
    if len(argv) < 2:
        raise SystemExit('uso: extract <arquivo.pbo> <destino> [padrão]')
    pbo = PBO(argv[0])
    destino = argv[1]
    itens = pbo.listar(argv[2] if len(argv) > 2 else None)
    ok = 0
    for e in itens:
        alvo = os.path.join(destino, e['nome'])
        os.makedirs(os.path.dirname(alvo), exist_ok=True)
        try:
            dados = pbo.ler(e)
        except ErroPBO as err:
            print(f'  ! {e["nome"]}: {err}', file=sys.stderr)
            continue
        with open(alvo, 'wb') as f:
            f.write(dados)
        ok += 1
    print(f'{ok} de {len(itens)} entradas extraídas de {os.path.basename(pbo.caminho)}')


def cmd_find(argv):
    """Varre uma árvore de .pbo procurando entradas que casem com o padrão."""
    if len(argv) < 2:
        raise SystemExit('uso: find <pasta> <padrão> [--limite N]')
    raiz, padrao = argv[0], argv[1]
    limite = 50
    if '--limite' in argv:
        limite = int(argv[argv.index('--limite') + 1])

    achados = 0
    lidos = 0
    for base, _dirs, arqs in os.walk(raiz):
        for a in arqs:
            if not a.lower().endswith('.pbo'):
                continue
            caminho = os.path.join(base, a)
            try:
                pbo = PBO(caminho)
            except Exception as err:                # PBO quebrado não derruba a varredura
                print(f'! {a}: {err}', file=sys.stderr)
                continue
            lidos += 1
            for e in pbo.listar(padrao):
                print(f'{caminho}::{e["nome"]}')
                achados += 1
                if achados >= limite:
                    print(f'--- limite de {limite} atingido ({lidos} pbos lidos)')
                    return
    print(f'--- {achados} entradas em {lidos} pbos')


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    cmd, argv = sys.argv[1], sys.argv[2:]
    if cmd == 'list':
        cmd_list(argv)
    elif cmd == 'extract':
        cmd_extract(argv)
    elif cmd == 'find':
        cmd_find(argv)
    else:
        raise SystemExit(f'comando desconhecido: {cmd}')


if __name__ == '__main__':
    main()
