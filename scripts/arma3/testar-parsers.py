#!/usr/bin/env python3
"""
Prova os parsers de dump contra um .rpt SINTÉTICO.

Existe porque estes parsers só rodam de verdade na máquina do operador, com o
Arma 3 aberto — e entregar seis parsers que nunca executaram seria entregar
esperança, não código. Aqui cada um roda contra um dump fabricado com o formato
que ele declara ler, e o resultado é conferido.

O que isto PROVA: o parser lê o formato, remonta campo picado, respeita a regra
da ausência (vazio → null, nunca zero), e não quebra com entrada malformada.

O que isto NÃO prova: que o `.sqf` correspondente emite exatamente este formato.
Isso só o jogo diz. Por isso cada dump imprime um PLACAR no fim, e cada parser
compara o placar do jogo com o que chegou — se o `.sqf` mudar e o parser não,
a divergência aparece na hora, em vez de virar dado faltando em silêncio.

Rodar:  python scripts/arma3/testar-parsers.py
"""

import json
import os
import subprocess
import sys
import tempfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))


# ── dumps sintéticos, um por parser ────────────────────────────────────────
# Cada um exercita: campo presente, campo AUSENTE (vazio), campo picado em
# pedaços, e o placar final.

DUMPS = {
    'grupos': ('<<A3GRUPO>>', 'parse-grupos.py', 'arma3-grupos.json', [
        'INICIO|v1',
        'F|West|BLU_F|NATO',
        'C|West|BLU_F|Infantry|Infantaria',
        'G|West/BLU_F/Infantry/BUS_InfSquad|West|BLU_F|Infantry|BUS_InfSquad|Esquadrão de Fuzileiros',
        # lista picada em dois pedaços, como o .sqf faria
        "GU|West/BLU_F/Infantry/BUS_InfSquad|[['Unit0','B_Sergeant_F','Sargento','SERGEANT',0],['Unit1',",
        "GU|West/BLU_F/Infantry/BUS_InfSquad|'B_soldier_AR_F','Metralhador','CORPORAL',1]]",
        'G|West/BLU_F/Infantry/BUS_Vazio|West|BLU_F|Infantry|BUS_Vazio|Grupo sem unidade',
        'PLACAR|1|2|2',
        'FIM|1.00',
    ]),

    'funcoes': ('<<A3FUNC>>', 'parse-funcoes.py', 'arma3-funcoes.json', [
        'INICIO|v1',
        'T|A3|BIS|a3/functions_f',
        'F|A3|Arrays|arrayShuffle|a3/functions_f/Arrays/fn_arrayShuffle.sqf||-1|-1|-1',
        'F|A3|Misc|initFunc|a3/functions_f/Misc/fn_initFunc.sqf||1|0|-1',
        'PLACAR|1|2',
        'FIM|1.00',
    ]),

    'manual': ('<<A3MANUAL>>', 'parse-manual.py', 'arma3-manual.json', [
        'INICIO|v1',
        'C|Combat|Combate',
        'H|Combat/Stance|Combat|Stance|Postura|ui/stance.paa',
        'HT|Combat/Stance|Ajuste a postura com <Ctrl> + ',
        'HT|Combat/Stance|<W> ou <S> para melhorar pontaria.',
        'H|Combat/SemTexto|Combat|SemTexto|Tópico vazio|',
        'PLACAR|1|2',
        'FIM|1.00',
    ]),

    'simbologia': ('<<A3SIMB>>', 'parse-simbologia.py', 'arma3-simbologia.json', [
        'INICIO|v1',
        'M|b_inf|Infantaria|a3/ui_f/data/map/markers/nato/b_inf.paa|ColorBLUFOR|29|2|0',
        'M|escondido|Oculto|icone.paa|ColorBlack||0|',          # tamanho AUSENTE, escopo 0
        'MC|ColorBLUFOR|Azul|0|0.3|0.6|0.8',
        'MC|ColorEstranho|Expressão|||| ',                      # cor não numérica
        'R|PRIVATE|Soldado|a3/ui_f/data/gui/cfg/ranks/private_gs.paa',
        'R|SERGEANT|Sargento|a3/ui_f/data/gui/cfg/ranks/sergeant_gs.paa',
        'I|111thID|111ª Divisão|a3/ui_f/data/insignia.paa|Bohemia',
        'PLACAR|2|2|2|1',
        'FIM|1.00',
    ]),

    'terreno-fisico': ('<<A3CHAO>>', 'parse-terreno-fisico.py', 'arma3-terreno-fisico.json', [
        'INICIO|v1',
        'S|concrete|a3/map_data/concrete_*|0.05|1|concrete|hitConcrete|dustConcrete|impactConcrete|Empty',
        'S|sand|a3/map_data/sand_*|0.12|0.85|sand|hitSand|dustSand|impactSand|SandChar',
        'S|semcoef|a3/map_data/x_*|0.1||x|x|x|x|Orfao',        # coef AUSENTE + vegetação órfã
        'SC|SandChar|[0.1,0.2]|0.5',
        "SCO|SandChar|['b_bush1','b_bush2']",
        'W|WeatherA|Clima A',
        "WP|WeatherA|[['overcast',0.5],['fog',0.1]]",
        'PLACAR|3|1|1',
        'FIM|1.00',
    ]),

    'proveniencia': ('<<A3PROV>>', 'parse-proveniencia.py', 'arma3-proveniencia.json', [
        'INICIO|v1',
        'P|A3_Weapons_F|Bohemia Interactive|Armas|1',
        "PU|A3_Weapons_F|['B_Soldier_F']",
        "PW|A3_Weapons_F|['arifle_MX_F','arifle_MXC_F']",
        "PR|A3_Weapons_F|['A3_Data_F']",
        'P|ace_common|ACE Team|ACE Common|1',
        "PW|ace_common|['arifle_MX_F']",                        # classe disputada
        'M|Expansion|Apex|expansion|Bohemia|395180|[0.3,0.6,0.2,1]|logo.paa',
        'PLACAR|2|1',
        'FIM|1.00',
    ]),
}


def rodar(nome, marca, script, saida, linhas):
    with tempfile.NamedTemporaryFile('w', suffix='.rpt', delete=False,
                                     encoding='cp1252', errors='replace') as f:
        for l in linhas:
            f.write(f'2026/08/02, 12:00:00 {marca}{l}\n')
        rpt = f.name
    destino = os.path.join(AQUI, 'out', saida)
    tinha_antes = os.path.exists(destino)
    guardado = open(destino, 'rb').read() if tinha_antes else None
    try:
        r = subprocess.run([sys.executable, os.path.join(AQUI, script), rpt],
                           capture_output=True, text=True, cwd=RAIZ)
        if r.returncode != 0:
            return False, (r.stderr or r.stdout).strip().splitlines()[-1:] or ['(sem mensagem)']
        if not os.path.exists(destino):
            return False, ['o parser terminou mas não escreveu a saída']
        with open(destino, encoding='utf-8') as g:
            return True, json.load(g)
    finally:
        os.unlink(rpt)
        # A saída deste teste é dado FABRICADO. Deixá-la em out/ seria pior que
        # não testar: o próximo `git add` a levaria para o repositório e ela
        # passaria por base de verdade. Restaura o que havia, ou apaga.
        if guardado is not None:
            with open(destino, 'wb') as g:
                g.write(guardado)
        elif os.path.exists(destino):
            os.unlink(destino)


# ── o que se cobra de cada saída ───────────────────────────────────────────

def conferir(nome, d):
    """Devolve lista de problemas. Vazia = passou."""
    p = []
    if nome == 'grupos':
        g = next((x for x in d['grupos'] if x['classe'] == 'BUS_InfSquad'), None)
        if not g:
            return ['grupo não veio']
        if g['efetivo'] != 2:
            p.append(f"efetivo {g['efetivo']} ≠ 2 — a lista picada não foi remontada")
        if not g['unidades'][0]['lider']:
            p.append('a primeira unidade deveria ser marcada como líder')
        if g['unidades'][1]['classe'] != 'B_soldier_AR_F':
            p.append('a unidade do 2º pedaço veio errada')
        if g['nomeFaccao'] != 'NATO':
            p.append('o nome da facção não foi ligado ao grupo')
        vazio = next((x for x in d['grupos'] if x['classe'] == 'BUS_Vazio'), None)
        if vazio and vazio['efetivo'] != 0:
            p.append('grupo sem unidade deveria ter efetivo 0')

    elif nome == 'funcoes':
        f = next((x for x in d['funcoes'] if x['nome'] == 'arrayShuffle'), None)
        if not f:
            return ['função não veio']
        if f['chamada'] != 'BIS_fnc_arrayShuffle':
            p.append(f"chamada {f['chamada']} — deveria usar a TAG (BIS), não a classe (A3)")
        if f['preInit'] is not None:
            p.append('flag ausente (-1) deveria virar None, não False')
        init = next((x for x in d['funcoes'] if x['nome'] == 'initFunc'), None)
        if init and (init['preInit'] is not True or init['postInit'] is not False):
            p.append('flags 1/0 deveriam virar True/False')

    elif nome == 'manual':
        t = next((x for x in d['topicos'] if x['classe'] == 'Stance'), None)
        if not t:
            return ['tópico não veio']
        if 'melhorar pontaria' not in (t['texto'] or ''):
            p.append('o texto picado em dois não foi remontado')
        if not t['temTeclas']:
            p.append('o texto cita <Ctrl> e deveria ser marcado como tendo tecla')
        if t['nomeCategoria'] != 'Combate':
            p.append('a categoria não foi ligada ao tópico')
        if 'licenca' not in d:
            p.append('a licença precisa viajar junto com o conteúdo')

    elif nome == 'simbologia':
        m = next((x for x in d['marcadores'] if x['classe'] == 'b_inf'), None)
        if not m or m['tamanho'] != 29:
            p.append('marcador ou tamanho não vieram')
        esc = next((x for x in d['marcadores'] if x['classe'] == 'escondido'), None)
        if esc:
            if esc['tamanho'] is not None:
                p.append('tamanho AUSENTE virou valor — deveria ser null')
            if esc['escopo'] != 0:
                p.append('escopo 0 é um valor legítimo e não pode virar null')
        c = next((x for x in d['cores'] if x['classe'] == 'ColorBLUFOR'), None)
        if not c or c['hex'] != '#004d99':
            p.append(f"hex da cor veio {c and c['hex']} — esperado #004d99")
        ce = next((x for x in d['cores'] if x['classe'] == 'ColorEstranho'), None)
        if ce and ce['rgba'] is not None:
            p.append('cor não numérica deveria virar null, não meia cor')
        if [r['classe'] for r in d['patentes']] != ['PRIVATE', 'SERGEANT']:
            p.append('a ordem das patentes é a hierarquia e não pode ser reordenada')

    elif nome == 'terreno-fisico':
        s = next((x for x in d['superficies'] if x['classe'] == 'sand'), None)
        if not s or s['coefVelocidade'] != 0.85:
            p.append('coeficiente de velocidade não veio')
        sc = next((x for x in d['superficies'] if x['classe'] == 'semcoef'), None)
        if sc and sc['coefVelocidade'] is not None:
            p.append('coef AUSENTE virou número — deveria ser null (≠ 1)')
        v = next((x for x in d['vegetacao'] if x['classe'] == 'SandChar'), None)
        if not v or v['objetos'] != ['b_bush1', 'b_bush2']:
            p.append('a lista de objetos da vegetação não foi remontada')
        w = next((x for x in d['clima'] if x['classe'] == 'WeatherA'), None)
        if not w or w['parametros'].get('overcast') != 0.5:
            p.append('os parâmetros de clima não foram remontados')

    elif nome == 'proveniencia':
        dono = d['donoDe']
        if dono.get('arifle_mxc_f') != ['A3_Weapons_F']:
            p.append('índice inverso não montou')
        if sorted(dono.get('arifle_mx_f', [])) != ['A3_Weapons_F', 'ace_common']:
            p.append('classe registrada por dois addons deveria guardar OS DOIS')
        m = next((x for x in d['mods'] if x['mod'] == 'Expansion'), None)
        if not m or m['appId'] != 395180:
            p.append('appId do mod não veio')
    return p


def conferir_sqf_ascii():
    """Todo .sqf tem de ser ASCII PURO.

    Este é o defeito que fez os seis dumps novos falharem na primeira tentativa
    de uso: eu os escrevi em UTF-8, com acento nos comentários e caracteres de
    caixa (U+2500) nos banners. Os dois dumps que já funcionavam eram us-ascii.

    O debug console do Arma 3 recebe o script COLADO, e o caminho do texto até
    lá passa por área de transferência e por um campo de entrada do jogo — que
    não é UTF-8. O resultado é script corrompido antes de o parser existir, e a
    mensagem de erro não fala nada sobre codificação.

    Não é preferência de estilo: é requisito de funcionamento do único jeito que
    esses arquivos são executados.
    """
    import glob
    problemas = []
    for caminho in sorted(glob.glob(os.path.join(AQUI, '*.sqf'))):
        bruto = open(caminho, 'rb').read()
        try:
            bruto.decode('ascii')
        except UnicodeDecodeError:
            texto = bruto.decode('utf-8', errors='replace')
            fora = sorted({c for c in texto if ord(c) > 127})
            linhas = [i + 1 for i, l in enumerate(texto.split('\n'))
                      if any(ord(c) > 127 for c in l)]
            problemas.append((os.path.basename(caminho), fora[:8], linhas[:5], len(linhas)))
    return problemas


def main():
    print('provando os parsers contra dump sintético\n')

    print('0. codificação dos .sqf (precisam ser ASCII puro para colar no jogo)')
    ruins = conferir_sqf_ascii()
    if ruins:
        for nome, chars, linhas, total in ruins:
            print(f'  ✗ {nome}: {total} linha(s) com não-ASCII '
                  f'(ex.: linhas {linhas}, chars {chars})')
        print('    Conserto: reescreva sem acento e sem caractere de caixa.')
    else:
        print(f'  ✓ os .sqf são ASCII puro')
    print()
    falhas = 0
    for nome, (marca, script, saida, linhas) in DUMPS.items():
        ok, res = rodar(nome, marca, script, saida, linhas)
        if not ok:
            print(f'  ✗ {nome:16} não rodou: {res}')
            falhas += 1
            continue
        problemas = conferir(nome, res)
        if problemas:
            print(f'  ✗ {nome:16} rodou, mas:')
            for x in problemas:
                print(f'      - {x}')
            falhas += 1
        else:
            print(f'  ✓ {nome:16} formato lido, campo picado remontado, ausência preservada')

    print()
    if ruins:
        falhas += len(ruins)
    if falhas:
        print(f'✗ {falhas} problema(s)')
        return 1
    print(f'✓ os {len(DUMPS)} parsers leem o formato que declaram ler.')
    print('  (isto não prova que o .sqf emite este formato — só o jogo diz. O placar')
    print('   no fim de cada dump é o que acusa divergência quando isso mudar.)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
