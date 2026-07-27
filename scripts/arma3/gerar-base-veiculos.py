#!/usr/bin/env python3
"""
Gera a base de veículos do Arma 3 a partir do dump de `CfgVehicles`.

    python scripts/arma3/gerar-base-veiculos.py

Lê  `out/arma3-veiculos.json`  (24.261 registros, 5.425 veículos de verdade)
Escreve
    `src/data/arma3-veiculos.js`      — núcleo vanilla/DLC, no bundle
    `public/arma3/veiculos-db.json`   — os 5.425 + facções, sob demanda

## Três decisões

### 1. `ehVeiculo` corta 24.261 para 5.425, e isso é ganho, não perda

`CfgVehicles` não guarda só veículo: guarda TODA entidade do mundo — parede,
arbusto, caixa, marcador do editor, o próprio soldado. Publicar 24.261
"veículos" seria número grande e falso. O parser já marcou quais são veículo
de verdade (`ehVeiculo`); o resto continua no dump, fora da tabela.

### 2. `massa` não existe nesta base — nem como coluna vazia

Medido: `massa` vem null em **100%** dos 5.425. Uma coluna que nunca preenche
não é "dado ausente", é ruído que sugere que alguém esqueceu de olhar. Fica
de fora até o dump trazer. O mesmo NÃO vale para `potencia` (66%) e
`cargaMax` (88%): esses aparecem, com null onde falta.

### 3. Blindagem: o número total E o por-parte, porque só o total engana

`armor` é o casco; `hitpoints` traz `armor` por parte (motor, torre, esteira,
vidro) com o `passThrough`, que é quanto do dano atravessa para o casco. Um
MBT com `armor: 900` pode ter `HitEngine` em 0,8 — o motor é o ponto fraco, e
essa é justamente a informação tática que uma tabela só com o total esconde.

97,3% têm hitpoints. Os outros 2,7% (o Merkava vanilla entre eles) ficam com
`hitpoints: null` — ausência declarada, nunca zero.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, FONTE_DLC, cam, js_valor, num, slug,
)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ENTRADA = os.path.join(AQUI, 'out', 'arma3-veiculos.json')
SAIDA_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-veiculos.js')
SAIDA_JSON = os.path.join(RAIZ, 'public', 'arma3', 'veiculos-db.json')

CATEGORIAS = [
    ('blindado', '🛡️', 'Blindados', 'Carros de combate e transportes blindados.'),
    ('terrestre', '🚙', 'Terrestres', 'Viaturas de roda e lagarta sem blindagem pesada.'),
    ('aereo', '🚁', 'Aéreos', 'Helicópteros, aviões e drones.'),
    ('naval', '🚤', 'Navais', 'Botes, lanchas e navios.'),
    ('estatico', '🔫', 'Estáticos', 'Armamento de posição: metralhadora, morteiro, AA.'),
]


def _no_jogo(caminho):
    partes = [p for p in caminho.split('/') if p]
    if not partes:
        return False
    return partes[0] == 'a3' or any(p in DIR_DLC or p in DIR_CDLC for p in partes)


def _achar(caminho, tabela):
    for p in (q for q in caminho.split('/') if q):
        if p in tabela:
            return tabela[p]
    return None


# Prefixos que a Bohemia usa em classe de veículo — B_/O_/I_ são os lados
# (BLUFOR/OPFOR/Independente), C_ é civil e Land_ é objeto de cenário com
# lotação. Levantado do dump: entre os veículos com TODOS os assets em a3/,
# os prefixos são estes cinco; `a3a_` (Antistasi), `CUP_`, `rhs*`, `EMP_` e
# `Flex_` aparecem lá porque REUSAM asset vanilla — e é exatamente o caso que
# o teste de ícone não pega, porque eles reusam o ícone também.
PREFIXOS_JOGO = {'b', 'o', 'i', 'c', 'land'}

# As cDLC nomeiam as próprias classes e SÃO conteúdo oficial pago — não são
# mod. `ef` = Expeditionary Forces, `lxws` = Western Sahara,
# `lxrf` = Reaction Forces.
PREFIXOS_CDLC = {'ef', 'lxws', 'lxrf'}


def origem(classe, v):
    """De que DLC/mod é.

    Mesma lógica dos acessórios, pela mesma razão: `fonte` é `configSourceMod`
    (quem patcheou por último — o ACE assina meio jogo base), então o caminho
    do asset manda. E o ÍCONE desempata quando o modelo é emprestado do jogo:
    mod que reaproveita `.p3d` vanilla ainda traz `picture` na árvore dele.

    Aqui entra a terceira camada, que custou 593 entradas: mod que reusa
    modelo E ícone (o Antistasi cria `A3A_zeus_..._Vehicle_APC` com asset
    100% vanilla). Nesse caso só o NOME DA CLASSE denuncia.
    """
    modelo = cam(v.get('model') or '')
    icone = cam(v.get('picture') or v.get('editorPreview') or '')
    f = (v.get('fonte') or '').strip()
    prefixo = classe.split('_')[0].lower()

    # O NOME DA CLASSE vem primeiro, antes até da cDLC: quem define a classe
    # é quem a nomeia. O Antistasi (`a3a_...`) reusa asset de cDLC, e testar
    # o caminho antes fazia 43 veículos dele virarem conteúdo oficial.
    # Exceção são os prefixos de cDLC (EF_, lxWS_, lxRF_), que SÃO oficiais e
    # nomeiam as próprias classes — por isso entram no conjunto abaixo.
    if prefixo not in PREFIXOS_JOGO and prefixo not in PREFIXOS_CDLC:
        if f.startswith('@'):
            return f[1:], 'mod'
        return 'desconhecida', 'classe'

    for c in (icone, modelo):
        d = _achar(c, DIR_CDLC)
        if d:
            return d, 'caminho'

    if icone and not _no_jogo(icone) and f.startswith('@'):
        return f[1:], 'mod'

    for c in (icone, modelo):
        d = _achar(c, DIR_DLC)
        if d:
            return d, 'caminho'

    if f.startswith('@'):
        return f[1:], 'mod'
    if f in FONTE_DLC:
        return FONTE_DLC[f], 'fonte'
    return (f or 'desconhecida'), 'fonte'


def blindagem(v):
    """Resumo do `hitpoints`, ou None.

    ⚠️ ARMOR NEGATIVO NÃO É BLINDAGEM MENOR. São 19.223 partes no acervo —
    rodas, periscópios, blocos de ERA — e o sinal é CONVENÇÃO do engine: o
    valor negativo é relativo ao `armor` total do veículo, não absoluto como
    os positivos. Misturar os dois num `min()` produzia "parte mais fraca:
    −100", que não quer dizer nada e induz o leitor a achar que a roda é o
    ponto fraco de um MBT.

    Então o resumo só compara os ABSOLUTOS, e conta os relativos à parte.
    """
    hp = v.get('hitpoints')
    if not hp:
        return None
    absolutos = [p for p in hp
                 if isinstance(p.get('armor'), (int, float)) and p['armor'] > 0]
    relativos = sum(1 for p in hp
                    if isinstance(p.get('armor'), (int, float)) and p['armor'] < 0)
    if not absolutos:
        return {'partes': len(hp), 'menor': None, 'menorParte': None,
                'maior': None, 'relativas': relativos}
    fraca = min(absolutos, key=lambda p: p['armor'])
    return {
        'partes': len(hp),
        'menor': fraca['armor'],
        'menorParte': (fraca.get('parte') or '').replace('Hit', '') or None,
        'maior': max(p['armor'] for p in absolutos),
        'relativas': relativos,
    }


def montar(dump):
    todos = dump.get('veiculos') or {}
    faccoes = dump.get('faccoes') or {}
    entradas, completos = [], {}

    for classe, v in todos.items():
        if not v.get('ehVeiculo'):
            continue
        dlc, dlcFonte = origem(classe, v)
        fac = faccoes.get(v.get('faccao')) or {}

        e = {
            'id': slug(classe),
            'classe': classe,
            'nome': v.get('nome') or classe,
            'categoria': v.get('classeVeiculo') or 'terrestre',
            'categoriaFonte': 'classeVeiculo',
            'dlc': dlc,
            'dlcFonte': dlcFonte,
            'lado': v.get('lado') or None,
            'faccao': fac.get('nome') or v.get('faccao') or None,
            'armor': num(v.get('armor')),
            'armorEstrutural': num(v.get('armorStructural')),
            'blindagem': blindagem(v),
            'maxSpeed': num(v.get('maxSpeed')),
            'potencia': num(v.get('potencia')),
            'lotacao': num(v.get('lotacao')),
            'cargaMax': num(v.get('cargaMax')),
            'combustivel': num(v.get('combustivel')),
            'custo': num(v.get('custo')),
            'armas': len(v.get('armas') or []) or None,
            'imagem': v.get('picture') or v.get('editorPreview') or None,
            '_ehMod': dlcFonte in ('mod', 'classe') or dlc == 'desconhecida',
        }
        entradas.append(e)
        completos[e['id']] = {
            'classe': classe,
            'hitpoints': v.get('hitpoints') or [],
            'armas': v.get('armas') or [],
            'tripulacao': v.get('tripulacao') or None,
        }

    return entradas, completos, faccoes


def verificar(entradas):
    """Invariantes. Recusa gerar: dado errado publicado ninguém percebe."""
    erros = []
    vistos = set()
    for e in entradas:
        if e['id'] in vistos:
            erros.append(f'{e["classe"]}: id duplicado {e["id"]}')
        vistos.add(e['id'])

        # `armor` 0 significaria "destrói com um tiro"; ausência é null.
        if e['armor'] == 0:
            erros.append(f'{e["classe"]}: armor 0 — ausência deve ser null')
        if e['maxSpeed'] is not None and e['maxSpeed'] < 0:
            erros.append(f'{e["classe"]}: maxSpeed negativo ({e["maxSpeed"]})')
        if e['lotacao'] is not None and e['lotacao'] < 0:
            erros.append(f'{e["classe"]}: lotação negativa')
        b = e['blindagem']
        if b and b['menor'] is not None and b['menor'] > b['maior']:
            erros.append(f'{e["classe"]}: blindagem menor > maior')
        # Um negativo escapando pro resumo significa que a regra do sinal
        # quebrou — e o leitor veria "parte mais fraca: −100".
        if b and b['menor'] is not None and b['menor'] <= 0:
            erros.append(f'{e["classe"]}: blindagem "menor" {b["menor"]} — '
                         'valor relativo vazou pro resumo de absolutos')
        if e['categoria'] not in {c[0] for c in CATEGORIAS}:
            erros.append(f'{e["classe"]}: categoria desconhecida "{e["categoria"]}"')

    # A base existe pra mostrar blindagem; se quase ninguém tem, algo quebrou
    # no parser e é melhor recusar que publicar uma tabela de trações.
    comB = sum(1 for e in entradas if e['blindagem'])
    if entradas and comB < len(entradas) * 0.5:
        erros.append(f'só {comB} de {len(entradas)} têm hitpoints — '
                     'esperado ~97%; o parser provavelmente mudou de formato')
    return erros


def escrever(entradas, completos, faccoes):
    nucleo = [e for e in entradas if not e['_ehMod']]
    ordem = {c[0]: i for i, c in enumerate(CATEGORIAS)}
    nucleo.sort(key=lambda e: (ordem.get(e['categoria'], 9), e['nome'].lower()))
    pub = [{k: v for k, v in e.items() if not k.startswith('_')} for e in nucleo]

    porCat = {}
    for e in entradas:
        porCat[e['categoria']] = porCat.get(e['categoria'], 0) + 1

    corpo = ',\n  '.join(js_valor(e) for e in pub)
    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-veiculos.py).',
        ' *',
        ' * `blindagem` resume o hitpoints: a parte MAIS FRACA e quantas partes',
        ' * o veículo tem. Só o `armor` do casco esconde o ponto fraco — um MBT',
        ' * de armor 900 pode ter o motor em 0,8.',
        ' *',
        ' * `massa` não existe aqui de propósito: vem null em 100% do dump.',
        ' */',
        '',
        f'export const A3VEI = [\n  {corpo},\n];',
        '',
        f'export const A3VEI_TOTAL = {len(entradas)};',
        f'export const A3VEI_NUCLEO = {len(nucleo)};',
        '',
        'export const A3VEI_CATEGORIAS = ' + js_valor([
            {'id': c[0], 'icon': c[1], 'nome': c[2], 'desc': c[3]} for c in CATEGORIAS
        ]) + ';',
        '',
        'export const A3VEI_META = ' + js_valor({
            'porCategoria': porCat,
            'comBlindagem': sum(1 for e in entradas if e['blindagem']),
            'faccoes': len(faccoes),
            'dbUrl': '/arma3/veiculos-db.json',
        }) + ';',
        '',
        '/* Acervo completo (com mods), hitpoints por parte e as facções. */',
        'let _db = null;',
        'export function carregarVeiculos() {',
        '  if (!_db) {',
        '    _db = fetch(A3VEI_META.dbUrl)',
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

    pubTodos = [{k: v for k, v in e.items() if not k.startswith('_')} for e in entradas]
    os.makedirs(os.path.dirname(SAIDA_JSON), exist_ok=True)
    # O mapa `completos` (hitpoints parte a parte dos 5.425) sozinho pesa
    # 4,2 MB dos 6,6 MB do arquivo. O resumo por veículo -- casco, parte mais
    # fraca, quantas relativas -- basta pra tabela e pra wiki; parte a parte
    # e coisa do app, que le o dump direto de scripts/arma3/out/.
    # Mesmo motivo que tirou o detalhe do equipamento-db.
    with open(SAIDA_JSON, 'w', encoding='utf-8') as f:
        json.dump({'veiculos': pubTodos, 'faccoes': faccoes},
                  f, ensure_ascii=False, separators=(',', ':'))
    return nucleo


def main():
    if not os.path.isfile(ENTRADA):
        raise SystemExit(f'falta {ENTRADA} — rode dump-veiculos.sqf no jogo e '
                         'python scripts/arma3/parse-veiculos.py antes.')
    with open(ENTRADA, encoding='utf-8') as f:
        dump = json.load(f)

    entradas, completos, faccoes = montar(dump)
    erros = verificar(entradas)
    if erros:
        print(f'{len(erros)} violação(ões) — NADA foi gerado:')
        for e in erros[:20]:
            print('  -', e)
        raise SystemExit(1)

    nucleo = escrever(entradas, completos, faccoes)

    porCat = {}
    for e in entradas:
        porCat[e['categoria']] = porCat.get(e['categoria'], 0) + 1
    print(f'registros no dump ... {len(dump.get("veiculos") or {})}')
    print(f'veículos de verdade . {len(entradas)}')
    for c in CATEGORIAS:
        if porCat.get(c[0]):
            print(f'  {c[2]:12} {porCat[c[0]]}')
    print(f'núcleo (bundle) ..... {len(nucleo)}')
    print(f'com hitpoints ....... {sum(1 for e in entradas if e["blindagem"])}')
    print(f'facções ............. {len(faccoes)}')
    print(f'\nescrito: {SAIDA_JS}\n         {SAIDA_JSON}')


if __name__ == '__main__':
    main()
