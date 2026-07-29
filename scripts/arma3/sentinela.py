#!/usr/bin/env python3
"""
Sentinela do Arma 3 — Automação de Extração

Este script deve ficar rodando em background num terminal.
Ele monitora os logs do Arma 3 em tempo real e, assim que detecta que um .sqf de extração
terminou (através das marcações FIM no .rpt), ele aciona os parsers Python automaticamente.

Uso:
    python scripts/arma3/sentinela.py
"""

import os
import sys
import time
import glob
import subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(os.path.dirname(AQUI))

# Mapeia a marca de FIM no log para o comando que deve ser executado
GATILHOS = {
    '<<A3DUMP>>FIM': [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'armas'],
    '<<A3MAPA>>FIM': [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'mapas'],
    '<<A3ITEM>>FIM': [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'itens'],
    '<<A3VEIC>>FIM': [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'veiculos'],
    '<<A3ACC>>FIM':  [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'acessorios'],
    '<<A3ANIM>>FIM': [sys.executable, os.path.join(AQUI, 'extrair-tudo.py'), 'animacoes'],
    '<<A3TT>>FIM':   [sys.executable, os.path.join(AQUI, 'coletar-turntable.py')],
}

def achar_rpt_mais_recente():
    """Acha o log .rpt mais recente do Arma 3."""
    base = os.path.join(os.environ.get('LOCALAPPDATA', ''), 'Arma 3')
    if not os.path.isdir(base):
        return None
    rpts = glob.glob(os.path.join(base, '*.rpt'))
    if not rpts:
        return None
    return max(rpts, key=os.path.getmtime)

def tocar_beep():
    """Toca um beep sonoro (funciona no Windows) para avisar que terminou."""
    try:
        import winsound
        winsound.MessageBeep(winsound.MB_OK)
    except:
        pass

def disparar_acao(marca, comando):
    print(f"\n[SENTINELA] Detectou {marca}! Disparando script de coleta...", flush=True)
    t0 = time.time()
    subprocess.run(comando, cwd=RAIZ)
    dt = time.time() - t0
    print(f"[SENTINELA] Concluído em {dt:.1f}s. Aguardando próximas ações...\n", flush=True)
    tocar_beep()

def main():
    print("=" * 60)
    print(" SENTINELA DO ARMA 3 ATIVADO")
    print("=" * 60)
    print("Deixe esta janela aberta. Rode os scripts .sqf no jogo.")
    print("Os dados serão extraídos automaticamente assim que cada script terminar.\n")

    arquivo_atual = None
    f = None

    try:
        while True:
            recente = achar_rpt_mais_recente()
            
            # Se o jogo reiniciou e gerou um log novo, troca de arquivo
            if recente != arquivo_atual:
                if f:
                    f.close()
                arquivo_atual = recente
                if arquivo_atual:
                    print(f"[SENTINELA] Monitorando log: {os.path.basename(arquivo_atual)}")
                    f = open(arquivo_atual, 'r', encoding='cp1252', errors='replace')
                    # Pula para o final do arquivo, ignorando execuções velhas do passado
                    f.seek(0, 2)
                else:
                    print("[SENTINELA] Pasta do Arma 3 não achada ou sem logs. Tentando novamente...", flush=True)
                    time.sleep(5)
                    continue

            # Se o arquivo foi apagado
            if not os.path.exists(arquivo_atual):
                arquivo_atual = None
                continue

            linha = f.readline()
            if not linha:
                time.sleep(0.5)
                continue
            
            # Verifica se a linha tem algum gatilho
            for marca, comando in GATILHOS.items():
                if marca in linha:
                    # Roda a ação imediatamente
                    disparar_acao(marca, comando)
                    # Dá um pequeno tempo antes de ler o resto, caso o log se embole
                    time.sleep(1)
                    break

    except KeyboardInterrupt:
        print("\n[SENTINELA] Desligado.")
        if f:
            f.close()

if __name__ == '__main__':
    main()
