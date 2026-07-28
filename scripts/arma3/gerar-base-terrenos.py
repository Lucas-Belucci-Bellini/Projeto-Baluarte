#!/usr/bin/env python3
"""
Gera a base de terrenos do Arma 3 a partir do dump de `CfgWorlds`.

    python scripts/arma3/gerar-base-terrenos.py

Lê  `out/arma3-mapas.json`  (102 mundos, com a grade REAL de cada um)
Escreve
    `src/data/arma3-terrenos.js`     — todos os mundos jogáveis, no bundle
    `public/arma3/terrenos-db.json`  — localidades e aeroportos completos

## Por que a GRADE viaja junto

O objetivo desta base não é decorativo: é o computador de tiro. Converter
"034056" em metros exige `offsetX/offsetY/passoX/passoY` DAQUELE mundo —
no Altis `offsetY = 30720` e `passoY = -100`, ou seja, **o northing conta de
cima pra baixo**. Assumir a convenção "y cresce pro norte" erraria o azimute
em 180° em todos os mapas vanilla. A grade vai literal, como o config declara,
e quem converte é `src/utils/arma3-grade.js`.

## Procedência

`fonte` é `configSourceMod` — o Altis chega assinado "@ace" porque o ACE foi
o último a patchear. Pros 7 mundos oficiais a procedência sai de uma tabela
(fato publicado pela Bohemia: qual DLC traz qual terreno); cDLC sai do
diretório do asset; o resto é o mod que assina, marcado como mod.

Mundos-alias (`aliasDe` preenchido — casca apontando pro mesmo `.wrp` de
outro) ficam fora: seriam artigos duplicados do mesmo terreno.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import DIR_CDLC, cam, js_valor, slug  # noqa: E402

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
ENTRADA = os.path.join(AQUI, 'out', 'arma3-mapas.json')
SAIDA_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-terrenos.js')
SAIDA_JSON = os.path.join(RAIZ, 'public', 'arma3', 'terrenos-db.json')

# O repo IRMÃO recebe a mesma base, com a mesma API — igual ao
# `camadas-mapa.js`. Escrever nos dois DAQUI é o que impede a divergência
# silenciosa: se fossem duas cópias mantidas à mão, um ajuste no gerador
# valeria só de um lado e ninguém perceberia até o azimute sair errado.
# Se o irmão não estiver clonado ao lado, o gerador só avisa e segue.
RAIZ_VANGUARD = os.path.join(os.path.dirname(RAIZ), 'Project-Vanguard')
SAIDA_VANGUARD = os.path.join(RAIZ_VANGUARD, 'src', 'data', 'arma3-terrenos.js')

# O `.js` exporta `carregarTerrenos()`, que busca o JSON pesado sob demanda.
# Mandar o `.js` sem o JSON deixaria essa função com um 404 esperando alguém
# chamar. Os dois viajam juntos ou nenhum viaja.
SAIDA_VANGUARD_JSON = os.path.join(RAIZ_VANGUARD, 'public', 'arma3', 'terrenos-db.json')

# Fato publicado: que DLC oficial traz que terreno. Não é heurística — é a
# lista de conteúdo das DLCs da Bohemia. Tudo que não está aqui nem em cDLC
# por caminho é mod.
TERRENO_OFICIAL = {
    'altis': 'Base', 'stratis': 'Base', 'malden': 'Malden',
    'tanoa': 'Apex', 'enoch': 'Contact',
    'vr': 'Base', 'porto': 'Base (Arma 2)',
}


def origem(classe, m):
    nome = (m.get('nome') or '').strip().lower()
    cls = classe.strip().lower()
    for chave in (cls, nome):
        if chave in TERRENO_OFICIAL:
            return TERRENO_OFICIAL[chave], 'tabela'
    for campo in ('wrp', 'pictureMap'):
        d = None
        for p in (q for q in cam(m.get(campo) or '').split('/') if q):
            if p in DIR_CDLC:
                d = DIR_CDLC[p]
                break
        if d:
            return d, 'caminho'
    f = (m.get('fonte') or '').strip()
    if f.startswith('@'):
        return f[1:], 'mod'
    return (f or 'desconhecida'), 'fonte'


def grade_fina(m):
    """O zoom de passo mais fino — é o que os jogadores usam pra dar grade."""
    g = m.get('grid') or {}
    zooms = g.get('zooms') or []
    melhor = None
    for z in zooms:
        px = z.get('passoX')
        if not px:
            continue
        if melhor is None or abs(px) < abs(melhor.get('passoX') or 1e9):
            melhor = z
    if melhor is None:
        return None
    return {
        'offsetX': g.get('offsetX'),
        'offsetY': g.get('offsetY'),
        'passoX': melhor.get('passoX'),
        'passoY': melhor.get('passoY'),
        'digitos': len(melhor.get('formatoX') or '000'),
    }


def montar(dump):
    mundos = dump.get('mundos') or {}
    entradas = []
    completos = {}
    pulados_alias = 0

    for classe, m in sorted(mundos.items()):
        if m.get('aliasDe'):
            pulados_alias += 1
            continue

        dlc, dlcFonte = origem(classe, m)
        loc = m.get('localidadesPorTipo') or {}
        capitais = [l.get('nome') for l in (m.get('localidades') or [])
                    if l.get('tipo') == 'NameCityCapital' and l.get('nome')]

        e = {
            'id': slug(classe),
            'classe': classe,
            'nome': m.get('nome') or classe,
            'autor': m.get('autor') or None,
            'dlc': dlc,
            'dlcFonte': dlcFonte,
            'tamanhoM': m.get('tamanhoM'),
            'areaKm2': m.get('areaQuadradoKm2'),
            'latitude': m.get('latitude'),
            'longitude': m.get('longitude'),
            'grade': grade_fina(m),
            'localidades': m.get('totalLocalidades') or 0,
            'localidadesPorTipo': loc or None,
            'capitais': capitais[:4] or None,
            'aeroportos': len(m.get('aeroportos') or []),
            'ehMod': dlcFonte == 'mod' or dlc == 'desconhecida',
        }
        entradas.append(e)
        completos[e['id']] = {
            'classe': classe,
            'localidades': m.get('localidades') or [],
            'aeroportos': m.get('aeroportos') or [],
        }

    return entradas, completos, pulados_alias


def verificar(entradas):
    erros = []
    vistos = set()
    for e in entradas:
        if e['id'] in vistos:
            erros.append(f'{e["classe"]}: id duplicado {e["id"]}')
        vistos.add(e['id'])
        # tamanhoM null é ausência honesta (4 mundos não declaram mapSize —
        # e NÃO se infere do offsetY: o ChernobylZone tem offsetY=0 com o
        # northing contando pra cima). Proibido é zero, que afirmaria
        # "mundo de tamanho zero".
        if e['tamanhoM'] is not None and e['tamanhoM'] <= 0:
            erros.append(f'{e["classe"]}: tamanhoM {e["tamanhoM"]} — '
                         'ausência é null, não zero/negativo')
        g = e['grade']
        if g:
            if not g['passoX'] or g['passoX'] <= 0:
                erros.append(f'{e["classe"]}: passoX da grade inválido ({g["passoX"]})')
            if not g['passoY']:
                # passoY NEGATIVO é normal (northing de cima pra baixo);
                # zero é que seria dado quebrado.
                erros.append(f'{e["classe"]}: passoY da grade é zero')
        # Terreno sem grade não pode ir pro computador de tiro — mas PODE ir
        # pra wiki. O consumidor decide pelo campo; aqui só garantimos que
        # nunca há grade "meio preenchida".
        if g and (g['offsetX'] is None or g['offsetY'] is None):
            erros.append(f'{e["classe"]}: grade sem offset')
    return erros


def escrever(entradas, completos):
    os.makedirs(os.path.dirname(SAIDA_JS), exist_ok=True)
    corpo = ',\n  '.join(js_valor(e) for e in entradas)
    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-terrenos.py).',
        ' *',
        ' * `grade` é a grade REAL do config de cada mundo. No vanilla o',
        ' * passoY é NEGATIVO (northing conta do norte pra baixo) — converter',
        ' * grade em metros sem respeitar isso erra o azimute em 180°.',
        ' * A conversão mora em src/utils/arma3-grade.js.',
        ' */',
        '',
        f'export const A3TER = [\n  {corpo},\n];',
        '',
        f'export const A3TER_TOTAL = {len(entradas)};',
        '',
        'export const A3TER_META = ' + js_valor({
            'oficiais': sum(1 for e in entradas if not e['ehMod']),
            'mods': sum(1 for e in entradas if e['ehMod']),
            'comGrade': sum(1 for e in entradas if e['grade']),
            'dbUrl': '/arma3/terrenos-db.json',
        }) + ';',
        '',
        '/* Localidades e aeroportos completos, sob demanda. */',
        'let _db = null;',
        'export function carregarTerrenos() {',
        '  if (!_db) {',
        '    _db = fetch(A3TER_META.dbUrl)',
        '      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })',
        '      .catch((err) => { _db = null; throw err; });',
        '  }',
        '  return _db;',
        '}',
        '',
    ]
    corpo_js = '\n'.join(linhas)

    # ── Sobre o alerta do CodeQL nas duas escritas abaixo ──
    #
    # `py/clear-text-storage-sensitive-data` marca as duas como "armazena dado
    # privado em texto claro". O que dispara a heurística são os campos
    # `latitude`/`longitude` de cada entrada: a classificação `private` do
    # CodeQL inclui coordenada geográfica. Corrobora que é isso — entre os seis
    # geradores deste diretório, este é o único que carrega lat/lon, e o único
    # marcado.
    #
    # É falso positivo, e a razão é factual, não conveniência: são as
    # coordenadas FICTÍCIAS dos mundos do Arma 3, lidas do `CfgWorlds`, que a
    # Bohemia publica no próprio jogo. Altis fica "em" 39,9 N / 25,15 E porque
    # foi inspirada em Lemnos. Não há pessoa, não há rastreio, não há segredo —
    # e o arquivo de saída é servido publicamente no site, de propósito.
    #
    # NÃO há supressão no código. Tentei `# codeql[py/clear-text-storage-...]`
    # nas duas linhas e o alerta voltou igual, só deslocado — o code scanning
    # do GitHub não honra comentário de supressão inline (isso era do LGTM).
    # `paths-ignore` no workflow também já falhou neste repo, em outra frente.
    # O caminho que resta é dispensar o alerta na aba Security como falso
    # positivo. Este comentário existe para quem for dispensar ter o porquê.
    with open(SAIDA_JS, 'w', encoding='utf-8') as f:
        f.write(corpo_js)

    def escrever_json(caminho):
        os.makedirs(os.path.dirname(caminho), exist_ok=True)
        with open(caminho, 'w', encoding='utf-8') as f:
            json.dump({'terrenos': completos}, f, ensure_ascii=False,
                      separators=(',', ':'))

    escrever_json(SAIDA_JSON)

    if os.path.isdir(RAIZ_VANGUARD):
        os.makedirs(os.path.dirname(SAIDA_VANGUARD), exist_ok=True)
        with open(SAIDA_VANGUARD, 'w', encoding='utf-8') as f:
            f.write(corpo_js)
        escrever_json(SAIDA_VANGUARD_JSON)
        print(f'         {SAIDA_VANGUARD}  (repo irmão)')
        print(f'         {SAIDA_VANGUARD_JSON}  (repo irmão)')
    else:
        print('  (Project-Vanguard não está clonado ao lado — pulei a cópia irmã)')


def main():
    if not os.path.isfile(ENTRADA):
        raise SystemExit(f'falta {ENTRADA} — rode dump-mapas.sqf no jogo e '
                         'python scripts/arma3/parse-mapas.py antes.')
    with open(ENTRADA, encoding='utf-8') as f:
        dump = json.load(f)

    entradas, completos, pulados = montar(dump)
    erros = verificar(entradas)
    if erros:
        print(f'{len(erros)} violação(ões) — NADA foi gerado:')
        for e in erros[:20]:
            print('  -', e)
        raise SystemExit(1)

    escrever(entradas, completos)

    oficiais = [e for e in entradas if not e['ehMod']]
    print(f'mundos no dump ....... {len(dump.get("mundos") or {})}')
    print(f'  alias pulados ...... {pulados}')
    print(f'terrenos na base ..... {len(entradas)}')
    print(f'  oficiais ........... {len(oficiais)}  '
          f'({", ".join(sorted(set(e["dlc"] for e in oficiais)))})')
    print(f'  de mod ............. {len(entradas) - len(oficiais)}')
    print(f'  com grade .......... {sum(1 for e in entradas if e["grade"])}')
    print(f'\nescrito: {SAIDA_JS}')
    print(f'         {SAIDA_JSON}')


if __name__ == '__main__':
    main()
