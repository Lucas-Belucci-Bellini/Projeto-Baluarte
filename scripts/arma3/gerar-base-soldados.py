#!/usr/bin/env python3
"""
Gera a base de soldados do Arma 3: quem é, de que facção, e O QUE CARREGA.

    python scripts/arma3/gerar-base-soldados.py

Lê  `out/arma3-veiculos.json`  (chave `soldados`, 44.761 registros)
Escreve
    `src/data/arma3-soldados.js`      — núcleo vanilla/DLC, no bundle
    `public/arma3/soldados-db.json`   — o acervo colapsado, sob demanda

## O que esta base fecha

É a quinta e última das bases da extração, e a que amarra as outras quatro:
o soldado referencia a ARMA (`arifle_MX_ACO_pointer_F`), o CARREGADOR
(`30Rnd_65x39_caseless_mag`) e o UNIFORME (`U_B_CombatUniform_mcam`) — classes
que já existem em `arma3-armas.js`, `arma3-municao.js` e
`arma3-equipamento.js`. É o dado que responde "o que o Rifleman da BLUFOR leva
pro campo", em vez de mais uma lista de nomes.

## Três decisões

### 1. `lado` fica null em 90%, e a causa NÃO é sideUnknown

Medido: só **4.331 dos 44.761** têm lado. Investigado a fundo, porque a
primeira explicação que escrevi aqui estava errada:

  - as **83 facções com `side: 7`** (sideUnknown) têm **ZERO soldados** —
    são módulos e lógica (ACE Logistics, ALiVE Modules, Animals, Audio)
  - os 40.430 sem lado pertencem a **21 facções que NÃO ESTÃO no dump**:
    `sof_rangers` sozinha tem 24.555, `zulu_flannels` 5.632

Ou seja, não é "o jogo diz que não tem lado" — é "o dump não capturou essa
facção". `CfgFactionClasses` trouxe 248 e essas 21 ficaram de fora.

⚠️ **Não preencher com "Civil".** `sof_rangers` são *Rangers* (classes
`TFL_mw_pcu_*`, mod de forças especiais dos EUA): rotular 24.555 deles como
civis seria pior que deixar em branco. Consertar isto de verdade exige um
dump novo que capture as facções faltantes — está registrado no README.

### 2. NÃO colapsa: entram os 44.761, nome repetido e tudo

Decisão do operador, e ela tem razão de ser: dois "Rifleman" com o mesmo
equipamento ainda são DUAS classes que se pode spawnar, com camuflagem
diferente — e quem monta missão precisa do classname exato, não do
representante de um grupo.

O custo é o tamanho, e ele foi pago onde dava: o JSON sob demanda leva menos
campos que o bundle (ver `SO_NO_NUCLEO`), e o núcleo do bundle segue só com
vanilla/DLC. O acervo completo desce quando alguém pede.

### 3. `armas` inclui `Throw` e `Put`

O engine trata granada e explosivo como "armas" (`Throw`, `Put`) na lista.
Contá-las como armamento inflaria todo mundo em 2. Elas são separadas do
armamento de verdade e contadas à parte.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, cam, js_valor, slug,
)

import gerar_imagens_comum as gic

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ENTRADA = os.path.join(AQUI, 'out', 'arma3-veiculos.json')
SAIDA_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-soldados.js')
SAIDA_JSON = os.path.join(RAIZ, 'public', 'arma3', 'soldados-db.json')

# Símbolo de carta do soldado. Mapa ausente = extração não rodou: cada entrada
# sai com o motivo em vez de a base não sair.
#
# O segundo mapa não é redundância: 42.801 soldados declaram `icon = "iconMan"`
# — um NOME, não um caminho — e quem traduz nome em .paa é a `CfgVehicleIcons`.
# Sem ela, 99,5% da base sairia sem ícone por falta de UMA tabela.
_MAPA_IMG = gic.carregar_mapa('imagens-mapa.json')
_MAPA_NOMES = gic.carregar_mapa('imagens-nomeadas.json')

# `side` do engine → lado. O 7 é sideUnknown e NÃO entra: é ausência.
SIDE_LADO = {0: 'OPFOR', 1: 'BLUFOR', 2: 'Independente', 3: 'Civil'}

# Pseudo-armas do engine: granada e explosivo entram na lista de `armas`.
NAO_SAO_ARMA = {'throw', 'put'}

PREFIXOS_JOGO = {'b', 'o', 'i', 'c'}
PREFIXOS_CDLC = {'ef', 'lxws', 'lxrf'}


def _achar(caminho, tabela):
    for p in (q for q in caminho.split('/') if q):
        if p in tabela:
            return tabela[p]
    return None


def origem(classe, s):
    """Mesma escada das outras bases; aqui o preview do editor faz o papel do
    ícone, porque soldado não tem `picture`."""
    icone = cam(s.get('editorPreview') or '')
    f = (s.get('fonte') or '').strip()
    prefixo = classe.split('_')[0].lower()

    if prefixo not in PREFIXOS_JOGO and prefixo not in PREFIXOS_CDLC:
        if f.startswith('@'):
            return f[1:], 'mod'
        return 'desconhecida', 'classe'

    d = _achar(icone, DIR_CDLC)
    if d:
        return d, 'caminho'
    d = _achar(icone, DIR_DLC)
    if d:
        return d, 'caminho'
    if f.startswith('@'):
        return f[1:], 'mod'
    return ('Base' if icone.startswith('a3/') else (f or 'desconhecida')), 'caminho'


def montar(dump):
    sold = dump.get('soldados') or {}
    faccoes = dump.get('faccoes') or {}
    entradas = []

    for classe, s in sold.items():
        fac = faccoes.get(s.get('faccao')) or {}
        side = fac.get('side')
        lado = SIDE_LADO.get(side) if side is not None else None
        dlc, dlcFonte = origem(classe, s)

        armas = [a for a in (s.get('armas') or [])
                 if a and a.lower() not in NAO_SAO_ARMA]
        pseudo = [a for a in (s.get('armas') or [])
                  if a and a.lower() in NAO_SAO_ARMA]

        img, imgAusente = gic.resolver(
            classe, _MAPA_IMG, (s.get('icon') or ''), nomeados=_MAPA_NOMES)

        entradas.append({
            'id': slug(classe),
            'classe': classe,
            'img': img,
            'imgAusente': imgAusente,
            'nome': s.get('nome') or classe,
            'faccao': fac.get('nome') or s.get('faccao') or None,
            'faccaoClasse': s.get('faccao') or None,
            'lado': lado,
            'ladoFonte': 'faccao' if lado else None,
            'sideCru': side,
            'dlc': dlc,
            'dlcFonte': dlcFonte,
            'uniforme': s.get('uniforme') or None,
            'mochila': s.get('mochila') or None,
            'armas': armas or None,
            'nArmas': len(armas) or None,
            'nGranadas': len(pseudo) or None,
            'nCarregadores': len(s.get('carregadores') or []) or None,
            'nItens': len(s.get('itensLigados') or []) or None,
            'preview': s.get('editorPreview') or None,
            '_ehMod': dlcFonte in ('mod', 'classe') or dlc == 'desconhecida',
        })
    return entradas, faccoes


def colapsar(entradas):
    """Agrupa por EQUIPAMENTO — ver decisão 2 no topo."""
    grupos = {}
    for e in entradas:
        chave = (e['faccaoClasse'], e['uniforme'], e['mochila'],
                 tuple(e['armas'] or ()), e['nCarregadores'])
        grupos.setdefault(chave, []).append(e)

    saida = []
    for membros in grupos.values():
        # O canônico é o do JOGO antes do de mod: sem isso o `B_Soldier_F`
        # (o Rifleman vanilla) perdia a vaga pra uma classe de mod com nome
        # mais curto, e sumia da tabela. Depois disso, o nome mais curto.
        membros.sort(key=lambda e: (e['_ehMod'], len(e['nome']), e['nome']))
        canon = dict(membros[0])
        canon['variantes'] = len(membros)
        canon['nomes'] = sorted({m['nome'] for m in membros})[:6]
        # As classes agrupadas viajam junto: sem elas o leitor que procura
        # `B_Soldier_F` não acha nada, mesmo o soldado estando na base.
        canon['classes'] = [m['classe'] for m in membros][:40]
        saida.append(canon)
    return saida


def verificar(entradas):
    erros = list(gic.conferir(entradas, 'soldado'))
    vistos = set()
    for e in entradas:
        if e['id'] in vistos:
            erros.append(f'{e["classe"]}: id duplicado {e["id"]}')
        vistos.add(e['id'])
        # Lado inventado é o erro que esta base pode cometer.
        if e['lado'] and e['ladoFonte'] != 'faccao':
            erros.append(f'{e["classe"]}: lado sem procedência declarada')
        if e['sideCru'] == 7 and e['lado']:
            erros.append(f'{e["classe"]}: side 7 (sideUnknown) virou lado '
                         f'"{e["lado"]}" — ausência inventada')
        for campo in ('nArmas', 'nCarregadores', 'nItens', 'nGranadas'):
            if e[campo] == 0:
                erros.append(f'{e["classe"]}: {campo} 0 — ausência deve ser null')
        if e['armas'] and any(a.lower() in NAO_SAO_ARMA for a in e['armas']):
            erros.append(f'{e["classe"]}: Throw/Put contado como arma')
    return erros


def escrever(todas, faccoes):
    entradas = todas  # sem colapso: decisão do operador, ver decisão 2
    nucleo = [e for e in entradas if not e['_ehMod']]
    nucleo.sort(key=lambda e: ((e['lado'] or 'zzz'), e['nome'].lower()))
    pub = [{k: v for k, v in e.items() if not k.startswith('_')} for e in nucleo]

    porLado = {}
    for e in entradas:
        porLado[e['lado'] or 'não declarado'] = porLado.get(e['lado'] or 'não declarado', 0) + 1

    corpo = ',\n  '.join(js_valor(e) for e in pub)
    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-soldados.py).',
        ' *',
        ' * `lado` é null em ~90% de propósito: 83 das 248 facções usam',
        ' * `side: 7` (sideUnknown do engine), e facção sem lado é soldado sem',
        ' * lado. Preencher por semelhança inventaria filiação.',
        ' *',
        ' * `armas` NÃO inclui Throw/Put: o engine trata granada e explosivo',
        ' * como arma na lista, e contá-los inflaria todo mundo em 2.',
        ' */',
        '',
        f'export const A3SOL = [\n  {corpo},\n];',
        '',
        f'export const A3SOL_TOTAL = {len(todas)};',
        f'export const A3SOL_COLAPSADOS = {len(entradas)};',
        f'export const A3SOL_NUCLEO = {len(nucleo)};',
        '',
        'export const A3SOL_META = ' + js_valor({
            'porLado': porLado,
            'comLado': sum(1 for e in entradas if e['lado']),
            'faccoes': len(faccoes),
            'dbUrl': '/arma3/soldados-db.json',
        }) + ';',
        '',
        '/* Acervo completo (com mods) e as facções, sob demanda. */',
        'let _db = null;',
        'export function carregarSoldados() {',
        '  if (!_db) {',
        '    _db = fetch(A3SOL_META.dbUrl)',
        '      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })',
        '      .catch((err) => { _db = null; throw err; });',
        '  }',
        '  return _db;',
        '}',
        '',
    ]
    os.makedirs(os.path.dirname(SAIDA_JS), exist_ok=True)
    with open(SAIDA_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(linhas))

    # O JSON sob demanda leva MENOS campos que o bundle, de propósito: com
    # todos ele dava 14,5 MB pra 28.529 entradas. `preview` (caminho longo do
    # .jpg), `nomes`, `faccaoClasse` e `sideCru` só servem à ficha do núcleo,
    # que já está no bundle — na lista completa ninguém os lê.
    # Mesmo raciocínio que enxugou veiculos-db e equipamento-db.
    SO_NO_NUCLEO = {'preview', 'faccaoClasse', 'sideCru', 'ladoFonte'}
    pubTodos = [gic.enxugar({k: v for k, v in e.items()
                             if not k.startswith('_') and k not in SO_NO_NUCLEO})
                for e in entradas]
    os.makedirs(os.path.dirname(SAIDA_JSON), exist_ok=True)
    with open(SAIDA_JSON, 'w', encoding='utf-8') as f:
        json.dump({'soldados': pubTodos, 'faccoes': faccoes},
                  f, ensure_ascii=False, separators=(',', ':'))
    return nucleo, entradas


def main():
    if not os.path.isfile(ENTRADA):
        raise SystemExit(f'falta {ENTRADA} — rode dump-veiculos.sqf e parse-veiculos.py antes.')
    with open(ENTRADA, encoding='utf-8') as f:
        dump = json.load(f)

    entradas, faccoes = montar(dump)
    erros = verificar(entradas)
    if erros:
        print(f'{len(erros)} violação(ões) — NADA foi gerado:')
        for e in erros[:20]:
            print('  -', e)
        raise SystemExit(1)

    nucleo, colapsadas = escrever(entradas, faccoes)

    comLado = sum(1 for e in colapsadas if e['lado'])
    print(f'soldados publicados .. {len(entradas)}  (todos, sem colapso)')
    print(f'núcleo (bundle) ...... {len(nucleo)}')
    print(f'com lado declarado ... {comLado}  '
          f'({100 * comLado / max(len(colapsadas), 1):.0f}%)')
    print(f'facções .............. {len(faccoes)}')
    gic.imprimir_placar(entradas)
    print(f'\nescrito: {SAIDA_JS}\n         {SAIDA_JSON}')


if __name__ == '__main__':
    main()
