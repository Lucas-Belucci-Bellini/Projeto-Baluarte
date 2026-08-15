#!/usr/bin/env python3
"""Prova as regras de atualização do pipeline sem precisar do jogo.

O `atualizar-arma3.py` decide sozinho o que rodar. Duas coisas podem dar
errado nessa decisão, e as duas são silenciosas:

  · **pular o que mudou** — o operador roda o dump novo, o orquestrador acha
    que está tudo em dia, e o site segue mostrando o dado velho sem nenhum
    aviso. É o pior modo de falha do pipeline inteiro;

  · **escolher outro `.rpt`** — se a varredura única não empatar com o
    `achar_rpt`, rodar o parser sozinho dá um resultado e rodar pelo
    orquestrador dá outro. O teste de equivalência cobre isso contra o código
    de verdade, não contra uma reimplementação da regra.

Roda em `npm run testar-pipeline-arma3`, no CI.
"""

import os
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pipeline_arma3 import (                                     # noqa: E402
    AQUI, BASES, ETAPAS, POR_NOME, Base, Etapa,
    fonte_de, indexar_rpts, precisa_base, precisa_parse)
from imagens_catalogo import CATEGORIAS                          # noqa: E402

falhas = []


def checar(condicao, titulo, detalhe=''):
    if condicao:
        print(f'  ✓ {titulo}')
    else:
        print(f'  ✗ {titulo}')
        if detalhe:
            print(f'      {detalhe}')
        falhas.append(titulo)


def disco(arquivos):
    """Simula o sistema de arquivos: {caminho: mtime}."""
    return (lambda p: p in arquivos), (lambda p: arquivos[p])


# ── precisa_parse ─────────────────────────────────────────────────────────

def teste_parse():
    e = POR_NOME['armas']
    rpt = '/logs/Arma3_2026.rpt'

    roda, motivo = precisa_parse(e, None)
    checar(not roda and 'sqf' in motivo,
           'sem dump no .rpt: não roda, e o motivo aponta o .sqf que falta')

    existe, mtime = disco({rpt: 100})
    roda, _ = precisa_parse(e, rpt, existe, mtime, fonte=lambda _: None)
    checar(roda, 'saída inexistente: roda (primeira extração)')

    existe, mtime = disco({rpt: 100, e.saida_abs: 200})
    roda, motivo = precisa_parse(e, rpt, existe, mtime,
                                 fonte=lambda _: 'Arma3_2026.rpt')
    checar(not roda, 'dump já lido e JSON mais novo: pula', motivo)

    # ESTE é o caso que não pode falhar: dump novo tem de ser lido
    existe, mtime = disco({rpt: 300, e.saida_abs: 200})
    roda, _ = precisa_parse(e, rpt, existe, mtime,
                            fonte=lambda _: 'Arma3_2026.rpt')
    checar(roda, '.rpt mais novo que o JSON: RODA (dump novo não pode ser pulado)')

    existe, mtime = disco({rpt: 100, e.saida_abs: 200})
    roda, _ = precisa_parse(e, rpt, existe, mtime,
                            fonte=lambda _: 'Arma3_OUTRO.rpt')
    checar(roda, 'JSON veio de outro .rpt: roda')

    roda, _ = precisa_parse(e, rpt, existe, mtime, fonte=lambda _: None)
    checar(roda, 'JSON sem campo fonte: roda (na dúvida, refaz)')


# ── precisa_base ──────────────────────────────────────────────────────────

def teste_base():
    b = next(x for x in BASES if x.nome == 'armas')
    ent = b.entradas_abs
    sai = b.saidas_abs

    existe, mtime = disco({})
    roda, motivo = precisa_base(b, existe, mtime)
    checar(not roda, 'sem nenhuma entrada: não roda', motivo)

    existe, mtime = disco({ent[0]: 100})
    roda, _ = precisa_base(b, existe, mtime)
    checar(roda, 'saída não existe: regera')

    todos = {e: 100 for e in ent}
    todos.update({s: 200 for s in sai})
    existe, mtime = disco(todos)
    roda, motivo = precisa_base(b, existe, mtime)
    checar(not roda, 'saídas mais novas que entradas: pula', motivo)

    todos[ent[0]] = 300
    existe, mtime = disco(todos)
    roda, _ = precisa_base(b, existe, mtime)
    checar(roda, 'UMA entrada mais nova: regera')

    # regressão: com várias saídas, basta UMA estar velha
    todos = {e: 100 for e in ent}
    todos.update({s: 200 for s in sai})
    todos[sai[-1]] = 50
    existe, mtime = disco(todos)
    roda, _ = precisa_base(b, existe, mtime)
    checar(roda, 'uma saída atrasada entre várias: regera')


# ── indexar_rpts ──────────────────────────────────────────────────────────

def teste_uma_passada():
    """O motivo de o orquestrador existir. `achar_rpt` lê cada .rpt inteiro
    procurando UMA marca; com 13 etapas seriam 13 leituras da mesma pasta."""
    conteudo = {
        '/logs/a.rpt': ['<<A3DUMP>>I|1', '<<A3DUMP>>FIM|1', '<<A3MAPA>>I|1'],
        '/logs/b.rpt': ['<<A3VEIC>>I|1', '<<A3VEIC>>FIM|1'],
        '/logs/c.txt': ['nada'],
    }
    aberturas = []

    class Falso:
        def __init__(self, linhas):
            self.linhas = linhas

        def __enter__(self):
            return iter(self.linhas)

        def __exit__(self, *a):
            return False

    def abrir(p):
        aberturas.append(p)
        return Falso(conteudo[p])

    marcas = [e.marca for e in ETAPAS]
    r = indexar_rpts('/logs', marcas,
                     listar=lambda _: sorted(conteudo),
                     abrir=abrir,
                     mtime=lambda p: {'/logs/a.rpt': 10, '/logs/b.rpt': 20}[p])

    checar(len(aberturas) == 2,
           f'cada .rpt aberto UMA vez, não uma por marca ({len(marcas)} marcas)',
           f'aberturas: {aberturas}')
    checar('/logs/c.txt' not in aberturas, 'arquivo que não é .rpt nem é aberto')
    checar(r['<<A3DUMP>>'] == '/logs/a.rpt' and r['<<A3VEIC>>'] == '/logs/b.rpt',
           'cada marca achou o .rpt dela na mesma passada')
    checar(r['<<A3MAPA>>'] == '/logs/a.rpt',
           'marca sem FIM ainda é encontrada (dump incompleto não some)')
    checar(r['<<A3ICO>>'] is None, 'marca ausente devolve None, não erro')


def teste_equivalencia_com_achar_rpt():
    """A escolha do .rpt tem de ser IDÊNTICA à do achar_rpt.

    Conferido contra o código de verdade, num diretório real — reimplementar a
    regra no teste provaria só que eu escrevi a mesma coisa duas vezes."""
    from a3dump_comum import achar_rpt

    casos = {
        # incompleto e mais novo vs completo e mais velho: o completo ganha
        'velho_completo.rpt': (['<<A3DUMP>>I|1', '<<A3DUMP>>FIM|1'], 100),
        'novo_incompleto.rpt': (['<<A3DUMP>>I|1'], 900),
        # dois completos: o mais novo ganha
        'completo_medio.rpt': (['<<A3VEIC>>V|1', '<<A3VEIC>>FIM|1'], 200),
        'completo_novo.rpt': (['<<A3VEIC>>V|1', '<<A3VEIC>>FIM|1'], 800),
        'sem_marca.rpt': (['linha qualquer'], 500),
    }

    with tempfile.TemporaryDirectory() as tmp:
        for nome, (linhas, quando) in casos.items():
            p = os.path.join(tmp, nome)
            with open(p, 'w', encoding='cp1252') as f:
                for l in linhas:
                    f.write(f'2026/08/02, 12:00:00 {l}\n')
            os.utime(p, (quando, quando))

        argv, local = sys.argv, os.environ.get('LOCALAPPDATA')
        sys.argv = ['x']                       # achar_rpt usa argv[1] se houver
        os.environ['LOCALAPPDATA'] = os.path.dirname(tmp)
        # achar_rpt monta <LOCALAPPDATA>/Arma 3; aponta direto pro tmp
        arma3 = os.path.join(os.path.dirname(tmp), 'Arma 3')
        try:
            if os.path.exists(arma3):
                return checar(False, 'equivalência com achar_rpt',
                              'já existe uma pasta "Arma 3" no temp')
            os.symlink(tmp, arma3)
            meu = indexar_rpts(arma3, ['<<A3DUMP>>', '<<A3VEIC>>'])
            for marca in ('<<A3DUMP>>', '<<A3VEIC>>'):
                dele = achar_rpt(marca, 'x.sqf')
                checar(os.path.basename(meu[marca]) == os.path.basename(dele),
                       f'{marca}: mesma escolha que achar_rpt '
                       f'({os.path.basename(dele)})',
                       f'orquestrador: {meu[marca]}')
        finally:
            sys.argv = argv
            if local is None:
                os.environ.pop('LOCALAPPDATA', None)
            else:
                os.environ['LOCALAPPDATA'] = local
            if os.path.islink(arma3):
                os.unlink(arma3)


# ── fonte_de ──────────────────────────────────────────────────────────────

def teste_fonte_de():
    with tempfile.TemporaryDirectory() as tmp:
        bom = os.path.join(tmp, 'bom.json')
        with open(bom, 'w', encoding='utf-8') as f:
            f.write('{ "fonte": "Arma3_x64_2026.rpt", "armas": {')
            f.write('"x": 1,' * 200000)          # arquivo grande de propósito
            f.write('"y": 1 } }')
        checar(fonte_de(bom) == 'Arma3_x64_2026.rpt',
               'fonte lida do cabeçalho, sem carregar o arquivo inteiro',
               f'({os.path.getsize(bom) // 1024} kB no disco)')

        sem = os.path.join(tmp, 'sem.json')
        with open(sem, 'w', encoding='utf-8') as f:
            f.write('{ "armas": {} }')
        checar(fonte_de(sem) is None, 'JSON sem fonte devolve None')
        checar(fonte_de(os.path.join(tmp, 'nao-existe.json')) is None,
               'arquivo ausente devolve None em vez de estourar')


# ── o grafo ───────────────────────────────────────────────────────────────

def teste_grafo():
    nomes = [e.nome for e in ETAPAS]
    checar(len(nomes) == len(set(nomes)), 'nome de etapa não se repete')

    marcas = [e.marca for e in ETAPAS]
    checar(len(marcas) == len(set(marcas)),
           'marca não se repete (duas etapas lendo a mesma seria dado trocado)')

    saidas = [e.saida for e in ETAPAS]
    checar(len(saidas) == len(set(saidas)), 'duas etapas não escrevem o mesmo JSON')

    sem_script = [e.nome for e in ETAPAS
                  if not os.path.isfile(os.path.join(AQUI, e.script))]
    checar(not sem_script, 'todo parser declarado existe no disco', f'{sem_script}')

    sem_sqf = [e.nome for e in ETAPAS
               if not os.path.isfile(os.path.join(AQUI, e.sqf))]
    checar(not sem_sqf, 'todo .sqf declarado existe no disco', f'{sem_sqf}')

    sem_gerador = [b.nome for b in BASES
                   if not os.path.isfile(os.path.join(AQUI, b.script))]
    checar(not sem_gerador, 'todo gerador declarado existe no disco',
           f'{sem_gerador}')

    # entrada de base que ninguém produz = base que nunca vai rodar. Foi
    # exatamente assim que o extrator de ícones ficou parado no arma3-catalogo.
    #
    # Os mapas de imagem não saem de uma ETAPA (que é dump no jogo + parse):
    # saem do `extrair-imagens.py`, e quem declara qual arquivo cada leva
    # escreve é o catálogo. Ler o catálogo em vez de listar os nomes aqui faz
    # a categoria nova ser reconhecida sozinha — e um mapa que base nenhuma
    # produz continua caindo como órfão.
    produzidos = {e.saida for e in ETAPAS} | {c.mapa for c in CATEGORIAS}
    orfas = {e for b in BASES for e in b.entradas if e not in produzidos}
    checar(not orfas, 'toda entrada de base é produzida por alguma etapa',
           f'órfãs: {sorted(orfas)}')


def main():
    print('provando as regras de atualização do pipeline\n')
    print('1. rodar ou pular um parser')
    teste_parse()
    print('\n2. rodar ou pular um gerador de base')
    teste_base()
    print('\n3. varredura dos .rpt')
    teste_uma_passada()
    teste_equivalencia_com_achar_rpt()
    print('\n4. leitura barata do cabeçalho')
    teste_fonte_de()
    print('\n5. o grafo')
    teste_grafo()

    print()
    if falhas:
        print(f'✗ {len(falhas)} falha(s): {", ".join(falhas)}')
        return 1
    print('✓ o pipeline sabe o que precisa refazer')
    return 0


if __name__ == '__main__':
    sys.exit(main())
