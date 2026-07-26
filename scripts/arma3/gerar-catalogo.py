#!/usr/bin/env python3
"""Gera o catálogo do site (tudo que NÃO é arma) a partir do dump in-game.

Entrada (fora do git, regenerável):
  scripts/arma3/out/arma3-catalogo.json  — do parse-catalogo.py
  scripts/arma3/out/armas-imagens.json   — do extrair-imagens.py

Saída (versionada):
  src/data/arma3-catalogo.js       — núcleo: vanilla + DLC, no bundle
  public/arma3/catalogo-db.json    — tudo (com mods), sob demanda

É o irmão do `gerar-base-armas.py` e segue as MESMAS três decisões descritas
lá (origem por caminho de asset, colapso de variante cosmética, inferência com
evidência declarada). O que muda é o que cada categoria tem de próprio:

  veículo    blindagem, velocidade máxima, combustível, transporte, armamento
  soldado    lado, facção, uniforme, armamento inicial, engenheiro/médico
  mira       modos de óptica com ZOOM REAL (o config guarda FOV em radianos)
  colete     proteção por ponto do corpo (armor + passThrough), capacidade
  uniforme   idem, e a classe de contêiner que define quanto carrega
  mochila    capacidade e massa

RODAR SEM O DUMP É NORMAL. Enquanto o operador não rodar o dump-catalogo.sqf
no jogo, este script gera um módulo VÁLIDO e VAZIO, com `disponivel: false`.
A tela então diz "aguardando extração" em vez de mostrar tabela vazia sem
explicação — e o build nunca quebra por falta de um arquivo que não está no git.
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(RAIZ, 'scripts', 'arma3', 'out')
DEST_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-catalogo.js')
DEST_JSON = os.path.join(RAIZ, 'public', 'arma3', 'catalogo-db.json')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, FONTE_DLC, cam, js_valor, num, slug,
)

# Categorias do catálogo. `colunas` é o que a tabela mostra, na ordem — a UI
# lê daqui em vez de ter um `if` por categoria espalhado pela página.
CATEGORIAS = [
    ('viatura', 'Viaturas', '🚙', 'Rodas sem blindagem pesada: transporte, patrulha, logística.',
     ['blindagem', 'velocidade', 'transporte', 'combustivel']),
    ('blindado', 'Blindados', '🛡️', 'Carros de combate e APC — canhão, lagarta ou roda pesada.',
     ['blindagem', 'velocidade', 'transporte', 'armamento']),
    ('helicoptero', 'Helicópteros', '🚁', 'Asa rotativa: transporte, ataque e reconhecimento.',
     ['blindagem', 'velocidade', 'transporte', 'armamento']),
    ('aviao', 'Aviões', '✈️', 'Asa fixa: caça, ataque ao solo e transporte.',
     ['blindagem', 'velocidade', 'transporte', 'armamento']),
    ('naval', 'Naval', '🚤', 'Barcos e submersíveis.',
     ['blindagem', 'velocidade', 'transporte']),
    ('drone', 'Drones (UAV/UGV)', '📡', 'Não tripulados — observação e ataque.',
     ['blindagem', 'velocidade', 'armamento']),
    ('estatico', 'Armamento estático', '🎯', 'Metralhadora, morteiro e AT/AA de posição fixa.',
     ['armamento', 'transporte']),
    ('soldado', 'Soldados & funções', '🪖', 'Cada função com o equipamento que nasce equipado.',
     ['lado', 'faccao', 'uniforme', 'armamento']),
    ('mira', 'Miras & ópticas', '🔭', 'Do red dot ao 25×: zoom real lido do config.',
     ['zoom', 'visao', 'massa']),
    ('boca', 'Acessórios de boca', '🔇', 'Supressores e freios — o que vai na ponta do cano.',
     ['massa']),
    ('apontador', 'Apontadores & lanternas', '🔦', 'Laser (visível e IV) e iluminação.',
     ['massa']),
    ('bipe', 'Bipés', '📐', 'Apoio que reduz a oscilação no tiro deitado.', ['massa']),
    ('uniforme', 'Uniformes', '👕', 'Roupa: capacidade de carga e a proteção que ela dá.',
     ['protecao', 'capacidade', 'massa']),
    ('colete', 'Coletes', '🦺', 'Proteção por ponto do corpo + capacidade de bolsos.',
     ['protecao', 'capacidade', 'massa']),
    ('capacete', 'Capacetes', '⛑️', 'Proteção de cabeça.', ['protecao', 'massa']),
    ('mochila', 'Mochilas', '🎒', 'Capacidade de carga nas costas.', ['capacidade', 'massa']),
    ('visao-noturna', 'Visão noturna', '🌙', 'NVG e termais.', ['massa']),
    ('binoculo', 'Binóculos & telêmetros', '🔍', 'Observação e medição de distância.', ['massa']),
    ('gps', 'GPS & UAV terminal', '🛰️', 'Navegação e controle de drone.', ['massa']),
    ('bussola', 'Bússolas & relógios', '🧭', 'Navegação básica.', ['massa']),
    ('radio', 'Rádios', '📻', 'Comunicação.', ['massa']),
    ('oculos', 'Óculos & máscaras', '🕶️', 'Facial: óculos, balaclava, máscara de gás.', ['massa']),
    ('coldre', 'Coldres', '🔩', 'Onde a secundária fica.', ['massa']),
]


def protecao_resumo(prot):
    """Um número comparável a partir da proteção por ponto do corpo.

    O config dá `armor` (quanto absorve) e `passThrough` (fração que ATRAVESSA)
    por ponto. Não existe "o" valor de proteção de um colete — resumir num só
    número é escolha editorial, então isto devolve o do TÓRAX, que é o que o
    jogador compara, e mantém a lista inteira ao lado pra quem quiser o resto.
    """
    if not prot:
        return None, None
    torax = next((p for p in prot if (p.get('ponto') or '').lower() in
                  ('hitchest', 'chest', 'hitbody', 'body')), None)
    alvo = torax or prot[0]
    return alvo.get('armor'), alvo.get('ponto')


def montar(classes, fonte, imagens, categoria):
    """Uma entrada de catálogo a partir do grupo de classes equivalentes."""
    classes = sorted(classes, key=lambda c: (len(c), c))
    canon = classes[0]
    e = fonte[canon]

    img = imagens.get(canon)
    if not img:
        for c in classes:
            if imagens.get(c):
                img = imagens[c]
                break
    ausente = None
    if not img:
        ausente = ('sem-picture-no-config' if not (e.get('picture') or '').strip()
                   else 'paa-nao-extraido')

    dlc = origem_asset(canon, e)
    # Mais curto do grupo: as variantes de camuflagem só acrescentam sufixo.
    nomes = sorted({fonte[c].get('nome') for c in classes if fonte[c].get('nome')})
    nome = min(nomes, key=lambda x: (len(x), x)) if nomes else (e.get('nome') or canon)
    prot = e.get('protecao') or []
    prot_val, prot_ponto = protecao_resumo(prot)
    opticas = e.get('opticas') or []
    zooms = [o['zoomMax'] for o in opticas if o.get('zoomMax')]

    return {
        'id': slug(canon),
        'classe': canon,
        'nome': nome,
        'nomes': nomes,
        'categoria': categoria,
        'origem': dlc or (e.get('fonte') or '').lstrip('@') or None,
        'ehMod': dlc is None,
        'fontePatch': e.get('fonte') or None,
        'lado': e.get('lado'),
        'faccao': e.get('faccao') or None,
        'blindagem': num(e.get('armor')),
        'velocidade': num(e.get('maxSpeed')),
        'combustivel': num(e.get('fuelCapacity')),
        'transporte': num(e.get('transporte')),
        'massa': num(e.get('massa')),
        'capacidade': num(e.get('capacidade')),
        'uniforme': e.get('uniformClass'),
        'engenheiro': e.get('engenheiro'),
        'medico': e.get('medico'),
        'armamento': e.get('armas') or [],
        'opticas': opticas,
        'zoomMax': max(zooms) if zooms else None,
        'protecao': prot,
        'protecaoTorax': prot_val,
        'protecaoPonto': prot_ponto,
        'desc': (e.get('descricao') or '').strip() or None,
        'img': img,
        'imgAusente': ausente,
        'variantes': len(classes),
    }


def origem_asset(classe, e):
    """DLC de origem pelo caminho do asset. Mesma lógica do gerador de armas:
    `fonte` é quem PATCHEOU por último, não de quem é a coisa."""
    achado = None
    for p in (cam(e.get('model')), cam(e.get('picture'))):
        partes = [x for x in p.split('/') if x]
        if not partes:
            continue
        if partes[0] == 'a3' and len(partes) > 1:
            base = partes[1]
            achado = DIR_DLC.get(base) or ('Base' if base.endswith('_f') or '_f_' in base else None)
            if achado:
                break
        if partes[0] in DIR_CDLC:
            achado = DIR_CDLC[partes[0]]
            break
    if not achado:
        return None
    f = e.get('fonte') or ''
    if not f.startswith('@'):
        return achado
    # Asset do jogo mas classe de mod (mod que reaproveita modelo do vanilla):
    # só conta como vanilla se a classe não carregar a etiqueta do mod.
    tag = f.lstrip('@').lower().replace(' ', '')
    return None if tag and classe.lower().startswith(tag[:4]) else achado


def chave(e):
    """Mesmo modelo E mesmos números = mesma coisa. Colapsa camuflagem."""
    return (cam(e.get('model')), e.get('categoria'), e.get('armor'), e.get('maxSpeed'),
            e.get('capacidade'), e.get('massa'), e.get('uniformClass'))


def verificar(entradas):
    erros = []
    for e in entradas:
        if e['img'] and e['imgAusente']:
            erros.append(f'{e["classe"]}: tem img E imgAusente')
        if not e['img'] and not e['imgAusente']:
            erros.append(f'{e["classe"]}: sem img e sem motivo declarado')
        for campo in ('blindagem', 'velocidade', 'massa', 'capacidade'):
            x = e[campo]
            if x is not None and (x != x):
                erros.append(f'{e["classe"]}: {campo} não é número finito')
    return erros


def main():
    cat_path = os.path.join(OUT, 'arma3-catalogo.json')
    img_path = os.path.join(OUT, 'armas-imagens.json')

    imagens = {}
    if os.path.exists(img_path):
        with open(img_path, encoding='utf-8') as f:
            imagens = json.load(f)

    if not os.path.exists(cat_path):
        print(f'sem {os.path.relpath(cat_path, RAIZ)} — gerando catálogo VAZIO.')
        print('Pra preencher: rode scripts/arma3/dump-catalogo.sqf no debug console')
        print('do jogo e depois python scripts/arma3/parse-catalogo.py.')
        escrever_js([], [], None, disponivel=False)
        escrever_json([], None)
        return

    with open(cat_path, encoding='utf-8') as f:
        doc = json.load(f)

    # As três seções viram uma lista só: a categoria já está em cada entrada.
    fonte = {}
    for secao in ('veiculos', 'itens', 'oculos'):
        fonte.update(doc.get(secao) or {})

    grupos = defaultdict(list)
    for classe, e in fonte.items():
        grupos[chave(e)].append(classe)

    entradas = []
    for classes in grupos.values():
        canon = sorted(classes, key=lambda c: (len(c), c))[0]
        entradas.append(montar(classes, fonte, imagens, fonte[canon].get('categoria')))
    entradas.sort(key=lambda e: (e['categoria'], e['nome'].lower()))

    erros = verificar(entradas)
    if erros:
        print('FALHA nas invariantes de honestidade:', file=sys.stderr)
        for x in erros[:25]:
            print('  -', x, file=sys.stderr)
        sys.exit(1)

    nucleo = [e for e in entradas if not e['ehMod']]
    escrever_js(nucleo, entradas, doc.get('fonte'), disponivel=True)
    escrever_json(entradas, doc.get('fonte'))
    relatorio(nucleo, entradas)


CAMPOS = ('id', 'classe', 'nome', 'categoria', 'origem', 'lado', 'faccao',
          'blindagem', 'velocidade', 'combustivel', 'transporte', 'massa',
          'capacidade', 'uniforme', 'engenheiro', 'medico', 'zoomMax',
          'protecaoTorax', 'protecaoPonto', 'img', 'imgAusente', 'variantes',
          'nomes', 'fontePatch', 'desc', 'armamento', 'opticas', 'protecao')


def escrever_js(nucleo, todas, dump, disponivel):
    L = []
    L.append('/**')
    L.append(' * Catálogo do Arma 3 — TUDO que não é arma, com valores medidos no config')
    L.append(' * do jogo em execução: veículos, soldados, miras, uniformes, coletes,')
    L.append(' * capacetes, mochilas, acessórios e óculos.')
    L.append(' *')
    L.append(' * ⚠️ ARQUIVO GERADO — não edite à mão.')
    L.append(' *   Gerador: scripts/arma3/gerar-catalogo.py')
    L.append(f' *   Dump de origem: {dump or "(ainda não rodado)"}')
    L.append(' *')
    L.append(' * As armas ficam em arma3-armas.js — separadas porque só elas têm')
    L.append(' * balística, e é a balística que alimenta a calculadora de trajetória.')
    L.append(' *')
    L.append(' * HONESTIDADE')
    L.append(' *   - Ausente é `null`, NUNCA zero. O `getNumber` do SQF devolve 0 pra')
    L.append(' *     propriedade que não existe, então o dump testa `isNumber` antes e')
    L.append(' *     emite vazio — senão "sem blindagem declarada" viraria "blindagem 0".')
    L.append(' *   - `protecao` traz o valor por ponto do corpo como o config dá')
    L.append(' *     (`armor` absorve, `passThrough` é o que ATRAVESSA). `protecaoTorax`')
    L.append(' *     é um resumo editorial pra tabela, não um número do jogo.')
    L.append(' *   - `zoomMax` sai do FOV em radianos do config (0.75 rad = olho nu).')
    L.append(' *   - `img: null` + `imgAusente` com o motivo — sem placeholder que finja')
    L.append(' *     ser o item.')
    L.append(' */')
    L.append('')
    L.append('/* Categorias, com as colunas que cada tabela mostra (a UI lê daqui). */')
    L.append('export const A3CAT_CATEGORIAS = [')
    for cid, nome, icon, desc, cols in CATEGORIAS:
        L.append(f'  {{ id: {js_valor(cid)}, nome: {js_valor(nome)}, icon: {js_valor(icon)}, '
                 f'desc: {js_valor(desc)}, colunas: {js_valor(cols)} }},')
    L.append('];')
    L.append('')
    L.append('/* Núcleo: jogo base + DLC. O resto (mods) desce sob demanda. */')
    L.append('export const A3CAT = [')
    atual = None
    for e in nucleo:
        if e['categoria'] != atual:
            atual = e['categoria']
            L.append(f'  /* ===== {atual} ===== */')
        L.append('  { ' + ', '.join(f'{c}: {js_valor(e[c])}' for c in CAMPOS) + ' },')
    L.append('];')
    L.append('')
    L.append('export const A3CAT_TOTAL = A3CAT.length;')
    L.append('')
    L.append('export const A3CAT_META = {')
    L.append(f'  disponivel: {js_valor(bool(disponivel))},')
    L.append(f'  dump: {js_valor(dump)},')
    L.append(f'  nucleo: {len(nucleo)},')
    L.append(f'  total: {len(todas)},')
    L.append(f'  porCategoria: {js_valor(dict(sorted(Counter(e["categoria"] for e in todas).items())))},')
    L.append("  catalogoUrl: '/arma3/catalogo-db.json',")
    L.append('  comoGerar: ' + js_valor(
        'No jogo: Esc → DEBUG CONSOLE → cole scripts/arma3/dump-catalogo.sqf → EXECUTE. '
        'Depois: python scripts/arma3/parse-catalogo.py && python scripts/arma3/gerar-catalogo.py'))
    L.append('};')
    L.append('')
    L.append('/* Catálogo completo (com mods) sob demanda — uma requisição por sessão. */')
    L.append('let _catalogo = null;')
    L.append('export function carregarCatalogo() {')
    L.append('  if (!_catalogo) {')
    L.append('    _catalogo = fetch(A3CAT_META.catalogoUrl)')
    L.append('      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })')
    L.append('      .then((d) => d.itens)')
    L.append('      .catch((err) => { _catalogo = null; throw err; });')
    L.append('  }')
    L.append('  return _catalogo;')
    L.append('}')
    L.append('')
    with open(DEST_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


def escrever_json(todas, dump):
    os.makedirs(os.path.dirname(DEST_JSON), exist_ok=True)
    doc = {
        '_leia': ('Gerado por scripts/arma3/gerar-catalogo.py a partir do dump in-game. '
                  'Ausente é null, nunca zero.'),
        'dump': dump,
        'total': len(todas),
        'itens': todas,
    }
    with open(DEST_JSON, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))


def relatorio(nucleo, todas):
    print(f'entradas canônicas   {len(todas)}   (variantes de camuflagem colapsadas)')
    print(f'  núcleo (vanilla/DLC) {len(nucleo)}')
    print(f'  mods                 {len(todas) - len(nucleo)}')
    print()
    for k, q in Counter(e['categoria'] for e in todas).most_common():
        print(f'  {q:6d}  {k}')
    img = sum(1 for e in todas if e['img'])
    print(f'\ncom ícone  {img}/{len(todas)} ({img / max(len(todas), 1) * 100:.1f}%)')
    print(f'\nescrito: {os.path.relpath(DEST_JS, RAIZ)}')
    print(f'escrito: {os.path.relpath(DEST_JSON, RAIZ)}')


if __name__ == '__main__':
    main()
