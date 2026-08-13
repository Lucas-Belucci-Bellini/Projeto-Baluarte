#!/usr/bin/env python3
"""Gera a base de armas do site a partir do dump in-game (issue #398).

Entrada (fora do git, regenerável com parse-dump.py + extrair-imagens.py):
  scripts/arma3/out/arma3-config.json   — 10.822 armas do config em execução
  scripts/arma3/out/armas-imagens.json  — {classe: caminho público do ícone}

Saída (versionada):
  src/data/arma3-armas.js      — base NÚCLEO: vanilla + DLC + CDLC, no bundle
  public/arma3/armas-db.json   — arsenal COMPLETO (mods), carregado sob demanda

Por que duas saídas: 10.822 armas num módulo JS pesaria ~15 MB no bundle. O
núcleo (vanilla/DLC/CDLC) é o que 99% das consultas quer e cabe folgado; o
arsenal modado inteiro vira um JSON que só desce quando o operador pede.

--------------------------------------------------------------------------
TRÊS DECISÕES QUE NÃO SÃO ÓBVIAS (e o porquê de cada uma)
--------------------------------------------------------------------------

1. `fonte` NÃO diz de quem é a arma.

   O dump grava `configSourceMod`, que é o mod cujo patch DEFINIU a entrada por
   último. O ACE sobrescreve quase todo o vanilla, então `arifle_MX_F` — MX do
   jogo base — sai com `fonte: "@ace"`. Usar esse campo pra separar vanilla de
   mod erra por centenas de armas.

   O que realmente identifica a origem é o CAMINHO DO ASSET (`model`/`picture`):
   `/A3/Weapons_F*/…` é jogo base/DLC, `/lxWS/`, `/lxRF/`, `/ef/` são as CDLC.
   O `fonte` continua exportado, como `fontePatch` — é informação honesta sobre
   quem mexeu no número, só não é a resposta pra "que arma é essa".

   Ainda falta um filtro: mods que REAPROVEITAM asset do vanilla (o
   `ace_spike_launcher` usa o modelo do Titan) entrariam como vanilla. Por isso
   o núcleo também exige que a classe use um prefixo de slot do jogo
   (`arifle_`, `srifle_`, `hgun_`…) ou que o `fonte` seja o código de uma DLC.

2. Uma linha da tabela = um modelo COM uma balística.

   As 10.822 entradas incluem variante de óptica pré-montada (`_ACO_F`,
   `_Holo_pointer_snds_F`) e de camuflagem (`(Arid)`, `(Lush)`): 26 entradas só
   de MX, todas a mesma arma. Agrupar por (model, v0, airFriction, capacidade,
   tipo, rpm) colapsa o que é cosmético e mantém separado o que muda o tiro —
   o mesmo `mxm_f.p3d` aparece com v0 774 e 857 (carregador diferente), e essas
   PRECISAM ser linhas distintas. 10.822 → 1.477 armas de verdade.

3. `tipoSugerido` do dump foi substituído.

   A heurística anterior jogava 9.090 das 10.822 em "fuzil" — um default, não
   uma classificação. Aqui a inferência é encadeada e cada arma declara em que
   evidência caiu (campo `tipoFonte`):

     config     — o campo `type` do engine (2=pistola, 4=lançador). Autoritativo.
     descricao  — `descriptionShort` com categoria ESPECÍFICA ("Sniper Rifle",
                  "Marksman rifle", "Light Machine Gun"). É o rótulo do jogo.
     classe     — prefixo de slot do config (`srifle_` = precisão, `lmg_`…).
     desc-generica — "assault rifle"/"carbine": texto real, mas fraco.
     numerico   — só capacidade/RPM (cinto de 100+ = LMG; ferrolho lento = sniper).
     nenhuma    — tipo `primaria`, que é o que o config diz (`type: 1`) e nada mais.

   `primaria` existe de propósito: é honesto dizer "o config só garante que é
   arma primária" em vez de chamar de fuzil um Barrett M82 porque a descrição
   do mod é só o nome do produto.

REGRA DE HONESTIDADE (herdada da #398): dado ausente é `null`, NUNCA zero.
`dano: null` é "não sabemos"; `dano: 0` seria "não causa dano".
"""

import json
import os
import re
import sys
from collections import Counter, defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, FONTE_DLC, cam, js_valor, num, slug,
)

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(RAIZ, 'scripts', 'arma3', 'out')
DEST_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-armas.js')
DEST_JSON = os.path.join(RAIZ, 'public', 'arma3', 'armas-db.json')
DEST_MUN = os.path.join(RAIZ, 'src', 'data', 'arma3-municao.js')
NOTAS = os.path.join(RAIZ, 'scripts', 'arma3', 'notas-editoriais.json')

# Prefixos de slot de arma do jogo (DIR_DLC/DIR_CDLC/FONTE_DLC vêm do módulo
# comum — ver gerar_base_armas_comum.py).
SLOTS = {'arifle', 'srifle', 'hgun', 'launch', 'lmg', 'mmg', 'smg', 'sgun'}



def origem(classe, arma):
    """DLC de origem, ou None se for mod. Ver decisão (1) no topo."""
    achado = None
    for p in (cam(arma.get('model')), cam(arma.get('picture'))):
        partes = [x for x in p.split('/') if x]
        if not partes:
            continue
        if partes[0] == 'a3' and len(partes) > 1 and partes[1] in DIR_DLC:
            achado = DIR_DLC[partes[1]]
            break
        if partes[0] in DIR_CDLC:
            achado = DIR_CDLC[partes[0]]
            break
    if not achado:
        return None
    fonte = arma.get('fonte') or ''
    # Asset é do jogo, mas a classe é de mod? Só entra se usar slot do jogo
    # ou se a própria DLC assinar o config.
    if classe.split('_')[0].lower() in SLOTS:
        return achado
    if not fonte.startswith('@') and fonte in FONTE_DLC:
        return achado
    return None


# ── miras e acessórios pré-montados ──────────────────────────────────────
# O config não tem "lista de miras compatíveis" por arma. Mas TEM as variantes
# pré-montadas: `arifle_MX_ACO_F` é o MX com o ACO já no trilho. Quando o
# gerador colapsa essas variantes (elas têm a mesma balística), o nome do
# acessório iria junto pro lixo — e ele é informação de verdade sobre o que
# aquela arma aceita no jogo.
#
# ⚠️ Isto lista o que APARECE MONTADO, não o que é compatível: uma arma sem
# variante pré-montada aparece sem mira, mesmo aceitando todas. E a AMPLIAÇÃO
# de cada mira NÃO está aqui — mora no `OpticsModes` do item da óptica, que só
# o dump-catalogo.sqf alcança. Por isso o campo guarda só o rótulo.
MIRAS = {
    'aco': 'ACO', 'acos': 'ACO SD', 'holo': 'Holosight', 'mrco': 'MRCO',
    'arco': 'ARCO', 'rco': 'RCO', 'erco': 'ERCO', 'hamr': 'Hamr',
    'dms': 'DMS', 'sos': 'SOS', 'mos': 'MOS', 'ams': 'AMS', 'khs': 'KHS',
    'lrps': 'LRPS', 'nstalker': 'Nightstalker', 'kahlia': 'Kahlia',
    'ico': 'ICO', 'tws': 'TWS', 'dmr': None,
}
ACESSORIOS = {
    'pointer': 'apontador laser', 'point': 'apontador laser',
    'snds': 'supressor', 'sd': 'supressor', 'flash': 'lanterna',
    'bi': 'bipé', 'lp': 'apontador (LP)', 'bpd': 'bipé',
}


def acessorios_das_variantes(classes):
    """(miras, acessórios) que aparecem PRÉ-MONTADOS nas variantes do grupo."""
    miras, acess = set(), set()
    for c in classes:
        for tok in c.split('_')[1:]:
            t = tok.lower()
            if t in MIRAS and MIRAS[t]:
                miras.add(MIRAS[t])
            elif t in ACESSORIOS:
                acess.add(ACESSORIOS[t])
    return sorted(miras), sorted(acess)


# ── tipo ──────────────────────────────────────────────────────────────────
# Categorias ESPECÍFICAS no descriptionShort: o rótulo que o próprio jogo usa.
DESC_ESPECIFICA = [
    (r'anti[-\s]?materiel', 'sniper'),
    (r'\bsniper\b', 'sniper'),
    (r'marksman|sharpshooter|\bdmr\b|designated', 'dmr'),
    (r'light machine gun|medium machine gun|general purpose machine gun'
     r'|\bmachine\s?gun\b|\blmg\b|\bmmg\b|\bgpmg\b|automatic rifle|\bsaw\b', 'lmg'),
    (r'submachine|\bsmg\b|machine pistol|\bpdw\b', 'smg'),
    (r'shotgun', 'shotgun'),
    (r'rocket launcher|missile launcher|grenade launcher|\bat launcher\b|\baa launcher\b', 'lancador'),
    (r'handgun|\bpistol\b|revolver', 'pistola'),
]
# Categorias GENÉRICAS: texto real do config, mas não separa fuzil de DMR.
DESC_GENERICA = [(r'assault rifle|carbine|infantry rifle|battle rifle|\brifle\b', 'fuzil')]
DESC_ESPECIFICA = [(re.compile(p, re.I), t) for p, t in DESC_ESPECIFICA]
DESC_GENERICA = [(re.compile(p, re.I), t) for p, t in DESC_GENERICA]
PREFIXO_TIPO = {'sgun': 'shotgun', 'lmg': 'lmg', 'mmg': 'lmg', 'smg': 'smg',
                'hgun': 'pistola', 'launch': 'lancador', 'arifle': 'fuzil'}


def classificar(classe, arma):
    """(tipo, evidência). Ver decisão (3) no topo — a ordem é o argumento."""
    tipo_cfg = arma.get('tipo')
    if tipo_cfg == 4:
        return 'lancador', 'config'
    if tipo_cfg == 2:
        return 'pistola', 'config'

    desc = arma.get('descricao') or ''
    for rx, tp in DESC_ESPECIFICA:
        if rx.search(desc):
            # `type == 1` é ARMA PRIMÁRIA no engine, e isso é autoritativo:
            # o fuzil com lança-granadas acoplado (MX 3GL, Katiba KGL, TRG21 GL)
            # tem `type: 1` e descrição "Assault Rifle · … · Grenade Launcher".
            # Deixar o texto decidir classificava o fuzil como lançador — e,
            # pior, marcava `balistico: false`, então a calculadora recusava uma
            # arma com balística de fuzil perfeitamente boa (o MX 3GL tem o v0 e
            # o airFriction do MX). O UGL é boca SECUNDÁRIA, não o tipo da arma.
            if tp == 'lancador' and tipo_cfg == 1:
                continue
            return tp, 'descricao'

    pref = classe.split('_')[0].lower()
    if pref == 'srifle':
        # Slot de precisão do jogo. O corte sai do dado: zeragem máxima de
        # 2000 m+ só aparece nos ferrolhos anti-materiel (GM6 2200, M200 2400),
        # enquanto os DMR de 7.62/6.5 param em 1400–1600.
        return ('sniper' if (arma.get('maxZeroing') or 0) >= 2000 else 'dmr'), 'classe'
    if pref in PREFIXO_TIPO:
        return PREFIXO_TIPO[pref], 'classe'

    for rx, tp in DESC_GENERICA:
        if rx.search(desc):
            return tp, 'desc-generica'

    cap, rpm = arma.get('capacidade'), arma.get('rpm')
    if cap is not None and cap >= 100:
        return 'lmg', 'numerico'          # cinto/caixa: não existe fuzil assim
    if cap is not None and cap <= 12 and rpm is not None and rpm <= 150:
        return 'sniper', 'numerico'       # cadência de ferrolho
    return 'primaria', 'nenhuma'


# ── calibre ───────────────────────────────────────────────────────────────
RX_CAL = re.compile(r'caliber\s*[:\-]?\s*([^<\n;,]{1,24})', re.I)
# Normalização: variação de escrita → rótulo único. Só junta o que é o MESMO
# calibre escrito de formas diferentes; nada é renomeado pra outro calibre.
CAL_CANON = [
    (r'^5\.?56', '5.56×45 mm'), (r'^5\.?45', '5.45×39 mm'), (r'^5\.?8', '5.8×42 mm'),
    (r'^6\.?5\s*(x|×)\s*39|^6\.?5(?!\d)', '6.5×39 mm'), (r'^6\.?5\s*creed', '6.5 Creedmoor'),
    (r'^6\.?8', '6.8 SPC'), (r'^7\.?62\s*(x|×)\s*51|^7\.?62\s*nato', '7.62×51 mm'),
    (r'^7\.?62\s*(x|×)\s*39', '7.62×39 mm'), (r'^7\.?62\s*(x|×)\s*54', '7.62×54 mm'),
    (r'^7\.?62(?!\d)', '7.62 mm'), (r'^9\.?3', '9.3×64 mm'),
    (r'^9\s*(x|×)\s*(19|21)|^9\s*mm|^9(?!\d)', '9 mm'),
    (r'^\.?300\s*(blk|blackout|aac)', '.300 BLK'), (r'^\.?300\s*(wm|win)', '.300 WM'),
    (r'^\.?338\s*(lm|lapua)?', '.338 LM'), (r'^\.?408', '.408 CheyTac'),
    (r'^\.?45\s*acp|^\.?45(?!\d)', '.45 ACP'), (r'^\.?50\s*(bmg)?', '12.7×99 mm'),
    (r'^12\.?7\s*(x|×)\s*99', '12.7×99 mm'), (r'^12\.?7\s*(x|×)\s*108', '12.7×108 mm'),
    (r'^12\.?7\s*(x|×)\s*54', '12.7×54 mm'), (r'^12\.?7(?!\d)', '12.7 mm'),
    (r'^12\s*(gauge|ga)|^12/70', '12 gauge'), (r'^20\s*mm', '20 mm'),
    (r'^\.?22', '.22 LR'), (r'^\.?357', '.357 Mag'), (r'^\.?40', '.40 S&W'),
    (r'^\.?416', '.416 Barrett'), (r'^\.?458', '.458 SOCOM'),
]
CAL_CANON = [(re.compile(p, re.I), r) for p, r in CAL_CANON]
# Calibre a partir da CLASSE da munição, quando a descrição não traz.
RX_CAL_AMMO = re.compile(r'(\d{1,2}[._]?\d?)\s*x\s*(\d{2,3})', re.I)


def calibre(arma):
    """Rótulo de calibre + de onde saiu. None quando o config não informa."""
    m = RX_CAL.search(arma.get('descricao') or '')
    if m:
        cru = m.group(1).strip().rstrip('.').strip()
        for rx, rot in CAL_CANON:
            if rx.match(cru):
                return rot, 'descricao'
        if cru:
            return cru, 'descricao-cru'
    mun = arma.get('municao') or ''
    m2 = RX_CAL_AMMO.search(mun)
    if m2:
        cru = f"{m2.group(1).replace('_', '.')}x{m2.group(2)}"
        for rx, rot in CAL_CANON:
            if rx.match(cru):
                return rot, 'municao'
        return f"{m2.group(1).replace('_', '.')}×{m2.group(2)} mm", 'municao'
    return None, None


def limpar_desc(s):
    """descriptionShort sem as tags <br/> que o config usa como quebra."""
    s = re.sub(r'<br\s*/?>', ' · ', s or '', flags=re.I)
    s = re.sub(r'<[^>]+>', '', s)
    return re.sub(r'\s*·\s*$', '', re.sub(r'\s+', ' ', s)).strip()



# ── agrupamento ───────────────────────────────────────────────────────────
def chave(arma):
    """Mesmo modelo E mesma balística = mesma arma. Ver decisão (2) no topo."""
    return (cam(arma.get('model')), arma.get('v0'), arma.get('airFriction'),
            arma.get('capacidade'), arma.get('tipo'), arma.get('rpm'))



def montar(classes, armas, municoes, imagens, notas):
    """Uma entrada de catálogo a partir do grupo de classes equivalentes."""
    classes = sorted(classes, key=lambda c: (len(c), c))
    canon = classes[0]
    a = armas[canon]
    tipo, tipo_fonte = classificar(canon, a)
    cal, cal_fonte = calibre(a)
    mun = municoes.get((a.get('municao') or '').lower()) or {}

    # Ícone: o do canônico; se faltar, o de qualquer variante equivalente
    # (mesma arma, mesma imagem no jogo).
    img = imagens.get(canon)
    if not img:
        for c in classes:
            if imagens.get(c):
                img = imagens[c]
                break
    ausente = None
    if not img:
        ausente = ('sem-picture-no-config' if not (a.get('picture') or '').strip()
                   else 'paa-nao-extraido')

    # Foguete/míssil NÃO segue o modelo de bala. No config o `airFriction` de
    # rocket é POSITIVO e o `v0` é a velocidade de EJEÇÃO (30 m/s), enquanto o
    # míssil acelera até o `typicalSpeed` (~900). Jogar esse par no integrador
    # de arrasto (que espera airFriction < 0) daria um projétil ACELERANDO —
    # por isso a calculadora precisa saber recusar, e não adivinhar.
    modos = [{'nome': m.get('nome'), 'rpm': num(m.get('rpm')),
              'dispersao': num(m.get('dispersao')), 'auto': bool(m.get('auto')),
              'rajada': num(m.get('rajada'))}
             for m in (a.get('modos') or [])]

    af = num(a.get('airFriction'))
    balistico = tipo != 'lancador' and af is not None and af < 0

    # Dispersão: o config guarda em RADIANOS, por modo de tiro. O número que
    # o jogador compara é o desvio em centímetros a 100 m, que é conversão de
    # unidade pura (rad × 100 m × 100 cm/m) — nada estimado. Pega a MENOR
    # dispersão entre os modos: é a precisão da arma no melhor caso, que é o
    # que faz sentido comparar entre armas.
    disps = [m['dispersao'] for m in modos if m.get('dispersao')]
    disp = min(disps) if disps else None

    # Nome de exibição: o MAIS CURTO do grupo. As variantes de camuflagem só
    # acrescentam sufixo ("MX", "MX (Black)", "MX (Khaki)"), então o mais curto
    # é o nome da arma; usar o do canônico daria "HERA H6 (Black)" como título.
    miras, acessorios = acessorios_das_variantes(classes)
    nomes = sorted({armas[c].get('nome') for c in classes if armas[c].get('nome')})
    nome = min(nomes, key=lambda x: (len(x), x)) if nomes else (a.get('nome') or canon)
    nota = notas.get(canon, {})
    return {
        'id': slug(canon),
        'classe': canon,
        'nome': nome,
        'nomes': nomes,
        'tipo': tipo,
        'tipoFonte': tipo_fonte,
        '_tipoCfg': a.get('tipo'),
        'origem': origem(canon, a) or (a.get('fonte') or '').lstrip('@') or None,
        'ehMod': origem(canon, a) is None,
        'calibre': cal,
        'calibreFonte': cal_fonte,
        'v0': num(a.get('v0')),
        'airFriction': af,
        'balistico': balistico,
        'dano': num(a.get('dano')),
        'danoIndireto': num(mun.get('indirectHit')),
        'raioIndireto': num(mun.get('indirectHitRange')),
        'explosivo': bool(mun.get('explosivo')) if mun else None,
        'velTipica': num(mun.get('typicalSpeed')),
        'dispersao': disp,
        'dispersaoMrad': round(disp * 1000, 3) if disp else None,
        'dispersaoCm100': round(disp * 10000, 1) if disp else None,
        'penetracao': num(a.get('caliber')),
        'capacidade': num(a.get('capacidade')),
        'rpm': num(a.get('rpm')),
        'zeroing': num(a.get('maxZeroing')),
        'massa': num(a.get('massa')),
        'municao': a.get('municao'),
        'modos': modos,
        'img': img,
        'imgAusente': ausente,
        'variantes': len(classes),
        'miras': miras,
        'acessorios': acessorios,
        'fontePatch': a.get('fonte') or None,
        'desc': limpar_desc(a.get('descricao')) or None,
        'faccao': nota.get('faccao'),
        'obs': nota.get('obs'),
    }


def verificar(entradas):
    """As invariantes de honestidade. Falha ruidosamente — melhor não gerar
    do que gerar uma tabela que mente.

    O que NÃO é invariante, e por quê:
      - `dano: 0` não é erro. O Carl Gustav iluminativo tem `hit: 0` de
        verdade: é um cartucho de iluminação, não causa dano mesmo. Quem
        distingue ausente de zero é o parse-dump.py, que já entrega `null`
        pro ausente — reprovar todo zero aqui rejeitaria dado correto.
      - `airFriction > 0` não é erro em lançador: rocket usa outro modelo de
        voo (ver `balistico` em montar()). É erro em arma balística.
    """
    erros = []
    for e in entradas:
        # O engine diz `type: 1` = arma primária. Se a classificação disser
        # "lançador" pra uma dessas, a descrição venceu o config — foi assim que
        # 68 fuzis com lança-granadas acoplado viraram lançadores e perderam a
        # calculadora, apesar de terem a balística do fuzil.
        if e['tipo'] == 'lancador' and e.get('_tipoCfg') == 1:
            erros.append(f'{e["classe"]}: classificada lançador, mas o config diz '
                         'arma primária (type 1) — o UGL é boca secundária')
        if e['balistico'] and (e['airFriction'] is None or e['airFriction'] >= 0):
            erros.append(f'{e["classe"]}: marcada balística com airFriction {e["airFriction"]}')
        if e['balistico'] and not e['v0']:
            erros.append(f'{e["classe"]}: marcada balística sem v0')
        if e['v0'] is not None and e['v0'] < 0:
            erros.append(f'{e["classe"]}: v0 negativo ({e["v0"]})')
        for campo in ('v0', 'airFriction', 'dano', 'capacidade', 'rpm', 'zeroing', 'massa'):
            x = e[campo]
            if x is not None and (x != x or x in (float('inf'), float('-inf'))):
                erros.append(f'{e["classe"]}: {campo} não é número finito ({x})')
        if e['img'] and e['imgAusente']:
            erros.append(f'{e["classe"]}: tem img E imgAusente')
        if not e['img'] and not e['imgAusente']:
            erros.append(f'{e["classe"]}: sem img e sem motivo declarado')
    return erros



def main():
    cfg_path = os.path.join(OUT, 'arma3-config.json')
    img_path = os.path.join(OUT, 'armas-imagens.json')
    if not os.path.exists(cfg_path):
        sys.exit(f'ERRO: {cfg_path} não existe.\n'
                 'Rode antes: python scripts/arma3/parse-dump.py '
                 '(precisa do .rpt do dump in-game — ver README.md).')

    with open(cfg_path, encoding='utf-8') as f:
        cfg = json.load(f)
    armas = cfg['armas']
    imagens = {}
    if os.path.exists(img_path):
        with open(img_path, encoding='utf-8') as f:
            imagens = json.load(f)
    notas = {}
    if os.path.exists(NOTAS):
        with open(NOTAS, encoding='utf-8') as f:
            notas = json.load(f)

    grupos = defaultdict(list)
    for classe, arma in armas.items():
        grupos[chave(arma)].append(classe)

    municoes = {k.lower(): v for k, v in (cfg.get('municoes') or {}).items()}
    entradas = [montar(cs, armas, municoes, imagens, notas) for cs in grupos.values()]
    entradas.sort(key=lambda e: (e['tipo'], -(e['v0'] or 0), e['nome'].lower()))

    erros = verificar(entradas)
    if erros:
        print('FALHA nas invariantes de honestidade:', file=sys.stderr)
        for e in erros[:25]:
            print('  -', e, file=sys.stderr)
        sys.exit(1)

    nucleo = [e for e in entradas if not e['ehMod']]
    mods = [e for e in entradas if e['ehMod']]

    escrever_js(nucleo, entradas, armas, cfg, notas)
    escrever_municao(cfg)
    escrever_json(entradas, cfg)
    relatorio(nucleo, mods, entradas, armas)


def escrever_js(nucleo, todas, armas, cfg, notas):
    """src/data/arma3-armas.js — o núcleo, no bundle."""
    campos_arma = ('id', 'classe', 'nome', 'tipo', 'tipoFonte', 'origem', 'calibre',
                   'calibreFonte', 'v0', 'airFriction', 'balistico', 'dano',
                   'danoIndireto', 'raioIndireto', 'explosivo', 'velTipica',
                   'dispersao', 'dispersaoMrad', 'dispersaoCm100',
                   'penetracao', 'capacidade', 'rpm', 'zeroing', 'massa',
                   'municao', 'img', 'imgAusente', 'variantes', 'nomes', 'miras', 'acessorios',
                   'fontePatch', 'desc', 'faccao', 'obs', 'modos')
    com_bal = sum(1 for e in nucleo if e['v0'] is not None and e['airFriction'] is not None)
    com_img = sum(1 for e in nucleo if e['img'])
    por_tipo = Counter(e['tipo'] for e in nucleo)
    por_ev = Counter(e['tipoFonte'] for e in nucleo)

    L = []
    L.append('/**')
    L.append(' * Database de ARMAS do Arma 3 — VALORES MEDIDOS no config do jogo em execução.')
    L.append(' *')
    L.append(' * ⚠️ ARQUIVO GERADO — não edite à mão.')
    L.append(' *   Gerador: scripts/arma3/gerar-base-armas.py')
    L.append(f' *   Dump de origem: {cfg.get("fonte", "?")}')
    L.append(' *   Notas editoriais (facção/observação): scripts/arma3/notas-editoriais.json')
    L.append(' *')
    L.append(' * Isto substitui a base anterior de 40 armas com "velocidade de referência por')
    L.append(' * calibre". Agora cada arma traz o `v0` e o `airFriction` REAIS do config —')
    L.append(' * era a pendência registrada no CHANGELOG da 0.9.0. A calculadora de')
    L.append(' * balística resolve a trajetória com o número da arma, não do calibre.')
    L.append(' *')
    L.append(' * DE ONDE VEM CADA COISA')
    L.append(' *   v0            velocidade de saída efetiva (initSpeed da arma × do carregador)')
    L.append(' *   airFriction   arrasto da munição (negativo) — o que o engine integra')
    L.append(' *   dano          `hit` da munição')
    L.append(' *   penetracao    `caliber` da munição (penetração relativa, não é o calibre!)')
    L.append(' *   zeroing       `maxZeroing` da arma, em metros')
    L.append(' *   variantes     quantas classes do config esta linha representa (óptica/camo)')
    L.append(' *')
    L.append(' * HONESTIDADE')
    L.append(' *   - Ausente é `null`, NUNCA zero. `dano: null` = "não sabemos";')
    L.append(' *     `dano: 0` diria "não causa dano" — confundir os dois mente na tabela.')
    L.append(' *   - `tipo` é o ÚNICO campo inferido. `tipoFonte` diz em que evidência caiu:')
    L.append(' *     config > descricao > classe > desc-generica > numerico > nenhuma.')
    L.append(' *     `tipo: "primaria"` = o config só garante que é arma primária.')
    L.append(' *   - `img: null` + `imgAusente` com o motivo. Não há placeholder fingindo')
    L.append(' *     ser a arma: "sem-picture-no-config" (não existe ícone) ou')
    L.append(' *     "paa-nao-extraido" (.ebo cifrado — nem o Arma 3 Tools abre).')
    L.append(' *   - `fontePatch` é o `configSourceMod`: quem definiu a entrada por último.')
    L.append(' *     O ACE sobrescreve o vanilla, então "@ace" numa arma do jogo base')
    L.append(' *     significa "o ACE mexeu neste número", não "arma do ACE".')
    L.append(' */')
    L.append('')
    L.append("import { buscarDataset } from '../core/dados-remotos.js';")
    L.append('')
    L.append('/* Tipos — separadores da tabela. `primaria` fecha a lista de propósito:')
    L.append(' * é onde cai a arma que o config não deixa classificar. */')
    L.append('export const A3ARM_TIPOS = [')
    tipos_def = [
        ('fuzil', 'Fuzis de assalto', '🔫', 'A espinha dorsal da infantaria: 5.56/6.5/7.62, semi + automático, trilhos pra tudo.'),
        ('dmr', 'Fuzis de precisão (DMR)', '🎯', 'Alcance de tirador designado: semi-auto, calibres cheios, miras de médio/longo.'),
        ('sniper', 'Snipers & anti-materiel', '🦅', 'Ferrolho e semi de longo alcance — de .338 a 12.7 mm que fura veículo leve.'),
        ('smg', 'Submetralhadoras (SMG)', '💨', 'CQB: cadência alta, 9 mm/.45, compactas pra dentro de prédio e veículo.'),
        ('lmg', 'Metralhadoras (LMG/MMG)', '🌾', 'Fogo de supressão: caixa/cinto, bipé, o "muro de chumbo" do esquadrão.'),
        ('shotgun', 'Espingardas', '💥', 'Cartucho de chumbo no CQB — alcance curtíssimo, pancada enorme de perto.'),
        ('pistola', 'Pistolas & revólveres', '🔩', 'Secundária: saque rápido, o que sobra quando o primário seca.'),
        ('lancador', 'Lançadores (AT/AA)', '🚀', 'Anti-tanque e anti-aéreo: guiado (trava) ou balístico (mira livre).'),
        ('primaria', 'Primária não classificada', '⬡', 'O config garante que é arma primária e mais nada — a descrição do mod é só o nome do produto. Marcado como indeterminado em vez de chutar "fuzil".'),
    ]
    for tid, nome, icon, desc in tipos_def:
        L.append(f'  {{ id: {js_valor(tid)}, nome: {js_valor(nome)}, icon: {js_valor(icon)},'
                 f' desc: {js_valor(desc)} }},')
    L.append('];')
    L.append('')
    L.append('/* Notas de calibre — texto editorial (o que o calibre significa em jogo).')
    L.append(' * Os NÚMEROS de cada arma estão na arma; aqui não há velocidade nenhuma,')
    L.append(' * justamente pra ninguém voltar a calcular por família de calibre. */')
    L.append('export const A3ARM_CALIBRES = {')
    for k, v in sorted(CALIBRE_NOTAS.items()):
        L.append(f'  {js_valor(k)}: {js_valor(v)},')
    L.append('};')
    L.append('')
    L.append('/* Base NÚCLEO: jogo base + DLC + CDLC. O arsenal modado completo mora em')
    L.append(' * public/arma3/armas-db.json e desce sob demanda (ver carregarArsenal()). */')
    L.append('export const A3ARM = [')
    tipo_atual = None
    for e in nucleo:
        if e['tipo'] != tipo_atual:
            tipo_atual = e['tipo']
            L.append(f'  /* ===== {tipo_atual} ===== */')
        campos = ', '.join(f'{c}: {js_valor(e[c])}' for c in campos_arma)
        L.append('  { ' + campos + ' },')
    L.append('];')
    L.append('')
    L.append('export const A3ARM_TOTAL = A3ARM.length;')
    L.append('')
    L.append('/* Números da extração, pra tela poder ser honesta sobre a cobertura. */')
    L.append('export const A3ARM_META = {')
    L.append(f'  dump: {js_valor(cfg.get("fonte"))},')
    L.append(f'  classesNoConfig: {len(armas)},')
    L.append(f'  armasCanonicas: {len(todas)},')
    L.append(f'  nucleo: {len(nucleo)},')
    L.append(f'  mods: {len(todas) - len(nucleo)},')
    L.append(f'  nucleoComBalistica: {com_bal},')
    L.append(f'  nucleoComIcone: {com_img},')
    L.append(f'  porTipo: {js_valor(dict(sorted(por_tipo.items())))},')
    L.append(f'  porEvidencia: {js_valor(dict(sorted(por_ev.items())))},')
    L.append("  arsenalUrl: '/arma3/armas-db.json',")
    L.append('};')
    L.append('')
    L.append('/* Arsenal completo (mods) sob demanda. Uma requisição por sessão —')
    L.append(' * a promessa fica em cache no módulo. ~1,9 MB cru, ~100 kB no fio (gzip). */')
    L.append('let _arsenal = null;')
    L.append('export function carregarArsenal() {')
    L.append('  if (!_arsenal) {')
    L.append("    /* `campo: 'armas'` não é enfeite: antes, um JSON válido sem essa chave")
    L.append('     * resolvia `undefined`, e o `.filter()` de quem chamou estourava com')
    L.append('     * "Cannot read properties of undefined" — erro que não diz nada sobre o')
    L.append('     * dataset. Agora rejeita dizendo o que faltou. */')
    L.append("    _arsenal = buscarDataset(A3ARM_META.arsenalUrl, { campo: 'armas', rotulo: 'o arsenal completo do Arma 3' })")
    L.append('      .catch((err) => { _arsenal = null; throw err; });')
    L.append('  }')
    L.append('  return _arsenal;')
    L.append('}')
    L.append('')
    with open(DEST_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))


def escrever_json(todas, cfg):
    """public/arma3/armas-db.json — o arsenal completo, sob demanda."""
    os.makedirs(os.path.dirname(DEST_JSON), exist_ok=True)
    # Campo com `_` na frente é INTERNO (só as invariantes usam). O módulo JS
    # filtra por lista de campos e nunca os viu; este JSON despejava o dict
    # inteiro, então vazavam pro arquivo público. Tira aqui, num lugar só.
    publicas = [{k: v for k, v in e.items() if not k.startswith('_')} for e in todas]
    doc = {
        '_leia': ('Gerado por scripts/arma3/gerar-base-armas.py a partir do dump in-game '
                  '(issue #398). Ausente é null, nunca zero. `tipo` é inferido — '
                  '`tipoFonte` declara a evidência.'),
        'dump': cfg.get('fonte'),
        'total': len(publicas),
        'armas': publicas,
    }
    with open(DEST_JSON, 'w', encoding='utf-8') as f:
        json.dump(doc, f, ensure_ascii=False, separators=(',', ':'))


def relatorio(nucleo, mods, todas, armas):
    print(f'classes no config      {len(armas)}')
    print(f'armas canônicas        {len(todas)}   (variantes de óptica/camo colapsadas)')
    print(f'  núcleo (vanilla/DLC) {len(nucleo)}')
    print(f'  mods                 {len(mods)}')
    print()
    print('núcleo por origem:')
    for k, n in Counter(e['origem'] for e in nucleo).most_common():
        print(f'  {n:5d}  {k}')
    print()
    print('tipo — evidência (todas as armas):')
    for k, n in Counter(e['tipoFonte'] for e in todas).most_common():
        print(f'  {n:5d}  {k}')
    print()
    print('tipo (todas):')
    for k, n in Counter(e['tipo'] for e in todas).most_common():
        print(f'  {n:5d}  {k}')
    print()
    bal = sum(1 for e in todas if e['v0'] is not None and e['airFriction'] is not None)
    img = sum(1 for e in todas if e['img'])
    print(f'com balística (v0+airFriction)  {bal}/{len(todas)} ({bal / len(todas) * 100:.1f}%)')
    print(f'com ícone                       {img}/{len(todas)} ({img / len(todas) * 100:.1f}%)')
    for k, n in Counter(e['imgAusente'] for e in todas if e['imgAusente']).most_common():
        print(f'  sem ícone: {n:5d}  {k}')
    print()
    print(f'escrito: {os.path.relpath(DEST_JS, RAIZ)}')
    print(f'escrito: {os.path.relpath(DEST_JSON, RAIZ)} '
          f'({os.path.getsize(DEST_JSON) / 1e6:.2f} MB cru)')


def escrever_municao(cfg):
    """src/data/arma3-municao.js — munições e carregadores.

    Módulo separado de propósito: são as duas pontas da MESMA cadeia
    (arma → carregador → munição), mas quem consulta "que munição é essa"
    raramente quer a tabela de armas junto. Somados dão ~32 kB gzip, então
    cabem no bundle sem lazy-load.

    O que este dado responde e a tabela de armas não:

      - **Furtividade.** `visibleFire` e `audibleFire` são o quanto o tiro
        se denuncia. Variam de 0,07 a 32 e de 0,05 a 120 — é a diferença
        entre um subsônico suprimido e um .50. Nenhuma wiki de Arma 3 expõe.
      - **Penetração.** O campo `caliber` da MUNIÇÃO não é o calibre em mm:
        é o multiplicador de penetração do engine. Nome infeliz do config,
        por isso aqui ele se chama `penetracao`.
      - **Dano indireto.** `hit` é o dano direto; explosivo mata pelo
        `indirectHit` dentro do `indirectHitRange`. Olhar só o `hit` faz um
        foguete parecer fraco.
      - **Trocar o carregador muda a balística.** Cada carregador tem
        `initSpeed` próprio — é por isso que o mesmo MXM aparece com v₀ 774
        e 857 na tabela de armas.
    """
    mu = cfg.get('municoes') or {}
    mg = cfg.get('carregadores') or {}

    municoes = sorted((
        {
            'id': slug(v.get('classe') or k),
            'classe': v.get('classe') or k,
            'dano': num(v.get('hit')),
            'danoIndireto': num(v.get('indirectHit')),
            'raioIndireto': num(v.get('indirectHitRange')),
            'penetracao': num(v.get('caliber')),
            'airFriction': num(v.get('airFriction')),
            'velTipica': num(v.get('typicalSpeed')),
            'explosivo': bool(v.get('explosivo')),
            'ricochete': bool(v.get('ricochete')),
            'visibleFire': num(v.get('visibleFire')),
            'audibleFire': num(v.get('audibleFire')),
            # subsônico: abaixo de ~340 m/s o projétil não estala ao passar.
            # É o que faz supressor valer a pena de verdade.
            'subsonico': bool(v.get('typicalSpeed') and v['typicalSpeed'] < 340),
        } for k, v in mu.items()), key=lambda x: x['classe'].lower())

    carregadores = sorted((
        {
            'id': slug(v.get('classe') or k),
            'classe': v.get('classe') or k,
            'nome': v.get('nome') or v.get('classe') or k,
            'municao': v.get('ammo') or None,
            'capacidade': num(v.get('count')),
            'v0': num(v.get('initSpeed')),
            'massa': num(v.get('massa')),
            'origem': (v.get('fonte') or '').lstrip('@') or None,
            'tracante': 'tracer' in (v.get('classe') or k).lower(),
        } for k, v in mg.items()), key=lambda x: x['nome'].lower())

    campos_m = ('id', 'classe', 'dano', 'danoIndireto', 'raioIndireto', 'penetracao',
                'airFriction', 'velTipica', 'explosivo', 'ricochete',
                'visibleFire', 'audibleFire', 'subsonico')
    campos_c = ('id', 'classe', 'nome', 'municao', 'capacidade', 'v0', 'massa',
                'origem', 'tracante')

    L = ['/**',
         ' * Munições e carregadores do Arma 3 — valores medidos no config do jogo.',
         ' *',
         ' * ⚠️ ARQUIVO GERADO — não edite à mão (scripts/arma3/gerar-base-armas.py).',
         f' *   Dump de origem: {cfg.get("fonte")}',
         ' *',
         ' * CUIDADO COM DOIS NOMES DO CONFIG',
         ' *   `penetracao` é o campo `caliber` da munição — NÃO é o calibre em mm.',
         ' *     É o multiplicador de penetração do engine. O nome no config é infeliz.',
         ' *   `dano` é o `hit` (direto). Explosivo mata pelo `danoIndireto` dentro do',
         ' *     `raioIndireto` — olhar só o `dano` faz foguete parecer fraco.',
         ' *',
         ' * FURTIVIDADE: `visibleFire`/`audibleFire` são o quanto o tiro se denuncia.',
         ' * `subsonico` é derivado (velTipica < 340 m/s) — abaixo disso o projétil não',
         ' * estala ao passar, que é o que faz supressor valer a pena.',
         ' */',
         '',
         '/* 472 munições. */',
         'export const A3MUN = [']
    for m in municoes:
        L.append('  { ' + ', '.join(f'{c}: {js_valor(m[c])}' for c in campos_m) + ' },')
    L += [']', '',
          '/* 1.432 carregadores. Cada um tem `v0` PRÓPRIO: trocar o carregador muda',
          ' * a balística da mesma arma. */',
          'export const A3MAG = [']
    for c_ in carregadores:
        L.append('  { ' + ', '.join(f'{c}: {js_valor(c_[c])}' for c in campos_c) + ' },')
    L += [']', '',
          'export const A3MUN_TOTAL = A3MUN.length;',
          'export const A3MAG_TOTAL = A3MAG.length;',
          '',
          '/* Índice classe→munição, pra ligar carregador e arma na munição sem varrer. */',
          'export const A3MUN_POR_CLASSE = Object.fromEntries(',
          '  A3MUN.map((m) => [m.classe.toLowerCase(), m]));',
          '']
    L = [x.replace(']', '];') if x == ']' else x for x in L]
    with open(DEST_MUN, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))
    print(f'escrito: {os.path.relpath(DEST_MUN, RAIZ)} '
          f'({len(municoes)} munições, {len(carregadores)} carregadores)')


# Texto editorial por calibre. Sem número: os números moram na arma.
CALIBRE_NOTAS = {
    '5.56×45 mm': {'classe': 'fuzil', 'nota': 'O leve da OTAN — plano até ~300 m, pouca energia longe.'},
    '5.45×39 mm': {'classe': 'fuzil', 'nota': 'O leve soviético, equivalente do 5.56 (família AK-74).'},
    '5.8×42 mm': {'classe': 'fuzil', 'nota': 'Calibre chinês do QBZ-95 (CSAT Pacífico, Apex).'},
    '6.5×39 mm': {'classe': 'fuzil/DMR', 'nota': '6.5 caseless — o padrão OTAN 2035, bom equilíbrio alcance/dano.'},
    '6.5 Creedmoor': {'classe': 'DMR', 'nota': 'Match moderno: trajetória muito plana pro tamanho do cartucho.'},
    '6.8 SPC': {'classe': 'fuzil', 'nota': 'Meio-termo real entre 5.56 e 7.62, comum nos mods de carabina.'},
    '7.62×51 mm': {'classe': 'fuzil/DMR', 'nota': 'Energia cheia da OTAN — o calibre dos DMR e das MMG leves.'},
    '7.62×39 mm': {'classe': 'fuzil', 'nota': 'O AK clássico — mais pancada perto, cai antes que o 6.5.'},
    '7.62×54 mm': {'classe': 'DMR', 'nota': 'Full-power russo (VS-121, Negev NG7 no config do jogo).'},
    '9 mm': {'classe': 'pistola/SMG', 'nota': 'Curto e subsônico em muita carga; cai rápido além de ~100 m.'},
    '9.3×64 mm': {'classe': 'DMR/MMG', 'nota': 'O meio-termo entre fuzil e anti-materiel (Cyrus, Navid).'},
    '.300 BLK': {'classe': 'carabina', 'nota': 'Feito pra cano curto e supressor — ótimo perto, arqueia longe.'},
    '.300 WM': {'classe': 'sniper', 'nota': 'Magnum de longo alcance, entre o .338 e o 7.62.'},
    '.338 LM': {'classe': 'sniper/MMG', 'nota': 'Trajetória plana e alcance longo (MAR-10, SPMG).'},
    '.408 CheyTac': {'classe': 'sniper', 'nota': 'Cartucho do M200 Intervention — projetado pra 2 km.'},
    '.45 ACP': {'classe': 'pistola/SMG', 'nota': 'Pesado e lento — muito dano perto, péssimo alcance.'},
    '12.7×99 mm': {'classe': 'anti-materiel', 'nota': '.50 BMG — fura veículo leve, alcance de km.'},
    '12.7×108 mm': {'classe': 'anti-materiel', 'nota': 'O .50 russo (GM6 Lynx).'},
    '12.7×54 mm': {'classe': 'DMR', 'nota': 'Subsônico de propósito (ASP-1 Kir) — silencioso, arco alto.'},
    '12 gauge': {'classe': 'espingarda', 'nota': 'Cartucho de chumbo: letal no corredor, inútil no campo aberto.'},
}

if __name__ == '__main__':
    main()
