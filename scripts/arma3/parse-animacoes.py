#!/usr/bin/env python3
"""
Lê o dump de scripts/arma3/dump-animacoes.sqf e monta o catálogo de animações.

    1. no jogo:  cole scripts/arma3/dump-animacoes.sqf no debug console
    2. aqui:     python scripts/arma3/parse-animacoes.py
    3. saída:    scripts/arma3/out/arma3-animacoes.json

Dois blocos: `estados` (CfgMovesMaleSdr, o corpo inteiro — andar, deitar,
recarregar) e `gestos` (CfgGesturesMale, o que roda por cima, tipo apontar).

FORMATO v1:
    A |classe|rtm|speed|looped|terminal|semArma|otica|gatilho|actions
    AC|classe|<estado:peso;...>   transições `connectTo`   (em pedaços)
    AI|classe|<estado:peso;...>   `interpolateTo`          (em pedaços)
    G |… GC|… GI|…                o mesmo, para os gestos
    FIM|nEstados|nGestos|nTransicoes|segundos

O QUE ISTO É E O QUE NÃO É: aqui está o CATÁLOGO — nome do estado, qual `.rtm`
toca, quanto dura, se repete, e o grafo de transições entre estados. A
MOVIMENTAÇÃO em si mora dentro do `.rtm`, que é outro formato binário e não é
lido aqui. Para mostrar a animação de fato rodando, o caminho é gravar clipe
in-game (`playMove` + câmera), não converter o `.rtm`.

Honestidade (regra da #398): campo vazio no dump = o config não declara = `null`.
  - `duracaoS` é DERIVADO e só existe quando `speed` é negativo: nessa convenção
    do engine, `speed = -1/duração`, então dá pra recuperar o segundo exato.
    Com `speed` positivo o número é um multiplicador do tamanho nativo do
    `.rtm` — que este dump não conhece — então a duração fica `null` em vez de
    um palpite.
"""

import json
import os
import sys

MARCA = '<<A3ANIM>>'
LIMITE_LOG = 1012
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.join(RAIZ, 'scripts', 'arma3', 'out', 'arma3-animacoes.json')


def achar_rpt():
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
            'nenhum .rpt com dump de animações encontrado.\n'
            'Rode o scripts/arma3/dump-animacoes.sqf no debug console primeiro.')
    cands.sort(reverse=True)
    return cands[0][2]


def num(s):
    if s is None or s == '':
        return None
    try:
        return float(s)
    except ValueError:
        return None


def limpo(v):
    if v is None:
        return None
    if isinstance(v, float) and v == int(v):
        return int(v)
    return round(v, 6) if isinstance(v, float) else v


def texto(s):
    return s if s else None


def booleano(s):
    """'' = o config não declara = None. Só 0/1 viram False/True."""
    v = num(s)
    return None if v is None else bool(v)


def parse_transicoes(bruto):
    """'AmovPercMstpSnonWnonDnon:0.02;OutroEstado:1' -> lista de dicts."""
    saida = []
    for parte in filter(None, bruto.split(';')):
        nome, _, peso = parte.partition(':')
        if not nome:
            continue
        saida.append({'para': nome, 'peso': limpo(num(peso))})
    return saida


def novo(classe):
    return {'classe': classe, 'rtm': None, 'speed': None, 'duracaoS': None,
            'loop': None, 'terminal': None, 'semArma': None, 'otica': None,
            'podeAtirar': None, 'actions': None,
            '_con': '', '_int': ''}


def ler_rpt(caminho):
    estados, gestos = {}, {}
    fim, versao, truncadas = None, None, 0
    alvo = {'A': estados, 'G': gestos}

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
                # o .rpt guarda a sessão inteira; só o último dump vale
                estados, gestos = {}, {}
                alvo = {'A': estados, 'G': gestos}
                truncadas = 0
                versao = c[0] if c else '?'
                continue
            if tipo == 'FIM':
                fim = c
                continue
            if not c or not c[0]:
                continue
            classe = c[0]

            # 9 campos depois do tipo: classe|rtm|speed|looped|terminal|
            # semArma|otica|gatilho|actions
            if tipo in ('A', 'G') and len(c) >= 9:
                a = novo(classe)
                a['rtm'] = texto(c[1])
                a['speed'] = limpo(num(c[2]))
                a['loop'] = booleano(c[3])
                a['terminal'] = booleano(c[4])
                a['semArma'] = booleano(c[5])
                a['otica'] = booleano(c[6])
                a['podeAtirar'] = booleano(c[7])
                a['actions'] = texto(c[8])
                alvo[tipo][classe] = a
            elif len(tipo) == 2 and tipo[0] in alvo and tipo[1] in ('C', 'I'):
                d = alvo[tipo[0]]
                if classe in d and len(c) >= 2:
                    chave = '_con' if tipo[1] == 'C' else '_int'
                    d[classe][chave] += c[1]      # pedaços na ordem do log

    return estados, gestos, fim, truncadas, versao


def resolver(d):
    for a in d.values():
        a['transicoes'] = parse_transicoes(a.pop('_con')) or None
        a['interpolaPara'] = parse_transicoes(a.pop('_int')) or None
        # DERIVADO: speed negativo é a convenção do engine pra duração fixa
        # (speed = -1/duração). Speed positivo multiplica o tamanho nativo do
        # .rtm, que não temos aqui — então fica null, não um palpite.
        s = a['speed']
        a['duracaoS'] = round(-1.0 / s, 4) if s is not None and s < 0 else None


def main():
    caminho = sys.argv[1] if len(sys.argv) > 1 else achar_rpt()
    print(f'lendo: {caminho}')

    estados, gestos, fim, truncadas, versao = ler_rpt(caminho)

    if versao != 'v1':
        raise SystemExit(
            f'esse .rpt é de um dump de animações {versao or "desconhecido"}.\n'
            'Rode o dump de novo com o scripts/arma3/dump-animacoes.sqf atual.')
    if not estados and not gestos:
        raise SystemExit('o arquivo tem a marca do dump mas nada foi lido — '
                         'o script rodou até o fim no jogo?')

    resolver(estados)
    resolver(gestos)

    saida = {
        'fonte': os.path.basename(caminho),
        'estados': dict(sorted(estados.items())),
        'gestos': dict(sorted(gestos.items())),
    }
    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, 'w', encoding='utf-8') as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)

    trans = sum(len(a['transicoes'] or []) for a in estados.values())
    trans += sum(len(a['transicoes'] or []) for a in gestos.values())
    com_rtm = sum(1 for a in estados.values() if a['rtm'])
    com_dur = sum(1 for a in estados.values() if a['duracaoS'])
    print(f'\nestados (corpo) ...... {len(estados)}')
    print(f'gestos ............... {len(gestos)}')
    print(f'transições ........... {trans}')
    print(f'com .rtm declarado ... {com_rtm} de {len(estados)}')
    print(f'com duração exata .... {com_dur} (speed negativo; o resto é '
          f'multiplicador e fica null)')
    if fim and len(fim) >= 4:
        print(f'(o jogo contou {fim[0]} estados / {fim[1]} gestos / '
              f'{fim[2]} transições em {fim[3]}s)')
        contados = num(fim[0])
        if contados is not None and int(contados) != len(estados):
            print(f'  ATENÇÃO: {int(contados) - len(estados)} estados não '
                  f'chegaram aqui')
    if truncadas:
        print(f'  ATENÇÃO: {truncadas} linhas bateram no limite de {LIMITE_LOG} '
              f'caracteres do log e podem estar cortadas')

    ligados = sorted(estados.values(), key=lambda a: -len(a['transicoes'] or []))[:8]
    print('\nestados com mais transições (nós centrais do grafo):')
    for a in ligados:
        print(f'  {a["classe"][:44]:46} {len(a["transicoes"] or []):>4}')

    print(f'\nescrito: {SAIDA}')


if __name__ == '__main__':
    main()
