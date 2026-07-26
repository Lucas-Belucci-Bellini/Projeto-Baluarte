#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-catalogo.sqf e monta o JSON do catálogo.

O `parse-dump.py` cobre ARMAS (CfgWeapons type 1/2/4 + carregadores + munição).
Este cobre TODO O RESTO do que o operador vê no Arsenal:

    veículos · soldados · mochilas · miras/ópticas · acessórios de boca e
    apontadores · bipés · uniformes · coletes · capacetes · visão noturna ·
    binóculos · GPS/bússola/rádio/relógio · óculos · armamento estático

Fluxo:
    1. no jogo:  cole scripts/arma3/dump-catalogo.sqf no debug console
    2. aqui:     python scripts/arma3/parse-catalogo.py
    3. saída:    scripts/arma3/out/arma3-catalogo.json

FORMATO v1 — mesmas armadilhas do dump de armas, mesmas defesas:
    V |classe|nome|categoria|fonte|side|faccao|scope
    VP|classe|picture|model
    VD|classe|armor|maxSpeed|fuel|transportSoldier|crashProt|mass   (veículo)
    VT|classe|<armas do veículo>            (em pedaços)
    VH|classe|uniformClass|armor|engineer|attendant                 (soldado)
    VW|classe|<armas do soldado>            (em pedaços)
    VB|classe|maximumLoad|mass                                      (mochila)
    I |classe|nome|tipoItem|fonte|massa|tipoNum
    IP|classe|picture|model
    ID|classe|<descriptionShort>            (em pedaços)
    IO|classe|<modos de óptica>             (em pedaços)
    IA|classe|<proteção por hitpoint>       (em pedaços)
    IC|classe|containerClass|maximumLoad
    G |classe|nome|fonte|picture|massa

--------------------------------------------------------------------------
AUSENTE ≠ ZERO — a diferença que o `getNumber` do SQF apaga
--------------------------------------------------------------------------
`getNumber` devolve 0 pra propriedade que NÃO EXISTE. Com ele, um veículo sem
`armor` declarado e um veículo com `armor = 0` saem idênticos do jogo, e o
JSON passaria a afirmar "blindagem zero" sobre coisa que o config simplesmente
não diz.

Por isso o `dump-catalogo.sqf` NÃO usa `getNumber` direto nos campos de dado:
usa o helper `_fnc_n`, que testa `isNumber` antes e emite string VAZIA quando a
propriedade não existe. Aqui, campo vazio vira `None` — não 0.

É a mesma regra da #398 (`hit: null` é "não sabemos", `hit: 0` é "não causa
dano"), aplicada a um lugar onde ela é fácil de perder sem perceber.
"""

import json
import os
import sys

MARCA = '<<A3CAT>>'
LIMITE_LOG = 1012
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-catalogo.json')

# side do CfgVehicles. 3 = civil, 8 = ambiente/vazio.
LADO = {0: 'CSAT (leste)', 1: 'OTAN (oeste)', 2: 'AAF/guerrilha', 3: 'civil', 8: 'sem lado'}


def achar_rpt():
    """O .rpt mais recente que contenha um dump de catálogo COMPLETO."""
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
            # linha a linha: .rpt de sessão longa passa de 1 GB
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
            'nenhum .rpt com dump de catálogo encontrado.\n'
            'Rode o scripts/arma3/dump-catalogo.sqf no debug console do jogo primeiro.')
    cands.sort(reverse=True)
    return cands[0][2]


def n(s):
    """Número do dump, ou None. String vazia = propriedade ausente no config
    (o dump já distinguiu com isNumber). NUNCA devolve 0 pra ausente."""
    if s is None or s == '':
        return None
    try:
        v = float(s)
    except (TypeError, ValueError):
        return None
    return int(v) if v == int(v) else round(v, 6)


def lista(bruto):
    return [x for x in (bruto or '').split(';') if x]


def parse_opticas(bruto):
    """'Scope:0.25:0.0623:2:Normal+NVG;...' -> lista de modos de mira.
    zoom do Arma é FOV em radianos: quanto MENOR, mais ampliado. A conversão
    pra 'x vezes' usa o FOV padrão do olho (0.75) como referência."""
    modos = []
    for parte in lista(bruto):
        c = parte.split(':')
        if len(c) < 5:
            continue
        zmin, zmax = n(c[1]), n(c[2])
        modos.append({
            'nome': c[0],
            'fovMin': zmin,
            'fovMax': zmax,
            # FOV menor = mais zoom. 0.75 rad é o campo de visão sem mira.
            'zoomMax': round(0.75 / zmin, 2) if zmin else None,
            'zoomMin': round(0.75 / zmax, 2) if zmax else None,
            'zeragemIdx': n(c[3]),
            'visao': [v for v in c[4].split('+') if v],
        })
    return modos


def parse_protecao(bruto):
    """'HitChest:0.5:0.3;HitHead:0:0.5' -> proteção por ponto do corpo.
    `armor` é o quanto o item absorve; `passThrough` é a fração que ATRAVESSA
    (0 = para tudo, 1 = não protege nada). Os dois vêm do config, sem mistura."""
    prot = []
    for parte in lista(bruto):
        c = parte.split(':')
        if len(c) < 3:
            continue
        prot.append({'ponto': c[0], 'armor': n(c[1]), 'passThrough': n(c[2])})
    return prot


def ler_rpt(caminho):
    """Devolve (veiculos, itens, oculos, fim, truncadas, versao)."""
    veiculos, itens, oculos = {}, {}, {}
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
                # O .rpt guarda a sessão inteira. Zerar aqui garante que só o
                # ÚLTIMO dump conta — misturar dois é como o formato v1 das
                # armas perdeu 11% em silêncio.
                veiculos, itens, oculos = {}, {}, {}
                truncadas = 0
                versao = c[0] if c else '?'

            elif tipo == 'V' and len(c) >= 7:
                veiculos[c[0]] = {
                    'classe': c[0], 'nome': c[1], 'categoria': c[2], 'fonte': c[3],
                    'side': n(c[4]), 'lado': LADO.get(n(c[4])), 'faccao': c[5],
                    'scope': n(c[6]), 'picture': '', 'model': '',
                    'armor': None, 'maxSpeed': None, 'fuelCapacity': None,
                    'transporte': None, 'protecaoTripulacao': None, 'massa': None,
                    'uniformClass': None, 'engenheiro': None, 'medico': None,
                    'capacidade': None, '_armas': '',
                }
            elif tipo == 'VP' and len(c) >= 3 and c[0] in veiculos:
                veiculos[c[0]]['picture'] = c[1]
                veiculos[c[0]]['model'] = c[2]
            elif tipo == 'VD' and len(c) >= 7 and c[0] in veiculos:
                veiculos[c[0]].update({
                    'armor': n(c[1]), 'maxSpeed': n(c[2]), 'fuelCapacity': n(c[3]),
                    'transporte': n(c[4]), 'protecaoTripulacao': n(c[5]), 'massa': n(c[6]),
                })
            elif tipo == 'VH' and len(c) >= 5 and c[0] in veiculos:
                veiculos[c[0]].update({
                    'uniformClass': c[1] or None, 'armor': n(c[2]),
                    'engenheiro': bool(n(c[3])), 'medico': bool(n(c[4])),
                })
            elif tipo == 'VB' and len(c) >= 3 and c[0] in veiculos:
                veiculos[c[0]].update({'capacidade': n(c[1]), 'massa': n(c[2])})
            elif tipo in ('VT', 'VW') and len(c) >= 2 and c[0] in veiculos:
                veiculos[c[0]]['_armas'] += c[1]      # pedaços na ordem do log

            elif tipo == 'I' and len(c) >= 6:
                itens[c[0]] = {
                    'classe': c[0], 'nome': c[1], 'categoria': c[2], 'fonte': c[3],
                    'massa': n(c[4]), 'tipoNum': n(c[5]),
                    'picture': '', 'model': '', '_desc': '', '_opticas': '', '_prot': '',
                    'containerClass': None, 'capacidade': None,
                }
            elif tipo == 'IP' and len(c) >= 3 and c[0] in itens:
                itens[c[0]]['picture'] = c[1]
                itens[c[0]]['model'] = c[2]
            elif tipo == 'ID' and len(c) >= 2 and c[0] in itens:
                itens[c[0]]['_desc'] += c[1]
            elif tipo == 'IO' and len(c) >= 2 and c[0] in itens:
                itens[c[0]]['_opticas'] += c[1]
            elif tipo == 'IA' and len(c) >= 2 and c[0] in itens:
                itens[c[0]]['_prot'] += c[1]
            elif tipo == 'IC' and len(c) >= 3 and c[0] in itens:
                itens[c[0]]['containerClass'] = c[1] or None
                itens[c[0]]['capacidade'] = n(c[2])

            elif tipo == 'G' and len(c) >= 5:
                oculos[c[0]] = {
                    'classe': c[0], 'nome': c[1], 'fonte': c[2],
                    'picture': c[3], 'massa': n(c[4]), 'categoria': 'oculos',
                }
            elif tipo == 'FIM':
                fim = c

    return veiculos, itens, oculos, fim, truncadas, versao


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')
    veiculos, itens, oculos, fim, truncadas, versao = ler_rpt(caminho)

    if not veiculos and not itens and not oculos:
        raise SystemExit('nenhum registro de catálogo no arquivo — o dump rodou até o fim?')

    for v in veiculos.values():
        v['armas'] = lista(v.pop('_armas'))
    for it in itens.values():
        it['descricao'] = it.pop('_desc')
        it['opticas'] = parse_opticas(it.pop('_opticas'))
        it['protecao'] = parse_protecao(it.pop('_prot'))

    doc = {
        'fonte': os.path.basename(caminho),
        'versaoDump': versao,
        'veiculos': veiculos,
        'itens': itens,
        'oculos': oculos,
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, indent=1)

    relatorio(veiculos, itens, oculos, fim, truncadas)


def relatorio(veiculos, itens, oculos, fim, truncadas):
    from collections import Counter
    print(f'\nveículos/soldados/mochilas  {len(veiculos)}')
    for k, q in Counter(v['categoria'] for v in veiculos.values()).most_common():
        print(f'  {q:6d}  {k}')
    print(f'\nitens (miras, roupas, acessórios)  {len(itens)}')
    for k, q in Counter(i['categoria'] for i in itens.values()).most_common():
        print(f'  {q:6d}  {k}')
    print(f'\nóculos  {len(oculos)}')

    if truncadas:
        print(f'\n⚠️  {truncadas} linhas bateram no limite de {LIMITE_LOG} do diag_log.')
        print('   Algum campo cresceu demais — quebre em mais linhas no .sqf.')
    if fim:
        print(f'\nFIM do dump: {fim}')
    else:
        print('\n⚠️  sem linha FIM — o dump não terminou; o catálogo pode estar parcial.')
    print(f'\nescrito: {os.path.relpath(SAIDA, RAIZ)}')
    print('Agora rode: python scripts/arma3/gerar-catalogo.py')


if __name__ == '__main__':
    main()
