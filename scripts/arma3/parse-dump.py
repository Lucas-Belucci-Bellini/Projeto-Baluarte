#!/usr/bin/env python3
"""
Lê o dump gerado por scripts/arma3/dump-config.sqf e monta o JSON das armas.

Fluxo (issue #398, parte LOCAL):
    1. no jogo:  cole scripts/arma3/dump-config.sqf no debug console
    2. aqui:     python scripts/arma3/parse-dump.py
    3. saída:    scripts/arma3/out/arma3-config.json

Sem argumento, acha sozinho o .rpt mais recente em %LOCALAPPDATA%\\Arma 3 que
contenha um dump completo. Passe um caminho pra forçar outro arquivo.

Honestidade (regra da #398): tudo aqui é valor lido do config do jogo em
execução — nada é estimado. O único campo inferido é `tipoSugerido`, marcado
como tal, porque "fuzil x DMR x sniper" é classificação editorial, não config.
"""

import json
import os
import sys

MARCA = '<<A3DUMP>>'
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-config.json')

TIPO_ARMA = {1: 'primaria', 2: 'pistola', 4: 'lancador'}


def achar_rpt():
    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')
    if not os.path.isdir(base):
        raise SystemExit(f'pasta de logs não encontrada: {base}')
    cands = []
    for a in os.listdir(base):
        if not a.lower().endswith('.rpt'):
            continue
        p = os.path.join(base, a)
        try:
            with open(p, encoding='cp1252', errors='replace') as f:
                txt = f.read()
        except OSError:
            continue
        if MARCA in txt:
            cands.append((MARCA + 'FIM' in txt, os.path.getmtime(p), p))
    if not cands:
        raise SystemExit(
            'nenhum .rpt com dump encontrado.\n'
            'Rode o scripts/arma3/dump-config.sqf no debug console do jogo primeiro.')
    cands.sort(reverse=True)          # 1º os que terminaram (FIM), depois o mais novo
    return cands[0][2]


def num(s, padrao=0.0):
    try:
        return float(s)
    except (TypeError, ValueError):
        return padrao


def limpo(v):
    """0.0 vira 0 (int) pra o JSON não encher de casa decimal inútil."""
    if isinstance(v, float) and v == int(v):
        return int(v)
    return round(v, 6) if isinstance(v, float) else v


def parse_modos(bruto):
    """'Single:0.086:0.0011:0:0;FullAuto:0.075:0.0015:1:0' -> lista de dicts."""
    modos = []
    for parte in filter(None, bruto.split(';')):
        campos = parte.split(':')
        if len(campos) < 5:
            continue
        rt = num(campos[1])
        modos.append({
            'nome': campos[0],
            'reloadTime': limpo(rt),
            'rpm': int(round(60.0 / rt)) if rt > 0 else None,
            'dispersao': limpo(num(campos[2])),
            'auto': bool(num(campos[3])),
            'rajada': int(num(campos[4])),
        })
    return modos


def sugerir_tipo(arma, mag, ammo):
    """Classificação EDITORIAL (não vem do config) pra tabela estilo Fallout.
    Usa o tipo real do config + cadência + capacidade + calibre como pistas."""
    if arma['tipo'] == 4:
        return 'lancador'
    if arma['tipo'] == 2:
        return 'pistola'
    cap = mag.get('count', 0) if mag else 0
    rpm = max([m['rpm'] or 0 for m in arma['modos']] or [0])
    auto = any(m['auto'] for m in arma['modos'])
    cal = ammo.get('caliber', 0) if ammo else 0
    v0 = mag.get('initSpeed', 0) if mag else 0

    if cap >= 100:
        return 'lmg'
    if not auto and cap <= 12 and v0 >= 800:
        return 'sniper'
    if not auto and v0 >= 780:
        return 'dmr'
    if v0 and v0 < 500 and rpm >= 700:
        return 'smg'
    if auto and cap >= 60:
        return 'lmg'
    if cal and cal >= 1.6 and not auto:
        return 'sniper'
    return 'fuzil'


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    armas, mags, ammos = {}, {}, {}
    fim = None
    with open(caminho, encoding='cp1252', errors='replace') as f:
        for linha in f:
            i = linha.find(MARCA)
            if i < 0:
                continue
            corpo = linha[i + len(MARCA):].rstrip('\n\r "')
            tipo, _, resto = corpo.partition('|')
            c = resto.split('|')

            if tipo == 'W' and len(c) >= 12:
                armas[c[0]] = {
                    'classe': c[0], 'nome': c[1], 'tipo': int(num(c[2])),
                    'tipoNome': TIPO_ARMA.get(int(num(c[2])), '?'),
                    'fonte': c[3], 'picture': c[4], 'model': c[5],
                    'massa': limpo(num(c[6])), 'maxZeroing': int(num(c[7])),
                    'initSpeedArma': limpo(num(c[8])),
                    'magazines': [m for m in c[9].split(';') if m],
                    'modos': parse_modos(c[10]),
                    'descricao': c[11],
                }
            elif tipo == 'M' and len(c) >= 7:
                mags[c[0].lower()] = {
                    'classe': c[0], 'nome': c[1], 'ammo': c[2],
                    'count': int(num(c[3])), 'initSpeed': limpo(num(c[4])),
                    'massa': limpo(num(c[5])), 'fonte': c[6],
                }
            elif tipo == 'A' and len(c) >= 12:
                ammos[c[0].lower()] = {
                    'classe': c[0], 'hit': limpo(num(c[1])),
                    'indirectHit': limpo(num(c[2])), 'indirectHitRange': limpo(num(c[3])),
                    'caliber': limpo(num(c[4])), 'airFriction': limpo(num(c[5])),
                    'typicalSpeed': limpo(num(c[6])), 'explosivo': bool(num(c[7])),
                    'ricochete': bool(num(c[8])), 'visibleFire': limpo(num(c[9])),
                    'audibleFire': limpo(num(c[10])), 'model': c[11],
                }
            elif tipo == 'FIM':
                fim = c

    if not armas:
        raise SystemExit('o arquivo tem a marca do dump mas nenhuma arma foi lida — '
                         'o script rodou até o fim no jogo?')

    # --- resolve cada arma: carregador padrão -> munição -> balística ---
    sem_balistica = 0
    for a in armas.values():
        mag = next((mags[m] for m in a['magazines'] if m in mags), None)
        ammo = ammos.get(mag['ammo'].lower()) if mag else None
        a['carregadorPadrao'] = mag['classe'] if mag else None
        a['capacidade'] = mag['count'] if mag else None
        # v0 efetivo: a arma pode multiplicar (valor negativo) ou fixar o initSpeed
        v0 = mag['initSpeed'] if mag else 0
        mult = a['initSpeedArma']
        if mult and mult < 0 and v0:
            v0 = round(v0 * -mult, 1)
        elif mult and mult > 0:
            v0 = mult
        a['v0'] = limpo(v0) if v0 else None
        a['municao'] = ammo['classe'] if ammo else None
        a['dano'] = ammo['hit'] if ammo else None
        a['airFriction'] = ammo['airFriction'] if ammo else None
        a['caliber'] = ammo['caliber'] if ammo else None
        a['rpm'] = max([m['rpm'] or 0 for m in a['modos']] or [0]) or None
        a['tipoSugerido'] = sugerir_tipo(a, mag, ammo)
        if a['airFriction'] is None or not a['v0']:
            sem_balistica += 1

    saida = {
        'fonte': os.path.basename(caminho),
        'armas': dict(sorted(armas.items())),
        'carregadores': dict(sorted(mags.items())),
        'municoes': dict(sorted(ammos.items())),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    # --- relatório ---
    print(f'\narmas .......... {len(armas)}')
    print(f'carregadores ... {len(mags)}')
    print(f'munições ....... {len(ammos)}')
    if fim and len(fim) >= 4:
        print(f'(o jogo contou {fim[0]}/{fim[1]}/{fim[2]} em {fim[3]}s)')
    print(f'\nsem balística completa: {sem_balistica} '
          f'({100 * sem_balistica // max(len(armas), 1)}%)')

    porfonte, portipo = {}, {}
    for a in armas.values():
        porfonte[a['fonte'] or '?'] = porfonte.get(a['fonte'] or '?', 0) + 1
        portipo[a['tipoSugerido']] = portipo.get(a['tipoSugerido'], 0) + 1
    print('\npor tipo sugerido:')
    for t, n in sorted(portipo.items(), key=lambda x: -x[1]):
        print(f'  {t:10} {n}')
    print('\ntop 12 fontes (mod/DLC):')
    for m, n in sorted(porfonte.items(), key=lambda x: -x[1])[:12]:
        print(f'  {m:22} {n}')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
