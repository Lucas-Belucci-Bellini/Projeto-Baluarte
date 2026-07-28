#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-acessorios.sqf e monta a matriz de
compatibilidade **arma × acessório**, slot por slot.

    1. no jogo:  cole scripts/arma3/dump-acessorios.sqf no debug console
    2. aqui:     python scripts/arma3/parse-acessorios.py
    3. saída:    scripts/arma3/out/arma3-acessorios.json

FORMATO v1:
    S |arma|slot|<itens compatíveis>   (em pedaços; concatenados na ordem)
    SV|arma|slot                       (slot existe, mas sem compatibleItems)
    N |arma|quantos slots com item
    FIM|nArmas|nPares|segundos

O slot vem do config: `MuzzleSlot` (silenciador), `CowsSlot` (mira),
`PointerSlot` (laser/lanterna), `UnderBarrelSlot` (bipé). Mod pode criar outros
— nada aqui é lista fixa: o que aparecer no config aparece no JSON.

POR QUE AGRUPA: a matriz crua é enorme (10 mil armas × dezenas de acessórios),
mas fortemente repetida — toda variante de camo de um fuzil aceita exatamente
os mesmos acessórios. Então listas idênticas viram UM grupo e cada arma guarda
só o id do grupo. Sem perda: `grupos[id]` devolve a lista inteira.

Honestidade (regra da #398): a lista é a que o config declara.
  - `slotsVazios` é diferente de "não tem slot". O slot existe na arma mas o
    config não lista `compatibleItems` — normalmente o mod deixa isso a cargo
    do CBA. Marcar como "não aceita nada" seria mentira, então fica num campo
    separado.
  - `totalCompativeis` é contagem de itens efetivamente listados, não
    estimativa.
"""

import json
import os
import sys

MARCA = '<<A3ACC>>'
LIMITE_LOG = 1012
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-acessorios.json')


def achar_rpt():
    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')
    if not os.path.isdir(base):
        raise SystemExit(f'pasta de logs não encontrada: {base}')
    cands = []
    for a in os.listdir(base):
        if not a.lower().endswith('.rpt'):
            continue
        p = os.path.join(base, a)
        tem = completo = False
        try:
            with open(p, encoding='cp1252', errors='replace') as f:
                for linha in f:
                    if MARCA not in linha:
                        continue
                    tem = True
                    if MARCA + 'FIM' in linha:
                        completo = True
        except OSError:
            continue
        if tem:
            cands.append((completo, os.path.getmtime(p), p))
    if not cands:
        raise SystemExit(
            'nenhum .rpt com dump de acessórios encontrado.\n'
            'Rode o scripts/arma3/dump-acessorios.sqf no debug console primeiro.')
    cands.sort(reverse=True)
    return cands[0][2]


def ler_rpt(caminho):
    """Devolve (armas, fim, truncadas, versao)."""
    armas = {}
    fim, versao, truncadas = None, None, 0

    with open(caminho, encoding='cp1252', errors='replace') as f:
        for linha in f:
            i = linha.find(MARCA)
            if i < 0:
                continue
            corpo = linha[i + len(MARCA):].rstrip('\n\r "')
            if len(corpo) >= LIMITE_LOG:
                truncadas += 1
            tipo, _, resto = corpo.partition('|')
            c = resto.split('|')

            if tipo == 'INICIO':
                # o .rpt guarda a sessão inteira; só o último dump vale
                armas = {}
                truncadas = 0
                versao = c[0] if c else '?'
                continue
            if tipo == 'FIM':
                fim = c
                continue
            if not c or not c[0]:
                continue
            if tipo == 'ENGINE':
                continue                       # flag da sonda; o FIM já conta

            arma = armas.setdefault(c[0], {'_slots': {}, '_engine': '',
                                           'slotsVazios': [],
                                           'nSlotsJogo': None})

            if tipo == 'SE' and len(c) >= 3:
                arma['_engine'] += c[2]        # pedaços na ordem do log
            elif tipo == 'S' and len(c) >= 3:
                # pedaços na ordem do log: concatena o texto do MESMO slot
                arma['_slots'][c[1]] = arma['_slots'].get(c[1], '') + c[2]
            elif tipo == 'SV' and len(c) >= 2:
                if c[1] not in arma['slotsVazios']:
                    arma['slotsVazios'].append(c[1])
            elif tipo == 'N' and len(c) >= 2:
                try:
                    arma['nSlotsJogo'] = int(float(c[1]))
                except ValueError:
                    pass

    return armas, fim, truncadas, versao


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    armas, fim, truncadas, versao = ler_rpt(caminho)

    if versao not in ('v1', 'v2'):
        raise SystemExit(
            f'esse .rpt é de um dump de acessórios {versao or "desconhecido"}.\n'
            'Rode o dump de novo com o scripts/arma3/dump-acessorios.sqf atual.')
    if not armas:
        raise SystemExit('o arquivo tem a marca do dump mas nenhuma arma foi lida — '
                         'o script rodou até o fim no jogo?')

    grupos, por_chave = {}, {}
    saida_armas, porcompat = {}, {}
    divergentes = 0

    for classe, dados in sorted(armas.items()):
        slots = {}
        for slot, bruto in sorted(dados['_slots'].items()):
            itens = [x for x in bruto.split(';') if x]
            if not itens:
                continue
            chave = '\n'.join(itens)          # lista idêntica -> mesmo grupo
            gid = por_chave.get(chave)
            if gid is None:
                gid = f'g{len(por_chave) + 1}'
                por_chave[chave] = gid
                grupos[gid] = itens
            slots[slot] = gid
            for it in itens:
                porcompat[it] = porcompat.get(it, 0) + 1

        total = sum(len(grupos[g]) for g in slots.values())

        # lista resolvida pelo ENGINE (comando compatibleItems). Cobre o que o
        # config deixa vazio — mod que delega ao CBA aparece aqui e não lá.
        # Em troca, é uma lista achatada: não diz em QUAL slot cada item entra.
        eng = [x for x in dados['_engine'].split(';') if x]
        gid_eng = None
        if eng:
            chave = '\n'.join(eng)
            gid_eng = por_chave.get(chave)
            if gid_eng is None:
                gid_eng = f'g{len(por_chave) + 1}'
                por_chave[chave] = gid_eng
                grupos[gid_eng] = eng
            for it in eng:
                porcompat[it] = porcompat.get(it, 0) + 1

        if dados['nSlotsJogo'] is not None and dados['nSlotsJogo'] != len(slots):
            divergentes += 1
        saida_armas[classe] = {
            'slots': slots,
            'slotsVazios': dados['slotsVazios'] or None,
            'totalCompativeis': total,
            'compativeisEngine': gid_eng,
            'totalEngine': len(eng),
        }

    saida = {
        'fonte': os.path.basename(caminho),
        'grupos': grupos,
        'armas': saida_armas,
        'porAcessorio': dict(sorted(porcompat.items(), key=lambda x: -x[1])),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    pares = sum(a['totalCompativeis'] for a in saida_armas.values())
    com_slot = sum(1 for a in saida_armas.values() if a['slots'])
    com_eng = sum(1 for a in saida_armas.values() if a['totalEngine'])
    pares_eng = sum(a['totalEngine'] for a in saida_armas.values())
    n = max(len(saida_armas), 1)
    print(f'\narmas .................. {len(saida_armas)}')
    print(f'  slot no CONFIG ....... {com_slot} ({100 * com_slot // n}%)')
    print(f'  lista do ENGINE ...... {com_eng} ({100 * com_eng // n}%)')
    print(f'pares do config ........ {pares}')
    print(f'pares do engine ........ {pares_eng}')
    print(f'grupos distintos ....... {len(grupos)} '
          f'(a matriz repete muito: variantes de camo aceitam o mesmo conjunto)')
    print(f'acessórios distintos ... {len(porcompat)}')
    if fim and len(fim) >= 3:
        print(f'(o jogo contou {fim[0]} armas / {fim[1]} pares em {fim[2]}s)')
        try:
            if int(float(fim[0])) != len(saida_armas):
                print(f'  ATENÇÃO: {int(float(fim[0])) - len(saida_armas)} armas '
                      f'não chegaram aqui')
            if int(float(fim[1])) != pares:
                print(f'  ATENÇÃO: o jogo contou {fim[1]} pares, montei {pares} '
                      f'— pode ter linha cortada')
        except ValueError:
            pass
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')
    if divergentes:
        print(f'  ATENÇÃO: {divergentes} armas com contagem de slots divergente')

    porslot = {}
    for a in saida_armas.values():
        for slot in a['slots']:
            porslot[slot] = porslot.get(slot, 0) + 1
    print('\narmas por slot (nome do config):')
    for s, n in sorted(porslot.items(), key=lambda x: -x[1])[:12]:
        print(f'  {s:22} {n}')

    print('\ntop 10 acessórios mais compatíveis:')
    for it, n in list(saida['porAcessorio'].items())[:10]:
        print(f'  {it:34} entra em {n} armas')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
