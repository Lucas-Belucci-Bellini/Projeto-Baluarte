#!/usr/bin/env python3
"""
Gera a base de equipamento do Arma 3: uniformes, coletes, capacetes, mochilas
e óculos, com a PROTEÇÃO POR PONTO DO CORPO medida no config.

    python scripts/arma3/gerar-base-equipamento.py

Lê  `out/arma3-itens.json`
Escreve
    `src/data/arma3-equipamento.js`      — núcleo vanilla/DLC, no bundle
    `public/arma3/equipamento-db.json`   — o acervo, sob demanda

## O que esta base tem que nenhuma outra tem

`HitpointsProtectionInfo`: quanto CADA PONTO DO CORPO fica protegido, e o
`passThrough` — a fração do dano que atravessa a placa mesmo assim. É a
diferença entre "colete nível 25" e "peito 25 com 1% de passagem, braço
descoberto". 19.616 itens do acervo trazem isso.

Um colete que protege o peito em 25 e deixa o abdômen em 0 NÃO é o mesmo que
um que cobre os dois — e essa distinção não existe em nenhuma tabela que
publique só um número por item.

## Três decisões

### 1. O tipo sai do `itemInfoType`, como nos acessórios

    801 = uniforme     701 = colete
    605 = capacete     616 = equipamento de cabeça (NVG, fone)

São os números que o próprio engine consulta pra decidir em que slot entra.
`categoriaSugerida` existe no dump, mas é rótulo editorial — mesmo caso do
`tipoSugerido` das armas, que teve de ser jogado fora.

### 2. `armor: null` dentro da proteção é ausência, e sobrevive como null

O parser já distingue: `{"parte": "Body", "armor": null}` quer dizer "o config
não declara blindagem para esse ponto", e não "blindagem zero". Um `or 0` aqui
transformaria 19 mil peças em coletes de papel.

### 3. Mochila e óculos vêm de outra lista, e não fingem ter proteção

`oculos` e `mochilas` são listas separadas no dump, sem `HitpointsProtectionInfo`.
Entram na base com `protecao: null` — declarado, não zerado.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, FONTE_DLC, cam, js_valor, num, slug,
)

import gerar_imagens_comum as gic

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ENTRADA = os.path.join(AQUI, 'out', 'arma3-itens.json')
SAIDA_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-equipamento.js')
SAIDA_JSON = os.path.join(RAIZ, 'public', 'arma3', 'equipamento-db.json')

# Ícone do registro. Mapa ausente = extração não rodou: cada entrada sai com o
# motivo em vez de a base não sair.
_MAPA_IMG = gic.carregar_mapa('imagens-itens.json')

TIPO_POR_INFO = {801: 'uniforme', 701: 'colete', 605: 'capacete', 616: 'cabeca'}

CATEGORIAS = [
    ('colete', '🦺', 'Coletes', 'Proteção de tronco, com blindagem por ponto do corpo.'),
    ('capacete', '⛑️', 'Capacetes', 'Proteção de cabeça e pescoço.'),
    ('uniforme', '👕', 'Uniformes', 'Fardamento — quase sempre sem blindagem própria.'),
    ('cabeca', '🥽', 'Equip. de cabeça', 'Visão noturna, fones e acessórios de cabeça.'),
    ('mochila', '🎒', 'Mochilas', 'Capacidade de carga.'),
    ('oculos', '😎', 'Óculos e máscaras', 'Itens do slot de rosto.'),
]

# Prefixos que a Bohemia usa em classe de equipamento. Levantado do dump,
# como nos veículos e acessórios.
PREFIXOS_JOGO = {'u', 'v', 'h', 'g', 'b', 'nvgoggles', 'itemgps', 'binocular'}
PREFIXOS_CDLC = {'ef', 'lxws', 'lxrf'}


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


def origem(classe, item):
    """Igual às outras bases: caminho manda sobre `fonte`, ícone desempata
    modelo emprestado, e o NOME DA CLASSE decide antes de tudo — mod que
    reusa asset vanilla inteiro só se denuncia aí."""
    modelo = cam(item.get('model') or '')
    icone = cam(item.get('picture') or '')
    f = (item.get('fonte') or '').strip()
    prefixo = classe.split('_')[0].lower()

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


def protecao(item):
    """Resumo do HitpointsProtectionInfo, ou None.

    ⚠️ `armor: null` numa parte é AUSÊNCIA (o config não declara), não zero.
    Um `or 0` aqui viraria "peito com blindagem 0" em item que só não
    declarou — e a tabela anunciaria colete de papel.
    """
    prot = item.get('protecao')
    if not prot:
        return None
    comArmor = [p for p in prot
                if isinstance(p.get('armor'), (int, float)) and p['armor'] > 0]
    if not comArmor:
        return {'partes': len(prot), 'maior': None, 'maiorParte': None,
                'passagem': None, 'cobertas': 0}
    forte = max(comArmor, key=lambda p: p['armor'])
    passagens = [p['passThrough'] for p in comArmor
                 if isinstance(p.get('passThrough'), (int, float))]
    return {
        'partes': len(prot),
        'cobertas': len(comArmor),
        'maior': forte['armor'],
        'maiorParte': forte.get('parte') or None,
        # Pior passagem = mais dano atravessa; é o número que interessa.
        'passagem': max(passagens) if passagens else None,
    }


def montar(dump):
    it = dump.get('itens') or {}
    entradas, detalhe = [], {}

    def add(classe, v, tipo, extra=None):
        dlc, dlcFonte = origem(classe, v)
        pr = protecao(v) if extra is None else None
        img, imgAusente = gic.resolver(
            classe, _MAPA_IMG, (v.get('picture') or ''))

        e = {
            'id': slug(classe),
            'classe': classe,
            'img': img,
            'imgAusente': imgAusente,
            'nome': v.get('nome') or classe,
            'tipo': tipo,
            'tipoFonte': 'itemInfoType' if extra is None else 'lista',
            'dlc': dlc,
            'dlcFonte': dlcFonte,
            'massa': num(v.get('massa')),
            'capacidade': num(v.get('capacidade')),
            'containerClass': v.get('containerClass') or None,
            'uniformeDe': v.get('uniformeDe') or None,
            'protecao': pr,
            'imagem': v.get('picture') or None,
            '_ehMod': dlcFonte in ('mod', 'classe') or dlc == 'desconhecida',
        }
        entradas.append(e)
        if v.get('protecao'):
            detalhe[e['id']] = {'classe': classe, 'protecao': v['protecao']}

    for classe, v in it.items():
        tipo = TIPO_POR_INFO.get(v.get('itemInfoType'))
        if tipo:
            add(classe, v, tipo)

    for classe, v in (dump.get('mochilas') or {}).items():
        add(classe, v, 'mochila', extra=True)
    for classe, v in (dump.get('oculos') or {}).items():
        add(classe, v, 'oculos', extra=True)

    return entradas, detalhe


def verificar(entradas):
    erros = list(gic.conferir(entradas, 'item'))
    vistos = set()
    for e in entradas:
        if e['id'] in vistos:
            erros.append(f'{e["classe"]}: id duplicado {e["id"]}')
        vistos.add(e['id'])
        p = e['protecao']
        if p and p['maior'] is not None and p['maior'] <= 0:
            erros.append(f'{e["classe"]}: proteção "maior" {p["maior"]} — '
                         'ausência virou zero')
        if p and p['cobertas'] > p['partes']:
            erros.append(f'{e["classe"]}: cobertas > partes')
        if e['capacidade'] is not None and e['capacidade'] < 0:
            erros.append(f'{e["classe"]}: capacidade negativa')

    # Colete que não protege nada seria dado quebrado, não item exótico.
    coletes = [e for e in entradas if e['tipo'] == 'colete']
    comP = sum(1 for e in coletes if e['protecao'])
    if coletes and comP < len(coletes) * 0.5:
        erros.append(f'só {comP} de {len(coletes)} coletes têm proteção — '
                     'o parser provavelmente mudou de formato')
    return erros


def colapsar(entradas):
    """Junta variante COSMÉTICA, como o gerador de armas faz.

    40.720 uniformes é o acervo inteiro contando cada camuflagem como item
    novo — `U_B_CombatUniform_mcam`, `_mcam_tshirt`, `_mcam_vest`… Sem
    colapsar, o JSON sob demanda passa de 29 MB, que ninguém baixa.

    A chave junta o que MUDA O JOGO: tipo, a assinatura da proteção, massa e
    capacidade. Camuflagem diferente com a mesma proteção vira uma entrada;
    colete com placa diferente CONTINUA separado, porque protege diferente.

    Fica registrado quantas classes cada entrada representa (`variantes`) e
    os nomes, pra ninguém achar que sumiu item.
    """
    grupos = {}
    for e in entradas:
        p = e['protecao']
        assinatura = (p['maior'], p['cobertas'], p['passagem']) if p else None
        chave = (e['tipo'], e['dlc'], assinatura, e['massa'], e['capacidade'],
                 e['containerClass'])
        grupos.setdefault(chave, []).append(e)

    saida = []
    for membros in grupos.values():
        # o nome mais curto costuma ser o canônico (sem sufixo de camuflagem)
        membros.sort(key=lambda e: (len(e['nome']), e['nome']))
        canon = dict(membros[0])
        canon['variantes'] = len(membros)
        canon['nomes'] = sorted({m['nome'] for m in membros})[:6]
        canon['classes'] = [m['classe'] for m in membros][:40]
        saida.append(canon)
    return saida


def escrever(todas, detalhe):
    entradas = colapsar(todas)
    nucleo = [e for e in entradas if not e['_ehMod']]
    ordem = {c[0]: i for i, c in enumerate(CATEGORIAS)}
    nucleo.sort(key=lambda e: (ordem.get(e['tipo'], 9), e['nome'].lower()))
    pub = [{k: v for k, v in e.items() if not k.startswith('_')} for e in nucleo]

    porTipo = {}
    for e in entradas:
        porTipo[e['tipo']] = porTipo.get(e['tipo'], 0) + 1

    corpo = ',\n  '.join(js_valor(e) for e in pub)
    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-equipamento.py).',
        ' *',
        ' * `protecao` resume o HitpointsProtectionInfo: o ponto MAIS protegido,',
        ' * quantos pontos são cobertos e a PIOR passagem (passThrough) — a',
        ' * fração de dano que atravessa a placa. Um número só por item',
        ' * esconderia que o peito é 25 e o braço é descoberto.',
        ' *',
        ' * `armor: null` numa parte é ausência declarada, nunca zero.',
        ' */',
        '',
        f'export const A3EQP = [\n  {corpo},\n];',
        '',
        f'export const A3EQP_TOTAL = {len(entradas)};',
        f'export const A3EQP_NUCLEO = {len(nucleo)};',
        '',
        'export const A3EQP_CATEGORIAS = ' + js_valor([
            {'id': c[0], 'icon': c[1], 'nome': c[2], 'desc': c[3]} for c in CATEGORIAS
        ]) + ';',
        '',
        'export const A3EQP_META = ' + js_valor({
            'porTipo': porTipo,
            'comProtecao': sum(1 for e in entradas if e['protecao']),
            'dbUrl': '/arma3/equipamento-db.json',
        }) + ';',
        '',
        '/* Acervo completo e a proteção ponto a ponto, sob demanda. */',
        'let _db = null;',
        'export function carregarEquipamento() {',
        '  if (!_db) {',
        '    _db = fetch(A3EQP_META.dbUrl)',
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

    pubTodos = [gic.enxugar({k: v for k, v in e.items() if not k.startswith('_')})
                for e in entradas]
    os.makedirs(os.path.dirname(SAIDA_JSON), exist_ok=True)
    # O mapa `detalhe` (proteção ponto a ponto das 19.616) fica FORA: sozinho
    # ele levava o arquivo a 29 MB. O resumo por item basta pra tabela e pra
    # wiki; ponto a ponto é coisa do app, que lê o dump direto.
    with open(SAIDA_JSON, 'w', encoding='utf-8') as f:
        json.dump({'equipamento': pubTodos}, f, ensure_ascii=False,
                  separators=(',', ':'))
    return nucleo, entradas


def main():
    if not os.path.isfile(ENTRADA):
        raise SystemExit(f'falta {ENTRADA} — rode dump-itens.sqf e parse-itens.py antes.')
    with open(ENTRADA, encoding='utf-8') as f:
        dump = json.load(f)

    entradas, detalhe = montar(dump)
    erros = verificar(entradas)
    if erros:
        print(f'{len(erros)} violação(ões) — NADA foi gerado:')
        for e in erros[:20]:
            print('  -', e)
        raise SystemExit(1)

    nucleo, colapsadas = escrever(entradas, detalhe)

    porTipo = {}
    for e in colapsadas:
        porTipo[e['tipo']] = porTipo.get(e['tipo'], 0) + 1
    print(f'classes no config .... {len(entradas)}')
    print(f'apos colapsar variante {len(colapsadas)}')
    for c in CATEGORIAS:
        if porTipo.get(c[0]):
            print(f'  {c[2]:18} {porTipo[c[0]]}')
    print(f'núcleo (bundle) ...... {len(nucleo)}')
    print(f'com proteção medida .. {sum(1 for e in colapsadas if e["protecao"])}')
    # Placar sobre o que é PUBLICADO (as 987 colapsadas), não sobre as 71.373
    # classes cruas: número que não corresponde a nada que a wiki mostra
    # informa errado com a mesma confiança de um que corresponde.
    gic.imprimir_placar(colapsadas)
    print(f'\nescrito: {SAIDA_JS}\n         {SAIDA_JSON}')


if __name__ == '__main__':
    main()
