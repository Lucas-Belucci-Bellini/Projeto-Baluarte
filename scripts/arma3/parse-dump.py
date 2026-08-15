#!/usr/bin/env python3
"""
Lê o dump gerado por scripts/arma3/dump-config.sqf e monta o JSON das armas.

Fluxo (issue #398, parte LOCAL):
    1. no jogo:  cole scripts/arma3/dump-config.sqf no debug console
    2. aqui:     python scripts/arma3/parse-dump.py
    3. saída:    scripts/arma3/out/arma3-config.json

Sem argumento, acha sozinho o .rpt mais recente em %LOCALAPPDATA%\\Arma 3 que
contenha um dump completo. Passe um caminho pra forçar outro arquivo.

FORMATO v2 — o registro de arma vem quebrado em linhas curtas de propósito: o
diag_log do jogo trunca em 1012 caracteres, e na v1 isso comia 11% das armas em
silêncio (as com muitos carregadores compatíveis). Agora:
    W |classe|nome|tipo|fonte|massa|zeroing|initSpeed|desc
    WP|classe|picture|model
    WM|classe|<carregadores>      (em pedaços; concatenados na ordem do log)
    WF|classe|<modos de tiro>     (idem)
    M |classe|nome|ammo|count|initSpeed|massa|fonte
    A |classe|hit|indHit|indRange|caliber|airFriction|typicalSpeed|expl|defl|vis|aud

Honestidade (regra da #398): tudo aqui é valor lido do config do jogo em
execução — nada é estimado. O único campo inferido é `tipoSugerido`, marcado
como tal, porque "fuzil x DMR x sniper" é classificação editorial, não config.
"""

import json
import os
import sys

MARCA = '<<A3DUMP>>'
LIMITE_LOG = 1012          # onde o .rpt corta; serve de alarme de truncamento

# Linhas que este parser ignora DE PROPÓSITO. `ARREMESSO|Throw|N` conta os
# carregadores que Throw e Put puxam; é diagnóstico para quem abre o `.rpt` à
# mão — os carregadores em si chegam pelas linhas `M|`, então lê-la de novo
# duplicaria dado. Declarado em vez de omitido porque `testar-parsers.py` cobra
# que todo tipo emitido pelo `.sqf` tenha destino: sem esta linha, "ninguém lê"
# seria indistinguível de "alguém esqueceu".
IGNORADOS = {'ARREMESSO'}
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
        # linha a linha: o .rpt de uma sessão longa passa de 1 GB e f.read()
        # estoura a memória (já aconteceu aqui)
        tem = v2 = completo = False
        try:
            with open(p, encoding='cp1252', errors='replace') as f:
                for linha in f:
                    if MARCA not in linha:
                        continue
                    tem = True
                    if MARCA + 'INICIO|v2' in linha:
                        v2 = True
                    elif MARCA + 'FIM' in linha:
                        completo = True
        except OSError:
            continue
        if tem:
            # prioriza dump v2, depois dump completo, depois o mais recente
            cands.append((v2, completo, os.path.getmtime(p), p))
    if not cands:
        raise SystemExit(
            'nenhum .rpt com dump encontrado.\n'
            'Rode o scripts/arma3/dump-config.sqf no debug console do jogo primeiro.')
    cands.sort(reverse=True)
    return cands[0][3]


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


def ler_rpt(caminho):
    """Devolve (armas, mags, ammos, fim, truncadas, versao)."""
    armas, mags, ammos = {}, {}, {}
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
                # vez, o arquivo tem vários blocos. Só o último vale — zerar aqui
                # evita misturar formatos (uma linha v1 tem 12 campos e passaria
                # pelo filtro do W|, com os campos todos trocados de lugar).
                armas, mags, ammos = {}, {}, {}
                truncadas = 0
                versao = c[0] if c else '?'
            elif tipo == 'W' and len(c) >= 8:
                armas[c[0]] = {
                    'classe': c[0], 'nome': c[1], 'tipo': int(num(c[2])),
                    'tipoNome': TIPO_ARMA.get(int(num(c[2])), '?'),
                    'fonte': c[3], 'massa': limpo(num(c[4])),
                    'maxZeroing': int(num(c[5])), 'initSpeedArma': limpo(num(c[6])),
                    'descricao': c[7],
                    'picture': '', 'model': '', '_mags': '', '_modos': '',
                }
            elif tipo == 'WP' and len(c) >= 3 and c[0] in armas:
                armas[c[0]]['picture'] = c[1]
                armas[c[0]]['model'] = c[2]
            elif tipo == 'WM' and len(c) >= 2 and c[0] in armas:
                armas[c[0]]['_mags'] += c[1]          # pedaços na ordem do log
            elif tipo == 'WF' and len(c) >= 2 and c[0] in armas:
                armas[c[0]]['_modos'] += c[1]
            elif tipo == 'M' and len(c) >= 7:
                mags[c[0].lower()] = {
                    'classe': c[0], 'nome': c[1], 'ammo': c[2],
                    'count': int(num(c[3])), 'initSpeed': limpo(num(c[4])),
                    'massa': limpo(num(c[5])), 'fonte': c[6],
                }
            elif tipo == 'A' and len(c) >= 11:
                ammos[c[0].lower()] = {
                    'classe': c[0], 'hit': limpo(num(c[1])),
                    'indirectHit': limpo(num(c[2])), 'indirectHitRange': limpo(num(c[3])),
                    'caliber': limpo(num(c[4])), 'airFriction': limpo(num(c[5])),
                    'typicalSpeed': limpo(num(c[6])), 'explosivo': bool(num(c[7])),
                    'ricochete': bool(num(c[8])), 'visibleFire': limpo(num(c[9])),
                    'audibleFire': limpo(num(c[10])),
                }
            elif tipo == 'FIM':
                fim = c

    return armas, mags, ammos, fim, truncadas, versao


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    armas, mags, ammos, fim, truncadas, versao = ler_rpt(caminho)

    if versao != 'v2':
        raise SystemExit(
            f'esse .rpt é de um dump {versao or "antigo"}, e o formato mudou.\n'
            'Rode o dump de novo no jogo com o scripts/arma3/dump-config.sqf atual\n'
            '(a v1 perdia 11% das armas por truncamento do log).')
    if not armas:
        raise SystemExit('o arquivo tem a marca do dump mas nenhuma arma foi lida — '
                         'o script rodou até o fim no jogo?')

    # --- resolve cada arma: carregador padrão -> munição -> balística ---
    sem_balistica = 0
    for a in armas.values():
        a['magazines'] = [m for m in a.pop('_mags').split(';') if m]
        a['modos'] = parse_modos(a.pop('_modos'))

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
        contadas = int(num(fim[0]))
        print(f'(o jogo contou {fim[0]}/{fim[1]}/{fim[2]} em {fim[3]}s)')
        if contadas != len(armas):
            print(f'  ATENÇÃO: {contadas - len(armas)} armas do jogo não chegaram aqui')
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')

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
        print(f'  {m:38} {n}')
    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
