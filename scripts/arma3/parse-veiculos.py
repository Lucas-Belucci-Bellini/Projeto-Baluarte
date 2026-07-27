#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-veiculos.sqf e monta o JSON de veículos,
soldados e facções.

    1. no jogo:  cole scripts/arma3/dump-veiculos.sqf no debug console
    2. aqui:     python scripts/arma3/parse-veiculos.py
    3. saída:    scripts/arma3/out/arma3-veiculos.json

FORMATO v1 — linhas curtas de propósito (o diag_log trunca em 1012):
    F |classe|nome|side|fonte
    U |classe|nome|fonte|faccao|side|subcategoria
    UP|classe|uniformClass|backpack|icon|editorPreview
    UW|classe|<armas>      UM|classe|<carregadores>   UI|classe|<linkedItems>
    V |classe|nome|vehicleClass|fonte|faccao|side|crew
    VP|classe|picture|editorPreview|model|icon
    VC|classe|maxSpeed|fuelCapacity|transportSoldier|maximumLoad|armor|armorStructural
    VD|classe|cost|mass|enginePower|terrainCoef
    VX|classe|<heranca>   VW|classe|<armas>   VM|classe|<carregadores>
    VT|classe|<hitpoint:armor:passThrough;...>

Honestidade (regra da #398): todo valor vem do config do jogo em execução.
Campo vazio no dump = o config não declara = `null`, nunca zero. Isso importa
especialmente em `armor`: `armor: null` é "não sabemos", `armor: 0` seria
"não tem blindagem nenhuma".

LIMITE CONHECIDO: o dump lê só o PRIMEIRO nível de `Turrets`. Torre dentro de
torre (comandante em cima do artilheiro, típico de tanque) não entra na lista
de armas. Não é estimativa nem bug silencioso — está registrado aqui.

`lado` traduz o número do config (0 OPFOR, 1 BLUFOR, 2 Independente,
3 Civil) e vem de CfgFactionClasses; facção sem `side` declarado fica `null`.
"""

import json
import os
import sys

MARCA = '<<A3VEIC>>'
LIMITE_LOG = 1012
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-veiculos.json')

# Numeração de side do config do Arma 3
LADO = {0: 'OPFOR', 1: 'BLUFOR', 2: 'Independente', 3: 'Civil'}

# CfgVehicles guarda TUDO que o editor posiciona: prédio, ruína, caixa de
# munição, módulo e prop entram junto com os veículos. Sem separar isso, dizer
# "24.261 veículos" seria enganoso — a maioria é cenário.
#
# Os tokens abaixo saíram da cadeia de herança REAL do dump (as bases mais
# frequentes entre os 24.261 registros), não de memória. A ordem de busca é a
# da própria herança (pai imediato -> raiz), então o primeiro token que casa é
# sempre o mais específico: um tanque bate em `tank_f` antes de `landvehicle`.
CLASSE_VEICULO = {
    'tank': 'blindado', 'tank_f': 'blindado',
    'car': 'terrestre', 'car_f': 'terrestre', 'truck_f': 'terrestre',
    'motorcycle': 'terrestre', 'landvehicle': 'terrestre',
    'helicopter': 'aereo', 'plane': 'aereo', 'plane_base_f': 'aereo',
    'air': 'aereo',
    'ship': 'naval', 'ship_f': 'naval', 'boat_f': 'naval',
    'staticweapon': 'estatico',
    'reammobox': 'caixa', 'reammobox_f': 'caixa',
    'weaponholder': 'suporteDeItem',
    'module_f': 'modulo', 'logic': 'modulo',
    'ruins': 'estrutura', 'wall': 'estrutura', 'wall_f': 'estrutura',
    'house': 'estrutura', 'housebase': 'estrutura', 'house_f': 'estrutura',
    'house_small_f': 'estrutura', 'building': 'estrutura',
    'nonstrategic': 'estrutura', 'strategic': 'estrutura', 'static': 'estrutura',
    'thing': 'objeto', 'thingx': 'objeto',
}

# As que contam como veículo de verdade pra tabela da wiki
CLASSES_VEICULO_REAL = {'blindado', 'terrestre', 'aereo', 'naval', 'estatico'}


def classe_veiculo(heranca):
    """INFERIDO da cadeia de herança real do config. None quando nenhuma base
    conhecida aparece — nunca um chute."""
    for b in heranca or []:
        c = CLASSE_VEICULO.get(b.lower())
        if c:
            return c
    return None


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
            'nenhum .rpt com dump de veículos encontrado.\n'
            'Rode o scripts/arma3/dump-veiculos.sqf no debug console primeiro.')
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


def nome_lado(n):
    return LADO.get(int(n)) if n is not None else None


def lista(bruto):
    return [x for x in bruto.split(';') if x] or None


def parse_hp(bruto):
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 3:
            continue
        saida.append({'parte': texto(c[0]), 'armor': limpo(num(c[1])),
                      'passThrough': limpo(num(c[2]))})
    return saida


def novo_veiculo(classe):
    return {'classe': classe, 'nome': None, 'categoriaEditor': None, 'fonte': None,
            'faccao': None, 'lado': None, 'tripulacao': None,
            'picture': None, 'editorPreview': None, 'model': None, 'icon': None,
            'maxSpeed': None, 'combustivel': None, 'lotacao': None,
            'cargaMax': None, 'armor': None, 'armorStructural': None,
            'custo': None, 'massa': None, 'potencia': None, 'terrainCoef': None,
            '_her': '', '_armas': '', '_mags': '', '_hp': ''}


def novo_soldado(classe):
    return {'classe': classe, 'nome': None, 'fonte': None, 'faccao': None,
            'lado': None, 'subcategoria': None, 'uniforme': None,
            'mochila': None, 'icon': None, 'editorPreview': None,
            '_armas': '', '_mags': '', '_itens': ''}


def ler_rpt(caminho):
    veic, sold, facs = {}, {}, {}
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
                veic, sold, facs = {}, {}, {}
                truncadas = 0
                versao = c[0] if c else '?'
                continue
            if tipo == 'FIM':
                fim = c
                continue
            if not c or not c[0]:
                continue
            classe = c[0]

            if tipo == 'F' and len(c) >= 4:
                n = num(c[2])
                facs[classe] = {'classe': classe, 'nome': texto(c[1]) or classe,
                                'side': limpo(n), 'lado': nome_lado(n),
                                'fonte': texto(c[3])}
            elif tipo == 'U' and len(c) >= 6:
                s = novo_soldado(classe)
                s['nome'] = texto(c[1]) or classe
                s['fonte'] = texto(c[2])
                s['faccao'] = texto(c[3])
                s['lado'] = nome_lado(num(c[4]))
                s['subcategoria'] = texto(c[5])
                sold[classe] = s
            elif tipo == 'V' and len(c) >= 7:
                v = novo_veiculo(classe)
                v['nome'] = texto(c[1]) or classe
                v['categoriaEditor'] = texto(c[2])
                v['fonte'] = texto(c[3])
                v['faccao'] = texto(c[4])
                v['lado'] = nome_lado(num(c[5]))
                v['tripulacao'] = texto(c[6])
                veic[classe] = v
            elif tipo == 'UP' and len(c) >= 5 and classe in sold:
                s = sold[classe]
                s['uniforme'] = texto(c[1])
                s['mochila'] = texto(c[2])
                s['icon'] = texto(c[3])
                s['editorPreview'] = texto(c[4])
            elif tipo == 'UW' and len(c) >= 2 and classe in sold:
                sold[classe]['_armas'] += c[1]
            elif tipo == 'UM' and len(c) >= 2 and classe in sold:
                sold[classe]['_mags'] += c[1]
            elif tipo == 'UI' and len(c) >= 2 and classe in sold:
                sold[classe]['_itens'] += c[1]
            elif classe not in veic:
                continue                       # sem o V| não há onde pendurar
            elif tipo == 'VP' and len(c) >= 5:
                v = veic[classe]
                v['picture'] = texto(c[1])
                v['editorPreview'] = texto(c[2])
                v['model'] = texto(c[3])
                v['icon'] = texto(c[4])
            elif tipo == 'VC' and len(c) >= 7:
                v = veic[classe]
                v['maxSpeed'] = limpo(num(c[1]))
                v['combustivel'] = limpo(num(c[2]))
                v['lotacao'] = limpo(num(c[3]))
                v['cargaMax'] = limpo(num(c[4]))
                v['armor'] = limpo(num(c[5]))
                v['armorStructural'] = limpo(num(c[6]))
            elif tipo == 'VD' and len(c) >= 5:
                v = veic[classe]
                v['custo'] = limpo(num(c[1]))
                v['massa'] = limpo(num(c[2]))
                v['potencia'] = limpo(num(c[3]))
                v['terrainCoef'] = limpo(num(c[4]))
            elif tipo == 'VX' and len(c) >= 2:
                veic[classe]['_her'] += c[1]
            elif tipo == 'VW' and len(c) >= 2:
                veic[classe]['_armas'] += c[1]
            elif tipo == 'VM' and len(c) >= 2:
                veic[classe]['_mags'] += c[1]
            elif tipo == 'VT' and len(c) >= 2:
                veic[classe]['_hp'] += c[1]

    return veic, sold, facs, fim, truncadas, versao


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    veic, sold, facs, fim, truncadas, versao = ler_rpt(caminho)

    if versao != 'v1':
        raise SystemExit(
            f'esse .rpt é de um dump de veículos {versao or "desconhecido"}.\n'
            'Rode o dump de novo com o scripts/arma3/dump-veiculos.sqf atual.')
    if not veic and not sold:
        raise SystemExit('o arquivo tem a marca do dump mas nada foi lido — '
                         'o script rodou até o fim no jogo?')

    for v in veic.values():
        v['heranca'] = lista(v.pop('_her'))
        v['armas'] = lista(v.pop('_armas'))
        v['carregadores'] = lista(v.pop('_mags'))
        v['hitpoints'] = parse_hp(v.pop('_hp')) or None
        v['classeVeiculo'] = classe_veiculo(v['heranca'])
        v['ehVeiculo'] = v['classeVeiculo'] in CLASSES_VEICULO_REAL
    for s in sold.values():
        s['armas'] = lista(s.pop('_armas'))
        s['carregadores'] = lista(s.pop('_mags'))
        s['itensLigados'] = lista(s.pop('_itens'))

    saida = {
        'fonte': os.path.basename(caminho),
        'veiculos': dict(sorted(veic.items())),
        'soldados': dict(sorted(sold.items())),
        'faccoes': dict(sorted(facs.items())),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    reais = [v for v in veic.values() if v['ehVeiculo']]
    print(f'\nregistros CfgVehicles ... {len(veic)}')
    print(f'  VEÍCULO de verdade .... {len(reais)}')
    print(f'  cenário/caixa/módulo .. {len(veic) - len(reais)}')
    print(f'soldados ....... {len(sold)}')
    print(f'facções ........ {len(facs)}')
    if fim and len(fim) >= 4:
        print(f'(o jogo contou {fim[0]}/{fim[1]}/{fim[2]} em {fim[3]}s)')
        contados = num(fim[0])
        if contados is not None and int(contados) != len(veic):
            print(f'  ATENÇÃO: {int(contados) - len(veic)} veículos não chegaram aqui')
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')

    sem_armor = sum(1 for v in veic.values() if v['armor'] is None)
    com_img = sum(1 for v in veic.values() if v['picture'] or v['editorPreview'])
    print(f'\ncom imagem no config: {com_img} de {len(veic)}')
    print(f'sem armor declarado: {sem_armor} (ficam null, não zero)')

    porclasse = {}
    for v in veic.values():
        k = v['classeVeiculo'] or '?'
        porclasse[k] = porclasse.get(k, 0) + 1
    print('\npor classe (INFERIDA da herança do config):')
    for k, n in sorted(porclasse.items(), key=lambda x: -x[1]):
        marca = ' <- veiculo' if k in CLASSES_VEICULO_REAL else ''
        print(f'  {k:16} {n}{marca}')

    porlado = {}
    for v in reais:
        k = v['lado'] or '?'
        porlado[k] = porlado.get(k, 0) + 1
    print('\nveículos de verdade por lado:')
    for k, n in sorted(porlado.items(), key=lambda x: -x[1]):
        print(f'  {k:14} {n}')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
