#!/usr/bin/env python3
"""
Gera a base de acessórios (miras, lasers, silenciadores, bipés) do Arma 3.

    python scripts/arma3/gerar-base-acessorios.py

Lê  `out/arma3-itens.json`      — propriedades (ópticas, massa, imagem)
    `out/arma3-acessorios.json` — que slot cada arma tem, e os grupos
Escreve
    `src/data/arma3-acessorios.js`      — núcleo vanilla/DLC, entra no bundle
    `public/arma3/acessorios-db.json`   — os 3.218, sob demanda

## Três decisões que não são óbvias

### 1. O tipo sai do `itemInfoType`, não da `categoriaSugerida`

O dump traz `categoriaSugerida`, que é rótulo editorial — a mesma espécie de
campo que o `tipoSugerido` das armas, que teve de ser jogado fora porque 9.090
de 10.822 caíam no padrão "fuzil". Aqui ele acerta (bate 1:1 com o engine nos
3.218), mas usar o palpite quando existe o número do engine é sorte, não método.
`itemInfoType` é o que o próprio jogo consulta pra decidir em que slot encaixa:

    101 = boca (silenciador)     201 = óptica (mira)
    301 = apontador (laser/lanterna)  302 = bipé

Cada entrada declara `tipoFonte` pra que a procedência viaje junto com o dado.

### 2. Ampliação só sai do TEXTO, e quase nunca existe

`0.75 / FOV` **não** dá a ampliação. Conferido no ELCAN SpecterOS: a conta dá
12x e o próprio jogo escreve "Magnification: 2x" — fator 6 de diferença. O zoom
do config é campo de visão da câmera, não aumento óptico, e a mira 2D do ACE
renderiza por outro caminho.

Então: `ampliacao` só é preenchida quando a descrição traz `Magnification: Nx`,
e vem com `ampliacaoFonte: 'descricao'`. São **241 de 1.167** ópticas. Para as
outras 926 o campo é `null` — e o FOV cru vai em `fov`, rotulado como FOV.
Publicar a conta seria inventar número com cara de medição.

### 3. "0 acessórios compatíveis" seria mentira, então não existe

`totalCompativeis` vem 0 pra 10.103 das 10.822 armas — inclusive pro MX, que
obviamente aceita mira. Não é que nada encaixa: é que o config deixa
`compatibleItems` vazio e o engine resolve em tempo de execução pelo tipo do
slot, e essa consulta não foi capturada (`compativeisEngine` é null em todas).

Confundir "não capturamos" com "não existe" é exatamente o erro que a regra do
`hit: null` versus `hit: 0` proíbe. Então esta base publica:

  - `slots` — quais slots a arma TEM (dado real, 7.384 armas)
  - `compativeis` — só onde o config declarou de fato (719 armas)
  - nunca um zero que signifique ausência de captura
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gerar_base_armas_comum import (  # noqa: E402
    DIR_CDLC, DIR_DLC, FONTE_DLC, cam, js_chave, js_valor, num, slug,
)

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))
OUT = os.path.join(AQUI, 'out')
ITENS = os.path.join(OUT, 'arma3-itens.json')
ACESS = os.path.join(OUT, 'arma3-acessorios.json')
SAIDA_JS = os.path.join(RAIZ, 'src', 'data', 'arma3-acessorios.js')
SAIDA_JSON = os.path.join(RAIZ, 'public', 'arma3', 'acessorios-db.json')

# itemInfoType do engine → tipo nosso. É o que o jogo usa pra decidir o slot.
TIPO_POR_INFO = {101: 'silenciador', 201: 'mira', 301: 'apontador', 302: 'bipe'}

RX_AMPLIACAO = re.compile(r'magnification:\s*([\d.,]+)\s*x(?:\s*[–\-—]\s*([\d.,]+)\s*x)?', re.I)
RX_TAG = re.compile(r'<[^>]+>')


def repara(s):
    """Conserta mojibake do `.rpt` — e só ele.

    O parser abre o `.rpt` em cp1252, que é o que o jogo escreve, mas parte do
    texto do config já está em UTF-8: o en-dash de "6x–25x" chega como
    `6xâ€“25x`. O `strict` dos DOIS lados é o que torna isso seguro: quando a
    string é texto correto, o encode falha e devolvemos o original intacto.
    Sem strict, acento legítimo viraria lixo.
    """
    if not s:
        return s
    try:
        return s.encode('cp1252', 'strict').decode('utf-8', 'strict')
    except (UnicodeEncodeError, UnicodeDecodeError):
        return s


def limpo(s):
    """Descrição sem as tags de marcação do jogo, já sem mojibake."""
    s = repara(s or '')
    return re.sub(r'\s+', ' ', RX_TAG.sub(' ', s)).strip()


def _no_jogo(caminho):
    """O caminho mora na árvore do jogo (base ou DLC)?"""
    partes = [p for p in caminho.split('/') if p]
    if not partes:
        return False
    return partes[0] == 'a3' or any(p in DIR_DLC or p in DIR_CDLC for p in partes)


def _achar(caminho, tabela):
    for p in (q for q in caminho.split('/') if q):
        if p in tabela:
            return tabela[p]
    return None


# Prefixos de classe que a Bohemia usa em acessório. Levantado do dump: entre
# os acessórios com TODOS os assets em a3/, os prefixos são estes cinco — e
# ace/cup/mss/tier1/acwp/rhs, que são mods reusando asset vanilla inteiro.
PREFIXOS_JOGO = {'optic', 'muzzle', 'bipod', 'acc', 'chemicaldetector'}


def origem(classe, item):
    """De que DLC/mod é.

    O caminho do asset manda sobre o campo `fonte`, porque `fonte` é
    `configSourceMod` — quem PATCHEOU por último. O ACE sobrescreve quase todo
    o vanilla e apareceria como dono do MX.

    Mas há DUAS armadilhas inversas, e cada uma custou uma rodada:

    1. Mod apontando pro MODELO do jogo (`hlc_optic_PVS4base` declara o `.p3d`
       do ARCO). Desempate: o ícone — modelo se empresta, ícone não. 65 itens.
    2. Mod reusando modelo E ícone do jogo (`ACE_DBAL_A3_Red` é 100% asset
       vanilla). Aí só o NOME DA CLASSE denuncia: a Bohemia usa cinco
       prefixos em acessório (PREFIXOS_JOGO); `ace_`, `cup_`, `rhs_` etc.
       não estão entre eles. 36 itens.
    """
    modelo = cam(item.get('model') or '')
    icone = cam(item.get('picture') or '')
    f = (item.get('fonte') or '').strip()
    prefixo = classe.split('_')[0].lower()

    # cDLC assina o diretório e nunca é reaproveitada por mod.
    for c in (icone, modelo):
        d = _achar(c, DIR_CDLC)
        if d:
            return d, 'caminho'

    # Classe fora dos prefixos da Bohemia = mod, por mais vanilla que o asset
    # seja. Sem `@fonte` pra dar nome (15 itens do HLC vêm com fonte vazia),
    # vira "desconhecida" — que é a verdade, e fica fora do núcleo.
    if prefixo not in PREFIXOS_JOGO:
        if f.startswith('@'):
            return f[1:], 'mod'
        return 'desconhecida', 'classe'

    # Ícone fora da árvore do jogo + `fonte` de mod = o mod é o dono.
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


def ampliacao_de(desc):
    """(valor, rotulo) tirados do texto, ou (None, None).

    Devolve número quando é fixo ("2x") e [min, max] quando é variável
    ("6x–25x"). Nunca calcula a partir do FOV — ver a decisão 2 no topo.
    """
    m = RX_AMPLIACAO.search(desc or '')
    if not m:
        return None, None
    def n(t):
        try:
            return float(t.replace(',', '.'))
        except ValueError:
            return None
    a, b = n(m.group(1)), n(m.group(2)) if m.group(2) else None
    if a is None:
        return None, None
    if b is None:
        return a, f'{a:g}x'
    return [a, b], f'{a:g}x–{b:g}x'


def fov_de(oticas):
    """Campo de visão CRU do config, sem conversão. `zoomInit` é o que a mira
    abre; min/max são os limites quando ela tem zoom variável."""
    if not oticas:
        return None
    ini = [num(o.get('zoomInit')) for o in oticas if num(o.get('zoomInit')) is not None]
    mn = [num(o.get('zoomMin')) for o in oticas if num(o.get('zoomMin')) is not None]
    mx = [num(o.get('zoomMax')) for o in oticas if num(o.get('zoomMax')) is not None]
    if not ini and not mn and not mx:
        return None
    return {
        'init': min(ini) if ini else None,
        'min': min(mn) if mn else None,
        'max': max(mx) if mx else None,
        'modos': len(oticas),
    }


def carregar():
    for p in (ITENS, ACESS):
        if not os.path.isfile(p):
            raise SystemExit(f'falta {p}\nRode os dumps no jogo e os parsers antes '
                             f'(veja scripts/arma3/README.md).')
    with open(ITENS, encoding='utf-8') as f:
        itens = json.load(f)
    with open(ACESS, encoding='utf-8') as f:
        acess = json.load(f)
    return itens, acess


def montar(itens, acess, icones):
    """Uma entrada por acessório, só com o que foi medido."""
    grupos = acess.get('grupos') or {}
    entradas = []

    for classe, it in (itens.get('itens') or {}).items():
        tipo = TIPO_POR_INFO.get(it.get('itemInfoType'))
        if not tipo:
            continue

        desc = limpo(it.get('descricao'))
        amp, ampRotulo = ampliacao_de(desc)
        dlc, dlcFonte = origem(classe, it)

        pic = it.get('picture')
        img_url = None
        if pic:
            img_url = icones.get(pic.replace('/', '\\').lower())

        entradas.append({
            'id': slug(classe),
            'classe': classe,
            'nome': repara(it.get('nome')) or classe,
            'tipo': tipo,
            'tipoFonte': 'itemInfoType',
            'dlc': dlc,
            'dlcFonte': dlcFonte,
            'descricao': desc or None,
            'massa': num(it.get('massa')),
            'imagem': img_url,
            'ampliacao': amp,
            'ampliacaoRotulo': ampRotulo,
            'ampliacaoFonte': 'descricao' if amp is not None else None,
            'fov': fov_de(it.get('oticas')),
            'coefSilenciador': num(it.get('coefSilenciador')),
            '_ehMod': dlcFonte == 'mod' or dlc == 'desconhecida',
        })

    # Slots das armas: dado real. Guardamos o tamanho do grupo só quando o
    # config declarou o grupo — nunca um zero de "não capturamos".
    armas = {}
    for classe, a in (acess.get('armas') or {}).items():
        slots = a.get('slots') or {}
        vazios = a.get('slotsVazios') or []
        todos = sorted(set(list(slots) + list(vazios)))
        if not todos:
            continue
        compat = {}
        for s, g in slots.items():
            membros = grupos.get(g)
            if membros:
                compat[s] = len(membros)
        armas[classe] = {
            'slots': todos,
            'compativeis': compat or None,
        }

    return entradas, armas


def verificar(entradas, armas):
    """Invariantes de honestidade. Recusa gerar — dado errado publicado é pior
    que build quebrado, porque ninguém percebe."""
    erros = []
    vistos = set()
    for e in entradas:
        if e['id'] in vistos:
            erros.append(f'{e["classe"]}: id duplicado {e["id"]}')
        vistos.add(e['id'])

        if e['ampliacao'] is not None and e['ampliacaoFonte'] != 'descricao':
            erros.append(f'{e["classe"]}: ampliação sem fonte declarada')
        if e['ampliacao'] is None and e['ampliacaoRotulo'] is not None:
            erros.append(f'{e["classe"]}: rótulo de ampliação sem valor')

        # NÃO existe invariante "a ampliação bate com 0.75/FOV, logo veio da
        # conta". Tentei, e ela acusou 56 ópticas honestas: quando o autor do
        # mod ajusta o FOV coerente com a ampliação que escreveu, os dois
        # coincidem por acerto, não por cópia. Além disso o código só lê texto
        # — não há caminho que calcule. Teste que só pode dar falso positivo
        # não é invariante, é ruído.

        # `massa: 0` também NÃO é erro: o parser distingue ausente de zero
        # (335 itens vêm com massa null, 46 com zero declarado). Decalque e
        # item virtual pesam zero de verdade. Mesmo caso do `hit: 0` da
        # munição iluminativa — o zero é a medição, não a falta dela.

    for classe, a in armas.items():
        for s, n in (a['compativeis'] or {}).items():
            if not n:
                erros.append(f'{classe}: slot {s} com 0 compatíveis — '
                             'publique ausência como omissão, não como zero')
    return erros


def escrever_js(entradas, armas):
    nucleo = [e for e in entradas if not e['_ehMod']]
    nucleo.sort(key=lambda e: (e['tipo'], e['nome'].lower()))

    def publico(e):
        return {k: v for k, v in e.items() if not k.startswith('_')}

    porTipo = {}
    for e in nucleo:
        porTipo[e['tipo']] = porTipo.get(e['tipo'], 0) + 1

    meta = {
        'porTipo': porTipo,
        'comAmpliacao': sum(1 for e in nucleo if e['ampliacao'] is not None),
        'semAmpliacao': sum(1 for e in nucleo
                            if e['tipo'] == 'mira' and e['ampliacao'] is None),
        'armasComSlot': len(armas),
        'dbUrl': '/arma3/acessorios-db.json',
    }

    linhas = [
        '/* ⚠️ ARQUIVO GERADO — não edite à mão',
        ' * (scripts/arma3/gerar-base-acessorios.py).',
        ' *',
        ' * Tipo vem do `itemInfoType` do engine. Ampliação SÓ do texto do jogo',
        ' * ("Magnification: Nx"); onde não há texto, `ampliacao` é null e o FOV',
        ' * cru fica em `fov` — 0.75/FOV NÃO é a ampliação (erra por 6x no ELCAN).',
        ' */',
        '',
        f'export const A3ACC = {json_lista(nucleo, publico)};',
        '',
        f'export const A3ACC_TOTAL = {len(entradas)};',
        f'export const A3ACC_NUCLEO = {len(nucleo)};',
        '',
        f'export const A3ACC_META = {js_valor(meta)};',
        '',
        '/* Acervo completo (com mods) e os slots de cada arma, sob demanda.',
        ' * Os slots ficam FORA do bundle de propósito: são 7 mil armas, e a',
        ' * página só precisa deles quando alguém abre uma arma específica.',
        ' *',
        ' * `slots` é o que a arma TEM (dado real). `compativeis` só aparece',
        ' * onde o config declarou o grupo — ausência é omissão, não zero. */',
        'let _db = null;',
        'export function carregarAcessorios() {',
        '  if (!_db) {',
        '    _db = fetch(A3ACC_META.dbUrl)',
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
    return nucleo


def json_lista(entradas, publico):
    """Lista JS com um objeto por linha — diff legível na regeração."""
    corpo = ',\n  '.join(js_valor(publico(e)) for e in entradas)
    return '[\n  ' + corpo + ',\n]'


def escrever_json(entradas, armas):
    os.makedirs(os.path.dirname(SAIDA_JSON), exist_ok=True)
    publico = [{k: v for k, v in e.items() if not k.startswith('_')} for e in entradas]
    with open(SAIDA_JSON, 'w', encoding='utf-8') as f:
        json.dump({'acessorios': publico, 'slots': armas},
                  f, ensure_ascii=False, separators=(',', ':'))


def main():
    itens, acess = carregar()
    
    icones_path = os.path.join(OUT, 'arma3-icones.json')
    icones = {}
    if os.path.isfile(icones_path):
        with open(icones_path, encoding='utf-8') as f:
            raw_icones = json.load(f)
            icones = {k.replace('/', '\\').lower(): v for k, v in raw_icones.items()}

    entradas, armas = montar(itens, acess, icones)

    erros = verificar(entradas, armas)
    if erros:
        print(f'{len(erros)} violação(ões) de invariante — NADA foi gerado:')
        for e in erros[:20]:
            print('  -', e)
        raise SystemExit(1)

    nucleo = escrever_js(entradas, armas)
    escrever_json(entradas, armas)

    porTipo = {}
    for e in entradas:
        porTipo[e['tipo']] = porTipo.get(e['tipo'], 0) + 1
    miras = [e for e in entradas if e['tipo'] == 'mira']
    comAmp = [e for e in miras if e['ampliacao'] is not None]

    print(f'acessórios ....... {len(entradas)}')
    for t, n in sorted(porTipo.items(), key=lambda x: -x[1]):
        print(f'  {t:14} {n}')
    print(f'núcleo (bundle) .. {len(nucleo)}')
    print(f'armas com slot ... {len(armas)}')
    print()
    print(f'miras ............ {len(miras)}')
    print(f'  com ampliação declarada  {len(comAmp)}')
    print(f'  só FOV (não declarada)   {len(miras) - len(comAmp)}')

    # Por que a conta 0.75/FOV está proibida — medido, não alegado.
    conc = disc = 0
    for e in comAmp:
        init = (e['fov'] or {}).get('init')
        if not init:
            continue
        a = e['ampliacao'][0] if isinstance(e['ampliacao'], list) else e['ampliacao']
        if abs(a - 0.75 / init) < 0.05 * max(a, 1):
            conc += 1
        else:
            disc += 1
    if conc or disc:
        pct = 100 * disc / (conc + disc)
        print()
        print(f'texto do jogo vs a conta 0.75/FOV, nas {conc + disc} que têm os dois:')
        print(f'  concordam {conc}   DISCORDAM {disc}  ({pct:.0f}%)')
        print('  por isso a ampliação sai do texto e nunca da conta')
    print()
    print(f'escrito: {SAIDA_JS}')
    print(f'         {SAIDA_JSON}')


if __name__ == '__main__':
    main()
