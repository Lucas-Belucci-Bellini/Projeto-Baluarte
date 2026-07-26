#!/usr/bin/env python3
"""
Leitor de PBO (o container de addon do Arma 3) — Python puro, sem dependência.

Usado pela parte LOCAL da issue #398 pra alcançar os arquivos reais do jogo e
dos mods (ícones .paa, modelos .p3d). Formato documentado na BIKI ("PBO File
Format"), estável desde o Operation Flashpoint.

  Estrutura:
    [entradas do índice]   nome NUL-terminado + 5×uint32
                           (packing, tamanho_original, reservado, timestamp, tamanho)
    [fim do índice]        entrada de nome vazio e campos zerados
    [blobs]                os dados de cada entrada, na mesma ordem do índice
    [assinatura]           0x00 + SHA-1 de 20 bytes (ignorada aqui)

  packing: 0 → cru · 0x43707273 ('Cprs') → LZSS · 0x456e6372 ('Encr') → cifrado

A primeira entrada costuma ser o cabeçalho de propriedades (nome vazio, packing
'Vers') com pares chave/valor NUL-terminados — de lá sai o `prefix`, o caminho
virtual que o jogo usa (ex.: `a3\\weapons_f`). É a chave pra resolver um caminho
de config (`\\A3\\Weapons_F\\Data\\UI\\x_ca.paa`) até o PBO certo.

LEITURA PREGUIÇOSA: só o cabeçalho entra na memória; o conteúdo de cada entrada
é lido por seek sob demanda. Sem isso, indexar milhares de PBOs (vários com
GB) seria inviável.

Uso:
    python scripts/arma3/pbo.py list    <arquivo.pbo> [padrão]
    python scripts/arma3/pbo.py extract <arquivo.pbo> <destino> [padrão]
    python scripts/arma3/pbo.py find    <pasta> <padrão> [--limite N]
    python scripts/arma3/pbo.py index   <pasta> [<pasta>...]

`padrão` é glob simples (fnmatch), casado sem diferenciar maiúsculas.
"""

import fnmatch
import json
import os
import struct
import sys

PACK_CRU = 0x00000000
PACK_VERS = 0x56657273   # 'Vers' — entrada de propriedades do cabeçalho
PACK_LZSS = 0x43707273   # 'Cprs' — comprimido
PACK_CIFR = 0x456E6372   # 'Encr' — cifrado (não abrimos)

_BLOCO = 1 << 16         # 64 KB por leitura ao varrer o cabeçalho


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
    """Índice de um .pbo. Só o cabeçalho fica em memória."""

    def __init__(self, caminho):
        self.caminho = caminho
        self.propriedades = {}
        self.entradas = []                          # nome, packing, orig, tam, offset
        self._ler_indice()

    # -- cabeçalho ------------------------------------------------------
    def _ler_indice(self):
        with open(self.caminho, 'rb') as f:
            buf = bytearray(f.read(_BLOCO))
            i = 0
            primeira = True

            def garantir(n):
                """Garante n bytes disponíveis a partir de i (lê mais se preciso)."""
                nonlocal buf
                while len(buf) - i < n:
                    extra = f.read(_BLOCO)
                    if not extra:
                        return False
                    buf += extra
                return True

            def ler_str():
                nonlocal i
                while True:
                    fim = buf.find(b'\0', i)
                    if fim >= 0:
                        s = buf[i:fim].decode('cp1252', 'replace')
                        i = fim + 1
                        return s
                    if not garantir(len(buf) - i + 1):
                        raise ErroPBO('cabeçalho truncado (sem terminador)')

            while True:
                nome = ler_str()
                if not garantir(20):
                    raise ErroPBO('cabeçalho truncado (sem os 5 campos)')
                packing, orig, _res, _ts, tam = struct.unpack_from('<5I', buf, i)
                i += 20

                if nome == '' and packing == PACK_VERS and primeira:
                    while True:                     # pares chave/valor até string vazia
                        chave = ler_str()
                        if chave == '':
                            break
                        self.propriedades[chave.lower()] = ler_str()
                    primeira = False
                    continue

                primeira = False
                if nome == '' and tam == 0:
                    break                           # fim do índice
                self.entradas.append({
                    'nome': nome.replace('\\', '/'),
                    'packing': packing, 'orig': orig, 'tam': tam, 'offset': 0
                })

            pos = i                                 # os blobs começam aqui
            for e in self.entradas:
                e['offset'] = pos
                pos += e['tam']

    # -- acesso ---------------------------------------------------------
    @property
    def prefixo(self):
        return self.propriedades.get('prefix', '')

    def listar(self, padrao=None):
        if not padrao:
            return list(self.entradas)
        p = padrao.lower()
        return [e for e in self.entradas if fnmatch.fnmatch(e['nome'].lower(), p)]

    def achar(self, caminho_interno):
        """Acha uma entrada pelo caminho interno (sem o prefixo), sem case."""
        alvo = caminho_interno.replace('\\', '/').lower().lstrip('/')
        for e in self.entradas:
            if e['nome'].lower() == alvo:
                return e
        return None

    def ler(self, entrada):
        """Bytes já descomprimidos de uma entrada (nome ou dict)."""
        if isinstance(entrada, str):
            achado = self.achar(entrada)
            if not achado:
                raise ErroPBO(f'entrada não encontrada: {entrada}')
            entrada = achado
        if entrada['packing'] == PACK_CIFR:
            raise ErroPBO(f"entrada cifrada (não suportado): {entrada['nome']}")
        with open(self.caminho, 'rb') as f:
            f.seek(entrada['offset'])
            dados = f.read(entrada['tam'])
        if entrada['packing'] == PACK_LZSS and entrada['orig'] and entrada['orig'] != entrada['tam']:
            return descomprimir_lzss(dados, entrada['orig'])
        return dados


def indexar(raizes, quieto=False):
    """Varre árvores de .pbo e devolve {prefixo_minusculo: [caminhos_de_pbo]}.

    O prefixo é o que liga um caminho de config ao arquivo real: o config diz
    `\\A3\\Weapons_F\\Data\\UI\\x_ca.paa` e o PBO com prefixo `a3\\weapons_f`
    é quem tem `Data/UI/x_ca.paa` dentro.

    É uma LISTA por prefixo de propósito: mods dividem o conteúdo em vários
    PBOs que declaram o MESMO prefixo (um com os modelos, outro com as
    texturas). Guardar só o primeiro deixava ~1000 armas sem ícone."""
    indice = {}
    lidos = falhas = 0
    for raiz in raizes:
        if not os.path.isdir(raiz):
            continue
        for base, _dirs, arqs in os.walk(raiz):
            for a in arqs:
                if not a.lower().endswith('.pbo'):
                    continue
                caminho = os.path.join(base, a)
                try:
                    pbo = PBO(caminho)
                except Exception:
                    falhas += 1
                    continue
                lidos += 1
                pref = (pbo.prefixo or '').replace('/', '\\').lower().strip('\\')
                if pref:
                    indice.setdefault(pref, []).append(caminho)
    if not quieto:
        print(f'# {lidos} pbos lidos, {len(indice)} prefixos, {falhas} ilegíveis',
              file=sys.stderr)
    return indice


def _humano(n):
    for u in ('B', 'KB', 'MB', 'GB'):
        if n < 1024 or u == 'GB':
            return f'{n:.0f} {u}' if u == 'B' else f'{n:.1f} {u}'
        n /= 1024


def cmd_list(argv):
    pbo = PBO(argv[0])
    itens = pbo.listar(argv[1] if len(argv) > 1 else None)
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
    if len(argv) < 2:
        raise SystemExit('uso: find <pasta> <padrão> [--limite N]')
    raiz, padrao = argv[0], argv[1]
    limite = int(argv[argv.index('--limite') + 1]) if '--limite' in argv else 50
    achados = lidos = 0
    for base, _dirs, arqs in os.walk(raiz):
        for a in arqs:
            if not a.lower().endswith('.pbo'):
                continue
            caminho = os.path.join(base, a)
            try:
                pbo = PBO(caminho)
            except Exception as err:
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


def cmd_index(argv):
    print(json.dumps(indexar(argv), ensure_ascii=False, indent=1))


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        raise SystemExit(1)
    cmd, argv = sys.argv[1], sys.argv[2:]
    acoes = {'list': cmd_list, 'extract': cmd_extract, 'find': cmd_find, 'index': cmd_index}
    if cmd not in acoes:
        raise SystemExit(f'comando desconhecido: {cmd}')
    acoes[cmd](argv)


if __name__ == '__main__':
    main()
