"""Peças compartilhadas pelos geradores do Arma 3.

`gerar-base-armas.py` (armas) e `gerar-catalogo.py` (todo o resto) resolvem o
mesmo par de problemas — de que DLC é a coisa, e como serializar em JS legível.
Duplicar isso significaria as duas bases discordarem sobre a origem da mesma
arma um dia; mora aqui pra não haver duas respostas.

O nome tem underscore de propósito: os geradores usam hífen (são executáveis,
não módulos), e hífen não é importável em Python.
"""

import json
import re

# ── origem ────────────────────────────────────────────────────────────────
# Diretório do asset → DLC. É o sinal confiável de "de quem é": o campo
# `fonte` do dump é `configSourceMod`, ou seja, quem PATCHEOU a entrada por
# último — o ACE sobrescreve quase todo o vanilla e apareceria como dono.
DIR_DLC = {
    'weapons_f': 'Base',
    'weapons_f_beta': 'Base',
    'weapons_f_gamma': 'Base',
    'weapons_f_bootcamp': 'Base',
    'weapons_f_mod': 'Base',
    'weapons_f_epa': 'Base (campanha)',
    'weapons_f_kart': 'Karts',
    'weapons_f_mark': 'Marksmen',
    'weapons_f_exp': 'Apex',
    'weapons_f_tank': 'Tanks',
    'weapons_f_enoch': 'Contact',
    'weapons_f_tacops': 'Tac-Ops',
    'weapons_f_argo': 'Malden',
    'weapons_f_orange': 'Orange',
    'weapons_f_jets': 'Jets',
    # Veículos e soldados moram em outras árvores do mesmo jogo base.
    'soft_f': 'Base', 'soft_f_beta': 'Base', 'soft_f_gamma': 'Base',
    'soft_f_epb': 'Base', 'soft_f_epc': 'Base', 'soft_f_exp': 'Apex',
    'soft_f_enoch': 'Contact', 'soft_f_tank': 'Tanks', 'soft_f_orange': 'Orange',
    'armor_f': 'Base', 'armor_f_beta': 'Base', 'armor_f_gamma': 'Base',
    'armor_f_epb': 'Base', 'armor_f_epc': 'Base', 'armor_f_exp': 'Apex',
    'armor_f_tank': 'Tanks', 'armor_f_enoch': 'Contact',
    'air_f': 'Base', 'air_f_beta': 'Base', 'air_f_gamma': 'Base',
    'air_f_epb': 'Base', 'air_f_epc': 'Base', 'air_f_exp': 'Apex',
    'air_f_heli': 'Helicopters', 'air_f_jets': 'Jets', 'air_f_orange': 'Orange',
    'boat_f': 'Base', 'boat_f_beta': 'Base', 'boat_f_gamma': 'Base',
    'boat_f_exp': 'Apex', 'boat_f_epc': 'Base',
    'characters_f': 'Base', 'characters_f_beta': 'Base', 'characters_f_gamma': 'Base',
    'characters_f_epa': 'Base (campanha)', 'characters_f_epb': 'Base',
    'characters_f_epc': 'Base', 'characters_f_exp': 'Apex',
    'characters_f_enoch': 'Contact', 'characters_f_tank': 'Tanks',
    'characters_f_mark': 'Marksmen', 'characters_f_orange': 'Orange',
    'supplies_f': 'Base', 'supplies_f_heli': 'Helicopters',
    'static_f': 'Base', 'static_f_gamma': 'Base', 'static_f_exp': 'Apex',
    'static_f_tank': 'Tanks', 'static_f_enoch': 'Contact',
    'props_f_enoch': 'Contact', 'props_f_orange': 'Orange',
}
DIR_CDLC = {'lxws': 'Western Sahara', 'lxrf': 'Reaction Forces', 'ef': 'Expeditionary Forces'}
# Códigos de DLC no `fonte` — quando a própria DLC assina o config.
FONTE_DLC = {
    '': 'Base', 'mark': 'Marksmen', 'expansion': 'Apex', 'enoch': 'Contact',
    'tank': 'Tanks', 'tacops': 'Tac-Ops', 'argo': 'Malden', 'orange': 'Orange',
    'jets': 'Jets', 'kart': 'Karts', 'heli': 'Helicopters', 'curator': 'Zeus',
    'WS': 'Western Sahara', 'RF': 'Reaction Forces', 'EF': 'Expeditionary Forces',
}


def cam(p):
    """Normaliza caminho do config (o dump já troca \\ por /, mas garantimos)."""
    return (p or '').replace('\\', '/').lower().strip('/')


def num(x):
    """Número ou None. NUNCA converte ausência em zero (regra da #398):
    `null` é "não sabemos", `0` seria uma afirmação sobre o valor."""
    if x is None or isinstance(x, bool):
        return None
    return x if isinstance(x, (int, float)) else None


def slug(classe):
    return re.sub(r'[^a-z0-9]+', '-', (classe or '').lower()).strip('-')


def js_valor(v):
    """Serializa em JS. Igual a json.dumps para escalares, mas mantém os
    objetos em UMA linha — o diff de uma regeração vira dezenas de linhas em
    vez de dezenas de milhares."""
    if v is None:
        return 'null'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, str):
        return json.dumps(v, ensure_ascii=False)
    if isinstance(v, (list, tuple)):
        return '[' + ', '.join(js_valor(x) for x in v) + ']'
    if isinstance(v, dict):
        # A chave PRECISA sair entre aspas quando não é identificador válido:
        # `desc-generica` sem aspas é lido como a subtração `desc - generica`
        # e quebra o build inteiro. Vale pra qualquer chave vinda do dado
        # (nome de mod, categoria com hífen), não só pras que conhecemos hoje.
        return '{ ' + ', '.join(f'{js_chave(k)}: {js_valor(x)}' for k, x in v.items()) + ' }'
    raise TypeError(f'não sei serializar {type(v)}')


_IDENT = re.compile(r'^[A-Za-z_$][A-Za-z0-9_$]*$')


def js_chave(k):
    """Chave de objeto JS: nua quando é identificador, entre aspas quando não."""
    k = str(k)
    return k if _IDENT.match(k) else json.dumps(k, ensure_ascii=False)
