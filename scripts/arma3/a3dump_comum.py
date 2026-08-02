"""Peças compartilhadas pelos PARSERS de dump do Arma 3.

Todo parser daqui resolve os mesmos três problemas antes de olhar o dado dele:

  1. achar o `.rpt` certo — a pasta de logs tem dezenas, de sessões diferentes,
     e o mais RECENTE nem sempre é o que tem o dump (o operador pode ter aberto
     o jogo de novo depois). A escolha é: entre os que contêm a marca, prefere
     os COMPLETOS (que têm o `FIM`), e entre esses o mais novo;

  2. ler sem estourar a memória — um `.rpt` de sessão longa passa de 1 GB.
     Sempre linha a linha, nunca `f.read()` (já estourou aqui);

  3. remontar campo picado — o `diag_log` corta em 1012 caracteres e o corte é
     SILENCIOSO. Na v1 do dump de armas isso comeu 11% dos dados sem ninguém
     perceber. Por isso todo campo longo vai em pedaços numerados e é remontado
     na ordem do log.

O nome tem underscore de propósito: os parsers usam hífen (são executáveis, não
módulos), e hífen não é importável em Python — mesma razão do
`gerar_base_armas_comum.py`.

Regra de honestidade (issue #398), que vale para todos:
    todo valor vem do config do jogo em execução. Campo vazio no dump = o
    config NÃO declara = `null` no JSON, NUNCA zero. Zero é um valor; ausência
    é outra coisa, e misturar os dois é mentir na tabela.
"""

import json
import os
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LIMITE_LOG = 1012          # onde o .rpt corta; serve de alarme de truncamento


# ── achar e ler o .rpt ─────────────────────────────────────────────────────

def achar_rpt(marca, oquefalta):
    """O `.rpt` mais adequado que contenha `marca`.

    `oquefalta` é o nome do .sqf a rodar no jogo — entra na mensagem de erro,
    porque "não achei o dump" sem dizer o que fazer é um beco sem saída.
    """
    if len(sys.argv) > 1:
        return sys.argv[1]                      # caminho explícito ganha sempre

    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')
    if not os.path.isdir(base):
        raise SystemExit(
            f'pasta de logs não encontrada: {base}\n'
            f'Passe o caminho do .rpt como argumento, ou rode isto na máquina do jogo.')

    cands = []
    for arq in os.listdir(base):
        if not arq.lower().endswith('.rpt'):
            continue
        caminho = os.path.join(base, arq)
        tem = completo = False
        try:
            with open(caminho, encoding='cp1252', errors='replace') as f:
                for linha in f:                 # linha a linha: o .rpt passa de 1 GB
                    if marca not in linha:
                        continue
                    tem = True
                    if marca + 'FIM' in linha:
                        completo = True
        except OSError:
            continue
        if tem:
            cands.append((completo, os.path.getmtime(caminho), caminho))

    if not cands:
        raise SystemExit(
            f'nenhum .rpt com dump de {marca} encontrado.\n'
            f'Cole scripts/arma3/{oquefalta} no debug console do jogo primeiro.')

    cands.sort(reverse=True)                    # completo primeiro, depois mais novo
    escolhido = cands[0]
    if not escolhido[0]:
        print(f'  ! o dump encontrado está INCOMPLETO (sem marca de FIM) — '
              f'o jogo pode ter sido fechado no meio. Seguindo com o que há.')
    return escolhido[2]


def registros(caminho, marca):
    """Gera `(tipo, campos)` de cada linha marcada, na ordem do log.

    `campos` é a lista já separada por `|`. Linha truncada pelo log vira aviso,
    não silêncio — é o defeito que mais custou caro nesta pipeline.
    """
    truncadas = 0
    with open(caminho, encoding='cp1252', errors='replace') as f:
        for linha in f:
            i = linha.find(marca)
            if i < 0:
                continue
            corpo = linha[i + len(marca):].rstrip('\n\r')
            if len(linha.rstrip('\n\r')) >= LIMITE_LOG:
                truncadas += 1
            partes = corpo.split('|')
            yield partes[0], partes[1:]
    if truncadas:
        print(f'  ! {truncadas} linha(s) no limite de {LIMITE_LOG} caracteres — '
              f'possível truncamento. Confira o dump se algum campo vier cortado.')


class Pedacos:
    """Junta campo picado em vários registros, na ordem em que apareceram.

    O dump manda `MARCA|TIPO|chave|pedaço` várias vezes para o mesmo par
    (tipo, chave); aqui eles voltam a ser uma string só.
    """

    def __init__(self):
        self._buf = {}

    def add(self, tipo, chave, pedaco):
        self._buf.setdefault((tipo, chave), []).append(pedaco)

    def get(self, tipo, chave, padrao=''):
        return ''.join(self._buf.get((tipo, chave), [])) or padrao

    def json(self, tipo, chave, padrao=None):
        """O campo picado era JSON. Devolve `padrao` se vier vazio ou quebrado."""
        bruto = self.get(tipo, chave)
        if not bruto:
            return padrao if padrao is not None else []
        try:
            return json.loads(bruto)
        except json.JSONDecodeError as e:
            print(f'  ! {tipo}/{chave}: JSON quebrado ({e}) — provável truncamento no log')
            return padrao if padrao is not None else []


# ── conversões (a regra da ausência) ───────────────────────────────────────

def num(s):
    """float, ou None se o campo veio vazio (= o config não declara)."""
    if s is None or s == '':
        return None
    try:
        return float(s)
    except ValueError:
        return None


def limpo(v):
    """0.0 vira 0 (int) para o JSON não encher de casa decimal inútil."""
    if v is None:
        return None
    if isinstance(v, float) and v == int(v):
        return int(v)
    return round(v, 6) if isinstance(v, float) else v


def texto(s):
    """Texto vazio no dump = campo ausente no config = None."""
    return s if s else None


def inteiro(s):
    v = num(s)
    return None if v is None else int(v)


# ── saída ──────────────────────────────────────────────────────────────────

def salvar(nome_arquivo, dados, resumo=None):
    """Escreve `out/<nome_arquivo>` e imprime o placar."""
    saida = os.path.join(RAIZ, 'scripts', 'arma3', 'out', nome_arquivo)
    os.makedirs(os.path.dirname(saida), exist_ok=True)
    with open(saida, 'w', encoding='utf-8') as f:
        json.dump(dados, f, ensure_ascii=False, indent=1)
    tam = os.path.getsize(saida) / 1024
    print(f'✓ {os.path.relpath(saida, RAIZ)} — {tam:.0f} kB')
    for k, v in (resumo or {}).items():
        print(f'    {k}: {v}')
    return saida
