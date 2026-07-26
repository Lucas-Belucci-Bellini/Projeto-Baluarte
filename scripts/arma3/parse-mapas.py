#!/usr/bin/env python3
"""
Lê o dump gerado por scripts/arma3/dump-mapas.sqf e monta o JSON dos terrenos.

Fluxo (issue #398, parte LOCAL):
    1. no jogo:  cole scripts/arma3/dump-mapas.sqf no debug console
    2. aqui:     python scripts/arma3/parse-mapas.py
    3. saída:    scripts/arma3/out/arma3-mapas.json

Sem argumento, acha sozinho o .rpt mais recente que contenha um dump de mapas.

FORMATO v1 — registro quebrado em linhas curtas de propósito: o diag_log trunca
em 1012 caracteres (na v1 do dump de ARMAS isso comeu 11% dos dados em silêncio).
    W  |classe|nome|autor|fonte|mapSize|longitude|latitude|elevationOffset
    WP |classe|pictureMap|pictureShot|icon
    WW |classe|wrp|plateFormat|plateLetters|mapZone|startTime|startDate
    WC |classe|centroX|centroY|ancoraX|ancoraY|raioSeguro
    WG |classe|offsetX|offsetY
    WGZ|classe|<zooms>       (em pedaços; concatenados na ordem do log)
    WA |classe|<aeroportos>  (idem)
    WLN|classe|total de localidades que o jogo contou
    WL |classe|<localidades> (idem)

Honestidade (regra da #398): todo valor vem do config do jogo em execução.
Campo vazio no dump = o config NÃO declara = `null` aqui, nunca zero. O dump usa
`isNumber` justamente pra separar "vale zero" de "ausente".

O que NÃO existe no config, e por isso não aparece aqui:
  - área de TERRA (os "270 km² de Altis"). O config só dá `mapSize`, o lado do
    quadrado do terreno; 30720 m -> 943,7 km² de quadrado, não de terra firme.
    São números diferentes e misturá-los seria mentir na tabela.
"""

import json
import os
import sys

MARCA = '<<A3MAPA>>'
LIMITE_LOG = 1012          # onde o .rpt corta; serve de alarme de truncamento
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-mapas.json')


def achar_rpt():
    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')
    if not os.path.isdir(base):
        raise SystemExit(f'pasta de logs não encontrada: {base}')
    cands = []
    for a in os.listdir(base):
        if not a.lower().endswith('.rpt'):
            continue
        p = os.path.join(base, a)
        # linha a linha: o .rpt de uma sessão longa passa de 1 GB e f.read()
        # estoura a memória (já aconteceu aqui)
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
            'nenhum .rpt com dump de mapas encontrado.\n'
            'Rode o scripts/arma3/dump-mapas.sqf no debug console do jogo primeiro.')
    cands.sort(reverse=True)
    return cands[0][2]


def num(s):
    """float, ou None se o campo veio vazio (= o config não declara)."""
    if s is None or s == '':
        return None
    try:
        return float(s)
    except ValueError:
        return None


def limpo(v):
    """0.0 vira 0 (int) pra o JSON não encher de casa decimal inútil."""
    if v is None:
        return None
    if isinstance(v, float) and v == int(v):
        return int(v)
    return round(v, 6) if isinstance(v, float) else v


def texto(s):
    """Texto vazio no dump = campo ausente no config = None."""
    return s if s else None


def novo_mundo(classe):
    return {
        'classe': classe, 'nome': None, 'autor': None, 'fonte': None,
        'tamanhoM': None, 'longitude': None, 'latitude': None,
        'elevationOffset': None,
        'pictureMap': None, 'pictureShot': None, 'icon': None,
        'wrp': None, 'placaFormato': None, 'placaLetras': None,
        'mapZone': None, 'horaInicial': None, 'dataInicial': None,
        'centro': None, 'ancoraSegura': None, 'raioSeguro': None,
        'grid': {'offsetX': None, 'offsetY': None, 'zooms': []},
        'aeroportos': [], 'localidades': [],
        'totalLocalidadesJogo': None,
        '_zooms': '', '_aero': '', '_locais': '',
    }


def parse_zooms(bruto):
    """'0.2:XY:000:000:100:-100;...' -> lista de dicts."""
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 6:
            continue
        saida.append({
            # sem limpo(): o zoomMax do último nível é 1e30 (o "infinito" do
            # config) e virar int escreveria 31 dígitos de lixo no JSON
            'zoomMax': num(c[0]),
            'formato': texto(c[1]), 'formatoX': texto(c[2]), 'formatoY': texto(c[3]),
            'passoX': limpo(num(c[4])), 'passoY': limpo(num(c[5])),
        })
    return saida


def parse_aeroportos(bruto):
    """'principal:14382.4:15924.6:-0.694:-0.719;Airstrip_1:...' -> lista."""
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 3:
            continue
        saida.append({
            'nome': texto(c[0]),
            'x': limpo(num(c[1])), 'y': limpo(num(c[2])),
            'dirX': limpo(num(c[3])) if len(c) > 3 else None,
            'dirY': limpo(num(c[4])) if len(c) > 4 else None,
        })
    return saida


def parse_locais(bruto):
    """'Kavala:NameCityCapital:3660:13236:250:250;...' -> lista."""
    saida = []
    for parte in filter(None, bruto.split(';')):
        c = parte.split(':')
        if len(c) < 4:
            continue
        saida.append({
            'nome': texto(c[0]), 'tipo': texto(c[1]),
            'x': limpo(num(c[2])), 'y': limpo(num(c[3])),
            'raioA': limpo(num(c[4])) if len(c) > 4 else None,
            'raioB': limpo(num(c[5])) if len(c) > 5 else None,
        })
    return saida


def ler_rpt(caminho):
    """Devolve (mundos, fim, truncadas, versao)."""
    mundos = {}
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
                # O .rpt é o log da SESSÃO inteira: se o dump rodou mais de uma
                # vez, o arquivo tem vários blocos. Só o último vale.
                mundos = {}
                truncadas = 0
                versao = c[0] if c else '?'
                continue

            if tipo == 'FIM':
                fim = c
                continue

            if not c or not c[0]:
                continue
            classe = c[0]

            if tipo == 'W' and len(c) >= 8:
                m = novo_mundo(classe)
                m['nome'] = texto(c[1]) or classe
                m['autor'] = texto(c[2])
                m['fonte'] = texto(c[3])
                m['tamanhoM'] = limpo(num(c[4]))
                m['longitude'] = limpo(num(c[5]))
                m['latitude'] = limpo(num(c[6]))
                m['elevationOffset'] = limpo(num(c[7]))
                mundos[classe] = m
            elif classe not in mundos:
                continue                      # sem o W| não há onde pendurar
            elif tipo == 'WP' and len(c) >= 4:
                mundos[classe]['pictureMap'] = texto(c[1])
                mundos[classe]['pictureShot'] = texto(c[2])
                mundos[classe]['icon'] = texto(c[3])
            elif tipo == 'WW' and len(c) >= 7:
                m = mundos[classe]
                m['wrp'] = texto(c[1])
                m['placaFormato'] = texto(c[2])
                m['placaLetras'] = texto(c[3])
                m['mapZone'] = limpo(num(c[4]))
                m['horaInicial'] = texto(c[5])
                m['dataInicial'] = texto(c[6])
            elif tipo == 'WC' and len(c) >= 6:
                m = mundos[classe]
                cx, cy = num(c[1]), num(c[2])
                ax, ay = num(c[3]), num(c[4])
                m['centro'] = [limpo(cx), limpo(cy)] if None not in (cx, cy) else None
                m['ancoraSegura'] = [limpo(ax), limpo(ay)] if None not in (ax, ay) else None
                m['raioSeguro'] = limpo(num(c[5]))
            elif tipo == 'WG' and len(c) >= 3:
                mundos[classe]['grid']['offsetX'] = limpo(num(c[1]))
                mundos[classe]['grid']['offsetY'] = limpo(num(c[2]))
            elif tipo == 'WGZ' and len(c) >= 2:
                mundos[classe]['_zooms'] += c[1]        # pedaços na ordem do log
            elif tipo == 'WA' and len(c) >= 2:
                mundos[classe]['_aero'] += c[1]
            elif tipo == 'WL' and len(c) >= 2:
                mundos[classe]['_locais'] += c[1]
            elif tipo == 'WLN' and len(c) >= 2:
                mundos[classe]['totalLocalidadesJogo'] = limpo(num(c[1]))

    return mundos, fim, truncadas, versao


def resolver(mundos):
    """Fecha cada mundo: junta os pedaços e calcula os DERIVADOS marcados."""
    divergentes = 0
    for m in mundos.values():
        m['grid']['zooms'] = parse_zooms(m.pop('_zooms'))
        m['aeroportos'] = parse_aeroportos(m.pop('_aero'))
        m['localidades'] = parse_locais(m.pop('_locais'))

        # DERIVADO: o quadrado do terreno, NÃO a área de terra firme.
        m['areaQuadradoKm2'] = (round((m['tamanhoM'] / 1000.0) ** 2, 1)
                                if m['tamanhoM'] else None)
        # DERIVADO: o passo mais fino do grid, em metros.
        passos = [abs(z['passoX']) for z in m['grid']['zooms']
                  if z['passoX'] not in (None, 0)]
        m['gridMenorPassoM'] = limpo(min(passos)) if passos else None

        contagem = {}
        for loc in m['localidades']:
            t = loc['tipo'] or '?'
            contagem[t] = contagem.get(t, 0) + 1
        m['localidadesPorTipo'] = dict(sorted(contagem.items(), key=lambda x: -x[1]))
        m['totalLocalidades'] = len(m['localidades'])

        esperado = m.pop('totalLocalidadesJogo')
        if esperado is not None and esperado != m['totalLocalidades']:
            divergentes += 1
            m['_avisoLocalidades'] = (f'o jogo contou {esperado}, '
                                      f'chegaram {m["totalLocalidades"]}')
    return divergentes


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    mundos, fim, truncadas, versao = ler_rpt(caminho)

    if versao != 'v1':
        raise SystemExit(
            f'esse .rpt é de um dump de mapas {versao or "desconhecido"}.\n'
            'Rode o dump de novo com o scripts/arma3/dump-mapas.sqf atual.')
    if not mundos:
        raise SystemExit('o arquivo tem a marca do dump mas nenhum mundo foi lido — '
                         'o script rodou até o fim no jogo?')

    divergentes = resolver(mundos)

    saida = {
        'fonte': os.path.basename(caminho),
        'mundos': dict(sorted(mundos.items(), key=lambda x: x[0].lower())),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    # --- relatório ---
    com_tam = sum(1 for m in mundos.values() if m['tamanhoM'])
    com_img = sum(1 for m in mundos.values() if m['pictureMap'] or m['pictureShot'])
    print(f'\nmundos ............. {len(mundos)}')
    print(f'com tamanho real ... {com_tam} ({100 * com_tam // max(len(mundos), 1)}%)')
    print(f'com miniatura ...... {com_img}')
    print(f'localidades ........ {sum(m["totalLocalidades"] for m in mundos.values())}')
    print(f'aeroportos ......... {sum(len(m["aeroportos"]) for m in mundos.values())}')
    if fim and len(fim) >= 3:
        print(f'(o jogo contou {fim[0]} mundos / {fim[1]} localidades em {fim[2]}s)')
        contados = num(fim[0])
        if contados is not None and int(contados) != len(mundos):
            print(f'  ATENÇÃO: {int(contados) - len(mundos)} mundos não chegaram aqui')
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')
    if divergentes:
        print(f'  ATENÇÃO: {divergentes} mundos com contagem de localidades divergente '
              f'(veja _avisoLocalidades no JSON)')

    maiores = sorted((m for m in mundos.values() if m['tamanhoM']),
                     key=lambda m: -m['tamanhoM'])[:12]
    print('\nmaiores terrenos (lado do quadrado, do config):')
    for m in maiores:
        print(f'  {(m["nome"] or "?")[:32]:34} {m["tamanhoM"]:>6} m  '
              f'{m["areaQuadradoKm2"]:>8} km2  {m["totalLocalidades"]:>4} loc')

    porfonte = {}
    for m in mundos.values():
        porfonte[m['fonte'] or '?'] = porfonte.get(m['fonte'] or '?', 0) + 1
    print('\ntop 12 fontes (mod/DLC):')
    for k, n in sorted(porfonte.items(), key=lambda x: -x[1])[:12]:
        print(f'  {k:38} {n}')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
