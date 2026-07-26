#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-itens.sqf e monta o JSON dos itens.

Cobre o que o dump de ARMAS deixava de fora: miras, silenciadores, bipés,
lanternas/lasers, uniformes, coletes, capacetes, NVG, binóculos, óculos
(CfgGlasses) e mochilas (CfgVehicles isBackpack).

    1. no jogo:  cole scripts/arma3/dump-itens.sqf no debug console
    2. aqui:     python scripts/arma3/parse-itens.py
    3. saída:    scripts/arma3/out/arma3-itens.json

FORMATO v1 — linhas curtas de propósito (o diag_log trunca em 1012):
    I |classe|nome|typeArma|fonte|typeItemInfo|desc
    IP|classe|picture|model|massaItemInfo|massa
    IX|classe|<cadeia de herança>   (em pedaços)
    IC|classe|containerClass|maximumLoad
    IU|classe|uniformClass
    IA|classe|<hitpoint:armor:passThrough;...>   (em pedaços)
    IO|classe|<modo:zoomMin:zoomMax:zoomInit:visionMode;...>  (em pedaços)
    ID|classe|<discreteDistance>    (em pedaços)
    IS|classe|hit|initSpeed|audibleFire|visibleFire   (AmmoCoef do silenciador)
    G |classe|nome|fonte|massa|picture
    B |classe|nome|fonte|maximumLoad|massa|picture

Honestidade (regra da #398): todo valor vem do config do jogo em execução.
Campo vazio no dump = o config não declara = `null`, nunca zero.

`categoriaSugerida` é o ÚNICO campo inferido, e está marcado como tal. Os
códigos de `ItemInfo >> type` que dá pra confirmar no config dos addons são
801 (uniforme), 701 (colete), 605 (capacete) e 616 (NVG); os de mira,
silenciador e bipé moram no config raiz da engine (Dta/bin.pbo), fora dos
addons, então esses saem da cadeia de herança — nunca de constante chutada.
"""

import json
import os
import sys

MARCA = '<<A3ITEM>>'
LIMITE_LOG = 1012
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-itens.json')

# Confirmados no config real dos addons (characters_f / weapons_f de-rapificados)
TIPO_ITEMINFO = {801: 'uniforme', 701: 'colete', 605: 'capacete', 616: 'nvg'}

# Bases da engine — a herança é o sinal confiável pros acessórios
BASE_CATEGORIA = [
    ('inventoryopticsitem_base_f', 'mira'),
    ('inventorymuzzleitem_base_f', 'silenciador'),
    ('inventorybipoditem_base_f', 'bipe'),
    ('inventoryflashlightitem_base_f', 'lanterna'),
    ('rangefinder', 'binoculo'),
    ('binocular', 'binoculo'),
    ('inventoryitem_base_f', 'item'),
]


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
            'nenhum .rpt com dump de itens encontrado.\n'
            'Rode o scripts/arma3/dump-itens.sqf no debug console do jogo primeiro.')
    cands.sort(reverse=True)
    return cands[0][2]


def num(s):
    if s is None or s == '':
        return None
    try:
        return float(s)
    except ValueError:
        return None


def limpo(v):
    if v is None:
        return None
    if isinstance(v, float) and v == int(v):
        return int(v)
    return round(v, 6) if isinstance(v, float) else v


def texto(s):
    return s if s else None


def categoria(item):
    """INFERIDO. Número verificado primeiro; depois a cadeia de herança;
    por último a forma do próprio registro. Sem chute de constante."""
    t = item.get('itemInfoType')
    if t is not None and int(t) in TIPO_ITEMINFO:
        return TIPO_ITEMINFO[int(t)]
    chain = [b.lower() for b in item.get('heranca') or []]
    for base, cat in BASE_CATEGORIA:
        if base in chain:
            return cat
    if item.get('oticas'):
        return 'mira'
    if item.get('coefSilenciador'):
        return 'silenciador'
    if item.get('protecao'):
        return 'protecao'
    return None


def parse_prot(bruto):
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 3:
            continue
        saida.append({'parte': texto(c[0]), 'armor': limpo(num(c[1])),
                      'passThrough': limpo(num(c[2]))})
    return saida


def parse_oticas(bruto):
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 4:
            continue
        saida.append({
            'modo': texto(c[0]),
            'zoomMin': limpo(num(c[1])), 'zoomMax': limpo(num(c[2])),
            'zoomInit': limpo(num(c[3])),
            'visao': c[4].split('/') if len(c) > 4 and c[4] else None,
        })
    return saida


def novo_item(classe):
    return {'classe': classe, 'nome': None, 'fonte': None, 'descricao': None,
            'tipoArma': None, 'itemInfoType': None,
            'picture': None, 'model': None, 'massa': None,
            'containerClass': None, 'capacidade': None, 'uniformeDe': None,
            'protecao': None, 'oticas': None, 'distancias': None,
            'coefSilenciador': None,
            '_her': '', '_prot': '', '_ot': '', '_dist': ''}


def ler_rpt(caminho):
    itens, oculos, mochilas = {}, {}, {}
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
                itens, oculos, mochilas = {}, {}, {}
                truncadas = 0
                versao = c[0] if c else '?'
                continue
            if tipo == 'FIM':
                fim = c
                continue
            if not c or not c[0]:
                continue
            classe = c[0]

            if tipo == 'I' and len(c) >= 6:
                it = novo_item(classe)
                it['nome'] = texto(c[1]) or classe
                it['tipoArma'] = limpo(num(c[2]))
                it['fonte'] = texto(c[3])
                it['itemInfoType'] = limpo(num(c[4]))
                it['descricao'] = texto(c[5])
                itens[classe] = it
            elif tipo == 'G' and len(c) >= 5:
                oculos[classe] = {
                    'classe': classe, 'nome': texto(c[1]) or classe,
                    'fonte': texto(c[2]), 'massa': limpo(num(c[3])),
                    'picture': texto(c[4]),
                }
            elif tipo == 'B' and len(c) >= 6:
                mochilas[classe] = {
                    'classe': classe, 'nome': texto(c[1]) or classe,
                    'fonte': texto(c[2]), 'capacidade': limpo(num(c[3])),
                    'massa': limpo(num(c[4])), 'picture': texto(c[5]),
                }
            elif classe not in itens:
                continue                       # sem o I| não há onde pendurar
            elif tipo == 'IP' and len(c) >= 5:
                it = itens[classe]
                it['picture'] = texto(c[1])
                it['model'] = texto(c[2])
                # a massa mora no ItemInfo; alguns itens usam só o campo do topo
                it['massa'] = limpo(num(c[3]))
                if it['massa'] is None:
                    it['massa'] = limpo(num(c[4]))
            elif tipo == 'IX' and len(c) >= 2:
                itens[classe]['_her'] += c[1]
            elif tipo == 'IC' and len(c) >= 3:
                itens[classe]['containerClass'] = texto(c[1])
                itens[classe]['capacidade'] = limpo(num(c[2]))
            elif tipo == 'IU' and len(c) >= 2:
                itens[classe]['uniformeDe'] = texto(c[1])
            elif tipo == 'IA' and len(c) >= 2:
                itens[classe]['_prot'] += c[1]
            elif tipo == 'IO' and len(c) >= 2:
                itens[classe]['_ot'] += c[1]
            elif tipo == 'ID' and len(c) >= 2:
                itens[classe]['_dist'] += c[1]
            elif tipo == 'IS' and len(c) >= 5:
                itens[classe]['coefSilenciador'] = {
                    'hit': limpo(num(c[1])), 'initSpeed': limpo(num(c[2])),
                    'audibleFire': limpo(num(c[3])), 'visibleFire': limpo(num(c[4])),
                }

    return itens, oculos, mochilas, fim, truncadas, versao


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    itens, oculos, mochilas, fim, truncadas, versao = ler_rpt(caminho)

    if versao != 'v1':
        raise SystemExit(
            f'esse .rpt é de um dump de itens {versao or "desconhecido"}.\n'
            'Rode o dump de novo com o scripts/arma3/dump-itens.sqf atual.')
    if not itens and not oculos and not mochilas:
        raise SystemExit('o arquivo tem a marca do dump mas nada foi lido — '
                         'o script rodou até o fim no jogo?')

    for it in itens.values():
        it['heranca'] = [x for x in it.pop('_her').split(';') if x] or None
        it['protecao'] = parse_prot(it.pop('_prot')) or None
        it['oticas'] = parse_oticas(it.pop('_ot')) or None
        it['distancias'] = [limpo(num(d)) for d in it.pop('_dist').split(';') if d] or None
        it['categoriaSugerida'] = categoria(it)

    saida = {
        'fonte': os.path.basename(caminho),
        'itens': dict(sorted(itens.items())),
        'oculos': dict(sorted(oculos.items())),
        'mochilas': dict(sorted(mochilas.items())),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    print(f'\nitens .......... {len(itens)}')
    print(f'óculos ......... {len(oculos)}')
    print(f'mochilas ....... {len(mochilas)}')
    if fim and len(fim) >= 4:
        print(f'(o jogo contou {fim[0]}/{fim[1]}/{fim[2]} em {fim[3]}s)')
        contados = num(fim[0])
        if contados is not None and int(contados) != len(itens):
            print(f'  ATENÇÃO: {int(contados) - len(itens)} itens não chegaram aqui')
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')

    porcat, semcat = {}, 0
    for it in itens.values():
        k = it['categoriaSugerida'] or '?'
        porcat[k] = porcat.get(k, 0) + 1
        if it['categoriaSugerida'] is None:
            semcat += 1
    print('\npor categoria sugerida (INFERIDA):')
    for k, n in sorted(porcat.items(), key=lambda x: -x[1]):
        print(f'  {k:14} {n}')
    if semcat:
        print(f'  ({semcat} sem categoria — herança não bateu com base conhecida)')

    com_img = sum(1 for it in itens.values() if it['picture'])
    print(f'\ncom imagem no config: {com_img} de {len(itens)}')
    print(f'escrito: {SAIDA}')


if __name__ == '__main__':
    main()
